import React from 'react';
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
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { GlassCard, MetricCard, BentoMetric, DataTable, ResourceGauge, ChipBadge } from '../../ui/SharedComponents.jsx';
import { getDS } from '../../../config/designTokens.js';
import {
    TrendingUp,
    AlertCircle,
    Database,
    Zap,
    Clock,
    Activity,
    HardDrive,
    Lock,
    RefreshCw,
    Gauge,
    FileText,
} from 'lucide-react';

const DemoPostgresTab = ({ tabId }) => {
    const DS = getDS();

    // Inline demo data
    const connectionHistory = [
        28, 31, 35, 38, 42, 39, 45, 50, 48, 42, 38, 35, 40, 42, 44, 47, 50, 48, 45, 42, 39, 36, 33, 30,
    ];
    const tpsHistory = [
        980, 1020, 1100, 1180, 1247, 1300, 1280, 1200, 1150, 1100, 1050, 980, 920, 950, 1020, 1100, 1180, 1247, 1300,
        1280, 1200, 1150, 1100, 1050,
    ];
    const p50History = [
        2.1, 2.3, 2.4, 2.6, 2.8, 2.5, 2.3, 2.4, 2.5, 2.7, 2.9, 3.0, 2.8, 2.6, 2.4, 2.3, 2.4, 2.5, 2.6, 2.4, 2.3, 2.2,
        2.3, 2.4,
    ];
    const p95History = [
        10.2, 11.5, 12.8, 14.1, 15.0, 13.5, 12.0, 12.8, 13.5, 14.8, 16.0, 17.2, 15.5, 14.0, 12.8, 11.5, 12.8, 13.5,
        14.1, 12.8, 11.5, 10.8, 11.2, 12.8,
    ];
    const p99History = [
        38.0, 42.1, 45.2, 48.5, 52.0, 47.0, 43.0, 45.2, 47.8, 50.5, 54.0, 58.0, 52.0, 48.0, 45.2, 42.0, 45.2, 47.8,
        48.5, 45.2, 42.0, 39.5, 40.8, 45.2,
    ];
    const cpuHistory = [18, 20, 22, 25, 28, 32, 30, 28, 26, 24, 22, 20, 18, 19, 21, 24, 27, 30, 28, 26, 24, 22, 20, 18];
    const memoryHistory = [
        11.8, 12.0, 12.2, 12.4, 12.6, 12.8, 12.6, 12.4, 12.2, 12.0, 11.8, 11.9, 12.0, 12.2, 12.4, 12.6, 12.4, 12.2,
        12.0, 11.8, 11.9, 12.0, 12.2, 12.4,
    ];

    // Convert to chart data format
    const connectionData = connectionHistory.map((v, i) => ({ time: `${i}h`, value: v }));
    const tpsData = tpsHistory.map((v, i) => ({ time: `${i}h`, value: v }));
    const latencyData = p50History.map((p50, i) => ({
        time: `${i}h`,
        p50: p50,
        p95: p95History[i],
        p99: p99History[i],
    }));
    const cpuData = cpuHistory.map((v, i) => ({ time: `${i}h`, value: v }));
    const memoryData = memoryHistory.map((v, i) => ({ time: `${i}h`, value: v }));

    // Slow queries data
    const slowQueries = [
        {
            query: 'SELECT o.*, c.name FROM orders o JOIN customers...',
            avgTime: 892,
            calls: 1420,
            rows: 8500,
        },
        {
            query: 'SELECT p.*, array_agg(t.name) FROM products p...',
            avgTime: 654,
            calls: 890,
            rows: 12000,
        },
        {
            query: 'WITH monthly_stats AS (SELECT date_trunc...',
            avgTime: 445,
            calls: 240,
            rows: 24,
        },
        {
            query: 'SELECT u.*, COUNT(o.id) as order_count...',
            avgTime: 312,
            calls: 560,
            rows: 3200,
        },
        {
            query: 'UPDATE inventory SET quantity...',
            avgTime: 28,
            calls: 45000,
            rows: 45000,
        },
    ];

    // Storage breakdown data
    const storageData = [
        { name: 'Tables', value: 180, fill: DS.cyan || '#06b6d4' },
        { name: 'Indexes', value: 85, fill: DS.violet || '#818cf8' },
        { name: 'WAL', value: 25, fill: DS.emerald || '#34d399' },
        { name: 'Temp', value: 5, fill: DS.amber || '#fbbf24' },
        { name: 'System', value: 15, fill: DS.rose || '#fb7185' },
    ];

    // Top tables data
    const topTables = [
        { name: 'orders', size_mb: 2540, rows: 1240000, bloat_pct: 12, seq_scan: 234, idx_scan: 12890 },
        { name: 'customers', size_mb: 1850, rows: 89000, bloat_pct: 8, seq_scan: 156, idx_scan: 45230 },
        { name: 'products', size_mb: 1200, rows: 45000, bloat_pct: 15, seq_scan: 890, idx_scan: 234560 },
        { name: 'order_items', size_mb: 3450, rows: 5670000, bloat_pct: 18, seq_scan: 567, idx_scan: 234890 },
        { name: 'inventory', size_mb: 950, rows: 45000, bloat_pct: 5, seq_scan: 123, idx_scan: 567890 },
        { name: 'categories', size_mb: 280, rows: 120, bloat_pct: 2, seq_scan: 45, idx_scan: 12340 },
        { name: 'reviews', size_mb: 780, rows: 234000, bloat_pct: 22, seq_scan: 678, idx_scan: 89012 },
        { name: 'transactions', size_mb: 2100, rows: 890000, bloat_pct: 10, seq_scan: 345, idx_scan: 345670 },
    ];

    // Replicas data
    const replicas = [
        { name: 'replica-1', lag_ms: 2.4, state: 'streaming', sent_lsn: '0/2C5E02A8', replay_lsn: '0/2C5E02A0' },
        { name: 'replica-2', lag_ms: 5.8, state: 'streaming', sent_lsn: '0/2C5E02A8', replay_lsn: '0/2C5E0290' },
        { name: 'replica-3', lag_ms: 12.1, state: 'catching-up', sent_lsn: '0/2C5E02A8', replay_lsn: '0/2C5E0250' },
    ];

    const SectionHeader = ({ icon: Icon, title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: DS.cyan || '#06b6d4',
                }}
            />
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: DS.text,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                {Icon && <Icon size={20} />}
                {title}
            </h3>
        </div>
    );

    return (
        <div
            style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                backgroundColor: DS.bg || '#0f172a',
                color: DS.text,
            }}
        >
            {/* Banner */}
            <GlassCard>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 24,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: 28,
                                fontWeight: 700,
                                color: DS.text,
                            }}
                        >
                            PostgreSQL Demo Dashboard
                        </h1>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: DS.textMuted,
                                fontWeight: 500,
                            }}
                        >
                            Sample metrics for demonstration purposes
                        </p>
                    </div>
                    <ChipBadge label="DEMO DATA" color="amber" />
                </div>
            </GlassCard>

            {/* Section 1: Health Overview */}
            <div>
                <SectionHeader icon={Gauge} title="Health Overview" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    <GlassCard>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <ResourceGauge value={87} max={100} label="Health Score" />
                        </div>
                    </GlassCard>
                    <MetricCard
                        label="Cache Hit Ratio"
                        value="99.4%"
                        icon={<Activity size={20} />}
                        trend={{ value: 0.3, isPositive: true }}
                        color="emerald"
                    />
                    <MetricCard
                        label="Connection Usage"
                        value="34%"
                        icon={<Zap size={20} />}
                        trend={{ value: 2.1, isPositive: false }}
                        color="cyan"
                    />
                    <MetricCard
                        label="Disk Usage"
                        value="62%"
                        icon={<HardDrive size={20} />}
                        trend={{ value: 1.2, isPositive: false }}
                        color="violet"
                    />
                    <MetricCard label="Replication" value="Healthy" icon={<RefreshCw size={20} />} color="emerald" />
                </div>
            </div>

            {/* Section 2: Connections & Transactions */}
            <div>
                <SectionHeader icon={Activity} title="Connections & Transactions" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    <GlassCard>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: DS.text }}>
                            Active Connections
                        </h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={connectionData}>
                                    <defs>
                                        <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DS.cyan || '#06b6d4'} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={DS.cyan || '#06b6d4'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: DS.textMuted, fontSize: 12 }}
                                        stroke={`${DS.border}44`}
                                    />
                                    <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: DS.card || '#1e293b',
                                            border: `1px solid ${DS.border}`,
                                            borderRadius: 8,
                                            color: DS.text,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={DS.cyan || '#06b6d4'}
                                        fillOpacity={1}
                                        fill="url(#colorConn)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: DS.text }}>
                            Transactions Per Second
                        </h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tpsData}>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: DS.textMuted, fontSize: 12 }}
                                        stroke={`${DS.border}44`}
                                    />
                                    <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: DS.card || '#1e293b',
                                            border: `1px solid ${DS.border}`,
                                            borderRadius: 8,
                                            color: DS.text,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={DS.violet || '#818cf8'}
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <BentoMetric label="Active" value="42" icon={<Activity size={20} />} color="cyan" />
                    <BentoMetric label="Idle" value="78" icon={<Zap size={20} />} color="slate" />
                    <BentoMetric label="Waiting" value="3" icon={<Clock size={20} />} color="rose" />
                    <BentoMetric label="TPS" value="1,250" icon={<TrendingUp size={20} />} color="violet" />
                </div>
            </div>

            {/* Section 3: Latency Distribution */}
            <div>
                <SectionHeader icon={Clock} title="Latency Distribution" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    <GlassCard style={{ gridColumn: '1 / -1' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: DS.text }}>
                            Percentile Latency Over Time
                        </h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={latencyData}>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: DS.textMuted, fontSize: 12 }}
                                        stroke={`${DS.border}44`}
                                    />
                                    <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: DS.card || '#1e293b',
                                            border: `1px solid ${DS.border}`,
                                            borderRadius: 8,
                                            color: DS.text,
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="p50"
                                        stroke={DS.emerald || '#34d399'}
                                        dot={false}
                                        strokeWidth={2}
                                        name="p50"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="p95"
                                        stroke={DS.amber || '#fbbf24'}
                                        dot={false}
                                        strokeWidth={2}
                                        name="p95"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="p99"
                                        stroke={DS.rose || '#fb7185'}
                                        dot={false}
                                        strokeWidth={2}
                                        name="p99"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <BentoMetric label="p50" value="2.4ms" icon={<Zap size={20} />} color="emerald" />
                    <BentoMetric label="p95" value="12.8ms" icon={<Zap size={20} />} color="amber" />
                    <BentoMetric label="p99" value="45.2ms" icon={<Zap size={20} />} color="rose" />
                    <BentoMetric label="Average" value="4.1ms" icon={<Clock size={20} />} color="cyan" />
                </div>
            </div>

            {/* Section 4: System Resources */}
            <div>
                <SectionHeader icon={Gauge} title="System Resources" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    <GlassCard>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <ResourceGauge value={28} max={100} label="CPU Usage" />
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <ResourceGauge value={38.75} max={100} label="Memory Usage" />
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: DS.text }}>
                            CPU History
                        </h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cpuData}>
                                    <defs>
                                        <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DS.amber || '#fbbf24'} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={DS.amber || '#fbbf24'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: DS.textMuted, fontSize: 12 }}
                                        stroke={`${DS.border}44`}
                                    />
                                    <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: DS.card || '#1e293b',
                                            border: `1px solid ${DS.border}`,
                                            borderRadius: 8,
                                            color: DS.text,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={DS.amber || '#fbbf24'}
                                        fillOpacity={1}
                                        fill="url(#colorCPU)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: DS.text }}>
                            Memory History
                        </h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={memoryData}>
                                    <defs>
                                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DS.cyan || '#06b6d4'} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={DS.cyan || '#06b6d4'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: DS.textMuted, fontSize: 12 }}
                                        stroke={`${DS.border}44`}
                                    />
                                    <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                    <Tooltip
                                        contentStyle={{
                                            background: DS.card || '#1e293b',
                                            border: `1px solid ${DS.border}`,
                                            borderRadius: 8,
                                            color: DS.text,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={DS.cyan || '#06b6d4'}
                                        fillOpacity={1}
                                        fill="url(#colorMem)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Section 5: Slow Queries */}
            <div>
                <SectionHeader icon={FileText} title="Slow Queries" />
                <GlassCard>
                    <DataTable
                        columns={[
                            { key: 'query', label: 'Query', width: '45%' },
                            { key: 'avgTime', label: 'Avg Time (ms)', width: '18%' },
                            { key: 'calls', label: 'Calls', width: '18%' },
                            { key: 'rows', label: 'Rows', width: '18%' },
                        ]}
                        rows={slowQueries.map((q) => ({
                            query: q.query,
                            avgTime: q.avgTime.toLocaleString(),
                            calls: q.calls.toLocaleString(),
                            rows: q.rows.toLocaleString(),
                        }))}
                    />
                </GlassCard>
            </div>
        </div>
    );
};

export default DemoPostgresTab;
