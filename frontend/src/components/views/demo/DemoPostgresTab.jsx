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
    Bell,
    Zap,
    Server,
    Shield,
    Eye,
    Terminal,
    TrendingUp,
    AlertTriangle,
    Clock,
    HardDrive,
    Lock,
    Cpu,
    Network,
    BarChart2,
    CheckCircle,
    RefreshCw,
    Archive,
    Layers,
    Cloud,
    FileSearch,
    Radar,
    Container,
    Globe,
    Brain,
    GitBranch,
    Droplets,
    Radio,
    AlertOctagon,
    Link2,
    DatabaseZap,
    Workflow,
    ScanSearch,
    TreePine,
    FolderGit2,
    Blocks,
    ListTree,
    BarChart3,
    ShieldCheck,
    TableProperties,
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

function DemoPostgresTab({ tabId }) {
    useAdaptiveTheme();

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const base30d = generateChartData(30);

        // Index the data
        const indexed24h = base24h.map((d, i) => ({ ...d, index: i }));
        const indexed30d = base30d.map((d, i) => ({ ...d, index: i }));

        return {
            // Overview data
            clusterVelocity: indexed24h.map((d) => ({
                ...d,
                qps: Math.floor(1200 + Math.sin(d.index / 6) * 400 + Math.random() * 200),
                tps: Math.floor(850 + Math.cos(d.index / 6) * 300 + Math.random() * 150),
            })),
            connectionTrends: indexed24h.map((d) => ({
                ...d,
                active: Math.floor(45 + Math.sin(d.index / 8) * 15 + Math.random() * 10),
                idle: Math.floor(35 + Math.cos(d.index / 8) * 20 + Math.random() * 12),
            })),
            cpuMemory: indexed24h.map((d) => ({
                ...d,
                cpu: Math.floor(35 + Math.sin(d.index / 5) * 20 + Math.random() * 15),
                memory: Math.floor(58 + Math.cos(d.index / 7) * 15 + Math.random() * 10),
            })),
            diskIO: indexed24h.map((d) => ({
                ...d,
                reads: Math.floor(450 + Math.sin(d.index / 4) * 200 + Math.random() * 150),
                writes: Math.floor(320 + Math.cos(d.index / 5) * 150 + Math.random() * 100),
            })),
            databaseList: [
                { name: 'production_db', size: '48.2 GB', connections: 23, txns: 1240, uptime: '45d' },
                { name: 'analytics_db', size: '32.5 GB', connections: 8, txns: 340, uptime: '45d' },
                { name: 'backup_db', size: '16.1 GB', connections: 2, txns: 12, uptime: '45d' },
                { name: 'test_db', size: '8.3 GB', connections: 1, txns: 2, uptime: '45d' },
            ],

            // Alerts
            alertMetrics: { critical: 2, warning: 5, info: 12, resolved: 47 },
            alertTrends: indexed24h.map((d) => ({
                ...d,
                alerts: Math.floor(8 + Math.sin(d.index / 7) * 4 + Math.random() * 3),
            })),
            activeAlerts: [
                { id: 'a1', severity: 'critical', title: 'High Cache Miss Rate', time: '12m', db: 'production_db' },
                { id: 'a2', severity: 'warning', title: 'Connection Pool Near Limit', time: '34m', db: 'analytics_db' },
                { id: 'a3', severity: 'warning', title: 'Slow Query Detected', time: '2h', db: 'production_db' },
            ],
            alertRules: [
                { name: 'High CPU', threshold: '80%', duration: '5m', enabled: true },
                { name: 'Replication Lag', threshold: '10s', duration: '3m', enabled: true },
                { name: 'Cache Hit Ratio', threshold: '<95%', duration: '10m', enabled: true },
                { name: 'Disk Space', threshold: '85%', duration: 'immediate', enabled: false },
            ],

            // Query Analysis
            slowQueries: [
                { id: 'q1', query: 'SELECT * FROM orders WHERE status = $1', duration: 2340, calls: 145, rows: 8420 },
                { id: 'q2', query: 'SELECT COUNT(*) FROM transactions', duration: 1820, calls: 1203, rows: 1 },
                {
                    id: 'q3',
                    query: 'JOIN orders, users WHERE orders.user_id = users.id',
                    duration: 1650,
                    calls: 89,
                    rows: 34200,
                },
            ],
            queryDist: indexed24h.map((d) => ({
                ...d,
                select: Math.floor(400 + Math.random() * 300),
                insert: Math.floor(150 + Math.random() * 100),
                update: Math.floor(120 + Math.random() * 80),
                delete: Math.floor(30 + Math.random() * 20),
            })),
            indexMetrics: [
                { name: 'orders_user_id_idx', scans: 12450, tuples: 8420, size: '4.2 MB' },
                { name: 'users_email_idx', scans: 3420, tuples: 1230, size: '1.1 MB' },
                { name: 'transactions_status_idx', scans: 890, tuples: 340, size: '520 KB' },
            ],
            bloatAnalysis: [
                { table: 'orders', bloat: 32, size: '12.4 GB', lastVacuum: '2h ago' },
                { table: 'users', bloat: 18, size: '2.1 GB', lastVacuum: '4h ago' },
                { table: 'transactions', bloat: 45, size: '8.9 GB', lastVacuum: '1h ago' },
            ],
            tableAnalysis: [
                { table: 'orders', rows: 2450000, size: '12.4 GB', indexes: 8, toast: '2.1 GB' },
                { table: 'users', rows: 145000, size: '2.1 GB', indexes: 4, toast: '340 MB' },
                { table: 'transactions', rows: 8900000, size: '8.9 GB', indexes: 6, toast: '1.2 GB' },
            ],

            // Schema & Data
            schemaStats: [
                { object: 'Tables', count: 124 },
                { object: 'Views', count: 38 },
                { object: 'Functions', count: 67 },
                { object: 'Triggers', count: 42 },
            ],
            tableSizes: [
                { name: 'orders', size: 12.4 },
                { name: 'transactions', size: 8.9 },
                { name: 'products', size: 1.8 },
                { name: 'audit_log', size: 3.2 },
                { name: 'users', size: 2.1 },
            ],
            schemaMigrations: [
                { version: 'v1.0.3', description: 'Add user_preferences table', applied: '2d ago', status: 'Success' },
                { version: 'v1.0.2', description: 'Create indexes on orders', applied: '4d ago', status: 'Success' },
                { version: 'v1.0.1', description: 'Alter transactions table', applied: '1w ago', status: 'Success' },
            ],

            // Infrastructure
            poolMetrics: { available: 78, waiting: 2, active: 20, max: 100 },
            poolTrends: indexed24h.map((d) => ({
                ...d,
                utilization: Math.floor(18 + Math.sin(d.index / 6) * 8 + Math.random() * 6),
            })),
            replicationLag: indexed24h.map((d) => ({
                ...d,
                replica1: Math.floor(2.5 + Math.random() * 2),
                replica2: Math.floor(2.3 + Math.random() * 1.8),
            })),
            walMetrics: {
                archiveCount: 1452,
                archiveSize: '23.4 GB',
                lastArchive: '2m ago',
                replicationSlots: 2,
            },
            checkpointMetrics: [
                { type: 'Scheduled', last: '15m ago', duration: '34s', buffers: '2.3M' },
                { type: 'Requested', last: '42m ago', duration: '56s', buffers: '3.1M' },
            ],
            vacuumStats: [
                { table: 'orders', lastVacuum: '2h ago', deadTuples: 1240, tuples: 2450000 },
                { table: 'users', lastVacuum: '4h ago', deadTuples: 340, tuples: 145000 },
                { table: 'transactions', lastVacuum: '1h ago', deadTuples: 890, tuples: 8900000 },
            ],
            capacityMetrics: {
                used: 97.2,
                total: 2048,
                growing: '12 GB/week',
                projectedFull: '42 days',
            },
            backupHistory: [
                { name: 'Full #142', size: '48.2 GB', duration: '2h 34m', date: '2h ago', status: 'Success' },
                { name: 'Incr #143', size: '2.1 GB', duration: '12m', date: '1h ago', status: 'Success' },
                { name: 'Full #141', size: '48.2 GB', duration: '2h 28m', date: '1d ago', status: 'Success' },
            ],

            // Security
            sslRatio: 98.5,
            roleStats: [
                { role: 'postgres', conns: 5, perms: 'superuser' },
                { role: 'app_user', conns: 23, perms: 'read/write' },
                { role: 'readonly_user', conns: 8, perms: 'read-only' },
            ],
            auditEvents: [
                { time: '2m ago', event: 'LOGIN', user: 'app_user', status: 'success' },
                { time: '5m ago', event: 'CREATE_ROLE', user: 'postgres', status: 'success' },
                { time: '12m ago', event: 'ALTER_TABLE', user: 'app_user', status: 'success' },
            ],

            // Observability
            logPatterns: [
                { pattern: 'connection timeout', frequency: 142, trending: 'up' },
                { pattern: 'query slow log', frequency: 89, trending: 'stable' },
                { pattern: 'index missing', frequency: 34, trending: 'down' },
            ],
            recentQueries: [
                { query: "SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '1 day'", time: '2m ago' },
                { query: 'EXPLAIN ANALYZE SELECT * FROM users WHERE id = $1', time: '8m ago' },
                { query: 'INSERT INTO audit_log (action, user_id) VALUES ($1, $2)', time: '15m ago' },
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
                { key: 'fleet-overview', label: 'Fleet Overview' },
                { key: 'database-overview', label: 'Database Overview' },
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
                { key: 'active-alerts', label: 'Active Alerts' },
                { key: 'alert-rules', label: 'Alert Rules' },
                { key: 'alert-correlation', label: 'Alert Correlation' },
            ],
        },
        {
            key: 'query-analysis',
            label: 'Query Analysis',
            icon: Zap,
            accent: THEME.ai,
            items: [
                { key: 'query-optimizer', label: 'Query Optimizer' },
                { key: 'query-plan', label: 'Query Plan Viewer' },
                { key: 'plan-regression', label: 'Plan Regression' },
                { key: 'indexes', label: 'Indexes' },
                { key: 'bloat-analysis', label: 'Bloat Analysis' },
                { key: 'table-analysis', label: 'Table Analysis' },
            ],
        },
        {
            key: 'schema',
            label: 'Schema & Data',
            icon: Database,
            accent: THEME.warning,
            items: [
                { key: 'schema-browser', label: 'Schema Browser' },
                { key: 'schema-migrations', label: 'Schema & Migrations' },
                { key: 'schema-visualizer', label: 'Schema Visualizer' },
                { key: 'table-dependencies', label: 'Table Dependencies' },
                { key: 'chart-builder', label: 'Chart Builder' },
            ],
        },
        {
            key: 'infrastructure',
            label: 'Infrastructure',
            icon: Server,
            accent: THEME.success,
            items: [
                { key: 'connection-pool', label: 'Connection Pool' },
                { key: 'pool-metrics', label: 'Pool Metrics' },
                { key: 'replication-wal', label: 'Replication & WAL' },
                { key: 'checkpoint-monitor', label: 'Checkpoint Monitor' },
                { key: 'vacuum-maintenance', label: 'Vacuum & Maintenance' },
                { key: 'capacity-planning', label: 'Capacity Planning' },
                { key: 'backup-recovery', label: 'Backup & Recovery' },
            ],
        },
        {
            key: 'security',
            label: 'Security',
            icon: Shield,
            accent: THEME.danger,
            items: [{ key: 'security-compliance', label: 'Security & Compliance' }],
        },
        {
            key: 'observability',
            label: 'Observability',
            icon: Eye,
            accent: THEME.warning,
            items: [
                { key: 'observability-hub', label: 'Observability Hub' },
                { key: 'cloudwatch', label: 'CloudWatch' },
                { key: 'log-patterns', label: 'Log Pattern Analysis' },
                { key: 'opentelemetry', label: 'OpenTelemetry' },
                { key: 'kubernetes', label: 'Kubernetes' },
                { key: 'status-page', label: 'Status Page' },
                { key: 'ai-monitoring', label: 'AI Monitoring' },
            ],
        },
        {
            key: 'developer',
            label: 'Developer Tools',
            icon: Terminal,
            accent: THEME.ai,
            items: [
                { key: 'sql-console', label: 'SQL Console' },
                { key: 'api-tracing', label: 'API Tracing' },
                { key: 'repository', label: 'Repository' },
                { key: 'ai-advisor', label: 'AI Query Advisor' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        // ═══════════════════════════════════════════════════════════════════════
        // OVERVIEW SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'overview' && itemKey === 'fleet-overview') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatusBadge label="Operational" color={THEME.success} />
                        <StatusBadge label="4 Instances" color={THEME.primary} />
                        <StatusBadge label="PostgreSQL 16.2" color={THEME.textMuted} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric icon={Activity} label="Total Servers" value="4" color={THEME.primary} />
                        <HeroMetric icon={CheckCircle} label="Healthy" value="4" color={THEME.success} />
                        <HeroMetric icon={Clock} label="Avg Uptime" value="98.2%" color={THEME.primary} />
                        <HeroMetric icon={Cpu} label="Total Load" value="34.2%" color={THEME.warning} />
                        <HeroMetric icon={HardDrive} label="Fleet Storage" value="145 GB" color={THEME.textMuted} />
                        <HeroMetric icon={Network} label="Net Throughput" value="2.3 Gbps" color={THEME.ai} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        <Panel title="Fleet Query Rate" icon={Zap} accentColor={THEME.ai}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.clusterVelocity}>
                                    <defs>
                                        <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="qps"
                                        stroke={THEME.ai}
                                        fillOpacity={1}
                                        fill="url(#colorQps)"
                                        name="QPS"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="tps"
                                        stroke={THEME.primary}
                                        fillOpacity={1}
                                        fill="url(#colorTps)"
                                        name="TPS"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Connections" icon={Network} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={demoData.connectionTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="active"
                                        stroke={THEME.success}
                                        strokeWidth={2}
                                        name="Active"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="idle"
                                        stroke={THEME.textMuted}
                                        strokeWidth={2}
                                        name="Idle"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>

                    <Panel title="Instances" icon={Server} accentColor={THEME.primary}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {demoData.databaseList.map((db) => (
                                <div
                                    key={db.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: THEME.textMain,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {db.name}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim, lineHeight: 1.5 }}>
                                        Size: {db.size}
                                        <br />
                                        Conns: {db.connections}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'database-overview') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric icon={Clock} label="Uptime" value="45" color={THEME.primary} />
                        <HeroMetric icon={Activity} label="Active Sessions" value="52" color={THEME.success} />
                        <HeroMetric icon={Zap} label="Cache Hit Ratio" value="99.4" color={THEME.ai} />
                        <HeroMetric icon={HardDrive} label="Database Size" value="148 GB" color={THEME.textMuted} />
                        <HeroMetric icon={Clock} label="Long Txns" value="3" color={THEME.warning} />
                        <HeroMetric icon={RefreshCw} label="Vacuums Pending" value="5" color={THEME.danger} />
                    </div>

                    <Panel title="Databases" icon={Database} accentColor={THEME.primary}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.databaseList.map((db) => (
                                <div
                                    key={db.name}
                                    className="dpg-table-row"
                                    style={{
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        fontSize: 12,
                                        color: THEME.textMuted,
                                    }}
                                >
                                    <span style={{ fontFamily: THEME.fontMono, fontWeight: 500 }}>{db.name}</span>
                                    <span>{db.size}</span>
                                    <span>{db.connections} conns</span>
                                    <span style={{ color: THEME.textDim }}>{db.txns} txns</span>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Transaction Throughput" icon={TrendingUp} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <defs>
                                    <linearGradient id="colorTxn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="tps"
                                    stroke={THEME.ai}
                                    fillOpacity={1}
                                    fill="url(#colorTxn)"
                                    name="TPS"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'performance') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge value={94} color={THEME.success} label="Cache Hit" size={100} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge value={52} color={THEME.ai} label="CPU Usage" size={100} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge value={68} color={THEME.warning} label="Memory" size={100} />
                        </div>
                    </div>

                    <Panel title="Query Distribution" icon={BarChart2} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={demoData.queryDist.slice(-12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Legend />
                                <Bar dataKey="select" stackId="a" fill={THEME.ai} name="SELECT" />
                                <Bar dataKey="insert" stackId="a" fill={THEME.success} name="INSERT" />
                                <Bar dataKey="update" stackId="a" fill={THEME.warning} name="UPDATE" />
                                <Bar dataKey="delete" stackId="a" fill={THEME.danger} name="DELETE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        <Panel title="CPU & Memory" icon={Cpu} accentColor={THEME.warning}>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={demoData.cpuMemory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="cpu"
                                        stroke={THEME.warning}
                                        strokeWidth={2}
                                        name="CPU %"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="memory"
                                        stroke={THEME.primary}
                                        strokeWidth={2}
                                        name="Memory %"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Disk I/O" icon={HardDrive} accentColor={THEME.textMuted}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={demoData.diskIO}>
                                    <defs>
                                        <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorWrites" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="reads"
                                        stroke={THEME.ai}
                                        fillOpacity={1}
                                        fill="url(#colorReads)"
                                        name="Reads"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="writes"
                                        stroke={THEME.warning}
                                        fillOpacity={1}
                                        fill="url(#colorWrites)"
                                        name="Writes"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'resources') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric icon={HardDrive} label="Disk Used" value="97.2 GB" color={THEME.warning} />
                        <HeroMetric icon={Cpu} label="CPU Cores" value="16" color={THEME.primary} />
                        <HeroMetric icon={Activity} label="Total RAM" value="64 GB" color={THEME.success} />
                        <HeroMetric icon={Network} label="Network" value="10 Gbps" color={THEME.ai} />
                    </div>

                    <Panel title="Storage Allocation" icon={HardDrive} accentColor={THEME.warning}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {demoData.tableSizes.map((t) => (
                                <div
                                    key={t.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: THEME.textMain,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {t.name}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primary }}>
                                        {t.size.toFixed(1)} GB
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            marginTop: 6,
                                            height: 4,
                                            borderRadius: 2,
                                            background: THEME.glassBorder,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${Math.min((t.size / 15) * 100, 100)}%`,
                                                background: THEME.warning,
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

        if (sectionKey === 'overview' && itemKey === 'reliability') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric icon={CheckCircle} label="Availability" value="99.97%" color={THEME.success} />
                        <HeroMetric icon={RefreshCw} label="MTTR" value="12m" color={THEME.primary} />
                        <HeroMetric icon={AlertTriangle} label="Failed Checks" value="0" color={THEME.success} />
                        <HeroMetric icon={Archive} label="Recovery Points" value="48" color={THEME.ai} />
                    </div>

                    <Panel title="Health Status" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Primary Database', status: 'healthy' },
                                { name: 'Replica 1', status: 'healthy' },
                                { name: 'Replica 2', status: 'healthy' },
                                { name: 'Backup Server', status: 'healthy' },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 0',
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: THEME.textMuted }}>{item.name}</span>
                                    <StatusBadge label="Healthy" color={THEME.success} />
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Backup Status" icon={Archive} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.backupHistory.map((backup) => (
                                <div
                                    key={backup.name}
                                    className="dpg-table-row"
                                    style={{
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        fontSize: 11,
                                        color: THEME.textMuted,
                                    }}
                                >
                                    <span style={{ fontFamily: THEME.fontMono }}>{backup.name}</span>
                                    <span>{backup.size}</span>
                                    <span style={{ color: THEME.success }}>{backup.status}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ALERTS & RULES SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'alerts' && itemKey === 'active-alerts') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                padding: '16px',
                                background: `${THEME.danger}12`,
                                border: `1px solid ${THEME.danger}30`,
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ fontSize: 10, color: THEME.danger, fontWeight: 700, marginBottom: 4 }}>
                                CRITICAL
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.danger }}>
                                {demoData.alertMetrics.critical}
                            </div>
                        </div>
                        <div
                            style={{
                                padding: '16px',
                                background: `${THEME.warning}12`,
                                border: `1px solid ${THEME.warning}30`,
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ fontSize: 10, color: THEME.warning, fontWeight: 700, marginBottom: 4 }}>
                                WARNING
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.warning }}>
                                {demoData.alertMetrics.warning}
                            </div>
                        </div>
                        <div
                            style={{
                                padding: '16px',
                                background: `${THEME.primary}12`,
                                border: `1px solid ${THEME.primary}30`,
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ fontSize: 10, color: THEME.primary, fontWeight: 700, marginBottom: 4 }}>
                                INFO
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.primary }}>
                                {demoData.alertMetrics.info}
                            </div>
                        </div>
                        <div
                            style={{
                                padding: '16px',
                                background: `${THEME.success}12`,
                                border: `1px solid ${THEME.success}30`,
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ fontSize: 10, color: THEME.success, fontWeight: 700, marginBottom: 4 }}>
                                RESOLVED
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.success }}>
                                {demoData.alertMetrics.resolved}
                            </div>
                        </div>
                    </div>

                    <Panel title="Active Alerts" icon={AlertTriangle} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.activeAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${
                                            alert.severity === 'critical' ? THEME.danger : THEME.warning
                                        }`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 10,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: THEME.textMain,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {alert.title}
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textDim }}>
                                                {alert.db} • {alert.time}
                                            </div>
                                        </div>
                                        <StatusBadge
                                            label={alert.severity.toUpperCase()}
                                            color={alert.severity === 'critical' ? THEME.danger : THEME.warning}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Alert Trend" icon={TrendingUp} accentColor={THEME.danger}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.alertTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    type="monotone"
                                    dataKey="alerts"
                                    stroke={THEME.danger}
                                    strokeWidth={2}
                                    name="Alerts"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alert-rules') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Alert Rules" icon={Bell} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.alertRules.map((rule) => (
                                <div
                                    key={rule.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: THEME.textMain,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {rule.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            Threshold: {rule.threshold} • Duration: {rule.duration}
                                        </div>
                                    </div>
                                    <StatusBadge
                                        label={rule.enabled ? 'ENABLED' : 'DISABLED'}
                                        color={rule.enabled ? THEME.success : THEME.textDim}
                                    />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alert-correlation') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Correlated Events" icon={Link2} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                {
                                    group: 'High Cache Misses',
                                    events: ['Cache hit ratio drop', 'Slow query rate increase', 'CPU usage spike'],
                                },
                                {
                                    group: 'Connection Pool Pressure',
                                    events: ['Pool utilization >80%', 'Waiting connections', 'Query queue builds'],
                                },
                            ].map((group) => (
                                <div key={group.group} style={{ borderLeft: `3px solid ${THEME.ai}`, paddingLeft: 12 }}>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {group.group}
                                    </div>
                                    <ul
                                        style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6,
                                        }}
                                    >
                                        {group.events.map((evt, i) => (
                                            <li key={i} style={{ fontSize: 11, color: THEME.textMuted }}>
                                                → {evt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // QUERY ANALYSIS SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'query-analysis' && itemKey === 'query-optimizer') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric
                            icon={Zap}
                            label="Slow Queries"
                            value={demoData.slowQueries.length}
                            color={THEME.warning}
                        />
                        <HeroMetric icon={BarChart2} label="Avg Duration" value="1.9s" color={THEME.danger} />
                        <HeroMetric icon={Activity} label="Optimization Gain" value="34%" color={THEME.success} />
                    </div>

                    <Panel title="Slow Queries (pg_stat_statements)" icon={DatabaseZap} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.slowQueries.map((q) => (
                                <div
                                    key={q.id}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontFamily: THEME.fontMono,
                                            color: THEME.textMuted,
                                            marginBottom: 6,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {q.query}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 10,
                                            fontSize: 10,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>Duration: {(q.duration / 1000).toFixed(2)}s</span>
                                        <span>Calls: {q.calls}</span>
                                        <span>Rows: {q.rows.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'query-plan') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="EXPLAIN ANALYZE Results" icon={Workflow} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: 10,
                                color: THEME.textMuted,
                                background: THEME.glass,
                                padding: '12px',
                                borderRadius: 6,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            {`Seq Scan on orders (cost=0.00..15240.00 rows=245000 width=68)
  Filter: (status = $1)
  Rows: 8420, Duration: 2340.23ms

Optimizer Notes:
  • Consider creating index on (status)
  • Rows estimated: 245000, actual: 8420
  • Planner chose seq scan over index (correct decision)
  • Filter selectivity: 3.4%`}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'plan-regression') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Plan Changes" icon={TrendingUp} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { query: 'SELECT * FROM orders', prev: 'Index Scan', curr: 'Seq Scan', impact: 'High' },
                                { query: 'JOIN users ON ...', prev: '45ms', curr: '120ms', impact: 'Medium' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontFamily: THEME.fontMono,
                                            color: THEME.textMuted,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {item.query}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 10,
                                            fontSize: 10,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>Prev: {item.prev}</span>
                                        <span>Now: {item.curr}</span>
                                        <span style={{ color: THEME.warning }}>Impact: {item.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'indexes') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric
                            icon={Layers}
                            label="Total Indexes"
                            value={demoData.indexMetrics.length}
                            color={THEME.ai}
                        />
                        <HeroMetric icon={Zap} label="Unused Indexes" value="0" color={THEME.success} />
                        <HeroMetric icon={HardDrive} label="Index Size" value="5.8 MB" color={THEME.textMuted} />
                    </div>

                    <Panel title="Index Performance" icon={Layers} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.indexMetrics.map((idx) => (
                                <div
                                    key={idx.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {idx.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 10,
                                            fontSize: 10,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>Scans: {idx.scans.toLocaleString()}</span>
                                        <span>Tuples: {idx.tuples.toLocaleString()}</span>
                                        <span>Size: {idx.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'bloat-analysis') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Table Bloat (MVCC Analysis)" icon={ScanSearch} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.bloatAnalysis.map((t) => (
                                <div
                                    key={t.table}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                            {t.table}
                                        </span>
                                        <span style={{ fontSize: 10, color: THEME.warning, fontWeight: 700 }}>
                                            {t.bloat}% bloat
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            height: 4,
                                            borderRadius: 2,
                                            background: THEME.glassBorder,
                                            overflow: 'hidden',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${Math.min(t.bloat, 100)}%`,
                                                background: THEME.warning,
                                            }}
                                        />
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>
                                        Size: {t.size} • Last vacuum: {t.lastVacuum}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'table-analysis') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Table Statistics" icon={TableProperties} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.tableAnalysis.map((t) => (
                                <div
                                    key={t.table}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {t.table}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: 8,
                                            fontSize: 9,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>Rows: {t.rows.toLocaleString()}</span>
                                        <span>Size: {t.size}</span>
                                        <span>Indexes: {t.indexes}</span>
                                        <span>TOAST: {t.toast}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // SCHEMA & DATA SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'schema' && itemKey === 'schema-browser') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Schema Objects" icon={TreePine} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={demoData.schemaStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    <Cell fill={THEME.ai} />
                                    <Cell fill={THEME.primary} />
                                    <Cell fill={THEME.warning} />
                                    <Cell fill={THEME.success} />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Object Count" icon={Database} accentColor={THEME.warning}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {demoData.schemaStats.map((stat) => (
                                <div
                                    key={stat.object}
                                    style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                        {stat.object}
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: THEME.ai }}>{stat.count}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'schema-migrations') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Migration History" icon={FolderGit2} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.schemaMigrations.map((m) => (
                                <div
                                    key={m.version}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${THEME.success}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {m.version}
                                        </span>
                                        <StatusBadge label={m.status} color={THEME.success} />
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 4 }}>
                                        {m.description}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>Applied: {m.applied}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'schema-visualizer') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Schema Graph" icon={Blocks} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            Schema visualization (SVG/Canvas rendering)
                            <br />
                            Shows table relationships and constraints
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'table-dependencies') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Table Dependency Graph" icon={ListTree} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { table: 'users', deps: ['user_preferences', 'audit_log', 'user_sessions'] },
                                { table: 'orders', deps: ['order_items', 'order_status_history', 'shipments'] },
                                { table: 'products', deps: ['product_categories', 'product_variants'] },
                            ].map((item) => (
                                <div key={item.table} style={{ borderLeft: `3px solid ${THEME.ai}`, paddingLeft: 12 }}>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            fontFamily: THEME.fontMono,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {item.table}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        {item.deps.map((dep) => (
                                            <span
                                                key={dep}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '4px 8px',
                                                    background: THEME.glass,
                                                    border: `1px solid ${THEME.glassBorder}`,
                                                    borderRadius: 4,
                                                    color: THEME.textDim,
                                                }}
                                            >
                                                → {dep}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'chart-builder') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Top Tables by Size" icon={BarChart3} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={demoData.tableSizes}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="size" fill={THEME.ai} name="Size (GB)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // INFRASTRUCTURE SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'infrastructure' && itemKey === 'connection-pool') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge
                                value={Math.round((demoData.poolMetrics.active / demoData.poolMetrics.max) * 100)}
                                color={THEME.ai}
                                label="Usage"
                                size={100}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge value={78} color={THEME.success} label="Available" size={100} />
                        </div>
                    </div>

                    <Panel title="Pool Status (pgBouncer)" icon={Network} accentColor={THEME.ai}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {[
                                { label: 'Available', value: demoData.poolMetrics.available, color: THEME.success },
                                { label: 'Active', value: demoData.poolMetrics.active, color: THEME.ai },
                                { label: 'Waiting', value: demoData.poolMetrics.waiting, color: THEME.warning },
                                { label: 'Max', value: demoData.poolMetrics.max, color: THEME.textMuted },
                            ].map((item) => (
                                <div key={item.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 4 }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'pool-metrics') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Pool Utilization Trend" icon={Droplets} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={demoData.poolTrends}>
                                <defs>
                                    <linearGradient id="colorPoolUtil" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.ai} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="utilization"
                                    stroke={THEME.ai}
                                    fillOpacity={1}
                                    fill="url(#colorPoolUtil)"
                                    name="Utilization %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'replication-wal') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Replication Lag (WAL)" icon={Radio} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={demoData.replicationLag}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="replica1"
                                    stroke={THEME.success}
                                    strokeWidth={2}
                                    name="Replica 1"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="replica2"
                                    stroke={THEME.ai}
                                    strokeWidth={2}
                                    name="Replica 2"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="WAL Archiving" icon={Archive} accentColor={THEME.ai}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '16px',
                            }}
                        >
                            {[
                                { label: 'Archive Count', value: demoData.walMetrics.archiveCount.toLocaleString() },
                                { label: 'Archive Size', value: demoData.walMetrics.archiveSize },
                                { label: 'Last Archive', value: demoData.walMetrics.lastArchive },
                                { label: 'Replication Slots', value: demoData.walMetrics.replicationSlots },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.ai }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'checkpoint-monitor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Checkpoint Activity" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.checkpointMetrics.map((cp) => (
                                <div
                                    key={cp.type}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {cp.type}
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 10,
                                            fontSize: 10,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>Last: {cp.last}</span>
                                        <span>Duration: {cp.duration}</span>
                                        <span>Buffers: {cp.buffers}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'vacuum-maintenance') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Vacuum Status" icon={RefreshCw} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.vacuumStats.map((t) => (
                                <div
                                    key={t.table}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                            {t.table}
                                        </span>
                                        <span style={{ fontSize: 9, color: THEME.textDim }}>
                                            Dead tuples: {t.deadTuples.toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>
                                        {t.tuples.toLocaleString()} rows • {t.lastVacuum}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'capacity-planning') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RingGauge value={97} color={THEME.warning} label="Used %" size={100} />
                        </div>
                    </div>

                    <Panel title="Storage Capacity" icon={BarChart2} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Used', value: '1987 GB', color: THEME.warning },
                                { label: 'Total', value: '2048 GB', color: THEME.textMuted },
                                { label: 'Growth Rate', value: '12 GB/week', color: THEME.ai },
                                { label: 'Projected Full', value: '42 days', color: THEME.danger },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 0',
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{item.label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'backup-recovery') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Backup History" icon={Archive} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.backupHistory.map((b) => (
                                <div
                                    key={b.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${THEME.success}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                            {b.name}
                                        </span>
                                        <StatusBadge label={b.status} color={THEME.success} />
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 10,
                                            fontSize: 9,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span>{b.size}</span>
                                        <span>{b.duration}</span>
                                        <span>{b.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // SECURITY SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'security' && itemKey === 'security-compliance') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric
                            icon={Lock}
                            label="SSL Connections"
                            value={`${demoData.sslRatio}%`}
                            color={THEME.success}
                        />
                        <HeroMetric
                            icon={ShieldCheck}
                            label="Roles"
                            value={demoData.roleStats.length}
                            color={THEME.ai}
                        />
                        <HeroMetric icon={CheckCircle} label="Compliance" value="GDPR" color={THEME.primary} />
                    </div>

                    <Panel title="Role Management" icon={Shield} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.roleStats.map((role) => (
                                <div
                                    key={role.role}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: THEME.textMain,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {role.role}
                                        </span>
                                        <span style={{ fontSize: 10, color: THEME.ai }}>{role.conns} connections</span>
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>Permissions: {role.perms}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Audit Log" icon={AlertTriangle} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {demoData.auditEvents.map((evt, i) => (
                                <div
                                    key={i}
                                    className="dpg-table-row"
                                    style={{
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        fontSize: 10,
                                        color: THEME.textMuted,
                                    }}
                                >
                                    <span style={{ fontFamily: THEME.fontMono }}>{evt.event}</span>
                                    <span>{evt.user}</span>
                                    <span style={{ color: THEME.success }}>{evt.status}</span>
                                    <span style={{ color: THEME.textDim }}>{evt.time}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // OBSERVABILITY SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'observability' && itemKey === 'observability-hub') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Data Collection" icon={Eye} accentColor={THEME.warning}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {[
                                { name: 'PostgreSQL Logs', status: 'active' },
                                { name: 'Metrics Export', status: 'active' },
                                { name: 'Query Tracing', status: 'active' },
                                { name: 'Slow Query Log', status: 'active' },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: THEME.textMuted }}>{item.name}</div>
                                    <StatusBadge label={item.status.toUpperCase()} color={THEME.success} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'cloudwatch') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="AWS CloudWatch Integration" icon={Cloud} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            Connected to CloudWatch
                            <br />
                            Syncing metrics every 60 seconds
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'log-patterns') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Log Pattern Trends" icon={FileSearch} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.logPatterns.map((pattern) => (
                                <div
                                    key={pattern.pattern}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                            {pattern.pattern}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 9,
                                                color:
                                                    pattern.trending === 'up'
                                                        ? THEME.danger
                                                        : pattern.trending === 'down'
                                                          ? THEME.success
                                                          : THEME.textMuted,
                                            }}
                                        >
                                            {pattern.trending.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.ai }}>
                                        {pattern.frequency.toLocaleString()} occurrences
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'opentelemetry') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="OpenTelemetry Collector" icon={Radar} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            Collector Active
                            <br />
                            Exporting traces, metrics, logs
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'kubernetes') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Kubernetes Cluster Info" icon={Container} accentColor={THEME.primary}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            K8s Integration Enabled
                            <br />
                            Monitoring 4 nodes, 12 pods
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'status-page') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Service Status" icon={Globe} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { service: 'API Server', status: 'operational' },
                                { service: 'Database', status: 'operational' },
                                { service: 'Cache Layer', status: 'operational' },
                                { service: 'Replication', status: 'operational' },
                            ].map((item) => (
                                <div
                                    key={item.service}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 0',
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{item.service}</span>
                                    <StatusBadge label={item.status.toUpperCase()} color={THEME.success} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'ai-monitoring') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="AI Anomaly Detection" icon={Brain} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            Monitoring for anomalies
                            <br />
                            Confidence: 96.2%
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DEVELOPER TOOLS SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'developer' && itemKey === 'sql-console') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="SQL Console" icon={Terminal} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: 10,
                                color: THEME.textMuted,
                                background: THEME.glass,
                                padding: '12px',
                                borderRadius: 6,
                                lineHeight: 1.6,
                                minHeight: 200,
                            }}
                        >
                            {`> SELECT version();
 PostgreSQL 16.2 on x86_64-pc-linux-gnu

> SELECT COUNT(*) FROM orders;
 COUNT
-------
 2450000

> EXPLAIN ANALYZE SELECT * FROM users;
 Seq Scan on users  (cost=0.00..3240.00 rows=145000 width=512)
   Execution Time: 142.234 ms`}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'api-tracing') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Recent Queries" icon={Cpu} accentColor={THEME.primary}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {demoData.recentQueries.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 9,
                                            fontFamily: THEME.fontMono,
                                            color: THEME.textMuted,
                                            marginBottom: 6,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {q.query}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>{q.time}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'repository') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Repository" icon={GitBranch} accentColor={THEME.primary}>
                        <div
                            style={{
                                fontSize: 12,
                                color: THEME.textMuted,
                                padding: '40px 20px',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: THEME.glass,
                            }}
                        >
                            Git repository integration
                            <br />
                            Branch: main • Last commit: 2h ago
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'ai-advisor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="AI Query Advisor" icon={Brain} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                {
                                    query: 'SELECT * FROM orders WHERE status = $1',
                                    advice: 'Add index on (status) for faster filtering',
                                    impact: 'High',
                                },
                                {
                                    query: 'JOIN orders, users WHERE orders.user_id = users.id',
                                    advice: 'Use INNER JOIN syntax for clarity',
                                    impact: 'Low',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 9,
                                            fontFamily: THEME.fontMono,
                                            color: THEME.textMuted,
                                            marginBottom: 6,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {item.query}
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.ai, marginBottom: 4 }}>
                                        💡 {item.advice}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            color: item.impact === 'High' ? THEME.danger : THEME.textDim,
                                        }}
                                    >
                                        Impact: {item.impact}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // Default fallback
        return (
            <Panel title="Content Not Found" icon={AlertTriangle} accentColor={THEME.danger}>
                <div style={{ padding: '20px', textAlign: 'center', color: THEME.textMuted }}>
                    Section: {sectionKey} • Item: {itemKey}
                </div>
            </Panel>
        );
    };

    return (
        <DemoLayout
            title="PostgreSQL Demo"
            titleIcon={Database}
            accentColor={THEME.primary}
            sections={sections}
            renderContent={renderContent}
        />
    );
}

export default DemoPostgresTab;
