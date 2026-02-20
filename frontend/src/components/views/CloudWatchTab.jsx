import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle, Info,
    Cpu, Database, HardDrive, Activity, Zap, Server, ArrowUpDown,
    Clock, BarChart2, Settings, ExternalLink, ChevronRight
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts';

/* ── Helpers ── */
const fmt = {
    bytes: (b) => {
        if (b == null) return '—';
        const gb = b / 1073741824;
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        const mb = b / 1048576;
        return `${mb.toFixed(0)} MB`;
    },
    pct: (v) => v == null ? '—' : `${v.toFixed(1)}%`,
    count: (v) => v == null ? '—' : Math.round(v).toLocaleString(),
    ms: (v) => v == null ? '—' : `${(v * 1000).toFixed(2)} ms`,
    iops: (v) => v == null ? '—' : `${v.toFixed(0)} IOPS`,
    mbps: (v) => v == null ? '—' : `${(v / 1048576).toFixed(2)} MB/s`,
    load: (v) => v == null ? '—' : v.toFixed(2),
    time: (ts) => {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    },
};

const METRIC_DEFS = [
    {
        key: 'CPUUtilization', label: 'CPU Utilization', unit: '%',
        format: fmt.pct, icon: Cpu, color: THEME.primary,
        thresholds: { warn: 70, danger: 90 },
        description: 'Percentage of CPU used by the DB instance'
    },
    {
        key: 'DatabaseConnections', label: 'DB Connections', unit: 'count',
        format: fmt.count, icon: Database, color: THEME.secondary,
        thresholds: null,
        description: 'Active database connections'
    },
    {
        key: 'FreeableMemory', label: 'Freeable Memory', unit: 'GB',
        format: fmt.bytes, icon: Server, color: THEME.success,
        thresholds: null, invertColor: true,
        description: 'Available RAM on the DB instance'
    },
    {
        key: 'ReadIOPS', label: 'Read IOPS', unit: 'IOPS',
        format: fmt.iops, icon: HardDrive, color: THEME.info,
        thresholds: null,
        description: 'Average read I/O operations per second'
    },
    {
        key: 'WriteIOPS', label: 'Write IOPS', unit: 'IOPS',
        format: fmt.iops, icon: HardDrive, color: THEME.ai,
        thresholds: null,
        description: 'Average write I/O operations per second'
    },
    {
        key: 'ReadLatency', label: 'Read Latency', unit: 'ms',
        format: fmt.ms, icon: Clock, color: THEME.warning,
        thresholds: { warn: 0.02, danger: 0.1 },
        description: 'Average read latency per operation'
    },
    {
        key: 'FreeStorageSpace', label: 'Free Storage', unit: 'GB',
        format: fmt.bytes, icon: HardDrive, color: THEME.success,
        thresholds: null, invertColor: true,
        description: 'Available storage space'
    },
    {
        key: 'NetworkReceiveThroughput', label: 'Network In', unit: 'MB/s',
        format: fmt.mbps, icon: ArrowUpDown, color: THEME.primary,
        thresholds: null,
        description: 'Incoming network traffic'
    },
    {
        key: 'DBLoad', label: 'DB Load', unit: 'vCPU',
        format: fmt.load, icon: Activity, color: THEME.danger,
        thresholds: { warn: 2, danger: 4 },
        description: 'Number of active sessions (DB Load)'
    },
];

const REFRESH_OPTIONS = [
    { label: '1m', value: 60000 },
    { label: '5m', value: 300000 },
    { label: '15m', value: 900000 },
    { label: 'Off', value: 0 },
];

const RANGE_OPTIONS = [
    { label: '1h', value: 3600 },
    { label: '6h', value: 21600 },
    { label: '24h', value: 86400 },
    { label: '7d', value: 604800 },
];

/* ── Custom Tooltip ── */
const CWTooltip = ({ active, payload, label, unit }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: THEME.glassHeavy || 'rgba(7,3,13,0.95)',
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 8, padding: '8px 14px',
            fontSize: 12, color: THEME.textMain,
        }}>
            <div style={{ color: THEME.textMuted, marginBottom: 4 }}>{label}</div>
            <div style={{ color: THEME.primary, fontWeight: 600 }}>
                {payload[0]?.value?.toFixed(3)} {unit}
            </div>
        </div>
    );
};

/* ── Setup Guide ── */
const SetupGuide = () => (
    <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{
            textAlign: 'center', marginBottom: 48,
            animation: 'fadeInUp 0.6s ease-out forwards',
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                background: `radial-gradient(circle, ${THEME.primary}20, ${THEME.primary}05)`,
                border: `1px solid ${THEME.primary}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${THEME.primary}20`,
            }}>
                <Cloud size={36} color={THEME.primary} />
            </div>
            <h2 style={{
                fontFamily: THEME.fontDisplay, fontSize: 28, fontWeight: 700,
                color: THEME.textMain, marginBottom: 10, letterSpacing: '0.04em',
            }}>Connect AWS CloudWatch</h2>
            <p style={{ color: THEME.textMuted, fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
                Monitor your RDS PostgreSQL instance with native AWS CloudWatch metrics — no agent required.
            </p>
        </div>

        {/* Benefits */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {['Real-time RDS metrics', 'Historical trending', 'Cross-region support', 'No agent required'].map(b => (
                <span key={b} style={{
                    padding: '5px 14px', borderRadius: 9999,
                    background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`,
                    color: THEME.primary, fontSize: 12, fontWeight: 600,
                }}>{b}</span>
            ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Setup Steps */}
            <div style={{
                background: THEME.glass, border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 16, padding: 28,
            }}>
                <h3 style={{ color: THEME.textMain, fontSize: 15, fontWeight: 600, marginBottom: 24 }}>
                    Setup Guide
                </h3>
                {[
                    {
                        n: 1, title: 'Set environment variables',
                        desc: 'Add these to your backend .env or shell environment:',
                        code: `AWS_ACCESS_KEY_ID=AKIAxxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
CLOUDWATCH_DB_IDENTIFIER=my-postgres-db`
                    },
                    {
                        n: 2, title: 'Restart VIGIL backend',
                        desc: 'The server reads credentials at startup.',
                        code: null
                    },
                    {
                        n: 3, title: 'Return to this screen',
                        desc: 'Metrics will load automatically once configured.',
                        code: null
                    },
                ].map(step => (
                    <div key={step.n} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: `${THEME.primary}20`, border: `1px solid ${THEME.primary}45`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: THEME.primary, fontSize: 13, fontWeight: 700,
                        }}>{step.n}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: THEME.textMain, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                                {step.title}
                            </div>
                            <div style={{ color: THEME.textMuted, fontSize: 13, marginBottom: step.code ? 10 : 0 }}>
                                {step.desc}
                            </div>
                            {step.code && (
                                <pre style={{
                                    background: THEME.bg || '#07030D',
                                    border: `1px solid ${THEME.glassBorder}`,
                                    borderRadius: 8, padding: '12px 14px',
                                    fontSize: 11, color: THEME.secondary,
                                    fontFamily: THEME.fontMono,
                                    margin: 0, overflowX: 'auto',
                                    lineHeight: 1.7,
                                }}>{step.code}</pre>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* What You'll See */}
            <div style={{
                background: THEME.glass, border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 16, padding: 28,
            }}>
                <h3 style={{ color: THEME.textMain, fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
                    What You'll See
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { icon: Cpu, label: 'CPU Utilization', color: THEME.primary },
                        { icon: Database, label: 'DB Connections', color: THEME.secondary },
                        { icon: Server, label: 'Freeable Memory', color: THEME.success },
                        { icon: HardDrive, label: 'Read / Write IOPS', color: THEME.info },
                        { icon: Clock, label: 'Read Latency', color: THEME.warning },
                        { icon: HardDrive, label: 'Free Storage', color: THEME.success },
                        { icon: ArrowUpDown, label: 'Network I/O', color: THEME.primary },
                        { icon: Activity, label: 'DB Load', color: THEME.danger },
                    ].map(({ icon: Icon, label, color }) => (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 10,
                            background: `${color}08`, border: `1px solid ${color}20`,
                        }}>
                            <Icon size={14} color={color} />
                            <span style={{ fontSize: 12, color: THEME.textMuted }}>{label}</span>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: 24, padding: '14px 16px', borderRadius: 10,
                    background: `${THEME.info}10`, border: `1px solid ${THEME.info}25`,
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                    <Info size={14} color={THEME.info} style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>
                        Requires IAM permissions: <span style={{ color: THEME.info, fontFamily: THEME.fontMono }}>
                            cloudwatch:GetMetricStatistics
                        </span> and <span style={{ color: THEME.info, fontFamily: THEME.fontMono }}>
                            cloudwatch:ListMetrics
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* ── Metric Card ── */
const MetricCard = ({ def, datapoints, loading }) => {
    const current = datapoints?.length ? datapoints[datapoints.length - 1]?.value : null;
    const chartData = (datapoints || []).map(d => ({
        t: fmt.time(d.timestamp),
        v: d.value,
    }));

    const getColor = () => {
        if (!def.thresholds || current == null) return def.color;
        if (def.invertColor) return def.color; // already good (more = better)
        if (current >= def.thresholds.danger) return THEME.danger;
        if (current >= def.thresholds.warn) return THEME.warning;
        return THEME.success;
    };

    const valueColor = getColor();

    return (
        <div style={{
            background: THEME.glass, border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 14, padding: '18px 20px',
            transition: 'all 0.3s ease',
            borderTop: `2px solid ${def.color}40`,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `${def.color}15`, border: `1px solid ${def.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <def.icon size={14} color={def.color} />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                        {def.label}
                    </div>
                    <div style={{ fontSize: 10, color: THEME.textDim }}>{def.description}</div>
                </div>
            </div>

            {/* Value */}
            {loading ? (
                <div style={{ height: 36, borderRadius: 8, background: THEME.surface, marginBottom: 14,
                    animation: 'shimmer 2s infinite',
                    backgroundImage: `linear-gradient(90deg, ${THEME.surface} 20%, ${THEME.surfaceHover || '#1A1029'} 50%, ${THEME.surface} 80%)`,
                    backgroundSize: '300% 100%',
                }} />
            ) : (
                <div style={{
                    fontFamily: THEME.fontDisplay, fontSize: 26, fontWeight: 700,
                    color: valueColor, marginBottom: 14, lineHeight: 1,
                    textShadow: `0 0 20px ${valueColor}40`,
                }}>
                    {current != null ? def.format(current) : <span style={{ color: THEME.textDim, fontSize: 16 }}>No data</span>}
                </div>
            )}

            {/* Sparkline */}
            {loading ? (
                <div style={{ height: 60, borderRadius: 6, background: THEME.surface,
                    animation: 'shimmer 2.5s infinite',
                    backgroundImage: `linear-gradient(90deg, ${THEME.surface} 20%, ${THEME.surfaceHover || '#1A1029'} 50%, ${THEME.surface} 80%)`,
                    backgroundSize: '300% 100%',
                }} />
            ) : chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.glassBorder}`} vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis hide />
                        <Tooltip content={<CWTooltip unit={def.unit} />} />
                        <Line
                            type="monotone" dataKey="v" stroke={def.color}
                            strokeWidth={1.5} dot={false}
                            activeDot={{ r: 3, fill: def.color }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: THEME.textDim }}>Insufficient data</span>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function CloudWatchTab() {
    const [status, setStatus]         = useState(null);   // { configured, region, dbIdentifier }
    const [metrics, setMetrics]       = useState({});     // { metricKey: [{timestamp, value}] }
    const [loading, setLoading]       = useState(true);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [error, setError]           = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(300000);
    const [timeRange, setTimeRange]   = useState(3600);
    const [lastRefresh, setLastRefresh] = useState(null);
    const timerRef = useRef(null);

    /* Check if CloudWatch is configured */
    const checkStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/cloudwatch/status', {
                headers: { Authorization: `Bearer ${localStorage.getItem('vigil_token')}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            setError(e.message);
            setStatus({ configured: false });
        } finally {
            setLoading(false);
        }
    }, []);

    /* Fetch all metrics */
    const fetchMetrics = useCallback(async () => {
        if (!status?.configured) return;
        setMetricsLoading(true);
        try {
            const results = await Promise.allSettled(
                METRIC_DEFS.map(async (def) => {
                    const res = await fetch(`/api/cloudwatch/metrics?metric=${def.key}&period=${timeRange}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('vigil_token')}` }
                    });
                    if (!res.ok) return [def.key, []];
                    const d = await res.json();
                    return [def.key, d.datapoints || []];
                })
            );
            const metricsMap = {};
            results.forEach(r => {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                    metricsMap[r.value[0]] = r.value[1];
                }
            });
            setMetrics(metricsMap);
            setLastRefresh(new Date());
        } catch (e) {
            console.error('CloudWatch metrics fetch error:', e);
        } finally {
            setMetricsLoading(false);
        }
    }, [status, timeRange]);

    useEffect(() => { checkStatus(); }, [checkStatus]);
    useEffect(() => {
        if (status?.configured) fetchMetrics();
    }, [status, timeRange, fetchMetrics]);

    /* Auto-refresh */
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (refreshInterval > 0 && status?.configured) {
            timerRef.current = setInterval(fetchMetrics, refreshInterval);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [refreshInterval, fetchMetrics, status]);

    /* ── Render: Loading ── */
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
                <RefreshCw size={18} color={THEME.primary} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ color: THEME.textMuted, fontSize: 14 }}>Checking CloudWatch configuration…</span>
            </div>
        );
    }

    /* ── Render: Not Configured ── */
    if (!status?.configured) {
        return (
            <div style={{ minHeight: '100%', background: 'transparent' }}>
                <style>{`
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes shimmer { 0% { background-position: -300% 0; } 100% { background-position: 300% 0; } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>

                {/* Banner */}
                {error && (
                    <div style={{
                        margin: '16px 24px 0', padding: '12px 16px', borderRadius: 10,
                        background: `${THEME.warning}10`, border: `1px solid ${THEME.warning}30`,
                        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                    }}>
                        <AlertTriangle size={14} color={THEME.warning} />
                        <span style={{ color: THEME.warning }}>Could not reach backend: {error}</span>
                    </div>
                )}

                <SetupGuide />
            </div>
        );
    }

    /* ── Render: Dashboard ── */
    return (
        <div style={{ padding: '20px 24px', minHeight: '100%' }}>
            <style>{`
                @keyframes shimmer { 0% { background-position: -300% 0; } 100% { background-position: 300% 0; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Cloud size={18} color={THEME.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: THEME.textMain }}>CloudWatch Metrics</div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2, display: 'flex', gap: 8 }}>
                            {status.region && (
                                <span style={{
                                    padding: '2px 8px', borderRadius: 9999,
                                    background: `${THEME.secondary}12`, border: `1px solid ${THEME.secondary}25`,
                                    color: THEME.secondary, fontSize: 11,
                                }}>{status.region}</span>
                            )}
                            {status.dbIdentifier && (
                                <span style={{
                                    padding: '2px 8px', borderRadius: 9999,
                                    background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}25`,
                                    color: THEME.primary, fontSize: 11,
                                }}>{status.dbIdentifier}</span>
                            )}
                            {lastRefresh && (
                                <span style={{ color: THEME.textDim, fontSize: 11 }}>
                                    Updated {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* Time range */}
                    <div style={{ display: 'flex', background: THEME.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${THEME.glassBorder}` }}>
                        {RANGE_OPTIONS.map(o => (
                            <button key={o.value} onClick={() => setTimeRange(o.value)} style={{
                                padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: 'none', borderRight: `1px solid ${THEME.glassBorder}`,
                                background: timeRange === o.value ? `${THEME.primary}20` : 'transparent',
                                color: timeRange === o.value ? THEME.primary : THEME.textMuted,
                                transition: 'all 0.15s',
                            }}>{o.label}</button>
                        ))}
                    </div>

                    {/* Refresh */}
                    <div style={{ display: 'flex', background: THEME.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${THEME.glassBorder}` }}>
                        {REFRESH_OPTIONS.map(o => (
                            <button key={o.value} onClick={() => setRefreshInterval(o.value)} style={{
                                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: 'none', borderRight: `1px solid ${THEME.glassBorder}`,
                                background: refreshInterval === o.value ? `${THEME.secondary}20` : 'transparent',
                                color: refreshInterval === o.value ? THEME.secondary : THEME.textMuted,
                                transition: 'all 0.15s',
                            }}>{o.label}</button>
                        ))}
                    </div>

                    <button onClick={fetchMetrics} disabled={metricsLoading} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}35`,
                        borderRadius: 8, color: THEME.primary, fontSize: 12, fontWeight: 600,
                        cursor: metricsLoading ? 'not-allowed' : 'pointer', opacity: metricsLoading ? 0.6 : 1,
                    }}>
                        <RefreshCw size={13} style={{ animation: metricsLoading ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Connected badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10, marginBottom: 20,
                background: `${THEME.success}08`, border: `1px solid ${THEME.success}25`,
            }}>
                <CheckCircle size={14} color={THEME.success} />
                <span style={{ fontSize: 13, color: THEME.success }}>Connected to AWS CloudWatch</span>
                <span style={{ fontSize: 12, color: THEME.textDim, marginLeft: 8 }}>
                    Showing {RANGE_OPTIONS.find(r => r.value === timeRange)?.label} of historical data
                </span>
            </div>

            {/* Metrics Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            }}>
                {METRIC_DEFS.map(def => (
                    <MetricCard
                        key={def.key}
                        def={def}
                        datapoints={metrics[def.key]}
                        loading={metricsLoading && !metrics[def.key]}
                    />
                ))}
            </div>

            {/* Note */}
            <div style={{
                marginTop: 20, padding: '12px 16px', borderRadius: 10,
                background: `${THEME.info}08`, border: `1px solid ${THEME.info}20`,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <Info size={13} color={THEME.info} />
                <span style={{ fontSize: 12, color: THEME.textDim }}>
                    CloudWatch metrics have a 1-minute minimum resolution. Data may be delayed up to 5 minutes from real-time.
                    Standard CloudWatch charges apply for metric API calls.
                </span>
            </div>
        </div>
    );
}
