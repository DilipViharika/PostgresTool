/**
 * IndexesTabV2.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * A cleaner, more human-friendly version of the Indexes view.
 *
 * Goals:
 *   • Plain-language labels (“Missing index”, “Not in use”, “Duplicate”).
 *   • One overview row, one filterable list, one suggestions panel —
 *     nothing more.
 *   • Calm visual hierarchy; no cyberpunk gradients or heavy ribbons.
 *
 * Uses the real API endpoints:
 *     /api/indexes/health       – summary counts + hit ratio
 *     /api/indexes/missing      – tables that would benefit from an index
 *     /api/indexes/unused       – indexes nothing is reading
 *     /api/indexes/duplicates   – indexes shadowed by another
 *     /api/indexes/bloat        – indexes that need a rebuild
 *
 * The original IndexesTab.tsx (1,161 lines) is left untouched so we can A/B.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    AlertTriangle,
    CheckCircle,
    Copy,
    Database,
    Filter,
    Gauge,
    Info,
    Lightbulb,
    RefreshCcw,
    Search,
    XCircle,
    Zap,
} from 'lucide-react';

import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { fmtNum } from '../../../lib/utils';

import {
    KpiCard,
    PanelCard,
    StatusBadge,
    TremorStyles,
} from '../../ui/tremor';

/* ─────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────── */

interface HealthSummary {
    hitRatio: number;
    totalIndexes: number;
    totalSize: string;
    criticalCount: number;
    seqScanRate: number;
}

type IndexKind = 'missing' | 'unused' | 'duplicate' | 'bloat';

interface IndexRow {
    id: string;
    kind: IndexKind;
    tableLabel: string;           // "public.orders"
    indexName?: string;
    size?: string;
    detail: string;               // one-line plain-language description
    suggestion?: string;          // SQL snippet, if applicable
    severity: 'low' | 'med' | 'high';
}

/* ─────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

const EMPTY_HEALTH: HealthSummary = {
    hitRatio: 0,
    totalIndexes: 0,
    totalSize: '—',
    criticalCount: 0,
    seqScanRate: 0,
};

const severityFromString = (s?: string): IndexRow['severity'] => {
    const v = (s || '').toLowerCase();
    if (v === 'high' || v === 'critical') return 'high';
    if (v === 'medium' || v === 'med' || v === 'warning') return 'med';
    return 'low';
};

const tableLabel = (schema?: string, name?: string) =>
    `${schema || 'public'}.${name || 'unknown'}`;

/** Build a human-readable detail line from a row. */
const detailFor = (kind: IndexKind, raw: Record<string, unknown>): string => {
    switch (kind) {
        case 'missing': {
            const seq = Number(raw.seq_scan ?? 0);
            return seq > 0
                ? `${fmtNum(seq)} sequential scans — a new index would help`
                : 'High-traffic table scanned without an index';
        }
        case 'unused': {
            const size = String(raw.size ?? '—');
            const scans = Number(raw.scans ?? 0);
            return scans === 0
                ? `Never used since created • ${size}`
                : `Rarely used (${scans} scans) • ${size}`;
        }
        case 'duplicate':
            return `Shadowed by ${String(raw.shadowedBy ?? 'another index')} — one can be dropped`;
        case 'bloat': {
            const pct = Number(raw.bloatPct ?? 0);
            return `${pct.toFixed(0)}% bloat — rebuild would reclaim space`;
        }
    }
};

/** Suggested SQL fix for common cases. */
const suggestionFor = (kind: IndexKind, raw: Record<string, unknown>): string | undefined => {
    switch (kind) {
        case 'missing':
            return `CREATE INDEX CONCURRENTLY ON ${tableLabel(
                raw.schema as string,
                raw.table as string,
            )} (/* column */);`;
        case 'unused':
        case 'duplicate':
            return raw.indexName
                ? `DROP INDEX CONCURRENTLY ${raw.indexName};`
                : undefined;
        case 'bloat':
            return raw.indexName
                ? `REINDEX INDEX CONCURRENTLY ${raw.indexName};`
                : undefined;
    }
};

/* ─────────────────────────────────────────────────────────────────────────
 * Data hook — loads all five endpoints in parallel, normalises results.
 * ────────────────────────────────────────────────────────────────────── */

interface IndexData {
    health: HealthSummary;
    rows: IndexRow[];
}

function useIndexData() {
    const [data, setData] = useState<IndexData>({ health: EMPTY_HEALTH, rows: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (manual = false) => {
        if (manual) setRefreshing(true);
        setError(null);
        try {
            const [health, missing, unused, dupes, bloat] = await Promise.all([
                fetchData('/api/indexes/health').catch(() => null),
                fetchData('/api/indexes/missing').catch(() => []),
                fetchData('/api/indexes/unused').catch(() => []),
                fetchData('/api/indexes/duplicates').catch(() => []),
                fetchData('/api/indexes/bloat').catch(() => []),
            ]);

            const mkRow = (kind: IndexKind, arr: unknown): IndexRow[] => {
                if (!Array.isArray(arr)) return [];
                return (arr as Record<string, unknown>[]).map((r, i) => ({
                    id: `${kind}-${i}-${(r.indexName as string) || (r.table as string) || i}`,
                    kind,
                    tableLabel: tableLabel(r.schema as string, r.table as string),
                    indexName: (r.indexName as string) || undefined,
                    size: (r.size as string) || undefined,
                    detail: detailFor(kind, r),
                    suggestion: suggestionFor(kind, r),
                    severity: severityFromString(r.severity as string),
                }));
            };

            const h = (health as Partial<HealthSummary>) || {};
            setData({
                health: {
                    hitRatio: Number(h.hitRatio ?? 0),
                    totalIndexes: Number(h.totalIndexes ?? 0),
                    totalSize: String(h.totalSize ?? '—'),
                    criticalCount: Number(h.criticalCount ?? 0),
                    seqScanRate: Number(h.seqScanRate ?? 0),
                },
                rows: [
                    ...mkRow('missing', missing),
                    ...mkRow('unused', unused),
                    ...mkRow('duplicate', dupes),
                    ...mkRow('bloat', bloat),
                ],
            });
        } catch (e) {
            setError((e as Error).message || 'Failed to load indexes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, refreshing, error, reload: () => load(true) };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tag styling
 * ────────────────────────────────────────────────────────────────────── */

const kindTag = (kind: IndexKind): { label: string; color: string } => {
    switch (kind) {
        case 'missing':
            return { label: 'Missing index', color: THEME.warning };
        case 'unused':
            return { label: 'Not in use', color: THEME.textMuted };
        case 'duplicate':
            return { label: 'Duplicate', color: THEME.info };
        case 'bloat':
            return { label: 'Needs rebuild', color: THEME.danger };
    }
};

/* ─────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

type FilterKey = 'all' | IndexKind;

const IndexesTabV2: React.FC = () => {
    useAdaptiveTheme();
    const { data, loading, refreshing, error, reload } = useIndexData();
    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    useGlobalRefresh(useCallback(() => reload(), [reload]));

    const counts = useMemo(() => {
        const c = { all: data.rows.length, missing: 0, unused: 0, duplicate: 0, bloat: 0 };
        data.rows.forEach((r) => { c[r.kind] += 1; });
        return c;
    }, [data.rows]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.rows.filter((r) => {
            if (filter !== 'all' && r.kind !== filter) return false;
            if (!q) return true;
            return (
                r.tableLabel.toLowerCase().includes(q) ||
                (r.indexName || '').toLowerCase().includes(q) ||
                r.detail.toLowerCase().includes(q)
            );
        });
    }, [data.rows, filter, search]);

    const hitRatio = Math.max(0, Math.min(100, data.health.hitRatio));

    /* ── Loading placeholder ─────────────────────────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
                <TremorStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: 96, borderRadius: 14,
                                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                                opacity: 0.4, animation: 'tremorPulse 1.5s ease-in-out infinite',
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
                <div style={{
                    height: 320, borderRadius: 16,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                    opacity: 0.25, animation: 'tremorPulse 1.5s ease-in-out infinite 0.4s',
                }} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16,
            }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: THEME.textMain, letterSpacing: '-0.02em' }}>
                        Indexes
                    </div>
                    <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
                        Where your database is spending effort — and where a little
                        tidying would help it run faster.
                    </div>
                </div>
                <button
                    type="button"
                    onClick={reload}
                    disabled={refreshing}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 14px', borderRadius: 10,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: THEME.surface, color: THEME.textMain,
                        fontSize: 12, fontWeight: 600,
                        cursor: refreshing ? 'progress' : 'pointer',
                    }}
                >
                    <RefreshCcw size={13} className={refreshing ? 'ov-spin' : undefined} />
                    Refresh
                </button>
            </header>

            {error && (
                <div style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: `${THEME.danger}10`,
                    border: `1px solid ${THEME.danger}30`,
                    color: THEME.danger, fontSize: 12.5,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <AlertTriangle size={14} /> {error}
                </div>
            )}

            {/* KPI row */}
            <section
                aria-label="Index summary"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                }}
            >
                <KpiCard
                    label="Total indexes"
                    value={fmtNum(data.health.totalIndexes)}
                    sub={data.health.totalSize}
                    icon={Database}
                    color={THEME.primary}
                />
                <KpiCard
                    label="Not in use"
                    value={fmtNum(counts.unused)}
                    sub={counts.unused === 0 ? 'nothing to clean up' : 'can be dropped'}
                    icon={XCircle}
                    color={THEME.textMuted}
                    healthy={counts.unused === 0}
                    detail={counts.unused === 0 ? 'All good' : 'Review'}
                />
                <KpiCard
                    label="Missing"
                    value={fmtNum(counts.missing)}
                    sub={counts.missing === 0 ? 'no gaps found' : 'tables could be faster'}
                    icon={AlertTriangle}
                    color={THEME.warning}
                    healthy={counts.missing === 0}
                    detail={counts.missing === 0 ? 'All good' : 'Needs attention'}
                />
                <KpiCard
                    label="Duplicates"
                    value={fmtNum(counts.duplicate)}
                    sub={counts.duplicate === 0 ? 'nothing duplicated' : 'wasted space'}
                    icon={Copy}
                    color={THEME.info}
                    healthy={counts.duplicate === 0}
                    detail={counts.duplicate === 0 ? 'All good' : 'Review'}
                />
                <KpiCard
                    label="Index hit ratio"
                    value={`${hitRatio.toFixed(1)}%`}
                    sub="how often reads use an index"
                    icon={Gauge}
                    color={hitRatio >= 99 ? THEME.success : hitRatio >= 95 ? THEME.warning : THEME.danger}
                    healthy={hitRatio >= 99}
                    detail={hitRatio >= 99 ? 'Excellent' : hitRatio >= 95 ? 'Good' : 'Low'}
                />
            </section>

            {/* Filter + search bar */}
            <section
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Filter size={14} color={THEME.textMuted} />
                    <FilterPill active={filter === 'all'} count={counts.all} onClick={() => setFilter('all')}>
                        All
                    </FilterPill>
                    <FilterPill active={filter === 'missing'} count={counts.missing} onClick={() => setFilter('missing')}>
                        Missing
                    </FilterPill>
                    <FilterPill active={filter === 'unused'} count={counts.unused} onClick={() => setFilter('unused')}>
                        Not in use
                    </FilterPill>
                    <FilterPill active={filter === 'duplicate'} count={counts.duplicate} onClick={() => setFilter('duplicate')}>
                        Duplicates
                    </FilterPill>
                    <FilterPill active={filter === 'bloat'} count={counts.bloat} onClick={() => setFilter('bloat')}>
                        Needs rebuild
                    </FilterPill>
                </div>
                <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 8,
                    background: THEME.surfaceHover ?? THEME.surface,
                    border: `1px solid ${THEME.glassBorder}`,
                    minWidth: 200,
                }}>
                    <Search size={13} color={THEME.textDim} />
                    <input
                        type="search"
                        placeholder="Search tables or indexes…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            border: 'none', outline: 'none', background: 'transparent',
                            color: THEME.textMain, fontSize: 12.5, flex: 1, minWidth: 0,
                        }}
                    />
                </label>
            </section>

            {/* Main list + suggestions */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
                gap: 18,
            }}>
                <PanelCard title="Attention list" icon={Database} accentColor={THEME.primary}>
                    {filtered.length === 0 ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '32px 12px', textAlign: 'center', gap: 6,
                        }}>
                            <CheckCircle size={28} color={THEME.success} style={{ opacity: 0.8 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>
                                Nothing needs attention
                            </div>
                            <div style={{ fontSize: 11.5, color: THEME.textMuted }}>
                                Your indexes look healthy with the current filter.
                            </div>
                        </div>
                    ) : (
                        <div role="list" style={{ display: 'flex', flexDirection: 'column' }}>
                            {filtered.slice(0, 40).map((row, i) => (
                                <IndexListRow
                                    key={row.id}
                                    row={row}
                                    divider={i < Math.min(filtered.length, 40) - 1}
                                />
                            ))}
                            {filtered.length > 40 && (
                                <div style={{
                                    padding: '10px 0 0', fontSize: 11.5, color: THEME.textDim,
                                    textAlign: 'center',
                                }}>
                                    Showing 40 of {filtered.length}. Use filters to narrow down.
                                </div>
                            )}
                        </div>
                    )}
                </PanelCard>

                <PanelCard title="Suggested fixes" icon={Lightbulb} accentColor={THEME.warning}>
                    <SuggestionList rows={filtered.length === 0 ? data.rows : filtered} />
                </PanelCard>
            </section>

            <p style={{
                fontSize: 11, color: THEME.textDim, margin: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
                <Info size={12} /> Suggestions are safe starting points — always
                review the SQL before running it in production.
            </p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────── */

const FilterPill: React.FC<{
    active: boolean;
    count: number;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, count, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${active ? THEME.primary : THEME.glassBorder}`,
            background: active ? `${THEME.primary}15` : 'transparent',
            color: active ? THEME.primary : THEME.textMuted,
        }}
    >
        {children}
        <span style={{
            fontSize: 10.5, fontWeight: 700,
            padding: '1px 6px', borderRadius: 8,
            background: active ? `${THEME.primary}22` : `${THEME.textMuted}18`,
            color: active ? THEME.primary : THEME.textMuted,
            fontFamily: THEME.fontMono,
        }}>
            {count}
        </span>
    </button>
);

const IndexListRow: React.FC<{ row: IndexRow; divider: boolean }> = ({ row, divider }) => {
    const tag = kindTag(row.kind);
    return (
        <div
            role="listitem"
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: divider ? `1px solid ${THEME.glassBorder}` : 'none',
                gap: 12,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                    style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: `${tag.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                >
                    <Database size={14} color={tag.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 600, color: THEME.textMain,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {row.indexName ?? row.tableLabel}
                    </div>
                    <div style={{
                        fontSize: 11.5, color: THEME.textMuted,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {row.indexName ? `on ${row.tableLabel} • ` : ''}{row.detail}
                    </div>
                </div>
            </div>
            <StatusBadge label={tag.label} color={tag.color} />
        </div>
    );
};

const SuggestionList: React.FC<{ rows: IndexRow[] }> = ({ rows }) => {
    const withSql = useMemo(() => rows.filter((r) => !!r.suggestion).slice(0, 6), [rows]);

    if (withSql.length === 0) {
        return (
            <div style={{
                padding: '16px 12px',
                borderRadius: 10,
                background: `${THEME.success}0D`,
                border: `1px dashed ${THEME.success}30`,
                color: THEME.textMuted,
                fontSize: 12.5, lineHeight: 1.5,
                display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
                <CheckCircle size={14} color={THEME.success} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                    No immediate actions. Check back after the next usage window —
                    patterns sometimes show up only under real load.
                </span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {withSql.map((row) => {
                const tag = kindTag(row.kind);
                return (
                    <div
                        key={`sug-${row.id}`}
                        style={{
                            padding: 10, borderRadius: 10,
                            background: `${tag.color}0D`,
                            border: `1px solid ${tag.color}25`,
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 8, marginBottom: 6,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <Zap size={12} color={tag.color} />
                                <span style={{
                                    fontSize: 12, fontWeight: 600, color: THEME.textMain,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {row.indexName ?? row.tableLabel}
                                </span>
                            </div>
                            <StatusBadge label={tag.label} color={tag.color} />
                        </div>
                        <pre style={{
                            margin: 0, padding: '8px 10px',
                            borderRadius: 8,
                            background: THEME.surfaceRaised ?? THEME.surface,
                            border: `1px solid ${THEME.glassBorder}`,
                            fontSize: 11.5, lineHeight: 1.5,
                            color: THEME.textMain,
                            fontFamily: THEME.fontMono,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                            {row.suggestion}
                        </pre>
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(IndexesTabV2);
