import React, { useMemo } from 'react';
import {
    Database,
    Activity,
    HardDrive,
    Code,
    Zap,
    Copy,
    Settings,
    AlertCircle,
    TrendingUp,
    BarChart3,
    Clock,
    Layers,
    Lock,
    Brain,
    RefreshCw,
    Eye,
    GitBranch,
    Shield,
    Users,
    Download,
    Upload,
    Map,
    CheckCircle2,
    AlertTriangle,
    Cpu,
    Network,
    Gauge,
    Filter,
    Inbox,
    FileText,
    Key,
    ZapIcon,
} from 'lucide-react';
import DemoLayout, {
    Panel,
    StatusBadge,
    RingGauge,
    MiniSparkline,
    HeroMetric,
    ChartTip,
    generateChartData,
} from './DemoLayout.jsx';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
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

function DemoMongoDBTab({ tabId }) {
    const theme = useAdaptiveTheme();

    const demoData = useMemo(() => {
        const baseData = generateChartData(24);

        return {
            executiveDashboard: {
                statusBadges: [
                    { label: 'Status', value: 'Operational', color: THEME.success },
                    { label: 'Topology', value: 'Replica Set', color: THEME.primary },
                    { label: 'Version', value: 'MongoDB 7.0', color: THEME.secondary },
                ],
                metrics: [
                    { label: 'Uptime', value: '89d', unit: '23h 45m', icon: Activity },
                    { label: 'Current Ops', value: '156', unit: 'operations', icon: Zap },
                    { label: 'Connections', value: '248/500', unit: '49.6%', icon: Network },
                    { label: 'Storage', value: '312GB', unit: 'data size', icon: HardDrive },
                    { label: 'Documents', value: '45.2M', unit: 'total', icon: Database },
                    { label: 'Avg Latency', value: '2.1ms', unit: 'p50', icon: Clock },
                ],
                opsChart: baseData.map((d) => ({
                    ...d,
                    insert: Math.floor(Math.random() * 800) + 200,
                    query: Math.floor(Math.random() * 2000) + 800,
                    update: Math.floor(Math.random() * 600) + 150,
                    delete: Math.floor(Math.random() * 200) + 50,
                })),
                clusterHealth: [
                    { label: 'Replication', value: 98 },
                    { label: 'Storage', value: 85 },
                    { label: 'Memory', value: 72 },
                ],
            },
            connectionStatus: {
                current: 248,
                available: 252,
                total: 500,
                trend: baseData.map((d) => ({
                    ...d,
                    connections: Math.floor(Math.random() * 150) + 100,
                })),
            },
            serverInfo: {
                version: 'MongoDB 7.0.3',
                storageEngine: 'WiredTiger',
                host: 'mongodb-prod-01.internal:27017',
                uptime: '89d 23h 45m',
            },
            databases: [
                { name: 'admin', size: '2.1 MB', collections: 8, indexes: 12 },
                { name: 'config', size: '5.4 MB', collections: 11, indexes: 18 },
                { name: 'users', size: '156 MB', collections: 14, indexes: 28 },
                { name: 'products', size: '4.2 GB', collections: 23, indexes: 45 },
                { name: 'analytics', size: '18.7 GB', collections: 127, indexes: 312 },
            ],
            collectionRelationships: [
                { from: 'users', to: 'orders', type: 'one-to-many', count: 1245 },
                { from: 'products', to: 'reviews', type: 'one-to-many', count: 8934 },
                { from: 'orders', to: 'shipments', type: 'one-to-one', count: 2187 },
            ],
            serverStatus: {
                globalLock: { pct: 18.5, active: 24 },
                memory: { resident: 2048, virtual: 4096 },
                networkIO: { bytesIn: 2.4, bytesOut: 1.8 },
            },
            realtimeOps: baseData.map((d) => ({
                ...d,
                insert: Math.floor(Math.random() * 400) + 100,
                query: Math.floor(Math.random() * 1200) + 400,
                update: Math.floor(Math.random() * 300) + 75,
                delete: Math.floor(Math.random() * 100) + 25,
            })),
            latencyPercentiles: baseData.map((d) => ({
                ...d,
                p50: Math.floor(Math.random() * 3) + 1,
                p95: Math.floor(Math.random() * 15) + 5,
                p99: Math.floor(Math.random() * 50) + 15,
            })),
            namespaceInsights: [
                { ns: 'users.profiles', inserts: 234, queries: 8934, updates: 456, deletes: 12 },
                { ns: 'products.catalog', inserts: 18, queries: 45623, updates: 234, deletes: 8 },
                { ns: 'orders.transactions', inserts: 567, queries: 23456, updates: 1234, deletes: 89 },
            ],
            explainPlans: [
                { query: 'db.users.find({status: "active"})', stages: 'COLLSCAN', millis: 2.4, docs: 1248 },
                { query: 'db.products.find({category: "electronics"})', stages: 'IXSCAN', millis: 0.3, docs: 456 },
            ],
            activeOperations: [
                { opid: 12345, ns: 'products.catalog', op: 'query', millis: 234, client: '192.168.1.105' },
                { opid: 12346, ns: 'users.profiles', op: 'update', millis: 45, client: '192.168.1.106' },
            ],
            slowQueries: [
                { ns: 'analytics.events', millis: 5234, query: 'timestamp: {$gte: ...}', plan: 'COLLSCAN' },
                { ns: 'products.catalog', millis: 1204, query: 'tags: {$in: [...]}', plan: 'IXSCAN' },
            ],
            lockAnalysis: baseData.map((d) => ({
                ...d,
                global: Math.floor(Math.random() * 50) + 10,
                database: Math.floor(Math.random() * 40) + 5,
                collection: Math.floor(Math.random() * 30) + 2,
            })),
            metricsSparklines: [
                { name: 'Ops/sec', value: 1245, trend: [12, 18, 15, 22, 19, 25, 28] },
                { name: 'Avg Latency', value: '2.1ms', trend: [2.1, 2.3, 2.0, 2.8, 2.5, 2.2, 2.4] },
                { name: 'Cache Hit', value: '94.2%', trend: [92, 93, 94, 93, 95, 94, 94] },
            ],
            indexAdvisor: [
                { coll: 'users.profiles', rec: 'Create: {email: 1, status: 1}', impact: '+23%', unused: false },
                { coll: 'products.catalog', rec: 'Remove: {deprecated: 1}', impact: '-2.1GB', unused: true },
            ],
            schemaAnalyzer: [
                { coll: 'users.profiles', avgSize: 2.4, fields: 34, nested: 8, arrays: 6 },
                { coll: 'products.catalog', avgSize: 4.1, fields: 52, nested: 14, arrays: 12 },
            ],
            collectionStats: [
                { name: 'users.profiles', size: '128 MB', docs: 42000, indexes: 8, avgDocSize: 3.2 },
                { name: 'products.catalog', size: '2.1 GB', docs: 524000, indexes: 12, avgDocSize: 4.1 },
                { name: 'orders.transactions', size: '856 MB', docs: 125000, indexes: 6, avgDocSize: 7.0 },
            ],
            wiredTigerCache: {
                usage: 68,
                evictionRate: baseData.map((d) => ({
                    ...d,
                    evictions: Math.floor(Math.random() * 100) + 20,
                })),
            },
            backupMonitor: [
                { name: 'Full Backup 2026-03-26', status: 'completed', size: '284 GB', duration: '4h 23m' },
                { name: 'Incremental 2026-03-25', status: 'completed', size: '12.4 GB', duration: '18m' },
            ],
            capacityPlanning: baseData.map((d) => ({
                ...d,
                projected: Math.floor(Math.random() * 400) + 250,
                current: Math.floor(Math.random() * 300) + 200,
            })),
            networkIO: baseData.map((d) => ({
                ...d,
                bytesIn: Math.floor(Math.random() * 50) + 15,
                bytesOut: Math.floor(Math.random() * 40) + 10,
            })),
            aggregationExample: [
                { stage: '$match', filter: '{status: "active"}', output: 42000 },
                { stage: '$group', group: '{_id: "$category", total: {$sum: "$amount"}}', output: 12 },
                { stage: '$sort', sort: '{total: -1}', output: 12 },
            ],
            importExportJobs: [
                { name: 'users_export_2026-03-26', type: 'export', status: 'completed', docs: 42000, duration: '12m' },
                { name: 'products_import_backup', type: 'import', status: 'in-progress', docs: 524000, progress: 67 },
            ],
            sqlTranslations: [
                { sql: 'SELECT * FROM users WHERE status = "active"', mql: 'db.users.find({status: "active"})' },
                {
                    sql: 'SELECT cat, COUNT(*) FROM products GROUP BY cat',
                    mql: 'db.products.aggregate([{$group: {...}}])',
                },
            ],
            historicalTrends: baseData.map((d) => ({
                ...d,
                ops: Math.floor(Math.random() * 500) + 800,
                latency: Math.floor(Math.random() * 10) + 1,
                connections: Math.floor(Math.random() * 200) + 150,
            })),
            perfAdvisor: [
                { priority: 'high', issue: 'Missing index on users.profiles.email', impact: '+34%' },
                { priority: 'medium', issue: 'High cache eviction rate', impact: '+12%' },
                { priority: 'low', issue: 'Consider data compression', impact: '+8%' },
            ],
            replicaSetMembers: [
                { member: 'mongodb-0', state: 'PRIMARY', sync: 'N/A', priority: 1, ping: 0, lag: '0ms' },
                { member: 'mongodb-1', state: 'SECONDARY', sync: 'mongodb-0', priority: 0.5, ping: 2, lag: '2ms' },
                { member: 'mongodb-2', state: 'SECONDARY', sync: 'mongodb-0', priority: 0.5, ping: 3, lag: '3ms' },
            ],
            failoverMonitor: [
                { election: '#45', date: '2026-03-15 14:23:45', winner: 'mongodb-0', duration: '18s' },
                { election: '#44', date: '2026-03-01 09:15:20', winner: 'mongodb-0', duration: '24s' },
            ],
            shardingOverview: {
                numShards: 3,
                chunks: 256,
                balancer: 'running',
                distribution: [85, 86, 85],
            },
            oplogTail: [
                { ts: '2026-03-26 10:45:23.456', op: 'insert', ns: 'users.profiles' },
                { ts: '2026-03-26 10:45:22.123', op: 'update', ns: 'products.catalog' },
            ],
            alertManager: [
                { name: 'High Memory Usage', severity: 'warning', status: 'active' },
                { name: 'Slow Queries Detected', severity: 'info', status: 'active' },
                { name: 'Replication Lag Exceeded', severity: 'critical', status: 'resolved' },
            ],
            prometheusExport: {
                endpoint: 'mongodb-exporter:9216/metrics',
                status: 'healthy',
                lastScrape: '2026-03-26 10:46:12',
                metrics: 847,
            },
            auditLog: [
                { timestamp: '2026-03-26 10:45:30', user: 'admin@mongodb', action: 'auth' },
                { timestamp: '2026-03-26 10:42:15', user: 'app_user@products', action: 'insert' },
            ],
            users: [
                { username: 'admin', roles: 'root, backup', authMech: 'SCRAM-SHA-256', lastLogin: '2026-03-26 10:45' },
                {
                    username: 'app_user',
                    roles: 'readWrite@products',
                    authMech: 'SCRAM-SHA-256',
                    lastLogin: '2026-03-26 10:30',
                },
            ],
        };
    }, []);

    const sections = [
        {
            key: 'OVERVIEW',
            label: 'Overview',
            icon: Activity,
            accent: THEME.primary,
            items: [
                { key: 'executive', label: 'Executive Dashboard' },
                { key: 'connstatus', label: 'Connection Status' },
                { key: 'serverinfo', label: 'Server Info' },
                { key: 'databases', label: 'Databases' },
                { key: 'relationships', label: 'Collection Relationships' },
            ],
        },
        {
            key: 'PERFORMANCE',
            label: 'Performance',
            icon: Zap,
            accent: THEME.warning,
            items: [
                { key: 'server-status', label: 'Server Status' },
                { key: 'realtime-ops', label: 'Real-time Ops' },
                { key: 'latency-pct', label: 'Latency Percentiles' },
                { key: 'namespace', label: 'Namespace Insights' },
                { key: 'explain', label: 'Explain Plans' },
                { key: 'active-ops', label: 'Active Operations' },
                { key: 'slow-queries', label: 'Slow Queries' },
                { key: 'query-profile', label: 'Query Profiler' },
                { key: 'query-cost', label: 'Query Cost Estimator' },
                { key: 'lock-analysis', label: 'Lock Analysis' },
                { key: 'anomaly', label: 'Anomaly Detection' },
                { key: 'metrics-preview', label: 'Metrics Preview' },
                { key: 'live-agent', label: 'Live Agent' },
            ],
        },
        {
            key: 'STORAGE',
            label: 'Storage',
            icon: HardDrive,
            accent: THEME.secondary,
            items: [
                { key: 'index-advisor', label: 'Index Advisor' },
                { key: 'schema-analyzer', label: 'Schema Analyzer' },
                { key: 'coll-stats', label: 'Collection Stats' },
                { key: 'wiredtiger', label: 'WiredTiger Cache' },
                { key: 'backup', label: 'Backup Monitor' },
                { key: 'capacity', label: 'Capacity Planning' },
                { key: 'netio', label: 'Network I/O' },
            ],
        },
        {
            key: 'DATA',
            label: 'Data',
            icon: Database,
            accent: THEME.ai,
            items: [
                { key: 'doc-editor', label: 'Document Editor' },
                { key: 'agg-builder', label: 'Aggregation Builder' },
                { key: 'nl-query', label: 'NL Query Generator' },
                { key: 'import-export', label: 'Import/Export' },
                { key: 'sql-trans', label: 'SQL Translator' },
                { key: 'schema-compare', label: 'Schema Compare' },
                { key: 'geospatial', label: 'Geo-spatial' },
            ],
        },
        {
            key: 'INTELLIGENCE',
            label: 'Intelligence',
            icon: Brain,
            accent: THEME.success,
            items: [
                { key: 'ai-hints', label: 'AI Hints' },
                { key: 'compare-clusters', label: 'Compare Clusters' },
                { key: 'hist-trends', label: 'Historical Trends' },
                { key: 'perf-advisor', label: 'Perf Advisor v2' },
                { key: 'trace-corr', label: 'Trace Correlator' },
            ],
        },
        {
            key: 'REPLICATION',
            label: 'Replication',
            icon: RefreshCw,
            accent: THEME.primary,
            items: [
                { key: 'replica-status', label: 'Replica Set Status' },
                { key: 'failover', label: 'Failover Monitor' },
                { key: 'sharding', label: 'Sharding Overview' },
                { key: 'oplog', label: 'Oplog Tail' },
            ],
        },
        {
            key: 'MANAGEMENT',
            label: 'Management',
            icon: Settings,
            accent: THEME.danger,
            items: [
                { key: 'alerts', label: 'Alert Manager' },
                { key: 'prometheus', label: 'Prometheus Export' },
                { key: 'sso', label: 'SSO/Auth' },
                { key: 'atlas-api', label: 'Atlas API Bridge' },
                { key: 'dashboards', label: 'Dashboards' },
                { key: 'reports', label: 'Reports' },
                { key: 'audit', label: 'Audit Log' },
                { key: 'user-mgmt', label: 'Users' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        if (sectionKey === 'OVERVIEW') {
            if (itemKey === 'executive') {
                return (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {demoData.executiveDashboard.statusBadges.map((b, i) => (
                                <StatusBadge key={i} label={b.label} value={b.value} color={b.color} />
                            ))}
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {demoData.executiveDashboard.metrics.map((m, i) => (
                                <HeroMetric
                                    key={i}
                                    label={m.label}
                                    value={m.value}
                                    unit={m.unit}
                                    icon={m.icon}
                                    color={THEME.primary}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                            <Panel title="Operations/sec" icon={Activity}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={demoData.executiveDashboard.opsChart}>
                                        <defs>
                                            <linearGradient id="ops" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="insert"
                                            stackId="1"
                                            stroke={THEME.primary}
                                            fill="url(#ops)"
                                        />
                                        <Area type="monotone" dataKey="query" stackId="1" stroke={THEME.secondary} />
                                        <Area type="monotone" dataKey="update" stackId="1" stroke={THEME.success} />
                                        <Area type="monotone" dataKey="delete" stackId="1" stroke={THEME.danger} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {demoData.executiveDashboard.clusterHealth.map((h, i) => (
                                    <Panel key={i} title={h.label} icon={Gauge} compact>
                                        <RingGauge
                                            value={h.value}
                                            color={
                                                h.value > 90
                                                    ? THEME.success
                                                    : h.value > 70
                                                      ? THEME.warning
                                                      : THEME.danger
                                            }
                                        />
                                    </Panel>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <Panel title="Replica Set" icon={GitBranch}>
                                <div
                                    style={{ fontSize: '0.85rem', color: THEME.textMuted, gap: '8px', display: 'grid' }}
                                >
                                    {[
                                        { m: 'PRIMARY', l: '0ms' },
                                        { m: 'SECONDARY', l: '2ms' },
                                        { m: 'SECONDARY', l: '3ms' },
                                    ].map((x, i) => (
                                        <div
                                            key={i}
                                            style={{ padding: '6px', background: THEME.glass, borderRadius: '4px' }}
                                        >
                                            <div style={{ color: THEME.textMain, fontWeight: 500, fontSize: '0.8rem' }}>
                                                {x.m}
                                            </div>
                                            <div style={{ fontSize: '0.75rem' }}>{x.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <Panel title="WiredTiger Cache" icon={Cpu}>
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={68} color={THEME.secondary} />
                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: THEME.textMuted }}>
                                        68% • 1,234 evictions
                                    </div>
                                </div>
                            </Panel>
                            <Panel title="Oplog Window" icon={Clock}>
                                <div style={{ fontSize: '0.9rem', color: THEME.textMain }}>
                                    <div>Size: 5.2 GB</div>
                                    <div style={{ color: THEME.textMuted, marginTop: '4px', fontSize: '0.85rem' }}>
                                        Retention: 14.3d
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                );
            } else if (itemKey === 'connstatus') {
                return (
                    <Panel title="Connection Status" icon={Network}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                marginBottom: '20px',
                            }}
                        >
                            <HeroMetric
                                label="Current"
                                value={String(demoData.connectionStatus.current)}
                                color={THEME.primary}
                            />
                            <HeroMetric
                                label="Available"
                                value={String(demoData.connectionStatus.available)}
                                color={THEME.success}
                            />
                            <HeroMetric
                                label="Total"
                                value={String(demoData.connectionStatus.total)}
                                color={THEME.secondary}
                            />
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={demoData.connectionStatus.trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="connections" stroke={THEME.primary} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'serverinfo') {
                return (
                    <Panel title="Server Info" icon={Database}>
                        <div style={{ display: 'grid', gap: '8px', fontFamily: THEME.fontMono, fontSize: '0.85rem' }}>
                            {[
                                { k: 'version', v: demoData.serverInfo.version },
                                { k: 'storage engine', v: demoData.serverInfo.storageEngine },
                                { k: 'host', v: demoData.serverInfo.host },
                                { k: 'uptime', v: demoData.serverInfo.uptime },
                            ].map((x, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '140px 1fr',
                                        gap: '16px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                    }}
                                >
                                    <div style={{ color: THEME.primary, fontWeight: 500, fontSize: '0.8rem' }}>
                                        {x.k}
                                    </div>
                                    <div style={{ color: THEME.textMain, wordBreak: 'break-all' }}>{x.v}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'databases') {
                return (
                    <Panel title="Databases" icon={Database}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Database
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Size
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Collections
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Indexes
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.databases.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{d.name}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{d.size}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{d.collections}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{d.indexes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'relationships') {
                return (
                    <Panel title="Collection Relationships" icon={Layers}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.collectionRelationships.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <div style={{ color: THEME.primary, fontWeight: 500 }}>{r.from}</div>
                                    <div style={{ color: THEME.textMuted }}>→</div>
                                    <div style={{ color: THEME.secondary, fontWeight: 500 }}>{r.to}</div>
                                    <div style={{ marginLeft: 'auto', color: THEME.warning, fontSize: '0.8rem' }}>
                                        {r.type}
                                    </div>
                                    <div style={{ color: THEME.textDim }}>({r.count})</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'PERFORMANCE') {
            if (itemKey === 'server-status') {
                return (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Panel title="Global Lock" icon={Lock}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <HeroMetric
                                    label="Lock Time"
                                    value={demoData.serverStatus.globalLock.pct + '%'}
                                    color={THEME.warning}
                                />
                                <HeroMetric
                                    label="Active"
                                    value={String(demoData.serverStatus.globalLock.active)}
                                    color={THEME.primary}
                                />
                            </div>
                        </Panel>
                        <Panel title="Memory (MB)" icon={Cpu}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <HeroMetric
                                    label="Resident"
                                    value={String(demoData.serverStatus.memory.resident)}
                                    color={THEME.primary}
                                />
                                <HeroMetric
                                    label="Virtual"
                                    value={String(demoData.serverStatus.memory.virtual)}
                                    color={THEME.secondary}
                                />
                            </div>
                        </Panel>
                        <Panel title="Network I/O (MB/s)" icon={Network}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <HeroMetric
                                    label="In"
                                    value={String(demoData.serverStatus.networkIO.bytesIn)}
                                    color={THEME.primary}
                                />
                                <HeroMetric
                                    label="Out"
                                    value={String(demoData.serverStatus.networkIO.bytesOut)}
                                    color={THEME.secondary}
                                />
                            </div>
                        </Panel>
                    </div>
                );
            } else if (itemKey === 'realtime-ops') {
                return (
                    <Panel title="Real-time Operations/sec" icon={Activity}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={demoData.realtimeOps}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="insert" fill={THEME.primary} />
                                <Bar dataKey="query" fill={THEME.secondary} />
                                <Bar dataKey="update" fill={THEME.success} />
                                <Bar dataKey="delete" fill={THEME.danger} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'latency-pct') {
                return (
                    <Panel title="Latency Percentiles (ms)" icon={Clock}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoData.latencyPercentiles}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="p50" stroke={THEME.success} dot={false} />
                                <Line type="monotone" dataKey="p95" stroke={THEME.warning} dot={false} />
                                <Line type="monotone" dataKey="p99" stroke={THEME.danger} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'namespace') {
                return (
                    <Panel title="Namespace Statistics" icon={BarChart3}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Namespace
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Inserts
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Queries
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Updates
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.namespaceInsights.map((n, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {n.ns}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {n.inserts}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {n.queries}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {n.updates}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'explain') {
                return (
                    <Panel title="Query Explain Plans" icon={Eye}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.explainPlans.map((p, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            fontSize: '0.8rem',
                                            color: THEME.primary,
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {p.query}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '12px',
                                            fontSize: '0.8rem',
                                            color: THEME.textMuted,
                                        }}
                                    >
                                        <div>Stage: {p.stages}</div>
                                        <div>Time: {p.millis}ms</div>
                                        <div>Docs: {p.docs}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'active-ops') {
                return (
                    <Panel title="Active Operations" icon={Zap}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Op ID
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Namespace
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Type
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Duration
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.activeOperations.map((o, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMuted,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {o.opid}
                                        </td>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {o.ns}
                                        </td>
                                        <td style={{ padding: '8px', color: THEME.secondary }}>{o.op}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{o.millis}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'slow-queries') {
                return (
                    <Panel title="Slow Query Log" icon={AlertTriangle}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.slowQueries.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${THEME.warning}`,
                                    }}
                                >
                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginBottom: '6px' }}>
                                        {q.ns}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            fontSize: '0.75rem',
                                            color: THEME.primary,
                                            marginBottom: '6px',
                                        }}
                                    >
                                        {q.query}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '12px',
                                            fontSize: '0.8rem',
                                            color: THEME.textMuted,
                                        }}
                                    >
                                        <div>{q.millis}ms</div>
                                        <div>Plan: {q.plan}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'query-profile') {
                return (
                    <Panel title="Query Profiler" icon={Eye}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: THEME.textMuted,
                            }}
                        >
                            <div>Level: 1 (slow {'>'} 100ms)</div>
                            <div style={{ marginTop: '8px' }}>Events: 2,847</div>
                            <div style={{ marginTop: '8px' }}>Overhead: 0.3%</div>
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'query-cost') {
                return (
                    <Panel title="Query Cost Estimator" icon={Gauge}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <HeroMetric label="Execution" value="2.4ms" color={THEME.primary} />
                            <HeroMetric label="Memory" value="12.3MB" color={THEME.secondary} />
                            <HeroMetric label="Index" value="94%" color={THEME.success} />
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'lock-analysis') {
                return (
                    <Panel title="Lock Wait Analysis (ms)" icon={Lock}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.lockAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="global" stroke={THEME.danger} dot={false} />
                                <Line type="monotone" dataKey="database" stroke={THEME.warning} dot={false} />
                                <Line type="monotone" dataKey="collection" stroke={THEME.success} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'anomaly') {
                return (
                    <Panel title="Anomaly Detection" icon={Brain}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { a: 'Spike in query latency', s: 'medium', score: 0.78 },
                                { a: 'Unusual cache eviction', s: 'low', score: 0.42 },
                            ].map((x, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMain, fontWeight: 500, fontSize: '0.85rem' }}>
                                        {x.a}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginTop: '4px' }}>
                                        {x.s} • ML: {(x.score * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'metrics-preview') {
                return (
                    <Panel title="Metrics Preview" icon={BarChart3}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.metricsSparklines.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        display: 'grid',
                                        gridTemplateColumns: '100px 1fr 60px',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <div style={{ color: THEME.textMuted, fontSize: '0.8rem' }}>{m.name}</div>
                                    <MiniSparkline data={m.trend} color={THEME.primary} />
                                    <div style={{ color: THEME.primary, fontWeight: 500, fontSize: '0.85rem' }}>
                                        {m.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'live-agent') {
                return (
                    <Panel title="Live Agent" icon={Brain}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                display: 'grid',
                                gap: '8px',
                            }}
                        >
                            <div style={{ fontSize: '0.85rem', color: THEME.textMain }}>
                                <strong>Status:</strong> <span style={{ color: THEME.success }}>● Active</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: THEME.textMuted }}>
                                AI monitoring 847 metrics. Last rec: Create index on users.email field.
                            </div>
                        </div>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'STORAGE') {
            if (itemKey === 'index-advisor') {
                return (
                    <Panel title="Index Advisor" icon={TrendingUp}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.indexAdvisor.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${r.unused ? THEME.warning : THEME.success}`,
                                    }}
                                >
                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginBottom: '4px' }}>
                                        {r.coll}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            fontSize: '0.75rem',
                                            color: THEME.primary,
                                        }}
                                    >
                                        {r.rec}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            color: THEME.success,
                                            fontWeight: 500,
                                            marginTop: '4px',
                                        }}
                                    >
                                        {r.impact}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'schema-analyzer') {
                return (
                    <Panel title="Schema Analyzer" icon={Code}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Collection
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Avg
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Fields
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Nested
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.schemaAnalyzer.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {s.coll}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '8px',
                                                color: THEME.textMuted,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {s.avgSize}KB
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {s.fields}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {s.nested}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'coll-stats') {
                return (
                    <Panel title="Collection Statistics" icon={BarChart3}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.collectionStats.map((c, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            color: THEME.primary,
                                            fontWeight: 500,
                                            marginBottom: '8px',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '8px',
                                            fontSize: '0.8rem',
                                            color: THEME.textMuted,
                                        }}
                                    >
                                        <div>{c.size}</div>
                                        <div>{c.docs} docs</div>
                                        <div>{c.indexes} idx</div>
                                        <div>{c.avgDocSize}KB</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'wiredtiger') {
                return (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Panel title="WiredTiger Cache" icon={Cpu}>
                            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                <RingGauge value={demoData.wiredTigerCache.usage} color={THEME.secondary} />
                                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: THEME.textMuted }}>
                                    68% of 32GB
                                </div>
                            </div>
                        </Panel>
                        <Panel title="Cache Evictions/sec" icon={RefreshCw}>
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={demoData.wiredTigerCache.evictionRate}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="evictions" stroke={THEME.warning} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                );
            } else if (itemKey === 'backup') {
                return (
                    <Panel title="Backup Monitor" icon={Download}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.backupMonitor.map((b, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            color: THEME.textMain,
                                            fontWeight: 500,
                                            fontSize: '0.85rem',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        {b.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '12px',
                                            fontSize: '0.8rem',
                                            color: THEME.textMuted,
                                        }}
                                    >
                                        <div style={{ color: THEME.success }}>✓ {b.status}</div>
                                        <div>{b.size}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'capacity') {
                return (
                    <Panel title="Storage Capacity" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.capacityPlanning}>
                                <defs>
                                    <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="current" stroke={THEME.primary} />
                                <Area type="monotone" dataKey="projected" stroke={THEME.warning} fill="url(#cap)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'netio') {
                return (
                    <Panel title="Network I/O (MB/s)" icon={Network}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoData.networkIO}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bytesIn" stroke={THEME.primary} dot={false} />
                                <Line type="monotone" dataKey="bytesOut" stroke={THEME.secondary} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'DATA') {
            if (itemKey === 'doc-editor') {
                return (
                    <Panel title="Document Editor" icon={Code}>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: '0.75rem',
                                background: THEME.glass,
                                padding: '12px',
                                borderRadius: '4px',
                                color: THEME.primary,
                                overflow: 'auto',
                                maxHeight: '250px',
                            }}
                        >
                            {`{\n  "_id": ObjectId("507f1f77bcf86cd799439011"),\n  "name": "John Doe",\n  "status": "active",\n  "metadata": {\n    "created": ISODate("2026-03-26T10:45:00Z"),\n    "tags": ["premium"],\n    "scores": [95, 87, 92]\n  }\n}`}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'agg-builder') {
                return (
                    <Panel title="Aggregation Pipeline" icon={Layers}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.aggregationExample.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${THEME.primary}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            color: THEME.primary,
                                            fontWeight: 500,
                                            fontFamily: THEME.fontMono,
                                            fontSize: '0.8rem',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {s.stage}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {s.filter || s.group || s.sort}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'nl-query') {
                return (
                    <Panel title="NL Query Generator" icon={Brain}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                display: 'grid',
                                gap: '12px',
                            }}
                        >
                            <div>
                                <div style={{ color: THEME.textMuted, fontSize: '0.8rem', marginBottom: '4px' }}>
                                    English:
                                </div>
                                <div style={{ color: THEME.textMain, fontSize: '0.85rem' }}>
                                    "Find active users from last 30 days"
                                </div>
                            </div>
                            <div>
                                <div style={{ color: THEME.textMuted, fontSize: '0.8rem', marginBottom: '4px' }}>
                                    MQL:
                                </div>
                                <div
                                    style={{ color: THEME.primary, fontSize: '0.75rem', fontFamily: THEME.fontMono }}
                                >{`db.users.find({status: "active", created: {$gte: Date()}})`}</div>
                            </div>
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'import-export') {
                return (
                    <Panel title="Import/Export" icon={Upload}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.importExportJobs.map((j, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        <div style={{ color: THEME.textMain, fontWeight: 500, fontSize: '0.85rem' }}>
                                            {j.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: j.status === 'completed' ? THEME.success : THEME.warning,
                                            }}
                                        >
                                            {j.status === 'completed' ? '✓' : '⟳'} {j.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted }}>
                                        {j.docs.toLocaleString()} docs • {j.duration || `${j.progress}%`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'sql-trans') {
                return (
                    <Panel title="SQL to MQL" icon={Code}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.sqlTranslations.map((t, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>
                                        SQL:
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            fontFamily: THEME.fontMono,
                                            color: THEME.primary,
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {t.sql}
                                    </div>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>
                                        MQL:
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            fontFamily: THEME.fontMono,
                                            color: THEME.secondary,
                                        }}
                                    >
                                        {t.mql}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'schema-compare') {
                return (
                    <Panel title="Schema Compare" icon={GitBranch}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: THEME.textMuted,
                                display: 'grid',
                                gap: '8px',
                            }}
                        >
                            <div>Collection A: 156 fields, 3.2KB avg</div>
                            <div>Collection B: 148 fields, 3.0KB avg</div>
                            <div style={{ marginTop: '8px', color: THEME.warning }}>⚠ 8 fields in A missing from B</div>
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'geospatial') {
                return (
                    <Panel title="Geo-spatial" icon={Map}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: THEME.textMuted,
                                display: 'grid',
                                gap: '8px',
                            }}
                        >
                            <div>Active indexes: 3 (2dsphere)</div>
                            <div>Last query: $near 45.2km radius</div>
                            <div>Results: 234 documents</div>
                        </div>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'INTELLIGENCE') {
            if (itemKey === 'ai-hints') {
                return (
                    <Panel title="AI Hints" icon={Brain}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { h: 'Create compound index (email, status)', i: '+34%' },
                                { h: 'Archive events older than 90d', i: '-45%' },
                            ].map((x, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${THEME.primary}`,
                                    }}
                                >
                                    <div style={{ color: THEME.textMain, fontSize: '0.85rem', marginBottom: '4px' }}>
                                        {x.h}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: THEME.success, fontWeight: 500 }}>
                                        Est. impact: {x.i}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'compare-clusters') {
                return (
                    <Panel title="Compare Clusters" icon={BarChart3}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Metric
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        US
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        EU
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { m: 'Ops/sec', u: '2,450', e: '1,840' },
                                    { m: 'Latency', u: '2.1ms', e: '3.4ms' },
                                    { m: 'Connections', u: '248', e: '156' },
                                ].map((r, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{r.m}</td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {r.u}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '8px', color: THEME.textMuted }}>
                                            {r.e}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'hist-trends') {
                return (
                    <Panel title="Historical Trends" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoData.historicalTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="ops" stroke={THEME.primary} dot={false} />
                                <Line type="monotone" dataKey="latency" stroke={THEME.warning} dot={false} />
                                <Line type="monotone" dataKey="connections" stroke={THEME.secondary} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                );
            } else if (itemKey === 'perf-advisor') {
                return (
                    <Panel title="Performance Advisor v2" icon={Gauge}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.perfAdvisor.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${r.priority === 'high' ? THEME.danger : r.priority === 'medium' ? THEME.warning : THEME.textDim}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto',
                                            alignItems: 'start',
                                            gap: '8px',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        <div style={{ color: THEME.textMain, fontSize: '0.85rem' }}>{r.issue}</div>
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 4px',
                                                background:
                                                    r.priority === 'high'
                                                        ? THEME.danger
                                                        : r.priority === 'medium'
                                                          ? THEME.warning
                                                          : THEME.secondary,
                                                color: THEME.glass,
                                                borderRadius: '2px',
                                            }}
                                        >
                                            {r.priority}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: THEME.success }}>{r.impact}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'trace-corr') {
                return (
                    <Panel title="Trace Correlator" icon={GitBranch}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: THEME.textMuted,
                                display: 'grid',
                                gap: '8px',
                            }}
                        >
                            <div>Traces: 4,234</div>
                            <div>Avg Time: 1.2ms</div>
                            <div>Cross-service: 89%</div>
                        </div>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'REPLICATION') {
            if (itemKey === 'replica-status') {
                return (
                    <Panel title="Replica Set Members" icon={GitBranch}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Member
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        State
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Ping
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Lag
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.replicaSetMembers.map((m, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {m.member}
                                        </td>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: m.state === 'PRIMARY' ? THEME.primary : THEME.success,
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {m.state}
                                        </td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{m.ping}ms</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{m.lag}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'failover') {
                return (
                    <Panel title="Failover Monitor" icon={AlertCircle}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.failoverMonitor.map((e, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '60px 1fr auto',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.8rem', color: THEME.primary, fontWeight: 500 }}>
                                            Elec #{e.election.split('#')[1]}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: THEME.secondary }}>{e.winner}</div>
                                        <div style={{ fontSize: '0.8rem', color: THEME.textMuted }}>{e.duration}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: THEME.textDim }}>{e.date}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'sharding') {
                return (
                    <Panel title="Sharding Overview" icon={Layers}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <HeroMetric
                                    label="Shards"
                                    value={String(demoData.shardingOverview.numShards)}
                                    color={THEME.primary}
                                />
                                <HeroMetric
                                    label="Chunks"
                                    value={String(demoData.shardingOverview.chunks)}
                                    color={THEME.secondary}
                                />
                            </div>
                            <div
                                style={{
                                    padding: '12px',
                                    background: THEME.glass,
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    color: THEME.textMuted,
                                }}
                            >
                                <div>Balancer: {demoData.shardingOverview.balancer}</div>
                                <div style={{ marginTop: '4px' }}>
                                    Distribution: {demoData.shardingOverview.distribution.join(', ')}
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'oplog') {
                return (
                    <Panel title="Oplog Tail" icon={Clock}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.oplogTail.map((e, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${THEME.primary}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '140px 80px 1fr',
                                            gap: '12px',
                                            alignItems: 'center',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '0.75rem',
                                                fontFamily: THEME.fontMono,
                                                color: THEME.textMuted,
                                            }}
                                        >
                                            {e.ts}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: THEME.secondary, fontWeight: 500 }}>
                                            {e.op}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.8rem',
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {e.ns}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            }
        }

        if (sectionKey === 'MANAGEMENT') {
            if (itemKey === 'alerts') {
                return (
                    <Panel title="Alert Manager" icon={AlertCircle}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {demoData.alertManager.map((a, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        borderLeft: `3px solid ${a.severity === 'critical' ? THEME.danger : a.severity === 'warning' ? THEME.warning : THEME.secondary}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto auto',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        <div style={{ color: THEME.textMain, fontWeight: 500, fontSize: '0.85rem' }}>
                                            {a.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 4px',
                                                background:
                                                    a.severity === 'critical'
                                                        ? THEME.danger
                                                        : a.severity === 'warning'
                                                          ? THEME.warning
                                                          : THEME.secondary,
                                                color: THEME.glass,
                                                borderRadius: '2px',
                                            }}
                                        >
                                            {a.severity}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.75rem',
                                                color: a.status === 'active' ? THEME.danger : THEME.success,
                                            }}
                                        >
                                            {a.status === 'active' ? '●' : '✓'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'prometheus') {
                return (
                    <Panel title="Prometheus Exporter" icon={Network}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                <div style={{ color: THEME.textMuted, fontSize: '0.8rem', marginBottom: '4px' }}>
                                    Endpoint
                                </div>
                                <div style={{ color: THEME.primary, fontFamily: THEME.fontMono, fontSize: '0.75rem' }}>
                                    {demoData.prometheusExport.endpoint}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>
                                        Status
                                    </div>
                                    <div style={{ color: THEME.success, fontWeight: 500, fontSize: '0.85rem' }}>
                                        ✓ {demoData.prometheusExport.status}
                                    </div>
                                </div>
                                <div style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>
                                        Metrics
                                    </div>
                                    <div style={{ color: THEME.primary, fontWeight: 500, fontSize: '0.85rem' }}>
                                        {demoData.prometheusExport.metrics}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'sso') {
                return (
                    <Panel title="SSO/Auth" icon={Key}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { k: 'Auth Mechanism', v: 'SCRAM-SHA-256' },
                                { k: 'LDAP', v: 'Enabled' },
                                { k: 'TLS/SSL', v: 'Required' },
                            ].map((x, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.8rem', marginBottom: '4px' }}>
                                        {x.k}
                                    </div>
                                    <div
                                        style={{
                                            color:
                                                x.v === 'Enabled' || x.v === 'Required'
                                                    ? THEME.success
                                                    : THEME.textMain,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {x.v === 'Enabled' || x.v === 'Required' ? '✓ ' : ''}
                                        {x.v}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'atlas-api') {
                return (
                    <Panel title="Atlas API Bridge" icon={ZapIcon}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { k: 'Status', v: 'Connected' },
                                { k: 'Last Sync', v: '2026-03-26 10:45:12' },
                                { k: 'API Key', v: 'Valid' },
                            ].map((x, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div style={{ color: THEME.textMuted, fontSize: '0.8rem', marginBottom: '4px' }}>
                                        {x.k}
                                    </div>
                                    <div
                                        style={{
                                            color:
                                                x.v === 'Connected' || x.v === 'Valid' ? THEME.success : THEME.textMain,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {x.v === 'Connected' || x.v === 'Valid' ? '✓ ' : ''}
                                        {x.v}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'dashboards') {
                return (
                    <Panel title="Custom Dashboards" icon={BarChart3}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { n: 'Production Overview', v: 245 },
                                { n: 'Query Performance', v: 128 },
                                { n: 'Replication Health', v: 87 },
                            ].map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: '4px',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <div style={{ color: THEME.textMain, fontWeight: 500, fontSize: '0.85rem' }}>
                                        {d.n}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted }}>{d.v} views</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'reports') {
                return (
                    <Panel title="Reports" icon={FileText}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                                { n: 'Monthly Health Report', d: '2026-03-26', s: '2.1 MB' },
                                { n: 'Q1 Performance', d: '2026-03-20', s: '5.4 MB' },
                            ].map((r, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            color: THEME.textMain,
                                            fontWeight: 500,
                                            fontSize: '0.85rem',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        {r.n}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '12px',
                                            fontSize: '0.8rem',
                                            color: THEME.textMuted,
                                        }}
                                    >
                                        <div>{r.d}</div>
                                        <div>{r.s}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                );
            } else if (itemKey === 'audit') {
                return (
                    <Panel title="Audit Log" icon={Shield}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Timestamp
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        User
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.auditLog.map((e, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td
                                            style={{
                                                padding: '8px',
                                                color: THEME.textMuted,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {e.timestamp}
                                        </td>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{e.user}</td>
                                        <td style={{ padding: '8px', color: THEME.secondary }}>{e.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            } else if (itemKey === 'user-mgmt') {
                return (
                    <Panel title="User Management" icon={Users}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Username
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Roles
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Auth Mechanism
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px',
                                            color: THEME.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Last Login
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.users.map((u, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{u.username}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{u.roles}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{u.authMech}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{u.lastLogin}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                );
            }
        }
    };

    return (
        <DemoLayout
            title="MongoDB"
            description="MongoDB management and monitoring platform"
            tabs={sections}
            onTabChange={({ sectionKey, itemKey }) => {}}
            renderContent={renderContent}
        />
    );
}

export default DemoMongoDBTab;
