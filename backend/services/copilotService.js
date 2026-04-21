/**
 * services/copilotService.js
 * ──────────────────────────
 * Schema-aware SQL copilot for VIGIL.
 *
 * Capabilities
 *   1. Generate SQL from natural language (NL → SQL) using a live schema
 *      snapshot of the MONITORED database (not the VIGIL control plane).
 *   2. Explain a query plan in plain English and call out risky nodes.
 *   3. Draft incident RCA narratives from metric / alert / plan context.
 *
 * LLM-agnostic: the provider layer is swappable via COPILOT_PROVIDER.
 *   - `openai`    → OPENAI_API_KEY    / COPILOT_MODEL (default gpt-4o-mini)
 *   - `anthropic` → ANTHROPIC_API_KEY / COPILOT_MODEL (default claude-sonnet-4-6)
 *   - `local`     → deterministic stub for dev / air-gapped demos
 *
 * Hardening applied after the post-Wave-3 code audit:
 *   HIGH-2  buildSchemaContext accepts an explicit monitoredPool argument
 *           and NEVER falls back to the control-plane pool.
 *   HIGH-4  saveConversationTurn redacts input before write.
 *   MED-2   redaction covers OpenAI, Anthropic, Slack, GitHub, GitLab,
 *           AWS, and generic password/api_key key=value patterns.
 *   MED-4   isSafeToRun strips both quoted-string literals and comments
 *           before scanning for mutating keywords, closing the
 *           "SELECT 1 /*;*\/ DELETE FROM t" style bypass.
 *   MED-8   provider fetches carry a 30-second AbortController timeout.
 */
import { query } from '../db.js';

const MAX_TABLES_IN_CONTEXT = 40;
const MAX_COLS_PER_TABLE    = 24;
const PROVIDER_TIMEOUT_MS   = Number(process.env.COPILOT_TIMEOUT_MS) || 30_000;

// ─────────────────────────────────────────────────────────────────────────────
// Provider adapter
// ─────────────────────────────────────────────────────────────────────────────
export function getProvider() {
    const p = (process.env.COPILOT_PROVIDER || 'local').toLowerCase();
    if (p === 'openai')    return openAiProvider();
    if (p === 'anthropic') return anthropicProvider();
    return localProvider();
}

function withTimeout(promiseFactory, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return Promise.resolve(promiseFactory(ctrl.signal)).finally(() => clearTimeout(timer));
}

function openAiProvider() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model  = process.env.COPILOT_MODEL || 'gpt-4o-mini';
    return {
        name: 'openai', model,
        async complete({ system, user, maxTokens = 1200 }) {
            if (!apiKey) throw new Error('OPENAI_API_KEY not set');
            const r = await withTimeout(signal => fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST', signal,
                headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model,
                    temperature: 0.1,
                    max_tokens: maxTokens,
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user',   content: user },
                    ],
                }),
            }), PROVIDER_TIMEOUT_MS);
            if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
            const j = await r.json();
            return j.choices?.[0]?.message?.content?.trim() || '';
        },
    };
}

function anthropicProvider() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model  = process.env.COPILOT_MODEL || 'claude-sonnet-4-6';
    return {
        name: 'anthropic', model,
        async complete({ system, user, maxTokens = 1200 }) {
            if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
            const r = await withTimeout(signal => fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST', signal,
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model,
                    max_tokens: maxTokens,
                    system,
                    messages: [{ role: 'user', content: user }],
                }),
            }), PROVIDER_TIMEOUT_MS);
            if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
            const j = await r.json();
            return j.content?.[0]?.text?.trim() || '';
        },
    };
}

function localProvider() {
    // Deterministic stub — no external credentials required.
    return {
        name: 'local', model: 'stub',
        async complete({ user }) {
            const m = user.match(/top\s+(\d+)\s+(.+?)\s+by\s+(.+)/i);
            if (m) {
                return `-- stub provider\nSELECT ${m[2]}, ${m[3]}\nFROM /* table */\nORDER BY ${m[3]} DESC\nLIMIT ${m[1]};`;
            }
            if (/count/i.test(user))  return `SELECT count(*) FROM /* table */;`;
            if (/explain|why.*slow/i.test(user)) {
                return 'The plan shows a sequential scan on the largest table. Consider adding an index on the filter column and confirming the planner statistics are fresh (ANALYZE).';
            }
            return '-- local stub: set COPILOT_PROVIDER=openai|anthropic for real completions';
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema context builder (HIGH-2 fix — uses the MONITORED-DB pool)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Build a compact DDL-ish context from the monitored database's schema.
 * MUST be called with the workspace's monitored-DB pool, NEVER the
 * control-plane pool.
 */
export async function buildSchemaContext(monitoredPool, { schema = 'public', hint = '' } = {}) {
    if (!monitoredPool || typeof monitoredPool.query !== 'function') {
        throw new Error('buildSchemaContext requires a monitored-DB pool; refusing to fall back to control plane');
    }

    const tbls = await monitoredPool.query(
        `SELECT table_name FROM information_schema.tables
          WHERE table_schema = $1 AND table_type = 'BASE TABLE'
          ORDER BY table_name`,
        [schema]
    );
    const tableNames = tbls.rows.map(r => r.table_name);

    const hintTokens = String(hint).toLowerCase().split(/[^a-z0-9_]+/).filter(t => t.length > 2);
    const scored = tableNames.map(name => {
        const lower = name.toLowerCase();
        const score = hintTokens.reduce((s, t) => s + (lower.includes(t) ? 2 : 0), 0);
        return { name, score };
    }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const chosen = scored.slice(0, MAX_TABLES_IN_CONTEXT).map(t => t.name);
    if (chosen.length === 0) return '';

    const cols = await monitoredPool.query(
        `SELECT table_name, column_name, data_type, is_nullable
           FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = ANY($2)
          ORDER BY table_name, ordinal_position`,
        [schema, chosen]
    );
    const colsByTable = new Map();
    for (const c of cols.rows) {
        if (!colsByTable.has(c.table_name)) colsByTable.set(c.table_name, []);
        colsByTable.get(c.table_name).push(c);
    }

    const lines = [];
    for (const t of chosen) {
        const list = (colsByTable.get(t) || []).slice(0, MAX_COLS_PER_TABLE);
        lines.push(`table ${schema}.${t} (`);
        for (const c of list) {
            const nn = c.is_nullable === 'NO' ? ' NOT NULL' : '';
            lines.push(`  ${c.column_name} ${c.data_type}${nn},`);
        }
        lines.push(')');
    }
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Redaction (MED-2 — broader provider coverage)
// ─────────────────────────────────────────────────────────────────────────────
const REDACT_PATTERNS = [
    // DB / URL style:  scheme://user:pass@host
    { rx: /\b([a-z][a-z0-9+.\-]+):\/\/[^:\s]+:[^@\s]+@/gi, to: '$1://REDACTED:REDACTED@' },
    // OpenAI secret
    { rx: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g, to: 'REDACTED_OPENAI_KEY' },
    // Anthropic
    { rx: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g, to: 'REDACTED_ANTHROPIC_KEY' },
    // Slack bot / user / app / config
    { rx: /\bxox[aboprs]-[A-Za-z0-9-]{10,}\b/g, to: 'REDACTED_SLACK_TOKEN' },
    // GitHub tokens
    { rx: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g, to: 'REDACTED_GITHUB_TOKEN' },
    // GitLab personal access token
    { rx: /\bglpat-[A-Za-z0-9_-]{20,}\b/g, to: 'REDACTED_GITLAB_TOKEN' },
    // AWS access key id / secret
    { rx: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, to: 'REDACTED_AWS_ACCESS_KEY' },
    { rx: /\baws_secret_access_key\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi, to: 'aws_secret_access_key=REDACTED' },
    // JWT (3 dot-separated base64url chunks)
    { rx: /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, to: 'REDACTED_JWT' },
    // key=value / key: value for common secret names
    { rx: /\b(password|passwd|pwd|secret|token|apikey|api_key|access_key|auth)\s*[:=]\s*['"]?([^'"\s,;]+)['"]?/gi, to: '$1=REDACTED' },
];

export function redact(text) {
    if (!text) return text;
    let out = String(text);
    for (const { rx, to } of REDACT_PATTERNS) out = out.replace(rx, to);
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardrail for generated SQL (MED-4 — strip strings + comments first)
// ─────────────────────────────────────────────────────────────────────────────
/** Remove quoted literals, line comments, and block comments so that
 *  keyword scanning only sees executable SQL. */
function stripLiteralsAndComments(sql) {
    let out = '';
    let i = 0;
    while (i < sql.length) {
        const c = sql[i], next = sql[i + 1];
        if (c === '-' && next === '-') {
            while (i < sql.length && sql[i] !== '\n') i++;
            out += ' ';
            continue;
        }
        if (c === '/' && next === '*') {
            i += 2;
            while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
            i += 2;
            out += ' ';
            continue;
        }
        if (c === "'") {
            i++;
            while (i < sql.length) {
                if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
                if (sql[i] === "'") { i++; break; }
                i++;
            }
            out += "''";
            continue;
        }
        if (c === '"') {
            i++;
            while (i < sql.length && sql[i] !== '"') i++;
            if (i < sql.length) i++;
            out += '""';
            continue;
        }
        // dollar-quoted string
        if (c === '$') {
            const m = /^\$([a-zA-Z_][a-zA-Z0-9_]*)?\$/.exec(sql.slice(i));
            if (m) {
                const tag = m[0];
                i += tag.length;
                const end = sql.indexOf(tag, i);
                if (end < 0) { i = sql.length; }
                else          { i = end + tag.length; }
                out += '$$';
                continue;
            }
        }
        out += c;
        i++;
    }
    return out;
}

export function isSafeToRun(sql) {
    if (!sql) return { safe: false, reason: 'empty' };
    const stripped = stripLiteralsAndComments(sql).trim();
    if (!stripped) return { safe: false, reason: 'empty after strip' };
    const noTrailing = stripped.replace(/;\s*$/, '');
    if (/;.*\S/.test(noTrailing)) return { safe: false, reason: 'multiple statements' };
    if (!/^(with|select)\b/i.test(noTrailing)) return { safe: false, reason: 'only SELECT / WITH allowed' };
    if (/\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|copy|call|execute|do|merge|refresh)\b/i.test(noTrailing)) {
        return { safe: false, reason: 'mutating keyword present' };
    }
    return { safe: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// High-level calls
// ─────────────────────────────────────────────────────────────────────────────
const NL_TO_SQL_SYSTEM = `
You are VIGIL's SQL copilot. Translate the user's question into a single
PostgreSQL SELECT statement using ONLY the tables and columns listed in the
provided schema. Return ONLY the SQL — no backticks, no prose, no explanation.
If the question cannot be answered from the schema, return a SQL comment
starting with "-- cannot answer:" and a brief reason.
Never produce INSERT, UPDATE, DELETE, DDL, or multi-statement scripts.
Prefer explicit column lists over SELECT *.
Use LIMIT 100 by default unless the user asks for something else.
`.trim();

const EXPLAIN_SYSTEM = `
You are VIGIL's performance coach. Given a PostgreSQL EXPLAIN (ANALYZE, BUFFERS)
plan in JSON, write a short (<=6 bullet) review: (1) the dominant cost driver,
(2) whether statistics look stale (rows vs actual), (3) the 1-2 highest-value
fixes (indexes, predicate pushdown, rewrite), (4) a concrete next step. Keep
each bullet under 25 words. No marketing tone.
`.trim();

const RCA_SYSTEM = `
You are VIGIL's incident writer. Given metric, alert, and plan context, draft
a Root Cause Analysis note with these sections, each 2-3 sentences:
Impact, Trigger, Root cause, Mitigation, Follow-ups. Be specific. If the data
is insufficient, say so in that section.
`.trim();

export async function generateSql(monitoredPool, { prompt, schema = 'public' }) {
    const provider = getProvider();
    const schemaText = await buildSchemaContext(monitoredPool, { schema, hint: prompt });
    const safePrompt = redact(prompt);
    const user = `SCHEMA:\n${schemaText}\n\nQUESTION:\n${safePrompt}\n\nReturn ONLY the SQL.`;
    const raw = await provider.complete({ system: NL_TO_SQL_SYSTEM, user, maxTokens: 800 });
    const sql = raw.replace(/```sql\s*/gi, '').replace(/```/g, '').trim();
    const guard = isSafeToRun(sql);
    return { provider: provider.name, model: provider.model, sql, guard };
}

export async function explainPlan(_ignoredPool, { plan, sql }) {
    const provider = getProvider();
    const body = [
        sql ? `SQL:\n${redact(sql)}\n` : '',
        `PLAN (JSON):\n${typeof plan === 'string' ? redact(plan) : JSON.stringify(plan)}`,
    ].filter(Boolean).join('\n');
    const text = await provider.complete({ system: EXPLAIN_SYSTEM, user: body, maxTokens: 800 });
    return { provider: provider.name, model: provider.model, review: text };
}

export async function draftIncidentRca(_ignoredPool, { incident }) {
    const provider = getProvider();
    const user = `INCIDENT CONTEXT:\n${redact(JSON.stringify(incident, null, 2))}`;
    const text = await provider.complete({ system: RCA_SYSTEM, user, maxTokens: 1200 });
    return { provider: provider.name, model: provider.model, rca: text };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence (chat history) — HIGH-4 fix: input is redacted before write.
// ─────────────────────────────────────────────────────────────────────────────
export async function saveConversationTurn({ workspaceId, userId, kind, input, output }) {
    try {
        const redactedInput = redact(String(input ?? '')).slice(0, 8000);
        await query(
            `INSERT INTO pgmonitoringtool.copilot_turns
                (workspace_id, user_id, kind, input, output, created_at)
             VALUES ($1,$2,$3,$4,$5, now())`,
            [workspaceId || null, userId || null, kind, redactedInput, String(output ?? '').slice(0, 16000)]
        );
    } catch (err) {
        if (!/relation .* does not exist/.test(err.message)) {
            console.warn('[copilot] saveConversationTurn failed:', err.message);
        }
    }
}
