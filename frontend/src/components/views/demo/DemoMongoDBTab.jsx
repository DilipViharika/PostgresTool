// ==========================================================================
//  DemoMongoDBTab — Self-contained MongoDB demo dashboard
// ==========================================================================
import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
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

/* ── tiny inline helpers (no external deps) ─────────────────────────── */
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
                color: color || DS.emerald,
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

/* ── demo data ──────────────────────────────────────────────────────── */
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
    read: +(0.5 + Math.random() * 3).toFixed(2),
    write: +(1 + Math.random() * 5).toFixed(2),
}));

const memoryData = hours.map((t) => ({
    time: t,
    resident: 4.2 + +(Math.random() * 0.8).toFixed(2),
    virtual: 8.1 + +(Math.random() * 1.2).toFixed(2),
    mapped: 3.8 + +(Math.random() * 0.5).toFixed(2),
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

/* ── main component ─────────────────────────────────────────────────── */
export default function DemoMongoDBTab() {
    const DS = useMemo(() => getDS(), []);
    const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 };

    return (
        <div style={{ padding: 24, color: DS.text, minHeight: '100vh' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: DS.emerald, marginBottom: 4 }}>
                MongoDB Demo Dashboard
            </h2>
            <p style={{ color: DS.textSecondary, fontSize: 13, marginBottom: 24 }}>
                Sample metrics for a MongoDB 7.0 sharded cluster — ecommerce (replica set rs0)
            </p>

            {/* ── Health Overview ────────────────────────────────────── */}
            <SectionTitle color={DS.cyan}>Cluster Health</SectionTitle>
            <div style={grid}>
                <Card>
                    <Metric label="Uptime" value="89d" sub="Since restart" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="Ops/sec" value="4,820" sub="All operations" color={DS.cyan} />
                </Card>
                <Card>
                    <Metric label="Connections" value="182" sub="of 800 max" color={DS.amber} />
                </Card>
                <Card>
                    <Metric label="Resident Mem" value="4.6 GB" sub="WiredTiger cache" color={DS.violet} />
                </Card>
                <Card>
                    <Metric label="Repl Lag" value="0.3s" sub="Max secondary" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="Slow Ops" value="8" sub="Last 24 h" color={DS.rose} />
                </Card>
            </div>

            {/* ── Operations ─────────────────────────────────────────── */}
            <SectionTitle color={DS.violet}>Operations / sec (24 h)</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={opsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="queries"
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

            {/* ── Latency ────────────────────────────────────────────── */}
            <SectionTitle color={DS.amber}>Read / Write Latency</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} unit=" ms" />
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
            </Card>

            {/* ── Connections & Memory ───────────────────────────────── */}
            <SectionTitle color={DS.emerald}>Connections & Memory</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                    <div style={{ textAlign: 'center', fontSize: 13, color: DS.textSecondary, marginBottom: 8 }}>
                        Connections
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={connData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                            <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke={DS.cyan}
                                fill={DS.cyan}
                                fillOpacity={0.25}
                                name="Current"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <div style={{ textAlign: 'center', fontSize: 13, color: DS.textSecondary, marginBottom: 8 }}>
                        Memory Usage (GB)
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={memoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                            <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="resident" stroke={DS.cyan} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="virtual" stroke={DS.violet} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="mapped" stroke={DS.amber} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* ── Collection Storage ─────────────────────────────────── */}
            <SectionTitle color={DS.amber}>Collection Storage Distribution</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={collectionSizes}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                dataKey="value"
                                label={({ name, value }) => `${name} (${value} GB)`}
                            >
                                {collectionSizes.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <div style={{ fontSize: 13, color: DS.textSecondary, marginBottom: 12 }}>Shard Distribution</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
                                {['Shard', 'Chunks', 'Documents', 'Storage', 'Role'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '6px 8px',
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
                            {shardData.map((s, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                                    <td
                                        style={{
                                            padding: '6px 8px',
                                            color: DS.cyan,
                                            fontFamily: 'JetBrains Mono, monospace',
                                        }}
                                    >
                                        {s.shard}
                                    </td>
                                    <td style={{ padding: '6px 8px', color: DS.text }}>{s.chunks}</td>
                                    <td style={{ padding: '6px 8px', color: DS.amber }}>{s.docs}</td>
                                    <td style={{ padding: '6px 8px', color: DS.text }}>{s.storage}</td>
                                    <td style={{ padding: '6px 8px' }}>
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: `${DS.emerald}22`,
                                                color: DS.emerald,
                                            }}
                                        >
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* ── Replication ────────────────────────────────────────── */}
            <SectionTitle color={DS.rose}>Replication Lag & Oplog</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={replData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
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
            </Card>

            {/* ── Slow Operations ────────────────────────────────────── */}
            <SectionTitle color={DS.rose}>Top Slow Operations</SectionTitle>
            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
                            {['Operation', 'Namespace', 'Duration', 'Plan', 'Docs Examined'].map((h) => (
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
                        {slowOps.map((q, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                                <td style={{ padding: '8px 10px', color: DS.cyan, fontWeight: 600 }}>{q.op}</td>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        color: DS.text,
                                    }}
                                >
                                    {q.ns}
                                </td>
                                <td style={{ padding: '8px 10px', color: DS.rose, fontWeight: 600 }}>{q.duration}</td>
                                <td style={{ padding: '8px 10px' }}>
                                    <span
                                        style={{
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: q.plan === 'COLLSCAN' ? `${DS.rose}22` : `${DS.emerald}22`,
                                            color: q.plan === 'COLLSCAN' ? DS.rose : DS.emerald,
                                        }}
                                    >
                                        {q.plan}
                                    </span>
                                </td>
                                <td style={{ padding: '8px 10px', color: DS.amber }}>{q.docs}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
