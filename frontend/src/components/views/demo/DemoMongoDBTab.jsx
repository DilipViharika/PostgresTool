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
import {
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Database,
    Clock,
    HardDrive,
    Zap,
    Lock,
    GitBranch,
    Grid3x3,
} from 'lucide-react';
import { GlassCard, MetricCard, BentoMetric, DataTable, ResourceGauge, ChipBadge } from '../../ui/SharedComponents.jsx';
import { getDS } from '../../../config/designTokens.js';

const DS = getDS();

const DemoMongoDBTab = ({ tabId }) => {
    // Chart colors
    const colors = {
        cyan: DS.cyan,
        violet: '#818cf8',
        emerald: '#34d399',
        amber: '#fbbf24',
        rose: '#fb7185',
    };

    // Helper function to create chart data
    const createChartData = (values, label = 'value') => {
        return values.map((v, i) => ({
            time: `${i}h`,
            [label]: v,
        }));
    };

    const createMultiChartData = (datasets) => {
        const length = Object.values(datasets)[0].length;
        return Array.from({ length }, (_, i) => {
            const point = { time: `${i}h` };
            Object.entries(datasets).forEach(([key, values]) => {
                point[key] = values[i];
            });
            return point;
        });
    };

    // ============ SECTION 1: HEALTH OVERVIEW ============
    const healthData = createChartData([92], 'score')[0];
    const serverInfo = {
        version: 'MongoDB 7.0.8',
        host: 'mongo-prod-01.vigil.demo',
        uptime: '62 days',
        engine: 'WiredTiger',
    };

    // ============ SECTION 2: OPERATIONS ============
    const opsData = createMultiChartData({
        Total: [
            6500, 7000, 7500, 8000, 8420, 8800, 8600, 8200, 7800, 7400, 7000, 6500, 6200, 6500, 7000, 7500, 8000, 8420,
            8800, 8600, 8200, 7800, 7400, 7000,
        ],
        Read: [
            4000, 4300, 4600, 4900, 5200, 5500, 5400, 5100, 4800, 4500, 4300, 4000, 3800, 4000, 4300, 4600, 4900, 5200,
            5500, 5400, 5100, 4800, 4500, 4300,
        ],
        Write: [
            1800, 2000, 2100, 2300, 2400, 2500, 2450, 2350, 2250, 2150, 2000, 1800, 1700, 1800, 2000, 2100, 2300, 2400,
            2500, 2450, 2350, 2250, 2150, 2000,
        ],
    });

    // ============ SECTION 3: LATENCY ============
    const latencyData = createMultiChartData({
        p50: [
            0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0,
            0.9, 0.8, 0.7,
        ],
        p95: [
            4.0, 4.5, 5.0, 5.2, 5.5, 5.8, 5.5, 5.2, 4.8, 4.5, 5.0, 5.2, 5.5, 5.8, 5.5, 5.2, 4.8, 4.5, 5.0, 5.2, 5.5,
            5.8, 5.5, 5.2,
        ],
        p99: [
            14.0, 16.0, 18.0, 18.4, 20.0, 22.0, 20.0, 18.4, 16.0, 15.0, 16.0, 18.0, 18.4, 20.0, 22.0, 20.0, 18.4, 16.0,
            15.0, 16.0, 18.0, 18.4, 20.0, 22.0,
        ],
    });

    // ============ SECTION 4: SYSTEM RESOURCES ============
    const cpuData = createChartData(
        [32, 35, 38, 40, 42, 45, 44, 42, 40, 38, 36, 34, 32, 34, 36, 38, 40, 42, 45, 44, 42, 40, 38, 36],
        'CPU',
    );
    const memoryData = createChartData(
        [68, 70, 71, 72, 74, 76, 75, 74, 73, 72, 71, 70, 68, 70, 71, 72, 74, 76, 75, 74, 73, 72, 71, 70],
        'Memory',
    );

    // ============ SECTION 5: WIREDTIGER CACHE ============
    const cacheData = createChartData(
        [80, 82, 84, 85, 86, 88, 87, 86, 85, 84, 83, 82, 80, 82, 84, 85, 86, 88, 87, 86, 85, 84, 83, 82],
        'Cache',
    );

    // ============ SECTION 6: SLOW QUERIES ============
    const slowQueriesColumns = [
        { key: 'namespace', label: 'Namespace', width: 150 },
        { key: 'operation', label: 'Operation', width: 100 },
        { key: 'duration', label: 'Duration (ms)', width: 120, align: 'right' },
        { key: 'scanned', label: 'Docs Scanned', width: 140, align: 'right' },
        { key: 'query', label: 'Query', width: 250 },
    ];

    const slowQueriesData = [
        {
            id: '1',
            namespace: 'ecommerce.orders',
            operation: 'find',
            duration: '12,800',
            scanned: '4,500,000',
            query: "{ status: 'pending'...",
        },
        {
            id: '2',
            namespace: 'analytics.events',
            operation: 'aggregate',
            duration: '8,400',
            scanned: '12,000,000',
            query: "[{ $match: { type: 'page'...",
        },
        {
            id: '3',
            namespace: 'ecommerce.products',
            operation: 'find',
            duration: '3,200',
            scanned: '800,000',
            query: '{ $text: { $search...',
        },
        {
            id: '4',
            namespace: 'social.posts',
            operation: 'aggregate',
            duration: '2,800',
            scanned: '2,000,000',
            query: "[{ $lookup: { from: 'users'...",
        },
    ];

    // ============ SECTION 7: REPLICATION ============
    const replicationColumns = [
        { key: 'member', label: 'Member', width: 200 },
        { key: 'state', label: 'State', width: 100 },
        { key: 'uptime', label: 'Uptime', width: 120 },
        { key: 'lag', label: 'Lag (ms)', width: 100, align: 'right' },
        { key: 'oplog', label: 'Oplog (GB)', width: 120, align: 'right' },
    ];

    const replicationData = [
        {
            id: '1',
            member: 'mongo-prod-01:27017',
            state: 'PRIMARY',
            uptime: '62 days',
            lag: '0',
            oplog: '12',
        },
        {
            id: '2',
            member: 'mongo-prod-02:27017',
            state: 'SECONDARY',
            uptime: '62 days',
            lag: '300',
            oplog: '12',
        },
        {
            id: '3',
            member: 'mongo-prod-03:27017',
            state: 'SECONDARY',
            uptime: '60 days',
            lag: '450',
            oplog: '12',
        },
    ];

    // ============ SECTION 8: SHARDING ============
    const shardDistributionData = [
        { name: 'shard-01', value: 85, label: '85M' },
        { name: 'shard-02', value: 82, label: '82M' },
        { name: 'shard-03', value: 83, label: '83M' },
    ];

    const shardingColumns = [
        { key: 'shard', label: 'Shard', width: 120 },
        { key: 'dbs', label: 'DBs', width: 80, align: 'right' },
        { key: 'collections', label: 'Collections', width: 120, align: 'right' },
        { key: 'documents', label: 'Documents', width: 150, align: 'right' },
        { key: 'size', label: 'Size (GB)', width: 120, align: 'right' },
    ];

    const shardingData = [
        {
            id: '1',
            shard: 'shard-01',
            dbs: '3',
            collections: '42',
            documents: '85,000,000',
            size: '120',
        },
        {
            id: '2',
            shard: 'shard-02',
            dbs: '3',
            collections: '42',
            documents: '82,000,000',
            size: '115',
        },
        {
            id: '3',
            shard: 'shard-03',
            dbs: '3',
            collections: '42',
            documents: '83,000,000',
            size: '118',
        },
    ];

    // ============ SECTION 9: STORAGE ============
    const storageDistributionData = [
        { name: 'ecommerce', value: 180, label: '180GB' },
        { name: 'analytics', value: 95, label: '95GB' },
        { name: 'social', value: 45, label: '45GB' },
        { name: 'logs', value: 25, label: '25GB' },
        { name: 'config', value: 5, label: '5GB' },
        { name: 'admin', value: 3, label: '3GB' },
    ];

    const storageColumns = [
        { key: 'database', label: 'Database', width: 120 },
        { key: 'size', label: 'Size (GB)', width: 120, align: 'right' },
        { key: 'collections', label: 'Collections', width: 130, align: 'right' },
        { key: 'documents', label: 'Documents', width: 150, align: 'right' },
    ];

    const storageData = [
        {
            id: '1',
            database: 'ecommerce',
            size: '180',
            collections: '18',
            documents: '125,000,000',
        },
        {
            id: '2',
            database: 'analytics',
            size: '95',
            collections: '32',
            documents: '85,000,000',
        },
        {
            id: '3',
            database: 'social',
            size: '45',
            collections: '12',
            documents: '32,000,000',
        },
        {
            id: '4',
            database: 'logs',
            size: '25',
            collections: '8',
            documents: '5,000,000',
        },
        {
            id: '5',
            database: 'config',
            size: '5',
            collections: '4',
            documents: '2,000,000',
        },
        {
            id: '6',
            database: 'admin',
            size: '3',
            collections: '2',
            documents: '1,000,000',
        },
    ];

    // ============ SECTION 10: ALERTS ============
    const alertsData = [
        {
            id: '1',
            severity: 'warning',
            message: 'Replication lag exceeded 500ms on mongo-prod-03',
            time: '13:45',
        },
        {
            id: '2',
            severity: 'info',
            message: 'Cache utilization above 85% threshold',
            time: '14:10',
        },
    ];

    const ChartTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div
                style={{
                    backgroundColor: DS.bgSecondary,
                    border: `1px solid ${DS.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: DS.text,
                }}
            >
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: DS.textMuted }}>{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} style={{ margin: '0', fontSize: '12px', color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                    </p>
                ))}
            </div>
        );
    };

    const AlertCard = ({ alert }) => {
        const isWarning = alert.severity === 'warning';
        const bgColor = isWarning ? `${colors.rose}11` : `${colors.cyan}11`;
        const borderColor = isWarning ? colors.rose : colors.cyan;
        const Icon = isWarning ? AlertCircle : CheckCircle;

        return (
            <div
                style={{
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                }}
            >
                <Icon size={20} color={borderColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                        style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: DS.text,
                        }}
                    >
                        {alert.message}
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '12px',
                            color: DS.textMuted,
                        }}
                    >
                        {alert.time}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            {/* ============ SECTION 1: HEALTH OVERVIEW ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.emerald,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Health Overview
                    </h2>
                    <ChipBadge label="DEMO DATA" variant="amber" />
                </div>

                <GlassCard>
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            alignItems: 'center',
                            marginBottom: '24px',
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <p
                                style={{
                                    margin: '0 0 4px 0',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: DS.textMuted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                MongoDB Demo Dashboard
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: DS.text,
                                }}
                            >
                                System Healthy
                            </p>
                        </div>
                        <ResourceGauge label="Health Score" value={92} max={100} color={colors.emerald} size="lg" />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <MetricCard
                            icon={<Zap size={20} color={colors.cyan} />}
                            label="Connections"
                            value="184"
                            unit=""
                            trend="stable"
                        />
                        <MetricCard
                            icon={<TrendingUp size={20} color={colors.violet} />}
                            label="Ops/sec"
                            value="8,420"
                            unit=""
                            trend="up"
                        />
                        <MetricCard
                            icon={<Clock size={20} color={colors.amber} />}
                            label="Avg Latency"
                            value="1.8"
                            unit="ms"
                            trend="stable"
                        />
                        <MetricCard
                            icon={<GitBranch size={20} color={colors.rose} />}
                            label="Repl Lag"
                            value="0.3"
                            unit="s"
                            trend="down"
                        />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px',
                            paddingTop: '16px',
                            borderTop: `1px solid ${DS.border}`,
                        }}
                    >
                        {Object.entries(serverInfo).map(([key, value]) => (
                            <div key={key}>
                                <p
                                    style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: DS.textMuted,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {key}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: DS.text,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </section>

            {/* ============ SECTION 2: OPERATIONS ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.violet,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Operations
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                            }}
                        >
                            Operations History
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={opsData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.cyan} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.emerald} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.emerald} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.rose} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.rose} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <YAxis
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="line" />
                                <Area
                                    type="monotone"
                                    dataKey="Total"
                                    stackId="1"
                                    stroke={colors.cyan}
                                    fillOpacity={0.4}
                                    fill="url(#colorTotal)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Read"
                                    stackId="1"
                                    stroke={colors.emerald}
                                    fillOpacity={0.4}
                                    fill="url(#colorRead)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Write"
                                    stackId="1"
                                    stroke={colors.rose}
                                    fillOpacity={0.4}
                                    fill="url(#colorWrite)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <BentoMetric
                            metrics={[
                                { label: 'Total', value: '8,420', unit: '/s' },
                                { label: 'Reads', value: '5,200', unit: '/s' },
                                { label: 'Writes', value: '2,400', unit: '/s' },
                                { label: 'Commands', value: '820', unit: '/s' },
                            ]}
                        />
                    </GlassCard>
                </div>
            </section>

            {/* ============ SECTION 3: LATENCY ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.amber,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Latency
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                            }}
                        >
                            Latency Percentiles
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={latencyData}>
                                <XAxis
                                    dataKey="time"
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <YAxis
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '16px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="p50"
                                    stroke={colors.emerald}
                                    dot={false}
                                    strokeWidth={2}
                                />
                                <Line type="monotone" dataKey="p95" stroke={colors.amber} dot={false} strokeWidth={2} />
                                <Line type="monotone" dataKey="p99" stroke={colors.rose} dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <BentoMetric
                            metrics={[
                                { label: 'p50', value: '0.8', unit: 'ms' },
                                { label: 'p95', value: '5.2', unit: 'ms' },
                                { label: 'p99', value: '18.4', unit: 'ms' },
                                { label: 'Active Ops', value: '24', unit: '' },
                            ]}
                        />
                    </GlassCard>
                </div>
            </section>

            {/* ============ SECTION 4: SYSTEM RESOURCES ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.rose,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        System Resources
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                justifyContent: 'center',
                            }}
                        >
                            <ResourceGauge label="CPU" value={42} max={100} color={colors.rose} size="md" />
                            <ResourceGauge label="Memory" value={74} max={100} color={colors.violet} size="md" />
                            <ResourceGauge label="Cache Fill" value={86} max={100} color={colors.cyan} size="md" />
                        </div>
                    </GlassCard>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                            }}
                        >
                            CPU Usage
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={cpuData}>
                                <defs>
                                    <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.rose} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.rose} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <YAxis
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="CPU"
                                    stroke={colors.rose}
                                    fillOpacity={0.4}
                                    fill="url(#colorCPU)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                            }}
                        >
                            Memory Usage
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={memoryData}>
                                <defs>
                                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.violet} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.violet} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <YAxis
                                    stroke={DS.textMuted}
                                    style={{ fontSize: '12px' }}
                                    tick={{ fill: DS.textMuted }}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="Memory"
                                    stroke={colors.violet}
                                    fillOpacity={0.4}
                                    fill="url(#colorMemory)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </section>

            {/* ============ SECTION 5: WIREDTIGER CACHE ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.cyan,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        WiredTiger Cache
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <ResourceGauge
                                label="Cache"
                                value={86}
                                max={100}
                                color={colors.cyan}
                                size="lg"
                                subtitle="7,045 / 8,192 MB"
                            />
                        </div>
                    </GlassCard>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <MetricCard
                        icon={<TrendingUp size={20} color={colors.emerald} />}
                        label="Hit Ratio"
                        value="99.2"
                        unit="%"
                        trend="up"
                    />
                    <MetricCard
                        icon={<Zap size={20} color={colors.rose} />}
                        label="Eviction Rate"
                        value="45"
                        unit="/s"
                        trend="stable"
                    />
                    <MetricCard
                        icon={<HardDrive size={20} color={colors.amber} />}
                        label="Dirty Pages"
                        value="3.2"
                        unit="%"
                        trend="down"
                    />
                    <MetricCard
                        icon={<Clock size={20} color={colors.violet} />}
                        label="Checkpoint"
                        value="2.4"
                        unit="s"
                        trend="stable"
                    />
                    <MetricCard
                        icon={<Database size={20} color={colors.cyan} />}
                        label="Journal"
                        value="180"
                        unit="/s"
                        trend="up"
                    />
                    <MetricCard
                        icon={<Grid3x3 size={20} color={colors.emerald} />}
                        label="Compression"
                        value="3.2"
                        unit="x"
                        trend="stable"
                    />
                </div>

                <GlassCard>
                    <p
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: DS.text,
                        }}
                    >
                        Cache Utilization
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={cacheData}>
                            <defs>
                                <linearGradient id="colorCache" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors.cyan} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                stroke={DS.textMuted}
                                style={{ fontSize: '12px' }}
                                tick={{ fill: DS.textMuted }}
                            />
                            <YAxis stroke={DS.textMuted} style={{ fontSize: '12px' }} tick={{ fill: DS.textMuted }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="Cache"
                                stroke={colors.cyan}
                                fillOpacity={0.4}
                                fill="url(#colorCache)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            </section>

            {/* ============ SECTION 6: SLOW QUERIES ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.rose,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Slow Queries
                    </h2>
                </div>

                <GlassCard>
                    <DataTable columns={slowQueriesColumns} data={slowQueriesData} />
                </GlassCard>
            </section>

            {/* ============ SECTION 7: REPLICATION ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.emerald,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Replication
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <DataTable columns={replicationColumns} data={replicationData} />
                    </GlassCard>

                    <GlassCard>
                        <BentoMetric
                            metrics={[
                                { label: 'Set Name', value: 'rs-prod', unit: '' },
                                { label: 'Oplog Window', value: '72', unit: 'h' },
                                { label: 'Sync Source', value: 'mongo-prod-01', unit: '' },
                            ]}
                        />
                    </GlassCard>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <MetricCard
                        icon={<Lock size={20} color={colors.amber} />}
                        label="Lock Queue"
                        value="2"
                        unit=""
                        trend="stable"
                    />
                    <MetricCard
                        icon={<Zap size={20} color={colors.cyan} />}
                        label="Tickets"
                        value="42"
                        unit="/128"
                        trend="stable"
                    />
                </div>
            </section>

            {/* ============ SECTION 8: SHARDING ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.violet,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Sharding
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                                textAlign: 'center',
                            }}
                        >
                            Shard Distribution (Documents)
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={shardDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, label }) => `${name} ${label}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill={colors.cyan} />
                                    <Cell fill={colors.violet} />
                                    <Cell fill={colors.emerald} />
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <DataTable columns={shardingColumns} data={shardingData} />
                    </GlassCard>
                </div>

                <GlassCard>
                    <BentoMetric
                        metrics={[
                            { label: 'Chunks', value: '2,048', unit: '' },
                            { label: 'Balanced', value: 'YES', unit: '' },
                            { label: 'Avg Chunk', value: '64', unit: 'MB' },
                            { label: 'Migrating', value: '0', unit: '' },
                        ]}
                    />
                </GlassCard>
            </section>

            {/* ============ SECTION 9: STORAGE ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.amber,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Storage
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <p
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: DS.text,
                                textAlign: 'center',
                            }}
                        >
                            Database Distribution
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={storageDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, label }) => `${name} ${label}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill={colors.cyan} />
                                    <Cell fill={colors.violet} />
                                    <Cell fill={colors.emerald} />
                                    <Cell fill={colors.amber} />
                                    <Cell fill={colors.rose} />
                                    <Cell fill={colors.amber} />
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <DataTable columns={storageColumns} data={storageData} />
                    </GlassCard>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <BentoMetric
                            metrics={[
                                { label: 'Total', value: '353', unit: 'GB' },
                                { label: 'Collections', value: '126', unit: '' },
                                { label: 'Documents', value: '250', unit: 'M' },
                                { label: 'Growth', value: '8.5', unit: 'GB/week' },
                            ]}
                        />
                    </GlassCard>

                    <GlassCard>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                            }}
                        >
                            <MetricCard
                                icon={<Grid3x3 size={20} color={colors.cyan} />}
                                label="Indexes"
                                value="380"
                                unit=""
                                trend="stable"
                            />
                            <MetricCard
                                icon={<AlertCircle size={20} color={colors.rose} />}
                                label="Unused"
                                value="15"
                                unit=""
                                trend="down"
                            />
                            <MetricCard
                                icon={<HardDrive size={20} color={colors.amber} />}
                                label="Bloated"
                                value="4"
                                unit=""
                                trend="stable"
                            />
                            <MetricCard
                                icon={<TrendingUp size={20} color={colors.emerald} />}
                                label="Efficiency"
                                value="97.8"
                                unit="%"
                                trend="up"
                            />
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* ============ SECTION 10: ALERTS ============ */}
            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.rose,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: DS.text,
                            margin: 0,
                        }}
                    >
                        Alerts & Events
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    {alertsData.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>

                <GlassCard>
                    <BentoMetric
                        metrics={[
                            { label: 'Active', value: '2', unit: '' },
                            { label: 'Rules', value: '45', unit: '' },
                            { label: 'Triggered Today', value: '5', unit: '' },
                        ]}
                    />
                </GlassCard>
            </section>
        </div>
    );
};

export default DemoMongoDBTab;
