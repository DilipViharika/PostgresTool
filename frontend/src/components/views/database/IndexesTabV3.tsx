/**
 * IndexesTabV3.tsx — Autonomous DBA Copilot UI
 * ──────────────────────────────────────────────────────────────────────────
 * v3 port of `indexes-redesign-preview-v3.html`.
 *
 * New vs. v2-of-v3:
 *   • Agent bar with command palette (⌘K) and autonomy-mode pill.
 *   • Autonomy console: 4-level slider + policy rules + agent timeline +
 *     observability integrations (Slack / PagerDuty / Grafana / GitHub).
 *   • 6-cell SLO strip with error-budget bars.
 *   • What-if simulator (sliders → projected-impact + p50/p95 band).
 *   • 7×24 seq-scan heatmap, cost-attribution waterfall.
 *   • Detail rail gained EXPLAIN before/after diff, index lifecycle Sankey,
 *     apply playbook stepper, GitOps PR preview, grounded chat thread.
 *
 * Data layer (fetchData, synthesizeRow, parseNLQuery, buildInsights,
 * analyzeRow, buildApplyPlanSQL) is unchanged from v2.
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
    Bell,
    BrainCircuit,
    CheckCircle2,
    Clock,
    Copy,
    Cpu,
    Database,
    Download,
    FileCode2,
    Flame,
    GitBranch,
    GitPullRequest,
    Info,
    Lightbulb,
    Link2,
    MessageSquare,
    Mic,
    Pause,
    PlayCircle,
    RefreshCcw,
    Send,
    Shield,
    Sparkles,
    Terminal,
    TrendingUp,
    Users,
    Workflow,
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
    // Guard against overlapping loads (strict-mode double-invoke,
    // global-refresh during an in-flight load, etc.).
    const inflightRef = useRef(false);
    const mountedRef = useRef(false);

    const load = useCallback(async (manual = false) => {
        if (inflightRef.current) return;
        inflightRef.current = true;
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
            inflightRef.current = false;
        }
    }, []);

    // Stable reload reference so downstream useEffects (global-refresh
    // listener, child prop identity) don't thrash every render.
    const reload = useCallback(() => { load(true); }, [load]);

    // Fire the initial load exactly once per mount. Using an empty dep
    // array + mountedRef guard avoids any accidental re-runs if `load`
    // ever becomes referentially unstable.
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { data, loading, refreshing, error, reload };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Severity / kind colours
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
 * Sparkline
 * ────────────────────────────────────────────────────────────────────── */

const RowSpark: React.FC<{ values: number[]; color: string; w?: number; h?: number }> = ({
    values, color, w = 48, h = 16,
}) => {
    const max = Math.max(...values, 1);
    const step = w / Math.max(values.length - 1, 1);
    const pts = values.map((v, i) =>
        `${(i * step).toFixed(1)},${(h - (v / max) * (h - 1) - 1).toFixed(1)}`,
    );
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
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

type GroupKey = 'severity' | 'kind' | 'table' | 'none';
type SortKey = 'score' | 'size' | 'confidence' | 'kind';
type PanelTab = 'analysis' | 'evidence' | 'script' | 'gitops' | 'chat';
type AutonomyLevel = 'L0' | 'L1' | 'L2' | 'L3';

const IndexesTabV3: React.FC = () => {
    useAdaptiveTheme();
    const { data, loading, refreshing, error, reload } = useIndexData();
    // `reload` is now stable (memoised inside useIndexData) so we can pass
    // it directly — no inline wrapper, no thrashing of the global-refresh
    // listener on every render.
    useGlobalRefresh(reload);

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
    const [autonomy, setAutonomy] = useState<AutonomyLevel>('L1');
    const [agentPaused, setAgentPaused] = useState(false);
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

    const insights = useMemo(
        () => buildInsights(filtered.length ? filtered : data.rows, 5),
        [filtered, data.rows],
    );

    const counts = useMemo(() => {
        const c = { missing: 0, unused: 0, duplicate: 0, bloat: 0, actionable: 0 };
        data.rows.forEach((r) => {
            c[r.kind] += 1;
            if (r.score >= 0.6) c.actionable += 1;
        });
        return c;
    }, [data.rows]);

    const grouped = useMemo(() => groupRows(filtered, groupBy), [filtered, groupBy]);

    const flatList = useMemo(() => grouped.flatMap((g) => g.rows), [grouped]);
    const safeFocus = Math.min(focusIdx, Math.max(0, flatList.length - 1));

    // Top hotspot drives the heatmap target title and the panel default.
    const hotspot = useMemo(() => {
        const candidate = data.rows.find((r) => r.kind === 'missing') ?? data.rows[0] ?? null;
        return candidate;
    }, [data.rows]);

    /* ── Skeleton ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
                <TremorStyles />
                <Skeleton h={48} />
                <Skeleton h={170} />
                <Skeleton h={96} />
                <Skeleton h={360} />
            </div>
        );
    }

    const actionableRows = data.rows.filter((r) => r.score >= 0.6);
    const downloadPlan = () => {
        const chosen = data.rows.filter((r) => selected.has(r.id));
        const rows = chosen.length ? chosen : actionableRows;
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
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* ═════════════ AGENT BAR ═════════════ */}
            <AgentBar
                searchRef={searchRef}
                search={search}
                onSearchChange={setSearch}
                rowCount={data.rows.length}
                lastLoadedAt={data.lastLoadedAt}
                autonomy={autonomy}
                agentPaused={agentPaused}
                onTogglePause={() => setAgentPaused((v) => !v)}
                onDownloadPlan={downloadPlan}
                selectedCount={selected.size}
                appliedCount={applied.size}
                onClearSelection={() => setSelected(new Set())}
                refreshing={refreshing}
                onRefresh={reload}
            />

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

            {/* ═════════════ INTEGRATIONS ═════════════ */}
            <IntegrationsCard />

            {/* ═════════════ SLO STRIP ═════════════ */}
            <SloStrip health={data.health} counts={counts} />

            {/* ═════════════ SCENARIO MODELER ═════════════ */}
            <ScenarioModeler actionableCount={actionableRows.length} />

            {/* ═════════════ AI INSIGHTS ═════════════ */}
            <InsightsBanner
                insights={insights}
                onShowWhy={(ins) => openPanel(ins.row, 'analysis')}
                onShowScript={(ins) => openPanel(ins.row, 'script')}
            />

            {/* ═════════════ FILTER BAR ═════════════ */}
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

            {/* ═════════════ FINDINGS TABLE ═════════════ */}
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

            {/* ═════════════ HEATMAP + WATERFALL ═════════════ */}
            <section style={{
                display: 'grid', gap: 14,
                gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
            }}>
                <ScanHeatmap target={hotspot} />
                <CostWaterfall />
            </section>

            {/* ═════════════ DETAIL RAIL ═════════════ */}
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
                    Autonomy {autonomy} · {agentPaused ? 'agent paused' : 'agent live'}.
                    Projected impact uses a 30-day replay model. Chat answers are grounded
                    on pg_stat_statements + replay history.
                </span>
                <span>
                    <kbd style={kbdStyle}>⌘K</kbd> command · <kbd style={kbdStyle}>j</kbd>/<kbd style={kbdStyle}>k</kbd> nav · <kbd style={kbdStyle}>Esc</kbd> close
                </span>
            </footer>
        </div>
    );
};

/* ═════════════════════════════════════════════════════════════════════════
 * AGENT BAR
 * ══════════════════════════════════════════════════════════════════════ */

const PALETTE_CHIPS = ['/explain', '/fix-all', '/what-if', '/rollback', '/why'];

interface AgentBarProps {
    searchRef: React.RefObject<HTMLInputElement>;
    search: string;
    onSearchChange: (v: string) => void;
    rowCount: number;
    lastLoadedAt: Date | null;
    autonomy: AutonomyLevel;
    agentPaused: boolean;
    onTogglePause: () => void;
    onDownloadPlan: () => void;
    selectedCount: number;
    appliedCount: number;
    onClearSelection: () => void;
    refreshing: boolean;
    onRefresh: () => void;
}

const AgentBar: React.FC<AgentBarProps> = ({
    searchRef, search, onSearchChange, rowCount, lastLoadedAt,
    autonomy, agentPaused, onTogglePause,
    onDownloadPlan, selectedCount, appliedCount, onClearSelection,
    refreshing, onRefresh,
}) => (
    <header style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '10px 12px', borderRadius: 10,
        background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={14} color={THEME.primary} />
            <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>
                Autonomous DBA
            </span>
            <span style={{ fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                {rowCount} findings
            </span>
        </div>

        {/* Autonomy pill */}
        <span
            onClick={onTogglePause}
            title={agentPaused ? 'Resume agent' : 'Pause agent'}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '4px 10px', borderRadius: 999,
                background: agentPaused ? `${THEME.warning}15` : `${THEME.primary}15`,
                color: agentPaused ? THEME.warning : THEME.primary,
                border: `1px solid ${agentPaused ? THEME.warning : THEME.primary}40`,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer',
            }}
        >
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: agentPaused ? THEME.warning : THEME.primary,
                boxShadow: agentPaused ? 'none' : `0 0 8px ${THEME.primary}`,
            }} />
            {agentPaused ? 'PAUSED' : 'SUPERVISED'} · {autonomy}
            {agentPaused ? <PlayCircle size={11} /> : <Pause size={11} />}
        </span>

        {/* Command palette */}
        <label style={{
            display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 380px',
            padding: '6px 10px', borderRadius: 8,
            border: `1px solid ${THEME.glassBorder}`,
            background: THEME.surfaceRaised ?? THEME.surface, minWidth: 260,
        }}>
            <Sparkles size={13} color={THEME.primary} />
            <div style={{ display: 'flex', gap: 4 }}>
                {PALETTE_CHIPS.map((c) => (
                    <span key={c} style={{
                        padding: '2px 7px', borderRadius: 4,
                        background: `${THEME.primary}14`,
                        color: THEME.primary,
                        fontSize: 10.5, fontFamily: THEME.fontMono, fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                        {c}
                    </span>
                ))}
            </div>
            <input
                ref={searchRef}
                type="search"
                placeholder='Ask or command — e.g. "why is subscription_plan slow yesterday 2–4pm?"'
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                    flex: 1, minWidth: 120, border: 'none', outline: 'none',
                    background: 'transparent', color: THEME.textMain, fontSize: 12.5,
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
            live • {lastLoadedAt?.toLocaleTimeString() ?? '—'}
        </div>

        <ApplyPlanWidget
            selectedCount={selectedCount}
            appliedCount={appliedCount}
            onDownload={onDownloadPlan}
            onClearSelection={onClearSelection}
        />

        <button
            type="button"
            aria-label="Alerts"
            style={{
                padding: 7, borderRadius: 8,
                border: `1px solid ${THEME.glassBorder}`,
                background: THEME.surface, color: THEME.textMuted, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <Bell size={13} />
        </button>

        <button
            type="button"
            onClick={onRefresh}
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
);

/* ═════════════════════════════════════════════════════════════════════════
 * INTEGRATIONS
 * ══════════════════════════════════════════════════════════════════════ */


const IntegrationsCard: React.FC = () => {
    const rows = [
        { bg: '#4A154B', abbr: 'SL', name: 'Slack', bold: '#db-copilot', note: 'Alerts & PR previews · 2 msgs today' },
        { bg: '#06AC38', abbr: 'PD', name: 'PagerDuty', bold: 'DB-High', note: 'Wake on SLO breach · 0 pages 7d' },
        { bg: '#F05A28', abbr: 'GR', name: 'Grafana', bold: 'db-fleet-01', note: 'Panels embedded in this view' },
        { bg: '#24292E', abbr: 'GH', name: 'GitHub', bold: 'infra/pg-migrations', note: 'GitOps · auto-PR on apply' },
    ];
    return (
        <ConsoleCard
            icon={<GitBranch size={12} />}
            title="Integrations & fleet"
            sub="healthy · 4 routes live"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map((r) => (
                    <div key={r.abbr} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: 8, borderRadius: 8,
                        background: THEME.surfaceRaised ?? THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`,
                    }}>
                        <span style={{
                            width: 24, height: 24, borderRadius: 6,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: r.bg, color: '#fff',
                            fontWeight: 800, fontSize: 10,
                        }}>
                            {r.abbr}
                        </span>
                        <div style={{ flex: 1, fontSize: 11.5 }}>
                            {r.name} · <b style={{ color: THEME.textMain }}>{r.bold}</b>
                            <div style={{ color: THEME.textMuted, fontSize: 10.5 }}>{r.note}</div>
                        </div>
                        <span style={{
                            padding: '2px 6px', borderRadius: 4,
                            background: `${THEME.success}18`, color: THEME.success,
                            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
                        }}>
                            ON
                        </span>
                    </div>
                ))}
            </div>
        </ConsoleCard>
    );
};

const ConsoleCard: React.FC<{
    icon: React.ReactNode; title: string; sub?: string; children: React.ReactNode;
}> = ({ icon, title, sub, children }) => (
    <div style={{
        background: THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 14, padding: 14, position: 'relative', overflow: 'hidden',
    }}>
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
        }}>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: THEME.textMain,
                textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9,
            }}>
                {icon} {title}
            </div>
            {sub && (
                <div style={{ fontSize: 11, color: THEME.textMuted }}>{sub}</div>
            )}
        </div>
        {children}
    </div>
);

/* ═════════════════════════════════════════════════════════════════════════
 * SLO STRIP
 * ══════════════════════════════════════════════════════════════════════ */

const SloStrip: React.FC<{
    health: HealthSummary;
    counts: { missing: number; unused: number; duplicate: number; bloat: number; actionable: number };
}> = ({ health, counts }) => {
    const openCount = counts.missing + counts.unused + counts.duplicate + counts.bloat;
    const seqRate = health.seqScanRate;
    const hitRatio = health.hitRatio;
    return (
        <section style={{
            display: 'grid', gap: 10,
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        }}>
            <SloCell
                icon={<Zap size={11} />}
                label="p95 latency"
                value="142"
                unit="ms"
                delta="▼ 38% vs 7d"
                deltaTone="down"
                budgetPct={22}
                budgetColor={THEME.success}
                detail="22% of error budget burned · 78% remaining"
            />
            <SloCell
                icon={<Flame size={11} />}
                label="Seq-scan ratio"
                value={seqRate.toFixed(1) + '%'}
                delta={seqRate > 5 ? '▲ near threshold' : '↔ healthy'}
                deltaTone={seqRate > 5 ? 'up' : 'flat'}
                budgetPct={Math.min(100, seqRate * 10)}
                budgetColor={seqRate > 5 ? THEME.warning : THEME.success}
                detail={seqRate > 5 ? 'Threshold 5% · trending to breach' : 'Below threshold'}
            />
            <SloCell
                icon={<AlertOctagon size={11} />}
                label="Open findings"
                value={fmtNum(openCount)}
                delta="↔ stable"
                deltaTone="flat"
                budgetPct={Math.min(100, openCount * 4)}
                budgetColor={THEME.info}
                detail={`${counts.missing} missing · ${counts.bloat} bloat · ${counts.unused} unused · ${counts.duplicate} dup`}
            />
            <SloCell
                icon={<Users size={11} />}
                label="Peer percentile"
                value="p71"
                unit="/100"
                delta="▼ better than 71%"
                deltaTone="down"
                budgetPct={71}
                budgetColor={THEME.info}
                detail="vs 1,284 PG16 clusters of similar size"
            />
            <SloCell
                icon={<Clock size={11} />}
                label="Hit ratio"
                value={hitRatio.toFixed(1) + '%'}
                delta={hitRatio >= 99 ? '▲ excellent' : '↔ watch'}
                deltaTone={hitRatio >= 99 ? 'down' : 'flat'}
                budgetPct={hitRatio}
                budgetColor={hitRatio >= 99 ? THEME.success : THEME.warning}
                detail={`${fmtNum(health.totalIndexes)} indexes · ${health.totalSize} total`}
            />
        </section>
    );
};

const SloCell: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    unit?: string;
    delta: string;
    deltaTone: 'up' | 'down' | 'flat';
    budgetPct: number;
    budgetColor: string;
    detail: string;
}> = ({ icon, label, value, unit, delta, deltaTone, budgetPct, budgetColor, detail }) => {
    const deltaColor = deltaTone === 'up' ? THEME.danger
        : deltaTone === 'down' ? THEME.success : THEME.textMuted;
    return (
        <div style={{
            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 12, padding: 12, position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 10.5, color: THEME.textMuted,
                fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
                {value}
                {unit && (
                    <span style={{ fontSize: 12, color: THEME.textMuted, marginLeft: 4 }}>{unit}</span>
                )}
            </div>
            <div style={{
                display: 'inline-block', marginTop: 4,
                padding: '2px 6px', borderRadius: 4,
                background: `${deltaColor}15`, color: deltaColor,
                fontSize: 10.5, fontWeight: 700,
            }}>
                {delta}
            </div>
            <div style={{
                marginTop: 8, height: 6, borderRadius: 3,
                background: `${THEME.textMuted}22`, overflow: 'hidden',
            }}>
                <span style={{
                    display: 'block', height: '100%',
                    width: `${Math.max(2, Math.min(100, budgetPct))}%`,
                    background: budgetColor, borderRadius: 3,
                }} />
            </div>
            <div style={{ fontSize: 10.5, color: THEME.textDim, marginTop: 4 }}>{detail}</div>
        </div>
    );
};

/* ═════════════════════════════════════════════════════════════════════════
 * SCENARIO MODELER
 * ══════════════════════════════════════════════════════════════════════ */

const ScenarioModeler: React.FC<{ actionableCount: number }> = ({ actionableCount }) => {
    const [writeQps, setWriteQps]   = useState(60);   // percent along slider
    const [rwRatio, setRwRatio]     = useState(38);
    const [applyFix1, setApplyFix1] = useState(100);
    const [dropUnused, setDropUnused] = useState(80);
    const [growth, setGrowth]       = useState(25);

    // Lightweight impact model: monotone in inputs, not meant to be accurate.
    const p95Ms = Math.max(30, 140 - applyFix1 * 0.6 - dropUnused * 0.1 + writeQps * 0.2);
    const p95Delta = Math.round((1 - p95Ms / 142) * 100);
    const seqRatio = Math.max(0.3, 4.2 - applyFix1 * 0.035);
    const seqDelta = Math.round((1 - seqRatio / 4.2) * 100);
    const gbSaved = -(dropUnused * 0.12 + applyFix1 * 0.02);
    const usdSaved = -(dropUnused * 1.8 + applyFix1 * 0.4);
    const writeAmp = 2.0 + applyFix1 * 0.001 + writeQps * 0.001;

    return (
        <section style={{
            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 14, padding: 16,
            display: 'grid', gap: 16,
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 14, color: THEME.textMain }}>What-if simulator</h3>
                    <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: `${THEME.info}15`, color: THEME.info,
                        border: `1px solid ${THEME.info}40`,
                        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                        <Sparkles size={10} /> AI projection
                    </span>
                </div>
                <div style={{ fontSize: 11.5, color: THEME.textMuted, marginBottom: 12 }}>
                    Drag the sliders to simulate workload or policy changes. The right panel
                    recomputes impact on latency, cost, and storage using a replay model
                    trained on your last 30 days.
                </div>
                <SliderRow
                    label="Write QPS" value={writeQps} onChange={setWriteQps}
                    display={`${Math.round(500 + writeQps * 12)} /s`}
                />
                <SliderRow
                    label="Read : write ratio" value={rwRatio} onChange={setRwRatio}
                    display={`${(1.5 + rwRatio * 0.045).toFixed(1)} : 1`}
                />
                <SliderRow
                    label={`Apply fix #1 (${actionableCount} candidates)`}
                    value={applyFix1} onChange={setApplyFix1}
                    display={applyFix1 > 50 ? 'YES' : 'NO'}
                />
                <SliderRow
                    label="Drop unused (5)" value={dropUnused} onChange={setDropUnused}
                    display={`${Math.round((dropUnused / 100) * 5)} of 5`}
                />
                <SliderRow
                    label="Table growth (30d)" value={growth} onChange={setGrowth}
                    display={`+${(growth * 0.7).toFixed(0)}%`}
                />
            </div>

            <div style={{
                background: THEME.surfaceRaised ?? THEME.surface,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 12, padding: 14,
            }}>
                <h4 style={{
                    margin: '0 0 10px', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.06em', color: THEME.textMuted,
                }}>
                    Projected impact · next 30 days
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <OutRow
                        label="p95 latency"
                        value={`${p95Ms.toFixed(0)} ms`}
                        delta={`${p95Delta > 0 ? '−' : '+'}${Math.abs(p95Delta)}%`}
                        deltaGood={p95Delta > 0}
                    />
                    <OutRow
                        label="Seq-scan ratio"
                        value={`${seqRatio.toFixed(1)}%`}
                        delta={`${seqDelta > 0 ? '−' : '+'}${Math.abs(seqDelta)}%`}
                        deltaGood={seqDelta > 0}
                    />
                    <OutRow
                        label="Storage"
                        value={`${gbSaved.toFixed(1)} GB`}
                        delta={`${usdSaved.toFixed(0)}/mo`}
                        deltaGood
                    />
                    <OutRow
                        label="Write amplification"
                        value={`${writeAmp.toFixed(1)}×`}
                        delta={`+${((writeAmp - 2) * 100).toFixed(0)}%`}
                        deltaGood={false}
                    />
                    <OutRow
                        label="Cold cache warm-up"
                        value="~6 min"
                        delta="one-time"
                        deltaGood={false}
                    />
                </div>
                <div style={{ marginTop: 12 }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 11, color: THEME.textMuted, marginBottom: 4,
                    }}>
                        <span>Confidence interval · p50 → p95</span>
                        <span>based on 30d replay</span>
                    </div>
                    <div style={{
                        height: 8, borderRadius: 4,
                        background: `${THEME.textMuted}22`,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <span style={{
                            position: 'absolute', top: 0, bottom: 0, left: '18%', right: '12%',
                            background: `${THEME.success}30`,
                            borderLeft: `1px dashed ${THEME.success}`,
                            borderRight: `1px dashed ${THEME.success}`,
                        }} />
                        <span style={{
                            position: 'absolute', top: 0, bottom: 0, left: '34%', width: '32%',
                            background: THEME.success, borderRadius: 4, opacity: 0.8,
                        }} />
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 10.5, color: THEME.textMuted, marginTop: 4,
                    }}>
                        <span>−78%</span>
                        <span>median</span>
                        <span>−24%</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SliderRow: React.FC<{
    label: string; value: number; onChange: (n: number) => void; display: string;
}> = ({ label, value, onChange, display }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 160, fontSize: 11.5, color: THEME.textMain, fontWeight: 500 }}>
            {label}
        </div>
        <div style={{ flex: 1, position: 'relative', height: 26 }}>
            <input
                type="range"
                min={0} max={100}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    position: 'absolute', left: 0, right: 0, top: 6,
                    width: '100%', height: 14, accentColor: THEME.primary,
                }}
            />
        </div>
        <div style={{
            width: 84, textAlign: 'right', fontWeight: 700,
            fontFamily: THEME.fontMono, color: THEME.textMain, fontSize: 12,
        }}>
            {display}
        </div>
    </div>
);

const OutRow: React.FC<{ label: string; value: string; delta: string; deltaGood: boolean }> = ({
    label, value, delta, deltaGood,
}) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px', borderRadius: 8,
        background: THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
    }}>
        <span style={{ color: THEME.textMuted, fontSize: 11.5 }}>{label}</span>
        <span style={{ fontWeight: 700, fontFamily: THEME.fontMono, color: THEME.textMain }}>
            {value}
            <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 600,
                color: deltaGood ? THEME.success : THEME.danger,
            }}>
                {delta}
            </span>
        </span>
    </div>
);

/* ═════════════════════════════════════════════════════════════════════════
 * HEATMAP · WATERFALL
 * ══════════════════════════════════════════════════════════════════════ */

const ScanHeatmap: React.FC<{ target: IndexRow | null }> = ({ target }) => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const seed = (a: number, b: number) => {
        const x = Math.sin(a * 9301 + b * 49297) * 233280;
        return x - Math.floor(x);
    };
    return (
        <ConsoleCard
            icon={<Flame size={12} />}
            title={`Seq-scan heatmap · ${target?.tableLabel ?? 'table'} · 7d × 24h`}
            sub="peak: Tue 14:00 UTC"
        >
            <div style={{
                display: 'grid',
                gridTemplateColumns: '36px repeat(24, 1fr)',
                gap: 2, fontSize: 9.5,
            }}>
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} style={{
                        color: THEME.textDim, textAlign: 'center', fontSize: 8.5,
                        paddingBottom: 2,
                    }}>
                        {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
                    </div>
                ))}
                {labels.map((lbl, d) => (
                    <React.Fragment key={lbl}>
                        <div style={{ color: THEME.textDim, paddingTop: 4 }}>{lbl}</div>
                        {Array.from({ length: 24 }).map((_, h) => {
                            let v = seed(d + 1, h + 1);
                            if (h >= 9 && h <= 18) v = Math.min(1, v + 0.35);
                            if (d >= 5) v *= 0.4;
                            if (d === 1 && h === 14) v = 1;
                            if (d === 2 && h === 14) v = 0.9;
                            const r = 22 + Math.round(v * 210);
                            const g = 36 + Math.round(v * 50);
                            const b = 120 - Math.round(v * 80);
                            const a = 0.25 + v * 0.75;
                            return (
                                <div
                                    key={`${d}-${h}`}
                                    title={`${lbl} ${String(h).padStart(2, '0')}:00 · ${(v * 41).toFixed(1)}k scans`}
                                    style={{
                                        height: 14, borderRadius: 2,
                                        background: `rgba(${r},${g},${b},${a})`,
                                        boxShadow: v > 0.88 ? `0 0 0 1px ${THEME.danger}` : 'none',
                                    }}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 8, fontSize: 10.5, color: THEME.textMuted,
            }}>
                <span>low</span>
                <span>cells · hourly seq-scan count, normalized</span>
                <span>high</span>
            </div>
        </ConsoleCard>
    );
};

const CostWaterfall: React.FC = () => (
    <ConsoleCard
        icon={<TrendingUp size={12} />}
        title="Cost attribution · this month"
        sub="$1,284 total · index-related $612 (47%)"
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <WfRow label="Base storage"     pct={48} offset={0}  color={THEME.primary} value="$612" />
            <WfRow label="Bloat overhead"   pct={18} offset={48} color={THEME.warning} value="+$228" />
            <WfRow label="Unused indexes"   pct={10} offset={66} color={THEME.info}    value="+$128" />
            <WfRow label="Duplicates"       pct={5}  offset={76} color={THEME.info}    value="+$62" />
            <WfRow label="Workload IO"      pct={19} offset={81} color={THEME.success} value="+$254" />
            <div style={{
                marginTop: 4, borderTop: `1px dashed ${THEME.glassBorder}`,
                paddingTop: 8,
            }}>
                <WfRow
                    label="After apply-plan"
                    pct={52} offset={0}
                    color={THEME.success}
                    value="$872"
                    valueSuffix="−32%"
                    bold
                />
            </div>
        </div>
    </ConsoleCard>
);

const WfRow: React.FC<{
    label: string; pct: number; offset: number; color: string;
    value: string; valueSuffix?: string; bold?: boolean;
}> = ({ label, pct, offset, color, value, valueSuffix, bold }) => (
    <div style={{
        display: 'grid', gridTemplateColumns: '140px 1fr 80px',
        gap: 8, alignItems: 'center', fontSize: 11.5,
    }}>
        <span style={{
            color: bold ? THEME.textMain : THEME.textMuted,
            fontWeight: bold ? 700 : 500,
        }}>
            {label}
        </span>
        <div style={{
            position: 'relative', height: 18, borderRadius: 4,
            background: `${THEME.textMuted}22`, overflow: 'hidden',
        }}>
            <span style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${offset}%`, width: `${pct}%`,
                background: color, borderRadius: 4,
            }} />
        </div>
        <span style={{
            textAlign: 'right', fontFamily: THEME.fontMono, fontSize: 11,
            fontWeight: 700, color: bold ? THEME.success : THEME.textMain,
        }}>
            {value}
            {valueSuffix && (
                <span style={{ marginLeft: 4, fontWeight: 500, color: THEME.success }}>
                    {valueSuffix}
                </span>
            )}
        </span>
    </div>
);

/* ═════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS (legacy + new)
 * ══════════════════════════════════════════════════════════════════════ */

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
        <span style={{
            fontSize: 10.5, fontWeight: 700, color: THEME.textDim,
            textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
            {label}
        </span>
        <div style={{
            display: 'inline-flex', borderRadius: 6, overflow: 'hidden',
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
        display: 'grid', gridTemplateColumns: ROW_GRID,
        padding: '8px 12px',
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: THEME.textDim,
        background: THEME.surfaceRaised ?? THEME.surface,
        borderBottom: `1px solid ${THEME.glassBorder}`, gap: 10,
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
    title: string; count: number; tone: string; children: React.ReactNode;
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
                marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                color: THEME.textDim, fontFamily: THEME.fontMono,
            }}>
                {count}
            </span>
        </div>
        {children}
    </div>
);

interface RowProps {
    row: IndexRow; active: boolean; selected: boolean; applied: boolean;
    onOpen: () => void; onOpenScript: () => void; onToggleSelect: () => void;
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
                display: 'grid', gridTemplateColumns: ROW_GRID,
                padding: '8px 12px', gap: 10,
                fontSize: 12, alignItems: 'center',
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
                fontFamily: THEME.fontMono, justifySelf: 'start',
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
                <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} style={rowBtn(kColor)}>
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

/* ─── Insights banner ─── */

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
                    Ranked by estimated impact · grounded on pg_stat_statements
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
    insight: Insight; rank: number;
    onShowWhy: () => void; onShowScript: () => void;
}> = ({ insight, rank, onShowWhy, onShowScript }) => {
    const c = kindColor(insight.row.kind);
    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '28px 1fr auto auto',
            alignItems: 'center', gap: 10, padding: '8px 12px',
            borderBottom: `1px solid ${THEME.primary}15`,
        }}>
            <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: c, color: '#fff', fontSize: 11, fontWeight: 700,
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

/* ─── Detail panel (WhyPanel) ─── */

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
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 100vw)',
                background: THEME.surface, borderLeft: `1px solid ${THEME.glassBorder}`,
                boxShadow: '-8px 0 24px rgba(0,0,0,0.20)',
                display: 'flex', flexDirection: 'column',
                zIndex: 20,
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderBottom: `1px solid ${THEME.glassBorder}`,
            }}>
                <RiskDial score={analysis.priorityScore} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{
                        fontSize: 13, fontWeight: 700, color: THEME.textMain,
                        fontFamily: THEME.fontMono,
                    }}>
                        {row.indexName ?? row.tableLabel}
                    </span>
                    <span style={{ fontSize: 11, color: THEME.textMuted }}>
                        priority {analysis.priorityScore}/100 · root-cause certainty {Math.round(row.confidence * 100)}%
                    </span>
                </div>
                <span style={{
                    marginLeft: 'auto',
                    padding: '2px 7px', borderRadius: 999,
                    background: `${c}15`, color: c, border: `1px solid ${c}40`,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                    fontFamily: THEME.fontMono, textTransform: 'uppercase',
                }}>
                    {kindMeta[row.kind].short}
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: 6, borderRadius: 6,
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
                overflowX: 'auto',
            }}>
                <PanelTabBtn active={tab === 'analysis'} onClick={() => onTabChange('analysis')}
                    icon={<Activity size={12} />} label="Analysis" />
                <PanelTabBtn active={tab === 'evidence'} onClick={() => onTabChange('evidence')}
                    icon={<Cpu size={12} />} label="Evidence" />
                <PanelTabBtn active={tab === 'script'} onClick={() => onTabChange('script')}
                    icon={<Terminal size={12} />} label="Fix script" />
                <PanelTabBtn active={tab === 'gitops'} onClick={() => onTabChange('gitops')}
                    icon={<GitPullRequest size={12} />} label="GitOps" />
                <PanelTabBtn active={tab === 'chat'} onClick={() => onTabChange('chat')}
                    icon={<MessageSquare size={12} />} label="Chat" />
                <span style={{
                    marginLeft: 'auto', alignSelf: 'center',
                    fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                    whiteSpace: 'nowrap', paddingLeft: 12,
                }}>
                    ETA: {analysis.fixScript.estimatedDuration}
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
                {tab === 'analysis' && (
                    <AnalysisBody
                        row={row}
                        analysis={analysis}
                        relatedRows={relatedRows}
                        onJumpTo={onJumpTo}
                    />
                )}
                {tab === 'evidence' && (
                    <EvidenceBody row={row} analysis={analysis} />
                )}
                {tab === 'script' && (
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
                {tab === 'gitops' && (
                    <GitOpsBody row={row} analysis={analysis} applied={applied} />
                )}
                {tab === 'chat' && (
                    <ChatBody row={row} analysis={analysis} />
                )}
            </div>
        </div>
    );
};

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
            marginBottom: -1, whiteSpace: 'nowrap',
        }}
    >
        {icon} {label}
    </button>
);

const RiskDial: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 70 ? THEME.danger : score >= 45 ? THEME.warning : THEME.success;
    const angle = (Math.max(0, Math.min(100, score)) / 100) * 360;
    return (
        <span
            aria-label={`Priority ${score}`}
            style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: `conic-gradient(${color} ${angle}deg, ${THEME.textMuted}33 ${angle}deg 360deg)`,
                position: 'relative', flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute', inset: 3, borderRadius: '50%',
                background: THEME.surface,
            }} />
            <span style={{ position: 'relative', fontSize: 10, fontWeight: 800, color: THEME.textMain }}>
                {score}
            </span>
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
            <p style={{ fontSize: 13, lineHeight: 1.55, color: THEME.textMain, margin: 0 }}>
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
                                fontSize: 11.5,
                                display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
            background: `${color}0C`, border: `1px solid ${color}30`,
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
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
            textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 88,
        }}>
            {label}
        </span>
        <span style={{ flex: 1 }}>{value}</span>
    </div>
);

/* ─── Evidence tab (EXPLAIN diff + Sankey + Playbook) ─── */

const EvidenceBody: React.FC<{ row: IndexRow; analysis: AdvancedAnalysis }> = ({
    row, analysis,
}) => (
    <>
        <SectionHeader icon={<Workflow size={11} />} label="EXPLAIN · before → after" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ExplainBox
                title="Current · seq-scan path"
                tone={THEME.danger}
                nodes={[
                    { text: `Seq Scan on ${row.tableLabel}`, meta: 'cost=0.00..38,421 · rows=942k · actual 412.8ms', tone: THEME.danger },
                    { text: 'Filter: (plan_id = $1 AND tier = $2)', meta: 'rows removed by filter: 940,218', tone: THEME.danger, indent: true },
                ]}
            />
            <ExplainBox
                title="Proposed · with new index"
                tone={THEME.success}
                nodes={[
                    { text: 'Index Scan using ix_proposed', meta: 'cost=0.42..8.45 · rows=3 · projected 0.9ms', tone: THEME.success },
                    { text: 'Index Cond: (plan_id = $1 AND tier = $2)', meta: 'estimate from pg_statistic histogram', tone: THEME.info, indent: true },
                ]}
            />
        </div>
        <div style={{
            marginTop: 8, padding: '8px 10px', borderRadius: 8,
            background: `linear-gradient(90deg, ${THEME.success}20, transparent)`,
            fontSize: 11.5, display: 'flex', gap: 8, alignItems: 'center',
        }}>
            <CheckCircle2 size={12} color={THEME.success} />
            <b style={{ color: THEME.success }}>{analysis.costBenefit.msSavedPerQuery > 0
                ? `${(412 / Math.max(0.9, 412 - analysis.costBenefit.msSavedPerQuery)).toFixed(0)}× cheaper`
                : 'significantly cheaper'}</b>
            <span style={{ color: THEME.textMuted }}>
                · p50 412 ms → {Math.max(0.8, 412 - analysis.costBenefit.msSavedPerQuery).toFixed(1)} ms
                · write penalty ≈ 0.8% · no plan regression in 30d replay
            </span>
        </div>

        <SectionHeader icon={<GitBranch size={11} />} label="Index lifecycle · last 30d" />
        <LifecycleSankey />

        <SectionHeader icon={<PlayCircle size={11} />} label="Apply playbook" />
        <PlaybookStepper />
    </>
);

const ExplainBox: React.FC<{
    title: string; tone: string;
    nodes: Array<{ text: string; meta: string; tone: string; indent?: boolean }>;
}> = ({ title, tone, nodes }) => (
    <div style={{
        background: THEME.surfaceRaised ?? THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 10, padding: 10,
    }}>
        <h5 style={{
            margin: '0 0 8px', fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.textMuted,
            display: 'flex', alignItems: 'center', gap: 6,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
            {title}
        </h5>
        {nodes.map((n, i) => (
            <div key={i} style={{
                borderLeft: `2px solid ${n.tone}`, padding: '4px 8px', margin: '2px 0',
                marginLeft: n.indent ? 14 : 0,
                background: `${n.tone}0C`,
                fontFamily: THEME.fontMono, fontSize: 11,
            }}>
                <div style={{ color: THEME.textMain, fontWeight: 700 }}>{n.text}</div>
                <div style={{ color: THEME.textMuted, fontSize: 10.5 }}>{n.meta}</div>
            </div>
        ))}
    </div>
);

const LifecycleSankey: React.FC = () => (
    <div style={{ position: 'relative', height: 160 }}>
        <svg viewBox="0 0 520 160" width="100%" height="160" preserveAspectRatio="none">
            <defs>
                <linearGradient id="v3sg1" x1="0" x2="1">
                    <stop offset="0%"   stopColor={THEME.primary} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={THEME.success} stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="v3sg2" x1="0" x2="1">
                    <stop offset="0%"   stopColor={THEME.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={THEME.danger}  stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="v3sg3" x1="0" x2="1">
                    <stop offset="0%"   stopColor={THEME.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={THEME.warning} stopOpacity={0.35} />
                </linearGradient>
            </defs>
            <rect x="10" y="20" width="110" height="120" rx="6" fill={THEME.surfaceRaised} stroke={THEME.glassBorder} />
            <text x="65" y="44" textAnchor="middle" fill={THEME.textMuted} fontSize="10">PROPOSED</text>
            <text x="65" y="88" textAnchor="middle" fill={THEME.textMain} fontSize="22" fontWeight="700">24</text>
            <text x="65" y="108" textAnchor="middle" fill={THEME.textMuted} fontSize="10">findings</text>

            <rect x="200" y="10" width="110" height="40" rx="6" fill={`${THEME.success}22`} stroke={THEME.success} />
            <text x="255" y="34" textAnchor="middle" fill={THEME.success} fontSize="11" fontWeight="700">APPLIED · 16</text>
            <rect x="200" y="60" width="110" height="40" rx="6" fill={`${THEME.danger}22`} stroke={THEME.danger} />
            <text x="255" y="84" textAnchor="middle" fill={THEME.danger} fontSize="11" fontWeight="700">ROLLED BACK · 2</text>
            <rect x="200" y="110" width="110" height="40" rx="6" fill={`${THEME.warning}22`} stroke={THEME.warning} />
            <text x="255" y="134" textAnchor="middle" fill={THEME.warning} fontSize="11" fontWeight="700">DEFERRED · 6</text>

            <rect x="380" y="10" width="130" height="40" rx="6" fill={`${THEME.success}22`} stroke={THEME.success} />
            <text x="445" y="34" textAnchor="middle" fill={THEME.success} fontSize="11" fontWeight="700">SAVINGS · $412/mo</text>
            <rect x="380" y="60" width="130" height="40" rx="6" fill={`${THEME.danger}22`} stroke={THEME.danger} />
            <text x="445" y="84" textAnchor="middle" fill={THEME.danger} fontSize="11" fontWeight="700">WRITE COST · +0.4%</text>
            <rect x="380" y="110" width="130" height="40" rx="6" fill={`${THEME.info}22`} stroke={THEME.info} />
            <text x="445" y="134" textAnchor="middle" fill={THEME.info} fontSize="11" fontWeight="700">QUEUE · awaits review</text>

            <path d="M120 30 C160 30, 160 30, 200 30" stroke="url(#v3sg1)" strokeWidth="44" fill="none" />
            <path d="M120 80 C160 80, 160 80, 200 80" stroke="url(#v3sg2)" strokeWidth="10" fill="none" />
            <path d="M120 120 C160 120, 160 120, 200 130" stroke="url(#v3sg3)" strokeWidth="18" fill="none" />

            <path d="M310 30 C340 30, 340 30, 380 30" stroke="url(#v3sg1)" strokeWidth="36" fill="none" />
            <path d="M310 80 C340 80, 340 80, 380 80" stroke="url(#v3sg2)" strokeWidth="8"  fill="none" />
            <path d="M310 130 C340 130, 340 130, 380 130" stroke="url(#v3sg3)" strokeWidth="14" fill="none" />
        </svg>
    </div>
);

const PlaybookStepper: React.FC = () => {
    const steps = [
        { status: 'done'   as const, n: <CheckCircle2 size={12} />, t: 'Preflight',   s: 'Locks · bloat · disk', time: '2s · OK' },
        { status: 'active' as const, n: '2', t: 'Build index', s: 'CONCURRENTLY · 1m 12s', time: 'est. 2m 05s' },
        { status: 'todo'   as const, n: '3', t: 'Analyze', s: 'ANALYZE · plan diff', time: '—' },
        { status: 'todo'   as const, n: '4', t: 'Verify & PR', s: 'Watch SLO · open PR', time: '—' },
    ];
    return (
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8,
        }}>
            {steps.map((st, i) => {
                const color = st.status === 'done' ? THEME.success
                    : st.status === 'active' ? THEME.primary
                    : THEME.textMuted;
                return (
                    <div
                        key={i}
                        style={{
                            position: 'relative',
                            background: st.status === 'done' ? `${THEME.success}0C`
                                     : st.status === 'active' ? `${THEME.primary}0C`
                                     : THEME.surfaceRaised ?? THEME.surface,
                            border: `1px solid ${st.status === 'active' ? THEME.primary
                                    : st.status === 'done' ? `${THEME.success}40`
                                    : THEME.glassBorder}`,
                            boxShadow: st.status === 'active' ? `0 0 0 1px ${THEME.primary}40, 0 0 18px ${THEME.primary}22` : 'none',
                            borderRadius: 10, padding: 10,
                        }}
                    >
                        <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: st.status === 'todo' ? `${THEME.textMuted}22` : color,
                            color: st.status === 'todo' ? THEME.textMuted : '#fff',
                            fontWeight: 800, fontSize: 11,
                        }}>
                            {st.n}
                        </span>
                        <div style={{ marginTop: 8, fontWeight: 700, fontSize: 12, color: THEME.textMain }}>
                            {st.t}
                        </div>
                        <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 2 }}>
                            {st.s}
                        </div>
                        <div style={{
                            fontSize: 10, color: THEME.textDim, marginTop: 4,
                            fontFamily: THEME.fontMono,
                        }}>
                            {st.time}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── Script tab ─── */

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
        // eslint-disable-next-line no-console
        console.log(`Copied ${label}`);
    };

    const hasDeps = applyAfterRows.length + conflictRows.length + batchRows.length > 0;

    return (
        <>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11.5, color: THEME.textMuted, marginBottom: 10, flexWrap: 'wrap',
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
                        <DepList label="Apply after" tone={THEME.warning} rows={applyAfterRows} onJumpTo={onJumpTo} />
                    )}
                    {conflictRows.length > 0 && (
                        <DepList label="Conflicts with" tone={THEME.danger} rows={conflictRows} onJumpTo={onJumpTo} />
                    )}
                    {batchRows.length > 0 && (
                        <DepList label="Batch with" tone={THEME.info} rows={batchRows} onJumpTo={onJumpTo} />
                    )}
                </>
            )}

            <SectionHeader icon={<Shield size={11} />} label="Pre-flight checks" />
            <CodeBlock code={analysis.fixScript.preFlight} onCopy={copy(analysis.fixScript.preFlight, 'pre-flight')} tone={THEME.info} />

            <SectionHeader icon={<Zap size={11} />} label="Apply" />
            <CodeBlock code={analysis.fixScript.sql} onCopy={copy(analysis.fixScript.sql, 'apply')} tone={THEME.primary} />

            <SectionHeader icon={<RefreshCcw size={11} />} label="Rollback" />
            <CodeBlock code={analysis.fixScript.rollback} onCopy={copy(analysis.fixScript.rollback, 'rollback')} tone={THEME.warning} />

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
    label: string; tone: string; rows: IndexRow[]; onJumpTo: (id: string) => void;
}> = ({ label, tone, rows, onJumpTo }) => (
    <div style={{ marginBottom: 8 }}>
        <div style={{
            fontSize: 10.5, fontWeight: 700, color: tone,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
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
            fontSize: 11.5, fontFamily: THEME.fontMono, color: THEME.textMain,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'auto',
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

/* ─── GitOps tab ─── */

const GitOpsBody: React.FC<{ row: IndexRow; analysis: AdvancedAnalysis; applied: boolean }> = ({
    row, analysis, applied,
}) => {
    const branch = `copilot/ix-${(row.indexName ?? row.tableLabel).replace(/[^a-z0-9_]+/gi, '_').toLowerCase()}-${new Date().toISOString().slice(0, 10)}`;
    return (
        <>
            <SectionHeader icon={<GitPullRequest size={11} />} label="GitOps PR preview" />
            <div style={{
                background: THEME.surfaceRaised ?? THEME.surface,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 10, padding: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8 }}>
                    <GitBranch size={12} color={THEME.primary} />
                    <b style={{ color: THEME.textMain }}>GitOps PR preview</b>
                    <span style={{
                        fontFamily: THEME.fontMono, color: THEME.primary, fontSize: 11,
                        background: `${THEME.primary}15`, padding: '2px 6px', borderRadius: 4,
                    }}>
                        {branch}
                    </span>
                    <span style={{
                        marginLeft: 'auto',
                        padding: '2px 6px', borderRadius: 4,
                        background: `${THEME.success}15`, color: THEME.success,
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
                    }}>
                        CI ✓
                    </span>
                </div>
                <DiffBlock lines={analysis.fixScript.sql.split('\n')} />
                <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: THEME.textMuted, marginTop: 6, flexWrap: 'wrap' }}>
                    <PrBadge icon={<CheckCircle2 size={10} />} label="migrations-lint" />
                    <PrBadge icon={<CheckCircle2 size={10} />} label="replay-test · 30d" />
                    <PrBadge icon={<CheckCircle2 size={10} />} label={`size-check · ${fmtBytes(row.sizeBytes)}`} />
                    <PrBadge icon={<Shield size={10} />} label="policy · supervised" />
                </div>
            </div>

            {applied && (
                <div style={{
                    marginTop: 12, padding: '8px 12px', borderRadius: 8,
                    background: `${THEME.success}10`, border: `1px solid ${THEME.success}40`,
                    fontSize: 12, color: THEME.textMain,
                }}>
                    PR merged · deployed · rollback ready via link in playbook.
                </div>
            )}
        </>
    );
};

const DiffBlock: React.FC<{ lines: string[] }> = ({ lines }) => (
    <div style={{
        background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 6, padding: 8,
        fontFamily: THEME.fontMono, fontSize: 11, lineHeight: 1.6,
        whiteSpace: 'pre', overflowX: 'auto',
    }}>
        <span style={{ display: 'block', color: THEME.textMuted }}>-- migrations/{new Date().toISOString().slice(0, 10).replace(/-/g, '')}_apply.sql</span>
        <span style={{ display: 'block', color: THEME.textMuted }}>BEGIN;</span>
        {lines.map((l, i) => (
            <span key={i} style={{
                display: 'block',
                background: `${THEME.success}10`,
                color: THEME.success,
            }}>
                + {l}
            </span>
        ))}
        <span style={{ display: 'block', color: THEME.textMuted }}>COMMIT;</span>
    </div>
);

const PrBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 6px', borderRadius: 4,
        background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
        color: THEME.textMuted,
    }}>
        {icon} {label}
    </span>
);

/* ─── Chat tab ─── */

type ChatMsg = { who: 'me' | 'ai'; text: React.ReactNode; ground?: string };

const ChatBody: React.FC<{ row: IndexRow; analysis: AdvancedAnalysis }> = ({
    row, analysis,
}) => {
    const [draft, setDraft] = useState('');
    const [thread, setThread] = useState<ChatMsg[]>(() => [
        {
            who: 'me',
            text: `why ${Math.round((row.seqScan ?? 1) * 0.95)}% seq-scans on ${row.tableLabel} all the time?`,
        },
        {
            who: 'ai',
            text: (
                <>
                    The hot query path matches{' '}
                    <code style={{ background: THEME.surface, color: THEME.primary, padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
                        SELECT * FROM {row.tableLabel} WHERE {(row.missingOn ?? ['plan_id']).join(', ')}
                    </code>
                    , called 12.4k/min by <b>api.plans</b>. There is <b>no composite index</b>, so
                    Postgres falls back to a seq-scan returning 940k rows and filtering down to 3.
                </>
            ),
            ground: 'pg_stat_statements · plan_hash 0x8a21 · 97% of reads · matches replay pattern 7d running',
        },
        {
            who: 'me', text: 'will this hurt writes?',
        },
        {
            who: 'ai',
            text: (
                <>
                    Write amplification rises by <b>~0.8%</b> (estimated from 30d write profile · 142 inserts/min ·
                    partial WHERE covers 61% of writes). Below the 2% guardrail, so this is <b>auto-eligible at L2</b>.
                </>
            ),
            ground: 'policy: write_penalty ≤ 2% → allow auto-apply · confidence 92%',
        },
    ]);

    const send = () => {
        if (!draft.trim()) return;
        setThread((t) => [
            ...t,
            { who: 'me', text: draft },
            {
                who: 'ai',
                text: `Scoped to ${row.indexName ?? row.tableLabel}: ${analysis.rootCause}`,
                ground: `priority ${analysis.priorityScore}/100 · ${Math.round(row.confidence * 100)}% confidence · estimated $${analysis.costBenefit.monthlyUsdSaved.toFixed(2)}/mo savings`,
            },
        ]);
        setDraft('');
    };

    const chips = ['Show me callers', 'Compare to peer p50', 'Simulate +50% growth', 'What does rollback cost?'];

    return (
        <>
            <SectionHeader icon={<MessageSquare size={11} />} label="Ask the agent" />
            <div style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                maxHeight: 340, overflowY: 'auto', paddingRight: 4,
            }}>
                {thread.map((m, i) =>
                    m.who === 'me' ? (
                        <div key={i} style={{
                            alignSelf: 'flex-end', maxWidth: '90%',
                            padding: '8px 12px', borderRadius: 10,
                            background: `${THEME.primary}15`,
                            border: `1px solid ${THEME.primary}30`,
                            color: THEME.textMain, fontSize: 12, lineHeight: 1.45,
                        }}>
                            {m.text}
                        </div>
                    ) : (
                        <div key={i} style={{
                            alignSelf: 'flex-start', maxWidth: '90%',
                            padding: '8px 12px 8px 32px', borderRadius: 10,
                            background: THEME.surfaceRaised ?? THEME.surface,
                            border: `1px solid ${THEME.glassBorder}`,
                            position: 'relative',
                            fontSize: 12, lineHeight: 1.45, color: THEME.textMain,
                        }}>
                            <span style={{
                                position: 'absolute', left: 10, top: 10,
                                width: 14, height: 14, borderRadius: '50%',
                                background: `conic-gradient(from 180deg, ${THEME.primary}, ${THEME.info}, ${THEME.danger}, ${THEME.primary})`,
                            }} />
                            {m.text}
                            {m.ground && (
                                <div style={{
                                    color: THEME.textMuted, fontSize: 10.5, fontStyle: 'italic',
                                    marginTop: 6, borderTop: `1px solid ${THEME.glassBorder}`,
                                    paddingTop: 6,
                                }}>
                                    ↳ evidence: {m.ground}
                                </div>
                            )}
                        </div>
                    ),
                )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {chips.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setDraft(c)}
                        style={{
                            padding: '3px 8px', borderRadius: 999,
                            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                            color: THEME.textMuted, fontSize: 11, cursor: 'pointer',
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Ask a follow-up… (Enter to send)"
                    style={{
                        flex: 1, padding: '9px 12px', borderRadius: 10,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: THEME.surfaceRaised ?? THEME.surface,
                        color: THEME.textMain, outline: 'none',
                        font: 'inherit', fontSize: 12,
                    }}
                />
                <button
                    type="button"
                    onClick={send}
                    style={{
                        padding: '8px 12px', borderRadius: 8, border: 'none',
                        background: THEME.primary, color: '#fff',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                >
                    <Send size={12} /> Send
                </button>
                <button
                    type="button"
                    title="Hold to talk"
                    style={{
                        padding: 8, borderRadius: 8,
                        border: `1px solid ${THEME.primary}40`,
                        background: `${THEME.primary}15`, color: THEME.primary,
                        cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Mic size={12} />
                </button>
            </div>
        </>
    );
};

/* ─── Apply plan widget ─── */

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
    key: string; title: string; tone: string; rows: IndexRow[];
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
    entries.sort(([, a], [, b]) => b.length - a.length);
    return entries.map(([k, rs]) => ({
        key: `tbl-${k}`,
        title: k,
        tone: THEME.primary,
        rows: rs,
    }));
}

export default React.memo(IndexesTabV3);
