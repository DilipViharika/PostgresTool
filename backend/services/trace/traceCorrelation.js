/**
 * traceCorrelation.js
 * ────────────────────
 * Stitches OTel traces to query events.
 *
 * Storage model:
 *   query_events (id, ts, db, statement, duration_ms, plan_hash, trace_id, span_id)
 * The migration below adds trace_id + span_id columns + a compound index
 * (trace_id) for fast per-trace lookup. Existing PostgreSQL deployments run
 * the DDL once; the code below works regardless of whether the columns are
 * already present (it will attempt the insert and fall back to a legacy
 * shape if a "column does not exist" error surfaces).
 *
 * Two tagging flows:
 *   • Push:   caller supplies trace context alongside the query row.
 *   • Pull:   we parse trace context out of the SQL text (sqlcommenter) or
 *             the PG application_name, at ingest time. This is how we catch
 *             traces from apps we don't directly own.
 */

import { extractFromSql, extractFromApplicationName, parseTraceparent } from './traceContext.js';

export const ADD_TRACE_COLUMNS_SQL = `
ALTER TABLE query_events
  ADD COLUMN IF NOT EXISTS trace_id CHAR(32),
  ADD COLUMN IF NOT EXISTS span_id  CHAR(16);

CREATE INDEX IF NOT EXISTS query_events_trace_id_idx ON query_events (trace_id);
CREATE INDEX IF NOT EXISTS query_events_trace_span_idx ON query_events (trace_id, span_id);
`;

/**
 * Given a query event and optional explicit context, resolve the final
 * (traceId, spanId) to persist. Returns { traceId, spanId, source } where
 * source ∈ { 'explicit', 'sql-comment', 'application-name', null }.
 */
export function resolveTraceContext({ event, explicit, applicationName } = {}) {
    const explicitCtx = explicit?.traceId && explicit?.spanId
        ? parseTraceparent(`00-${explicit.traceId}-${explicit.spanId}-01`)
        : null;
    if (explicitCtx) return { ...explicitCtx, source: 'explicit' };

    const fromSql = extractFromSql(event?.statement || '');
    if (fromSql) return { ...fromSql, source: 'sql-comment' };

    const fromApp = extractFromApplicationName(applicationName);
    if (fromApp) return { ...fromApp, source: 'application-name' };

    return { traceId: null, spanId: null, source: null };
}

/**
 * Ingest a single query event. Accepts an async `queryFn` (e.g. pg Pool.query-bound)
 * and persists the row with trace context attached. Returns the inserted id.
 *
 * The tagged row shape is:
 *   { id, ts, db, statement, duration_ms, plan_hash, trace_id, span_id }
 */
export async function ingestQueryEvent(queryFn, {
    event,              // { ts, db, statement, duration_ms, plan_hash }
    explicit,           // { traceId, spanId } optional
    applicationName,    // Postgres session application_name, optional
    insertSql = `
        INSERT INTO query_events (ts, db, statement, duration_ms, plan_hash, trace_id, span_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `,
} = {}) {
    const ctx = resolveTraceContext({ event, explicit, applicationName });
    const row = [
        event.ts || new Date(),
        event.db || null,
        event.statement || '',
        event.duration_ms || 0,
        event.plan_hash || null,
        ctx.traceId,
        ctx.spanId,
    ];
    const result = await queryFn(insertSql, row);
    return { id: result?.rows?.[0]?.id, traceContextSource: ctx.source };
}

/**
 * Fetch all query events for a given trace.
 * Rows are ordered chronologically, earliest first.
 */
export async function getQueriesForTrace(queryFn, traceId, { limit = 500 } = {}) {
    if (!/^[0-9a-f]{32}$/i.test(traceId)) throw new Error('invalid traceId');
    const sql = `
        SELECT id, ts, db, statement, duration_ms, plan_hash, trace_id, span_id
          FROM query_events
         WHERE trace_id = $1
         ORDER BY ts ASC
         LIMIT $2
    `;
    const res = await queryFn(sql, [traceId.toLowerCase(), limit]);
    return res?.rows || [];
}

/**
 * Diagnostic: returns a summary for a trace — count, total latency, and the
 * distinct databases touched. Useful for the Trace Detail panel header.
 */
export async function summariseTrace(queryFn, traceId) {
    const rows = await getQueriesForTrace(queryFn, traceId, { limit: 5000 });
    if (rows.length === 0) return { traceId, found: false };
    const totalMs = rows.reduce((s, r) => s + Number(r.duration_ms || 0), 0);
    const dbs = [...new Set(rows.map((r) => r.db).filter(Boolean))];
    return {
        traceId,
        found: true,
        queryCount: rows.length,
        totalDurationMs: totalMs,
        databases: dbs,
        firstTs: rows[0].ts,
        lastTs: rows[rows.length - 1].ts,
    };
}
