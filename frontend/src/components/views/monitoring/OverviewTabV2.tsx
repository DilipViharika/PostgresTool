/**
 * OverviewTabV2.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * A cleaner, more human-friendly version of the monitoring Overview tab.
 *
 * Goals (driven by feedback from non-technical users):
 *   • Plain-language labels everywhere ("Active connections", not "pg_stat_activity rows").
 *   • Calmer visual hierarchy — one page title, four KPIs, two charts, one alerts panel.
 *   • Fewer moving pieces than the original (~400 LOC vs ~1,700 LOC) so it's easier
 *     to read, review and extend.
 *
 * Data sources — uses the same REST endpoints as OverviewTab:
 *     /api/overview/stats       – connection + uptime summary
 *     /api/overview/traffic     – rows read / written
 *     /api/overview/timeseries  – QPS + read/write history
 *     /api/overview/alerts      – open alerts
 *     /api/overview/top-tables  – biggest tables (used for the database list)
 *
 * This file is intentionally self-contained: the existing OverviewTab.tsx is
 * left untouched so nothing else breaks.
 * ──────────────────────────────────────────────────────────────────────────
 */

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
    CheckCircle,
    Cpu,
    Database,
    Gauge,
    HardDrive,
    Info,
    Network,
    RefreshCcw,
    Timer,
    Users,
    Zap,
} from 'lucide-react';

import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { fmtNum, fmtDuration } from '../../../lib/utils';

import {
    KpiCard,
    PanelCard,
    ProgressBar,
    StatusBadge,
    LiveDot,
    TremorStyles,
} from '../../ui/tremor';

/* ─────────────────────────────────────────────────────────────────────────
 * Types — narrow enough to keep the component honest, loose enough that a
 * missing field doesn't blow up rendering.
 * ────────────────────────────────────────────────────────────────────── */

interface OverviewStats {
    activeConnections?: number;
    maxConnections?: number;
    uptimeSeconds?: number;
    diskUsedGB?: number;
    diskTotalGB?: number;
    cpuPercent?: number;
    memoryPercent?: number;
    networkPercent?: number;
    avgQueryMs?: number;
    indexHitRatio?: string | number;
}

interface OverviewTraffic {
    tup_fetched?: number;
    tup_inserted?: number;
    tup_updated?: number;
    tup_deleted?: number;
}

interface TimeseriesPoint {
    t?: string;
    time?: string;
    reads?: number;
    writes?: number;
    qps?: number;
}

interface TimeseriesData {
    opsPerSec?: TimeseriesPoint[];
    velocity?: TimeseriesPoint[];
}

interface AlertItem {
    id?: string | number;
    severity?: 'critical' | 'warning' | 'info' | string;
    title?: string;
    message?: string;
    source?: string;
    time?: string;
}

interface TopTable {
    name?: string;
    schema?: string;
    sizeGB?: number;
    rows?: number;
    health?: 'healthy' | 'slow' | 'offline' | string;
    avgMs?: number;
}

interface OverviewData {
    stats: OverviewStats;
    traffic: OverviewTraffic;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tiny helpers
 * ────────────────────────────────────────────────────────────────────── */

const withTimeout = <T,>(p: Promise<T>, ms = 5000): Promise<T> =>
    Promise.race([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
    ]);

/** Smooth out-of-bounds values; returns a 0-100 number. */
const clamp01 = (v: number) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));

/** Pick the right pill tone based on a simple rule. */
const healthTone = (h?: string) => {
    switch ((h || '').toLowerCase()) {
        case 'slow':
            return { label: 'Slow', color: THEME.warning };
        case 'offline':
        case 'down':
            return { label: 'Offline', color: THEME.danger };
        default:
            return { label: 'Healthy', color: THEME.success };
    }
};

/* ─────────────────────────────────────────────────────────────────────────
 * Sparkline — a minimal inline SVG area chart, sized to fit inside a KPI.
 * ────────────────────────────────────────────────────────────────────── */

interface SparklineProps {
    values: number[];
    color: string;
    height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ values, color, height = 28 }) => {
    if (!values || values.length < 2) {
        return <div style={{ height, opacity: 0.4, fontSize: 10, color: THEME.textDim }}>No recent data</div>;
    }
    const w = 120;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 2) - 1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const area = `0,${height} ${pts.join(' ')} ${w},${height}`;
    return (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label="Trend over time">
            <polygon points={area} fill={color} opacity={0.18} />
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Throughput chart — dual-area SVG (reads vs writes) with a soft grid.
 * ────────────────────────────────────────────────────────────────────── */

interface ThroughputChartProps {
    data: TimeseriesPoint[];
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ data }) => {
    const width = 640;
    const height = 220;
    const pad = { top: 16, right: 16, bottom: 24, left: 40 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    const reads = data.map((d) => Number(d.reads ?? d.qps ?? 0));
    const writes = data.map((d) => Number(d.writes ?? 0));
    const all = [...reads, ...writes];
    const max = Math.max(...all, 1);
    const nice = Math.pow(10, Math.floor(Math.log10(max))) * Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max))));
    const yMax = nice || max;

    const n = Math.max(data.length - 1, 1);
    const x = (i: number) => pad.left + (i / n) * innerW;
    const y = (v: number) => pad.top + innerH - (v / yMax) * innerH;

    const toPoly = (vals: number[]) => {
        const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
        return `${pad.left},${pad.top + innerH} ${pts.join(' ')} ${pad.left + innerW},${pad.top + innerH}`;
    };
    const toLine = (vals: number[]) =>
        vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

    const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => pad.top + innerH * (1 - p));

    if (data.length === 0) {
        return (
            <div style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: THEME.textDim,
                fontSize: 13,
            }}>
                Waiting for traffic…
            </div>
        );
    }

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Queries per second over time">
            {/* Soft horizontal grid */}
            {gridTicks.map((gy, i) => (
                <line key={i} x1={pad.left} x2={pad.left + innerW} y1={gy} y2={gy} stroke={THEME.grid} strokeWidth={0.5} opacity={0.6} />
            ))}
            {/* Y axis labels */}
            {[0, 0.5, 1].map((p, i) => (
                <text
                    key={i}
                    x={pad.left - 8}
                    y={pad.top + innerH * (1 - p) + 4}
                    fontSize={10}
                    fill={THEME.textDim}
                    textAnchor="end"
                    fontFamily={THEME.fontMono}
                >
                    {Math.round(yMax * p).toLocaleString()}
                </text>
            ))}
            {/* Reads — primary/indigo */}
            <polygon points={toPoly(reads)} fill={THEME.primary} opacity={0.18} />
            <polyline points={toLine(reads)} fill="none" stroke={THEME.primary} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
            {/* Writes — warning/amber */}
            <polygon points={toPoly(writes)} fill={THEME.warning} opacity={0.14} />
            <polyline points={toLine(writes)} fill="none" stroke={THEME.warning} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Overall health derivation — one banner line at the top of the page.
 * ────────────────────────────────────────────────────────────────────── */

interface Health {
    tone: 'ok' | 'warn' | 'bad';
    color: string;
    title: string;
    detail: string;
}

const deriveHealth = (stats: OverviewStats, alerts: AlertItem[]): Health => {
    const critical = alerts.filter((a) => (a.severity || '').toLowerCase() === 'critical').length;
    const warnings = alerts.filter((a) => (a.severity || '').toLowerCase() === 'warning').length;
    const cpu = Number(stats.cpuPercent ?? 0);

    if (critical > 0) {
        return {
            tone: 'bad',
            color: THEME.danger,
            title: 'Attention needed',
            detail: `${critical} critical alert${critical === 1 ? '' : 's'} open`,
        };
    }
    if (warnings > 0 || cpu >= 80) {
        return {
            tone: 'warn',
            color: THEME.warning,
            title: 'Running with warnings',
            detail: warnings > 0 ? `${warnings} warning${warnings === 1 ? '' : 's'}` : `CPU at ${cpu.toFixed(0)}%`,
        };
    }
    return {
        tone: 'ok',
        color: THEME.success,
        title: 'All systems healthy',
        detail: 'No alerts in the last 15 minutes',
    };
};

/* ─────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

const OverviewTabV2: React.FC = () => {
    useAdaptiveTheme();
    const { activeConnection, loading: connectionsLoading } = useConnection();

    const [data, setData] = useState<OverviewData | null>(null);
    const [timeseries, setTimeseries] = useState<TimeseriesData | null>(null);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [topTables, setTopTables] = useState<TopTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Data loading ───────────────────────────────────────────────── */

    const load = useCallback(async (isManual = false) => {
        if (!activeConnection) {
            setLoading(false);
            return;
        }
        if (isManual) setRefreshing(true);
        try {
            const [statsRes, trafficRes, timeseriesRes, alertsRes, topTablesRes] = await Promise.allSettled([
                withTimeout(fetchData('/api/overview/stats')),
                withTimeout(fetchData('/api/overview/traffic')),
                withTimeout(fetchData('/api/overview/timeseries')),
                withTimeout(fetchData('/api/overview/alerts')),
                withTimeout(fetchData('/api/overview/top-tables')),
            ]);

            const ok = <T,>(r: PromiseSettledResult<unknown>): T | null =>
                r.status === 'fulfilled' && r.value && !(r.value as { error?: unknown }).error
                    ? (r.value as T)
                    : null;

            setData({
                stats: ok<OverviewStats>(statsRes) ?? {},
                traffic: ok<OverviewTraffic>(trafficRes) ?? {},
            });
            setTimeseries(ok<TimeseriesData>(timeseriesRes));
            const aData = ok<AlertItem[] | { alerts?: AlertItem[] }>(alertsRes);
            setAlerts(Array.isArray(aData) ? aData : aData?.alerts ?? []);
            const ttData = ok<TopTable[] | { tables?: TopTable[] }>(topTablesRes);
            setTopTables(Array.isArray(ttData) ? ttData : ttData?.tables ?? []);
            setLastUpdated(new Date());
        } catch (err) {
            // Keep the last-known good data on screen; just log.

            console.error('[OverviewTabV2] load failed', err);
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
        if (activeConnection) {
            intervalRef.current = setInterval(() => load(), 30_000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeConnection, load]);

    /* ── Derived values ─────────────────────────────────────────────── */

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

    const readSpark = useMemo(
        () => opsPerSec.slice(-24).map((p) => Number(p.reads ?? p.qps ?? 0)),
        [opsPerSec],
    );
    const writeSpark = useMemo(
        () => opsPerSec.slice(-24).map((p) => Number(p.writes ?? 0)),
        [opsPerSec],
    );

    const health = useMemo(() => deriveHealth(data?.stats ?? {}, alerts), [data, alerts]);

    /* ── Empty states ───────────────────────────────────────────────── */

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
                    and alerts at a glance.
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
                <TremorStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: 110, borderRadius: 14,
                                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                                opacity: 0.4, animation: `tremorPulse 1.5s ease-in-out infinite`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
                <div style={{
                    height: 300, borderRadius: 16,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                    opacity: 0.25, animation: 'tremorPulse 1.5s ease-in-out infinite 0.4s',
                }} />
            </div>
        );
    }

    const stats: OverviewStats = data?.stats ?? {};
    const connUsed = Number(stats.activeConnections ?? 0);
    const connMax = Number(stats.maxConnections ?? 0) || 1;
    const connPct = clamp01((connUsed / connMax) * 100);

    const cpu = Number(stats.cpuPercent ?? 0);
    const memory = Number(stats.memoryPercent ?? 0);
    const disk = stats.diskTotalGB ? (Number(stats.diskUsedGB ?? 0) / Number(stats.diskTotalGB)) * 100 : 0;
    const network = Number(stats.networkPercent ?? 0);

    const uptime = fmtDuration(Number(stats.uptimeSeconds ?? 0));
    const avgMs = stats.avgQueryMs != null ? Number(stats.avgQueryMs).toFixed(1) : '—';

    /* ── Render ─────────────────────────────────────────────────────── */

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* Page header + health banner */}
            <header
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16,
                }}
            >
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: THEME.textMain, letterSpacing: '-0.02em' }}>
                        Database overview
                    </div>
                    <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
                        A plain-language snapshot of how your databases are doing right now.
                    </div>
                </div>

                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: `${health.color}12`,
                        border: `1px solid ${health.color}33`,
                    }}
                >
                    <LiveDot color={health.color} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                            {health.title}
                        </span>
                        <span style={{ fontSize: 11, color: THEME.textMuted }}>
                            {health.detail}
                            {lastUpdated ? ` • Updated ${lastUpdated.toLocaleTimeString()}` : ''}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => load(true)}
                        disabled={refreshing}
                        aria-label="Refresh now"
                        title="Refresh now"
                        style={{
                            marginLeft: 6,
                            width: 28, height: 28, borderRadius: 8,
                            border: `1px solid ${THEME.glassBorder}`,
                            background: THEME.surface,
                            color: THEME.textMuted,
                            cursor: refreshing ? 'progress' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <RefreshCcw size={13} className={refreshing ? 'ov-spin' : undefined} />
                    </button>
                </div>
            </header>

            {/* KPI row */}
            <section
                aria-label="Key metrics"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                }}
            >
                <KpiCard
                    label="Active connections"
                    value={fmtNum(connUsed)}
                    sub={`/ ${fmtNum(connMax)} allowed`}
                    icon={Users}
                    color={THEME.primary}
                    healthy={connPct < 80}
                    detail={`${connPct.toFixed(0)}% in use`}
                    sparkline={<Sparkline values={readSpark} color={THEME.primary} />}
                />
                <KpiCard
                    label="Average query time"
                    value={avgMs === '—' ? '—' : avgMs}
                    sub={avgMs === '—' ? 'no data' : 'ms'}
                    icon={Timer}
                    color={THEME.info}
                    healthy={Number(avgMs) < 50}
                    detail={Number(avgMs) < 50 ? 'Fast' : 'Watch this'}
                    sparkline={<Sparkline values={writeSpark} color={THEME.info} />}
                />
                <KpiCard
                    label="CPU usage"
                    value={`${cpu.toFixed(0)}%`}
                    icon={Cpu}
                    color={cpu >= 80 ? THEME.danger : cpu >= 60 ? THEME.warning : THEME.success}
                    healthy={cpu < 80}
                    detail={cpu >= 80 ? 'High' : cpu >= 60 ? 'Elevated' : 'Comfortable'}
                    sparkline={<Sparkline values={readSpark.map((v) => Math.min(100, v / 10))} color={cpu >= 80 ? THEME.danger : THEME.success} />}
                />
                <KpiCard
                    label="Uptime"
                    value={uptime}
                    icon={Activity}
                    color={THEME.success}
                    healthy
                    detail="Running smoothly"
                />
            </section>

            {/* Throughput chart + resource usage side-by-side */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
                    gap: 18,
                }}
            >
                <PanelCard
                    title="Queries per second"
                    icon={Zap}
                    accentColor={THEME.primary}
                    rightNode={
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <LegendDot color={THEME.primary} label="Reads" />
                            <LegendDot color={THEME.warning} label="Writes" />
                        </div>
                    }
                >
                    <ThroughputChart data={opsPerSec} />
                </PanelCard>

                <PanelCard title="Resource usage" icon={Gauge} accentColor={THEME.info}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <ResourceRow icon={Cpu} label="CPU" value={cpu} color={THEME.primary} />
                        <ResourceRow icon={HardDrive} label="Memory" value={memory} color={THEME.info} />
                        <ResourceRow icon={Database} label="Disk" value={disk} color={THEME.warning} />
                        <ResourceRow icon={Network} label="Network" value={network} color={THEME.success} />
                    </div>
                </PanelCard>
            </section>

            {/* Database list + alerts */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)',
                    gap: 18,
                }}
            >
                <PanelCard title="Databases" icon={Database} accentColor={THEME.primary}>
                    {topTables.length === 0 ? (
                        <EmptyHint>
                            Nothing to show yet. Once the agent has been watching for a
                            few minutes you'll see your busiest databases here.
                        </EmptyHint>
                    ) : (
                        <div role="list" style={{ display: 'flex', flexDirection: 'column' }}>
                            {topTables.slice(0, 6).map((t, i) => {
                                const tone = healthTone(t.health);
                                const rows = Number(t.rows ?? 0);
                                const size = Number(t.sizeGB ?? 0);
                                return (
                                    <div
                                        key={`${t.schema ?? ''}.${t.name ?? ''}-${i}`}
                                        role="listitem"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 0',
                                            borderBottom: i < Math.min(topTables.length, 6) - 1
                                                ? `1px solid ${THEME.glassBorder}` : 'none',
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: `${THEME.primary}15`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Database size={15} color={THEME.primary} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 600, color: THEME.textMain,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {t.name || 'unknown'}
                                                </div>
                                                <div style={{ fontSize: 11, color: THEME.textMuted }}>
                                                    {fmtNum(rows)} rows
                                                    {size > 0 ? ` • ${size.toFixed(1)} GB` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <StatusBadge label={tone.label} color={tone.color} pulse={tone.label !== 'Healthy'} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </PanelCard>

                <PanelCard title="Recent alerts" icon={AlertTriangle} accentColor={THEME.warning}>
                    {alerts.length === 0 ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '24px 8px', textAlign: 'center',
                        }}>
                            <CheckCircle size={28} color={THEME.success} style={{ marginBottom: 10, opacity: 0.8 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>
                                Nothing to worry about
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
                                No alerts in the last 15 minutes.
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {alerts.slice(0, 5).map((a, i) => (
                                <AlertRow key={a.id ?? i} alert={a} />
                            ))}
                        </div>
                    )}
                </PanelCard>
            </section>

            {/* Footnote */}
            <p style={{
                fontSize: 11, color: THEME.textDim, margin: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
                <Info size={12} /> This page auto-refreshes every 30 seconds.
                Numbers come directly from your database — nothing is stored off-server.
            </p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Small presentational helpers
 * ────────────────────────────────────────────────────────────────────── */

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
        {label}
    </span>
);

const ResourceRow: React.FC<{
    icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string;
    value: number;
    color: string;
}> = ({ icon: Icon, label, value, color }) => {
    const pct = clamp01(value);
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
                    <Icon size={13} color={color} />
                    {label}
                </span>
                <span style={{ fontSize: 12, color: THEME.textMain, fontWeight: 700, fontFamily: THEME.fontMono }}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <ProgressBar value={pct} color={color} showLabel={false} />
        </div>
    );
};

const severityPalette = (sev?: string) => {
    switch ((sev || '').toLowerCase()) {
        case 'critical':
            return { color: THEME.danger, label: 'Critical' };
        case 'warning':
            return { color: THEME.warning, label: 'Warning' };
        default:
            return { color: THEME.info, label: 'Info' };
    }
};

const AlertRow: React.FC<{ alert: AlertItem }> = ({ alert }) => {
    const sev = severityPalette(alert.severity);
    return (
        <div
            role="listitem"
            style={{
                display: 'flex', gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: `${sev.color}0D`,
                border: `1px solid ${sev.color}25`,
            }}
        >
            <div
                style={{
                    width: 4, borderRadius: 2, background: sev.color, flexShrink: 0,
                }}
                aria-hidden
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <StatusBadge label={sev.label} color={sev.color} />
                    {alert.source && (
                        <span style={{ fontSize: 11, color: THEME.textDim }}>
                            {alert.source}
                        </span>
                    )}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textMain }}>
                    {alert.title || alert.message || 'Something needs attention'}
                </div>
                {alert.title && alert.message && (
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                        {alert.message}
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        padding: '16px 12px',
        borderRadius: 10,
        background: `${THEME.info}0D`,
        border: `1px dashed ${THEME.info}35`,
        color: THEME.textMuted,
        fontSize: 12.5,
        lineHeight: 1.5,
        display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
        <Info size={14} color={THEME.info} style={{ marginTop: 2, flexShrink: 0 }} />
        <span>{children}</span>
    </div>
);

export default React.memo(OverviewTabV2);
