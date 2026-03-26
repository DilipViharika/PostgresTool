import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { getDS } from '../../../config/designTokens.js';

/* ── Inject keyframes once ───────────────────────────────────────── */
const STYLE_ID = '__demo_mysql_styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes demoMysqlFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .demo-mysql-stagger > * { animation: demoMysqlFadeUp 0.5s ease-out both; }
      .demo-mysql-stagger > *:nth-child(1){animation-delay:0s}
      .demo-mysql-stagger > *:nth-child(2){animation-delay:.07s}
      .demo-mysql-stagger > *:nth-child(3){animation-delay:.14s}
      .demo-mysql-stagger > *:nth-child(4){animation-delay:.21s}
      .demo-mysql-stagger > *:nth-child(5){animation-delay:.28s}
      .demo-mysql-stagger > *:nth-child(6){animation-delay:.35s}
    `;
    document.head.appendChild(s);
}

/* ── GlassCard ───────────────────────────────────────────────────── */
const GlassCard = ({ children, accent, style, noPad }) => {
    const [hov, setHov] = useState(false);
    const DS = getDS();
    const c = accent || DS.amber;
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: hov ? `linear-gradient(145deg, ${c}0c 0%, rgba(10,15,30,0.85) 100%)` : 'rgba(10,15,30,0.7)',
                backdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: 16,
                border: `1px solid ${hov ? c + '40' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: hov
                    ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${c}25, 0 0 30px ${c}10`
                    : '0 4px 24px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateY(-2px)' : 'translateY(0)',
                padding: noPad ? 0 : 20,
                ...style,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${c}, ${c}80, transparent)`,
                    opacity: hov ? 1 : 0.5,
                    transition: 'opacity 0.3s',
                }}
            />
            {children}
        </div>
    );
};

/* ── BentoMetric ─────────────────────────────────────────────────── */
const BentoMetric = ({ label, value, sub, color }) => {
    const [hov, setHov] = useState(false);
    const DS = getDS();
    const c = color || DS.amber;
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: hov
                    ? `linear-gradient(145deg, rgba(7,15,36,0.9) 0%, ${c}08 50%, rgba(2,6,20,0.97) 100%)`
                    : 'linear-gradient(145deg, rgba(7,15,36,0.82) 0%, rgba(2,6,20,0.97) 100%)',
                borderRadius: 16,
                padding: 22,
                minHeight: 120,
                border: `1px solid ${hov ? c + '50' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(20px) saturate(160%)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateY(-4px) scale(1.01)' : 'none',
                boxShadow: hov
                    ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${c}20, 0 0 40px ${c}12`
                    : '0 4px 16px rgba(0,0,0,0.3)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${c}${hov ? '18' : '08'} 0%, transparent 70%)`,
                    transition: 'background 0.35s',
                }}
            />
            <div
                style={{
                    color: '#475569',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: 10,
                }}
            >
                {label}
            </div>
            <span
                style={{
                    fontSize: 34,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: hov ? `linear-gradient(135deg, #fff, ${c})` : 'none',
                    WebkitBackgroundClip: hov ? 'text' : 'unset',
                    WebkitTextFillColor: hov ? 'transparent' : '#fff',
                    textShadow: hov ? `0 0 32px ${c}80` : `0 0 12px ${c}20`,
                    transition: 'text-shadow 0.35s',
                }}
            >
                {value}
            </span>
            {sub && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{sub}</div>}
        </div>
    );
};

const SectionHeader = ({ children, color }) => {
    const c = color || getDS().amber;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '32px 0 14px' }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: c, boxShadow: `0 0 8px ${c}40` }} />
            <h3
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c,
                    textTransform: 'uppercase',
                    letterSpacing: '1.8px',
                    fontFamily: "'DM Sans', system-ui",
                }}
            >
                {children}
            </h3>
        </div>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: 'rgba(10,15,30,0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
        >
            <div style={{ color: '#94a3b8', marginBottom: 6, fontSize: 11 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </div>
            ))}
        </div>
    );
};

/* ── Demo data ───────────────────────────────────────────────────── */
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const qpsData = hours.map((t) => ({
    time: t,
    selects: 1200 + Math.round(Math.random() * 800),
    inserts: 300 + Math.round(Math.random() * 200),
    updates: 180 + Math.round(Math.random() * 120),
    deletes: 40 + Math.round(Math.random() * 30),
}));
const connData = hours.map((t) => ({
    time: t,
    active: 45 + Math.round(Math.random() * 30),
    idle: 20 + Math.round(Math.random() * 15),
    max: 151,
}));
const bufferData = hours.map((t) => ({ time: t, hitRate: +(99 + Math.random() * 0.9).toFixed(2) }));
const replData = hours.map((t) => ({ time: t, lag: +(Math.random() * 2.5).toFixed(2) }));
const innodbData = hours.map((t) => ({
    time: t,
    reads: 4500 + Math.round(Math.random() * 2000),
    writes: 1200 + Math.round(Math.random() * 800),
}));
const enginePie = [
    { name: 'InnoDB', value: 87 },
    { name: 'MyISAM', value: 8 },
    { name: 'MEMORY', value: 5 },
];
const slowQueries = [
    {
        query: 'SELECT * FROM orders WHERE created_at > ? ORDER BY total DESC',
        time: '4.82s',
        rows: '1.2M',
        fullScan: true,
    },
    {
        query: 'UPDATE inventory SET qty = qty - ? WHERE sku IN (SELECT ...)',
        time: '3.15s',
        rows: '89K',
        fullScan: false,
    },
    {
        query: 'SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN orders o ...',
        time: '2.67s',
        rows: '450K',
        fullScan: true,
    },
    {
        query: 'DELETE FROM sessions WHERE last_active < NOW() - INTERVAL 30 DAY',
        time: '1.94s',
        rows: '2.1M',
        fullScan: false,
    },
    {
        query: 'INSERT INTO analytics_daily SELECT DATE(ts), COUNT(*) ...',
        time: '1.53s',
        rows: '680K',
        fullScan: false,
    },
];
const PIE_COLORS = ['#38bdf8', '#818cf8', '#fbbf24'];

/* ── Main Component ──────────────────────────────────────────────── */
export default function DemoMySQLTab() {
    const DS = useMemo(() => getDS(), []);

    return (
        <div
            style={{
                padding: 28,
                color: DS.textPrimary || '#f0f4ff',
                minHeight: '100vh',
                fontFamily: "'DM Sans', system-ui",
            }}
        >
            {/* Hero Metrics */}
            <div
                className="demo-mysql-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 8 }}
            >
                <BentoMetric label="Uptime" value="142d" sub="Since last restart" color={DS.emerald} />
                <BentoMetric label="QPS" value="2,340" sub="Queries / sec" color={DS.cyan} />
                <BentoMetric label="Threads" value="48" sub="of 151 max" color={DS.amber} />
                <BentoMetric label="Buffer Hit" value="99.7%" sub="InnoDB cache" color={DS.emerald} />
                <BentoMetric label="Slow Queries" value="12" sub="Last 24 h" color={DS.rose} />
                <BentoMetric label="Repl Lag" value="0.4s" sub="Replica avg" color={DS.violet} />
            </div>

            {/* QPS Breakdown */}
            <SectionHeader color={DS.violet}>QPS Breakdown (24h)</SectionHeader>
            <GlassCard accent={DS.violet}>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={qpsData}>
                        <defs>
                            <linearGradient id="mySelects" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="myInserts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={DS.emerald} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={DS.emerald} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="selects"
                            stackId="1"
                            stroke={DS.cyan}
                            fill="url(#mySelects)"
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="inserts"
                            stackId="1"
                            stroke={DS.emerald}
                            fill="url(#myInserts)"
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="updates"
                            stackId="1"
                            stroke={DS.amber}
                            fill={DS.amber}
                            fillOpacity={0.2}
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="deletes"
                            stackId="1"
                            stroke={DS.rose}
                            fill={DS.rose}
                            fillOpacity={0.15}
                            strokeWidth={1.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Connections */}
            <SectionHeader color={DS.emerald}>Connections</SectionHeader>
            <GlassCard accent={DS.cyan}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={connData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="active" stroke={DS.cyan} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="idle" stroke={DS.amber} strokeWidth={2} dot={false} />
                        <Line
                            type="monotone"
                            dataKey="max"
                            stroke={DS.rose}
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* InnoDB & Storage Engines */}
            <SectionHeader color={DS.amber}>InnoDB I/O & Storage Engines</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
                <GlassCard accent={DS.cyan}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                        }}
                    >
                        InnoDB Read / Write Ops
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={innodbData}>
                            <defs>
                                <linearGradient id="myReads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="myWrites" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.violet} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={DS.violet} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="reads"
                                stroke={DS.cyan}
                                fill="url(#myReads)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="writes"
                                stroke={DS.violet}
                                fill="url(#myWrites)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.amber}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                            textAlign: 'center',
                        }}
                    >
                        Storage Engine Mix
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={enginePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={80}
                                dataKey="value"
                                stroke="none"
                                label={({ name, value }) => `${name} ${value}%`}
                            >
                                {enginePie.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Buffer Pool & Replication */}
            <SectionHeader color={DS.cyan}>Buffer Pool & Replication</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <GlassCard accent={DS.emerald}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                        }}
                    >
                        Buffer Pool Hit Rate
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={bufferData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis domain={[99, 100]} stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="hitRate"
                                stroke={DS.emerald}
                                strokeWidth={2}
                                dot={false}
                                name="Hit Rate %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.rose}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                        }}
                    >
                        Replication Lag
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={replData}>
                            <defs>
                                <linearGradient id="myReplLag" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.rose} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={DS.rose} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="lag"
                                stroke={DS.rose}
                                fill="url(#myReplLag)"
                                strokeWidth={2}
                                dot={false}
                                name="Lag (s)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Slow Queries */}
            <SectionHeader color={DS.rose}>Top Slow Queries</SectionHeader>
            <GlassCard accent={DS.rose} noPad>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                {['Query', 'Time', 'Rows Examined', 'Full Scan'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '12px 14px',
                                            textAlign: 'left',
                                            fontSize: 9,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.5px',
                                            color: '#475569',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {slowQueries.map((q, i) => (
                                <tr
                                    key={i}
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251,191,36,0.04)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: '#94a3b8',
                                            maxWidth: 420,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {q.query}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: DS.rose,
                                            fontWeight: 700,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.time}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: DS.amber,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.rows}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '3px 10px',
                                                borderRadius: 8,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: 0.5,
                                                background: q.fullScan ? `${DS.rose}15` : `${DS.emerald}15`,
                                                color: q.fullScan ? DS.rose : DS.emerald,
                                                border: `1px solid ${q.fullScan ? DS.rose + '30' : DS.emerald + '30'}`,
                                            }}
                                        >
                                            {q.fullScan ? 'YES' : 'NO'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <div style={{ height: 40 }} />
        </div>
    );
}
