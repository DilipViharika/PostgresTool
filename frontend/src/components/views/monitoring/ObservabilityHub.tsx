// ==========================================================================
//  VIGIL — ObservabilityHub (Unified Monitoring Dashboard)
// ==========================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, ComposedChart,
} from 'recharts';
import {
    Activity, AlertTriangle, CheckCircle, Clock, Database,
    DownloadCloud, Eye, Filter, Gauge, Globe, Info,
    Package, RefreshCw, Search, TrendingDown, TrendingUp,
    X, AlertOctagon, Zap, Users, Cpu, Code, Calendar,
    GitBranch, Shield, Radio, Workflow, Server,
} from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════
// THEME TOKENS
// ═════════════════════════════════════════════════════════════════════════
const T = {
    get bg() { return THEME.bg; },
    get surface() { return THEME.surface; },
    get raised() { return THEME.surfaceRaised; },
    get border() { return THEME.grid; },
    get text1() { return THEME.textMain; },
    get text2() { return THEME.textMuted; },
    get text3() { return THEME.textDim; },
    get primary() { return THEME.primary; },
    get success() { return THEME.success; },
    get warning() { return THEME.warning; },
    get danger() { return THEME.danger; },
};

// ═════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════
const Styles = () => (
    <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .oh-container { padding:20px; max-width:1600px; }
        .oh-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
        .oh-title { font-size:24px; font-weight:700; color:${T.text1}; }
        .oh-subtitle { font-size:12px; color:${T.text2}; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px; }
        .oh-card { background:${T.surface}; border:1px solid ${T.border}; border-radius:12px; padding:20px; margin-bottom:16px; }
        .oh-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .oh-grid-3 { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; }
        .oh-grid-6 { display:grid; grid-template-columns:repeat(6, 1fr); gap:12px; }
        .oh-metric-card { background:${T.raised}; border:1px solid ${T.border}; border-radius:10px; padding:16px; text-align:center; }
        .oh-metric-value { font-size:28px; font-weight:700; color:${T.primary}; margin:8px 0; }
        .oh-metric-label { font-size:12px; color:${T.text2}; text-transform:uppercase; }
        .oh-metric-trend { font-size:12px; margin-top:8px; }
        .oh-tab-buttons { display:flex; gap:8px; margin-bottom:20px; border-bottom:2px solid ${T.border}; padding-bottom:12px; }
        .oh-tab-btn { padding:8px 16px; border:none; background:transparent; color:${T.text2}; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s; border-bottom:2px solid transparent; margin-bottom:-14px; }
        .oh-tab-btn:hover { color:${T.text1}; }
        .oh-tab-btn.active { color:${T.primary}; border-bottom-color:${T.primary}; }
        .oh-table { width:100%; border-collapse:collapse; font-size:13px; }
        .oh-table th { background:${T.raised}; color:${T.text2}; padding:12px; text-align:left; font-weight:600; border-bottom:1px solid ${T.border}; }
        .oh-table td { padding:12px; border-bottom:1px solid ${T.border}; }
        .oh-table tr:hover { background:${T.raised}; }
        .oh-status-badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; }
        .oh-status-ok { background:${T.success}20; color:${T.success}; }
        .oh-status-warn { background:${T.warning}20; color:${T.warning}; }
        .oh-status-critical { background:${T.danger}20; color:${T.danger}; }
        .oh-status-neutral { background:${T.border}; color:${T.text2}; }
        .oh-expandable { cursor:pointer; user-select:none; }
        .oh-expandable-content { display:none; padding-top:8px; border-top:1px solid ${T.border}; margin-top:8px; }
        .oh-expandable.expanded .oh-expandable-content { display:block; }
        .oh-badge { display:inline-block; padding:4px 10px; background:${T.primary}20; color:${T.primary}; border-radius:4px; font-size:11px; font-weight:600; }
        .oh-loading { text-align:center; padding:40px; }
        .oh-spinner { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .oh-icon-small { display:inline-block; vertical-align:middle; margin-right:6px; }
        @media (max-width: 1200px) {
            .oh-grid-3 { grid-template-columns:1fr 1fr; }
        }
        @media (max-width: 768px) {
            .oh-grid-2, .oh-grid-3, .oh-grid-6 { grid-template-columns:1fr; }
        }
    `}</style>
);

// ═════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═════════════════════════════════════════════════════════════════════════

const MetricCard = ({ label, value, unit, icon: Icon, trend, color = T.primary }) => (
    <div className="oh-metric-card">
        <Icon size={20} color={color} style={{ margin: '0 auto', marginBottom: 8 }} />
        <div className="oh-metric-label">{label}</div>
        <div className="oh-metric-value" style={{ color }}>
            {value}{unit ? ` ${unit}` : ''}
        </div>
        {trend !== undefined && (
            <div className="oh-metric-trend" style={{ color: trend > 0 ? T.success : T.danger }}>
                {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </div>
        )}
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
        }}>
            <div style={{ color: T.text2, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </div>
            ))}
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════
export default function ObservabilityHub() {
    useAdaptiveTheme();

    const [activeTab, setActiveTab] = useState('api');
    const [apiMetrics, setApiMetrics] = useState(null);
    const [exceptions, setExceptions] = useState(null);
    const [uptime, setUptime] = useState(null);
    const [auditLog, setAuditLog] = useState(null);
    const [jobs, setJobs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('');

    // Load all data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const results = await Promise.allSettled([
                    fetchData('/api/observability/api-metrics'),
                    fetchData('/api/observability/exceptions'),
                    fetchData('/api/observability/uptime'),
                    fetchData('/api/observability/audit-log'),
                    fetchData('/api/observability/jobs'),
                ]);
                const val = (r) => r.status === 'fulfilled' ? r.value : null;
                if (val(results[0])) setApiMetrics(val(results[0]));
                if (val(results[1])) setExceptions(val(results[1]));
                if (val(results[2])) setUptime(val(results[2]));
                if (val(results[3])) setAuditLog(val(results[3]));
                if (val(results[4])) setJobs(val(results[4]));
                // Show error only if ALL requests failed
                const allFailed = results.every(r => r.status === 'rejected');
                const firstError = results.find(r => r.status === 'rejected');
                setError(allFailed && firstError ? firstError.reason?.message : null);
            } catch (err) {
                setError(err.message);
                console.error('ObservabilityHub load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleExpanded = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };

    const filteredAuditLog = useMemo(() => {
        if (!auditLog?.events) return [];
        return auditLog.events.filter(evt => {
            const matchSearch = !searchQuery || evt.actor_username?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchAction = !filterAction || evt.action?.toLowerCase().includes(filterAction.toLowerCase());
            return matchSearch && matchAction;
        });
    }, [auditLog, searchQuery, filterAction]);

    if (loading) {
        return (
            <div className="oh-loading">
                <Styles />
                <RefreshCw size={32} color={T.primary} className="oh-spinner" style={{ marginBottom: 16 }} />
                <div style={{ color: T.text2 }}>Loading observability data...</div>
            </div>
        );
    }

    return (
        <div className="oh-container">
            <Styles />

            {error && (
                <div className="oh-card" style={{ background: `${T.danger}15`, borderColor: `${T.danger}40`, marginBottom: 20 }}>
                    <AlertOctagon size={16} style={{ display: 'inline-block', marginRight: 8, color: T.danger }} />
                    <span style={{ color: T.danger }}>{error}</span>
                </div>
            )}

            <div className="oh-header">
                <div>
                    <h1 className="oh-title">Observability Hub</h1>
                    <p style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>
                        Unified monitoring for API performance, exceptions, uptime, audit logs, and job execution
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '8px 16px',
                        background: T.primary,
                        color: THEME.textInverse,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Tab Selector */}
            <div className="oh-tab-buttons">
                {[
                    { id: 'api', label: 'API Monitoring', icon: Cpu },
                    { id: 'exceptions', label: 'Exception Tracker', icon: AlertTriangle },
                    { id: 'uptime', label: 'Uptime Monitor', icon: Globe },
                    { id: 'audit', label: 'Audit Log', icon: Shield },
                    { id: 'jobs', label: 'Job Monitor', icon: Workflow },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`oh-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* API Monitoring Panel */}
            {activeTab === 'api' && apiMetrics && (
                <div>
                    <div className="oh-subtitle">Key Metrics</div>
                    <div className="oh-grid-6">
                        <MetricCard label="Avg Response" value={apiMetrics.averageResponseTime} unit="ms" icon={Clock} />
                        <MetricCard label="Error Rate" value={apiMetrics.errorRate} unit="%" icon={AlertTriangle} color={T.warning} />
                        <MetricCard label="Total Requests" value={(apiMetrics.totalRequests / 1000).toFixed(1)} unit="k" icon={Activity} />
                        <MetricCard label="Endpoints" value={apiMetrics.timeSeriesData[0]?.endpoints?.length || 8} icon={Cpu} />
                        <MetricCard label="Status 200" value={apiMetrics.statusCodeBreakdown?.[0]?.count || 0} icon={CheckCircle} color={T.success} />
                        <MetricCard label="Status 500" value={apiMetrics.statusCodeBreakdown?.[5]?.count || 0} icon={AlertTriangle} color={T.danger} />
                    </div>

                    <div className="oh-grid-2" style={{ marginTop: 20 }}>
                        {/* Response Time Trend */}
                        <div className="oh-card">
                            <div className="oh-subtitle">Response Time Trend (24h)</div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={apiMetrics.timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                                    <XAxis dataKey="timestamp" stroke={T.text3} tick={{ fontSize: 10 }} />
                                    <YAxis stroke={T.text3} tick={{ fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey={(d) => d.endpoints?.reduce((sum, e) => sum + e.responseTime, 0) / d.endpoints?.length || 0}
                                        stroke={T.primary}
                                        dot={false}
                                        isAnimationActive={false}
                                        name="Avg Response (ms)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* HTTP Status Code Breakdown */}
                        <div className="oh-card">
                            <div className="oh-subtitle">HTTP Status Code Distribution</div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={apiMetrics.statusCodeBreakdown}
                                        dataKey="count"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                        isAnimationActive={false}
                                    >
                                        {apiMetrics.statusCodeBreakdown.map((entry, idx) => {
                                            const colors = [T.success, T.success, T.warning, T.danger, T.danger, T.danger];
                                            return <Cell key={`cell-${idx}`} fill={colors[idx]} />;
                                        })}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Slowest Endpoints */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">Top 10 Slowest Endpoints</div>
                        <table className="oh-table">
                            <thead>
                                <tr>
                                    <th>Endpoint</th>
                                    <th style={{ textAlign: 'right' }}>Avg Response Time (ms)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiMetrics.topSlowestEndpoints?.map((ep, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: THEME.fontMono }}>{ep.endpoint}</td>
                                        <td style={{ textAlign: 'right', color: ep.avgResponseTime > 200 ? T.warning : T.success }}>
                                            {ep.avgResponseTime}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Exception Tracker Panel */}
            {activeTab === 'exceptions' && exceptions && (
                <div>
                    <div className="oh-subtitle">Recent Exceptions</div>
                    <div className="oh-grid-2">
                        {/* Exception Frequency Heatmap */}
                        <div className="oh-card">
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: T.text1 }}>
                                Exception Frequency Heatmap
                            </div>
                            <div style={{ fontSize: 11, color: T.text2, marginBottom: 12 }}>
                                Count by day of week and hour
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={exceptions.frequencyHeatmap.slice(0, 24)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                                    <XAxis dataKey="hour" stroke={T.text3} tick={{ fontSize: 8 }} />
                                    <YAxis stroke={T.text3} tick={{ fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="count" fill={T.warning} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Exception Trend */}
                        <div className="oh-card">
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: T.text1 }}>
                                7-Day Trend
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={exceptions.trend?.last7days || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                                    <XAxis dataKey="date" stroke={T.text3} tick={{ fontSize: 10 }} />
                                    <YAxis stroke={T.text3} tick={{ fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="count" stroke={T.danger} dot isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Recurring Exceptions */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">Top Recurring Exceptions</div>
                        {exceptions.topRecurring?.map((exc, i) => (
                            <div
                                key={i}
                                className="oh-expandable"
                                onClick={() => toggleExpanded(`exc-${i}`)}
                                style={{
                                    padding: 12,
                                    background: i % 2 === 0 ? T.raised : 'transparent',
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    borderLeft: `3px solid ${T.warning}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: T.text1 }}>{exc.message}</div>
                                        <div style={{ fontSize: 11, color: T.text2, marginTop: 4 }}>Count: {exc.count}</div>
                                    </div>
                                    <span style={{ color: T.text2 }}>►</span>
                                </div>
                                <div className="oh-expandable-content">
                                    <div style={{ background: T.surface, padding: 12, borderRadius: 6, marginTop: 8 }}>
                                        <div style={{ fontSize: 10, color: T.text2, fontFamily: THEME.fontMono, wordBreak: 'break-all' }}>
                                            {exc.stack}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Exceptions List */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">Recent Exception Events</div>
                        <table className="oh-table">
                            <thead>
                                <tr>
                                    <th>Message</th>
                                    <th>Time</th>
                                    <th>Affected Endpoints</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exceptions.recentExceptions?.slice(0, 10).map((exc, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 300 }}>{exc.message}</td>
                                        <td style={{ fontSize: 11, color: T.text2 }}>
                                            {new Date(exc.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td>
                                            {exc.affectedEndpoints?.slice(0, 2).map((ep, j) => (
                                                <div key={j} style={{ fontSize: 11, color: T.text2, fontFamily: THEME.fontMono }}>
                                                    {ep}
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Uptime/Downtime Monitor Panel */}
            {activeTab === 'uptime' && uptime && (
                <div>
                    <div className="oh-grid-3">
                        <MetricCard
                            label="Uptime %"
                            value={uptime.uptimePercentage.toFixed(2)}
                            unit="%"
                            icon={Globe}
                            color={T.success}
                        />
                        <MetricCard
                            label="MTTR"
                            value={uptime.mttr}
                            unit="min"
                            icon={Clock}
                        />
                        <MetricCard
                            label="SLA Compliance"
                            value={uptime.slaCompliance.toFixed(2)}
                            unit="%"
                            icon={Shield}
                            color={uptime.slaCompliance >= 99.9 ? T.success : T.warning}
                        />
                    </div>

                    {/* Uptime Timeline */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">30-Day Uptime Timeline</div>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 12 }}>
                            {uptime.uptimeTimeline?.map((day, i) => {
                                const opacity = day.uptime / 100;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            width: 12,
                                            height: 12,
                                            background: T.success,
                                            opacity: Math.min(opacity, 1),
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            title: `${day.date}: ${day.uptime}%`,
                                        }}
                                        title={`${day.date}: ${day.uptime}%`}
                                    />
                                );
                            })}
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={uptime.uptimeTimeline || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                                <XAxis dataKey="date" stroke={T.text3} tick={{ fontSize: 8 }} interval={2} />
                                <YAxis stroke={T.text3} tick={{ fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="uptime" fill={T.success} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Downtime Incidents */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">Recent Downtime Incidents</div>
                        {uptime.downtimeIncidents?.map((incident, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: 12,
                                    background: T.raised,
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    borderLeft: `3px solid ${T.danger}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: T.text1 }}>{incident.cause}</div>
                                        <div style={{ fontSize: 11, color: T.text2, marginTop: 4 }}>
                                            Duration: {incident.duration} minutes
                                        </div>
                                        <div style={{ fontSize: 11, color: T.text2 }}>
                                            {new Date(incident.start).toLocaleString()} - {new Date(incident.end).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <span className="oh-status-badge oh-status-critical">RESOLVED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Audit Log Panel */}
            {activeTab === 'audit' && auditLog && (
                <div>
                    <div className="oh-subtitle">Audit Log Filters</div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                color: T.text1,
                                fontSize: 12,
                            }}
                        />
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                background: T.surface,
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                color: T.text1,
                                fontSize: 12,
                            }}
                        >
                            <option value="">All Actions</option>
                            {auditLog.actionBreakdown?.map((action, i) => (
                                <option key={i} value={action.name}>
                                    {action.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="oh-grid-2" style={{ marginBottom: 20 }}>
                        {/* Action Type Breakdown */}
                        <div className="oh-card">
                            <div className="oh-subtitle">Action Type Distribution</div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={auditLog.actionBreakdown || []}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                        isAnimationActive={false}
                                    >
                                        {(auditLog.actionBreakdown || []).map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={[T.primary, T.success, T.warning, T.danger, T.primary][idx % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="oh-metric-card">
                                <Shield size={20} color={T.primary} style={{ margin: '0 auto', marginBottom: 8 }} />
                                <div className="oh-metric-label">Total Audit Events</div>
                                <div className="oh-metric-value">{auditLog.total || 0}</div>
                            </div>
                            <div className="oh-metric-card">
                                <Users size={20} color={T.primary} style={{ margin: '0 auto', marginBottom: 8 }} />
                                <div className="oh-metric-label">Active Users</div>
                                <div className="oh-metric-value">
                                    {new Set(auditLog.events?.map(e => e.actor_username)).size || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Log Table */}
                    <div className="oh-card">
                        <div className="oh-subtitle">Audit Log ({filteredAuditLog.length} events)</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="oh-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Resource</th>
                                        <th>Level</th>
                                        <th>IP Address</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAuditLog.slice(0, 50).map((evt, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{evt.actor_username}</td>
                                            <td style={{ fontFamily: THEME.fontMono, fontSize: 11 }}>{evt.action}</td>
                                            <td style={{ fontSize: 11, color: T.text2 }}>
                                                {evt.resource_type} {evt.resource_id && `(#${evt.resource_id})`}
                                            </td>
                                            <td>
                                                <span
                                                    className={`oh-status-badge ${
                                                        evt.level === 'critical' ? 'oh-status-critical'
                                                            : evt.level === 'warn' ? 'oh-status-warn'
                                                            : 'oh-status-neutral'
                                                    }`}
                                                >
                                                    {evt.level?.toUpperCase() || 'INFO'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 11, color: T.text2, fontFamily: THEME.fontMono }}>
                                                {evt.ip_address || '—'}
                                            </td>
                                            <td style={{ fontSize: 11, color: T.text2 }}>
                                                {new Date(evt.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 11, color: T.text2 }}>
                            Showing {filteredAuditLog.length > 50 ? '50 of ' : ''}{filteredAuditLog.length} events
                        </div>
                    </div>
                </div>
            )}

            {/* Job Monitor Panel */}
            {activeTab === 'jobs' && jobs && (
                <div>
                    <div className="oh-grid-6" style={{ marginBottom: 20 }}>
                        <MetricCard label="Active" value={jobs.activeJobs?.length || 0} icon={Zap} color={T.warning} />
                        <MetricCard label="Scheduled" value={jobs.scheduledJobs?.length || 0} icon={Calendar} />
                        <MetricCard label="Completed" value={jobs.completedJobs?.length || 0} icon={CheckCircle} color={T.success} />
                        <MetricCard label="Total Jobs" value={jobs.allJobs?.length || 0} icon={Workflow} />
                        <MetricCard label="Avg Duration" value={(jobs.averageExecutionTime / 60).toFixed(0)} unit="sec" icon={Clock} />
                        <MetricCard label="Success Rate" value={75} unit="%" icon={CheckCircle} color={T.success} />
                    </div>

                    {/* Job Execution Timeline */}
                    <div className="oh-card">
                        <div className="oh-subtitle">Job Execution Timeline (Last 7 Days)</div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={jobs.executionTimeline?.slice(0, 35) || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                                <XAxis dataKey="jobName" stroke={T.text3} tick={{ fontSize: 8 }} interval={1} angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke={T.text3} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const data = payload[0].payload;
                                        return (
                                            <div style={{
                                                background: T.surface,
                                                border: `1px solid ${T.border}`,
                                                borderRadius: 8,
                                                padding: '8px 12px',
                                                fontSize: 12,
                                            }}>
                                                <div style={{ color: T.text2 }}>{data.jobName}</div>
                                                <div style={{ color: T.text1, fontWeight: 600 }}>
                                                    Duration: {data.duration}s
                                                </div>
                                                <div style={{ color: data.status === 'success' ? T.success : T.danger }}>
                                                    {data.status}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="duration"
                                    fill={T.primary}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Jobs Table */}
                    <div className="oh-card" style={{ marginTop: 20 }}>
                        <div className="oh-subtitle">Job Status</div>
                        <table className="oh-table">
                            <thead>
                                <tr>
                                    <th>Job Name</th>
                                    <th>Status</th>
                                    <th>Last Run</th>
                                    <th>Next Run</th>
                                    <th>Duration</th>
                                    <th>Success Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.allJobs?.map((job, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{job.name}</td>
                                        <td>
                                            <span
                                                className={`oh-status-badge ${
                                                    job.status === 'active' ? 'oh-status-warn'
                                                        : job.status === 'completed' ? 'oh-status-ok'
                                                        : job.status === 'failed' ? 'oh-status-critical'
                                                        : 'oh-status-neutral'
                                                }`}
                                            >
                                                {job.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 11, color: T.text2 }}>
                                            {new Date(job.lastRun).toLocaleString()}
                                        </td>
                                        <td style={{ fontSize: 11, color: T.text2 }}>
                                            {new Date(job.nextRun).toLocaleString()}
                                        </td>
                                        <td style={{ fontSize: 11, color: T.text2 }}>
                                            {job.duration}s
                                        </td>
                                        <td style={{ color: job.successRate > 90 ? T.success : T.warning }}>
                                            {job.successRate}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
