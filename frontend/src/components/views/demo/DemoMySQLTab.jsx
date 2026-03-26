import React, { useMemo } from 'react';
import {
    Database,
    TrendingUp,
    AlertCircle,
    Lock,
    Settings,
    Server,
    HardDrive,
    Zap,
    Users,
    FileText,
    Shield,
    Activity,
    Gauge,
    Clock,
    Eye,
    Code,
    ArrowRight,
    CheckCircle,
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
        const baseData = generateChartData(24);

        return {
            // OVERVIEW data
            executiveDashboard: {
                statusBadges: [
                    { label: 'Status', value: 'Operational', icon: CheckCircle, color: THEME.success },
                    { label: 'Environment', value: 'Production', icon: Server, color: THEME.primary },
                    { label: 'Version', value: 'MySQL 8.0.35', icon: Database, color: THEME.secondary },
                ],
                heroMetrics: [
                    { label: 'Uptime', value: '142d', unit: 'days', icon: Clock, trend: '+2.1%' },
                    { label: 'Threads Running', value: '18', unit: 'threads', icon: Activity, trend: '-0.5%' },
                    { label: 'Buffer Pool Hit', value: '99.7%', unit: 'ratio', icon: Zap, trend: '+0.2%' },
                    { label: 'QPS', value: '1.2K', unit: 'queries/sec', icon: TrendingUp, trend: '+12%' },
                    { label: 'Slow Queries', value: '42', unit: 'queries', icon: AlertCircle, trend: '-8%' },
                    { label: 'Aborted Conn', value: '3', unit: 'connections', icon: Server, trend: 'stable' },
                ],
                qpsTrend: baseData.map((d, i) => ({
                    ...d,
                    value: Math.floor(800 + Math.sin(i / 4) * 400 + Math.random() * 200),
                })),
                innodbHealth: [
                    { name: 'Buffer Pool', value: 96, color: THEME.primary },
                    { name: 'Redo Log', value: 73, color: THEME.secondary },
                    { name: 'Adaptive Hash', value: 68, color: THEME.success },
                ],
                binaryLogStatus: {
                    currentFile: 'mysql-bin.000847',
                    size: '2.1 GB',
                    position: '16,384,201',
                    purgedUntil: 'mysql-bin.000800',
                },
                threadActivity: {
                    idle: 152,
                    query: 18,
                    sleeping: 34,
                    connecting: 2,
                },
                tableCache: {
                    open: 1247,
                    hit: 99.8,
                    total: 1250,
                },
            },

            // InnoDB Status data
            innodbStatus: {
                bufferPoolPages: [
                    { name: 'Data Pages', value: 65536, color: THEME.primary },
                    { name: 'Free Pages', value: 16384, color: THEME.textMuted },
                    { name: 'Dirty Pages', value: 2048, color: THEME.warning },
                ],
                pendingIO: [
                    { type: 'Read', count: 2, avg: '1.2ms' },
                    { type: 'Write', count: 5, avg: '0.8ms' },
                    { type: 'Log Flush', count: 1, avg: '0.3ms' },
                ],
                rowOps: [
                    { op: 'Inserts', value: 45230, color: THEME.success },
                    { op: 'Updates', value: 128456, color: THEME.primary },
                    { op: 'Deletes', value: 12340, color: THEME.danger },
                    { op: 'Reads', value: 2156789, color: THEME.secondary },
                ],
            },

            // Alerts data
            alerts: {
                critical: 1,
                warning: 8,
                info: 24,
                resolved: 156,
                recentAlerts: [
                    {
                        id: 1,
                        severity: 'critical',
                        message: 'High memory usage (92%)',
                        time: '5m ago',
                        status: 'Active',
                    },
                    {
                        id: 2,
                        severity: 'warning',
                        message: 'Slow query detected (2.3s)',
                        time: '12m ago',
                        status: 'Active',
                    },
                    { id: 3, severity: 'warning', message: 'Replication lag > 10s', time: '24m ago', status: 'Active' },
                    { id: 4, severity: 'info', message: 'Backup completed', time: '2h ago', status: 'Resolved' },
                ],
                alertTrend: baseData.map((d, i) => ({
                    ...d,
                    critical: Math.max(0, Math.floor(Math.sin(i / 3) * 2 + 1)),
                    warning: Math.floor(Math.sin(i / 4 + 1) * 4 + 6),
                    info: Math.floor(Math.cos(i / 5) * 8 + 16),
                })),
            },

            // Query Analysis data
            slowQueries: [
                { id: 1, sql: 'SELECT * FROM orders WHERE user_id=?', execTime: 3.2, rowsExam: 145000 },
                { id: 2, sql: 'SELECT * FROM logs WHERE timestamp>?', execTime: 2.8, rowsExam: 89000 },
                { id: 3, sql: 'UPDATE inventory SET qty=? WHERE...', execTime: 2.1, rowsExam: 56000 },
            ],
            queryDigest: [
                { pattern: 'SELECT * FROM orders', freq: 1245, avgTime: 0.45 },
                { pattern: 'SELECT * FROM users WHERE id=?', freq: 3421, avgTime: 0.12 },
                { pattern: 'INSERT INTO logs VALUES', freq: 987, avgTime: 0.08 },
            ],
            indexStats: [
                { name: 'idx_orders_user', usage: 98765, cardinality: 450000, size: '12 MB' },
                { name: 'idx_users_email', usage: 45321, cardinality: 125000, size: '4 MB' },
                { name: 'idx_logs_timestamp', usage: 234000, cardinality: 1200000, size: '28 MB' },
            ],
            tableStats: [
                {
                    table: 'orders',
                    rows: 2500000,
                    dataSize: '450 MB',
                    indexSize: '120 MB',
                    reads: 450000,
                    writes: 12000,
                },
                { table: 'users', rows: 125000, dataSize: '18 MB', indexSize: '5 MB', reads: 234000, writes: 890 },
                {
                    table: 'logs',
                    rows: 15000000,
                    dataSize: '2.1 GB',
                    indexSize: '380 MB',
                    reads: 2100000,
                    writes: 45000,
                },
            ],
            queryProfiler: [
                { stage: 'Opening tables', duration: '0.02ms' },
                { stage: 'System lock', duration: '0.01ms' },
                { stage: 'Table lock', duration: '0.03ms' },
                { stage: 'Init', duration: '0.05ms' },
                { stage: 'Optimizing', duration: '0.04ms' },
                { stage: 'Statistics', duration: '0.06ms' },
                { stage: 'Preparing', duration: '0.03ms' },
                { stage: 'Executing', duration: '1.23ms' },
                { stage: 'Sending data', duration: '0.45ms' },
            ],

            // Schema & Data
            schemas: [
                { name: 'production', tables: 48, views: 12, procedures: 8, functions: 15 },
                { name: 'analytics', tables: 25, views: 18, procedures: 3, functions: 5 },
                { name: 'archive', tables: 156, views: 0, procedures: 0, functions: 0 },
            ],
            tableColumns: [
                { name: 'id', type: 'BIGINT', nullable: false, key: 'PRIMARY' },
                { name: 'user_id', type: 'BIGINT', nullable: false, key: 'MUL' },
                { name: 'order_date', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
                { name: 'total', type: 'DECIMAL(10,2)', nullable: false, key: null },
            ],
            foreignKeys: [
                { table: 'orders', column: 'user_id', refsTable: 'users', refsColumn: 'id' },
                { table: 'order_items', column: 'order_id', refsTable: 'orders', refsColumn: 'id' },
                { table: 'order_items', column: 'product_id', refsTable: 'products', refsColumn: 'id' },
            ],
            storedPrograms: [
                { name: 'sp_generate_reports', type: 'Procedure' },
                { name: 'fn_calculate_discount', type: 'Function' },
                { name: 'tr_update_inventory', type: 'Trigger' },
            ],

            // Infrastructure data
            connectionPool: {
                metrics: [
                    { label: 'Active', value: '18', icon: Activity, trend: '+2%' },
                    { label: 'Idle', value: '152', icon: Server, trend: '-1%' },
                    { label: 'Max Conn', value: '1000', icon: Users, trend: 'stable' },
                    { label: 'Aborted', value: '3', icon: AlertCircle, trend: '-5%' },
                ],
                trend: baseData.map((d, i) => ({
                    ...d,
                    active: Math.floor(10 + Math.sin(i / 5) * 8),
                    idle: Math.floor(140 + Math.cos(i / 4) * 20),
                })),
            },
            replication: {
                sourceData: baseData.map((d, i) => ({
                    ...d,
                    lag: Math.max(0, Math.sin(i / 6) * 15),
                })),
                gtidStatus: {
                    executed: 'a7b9f2c0-1a2b-11ec-81d3-0242ac110001:1-45823',
                    purged: 'a7b9f2c0-1a2b-11ec-81d3-0242ac110001:1-45000',
                    replicaLag: '2.3s',
                },
            },
            binlogs: {
                trend: baseData.map((d, i) => ({
                    ...d,
                    size: Math.floor(1000 + Math.sin(i / 3) * 500 + i * 20),
                })),
                status: {
                    current: 'mysql-bin.000847',
                    size: '2.1 GB',
                    purgedUntil: 'mysql-bin.000800',
                    retention: '7 days',
                },
            },
            threadPool: [
                { name: 'Idle', value: 8, color: THEME.success },
                { name: 'Active', value: 18, color: THEME.primary },
                { name: 'Waiting', value: 4, color: THEME.warning },
            ],
            bufferPoolMem: [
                { name: 'Data', value: 52, color: THEME.primary },
                { name: 'Dirty', value: 8, color: THEME.warning },
                { name: 'Free', value: 40, color: THEME.success },
            ],
            tablespaces: [
                { name: 'system', size: '100 MB', used: '92 MB', type: 'System' },
                { name: 'ibdata1', size: '5.0 GB', used: '4.8 GB', type: 'Data' },
                { name: 'temp_ibdata', size: '500 MB', used: '120 MB', type: 'Temporary' },
            ],
            backups: [
                { date: '2026-03-26 02:00', type: 'Full', status: 'Completed', duration: '12m', size: '850 MB' },
                { date: '2026-03-25 02:00', type: 'Full', status: 'Completed', duration: '11m', size: '847 MB' },
                { date: '2026-03-24 02:00', type: 'Full', status: 'Completed', duration: '13m', size: '842 MB' },
            ],

            // Security data
            users: [
                { name: 'app_user', host: '%.example.com', authMethod: 'mysql_native_password' },
                { name: 'replication', host: '192.168.1.%', authMethod: 'sha2_password' },
                { name: 'admin', host: 'localhost', authMethod: 'sha2_password' },
            ],
            sslStatus: {
                sslRatio: 87,
                certIssuer: 'CN=MySQL Server,O=Example Inc',
                certExpiry: '2026-12-15',
                tlsVersion: '1.3',
            },
            auditEvents: [
                { time: '2026-03-26 14:23', user: 'app_user@192.168.1.50', event: 'CONNECT', result: 'Success' },
                { time: '2026-03-26 14:22', user: 'admin@localhost', event: 'QUERY', result: 'Success' },
                { time: '2026-03-26 14:21', user: 'replication@192.168.1.10', event: 'CONNECT', result: 'Success' },
            ],

            // Observability data
            metrics: [
                { name: 'QPS', value: 1200, sparkline: [800, 950, 1100, 1200, 1050, 900, 1150] },
                { name: 'Latency', value: '2.3ms', sparkline: [2.5, 2.3, 2.1, 2.8, 2.2, 1.9, 2.3] },
                { name: 'Memory', value: '92%', sparkline: [85, 87, 89, 91, 92, 90, 92] },
            ],
            errors: [
                {
                    time: '2026-03-26 14:15',
                    level: 'ERROR',
                    message: 'InnoDB: Space for a new transaction log file could not be allocated',
                },
                {
                    time: '2026-03-26 13:42',
                    level: 'WARNING',
                    message: 'InnoDB: Retry attempt 3 for space allocation failed',
                },
                { time: '2026-03-26 12:30', level: 'ERROR', message: 'Slave: Duplicate entry in table users_unique' },
            ],

            // Developer Tools data
            recentQueries: [
                'SELECT * FROM orders WHERE user_id=42 LIMIT 100;',
                'UPDATE inventory SET qty=qty-1 WHERE product_id=? AND qty>0;',
                'SELECT COUNT(*) as cnt FROM logs WHERE DATE(created_at)=CURDATE();',
            ],
            migrations: [
                {
                    version: '20260315_001',
                    description: 'Add index to user_created_at',
                    status: 'Applied',
                    appliedAt: '2026-03-15 10:30',
                },
                {
                    version: '20260310_002',
                    description: 'Create orders_archive table',
                    status: 'Applied',
                    appliedAt: '2026-03-10 09:15',
                },
            ],
            tuningRecs: [
                {
                    issue: 'High buffer pool hit rate variance',
                    recommendation: 'Increase buffer pool size to 6GB',
                    priority: 'Medium',
                },
                {
                    issue: 'Replication lag spikes',
                    recommendation: 'Enable parallel replication with 4 workers',
                    priority: 'High',
                },
                {
                    issue: 'Missing index on logs.timestamp',
                    recommendation: 'CREATE INDEX idx_logs_ts ON logs(timestamp)',
                    priority: 'Critical',
                },
            ],
        };
    }, []);

    const sections = {
        overview: {
            label: 'Overview',
            icon: TrendingUp,
            items: {
                executiveDashboard: 'Executive Dashboard',
                innodbStatus: 'InnoDB Status',
                serverVariables: 'Server Variables',
                databases: 'Databases',
                performanceSchema: 'Performance Schema',
            },
        },
        alerts: {
            label: 'Alerts & Rules',
            icon: AlertCircle,
            items: {
                activeAlerts: 'Active Alerts',
                alertRules: 'Alert Rules',
                alertHistory: 'Alert History',
            },
        },
        queryAnalysis: {
            label: 'Query Analysis',
            icon: Eye,
            items: {
                slowQueries: 'Slow Query Log',
                queryDigest: 'Query Digest',
                explainAnalyzer: 'EXPLAIN Analyzer',
                indexStats: 'Index Statistics',
                tableStats: 'Table Statistics',
                queryProfiler: 'Query Profiler',
            },
        },
        schemaData: {
            label: 'Schema & Data',
            icon: Database,
            items: {
                schemaBrowser: 'Schema Browser',
                tableInspector: 'Table Inspector',
                foreignKeys: 'Foreign Keys',
                storedPrograms: 'Stored Programs',
            },
        },
        infrastructure: {
            label: 'Infrastructure',
            icon: Server,
            items: {
                connectionPool: 'Connection Pool',
                replication: 'Replication',
                binlogs: 'Binary Logs',
                threadPool: 'Thread Pool',
                bufferPool: 'Buffer Pool',
                tablespaces: 'Tablespaces',
                backups: 'Backups',
            },
        },
        security: {
            label: 'Security',
            icon: Shield,
            items: {
                userAccounts: 'User Accounts',
                privileges: 'Privileges',
                sslStatus: 'SSL Status',
                auditLog: 'Audit Log',
            },
        },
        observability: {
            label: 'Observability',
            icon: Gauge,
            items: {
                metricsHub: 'Metrics Hub',
                errorLog: 'Error Log',
                generalLog: 'General Log',
                performanceInsights: 'Performance Insights',
                statusPage: 'Status Page',
            },
        },
        developerTools: {
            label: 'Developer Tools',
            icon: Code,
            items: {
                sqlEditor: 'SQL Editor',
                migrationTool: 'Migration Tool',
                importExport: 'Import/Export',
                aiTuningAdvisor: 'AI Tuning Advisor',
            },
        },
    };

    const renderContent = (sectionKey, itemKey) => {
        if (sectionKey === 'overview' && itemKey === 'executiveDashboard') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {demoData.executiveDashboard.statusBadges.map((badge, i) => (
                            <StatusBadge key={i} {...badge} />
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                        {demoData.executiveDashboard.heroMetrics.map((m, i) => (
                            <HeroMetric key={i} {...m} />
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Panel title="QPS Trend" icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={demoData.executiveDashboard.qpsTrend}>
                                    <defs>
                                        <linearGradient id="qpsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="name" stroke={THEME.textMuted} style={{ fontSize: '11px' }} />
                                    <YAxis stroke={THEME.textMuted} style={{ fontSize: '11px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                        }}
                                    />
                                    <Area type="monotone" dataKey="value" fill="url(#qpsGrad)" stroke={THEME.primary} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                        <Panel title="InnoDB Health" icon={Zap}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {demoData.executiveDashboard.innodbHealth.map((r, i) => (
                                    <RingGauge key={i} name={r.name} value={r.value} color={r.color} />
                                ))}
                            </div>
                        </Panel>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        <Panel title="Binary Log Status" icon={FileText}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                <div>
                                    <strong>Current:</strong> {demoData.executiveDashboard.binaryLogStatus.currentFile}
                                </div>
                                <div>
                                    <strong>Size:</strong> {demoData.executiveDashboard.binaryLogStatus.size}
                                </div>
                                <div>
                                    <strong>Position:</strong> {demoData.executiveDashboard.binaryLogStatus.position}
                                </div>
                                <div>
                                    <strong>Purged:</strong> {demoData.executiveDashboard.binaryLogStatus.purgedUntil}
                                </div>
                            </div>
                        </Panel>
                        <Panel title="Thread Activity" icon={Activity}>
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            {
                                                name: 'Idle',
                                                value: demoData.executiveDashboard.threadActivity.idle,
                                                fill: THEME.success,
                                            },
                                            {
                                                name: 'Query',
                                                value: demoData.executiveDashboard.threadActivity.query,
                                                fill: THEME.primary,
                                            },
                                            {
                                                name: 'Sleep',
                                                value: demoData.executiveDashboard.threadActivity.sleeping,
                                                fill: THEME.textMuted,
                                            },
                                            {
                                                name: 'Conn',
                                                value: demoData.executiveDashboard.threadActivity.connecting,
                                                fill: THEME.warning,
                                            },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={50}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {[THEME.success, THEME.primary, THEME.textMuted, THEME.warning].map((c, i) => (
                                            <Cell key={i} fill={c} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Panel>
                        <Panel title="Table Cache" icon={HardDrive}>
                            <div style={{ fontSize: '13px' }}>
                                <div>
                                    <strong>Open:</strong> {demoData.executiveDashboard.tableCache.open}
                                </div>
                                <div>
                                    <strong>Hit Ratio:</strong> {demoData.executiveDashboard.tableCache.hit}%
                                </div>
                                <div>
                                    <strong>Total:</strong> {demoData.executiveDashboard.tableCache.total}
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'innodbStatus') {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <Panel title="Buffer Pool Pages" icon={HardDrive}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={demoData.innodbStatus.bufferPoolPages}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Bar dataKey="value" fill={THEME.primary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Pending I/O" icon={Activity}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {demoData.innodbStatus.pendingIO.map((io, i) => (
                                <div
                                    key={i}
                                    style={{
                                        fontSize: '13px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: '6px',
                                    }}
                                >
                                    <div>
                                        <strong>{io.type}:</strong> {io.count} pending
                                    </div>
                                    <div style={{ color: THEME.textMuted }}>Avg: {io.avg}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Row Operations" icon={TrendingUp} span={2}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={demoData.innodbStatus.rowOps} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis type="number" stroke={THEME.textMuted} />
                                <YAxis
                                    dataKey="op"
                                    type="category"
                                    stroke={THEME.textMuted}
                                    width={80}
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Bar dataKey="value" fill={THEME.primary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'serverVariables') {
            return (
                <Panel title="MySQL Server Variables" icon={Settings}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                            fontSize: '13px',
                        }}
                    >
                        {[
                            { name: 'max_connections', value: '1000' },
                            { name: 'max_allowed_packet', value: '64M' },
                            { name: 'innodb_buffer_pool_size', value: '5G' },
                            { name: 'innodb_log_file_size', value: '512M' },
                            { name: 'binlog_format', value: 'ROW' },
                            { name: 'slow_query_log', value: 'ON' },
                        ].map((v, i) => (
                            <div key={i} style={{ padding: '8px', background: THEME.glass, borderRadius: '6px' }}>
                                <div style={{ color: THEME.textMuted }}>{v.name}</div>
                                <div style={{ fontSize: '14px', fontFamily: THEME.fontMono }}>{v.value}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'databases') {
            return (
                <Panel title="Databases" icon={Database}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                            { name: 'production', tables: 48, size: '5.2 GB' },
                            { name: 'analytics', tables: 25, size: '850 MB' },
                            { name: 'archive', tables: 156, size: '18 GB' },
                        ].map((db, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '12px',
                                    background: THEME.glass,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{db.name}</div>
                                <div>Tables: {db.tables}</div>
                                <div>Size: {db.size}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'performanceSchema') {
            return (
                <Panel title="Performance Schema" icon={Eye}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        <div>
                            <h4 style={{ color: THEME.primary, marginBottom: '12px' }}>Wait Events</h4>
                            {['io/file/sql/binlog', 'io/table/sql/handler', 'lock/mutex/innodb/buf_pool_mutex'].map(
                                (e, i) => (
                                    <div key={i} style={{ fontSize: '12px', padding: '6px', color: THEME.textMuted }}>
                                        {e}
                                    </div>
                                ),
                            )}
                        </div>
                        <div>
                            <h4 style={{ color: THEME.primary, marginBottom: '12px' }}>Statement Digest</h4>
                            {['SELECT', 'UPDATE', 'INSERT'].map((s, i) => (
                                <div key={i} style={{ fontSize: '12px', padding: '6px', color: THEME.textMuted }}>
                                    {s}: Active queries
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'activeAlerts') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'Critical', value: demoData.alerts.critical, color: THEME.danger },
                            { label: 'Warning', value: demoData.alerts.warning, color: THEME.warning },
                            { label: 'Info', value: demoData.alerts.info, color: THEME.primary },
                            { label: 'Resolved', value: demoData.alerts.resolved, color: THEME.success },
                        ].map((a, i) => (
                            <HeroMetric key={i} label={a.label} value={String(a.value)} icon={AlertCircle} />
                        ))}
                    </div>
                    <Panel title="Recent Alerts" icon={AlertCircle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {demoData.alerts.recentAlerts.map((a, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '10px',
                                        background: THEME.glass,
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{a.message}</strong>
                                        <span
                                            style={{
                                                color:
                                                    a.severity === 'critical'
                                                        ? THEME.danger
                                                        : a.severity === 'warning'
                                                          ? THEME.warning
                                                          : THEME.textMuted,
                                            }}
                                        >
                                            {a.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ color: THEME.textMuted, fontSize: '11px' }}>
                                        {a.time} • {a.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Alert Trend" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.alerts.alertTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="critical"
                                    fill={THEME.danger}
                                    stroke={THEME.danger}
                                    opacity={0.3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="warning"
                                    fill={THEME.warning}
                                    stroke={THEME.warning}
                                    opacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alertRules') {
            return (
                <Panel title="Configured Alert Rules" icon={Settings}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { rule: 'Memory Usage > 90%', threshold: '90%', severity: 'Critical' },
                            { rule: 'Replication Lag > 10s', threshold: '10s', severity: 'Warning' },
                            { rule: 'Slow Query Time', threshold: '2s', severity: 'Warning' },
                            { rule: 'Connection Pool > 900', threshold: '900', severity: 'Warning' },
                        ].map((r, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div>
                                    <strong>{r.rule}</strong>
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    Threshold: {r.threshold} • Severity: {r.severity}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alertHistory') {
            return (
                <Panel title="Alert History Timeline" icon={Clock}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { time: '14:23', alert: 'Memory usage increased to 92%', severity: 'critical' },
                            { time: '14:15', alert: 'Replication lag detected: 5.2s', severity: 'warning' },
                            { time: '14:08', alert: 'Slow query executed: 2.8s', severity: 'warning' },
                            { time: '13:45', alert: 'Alert resolved: Memory normalized', severity: 'info' },
                        ].map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '8px',
                                    borderLeft: `3px solid ${h.severity === 'critical' ? THEME.danger : h.severity === 'warning' ? THEME.warning : THEME.success}`,
                                }}
                            >
                                <div style={{ fontSize: '11px', color: THEME.textMuted }}>{h.time}</div>
                                <div style={{ fontSize: '13px' }}>{h.alert}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'slowQueries') {
            return (
                <Panel title="Top Slow Queries" icon={TrendingUp}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.slowQueries.map((q, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ fontFamily: THEME.fontMono, color: THEME.primary, marginBottom: '4px' }}>
                                    {q.sql}
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    Time: {q.execTime}s • Rows examined: {q.rowsExam.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'queryDigest') {
            return (
                <Panel title="Query Digest Patterns" icon={Eye}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={demoData.queryDigest}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis
                                dataKey="pattern"
                                stroke={THEME.textMuted}
                                angle={-20}
                                textAnchor="end"
                                height={80}
                                style={{ fontSize: '11px' }}
                            />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                            />
                            <Bar dataKey="freq" fill={THEME.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'explainAnalyzer') {
            return (
                <Panel title="EXPLAIN Analyzer" icon={Eye}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                        {[
                            {
                                id: 1,
                                select_type: 'SIMPLE',
                                table: 'orders',
                                key: 'idx_orders_user',
                                rows: 1450,
                                extra: 'Using where',
                            },
                            { id: 2, select_type: 'JOIN', table: 'users', key: 'PRIMARY', rows: 1, extra: 'NULL' },
                        ].map((row, i) => (
                            <div key={i} style={{ padding: '8px', background: THEME.glass, borderRadius: '6px' }}>
                                <div>
                                    <strong>ID {row.id}:</strong> {row.select_type} on {row.table}
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    Key: {row.key} | Rows: {row.rows} | {row.extra}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'indexStats') {
            return (
                <Panel title="Index Statistics" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={demoData.indexStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis dataKey="name" stroke={THEME.textMuted} style={{ fontSize: '12px' }} />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                            />
                            <Bar dataKey="usage" fill={THEME.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'tableStats') {
            return (
                <Panel title="Table Statistics" icon={Database}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                        {demoData.tableStats.map((t, i) => (
                            <div key={i} style={{ padding: '10px', background: THEME.glass, borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{t.table}</div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '8px',
                                        color: THEME.textMuted,
                                    }}
                                >
                                    <div>Rows: {t.rows.toLocaleString()}</div>
                                    <div>Data: {t.dataSize}</div>
                                    <div>Index: {t.indexSize}</div>
                                </div>
                                <div style={{ color: THEME.textMuted, marginTop: '4px' }}>
                                    Reads: {t.reads.toLocaleString()} | Writes: {t.writes.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'queryProfiler') {
            return (
                <Panel title="Query Profiler Stages" icon={Clock}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={demoData.queryProfiler} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis type="number" stroke={THEME.textMuted} />
                            <YAxis
                                dataKey="stage"
                                type="category"
                                width={90}
                                stroke={THEME.textMuted}
                                style={{ fontSize: '11px' }}
                            />
                            <Tooltip
                                contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                            />
                            <Bar dataKey="duration" fill={THEME.secondary} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'schemaBrowser') {
            return (
                <Panel title="Schema Browser" icon={Database}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {demoData.schemas.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '12px',
                                    background: THEME.glass,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{s.name}</div>
                                <div>Tables: {s.tables}</div>
                                <div>Views: {s.views}</div>
                                <div>Procedures: {s.procedures}</div>
                                <div>Functions: {s.functions}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'tableInspector') {
            return (
                <Panel title="Table Inspector (orders)" icon={Eye}>
                    <div style={{ fontSize: '12px' }}>
                        <h4 style={{ color: THEME.primary, marginBottom: '12px' }}>Columns</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.tableColumns.map((col, i) => (
                                <div key={i} style={{ padding: '8px', background: THEME.glass, borderRadius: '6px' }}>
                                    <div>
                                        <strong>{col.name}</strong>{' '}
                                        <span style={{ color: THEME.textMuted }}>{col.type}</span>
                                    </div>
                                    <div style={{ color: THEME.textMuted, fontSize: '11px' }}>
                                        {col.key && `Key: ${col.key}`} {!col.nullable && 'NOT NULL'}{' '}
                                        {col.default && `Default: ${col.default}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'foreignKeys') {
            return (
                <Panel title="Foreign Key Relationships" icon={ArrowRight}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                        {demoData.foreignKeys.map((fk, i) => (
                            <div key={i} style={{ padding: '10px', background: THEME.glass, borderRadius: '6px' }}>
                                <div style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                                    {fk.table}.{fk.column}
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    → {fk.refsTable}.{fk.refsColumn}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'storedPrograms') {
            return (
                <Panel title="Stored Programs" icon={Code}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {demoData.storedPrograms.map((p, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '8px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                }}
                            >
                                <div>
                                    <strong>{p.name}</strong> <span style={{ color: THEME.textMuted }}>({p.type})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'connectionPool') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {demoData.connectionPool.metrics.map((m, i) => (
                            <HeroMetric key={i} {...m} />
                        ))}
                    </div>
                    <Panel title="Connection Trend" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.connectionPool.trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    fill={THEME.primary}
                                    stroke={THEME.primary}
                                    opacity={0.3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="idle"
                                    fill={THEME.success}
                                    stroke={THEME.success}
                                    opacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'replication') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Replication Lag" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.replication.sourceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="lag"
                                    stroke={THEME.warning}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="GTID Status" icon={Settings}>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <strong>Executed:</strong>{' '}
                                <div style={{ fontFamily: THEME.fontMono, color: THEME.primary, marginTop: '4px' }}>
                                    {demoData.replication.gtidStatus.executed}
                                </div>
                            </div>
                            <div>
                                <strong>Purged:</strong>{' '}
                                <div style={{ fontFamily: THEME.fontMono, color: THEME.secondary, marginTop: '4px' }}>
                                    {demoData.replication.gtidStatus.purged}
                                </div>
                            </div>
                            <div>
                                <strong>Replica Lag:</strong> {demoData.replication.gtidStatus.replicaLag}
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'binlogs') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Binary Log Size Trend" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.binlogs.trend}>
                                <defs>
                                    <linearGradient id="binlogGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip
                                    contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                                />
                                <Area type="monotone" dataKey="size" fill="url(#binlogGrad)" stroke={THEME.secondary} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Binlog Status" icon={FileText}>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <strong>Current:</strong> {demoData.binlogs.status.current}
                            </div>
                            <div>
                                <strong>Size:</strong> {demoData.binlogs.status.size}
                            </div>
                            <div>
                                <strong>Purged Until:</strong> {demoData.binlogs.status.purgedUntil}
                            </div>
                            <div>
                                <strong>Retention:</strong> {demoData.binlogs.status.retention}
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'threadPool') {
            return (
                <Panel title="Thread Pool Utilization" icon={Activity}>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={demoData.threadPool}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {demoData.threadPool.map((r, i) => (
                                    <Cell key={i} fill={r.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'bufferPool') {
            return (
                <Panel title="Buffer Pool Memory Allocation" icon={Zap}>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={demoData.bufferPoolMem}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {demoData.bufferPoolMem.map((r, i) => (
                                    <Cell key={i} fill={r.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'tablespaces') {
            return (
                <Panel title="Tablespace Usage" icon={HardDrive}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.tablespaces.map((ts, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong>{ts.name}</strong>
                                    <span>{ts.type}</span>
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    Size: {ts.size} | Used: {ts.used}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'backups') {
            return (
                <Panel title="Backup History" icon={FileText}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.backups.map((b, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong>{b.date}</strong>
                                    <span style={{ color: THEME.success }}>{b.status}</span>
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    {b.type} • Duration: {b.duration} • Size: {b.size}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'userAccounts') {
            return (
                <Panel title="User Accounts" icon={Users}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.users.map((u, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                                    {u.name}@{u.host}
                                </div>
                                <div style={{ color: THEME.textMuted }}>Auth: {u.authMethod}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'privileges') {
            return (
                <Panel title="Privilege Hierarchy" icon={Lock}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                        {[
                            { user: 'app_user', privs: ['SELECT', 'INSERT', 'UPDATE'] },
                            { user: 'replication', privs: ['REPLICATION SLAVE', 'REPLICATION CLIENT'] },
                            { user: 'admin', privs: ['ALL PRIVILEGES'] },
                        ].map((up, i) => (
                            <div key={i} style={{ padding: '10px', background: THEME.glass, borderRadius: '6px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{up.user}</div>
                                <div style={{ color: THEME.textMuted }}>{up.privs.join(', ')}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'sslStatus') {
            return (
                <Panel title="SSL/TLS Configuration" icon={Shield}>
                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <strong>SSL Connections:</strong> {demoData.sslStatus.sslRatio}%
                        </div>
                        <div>
                            <strong>Certificate Issuer:</strong> {demoData.sslStatus.certIssuer}
                        </div>
                        <div>
                            <strong>Expiry:</strong> {demoData.sslStatus.certExpiry}
                        </div>
                        <div>
                            <strong>TLS Version:</strong> {demoData.sslStatus.tlsVersion}
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'auditLog') {
            return (
                <Panel title="Audit Log Events" icon={FileText}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.auditEvents.map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong>{e.event}</strong>
                                    <span style={{ color: THEME.success }}>{e.result}</span>
                                </div>
                                <div style={{ color: THEME.textMuted }}>{e.user}</div>
                                <div style={{ color: THEME.textMuted, fontSize: '11px' }}>{e.time}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'metricsHub') {
            return (
                <Panel title="Key Metrics Summary" icon={Gauge}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {demoData.metrics.map((m, i) => (
                            <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', color: THEME.textMuted, marginBottom: '8px' }}>
                                    {m.name}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                                    {m.value}
                                </div>
                                <MiniSparkline data={m.sparkline} color={THEME.primary} />
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'errorLog') {
            return (
                <Panel title="Recent Error Log" icon={AlertCircle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.errors.map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong>{e.message}</strong>
                                    <span style={{ color: e.level === 'ERROR' ? THEME.danger : THEME.warning }}>
                                        {e.level}
                                    </span>
                                </div>
                                <div style={{ color: THEME.textMuted, fontSize: '11px' }}>{e.time}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'generalLog') {
            return (
                <Panel title="Query Log Stream" icon={FileText}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            fontSize: '11px',
                            fontFamily: THEME.fontMono,
                        }}
                    >
                        {[
                            '14:25:32 app_user@192.168.1.50 [production] SELECT * FROM orders WHERE id=42',
                            '14:25:30 admin@localhost [production] SHOW PROCESSLIST',
                            '14:25:28 app_user@192.168.1.50 [production] UPDATE inventory SET qty=qty-1',
                        ].map((log, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '6px',
                                    background: THEME.glass,
                                    borderRadius: '4px',
                                    color: THEME.textMuted,
                                }}
                            >
                                {log}
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'performanceInsights') {
            return (
                <Panel title="Wait Event Analysis" icon={Eye}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={[
                                { event: 'io/file/sql/binlog', pct: 35 },
                                { event: 'io/table/sql/handler', pct: 28 },
                                { event: 'lock/mutex/innodb', pct: 22 },
                                { event: 'synch/rwlock/innodb', pct: 15 },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis
                                dataKey="event"
                                angle={-20}
                                textAnchor="end"
                                height={80}
                                stroke={THEME.textMuted}
                                style={{ fontSize: '11px' }}
                            />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}
                            />
                            <Bar dataKey="pct" fill={THEME.warning} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'statusPage') {
            return (
                <Panel title="Service Health Status" icon={CheckCircle}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px',
                            fontSize: '13px',
                        }}
                    >
                        {[
                            { service: 'MySQL Engine', status: 'Running', uptime: '142d' },
                            { service: 'Replication', status: 'Healthy', uptime: '142d' },
                            { service: 'Backups', status: 'On Schedule', uptime: '3/3 complete' },
                            { service: 'Performance Schema', status: 'Active', uptime: '142d' },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: '10px', background: THEME.glass, borderRadius: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <CheckCircle size={16} color={THEME.success} />
                                    <strong>{s.service}</strong>
                                </div>
                                <div style={{ color: THEME.textMuted }}>
                                    {s.status} • {s.uptime}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'sqlEditor') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Recent Queries" icon={Code}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.recentQueries.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontFamily: THEME.fontMono,
                                        color: THEME.primary,
                                    }}
                                >
                                    {q}
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="SQL Editor" icon={Code}>
                        <div
                            style={{
                                padding: '12px',
                                background: THEME.glass,
                                borderRadius: '6px',
                                fontFamily: THEME.fontMono,
                                fontSize: '12px',
                                color: THEME.textMuted,
                                minHeight: '120px',
                            }}
                        >
                            SELECT * FROM orders
                            <br />
                            WHERE created_at &gt; NOW() - INTERVAL 1 DAY
                            <br />
                            ORDER BY total DESC LIMIT 10;
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'migrationTool') {
            return (
                <Panel title="Schema Migration History" icon={TrendingUp}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {demoData.migrations.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong>{m.version}</strong>
                                    <span style={{ color: THEME.success }}>{m.status}</span>
                                </div>
                                <div style={{ color: THEME.textMuted, marginBottom: '4px' }}>{m.description}</div>
                                <div style={{ color: THEME.textMuted, fontSize: '11px' }}>{m.appliedAt}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'importExport') {
            return (
                <Panel title="Data Transfer" icon={FileText}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { op: 'Export orders to CSV', date: '2026-03-25 18:45', status: 'Completed', rows: '2.5M' },
                            {
                                op: 'Import users from backup',
                                date: '2026-03-20 03:15',
                                status: 'Completed',
                                rows: '125K',
                            },
                            { op: 'Sync analytics DB', date: '2026-03-15 22:30', status: 'Completed', rows: '850K' },
                        ].map((op, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '10px',
                                    background: THEME.glass,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{op.op}</div>
                                <div style={{ color: THEME.textMuted }}>
                                    {op.date} • {op.status} • {op.rows} rows
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'aiTuningAdvisor') {
            return (
                <Panel title="MySQL AI Tuning Advisor" icon={Zap}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {demoData.tuningRecs.map((rec, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '12px',
                                    background: THEME.glass,
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${rec.priority === 'Critical' ? THEME.danger : rec.priority === 'High' ? THEME.warning : THEME.primary}`,
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{rec.issue}</div>
                                <div
                                    style={{
                                        color: THEME.primary,
                                        marginBottom: '4px',
                                        fontFamily: THEME.fontMono,
                                        fontSize: '11px',
                                    }}
                                >
                                    {rec.recommendation}
                                </div>
                                <div style={{ color: THEME.textMuted, fontSize: '11px' }}>Priority: {rec.priority}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        return (
            <Panel title="Not Found" icon={Database}>
                No content for this section
            </Panel>
        );
    };

    return (
        <DemoLayout
            title="MySQL Demo"
            titleIcon={Database}
            accentColor={THEME.secondary}
            sections={sections}
            renderContent={renderContent}
        />
    );
}

export default DemoMySQLTab;
