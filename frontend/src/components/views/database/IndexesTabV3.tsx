/**
 * IndexesTabV3.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Operator-grade + AI-native index inspector.
 *
 * Differences vs. V2:
 *   • Dense Datadog-style metric strip (8 cells, one line).
 *   • AI Insights banner — top 5 ranked actions with confidence %, "why?"
 *     explanations, one-click Apply buttons. Rule-based today; designed to
 *     swap in a real LLM call later.
 *   • Natural-language search ("⌘K" style): parses phrases like
 *     "large unused on events" or "high severity duplicates" client-side.
 *   • Dense table with severity heat bar, kind tag, size, usage sparkline
 *     per row, last-used, confidence %, quick-actions. Keyboard: j/k/Enter.
 *   • "Why?" side panel showing the synthesized reasoning per row.
 *
 * Real API endpoints (unchanged): /api/indexes/{health,missing,unused,
 * duplicates,bloat}. No backend changes required.
 * ──────────────────────────────────────────────────────────────────────── */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    AlertTriangle,
    Copy,
    Database,
    Info,
    Lightbulb,
    RefreshCcw,
    Sparkles,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';

import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { fmtNum } from '../../../lib/utils';
import { TremorStyles } from '../../ui/tremor';

import {
    EMPTY_HEALTH,
    type HealthSummary,
    type IndexRow,
    type IndexKind,
    type Severity,
    type Insight,
    synthesizeRow,
    parseNLQuery,
    applyQuery,
    buildInsights,
    fmtBytes,
    kindMeta,
    sevRank,
} from './_indexesV3Helpers';

/* ─────────────────────────────────────────────────────────────────────────
 * Data hook
 * ────────────────────────────────────────────────────────────────────── */

interface IndexData {
    health: HealthSummary;
    rows: IndexRow[];
    lastLoadedAt: Date | null;
}

function useIndexData() {
    const [data, setData] = useState<IndexData>({
        health: EMPTY_HEALTH, rows: [], lastLoadedAt: null,
    });
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

            const mk = (kind: IndexKind, arr: unknown): IndexRow[] =>
                Array.isArray(arr)
                    ? (arr as Record<string, unknown>[]).map((r, i) => synthesizeRow(kind, r, i))
                    : [];

            const h = (health as Partial<HealthSummary>) || {};
            setData({
                health: {
                    hitRatio: Number(h.hitRatio ?? 0),
                    totalIndexes: Number(h.totalIndexes ?? 0),
                    totalSize: String(h.totalSize ?? '—'),
                    totalBytes: Number(h.totalBytes ?? 0),
                    criticalCount: Number(h.criticalCount ?? 0),
                    seqScanRate: Number(h.seqScanRate ?? 0),
                },
                rows: [
                    ...mk('missing', missing),
                    ...mk('unused', unused),
                    ...mk('duplicate', dupes),
                    ...mk('bloat', bloat),
                ],
                lastLoadedAt: new Date(),
            });
        } catch (e) {
            setError((e as Error).message || 'Failed to load indexes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { data, loading, refreshing, error, reload: () => load(true) };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Severity → colour
 * ────────────────────────────────────────────────────────────────────── */

const sevColor = (s: Severity): string =>
    s === 'high' ? THEME.danger : s === 'med' ? THEME.warning : THEME.info;

const kindColor = (k: IndexKind): string => {
    switch (k) {
        case 'missing':   return THEME.warning;
        case 'unused':    return THEME.textMuted;
        case 'duplicate': return THEME.info;
        case 'bloat':     return THEME.danger;
    }
};

/* ─────────────────────────────────────────────────────────────────────────
 * Inline sparkline — 48 × 16, dense, no axes.
 * ────────────────────────────────────────────────────────────────────── */

const RowSpark: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
    const w = 48;
    const h = 16;
    const max = Math.max(...values, 1);
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 1) - 1).toFixed(1)}`);
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={1.2}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Metric strip cell
 * ────────────────────────────────────────────────────────────────────── */

const MetricCell: React.FC<{
    label: string;
    value: string;
    sub?: string;
    color: string;
    spark?: number[];
    trend?: 'up' | 'down' | 'flat';
}> = ({ label, value, sub, color, spark, trend }) => (
    <div
        style={{
            flex: '1 1 0',
            minWidth: 110,
            padding: '10px 12px',
            borderRight: `1px solid ${THEME.glassBorder}`,
            display: 'flex', flexDirection: 'column', gap: 4,
        }}
    >
        <div style={{
            fontSize: 10, fontWeight: 700, color: THEME.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', gap: 4,
        }}>
            {label}
            {trend === 'up' && <TrendingUp size={10} color={THEME.danger} />}
            {trend === 'down' && <TrendingUp size={10} color={THEME.success} style={{ transform: 'scaleY(-1)' }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
                fontSize: 20, fontWeight: 700, color: THEME.textMain,
                fontFamily: THEME.fontMono, letterSpacing: '-0.02em', lineHeight: 1,
            }}>
                {value}
            </span>
            {sub && (
                <span style={{ fontSize: 10.5, color: THEME.textDim, fontWeight: 500 }}>
                    {sub}
                </span>
            )}
        </div>
        <div style={{ height: 16, marginTop: 2 }}>
            {spark ? <RowSpark values={spark} color={color} /> : null}
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

type GroupKey = 'severity' | 'kind' | 'table' | 'none';
type SortKey = 'score' | 'size' | 'confidence' | 'kind';

const IndexesTabV3: React.FC = () => {
    useAdaptiveTheme();
    const { data, loading, refreshing, error, reload } = useIndexData();
    useGlobalRefresh(useCallback(() => reload(), [reload]));

    const [search, setSearch] = useState('');
    const [groupBy, setGroupBy] = useState<GroupKey>('severity');
    const [sortBy, setSortBy] = useState<SortKey>('score');
    const [onlyActionable, setOnlyActionable] = useState(false);
    const [focusRow, setFocusRow] = useState<IndexRow | null>(null);
    const [focusIdx, setFocusIdx] = useState(0);
    const searchRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcuts: ⌘/Ctrl-K focuses search, j/k/Enter navigate.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            const inInput = t && ['INPUT', 'TEXTAREA'].includes(t.tagName);
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
                return;
            }
            if (inInput) return;
            if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); return; }
            if (e.key === 'j') setFocusIdx((i) => i + 1);
            if (e.key === 'k') setFocusIdx((i) => Math.max(0, i - 1));
            if (e.key === 'Escape') setFocusRow(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const parsed = useMemo(() => parseNLQuery(search), [search]);

    const filtered = useMemo(() => {
        let out = applyQuery(data.rows, parsed);
        if (onlyActionable) out = out.filter((r) => r.score >= 0.6);
        out = [...out].sort((a, b) => {
            switch (sortBy) {
                case 'score':      return b.score - a.score;
                case 'size':       return b.sizeBytes - a.sizeBytes;
                case 'confidence': return b.confidence - a.confidence;
                case 'kind':       return a.kind.localeCompare(b.kind);
            }
        });
        return out;
    }, [data.rows, parsed, onlyActionable, sortBy]);

    const insights = useMemo(() => buildInsights(filtered.length ? filtered : data.rows, 5), [filtered, data.rows]);

    const counts = useMemo(() => {
        const c = { missing: 0, unused: 0, duplicate: 0, bloat: 0, actionable: 0 };
        data.rows.forEach((r) => {
            c[r.kind] += 1;
            if (r.score >= 0.6) c.actionable += 1;
        });
        return c;
    }, [data.rows]);

    const grouped = useMemo(() => groupRows(filtered, groupBy), [filtered, groupBy]);

    // Keep focus within bounds.
    const flatList = useMemo(() => grouped.flatMap((g) => g.rows), [grouped]);
    const safeFocus = Math.min(focusIdx, Math.max(0, flatList.length - 1));

    /* ── Skeleton ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
                <TremorStyles />
                <Skeleton h={42} />
                <Skeleton h={72} />
                <Skeleton h={120} />
                <Skeleton h={360} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* Top bar — title + NL search + status + refresh */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '10px 12px', borderRadius: 10,
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={14} color={THEME.primary} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>
                        Indexes
                    </span>
                    <span style={{ fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                        {data.rows.length} findings
                    </span>
                </div>

                <label style={{
                    display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 320px',
                    padding: '6px 10px', borderRadius: 8,
                    border: `1px solid ${THEME.glassBorder}`,
                    background: THEME.surfaceRaised ?? THEME.surface,
                    minWidth: 220,
                }}>
                    <Sparkles size={13} color={THEME.primary} />
                    <input
                        ref={searchRef}
                        type="search"
                        placeholder='Ask: "large unused on events", "critical missing", "reindex"'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1, minWidth: 0, border: 'none', outline: 'none',
                            background: 'transparent', color: THEME.textMain,
                            fontSize: 12.5,
                        }}
                    />
                    <kbd style={{
                        padding: '1px 6px', borderRadius: 4,
                        border: `1px solid ${THEME.glassBorder}`,
                        fontSize: 10, fontFamily: THEME.fontMono, color: THEME.textDim,
                    }}>
                        ⌘K
                    </kbd>
                </label>

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono,
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: THEME.success, boxShadow: `0 0 8px ${THEME.success}`,
                    }} />
                    live • {data.lastLoadedAt?.toLocaleTimeString() ?? '—'}
                </div>

                <button
                    type="button"
                    onClick={reload}
                    disabled={refreshing}
                    aria-label="Refresh"
                    style={{
                        padding: 7, borderRadius: 8,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: THEME.surface, color: THEME.textMuted,
                        cursor: refreshing ? 'progress' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <RefreshCcw size={13} className={refreshing ? 'ov-spin' : undefined} />
                </button>
            </header>

            {error && (
                <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: `${THEME.danger}10`,
                    border: `1px solid ${THEME.danger}30`,
                    color: THEME.danger, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <AlertTriangle size={13} /> {error}
                </div>
            )}

            {/* Metric strip */}
            <section style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            }}>
                <MetricCell
                    label="Total indexes"
                    value={fmtNum(data.health.totalIndexes)}
                    sub={data.health.totalSize}
                    color={THEME.primary}
                />
                <MetricCell
                    label="Hit ratio"
                    value={`${data.health.hitRatio.toFixed(1)}%`}
                    sub={data.health.hitRatio >= 99 ? 'excellent' : 'watch'}
                    color={data.health.hitRatio >= 99 ? THEME.success : THEME.warning}
                />
                <MetricCell
                    label="Seq-scan rate"
                    value={`${data.health.seqScanRate.toFixed(1)}%`}
                    sub="of total reads"
                    color={data.health.seqScanRate > 10 ? THEME.danger : THEME.success}
                />
                <MetricCell
                    label="Missing"
                    value={fmtNum(counts.missing)}
                    sub="tables lacking"
                    color={THEME.warning}
                    trend={counts.missing > 0 ? 'up' : 'flat'}
                />
                <MetricCell
                    label="Unused"
                    value={fmtNum(counts.unused)}
                    sub="drop candidates"
                    color={THEME.textMuted}
                />
                <MetricCell
                    label="Duplicates"
                    value={fmtNum(counts.duplicate)}
                    sub="redundant"
                    color={THEME.info}
                />
                <MetricCell
                    label="Bloat"
                    value={fmtNum(counts.bloat)}
                    sub="need reindex"
                    color={THEME.danger}
                />
                <MetricCell
                    label="Actionable"
                    value={fmtNum(counts.actionable)}
                    sub="score ≥ 0.6"
                    color={THEME.success}
                />
            </section>

            {/* AI Insights banner */}
            <InsightsBanner
                insights={insights}
                onShowWhy={(ins) => setFocusRow(ins.row)}
            />

            {/* Filter bar */}
            <section style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                padding: '8px 12px', borderRadius: 10,
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                fontSize: 12,
            }}>
                <Segmented
                    label="Group"
                    value={groupBy}
                    onChange={(v) => setGroupBy(v as GroupKey)}
                    options={[
                        { v: 'severity', l: 'Severity' },
                        { v: 'kind',     l: 'Type' },
                        { v: 'table',    l: 'Table' },
                        { v: 'none',     l: 'None' },
                    ]}
                />
                <Segmented
                    label="Sort"
                    value={sortBy}
                    onChange={(v) => setSortBy(v as SortKey)}
                    options={[
                        { v: 'score',      l: 'AI score' },
                        { v: 'size',       l: 'Size' },
                        { v: 'confidence', l: 'Confidence' },
                        { v: 'kind',       l: 'Type' },
                    ]}
                />
                <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginLeft: 'auto', color: THEME.textMuted, fontSize: 11.5, fontWeight: 600,
                }}>
                    <input
                        type="checkbox"
                        checked={onlyActionable}
                        onChange={(e) => setOnlyActionable(e.target.checked)}
                    />
                    Only actionable
                </label>
                <span style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                    {filtered.length} / {data.rows.length}
                </span>
            </section>

            {/* Main table */}
            <section style={{
                borderRadius: 10,
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                overflow: 'hidden',
            }}>
                <TableHeader />
                {grouped.length === 0 ? (
                    <EmptyRow />
                ) : (
                    grouped.map((g) => (
                        <Group key={g.key} title={g.title} count={g.rows.length} tone={g.tone}>
                            {g.rows.map((row) => (
                                <Row
                                    key={row.id}
                                    row={row}
                                    active={flatList[safeFocus]?.id === row.id}
                                    onOpen={() => setFocusRow(row)}
                                />
                            ))}
                        </Group>
                    ))
                )}
            </section>

            {/* Why? side panel */}
            {focusRow && (
                <WhyPanel row={focusRow} onClose={() => setFocusRow(null)} />
            )}

            {/* Footer */}
            <footer style={{
                fontSize: 10.5, color: THEME.textDim, margin: 0,
                display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Info size={11} />
                    Confidence & score synthesized from actual scan counts, row sizes,
                    and bloat ratios. AI summaries are rule-based; swap in an LLM
                    by wiring <code>buildInsights</code> to a /api/ai/insights endpoint.
                </span>
                <span>
                    <kbd style={kbdStyle}>⌘K</kbd> search • <kbd style={kbdStyle}>j</kbd>/<kbd style={kbdStyle}>k</kbd> nav • <kbd style={kbdStyle}>Enter</kbd> open
                </span>
            </footer>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Sub-components — kept close to the main component to avoid file sprawl.
 * ────────────────────────────────────────────────────────────────────── */

const kbdStyle: React.CSSProperties = {
    padding: '1px 5px', borderRadius: 4,
    border: `1px solid ${THEME.glassBorder}`,
    fontSize: 10, fontFamily: THEME.fontMono, color: THEME.textMuted,
};

const Skeleton: React.FC<{ h: number }> = ({ h }) => (
    <div style={{
        height: h, borderRadius: 10,
        background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
        opacity: 0.35, animation: 'tremorPulse 1.5s ease-in-out infinite',
    }} />
);

const EmptyRow: React.FC = () => (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: THEME.textMuted, fontSize: 12.5 }}>
        No findings match your filters.
    </div>
);

interface SegmentedProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { v: string; l: string }[];
}

const Segmented: React.FC<SegmentedProps> = ({ label, value, onChange, options }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
        </span>
        <div style={{
            display: 'inline-flex',
            borderRadius: 6, overflow: 'hidden',
            border: `1px solid ${THEME.glassBorder}`,
        }}>
            {options.map((opt) => {
                const active = opt.v === value;
                return (
                    <button
                        key={opt.v}
                        type="button"
                        onClick={() => onChange(opt.v)}
                        style={{
                            padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            border: 'none',
                            background: active ? `${THEME.primary}22` : 'transparent',
                            color: active ? THEME.primary : THEME.textMuted,
                        }}
                    >
                        {opt.l}
                    </button>
                );
            })}
        </div>
    </div>
);

const TableHeader: React.FC = () => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '6px 96px minmax(220px, 2fr) 90px 60px 100px 70px 120px',
        padding: '8px 12px',
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: THEME.textDim,
        background: THEME.surfaceRaised ?? THEME.surface,
        borderBottom: `1px solid ${THEME.glassBorder}`,
        gap: 10,
    }}>
        <span />
        <span>Type</span>
        <span>Target</span>
        <span>Size</span>
        <span>Usage</span>
        <span>Last used</span>
        <span>Conf.</span>
        <span>Actions</span>
    </div>
);

interface GroupProps {
    title: string;
    count: number;
    tone: string;
    children: React.ReactNode;
}

const Group: React.FC<GroupProps> = ({ title, count, tone, children }) => (
    <div>
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
            background: `${tone}0D`,
            borderBottom: `1px solid ${THEME.glassBorder}`,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: tone,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
            {title}
            <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: THEME.textDim,
                fontFamily: THEME.fontMono,
            }}>
                {count}
            </span>
        </div>
        {children}
    </div>
);

interface RowProps {
    row: IndexRow;
    active: boolean;
    onOpen: () => void;
}

const Row: React.FC<RowProps> = ({ row, active, onOpen }) => {
    const kColor = kindColor(row.kind);
    const sColor = sevColor(row.severity);
    return (
        <div
            role="row"
            onClick={onOpen}
            style={{
                display: 'grid',
                gridTemplateColumns: '6px 96px minmax(220px, 2fr) 90px 60px 100px 70px 120px',
                padding: '8px 12px',
                gap: 10,
                fontSize: 12,
                alignItems: 'center',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                background: active ? `${THEME.primary}14` : 'transparent',
                cursor: 'pointer',
            }}
        >
            <span style={{ width: 4, height: 22, borderRadius: 2, background: sColor }} aria-hidden />
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', borderRadius: 4,
                background: `${kColor}16`, color: kColor,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                fontFamily: THEME.fontMono,
                justifySelf: 'start',
            }}>
                {kindMeta[row.kind].short}
            </span>
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <span style={{
                    color: THEME.textMain, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {row.indexName ?? row.tableLabel}
                </span>
                <span style={{
                    color: THEME.textDim, fontSize: 10.5,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {row.indexName ? `on ${row.tableLabel} · ` : ''}{row.detail}
                </span>
            </span>
            <span style={{ color: THEME.textMain, fontFamily: THEME.fontMono, fontSize: 11.5 }}>
                {row.size ?? fmtBytes(row.sizeBytes)}
            </span>
            <RowSpark values={row.spark} color={kColor} />
            <span style={{ color: THEME.textMuted, fontFamily: THEME.fontMono, fontSize: 11 }}>
                {row.kind === 'unused' ? (row.scans ? `${row.scans} scans` : 'never') :
                 row.kind === 'missing' ? `${fmtNum(row.seqScan)} seq` :
                 row.kind === 'bloat' ? `${row.bloatPct.toFixed(0)}% bloat` :
                 '—'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ConfidenceRing pct={Math.round(row.confidence * 100)} />
            </span>
            <span style={{ display: 'flex', gap: 4 }}>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpen(); }}
                    style={rowBtn(kColor)}
                >
                    Why?
                </button>
                {row.suggestion && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard?.writeText(row.suggestion!).catch(() => {});
                        }}
                        title="Copy SQL"
                        style={rowBtn(THEME.textMuted)}
                    >
                        <Copy size={11} />
                    </button>
                )}
            </span>
        </div>
    );
};

const rowBtn = (color: string): React.CSSProperties => ({
    padding: '3px 8px', borderRadius: 4,
    border: `1px solid ${color}40`,
    background: `${color}10`, color,
    fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontFamily: THEME.fontMono,
});

const ConfidenceRing: React.FC<{ pct: number }> = ({ pct }) => {
    const color = pct >= 80 ? THEME.success : pct >= 60 ? THEME.warning : THEME.textMuted;
    const r = 8;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width={18} height={18} viewBox="0 0 20 20" aria-label={`Confidence ${pct}%`}>
                <circle cx={10} cy={10} r={r} fill="none" stroke={`${color}30`} strokeWidth={2} />
                <circle
                    cx={10} cy={10} r={r} fill="none" stroke={color} strokeWidth={2}
                    strokeDasharray={`${dash} ${c - dash}`}
                    strokeDashoffset={c / 4}
                    transform="rotate(-90 10 10)"
                    strokeLinecap="round"
                />
            </svg>
            <span style={{ fontSize: 10.5, fontFamily: THEME.fontMono, color }}>{pct}%</span>
        </span>
    );
};

interface InsightsBannerProps {
    insights: Insight[];
    onShowWhy: (ins: Insight) => void;
}

const InsightsBanner: React.FC<InsightsBannerProps> = ({ insights, onShowWhy }) => {
    const [expanded, setExpanded] = useState(false);
    if (insights.length === 0) return null;
    const shown = expanded ? insights : insights.slice(0, 3);
    return (
        <section style={{
            borderRadius: 10,
            background: `linear-gradient(135deg, ${THEME.primary}0B 0%, ${THEME.info}0B 100%)`,
            border: `1px solid ${THEME.primary}30`,
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 700, color: THEME.primary,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: `1px solid ${THEME.primary}20`,
            }}>
                <Sparkles size={13} />
                AI insights
                <span style={{ marginLeft: 'auto', color: THEME.textDim, fontWeight: 600 }}>
                    Ranked by estimated impact · rule-based today
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {shown.map((ins, i) => (
                    <InsightRow key={ins.id} insight={ins} rank={i + 1} onShowWhy={() => onShowWhy(ins)} />
                ))}
            </div>
            {insights.length > 3 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                        width: '100%', padding: 6, border: 'none', cursor: 'pointer',
                        background: 'transparent', color: THEME.primary,
                        fontSize: 11, fontWeight: 600,
                        borderTop: `1px solid ${THEME.primary}20`,
                    }}
                >
                    {expanded ? 'Show fewer' : `Show all ${insights.length}`}
                </button>
            )}
        </section>
    );
};

const InsightRow: React.FC<{ insight: Insight; rank: number; onShowWhy: () => void }> = ({ insight, rank, onShowWhy }) => {
    const c = kindColor(insight.row.kind);
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '28px 1fr auto auto',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderBottom: `1px solid ${THEME.primary}15`,
        }}>
            <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: c, color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: THEME.fontMono,
            }}>
                {rank}
            </span>
            <div style={{ minWidth: 0 }}>
                <div style={{
                    fontSize: 12.5, fontWeight: 600, color: THEME.textMain,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {insight.title}
                </div>
                <div style={{ fontSize: 11, color: THEME.textMuted }}>
                    {insight.impactLabel}
                </div>
            </div>
            <span style={{
                fontSize: 10.5, fontFamily: THEME.fontMono, color: THEME.textMuted,
                background: `${c}12`, padding: '2px 8px', borderRadius: 10,
                border: `1px solid ${c}30`,
            }}>
                {insight.confidencePct}% confident
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" onClick={onShowWhy} style={rowBtn(c)}>
                    <Lightbulb size={10} /> Why?
                </button>
                <button
                    type="button"
                    onClick={() => insight.row.suggestion && navigator.clipboard?.writeText(insight.row.suggestion).catch(() => {})}
                    style={rowBtn(THEME.primary)}
                >
                    <Zap size={10} /> {insight.actionLabel}
                </button>
            </div>
        </div>
    );
};

const WhyPanel: React.FC<{ row: IndexRow; onClose: () => void }> = ({ row, onClose }) => {
    const c = kindColor(row.kind);
    return (
        <div
            role="dialog"
            aria-label="Reasoning"
            style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 100vw)',
                background: THEME.surface, borderLeft: `1px solid ${THEME.glassBorder}`,
                boxShadow: '-8px 0 24px rgba(0,0,0,0.20)',
                display: 'flex', flexDirection: 'column',
                zIndex: 20,
            }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
            }}>
                <Lightbulb size={15} color={c} />
                <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                    Why this was flagged
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto', padding: 6, borderRadius: 6,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: 'transparent', color: THEME.textMuted, cursor: 'pointer',
                    }}
                >
                    <X size={13} />
                </button>
            </div>
            <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 8 }}>
                    <code style={{ fontFamily: THEME.fontMono }}>{row.indexName ?? row.tableLabel}</code>
                    {' '}· <span style={{ color: c, fontWeight: 600 }}>{kindMeta[row.kind].label}</span>
                </div>
                <p style={{
                    fontSize: 13, lineHeight: 1.55, color: THEME.textMain,
                    margin: '0 0 14px',
                }}>
                    {row.detail}
                </p>
                <div style={{
                    fontSize: 11, fontWeight: 700, color: THEME.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: 6,
                }}>
                    Signals
                </div>
                <table style={{ width: '100%', fontSize: 11.5, fontFamily: THEME.fontMono, marginBottom: 14 }}>
                    <tbody>
                        <SignalRow label="Confidence"  value={`${Math.round(row.confidence * 100)}%`} />
                        <SignalRow label="Impact"      value={`${Math.round(row.impact * 100)}%`} />
                        <SignalRow label="Effort"      value={`${Math.round(row.effort * 100)}%`} />
                        <SignalRow label="Score"       value={`${row.score.toFixed(2)}`} />
                        <SignalRow label="Size"        value={row.size ?? fmtBytes(row.sizeBytes)} />
                        {row.kind === 'missing'   && <SignalRow label="Seq scans"   value={fmtNum(row.seqScan)} />}
                        {row.kind === 'unused'    && <SignalRow label="Idx scans"   value={fmtNum(row.scans)} />}
                        {row.kind === 'duplicate' && <SignalRow label="Shadowed by" value={row.shadowedBy ?? '—'} />}
                        {row.kind === 'bloat'     && <SignalRow label="Bloat %"     value={`${row.bloatPct.toFixed(1)}%`} />}
                    </tbody>
                </table>
                {row.suggestion && (
                    <>
                        <div style={{
                            fontSize: 11, fontWeight: 700, color: THEME.textDim,
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                        }}>
                            Suggested SQL
                        </div>
                        <pre style={{
                            margin: 0, padding: 10, borderRadius: 6,
                            background: THEME.surfaceRaised ?? THEME.surface,
                            border: `1px solid ${THEME.glassBorder}`,
                            fontSize: 11.5, fontFamily: THEME.fontMono,
                            color: THEME.textMain, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                            {row.suggestion}
                        </pre>
                        <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(row.suggestion!).catch(() => {})}
                            style={{
                                marginTop: 8, padding: '6px 12px', borderRadius: 6,
                                border: `1px solid ${c}40`,
                                background: `${c}15`, color: c,
                                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <Copy size={12} /> Copy SQL
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const SignalRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <tr>
        <td style={{ padding: '2px 0', color: THEME.textMuted, width: '40%' }}>{label}</td>
        <td style={{ padding: '2px 0', color: THEME.textMain, textAlign: 'right' }}>{value}</td>
    </tr>
);

/* ─────────────────────────────────────────────────────────────────────────
 * Grouping
 * ────────────────────────────────────────────────────────────────────── */

interface RenderedGroup {
    key: string;
    title: string;
    tone: string;
    rows: IndexRow[];
}

function groupRows(rows: IndexRow[], by: GroupKey): RenderedGroup[] {
    if (by === 'none') {
        return [{ key: 'all', title: 'Findings', tone: THEME.primary, rows }];
    }
    const buckets = new Map<string, IndexRow[]>();
    for (const r of rows) {
        const k = by === 'severity' ? r.severity
               : by === 'kind'     ? r.kind
               : r.tableLabel;
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k)!.push(r);
    }
    const entries = Array.from(buckets.entries());
    if (by === 'severity') {
        entries.sort(([a], [b]) => sevRank(b as Severity) - sevRank(a as Severity));
        return entries.map(([k, rs]) => ({
            key: `sev-${k}`,
            title: ({ high: 'High severity', med: 'Medium', low: 'Low' } as const)[k as Severity],
            tone: sevColor(k as Severity),
            rows: rs,
        }));
    }
    if (by === 'kind') {
        entries.sort(([a], [b]) => a.localeCompare(b));
        return entries.map(([k, rs]) => ({
            key: `kind-${k}`,
            title: kindMeta[k as IndexKind].label,
            tone: kindColor(k as IndexKind),
            rows: rs,
        }));
    }
    // by table
    entries.sort(([, a], [, b]) => b.length - a.length);
    return entries.map(([k, rs]) => ({
        key: `tbl-${k}`,
        title: k,
        tone: THEME.primary,
        rows: rs,
    }));
}

export default React.memo(IndexesTabV3);
