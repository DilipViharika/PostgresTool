import React, { useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { getDS } from '../../../config/designTokens.js';

/* ═══════════════════════════════════════════════════════════════════════
   PostgreSQL Demo Dashboard — fully self-contained with inline data
   ═══════════════════════════════════════════════════════════════════════ */

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa'];

const Card = ({ title, children, style }) => {
    const DS = getDS();
    return (
        <div
            style={{
                background: `${DS.surface || '#0a0f1e'}cc`,
                border: `1px solid ${DS.border || '#1e293b'}`,
                borderRadius: 16,
                padding: 20,
                backdropFilter: 'blur(12px)',
                ...style,
            }}
        >
            {title && (
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: DS.text || '#e2e8f0' }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

const Metric = ({ label, value, sub, color = '#38bdf8' }) => {
    const DS = getDS();
    return (
        <div
            style={{
                background: `${DS.surface || '#0a0f1e'}cc`,
                border: `1px solid ${DS.border || '#1e293b'}`,
                borderRadius: 12,
                padding: '16px 20px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                flex: '1 1 200px',
                minWidth: 160,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: DS.textMuted || '#64748b',
                    marginBottom: 8,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: DS.textMuted || '#64748b', marginTop: 4 }}>{sub}</div>}
        </div>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const DS = getDS();
    return (
        <div
            style={{
                background: DS.surface || '#0a0f1e',
                border: `1px solid ${DS.border || '#1e293b'}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
            }}
        >
            <div style={{ color: DS.textMuted || '#64748b', marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {p.value}
                </div>
            ))}
        </div>
    );
};

const SectionTitle = ({ children, color = '#38bdf8' }) => {
    const DS = getDS();
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: DS.text || '#e2e8f0' }}>{children}</h2>
        </div>
    );
};

// ── DATA ──
const connHistory = [
    28, 31, 35, 38, 42, 39, 45, 50, 48, 42, 38, 35, 40, 42, 44, 47, 50, 48, 45, 42, 39, 36, 33, 30,
].map((v, i) => ({ time: `${i}h`, value: v }));
const tpsHistory = [
    980, 1020, 1100, 1180, 1247, 1300, 1280, 1200, 1150, 1100, 1050, 980, 920, 950, 1020, 1100, 1180, 1247, 1300, 1280,
    1200, 1150, 1100, 1050,
].map((v, i) => ({ time: `${i}h`, value: v }));
const latencyData = [
    2.1, 2.3, 2.4, 2.6, 2.8, 2.5, 2.3, 2.4, 2.5, 2.7, 2.9, 3.0, 2.8, 2.6, 2.4, 2.3, 2.4, 2.5, 2.6, 2.4, 2.3, 2.2, 2.3,
    2.4,
].map((v, i) => ({
    time: `${i}h`,
    p50: v,
    p95: [
        10.2, 11.5, 12.8, 14.1, 15, 13.5, 12, 12.8, 13.5, 14.8, 16, 17.2, 15.5, 14, 12.8, 11.5, 12.8, 13.5, 14.1, 12.8,
        11.5, 10.8, 11.2, 12.8,
    ][i],
    p99: [
        38, 42.1, 45.2, 48.5, 52, 47, 43, 45.2, 47.8, 50.5, 54, 58, 52, 48, 45.2, 42, 45.2, 47.8, 48.5, 45.2, 42, 39.5,
        40.8, 45.2,
    ][i],
}));
const cpuHistory = [18, 20, 22, 25, 28, 32, 30, 28, 26, 24, 22, 20, 18, 19, 21, 24, 27, 30, 28, 26, 24, 22, 20, 18].map(
    (v, i) => ({ time: `${i}h`, value: v }),
);
const memHistory = [
    11.8, 12, 12.2, 12.4, 12.6, 12.8, 12.6, 12.4, 12.2, 12, 11.8, 11.9, 12, 12.2, 12.4, 12.6, 12.4, 12.2, 12, 11.8,
    11.9, 12, 12.2, 12.4,
].map((v, i) => ({ time: `${i}h`, value: v }));
const storageData = [
    { name: 'Tables', value: 180 },
    { name: 'Indexes', value: 85 },
    { name: 'WAL', value: 25 },
    { name: 'Temp', value: 5 },
    { name: 'System', value: 15 },
];
const slowQueries = [
    { query: 'SELECT o.*, c.name FROM orders o JOIN customers c...', ms: 892, calls: '1,420', rows: '8,500' },
    { query: 'SELECT p.*, array_agg(t.name) FROM products p...', ms: 654, calls: '890', rows: '12,000' },
    { query: 'WITH monthly_stats AS (SELECT date_trunc...', ms: 445, calls: '240', rows: '24' },
    { query: 'SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN...', ms: 312, calls: '560', rows: '3,200' },
    { query: 'UPDATE inventory SET quantity = quantity -...', ms: 28, calls: '45,000', rows: '45,000' },
];
const topTables = [
    { name: 'public.orders', size: '24.5 GB', rows: '18.2M', bloat: '3.2%', seq: '1,240', idx: '45,800' },
    { name: 'public.line_items', size: '18.8 GB', rows: '52.1M', bloat: '1.8%', seq: '320', idx: '89,200' },
    { name: 'public.products', size: '12.2 GB', rows: '2.4M', bloat: '5.1%', seq: '890', idx: '34,500' },
    { name: 'public.customers', size: '8.6 GB', rows: '4.8M', bloat: '2.4%', seq: '560', idx: '28,900' },
    { name: 'public.sessions', size: '6.4 GB', rows: '92.5M', bloat: '8.2%', seq: '4,200', idx: '12,300' },
];
const replicas = [
    { name: 'replica-east-1', lag: '0.3s', state: 'Streaming', sent: '4/B8002E0', replay: '4/B8002E0' },
    { name: 'replica-west-1', lag: '1.2s', state: 'Streaming', sent: '4/B8002E0', replay: '4/B7FFE80' },
];

const DemoPostgresTab = ({ tabId }) => {
    const DS = getDS();
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 };
    const flexRow = { display: 'flex', flexWrap: 'wrap', gap: 12 };
    const chartH = 260;

    return (
        <div
            style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
                fontFamily: 'DM Sans, sans-serif',
            }}
        >
            {/* Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: DS.text || '#e2e8f0' }}>
                    PostgreSQL Demo Dashboard
                </h1>
                <span
                    style={{
                        background: '#fbbf2430',
                        color: '#fbbf24',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1,
                    }}
                >
                    DEMO DATA
                </span>
            </div>

            {/* Health */}
            <div>
                <SectionTitle color="#38bdf8">Health Overview</SectionTitle>
                <div style={flexRow}>
                    <Metric label="Health Score" value="87%" color="#34d399" sub="Good" />
                    <Metric label="Cache Hit Ratio" value="99.4%" color="#38bdf8" sub="Excellent" />
                    <Metric label="Connections" value="42 / 120" color="#818cf8" sub="35% used" />
                    <Metric label="Disk Usage" value="62%" color="#fbbf24" sub="192 / 310 GB" />
                    <Metric label="Replication" value="Healthy" color="#34d399" sub="2 replicas" />
                </div>
            </div>

            {/* Connections & TPS */}
            <div>
                <SectionTitle color="#818cf8">Connections &amp; Transactions</SectionTitle>
                <div style={gridStyle}>
                    <Card title="Active Connections (24h)">
                        <ResponsiveContainer width="100%" height={chartH}>
                            <AreaChart data={connHistory}>
                                <defs>
                                    <linearGradient id="pgConn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={ChartTooltip} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#38bdf8"
                                    fill="url(#pgConn)"
                                    strokeWidth={2}
                                    name="Connections"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Transactions per Second (24h)">
                        <ResponsiveContainer width="100%" height={chartH}>
                            <LineChart data={tpsHistory}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={ChartTooltip} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    dot={false}
                                    name="TPS"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <div style={{ ...flexRow, marginTop: 12 }}>
                    <Metric label="Active" value="42" color="#38bdf8" />
                    <Metric label="Idle" value="78" color="#818cf8" />
                    <Metric label="Waiting" value="3" color="#fbbf24" />
                    <Metric label="TPS" value="1,250" color="#34d399" />
                </div>
            </div>

            {/* Latency */}
            <div>
                <SectionTitle color="#fb7185">Latency Distribution</SectionTitle>
                <Card title="Query Latency Percentiles (24h)">
                    <ResponsiveContainer width="100%" height={chartH}>
                        <LineChart data={latencyData}>
                            <XAxis
                                dataKey="time"
                                tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                unit="ms"
                            />
                            <Tooltip content={ChartTooltip} />
                            <Line
                                type="monotone"
                                dataKey="p50"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                dot={false}
                                name="p50"
                            />
                            <Line
                                type="monotone"
                                dataKey="p95"
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dot={false}
                                name="p95"
                            />
                            <Line
                                type="monotone"
                                dataKey="p99"
                                stroke="#fb7185"
                                strokeWidth={2}
                                dot={false}
                                name="p99"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <div style={{ ...flexRow, marginTop: 12 }}>
                    <Metric label="p50" value="2.4ms" color="#38bdf8" />
                    <Metric label="p95" value="12.8ms" color="#fbbf24" />
                    <Metric label="p99" value="45.2ms" color="#fb7185" />
                    <Metric label="Avg" value="4.1ms" color="#818cf8" />
                </div>
            </div>

            {/* System Resources */}
            <div>
                <SectionTitle color="#34d399">System Resources</SectionTitle>
                <div style={gridStyle}>
                    <Card title="CPU Usage (24h)">
                        <ResponsiveContainer width="100%" height={chartH}>
                            <AreaChart data={cpuHistory}>
                                <defs>
                                    <linearGradient id="pgCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                />
                                <Tooltip content={ChartTooltip} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#34d399"
                                    fill="url(#pgCpu)"
                                    strokeWidth={2}
                                    name="CPU %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Memory Usage (24h)">
                        <ResponsiveContainer width="100%" height={chartH}>
                            <AreaChart data={memHistory}>
                                <defs>
                                    <linearGradient id="pgMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: DS.textMuted || '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="GB"
                                />
                                <Tooltip content={ChartTooltip} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#818cf8"
                                    fill="url(#pgMem)"
                                    strokeWidth={2}
                                    name="Memory GB"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <div style={{ ...flexRow, marginTop: 12 }}>
                    <Metric label="CPU" value="28%" color="#34d399" sub="4 vCPU" />
                    <Metric label="Memory" value="12.4 GB" color="#818cf8" sub="of 32 GB (38.75%)" />
                    <Metric label="Disk I/O Read" value="145 MB/s" color="#38bdf8" />
                    <Metric label="Disk I/O Write" value="52 MB/s" color="#fbbf24" />
                </div>
            </div>

            {/* Slow Queries */}
            <div>
                <SectionTitle color="#fbbf24">Slow Queries</SectionTitle>
                <Card>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}` }}>
                                    {['Query', 'Avg Time (ms)', 'Calls', 'Rows'].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '10px 12px',
                                                textAlign: 'left',
                                                fontSize: 10,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                color: DS.textMuted || '#64748b',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {slowQueries.map((q, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}22` }}>
                                        <td
                                            style={{
                                                padding: '10px 12px',
                                                color: DS.text || '#e2e8f0',
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: 12,
                                            }}
                                        >
                                            {q.query}
                                        </td>
                                        <td
                                            style={{
                                                padding: '10px 12px',
                                                color: q.ms > 500 ? '#fb7185' : q.ms > 100 ? '#fbbf24' : '#34d399',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {q.ms}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: DS.textMuted || '#64748b' }}>
                                            {q.calls}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: DS.textMuted || '#64748b' }}>
                                            {q.rows}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Storage */}
            <div>
                <SectionTitle color="#a78bfa">Storage</SectionTitle>
                <div style={gridStyle}>
                    <Card title="Storage Breakdown">
                        <ResponsiveContainer width="100%" height={chartH}>
                            <PieChart>
                                <Pie
                                    data={storageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                    paddingAngle={3}
                                    label={({ name, value }) => `${name} ${value}GB`}
                                >
                                    {storageData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Top Tables">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}` }}>
                                        {['Table', 'Size', 'Rows', 'Bloat', 'Seq Scan', 'Idx Scan'].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: '8px 10px',
                                                    textAlign: 'left',
                                                    fontSize: 10,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                    color: DS.textMuted || '#64748b',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTables.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}22` }}>
                                            <td
                                                style={{
                                                    padding: '8px 10px',
                                                    color: '#38bdf8',
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                    fontSize: 11,
                                                }}
                                            >
                                                {t.name}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: DS.text || '#e2e8f0' }}>
                                                {t.size}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: DS.textMuted || '#64748b' }}>
                                                {t.rows}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '8px 10px',
                                                    color: parseFloat(t.bloat) > 5 ? '#fb7185' : '#34d399',
                                                }}
                                            >
                                                {t.bloat}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: DS.textMuted || '#64748b' }}>
                                                {t.seq}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: DS.textMuted || '#64748b' }}>
                                                {t.idx}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div style={{ ...flexRow, marginTop: 12 }}>
                    <Metric label="Total Size" value="310 GB" color="#a78bfa" />
                    <Metric label="Tables" value="142" color="#38bdf8" />
                    <Metric label="Indexes" value="298" color="#818cf8" />
                    <Metric label="Daily Growth" value="145 MB" color="#fbbf24" />
                </div>
            </div>

            {/* Replication & WAL */}
            <div>
                <SectionTitle color="#34d399">Replication &amp; WAL</SectionTitle>
                <Card title="Replica Status">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}` }}>
                                {['Replica', 'Lag', 'State', 'Sent LSN', 'Replay LSN'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '10px 12px',
                                            textAlign: 'left',
                                            fontSize: 10,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1,
                                            color: DS.textMuted || '#64748b',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {replicas.map((r, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${DS.border || '#1e293b'}22` }}>
                                    <td style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: 600 }}>
                                        {r.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 12px',
                                            color: parseFloat(r.lag) > 1 ? '#fbbf24' : '#34d399',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {r.lag}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: '#34d399' }}>{r.state}</td>
                                    <td
                                        style={{
                                            padding: '10px 12px',
                                            color: DS.textMuted || '#64748b',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: 11,
                                        }}
                                    >
                                        {r.sent}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 12px',
                                            color: DS.textMuted || '#64748b',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: 11,
                                        }}
                                    >
                                        {r.replay}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                <div style={{ ...flexRow, marginTop: 12 }}>
                    <Metric label="WAL Rate" value="2.4 MB/s" color="#34d399" />
                    <Metric label="Checkpoints/day" value="48" color="#38bdf8" />
                    <Metric label="Checkpoint Duration" value="12.4s" color="#818cf8" />
                    <Metric label="Deadlocks (24h)" value="1" color="#fb7185" />
                </div>
            </div>
        </div>
    );
};

export default DemoPostgresTab;
