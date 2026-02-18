// ==========================================================================
//  VIGIL — Connection Pool Manager (v1.0)
// ==========================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    Activity, Server, Database, Clock, AlertTriangle,
    CheckCircle, XCircle, TrendingUp, Users, Settings,
    RefreshCcw, Shield, Zap, Power, Network,
    ArrowRight, BarChart3, PieChart, Filter
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, BarChart, Bar, PieChart as RePie, Pie, Cell,
    LineChart, Line, ReferenceLine
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES & ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
const PoolStyles = () => (
    <style>{`
        @keyframes poolPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes poolSlide { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes poolGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        
        .pool-card {
            background: ${THEME.surface};
            border: 1px solid ${THEME.border};
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.2s ease;
        }
        .pool-card:hover {
            border-color: ${THEME.primary}50;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }
        
        .pool-stat-value {
            font-family: 'JetBrains Mono', monospace;
            font-variant-numeric: tabular-nums;
        }
        
        .connection-row {
            display: grid;
            grid-template-columns: 80px 1.5fr 1fr 1fr 1fr 1fr 80px;
            padding: 10px 16px;
            border-bottom: 1px solid ${THEME.grid}40;
            align-items: center;
            font-size: 12px;
            transition: background 0.15s;
        }
        .connection-row:hover { background: ${THEME.surfaceHigh}; }
        
        .pool-btn {
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid ${THEME.border};
            background: transparent;
            color: ${THEME.textDim};
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .pool-btn:hover {
            color: ${THEME.textMain};
            border-color: ${THEME.primary};
            background: ${THEME.primary}10;
        }
        
        .forecast-zone {
            background: repeating-linear-gradient(
                45deg,
                ${THEME.warning}05,
                ${THEME.warning}05 10px,
                ${THEME.warning}10 10px,
                ${THEME.warning}10 20px
            );
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA GENERATORS
   ═══════════════════════════════════════════════════════════════════════════ */
const generateForecastData = () => {
    const data = [];
    let load = 45;
    for (let i = 0; i < 24; i++) {
        load += (Math.random() - 0.4) * 8; // Random walk
        load = Math.max(20, Math.min(95, load));
        // Add artificial spike for "Storm" simulation
        if (i > 18) load += (i - 18) * 5;

        data.push({
            time: `${i}:00`,
            usage: Math.round(load),
            limit: 100,
            forecast: i > 18 ? Math.round(load) : null,
            actual: i <= 18 ? Math.round(load) : null
        });
    }
    return data;
};

const generateConnections = (count) => Array.from({ length: count }, (_, i) => ({
    pid: 14000 + i,
    app: ['PaymentService', 'AuthService', 'Reporting', 'WebClient', 'MobileAPI'][i % 5],
    user: ['postgres', 'app_user', 'readonly', 'analytics'][i % 4],
    state: i < 5 ? 'active' : i < 15 ? 'idle in transaction' : 'idle',
    duration: Math.floor(Math.random() * (i < 5 ? 500 : 3600000)), // Active are fast, idle are old
    age: Math.floor(Math.random() * 7200), // Seconds since connection established
    wait_event: i % 7 === 0 ? 'ClientRead' : i % 8 === 0 ? 'IO:XactSync' : null,
    ip: `10.0.2.${100 + i}`
}));

const generatePoolStats = () => [
    { name: 'transaction_pool', active: 42, waiting: 0, idle: 18, max: 100, hit_rate: 98.2 },
    { name: 'session_pool', active: 85, waiting: 12, idle: 5, max: 90, hit_rate: 64.5 },
    { name: 'read_replica_pool', active: 120, waiting: 45, idle: 0, max: 120, hit_rate: 99.1 }
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const MetricCard = ({ label, value, unit, subtext, icon: Icon, color, trend }) => (
    <div className="pool-card" style={{ padding: 20, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ padding: 10, borderRadius: 8, background: `${color}15` }}>
                <Icon size={20} color={color} />
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: trend > 0 ? THEME.danger : THEME.success }}>
                    {trend > 0 ? '+' : ''}{trend}%
                    <TrendingUp size={12} style={{ transform: trend < 0 ? 'scaleY(-1)' : 'none' }} />
                </div>
            )}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.textMain, marginBottom: 4 }} className="pool-stat-value">
            {value}<span style={{ fontSize: 14, color: THEME.textDim, marginLeft: 4 }}>{unit}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
        </div>
        {subtext && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 8 }}>{subtext}</div>}
    </div>
);

const StateBadge = ({ state }) => {
    let color = THEME.textDim;
    if (state === 'active') color = THEME.success;
    if (state === 'idle') color = THEME.textMuted;
    if (state.includes('transaction')) color = THEME.warning;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '2px 8px', borderRadius: 4,
            background: `${color}15`, color: color,
            fontSize: 11, fontWeight: 600, border: `1px solid ${color}30`
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {state}
        </span>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN TAB COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ConnectionPoolTab = () => {
    const [timeRange, setTimeRange] = useState('1h');
    const [connections, setConnections] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [pools, setPools] = useState([]);
    const [filterState, setFilterState] = useState('all');

    // Simulate real-time updates
    useEffect(() => {
        setConnections(generateConnections(25));
        setForecast(generateForecastData());
        setPools(generatePoolStats());

        const interval = setInterval(() => {
            setConnections(prev => prev.map(c => ({
                ...c,
                duration: c.state === 'active' ? c.duration + 1000 : c.duration,
                age: c.age + 1
            })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Derived Metrics
    const totalConnections = connections.length;
    const activeCount = connections.filter(c => c.state === 'active').length;
    const idleTxCount = connections.filter(c => c.state.includes('transaction')).length;
    const poolUtilization = Math.round((totalConnections / 100) * 100); // Assuming 100 max

    const ageDistribution = useMemo(() => {
        const buckets = { '<1m': 0, '1-5m': 0, '5-30m': 0, '30m+': 0 };
        connections.forEach(c => {
            if (c.age < 60) buckets['<1m']++;
            else if (c.age < 300) buckets['1-5m']++;
            else if (c.age < 1800) buckets['5-30m']++;
            else buckets['30m+']++;
        });
        return Object.entries(buckets).map(([k,v]) => ({ name: k, count: v }));
    }, [connections]);

    const terminateConnection = (pid) => {
        if(confirm(`Are you sure you want to terminate backend PID ${pid}?`)) {
            setConnections(prev => prev.filter(c => c.pid !== pid));
        }
    };

    return (
        <div style={{ padding: '0 24px 40px', maxWidth: 1600, margin: '0 auto' }}>
            <PoolStyles />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>Connection Pool Manager</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: THEME.textDim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 8px ${THEME.success}` }} />
                            PgBouncer Active
                        </span>
                        <span>•</span>
                        <span>Uptime: 14d 2h</span>
                        <span>•</span>
                        <span>Version 1.18.0</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="pool-btn" onClick={() => setConnections(generateConnections(25))}>
                        <RefreshCcw size={14} /> Refresh
                    </button>
                    <button className="pool-btn" style={{ background: THEME.primary, color: '#fff', borderColor: THEME.primary }}>
                        <Settings size={14} /> Pool Config
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <MetricCard
                    label="Total Connections" value={totalConnections} unit="/ 100"
                    icon={Users} color={THEME.primary}
                    subtext={`${activeCount} Active · ${totalConnections - activeCount} Idle`}
                />
                <MetricCard
                    label="Pool Utilization" value={poolUtilization} unit="%"
                    icon={Activity} color={poolUtilization > 85 ? THEME.danger : THEME.success}
                    trend={5.2}
                    subtext="Approaching saturation limit"
                />
                <MetricCard
                    label="Avg Wait Time" value="12" unit="ms"
                    icon={Clock} color={THEME.warning}
                    subtext="Queue depth: 4 clients"
                />
                <MetricCard
                    label="Idle in Transaction" value={idleTxCount} unit="conn"
                    icon={AlertTriangle} color={idleTxCount > 0 ? THEME.danger : THEME.textDim}
                    subtext={idleTxCount > 0 ? "Potential holding locks" : "Healthy state"}
                />
            </div>

            {/* Pools Overview & Saturation Forecast */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 20, marginBottom: 24 }}>

                {/* Pool List */}
                <div className="pool-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, margin: '0 0 16px', display: 'flex', justifyContent: 'space-between' }}>
                        Pool Efficiency
                        <span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 400 }}>Hit Rate / Saturation</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {pools.map(pool => (
                            <div key={pool.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                                    <span style={{ fontWeight: 600, color: THEME.textMain }}>{pool.name}</span>
                                    <span style={{ fontFamily: 'monospace', color: pool.active > pool.max * 0.9 ? THEME.danger : THEME.textDim }}>
                                        {pool.active}/{pool.max} ({Math.round(pool.active/pool.max*100)}%)
                                    </span>
                                </div>
                                <div style={{ height: 6, background: THEME.grid, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                                    <div style={{
                                        width: `${(pool.active / pool.max) * 100}%`, height: '100%',
                                        background: pool.active > pool.max * 0.9 ? THEME.danger : THEME.primary,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textDim }}>
                                    <span>Wait Queue: {pool.waiting}</span>
                                    <span style={{ color: pool.hit_rate > 90 ? THEME.success : THEME.warning }}>Hit Rate: {pool.hit_rate}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saturation Forecast */}
                <div className="pool-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, margin: 0 }}>Pool Saturation Forecast</h3>
                            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>AI-predicted usage trend for next 4 hours</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: THEME.textDim }}>
                                <span style={{ width: 8, height: 8, background: THEME.primary, borderRadius: 2 }} /> Actual
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: THEME.textDim }}>
                                <span style={{ width: 8, height: 8, background: THEME.warning, borderRadius: 2, opacity: 0.5 }} /> Predicted
                            </div>
                        </div>
                    </div>
                    <div style={{ height: 200, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={forecast}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                                    </linearGradient>
                                    <pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                        <rect width="4" height="8" transform="translate(0,0)" fill={THEME.warning} fillOpacity="0.1" />
                                    </pattern>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                                <XAxis dataKey="time" tick={{fontSize: 10, fill: THEME.textDim}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: THEME.textDim}} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: THEME.surface, borderColor: THEME.border, borderRadius: 8 }}
                                    itemStyle={{ fontSize: 12, fontWeight: 600 }}
                                />
                                <ReferenceLine y={90} stroke={THEME.danger} strokeDasharray="3 3" label={{ value: "Critical Limit", fill: THEME.danger, fontSize: 10 }} />
                                <Area type="monotone" dataKey="actual" stroke={THEME.primary} fill="url(#colorUsage)" strokeWidth={2} />
                                <Area type="monotone" dataKey="forecast" stroke={THEME.warning} fill="url(#stripe)" strokeDasharray="5 5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Connection Analytics & List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 20 }}>

                {/* Age Distribution */}
                <div className="pool-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, margin: '0 0 20px' }}>Connection Age</h3>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer>
                            <BarChart data={ageDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={THEME.grid} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: THEME.textDim}} width={50} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: THEME.grid}} contentStyle={{ background: THEME.surface, borderColor: THEME.border }} />
                                <Bar dataKey="count" fill={THEME.info} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 20, padding: 12, background: THEME.surfaceHigh, borderRadius: 8, fontSize: 11, color: THEME.textDim, lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                            <AlertTriangle size={12} color={THEME.warning} />
                            <strong style={{ color: THEME.warning }}>Optimization Tip</strong>
                        </div>
                        3 connections are older than 30m. Consider lowering <code>server_idle_timeout</code> to free up slots.
                    </div>
                </div>

                {/* Connection List */}
                <div className="pool-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, margin: 0 }}>Active Backends</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="pool-btn" onClick={() => setFilterState('all')} style={{ background: filterState === 'all' ? THEME.primary + '20' : 'transparent', color: filterState === 'all' ? THEME.primary : THEME.textDim }}>All</button>
                            <button className="pool-btn" onClick={() => setFilterState('active')} style={{ background: filterState === 'active' ? THEME.success + '20' : 'transparent', color: filterState === 'active' ? THEME.success : THEME.textDim }}>Active</button>
                            <button className="pool-btn" onClick={() => setFilterState('idle in transaction')} style={{ background: filterState === 'idle in transaction' ? THEME.warning + '20' : 'transparent', color: filterState === 'idle in transaction' ? THEME.warning : THEME.textDim }}>Blocking</button>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="connection-row" style={{ background: THEME.surfaceHigh, fontWeight: 700, color: THEME.textDim, borderBottom: `1px solid ${THEME.border}` }}>
                        <div>PID</div>
                        <div>Application / IP</div>
                        <div>User</div>
                        <div>State</div>
                        <div>Duration</div>
                        <div>Wait Event</div>
                        <div style={{ textAlign: 'right' }}>Action</div>
                    </div>

                    {/* Table Body */}
                    <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                        {connections
                            .filter(c => filterState === 'all' || c.state === filterState)
                            .map(conn => (
                                <div key={conn.pid} className="connection-row">
                                    <div style={{ fontFamily: 'monospace', color: THEME.primary }}>{conn.pid}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: THEME.textMain }}>{conn.app}</div>
                                        <div style={{ fontSize: 10, color: THEME.textDim }}>{conn.ip}</div>
                                    </div>
                                    <div style={{ color: THEME.textDim }}>{conn.user}</div>
                                    <div><StateBadge state={conn.state} /></div>
                                    <div style={{ fontFamily: 'monospace', color: conn.duration > 5000 ? THEME.warning : THEME.textMain }}>
                                        {(conn.duration / 1000).toFixed(2)}s
                                    </div>
                                    <div style={{ color: conn.wait_event ? THEME.info : THEME.textDim, fontSize: 11 }}>
                                        {conn.wait_event || '—'}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => terminateConnection(conn.pid)}
                                            style={{
                                                padding: 6, borderRadius: 4, border: 'none',
                                                background: `${THEME.danger}15`, color: THEME.danger,
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            title="Terminate Backend"
                                        >
                                            <Power size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionPoolTab;