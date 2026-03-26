import React, { useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import DemoLayout, {
    Panel,
    StatusBadge,
    RingGauge,
    MiniSparkline,
    HeroMetric,
    ChartTip,
    generateChartData,
} from './DemoLayout.jsx';
import {
    Activity,
    Database,
    Zap,
    HardDrive,
    Brain,
    RefreshCw,
    Settings,
    Clock,
    TrendingUp,
    Server,
    Shield,
    Lock,
    Users,
    Eye,
    Network,
    Gauge,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Layers,
    Code,
    GitBranch,
    Map,
    Download,
    Upload,
    Filter,
    Copy,
    AlertTriangle,
    Cpu,
    Globe,
    Archive,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
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
} from 'recharts';

function DemoMongoDBTab({ tabId }) {
    useAdaptiveTheme();

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const base30d = generateChartData(30);

        return {
            // Charts
            opsVelocity: base24h.map((d) => ({
                ...d,
                read: Math.floor(4200 + Math.sin(d.index / 6) * 800 + Math.random() * 300),
                write: Math.floor(2100 + Math.cos(d.index / 6) * 500 + Math.random() * 250),
                command: Math.floor(890 + Math.sin(d.index / 8) * 200 + Math.random() * 100),
            })),
            connectionTrends: base24h.map((d) => ({
                ...d,
                active: Math.floor(67 + Math.sin(d.index / 8) * 20 + Math.random() * 15),
                idle: Math.floor(45 + Math.cos(d.index / 8) * 25 + Math.random() * 18),
            })),
            latencyPercentiles: base24h.map((d) => ({
                ...d,
                p50: Math.floor(8 + Math.sin(d.index / 7) * 3 + Math.random() * 2),
                p95: Math.floor(35 + Math.sin(d.index / 5) * 8 + Math.random() * 5),
                p99: Math.floor(92 + Math.cos(d.index / 4) * 15 + Math.random() * 8),
            })),
            lockWaits: base24h.map((d) => ({
                ...d,
                waits: Math.floor(12 + Math.sin(d.index / 6) * 5 + Math.random() * 3),
                deadlocks: Math.floor(0 + Math.random() * 2),
            })),
            queryThroughput: base24h.map((d) => ({
                ...d,
                queued: Math.floor(3 + Math.sin(d.index / 9) * 2 + Math.random() * 1),
                executing: Math.floor(18 + Math.cos(d.index / 7) * 4 + Math.random() * 2),
            })),
            wiredTigerMetrics: base24h.map((d) => ({
                ...d,
                evictions: Math.floor(240 + Math.sin(d.index / 5) * 80 + Math.random() * 40),
                cacheFillPct: Math.floor(73 + Math.sin(d.index / 8) * 10 + Math.random() * 5),
            })),
            // Collections and documents
            collections: [
                { name: 'orders', docs: 2840000, size: '12.4 GB', indexes: 6, avgDocSize: 4.6 },
                { name: 'customers', docs: 145000, size: '2.1 GB', indexes: 4, avgDocSize: 15.2 },
                { name: 'transactions', docs: 5620000, size: '18.9 GB', indexes: 8, avgDocSize: 3.4 },
                { name: 'logs', docs: 18200000, size: '34.2 GB', indexes: 3, avgDocSize: 1.9 },
                { name: 'inventory', docs: 580000, size: '4.8 GB', indexes: 5, avgDocSize: 8.7 },
            ],
            // Replica set
            replicas: [
                { id: 'replica-0', role: 'PRIMARY', state: 'SECONDARY', syncLag: '0ms', health: 1.0 },
                { id: 'replica-1', role: 'SECONDARY', state: 'SECONDARY', syncLag: '2ms', health: 0.98 },
                { id: 'replica-2', role: 'SECONDARY', state: 'SECONDARY', syncLag: '3ms', health: 0.97 },
                { id: 'arbiter-0', role: 'ARBITER', state: 'ARBITER', syncLag: 'N/A', health: 0.99 },
            ],
            // Shards
            shards: [
                { id: 'shard-0', docs: 1850000, size: '8.2 GB', chunks: 24, status: 'active' },
                { id: 'shard-1', docs: 1910000, size: '8.5 GB', chunks: 25, status: 'active' },
                { id: 'shard-2', docs: 1880000, size: '8.3 GB', chunks: 23, status: 'active' },
            ],
            // Slow queries
            slowQueries: [
                {
                    query: 'db.orders.find({status: {$in: ["pending", "processing"]}}).sort({createdAt: -1})',
                    duration: 2840,
                    scanned: 485200,
                    returned: 2100,
                },
                {
                    query: 'db.transactions.aggregate([{$match: {amount: {$gt: 1000}}}, {$group: {_id: "$userId"}}])',
                    duration: 1950,
                    scanned: 1240000,
                    returned: 34500,
                },
                {
                    query: 'db.logs.find({level: "ERROR"}).limit(10000)',
                    duration: 1620,
                    scanned: 18200000,
                    returned: 10000,
                },
            ],
            // Backups
            backups: [
                {
                    time: '2025-03-26 02:00 UTC',
                    size: '42.3 GB',
                    duration: '12m 34s',
                    type: 'FULL',
                    status: 'completed',
                },
                {
                    time: '2025-03-25 02:00 UTC',
                    size: '41.8 GB',
                    duration: '12m 18s',
                    type: 'FULL',
                    status: 'completed',
                },
                {
                    time: '2025-03-24 02:00 UTC',
                    size: '40.9 GB',
                    duration: '11m 52s',
                    type: 'FULL',
                    status: 'completed',
                },
            ],
            // Alerts
            alerts: [
                { severity: 'critical', message: 'Replication lag exceeded 5 seconds', count: 2 },
                { severity: 'warning', message: 'Cache eviction rate above baseline', count: 7 },
                { severity: 'info', message: 'Chunk balancing in progress', count: 1 },
            ],
        };
    }, []);

    // 7 sections with exact keys and accents
    const sections = [
        {
            key: 'overview',
            label: 'Overview',
            icon: Activity,
            accent: THEME.primary,
            items: [
                { key: 'exec-dash', label: 'Executive Dashboard' },
                { key: 'connection', label: 'Connection' },
                { key: 'server-info', label: 'Server Info' },
                { key: 'databases', label: 'Databases' },
                { key: 'collection-rels', label: 'Collection Relationships' },
            ],
        },
        {
            key: 'performance',
            label: 'Performance',
            icon: Zap,
            accent: THEME.warning,
            items: [
                { key: 'server-status', label: 'Server Status' },
                { key: 'realtime-ops', label: 'Real-time Ops' },
                { key: 'latency-percentiles', label: 'Latency Percentiles' },
                { key: 'namespace-insights', label: 'Namespace Insights' },
                { key: 'explain-plan', label: 'Explain Plan' },
                { key: 'active-ops', label: 'Active Operations' },
                { key: 'slow-queries', label: 'Slow Queries' },
                { key: 'query-profiler', label: 'Query Profiler' },
                { key: 'query-cost', label: 'Query Cost Estimator' },
                { key: 'lock-analysis', label: 'Lock Analysis' },
                { key: 'anomaly-detection', label: 'Anomaly Detection' },
                { key: 'metrics-preview', label: 'Metrics Preview' },
                { key: 'live-agent', label: 'Live Agent' },
            ],
        },
        {
            key: 'storage',
            label: 'Storage',
            icon: HardDrive,
            accent: THEME.secondary,
            items: [
                { key: 'index-advisor', label: 'Index Advisor' },
                { key: 'schema-analyzer', label: 'Schema Analyzer' },
                { key: 'collection-stats', label: 'Collection Stats' },
                { key: 'wiredtiger-cache', label: 'WiredTiger Cache' },
                { key: 'backup-monitor', label: 'Backup Monitor' },
                { key: 'capacity-planning', label: 'Capacity Planning' },
                { key: 'network', label: 'Network' },
            ],
        },
        {
            key: 'data',
            label: 'Data',
            icon: Database,
            accent: THEME.ai,
            items: [
                { key: 'doc-editor', label: 'Document Editor' },
                { key: 'agg-builder', label: 'Aggregation Builder' },
                { key: 'nl-query', label: 'NL Query Generator' },
                { key: 'import-export', label: 'Import/Export' },
                { key: 'sql-translator', label: 'SQL Translator' },
                { key: 'schema-compare', label: 'Schema Compare' },
                { key: 'geospatial', label: 'Geo-spatial' },
            ],
        },
        {
            key: 'intelligence',
            label: 'Intelligence',
            icon: Brain,
            accent: THEME.success,
            items: [
                { key: 'ai-hints', label: 'AI Hints' },
                { key: 'compare-clusters', label: 'Compare Clusters' },
                { key: 'historical-trends', label: 'Historical Trends' },
                { key: 'perf-advisor-v2', label: 'Perf Advisor v2' },
                { key: 'trace-correlator', label: 'Trace Correlator' },
            ],
        },
        {
            key: 'replication',
            label: 'Replication',
            icon: RefreshCw,
            accent: THEME.primary,
            items: [
                { key: 'replica-set', label: 'Replica Set + Failover' },
                { key: 'sharding', label: 'Sharding' },
                { key: 'oplog-tail', label: 'Oplog Tail' },
            ],
        },
        {
            key: 'management',
            label: 'Management',
            icon: Settings,
            accent: THEME.danger,
            items: [
                { key: 'alert-manager', label: 'Alert Manager' },
                { key: 'prometheus-export', label: 'Prometheus Export' },
                { key: 'sso-auth', label: 'SSO/Auth' },
                { key: 'atlas-bridge', label: 'Atlas API Bridge' },
                { key: 'dashboards', label: 'Dashboards' },
                { key: 'reports', label: 'Reports' },
                { key: 'audit-log', label: 'Audit Log' },
                { key: 'users', label: 'Users' },
            ],
        },
    ];

    // Main renderContent function
    const renderContent = (sectionKey, itemKey) => {
        // ═══ OVERVIEW ═══════════════════════════════════════════════════════
        if (sectionKey === 'overview') {
            if (itemKey === 'exec-dash') {
                return (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 14,
                            marginBottom: 20,
                        }}
                    >
                        <HeroMetric
                            label="Total Collections"
                            value="12"
                            subtext="5 hot collections"
                            icon={Database}
                            color={THEME.primary}
                        />
                        <HeroMetric
                            label="Total Documents"
                            value="29.3M"
                            subtext={`${(29.3 * 1000).toFixed(0)}K unique`}
                            icon={Layers}
                            color={THEME.secondary}
                        />
                        <HeroMetric
                            label="Data Size"
                            value="72.4 GB"
                            subtext="Compressed: 18.2 GB"
                            icon={HardDrive}
                            color={THEME.warning}
                        />
                        <HeroMetric
                            label="Avg Latency"
                            value="12.4ms"
                            subtext="p99: 89ms"
                            icon={Clock}
                            color={THEME.info}
                        />
                    </div>
                );
            }
            if (itemKey === 'connection') {
                return (
                    <Panel title="Connection Status" subtitle="MongoDB Connection Details">
                        <div style={{ fontSize: 12, lineHeight: 1.6, color: THEME.textAlt }}>
                            <div
                                style={{
                                    marginBottom: 8,
                                    paddingBottom: 8,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600 }}>Host</div>
                                <div style={{ fontFamily: THEME.fontMono }}>
                                    mongodb+srv://user:pass@cluster.mongodb.net
                                </div>
                            </div>
                            <div
                                style={{
                                    marginBottom: 8,
                                    paddingBottom: 8,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600 }}>Replica Set</div>
                                <div>rs0 (3 nodes + 1 arbiter)</div>
                            </div>
                            <div
                                style={{
                                    marginBottom: 8,
                                    paddingBottom: 8,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600 }}>Connection Pool</div>
                                <div>47 active / 50 max connections</div>
                            </div>
                            <StatusBadge status="connected" label="Connected" />
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'server-info') {
                return (
                    <Panel title="Server Information" subtitle="MongoDB Server Metadata">
                        <div style={{ fontSize: 12, lineHeight: 1.8, color: THEME.textAlt }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Version
                                    </div>
                                    <div style={{ fontFamily: THEME.fontMono }}>7.0.2-community</div>
                                </div>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Engine
                                    </div>
                                    <div>WiredTiger 11.0</div>
                                </div>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Memory
                                    </div>
                                    <div>4.7 GB / 8.0 GB</div>
                                </div>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Uptime
                                    </div>
                                    <div>48d 14h 23m</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'databases') {
                return (
                    <Panel title="Databases Overview" subtitle="All databases with document counts">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.collections.map((c) => (
                                <div
                                    key={c.name}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 0',
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <span style={{ color: THEME.textMain, fontWeight: 600 }}>{c.name}</span>
                                    <span>{(c.docs / 1000000).toFixed(2)}M docs</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'collection-rels') {
                return (
                    <Panel title="Collection Relationships" subtitle="Document reference graph">
                        <div style={{ fontSize: 12, lineHeight: 1.7, color: THEME.textAlt }}>
                            <div
                                style={{
                                    marginBottom: 12,
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.primary}`,
                                }}
                            >
                                <div style={{ color: THEME.primary, fontWeight: 600, marginBottom: 4 }}>
                                    orders {'→'} customers
                                </div>
                                <div style={{ fontSize: 11 }}>Foreign key: customerId</div>
                            </div>
                            <div
                                style={{
                                    marginBottom: 12,
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.info, fontWeight: 600, marginBottom: 4 }}>
                                    transactions {'→'} orders
                                </div>
                                <div style={{ fontSize: 11 }}>Embedded array: order_refs</div>
                            </div>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.warning}`,
                                }}
                            >
                                <div style={{ color: THEME.warning, fontWeight: 600, marginBottom: 4 }}>
                                    logs {'→'} transactions
                                </div>
                                <div style={{ fontSize: 11 }}>Denormalized: transaction_id</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ PERFORMANCE ════════════════════════════════════════════════════
        if (sectionKey === 'performance') {
            if (itemKey === 'server-status') {
                return (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 14,
                            marginBottom: 20,
                        }}
                    >
                        <HeroMetric
                            label="Ops/sec"
                            value="7,189"
                            subtext="peak: 8,240"
                            icon={Zap}
                            color={THEME.primary}
                        />
                        <HeroMetric
                            label="Connections"
                            value="47"
                            subtext="47% utilization"
                            icon={Network}
                            color={THEME.success}
                        />
                        <HeroMetric
                            label="Replication Lag"
                            value="2.3ms"
                            subtext="within SLA"
                            icon={Clock}
                            color={THEME.success}
                        />
                        <HeroMetric
                            label="Cache Hit"
                            value="96.8%"
                            subtext="excellent"
                            icon={Gauge}
                            color={THEME.info}
                        />
                    </div>
                );
            }
            if (itemKey === 'realtime-ops') {
                return (
                    <Panel title="Real-time Operations" subtitle="Last 24 hours throughput">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.opsVelocity}>
                                <defs>
                                    <linearGradient id="gradient-read" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.success} stopOpacity={0.01} />
                                    </linearGradient>
                                    <linearGradient id="gradient-write" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.warning} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.warning} stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Area
                                    type="monotone"
                                    dataKey="read"
                                    stackId="1"
                                    stroke={THEME.success}
                                    fill="url(#gradient-read)"
                                    isAnimationActive={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="write"
                                    stackId="1"
                                    stroke={THEME.warning}
                                    fill="url(#gradient-write)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'latency-percentiles') {
                return (
                    <Panel title="Latency Percentiles" subtitle="p50 / p95 / p99 (milliseconds)">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.latencyPercentiles}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Line
                                    type="monotone"
                                    dataKey="p50"
                                    stroke={THEME.success}
                                    dot={false}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p95"
                                    stroke={THEME.warning}
                                    dot={false}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p99"
                                    stroke={THEME.danger}
                                    dot={false}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'namespace-insights') {
                return (
                    <Panel title="Namespace Insights" subtitle="Database.Collection performance breakdown">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.collections.slice(0, 3).map((c) => (
                                <div
                                    key={c.name}
                                    style={{
                                        marginBottom: 12,
                                        paddingBottom: 12,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>db.{c.name}</span>
                                        <span style={{ color: THEME.info }}>{c.indexes} indexes</span>
                                    </div>
                                    <MiniSparkline
                                        values={Array.from({ length: 12 }, () => Math.random() * 100)}
                                        height={24}
                                    />
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'explain-plan') {
                return (
                    <Panel title="Query Execution Plan" subtitle="$match {'→'} $sort {'→'} $group">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.7 }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.primary}`,
                                }}
                            >
                                <div style={{ color: THEME.primary, fontWeight: 600 }}>Stage 1: COLLSCAN</div>
                                <div style={{ fontSize: 11 }}>Scanned: 2.1M documents</div>
                            </div>
                            <div
                                style={{
                                    marginBottom: 10,
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.warning}`,
                                }}
                            >
                                <div style={{ color: THEME.warning, fontWeight: 600 }}>Stage 2: SORT</div>
                                <div style={{ fontSize: 11 }}>Memory: 124 MB (in-memory sort)</div>
                            </div>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ color: THEME.success, fontWeight: 600 }}>Stage 3: GROUP</div>
                                <div style={{ fontSize: 11 }}>Returned: 34.5K documents</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'active-ops') {
                return (
                    <Panel title="Active Operations" subtitle="Queries executing in real-time">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '7px 0',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>find(status: pending)</span>
                                <span style={{ color: THEME.success }}>124 ms</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '7px 0',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>aggregate($group)</span>
                                <span style={{ color: THEME.warning }}>892 ms</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>updateMany(bulk)</span>
                                <span style={{ color: THEME.info }}>341 ms</span>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'slow-queries') {
                return (
                    <Panel title="Slow Queries" subtitle="Queries exceeding 1.5s execution time">
                        <div style={{ fontSize: 10, color: THEME.textAlt, lineHeight: 1.6 }}>
                            {demoData.slowQueries.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: 12,
                                        paddingBottom: 12,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            color: THEME.textMain,
                                            fontSize: 10,
                                            marginBottom: 6,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {q.query}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
                                        <span>Duration:</span>
                                        <span style={{ color: THEME.warning }}>{q.duration} ms</span>
                                        <span>Scanned:</span>
                                        <span>{(q.scanned / 1000000).toFixed(2)}M docs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'query-profiler') {
                return (
                    <Panel title="Query Profiler" subtitle="Top 10 queries by total time">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={[
                                    { name: 'find', duration: 2340 },
                                    { name: 'aggregate', duration: 1890 },
                                    { name: 'updateOne', duration: 1240 },
                                    { name: 'deleteMany', duration: 890 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="duration" fill={THEME.primary} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'query-cost') {
                return (
                    <Panel title="Query Cost Estimator" subtitle="Estimated I/O and memory consumption">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Est. I/O Cost
                                    </div>
                                    <RingGauge value={68} max={100} color={THEME.warning} label="Read: 68%" />
                                </div>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Est. Memory
                                    </div>
                                    <RingGauge value={45} max={100} color={THEME.info} label="45 MB" />
                                </div>
                            </div>
                            <div style={{ padding: '8px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 2 }}>
                                    Recommendation
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textAlt }}>
                                    Add index on (customerId, createdAt)
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'lock-analysis') {
                return (
                    <Panel title="Lock Analysis" subtitle="Write lock contention and waits">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.lockWaits}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Line
                                    type="monotone"
                                    dataKey="waits"
                                    stroke={THEME.warning}
                                    dot={false}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'anomaly-detection') {
                return (
                    <Panel title="Anomaly Detection" subtitle="Automatic baseline deviation alerts">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: 'rgba(255,68,102,0.08)',
                                    border: `1px solid ${THEME.danger}30`,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                }}
                            >
                                <div style={{ color: THEME.danger, fontWeight: 600, marginBottom: 4 }}>
                                    ⚠ High latency spike
                                </div>
                                <div style={{ fontSize: 11 }}>p99 latency 3.2x baseline at 14:32 UTC</div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: 'rgba(255,204,0,0.08)',
                                    border: `1px solid ${THEME.warning}30`,
                                    borderRadius: 6,
                                }}
                            >
                                <div style={{ color: THEME.warning, fontWeight: 600, marginBottom: 4 }}>
                                    🔔 Elevated write rate
                                </div>
                                <div style={{ fontSize: 11 }}>Write ops 45% above 7-day average</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'metrics-preview') {
                return (
                    <Panel title="Metrics Preview" subtitle="Real-time system metrics sample">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ fontSize: 10, color: THEME.textAlt, marginBottom: 6 }}>CPU Usage</div>
                                <RingGauge value={42} max={100} color={THEME.primary} label="42%" />
                            </div>
                            <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ fontSize: 10, color: THEME.textAlt, marginBottom: 6 }}>Memory</div>
                                <RingGauge value={67} max={100} color={THEME.warning} label="67%" />
                            </div>
                            <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ fontSize: 10, color: THEME.textAlt, marginBottom: 6 }}>Disk I/O</div>
                                <RingGauge value={34} max={100} color={THEME.success} label="34%" />
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'live-agent') {
                return (
                    <Panel title="Live Agent Status" subtitle="Real-time agent connection and health">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 12,
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: THEME.success,
                                        boxShadow: `0 0 8px ${THEME.success}`,
                                    }}
                                />
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600 }}>
                                        Agent ID: agent-prod-01
                                    </div>
                                    <div style={{ fontSize: 11, color: THEME.textAlt }}>Connected 8h 34m ago</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>Metrics collected: 1.2M</div>
                                <div>Latency: 24 ms</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ STORAGE ════════════════════════════════════════════════════════
        if (sectionKey === 'storage') {
            if (itemKey === 'index-advisor') {
                return (
                    <Panel title="Index Advisor" subtitle="Recommended indexes to improve query performance">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    db.orders.createIndex({'{customerId: 1, createdAt: -1}'})
                                </div>
                                <div style={{ fontSize: 10 }}>Impact: 45% faster filtering. Memory: 2.3 MB</div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    db.transactions.createIndex({'{amount: 1, userId: 1}'})
                                </div>
                                <div style={{ fontSize: 10 }}>Impact: 67% faster aggregation. Memory: 5.2 MB</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'schema-analyzer') {
                return (
                    <Panel title="Schema Analyzer" subtitle="Field frequency and type distribution">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {['_id', 'customerId', 'amount', 'status', 'createdAt'].map((field, i) => (
                                <div
                                    key={field}
                                    style={{
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{field}</span>
                                        <span>{Math.floor(100 - i * 5)}% present</span>
                                    </div>
                                    <MiniSparkline
                                        values={Array.from({ length: 12 }, () => Math.random() * 100)}
                                        height={16}
                                    />
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'collection-stats') {
                return (
                    <Panel title="Collection Statistics" subtitle="Size, document count, and index metrics">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.collections.map((c) => (
                                <div
                                    key={c.name}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 6 }}>
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: 8,
                                            fontSize: 10,
                                        }}
                                    >
                                        <span>{(c.docs / 1000000).toFixed(1)}M docs</span>
                                        <span>{c.size}</span>
                                        <span>{c.indexes} indexes</span>
                                        <span>avg: {c.avgDocSize} KB</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'wiredtiger-cache') {
                return (
                    <Panel title="WiredTiger Cache" subtitle="Storage engine memory and eviction metrics">
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: THEME.textMain, fontWeight: 600 }}>
                                        Cache Utilization
                                    </span>
                                    <span style={{ fontSize: 12, color: THEME.info }}>3.7 GB / 4.0 GB</span>
                                </div>
                                <RingGauge value={92.5} max={100} color={THEME.warning} label="92.5%" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={demoData.wiredTigerMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Line
                                    type="monotone"
                                    dataKey="evictions"
                                    stroke={THEME.danger}
                                    dot={false}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'backup-monitor') {
                return (
                    <Panel title="Backup Monitor" subtitle="Recent and scheduled backups">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.backups.map((b, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{b.time}</span>
                                        <StatusBadge
                                            status={b.status === 'completed' ? 'completed' : 'pending'}
                                            label={b.status}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: 8,
                                            fontSize: 10,
                                        }}
                                    >
                                        <span>
                                            {b.size} ({b.type})
                                        </span>
                                        <span>Duration: {b.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'capacity-planning') {
                return (
                    <Panel title="Capacity Planning" subtitle="Growth projections and headroom">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    marginBottom: 12,
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 6 }}>
                                    Current Storage
                                </div>
                                <RingGauge value={72} max={100} color={THEME.warning} label="72 GB / 100 GB" />
                            </div>
                            <div style={{ padding: '8px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Growth Rate
                                </div>
                                <div style={{ fontSize: 11 }}>{'≈'} 840 MB/day - Projected full in 34 days</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'network') {
                return (
                    <Panel title="Network Configuration" subtitle="Connection pooling and bandwidth">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Current Connections
                                    </div>
                                    <div style={{ fontSize: 13, color: THEME.primary, fontWeight: 600 }}>47 / 50</div>
                                </div>
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        Network Latency
                                    </div>
                                    <div style={{ fontSize: 13, color: THEME.success, fontWeight: 600 }}>8.2 ms</div>
                                </div>
                            </div>
                            <div style={{ padding: '8px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 2 }}>
                                    Throughput
                                </div>
                                <div style={{ fontSize: 11 }}>{'≈'} 240 MB/s (in) / 120 MB/s (out)</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ DATA ═══════════════════════════════════════════════════════════
        if (sectionKey === 'data') {
            if (itemKey === 'doc-editor') {
                return (
                    <Panel title="Document Editor" subtitle="Edit BSON documents inline">
                        <div
                            style={{
                                fontSize: 11,
                                fontFamily: THEME.fontMono,
                                color: THEME.textAlt,
                                background: THEME.glassBg,
                                padding: 12,
                                borderRadius: 6,
                                lineHeight: 1.4,
                            }}
                        >
                            <div style={{ color: THEME.info }}>
                                {'{'}Object ID: 507f1f77bcf86cd799439011{'},'}
                            </div>
                            <div style={{ color: THEME.textMain }}>name: "John Doe",</div>
                            <div style={{ color: THEME.textMain }}>email: "john@example.com",</div>
                            <div style={{ color: THEME.success }}>active: true,</div>
                            <div style={{ color: THEME.warning }}>createdAt: 2025-03-26T10:30:00Z</div>
                            <div>{'}'})</div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'agg-builder') {
                return (
                    <Panel title="Aggregation Builder" subtitle="Visual pipeline designer for $match, $group, $sort">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {['$match', '$sort', '$group', '$project'].map((stage, i) => (
                                <div
                                    key={stage}
                                    style={{
                                        padding: '8px 12px',
                                        background: THEME.glassBg,
                                        borderRadius: 6,
                                        marginBottom: 8,
                                        borderLeft: `2px solid ${THEME.primary}`,
                                    }}
                                >
                                    <div style={{ color: THEME.primary, fontWeight: 600 }}>{stage}</div>
                                    <div style={{ fontSize: 10, marginTop: 4, color: THEME.textAlt }}>
                                        Stage {i + 1} of 4
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'nl-query') {
                return (
                    <Panel title="NL Query Generator" subtitle="Convert English to MongoDB queries">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Input: "Find orders over $1000 by count"
                                </div>
                                <div style={{ fontSize: 11, fontFamily: THEME.fontMono, color: THEME.info }}>
                                    db.orders.find({'{amount: {$gt: 1000}}'})
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Confidence: 98%
                                </div>
                                <div style={{ fontSize: 11 }}>Natural language processing enabled</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'import-export') {
                return (
                    <Panel title="Import / Export" subtitle="Bulk operations for JSON, CSV, BSON">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Recent Export
                                </div>
                                <div style={{ fontSize: 11 }}>orders.json - 28.4 MB - 3 min ago</div>
                            </div>
                            <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Scheduled Import
                                </div>
                                <div style={{ fontSize: 11 }}>customers.csv - 2.1 MB - Pending 145K rows</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'sql-translator') {
                return (
                    <Panel title="SQL Translator" subtitle="Convert SQL queries to MongoDB aggregation">
                        <div
                            style={{
                                fontSize: 11,
                                fontFamily: THEME.fontMono,
                                color: THEME.textAlt,
                                background: THEME.glassBg,
                                padding: 12,
                                borderRadius: 6,
                                lineHeight: 1.5,
                            }}
                        >
                            <div style={{ color: THEME.warning, marginBottom: 10 }}>
                                SELECT name, COUNT(*) FROM orders
                            </div>
                            <div style={{ color: THEME.warning, marginBottom: 10 }}>
                                WHERE status = 'paid' GROUP BY name
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: THEME.textAlt,
                                    borderTop: `1px solid ${THEME.glassBorder}`,
                                    paddingTop: 10,
                                    marginTop: 10,
                                }}
                            >
                                <div style={{ color: THEME.success }}>db.orders.aggregate([</div>
                                <div>{'  {$match: {status: "paid"}},'}</div>
                                <div>{'  {$group: {_id: "$name", count: {$sum: 1}}},'}</div>
                                <div style={{ color: THEME.success }}>])</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'schema-compare') {
                return (
                    <Panel title="Schema Compare" subtitle="Compare schemas across collections or clusters">
                        <div style={{ fontSize: 11, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 6 }}>
                                        Cluster A
                                    </div>
                                    <div style={{ fontSize: 10 }}>orders: 12 fields</div>
                                    <div style={{ fontSize: 10 }}>customers: 8 fields</div>
                                </div>
                                <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 6 }}>
                                        Cluster B
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.warning }}>orders: 15 fields (+3)</div>
                                    <div style={{ fontSize: 10, color: THEME.success }}>customers: 8 fields</div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    background: 'rgba(255,204,0,0.08)',
                                    borderRadius: 6,
                                    border: `1px solid ${THEME.warning}30`,
                                }}
                            >
                                <div style={{ fontSize: 10, color: THEME.warning }}>
                                    Schema drift detected: 3 fields differ
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'geospatial') {
                return (
                    <Panel title="Geo-spatial Queries" subtitle="Location-based data and 2dsphere indexes">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                    paddingBottom: 10,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Active Geo-indexes
                                </div>
                                <div style={{ fontSize: 11 }}>2dsphere: stores (4.2M docs)</div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.info, fontWeight: 600, marginBottom: 4 }}>
                                    Recent Geo-query
                                </div>
                                <div style={{ fontSize: 11 }}>
                                    Find within 5km of {'{'}lat: 37.774, lng: -122.419{'}'} - 1,234 matches
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ INTELLIGENCE ═══════════════════════════════════════════════════
        if (sectionKey === 'intelligence') {
            if (itemKey === 'ai-hints') {
                return (
                    <Panel title="AI Hints" subtitle="Machine learning performance recommendations">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: 'rgba(0,255,170,0.08)',
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.success}`,
                                    marginBottom: 10,
                                }}
                            >
                                <div style={{ color: THEME.success, fontWeight: 600, marginBottom: 4 }}>
                                    💡 Add compound index
                                </div>
                                <div style={{ fontSize: 11 }}>
                                    ({'{customerId, createdAt}'}) would improve query #5 by 48%
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: 'rgba(79,172,254,0.08)',
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.info, fontWeight: 600, marginBottom: 4 }}>
                                    💡 Increase cache
                                </div>
                                <div style={{ fontSize: 11 }}>
                                    Expanding WiredTiger cache by 1GB reduces evictions 32%
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'compare-clusters') {
                return (
                    <Panel title="Compare Clusters" subtitle="Side-by-side cluster metrics and health">
                        <div style={{ fontSize: 11, color: THEME.textAlt, lineHeight: 1.7 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 8 }}>
                                        Prod (us-east)
                                    </div>
                                    <div style={{ fontSize: 10 }}>Ops/sec: 7,189</div>
                                    <div style={{ fontSize: 10 }}>Avg Latency: 12.4ms</div>
                                    <div style={{ fontSize: 10 }}>Replication Lag: 2.3ms</div>
                                </div>
                                <div style={{ padding: '10px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 8 }}>
                                        Staging (us-west)
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.warning }}>Ops/sec: 2,043 ({'-72%'})</div>
                                    <div style={{ fontSize: 10 }}>Avg Latency: 18.9ms</div>
                                    <div style={{ fontSize: 10 }}>Replication Lag: 5.1ms</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'historical-trends') {
                return (
                    <Panel title="Historical Trends" subtitle="Performance and growth metrics over 30 days">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart
                                data={demoData.base30d.map((d) => ({
                                    ...d,
                                    ops: Math.floor(6800 + Math.sin(d.index / 10) * 1200 + Math.random() * 400),
                                }))}
                            >
                                <defs>
                                    <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Area
                                    type="monotone"
                                    dataKey="ops"
                                    stroke={THEME.primary}
                                    fill="url(#gradient-trend)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
            if (itemKey === 'perf-advisor-v2') {
                return (
                    <Panel title="Perf Advisor v2" subtitle="Next-generation performance analysis with ML">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                    paddingBottom: 10,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    Score: 78/100
                                </div>
                                <RingGauge value={78} max={100} color={THEME.warning} label="Good" />
                            </div>
                            <div style={{ padding: '8px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 2 }}>Top Issue</div>
                                <div style={{ fontSize: 11 }}>3 missing indexes impact 24% of queries</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'trace-correlator') {
                return (
                    <Panel title="Trace Correlator" subtitle="Correlate slow queries with system metrics">
                        <div style={{ fontSize: 11, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                    borderLeft: `2px solid ${THEME.warning}`,
                                }}
                            >
                                <div style={{ color: THEME.warning, fontWeight: 600, marginBottom: 4 }}>
                                    Query spike at 14:32 UTC
                                </div>
                                <div style={{ fontSize: 10 }}>Correlated with 78% CPU spike - cache eviction event</div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glassBg,
                                    borderRadius: 6,
                                    borderLeft: `2px solid ${THEME.info}`,
                                }}
                            >
                                <div style={{ color: THEME.info, fontWeight: 600, marginBottom: 4 }}>
                                    Root cause identified
                                </div>
                                <div style={{ fontSize: 10 }}>Missing index on (userId, timestamp)</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ REPLICATION ════════════════════════════════════════════════════
        if (sectionKey === 'replication') {
            if (itemKey === 'replica-set') {
                return (
                    <Panel title="Replica Set + Failover" subtitle="rs0: Primary + 2 Secondaries + Arbiter">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.replicas.map((r, i) => (
                                <div
                                    key={r.id}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom:
                                            i === demoData.replicas.length - 1
                                                ? 'none'
                                                : `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: r.health > 0.95 ? THEME.success : THEME.warning,
                                            }}
                                        />
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{r.id}</span>
                                        <span style={{ color: THEME.info, fontSize: 10 }}>{r.role}</span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: 8,
                                        }}
                                    >
                                        <span>State: {r.state}</span>
                                        <span>Lag: {r.syncLag}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'sharding') {
                return (
                    <Panel title="Sharding Configuration" subtitle="Distributed data across shards with balancing">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {demoData.shards.map((s, i) => (
                                <div
                                    key={s.id}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom:
                                            i === demoData.shards.length - 1
                                                ? 'none'
                                                : `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{s.id}</span>
                                        <StatusBadge
                                            status={s.status === 'active' ? 'active' : 'inactive'}
                                            label={s.status}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: 8,
                                        }}
                                    >
                                        <span>{(s.docs / 1000000).toFixed(2)}M docs</span>
                                        <span>
                                            {s.size} ({s.chunks} chunks)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'oplog-tail') {
                return (
                    <Panel title="Oplog Tail" subtitle="Real-time operation stream from primary">
                        <div style={{ fontSize: 11, color: THEME.textAlt, lineHeight: 1.7 }}>
                            {[
                                { op: 'insert', coll: 'orders', docs: 142, ts: '14:32:45' },
                                { op: 'update', coll: 'customers', docs: 89, ts: '14:32:51' },
                                { op: 'delete', coll: 'logs', docs: 2100, ts: '14:32:58' },
                            ].map((entry, i) => (
                                <div
                                    key={i}
                                    style={{ padding: '8px 0', borderBottom: `1px solid ${THEME.glassBorder}` }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                            {entry.op.toUpperCase()}
                                        </span>
                                        <span style={{ color: THEME.textAlt, fontSize: 10 }}>{entry.ts}</span>
                                    </div>
                                    <div style={{ fontSize: 10 }}>
                                        db.{entry.coll} - {entry.docs} documents
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
        }

        // ═══ MANAGEMENT ═════════════════════════════════════════════════════
        if (sectionKey === 'management') {
            if (itemKey === 'alert-manager') {
                return (
                    <Panel title="Alert Manager" subtitle="Alert rules, thresholds, and notifications">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            {demoData.alerts.map((alert, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '10px 12px',
                                        background: THEME.glassBg,
                                        borderRadius: 6,
                                        marginBottom: 10,
                                        borderLeft: `2px solid ${alert.severity === 'critical' ? THEME.danger : alert.severity === 'warning' ? THEME.warning : THEME.info}`,
                                    }}
                                >
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                        {alert.message}
                                    </div>
                                    <div style={{ fontSize: 11, color: THEME.textAlt }}>
                                        Severity: {alert.severity} - {alert.count} active
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'prometheus-export') {
                return (
                    <Panel title="Prometheus Export" subtitle="Metrics endpoint and scrape configuration">
                        <div
                            style={{
                                fontSize: 11,
                                fontFamily: THEME.fontMono,
                                color: THEME.textAlt,
                                background: THEME.glassBg,
                                padding: 12,
                                borderRadius: 6,
                                lineHeight: 1.5,
                            }}
                        >
                            <div style={{ color: THEME.info }}>
                                mongodb_up {'{'}instance="primary"{'}'} 1
                            </div>
                            <div style={{ color: THEME.success }}>mongodb_connections_current 47</div>
                            <div style={{ color: THEME.warning }}>
                                mongodb_locks_current {'{'}mode="w"{'}'} 2
                            </div>
                            <div style={{ color: THEME.primary }}>mongodb_memory_resident_megabytes 4700</div>
                            <div style={{ marginTop: 8, fontSize: 10, color: THEME.textAlt }}>
                                Scrape interval: 30s | Timeout: 10s
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'sso-auth') {
                return (
                    <Panel title="SSO / Authentication" subtitle="OAuth 2.0, LDAP, and X.509 certificate auth">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                    paddingBottom: 10,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>OAuth 2.0</div>
                                <div style={{ fontSize: 11 }}>Google, GitHub enabled | 238 users</div>
                            </div>
                            <div
                                style={{
                                    marginBottom: 10,
                                    paddingBottom: 10,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>
                                    X.509 Certificates
                                </div>
                                <div style={{ fontSize: 11 }}>12 certificates | 2 expiring within 30 days</div>
                            </div>
                            <div>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 4 }}>LDAP</div>
                                <div style={{ fontSize: 11 }}>Connected to enterprise.local | Sync interval: 1h</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'atlas-bridge') {
                return (
                    <Panel title="Atlas API Bridge" subtitle="MongoDB Atlas integration and sync">
                        <div style={{ fontSize: 12, color: THEME.textAlt, lineHeight: 1.8 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 12,
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: THEME.success,
                                        boxShadow: `0 0 8px ${THEME.success}`,
                                    }}
                                />
                                <div>
                                    <div style={{ color: THEME.textMain, fontWeight: 600 }}>Atlas Sync Active</div>
                                    <div style={{ fontSize: 11, color: THEME.textAlt }}>Last sync: 2 minutes ago</div>
                                </div>
                            </div>
                            <div style={{ padding: '8px 12px', background: THEME.glassBg, borderRadius: 6 }}>
                                <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 2 }}>
                                    Organization ID
                                </div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 11 }}>507f1f77bcf86cd799439011</div>
                            </div>
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'dashboards') {
                return (
                    <Panel title="Custom Dashboards" subtitle="User-created and saved dashboard layouts">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {[
                                { name: 'Executive Summary', views: 1240, modified: '2h ago' },
                                { name: 'Performance Metrics', views: 3890, modified: 'now' },
                                { name: 'Backup Status', views: 240, modified: '1d ago' },
                            ].map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: i === 2 ? 'none' : `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{d.name}</span>
                                        <span style={{ fontSize: 10, color: THEME.textAlt }}>({d.views} views)</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textAlt }}>Modified: {d.modified}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'reports') {
                return (
                    <Panel title="Scheduled Reports" subtitle="Automated reporting and distribution">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {[
                                { title: 'Weekly Performance', recipients: 3, next: '2025-03-31', format: 'PDF' },
                                { title: 'Monthly Capacity', recipients: 5, next: '2025-04-01', format: 'Excel' },
                                { title: 'Daily Security', recipients: 2, next: '2025-03-27', format: 'HTML' },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom: i === 2 ? 'none' : `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 6 }}>
                                        {r.title}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: 8,
                                            fontSize: 10,
                                        }}
                                    >
                                        <span>{r.recipients} recipients</span>
                                        <span>{r.format}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'audit-log') {
                return (
                    <Panel title="Audit Log" subtitle="Compliance and security event tracking">
                        <div style={{ fontSize: 11, color: THEME.textAlt, lineHeight: 1.7 }}>
                            {[
                                {
                                    action: 'User logged in',
                                    user: 'admin@company.com',
                                    ts: '14:32:15',
                                    status: 'success',
                                },
                                { action: 'Index created', user: 'schema-bot', ts: '14:28:42', status: 'success' },
                                {
                                    action: 'Auth policy updated',
                                    user: 'security@company.com',
                                    ts: '14:15:03',
                                    status: 'success',
                                },
                            ].map((entry, i) => (
                                <div
                                    key={i}
                                    style={{ padding: '8px 0', borderBottom: `1px solid ${THEME.glassBorder}` }}
                                >
                                    <div style={{ color: THEME.textMain, fontWeight: 600, marginBottom: 2 }}>
                                        {entry.action}
                                    </div>
                                    <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{entry.user}</span>
                                        <span style={{ color: THEME.textAlt }}>{entry.ts}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
            if (itemKey === 'users') {
                return (
                    <Panel title="User Management" subtitle="Role-based access control and permissions">
                        <div style={{ fontSize: 11, color: THEME.textAlt }}>
                            {[
                                { email: 'admin@company.com', role: 'Owner', created: '2024-01-15', status: 'active' },
                                { email: 'dba@company.com', role: 'DBA', created: '2024-02-20', status: 'active' },
                                {
                                    email: 'analyst@company.com',
                                    role: 'Analyst',
                                    created: '2025-01-10',
                                    status: 'active',
                                },
                            ].map((u, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: 10,
                                        paddingBottom: 10,
                                        borderBottom: i === 2 ? 'none' : `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMain, fontWeight: 600 }}>{u.email}</span>
                                        <span style={{ fontSize: 10, color: THEME.info }}>{u.role}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textAlt }}>Created: {u.created}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
        }

        // Fallback
        return (
            <Panel title="Item" subtitle={itemKey}>
                Content loading...
            </Panel>
        );
    };

    return (
        <DemoLayout
            sections={sections}
            renderContent={renderContent}
            title="MongoDB Demo"
            titleIcon={Database}
            accentColor={THEME.primary}
        />
    );
}

export default DemoMongoDBTab;
