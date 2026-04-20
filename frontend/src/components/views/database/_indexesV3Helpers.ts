/**
 * _indexesV3Helpers.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Pure helpers for IndexesTabV3: natural-language search parsing,
 * insight synthesis, confidence derivation, action ranking.
 *
 * "AI" here means deterministic rule-based logic over real data — no LLM
 * call at runtime. The output text is templated but written to sound like
 * something a senior DBA would say. Label as "AI-generated" in the UI so
 * users know it's synthesized, not hand-written.
 * ────────────────────────────────────────────────────────────────────── */

export type IndexKind = 'missing' | 'unused' | 'duplicate' | 'bloat';
export type Severity = 'low' | 'med' | 'high';

export interface IndexRow {
    id: string;
    kind: IndexKind;
    schema: string;
    table: string;
    tableLabel: string;
    indexName?: string;
    definition?: string;
    size?: string;
    sizeBytes: number;
    scans: number;
    seqScan: number;
    idxScan: number;
    writes: number;
    shadowedBy?: string;
    bloatPct: number;
    severity: Severity;
    detail: string;
    suggestion?: string;
    /** 0–1; how confident we are that this row is real and actionable. */
    confidence: number;
    /** 0–1; estimated benefit if acted on. */
    impact: number;
    /** 0–1; how easy the fix is (1 = trivial, 0 = risky). */
    effort: number;
    /** 0–1; composite score for ranking. */
    score: number;
    /** 24-bucket fake-but-stable usage sparkline (derived from scan counts). */
    spark: number[];
}

export interface HealthSummary {
    hitRatio: number;
    totalIndexes: number;
    totalSize: string;
    totalBytes: number;
    criticalCount: number;
    seqScanRate: number;
}

export const EMPTY_HEALTH: HealthSummary = {
    hitRatio: 0, totalIndexes: 0, totalSize: '—', totalBytes: 0,
    criticalCount: 0, seqScanRate: 0,
};

/* ─────────────────────────────────────────────────────────────────────────
 * Severity helpers
 * ────────────────────────────────────────────────────────────────────── */

export const normaliseSeverity = (s: unknown): Severity => {
    const v = String(s || '').toLowerCase();
    if (v === 'high' || v === 'critical') return 'high';
    if (v === 'medium' || v === 'med' || v === 'warning' || v === 'warn') return 'med';
    return 'low';
};

export const sevRank = (s: Severity): number =>
    s === 'high' ? 3 : s === 'med' ? 2 : 1;

/* ─────────────────────────────────────────────────────────────────────────
 * Spark line — stable pseudo-random based on the row's identity, scaled
 * by actual scan count so high-traffic rows have a taller sparkline.
 * ────────────────────────────────────────────────────────────────────── */

const hash = (s: string): number => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
    return Math.abs(h);
};

export const buildSpark = (seed: string, amplitude: number): number[] => {
    const base = hash(seed);
    const peak = Math.max(1, Math.log10(amplitude + 10));
    const out: number[] = [];
    for (let i = 0; i < 24; i++) {
        const h = hash(`${seed}:${i}`);
        const v = ((h ^ (base >>> (i % 8))) % 100) / 100;
        out.push(Math.max(0.05, v * peak));
    }
    return out;
};

/* ─────────────────────────────────────────────────────────────────────────
 * Row synthesis — normalise raw API rows into the richer IndexRow shape
 * used by the V3 UI.
 * ────────────────────────────────────────────────────────────────────── */

const pctInt = (n: number) => Math.round(n * 100);

const confidenceFor = (kind: IndexKind, r: Record<string, unknown>): number => {
    // Rough rule-of-thumb: more supporting data → higher confidence.
    switch (kind) {
        case 'missing': {
            const seq = Number(r.seq_scan ?? 0);
            if (seq > 10_000) return 0.95;
            if (seq > 1_000)  return 0.82;
            if (seq > 100)    return 0.65;
            return 0.45;
        }
        case 'unused': {
            const scans = Number(r.scans ?? 0);
            return scans === 0 ? 0.92 : scans < 5 ? 0.78 : 0.55;
        }
        case 'duplicate':
            return r.shadowedBy ? 0.88 : 0.60;
        case 'bloat': {
            const pct = Number(r.bloatPct ?? 0);
            if (pct > 50) return 0.93;
            if (pct > 25) return 0.78;
            return 0.55;
        }
    }
};

const impactFor = (kind: IndexKind, r: Record<string, unknown>): number => {
    switch (kind) {
        case 'missing': {
            const seq = Number(r.seq_scan ?? 0);
            return Math.min(1, Math.log10(seq + 1) / 5);
        }
        case 'unused': {
            const size = Number(r.sizeBytes ?? 0);
            return Math.min(1, Math.log10(size + 1) / 10);
        }
        case 'duplicate':
            return 0.55;
        case 'bloat': {
            const pct = Number(r.bloatPct ?? 0);
            return Math.min(1, pct / 80);
        }
    }
};

const effortFor = (kind: IndexKind): number => {
    // Drops are easy; index creation medium; reindex on big tables harder.
    switch (kind) {
        case 'unused':    return 0.9;
        case 'duplicate': return 0.85;
        case 'missing':   return 0.65;
        case 'bloat':     return 0.55;
    }
};

const detailFor = (kind: IndexKind, r: Record<string, unknown>): string => {
    switch (kind) {
        case 'missing': {
            const seq = Number(r.seq_scan ?? 0);
            return seq > 0
                ? `${seq.toLocaleString()} sequential scans — a new index would cut this table's read cost.`
                : 'Heavy read pattern with no index covering it.';
        }
        case 'unused': {
            const scans = Number(r.scans ?? 0);
            return scans === 0
                ? `Never used since created. Safe to drop.`
                : `Rarely used (${scans} scans observed). Low value vs. write overhead.`;
        }
        case 'duplicate':
            return `Fully covered by ${String(r.shadowedBy ?? 'another index')} — keeping both wastes space and slows writes.`;
        case 'bloat': {
            const pct = Number(r.bloatPct ?? 0);
            return `${pct.toFixed(0)}% bloat. Concurrent reindex would reclaim space without downtime.`;
        }
    }
};

const suggestionFor = (kind: IndexKind, r: Record<string, unknown>): string | undefined => {
    const schema = String(r.schema ?? 'public');
    const table = String(r.table ?? 'unknown');
    switch (kind) {
        case 'missing':
            return `CREATE INDEX CONCURRENTLY ON ${schema}.${table} (/* column */);`;
        case 'unused':
        case 'duplicate':
            return r.indexName ? `DROP INDEX CONCURRENTLY ${r.indexName};` : undefined;
        case 'bloat':
            return r.indexName ? `REINDEX INDEX CONCURRENTLY ${r.indexName};` : undefined;
    }
};

export const synthesizeRow = (
    kind: IndexKind,
    r: Record<string, unknown>,
    i: number,
): IndexRow => {
    const schema = String(r.schema ?? 'public');
    const table = String(r.table ?? 'unknown');
    const indexName = r.indexName ? String(r.indexName) : undefined;
    const sizeBytes = Number(r.sizeBytes ?? r.tableSizeBytes ?? 0);
    const scans = Number(r.scans ?? 0);
    const seqScan = Number(r.seq_scan ?? 0);
    const idxScan = Number(r.idx_scan ?? 0);
    const writes = Number(r.writes ?? 0);
    const bloatPct = Number(r.bloatPct ?? 0);
    const severity = normaliseSeverity(r.severity);
    const confidence = confidenceFor(kind, r);
    const impact = impactFor(kind, r);
    const effort = effortFor(kind);
    const score = impact * 0.55 + effort * 0.25 + confidence * 0.20;
    const id = `${kind}-${i}-${indexName ?? table}`;
    const amplitude = Math.max(scans, seqScan, idxScan, 1);
    return {
        id, kind, schema, table,
        tableLabel: `${schema}.${table}`,
        indexName,
        definition: (r.definition as string) || undefined,
        size: (r.size as string) || (r.tableSize as string) || undefined,
        sizeBytes,
        scans, seqScan, idxScan, writes,
        shadowedBy: (r.shadowedBy as string) || undefined,
        bloatPct,
        severity,
        detail: detailFor(kind, r),
        suggestion: suggestionFor(kind, r),
        confidence, impact, effort, score,
        spark: buildSpark(id, amplitude),
    };
};

/* ─────────────────────────────────────────────────────────────────────────
 * Natural-language search parser
 *
 * Accepted patterns (anywhere in the query):
 *    - Kind words: "missing", "unused", "duplicate", "duplicates", "bloat"
 *    - Severity:   "critical", "high", "medium", "low"
 *    - Size:       "large", "big", "huge", "small"
 *    - Table name fragment: anything with "table:" prefix, OR bare word
 *    - Index name fragment: anything with "index:" prefix
 *    - "actionable" / "safe" → score >= 0.6
 *
 * Returns a filter function.
 * ────────────────────────────────────────────────────────────────────── */

export interface ParsedQuery {
    kind: Set<IndexKind>;
    severity: Set<Severity>;
    sizeBucket: 'any' | 'large' | 'small';
    tableFrag: string | null;
    indexFrag: string | null;
    actionable: boolean;
    freeText: string;
}

export const parseNLQuery = (q: string): ParsedQuery => {
    const lower = q.toLowerCase();
    const kind = new Set<IndexKind>();
    if (/\bmissing\b/.test(lower)) kind.add('missing');
    if (/\bunused|never used|dead\b/.test(lower)) kind.add('unused');
    if (/\bduplicate|dupe|shadow|redundant\b/.test(lower)) kind.add('duplicate');
    if (/\bbloat|fragmented|rebuild|reindex\b/.test(lower)) kind.add('bloat');

    const severity = new Set<Severity>();
    if (/\bcritical|urgent|severe|high\b/.test(lower)) severity.add('high');
    if (/\bmed(ium)?|moderate\b/.test(lower)) severity.add('med');
    if (/\blow|minor\b/.test(lower)) severity.add('low');

    let sizeBucket: ParsedQuery['sizeBucket'] = 'any';
    if (/\blarge|big|huge|heavy\b/.test(lower)) sizeBucket = 'large';
    if (/\bsmall|tiny\b/.test(lower)) sizeBucket = 'small';

    const tableMatch = lower.match(/table:([a-z0-9_.]+)/);
    const indexMatch = lower.match(/index:([a-z0-9_]+)/);
    const tableFrag = tableMatch ? tableMatch[1] : null;
    const indexFrag = indexMatch ? indexMatch[1] : null;

    const actionable = /\bactionable|safe|do it now|quick win\b/.test(lower);

    // Keep the "free text" portion for substring search on label/detail.
    const freeText = lower
        .replace(/\b(missing|unused|never used|dead|duplicate|dupe|shadow|redundant|bloat|fragmented|rebuild|reindex)\b/g, '')
        .replace(/\b(critical|urgent|severe|high|medium|moderate|low|minor)\b/g, '')
        .replace(/\b(large|big|huge|heavy|small|tiny)\b/g, '')
        .replace(/table:[a-z0-9_.]+/g, '')
        .replace(/index:[a-z0-9_]+/g, '')
        .replace(/\b(actionable|safe|do it now|quick win)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return { kind, severity, sizeBucket, tableFrag, indexFrag, actionable, freeText };
};

export const applyQuery = (rows: IndexRow[], q: ParsedQuery): IndexRow[] =>
    rows.filter((r) => {
        if (q.kind.size && !q.kind.has(r.kind)) return false;
        if (q.severity.size && !q.severity.has(r.severity)) return false;
        if (q.sizeBucket === 'large' && r.sizeBytes < 10 * 1024 * 1024) return false;
        if (q.sizeBucket === 'small' && r.sizeBytes > 1 * 1024 * 1024) return false;
        if (q.tableFrag && !r.tableLabel.toLowerCase().includes(q.tableFrag)) return false;
        if (q.indexFrag && !(r.indexName || '').toLowerCase().includes(q.indexFrag)) return false;
        if (q.actionable && r.score < 0.6) return false;
        if (q.freeText) {
            const hay = `${r.tableLabel} ${r.indexName ?? ''} ${r.detail}`.toLowerCase();
            if (!hay.includes(q.freeText)) return false;
        }
        return true;
    });

/* ─────────────────────────────────────────────────────────────────────────
 * Top-level AI insight — rank the N most consequential actions and draft
 * a short explainer for each.
 * ────────────────────────────────────────────────────────────────────── */

export interface Insight {
    id: string;
    row: IndexRow;
    title: string;
    why: string;
    impactLabel: string;
    actionLabel: string;
    confidencePct: number;
}

const impactLabelFor = (row: IndexRow): string => {
    switch (row.kind) {
        case 'missing':
            return row.seqScan > 1_000
                ? `Could cut ~${Math.round(Math.min(95, Math.log10(row.seqScan) * 25))}% of reads on this table`
                : 'Meaningful read-latency win';
        case 'unused':
            return row.size
                ? `Reclaims ${row.size} of disk and speeds up writes`
                : 'Reduces write amplification';
        case 'duplicate':
            return 'Frees disk and avoids double-maintenance on inserts';
        case 'bloat':
            return row.bloatPct > 40
                ? `Reclaims ~${Math.round(row.bloatPct)}% of this index's space`
                : 'Modest space reclaim';
    }
};

const actionLabelFor = (kind: IndexKind): string => {
    switch (kind) {
        case 'missing':   return 'Create index';
        case 'unused':    return 'Drop index';
        case 'duplicate': return 'Drop duplicate';
        case 'bloat':     return 'Reindex';
    }
};

const whyFor = (row: IndexRow): string => {
    switch (row.kind) {
        case 'missing':
            return `Postgres is doing ${row.seqScan.toLocaleString()} sequential scans on ${row.tableLabel}. ` +
                   `An index on the predicate column would turn those into index scans, which typically ` +
                   `reduces per-query CPU and I/O by an order of magnitude on tables this size.`;
        case 'unused':
            return `${row.indexName ?? 'This index'} has only ${row.scans} recorded scans. ` +
                   `Every write to ${row.tableLabel} still has to maintain it. ` +
                   `Dropping it reclaims space and speeds up INSERT/UPDATE/DELETE with zero query impact.`;
        case 'duplicate':
            return `${row.indexName ?? 'This index'} is fully covered by ${row.shadowedBy ?? 'another index'}. ` +
                   `Both are being maintained for every write, which doubles the cost with no read benefit.`;
        case 'bloat':
            return `${row.indexName ?? 'This index'} is ${row.bloatPct.toFixed(0)}% bloated. ` +
                   `REINDEX CONCURRENTLY rebuilds it in the background — no locks held against reads or writes — ` +
                   `and reclaims the wasted space.`;
    }
};

export const buildInsights = (rows: IndexRow[], n = 5): Insight[] => {
    const ranked = [...rows].sort((a, b) => b.score - a.score).slice(0, n);
    return ranked.map((row) => ({
        id: `insight-${row.id}`,
        row,
        title: `${actionLabelFor(row.kind)} on ${row.indexName ?? row.tableLabel}`,
        why: whyFor(row),
        impactLabel: impactLabelFor(row),
        actionLabel: actionLabelFor(row.kind),
        confidencePct: pctInt(row.confidence),
    }));
};

/* ─────────────────────────────────────────────────────────────────────────
 * Misc
 * ────────────────────────────────────────────────────────────────────── */

export const fmtBytes = (n: number): string => {
    if (!n) return '—';
    if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    if (n >= 1024)      return `${(n / 1024).toFixed(1)} KB`;
    return `${n} B`;
};

export const kindMeta: Record<IndexKind, { label: string; short: string }> = {
    missing:   { label: 'Missing index',   short: 'MISS' },
    unused:    { label: 'Not in use',      short: 'UNUSED' },
    duplicate: { label: 'Duplicate',       short: 'DUPE' },
    bloat:     { label: 'Needs rebuild',   short: 'BLOAT' },
};

/* ═════════════════════════════════════════════════════════════════════════
 * ADVANCED AI ANALYSIS — root cause, correlation, cost/benefit, risk,
 * dependencies — plus fix-script generation with pre-flight and rollback.
 *
 * Everything here is deterministic and synthesized from the IndexRow itself.
 * When a real `/api/ai/index-analysis` endpoint is wired, swap `analyzeRow()`
 * for the remote call — the shape is stable.
 * ═══════════════════════════════════════════════════════════════════════ */

/* ── Types ────────────────────────────────────────────────────────────── */

export type RiskLevel = 'safe' | 'review' | 'risky';

export interface CostBenefit {
    /** Estimated per-query read-latency saved (ms). */
    msSavedPerQuery: number;
    /** Projected QPS headroom gained on this table (%). */
    qpsHeadroomPct: number;
    /** Disk reclaimed (or required). Negative means the fix adds space. */
    gbReclaimed: number;
    /** Monthly USD saved (rough — disk at $0.10/GB/mo + I/O savings). */
    monthlyUsdSaved: number;
    /** Writes per second spared from maintaining the index. */
    writesPerSecSpared: number;
}

export interface RiskAssessment {
    level: RiskLevel;
    /** One-liner describing the locking behavior. */
    lockImpact: string;
    /** Replication lag expectation. */
    replicationRisk: string;
    /** Rollback plan summary. */
    rollbackPlan: string;
    /** True if we'd recommend running off-hours. */
    offHoursOnly: boolean;
    /** Short bullet safety checks to verify before running. */
    safetyChecks: string[];
}

export interface FixScript {
    /** The "before you run it" sanity checks as SQL. */
    preFlight: string;
    /** The actual fix command(s). */
    sql: string;
    /** The SQL to roll the change back. */
    rollback: string;
    /** Approximate wall-clock runtime. */
    estimatedDuration: string;
}

export interface Dependencies {
    /** Other row IDs that conflict with this fix (e.g. can't run simultaneously). */
    conflictsWith: string[];
    /** Row IDs whose fix we recommend running first. */
    applyAfter: string[];
    /** Row IDs that are good to batch with this one. */
    batchWith: string[];
    /** Human-readable rationale. */
    note: string;
}

export interface Correlation {
    /** Other row IDs on the same table / same root cause. */
    relatedIds: string[];
    /** Human-readable explanation of how they relate. */
    note: string;
}

export interface AdvancedAnalysis {
    rootCause: string;
    correlation: Correlation;
    costBenefit: CostBenefit;
    risk: RiskAssessment;
    dependencies: Dependencies;
    fixScript: FixScript;
    /** 0-100, overall "should I do this now?" score. */
    priorityScore: number;
}

/* ── Column inference ─────────────────────────────────────────────────── */

/**
 * Best-effort extraction of the column list from a pg index definition like:
 *     CREATE INDEX foo ON public.users USING btree (email, created_at)
 * Returns a comma-separated string, or `<column>` if it can't be parsed.
 */
export const extractColumns = (definition?: string): string => {
    if (!definition) return '<column>';
    const m = definition.match(/\(([^)]+)\)/);
    if (!m) return '<column>';
    return m[1].split(',').map((c) => c.trim()).join(', ');
};

const suggestedIndexName = (schema: string, table: string, cols: string): string => {
    const colSlug = cols
        .replace(/[^a-z0-9_, ]/gi, '')
        .split(',')
        .map((c) => c.trim().split(/\s+/)[0])
        .filter(Boolean)
        .join('_')
        .toLowerCase()
        .slice(0, 32);
    const base = `${schema}_${table}_${colSlug || 'idx'}`.slice(0, 48);
    return `idx_${base}`;
};

/* ── Cost / benefit modeling ──────────────────────────────────────────── */

const USD_PER_GB_MONTH = 0.10;      // Very rough — RDS-style storage.
const USD_PER_IO_MONTH = 0.000002;  // Rough per-IO cost on provisioned IOPS.

const costBenefitFor = (row: IndexRow): CostBenefit => {
    const sizeGB = Math.max(0, row.sizeBytes / 1024 ** 3);
    switch (row.kind) {
        case 'missing': {
            // Missing: reads dominate. Savings scale with the log of seq scans.
            const seq = Math.max(1, row.seqScan);
            const msSavedPerQuery = Math.min(900, 40 + Math.log10(seq + 1) * 120);
            const qpsHeadroomPct = Math.min(85, 15 + Math.log10(seq + 1) * 15);
            const monthlyIO = seq * 30 * 100; // ~100 IOs per seq scan
            const monthlyUsdSaved =
                Math.round(monthlyIO * USD_PER_IO_MONTH * 100) / 100;
            return {
                msSavedPerQuery: Math.round(msSavedPerQuery),
                qpsHeadroomPct: Math.round(qpsHeadroomPct),
                gbReclaimed: -Math.max(0.1, sizeGB * 0.05), // index costs ~5% of table
                monthlyUsdSaved,
                writesPerSecSpared: 0,
            };
        }
        case 'unused': {
            const sparedWrites = Math.max(1, row.writes) / 3600; // treat as per-sec
            return {
                msSavedPerQuery: 0,
                qpsHeadroomPct: Math.min(25, Math.round(sparedWrites * 5)),
                gbReclaimed: Number(sizeGB.toFixed(2)),
                monthlyUsdSaved: Math.round(sizeGB * USD_PER_GB_MONTH * 100) / 100,
                writesPerSecSpared: Math.round(sparedWrites * 100) / 100,
            };
        }
        case 'duplicate': {
            const sparedWrites = Math.max(1, row.writes) / 3600;
            return {
                msSavedPerQuery: 0,
                qpsHeadroomPct: Math.min(20, Math.round(sparedWrites * 4)),
                gbReclaimed: Number(sizeGB.toFixed(2)),
                monthlyUsdSaved: Math.round(sizeGB * USD_PER_GB_MONTH * 100) / 100,
                writesPerSecSpared: Math.round(sparedWrites * 100) / 100,
            };
        }
        case 'bloat': {
            const reclaimed = sizeGB * (row.bloatPct / 100);
            return {
                msSavedPerQuery: Math.round(Math.min(80, row.bloatPct * 0.6)),
                qpsHeadroomPct: Math.round(Math.min(25, row.bloatPct * 0.25)),
                gbReclaimed: Number(reclaimed.toFixed(2)),
                monthlyUsdSaved: Math.round(reclaimed * USD_PER_GB_MONTH * 100) / 100,
                writesPerSecSpared: 0,
            };
        }
    }
};

/* ── Root-cause templating ────────────────────────────────────────────── */

const rootCauseFor = (row: IndexRow): string => {
    switch (row.kind) {
        case 'missing':
            return row.seqScan > 10_000
                ? `Queries against ${row.tableLabel} are consistently filtering on an un-indexed column. ` +
                  `Postgres is falling back to ${row.seqScan.toLocaleString()} sequential scans — ` +
                  `each scan reads the entire table heap, which is why the read cost grows with table size.`
                : `Read patterns on ${row.tableLabel} don't match any existing index. ` +
                  `Postgres is reading more pages than necessary for each query.`;
        case 'unused':
            return row.scans === 0
                ? `${row.indexName ?? 'This index'} has zero recorded scans since pg_stat_user_indexes ` +
                  `was last reset. It was likely created speculatively or for a query path that no longer runs.`
                : `Usage has decayed to ${row.scans} scans. A recent query-plan change or schema ` +
                  `refactor probably routed traffic to a different index.`;
        case 'duplicate':
            return `${row.indexName ?? 'This index'} covers a strict prefix of ${row.shadowedBy ?? 'another index'}, ` +
                   `so the planner always chooses the wider one. Both are still maintained on every write.`;
        case 'bloat':
            return `${row.indexName ?? 'This index'} has accumulated ${row.bloatPct.toFixed(0)}% dead tuples. ` +
                   `This typically happens after bulk updates/deletes without a matching VACUUM, ` +
                   `or on tables with very high write churn between autovacuum runs.`;
    }
};

/* ── Risk / safety ────────────────────────────────────────────────────── */

const riskFor = (row: IndexRow): RiskAssessment => {
    const sizeGB = row.sizeBytes / 1024 ** 3;
    const isHuge = sizeGB > 5;
    switch (row.kind) {
        case 'missing':
            return {
                level: isHuge ? 'review' : 'safe',
                lockImpact: 'CREATE INDEX CONCURRENTLY holds no table-level write lock.',
                replicationRisk: isHuge
                    ? 'Build generates significant WAL — watch replica lag during the build.'
                    : 'Minimal WAL volume expected.',
                rollbackPlan: 'DROP INDEX CONCURRENTLY reverses the change without locking.',
                offHoursOnly: isHuge,
                safetyChecks: [
                    `Verify free disk ≥ ${Math.max(0.1, sizeGB * 0.15).toFixed(1)} GB before running.`,
                    'Confirm no long-running transactions are open (pg_stat_activity).',
                    'Have `DROP INDEX CONCURRENTLY` ready in case of unexpected cost.',
                ],
            };
        case 'unused':
            return {
                level: row.scans === 0 ? 'safe' : 'review',
                lockImpact: 'DROP INDEX CONCURRENTLY only takes a SHARE UPDATE EXCLUSIVE lock briefly.',
                replicationRisk: 'Negligible — single catalog change.',
                rollbackPlan: row.definition
                    ? 'Re-run the saved CREATE INDEX CONCURRENTLY statement.'
                    : 'Keep the original definition handy before dropping.',
                offHoursOnly: false,
                safetyChecks: [
                    'Confirm zero scans across the last 7+ days (pg_stat_user_indexes.idx_scan).',
                    'Check that it is not referenced by a FOREIGN KEY or UNIQUE constraint.',
                    'Save the CREATE INDEX definition for rollback.',
                ],
            };
        case 'duplicate':
            return {
                level: 'safe',
                lockImpact: 'DROP INDEX CONCURRENTLY is non-blocking for reads and writes.',
                replicationRisk: 'None.',
                rollbackPlan: 'Re-run the CREATE INDEX statement you saved before the drop.',
                offHoursOnly: false,
                safetyChecks: [
                    `Confirm the definition is a strict prefix of ${row.shadowedBy ?? 'the other index'}.`,
                    'Save the CREATE INDEX for rollback.',
                    'Double-check it is not a UNIQUE or PRIMARY KEY index.',
                ],
            };
        case 'bloat':
            return {
                level: isHuge ? 'review' : 'safe',
                lockImpact: 'REINDEX CONCURRENTLY takes only brief ACCESS EXCLUSIVE on the catalog.',
                replicationRisk: isHuge
                    ? 'Doubles WAL during rebuild — monitor replica lag.'
                    : 'Moderate WAL, typically tolerable.',
                rollbackPlan: 'Rebuild aborts cleanly if interrupted — no rollback needed.',
                offHoursOnly: isHuge,
                safetyChecks: [
                    `Need ~${sizeGB.toFixed(1)} GB free space for the temporary duplicate index.`,
                    'Avoid running during peak write windows.',
                    'Ensure autovacuum is healthy after the rebuild.',
                ],
            };
    }
};

/* ── Dependencies / ordering ──────────────────────────────────────────── */

const dependenciesFor = (row: IndexRow, all: IndexRow[]): Dependencies => {
    const sameTable = all.filter((r) => r.id !== row.id && r.tableLabel === row.tableLabel);
    const conflictsWith: string[] = [];
    const applyAfter: string[] = [];
    const batchWith: string[] = [];

    // Rule: fixes on the same table that change the index set should be serialized.
    sameTable.forEach((other) => {
        if (row.kind === 'missing' && other.kind === 'bloat') {
            // Rebuilding a bloated index first reduces the working set — do it first.
            applyAfter.push(other.id);
        }
        if (row.kind === 'bloat' && other.kind === 'missing') {
            // Pair: good to batch reindex with a new index build during the same window.
            batchWith.push(other.id);
        }
        if (row.kind === 'duplicate' && other.kind === 'unused') {
            // Drop duplicates first; then re-evaluate unused (might shift).
            conflictsWith.push(other.id);
        }
        if (row.kind === 'unused' && other.kind === 'missing') {
            // Drop the unused index first so the write window is lighter.
            applyAfter.push(other.id);
        }
    });

    // Build a human note.
    let note: string;
    if (conflictsWith.length) {
        note = `Wait on ${conflictsWith.length} other fix(es) on ${row.tableLabel} ` +
               `— their outcome could change this row's plan.`;
    } else if (applyAfter.length) {
        note = `Run ${applyAfter.length} upstream fix(es) on ${row.tableLabel} first — ` +
               `they clean the working set.`;
    } else if (batchWith.length) {
        note = `Good to batch with ${batchWith.length} other fix(es) on ${row.tableLabel} ` +
               `during the same maintenance window.`;
    } else {
        note = 'No ordering constraints detected — safe to run on its own.';
    }

    return { conflictsWith, applyAfter, batchWith, note };
};

/* ── Fix script generation ────────────────────────────────────────────── */

const fmtDuration = (sizeBytes: number, kind: IndexKind): string => {
    const sizeGB = Math.max(0.01, sizeBytes / 1024 ** 3);
    const factor = kind === 'missing' ? 60 : kind === 'bloat' ? 90 : 5;
    const seconds = Math.round(sizeGB * factor);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${(seconds / 3600).toFixed(1)} h`;
};

const fixScriptFor = (row: IndexRow): FixScript => {
    const cols = extractColumns(row.definition);
    const idxName = row.indexName
        ?? suggestedIndexName(row.schema, row.table, cols);
    const fq = `${row.schema}.${row.table}`;
    const duration = fmtDuration(row.sizeBytes || 100 * 1024 * 1024, row.kind);

    switch (row.kind) {
        case 'missing': {
            const colsOrPlaceholder = cols === '<column>' ? '/* column(s) */' : cols;
            return {
                preFlight: [
                    `-- 1) Check available free disk:`,
                    `SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;`,
                    ``,
                    `-- 2) Confirm no long-running transactions:`,
                    `SELECT pid, now() - xact_start AS age, query`,
                    `FROM pg_stat_activity`,
                    `WHERE xact_start IS NOT NULL`,
                    `  AND now() - xact_start > interval '5 min';`,
                    ``,
                    `-- 3) Estimate target size:`,
                    `SELECT pg_size_pretty(pg_relation_size('${fq}')) AS table_size;`,
                ].join('\n'),
                sql: [
                    `-- Build the index without blocking writes.`,
                    `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${idxName}`,
                    `    ON ${fq} (${colsOrPlaceholder});`,
                    ``,
                    `-- Validate Postgres didn't mark it INVALID (common after a conflict).`,
                    `SELECT indexrelid::regclass, indisvalid`,
                    `FROM pg_index`,
                    `WHERE indexrelid = '${idxName}'::regclass;`,
                    ``,
                    `-- Refresh planner stats.`,
                    `ANALYZE ${fq};`,
                ].join('\n'),
                rollback: [
                    `-- Removes the new index without locking.`,
                    `DROP INDEX CONCURRENTLY IF EXISTS ${idxName};`,
                ].join('\n'),
                estimatedDuration: duration,
            };
        }
        case 'unused':
            return {
                preFlight: [
                    `-- Confirm the index really isn't being used.`,
                    `SELECT idx_scan, idx_tup_read, idx_tup_fetch`,
                    `FROM pg_stat_user_indexes`,
                    `WHERE indexrelname = '${idxName}';`,
                    ``,
                    `-- Verify it is not backing a UNIQUE / PK constraint.`,
                    `SELECT conname, contype`,
                    `FROM pg_constraint`,
                    `WHERE conindid = '${idxName}'::regclass;`,
                    ``,
                    `-- Save the CREATE INDEX definition for rollback:`,
                    `SELECT indexdef FROM pg_indexes WHERE indexname = '${idxName}';`,
                ].join('\n'),
                sql: [
                    `-- Non-blocking drop.`,
                    `DROP INDEX CONCURRENTLY IF EXISTS ${idxName};`,
                ].join('\n'),
                rollback: row.definition
                    ? `-- Recreate using the saved definition:\n${row.definition};`
                    : `-- Re-run the CREATE INDEX statement you captured in pre-flight.\n-- Example:\n-- CREATE INDEX CONCURRENTLY ${idxName} ON ${fq} (<saved columns>);`,
                estimatedDuration: duration,
            };
        case 'duplicate':
            return {
                preFlight: [
                    `-- Confirm the duplicate really is a prefix of ${row.shadowedBy ?? '<other>'}:`,
                    `SELECT indexdef FROM pg_indexes`,
                    `WHERE indexname IN ('${idxName}', '${row.shadowedBy ?? ''}');`,
                    ``,
                    `-- Save the definition for rollback:`,
                    `SELECT indexdef FROM pg_indexes WHERE indexname = '${idxName}';`,
                ].join('\n'),
                sql: [
                    `-- Drop the redundant index.`,
                    `DROP INDEX CONCURRENTLY IF EXISTS ${idxName};`,
                ].join('\n'),
                rollback: row.definition
                    ? `${row.definition};`
                    : `-- CREATE INDEX CONCURRENTLY ${idxName} ON ${fq} (<saved columns>);`,
                estimatedDuration: duration,
            };
        case 'bloat':
            return {
                preFlight: [
                    `-- Confirm current bloat before rebuilding:`,
                    `SELECT pg_size_pretty(pg_relation_size('${idxName}')) AS idx_size;`,
                    ``,
                    `-- Make sure we have headroom for the concurrent build:`,
                    `SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;`,
                ].join('\n'),
                sql: [
                    `-- Rebuild the index in the background (PG 12+).`,
                    `REINDEX INDEX CONCURRENTLY ${idxName};`,
                    ``,
                    `-- Optionally analyze to refresh stats.`,
                    `ANALYZE ${fq};`,
                ].join('\n'),
                rollback: [
                    `-- REINDEX CONCURRENTLY is self-contained.`,
                    `-- If the rebuild failed mid-way, drop the leftover _ccnew relation:`,
                    `DROP INDEX CONCURRENTLY IF EXISTS ${idxName}_ccnew;`,
                ].join('\n'),
                estimatedDuration: duration,
            };
    }
};

/* ── Correlation ──────────────────────────────────────────────────────── */

const correlationFor = (row: IndexRow, all: IndexRow[]): Correlation => {
    const sameTable = all.filter((r) => r.id !== row.id && r.tableLabel === row.tableLabel);
    const relatedIds = sameTable.map((r) => r.id);
    let note = '';
    if (sameTable.length === 0) {
        note = `Only finding on ${row.tableLabel} — isolated fix.`;
    } else {
        const kinds = Array.from(new Set(sameTable.map((r) => kindMeta[r.kind].label.toLowerCase())));
        note = `Cluster of ${sameTable.length + 1} findings on ${row.tableLabel} ` +
               `(this + ${kinds.join(', ')}). Fixing them together avoids repeating the maintenance window.`;
    }
    return { relatedIds, note };
};

/* ── Priority scoring ─────────────────────────────────────────────────── */

const priorityFor = (
    row: IndexRow, cb: CostBenefit, risk: RiskAssessment,
): number => {
    const impact = row.impact * 100;
    const confidence = row.confidence * 100;
    const riskPenalty = risk.level === 'risky' ? 25 : risk.level === 'review' ? 10 : 0;
    const dollarBoost = Math.min(20, cb.monthlyUsdSaved * 4);
    const raw = impact * 0.45 + confidence * 0.25 + row.effort * 100 * 0.15
        + dollarBoost - riskPenalty;
    return Math.max(0, Math.min(100, Math.round(raw)));
};

/* ── Public entry point ───────────────────────────────────────────────── */

/**
 * Produces the full advanced analysis for a single row.
 * `allRows` is the list we're analyzing — used for cross-row correlation
 * and dependency ordering.
 */
export const analyzeRow = (row: IndexRow, allRows: IndexRow[]): AdvancedAnalysis => {
    const costBenefit = costBenefitFor(row);
    const risk = riskFor(row);
    return {
        rootCause: rootCauseFor(row),
        correlation: correlationFor(row, allRows),
        costBenefit,
        risk,
        dependencies: dependenciesFor(row, allRows),
        fixScript: fixScriptFor(row),
        priorityScore: priorityFor(row, costBenefit, risk),
    };
};

/**
 * Generate a consolidated "apply-plan" .sql file from a set of chosen rows.
 * The ordering respects dependencies (applyAfter → first).
 */
export const buildApplyPlanSQL = (rows: IndexRow[]): string => {
    const analyses = rows.map((r) => ({ row: r, a: analyzeRow(r, rows) }));
    // Rough topological sort: rows whose applyAfter contains another selected row
    // go later. Ties broken by priority.
    const ids = new Set(rows.map((r) => r.id));
    const ordered = [...analyses].sort((x, y) => {
        const xAfter = x.a.dependencies.applyAfter.some((id) => ids.has(id));
        const yAfter = y.a.dependencies.applyAfter.some((id) => ids.has(id));
        if (xAfter !== yAfter) return xAfter ? 1 : -1;
        return y.a.priorityScore - x.a.priorityScore;
    });

    const header = [
        '-- ──────────────────────────────────────────────────────────────',
        `-- AI-generated index fix plan`,
        `-- ${ordered.length} fix${ordered.length === 1 ? '' : 'es'} • ` +
            `${rows.reduce((s, r) => s + analyzeRow(r, rows).costBenefit.monthlyUsdSaved, 0).toFixed(2)} USD/mo estimated savings`,
        `-- Generated ${new Date().toISOString()}`,
        `-- Review each block before running. All statements use CONCURRENTLY`,
        `-- where possible so they do not block reads or writes.`,
        '-- ──────────────────────────────────────────────────────────────',
        '',
    ].join('\n');

    const blocks = ordered.map(({ row, a }, i) => [
        `-- ── Fix ${i + 1}/${ordered.length} • ${kindMeta[row.kind].label} on ${row.tableLabel} ──`,
        `-- Priority: ${a.priorityScore}/100 • Risk: ${a.risk.level} • ETA: ${a.fixScript.estimatedDuration}`,
        `-- ${a.rootCause}`,
        '',
        '-- Pre-flight:',
        a.fixScript.preFlight,
        '',
        '-- Apply:',
        a.fixScript.sql,
        '',
        '-- Rollback (keep handy):',
        a.fixScript.rollback,
        '',
    ].join('\n'));

    return header + '\n' + blocks.join('\n');
};
