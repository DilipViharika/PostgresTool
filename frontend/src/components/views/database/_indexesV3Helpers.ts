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
