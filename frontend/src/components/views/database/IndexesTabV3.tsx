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
    Activity,
    AlertOctagon,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Copy,
    Database,
    Download,
    FileCode2,
    GitBranch,
    Info,
    Lightbulb,
    Link2,
    RefreshCcw,
    Shield,
    Sparkles,
    Terminal,
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
    type AdvancedAnalysis,
    type RiskLevel,
    synthesizeRow,
    parseNLQuery,
    applyQuery,
    buildInsights,
    fmtBytes,
    kindMeta,
    sevRank,
    analyzeRow,
    buildApplyPlanSQL,
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
type PanelTab = 'analysis' | 'script';

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
    const [panelTab, setPanelTab] = useState<PanelTab>('analysis');
    const [applied, setApplied] = useState<Set<string>>(() => new Set());
    const [selected, setSelected] = useState<Set<string>>(() => new Set());
    const [toast, setToast] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const openPanel = useCallback((row: IndexRow, tab: PanelTab = 'analysis') => {
        setFocusRow(row);
        setPanelTab(tab);
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
    }, []);

    const handleApply = useCallback((row: IndexRow) => {
        setApplied((prev) => {
            const next = new Set(prev);
            next.add(row.id);
            return next;
        });
        if (row.suggestion) navigator.clipboard?.writeText(row.suggestion).catch(() => {});
        showToast(`Marked "${row.indexName ?? row.tableLabel}" applied · SQL copied to clipboard`);
    }, [showToast]);

    const handleToggleSelect = useCallback((row: IndexRow) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
            return next;
        });
    }, []);

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

                <ApplyPlanWidget
                    selectedCount={selected.size}
                    appliedCount={applied.size}
                    onDownload={() => {
                        const chosen = data.rows.filter((r) => selected.has(r.id));
                        const rows = chosen.length ? chosen : data.rows.filter((r) => r.score >= 0.6);
                        if (!rows.length) {
                            showToast('No rows selected — select findings or enable "Only actionable".');
                            return;
                        }
                        const sql = buildApplyPlanSQL(rows);
                        const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `index-fix-plan-${new Date().toISOString().slice(0, 10)}.sql`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                        showToast(`Downloaded ${rows.length}-fix plan.`);
                    }}
                    onClearSelection={() => setSelected(new Set())}
                />

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

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    padding: '8px 14px', borderRadius: 8, zIndex: 30,
                    background: THEME.surfaceRaised ?? THEME.surface,
                    border: `1px solid ${THEME.success}50`,
                    color: THEME.textMain, fontSize: 12, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
                }}>
                    <CheckCircle2 size={13} color={THEME.success} />
                    {toast}
                </div>
            )}

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
                onShowWhy={(ins) => openPanel(ins.row, 'analysis')}
                onShowScript={(ins) => openPanel(ins.row, 'script')}
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
                                    selected={selected.has(row.id)}
                                    applied={applied.has(row.id)}
                                    onOpen={() => openPanel(row, 'analysis')}
                                    onOpenScript={() => openPanel(row, 'script')}
                                    onToggleSelect={() => handleToggleSelect(row)}
                                />
                            ))}
                        </Group>
                    ))
                )}
            </section>

            {/* Why? side panel */}
            {focusRow && (
                <WhyPanel
                    row={focusRow}
                    allRows={data.rows}
                    tab={panelTab}
                    onTabChange={setPanelTab}
                    applied={applied.has(focusRow.id)}
                    onApply={() => handleApply(focusRow)}
                    onJumpTo={(id) => {
                        const r = data.rows.find((x) => x.id === id);
                        if (r) openPanel(r, 'analysis');
                    }}
                    onClose={() => setFocusRow(null)}
                />
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

const ROW_GRID = '6px 22px 90px minmax(220px, 2fr) 90px 60px 100px 70px 156px';

const TableHeader: React.FC = () => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: ROW_GRID,
        padding: '8px 12px',
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: THEME.textDim,
        background: THEME.surfaceRaised ?? THEME.surface,
        borderBottom: `1px solid ${THEME.glassBorder}`,
        gap: 10,
    }}>
        <span />
        <span title="Select for apply plan"><input type="checkbox" disabled aria-hidden style={{ opacity: 0.4 }} /></span>
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
    selected: boolean;
    applied: boolean;
    onOpen: () => void;
    onOpenScript: () => void;
    onToggleSelect: () => void;
}

const Row: React.FC<RowProps> = ({
    row, active, selected, applied,
    onOpen, onOpenScript, onToggleSelect,
}) => {
    const kColor = kindColor(row.kind);
    const sColor = sevColor(row.severity);
    return (
        <div
            role="row"
            onClick={onOpen}
            style={{
                display: 'grid',
                gridTemplateColumns: ROW_GRID,
                padding: '8px 12px',
                gap: 10,
                fontSize: 12,
                alignItems: 'center',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                background: applied
                    ? `${THEME.success}10`
                    : active
                        ? `${THEME.primary}14`
                        : 'transparent',
                opacity: applied ? 0.72 : 1,
                cursor: 'pointer',
            }}
        >
            <span style={{ width: 4, height: 22, borderRadius: 2, background: sColor }} aria-hidden />
            <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggleSelect}
                    disabled={applied}
                    title={applied ? 'Already marked applied' : 'Include in apply plan'}
                    style={{ cursor: applied ? 'default' : 'pointer' }}
                />
            </span>
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
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    textDecoration: applied ? 'line-through' : 'none',
                }}>
                    {row.indexName ?? row.tableLabel}
                    {applied && <CheckCircle2 size={11} color={THEME.success} />}
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
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenScript(); }}
                    title="View fix script"
                    style={rowBtn(THEME.primary)}
                >
                    <FileCode2 size={11} /> SQL
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
    onShowScript: (ins: Insight) => void;
}

const InsightsBanner: React.FC<InsightsBannerProps> = ({ insights, onShowWhy, onShowScript }) => {
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
                    <InsightRow
                        key={ins.id}
                        insight={ins}
                        rank={i + 1}
                        onShowWhy={() => onShowWhy(ins)}
                        onShowScript={() => onShowScript(ins)}
                    />
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

const InsightRow: React.FC<{
    insight: Insight;
    rank: number;
    onShowWhy: () => void;
    onShowScript: () => void;
}> = ({ insight, rank, onShowWhy, onShowScript }) => {
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
                <button type="button" onClick={onShowScript} style={rowBtn(THEME.primary)}>
                    <Zap size={10} /> {insight.actionLabel}
                </button>
            </div>
        </div>
    );
};

interface WhyPanelProps {
    row: IndexRow;
    allRows: IndexRow[];
    tab: PanelTab;
    onTabChange: (t: PanelTab) => void;
    applied: boolean;
    onApply: () => void;
    onJumpTo: (id: string) => void;
    onClose: () => void;
}

const WhyPanel: React.FC<WhyPanelProps> = ({
    row, allRows, tab, onTabChange, applied, onApply, onJumpTo, onClose,
}) => {
    const c = kindColor(row.kind);
    const analysis = useMemo(() => analyzeRow(row, allRows), [row, allRows]);
    const relatedRows = useMemo(
        () => analysis.correlation.relatedIds
            .map((id) => allRows.find((r) => r.id === id))
            .filter((x): x is IndexRow => !!x),
        [analysis.correlation.relatedIds, allRows],
    );
    const applyAfterRows = useMemo(
        () => analysis.dependencies.applyAfter
            .map((id) => allRows.find((r) => r.id === id))
            .filter((x): x is IndexRow => !!x),
        [analysis.dependencies.applyAfter, allRows],
    );
    const conflictRows = useMemo(
        () => analysis.dependencies.conflictsWith
            .map((id) => allRows.find((r) => r.id === id))
            .filter((x): x is IndexRow => !!x),
        [analysis.dependencies.conflictsWith, allRows],
    );
    const batchRows = useMemo(
        () => analysis.dependencies.batchWith
            .map((id) => allRows.find((r) => r.id === id))
            .filter((x): x is IndexRow => !!x),
        [analysis.dependencies.batchWith, allRows],
    );

    return (
        <div
            role="dialog"
            aria-label="AI analysis"
            style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 100vw)',
                background: THEME.surface, borderLeft: `1px solid ${THEME.glassBorder}`,
                boxShadow: '-8px 0 24px rgba(0,0,0,0.20)',
                display: 'flex', flexDirection: 'column',
                zIndex: 20,
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
            }}>
                <Sparkles size={15} color={c} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                        AI analysis
                    </span>
                    <span style={{
                        fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: 340,
                    }}>
                        {row.indexName ?? row.tableLabel}
                    </span>
                </div>
                <PriorityBadge score={analysis.priorityScore} />
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

            {/* Tabs */}
            <div style={{
                display: 'flex', alignItems: 'stretch', gap: 0,
                padding: '0 12px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                background: THEME.surfaceRaised ?? THEME.surface,
            }}>
                <PanelTabBtn
                    active={tab === 'analysis'}
                    onClick={() => onTabChange('analysis')}
                    icon={<Activity size={12} />}
                    label="Analysis"
                />
                <PanelTabBtn
                    active={tab === 'script'}
                    onClick={() => onTabChange('script')}
                    icon={<Terminal size={12} />}
                    label="Fix script"
                />
                <span style={{
                    marginLeft: 'auto', alignSelf: 'center',
                    fontSize: 10.5, color: THEME.textDim,
                    fontFamily: THEME.fontMono,
                }}>
                    ETA: {analysis.fixScript.estimatedDuration}
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
                {tab === 'analysis' ? (
                    <AnalysisBody
                        row={row}
                        analysis={analysis}
                        relatedRows={relatedRows}
                        onJumpTo={onJumpTo}
                    />
                ) : (
                    <ScriptBody
                        row={row}
                        analysis={analysis}
                        applied={applied}
                        onApply={onApply}
                        applyAfterRows={applyAfterRows}
                        conflictRows={conflictRows}
                        batchRows={batchRows}
                        onJumpTo={onJumpTo}
                    />
                )}
            </div>
        </div>
    );
};

/* ── Panel sub-components ─────────────────────────────────────────────── */

const PanelTabBtn: React.FC<{
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}> = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: '10px 12px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: active ? THEME.primary : THEME.textMuted,
            fontSize: 12, fontWeight: 700,
            borderBottom: `2px solid ${active ? THEME.primary : 'transparent'}`,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: -1,
        }}
    >
        {icon} {label}
    </button>
);

const PriorityBadge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 70 ? THEME.danger : score >= 45 ? THEME.warning : THEME.success;
    const label = score >= 70 ? 'High priority' : score >= 45 ? 'Medium' : 'Low';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 8px', borderRadius: 10,
            background: `${color}15`, color, border: `1px solid ${color}40`,
            fontSize: 10.5, fontWeight: 700, fontFamily: THEME.fontMono,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {score}/100 · {label}
        </span>
    );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div style={{
        fontSize: 10.5, fontWeight: 700, color: THEME.textDim,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 8, marginTop: 16,
        display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
        {icon} {label}
    </div>
);

const AnalysisBody: React.FC<{
    row: IndexRow;
    analysis: AdvancedAnalysis;
    relatedRows: IndexRow[];
    onJumpTo: (id: string) => void;
}> = ({ row, analysis, relatedRows, onJumpTo }) => {
    const c = kindColor(row.kind);
    return (
        <>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 10 }}>
                <span style={{ color: c, fontWeight: 700 }}>{kindMeta[row.kind].label}</span>
                {' · '}<span style={{ color: sevColor(row.severity), fontWeight: 600 }}>{row.severity} severity</span>
                {' · '}<span style={{ fontFamily: THEME.fontMono }}>{row.size ?? fmtBytes(row.sizeBytes)}</span>
            </div>

            <SectionHeader icon={<Lightbulb size={11} />} label="Root cause" />
            <p style={{
                fontSize: 13, lineHeight: 1.55, color: THEME.textMain,
                margin: 0,
            }}>
                {analysis.rootCause}
            </p>

            <SectionHeader icon={<Link2 size={11} />} label="Correlation" />
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: '0 0 8px' }}>
                {analysis.correlation.note}
            </p>
            {relatedRows.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {relatedRows.slice(0, 6).map((rr) => (
                        <button
                            key={rr.id}
                            type="button"
                            onClick={() => onJumpTo(rr.id)}
                            style={{
                                padding: '6px 8px', borderRadius: 6,
                                border: `1px solid ${THEME.glassBorder}`,
                                background: THEME.surfaceRaised ?? THEME.surface,
                                color: THEME.textMain, cursor: 'pointer',
                                fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6,
                                textAlign: 'left',
                            }}
                        >
                            <span style={{
                                padding: '1px 5px', borderRadius: 3,
                                background: `${kindColor(rr.kind)}18`,
                                color: kindColor(rr.kind),
                                fontSize: 9.5, fontWeight: 700, fontFamily: THEME.fontMono,
                            }}>
                                {kindMeta[rr.kind].short}
                            </span>
                            <span style={{
                                fontFamily: THEME.fontMono,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {rr.indexName ?? rr.tableLabel}
                            </span>
                            <span style={{ marginLeft: 'auto', color: THEME.textDim, fontSize: 10.5 }}>
                                {rr.size ?? fmtBytes(rr.sizeBytes)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <SectionHeader icon={<TrendingUp size={11} />} label="Cost / benefit" />
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
                <CbCell
                    label="Latency saved"
                    value={`${analysis.costBenefit.msSavedPerQuery.toFixed(1)} ms`}
                    sub="per query (p50 est)"
                    color={THEME.success}
                />
                <CbCell
                    label="QPS headroom"
                    value={`+${analysis.costBenefit.qpsHeadroomPct.toFixed(0)}%`}
                    sub="on this table"
                    color={THEME.info}
                />
                <CbCell
                    label={analysis.costBenefit.gbReclaimed >= 0 ? 'Disk reclaimed' : 'Disk needed'}
                    value={`${analysis.costBenefit.gbReclaimed.toFixed(2)} GB`}
                    sub={analysis.costBenefit.gbReclaimed >= 0 ? 'after fix' : 'for new index'}
                    color={analysis.costBenefit.gbReclaimed >= 0 ? THEME.success : THEME.warning}
                />
                <CbCell
                    label="Monthly savings"
                    value={`$${analysis.costBenefit.monthlyUsdSaved.toFixed(2)}`}
                    sub={`${analysis.costBenefit.writesPerSecSpared.toFixed(1)} writes/s spared`}
                    color={THEME.primary}
                />
            </div>

            <SectionHeader icon={<Shield size={11} />} label="Risk & safety" />
            <RiskBlock analysis={analysis} />

            <SectionHeader icon={<Info size={11} />} label="Signals" />
            <table style={{ width: '100%', fontSize: 11.5, fontFamily: THEME.fontMono }}>
                <tbody>
                    <SignalRow label="Confidence"  value={`${Math.round(row.confidence * 100)}%`} />
                    <SignalRow label="Impact"      value={`${Math.round(row.impact * 100)}%`} />
                    <SignalRow label="Effort"      value={`${Math.round(row.effort * 100)}%`} />
                    <SignalRow label="Score"       value={`${row.score.toFixed(2)}`} />
                    {row.kind === 'missing'   && <SignalRow label="Seq scans"   value={fmtNum(row.seqScan)} />}
                    {row.kind === 'unused'    && <SignalRow label="Idx scans"   value={fmtNum(row.scans)} />}
                    {row.kind === 'duplicate' && <SignalRow label="Shadowed by" value={row.shadowedBy ?? '—'} />}
                    {row.kind === 'bloat'     && <SignalRow label="Bloat %"     value={`${row.bloatPct.toFixed(1)}%`} />}
                </tbody>
            </table>
        </>
    );
};

const CbCell: React.FC<{ label: string; value: string; sub: string; color: string }> = ({
    label, value, sub, color,
}) => (
    <div style={{
        padding: '10px 12px', borderRadius: 8,
        background: `${color}0C`, border: `1px solid ${color}30`,
    }}>
        <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: THEME.textDim, fontWeight: 700,
        }}>
            {label}
        </div>
        <div style={{
            fontSize: 17, fontFamily: THEME.fontMono, fontWeight: 700,
            color, marginTop: 2,
        }}>
            {value}
        </div>
        <div style={{ fontSize: 10.5, color: THEME.textMuted }}>{sub}</div>
    </div>
);

const RiskBlock: React.FC<{ analysis: AdvancedAnalysis }> = ({ analysis }) => {
    const { risk } = analysis;
    const color = riskColor(risk.level);
    return (
        <div style={{
            padding: 12, borderRadius: 8,
            background: `${color}0C`,
            border: `1px solid ${color}30`,
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 8,
            }}>
                <span style={{
                    padding: '2px 8px', borderRadius: 10,
                    background: color, color: '#fff',
                    fontSize: 10.5, fontWeight: 700, fontFamily: THEME.fontMono,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                    {risk.level === 'risky' ? <AlertOctagon size={10} /> :
                     risk.level === 'review' ? <AlertTriangle size={10} /> :
                     <Shield size={10} />}
                    {risk.level}
                </span>
                {risk.offHoursOnly && (
                    <span style={{
                        fontSize: 10.5, color: THEME.warning, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                        <Clock size={10} /> off-hours recommended
                    </span>
                )}
            </div>
            <div style={{ display: 'grid', gap: 4, fontSize: 12, color: THEME.textMain }}>
                <RiskLine label="Lock impact"     value={risk.lockImpact} />
                <RiskLine label="Replication"     value={risk.replicationRisk} />
                <RiskLine label="Rollback"        value={risk.rollbackPlan} />
            </div>
            {risk.safetyChecks.length > 0 && (
                <>
                    <div style={{
                        fontSize: 10.5, fontWeight: 700, color: THEME.textDim,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginTop: 10, marginBottom: 4,
                    }}>
                        Safety checks
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: THEME.textMain }}>
                        {risk.safetyChecks.map((s, i) => (
                            <li key={i} style={{ marginBottom: 2 }}>{s}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

const RiskLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
            fontSize: 10.5, fontWeight: 700, color: THEME.textDim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            minWidth: 88,
        }}>
            {label}
        </span>
        <span style={{ flex: 1 }}>{value}</span>
    </div>
);

const ScriptBody: React.FC<{
    row: IndexRow;
    analysis: AdvancedAnalysis;
    applied: boolean;
    onApply: () => void;
    applyAfterRows: IndexRow[];
    conflictRows: IndexRow[];
    batchRows: IndexRow[];
    onJumpTo: (id: string) => void;
}> = ({ row, analysis, applied, onApply, applyAfterRows, conflictRows, batchRows, onJumpTo }) => {
    const copy = (s: string, label: string) => () => {
        navigator.clipboard?.writeText(s).catch(() => {});
        // non-disruptive: no toast here; parent handles apply toast.
        // eslint-disable-next-line no-console
        console.log(`Copied ${label}`);
    };

    const hasDeps = applyAfterRows.length + conflictRows.length + batchRows.length > 0;

    return (
        <>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11.5, color: THEME.textMuted, marginBottom: 10,
                flexWrap: 'wrap',
            }}>
                <span>
                    <code style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                        {row.indexName ?? row.tableLabel}
                    </code>
                </span>
                <span>·</span>
                <span>{kindMeta[row.kind].label}</span>
                <span>·</span>
                <span>ETA {analysis.fixScript.estimatedDuration}</span>
            </div>

            {hasDeps && (
                <>
                    <SectionHeader icon={<GitBranch size={11} />} label="Dependencies & order" />
                    {analysis.dependencies.note && (
                        <p style={{ fontSize: 12, color: THEME.textMuted, margin: '0 0 8px' }}>
                            {analysis.dependencies.note}
                        </p>
                    )}
                    {applyAfterRows.length > 0 && (
                        <DepList
                            label="Apply after"
                            tone={THEME.warning}
                            rows={applyAfterRows}
                            onJumpTo={onJumpTo}
                        />
                    )}
                    {conflictRows.length > 0 && (
                        <DepList
                            label="Conflicts with"
                            tone={THEME.danger}
                            rows={conflictRows}
                            onJumpTo={onJumpTo}
                        />
                    )}
                    {batchRows.length > 0 && (
                        <DepList
                            label="Batch with"
                            tone={THEME.info}
                            rows={batchRows}
                            onJumpTo={onJumpTo}
                        />
                    )}
                </>
            )}

            <SectionHeader icon={<Shield size={11} />} label="Pre-flight checks" />
            <CodeBlock
                code={analysis.fixScript.preFlight}
                onCopy={copy(analysis.fixScript.preFlight, 'pre-flight')}
                tone={THEME.info}
            />

            <SectionHeader icon={<Zap size={11} />} label="Apply" />
            <CodeBlock
                code={analysis.fixScript.sql}
                onCopy={copy(analysis.fixScript.sql, 'apply')}
                tone={THEME.primary}
            />

            <SectionHeader icon={<RefreshCcw size={11} />} label="Rollback" />
            <CodeBlock
                code={analysis.fixScript.rollback}
                onCopy={copy(analysis.fixScript.rollback, 'rollback')}
                tone={THEME.warning}
            />

            <div style={{
                marginTop: 16, padding: 12, borderRadius: 8,
                background: applied ? `${THEME.success}10` : THEME.surfaceRaised ?? THEME.surface,
                border: `1px solid ${applied ? THEME.success : THEME.glassBorder}60`,
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
                {applied ? (
                    <>
                        <CheckCircle2 size={16} color={THEME.success} />
                        <span style={{ fontSize: 12, color: THEME.textMain, fontWeight: 600 }}>
                            Marked applied. Execute the copied SQL in your own console.
                        </span>
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: 12, color: THEME.textMain, flex: 1, minWidth: 200 }}>
                            Simulated apply: copies Apply SQL and marks this finding as done.
                            Nothing is executed on your database.
                        </span>
                        <button
                            type="button"
                            onClick={onApply}
                            style={{
                                padding: '8px 14px', borderRadius: 6,
                                border: `1px solid ${THEME.primary}`,
                                background: THEME.primary, color: '#fff',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <Zap size={12} /> Simulated apply
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

const DepList: React.FC<{
    label: string;
    tone: string;
    rows: IndexRow[];
    onJumpTo: (id: string) => void;
}> = ({ label, tone, rows, onJumpTo }) => (
    <div style={{ marginBottom: 8 }}>
        <div style={{
            fontSize: 10.5, fontWeight: 700, color: tone,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 4,
        }}>
            {label}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {rows.map((rr) => (
                <button
                    key={rr.id}
                    type="button"
                    onClick={() => onJumpTo(rr.id)}
                    style={{
                        padding: '3px 8px', borderRadius: 10,
                        border: `1px solid ${tone}40`,
                        background: `${tone}10`, color: tone,
                        fontSize: 10.5, fontFamily: THEME.fontMono, fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {kindMeta[rr.kind].short} · {rr.indexName ?? rr.tableLabel}
                </button>
            ))}
        </div>
    </div>
);

const CodeBlock: React.FC<{ code: string; onCopy: () => void; tone: string }> = ({
    code, onCopy, tone,
}) => (
    <div style={{ position: 'relative' }}>
        <pre style={{
            margin: 0, padding: '10px 12px', borderRadius: 6,
            background: THEME.surfaceRaised ?? THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderLeft: `3px solid ${tone}`,
            fontSize: 11.5, fontFamily: THEME.fontMono,
            color: THEME.textMain, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            overflowX: 'auto',
        }}>
            {code}
        </pre>
        <button
            type="button"
            onClick={onCopy}
            title="Copy"
            style={{
                position: 'absolute', top: 6, right: 6,
                padding: '3px 8px', borderRadius: 4,
                border: `1px solid ${tone}40`,
                background: `${tone}15`, color: tone,
                fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontFamily: THEME.fontMono,
            }}
        >
            <Copy size={10} /> copy
        </button>
    </div>
);

const ApplyPlanWidget: React.FC<{
    selectedCount: number;
    appliedCount: number;
    onDownload: () => void;
    onClearSelection: () => void;
}> = ({ selectedCount, appliedCount, onDownload, onClearSelection }) => {
    const active = selectedCount > 0;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 8px', borderRadius: 8,
            border: `1px solid ${active ? THEME.primary : THEME.glassBorder}`,
            background: active ? `${THEME.primary}10` : THEME.surface,
            fontSize: 11, fontFamily: THEME.fontMono,
            color: active ? THEME.primary : THEME.textMuted,
        }}>
            <span style={{ fontWeight: 700 }}>
                {active ? `${selectedCount} selected` : 'Apply plan'}
            </span>
            {appliedCount > 0 && (
                <span style={{ color: THEME.success }}>
                    · {appliedCount} applied
                </span>
            )}
            {active && (
                <button
                    type="button"
                    onClick={onClearSelection}
                    title="Clear selection"
                    style={{
                        padding: '2px 5px', borderRadius: 4,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: 'transparent', color: THEME.textMuted,
                        cursor: 'pointer', fontSize: 10,
                    }}
                >
                    <X size={10} />
                </button>
            )}
            <button
                type="button"
                onClick={onDownload}
                title={active ? 'Download selected as .sql' : 'Download actionable findings as .sql'}
                style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: THEME.primary, color: '#fff',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
            >
                <Download size={11} /> .sql
            </button>
        </div>
    );
};

const riskColor = (level: RiskLevel): string =>
    level === 'risky' ? THEME.danger :
    level === 'review' ? THEME.warning :
    THEME.success;

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
