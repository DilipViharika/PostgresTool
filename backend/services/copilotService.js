/**
 * services/copilotService.js
 * ──────────────────────────
 * Schema-aware SQL copilot for VIGIL.
 *
 * Capabilities
 *   1. Generate SQL from natural language (NL → SQL) using a live schema snapshot
 *   2. Explain a query plan in plain English and call out risky nodes
 *   3. Draft incident RCA narratives by stitching metric + alert + plan context
 *
 * LLM-agnostic: the provider layer is swappable via COPILOT_PROVIDER env var.
 *   - `openai`    → uses OPENAI_API_KEY / COPILOT_MODEL (default gpt-4o-mini)
 *   - `anthropic` → uses ANTHROPIC_API_KEY / COPILOT_MODEL (default claude-sonnet-4-6)
 *   - `local`     → deterministic stub for dev / air-gapped demos
 *
 * Safety rails
 *   • Schema context is capped to N tables and M columns per table so we never
 *     blow the prompt budget on large schemas.
 *   • Generated SQL is run through an allow-list (SELECT / WITH only) before
 *     it is ever offered for execution.
 *   • Secrets, passwords, and DSNs in the user prompt are redacted before they
 *     are shipped to any external provider.
 */
import { query } from '../db.js';

const MAX_TABLES_IN_CONTEXT = 40;
const MAX_COLS_PER_TABLE    = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Provider adapter
// ─────────────────────────────────────────────────────────────────────────────
export function getProvider() {
    const p = (process.env.COPILOT_PROVIDER || 'local').toLowerCase();
    if (p === 'openai')    return openAiProvider();
    if (p === 'anthropic') return anthropicProvider();
    return localProvider();
}

function openAiProvider() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model  = process.env.COPILOT_MODEL || 'gpt-4o-mini';
    return {
        name: 'openai', model,
        async complete({ system, user, maxTokens = 1200 }) {
            if (!apiKey) throw new Error('OPENAI_API_KEY not set');
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
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
            });
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
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
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
            });
            if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
            const j = await r.json();
            return j.content?.[0]?.text?.trim() || '';
        },
    };
}

function localProvider() {
    // Deterministic stub so demos / tests never need external credentials.
    return {
        name: 'local', model: 'stub',
        async complete({ user }) {
            // Very rough NL-to-SQL pattern matching — enough for screencasts.
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
// Schema context builder
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Snapshot of the active Postgres schema as compact text, hint-ranked by how
 * likely each table is to be relevant to the user's question.
 */
export async function buildSchemaContext(pool, { schema = 'public', hint = '' } = {}) {
    // 1. Fetch tables.
    const tbls = await pool.query(
        `SELECT table_name FROM information_schema.tables
          WHERE table_schema = $1 AND table_type = 'BASE TABLE'
          ORDER BY table_name`,
        [schema]
    );
    const tableNames = tbls.rows.map(r => r.table_name);

    // 2. Rank by fuzzy hint overlap (when the user mentions a domain noun).
    const hintTokens = String(hint).toLowerCase().split(/[^a-z0-9_]+/).filter(t => t.length > 2);
    const scored = tableNames.map(name => {
        const lower = name.toLowerCase();
        const score = hintTokens.reduce((s, t) => s + (lower.includes(t) ? 2 : 0), 0);
        return { name, score };
    }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const chosen = scored.slice(0, MAX_TABLES_IN_CONTEXT).map(t => t.name);
    if (chosen.length === 0) return '';

    // 3. Fetch columns in one go.
    const cols = await pool.query(
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

    // 4. Emit compact DDL-ish snippets.
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
// Redaction
// ─────────────────────────────────────────────────────────────────────────────
export function redact(text) {
    if (!text) return text;
    return String(text)
        // common connection strings: postgres://user:pass@host/db
        .replace(/\b([a-z]+):\/\/[^:\s]+:[^@\s]+@/gi, '$1://REDACTED:REDACTED@')
        // bearer tokens / long base64-ish secrets
        .replace(/\b(sk-[A-Za-z0-9]{20,}|xoxb-[A-Za-z0-9-]{20,}|ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g, 'REDACTED_SECRET')
        // password="..."   password: "..."   password = '...'
        .replace(/\b(password|passwd|secret|token|apikey|api_key)\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi, '$1=REDACTED');
}

// ─────────────────────────────────────────────────────────────────────────────
// Guardrail for generated SQL
// ─────────────────────────────────────────────────────────────────────────────
export function isSafeToRun(sql) {
    if (!sql) return { safe: false, reason: 'empty' };
    const stripped = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!stripped) return { safe: false, reason: 'empty after comment strip' };
    if (/;.*\S/.test(stripped.replace(/;\s*$/, ''))) return { safe: false, reason: 'multiple statements' };
    if (!/^(with|select)\b/i.test(stripped)) return { safe: false, reason: 'only SELECT / WITH allowed' };
    if (/\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|copy|call|execute|do)\b/i.test(stripped)) {
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

export async function generateSql(pool, { prompt, schema = 'public' }) {
    const provider = getProvider();
    const schemaText = await buildSchemaContext(pool, { schema, hint: prompt });
    const safePrompt = redact(prompt);
    const user = `SCHEMA:\n${schemaText}\n\nQUESTION:\n${safePrompt}\n\nReturn ONLY the SQL.`;
    const raw = await provider.complete({ system: NL_TO_SQL_SYSTEM, user, maxTokens: 800 });
    const sql = raw.replace(/```sql\s*/gi, '').replace(/```/g, '').trim();
    const guard = isSafeToRun(sql);
    return { provider: provider.name, model: provider.model, sql, guard };
}

export async function explainPlan(pool, { plan, sql }) {
    const provider = getProvider();
    const body = [
        sql ? `SQL:\n${sql}\n` : '',
        `PLAN (JSON):\n${typeof plan === 'string' ? plan : JSON.stringify(plan)}`,
    ].filter(Boolean).join('\n');
    const text = await provider.complete({ system: EXPLAIN_SYSTEM, user: body, maxTokens: 800 });
    return { provider: provider.name, model: provider.model, review: text };
}

export async function draftIncidentRca(pool, { incident }) {
    const provider = getProvider();
    const user = `INCIDENT CONTEXT:\n${redact(JSON.stringify(incident, null, 2))}`;
    const text = await provider.complete({ system: RCA_SYSTEM, user, maxTokens: 1200 });
    return { provider: provider.name, model: provider.model, rca: text };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence (chat history)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveConversationTurn({ workspaceId, userId, kind, input, output }) {
    try {
        await query(
            `INSERT INTO pgmonitoringtool.copilot_turns
                (workspace_id, user_id, kind, input, output, created_at)
             VALUES ($1,$2,$3,$4,$5, now())`,
            [workspaceId || null, userId || null, kind, String(input).slice(0, 8000), String(output).slice(0, 16000)]
        );
    } catch (err) {
        // Best-effort — missing table should not break the user-facing call.
        if (!/relation .* does not exist/.test(err.message)) {
            console.warn('[copilot] saveConversationTurn failed:', err.message);
        }
    }
}
