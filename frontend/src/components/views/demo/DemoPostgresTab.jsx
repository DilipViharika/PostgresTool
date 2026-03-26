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
                color: color || DS.cyan,
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

const connData = hours.map((t) => ({
    time: t,
    active: 35 + Math.round(Math.random() * 25),
    idle: 15 + Math.round(Math.random() * 10),
    total: 80,
}));
const tpsData = hours.map((t) => ({
    time: t,
    commits: 420 + Math.round(Math.random() * 180),
    rollbacks: 5 + Math.round(Math.random() * 8),
}));
const latencyData = hours.map((t) => ({
    time: t,
    p50: +(1 + Math.random() * 3).toFixed(2),
    p95: +(5 + Math.random() * 12).toFixed(2),
    p99: +(15 + Math.random() * 30).toFixed(2),
}));
const cpuMem = hours.map((t) => ({
    time: t,
    cpu: 20 + Math.round(Math.random() * 35),
    mem: 55 + Math.round(Math.random() * 20),
}));
const walData = hours.map((t) => ({
    time: t,
    walMB: 40 + Math.round(Math.random() * 60),
    replLag: +(Math.random() * 1.5).toFixed(2),
}));
const storagePie = [
    { name: 'Tables', value: 62 },
    { name: 'Indexes', value: 24 },
    { name: 'TOAST', value: 8 },
    { name: 'WAL', value: 6 },
];
const slowQueries = [
    { query: 'SELECT o.*, u.name FROM orders o JOIN users u ...', ms: 842, calls: '12K', rows: '1.2M' },
    { query: 'UPDATE inventory SET stock = stock - $1 WHERE ...', ms: 534, calls: '8.4K', rows: '340K' },
    { query: 'SELECT COUNT(*) FROM analytics WHERE ts > ...', ms: 421, calls: '2.1K', rows: '4.8M' },
    { query: 'INSERT INTO audit_log SELECT * FROM staging ...', ms: 318, calls: '960', rows: '890K' },
    { query: 'DELETE FROM sessions WHERE expires_at < NOW()', ms: 289, calls: '480', rows: '2.1M' },
];
const PIE_COLORS = ['#38bdf8', '#818cf8', '#fbbf24', '#34d399'];

function DemoPostgresTab() {
    const DS = useMemo(() => getDS(), []);
    const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 };

    return (
        <div style={{ padding: 24, color: DS.text, minHeight: '100vh' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: DS.cyan, marginBottom: 4 }}>
                PostgreSQL Demo Dashboard
            </h2>
            <p style={{ color: DS.textSecondary, fontSize: 13, marginBottom: 24 }}>
                Sample metrics for a PostgreSQL 16 instance — demo_analytics (primary)
            </p>

            <SectionTitle>Health Overview</SectionTitle>
            <div style={grid}>
                <Card>
                    <Metric label="Uptime" value="63d" sub="Since restart" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="TPS" value="612" sub="Commits/sec" color={DS.cyan} />
                </Card>
                <Card>
                    <Metric label="Connections" value="52/100" sub="Active / max" color={DS.amber} />
                </Card>
                <Card>
                    <Metric label="Cache Hit" value="99.4%" sub="Buffer cache" color={DS.emerald} />
                </Card>
                <Card>
                    <Metric label="DB Size" value="148 GB" sub="All databases" color={DS.violet} />
                </Card>
                <Card>
                    <Metric label="Repl Lag" value="0.2s" sub="Standby avg" color={DS.emerald} />
                </Card>
            </div>

            <SectionTitle color={DS.violet}>Connections and TPS</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={tpsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                            <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="commits"
                                stroke={DS.emerald}
                                fill={DS.emerald}
                                fillOpacity={0.25}
                            />
                            <Area
                                type="monotone"
                                dataKey="rollbacks"
                                stroke={DS.rose}
                                fill={DS.rose}
                                fillOpacity={0.25}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <SectionTitle color={DS.amber}>Query Latency (ms)</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="p50"
                            stroke={DS.emerald}
                            strokeWidth={2}
                            dot={false}
                            name="p50"
                        />
                        <Line type="monotone" dataKey="p95" stroke={DS.amber} strokeWidth={2} dot={false} name="p95" />
                        <Line type="monotone" dataKey="p99" stroke={DS.rose} strokeWidth={2} dot={false} name="p99" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <SectionTitle color={DS.emerald}>System Resources</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={cpuMem}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis stroke={DS.textSecondary} tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke={DS.cyan}
                            fill={DS.cyan}
                            fillOpacity={0.2}
                            name="CPU %"
                        />
                        <Area
                            type="monotone"
                            dataKey="mem"
                            stroke={DS.violet}
                            fill={DS.violet}
                            fillOpacity={0.2}
                            name="Memory %"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <SectionTitle color={DS.rose}>Top Slow Queries</SectionTitle>
            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
                            {['Query', 'Avg (ms)', 'Calls', 'Rows'].map((h) => (
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
                                        maxWidth: 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {q.query}
                                </td>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        color: q.ms > 500 ? DS.rose : q.ms > 100 ? DS.amber : DS.emerald,
                                        fontWeight: 700,
                                    }}
                                >
                                    {q.ms}
                                </td>
                                <td style={{ padding: '8px 10px', color: DS.textSecondary }}>{q.calls}</td>
                                <td style={{ padding: '8px 10px', color: DS.textSecondary }}>{q.rows}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <SectionTitle color={DS.violet}>Storage Breakdown</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={storagePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={85}
                                dataKey="value"
                                label={({ name, value }) => `${name} ${value}%`}
                            >
                                {storagePie.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                    <Metric label="Total Size" value="148 GB" color={DS.cyan} />
                    <Metric label="Table Bloat" value="3.2%" sub="2.1 GB reclaimable" color={DS.amber} />
                    <Metric label="Index Bloat" value="1.8%" sub="640 MB reclaimable" color={DS.emerald} />
                </Card>
            </div>

            <SectionTitle color={DS.emerald}>Replication and WAL</SectionTitle>
            <Card>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={walData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                        <XAxis dataKey="time" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" stroke={DS.textSecondary} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="walMB"
                            stroke={DS.violet}
                            strokeWidth={2}
                            dot={false}
                            name="WAL (MB/s)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="replLag"
                            stroke={DS.rose}
                            strokeWidth={2}
                            dot={false}
                            name="Repl Lag (s)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
}

export default DemoPostgresTab;
