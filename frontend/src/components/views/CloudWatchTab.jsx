import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
    Cloud, RefreshCw, AlertTriangle, CheckCircle, Info,
    Cpu, Database, HardDrive, Activity, Server, ArrowUpDown,
    Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────
   THEME — built per render from isDark flag
   ───────────────────────────────────────────────────────────────── */
const buildTheme = (isDark) => ({
    /* Semantic accent colours (same in both modes — they're vivid accents) */
    primary:      isDark ? '#00D4FF' : '#0ea5e9',
    secondary:    isDark ? '#2AFFD4' : '#10b981',
    success:      isDark ? '#2EE89C' : '#22c55e',
    danger:       isDark ? '#FF4560' : '#ef4444',
    warning:      isDark ? '#FFB520' : '#f59e0b',
    info:         isDark ? '#5BB8F5' : '#3b82f6',
    ai:           isDark ? '#B88BFF' : '#8b5cf6',
    /* Backgrounds */
    bg:           isDark ? '#07030D' : '#f0f4f8',
    surface:      isDark ? '#120A1F' : '#ffffff',
    surfaceHover: isDark ? '#1A1029' : '#f1f5f9',
    glass:        isDark ? 'rgba(18,10,31,0.65)'    : 'rgba(255,255,255,0.85)',
    glassHeavy:   isDark ? 'rgba(7,3,13,0.95)'      : 'rgba(255,255,255,0.97)',
    glassBorder:  isDark ? 'rgba(0,212,255,0.12)'   : 'rgba(0,0,0,0.08)',
    /* Typography */
    textMain:  isDark ? '#F0ECF8' : '#0f172a',
    textMuted: isDark ? '#9888B4' : '#64748b',
    textDim:   isDark ? '#4A3A5E' : '#94a3b8',
    /* Fonts */
    fontMono:  `'JetBrains Mono', 'Fira Code', monospace`,
    fontBody:  `'DM Sans', system-ui, sans-serif`,
});

/* ── Helpers ── */
const fmt = {
    bytes: (b) => {
        if (b === null) return '—';
        const gb = b / 1073741824;
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        return `${(b / 1048576).toFixed(0)} MB`;
    },
    pct:   (v) => v === null ? '—' : `${v.toFixed(1)}%`,
    count: (v) => v === null ? '—' : Math.round(v).toLocaleString(),
    ms:    (v) => v === null ? '—' : `${(v * 1000).toFixed(2)} ms`,
    iops:  (v) => v === null ? '—' : `${v.toFixed(0)} IOPS`,
    mbps:  (v) => v === null ? '—' : `${(v / 1048576).toFixed(2)} MB/s`,
    load:  (v) => v === null ? '—' : v.toFixed(2),
    time:  (ts) => {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
};

/* Metric definitions — accent colours are vivid and work in both themes */
const METRIC_DEFS = [
    { key: 'CPUUtilization',           label: 'CPU Utilization', unit: '%',      format: fmt.pct,   icon: Cpu,        colorKey: 'primary',   thresholds: { warn: 70, danger: 90 },      description: 'Percentage of CPU used' },
    { key: 'DatabaseConnections',      label: 'DB Connections',  unit: 'count',  format: fmt.count, icon: Database,   colorKey: 'secondary', thresholds: null,                          description: 'Active database connections' },
    { key: 'FreeableMemory',           label: 'Freeable Memory', unit: 'GB',     format: fmt.bytes, icon: Server,     colorKey: 'success',   thresholds: null,   invertColor: true,     description: 'Available RAM' },
    { key: 'ReadIOPS',                 label: 'Read IOPS',       unit: 'IOPS',   format: fmt.iops,  icon: HardDrive,  colorKey: 'info',      thresholds: null,                          description: 'Read I/O operations per second' },
    { key: 'WriteIOPS',                label: 'Write IOPS',      unit: 'IOPS',   format: fmt.iops,  icon: HardDrive,  colorKey: 'ai',        thresholds: null,                          description: 'Write I/O operations per second' },
    { key: 'ReadLatency',              label: 'Read Latency',    unit: 'ms',     format: fmt.ms,    icon: Clock,      colorKey: 'warning',   thresholds: { warn: 0.02, danger: 0.1 },   description: 'Average read latency' },
    { key: 'FreeStorageSpace',         label: 'Free Storage',    unit: 'GB',     format: fmt.bytes, icon: HardDrive,  colorKey: 'success',   thresholds: null,   invertColor: true,     description: 'Available storage space' },
    { key: 'NetworkReceiveThroughput', label: 'Network In',      unit: 'MB/s',   format: fmt.mbps,  icon: ArrowUpDown,colorKey: 'primary',   thresholds: null,                          description: 'Incoming network traffic' },
    { key: 'DBLoad',                   label: 'DB Load',         unit: 'vCPU',   format: fmt.load,  icon: Activity,   colorKey: 'danger',    thresholds: { warn: 2, danger: 4 },        description: 'Active sessions (DB Load)' },
];

const REFRESH_OPTIONS = [
    { label: '30s',  value: 30000 },
    { label: '1m',   value: 60000 },
    { label: '5m',   value: 300000 },
    { label: '15m',  value: 900000 },
    { label: 'Off',  value: 0 },
];

const RANGE_OPTIONS = [
    { label: '1h',  value: 3600 },
    { label: '6h',  value: 21600 },
    { label: '24h', value: 86400 },
    { label: '7d',  value: 604800 },
];

/* Single shared keyframes — injected once */
const CW_STYLES = `
    @keyframes cwShimmer { 0% { background-position: -300% 0; } 100% { background-position: 300% 0; } }
    @keyframes cwSpin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes cwFadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

/* ── Tooltip ── */
const CWTooltip = ({ active, payload, label, unit, T }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: T.glassHeavy, border: `1px solid ${T.glassBorder}`,
            borderRadius: 8, padding: '8px 14px',
            fontSize: 12, color: T.textMain, fontFamily: T.fontBody,
        }}>
            <div style={{ color: T.textMuted, marginBottom: 4 }}>{label}</div>
            <div style={{ color: T.primary, fontWeight: 600 }}>
                {payload[0]?.value?.toFixed(3)} {unit}
            </div>
        </div>
    );
};

/* ── Setup Guide ── */
const SetupGuide = ({ T }) => (
    <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto', animation: 'cwFadeUp 0.5s ease-out forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                background: `radial-gradient(circle, ${T.primary}20, ${T.primary}05)`,
                border: `1px solid ${T.primary}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${T.primary}20`,
            }}>
                <Cloud size={36} color={T.primary} />
            </div>
            <h2 style={{ fontFamily: T.fontBody, fontSize: 26, fontWeight: 700, color: T.textMain, marginBottom: 10 }}>
                Connect AWS CloudWatch
            </h2>
            <p style={{ color: T.textMuted, fontSize: 15, maxWidth: 520, margin: '0 auto', fontFamily: T.fontBody }}>
                Monitor your RDS PostgreSQL instance with native AWS CloudWatch metrics — no agent required.
            </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {['Real-time RDS metrics', 'Historical trending', 'Cross-region support', 'No agent required'].map(b => (
                <span key={b} style={{
                    padding: '5px 14px', borderRadius: 9999,
                    background: `${T.primary}12`, border: `1px solid ${T.primary}30`,
                    color: T.primary, fontSize: 12, fontWeight: 600, fontFamily: T.fontBody,
                }}>{b}</span>
            ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Setup Steps */}
            <div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 28 }}>
                <h3 style={{ color: T.textMain, fontSize: 15, fontWeight: 600, marginBottom: 24, fontFamily: T.fontBody }}>Setup Guide</h3>
                {[
                    { n: 1, title: 'Set environment variables', desc: 'Add these to your backend .env file:', code: `AWS_ACCESS_KEY_ID=AKIAxxx\nAWS_SECRET_ACCESS_KEY=xxx\nAWS_REGION=us-east-1\nCLOUDWATCH_DB_IDENTIFIER=my-postgres-db` },
                    { n: 2, title: 'Restart VIGIL backend',     desc: 'The server reads credentials at startup.', code: null },
                    { n: 3, title: 'Return to this screen',     desc: 'Metrics will load automatically once configured.', code: null },
                ].map(step => (
                    <div key={step.n} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: `${T.primary}20`, border: `1px solid ${T.primary}45`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: T.primary, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody,
                        }}>{step.n}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: T.textMain, fontSize: 14, fontWeight: 600, marginBottom: 4, fontFamily: T.fontBody }}>{step.title}</div>
                            <div style={{ color: T.textMuted, fontSize: 13, marginBottom: step.code ? 10 : 0, fontFamily: T.fontBody }}>{step.desc}</div>
                            {step.code && (
                                <pre style={{
                                    background: T.bg, border: `1px solid ${T.glassBorder}`,
                                    borderRadius: 8, padding: '12px 14px', fontSize: 11,
                                    color: T.secondary, fontFamily: T.fontMono,
                                    margin: 0, overflowX: 'auto', lineHeight: 1.7,
                                }}>{step.code}</pre>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* What You'll See */}
            <div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 28 }}>
                <h3 style={{ color: T.textMain, fontSize: 15, fontWeight: 600, marginBottom: 20, fontFamily: T.fontBody }}>What You'll See</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { icon: Cpu,        label: 'CPU Utilization',   color: T.primary   },
                        { icon: Database,   label: 'DB Connections',    color: T.secondary },
                        { icon: Server,     label: 'Freeable Memory',   color: T.success   },
                        { icon: HardDrive,  label: 'Read / Write IOPS', color: T.info      },
                        { icon: Clock,      label: 'Read Latency',      color: T.warning   },
                        { icon: HardDrive,  label: 'Free Storage',      color: T.success   },
                        { icon: ArrowUpDown,label: 'Network I/O',       color: T.primary   },
                        { icon: Activity,   label: 'DB Load',           color: T.danger    },
                    ].map(({ icon: Icon, label, color }) => (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 10,
                            background: `${color}08`, border: `1px solid ${color}20`,
                        }}>
                            <Icon size={14} color={color} />
                            <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody }}>{label}</span>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: 24, padding: '14px 16px', borderRadius: 10,
                    background: `${T.info}10`, border: `1px solid ${T.info}25`,
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                    <Info size={14} color={T.info} style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, fontFamily: T.fontBody }}>
                        Requires IAM permissions:{' '}
                        <code style={{ color: T.info, fontFamily: T.fontMono }}>cloudwatch:GetMetricStatistics</code>
                        {' '}and{' '}
                        <code style={{ color: T.info, fontFamily: T.fontMono }}>cloudwatch:ListMetrics</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ── Metric Card ── */
const MetricCard = ({ def, datapoints, metricsLoading, T }) => {
    const current   = datapoints?.length ? datapoints[datapoints.length - 1]?.value : null;
    const chartData = (datapoints || []).map(d => ({ t: fmt.time(d.timestamp), v: d.value }));
    const color     = T[def.colorKey] ?? T.primary;

    const valueColor = (() => {
        if (!def.thresholds || current === null || def.invertColor) return color;
        if (current >= def.thresholds.danger) return T.danger;
        if (current >= def.thresholds.warn)   return T.warning;
        return T.success;
    })();

    const isLoading = metricsLoading && !datapoints;

    return (
        <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            borderTop: `2px solid ${color}40`, borderRadius: 14, padding: '18px 20px',
            transition: 'all 0.3s ease',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `${color}15`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <def.icon size={14} color={color} />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: T.fontBody }}>
                        {def.label}
                    </div>
                    <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontBody }}>{def.description}</div>
                </div>
            </div>

            {/* Value */}
            {isLoading ? (
                <div style={{
                    height: 36, borderRadius: 8, marginBottom: 14,
                    background: `linear-gradient(90deg, ${T.surface} 20%, ${T.surfaceHover} 50%, ${T.surface} 80%)`,
                    backgroundSize: '300% 100%', animation: 'cwShimmer 2s infinite',
                }} />
            ) : (
                <div style={{
                    fontFamily: T.fontBody, fontWeight: 700, fontSize: 26,
                    color: valueColor, marginBottom: 14, lineHeight: 1,
                    textShadow: `0 0 20px ${valueColor}40`,
                }}>
                    {current !== null
                        ? def.format(current)
                        : <span style={{ color: T.textDim, fontSize: 16, fontWeight: 400 }}>No data</span>
                    }
                </div>
            )}

            {/* Sparkline */}
            {isLoading ? (
                <div style={{
                    height: 60, borderRadius: 6,
                    background: `linear-gradient(90deg, ${T.surface} 20%, ${T.surfaceHover} 50%, ${T.surface} 80%)`,
                    backgroundSize: '300% 100%', animation: 'cwShimmer 2.5s infinite',
                }} />
            ) : chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.glassBorder} vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis hide />
                        <Tooltip content={<CWTooltip unit={def.unit} T={T} />} />
                        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: color }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontBody }}>Insufficient data</span>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function CloudWatchTab() {
    const { isDark } = useTheme();
    const T = buildTheme(isDark);

    const [status, setStatus]                 = useState(null);
    const [metrics, setMetrics]               = useState({});
    const [initialLoading, setInitialLoading] = useState(true);   // only true on first mount
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [error, setError]                   = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(300000); // default 5 minutes
    const [customInterval, setCustomInterval]   = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [timeRange, setTimeRange]             = useState(3600);
    const [lastRefresh, setLastRefresh]         = useState(null);
    const timerRef = useRef(null);

    /* Check if CloudWatch is configured — only shows spinner on initial load */
    const checkStatus = useCallback(async (isInit = false) => {
        try {
            if (isInit) setInitialLoading(true);
            setError(null);
            const res = await fetch('/api/cloudwatch/status', {
                headers: { Authorization: `Bearer ${localStorage.getItem('vigil_token')}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setStatus(await res.json());
        } catch (e) {
            setError(e.message);
            setStatus({ configured: false });
        } finally {
            if (isInit) setInitialLoading(false);
        }
    }, []);

    /* Fetch all metrics in parallel */
    const fetchMetrics = useCallback(async () => {
        if (!status?.configured) return;
        setMetricsLoading(true);
        try {
            const results = await Promise.allSettled(
                METRIC_DEFS.map(async (def) => {
                    const res = await fetch(
                        `/api/cloudwatch/metrics?metric=${def.key}&period=${timeRange}`,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('vigil_token')}` } }
                    );
                    const d = res.ok ? await res.json() : {};
                    return [def.key, d.datapoints || []];
                })
            );
            const map = {};
            results.forEach(r => { if (r.status === 'fulfilled') map[r.value[0]] = r.value[1]; });
            setMetrics(map);
            setLastRefresh(new Date());
        } catch (e) {
            console.error('[CloudWatchTab] fetchMetrics error:', e);
        } finally {
            setMetricsLoading(false);
        }
    }, [status, timeRange]);

    /* Initial mount */
    useEffect(() => { checkStatus(true); }, [checkStatus]);

    /* Fetch when configured + time range changes */
    useEffect(() => {
        if (status?.configured) fetchMetrics();
    }, [status, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Auto-refresh */
    useEffect(() => {
        clearInterval(timerRef.current);
        if (refreshInterval > 0 && status?.configured) {
            timerRef.current = setInterval(fetchMetrics, refreshInterval);
        }
        return () => clearInterval(timerRef.current);
    }, [refreshInterval, fetchMetrics, status]);

    /* Shared keyframes — injected once */
    const styles = <style>{CW_STYLES}</style>;

    /* ── Loading (initial only) ── */
    if (initialLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, fontFamily: T.fontBody }}>
                {styles}
                <RefreshCw size={18} color={T.primary} style={{ animation: 'cwSpin 1s linear infinite' }} />
                <span style={{ color: T.textMuted, fontSize: 14 }}>Checking CloudWatch configuration…</span>
            </div>
        );
    }

    /* ── Not configured ── */
    if (!status?.configured) {
        return (
            <div style={{ minHeight: '100%', background: 'transparent' }}>
                {styles}
                {error && (
                    <div style={{
                        margin: '16px 24px 0', padding: '12px 16px', borderRadius: 10,
                        background: `${T.warning}10`, border: `1px solid ${T.warning}30`,
                        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: T.fontBody,
                    }}>
                        <AlertTriangle size={14} color={T.warning} />
                        <span style={{ color: T.warning }}>Could not reach backend: {error}</span>
                    </div>
                )}
                <SetupGuide T={T} />
            </div>
        );
    }

    /* ── Dashboard ── */
    return (
        <div style={{ padding: '20px 24px', minHeight: '100%', fontFamily: T.fontBody }}>
            {styles}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${T.primary}15`, border: `1px solid ${T.primary}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Cloud size={18} color={T.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: T.textMain }}>CloudWatch Metrics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, alignItems: 'center' }}>
                            {status.region && (
                                <span style={{ padding: '2px 8px', borderRadius: 9999, background: `${T.secondary}12`, border: `1px solid ${T.secondary}25`, color: T.secondary, fontSize: 11, fontFamily: T.fontMono }}>
                                    {status.region}
                                </span>
                            )}
                            {status.dbIdentifier && (
                                <span style={{ padding: '2px 8px', borderRadius: 9999, background: `${T.primary}12`, border: `1px solid ${T.primary}25`, color: T.primary, fontSize: 11, fontFamily: T.fontMono }}>
                                    {status.dbIdentifier}
                                </span>
                            )}
                            {lastRefresh && (
                                <span style={{ color: T.textDim, fontSize: 11, fontFamily: T.fontMono }}>
                                    Updated {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Time Range */}
                    <div style={{ display: 'flex', background: T.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.glassBorder}` }}>
                        {RANGE_OPTIONS.map(o => (
                            <button key={o.value} onClick={() => setTimeRange(o.value)} style={{
                                padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: 'none', borderRight: `1px solid ${T.glassBorder}`,
                                background: timeRange === o.value ? `${T.primary}20` : 'transparent',
                                color:      timeRange === o.value ? T.primary : T.textMuted,
                                fontFamily: T.fontMono, transition: 'all 0.15s',
                            }}>{o.label}</button>
                        ))}
                    </div>

                    {/* Refresh Interval */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', background: T.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.glassBorder}` }}>
                            {REFRESH_OPTIONS.map(o => (
                                <button key={o.value}
                                    onClick={() => { setRefreshInterval(o.value); setShowCustomInput(false); }}
                                    style={{
                                        padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        border: 'none', borderRight: `1px solid ${T.glassBorder}`,
                                        background: refreshInterval === o.value && !showCustomInput ? `${T.secondary}20` : 'transparent',
                                        color:      refreshInterval === o.value && !showCustomInput ? T.secondary : T.textMuted,
                                        fontFamily: T.fontMono, transition: 'all 0.15s',
                                    }}>{o.label}</button>
                            ))}
                            <button onClick={() => setShowCustomInput(p => !p)} style={{
                                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: 'none',
                                background: showCustomInput ? `${T.primary}20` : 'transparent',
                                color:      showCustomInput ? T.primary : T.textMuted,
                                fontFamily: T.fontBody, transition: 'all 0.15s',
                            }}>Custom</button>
                        </div>
                        {showCustomInput && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                    type="number" value={customInterval}
                                    onChange={e => setCustomInterval(e.target.value)}
                                    placeholder="sec" min="10"
                                    style={{
                                        width: 72, padding: '5px 8px', fontSize: 12,
                                        background: T.surface, border: `1px solid ${T.glassBorder}`,
                                        borderRadius: 6, color: T.textMain, outline: 'none',
                                        fontFamily: T.fontMono,
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const secs = parseInt(customInterval, 10);
                                        if (!isNaN(secs) && secs >= 10) {
                                            setRefreshInterval(secs * 1000);
                                            setShowCustomInput(false);
                                            setCustomInterval('');
                                        }
                                    }}
                                    style={{
                                        padding: '5px 10px', fontSize: 12, fontWeight: 600,
                                        background: `${T.primary}15`, border: `1px solid ${T.primary}35`,
                                        borderRadius: 6, color: T.primary, cursor: 'pointer',
                                        fontFamily: T.fontBody,
                                    }}
                                >Set</button>
                            </div>
                        )}
                    </div>

                    {/* Manual Refresh */}
                    <button onClick={fetchMetrics} disabled={metricsLoading} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        background: `${T.primary}15`, border: `1px solid ${T.primary}35`,
                        borderRadius: 8, color: T.primary, fontSize: 12, fontWeight: 600,
                        cursor: metricsLoading ? 'not-allowed' : 'pointer',
                        opacity: metricsLoading ? 0.6 : 1, fontFamily: T.fontBody,
                    }}>
                        <RefreshCw size={13} style={{ animation: metricsLoading ? 'cwSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Connected badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10, marginBottom: 20,
                background: `${T.success}08`, border: `1px solid ${T.success}25`,
            }}>
                <CheckCircle size={14} color={T.success} />
                <span style={{ fontSize: 13, color: T.success, fontFamily: T.fontBody }}>Connected to AWS CloudWatch</span>
                <span style={{ fontSize: 12, color: T.textDim, marginLeft: 8, fontFamily: T.fontBody }}>
                    Showing {RANGE_OPTIONS.find(r => r.value === timeRange)?.label} of historical data
                    {refreshInterval > 0 && ` · Auto-refresh ${REFRESH_OPTIONS.find(r => r.value === refreshInterval)?.label ?? 'custom'}`}
                </span>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {METRIC_DEFS.map(def => (
                    <MetricCard
                        key={def.key}
                        def={def}
                        datapoints={metrics[def.key]}
                        metricsLoading={metricsLoading}
                        T={T}
                    />
                ))}
            </div>

            {/* Footer note */}
            <div style={{
                marginTop: 20, padding: '12px 16px', borderRadius: 10,
                background: `${T.info}08`, border: `1px solid ${T.info}20`,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <Info size={13} color={T.info} />
                <span style={{ fontSize: 12, color: T.textDim, fontFamily: T.fontBody }}>
                    CloudWatch metrics have a 1-minute minimum resolution. Data may be delayed up to 5 minutes from real-time.
                    Standard CloudWatch charges apply for metric API calls.
                </span>
            </div>
        </div>
    );
}
