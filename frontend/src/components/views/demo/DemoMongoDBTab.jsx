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
const STYLE_ID = '__demo_mongo_styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes demoMongoFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .demo-mongo-stagger > * { animation: demoMongoFadeUp 0.5s ease-out both; }
      .demo-mongo-stagger > *:nth-child(1){animation-delay:0s}
      .demo-mongo-stagger > *:nth-child(2){animation-delay:.07s}
      .demo-mongo-stagger > *:nth-child(3){animation-delay:.14s}
      .demo-mongo-stagger > *:nth-child(4){animation-delay:.21s}
      .demo-mongo-stagger > *:nth-child(5){animation-delay:.28s}
      .demo-mongo-stagger > *:nth-child(6){animation-delay:.35s}
    `;
    document.head.appendChild(s);
}

/* ── GlassCard ───────────────────────────────────────────────────── */
const GlassCard = ({ children, accent, style, noPad }) => {
    const [hov, setHov] = useState(false);
    const DS = getDS();
    const c = accent || DS.emerald;
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
    const c = color || getDS().emerald;
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
    const c = color || getDS().emerald;
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
const opsData = hours.map((t) => ({
    time: t,
    queries: 3200 + Math.round(Math.random() * 1500),
    inserts: 800 + Math.round(Math.random() * 400),
    updates: 450 + Math.round(Math.random() * 250),
    deletes: 90 + Math.round(Math.random() * 60),
}));
const connData = hours.map((t) => ({
    time: t,
    current: 120 + Math.round(Math.random() * 60),
    available: 800 - Math.round(Math.random() * 60),
}));
const latencyData = hours.map((t) => ({
    time: t,
    read: +(0.5 + Math.random() * 3).toFixed(1),
    write: +(1 + Math.random() * 5).toFixed(1),
}));
const memoryData = hours.map((t) => ({
    time: t,
    resident: +(4.2 + Math.random() * 0.8).toFixed(1),
    virtual: +(8.1 + Math.random() * 1.2).toFixed(1),
    mapped: +(3.8 + Math.random() * 0.5).toFixed(1),
}));
const replData = hours.map((t) => ({
    time: t,
    lag: +(Math.random() * 1.8).toFixed(2),
    oplogWindow: +(48 - Math.random() * 6).toFixed(1),
}));
const collectionSizes = [
    { name: 'orders', value: 42 },
    { name: 'products', value: 18 },
    { name: 'users', value: 12 },
    { name: 'sessions', value: 15 },
    { name: 'logs', value: 13 },
];
const shardData = [
    { shard: 'shard-0', chunks: 256, docs: '12.4M', storage: '8.2 GB', status: 'PRIMARY' },
    { shard: 'shard-1', chunks: 241, docs: '11.8M', storage: '7.9 GB', status: 'PRIMARY' },
    { shard: 'shard-2', chunks: 248, docs: '12.1M', storage: '8.0 GB', status: 'PRIMARY' },
];
const slowOps = [
    { op: 'find', ns: 'ecommerce.orders', duration: '3.2s', plan: 'COLLSCAN', docs: '2.4M' },
    { op: 'aggregate', ns: 'ecommerce.analytics', duration: '2.8s', plan: 'IXSCAN', docs: '1.1M' },
    { op: 'update', ns: 'ecommerce.inventory', duration: '1.9s', plan: 'IXSCAN', docs: '340K' },
    { op: 'find', ns: 'ecommerce.users', duration: '1.4s', plan: 'COLLSCAN', docs: '890K' },
    { op: 'mapReduce', ns: 'ecommerce.logs', duration: '1.1s', plan: 'COLLSCAN', docs: '5.6M' },
];
const PIE_COLORS = ['#38bdf8', '#818cf8', '#fbbf24', '#34d399', '#fb7185'];

/* ── Main Component ──────────────────────────────────────────────── */
export default function DemoMongoDBTab() {
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
                className="demo-mongo-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 8 }}
            >
                <BentoMetric label="Uptime" value="89d" sub="Since restart" color={DS.emerald} />
                <BentoMetric label="Ops/sec" value="4,820" sub="All operations" color={DS.cyan} />
                <BentoMetric label="Connections" value="182" sub="of 800 max" color={DS.amber} />
                <BentoMetric label="Resident Mem" value="4.6 GB" sub="WiredTiger cache" color={DS.violet} />
                <BentoMetric label="Repl Lag" value="0.3s" sub="Max secondary" color={DS.emerald} />
                <BentoMetric label="Slow Ops" value="8" sub="Last 24 h" color={DS.rose} />
            </div>

            {/* Operations */}
            <SectionHeader color={DS.violet}>Operations / sec (24h)</SectionHeader>
            <GlassCard accent={DS.violet}>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={opsData}>
                        <defs>
                            <linearGradient id="mgQueries" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="mgInserts" x1="0" y1="0" x2="0" y2="1">
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
                            dataKey="queries"
                            stackId="1"
                            stroke={DS.cyan}
                            fill="url(#mgQueries)"
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="inserts"
                            stackId="1"
                            stroke={DS.emerald}
                            fill="url(#mgInserts)"
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

            {/* Latency */}
            <SectionHeader color={DS.amber}>Read / Write Latency</SectionHeader>
            <GlassCard accent={DS.amber}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} unit=" ms" />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="read"
                            stroke={DS.cyan}
                            strokeWidth={2}
                            dot={false}
                            name="Read (ms)"
                        />
                        <Line
                            type="monotone"
                            dataKey="write"
                            stroke={DS.rose}
                            strokeWidth={2}
                            dot={false}
                            name="Write (ms)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Connections & Memory */}
            <SectionHeader color={DS.emerald}>Connections & Memory</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
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
                        Active Connections
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={connData}>
                            <defs>
                                <linearGradient id="mgConn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke={DS.cyan}
                                fill="url(#mgConn)"
                                strokeWidth={2}
                                dot={false}
                                name="Current"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.violet}>
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
                        Memory Usage (GB)
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={memoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="resident" stroke={DS.cyan} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="virtual" stroke={DS.violet} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="mapped" stroke={DS.amber} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Storage & Sharding */}
            <SectionHeader color={DS.amber}>Collection Storage & Sharding</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 18 }}>
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
                        Collection Sizes
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie
                                data={collectionSizes}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                dataKey="value"
                                stroke="none"
                                label={({ name, value }) => `${name} (${value} GB)`}
                            >
                                {collectionSizes.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.emerald} noPad>
                    <div
                        style={{
                            padding: '16px 20px 0',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                        }}
                    >
                        Shard Distribution
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr>
                                    {['Shard', 'Chunks', 'Documents', 'Storage', 'Role'].map((h) => (
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
                                {shardData.map((s, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = 'rgba(52,211,153,0.04)')
                                        }
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td
                                            style={{
                                                padding: '10px 14px',
                                                color: DS.cyan,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {s.shard}
                                        </td>
                                        <td
                                            style={{
                                                padding: '10px 14px',
                                                color: '#94a3b8',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        >
                                            {s.chunks}
                                        </td>
                                        <td
                                            style={{
                                                padding: '10px 14px',
                                                color: DS.amber,
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        >
                                            {s.docs}
                                        </td>
                                        <td
                                            style={{
                                                padding: '10px 14px',
                                                color: '#94a3b8',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}
                                        >
                                            {s.storage}
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>
                                            <span
                                                style={{
                                                    padding: '3px 10px',
                                                    borderRadius: 8,
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    background: `${DS.emerald}15`,
                                                    color: DS.emerald,
                                                    border: `1px solid ${DS.emerald}30`,
                                                }}
                                            >
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* Replication */}
            <SectionHeader color={DS.rose}>Replication Lag & Oplog</SectionHeader>
            <GlassCard accent={DS.rose}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={replData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="left" stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="lag"
                            stroke={DS.rose}
                            strokeWidth={2}
                            dot={false}
                            name="Lag (s)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="oplogWindow"
                            stroke={DS.violet}
                            strokeWidth={2}
                            dot={false}
                            name="Oplog Window (h)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Slow Operations */}
            <SectionHeader color={DS.rose}>Top Slow Operations</SectionHeader>
            <GlassCard accent={DS.rose} noPad>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                {['Operation', 'Namespace', 'Duration', 'Plan', 'Docs Examined'].map((h) => (
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
                            {slowOps.map((q, i) => (
                                <tr
                                    key={i}
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(52,211,153,0.04)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: DS.cyan,
                                            fontWeight: 700,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.op}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: '#94a3b8',
                                        }}
                                    >
                                        {q.ns}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: DS.rose,
                                            fontWeight: 700,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.duration}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span
                                            style={{
                                                padding: '3px 10px',
                                                borderRadius: 8,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: 0.5,
                                                background: q.plan === 'COLLSCAN' ? `${DS.rose}15` : `${DS.emerald}15`,
                                                color: q.plan === 'COLLSCAN' ? DS.rose : DS.emerald,
                                                border: `1px solid ${q.plan === 'COLLSCAN' ? DS.rose + '30' : DS.emerald + '30'}`,
                                            }}
                                        >
                                            {q.plan}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: DS.amber,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.docs}
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
