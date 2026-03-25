import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { useTheme } from '../../../context/ThemeContext.jsx';
import {
    Cloud, RefreshCw, AlertTriangle, CheckCircle, Info,
    Cpu, Database, HardDrive, Activity, Server, ArrowUpDown,
    Clock, Plus, X, ChevronRight, Eye, EyeOff, Shield,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

// Types
interface Theme {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    ai: string;
    bg: string;
    surface: string;
    surfaceHover: string;
    glass: string;
    glassHeavy: string;
    glassBorder: string;
    textMain: string;
    textMuted: string;
    textDim: string;
    fontMono: string;
    fontBody: string;
}

interface Instance {
    id: string;
    dbId: string;
    accessKey: string;
    secretKey: string;
    region: string;
}

interface MetricDef {
    key: string;
    label: string;
    unit: string;
    format: (v: number) => string;
    icon: any;
    colorKey: keyof Theme;
    thresholds?: { warn: number; danger: number } | null;
    invertColor?: boolean;
    description: string;
}

const buildTheme = (isDark: boolean): Theme => ({
    primary: isDark ? '#00D4FF' : '#0ea5e9',
    secondary: isDark ? '#2AFFD4' : '#10b981',
    success: isDark ? '#2EE89C' : '#22c55e',
    danger: isDark ? '#FF4560' : '#ef4444',
    warning: isDark ? '#FFB520' : '#f59e0b',
    info: isDark ? '#5BB8F5' : '#3b82f6',
    ai: isDark ? '#B88BFF' : '#8b5cf6',
    bg: isDark ? '#07030D' : '#f0f4f8',
    surface: isDark ? '#120A1F' : '#ffffff',
    surfaceHover: isDark ? '#1A1029' : '#f1f5f9',
    glass: isDark ? 'rgba(18,10,31,0.65)' : 'rgba(255,255,255,0.85)',
    glassHeavy: isDark ? 'rgba(7,3,13,0.95)' : 'rgba(255,255,255,0.97)',
    glassBorder: isDark ? 'rgba(0,212,255,0.12)' : 'rgba(0,0,0,0.08)',
    textMain: isDark ? '#F0ECF8' : '#0f172a',
    textMuted: isDark ? '#9888B4' : '#64748b',
    textDim: isDark ? '#4A3A5E' : '#94a3b8',
    fontMono: `'JetBrains Mono', 'Fira Code', monospace`,
    fontBody: `'DM Sans', system-ui, sans-serif`,
});

const fmt = {
    bytes: (b: number) => {
        if (b === null) return '—';
        const gb = b / 1073741824;
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        return `${(b / 1048576).toFixed(0)} MB`;
    },
    pct: (v: number) => v === null ? '—' : `${v.toFixed(1)}%`,
    count: (v: number) => v === null ? '—' : Math.round(v).toLocaleString(),
    ms: (v: number) => v === null ? '—' : `${(v * 1000).toFixed(2)} ms`,
    iops: (v: number) => v === null ? '—' : `${v.toFixed(0)} IOPS`,
    mbps: (v: number) => v === null ? '—' : `${(v / 1048576).toFixed(2)} MB/s`,
    load: (v: number) => v === null ? '—' : v.toFixed(2),
    time: (ts: string) => {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
};

const METRIC_DEFS: MetricDef[] = [
    { key: 'CPUUtilization', label: 'CPU Utilization', unit: '%', format: fmt.pct, icon: Cpu, colorKey: 'primary', thresholds: { warn: 70, danger: 90 }, description: 'Percentage of CPU used' },
    { key: 'DatabaseConnections', label: 'DB Connections', unit: 'count', format: fmt.count, icon: Database, colorKey: 'secondary', thresholds: null, description: 'Active database connections' },
    { key: 'FreeableMemory', label: 'Freeable Memory', unit: 'GB', format: fmt.bytes, icon: Server, colorKey: 'success', thresholds: null, invertColor: true, description: 'Available RAM' },
    { key: 'ReadIOPS', label: 'Read IOPS', unit: 'IOPS', format: fmt.iops, icon: HardDrive, colorKey: 'info', thresholds: null, description: 'Read I/O operations per second' },
    { key: 'WriteIOPS', label: 'Write IOPS', unit: 'IOPS', format: fmt.iops, icon: HardDrive, colorKey: 'ai', thresholds: null, description: 'Write I/O operations per second' },
    { key: 'ReadLatency', label: 'Read Latency', unit: 'ms', format: fmt.ms, icon: Clock, colorKey: 'warning', thresholds: { warn: 0.02, danger: 0.1 }, description: 'Average read latency' },
    { key: 'FreeStorageSpace', label: 'Free Storage', unit: 'GB', format: fmt.bytes, icon: HardDrive, colorKey: 'success', thresholds: null, invertColor: true, description: 'Available storage space' },
    { key: 'NetworkReceiveThroughput', label: 'Network In', unit: 'MB/s', format: fmt.mbps, icon: ArrowUpDown, colorKey: 'primary', thresholds: null, description: 'Incoming network traffic' },
    { key: 'DBLoad', label: 'DB Load', unit: 'vCPU', format: fmt.load, icon: Activity, colorKey: 'danger', thresholds: { warn: 2, danger: 4 }, description: 'Active sessions (DB Load)' },
];

const REFRESH_OPTIONS = [
    { label: '30s', value: 30000 },
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

const AWS_REGIONS = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-south-1',
    'eu-west-1', 'eu-west-2', 'eu-central-1', 'sa-east-1', 'ca-central-1',
];

const STORAGE_KEY = 'vigil_cw_instances';

const loadInstances = (): Instance[] => {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
};

const saveInstances = (list: Instance[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { }
};

const CWTooltip: FC<any> = ({ active, payload, label, unit, T }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: T.glassHeavy, border: `1px solid ${T.glassBorder}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: T.textMain, fontFamily: T.fontBody }}>
            <div style={{ color: T.textMuted, marginBottom: 4 }}>{label}</div>
            <div style={{ color: T.primary, fontWeight: 600 }}>{payload[0]?.value?.toFixed(3)} {unit}</div>
        </div>
    );
};

interface MetricCardProps {
    def: MetricDef;
    datapoints?: any[];
    metricsLoading: boolean;
    T: Theme;
}

const MetricCard: FC<MetricCardProps> = ({ def, datapoints, metricsLoading, T }) => {
    const current = datapoints?.length ? datapoints[datapoints.length - 1]?.value : null;
    const chartData = (datapoints || []).map(d => ({ t: fmt.time(d.timestamp), v: d.value }));
    const color = T[def.colorKey] ?? T.primary;

    const valueColor = (() => {
        if (!def.thresholds || current === null || def.invertColor) return color;
        if (current >= def.thresholds.danger) return T.danger;
        if (current >= def.thresholds.warn) return T.warning;
        return T.success;
    })();

    const isLoading = metricsLoading && !datapoints;

    return (
        <div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderTop: `2px solid ${color}40`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <def.icon size={14} color={color} />
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: T.fontBody }}>{def.label}</div>
                    <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontBody }}>{def.description}</div>
                </div>
            </div>

            {isLoading ? (
                <div style={{ height: 36, borderRadius: 8, marginBottom: 14, background: `linear-gradient(90deg, ${T.surface} 20%, ${T.surfaceHover} 50%, ${T.surface} 80%)`, backgroundSize: '300% 100%', animation: 'cwShimmer 2s infinite' }} />
            ) : (
                <div style={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: 26, color: valueColor, marginBottom: 14, lineHeight: 1, textShadow: `0 0 20px ${valueColor}40` }}>
                    {current !== null ? def.format(current) : <span style={{ color: T.textDim, fontSize: 16, fontWeight: 400 }}>No data</span>}
                </div>
            )}

            {isLoading ? (
                <div style={{ height: 60, borderRadius: 6, background: `linear-gradient(90deg, ${T.surface} 20%, ${T.surfaceHover} 50%, ${T.surface} 80%)`, backgroundSize: '300% 100%', animation: 'cwShimmer 2.5s infinite' }} />
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

interface InstanceDashboardProps {
    instance: Instance;
    timeRange: number;
    refreshInterval: number;
    T: Theme;
}

const InstanceDashboard: FC<InstanceDashboardProps> = ({ instance, timeRange, refreshInterval, T }) => {
    const [metrics, setMetrics] = useState<Record<string, any[]>>({});
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchMetrics = useCallback(async () => {
        setMetricsLoading(true);
        setFetchError(null);
        try {
            const results = await Promise.allSettled(
                METRIC_DEFS.map(async (def) => {
                    const period = timeRange <= 3600 ? 60 : timeRange <= 86400 ? 300 : 3600;
                    const endTime = new Date();
                    const startTime = new Date(endTime.getTime() - timeRange * 1000);

                    const params = new URLSearchParams({
                        metric: def.key,
                        period: String(period),
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        db: instance.dbId,
                        accessKey: instance.accessKey,
                        secretKey: instance.secretKey,
                        region: instance.region,
                    });

                    const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
                    const authHeader = { Authorization: `Bearer ${localStorage.getItem('vigil_token')}` };

                    const res = await fetch(`${API_BASE}/api/cloudwatch/metrics?${params}`, { headers: authHeader });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || `HTTP ${res.status}`);
                    }
                    const d = await res.json();
                    return [def.key, d.datapoints || []];
                })
            );

            const allFailed = results.every(r => r.status === 'rejected');
            if (allFailed) {
                setFetchError(results[0].reason?.message || 'Failed to fetch metrics');
                setMetrics({});
            } else {
                const map: Record<string, any[]> = {};
                results.forEach(r => { if (r.status === 'fulfilled') map[r.value[0]] = r.value[1]; });
                setMetrics(map);
                setLastRefresh(new Date());
            }
        } catch (e: any) {
            setFetchError(e.message);
        } finally {
            setMetricsLoading(false);
        }
    }, [instance, timeRange]);

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

    useEffect(() => {
        clearInterval(timerRef.current!);
        if (refreshInterval > 0) timerRef.current = setInterval(fetchMetrics, refreshInterval);
        return () => clearInterval(timerRef.current!);
    }, [refreshInterval, fetchMetrics]);

    if (fetchError) {
        return (
            <div style={{ padding: '40px 32px', borderRadius: 14, background: `${T.danger}08`, border: `1px solid ${T.danger}20`, textAlign: 'center' }}>
                <AlertTriangle size={28} color={T.danger} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: T.textMain, marginBottom: 8, fontFamily: T.fontBody }}>Failed to load metrics</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8, fontFamily: T.fontMono }}>{fetchError}</div>
                <button onClick={fetchMetrics} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', fontSize: 13, fontWeight: 600, background: `${T.primary}15`, border: `1px solid ${T.primary}35`, borderRadius: 8, color: T.primary, cursor: 'pointer', fontFamily: T.fontBody }}>
                    <RefreshCw size={13} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 10, marginBottom: 20, background: `${T.success}08`, border: `1px solid ${T.success}25`, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <CheckCircle size={14} color={T.success} />
                    <span style={{ fontSize: 13, color: T.success, fontFamily: T.fontBody }}>Connected</span>
                    <span style={{ padding: '2px 8px', borderRadius: 9999, background: `${T.primary}12`, border: `1px solid ${T.primary}25`, color: T.primary, fontSize: 11, fontFamily: T.fontMono }}>{instance.dbId}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 9999, background: `${T.secondary}12`, border: `1px solid ${T.secondary}25`, color: T.secondary, fontSize: 11, fontFamily: T.fontMono }}>{instance.region}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {lastRefresh && <span style={{ color: T.textDim, fontSize: 11, fontFamily: T.fontMono }}>Updated {lastRefresh.toLocaleTimeString()}</span>}
                    <button onClick={fetchMetrics} disabled={metricsLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${T.primary}15`, border: `1px solid ${T.primary}35`, borderRadius: 7, color: T.primary, fontSize: 12, fontWeight: 600, cursor: metricsLoading ? 'not-allowed' : 'pointer', opacity: metricsLoading ? 0.6 : 1, fontFamily: T.fontBody }}>
                        <RefreshCw size={12} style={{ animation: metricsLoading ? 'cwSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {METRIC_DEFS.map(def => (
                    <MetricCard key={def.key} def={def} datapoints={metrics[def.key]} metricsLoading={metricsLoading} T={T} />
                ))}
            </div>
        </div>
    );
};

const EmptyState: FC<{ T: Theme; onAdd: () => void }> = ({ T, onAdd }) => (
    <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px', background: `radial-gradient(circle, ${T.primary}20, ${T.primary}05)`, border: `1px solid ${T.primary}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${T.primary}15` }}>
            <Cloud size={36} color={T.primary} />
        </div>
        <h2 style={{ fontFamily: T.fontBody, fontSize: 22, fontWeight: 700, color: T.textMain, marginBottom: 10 }}>No Instances Connected</h2>
        <p style={{ color: T.textMuted, fontSize: 14, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7, fontFamily: T.fontBody }}>
            Enter your AWS credentials and RDS instance identifier directly — no environment variables or server restarts needed. Everything is saved in your browser.
        </p>
        <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600, background: `${T.primary}15`, border: `1px solid ${T.primary}35`, borderRadius: 10, color: T.primary, cursor: 'pointer', fontFamily: T.fontBody }}>
            <Plus size={16} />
            Connect RDS Instance
        </button>
    </div>
);

const CloudWatchTab: FC = () => {
    const { isDark } = useTheme();
    const T = buildTheme(isDark);

    const [instances, setInstances] = useState<Instance[]>(() => loadInstances());
    const [activeTab, setActiveTab] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(300000);
    const [timeRange, setTimeRange] = useState(3600);

    useEffect(() => { saveInstances(instances); }, [instances]);

    useEffect(() => {
        if (instances.length > 0 && activeTab >= instances.length) setActiveTab(instances.length - 1);
    }, [instances, activeTab]);

    const addInstance = (inst: Instance) => {
        setInstances(prev => { const next = [...prev, inst]; setActiveTab(next.length - 1); return next; });
    };

    const removeInstance = (idx: number) => {
        setInstances(prev => prev.filter((_, i) => i !== idx));
        setActiveTab(prev => Math.max(0, prev >= idx ? prev - 1 : prev));
    };

    return (
        <div style={{ padding: '20px 24px', minHeight: '100%', fontFamily: T.fontBody, background: T.bg }}>
            <style>{`
                @keyframes cwShimmer { 0% { background-position: -300% 0; } 100% { background-position: 300% 0; } }
                @keyframes cwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes cwFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes cwSlideIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: none; } }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.primary}15`, border: `1px solid ${T.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cloud size={18} color={T.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: T.textMain }}>CloudWatch Metrics</div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, fontFamily: T.fontBody }}>
                            {instances.length === 0 ? 'No instances connected' : `${instances.length} instance${instances.length !== 1 ? 's' : ''} monitored`}
                        </div>
                    </div>
                </div>

                {instances.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Time Range */}
                        <div style={{ display: 'flex', background: T.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.glassBorder}` }}>
                            {RANGE_OPTIONS.map(o => (
                                <button key={o.value} onClick={() => setTimeRange(o.value)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', borderRight: `1px solid ${T.glassBorder}`, background: timeRange === o.value ? `${T.primary}20` : 'transparent', color: timeRange === o.value ? T.primary : T.textMuted, fontFamily: T.fontMono, transition: 'all 0.15s' }}>{o.label}</button>
                            ))}
                        </div>

                        {/* Refresh Interval */}
                        <div style={{ display: 'flex', background: T.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.glassBorder}` }}>
                            {REFRESH_OPTIONS.map(o => (
                                <button key={o.value} onClick={() => setRefreshInterval(o.value)} style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', borderRight: `1px solid ${T.glassBorder}`, background: refreshInterval === o.value ? `${T.secondary}20` : 'transparent', color: refreshInterval === o.value ? T.secondary : T.textMuted, fontFamily: T.fontMono, transition: 'all 0.15s' }}>{o.label}</button>
                            ))}
                        </div>

                        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: `${T.secondary}15`, border: `1px solid ${T.secondary}35`, borderRadius: 8, color: T.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: T.fontBody }}>
                            <Plus size={13} />
                            Add Instance
                        </button>
                    </div>
                )}
            </div>

            {instances.length === 0 ? (
                <EmptyState T={T} onAdd={() => setShowModal(true)} />
            ) : (
                <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', marginBottom: 20, borderBottom: `1px solid ${T.glassBorder}`, overflowX: 'auto' }}>
                        {instances.map((inst, idx) => {
                            const isActive = activeTab === idx;
                            return (
                                <div key={inst.id + idx} style={{ display: 'flex', alignItems: 'center', marginBottom: -1, flexShrink: 0 }}>
                                    <button onClick={() => setActiveTab(idx)} style={{ padding: '10px 14px 10px 18px', fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: 'pointer', border: 'none', borderBottom: isActive ? `2px solid ${T.primary}` : '2px solid transparent', background: 'transparent', color: isActive ? T.primary : T.textMuted, fontFamily: T.fontBody, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? T.primary : T.textDim, display: 'inline-block' }} />
                                            {inst.id}
                                        </span>
                                    </button>
                                    <button onClick={() => removeInstance(idx)} title="Remove" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', marginRight: 6, background: 'transparent', border: 'none', color: T.textDim, cursor: 'pointer', padding: 0, transition: 'all 0.15s', flexShrink: 0, fontFamily: T.fontBody }}
                                            onMouseEnter={e => { e.currentTarget.style.background = `${T.danger}20`; e.currentTarget.style.color = T.danger; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textDim; }}>
                                        <X size={11} />
                                    </button>
                                </div>
                            );
                        })}
                        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px', fontSize: 12, border: 'none', borderBottom: '2px solid transparent', background: 'transparent', color: T.textDim, cursor: 'pointer', fontFamily: T.fontBody, transition: 'color 0.15s', marginBottom: -1, flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.color = T.secondary}
                                onMouseLeave={e => e.currentTarget.style.color = T.textDim}>
                            <Plus size={13} /> Add
                        </button>
                    </div>

                    {instances[activeTab] && (
                        <InstanceDashboard
                            key={instances[activeTab].id}
                            instance={instances[activeTab]}
                            timeRange={timeRange}
                            refreshInterval={refreshInterval}
                            T={T}
                        />
                    )}

                    <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: `${T.info}08`, border: `1px solid ${T.info}20`, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Info size={13} color={T.info} />
                        <span style={{ fontSize: 12, color: T.textDim, fontFamily: T.fontBody }}>
                            CloudWatch metrics have a 1-minute minimum resolution. Data may be delayed up to 5 minutes. Standard CloudWatch charges apply.
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default CloudWatchTab;
