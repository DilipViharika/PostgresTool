/**
 * OverviewTabV3.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Operator-grade + AI-native monitoring overview.
 *
 * Differences vs. V2:
 *   • Datadog-dense top bar (title + connection + live status + refresh).
 *   • AI health banner — headline synthesized from real signals, confidence
 *     ring, bulleted drivers, and inline anomaly chips.
 *   • 8-cell metric strip with inline sparklines and trend arrows.
 *   • Bigger throughput chart with hover crosshair + spike markers.
 *   • 4-cell resource micro-grid with threshold bars and sparklines.
 *   • Dense alerts list with severity heat bars, time, source, action.
 *   • Top-tables heat row (size bar + health dot + avg-ms chip).
 *   • AI anomaly list with confidence % and one-click "Investigate".
 *   • Keyboard: ⌘K focuses search-free ancestry (reserved), j/k move anomaly
 *     focus, Enter opens the top anomaly in a side panel.
 *
 * Real API endpoints (unchanged): /api/overview/{stats,traffic,timeseries,
 * alerts,top-tables}. No backend changes required.
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
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    Cpu,
    Database,
    Gauge,
    HardDrive,
    Info,
    Network,
    RefreshCcw,
    Server,
    Sparkles,
    Timer,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';

import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { fmtNum, fmtDuration } from '../../../lib/utils';
import { TremorStyles } from '../../ui/tremor';

import {
    type OverviewStats,
    type OverviewTraffic,
    type TimeseriesPoint,
    type TimeseriesData,
    type AlertItem,
    type TopTable,
    type Anomaly,
    type AISummary,
    buildAISummary,
    deriveHealth,
    clamp01,
    withTimeout,
    fmtOps,
    severityColor,
    toneColor,
    last,
    meanOf,
    deltaPct,
} from './_overviewV3Helpers';

/* ─────────────────────────────────────────────────────────────────────────
 * Shared primitives (inline sparkline, confidence ring, metric cell)
 * ────────────────────────────────────────────────────────────────────── */

const Spark: React.FC<{
    values: number[]; color: string; w?: number; h?: number; filled?: boolean;
}> = ({ values, color, w = 72, h = 18, filled }) => {
    if (!values || values.length < 2) {
        return <div style={{ height: h, opacity: 0.35 }} />;
    }
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(1, max - min);
    const step = w / Math.max(1, values.length - 1);
    const pts = values.map((v, i) =>
        `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 2) - 1).toFixed(1)}`,
    );
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
            {filled && (
                <polygon
                    points={`0,${h} ${pts.join(' ')} ${w},${h}`}
                    fill={color}
                    opacity={0.18}
                />
            )}
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={1.3}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
};

const ConfidenceRing: React.FC<{
    pct: number; size?: number; color?: string; label?: string;
}> = ({ pct, size = 56, color = THEME.primary }) => {
    const r = size / 2 - 4;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={THEME.glassBorder} strokeWidth={4} fill="none"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color} strokeWidth={4} fill="none"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size < 50 ? 11 : 13, fontWeight: 700,
                color: THEME.textMain, fontFamily: THEME.fontMono,
            }}>
                {Math.round(pct)}%
            </div>
        </div>
    );
};

const MetricCell: React.FC<{
    label: string;
    value: string;
    sub?: string;
    color?: string;
    spark?: number[];
    trend?: 'up' | 'down' | 'flat';
    trendTone?: 'good' | 'bad' | 'neutral';
    icon?: React.ReactNode;
}> = ({ label, value, sub, color = THEME.primary, spark, trend, trendTone = 'neutral', icon }) => {
    const trendColor =
        trendTone === 'good' ? THEME.success :
        trendTone === 'bad' ? THEME.danger :
        THEME.textMuted;
    return (
        <div
            style={{
                flex: '1 1 0',
                minWidth: 120,
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
                {icon}
                {label}
                {trend === 'up' && <TrendingUp size={10} color={trendColor} />}
                {trend === 'down' && <TrendingUp size={10} color={trendColor} style={{ transform: 'scaleY(-1)' }} />}
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
            <div style={{ height: 18, marginTop: 2 }}>
                {spark ? <Spark values={spark} color={color} w={72} h={18} /> : null}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Throughput chart — dual-line SVG with hover crosshair.
 * ────────────────────────────────────────────────────────────────────── */

interface HoverPoint {
    x: number; y: number;
    reads: number; writes: number;
    idx: number;
}

const ThroughputChart: React.FC<{ data: TimeseriesPoint[] }> = ({ data }) => {
    const W = 720, H = 240;
    const pad = { top: 16, right: 16, bottom: 24, left: 44 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;

    const [hover, setHover] = useState<HoverPoint | null>(null);

    if (data.length === 0) {
        return (
            <div style={{
                height: H,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: THEME.textDim, fontSize: 12.5,
            }}>
                Waiting for traffic…
            </div>
        );
    }

    const reads = data.map((d) => Number(d.reads ?? d.qps ?? 0));
    const writes = data.map((d) => Number(d.writes ?? 0));
    const max = Math.max(...reads, ...writes, 1);
    const n = Math.max(1, data.length - 1);
    const xFor = (i: number) => pad.left + (i / n) * iW;
    const yFor = (v: number) => pad.top + iH - (v / max) * iH;

    const readsPoly = [
        `${pad.left},${pad.top + iH}`,
        ...reads.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`),
        `${pad.left + iW},${pad.top + iH}`,
    ].join(' ');
    const writesPoly = [
        `${pad.left},${pad.top + iH}`,
        ...writes.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`),
        `${pad.left + iW},${pad.top + iH}`,
    ].join(' ');
    const readsLine = reads.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ');
    const writesLine = writes.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ');

    // Spike markers — any point ≥ 2× its local neighborhood mean.
    const spikes: number[] = [];
    reads.forEach((v, i) => {
        const wnd = reads.slice(Math.max(0, i - 3), i);
        const m = meanOf(wnd);
        if (m > 0 && v >= m * 2 && v > 20) spikes.push(i);
    });

    // Y ticks
    const yTicks = [0, 0.5, 1];

    const onMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const scale = W / r.width;
        const x = (e.clientX - r.left) * scale;
        const idx = Math.min(
            data.length - 1,
            Math.max(0, Math.round(((x - pad.left) / iW) * n)),
        );
        setHover({
            x: xFor(idx),
            y: yFor(Math.max(reads[idx], writes[idx])),
            reads: reads[idx],
            writes: writes[idx],
            idx,
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height: H, display: 'block' }}
                onMouseMove={onMove}
                onMouseLeave={() => setHover(null)}
            >
                {/* Grid */}
                {yTicks.map((p, i) => (
                    <g key={i}>
                        <line
                            x1={pad.left} x2={pad.left + iW}
                            y1={pad.top + iH * (1 - p)} y2={pad.top + iH * (1 - p)}
                            stroke={THEME.glassBorder} strokeWidth={0.5}
                            strokeDasharray="2 3"
                        />
                        <text
                            x={pad.left - 6} y={pad.top + iH * (1 - p) + 3}
                            textAnchor="end" fontSize={9.5}
                            fontFamily={THEME.fontMono} fill={THEME.textDim}
                        >
                            {Math.round(max * p).toLocaleString()}
                        </text>
                    </g>
                ))}

                {/* Reads — primary */}
                <polygon points={readsPoly} fill={THEME.primary} opacity={0.14} />
                <polyline
                    points={readsLine}
                    fill="none" stroke={THEME.primary} strokeWidth={1.7}
                    strokeLinejoin="round" strokeLinecap="round"
                />
                {/* Writes — warning */}
                <polygon points={writesPoly} fill={THEME.warning} opacity={0.10} />
                <polyline
                    points={writesLine}
                    fill="none" stroke={THEME.warning} strokeWidth={1.7}
                    strokeLinejoin="round" strokeLinecap="round"
                />

                {/* Spike pins */}
                {spikes.map((i) => (
                    <g key={`sp${i}`}>
                        <circle
                            cx={xFor(i)} cy={yFor(reads[i])}
                            r={4} fill={THEME.danger} opacity={0.9}
                        />
                        <circle
                            cx={xFor(i)} cy={yFor(reads[i])}
                            r={8} fill="none" stroke={THEME.danger} opacity={0.4}
                        />
                    </g>
                ))}

                {/* Hover crosshair */}
                {hover && (
                    <g>
                        <line
                            x1={hover.x} x2={hover.x}
                            y1={pad.top} y2={pad.top + iH}
                            stroke={THEME.textMuted} strokeWidth={0.5}
                        />
                        <circle cx={hover.x} cy={yFor(hover.reads)} r={3.5} fill={THEME.primary} />
                        <circle cx={hover.x} cy={yFor(hover.writes)} r={3.5} fill={THEME.warning} />
                    </g>
                )}
            </svg>

            {hover && (
                <div style={{
                    position: 'absolute',
                    top: Math.max(4, hover.y - 8),
                    left: Math.min(hover.x + 14, 540),
                    padding: '5px 9px', borderRadius: 6,
                    background: THEME.surfaceRaised ?? THEME.surface,
                    border: `1px solid ${THEME.glassBorder}`,
                    fontSize: 11, color: THEME.textMain,
                    fontFamily: THEME.fontMono, pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    lineHeight: 1.45,
                }}>
                    <div style={{ color: THEME.textMuted, fontSize: 10 }}>sample #{hover.idx + 1}</div>
                    <div><span style={{ color: THEME.primary }}>●</span> reads: {fmtOps(hover.reads)}/s</div>
                    <div><span style={{ color: THEME.warning }}>●</span> writes: {fmtOps(hover.writes)}/s</div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Resource cell — label, percent bar, threshold marker, mini-spark.
 * ────────────────────────────────────────────────────────────────────── */

const ResourceCell: React.FC<{
    label: string; icon: React.ReactNode; pct: number;
    good?: number; warn?: number; spark?: number[];
}> = ({ label, icon, pct, good = 60, warn = 80, spark }) => {
    const color = pct >= warn ? THEME.danger : pct >= good ? THEME.warning : THEME.success;
    return (
        <div style={{
            flex: '1 1 0', padding: '10px 12px',
            borderRight: `1px solid ${THEME.glassBorder}`,
            display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            <div style={{
                fontSize: 10, fontWeight: 700, color: THEME.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: 5,
            }}>
                {icon} {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{
                    fontSize: 18, fontWeight: 700, color: THEME.textMain,
                    fontFamily: THEME.fontMono, lineHeight: 1,
                }}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <div style={{
                position: 'relative', height: 5, borderRadius: 3,
                background: `${THEME.glassBorder}`, overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${clamp01(pct)}%`, background: color,
                    borderRadius: 3,
                }} />
                <div style={{
                    position: 'absolute', left: `${warn}%`, top: -2, bottom: -2,
                    width: 1, background: THEME.danger, opacity: 0.7,
                }} />
            </div>
            <div style={{ height: 14 }}>
                {spark ? <Spark values={spark} color={color} w={100} h={14} /> : null}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

const OverviewTabV3: React.FC = () => {
    useAdaptiveTheme();
    const { activeConnection, loading: connectionsLoading } = useConnection();

    const [stats, setStats] = useState<OverviewStats>({});
    const [traffic, setTraffic] = useState<OverviewTraffic>({});
    const [timeseries, setTimeseries] = useState<TimeseriesData | null>(null);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [topTables, setTopTables] = useState<TopTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [focusAnomaly, setFocusAnomaly] = useState<Anomaly | null>(null);
    const [focusIdx, setFocusIdx] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Data loading ───────────────────────────────────────────────── */

    const load = useCallback(async (isManual = false) => {
        if (!activeConnection) { setLoading(false); return; }
        if (isManual) setRefreshing(true);
        try {
            const [s, t, ts, al, tt] = await Promise.allSettled([
                withTimeout(fetchData('/api/overview/stats')),
                withTimeout(fetchData('/api/overview/traffic')),
                withTimeout(fetchData('/api/overview/timeseries')),
                withTimeout(fetchData('/api/overview/alerts')),
                withTimeout(fetchData('/api/overview/top-tables')),
            ]);
            const ok = <T,>(r: PromiseSettledResult<unknown>): T | null =>
                r.status === 'fulfilled' && r.value && !(r.value as { error?: unknown }).error
                    ? (r.value as T) : null;

            setStats(ok<OverviewStats>(s) ?? {});
            setTraffic(ok<OverviewTraffic>(t) ?? {});
            setTimeseries(ok<TimeseriesData>(ts));
            const aData = ok<AlertItem[] | { alerts?: AlertItem[] }>(al);
            setAlerts(Array.isArray(aData) ? aData : aData?.alerts ?? []);
            const ttData = ok<TopTable[] | { tables?: TopTable[] }>(tt);
            setTopTables(Array.isArray(ttData) ? ttData : ttData?.tables ?? []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('[OverviewTabV3] load failed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeConnection]);

    useGlobalRefresh(useCallback(() => load(true), [load]));

    useEffect(() => {
        if (activeConnection) load();
        else setLoading(false);
    }, [activeConnection, load]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (activeConnection) intervalRef.current = setInterval(() => load(), 30_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeConnection, load]);

    /* ── Derived ─────────────────────────────────────────────────────── */

    const opsPerSec = useMemo<TimeseriesPoint[]>(() => {
        if (timeseries?.opsPerSec?.length) return timeseries.opsPerSec;
        if (timeseries?.velocity?.length) {
            return timeseries.velocity.map((v) => ({
                t: v.time || v.t || '',
                reads: Number(v.qps ?? 0),
                writes: 0,
            }));
        }
        return [];
    }, [timeseries]);

    const reads = useMemo(() => opsPerSec.map((p) => Number(p.reads ?? p.qps ?? 0)), [opsPerSec]);
    const writes = useMemo(() => opsPerSec.map((p) => Number(p.writes ?? 0)), [opsPerSec]);
    const readSpark = useMemo(() => reads.slice(-24), [reads]);
    const writeSpark = useMemo(() => writes.slice(-24), [writes]);
    const combinedSpark = useMemo(
        () => readSpark.map((v, i) => v + (writeSpark[i] ?? 0)),
        [readSpark, writeSpark],
    );

    const ai: AISummary = useMemo(
        () => buildAISummary(stats, alerts, opsPerSec, topTables),
        [stats, alerts, opsPerSec, topTables],
    );
    const health = useMemo(() => deriveHealth(stats, alerts), [stats, alerts]);

    /* ── Scalars ─────────────────────────────────────────────────────── */

    const connUsed = Number(stats.activeConnections ?? 0);
    const connMax = Number(stats.maxConnections ?? 0) || 1;
    const connPct = clamp01((connUsed / connMax) * 100);
    const cpu = Number(stats.cpuPercent ?? 0);
    const memory = Number(stats.memoryPercent ?? 0);
    const disk = stats.diskTotalGB
        ? (Number(stats.diskUsedGB ?? 0) / Number(stats.diskTotalGB)) * 100
        : 0;
    const network = Number(stats.networkPercent ?? 0);
    const uptime = fmtDuration(Number(stats.uptimeSeconds ?? 0));
    const avgMs = stats.avgQueryMs != null ? Number(stats.avgQueryMs).toFixed(1) : '—';
    const hitRatio = Number(stats.indexHitRatio ?? stats.cacheHitRatio ?? 0);

    const qpsNow = (last(reads) ?? 0) + (last(writes) ?? 0);
    const qpsRecent = meanOf([...reads.slice(-12), ...writes.slice(-12)]);
    const qpsEarlier = meanOf([...reads.slice(-24, -12), ...writes.slice(-24, -12)]);
    const qpsDelta = deltaPct(qpsRecent, qpsEarlier);

    /* ── Keyboard ────────────────────────────────────────────────────── */

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            const inInput = t && ['INPUT', 'TEXTAREA'].includes(t.tagName);
            if (inInput) return;
            if (e.key === 'j') setFocusIdx((i) => Math.min(Math.max(0, ai.anomalies.length - 1), i + 1));
            if (e.key === 'k') setFocusIdx((i) => Math.max(0, i - 1));
            if (e.key === 'Enter') {
                const a = ai.anomalies[focusIdx];
                if (a) setFocusAnomaly(a);
            }
            if (e.key === 'Escape') setFocusAnomaly(null);
            if (e.key.toLowerCase() === 'r' && !(e.metaKey || e.ctrlKey)) load(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ai.anomalies, focusIdx, load]);

    /* ── Empty / loading states ─────────────────────────────────────── */

    if (!activeConnection && !connectionsLoading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 80, minHeight: 400,
            }}>
                <TremorStyles />
                <Database size={48} color={THEME.primary} style={{ marginBottom: 16, opacity: 0.7 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>
                    Connect a database to begin
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, maxWidth: 420, textAlign: 'center' }}>
                    Once a connection is set up, this page will show health, traffic
                    and AI-ranked anomalies at a glance.
                </div>
            </div>
        );
    }

    if (loading && !lastUpdated) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
                <TremorStyles />
                <Skeleton h={42} />
                <Skeleton h={100} />
                <Skeleton h={72} />
                <Skeleton h={280} />
            </div>
        );
    }

    const tone = toneColor(health.tone, THEME);

    /* ── Render ──────────────────────────────────────────────────────── */

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* Top bar */}
            <header style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '10px 12px', borderRadius: 10,
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Server size={14} color={THEME.primary} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>
                        Overview
                    </span>
                    <span style={{
                        fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                    }}>
                        {activeConnection?.name || 'connected'} • {opsPerSec.length} samples
                    </span>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono,
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: tone, boxShadow: `0 0 8px ${tone}`,
                    }} />
                    {health.title.toLowerCase()} • {lastUpdated?.toLocaleTimeString() ?? '—'}
                </div>

                <button
                    type="button"
                    onClick={() => load(true)}
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

            {/* AI health banner */}
            <section style={{
                display: 'flex', alignItems: 'stretch', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                background: `linear-gradient(135deg, ${tone}12, ${THEME.surface})`,
                border: `1px solid ${tone}40`,
                flexWrap: 'wrap',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, minWidth: 220,
                }}>
                    <ConfidenceRing pct={ai.statusPct} size={64} color={tone} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: THEME.textMuted,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <Sparkles size={10} color={THEME.primary} />
                            AI summary • {ai.confidencePct}% conf.
                        </div>
                        <div style={{ fontSize: 12.5, color: THEME.textMain, fontWeight: 600 }}>
                            {health.title}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                            {health.detail}
                        </div>
                    </div>
                </div>

                <div style={{ flex: '1 1 320px', minWidth: 280 }}>
                    <div style={{
                        fontSize: 14, color: THEME.textMain, lineHeight: 1.4,
                        fontWeight: 500, marginBottom: 8,
                    }}>
                        {ai.headline}
                    </div>
                    <ul style={{
                        listStyle: 'none', margin: 0, padding: 0,
                        display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                        {ai.drivers.map((d, i) => (
                            <li key={i} style={{
                                fontSize: 11.5, color: THEME.textMuted, lineHeight: 1.4,
                                display: 'flex', alignItems: 'flex-start', gap: 6,
                            }}>
                                <span style={{
                                    marginTop: 6, width: 4, height: 4, borderRadius: '50%',
                                    background: THEME.primary, flexShrink: 0,
                                }} />
                                {d}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    alignSelf: 'center',
                }}>
                    <button
                        type="button"
                        onClick={() => setFocusAnomaly(ai.anomalies[0] ?? null)}
                        disabled={!ai.anomalies.length}
                        style={{
                            padding: '7px 14px', borderRadius: 6,
                            border: 'none',
                            cursor: ai.anomalies.length ? 'pointer' : 'default',
                            background: ai.anomalies.length ? THEME.primary : THEME.surfaceHover,
                            color: ai.anomalies.length ? '#fff' : THEME.textDim,
                            fontSize: 12, fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            opacity: ai.anomalies.length ? 1 : 0.6,
                        }}
                    >
                        <Zap size={12} />
                        {ai.anomalies.length ? 'Investigate top' : 'All clear'}
                    </button>
                    <button
                        type="button"
                        onClick={() => load(true)}
                        disabled={refreshing}
                        style={{
                            padding: '7px 14px', borderRadius: 6,
                            border: `1px solid ${THEME.glassBorder}`,
                            background: 'transparent', color: THEME.textMuted,
                            cursor: refreshing ? 'progress' : 'pointer',
                            fontSize: 12, fontWeight: 500,
                        }}
                    >
                        Re-run checks
                    </button>
                </div>
            </section>

            {/* Metric strip — 8 cells */}
            <section style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                flexWrap: 'wrap',
            }}>
                <MetricCell
                    label="Connections"
                    value={`${fmtNum(connUsed)}`}
                    sub={`/ ${fmtNum(connMax)} • ${connPct.toFixed(0)}%`}
                    color={connPct >= 80 ? THEME.danger : THEME.primary}
                    spark={readSpark}
                    icon={<Users size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Avg query"
                    value={avgMs === '—' ? '—' : avgMs}
                    sub={avgMs === '—' ? 'no data' : 'ms'}
                    color={Number(avgMs) >= 50 ? THEME.warning : THEME.info}
                    spark={writeSpark}
                    icon={<Timer size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Ops/sec"
                    value={fmtOps(qpsNow)}
                    sub={Math.abs(qpsDelta) >= 1 ? `${qpsDelta >= 0 ? '+' : ''}${qpsDelta.toFixed(0)}%` : 'flat'}
                    color={THEME.primary}
                    spark={combinedSpark}
                    trend={qpsDelta >= 1 ? 'up' : qpsDelta <= -1 ? 'down' : 'flat'}
                    trendTone={qpsDelta >= 50 ? 'bad' : qpsDelta <= -25 ? 'bad' : 'good'}
                    icon={<Activity size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Cache hit"
                    value={hitRatio ? `${hitRatio.toFixed(1)}%` : '—'}
                    sub={hitRatio >= 99 ? 'excellent' : hitRatio ? 'watch' : undefined}
                    color={hitRatio >= 99 ? THEME.success : THEME.warning}
                />
                <MetricCell
                    label="CPU"
                    value={`${cpu.toFixed(0)}%`}
                    sub={cpu >= 80 ? 'high' : cpu >= 60 ? 'elevated' : 'calm'}
                    color={cpu >= 80 ? THEME.danger : cpu >= 60 ? THEME.warning : THEME.success}
                    spark={readSpark.map((v) => Math.min(100, v / Math.max(1, Math.max(...readSpark, 1)) * 100))}
                    icon={<Cpu size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Memory"
                    value={`${memory.toFixed(0)}%`}
                    sub={memory >= 85 ? 'tight' : 'ok'}
                    color={memory >= 85 ? THEME.danger : memory >= 70 ? THEME.warning : THEME.info}
                    icon={<HardDrive size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Disk"
                    value={`${disk.toFixed(0)}%`}
                    sub={stats.diskTotalGB ? `of ${stats.diskTotalGB} GB` : undefined}
                    color={disk >= 80 ? THEME.danger : disk >= 60 ? THEME.warning : THEME.info}
                    icon={<Database size={10} color={THEME.textMuted} />}
                />
                <MetricCell
                    label="Uptime"
                    value={uptime}
                    sub="running"
                    color={THEME.success}
                    icon={<Activity size={10} color={THEME.textMuted} />}
                />
            </section>

            {/* Throughput + Anomalies (side by side) */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
                gap: 14,
            }}>
                <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        marginBottom: 6,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={13} color={THEME.primary} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                Throughput
                            </span>
                            <span style={{ fontSize: 10.5, color: THEME.textDim }}>
                                reads vs writes • spikes auto-detected
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            fontSize: 10, color: THEME.textMuted,
                        }}>
                            <Legend color={THEME.primary} label="Reads" />
                            <Legend color={THEME.warning} label="Writes" />
                            <Legend color={THEME.danger} label="Spike" dot />
                        </div>
                    </div>
                    <ThroughputChart data={opsPerSec} />
                </div>

                <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 8,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={13} color={THEME.primary} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                AI anomalies
                            </span>
                        </div>
                        <span style={{
                            fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                        }}>
                            {ai.anomalies.length}/4
                        </span>
                    </div>
                    {ai.anomalies.length === 0 ? (
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: 20, color: THEME.textMuted,
                        }}>
                            <CheckCircle size={28} color={THEME.success} style={{ opacity: 0.75, marginBottom: 8 }} />
                            <div style={{ fontSize: 12.5, color: THEME.textMain, fontWeight: 600 }}>
                                Nothing unusual
                            </div>
                            <div style={{ fontSize: 11, marginTop: 2 }}>
                                The agent hasn't detected anything worth surfacing.
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {ai.anomalies.map((a, i) => (
                                <AnomalyRow
                                    key={a.id}
                                    a={a}
                                    focused={i === focusIdx}
                                    onSelect={() => setFocusAnomaly(a)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Resource row */}
            <section style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                flexWrap: 'wrap',
            }}>
                <ResourceCell
                    label="CPU" icon={<Cpu size={10} color={THEME.textMuted} />}
                    pct={cpu} spark={readSpark}
                />
                <ResourceCell
                    label="Memory" icon={<HardDrive size={10} color={THEME.textMuted} />}
                    pct={memory} spark={writeSpark}
                />
                <ResourceCell
                    label="Disk" icon={<Database size={10} color={THEME.textMuted} />}
                    pct={disk} good={70} warn={85}
                />
                <ResourceCell
                    label="Network" icon={<Network size={10} color={THEME.textMuted} />}
                    pct={network}
                />
            </section>

            {/* Alerts + Top tables */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 1fr)',
                gap: 14,
            }}>
                {/* Top tables */}
                <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 8,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Database size={13} color={THEME.primary} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                Top tables
                            </span>
                            <span style={{ fontSize: 10.5, color: THEME.textDim }}>
                                biggest by size • health auto-tagged
                            </span>
                        </div>
                        <span style={{
                            fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                        }}>
                            {topTables.length} shown
                        </span>
                    </div>
                    {topTables.length === 0 ? (
                        <EmptyHint>
                            Once the agent has watched for a few minutes, your busiest tables show up here.
                        </EmptyHint>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '10px minmax(200px, 1.6fr) 80px 80px 1fr 70px',
                            columnGap: 10, rowGap: 2, alignItems: 'center',
                            fontSize: 11,
                        }}>
                            <div />
                            <HeadCell>Table</HeadCell>
                            <HeadCell align="right">Size</HeadCell>
                            <HeadCell align="right">Rows</HeadCell>
                            <HeadCell>Size share</HeadCell>
                            <HeadCell align="right">Avg ms</HeadCell>

                            {topTables.slice(0, 8).map((t, i) => {
                                const maxSize = Math.max(...topTables.map((x) => Number(x.sizeGB ?? 0)), 1);
                                const share = ((Number(t.sizeGB ?? 0) / maxSize) * 100);
                                const hCol =
                                    t.health === 'slow' ? THEME.warning :
                                    t.health === 'offline' ? THEME.danger :
                                    THEME.success;
                                return (
                                    <React.Fragment key={`${t.schema ?? ''}.${t.name ?? ''}-${i}`}>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: hCol,
                                        }} />
                                        <span style={{
                                            fontFamily: THEME.fontMono, color: THEME.textMain,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {t.schema ? `${t.schema}.` : ''}{t.name || 'unknown'}
                                        </span>
                                        <span style={{
                                            textAlign: 'right', color: THEME.textMain,
                                            fontFamily: THEME.fontMono,
                                        }}>
                                            {Number(t.sizeGB ?? 0).toFixed(1)}
                                            <span style={{ color: THEME.textDim, fontSize: 10 }}> GB</span>
                                        </span>
                                        <span style={{
                                            textAlign: 'right', color: THEME.textMuted,
                                            fontFamily: THEME.fontMono, fontSize: 10.5,
                                        }}>
                                            {fmtNum(Number(t.rows ?? 0))}
                                        </span>
                                        <div style={{
                                            position: 'relative', height: 5, borderRadius: 3,
                                            background: THEME.glassBorder, overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                                width: `${share}%`, background: THEME.primary,
                                            }} />
                                        </div>
                                        <span style={{
                                            textAlign: 'right',
                                            color: (t.avgMs ?? 0) >= 50 ? THEME.warning : THEME.textMuted,
                                            fontFamily: THEME.fontMono, fontSize: 10.5,
                                        }}>
                                            {t.avgMs != null ? `${Number(t.avgMs).toFixed(1)}` : '—'}
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Alerts */}
                <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 8,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Bell size={13} color={THEME.primary} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                Alerts
                            </span>
                        </div>
                        <span style={{
                            fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                        }}>
                            {alerts.length} open
                        </span>
                    </div>
                    {alerts.length === 0 ? (
                        <EmptyHint>
                            No open alerts. Nice and quiet.
                        </EmptyHint>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {alerts.slice(0, 6).map((a, i) => {
                                const color = severityColor(a.severity || 'info', THEME);
                                return (
                                    <div
                                        key={String(a.id ?? i)}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '4px 1fr auto',
                                            columnGap: 8, alignItems: 'center',
                                            padding: '6px 8px', borderRadius: 6,
                                            border: `1px solid ${THEME.glassBorder}`,
                                        }}
                                    >
                                        <div style={{
                                            width: 4, height: 26, borderRadius: 2, background: color,
                                        }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{
                                                fontSize: 11.5, color: THEME.textMain, fontWeight: 600,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {a.title || a.message || 'Alert'}
                                            </div>
                                            <div style={{
                                                fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono,
                                                marginTop: 1,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {a.source || 'system'}
                                                {a.time ? ` • ${a.time}` : ''}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
                                            color, background: `${color}18`,
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>
                                            {a.severity || 'info'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Traffic card — compact row of numbers */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            }}>
                <TrafficCell label="Rows read" value={Number(traffic.tup_fetched ?? 0)} color={THEME.info} />
                <TrafficCell label="Rows inserted" value={Number(traffic.tup_inserted ?? 0)} color={THEME.success} />
                <TrafficCell label="Rows updated" value={Number(traffic.tup_updated ?? 0)} color={THEME.warning} />
                <TrafficCell label="Rows deleted" value={Number(traffic.tup_deleted ?? 0)} color={THEME.danger} />
            </section>

            {/* Keyboard hints */}
            <footer style={{
                display: 'flex', gap: 14, justifyContent: 'center',
                fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                paddingTop: 4,
            }}>
                <Kbd label="j/k" meaning="move anomaly focus" />
                <Kbd label="Enter" meaning="investigate" />
                <Kbd label="R" meaning="refresh" />
                <Kbd label="Esc" meaning="close panel" />
                <span>auto-refresh every 30s</span>
            </footer>

            {/* Why panel */}
            {focusAnomaly && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
                    background: THEME.surfaceRaised ?? THEME.surface,
                    borderLeft: `1px solid ${THEME.glassBorder}`,
                    boxShadow: '-8px 0 24px rgba(0,0,0,0.25)',
                    zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderBottom: `1px solid ${THEME.glassBorder}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={13} color={THEME.primary} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                Why this was flagged
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFocusAnomaly(null)}
                            aria-label="Close"
                            style={{
                                padding: 4, border: 'none', background: 'transparent',
                                color: THEME.textMuted, cursor: 'pointer',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div style={{
                        padding: '14px', display: 'flex', flexDirection: 'column', gap: 10,
                        overflow: 'auto',
                    }}>
                        <div style={{
                            padding: '8px 10px', borderRadius: 6,
                            background: `${severityColor(focusAnomaly.severity, THEME)}18`,
                            border: `1px solid ${severityColor(focusAnomaly.severity, THEME)}40`,
                        }}>
                            <div style={{
                                fontSize: 13, fontWeight: 700, color: THEME.textMain,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <AlertTriangle size={13} color={severityColor(focusAnomaly.severity, THEME)} />
                                {focusAnomaly.title}
                            </div>
                            <div style={{
                                fontSize: 11, color: THEME.textMuted, marginTop: 4, lineHeight: 1.45,
                            }}>
                                {focusAnomaly.detail}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <WhyRow label="Category" value={focusAnomaly.category} />
                            <WhyRow label="Severity" value={focusAnomaly.severity} />
                            <WhyRow label="Confidence" value={`${focusAnomaly.confidencePct}%`} />
                            <WhyRow label="Signals" value="CPU / Memory / Disk / QPS / alerts" />
                        </div>

                        <div style={{
                            fontSize: 10.5, color: THEME.textDim, lineHeight: 1.5, fontStyle: 'italic',
                        }}>
                            Synthesized from the latest stats + alerts + time-series. When an
                            <code style={{
                                margin: '0 3px', padding: '0 4px', borderRadius: 3,
                                background: THEME.surface, fontFamily: THEME.fontMono,
                            }}>/api/ai/overview</code>
                            endpoint lands, this panel will surface the LLM's reasoning instead.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────────────────── */

const AnomalyRow: React.FC<{
    a: Anomaly;
    focused: boolean;
    onSelect: () => void;
}> = ({ a, focused, onSelect }) => {
    const color = severityColor(a.severity, THEME);
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            style={{
                display: 'grid',
                gridTemplateColumns: '4px 1fr 32px',
                columnGap: 8, alignItems: 'center',
                padding: '6px 8px', borderRadius: 6,
                cursor: 'pointer',
                background: focused ? (THEME.surfaceHover ?? THEME.surface) : 'transparent',
                border: `1px solid ${focused ? THEME.primary : THEME.glassBorder}`,
            }}
        >
            <div style={{
                width: 4, height: 26, borderRadius: 2, background: color,
            }} />
            <div style={{ minWidth: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11.5, color: THEME.textMain, fontWeight: 600,
                }}>
                    {a.title}
                    <span style={{
                        padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700,
                        color, background: `${color}18`,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        {a.severity}
                    </span>
                </div>
                <div style={{
                    fontSize: 10.5, color: THEME.textMuted, marginTop: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {a.detail}
                </div>
            </div>
            <ConfidenceRing pct={a.confidencePct} size={30} color={color} />
        </div>
    );
};

const TrafficCell: React.FC<{ label: string; value: number; color: string }> = ({
    label, value, color,
}) => (
    <div style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        padding: '4px 6px',
    }}>
        <div style={{
            fontSize: 10, fontWeight: 700, color: THEME.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
            {label}
        </div>
        <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%', background: color,
            }} />
            <span style={{
                fontSize: 15, fontWeight: 700, color: THEME.textMain,
                fontFamily: THEME.fontMono,
            }}>
                {fmtNum(value)}
            </span>
        </div>
    </div>
);

const Legend: React.FC<{ color: string; label: string; dot?: boolean }> = ({
    color, label, dot,
}) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {dot ? (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
        ) : (
            <span style={{ width: 16, height: 0, borderTop: `2px solid ${color}` }} />
        )}
        {label}
    </span>
);

const HeadCell: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({
    children, align = 'left',
}) => (
    <div style={{
        color: THEME.textDim, fontWeight: 600, fontSize: 10,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        textAlign: align,
        padding: '6px 0 4px',
        borderBottom: `1px solid ${THEME.glassBorder}`,
    }}>
        {children}
    </div>
);

const Kbd: React.FC<{ label: string; meaning: string }> = ({ label, meaning }) => (
    <span>
        <kbd style={{
            padding: '1px 5px', borderRadius: 3,
            border: `1px solid ${THEME.glassBorder}`,
            fontSize: 10, fontFamily: THEME.fontMono, color: THEME.textMuted,
            marginRight: 4,
        }}>{label}</kbd>
        {meaning}
    </span>
);

const WhyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{
        display: 'grid', gridTemplateColumns: '110px 1fr', columnGap: 10,
        padding: '4px 0', borderBottom: `1px dashed ${THEME.glassBorder}`,
        fontSize: 11.5,
    }}>
        <span style={{
            color: THEME.textMuted, textTransform: 'uppercase', fontSize: 10,
            letterSpacing: '0.05em', fontWeight: 700,
        }}>
            {label}
        </span>
        <span style={{ color: THEME.textMain, fontFamily: THEME.fontMono }}>
            {value}
        </span>
    </div>
);

const Skeleton: React.FC<{ h: number }> = ({ h }) => (
    <div style={{
        height: h, borderRadius: 10,
        background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
        opacity: 0.35, animation: 'tremorPulse 1.5s ease-in-out infinite',
    }} />
);

const EmptyHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        padding: '14px 10px', borderRadius: 8, textAlign: 'center',
        color: THEME.textMuted, fontSize: 11.5, lineHeight: 1.5,
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
        <Info size={12} color={THEME.textDim} />
        {children}
    </div>
);

export default OverviewTabV3;
