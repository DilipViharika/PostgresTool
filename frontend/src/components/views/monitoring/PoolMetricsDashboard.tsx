// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import {
    Activity, Server, Wifi, WifiOff, Clock, Settings, RefreshCw,
    AlertTriangle, AlertCircle, TrendingUp, TrendingDown
} from 'lucide-react';

// Types
interface PoolMetrics {
    active_connections: number;
    idle_connections: number;
    waiting_requests: number;
    total_created: number;
    total_destroyed: number;
    max_connections: number;
    utilization_percent: number;
    avg_connect_time: number;
    avg_query_time: number;
    max_idle_time: number;
    dead_connections: number;
    config?: {
        min: number;
        max: number;
        idleTimeout: number;
    };
}

interface HistoryEntry {
    timestamp: string;
    active: number;
    idle: number;
    waiting: number;
    utilization: number;
}

interface MetricCardProps {
    icon: any;
    label: string;
    value: string;
    unit?: string;
    sub?: string;
    color?: string;
    warn?: boolean;
}

const fmt = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '—';
    const num = Number(n);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
};

const fmtMs = (ms: number | null | undefined) => {
    if (ms === null || ms === undefined) return '—';
    const m = Number(ms);
    if (m < 1000) return `${m.toFixed(0)}ms`;
    return `${(m / 1000).toFixed(2)}s`;
};

const MetricCard: FC<MetricCardProps> = ({ icon: Icon, label, value, unit = '', sub, color = THEME.primary, warn }) => (
    <div
        className={`flex items-center gap-3 p-3 border rounded-xl transition-all
            ${warn ? `border-vigil-amber/40 bg-vigil-amber/8` : `border-vigil-accent/20 bg-vigil-surface`}
        `}
    >
        <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
            style={{
                background: `${color}15`,
                borderColor: `${color}40`,
            }}
        >
            <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1">
            <div className="text-lg font-bold text-vigil-text leading-none">
                {value}
                {unit && <span className="text-xs ml-1 font-semibold text-vigil-muted">{unit}</span>}
            </div>
            <div className="text-xs font-semibold text-vigil-muted mt-1 uppercase tracking-wider">
                {label}
            </div>
            {sub && <div className="text-xs mt-0.5" style={{ color: warn ? THEME.warning : THEME.textDim }}>{sub}</div>}
        </div>
    </div>
);

const ChartTip: FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-vigil-surface border border-vigil-accent/20 rounded-lg p-2 text-xs">
            <div className="text-vigil-muted mb-1">{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {fmt(p.value)}
                </div>
            ))}
        </div>
    );
};

interface PoolConfigSectionProps {
    config?: { min: number; max: number; idleTimeout: number };
    onUpdate: () => void;
}

const PoolConfigSection: FC<PoolConfigSectionProps> = ({ config, onUpdate }) => {
    const [localConfig, setLocalConfig] = useState(config || { min: 5, max: 20, idleTimeout: 30 });
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        setLocalConfig(config || { min: 5, max: 20, idleTimeout: 30 });
    }, [config]);

    const handleChange = (field: string, value: number) => {
        const newConfig = { ...localConfig, [field]: value };
        setLocalConfig(newConfig);
        setUpdated(true);
    };

    const handleApply = async () => {
        try {
            setUpdated(false);
        } catch (err) {
            console.error('Failed to update config:', err);
        }
    };

    return (
        <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <Settings size={18} className="text-vigil-cyan" />
                <h3 className="text-sm font-bold text-vigil-text m-0">
                    Pool Configuration
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Min Size */}
                <div>
                    <label className="block text-xs font-semibold text-vigil-muted mb-2 uppercase">
                        Min Connections: <span className="text-vigil-cyan font-bold">{localConfig.min}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={localConfig.min}
                        onChange={(e) => handleChange('min', Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Max Size */}
                <div>
                    <label className="block text-xs font-semibold text-vigil-muted mb-2 uppercase">
                        Max Connections: <span className="text-vigil-cyan font-bold">{localConfig.max}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={localConfig.max}
                        onChange={(e) => handleChange('max', Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Idle Timeout */}
                <div>
                    <label className="block text-xs font-semibold text-vigil-muted mb-2 uppercase">
                        Idle Timeout (sec): <span className="text-vigil-cyan font-bold">{localConfig.idleTimeout}</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={localConfig.idleTimeout}
                        onChange={(e) => handleChange('idleTimeout', Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            {updated && (
                <div className="flex justify-end gap-2.5 pt-4 border-t border-vigil-accent/10">
                    <button
                        onClick={() => setLocalConfig(config || { min: 5, max: 20, idleTimeout: 30 })}
                        className="px-4 py-2 rounded-lg border border-vigil-accent/20 text-vigil-muted text-xs font-semibold hover:border-vigil-accent/40 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 rounded-lg bg-vigil-cyan/20 border border-vigil-cyan/40 text-vigil-cyan text-xs font-semibold hover:bg-vigil-cyan/30 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};

const PoolMetricsDashboard: FC = () => {
    useAdaptiveTheme();
    const [metrics, setMetrics] = useState<PoolMetrics | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(10);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const loadMetrics = useCallback(async () => {
        try {
            const data = await fetchData('/api/pool/metrics');
            setMetrics(data);
            setLastUpdate(new Date());
            setError(null);

            setHistory(prev => [
                ...prev,
                {
                    timestamp: new Date().toLocaleTimeString(),
                    active: data.active_connections || 0,
                    idle: data.idle_connections || 0,
                    waiting: data.waiting_requests || 0,
                    utilization: data.utilization_percent || 0,
                },
            ].slice(-20));
        } catch (err: any) {
            console.error('Failed to load pool metrics:', err);
            setError(err.message || 'Failed to load pool metrics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMetrics();
    }, [loadMetrics]);

    useEffect(() => {
        if (autoRefresh > 0) {
            intervalRef.current = setInterval(loadMetrics, autoRefresh * 1000);
            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [autoRefresh, loadMetrics]);

    if (loading && !metrics) {
        return (
            <div className="p-5 text-center text-vigil-muted">
                <div className="inline-block mb-2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    ⟳
                </div>
                <div className="text-sm">Loading pool metrics...</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-vigil-text m-0 mb-1">
                        Connection Pool Metrics
                    </h2>
                    <p className="text-xs text-vigil-muted m-0">
                        {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div>
                        <label className="text-xs font-semibold text-vigil-muted mr-2">
                            Auto-refresh:
                        </label>
                        <select
                            value={autoRefresh}
                            onChange={(e) => setAutoRefresh(Number(e.target.value))}
                            className="px-2.5 py-1.5 bg-vigil-surface border border-vigil-accent/10 rounded-lg text-vigil-text text-xs font-semibold"
                        >
                            <option value="0">Off</option>
                            <option value="5">5s</option>
                            <option value="10">10s</option>
                            <option value="30">30s</option>
                        </select>
                    </div>
                    <button
                        onClick={loadMetrics}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vigil-cyan/20 border border-vigil-cyan/40 text-vigil-cyan text-xs font-semibold cursor-pointer hover:bg-vigil-cyan/30 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-vigil-rose/10 border border-vigil-rose/30 mb-5">
                    <AlertTriangle size={16} className="text-vigil-rose flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-xs font-semibold text-vigil-rose">
                            Error
                        </div>
                        <div className="text-xs text-vigil-muted">
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {/* Current Metrics */}
            {metrics && (
                <>
                    {/* Top Stats */}
                    <div className="grid grid-cols-auto-fit gap-3 mb-5">
                        <MetricCard
                            icon={Activity}
                            label="Active Connections"
                            value={fmt(metrics.active_connections)}
                            sub={`Pool: ${metrics.active_connections}/${metrics.max_connections}`}
                            warn={metrics.active_connections > metrics.max_connections * 0.8}
                        />
                        <MetricCard
                            icon={Wifi}
                            label="Idle Connections"
                            value={fmt(metrics.idle_connections)}
                            color={THEME.success}
                        />
                        <MetricCard
                            icon={Clock}
                            label="Waiting Requests"
                            value={fmt(metrics.waiting_requests)}
                            warn={metrics.waiting_requests > 5}
                            color={THEME.warning}
                        />
                        <MetricCard
                            icon={Server}
                            label="Total Created"
                            value={fmt(metrics.total_created)}
                            sub={`Destroyed: ${fmt(metrics.total_destroyed)}`}
                            color={THEME.info}
                        />
                    </div>

                    {/* Utilization */}
                    <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-vigil-text m-0 mb-1">
                                    Pool Utilization
                                </h3>
                                <div className="text-xs text-vigil-muted">
                                    {(metrics.utilization_percent || 0).toFixed(1)}% of {metrics.max_connections} connections in use
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-vigil-accent/20 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${Math.min(metrics.utilization_percent || 0, 100)}%`,
                                    background: metrics.utilization_percent > 80 ? THEME.danger : THEME.primary,
                                }}
                            />
                        </div>
                    </div>

                    {/* Lifecycle Metrics */}
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-vigil-text m-0 mb-4">
                                Connection Lifecycle
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center pb-3 border-b border-vigil-accent/10">
                                    <span className="text-xs text-vigil-muted">Avg Connect Time</span>
                                    <span className="text-sm font-bold text-vigil-text">
                                        {fmtMs(metrics.avg_connect_time)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-vigil-accent/10">
                                    <span className="text-xs text-vigil-muted">Avg Query Time</span>
                                    <span className="text-sm font-bold text-vigil-text">
                                        {fmtMs(metrics.avg_query_time)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-vigil-muted">Max Idle Time</span>
                                    <span className="text-sm font-bold text-vigil-text">
                                        {fmtMs(metrics.max_idle_time)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dead Connection Detection */}
                        <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-vigil-text m-0 mb-4">
                                Connection Health
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div
                                    className={`flex items-center gap-2.5 p-3 rounded-lg border
                                        ${metrics.dead_connections > 0
                                            ? `bg-vigil-amber/10 border-vigil-amber/30`
                                            : `bg-vigil-emerald/10 border-vigil-emerald/30`
                                        }
                                    `}
                                >
                                    {metrics.dead_connections > 0 ? (
                                        <AlertCircle size={18} className="text-vigil-amber" />
                                    ) : (
                                        <CheckIcon size={18} className="text-vigil-emerald" />
                                    )}
                                    <div>
                                        <div className="text-xs font-semibold text-vigil-text">
                                            Dead Connections
                                        </div>
                                        <div
                                            className="text-sm font-bold mt-0.5"
                                            style={{
                                                color: metrics.dead_connections > 0 ? THEME.warning : THEME.success,
                                            }}
                                        >
                                            {fmt(metrics.dead_connections)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-vigil-muted leading-relaxed">
                                    {metrics.dead_connections > 0
                                        ? 'Some connections have been detected as dead and will be recycled.'
                                        : 'All connections are healthy. No dead connections detected.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Chart */}
                    {history.length > 1 && (
                        <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                            <h3 className="text-sm font-bold text-vigil-text m-0 mb-4">
                                Connection History
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                    <XAxis
                                        dataKey="timestamp"
                                        stroke={THEME.textMuted}
                                        tick={{ fontSize: 11, fill: THEME.textMuted }}
                                    />
                                    <YAxis
                                        stroke={THEME.textMuted}
                                        tick={{ fontSize: 11, fill: THEME.textMuted }}
                                    />
                                    <Tooltip content={<ChartTip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px', color: THEME.textMuted }}
                                        iconType="circle"
                                    />
                                    <Bar dataKey="active" stackId="a" fill={THEME.primary} name="Active" />
                                    <Bar dataKey="idle" stackId="a" fill={THEME.success} name="Idle" />
                                    <Bar dataKey="waiting" stackId="a" fill={THEME.warning} name="Waiting" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Configuration */}
                    <PoolConfigSection config={metrics.config} onUpdate={loadMetrics} />
                </>
            )}
        </div>
    );
};

/* ── Check Icon (simple SVG) ──────────────────────────────────────────────── */
interface CheckIconProps {
    size?: number;
    className?: string;
}

const CheckIcon: FC<CheckIconProps> = ({ size = 24, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default PoolMetricsDashboard;
