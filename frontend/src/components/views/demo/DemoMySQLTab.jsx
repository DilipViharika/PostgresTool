import React, { useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import DemoLayout, {
    Panel,
    StatusBadge,
    RingGauge,
    MiniSparkline,
    HeroMetric,
    MetricCard,
    LiveMetric,
    TabPills,
    AlertRow,
    DataTable,
    ChartTip,
    generateChartData,
} from './DemoLayout.jsx';
import {
    Activity,
    Database,
    Bell,
    Eye,
    Server,
    Shield,
    Gauge,
    Terminal,
    Zap,
    Clock,
    TrendingUp,
    HardDrive,
    AlertCircle,
    Lock,
    Users,
    Code,
    CheckCircle,
    Network,
    RefreshCw,
    Settings,
    Cpu,
    BarChart3,
    Layers,
    FileText,
    GitBranch,
    Radio,
    Archive,
    AlertTriangle,
    Info,
    Droplet,
    Anchor,
    ArrowUpRight,
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
    Legend,
} from 'recharts';

function DemoMySQLTab({ tabId }) {
    useAdaptiveTheme();

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const base30d = generateChartData(30);

        return {
            innodb: {
                bufferPoolUsage: 78.5,
                bufferPoolSize: 8192,
                bufferPoolPages: 2048000,
                readHits: 99.2,
                writeHits: 87.3,
                pagesRead: 1240,
                pagesWritten: 560,
                dirtyPages: 12400,
            },
            qps: base24h.map((d, i) => ({
                ...d,
                value: Math.floor(850 + Math.sin(i / 6) * 350 + Math.random() * 180),
            })),
            tps: base24h.map((d, i) => ({
                ...d,
                value: Math.floor(620 + Math.cos(i / 6) * 250 + Math.random() * 140),
            })),
            connections: base24h.map((d, i) => ({
                ...d,
                active: Math.floor(38 + Math.sin(i / 8) * 12 + Math.random() * 8),
                idle: Math.floor(28 + Math.cos(i / 8) * 15 + Math.random() * 10),
            })),
            replication: base24h.map((d, i) => ({
                ...d,
                lag: Math.floor(2 + Math.random() * 8),
                relayLog: Math.floor(850 + Math.sin(i / 5) * 400 + Math.random() * 200),
            })),
            databases: [
                { name: 'production', engine: 'InnoDB', size: '52.4 GB', tables: 127, rows: 4230000 },
                { name: 'analytics', engine: 'InnoDB', size: '38.9 GB', tables: 64, rows: 2150000 },
                { name: 'cache_db', engine: 'Memory', size: '2.1 GB', tables: 24, rows: 580000 },
                { name: 'logs', engine: 'InnoDB', size: '14.2 GB', tables: 12, rows: 890000 },
            ],
            alerts: {
                critical: 1,
                warning: 4,
                info: 8,
                resolved: 38,
            },
            alertList: [
                {
                    severity: 'critical',
                    title: 'Buffer Pool Usage Critical',
                    time: '2 min ago',
                    source: 'innodb_monitor',
                    color: THEME.danger,
                },
                {
                    severity: 'warning',
                    title: 'High Replication Lag Detected',
                    time: '5 min ago',
                    source: 'replication',
                    color: THEME.warning,
                },
                {
                    severity: 'warning',
                    title: 'Slow Query Threshold Exceeded',
                    time: '8 min ago',
                    source: 'slow_log',
                    color: THEME.warning,
                },
                {
                    severity: 'info',
                    title: 'Binlog Rotation Scheduled',
                    time: '12 min ago',
                    source: 'binlog_monitor',
                    color: THEME.primary,
                },
            ],
            topQueries: [
                {
                    query: 'SELECT * FROM orders WHERE status = ?',
                    calls: 1840000,
                    avgTime: '1.24ms',
                    maxTime: '45.2ms',
                    rows: 4200000,
                    execTime: '34.2%',
                },
                {
                    query: 'UPDATE inventory SET qty = ? WHERE id = ?',
                    calls: 1200000,
                    avgTime: '2.1ms',
                    maxTime: '78.4ms',
                    rows: 1200000,
                    execTime: '28.5%',
                },
                {
                    query: 'SELECT id, name FROM users WHERE active = 1',
                    calls: 680000,
                    avgTime: '0.85ms',
                    maxTime: '12.3ms',
                    rows: 680000,
                    execTime: '15.1%',
                },
            ],
            indexes: [
                {
                    table: 'orders',
                    name: 'idx_orders_user_id',
                    columns: 'user_id',
                    size: '2.4 MB',
                    cardinality: 15600,
                    efficiency: '92%',
                },
                {
                    table: 'products',
                    name: 'idx_products_category',
                    columns: 'category_id, status',
                    size: '1.8 MB',
                    cardinality: 240,
                    efficiency: '78%',
                },
                {
                    table: 'users',
                    name: 'idx_users_email',
                    columns: 'email',
                    size: '890 KB',
                    cardinality: 54200,
                    efficiency: '96%',
                },
            ],
            binlog: [
                { file: 'mysql-bin.000142', position: 1247890, size: '124 MB', age: '2h 15m' },
                { file: 'mysql-bin.000141', position: 4294967295, size: '256 MB', age: '4h 30m' },
                { file: 'mysql-bin.000140', position: 4294967295, size: '256 MB', age: '6h 45m' },
            ],
            replicationStatus: {
                role: 'Master',
                slaveCount: 2,
                gtidMode: 'ON',
                gtidExecuted: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890:1-8946',
                masterLogFile: 'mysql-bin.000142',
                masterLogPos: 1247890,
                binlogDoDB: 'production',
                binlogIgnoreDB: 'mysql, information_schema',
            },
            poolStatus: {
                maxConnections: 200,
                activeConnections: 38,
                idleConnections: 28,
                totalCreated: 14240,
                connectionErrors: 2,
                connectionWaitTime: '0.8ms',
            },
            schema: [
                {
                    name: 'production',
                    tables: 127,
                    views: 18,
                    procedures: 24,
                    functions: 12,
                    triggers: 8,
                    size: '52.4 GB',
                },
                {
                    name: 'analytics',
                    tables: 64,
                    views: 32,
                    procedures: 8,
                    functions: 4,
                    triggers: 0,
                    size: '38.9 GB',
                },
            ],
        };
    }, []);

    const sections = [
        {
            key: 'overview',
            label: 'Overview',
            icon: Activity,
            accent: THEME.primary,
            items: [
                { key: 'fleet', label: 'Fleet Overview' },
                { key: 'database', label: 'Database Overview' },
                { key: 'performance', label: 'Performance' },
                { key: 'resources', label: 'Resources' },
                { key: 'reliability', label: 'Reliability' },
            ],
        },
        {
            key: 'alerts',
            label: 'Alerts & Rules',
            icon: Bell,
            accent: THEME.danger,
            items: [
                { key: 'activeAlerts', label: 'Active Alerts' },
                { key: 'alertRules', label: 'Alert Rules' },
                { key: 'correlation', label: 'Alert Correlation' },
            ],
        },
        {
            key: 'query',
            label: 'Query Analysis',
            icon: BarChart3,
            accent: THEME.ai,
            items: [
                { key: 'queryOptimizer', label: 'Query Optimizer' },
                { key: 'queryPlan', label: 'Query Plan Viewer' },
                { key: 'planRegression', label: 'Plan Regression' },
                { key: 'indexes', label: 'Indexes' },
                { key: 'bloatAnalysis', label: 'Table Bloat' },
                { key: 'tableAnalysis', label: 'Table Analysis' },
            ],
        },
        {
            key: 'schema',
            label: 'Schema & Data',
            icon: Layers,
            accent: THEME.success,
            items: [
                { key: 'schemaBrowser', label: 'Schema Browser' },
                { key: 'migrations', label: 'Schema & Migrations' },
                { key: 'schemaViz', label: 'Schema Visualizer' },
                { key: 'tableDeps', label: 'Table Dependencies' },
                { key: 'chartBuilder', label: 'Chart Builder' },
            ],
        },
        {
            key: 'infra',
            label: 'Infrastructure',
            icon: Server,
            accent: THEME.primary,
            items: [
                { key: 'connPool', label: 'Connection Pool' },
                { key: 'poolMetrics', label: 'Pool Metrics' },
                { key: 'replication', label: 'Replication & Binlog' },
                { key: 'checkpoints', label: 'Checkpoint Monitor' },
                { key: 'maintenance', label: 'Optimize & Maintenance' },
                { key: 'capacity', label: 'Capacity Planning' },
                { key: 'backup', label: 'Backup & Recovery' },
            ],
        },
        {
            key: 'security',
            label: 'Security',
            icon: Shield,
            accent: THEME.success,
            items: [{ key: 'secCompliance', label: 'Security & Compliance' }],
        },
        {
            key: 'observability',
            label: 'Observability',
            icon: Eye,
            accent: THEME.warning,
            items: [
                { key: 'obsHub', label: 'Observability Hub' },
                { key: 'cloudwatch', label: 'CloudWatch' },
                { key: 'logPatterns', label: 'Log Pattern Analysis' },
                { key: 'otel', label: 'OpenTelemetry' },
                { key: 'k8s', label: 'Kubernetes' },
                { key: 'statusPage', label: 'Status Page' },
                { key: 'aiMonitoring', label: 'AI Monitoring' },
            ],
        },
        {
            key: 'dev',
            label: 'Developer Tools',
            icon: Terminal,
            accent: THEME.primary,
            items: [
                { key: 'sqlConsole', label: 'SQL Console' },
                { key: 'apiTracing', label: 'API Tracing' },
                { key: 'repository', label: 'Repository' },
                { key: 'aiAdvisor', label: 'AI Query Advisor' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        /* ═══════════════════════════════════════════════════════════════════════════
           OVERVIEW SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'overview') {
            if (itemKey === 'fleet') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Fleet Overview
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                            className="dpg-stagger"
                        >
                            <MetricCard
                                icon={Server}
                                label="MySQL Instances"
                                value="12"
                                sub="Prod: 8, Dev: 4"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Activity}
                                label="Healthy"
                                value="11"
                                sub="1 degraded"
                                color={THEME.success}
                                trend={2.3}
                                trendUp={true}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Total Storage"
                                value="487GB"
                                sub="Used: 312GB"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Cpu}
                                label="Avg CPU"
                                value="42%"
                                sub="Peak: 78%"
                                color={THEME.warning}
                                trend={-1.2}
                                trendUp={false}
                            />
                        </div>
                    </div>
                );
            }

            if (itemKey === 'database') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="dpg-stagger">
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Database Overview
                        </h1>

                        {/* Status & Key Metrics Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <Panel title="STATUS" icon={CheckCircle} accentColor={THEME.success}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <StatusBadge label="Operational" color={THEME.success} pulse />
                                        <StatusBadge label="Production" color={THEME.primary} />
                                        <StatusBadge label="MySQL 8.0.36" color={THEME.ai} />
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="QPS" icon={Zap} accentColor={THEME.ai}>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            color: THEME.primary,
                                            fontFamily: THEME.fontMono,
                                            marginBottom: 8,
                                        }}
                                    >
                                        856
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>queries per second</div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            height: 20,
                                        }}
                                    >
                                        <MiniSparkline
                                            data={demoData.qps.slice(-12).map((d) => d.value)}
                                            color={THEME.primary}
                                            width={100}
                                            height={20}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="CONNECTIONS" icon={Network} accentColor={THEME.warning}>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            color: THEME.warning,
                                            fontFamily: THEME.fontMono,
                                            marginBottom: 4,
                                        }}
                                    >
                                        38
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 8 }}>
                                        of 512 max
                                    </div>
                                    <div
                                        style={{
                                            background: THEME.gridDark,
                                            borderRadius: 4,
                                            height: 4,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: `linear-gradient(90deg, ${THEME.warning}, ${THEME.ai})`,
                                                height: '100%',
                                                width: '7.4%',
                                            }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="INNODB CACHE HIT" icon={Gauge} accentColor={THEME.success}>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            color: THEME.success,
                                            fontFamily: THEME.fontMono,
                                            marginBottom: 8,
                                        }}
                                    >
                                        99.1%
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>buffer pool hit rate</div>
                                </div>
                            </Panel>
                        </div>

                        {/* More KPIs Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <MetricCard
                                icon={HardDrive}
                                label="Buffer Pool Usage"
                                value="78.5%"
                                sub="6.4 GB of 8.2 GB"
                                color={THEME.ai}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Slow Queries/hr"
                                value="3"
                                sub="1 critical"
                                color={THEME.warning}
                                spark={[2, 5, 3, 1, 2, 8, 3, 5, 2, 1, 4, 3]}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Replication Lag"
                                value="0.2s"
                                sub="Slave-1: 0.18s"
                                color={THEME.success}
                                spark={Array.from({ length: 12 }, () => Math.random() * 1)}
                            />
                        </div>

                        {/* Detailed Info Panels */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <Panel title="LAST BACKUP" icon={Archive} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: THEME.textMuted,
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Type
                                        </div>
                                        <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 500 }}>
                                            mysqldump full backup
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: THEME.textMuted,
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Status
                                        </div>
                                        <StatusBadge label="Verified" color={THEME.success} />
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: THEME.textMuted,
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Age
                                        </div>
                                        <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 500 }}>
                                            2h 14m ago
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: THEME.textMuted,
                                                textTransform: 'uppercase',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Size
                                        </div>
                                        <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 500 }}>
                                            8.2 GB (compressed)
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="SLOW QUERIES" icon={AlertTriangle} accentColor={THEME.warning}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { query: 'SELECT orders WHERE id=?', duration: '45.2ms', pct: 85 },
                                        { query: 'UPDATE inventory SET qty', duration: '78.4ms', pct: 95 },
                                        { query: 'SELECT FROM products', duration: '12.3ms', pct: 30 },
                                    ].map((q, i) => (
                                        <div key={i} style={{ fontSize: 10 }}>
                                            <div
                                                style={{
                                                    color: THEME.textMuted,
                                                    marginBottom: 2,
                                                    fontFamily: THEME.fontMono,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {q.query}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: THEME.gridDark,
                                                        borderRadius: 2,
                                                        height: 3,
                                                        flex: 1,
                                                        marginRight: 8,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            background: THEME.warning,
                                                            height: '100%',
                                                            width: `${q.pct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ color: THEME.warning, fontWeight: 600 }}>
                                                    {q.duration}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <Panel title="INNODB STATUS" icon={Activity} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Hit Rate</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>99.2%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Dirty Pages</span>
                                        <span style={{ color: THEME.warning, fontWeight: 600 }}>12.4K</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Pending I/O</span>
                                        <span style={{ color: THEME.primary, fontWeight: 600 }}>28 reads</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Read Ahead</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>enabled</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Doublewrite</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>enabled</span>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Query Throughput Chart */}
                        <Panel title="QUERY THROUGHPUT (24H)" icon={TrendingUp} accentColor={THEME.ai}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={demoData.qps}>
                                    <defs>
                                        <linearGradient id="qpsgradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                    <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={THEME.ai}
                                        fillOpacity={1}
                                        fill="url(#qpsgradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        {/* InnoDB Health & Resource Gauges */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                            <Panel
                                title="BUFFER POOL"
                                icon={HardDrive}
                                accentColor={THEME.ai}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge value={78} color={THEME.ai} size={100} strokeWidth={7} label="Used" />
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            marginTop: 8,
                                            textAlign: 'center',
                                        }}
                                    >
                                        6.4GB / 8.2GB
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                title="CACHE HIT"
                                icon={Gauge}
                                accentColor={THEME.success}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={99}
                                        color={THEME.success}
                                        size={100}
                                        strokeWidth={7}
                                        label="Hit %"
                                    />
                                </div>
                            </Panel>

                            <Panel
                                title="CPU"
                                icon={Cpu}
                                accentColor={THEME.warning}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={42}
                                        color={THEME.warning}
                                        size={100}
                                        strokeWidth={7}
                                        label="Usage"
                                    />
                                </div>
                            </Panel>

                            <Panel
                                title="MEMORY"
                                icon={Droplet}
                                accentColor={THEME.ai}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge value={68} color={THEME.ai} size={100} strokeWidth={7} label="Used" />
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 8 }}>
                                        17.2GB / 25.6GB
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                title="DISK I/O"
                                icon={HardDrive}
                                accentColor={THEME.primary}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={34}
                                        color={THEME.primary}
                                        size={100}
                                        strokeWidth={7}
                                        label="I/O %"
                                    />
                                </div>
                            </Panel>

                            <Panel
                                title="CONNECTIONS"
                                icon={Network}
                                accentColor={THEME.warning}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={19}
                                        color={THEME.warning}
                                        size={100}
                                        strokeWidth={7}
                                        label="Used"
                                    />
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 8 }}>38 / 200</div>
                                </div>
                            </Panel>
                        </div>

                        {/* Replication Topology */}
                        <Panel title="REPLICATION TOPOLOGY" icon={GitBranch} accentColor={THEME.primary}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                }}
                            >
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            background: THEME.primary,
                                            color: THEME.bg,
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            fontWeight: 700,
                                            marginBottom: 8,
                                        }}
                                    >
                                        MASTER
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>mysql-bin.000142</div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                            marginTop: 4,
                                        }}
                                    >
                                        Pos: 1.24M
                                    </div>
                                </div>

                                <div style={{ fontSize: 16, color: THEME.textDim, margin: '0 16px' }}>{'>'}</div>

                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            background: THEME.success,
                                            color: THEME.bg,
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            fontWeight: 700,
                                            marginBottom: 8,
                                        }}
                                    >
                                        SLAVE-1
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>Lag: 0.18s</div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                            marginTop: 4,
                                        }}
                                    >
                                        GTID: 1-8912
                                    </div>
                                </div>

                                <div style={{ fontSize: 16, color: THEME.textDim, margin: '0 16px' }}>{'>'}</div>

                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div
                                        style={{
                                            background: THEME.success,
                                            color: THEME.bg,
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            fontWeight: 700,
                                            marginBottom: 8,
                                        }}
                                    >
                                        SLAVE-2
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>Lag: 0.22s</div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                            marginTop: 4,
                                        }}
                                    >
                                        GTID: 1-8912
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        {/* Top Tables by Operations */}
                        <Panel title="TOP TABLES BY OPERATIONS" icon={Database} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { name: 'orders', reads: 8400000, writes: 2100000, selects: 1840000 },
                                    { name: 'users', reads: 5200000, writes: 800000, selects: 680000 },
                                    { name: 'products', reads: 3100000, writes: 450000, selects: 520000 },
                                ].map((t, i) => {
                                    const total = t.reads + t.writes;
                                    const readPct = (t.reads / total) * 100;
                                    return (
                                        <div key={i}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                    fontSize: 11,
                                                }}
                                            >
                                                <span style={{ color: THEME.textMuted, fontWeight: 600 }}>
                                                    {t.name}
                                                </span>
                                                <span style={{ color: THEME.textDim, fontSize: 10 }}>
                                                    {(t.reads / 1000000).toFixed(1)}M R /{' '}
                                                    {(t.writes / 1000000).toFixed(1)}M W
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    height: 6,
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    gap: 1,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: readPct,
                                                        background: THEME.primary,
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        flex: 100 - readPct,
                                                        background: THEME.ai,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>

                        {/* Binary Log Status */}
                        <Panel title="BINARY LOG STATUS" icon={Radio} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {demoData.binlog.map((b, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 11,
                                            borderBottom:
                                                i < demoData.binlog.length - 1 ? `1px solid ${THEME.gridDark}` : 'none',
                                            paddingBottom: 10,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    color: THEME.textMuted,
                                                    fontFamily: THEME.fontMono,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {b.file}
                                            </div>
                                            <div style={{ color: THEME.textDim, fontSize: 9 }}>
                                                Position: {b.position.toLocaleString()} {b.age}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: THEME.textMuted, fontWeight: 600 }}>{b.size}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'performance') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="dpg-stagger">
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Performance
                        </h1>

                        {/* KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <MetricCard
                                icon={Zap}
                                label="QPS"
                                value="856"
                                sub="Peak: 1240/s"
                                color={THEME.primary}
                                spark={demoData.qps.slice(-12).map((d) => d.value)}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Avg Query Time"
                                value="1.24ms"
                                sub="Max: 78.4ms"
                                color={THEME.warning}
                                spark={[1.2, 1.5, 0.8, 1.1, 1.3, 1.0, 1.4, 0.9, 1.2, 1.1, 1.3, 1.0]}
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="TPS"
                                value="620"
                                sub="Transactions/s"
                                color={THEME.success}
                                spark={demoData.tps.slice(-12).map((d) => d.value)}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Lock Wait Time"
                                value="0.2ms"
                                sub="Max: 2.5ms"
                                color={THEME.primary}
                                spark={[0.1, 0.2, 0.15, 0.1, 0.3, 0.2, 0.1, 0.15, 0.2, 0.1, 0.25, 0.15]}
                            />
                        </div>

                        {/* Query Performance Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Panel title="QUERIES PER SECOND (24H)" icon={Zap} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={demoData.qps}>
                                        <defs>
                                            <linearGradient id="qps24" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={THEME.primary}
                                            fillOpacity={1}
                                            fill="url(#qps24)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="TRANSACTIONS PER SECOND (24H)" icon={TrendingUp} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={demoData.tps}>
                                        <defs>
                                            <linearGradient id="tps24" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={THEME.success}
                                            fillOpacity={1}
                                            fill="url(#tps24)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>

                        {/* Connection & Lock Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Panel title="ACTIVE CONNECTIONS" icon={Network} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={demoData.connections}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="active"
                                            stroke={THEME.warning}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="idle"
                                            stroke={THEME.textDim}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="TOP QUERIES" icon={Code} accentColor={THEME.ai}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.topQueries.map((q, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                borderBottom:
                                                    i < demoData.topQueries.length - 1
                                                        ? `1px solid ${THEME.gridDark}`
                                                        : 'none',
                                                paddingBottom: 10,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textMuted,
                                                    fontFamily: THEME.fontMono,
                                                    marginBottom: 6,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {q.query}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 6,
                                                    fontSize: 9,
                                                }}
                                            >
                                                <div style={{ color: THEME.textDim }}>
                                                    Calls: {(q.calls / 1000000).toFixed(1)}M
                                                </div>
                                                <div style={{ color: THEME.textDim }}>Avg: {q.avgTime}</div>
                                                <div style={{ color: THEME.textDim }}>Max: {q.maxTime}</div>
                                                <div style={{ color: THEME.textDim }}>{q.execTime}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>

                        {/* Index Stats & Table Analysis */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Panel title="INDEX STATS" icon={Database} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.indexes.map((idx, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontSize: 10,
                                                borderBottom:
                                                    i < demoData.indexes.length - 1
                                                        ? `1px solid ${THEME.gridDark}`
                                                        : 'none',
                                                paddingBottom: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span style={{ color: THEME.textMuted, fontWeight: 600 }}>
                                                    {idx.table}.{idx.name}
                                                </span>
                                                <span style={{ color: THEME.success, fontWeight: 600 }}>
                                                    {idx.efficiency}
                                                </span>
                                            </div>
                                            <div style={{ color: THEME.textDim, fontSize: 9 }}>
                                                Cardinality: {idx.cardinality} | Size: {idx.size}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <Panel title="REPLICATION METRICS" icon={GitBranch} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={demoData.replication}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="lag"
                                            stroke={THEME.warning}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="relayLog"
                                            stroke={THEME.primary}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>

                        {/* Database Stats */}
                        <Panel title="DATABASE STATISTICS" icon={Database} accentColor={THEME.success}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                {demoData.databases.map((db, i) => (
                                    <div
                                        key={i}
                                        style={{ padding: '12px', borderRadius: 8, background: `${THEME.primary}08` }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: THEME.textMain,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {db.name}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: THEME.textDim }}>Tables:</span>
                                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                                    {db.tables}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: THEME.textDim }}>Size:</span>
                                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                                    {db.size}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: THEME.textDim }}>Rows:</span>
                                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                                    {(db.rows / 1000000).toFixed(1)}M
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: THEME.textDim }}>Engine:</span>
                                                <span style={{ color: THEME.ai, fontWeight: 600 }}>{db.engine}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'resources') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="dpg-stagger">
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Resources
                        </h1>

                        {/* Resource Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <MetricCard
                                icon={Cpu}
                                label="CPU Usage"
                                value="42%"
                                sub="8 cores / 2.4 GHz"
                                color={THEME.warning}
                                spark={Array.from({ length: 12 }, () => 20 + Math.random() * 30)}
                            />
                            <MetricCard
                                icon={Droplet}
                                label="Memory Usage"
                                value="68%"
                                sub="17.2 GB / 25.6 GB"
                                color={THEME.ai}
                                spark={Array.from({ length: 12 }, () => 55 + Math.random() * 20)}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Disk I/O"
                                value="34%"
                                sub="Peak: 520 MB/s"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 50)}
                            />
                            <MetricCard
                                icon={Network}
                                label="Network I/O"
                                value="245 Mb/s"
                                sub="In: 120 | Out: 125"
                                color={THEME.success}
                                spark={Array.from({ length: 12 }, () => 150 + Math.random() * 150)}
                            />
                        </div>

                        {/* Detailed Resource Gauges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                            <Panel
                                title="CPU"
                                icon={Cpu}
                                accentColor={THEME.warning}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={42}
                                        color={THEME.warning}
                                        size={110}
                                        strokeWidth={8}
                                        label="Usage"
                                    />
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            marginTop: 10,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Core avg: 42%
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                title="MEMORY"
                                icon={Droplet}
                                accentColor={THEME.ai}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge value={68} color={THEME.ai} size={110} strokeWidth={8} label="Used" />
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            marginTop: 10,
                                            textAlign: 'center',
                                        }}
                                    >
                                        17.2 GB
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                title="DISK"
                                icon={HardDrive}
                                accentColor={THEME.primary}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={64}
                                        color={THEME.primary}
                                        size={110}
                                        strokeWidth={8}
                                        label="Used"
                                    />
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            marginTop: 10,
                                            textAlign: 'center',
                                        }}
                                    >
                                        312 GB
                                    </div>
                                </div>
                            </Panel>

                            <Panel
                                title="NETWORK"
                                icon={Network}
                                accentColor={THEME.success}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                noPad={true}
                            >
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <RingGauge
                                        value={32}
                                        color={THEME.success}
                                        size={110}
                                        strokeWidth={8}
                                        label="Util"
                                    />
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            marginTop: 10,
                                            textAlign: 'center',
                                        }}
                                    >
                                        245 Mb/s
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* CPU & Memory Timeline */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Panel title="CPU TIMELINE (24H)" icon={Cpu} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={demoData.qps.map((d) => ({ ...d, value: Math.random() * 60 }))}>
                                        <defs>
                                            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={THEME.warning}
                                            fillOpacity={1}
                                            fill="url(#cpuGrad)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="MEMORY TIMELINE (24H)" icon={Droplet} accentColor={THEME.ai}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart
                                        data={demoData.qps.map((d) => ({ ...d, value: 55 + Math.random() * 20 }))}
                                    >
                                        <defs>
                                            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={THEME.ai}
                                            fillOpacity={1}
                                            fill="url(#memGrad)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>

                        {/* Disk & Network Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Panel title="DISK I/O TIMELINE (24H)" icon={HardDrive} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart
                                        data={demoData.qps.map((d) => ({
                                            ...d,
                                            read: Math.random() * 300,
                                            write: Math.random() * 250,
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="read"
                                            stroke={THEME.primary}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="write"
                                            stroke={THEME.ai}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="NETWORK I/O TIMELINE (24H)" icon={Network} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart
                                        data={demoData.qps.map((d) => ({
                                            ...d,
                                            inbound: 100 + Math.random() * 150,
                                            outbound: 100 + Math.random() * 150,
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="inbound"
                                            stroke={THEME.success}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="outbound"
                                            stroke={THEME.primary}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>

                        {/* Process & Thread Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <Panel title="PROCESS STATS" icon={Activity} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Running Threads</span>
                                        <span style={{ color: THEME.primary, fontWeight: 600 }}>24</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Cache Hits</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>96.2%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Open Files</span>
                                        <span style={{ color: THEME.primary, fontWeight: 600 }}>248</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Context Switches</span>
                                        <span style={{ color: THEME.warning, fontWeight: 600 }}>8.4K/s</span>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="MEMORY BREAKDOWN" icon={Droplet} accentColor={THEME.ai}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { label: 'Buffer Pool', value: '8.2 GB', pct: 48 },
                                        { label: 'Query Cache', value: '1.6 GB', pct: 9 },
                                        { label: 'Tmp Tables', value: '2.4 GB', pct: 14 },
                                        { label: 'Other', value: '5.0 GB', pct: 29 },
                                    ].map((m, i) => (
                                        <div key={i}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                    fontSize: 10,
                                                }}
                                            >
                                                <span style={{ color: THEME.textDim }}>{m.label}</span>
                                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                                    {m.value}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    background: THEME.gridDark,
                                                    borderRadius: 3,
                                                    height: 4,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: [
                                                            THEME.ai,
                                                            THEME.primary,
                                                            THEME.warning,
                                                            THEME.success,
                                                        ][i],
                                                        height: '100%',
                                                        width: `${m.pct}%`,
                                                        borderRadius: 3,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <Panel title="STORAGE BREAKDOWN" icon={HardDrive} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { label: 'Data Files', value: '224 GB', pct: 72 },
                                        { label: 'Indexes', value: '56 GB', pct: 18 },
                                        { label: 'Logs', value: '28 GB', pct: 9 },
                                        { label: 'Temp', value: '4 GB', pct: 1 },
                                    ].map((s, i) => (
                                        <div key={i}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                    fontSize: 10,
                                                }}
                                            >
                                                <span style={{ color: THEME.textDim }}>{s.label}</span>
                                                <span style={{ color: THEME.textMain, fontWeight: 600 }}>
                                                    {s.value}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    background: THEME.gridDark,
                                                    borderRadius: 3,
                                                    height: 4,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: [
                                                            THEME.primary,
                                                            THEME.ai,
                                                            THEME.warning,
                                                            THEME.success,
                                                        ][i],
                                                        height: '100%',
                                                        width: `${s.pct}%`,
                                                        borderRadius: 3,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>
                    </div>
                );
            }

            if (itemKey === 'reliability') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="dpg-stagger">
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Reliability
                        </h1>

                        {/* Reliability KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <MetricCard
                                icon={CheckCircle}
                                label="Uptime"
                                value="99.98%"
                                sub="28 days"
                                color={THEME.success}
                                trend={0.02}
                                trendUp={true}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Errors/min"
                                value="0.3"
                                sub="Avg: 0.2"
                                color={THEME.warning}
                                spark={Array.from({ length: 12 }, () => Math.random() * 1)}
                            />
                            <MetricCard
                                icon={RefreshCw}
                                label="Backups"
                                value="48"
                                sub="Last: 2h ago"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 50)}
                            />
                            <MetricCard
                                icon={Shield}
                                label="MTTR"
                                value="4.2m"
                                sub="Avg recovery"
                                color={THEME.success}
                                spark={[5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4]}
                            />
                        </div>

                        {/* Reliability Panels */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <Panel title="UPTIME HISTORY" icon={CheckCircle} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>24h Uptime</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>100%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>7d Uptime</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>99.99%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>30d Uptime</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>99.96%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>90d Uptime</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>99.98%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Last Downtime</span>
                                        <span style={{ color: THEME.primary, fontWeight: 600 }}>12d 3h</span>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="ERROR TRENDS" icon={AlertTriangle} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart
                                        data={demoData.qps.map((d) => ({
                                            ...d,
                                            errors: Math.max(0, Math.random() * 1 - 0.5),
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} style={{ fontSize: 9 }} />
                                        <YAxis stroke={THEME.textDim} style={{ fontSize: 9 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="errors"
                                            stroke={THEME.warning}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="REPLICATION STATUS" icon={GitBranch} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span style={{ color: THEME.textDim }}>Master</span>
                                        <StatusBadge label="Healthy" color={THEME.success} />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span style={{ color: THEME.textDim }}>Slave-1</span>
                                        <StatusBadge label="Synced" color={THEME.success} />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span style={{ color: THEME.textDim }}>Slave-2</span>
                                        <StatusBadge label="Synced" color={THEME.success} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: THEME.textDim }}>Max Lag</span>
                                        <span style={{ color: THEME.success, fontWeight: 600 }}>0.22s</span>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* Backup & Recovery */}
                        <Panel title="BACKUP STATUS & RECOVERY" icon={Archive} accentColor={THEME.primary}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: THEME.textMuted,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        FULL BACKUPS
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Daily</span>
                                            <span style={{ color: THEME.success }}>4</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Weekly</span>
                                            <span style={{ color: THEME.success }}>8</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Monthly</span>
                                            <span style={{ color: THEME.success }}>12</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Verified</span>
                                            <StatusBadge label="100%" color={THEME.success} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: THEME.textMuted,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        INCREMENTAL
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Hourly</span>
                                            <span style={{ color: THEME.primary }}>48</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Size</span>
                                            <span style={{ color: THEME.primary }}>2.4 GB</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Retention</span>
                                            <span style={{ color: THEME.primary }}>30 days</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Last Run</span>
                                            <span style={{ color: THEME.primary }}>8m ago</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: THEME.textMuted,
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        RECOVERY
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>RTO</span>
                                            <span style={{ color: THEME.success, fontWeight: 600 }}>5 min</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>RPO</span>
                                            <span style={{ color: THEME.success, fontWeight: 600 }}>1 min</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Test Pass</span>
                                            <StatusBadge label="100%" color={THEME.success} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <span style={{ color: THEME.textDim }}>Last Test</span>
                                            <span style={{ color: THEME.success }}>3d ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        {/* Incident Log */}
                        <Panel title="INCIDENT LOG" icon={AlertCircle} accentColor={THEME.danger}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    {
                                        time: '12d 3h ago',
                                        incident: 'Brief connection timeout',
                                        duration: '4.2m',
                                        severity: 'warning',
                                    },
                                    {
                                        time: '18d 15h ago',
                                        incident: 'Slow query spike detected',
                                        duration: '12.5m',
                                        severity: 'warning',
                                    },
                                    {
                                        time: '26d 8h ago',
                                        incident: 'Replication lag spike',
                                        duration: '2.1m',
                                        severity: 'warning',
                                    },
                                    {
                                        time: '35d 2h ago',
                                        incident: 'Disk space warning',
                                        duration: 'resolved',
                                        severity: 'info',
                                    },
                                ].map((inc, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            fontSize: 10,
                                            paddingBottom: 8,
                                            borderBottom: i < 3 ? `1px solid ${THEME.gridDark}` : 'none',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <span style={{ color: THEME.textDim }}>{inc.time}</span>
                                            <span
                                                style={{
                                                    color: inc.severity === 'warning' ? THEME.warning : THEME.primary,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {inc.duration}
                                            </span>
                                        </div>
                                        <div style={{ color: THEME.textMuted }}>{inc.incident}</div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        {/* SLA Compliance */}
                        <Panel title="SLA COMPLIANCE" icon={Shield} accentColor={THEME.success}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                {[
                                    { sla: '99.9% Uptime', actual: '99.98%', status: 'success', pct: 100 },
                                    { sla: '5m MTTR', actual: '4.2m', status: 'success', pct: 116 },
                                    { sla: '1 Incident/mo', actual: '2 incidents', status: 'warning', pct: 50 },
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '10px',
                                            borderRadius: 8,
                                            background:
                                                s.status === 'success' ? `${THEME.success}08` : `${THEME.warning}08`,
                                        }}
                                    >
                                        <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                            {s.sla}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: THEME.textMain,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {s.actual}
                                        </div>
                                        <div
                                            style={{
                                                background: THEME.gridDark,
                                                borderRadius: 3,
                                                height: 4,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: s.status === 'success' ? THEME.success : THEME.warning,
                                                    height: '100%',
                                                    width: `${Math.min(s.pct, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           ALERTS & RULES SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'alerts') {
            if (itemKey === 'activeAlerts') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Active Alerts
                        </h1>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                            <MetricCard
                                icon={AlertCircle}
                                label="Critical"
                                value={demoData.alerts.critical}
                                color={THEME.danger}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Warnings"
                                value={demoData.alerts.warning}
                                color={THEME.warning}
                            />
                            <MetricCard icon={Info} label="Info" value={demoData.alerts.info} color={THEME.primary} />
                            <MetricCard
                                icon={CheckCircle}
                                label="Resolved"
                                value={demoData.alerts.resolved}
                                color={THEME.success}
                            />
                        </div>
                        <Panel title="ALERTS" icon={Bell} accentColor={THEME.danger}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {demoData.alertList.map((alert, i) => (
                                    <AlertRow key={i} {...alert} />
                                ))}
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'alertRules') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Alert Rules
                        </h1>
                        <Panel title="CONFIGURED RULES" icon={Shield} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                18 active rules configured. Trigger thresholds are customizable.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'correlation') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Alert Correlation
                        </h1>
                        <Panel title="CORRELATIONS" icon={Network} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Analyzing root causes across multiple alert sources.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           QUERY ANALYSIS SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'query') {
            if (itemKey === 'queryOptimizer') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Query Optimizer
                        </h1>
                        <Panel title="OPTIMIZATION SUGGESTIONS" icon={Zap} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Analyzing 14,240 queries for optimization opportunities.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'queryPlan') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Query Plan Viewer
                        </h1>
                        <Panel title="EXPLAIN ANALYZER" icon={Code} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Visualizing execution plans for slow queries.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'planRegression') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Plan Regression
                        </h1>
                        <Panel title="REGRESSION DETECTION" icon={AlertTriangle} accentColor={THEME.warning}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Monitoring execution plan changes and performance impact.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'indexes') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Indexes
                        </h1>
                        <Panel title="INDEX ANALYSIS" icon={Database} accentColor={THEME.primary}>
                            <DataTable
                                headers={['Table', 'Index', 'Size', 'Efficiency']}
                                rows={demoData.indexes.map((idx) => [idx.table, idx.name, idx.size, idx.efficiency])}
                            />
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'bloatAnalysis') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Table Bloat Analysis
                        </h1>
                        <Panel title="BLOAT DETECTION" icon={HardDrive} accentColor={THEME.warning}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Identifying fragmented tables and recommending OPTIMIZE.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'tableAnalysis') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Table Analysis
                        </h1>
                        <Panel title="TABLE STATISTICS" icon={Database} accentColor={THEME.success}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Detailed row counts, sizes, and usage patterns.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           SCHEMA & DATA SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'schema') {
            if (itemKey === 'schemaBrowser') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Schema Browser
                        </h1>
                        <Panel title="SCHEMA OBJECTS" icon={Layers} accentColor={THEME.success}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Browse tables, views, stored procedures, and functions.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'migrations') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Schema & Migrations
                        </h1>
                        <Panel title="MIGRATION HISTORY" icon={GitBranch} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Track and manage schema changes across environments.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'schemaViz') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Schema Visualizer
                        </h1>
                        <Panel title="VISUAL SCHEMA MAP" icon={Network} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Interactive diagram of table relationships and constraints.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'tableDeps') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Table Dependencies
                        </h1>
                        <Panel title="DEPENDENCY GRAPH" icon={Network} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Understand foreign key relationships and data flows.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'chartBuilder') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Chart Builder
                        </h1>
                        <Panel title="CUSTOM VISUALIZATIONS" icon={BarChart3} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Build custom charts from your database queries.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           INFRASTRUCTURE SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'infra') {
            if (itemKey === 'connPool') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Connection Pool
                        </h1>
                        <Panel title="POOL CONFIGURATION" icon={Network} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Managing MySQL connection pooling and lifecycle.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'poolMetrics') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Pool Metrics
                        </h1>
                        <Panel title="CONNECTION POOL STATS" icon={Network} accentColor={THEME.warning}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Real-time metrics on connection usage and performance.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'replication') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Replication & Binlog
                        </h1>
                        <Panel title="REPLICATION STATUS" icon={GitBranch} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Master-Slave replication monitoring and GTID tracking.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'checkpoints') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Checkpoint Monitor
                        </h1>
                        <Panel title="CHECKPOINT STATUS" icon={CheckCircle} accentColor={THEME.success}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                InnoDB checkpoint progress and recovery state.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'maintenance') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Optimize & Maintenance
                        </h1>
                        <Panel title="MAINTENANCE TASKS" icon={Wrench} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Schedule and monitor table optimization and defragmentation.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'capacity') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Capacity Planning
                        </h1>
                        <Panel title="GROWTH PROJECTIONS" icon={TrendingUp} accentColor={THEME.warning}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Forecast storage and resource needs based on trends.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'backup') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Backup & Recovery
                        </h1>
                        <Panel title="BACKUP MANAGEMENT" icon={Archive} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Full, incremental, and differential backup scheduling.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           SECURITY SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'security') {
            if (itemKey === 'secCompliance') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Security & Compliance
                        </h1>
                        <Panel title="SECURITY STATUS" icon={Shield} accentColor={THEME.success}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Audit logs, user permissions, and compliance reporting.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           OBSERVABILITY SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'observability') {
            if (itemKey === 'obsHub') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Observability Hub
                        </h1>
                        <Panel title="INTEGRATED MONITORING" icon={Eye} accentColor={THEME.warning}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Centralized view across all observability platforms.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'cloudwatch') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            CloudWatch
                        </h1>
                        <Panel title="AWS CLOUDWATCH" icon={Cloud} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                AWS metrics, logs, and alarms integration.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'logPatterns') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Log Pattern Analysis
                        </h1>
                        <Panel title="PATTERN DETECTION" icon={FileText} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                AI-powered analysis of MySQL error and slow logs.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'otel') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            OpenTelemetry
                        </h1>
                        <Panel title="OTEL TRACES" icon={Radio} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Distributed tracing and instrumentation data.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'k8s') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Kubernetes
                        </h1>
                        <Panel title="K8S INTEGRATION" icon={Anchor} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Pod health, resource allocation, and deployment metrics.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'statusPage') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Status Page
                        </h1>
                        <Panel title="PUBLIC STATUS" icon={Radio} accentColor={THEME.success}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Service status communication and incident timeline.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'aiMonitoring') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            AI Monitoring
                        </h1>
                        <Panel title="ML-POWERED INSIGHTS" icon={Zap} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Anomaly detection and predictive alerting powered by ML.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        /* ═══════════════════════════════════════════════════════════════════════════
           DEVELOPER TOOLS SECTION
           ═══════════════════════════════════════════════════════════════════════════ */
        if (sectionKey === 'dev') {
            if (itemKey === 'sqlConsole') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            SQL Console
                        </h1>
                        <Panel title="QUERY EDITOR" icon={Terminal} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Execute and debug SQL queries with syntax highlighting.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'apiTracing') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            API Tracing
                        </h1>
                        <Panel title="REQUEST TRACES" icon={Network} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Trace API calls and database requests end-to-end.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'repository') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Repository
                        </h1>
                        <Panel title="VERSION CONTROL" icon={GitBranch} accentColor={THEME.primary}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Manage schema and query repositories with Git integration.
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'aiAdvisor') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            AI Query Advisor
                        </h1>
                        <Panel title="AI-POWERED INSIGHTS" icon={Zap} accentColor={THEME.ai}>
                            <div style={{ fontSize: 12, color: THEME.textDim }}>
                                Get AI-powered recommendations for query optimization.
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <DemoLayout
            sections={sections}
            renderContent={renderContent}
            title="MySQL Demo"
            accentColor={THEME.primary}
            titleIcon={Database}
        />
    );
}

export default DemoMySQLTab;
