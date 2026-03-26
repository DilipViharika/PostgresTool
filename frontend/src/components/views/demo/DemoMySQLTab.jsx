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
                                className: 'dpg-stagger',
                            }}
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

                        <Panel title="Region Distribution" icon={Globe} accentColor={THEME.primary}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={demoData.connections}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis stroke={THEME.textDim} fontSize={11} />
                                        <Tooltip content={<ChartTip />} />
                                        <Bar dataKey="active" stackId="a" fill={THEME.primary} />
                                        <Bar dataKey="idle" stackId="a" fill={THEME.glassBorder} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>

                        <Panel title="Instance Status" icon={Eye} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="db-prod-1.us-east-1a" color={THEME.success} pulse />
                                <StatusBadge label="db-prod-2.us-east-1b" color={THEME.success} pulse />
                                <StatusBadge label="db-prod-3.us-east-1c" color={THEME.success} pulse />
                                <StatusBadge label="db-cache-1.us-west-2a" color={THEME.warning} />
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'database') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Database Overview
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Database}
                                label="Databases"
                                value={demoData.databases.length}
                                sub="4 active"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Layers}
                                label="Total Tables"
                                value="267"
                                sub="InnoDB: 203"
                                color={THEME.success}
                                trend={12}
                                trendUp={true}
                            />
                            <MetricCard
                                icon={Droplet}
                                label="Total Rows"
                                value="7.85M"
                                sub="Growing +2.3%"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Database Size"
                                value="107.5GB"
                                sub="+1.2GB/day"
                                color={THEME.warning}
                                trend={1.2}
                                trendUp={true}
                            />
                        </div>

                        <Panel title="Database Breakdown" icon={BarChart3} accentColor={THEME.primary}>
                            <DataTable
                                columns={[
                                    { key: 'name', label: 'Database', width: '25%' },
                                    { key: 'engine', label: 'Engine', width: '20%' },
                                    { key: 'tables', label: 'Tables', width: '15%', align: 'right' },
                                    { key: 'rows', label: 'Rows', width: '20%', align: 'right', mono: true },
                                    { key: 'size', label: 'Size', width: '20%', align: 'right', mono: true },
                                ]}
                                rows={demoData.databases}
                                accentColor={THEME.primary}
                            />
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'performance') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Performance
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Zap}
                                label="QPS"
                                value="1,240"
                                sub="Peak: 1,680"
                                color={THEME.primary}
                                spark={demoData.qps.map((d) => d.value)}
                                trend={3.2}
                                trendUp={true}
                            />
                            <MetricCard
                                icon={RefreshCw}
                                label="TPS"
                                value="840"
                                sub="Last hour"
                                color={THEME.success}
                                spark={demoData.tps.map((d) => d.value)}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Avg Latency"
                                value="2.3ms"
                                sub="P95: 8.1ms"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Query Cache"
                                value="0%"
                                sub="Deprecated"
                                color={THEME.warning}
                                warn={true}
                            />
                        </div>

                        <Panel title="QPS & TPS Trend (24h)" icon={BarChart3} accentColor={THEME.primary}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={demoData.qps}>
                                        <defs>
                                            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis stroke={THEME.textDim} fontSize={11} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            fill="url(#grad1)"
                                            stroke={THEME.primary}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>

                        <Panel title="Connection Activity (24h)" icon={Network} accentColor={THEME.primary}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={demoData.connections}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis stroke={THEME.textDim} fontSize={11} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend wrapperStyle={{ paddingTop: 12 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="active"
                                            stroke={THEME.success}
                                            name="Active Connections"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="idle"
                                            stroke={THEME.textDim}
                                            name="Idle Connections"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'resources') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Resources
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Cpu}
                                label="CPU Usage"
                                value="42%"
                                sub="4 cores @ 2.4GHz"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Memory"
                                value="73%"
                                sub="24GB installed"
                                color={THEME.warning}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Gauge}
                                label="Disk I/O"
                                value="28%"
                                sub="IOPS: 3.2k/s"
                                color={THEME.success}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Network}
                                label="Network"
                                value="15%"
                                sub="1Gbps link"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                        </div>

                        <Panel title="Buffer Pool Stats" icon={Droplet} accentColor={THEME.primary}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: THEME.textDim,
                                                marginBottom: 8,
                                            }}
                                        >
                                            Buffer Pool Usage
                                        </div>
                                        <RingGauge value={demoData.innodb.bufferPoolUsage} color={THEME.primary} />
                                    </div>
                                    <div style={{ fontSize: 12, color: THEME.textMain, fontFamily: THEME.fontMono }}>
                                        {demoData.innodb.bufferPoolUsage.toFixed(1)}% of 8GB
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: THEME.textDim,
                                                marginBottom: 8,
                                            }}
                                        >
                                            Hit Ratio
                                        </div>
                                        <RingGauge value={demoData.innodb.readHits} color={THEME.success} />
                                    </div>
                                    <div style={{ fontSize: 12, color: THEME.textMain, fontFamily: THEME.fontMono }}>
                                        {demoData.innodb.readHits.toFixed(1)}% read hits
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Resource Allocation" icon={Settings} accentColor={THEME.primary}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                <LiveMetric
                                    icon={Cpu}
                                    label="CPU"
                                    value="42%"
                                    unit="of 400%"
                                    color={THEME.primary}
                                    progress={42}
                                />
                                <LiveMetric
                                    icon={HardDrive}
                                    label="Memory"
                                    value="17.5GB"
                                    unit="of 24GB"
                                    color={THEME.warning}
                                    progress={73}
                                />
                                <LiveMetric
                                    icon={Gauge}
                                    label="Temp Table Space"
                                    value="1.2GB"
                                    unit="of 10GB"
                                    color={THEME.success}
                                    progress={12}
                                />
                                <LiveMetric
                                    icon={Network}
                                    label="Max Connections"
                                    value="38"
                                    unit="of 200"
                                    color={THEME.success}
                                    progress={19}
                                />
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'reliability') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Reliability
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={CheckCircle}
                                label="Uptime"
                                value="99.97%"
                                sub="28 days"
                                color={THEME.success}
                                spark={Array.from({ length: 12 }, () => 99 + Math.random() * 1)}
                            />
                            <MetricCard
                                icon={AlertCircle}
                                label="Incidents (30d)"
                                value="2"
                                sub="Both resolved"
                                color={THEME.success}
                                trend={-50}
                                trendUp={false}
                            />
                            <MetricCard
                                icon={Clock}
                                label="MTTR"
                                value="8.2m"
                                sub="Last incident"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={RefreshCw}
                                label="Backup Status"
                                value="OK"
                                sub="Last: 14s ago"
                                color={THEME.success}
                            />
                        </div>

                        <Panel title="Replication Health" icon={Anchor} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Replica Lag</span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: THEME.success,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        0.3 seconds
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Connected Replicas</span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: THEME.success,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        2 / 2
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>GTID Status</span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: THEME.success,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        Synchronized
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Binlog Position</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        mysql-bin.000142:1247890
                                    </span>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Error Rate (24h)" icon={AlertTriangle} accentColor={THEME.danger}>
                            <div style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={generateChartData(24).map((d, i) => ({
                                            ...d,
                                            value: Math.max(0, Math.random() * 5 - 2),
                                        }))}
                                    >
                                        <defs>
                                            <linearGradient id="gradErr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.3} />
                                                <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis stroke={THEME.textDim} fontSize={11} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            fill="url(#gradErr)"
                                            stroke={THEME.danger}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={AlertCircle}
                                label="Critical"
                                value={demoData.alerts.critical}
                                color={THEME.danger}
                                warn={true}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Warning"
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

                        <Panel title="Alert Timeline" icon={Clock} accentColor={THEME.danger}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {demoData.alertList.map((alert, idx) => (
                                    <AlertRow
                                        key={idx}
                                        severity={alert.severity}
                                        title={alert.title}
                                        time={alert.time}
                                        source={alert.source}
                                        color={alert.color}
                                    />
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Alert Breakdown" icon={BarChart3} accentColor={THEME.danger}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Critical', value: 1, fill: THEME.danger },
                                                { name: 'Warning', value: 4, fill: THEME.warning },
                                                { name: 'Info', value: 8, fill: THEME.primary },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            dataKey="value"
                                        >
                                            <Cell fill={THEME.danger} />
                                            <Cell fill={THEME.warning} />
                                            <Cell fill={THEME.primary} />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
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
                        <Panel title="Active Rules" icon={Shield} accentColor={THEME.danger}>
                            <DataTable
                                columns={[
                                    { key: 'rule', label: 'Rule Name', width: '30%' },
                                    { key: 'condition', label: 'Condition', width: '30%' },
                                    { key: 'severity', label: 'Severity', width: '15%' },
                                    { key: 'status', label: 'Status', width: '15%' },
                                    { key: 'evaluations', label: 'Eval/Day', width: '10%', align: 'right' },
                                ]}
                                rows={[
                                    {
                                        rule: 'Buffer Pool Usage High',
                                        condition: '{' > '}75%',
                                        severity: 'Critical',
                                        status: 'Enabled',
                                        evaluations: '1440',
                                    },
                                    {
                                        rule: 'Replication Lag',
                                        condition: '{' > '}5s',
                                        severity: 'Warning',
                                        status: 'Enabled',
                                        evaluations: '1440',
                                    },
                                    {
                                        rule: 'Slow Query Detected',
                                        condition: '{' > '}1s',
                                        severity: 'Warning',
                                        status: 'Enabled',
                                        evaluations: '3600',
                                    },
                                    {
                                        rule: 'Connection Pool Saturation',
                                        condition: '{' > '}80%',
                                        severity: 'Warning',
                                        status: 'Enabled',
                                        evaluations: '1440',
                                    },
                                    {
                                        rule: 'Disk Space Warning',
                                        condition: '{' > '}85%',
                                        severity: 'Critical',
                                        status: 'Enabled',
                                        evaluations: '1440',
                                    },
                                ]}
                                accentColor={THEME.danger}
                            />
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
                        <Panel title="Incident Clusters (30d)" icon={Network} accentColor={THEME.danger}>
                            <DataTable
                                columns={[
                                    { key: 'startTime', label: 'Start Time', width: '20%' },
                                    { key: 'duration', label: 'Duration', width: '15%' },
                                    { key: 'alerts', label: 'Alert Count', width: '15%', align: 'right' },
                                    { key: 'impact', label: 'Impact', width: '20%' },
                                    { key: 'rootCause', label: 'Root Cause', width: '30%' },
                                ]}
                                rows={[
                                    {
                                        startTime: '2024-03-24 14:32:18',
                                        duration: '8m 24s',
                                        alerts: '7',
                                        impact: 'Queries +45ms',
                                        rootCause: 'InnoDB buffer pool pressure',
                                    },
                                    {
                                        startTime: '2024-03-22 09:15:42',
                                        duration: '2m 17s',
                                        alerts: '4',
                                        impact: 'Replication lag +12s',
                                        rootCause: 'Binlog flush spike',
                                    },
                                ]}
                                accentColor={THEME.danger}
                            />
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Zap}
                                label="Top Query"
                                value="1.84M"
                                sub="calls/day"
                                color={THEME.ai}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Avg Execute Time"
                                value="1.24ms"
                                sub="P95: 2.8ms"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Slow Queries"
                                value="127"
                                sub="Last 24h"
                                color={THEME.warning}
                                trend={-8.2}
                                trendUp={false}
                            />
                        </div>

                        <Panel title="Top Queries by Execution Time" icon={BarChart3} accentColor={THEME.ai}>
                            <DataTable
                                columns={[
                                    { key: 'query', label: 'Query', width: '40%' },
                                    { key: 'calls', label: 'Calls', width: '15%', align: 'right' },
                                    { key: 'avgTime', label: 'Avg Time', width: '15%', align: 'right', mono: true },
                                    { key: 'execTime', label: 'Exec %', width: '15%', align: 'right' },
                                    { key: 'maxTime', label: 'Max Time', width: '15%', align: 'right', mono: true },
                                ]}
                                rows={demoData.topQueries}
                                accentColor={THEME.ai}
                            />
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
                        <Panel
                            title="EXPLAIN for: SELECT * FROM orders WHERE user_id = ?"
                            icon={Eye}
                            accentColor={THEME.ai}
                        >
                            <div
                                style={{
                                    fontFamily: THEME.fontMono,
                                    fontSize: 12,
                                    color: THEME.textMain,
                                    lineHeight: 1.6,
                                }}
                            >
                                <div style={{ color: THEME.textDim, marginBottom: 12 }}>{'{'}</div>
                                <div style={{ paddingLeft: 20 }}>
                                    <div>{'  "query_block": {'}</div>
                                    <div style={{ paddingLeft: 20 }}>
                                        <div>{'  "select_id": 1,'}</div>
                                        <div>{'  "table": {'}</div>
                                        <div style={{ paddingLeft: 20 }}>
                                            <div>{'  "table_name": "orders",'}</div>
                                            <div>{'  "access_type": "ref",'}</div>
                                            <div>{'  "possible_keys": ["idx_orders_user_id"],'}</div>
                                            <div>{'  "key": "idx_orders_user_id",'}</div>
                                            <div>{'  "used_key_parts": ["user_id"],'}</div>
                                            <div>{'  "key_length": "8",'}</div>
                                            <div>{'  "rows_examined": 48,'}</div>
                                            <div>{'  "rows_produced": 48,'}</div>
                                            <div>{'  "filtered": "100",'}</div>
                                            <div>{'  "cost": "9.60"'}</div>
                                        </div>
                                        <div>{'  }'}</div>
                                    </div>
                                    <div>{'  }'}</div>
                                </div>
                                <div style={{ color: THEME.textDim }}>{'}'}</div>
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'planRegression') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Plan Regression Analysis
                        </h1>
                        <Panel title="Plan Changes (Last 7 Days)" icon={TrendingUp} accentColor={THEME.ai}>
                            <DataTable
                                columns={[
                                    { key: 'query', label: 'Query', width: '35%' },
                                    { key: 'oldPlan', label: 'Previous Plan', width: '20%' },
                                    { key: 'newPlan', label: 'Current Plan', width: '20%' },
                                    { key: 'change', label: 'Cost Change', width: '15%', align: 'right' },
                                    { key: 'severity', label: 'Impact', width: '10%' },
                                ]}
                                rows={[
                                    {
                                        query: 'SELECT ... FROM users',
                                        oldPlan: 'Index scan',
                                        newPlan: 'Full table scan',
                                        change: '+45%',
                                        severity: 'High',
                                    },
                                ]}
                                accentColor={THEME.ai}
                            />
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'indexes') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Index Analysis
                        </h1>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Layers}
                                label="Total Indexes"
                                value="287"
                                sub="36 unused"
                                color={THEME.ai}
                                warn={true}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Index Size"
                                value="18.4GB"
                                sub="14.2% of data"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={Zap}
                                label="Avg Efficiency"
                                value="87%"
                                sub="12 {'>'}90%"
                                color={THEME.success}
                            />
                        </div>

                        <Panel title="Index Metrics" icon={BarChart3} accentColor={THEME.ai}>
                            <DataTable
                                columns={[
                                    { key: 'table', label: 'Table', width: '15%' },
                                    { key: 'name', label: 'Index Name', width: '25%' },
                                    { key: 'columns', label: 'Columns', width: '20%' },
                                    { key: 'size', label: 'Size', width: '15%', align: 'right', mono: true },
                                    {
                                        key: 'cardinality',
                                        label: 'Cardinality',
                                        width: '12%',
                                        align: 'right',
                                        mono: true,
                                    },
                                    { key: 'efficiency', label: 'Efficiency', width: '13%', align: 'right' },
                                ]}
                                rows={demoData.indexes}
                                accentColor={THEME.ai}
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
                        <Panel title="Tables with High Bloat" icon={AlertTriangle} accentColor={THEME.warning}>
                            <DataTable
                                columns={[
                                    { key: 'table', label: 'Table', width: '20%' },
                                    { key: 'size', label: 'Actual Size', width: '18%', align: 'right', mono: true },
                                    { key: 'optimal', label: 'Optimal Size', width: '18%', align: 'right', mono: true },
                                    { key: 'overhead', label: 'Overhead', width: '16%', align: 'right' },
                                    { key: 'recommendation', label: 'Recommendation', width: '28%' },
                                ]}
                                rows={[
                                    {
                                        table: 'transactions',
                                        size: '24.6 GB',
                                        optimal: '18.2 GB',
                                        overhead: '6.4 GB (26%)',
                                        recommendation: 'OPTIMIZE TABLE',
                                    },
                                    {
                                        table: 'audit_logs',
                                        size: '12.1 GB',
                                        optimal: '9.8 GB',
                                        overhead: '2.3 GB (19%)',
                                        recommendation: 'Archive old data',
                                    },
                                ]}
                                accentColor={THEME.warning}
                            />
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
                        <Panel title="Table Statistics" icon={BarChart3} accentColor={THEME.ai}>
                            <DataTable
                                columns={[
                                    { key: 'table', label: 'Table', width: '18%' },
                                    { key: 'rows', label: 'Rows', width: '14%', align: 'right', mono: true },
                                    {
                                        key: 'avgRowLen',
                                        label: 'Avg Row Len',
                                        width: '14%',
                                        align: 'right',
                                        mono: true,
                                    },
                                    { key: 'dataFree', label: 'Data Free', width: '14%', align: 'right', mono: true },
                                    { key: 'lastUpdate', label: 'Last Updated', width: '20%' },
                                    {
                                        key: 'autoIncrement',
                                        label: 'Next AI',
                                        width: '20%',
                                        align: 'right',
                                        mono: true,
                                    },
                                ]}
                                rows={[
                                    {
                                        table: 'orders',
                                        rows: '4,280,000',
                                        avgRowLen: '1,024',
                                        dataFree: '1,245,120',
                                        lastUpdate: '2024-03-26 14:32:18',
                                        autoIncrement: '4,280,145',
                                    },
                                    {
                                        table: 'users',
                                        rows: '840,000',
                                        avgRowLen: '512',
                                        dataFree: '0',
                                        lastUpdate: '2024-03-26 13:45:22',
                                        autoIncrement: '840,026',
                                    },
                                ]}
                                accentColor={THEME.ai}
                            />
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
                        <Panel title="Databases & Objects" icon={Database} accentColor={THEME.success}>
                            <DataTable
                                columns={[
                                    { key: 'name', label: 'Database', width: '20%' },
                                    { key: 'tables', label: 'Tables', width: '12%', align: 'right' },
                                    { key: 'views', label: 'Views', width: '12%', align: 'right' },
                                    { key: 'procedures', label: 'Procedures', width: '14%', align: 'right' },
                                    { key: 'functions', label: 'Functions', width: '12%', align: 'right' },
                                    { key: 'triggers', label: 'Triggers', width: '12%', align: 'right' },
                                    { key: 'size', label: 'Size', width: '18%', align: 'right', mono: true },
                                ]}
                                rows={demoData.schema}
                                accentColor={THEME.success}
                            />
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
                        <Panel title="Recent Migrations" icon={GitBranch} accentColor={THEME.success}>
                            <DataTable
                                columns={[
                                    { key: 'id', label: 'Migration ID', width: '18%', mono: true },
                                    { key: 'description', label: 'Description', width: '35%' },
                                    { key: 'appliedAt', label: 'Applied At', width: '22%' },
                                    { key: 'duration', label: 'Duration', width: '12%', align: 'right' },
                                    { key: 'status', label: 'Status', width: '13%' },
                                ]}
                                rows={[
                                    {
                                        id: '20240326_001',
                                        description: 'Add user_preferences table',
                                        appliedAt: '2024-03-26 10:15:32',
                                        duration: '2.4s',
                                        status: 'Success',
                                    },
                                    {
                                        id: '20240325_002',
                                        description: 'Create index on orders.created_at',
                                        appliedAt: '2024-03-25 08:42:18',
                                        duration: '18.7s',
                                        status: 'Success',
                                    },
                                ]}
                                accentColor={THEME.success}
                            />
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
                        <Panel title="ER Diagram: Production DB" icon={Network} accentColor={THEME.success}>
                            <div
                                style={{
                                    height: 400,
                                    background: `${THEME.glass}`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: THEME.textDim,
                                    fontSize: 14,
                                }}
                            >
                                Interactive ER diagram would render here
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
                        <Panel title="Dependency Graph" icon={Network} accentColor={THEME.success}>
                            <div
                                style={{
                                    height: 400,
                                    background: `${THEME.glass}`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: THEME.textDim,
                                    fontSize: 14,
                                }}
                            >
                                Dependency graph would render here
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
                        <Panel title="Build Custom Charts" icon={BarChart3} accentColor={THEME.success}>
                            <div
                                style={{
                                    height: 300,
                                    background: `${THEME.glass}`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: THEME.textDim,
                                    fontSize: 14,
                                }}
                            >
                                Chart builder UI would render here
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Network}
                                label="Total Connections"
                                value={demoData.poolStatus.maxConnections}
                                sub="Max: 200"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Activity}
                                label="Active"
                                value={demoData.poolStatus.activeConnections}
                                sub="19% utilized"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Idle"
                                value={demoData.poolStatus.idleConnections}
                                sub="Available"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Avg Wait Time"
                                value={demoData.poolStatus.connectionWaitTime}
                                sub="p95: 1.2ms"
                                color={THEME.success}
                            />
                        </div>

                        <Panel title="Connection Pool Status" icon={Eye} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <LiveMetric
                                    icon={Network}
                                    label="Active Connections"
                                    value={demoData.poolStatus.activeConnections}
                                    unit={`of ${demoData.poolStatus.maxConnections}`}
                                    color={THEME.success}
                                    progress={19}
                                />
                                <LiveMetric
                                    icon={Clock}
                                    label="Idle Connections"
                                    value={demoData.poolStatus.idleConnections}
                                    unit={`of ${demoData.poolStatus.maxConnections}`}
                                    color={THEME.primary}
                                    progress={14}
                                />
                                <LiveMetric
                                    icon={AlertCircle}
                                    label="Connection Errors"
                                    value={demoData.poolStatus.connectionErrors}
                                    unit="last 24h"
                                    color={THEME.warning}
                                    progress={0}
                                />
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
                        <Panel title="Connection Lifecycle (24h)" icon={BarChart3} accentColor={THEME.primary}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={demoData.connections}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis stroke={THEME.textDim} fontSize={11} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="active" stroke={THEME.success} name="Active" />
                                        <Line type="monotone" dataKey="idle" stroke={THEME.textDim} name="Idle" />
                                    </LineChart>
                                </ResponsiveContainer>
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={Anchor}
                                label="Replicas"
                                value={demoData.replicationStatus.slaveCount}
                                sub="All connected"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Replication Lag"
                                value="0.3s"
                                sub="Normal"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={FileText}
                                label="Binlog Files"
                                value={demoData.binlog.length}
                                sub="612 MB total"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={CheckCircle}
                                label="GTID Mode"
                                value="ON"
                                sub="Synchronized"
                                color={THEME.success}
                            />
                        </div>

                        <Panel title="Replication Status" icon={Network} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Role</span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: THEME.success,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {demoData.replicationStatus.role}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>GTID Executed</span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 500,
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {demoData.replicationStatus.gtidExecuted}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Master Log File</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {demoData.replicationStatus.masterLogFile}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Master Log Position</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {demoData.replicationStatus.masterLogPos}
                                    </span>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Binlog Files" icon={Archive} accentColor={THEME.primary}>
                            <DataTable
                                columns={[
                                    { key: 'file', label: 'File', width: '25%', mono: true },
                                    { key: 'position', label: 'Position', width: '20%', align: 'right', mono: true },
                                    { key: 'size', label: 'Size', width: '18%', align: 'right', mono: true },
                                    { key: 'age', label: 'Age', width: '37%' },
                                ]}
                                rows={demoData.binlog}
                                accentColor={THEME.primary}
                            />
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
                        <Panel title="Recent Checkpoints" icon={Radio} accentColor={THEME.primary}>
                            <DataTable
                                columns={[
                                    { key: 'timestamp', label: 'Timestamp', width: '22%' },
                                    { key: 'duration', label: 'Duration', width: '15%', align: 'right' },
                                    {
                                        key: 'pagesWritten',
                                        label: 'Pages Written',
                                        width: '18%',
                                        align: 'right',
                                        mono: true,
                                    },
                                    { key: 'reason', label: 'Reason', width: '22%' },
                                    { key: 'status', label: 'Status', width: '23%' },
                                ]}
                                rows={[
                                    {
                                        timestamp: '2024-03-26 14:32:18',
                                        duration: '2.3s',
                                        pagesWritten: '124,586',
                                        reason: 'Scheduled',
                                        status: 'Completed',
                                    },
                                    {
                                        timestamp: '2024-03-26 12:00:02',
                                        duration: '1.8s',
                                        pagesWritten: '98,420',
                                        reason: 'Threshold',
                                        status: 'Completed',
                                    },
                                ]}
                                accentColor={THEME.primary}
                            />
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
                        <Panel title="Optimize & Maintenance Jobs" icon={Settings} accentColor={THEME.primary}>
                            <DataTable
                                columns={[
                                    { key: 'table', label: 'Table', width: '18%' },
                                    { key: 'operation', label: 'Operation', width: '15%' },
                                    { key: 'lastRun', label: 'Last Run', width: '22%' },
                                    { key: 'duration', label: 'Duration', width: '12%', align: 'right' },
                                    { key: 'nextScheduled', label: 'Next Scheduled', width: '33%' },
                                ]}
                                rows={[
                                    {
                                        table: 'orders',
                                        operation: 'OPTIMIZE TABLE',
                                        lastRun: '2024-03-24 02:15:18',
                                        duration: '34.2s',
                                        nextScheduled: '2024-03-31 02:00:00',
                                    },
                                    {
                                        table: 'transactions',
                                        operation: 'OPTIMIZE TABLE',
                                        lastRun: '2024-03-23 02:45:32',
                                        duration: '78.5s',
                                        nextScheduled: '2024-03-30 02:00:00',
                                    },
                                ]}
                                accentColor={THEME.primary}
                            />
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={HardDrive}
                                label="Growth Rate"
                                value="+1.2GB"
                                sub="per day"
                                color={THEME.warning}
                                trend={0.3}
                                trendUp={true}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Runway"
                                value="284"
                                sub="days until full"
                                color={THEME.primary}
                                spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            />
                            <MetricCard
                                icon={Cpu}
                                label="CPU Headroom"
                                value="58%"
                                sub="Before throttle"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Network}
                                label="Network Headroom"
                                value="85%"
                                sub="1Gbps link"
                                color={THEME.success}
                            />
                        </div>

                        <Panel title="Storage Forecast (90 Days)" icon={TrendingUp} accentColor={THEME.warning}>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={generateChartData(30).map((d, i) => ({
                                            ...d,
                                            used: 312 + i * 1.2,
                                            available: 688 - i * 1.2,
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={11} />
                                        <YAxis
                                            stroke={THEME.textDim}
                                            fontSize={11}
                                            label={{ value: 'GB', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="used" stroke={THEME.primary} name="Used" />
                                        <Line
                                            type="monotone"
                                            dataKey="available"
                                            stroke={THEME.success}
                                            name="Available"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={CheckCircle}
                                label="Backup Status"
                                value="OK"
                                sub="Last: 14s ago"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Clock}
                                label="Full Backup"
                                value="Daily"
                                sub="02:00 UTC"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={RefreshCw}
                                label="Incremental"
                                value="Hourly"
                                sub="Next: 42s"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={HardDrive}
                                label="Retention"
                                value="30 days"
                                sub="3.2 TB stored"
                                color={THEME.primary}
                            />
                        </div>

                        <Panel title="Backup History" icon={Archive} accentColor={THEME.success}>
                            <DataTable
                                columns={[
                                    { key: 'type', label: 'Type', width: '12%' },
                                    { key: 'startTime', label: 'Start Time', width: '20%' },
                                    { key: 'duration', label: 'Duration', width: '12%', align: 'right' },
                                    { key: 'size', label: 'Size', width: '12%', align: 'right', mono: true },
                                    { key: 'status', label: 'Status', width: '12%' },
                                    { key: 'retention', label: 'Retention', width: '32%' },
                                ]}
                                rows={[
                                    {
                                        type: 'Full',
                                        startTime: '2024-03-26 02:00:00',
                                        duration: '4m 32s',
                                        size: '107.5 GB',
                                        status: 'Success',
                                        retention: 'Expires 2024-04-26',
                                    },
                                    {
                                        type: 'Incremental',
                                        startTime: '2024-03-26 01:00:00',
                                        duration: '1m 08s',
                                        size: '2.3 GB',
                                        status: 'Success',
                                        retention: 'Expires 2024-03-31',
                                    },
                                ]}
                                accentColor={THEME.success}
                            />
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard
                                icon={CheckCircle}
                                label="Security Score"
                                value="94"
                                sub="Excellent"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Lock}
                                label="Encryption"
                                value="TLS 1.3"
                                sub="Enabled"
                                color={THEME.success}
                            />
                            <MetricCard
                                icon={Users}
                                label="Active Users"
                                value="24"
                                sub="8 with elevated"
                                color={THEME.primary}
                            />
                            <MetricCard
                                icon={Eye}
                                label="Audit Logs"
                                value="2.4M"
                                sub="Last 30 days"
                                color={THEME.primary}
                            />
                        </div>

                        <Panel title="User Accounts" icon={Users} accentColor={THEME.success}>
                            <DataTable
                                columns={[
                                    { key: 'user', label: 'User', width: '20%' },
                                    { key: 'host', label: 'Host', width: '18%' },
                                    { key: 'privileges', label: 'Privileges', width: '25%' },
                                    { key: 'lastLogin', label: 'Last Login', width: '20%' },
                                    { key: 'status', label: 'Status', width: '17%' },
                                ]}
                                rows={[
                                    {
                                        user: 'root',
                                        host: 'localhost',
                                        privileges: 'ALL PRIVILEGES',
                                        lastLogin: '2024-03-26 14:32:18',
                                        status: 'Active',
                                    },
                                    {
                                        user: 'app_user',
                                        host: '10.0.%',
                                        privileges: 'SELECT, INSERT, UPDATE',
                                        lastLogin: '2024-03-26 14:31:05',
                                        status: 'Active',
                                    },
                                    {
                                        user: 'backup_user',
                                        host: '192.168.1.%',
                                        privileges: 'BACKUP, REPLICATION',
                                        lastLogin: '2024-03-26 02:00:32',
                                        status: 'Active',
                                    },
                                ]}
                                accentColor={THEME.success}
                            />
                        </Panel>

                        <Panel title="Compliance Status" icon={Shield} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="GDPR Compliant" color={THEME.success} pulse />
                                <StatusBadge label="SOC 2 Type II Certified" color={THEME.success} pulse />
                                <StatusBadge label="Encryption at Rest" color={THEME.success} pulse />
                                <StatusBadge label="Network Isolation" color={THEME.success} pulse />
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <MetricCard icon={Eye} label="Metrics" value="240+" sub="Real-time" color={THEME.warning} />
                            <MetricCard
                                icon={FileText}
                                label="Log Events"
                                value="8.2M"
                                sub="Last 24h"
                                color={THEME.primary}
                            />
                            <MetricCard icon={Radio} label="Traces" value="1.4M" sub="Sampled" color={THEME.primary} />
                            <MetricCard
                                icon={Code}
                                label="Alerts"
                                value="13"
                                sub="Active rules"
                                color={THEME.warning}
                            />
                        </div>

                        <Panel title="Observability Status" icon={Eye} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="Prometheus Scraping" color={THEME.success} pulse />
                                <StatusBadge label="ELK Stack" color={THEME.success} pulse />
                                <StatusBadge label="Jaeger Tracing" color={THEME.success} pulse />
                                <StatusBadge label="Grafana Dashboards" color={THEME.success} pulse />
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'cloudwatch') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            CloudWatch Integration
                        </h1>
                        <Panel title="CloudWatch Metrics Sync" icon={Radio} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Status</span>
                                    <StatusBadge label="Connected" color={THEME.success} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Last Sync</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: THEME.textMain,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        2024-03-26 14:32:18
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>Custom Metrics</span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: THEME.textMain,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        48
                                    </span>
                                </div>
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
                        <Panel title="Top Log Patterns" icon={FileText} accentColor={THEME.warning}>
                            <DataTable
                                columns={[
                                    { key: 'pattern', label: 'Pattern', width: '40%' },
                                    { key: 'count', label: 'Count', width: '15%', align: 'right', mono: true },
                                    { key: 'frequency', label: 'Frequency', width: '20%' },
                                    { key: 'severity', label: 'Severity', width: '25%' },
                                ]}
                                rows={[
                                    {
                                        pattern: '[Warning] Aborted connection',
                                        count: '234',
                                        frequency: '0.8/min',
                                        severity: 'Low',
                                    },
                                    {
                                        pattern: '[Note] Query time exceeded',
                                        count: '156',
                                        frequency: '0.5/min',
                                        severity: 'Low',
                                    },
                                ]}
                                accentColor={THEME.warning}
                            />
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
                        <Panel title="OTEL Instrumentation" icon={Code} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="OTEL Collector Active" color={THEME.success} pulse />
                                <StatusBadge label="Metrics Export Enabled" color={THEME.success} pulse />
                                <StatusBadge label="Traces Export Enabled" color={THEME.success} pulse />
                                <StatusBadge label="Logs Export Enabled" color={THEME.success} pulse />
                            </div>
                        </Panel>
                    </div>
                );
            }

            if (itemKey === 'k8s') {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                            Kubernetes Monitoring
                        </h1>
                        <Panel title="K8s Cluster Status" icon={Network} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="Cluster: prod-cluster-01" color={THEME.success} pulse />
                                <StatusBadge label="Nodes: 8 healthy" color={THEME.success} pulse />
                                <StatusBadge label="Pods: 124 running" color={THEME.success} pulse />
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
                        <Panel title="Public Status" icon={CheckCircle} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="All Systems Operational" color={THEME.success} pulse />
                                <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 8 }}>
                                    Last incident: 3 days ago (resolved)
                                </div>
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
                        <Panel title="AI Model Health" icon={Zap} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <StatusBadge label="Query Optimizer AI" color={THEME.success} pulse />
                                <StatusBadge label="Anomaly Detection" color={THEME.success} pulse />
                                <StatusBadge label="Performance Prediction" color={THEME.success} pulse />
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
                        <Panel title="SQL Editor" icon={Terminal} accentColor={THEME.primary}>
                            <div
                                style={{
                                    height: 400,
                                    background: `${THEME.glass}`,
                                    borderRadius: 8,
                                    padding: 16,
                                    fontFamily: THEME.fontMono,
                                    fontSize: 12,
                                    color: THEME.textMain,
                                    border: `1px solid ${THEME.glassBorder}`,
                                    overflow: 'auto',
                                }}
                            >
                                <div style={{ color: THEME.textDim }}>-- MySQL Console Ready</div>
                                <div style={{ color: THEME.textDim }}>-- Execute queries here</div>
                                <div style={{ marginTop: 16 }}>SELECT * FROM users LIMIT 10;</div>
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
                        <Panel title="Recent API Traces" icon={Radio} accentColor={THEME.primary}>
                            <DataTable
                                columns={[
                                    { key: 'traceId', label: 'Trace ID', width: '25%', mono: true },
                                    { key: 'endpoint', label: 'Endpoint', width: '25%' },
                                    { key: 'duration', label: 'Duration', width: '15%', align: 'right', mono: true },
                                    { key: 'status', label: 'Status', width: '12%', align: 'center' },
                                    { key: 'timestamp', label: 'Timestamp', width: '23%' },
                                ]}
                                rows={[
                                    {
                                        traceId: 'abc123def456',
                                        endpoint: 'GET /api/users/:id',
                                        duration: '24.3ms',
                                        status: '200',
                                        timestamp: '2024-03-26 14:32:18',
                                    },
                                ]}
                                accentColor={THEME.primary}
                            />
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
                        <Panel title="Connected Repositories" icon={GitBranch} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: THEME.textMain }}>main-db-schema</span>
                                    <span style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                                        github.com/org/repo
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: THEME.textMain }}>queries</span>
                                    <span style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                                        github.com/org/queries
                                    </span>
                                </div>
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
                        <Panel title="AI-Powered Query Optimization" icon={Zap} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div
                                    style={{
                                        padding: 12,
                                        background: `${THEME.ai}12`,
                                        borderRadius: 6,
                                        border: `1px solid ${THEME.ai}30`,
                                        color: THEME.ai,
                                        fontSize: 12,
                                    }}
                                >
                                    {'✨ AI Query Advisor'}
                                </div>
                                <div style={{ fontSize: 13, color: THEME.textMain, lineHeight: 1.6 }}>
                                    Analyze your query:
                                </div>
                                <div
                                    style={{
                                        height: 200,
                                        background: `${THEME.glass}`,
                                        borderRadius: 6,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        padding: 12,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 11,
                                        color: THEME.textDim,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    Paste your SQL query here for AI analysis
                                </div>
                            </div>
                        </Panel>
                    </div>
                );
            }
        }

        return <div style={{ padding: 20, color: THEME.textDim }}>No content available</div>;
    };

    return (
        <DemoLayout
            sections={sections}
            renderContent={renderContent}
            title="MySQL Demo"
            titleIcon={Database}
            accentColor={THEME.primary}
        />
    );
}

export default DemoMySQLTab;
