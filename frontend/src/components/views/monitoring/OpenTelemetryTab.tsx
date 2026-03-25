// @ts-nocheck
import React, { useState, useEffect, useCallback, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Search, Clock, BarChart2, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

// Types
interface Stats {
    avg: number;
    min: number;
    max: number;
    p95: number;
    lastIngested?: string;
}

interface ChartDataPoint {
    timestamp: string;
    value: number;
}

const fmt = (n: number | null | undefined) => n === null || n === undefined ? '—' : Number(n).toLocaleString();
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleString() : '—';

const ChartTip: FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-vigil-surface border border-vigil-accent/20 rounded-lg p-2 text-xs">
            <div className="text-vigil-muted mb-1">{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>
            ))}
        </div>
    );
};

const OpenTelemetryTab: FC = () => {
    useAdaptiveTheme();
    const [services, setServices] = useState<string[]>([]);
    const [metricNames, setMetricNames] = useState<string[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [selectedService, setSelectedService] = useState('');
    const [selectedMetric, setSelectedMetric] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState('6h');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load services and metric names
    useEffect(() => {
        const load = async () => {
            try {
                const [svcs, metrics] = await Promise.all([
                    fetchData('/api/otel/services'),
                    fetchData('/api/otel/metrics/names'),
                ]);
                setServices(svcs?.services || []);
                setMetricNames(metrics?.names || []);
                if (svcs?.services?.[0]) setSelectedService(svcs.services[0]);
                if (metrics?.names?.[0]) setSelectedMetric(metrics.names[0]);
                setError(null);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Load chart data and stats when service/metric changes
    useEffect(() => {
        if (!selectedService || !selectedMetric) return;

        const load = async () => {
            setRefreshing(true);
            try {
                const data = await fetchData(
                    `/api/otel/metrics/data?service=${encodeURIComponent(selectedService)}&metric=${encodeURIComponent(selectedMetric)}&range=${timeRange}`
                );
                setChartData(data?.data || []);
                setStats(data?.stats || null);
                setError(null);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setRefreshing(false);
            }
        };
        load();
    }, [selectedService, selectedMetric, timeRange]);

    const filteredMetrics = metricNames.filter(m =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-5 text-center">
                <style>{`
                    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                `}</style>
                <RefreshCw size={32} className="text-vigil-cyan mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }} />
                <div className="text-vigil-muted">Loading OpenTelemetry metrics...</div>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-5xl mx-auto">
            {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-vigil-rose/10 border border-vigil-rose/30 text-vigil-rose text-xs font-semibold mb-5">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Service & Metric Selection */}
            <div className="grid grid-cols-2 gap-5 bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-vigil-muted uppercase tracking-wider mb-2">
                        <Activity size={14} />
                        Service
                    </div>
                    <select className="w-full px-3 py-2 bg-vigil-accent/5 border border-vigil-accent/10 rounded-lg text-vigil-text text-sm cursor-pointer" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-vigil-muted uppercase tracking-wider mb-2">
                        <BarChart2 size={14} />
                        Metric Name
                    </div>
                    <select className="w-full px-3 py-2 bg-vigil-accent/5 border border-vigil-accent/10 rounded-lg text-vigil-text text-sm cursor-pointer" value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
                        {filteredMetrics.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-2 gap-5 bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-vigil-muted uppercase tracking-wider mb-2">
                        <Search size={14} />
                        Search Metrics
                    </div>
                    <input
                        type="text"
                        className="w-full px-3 py-2 bg-vigil-accent/5 border border-vigil-accent/10 rounded-lg text-vigil-text text-sm"
                        placeholder="Filter metric names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-vigil-muted uppercase tracking-wider mb-2">
                        <Clock size={14} />
                        Time Range
                    </div>
                    <select className="w-full px-3 py-2 bg-vigil-accent/5 border border-vigil-accent/10 rounded-lg text-vigil-text text-sm cursor-pointer" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option value="1h">Last 1 Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Time Series Chart */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-vigil-text">
                        <BarChart2 size={16} />
                        Metric Timeline
                    </div>
                    {refreshing && <RefreshCw size={14} className="text-vigil-cyan" style={{ animation: 'spin 1s linear infinite' }} />}
                </div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="timestamp" stroke={THEME.textDim} style={{ fontSize: 12 }} />
                            <YAxis stroke={THEME.textDim} style={{ fontSize: 12 }} />
                            <Tooltip content={<ChartTip />} />
                            <Line type="monotone" dataKey="value" stroke={THEME.primary} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center p-10 text-vigil-muted text-xs">No data available</div>
                )}
            </div>

            {/* Stats Table */}
            {stats && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-vigil-text mb-4">
                        <Filter size={16} />
                        Metric Statistics
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">Average</div>
                            <div className="text-lg font-black text-vigil-cyan">{fmt(stats.avg)}</div>
                        </div>
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">Min</div>
                            <div className="text-lg font-black text-vigil-emerald">{fmt(stats.min)}</div>
                        </div>
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">Max</div>
                            <div className="text-lg font-black text-vigil-amber">{fmt(stats.max)}</div>
                        </div>
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">P95</div>
                            <div className="text-lg font-black text-vigil-violet">{fmt(stats.p95)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ingestion Stats */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-vigil-text mb-4">
                    <Activity size={16} />
                    Ingestion Statistics
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-vigil-accent/5 rounded-lg p-4">
                        <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">Total Metrics</div>
                        <div className="text-2xl font-black text-vigil-cyan">{fmt(metricNames.length)}</div>
                    </div>
                    <div className="bg-vigil-accent/5 rounded-lg p-4">
                        <div className="text-xs font-semibold text-vigil-muted uppercase mb-1">Last Ingested</div>
                        <div className="text-sm text-vigil-text font-semibold">{fmtDate(stats?.lastIngested)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenTelemetryTab;
