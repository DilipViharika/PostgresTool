/**
 * services/explainService.js
 * ──────────────────────────
 * Capture, normalize, store, and diff query plans for PostgreSQL,
 * MySQL, and MongoDB. Plans are stored as JSONB in the `query_plans`
 * table; SQL is fingerprinted so plans for semantically-equivalent
 * queries cluster together.
 *
 * Postgres:
 *   EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS, FORMAT JSON) <sql>
 *
 * MySQL:
 *   EXPLAIN FORMAT=JSON <sql>
 *
 * MongoDB:
 *   db.collection.explain('executionStats').find/aggregate(…)
 */

import crypto from 'node:crypto';
import { query as controlQuery } from '../db.js';

// ─────────────────────────────────────────────────────────────────────────────
// Safety: these prefixes must be rejected before we ANALYZE.
// EXPLAIN ANALYZE *executes* the query; we do not want to run mutations.
// ─────────────────────────────────────────────────────────────────────────────
const MUTATION_RE =
    /\b(INSERT|UPDATE|DELETE|MERGE|TRUNCATE|DROP|CREATE|ALTER|GRANT|REVOKE|CALL|DO)\b/i;

export function isSafeForAnalyze(sql) {
    return !MUTATION_RE.test(sql);
}

/**
 * SHA-256 fingerprint of a SQL statement after normalizing whitespace, case,
 * and bind-value placeholders. Good enough to cluster plans across runs.
 */
export function fingerprintSql(sql) {
    const normalized = sql
        .replace(/\s+/g, ' ')
        .replace(/'[^']*'/g, '?')            // string literals
        .replace(/\b\d+\b/g, '?')            // numeric literals
        .replace(/\$\d+/g, '?')              // $1, $2 placeholders
        .trim()
        .toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Capture
// ─────────────────────────────────────────────────────────────────────────────

export async function capturePostgresPlan({ client, sql, analyze = false }) {
    if (analyze && !isSafeForAnalyze(sql)) {
        const err = new Error('Refusing to ANALYZE a mutating statement');
        err.status = 400;
        throw err;
    }
    const prefix = analyze
        ? 'EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS, FORMAT JSON) '
        : 'EXPLAIN (VERBOSE, SETTINGS, FORMAT JSON) ';
    const started = Date.now();
    const result = await client.query(prefix + sql);
    const elapsed = Date.now() - started;
    const row = result.rows[0] || {};
    const plan = row['QUERY PLAN'] || row.query_plan || result.rows;
    return { plan: Array.isArray(plan) ? plan[0] : plan, elapsedMs: elapsed };
}

export async function captureMysqlPlan({ connection, sql }) {
    const [rows] = await connection.query(`EXPLAIN FORMAT=JSON ${sql}`);
    const raw = rows?.[0]?.EXPLAIN || rows?.[0]?.explain || rows?.[0];
    const plan = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { plan };
}

export async function captureMongoPlan({ db, collection, operation, pipelineOrFilter }) {
    const col = db.collection(collection);
    let plan;
    if (operation === 'aggregate') {
        plan = await col.aggregate(pipelineOrFilter).explain('executionStats');
    } else {
        plan = await col.find(pipelineOrFilter || {}).explain('executionStats');
    }
    return { plan };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persist
// ─────────────────────────────────────────────────────────────────────────────

export async function storePlan({
    connectionId,
    workspaceId,
    engine,
    sql,
    plan,
    elapsedMs,
    rowsReturned,
    capturedBy,
}) {
    const fp = fingerprintSql(sql);
    const { rows } = await controlQuery(
        `INSERT INTO pgmonitoringtool.query_plans
            (connection_id, workspace_id, engine, sql_fingerprint, sql_text,
             plan_json, execution_ms, rows_returned, captured_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, captured_at`,
        [
            connectionId,
            workspaceId || null,
            engine,
            fp,
            sql,
            plan,
            elapsedMs || null,
            rowsReturned || null,
            capturedBy || null,
        ]
    );
    return { id: rows[0].id, fingerprint: fp, capturedAt: rows[0].captured_at };
}

// ─────────────────────────────────────────────────────────────────────────────
// History + diff
// ─────────────────────────────────────────────────────────────────────────────

export async function listPlansForFingerprint(fingerprint, limit = 20) {
    const { rows } = await controlQuery(
        `SELECT id, connection_id, engine, execution_ms, rows_returned,
                captured_at, captured_by
           FROM pgmonitoringtool.query_plans
          WHERE sql_fingerprint = $1
          ORDER BY captured_at DESC
          LIMIT $2`,
        [fingerprint, limit]
    );
    return rows;
}

export async function getPlan(id) {
    const { rows } = await controlQuery(
        `SELECT id, connection_id, workspace_id, engine, sql_fingerprint,
                sql_text, plan_json, execution_ms, rows_returned, captured_at
           FROM pgmonitoringtool.query_plans
          WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
}

/**
 * Walk a Postgres plan tree and produce a flat list of nodes with
 * { id, nodeType, relation, cost, rows, actualTime, loops }.
 * Used by the React visualizer for summary cards and diffing.
 */
export function flattenPostgresPlan(plan) {
    const root = plan?.Plan || plan;
    const out = [];
    function walk(node, depth = 0, id = '0') {
        if (!node) return;
        out.push({
            id,
            depth,
            nodeType: node['Node Type'],
            relation: node['Relation Name'] || node['Index Name'] || null,
            startupCost: node['Startup Cost'],
            totalCost: node['Total Cost'],
            planRows: node['Plan Rows'],
            actualRows: node['Actual Rows'],
            actualTotalTime: node['Actual Total Time'],
            loops: node['Actual Loops'],
            parallelAware: node['Parallel Aware'],
            sharedHit: node['Shared Hit Blocks'],
            sharedRead: node['Shared Read Blocks'],
        });
        (node.Plans || []).forEach((c, i) => walk(c, depth + 1, `${id}.${i}`));
    }
    walk(root);
    return out;
}

/**
 * Diff two plans node-by-node (by id path). Detects changes in nodeType,
 * rows, and total cost — the most actionable signals for regression.
 */
export function diffPostgresPlans(planA, planB) {
    const a = new Map(flattenPostgresPlan(planA).map(n => [n.id, n]));
    const b = new Map(flattenPostgresPlan(planB).map(n => [n.id, n]));
    const ids = new Set([...a.keys(), ...b.keys()]);
    const changes = [];
    for (const id of ids) {
        const x = a.get(id);
        const y = b.get(id);
        if (!x) { changes.push({ id, kind: 'added', node: y }); continue; }
        if (!y) { changes.push({ id, kind: 'removed', node: x }); continue; }
        const diffs = {};
        if (x.nodeType !== y.nodeType) diffs.nodeType = [x.nodeType, y.nodeType];
        if (pctChange(x.actualRows, y.actualRows) > 0.25) {
            diffs.actualRows = [x.actualRows, y.actualRows];
        }
        if (pctChange(x.totalCost, y.totalCost) > 0.25) {
            diffs.totalCost = [x.totalCost, y.totalCost];
        }
        if (pctChange(x.actualTotalTime, y.actualTotalTime) > 0.25) {
            diffs.actualTotalTime = [x.actualTotalTime, y.actualTotalTime];
        }
        if (Object.keys(diffs).length) {
            changes.push({ id, kind: 'changed', diffs });
        }
    }
    return changes;
}

function pctChange(a, b) {
    const na = Number(a) || 0;
    const nb = Number(b) || 0;
    if (na === 0 && nb === 0) return 0;
    const denom = Math.max(Math.abs(na), 1);
    return Math.abs(nb - na) / denom;
}
