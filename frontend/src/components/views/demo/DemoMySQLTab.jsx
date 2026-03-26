import React, { useMemo } from 'react';
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

const Card = ({ children, style }) => {
    const DS = getDS();
    return (
        <div
            style={{
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderRadius: 14,
                padding: 20,
                ...style,
            }}
        >
            {children}
        </div>
    );
};

const Metric = ({ label, value, sub, color }) => {
    const DS = getDS();
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ color: DS.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</div>
            <div style={{ color: color || DS.cyan, fontSize: 28, fontWeight: 700 }}>{value}</div>
            {sub && <div style={{ color: DS.textSecondary, fontSize: 11, marginTop: 2 }}>{sub}</div>}
        </div>
    );
};

const SectionTitle = ({ children, color }) => {
    const DS = getDS();
    return (
        <h3
            style={{
                color: color || DS.amber,
                fontSize: 16,
                fontWeight: 600,
                margin: '28px 0 12px',
                letterSpacing: 0.5,
            }}
        >
            {children}
        </h3>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    const DS = getDS();
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: DS.surfaceAlt || DS.surface,
                border: `1px solid ${DS.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
            }}
        >
            <div style={{ color: DS.textSecondary, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {p.value}
                </div>
            ))}
        </div>
    );
};

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
const replicationData = hours.map((t) => ({ time: t, lag: +(Math.random() * 2.5).toFixed(2) }));
const innodbData = hours.map((t) => ({
    time: t,
    reads: 4500 + Math.round(Math.random() * 2000),
    writes: 1200 + Math.round(Math.random() * 800),
}));
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
const enginePie = [
    { name: 'InnoDB', value: 87 },
    { name: 'MyISAM', value: 8 },
    { name: 'MEMORY', value: 5 },
];
const PIE_COLORS = ['#38bdf8', '#818cf8', '#fbbf24'];

export default function DemoMySQLTab() {
    const DS = useMemo(() => getDS(), []);
    const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 };

    return (
        <div style={{ padding: 24, color: DS.text, minHeight: '100vh' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: DS.amber, marginBottom: 4 }}>MySQL Demo Dashboard</h2>
            <p style={{ color: DS.textSecondary, fontSize: 13, marginBottom: 24 }}>
                Sample metrics for a MySQL 8.0 instance — demo_ecommerce (read-write primary)
            </p>

            <SectionTitle color={DS.cyan}>Health Overview</SectionTitle>
            <div style={grid}>
                <Card>
                    <Metric label="Uptime" value="142d" sub="Since last restart" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="QPS" value="2,340" sub="Queries / sec" color={DS.cyan} />
                </Card>
                <Card>
                    <Metric label="Threads Running" value="48" sub="of 151 max" color={DS.amber} />
                </Card>
                <Card>
                    <Metric label="Buffer Pool Hit" value="99.7%" sub="InnoDB cache" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="Slow Queries" value="12" sub="Last 24 h" color={DS.rose} />
                </Card>
                <Card>
                    <Metric label="Repl Lag" value="0.4s" sub="Replica avg" color={DS.violet} />
                </Card>
            </div>

            <SectionTitle color={DS.violet}>QPS Breakdown (24 h)</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={qpsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="selects"
                            stackId="1"
                            stroke={DS.cyan}
                            fill={DS.cyan}
                            fillOpacity={0.3}
                        />
                        <Area
                            type="monotone"
                            dataKey="inserts"
                            stackId="1"
                            stroke={DS.emerald}
                            fill={DS.emerald}
                            fillOpacity={0.3}
                        />
                        <Area
                            type="monotone"
                            dataKey="updates"
                            stackId="1"
                            stroke={DS.amber}
                            fill={DS.amber}
                            fillOpacity={0.3}
                        />
                        <Area
                            type="monotone"
                            dataKey="deletes"
                            stackId="1"
                            stroke={DS.rose}
                            fill={DS.rose}
                            fillOpacity={0.3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <SectionTitle color={DS.emerald}>Connections</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={connData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
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
            </Card>

            <SectionTitle color={DS.amber}>InnoDB I/O and Storage Engines</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={innodbData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                            <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="reads" stroke={DS.cyan} fill={DS.cyan} fillOpacity={0.25} />
                            <Area
                                type="monotone"
                                dataKey="writes"
                                stroke={DS.violet}
                                fill={DS.violet}
                                fillOpacity={0.25}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <div style={{ textAlign: 'center', fontSize: 13, color: DS.textSecondary, marginBottom: 8 }}>
                        Storage Engine Mix
                    </div>
                    <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                            <Pie
                                data={enginePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                dataKey="value"
                                label={({ name, value }) => `${name} ${value}%`}
                            >
                                {enginePie.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <SectionTitle color={DS.cyan}>Buffer Pool Hit Rate</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bufferData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis domain={[99, 100]} stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
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
            </Card>

            <SectionTitle color={DS.rose}>Replication Lag</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={replicationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="lag"
                            stroke={DS.rose}
                            fill={DS.rose}
                            fillOpacity={0.2}
                            name="Lag (s)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <SectionTitle color={DS.rose}>Top Slow Queries</SectionTitle>
            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
                            {['Query', 'Time', 'Rows Examined', 'Full Scan'].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: '8px 10px',
                                        textAlign: 'left',
                                        color: DS.textSecondary,
                                        fontWeight: 500,
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slowQueries.map((q, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        color: DS.text,
                                        maxWidth: 420,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {q.query}
                                </td>
                                <td style={{ padding: '8px 10px', color: DS.rose, fontWeight: 600 }}>{q.time}</td>
                                <td style={{ padding: '8px 10px', color: DS.amber }}>{q.rows}</td>
                                <td style={{ padding: '8px 10px' }}>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: q.fullScan ? `${DS.rose}22` : `${DS.emerald}22`,
                                            color: q.fullScan ? DS.rose : DS.emerald,
                                        }}
                                    >
                                        {q.fullScan ? 'YES' : 'NO'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
