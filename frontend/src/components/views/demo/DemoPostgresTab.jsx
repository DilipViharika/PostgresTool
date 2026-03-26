import React, { useMemo, useState } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import DemoLayout, {
    Panel,
    StatusBadge,
    RingGauge,
    MiniSparkline,
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
    LayoutDashboard,
    Gauge,
    Users,
    FileText,
    Settings,
    Calendar,
    Code,
    Download,
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
    const [perfTab, setPerfTab] = useState('activity');
    const [alertsTab, setAlertsTab] = useState('active');
    const [queryTab, setQueryTab] = useState('optimizer');
    const [resourcesTab, setResourcesTab] = useState('inventory');
    const [bloatTab, setBloatTab] = useState('table-bloat');
    const [logTab, setLogTab] = useState('wait-events');
    const [repoTab, setRepoTab] = useState('code');
    const [tableTab, setTableTab] = useState('findings');

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const indexed24h = base24h.map((d, i) => ({ ...d, index: i }));

        return {
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
            iopsLatency: indexed24h.map((d) => ({
                ...d,
                iops: Math.floor(2500 + Math.sin(d.index / 5) * 800 + Math.random() * 400),
                latency: Math.floor(8 + Math.cos(d.index / 7) * 3 + Math.random() * 2),
            })),
            databaseList: [
                { name: 'prod_main', size: '145 GB', connections: 89, txns: '1.2M' },
                { name: 'analytics', size: '67 GB', connections: 23, txns: '450K' },
                { name: 'staging', size: '52 GB', connections: 12, txns: '320K' },
            ],
            sessionList: [
                {
                    pid: 12845,
                    user: 'app_user',
                    query: 'SELECT * FROM orders WHERE...',
                    duration: '2.3s',
                    state: 'active',
                },
                {
                    pid: 12901,
                    user: 'analytics',
                    query: 'INSERT INTO logs VALUES...',
                    duration: '5.1s',
                    state: 'active',
                },
                {
                    pid: 12756,
                    user: 'system',
                    query: 'VACUUM ANALYZE public.users',
                    duration: '12.4s',
                    state: 'active',
                },
            ],
            slowQueries: [
                { query: 'SELECT COUNT(*) FROM orders o LEFT JOIN...', duration: 3240, calls: 145 },
                { query: 'UPDATE inventory SET qty = qty - 1 WHERE...', duration: 1890, calls: 89 },
                { query: "DELETE FROM audit_logs WHERE created_at {'<'} NOW()...", duration: 876, calls: 23 },
            ],
            tableList: [
                { name: 'users', rows: '2.3M', size: '845 MB', indexSize: '234 MB', bloat: 12 },
                { name: 'orders', rows: '8.9M', size: '2.1 GB', indexSize: '567 MB', bloat: 8 },
                { name: 'products', rows: '450K', size: '123 MB', indexSize: '45 MB', bloat: 3 },
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
        {
            key: 'admin',
            label: 'Admin',
            icon: Shield,
            accent: THEME.danger,
            items: [
                { key: 'dba-tasks', label: 'DBA Task Scheduler' },
                { key: 'user-management', label: 'User Management' },
                { key: 'admin-panel', label: 'Admin Panel' },
                { key: 'data-retention', label: 'Data Retention' },
                { key: 'report-builder', label: 'Report Builder' },
                { key: 'terraform-export', label: 'Terraform Export' },
                { key: 'custom-dashboards', label: 'Custom Dashboards' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        // FLEET OVERVIEW
        if (sectionKey === 'overview' && itemKey === 'fleet-overview') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatusBadge label="Operational" color={THEME.success} pulse />
                        <StatusBadge label="4 Instances" color={THEME.primary} />
                        <StatusBadge label="PostgreSQL 16.2" color={THEME.textMuted} />
                        <StatusBadge label="0 Errors" color={THEME.success} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={Server}
                            label="Total Servers"
                            value="4"
                            sub="online"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            trend="+0"
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Healthy"
                            value="4"
                            sub="of 4"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            trend="+1"
                            trendUp
                        />
                        <MetricCard
                            icon={Clock}
                            label="Avg Uptime"
                            value="98.2%"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 95 + Math.random() * 5)}
                            trend="+0.3%"
                            trendUp
                        />
                        <MetricCard
                            icon={Cpu}
                            label="Fleet Load"
                            value="34.2%"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 20 + Math.random() * 30)}
                            trend="+2.1%"
                            trendUp={false}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Total Storage"
                            value="645 GB"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Network}
                            label="Net Throughput"
                            value="2.3 Gbps"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            trend="-0.2 Gbps"
                            trendUp={false}
                        />
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
                                        <linearGradient id="qps-grad" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="qps"
                                        stroke={THEME.ai}
                                        fillOpacity={1}
                                        fill="url(#qps-grad)"
                                        name="QPS"
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

                    <Panel title="Fleet Instances" icon={Server} accentColor={THEME.primary}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '10px',
                            }}
                        >
                            {['prod-db-01', 'prod-db-02', 'prod-db-03', 'prod-db-04'].map((name) => (
                                <div
                                    key={name}
                                    style={{
                                        padding: '12px 14px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 10,
                                        fontSize: 11,
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: THEME.textMain, marginBottom: 6 }}>
                                        {name}
                                    </div>
                                    <div style={{ fontSize: 9.5, color: THEME.textDim, lineHeight: 1.4 }}>
                                        <div>CPU: 28%</div>
                                        <div>Mem: 52 GB</div>
                                        <div style={{ color: THEME.success }}>Online</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Region Distribution" icon={Globe} accentColor={THEME.primary}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { region: 'US-East', servers: 2, latency: '3.2ms' },
                                { region: 'EU-West', servers: 1, latency: '42ms' },
                                { region: 'APAC', servers: 1, latency: '156ms' },
                            ].map((r) => (
                                <div
                                    key={r.region}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 10,
                                    }}
                                >
                                    <div style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted }}>
                                        {r.region}
                                    </div>
                                    <div
                                        style={{ fontSize: 16, fontWeight: 700, color: THEME.primary, margin: '6px 0' }}
                                    >
                                        {r.servers}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>Latency: {r.latency}</div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Fleet Health Score" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                            <RingGauge value={94} color={THEME.success} size={100} label="Overall" />
                            <RingGauge value={89} color={THEME.primary} size={100} label="Reliability" />
                            <RingGauge value={99} color={THEME.ai} size={100} label="Performance" />
                        </div>
                    </Panel>
                </div>
            );
        }

        // DATABASE OVERVIEW
        if (sectionKey === 'overview' && itemKey === 'database-overview') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatusBadge label="Operational" color={THEME.success} pulse />
                        <StatusBadge label="Production" color={THEME.danger} />
                        <StatusBadge label="PostgreSQL 16.2" color={THEME.primary} />
                        <StatusBadge label="0 connections" color={THEME.success} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={Activity}
                            label="Active Sessions"
                            value="52"
                            sub="of 100 max"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 40 + Math.random() * 30)}
                            trend="+2.3%"
                            trendUp
                        />
                        <MetricCard
                            icon={Zap}
                            label="Cache Hit Ratio"
                            value="99.4%"
                            sub="Excellent"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 98 + Math.random() * 2)}
                            trend="+0.1%"
                            trendUp
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Database Size"
                            value="264 GB"
                            sub="on disk"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            trend="+1.2%"
                        />
                        <MetricCard
                            icon={Clock}
                            label="Uptime"
                            value="45 d"
                            sub="99.97%"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 99 + Math.random() * 1)}
                        />
                        <MetricCard
                            icon={Lock}
                            label="Long Txns"
                            value="3"
                            sub={'> 1 min'}
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 5)}
                            warn
                        />
                        <MetricCard
                            icon={RefreshCw}
                            label="Urgent Vacuum"
                            value="5"
                            sub="tables"
                            color={THEME.danger}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 8)}
                            warn
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                        <Panel title="Last Backup" icon={Archive} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 3 }}>Type</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>
                                        Full backup
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 3 }}>Status</div>
                                    <StatusBadge label="Verified" color={THEME.success} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: THEME.primary }}>4h</div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>ago</div>
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, lineHeight: 1.5 }}>
                                    <div>12.4 GB compressed</div>
                                    <div>Took 4m 32s</div>
                                    <div>Next: 02:00 UTC</div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Long-Running Txns" icon={Clock} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ fontSize: 9.5, color: THEME.textDim }}>
                                    <div style={{ fontWeight: 700, marginBottom: 4 }}>PID 54231</div>
                                    <div>UPDATE public.orders...</div>
                                    <div
                                        style={{ fontSize: 14, fontWeight: 700, color: THEME.warning, margin: '6px 0' }}
                                    >
                                        18m 42s
                                    </div>
                                    <div
                                        style={{
                                            height: 4,
                                            borderRadius: 2,
                                            background: THEME.glassBorder,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '87%',
                                                background: THEME.danger,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        color: THEME.textDim,
                                        paddingTop: 6,
                                        borderTop: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    <div style={{ fontWeight: 700, marginBottom: 4 }}>PID 54188</div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <StatusBadge label="Wait:Lock" color={THEME.warning} />
                                        <StatusBadge label="Idle in Txn" color={THEME.textMuted} />
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Vacuum Health" icon={RefreshCw} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 3 }}>
                                        Tables tracked
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain }}>200</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>Status</div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            height: 16,
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div style={{ flex: '2.5%', background: THEME.danger }} title="5 URGENT" />
                                        <div style={{ flex: '6%', background: THEME.warning }} title="12 SOON" />
                                        <div style={{ flex: '91.5%', background: THEME.success }} title="183 healthy" />
                                    </div>
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, lineHeight: 1.5 }}>
                                    <div>Dead tuples: 182.4K</div>
                                    <div>Last: public.orders 3s</div>
                                    <div>Bloat: 4.2%</div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Cluster Velocity" icon={TrendingUp} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <defs>
                                    <linearGradient id="qps-clip" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.ai} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={THEME.ai} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="tps-clip" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="qps"
                                    stroke={THEME.ai}
                                    fill="url(#qps-clip)"
                                    fillOpacity={1}
                                    name="QPS"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tps"
                                    stroke={THEME.success}
                                    fill="url(#tps-clip)"
                                    fillOpacity={1}
                                    name="TPS"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                        <Panel title="Database Health" icon={CheckCircle} accentColor={THEME.success}>
                            <div style={{ display: 'flex', gap: 30, justifyContent: 'center' }}>
                                <RingGauge value={86} color={THEME.ai} size={100} label="Cache Hit %" />
                                <RingGauge value={52} color={THEME.primary} size={100} label="Conn Usage" />
                            </div>
                        </Panel>

                        <Panel title="Top Impacted Tables" icon={TableProperties} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { name: 'public.orders', ops: '51.0K', reads: 65, writes: 35 },
                                    { name: 'public.events', ops: '45.0K', reads: 78, writes: 22 },
                                    { name: 'public.users', ops: '23.4K', reads: 92, writes: 8 },
                                ].map((t, i) => (
                                    <div key={i}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 10,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <span style={{ color: THEME.textMain, fontWeight: 600 }}>{t.name}</span>
                                            <span style={{ color: THEME.ai, fontWeight: 700 }}>{t.ops}</span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                height: 6,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: t.reads,
                                                    background: THEME.success,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    flex: t.writes,
                                                    background: THEME.danger,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    <Panel title="WAL & Checkpoints" icon={Archive} accentColor={THEME.warning}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                    WAL GENERATION
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: THEME.primary }}>12.4</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>MB/s</div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <MiniSparkline
                                        data={Array.from({ length: 12 }, () => 8 + Math.random() * 8)}
                                        color={THEME.primary}
                                        width={100}
                                        height={24}
                                    />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                    CHECKPOINT AVG
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: THEME.success }}>428</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>ms</div>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>STATUS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <StatusBadge label="Running" color={THEME.success} />
                                    <StatusBadge label="In-Progress" color={THEME.primary} />
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // PERFORMANCE
        if (sectionKey === 'overview' && itemKey === 'performance') {
            const perfTabKey = perfTab || 'activity';
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'activity', label: 'Activity & Queries', icon: Zap },
                            { key: 'deep', label: 'Deep Insights', badge: 'NEW' },
                            { key: 'resources', label: 'Resources & Health' },
                        ]}
                        active={perfTabKey}
                        onChange={setPerfTab}
                        accentColor={THEME.primary}
                    />

                    {/* ── TAB 1: Activity & Queries ── */}
                    {perfTabKey === 'activity' && (
                        <>
                            <Panel title="LIVE SESSIONS" icon={Activity} accentColor={THEME.success}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: 12,
                                    }}
                                >
                                    {[
                                        { label: 'ACTIVE', value: '42', icon: Activity, color: THEME.success },
                                        { label: 'LONG RUNNING', value: '7', icon: Clock, color: THEME.warning },
                                        { label: 'IDLE', value: '31', icon: Server, color: THEME.textMuted },
                                        { label: 'BLOCKED', value: '2', icon: Lock, color: THEME.danger },
                                    ].map((s, i) => (
                                        <div key={i} style={{ textAlign: 'center', padding: '16px 8px' }}>
                                            <div
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: '50%',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: `${s.color}15`,
                                                    border: `1px solid ${s.color}25`,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <s.icon size={16} color={s.color} />
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: THEME.textDim,
                                                    textTransform: 'uppercase',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {s.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 28,
                                                    fontWeight: 700,
                                                    color: s.color,
                                                    fontFamily: THEME.fontMono,
                                                }}
                                            >
                                                {s.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            <Panel title="SESSION TRAFFIC" icon={Network} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={240}>
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
                                            strokeWidth={2.5}
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

                            <Panel title="SLOW QUERY TRENDS" icon={Zap} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'query', label: 'QUERY', width: '55%' },
                                        { key: 'duration', label: 'AVG DURATION', width: '25%' },
                                        { key: 'calls', label: 'CALLS', width: '20%' },
                                    ]}
                                    rows={demoData.slowQueries.map((q) => ({
                                        query: q.query,
                                        duration: `${(q.duration / 1000).toFixed(2)}s`,
                                        calls: q.calls.toLocaleString(),
                                    }))}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 2: Deep Insights ── */}
                    {perfTabKey === 'deep' && (
                        <>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                                {[
                                    'Wait Events',
                                    'Slow Query Trend',
                                    'JIT Compilation',
                                    'Parallel Workers',
                                    'Blocking Tree',
                                    'Deadlock History',
                                    'Plan Cache',
                                    'Temp Files',
                                ].map((sub, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: 20,
                                            background: i === 3 ? THEME.primary : THEME.glass,
                                            color: i === 3 ? THEME.bg : THEME.textMuted,
                                            border: `1px solid ${i === 3 ? THEME.primary : THEME.glassBorder}`,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {sub}
                                    </div>
                                ))}
                            </div>

                            <Panel title="PARALLEL QUERY UTILIZATION" icon={Cpu} accentColor={THEME.primary}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                        gap: 12,
                                        marginBottom: 16,
                                    }}
                                >
                                    <LiveMetric label="MAX WORKERS" value="8" icon={Server} color={THEME.primary} />
                                    <LiveMetric label="PER GATHER" value="4" icon={Activity} color={THEME.success} />
                                    <LiveMetric label="AVG ACTIVE" value="3.5" icon={TrendingUp} color={THEME.ai} />
                                    <LiveMetric label="UTILIZATION" value="44%" icon={Gauge} color={THEME.warning} />
                                </div>
                            </Panel>

                            <Panel title="WORKER UTILIZATION OVER TIME" icon={BarChart2} accentColor={THEME.ai}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart
                                        data={demoData.connectionTrends.map((d, i) => ({
                                            ...d,
                                            workers: Math.floor(2 + Math.sin(i / 4) * 3 + Math.random() * 2),
                                        }))}
                                    >
                                        <defs>
                                            <linearGradient id="pg-workers-grad" x1="0" y1="0" x2="0" y2="1">
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
                                            dataKey="workers"
                                            stroke={THEME.primary}
                                            fillOpacity={1}
                                            fill="url(#pg-workers-grad)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="ACTIVE PARALLEL QUERIES" icon={Zap} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        {
                                            name: 'Parallel Seq Scan',
                                            query: 'SELECT COUNT(*) FROM large_table WHERE...',
                                            speedup: '68% faster',
                                            workers: '5/4 workers',
                                            color: THEME.success,
                                        },
                                        {
                                            name: 'Parallel Hash Join',
                                            query: 'SELECT o.* FROM orders o JOIN products p...',
                                            speedup: '52% faster',
                                            workers: '3/4 workers',
                                            color: THEME.primary,
                                        },
                                    ].map((pq, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 8,
                                                border: `1px solid ${THEME.glassBorder}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>
                                                    {pq.name}
                                                </span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: pq.color }}>
                                                    {pq.speedup}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontFamily: THEME.fontMono,
                                                    color: THEME.textDim,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {pq.query}
                                            </div>
                                            <div
                                                style={{
                                                    background: THEME.gridDark,
                                                    borderRadius: 4,
                                                    height: 8,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    gap: 2,
                                                }}
                                            >
                                                {Array.from({ length: 8 }, (_, j) => (
                                                    <div
                                                        key={j}
                                                        style={{
                                                            flex: 1,
                                                            height: '100%',
                                                            background:
                                                                j < (i === 0 ? 5 : 3) ? pq.color : 'transparent',
                                                            borderRadius: 2,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: THEME.textDim,
                                                    marginTop: 4,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {pq.workers}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: Resources & Health ── */}
                    {perfTabKey === 'resources' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                {[
                                    { label: 'P50 AVG', value: '2.3ms', sub: '↓ 0.2ms vs 1h', color: THEME.primary },
                                    { label: 'P95 AVG', value: '8.7ms', sub: '↑ 1.2ms vs 1h', color: THEME.ai },
                                    { label: 'P99 AVG', value: '31ms', sub: '↑ 4.1ms vs 1h', color: THEME.warning },
                                    { label: 'SLA BREACH', value: '0.2%', sub: 'Target: 0.1%', color: THEME.danger },
                                ].map((p, i) => (
                                    <Panel key={i} noPad title={p.label} accentColor={p.color}>
                                        <div
                                            style={{
                                                padding: '14px 16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: p.color,
                                                    fontFamily: THEME.fontMono,
                                                }}
                                            >
                                                {p.value}
                                            </div>
                                            <div style={{ fontSize: 9, color: THEME.textDim }}>{p.sub}</div>
                                        </div>
                                    </Panel>
                                ))}
                            </div>

                            <Panel title="TRANSACTION LATENCY PERCENTILES" icon={Clock} accentColor={THEME.ai}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={demoData.iopsLatency}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="latency"
                                            stroke={THEME.ai}
                                            strokeWidth={2.5}
                                            name="P99"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="iops"
                                            stroke={THEME.success}
                                            strokeWidth={2}
                                            name="P95"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                                <Panel title="CPU Load" icon={Cpu} accentColor={THEME.primary}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={38} color={THEME.primary} size={100} label="Usage" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>4 cores active</div>
                                            <div>Load avg: 1.8</div>
                                            <div>I/O Wait: 22%</div>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Memory Usage" icon={HardDrive} accentColor={THEME.warning}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={72} color={THEME.warning} size={100} label="Allocated" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>12 GB / 16 GB</div>
                                            <div>Shared Buf: 55%</div>
                                            <div>Swap: 0 GB</div>
                                        </div>
                                    </div>
                                </Panel>
                                <Panel title="Disk I/O" icon={HardDrive} accentColor={THEME.ai}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={44} color={THEME.ai} size={100} label="Utilization" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>0 GB / 200 GB SSD</div>
                                            <div>Write Amp: 30%</div>
                                            <div>IOPS: 2,847</div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        // RESOURCES
        if (sectionKey === 'overview' && itemKey === 'resources') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'inventory', label: 'Table Inventory' },
                            { key: 'analytics', label: 'Analytics' },
                            { key: 'storage', label: 'Storage & I/O' },
                            { key: 'dead-code', label: 'Dead Code' },
                            { key: 'retention', label: 'Retention' },
                            { key: 'maintenance', label: 'Maintenance' },
                        ]}
                        active={resourcesTab}
                        onChange={setResourcesTab}
                        accentColor={THEME.primary}
                    />

                    {/* ── TAB 1: Table Inventory ── */}
                    {resourcesTab === 'inventory' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={Database}
                                    label="Total Tables"
                                    value="45"
                                    color={THEME.primary}
                                    spark={Array.from({ length: 12 }, () => 40 + Math.random() * 10)}
                                />
                                <MetricCard
                                    icon={HardDrive}
                                    label="Total Size"
                                    value="8.7 GB"
                                    color={THEME.warning}
                                    trend="+2.4%"
                                />
                                <MetricCard icon={Layers} label="Indexes" value="128" color={THEME.ai} />
                                <MetricCard icon={CheckCircle} label="Healthy" value="42" color={THEME.success} />
                            </div>
                            <Panel title="Table Inventory & Metrics" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'table', label: 'Table' },
                                        { key: 'rows', label: 'Rows' },
                                        { key: 'size', label: 'Size' },
                                        { key: 'toastRatio', label: 'TOAST' },
                                        { key: 'indexRatio', label: 'Index Ratio' },
                                        { key: 'lastVacuum', label: 'Last Vacuum' },
                                        { key: 'health', label: 'Health' },
                                    ]}
                                    rows={[
                                        {
                                            table: 'users',
                                            rows: '2.3M',
                                            size: '845 MB',
                                            toastRatio: '12%',
                                            indexRatio: '65%',
                                            lastVacuum: '2h ago',
                                            health: <StatusBadge label="Good" color={THEME.success} />,
                                        },
                                        {
                                            table: 'orders',
                                            rows: '8.9M',
                                            size: '2.1 GB',
                                            toastRatio: '8%',
                                            indexRatio: '72%',
                                            lastVacuum: '45m ago',
                                            health: <StatusBadge label="Good" color={THEME.success} />,
                                        },
                                        {
                                            table: 'products',
                                            rows: '450K',
                                            size: '123 MB',
                                            toastRatio: '5%',
                                            indexRatio: '58%',
                                            lastVacuum: '1h ago',
                                            health: <StatusBadge label="Good" color={THEME.success} />,
                                        },
                                        {
                                            table: 'sessions',
                                            rows: '12.4M',
                                            size: '890 MB',
                                            toastRatio: '2%',
                                            indexRatio: '45%',
                                            lastVacuum: '6h ago',
                                            health: <StatusBadge label="Warn" color={THEME.warning} />,
                                        },
                                        {
                                            table: 'audit_logs',
                                            rows: '45.2M',
                                            size: '4.5 GB',
                                            toastRatio: '18%',
                                            indexRatio: '32%',
                                            lastVacuum: '12h ago',
                                            health: <StatusBadge label="Good" color={THEME.success} />,
                                        },
                                        {
                                            table: 'inventory',
                                            rows: '1.2M',
                                            size: '234 MB',
                                            toastRatio: '3%',
                                            indexRatio: '78%',
                                            lastVacuum: '3h ago',
                                            health: <StatusBadge label="Good" color={THEME.success} />,
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 2: Analytics ── */}
                    {resourcesTab === 'analytics' && (
                        <>
                            <Panel title="Table Growth Trends" icon={TrendingUp} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={demoData.cpuMemory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="cpu"
                                            stroke={THEME.primary}
                                            fill={`${THEME.primary}15`}
                                            name="Users Table"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="memory"
                                            stroke={THEME.warning}
                                            fill={`${THEME.warning}15`}
                                            name="Orders Table"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                            <Panel title="Table Analytics" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'table', label: 'Table' },
                                        { key: 'rows', label: 'Rows' },
                                        { key: 'growth', label: 'Monthly Growth' },
                                        { key: 'health', label: 'Health' },
                                    ]}
                                    rows={[
                                        {
                                            table: 'users',
                                            rows: '2.3M',
                                            growth: '+14K',
                                            health: 'Good',
                                        },
                                        {
                                            table: 'orders',
                                            rows: '8.9M',
                                            growth: '+245K',
                                            health: 'Good',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: Storage & I/O ── */}
                    {resourcesTab === 'storage' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '12px',
                                }}
                                className="dpg-stagger"
                            >
                                <MetricCard
                                    icon={Cpu}
                                    label="CPU Load"
                                    value="38%"
                                    sub="Normal"
                                    color={THEME.primary}
                                    spark={Array.from({ length: 12 }, () => 25 + Math.random() * 30)}
                                    trend="+3.2%"
                                />
                                <MetricCard
                                    icon={HardDrive}
                                    label="Memory Usage"
                                    value="72%"
                                    sub="12 GB / 16 GB"
                                    color={THEME.warning}
                                    spark={Array.from({ length: 12 }, () => 60 + Math.random() * 20)}
                                    trend="+1.8%"
                                />
                                <MetricCard
                                    icon={HardDrive}
                                    label="Disk I/O"
                                    value="44%"
                                    sub="Normal"
                                    color={THEME.ai}
                                    spark={Array.from({ length: 12 }, () => 30 + Math.random() * 30)}
                                />
                                <MetricCard
                                    icon={Network}
                                    label="Network"
                                    value="340 MB/s"
                                    sub="Egress"
                                    color={THEME.success}
                                    spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                                    trend="+12 MB/s"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                <Panel title="CPU Load" icon={Cpu} accentColor={THEME.primary}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={38} color={THEME.primary} size={100} label="Usage" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>4 cores active</div>
                                            <div>Load avg: 1.8</div>
                                            <div>I/O Wait: 22%</div>
                                        </div>
                                    </div>
                                </Panel>

                                <Panel title="Memory Usage" icon={HardDrive} accentColor={THEME.warning}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={72} color={THEME.warning} size={100} label="Allocated" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>12 GB / 16 GB</div>
                                            <div>Shared Buf: 55%</div>
                                            <div>Swap: 0 GB</div>
                                        </div>
                                    </div>
                                </Panel>

                                <Panel title="Disk I/O" icon={HardDrive} accentColor={THEME.ai}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <RingGauge value={44} color={THEME.ai} size={100} label="Utilization" />
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: 9,
                                                color: THEME.textDim,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            <div>0 GB / 200 GB SSD</div>
                                            <div>Write Amp: 30%</div>
                                            <div>IOPS: 2,847</div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <Panel title="IOPS & Latency" icon={BarChart2} accentColor={THEME.ai}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={demoData.iopsLatency}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="iops"
                                            stroke={THEME.ai}
                                            strokeWidth={2}
                                            name="IOPS"
                                            yAxisId="left"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="latency"
                                            stroke={THEME.warning}
                                            strokeWidth={2}
                                            name="Latency (ms)"
                                            yAxisId="right"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 4: Dead Code ── */}
                    {resourcesTab === 'dead-code' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard icon={Database} label="Unused Tables" value="3" color={THEME.warning} />
                                <MetricCard icon={Layers} label="Unused Indexes" value="8" color={THEME.danger} />
                                <MetricCard icon={HardDrive} label="Wasted Space" value="245 MB" color={THEME.danger} />
                            </div>
                            <Panel title="Unused Tables & Indexes" icon={Database} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'name', label: 'Name' },
                                        { key: 'type', label: 'Type' },
                                        { key: 'size', label: 'Size' },
                                        { key: 'action', label: 'Recommendation' },
                                    ]}
                                    rows={[
                                        {
                                            name: 'legacy_users',
                                            type: 'Table',
                                            size: '124 MB',
                                            action: 'Archive',
                                        },
                                        {
                                            name: 'idx_old_timestamp',
                                            type: 'Index',
                                            size: '45 MB',
                                            action: 'Drop',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 5: Retention ── */}
                    {resourcesTab === 'retention' && (
                        <>
                            <Panel title="Retention Policies" icon={Archive} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'table', label: 'Table' },
                                        { key: 'policy', label: 'Policy' },
                                        { key: 'retention', label: 'Retention Period' },
                                        { key: 'nextRun', label: 'Next Cleanup' },
                                    ]}
                                    rows={[
                                        {
                                            table: 'logs',
                                            policy: 'Time-based',
                                            retention: '30 days',
                                            nextRun: 'In 2d',
                                        },
                                        {
                                            table: 'audit_trail',
                                            policy: 'Size-based',
                                            retention: '1 GB',
                                            nextRun: 'In 5d',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 6: Maintenance ── */}
                    {resourcesTab === 'maintenance' && (
                        <>
                            <Panel title="Maintenance Logs" icon={RefreshCw} accentColor={THEME.success}>
                                <DataTable
                                    columns={[
                                        { key: 'operation', label: 'Operation' },
                                        { key: 'table', label: 'Table' },
                                        { key: 'duration', label: 'Duration' },
                                        { key: 'status', label: 'Status' },
                                    ]}
                                    rows={[
                                        {
                                            operation: 'VACUUM ANALYZE',
                                            table: 'users',
                                            duration: '2m 34s',
                                            status: 'Success',
                                        },
                                        {
                                            operation: 'REINDEX',
                                            table: 'orders',
                                            duration: '5m 12s',
                                            status: 'Success',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // RELIABILITY
        if (sectionKey === 'overview' && itemKey === 'reliability') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={CheckCircle}
                            label="Replication Lag"
                            value="12ms"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 10)}
                        />
                        <MetricCard
                            icon={Shield}
                            label="Backup Status"
                            value="OK"
                            sub="Verified"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Active Alerts"
                            value="2"
                            sub="critical"
                            color={THEME.danger}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 4)}
                            warn
                        />
                        <MetricCard
                            icon={Lock}
                            label="Lock Contention"
                            value="4"
                            sub="sessions"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 6)}
                        />
                        <MetricCard
                            icon={Clock}
                            label="Recovery RTO"
                            value="15m"
                            sub="Estimated"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Archive}
                            label="RPO Window"
                            value="30s"
                            sub="Data Loss"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Replication & Locks" icon={Link2} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, marginBottom: 8 }}>
                                    TOPOLOGY
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
                                    <div
                                        style={{
                                            padding: '6px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            color: THEME.primary,
                                            fontWeight: 600,
                                        }}
                                    >
                                        primary-1
                                    </div>
                                    <div style={{ color: THEME.textDim }}>{'→'}</div>
                                    <div
                                        style={{
                                            padding: '6px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            color: THEME.success,
                                        }}
                                    >
                                        replica-1 (lag: 3ms)
                                    </div>
                                    <div style={{ color: THEME.textDim }}>{'→'}</div>
                                    <div
                                        style={{
                                            padding: '6px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            color: THEME.success,
                                        }}
                                    >
                                        replica-2 (lag: 8ms)
                                    </div>
                                </div>
                            </div>

                            <div style={{ paddingTop: 8, borderTop: `1px solid ${THEME.glassBorder}` }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <StatusBadge label="BLOCKED QUERIES 3" color={THEME.warning} />
                                    <StatusBadge label="Lock contention • Elevated" color={THEME.warning} />
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                        <Panel title="Backup History" icon={Archive} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { type: 'Full', time: '4h ago', size: '12.4 GB', status: 'Verified' },
                                    { type: 'Incr', time: '1h ago', size: '340 MB', status: 'Pending' },
                                    { type: 'Incr', time: '30m ago', size: '128 MB', status: 'Verified' },
                                ].map((b, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: 10,
                                            padding: '6px 0',
                                            borderBottom: i < 2 ? `1px solid ${THEME.glassBorder}` : 'none',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, color: THEME.textMain }}>{b.type}</div>
                                            <div style={{ fontSize: 8.5, color: THEME.textDim }}>{b.time}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: THEME.textMain }}>{b.size}</div>
                                            <StatusBadge
                                                label={b.status}
                                                color={b.status === 'Verified' ? THEME.success : THEME.primary}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Failover Status" icon={Shield} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                        RTO (Recovery)
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.primary }}>15 min</div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>Est. downtime</div>
                                </div>
                                <div style={{ paddingTop: 6, borderTop: `1px solid ${THEME.glassBorder}` }}>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>
                                        RPO (Data Loss)
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.success }}>30 sec</div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>Max data loss</div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Consistency Checks" icon={CheckCircle} accentColor={THEME.success}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '10px',
                            }}
                        >
                            {[
                                { check: 'Primary ↔ Replicas', status: 'OK', time: '2m ago' },
                                { check: 'Index Integrity', status: 'OK', time: '5m ago' },
                                { check: 'Foreign Keys', status: 'OK', time: '12m ago' },
                                { check: 'Checksums', status: 'OK', time: '18m ago' },
                            ].map((c, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '10px 12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        style={{ fontSize: 9, fontWeight: 600, color: THEME.textMain, marginBottom: 4 }}
                                    >
                                        {c.check}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: THEME.success,
                                            }}
                                        />
                                        <div style={{ fontSize: 8.5, color: THEME.textDim }}>{c.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Failover Drills" icon={Radar} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'date', label: 'DATE', width: '25%' },
                                { key: 'duration', label: 'DURATION', width: '20%' },
                                { key: 'result', label: 'RESULT', width: '30%' },
                                { key: 'notes', label: 'NOTES', width: '25%' },
                            ]}
                            rows={[
                                {
                                    date: '2024-03-22',
                                    duration: '8m 23s',
                                    result: 'Success',
                                    notes: 'All replicas synced',
                                },
                                {
                                    date: '2024-03-15',
                                    duration: '7m 55s',
                                    result: 'Success',
                                    notes: 'No data loss',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // ACTIVE ALERTS
        if (sectionKey === 'alerts' && itemKey === 'active-alerts') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* ── VIGIL Header ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                <Terminal size={16} color={THEME.ai} />
                                <span
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: THEME.textMain,
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    VIGIL
                                </span>
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: THEME.textDim,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 10,
                                        padding: '2px 6px',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    v3.0
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: THEME.textDim,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: THEME.success,
                                            display: 'inline-block',
                                        }}
                                    />
                                    Connected · Last sync 8s ago
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Users size={9} /> 3/5 online
                                    {['#6366f1', '#22d3a5', '#38bdf8'].map((c, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                background: `${c}30`,
                                                border: `1px solid ${c}50`,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 8,
                                                fontWeight: 700,
                                                color: c,
                                            }}
                                        >
                                            {['RB', 'JS', 'AK'][i]}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                padding: '6px 14px',
                                borderRadius: 6,
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                fontSize: 11,
                                color: THEME.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                            }}
                        >
                            <RefreshCw size={12} /> Refresh
                        </div>
                    </div>

                    {/* ── Stats Cards ── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: 12,
                        }}
                    >
                        {[
                            { label: 'TOTAL ALERTS', val: '7', sub: '5 unacknowledged', color: THEME.textMain },
                            { label: 'CRITICAL', val: '2', sub: 'requires attention', color: THEME.danger },
                            { label: 'WARNING', val: '3', sub: 'monitor closely', color: THEME.warning },
                            { label: 'ACTIVE RULES', val: '6/7', sub: 'rules enabled', color: THEME.ai },
                        ].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '14px 16px',
                                    background: THEME.glass,
                                    border: `1px solid ${THEME.glassBorder}`,
                                    borderRadius: 8,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: `radial-gradient(circle, ${s.color}12 0%, transparent 70%)`,
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: THEME.textDim,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        marginBottom: 6,
                                        fontWeight: 600,
                                    }}
                                >
                                    {s.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: s.color,
                                        lineHeight: 1,
                                        marginBottom: 4,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    {s.val}
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Live Metrics ── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                            gap: 12,
                        }}
                    >
                        <LiveMetric
                            icon={Cpu}
                            label="CPU Usage"
                            value="73"
                            unit="%"
                            color={THEME.warning}
                            progress={73}
                            spark={Array.from({ length: 12 }, () => 60 + Math.random() * 20)}
                        />
                        <LiveMetric
                            icon={HardDrive}
                            label="Memory"
                            value="61"
                            unit="%"
                            color={THEME.primary}
                            progress={61}
                            spark={Array.from({ length: 12 }, () => 50 + Math.random() * 20)}
                        />
                        <LiveMetric
                            icon={AlertTriangle}
                            label="Error Rate"
                            value="2.4"
                            unit="%"
                            color={THEME.danger}
                            progress={24}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 4)}
                        />
                        <LiveMetric
                            icon={Clock}
                            label="API Latency"
                            value="187"
                            unit="ms"
                            color={THEME.ai}
                            progress={56}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 150)}
                        />
                    </div>

                    {/* ── Tabs with badges ── */}
                    <TabPills
                        tabs={[
                            { key: 'active', label: 'Active', icon: Bell, badge: '5', badgeColor: THEME.danger },
                            { key: 'config', label: 'Config', icon: Settings },
                            { key: 'history', label: 'History', icon: Clock, badge: '⚠', badgeColor: THEME.warning },
                        ]}
                        active={alertsTab}
                        onChange={setAlertsTab}
                        accentColor={THEME.danger}
                    />

                    {/* ── TAB 1: Active ── */}
                    {alertsTab === 'active' && (
                        <>
                            {/* Search & Filter Bar */}
                            <div
                                style={{
                                    padding: '10px 14px',
                                    background: THEME.glass,
                                    border: `1px solid ${THEME.glassBorder}`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    gap: 10,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                                    <FileSearch
                                        size={12}
                                        style={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: THEME.textDim,
                                        }}
                                    />
                                    <div
                                        style={{
                                            paddingLeft: 30,
                                            padding: '7px 10px 7px 30px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 5,
                                            fontSize: 12,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        Search alerts, sources...
                                    </div>
                                </div>
                                {['All Severities', 'All Categories', 'All Status'].map((f, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '7px 12px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 5,
                                            fontSize: 11,
                                            color: THEME.textMuted,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {f} <span style={{ fontSize: 8, color: THEME.textDim }}>▼</span>
                                    </div>
                                ))}
                                <div
                                    style={{
                                        marginLeft: 'auto',
                                        padding: '6px 12px',
                                        borderRadius: 5,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        fontSize: 11,
                                        color: THEME.textDim,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Shield size={12} /> MAINTENANCE
                                </div>
                            </div>

                            {/* Approval Banner */}
                            <div
                                style={{
                                    padding: '10px 14px',
                                    background: `${THEME.warning}08`,
                                    border: `1px solid ${THEME.warning}30`,
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <Lock size={13} color={THEME.warning} />
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{ fontSize: 11, color: THEME.warning, fontWeight: 700, marginBottom: 2 }}
                                    >
                                        Approval Required
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>
                                        Ack requested by <span style={{ color: THEME.textMuted }}>john.smith</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <div
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: 5,
                                            background: `${THEME.success}15`,
                                            border: `1px solid ${THEME.success}30`,
                                            color: THEME.success,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CheckCircle size={11} /> Approve
                                    </div>
                                    <div
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: 5,
                                            background: `${THEME.danger}15`,
                                            border: `1px solid ${THEME.danger}30`,
                                            color: THEME.danger,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <AlertTriangle size={11} /> Reject
                                    </div>
                                </div>
                            </div>

                            {/* Alert Count Header */}
                            <div
                                style={{
                                    fontSize: 10,
                                    color: THEME.textDim,
                                    letterSpacing: '0.06em',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <span
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 3,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        display: 'inline-block',
                                    }}
                                />
                                7 ALERTS
                            </div>

                            {/* Alert List with rich detail */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {[
                                    {
                                        severity: 'CRIT',
                                        title: 'Unauthorized root access attempt detected on prod-auth-02',
                                        time: '2m ago',
                                        source: 'security_monitor',
                                        count: 7,
                                        color: THEME.danger,
                                        category: 'security',
                                    },
                                    {
                                        severity: 'CRIT',
                                        title: 'Replication Lag Exceeded 30s threshold',
                                        time: '5m ago',
                                        source: 'replica-01',
                                        count: 3,
                                        color: THEME.danger,
                                        category: 'replication',
                                    },
                                    {
                                        severity: 'WARN',
                                        title: 'Connection Pool Usage at 85%',
                                        time: '12m ago',
                                        source: 'app-pool',
                                        count: null,
                                        color: THEME.warning,
                                        category: 'connections',
                                    },
                                    {
                                        severity: 'WARN',
                                        title: 'Slow Query Detected (avg 4.2s)',
                                        time: '23m ago',
                                        source: 'query-monitor',
                                        count: null,
                                        color: THEME.warning,
                                        category: 'performance',
                                    },
                                    {
                                        severity: 'WARN',
                                        title: 'WAL Segment Backlog growing',
                                        time: '31m ago',
                                        source: 'wal-manager',
                                        count: null,
                                        color: THEME.warning,
                                        category: 'storage',
                                    },
                                    {
                                        severity: 'INFO',
                                        title: 'Automated vacuum completed on public.orders',
                                        time: '45m ago',
                                        source: 'maintenance',
                                        count: null,
                                        color: THEME.primary,
                                        category: 'maintenance',
                                    },
                                    {
                                        severity: 'INFO',
                                        title: 'Certificate renewal scheduled in 7 days',
                                        time: '1h ago',
                                        source: 'cert-monitor',
                                        count: null,
                                        color: THEME.primary,
                                        category: 'security',
                                    },
                                ].map((a, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: `1px solid ${THEME.glassBorder}`,
                                            display: 'flex',
                                            gap: 12,
                                            alignItems: 'flex-start',
                                            borderLeft: `2px solid ${a.color}`,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 3,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                display: 'inline-block',
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }}
                                        />
                                        {a.severity === 'CRIT' && (
                                            <span
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: a.color,
                                                    flexShrink: 0,
                                                    marginTop: 5,
                                                    boxShadow: `0 0 6px ${a.color}60`,
                                                }}
                                            />
                                        )}
                                        {a.severity !== 'CRIT' && (
                                            <span
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: a.color,
                                                    flexShrink: 0,
                                                    marginTop: 5,
                                                }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: 12,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            fontWeight: 700,
                                                            padding: '1px 6px',
                                                            borderRadius: 3,
                                                            background: `${a.color}15`,
                                                            border: `1px solid ${a.color}30`,
                                                            color: a.color,
                                                        }}
                                                    >
                                                        {a.severity}
                                                    </span>
                                                    <span
                                                        style={{ fontSize: 12, color: THEME.textMain, fontWeight: 500 }}
                                                    >
                                                        {a.title}
                                                    </span>
                                                    {a.count && (
                                                        <span
                                                            style={{
                                                                background: `${THEME.ai}15`,
                                                                border: `1px solid ${THEME.ai}25`,
                                                                color: THEME.ai,
                                                                borderRadius: 10,
                                                                padding: '1px 6px',
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            ×{a.count}
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: THEME.textDim,
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {a.time}
                                                </span>
                                            </div>
                                            <div
                                                style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}
                                            >
                                                <span
                                                    style={{
                                                        background: THEME.glass,
                                                        border: `1px solid ${THEME.glassBorder}`,
                                                        borderRadius: 10,
                                                        padding: '1px 7px',
                                                        color: THEME.textMuted,
                                                        fontFamily: THEME.fontMono,
                                                    }}
                                                >
                                                    {a.source}
                                                </span>
                                                <span
                                                    style={{
                                                        color: THEME.textDim,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                    }}
                                                >
                                                    {a.category}
                                                </span>
                                            </div>
                                            {i < 2 && (
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10 }}>
                                                    <span
                                                        style={{
                                                            color: THEME.success,
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        ✓ Acknowledge
                                                    </span>
                                                    <span style={{ color: THEME.textDim, cursor: 'pointer' }}>
                                                        ⏱ Snooze 1h
                                                    </span>
                                                    <span style={{ color: THEME.danger, cursor: 'pointer' }}>
                                                        ↑ Escalate
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── TAB 2: Config ── */}
                    {alertsTab === 'config' && (
                        <>
                            {/* Alert Rule Simulator */}
                            <div
                                style={{
                                    padding: 16,
                                    background: THEME.glass,
                                    border: `1px solid ${THEME.ai}20`,
                                    borderRadius: 8,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 14,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Zap size={14} color={THEME.ai} />
                                        <div>
                                            <div style={{ fontSize: 12, color: THEME.textMain, fontWeight: 700 }}>
                                                Alert Rule Simulator
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textDim }}>
                                                Fire a test alert without affecting production
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 9,
                                            background: `${THEME.ai}10`,
                                            border: `1px solid ${THEME.ai}20`,
                                            color: THEME.ai,
                                            borderRadius: 10,
                                            padding: '2px 8px',
                                            letterSpacing: '0.08em',
                                            fontWeight: 600,
                                        }}
                                    >
                                        SANDBOX
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                marginBottom: 5,
                                                fontWeight: 600,
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            SELECT RULE TO TEST
                                        </div>
                                        <div
                                            style={{
                                                padding: '8px 12px',
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 5,
                                                fontSize: 12,
                                                color: THEME.textMuted,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Security Breach Detector{' '}
                                            <span style={{ fontSize: 8, color: THEME.textDim }}>▼</span>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 6,
                                            background: `${THEME.success}15`,
                                            border: `1px solid ${THEME.success}30`,
                                            color: THEME.success,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Zap size={12} /> Run Simulation
                                    </div>
                                </div>
                            </div>

                            {/* Alert Rules Table */}
                            <div
                                style={{
                                    fontSize: 10,
                                    color: THEME.textDim,
                                    letterSpacing: '0.06em',
                                    fontWeight: 600,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span>Alert Rules — 6 active / 7 total</span>
                                <div
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: 5,
                                        background: `${THEME.primary}15`,
                                        border: `1px solid ${THEME.primary}30`,
                                        color: THEME.primary,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    + New Rule
                                </div>
                            </div>
                            <Panel title="ALERT RULES" icon={Bell} accentColor={THEME.danger}>
                                <DataTable
                                    columns={[
                                        { key: 'name', label: 'Rule Name' },
                                        { key: 'condition', label: 'Condition' },
                                        { key: 'severity', label: 'Severity' },
                                        { key: 'channels', label: 'Channels' },
                                        { key: 'enabled', label: 'Enabled' },
                                    ]}
                                    rows={[
                                        {
                                            name: 'Security Breach Detector',
                                            condition: 'auth_failures > 5/min',
                                            severity: 'CRIT',
                                            channels: 'PagerDuty, Slack',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'High CPU Alert',
                                            condition: 'cpu > 80% for 5m',
                                            severity: 'CRIT',
                                            channels: 'PagerDuty, Email',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'Replication Lag',
                                            condition: 'lag > 30s',
                                            severity: 'CRIT',
                                            channels: 'Slack, Email',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'Connection Pool',
                                            condition: 'usage > 80%',
                                            severity: 'WARN',
                                            channels: 'Slack',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'Slow Query Rate',
                                            condition: 'slow_qps > 10',
                                            severity: 'WARN',
                                            channels: 'Slack',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'WAL Backlog',
                                            condition: 'wal_size > 2GB',
                                            severity: 'WARN',
                                            channels: 'Email',
                                            enabled: '✓',
                                        },
                                        {
                                            name: 'Disk Space',
                                            condition: 'disk > 90%',
                                            severity: 'INFO',
                                            channels: 'Email',
                                            enabled: '✗',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: History ── */}
                    {alertsTab === 'history' && (
                        <>
                            <Panel title="HISTORICAL ALERTS" icon={Clock} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'alert', label: 'Alert' },
                                        { key: 'severity', label: 'Severity' },
                                        { key: 'triggered', label: 'Triggered' },
                                        { key: 'resolved', label: 'Resolved' },
                                        { key: 'duration', label: 'Duration' },
                                        { key: 'acked', label: 'Acked By' },
                                    ]}
                                    rows={[
                                        {
                                            alert: 'High Database Load',
                                            severity: 'CRIT',
                                            triggered: '2h ago',
                                            resolved: '1h ago',
                                            duration: '1h 23m',
                                            acked: 'admin',
                                        },
                                        {
                                            alert: 'Unauthorized Access',
                                            severity: 'CRIT',
                                            triggered: '6h ago',
                                            resolved: '5h 30m ago',
                                            duration: '30m',
                                            acked: 'security-team',
                                        },
                                        {
                                            alert: 'Connection Pool Usage',
                                            severity: 'WARN',
                                            triggered: '4h ago',
                                            resolved: '3h 45m ago',
                                            duration: '15m',
                                            acked: 'auto-resolve',
                                        },
                                        {
                                            alert: 'Slow Query Spike',
                                            severity: 'WARN',
                                            triggered: '8h ago',
                                            resolved: '7h 20m ago',
                                            duration: '40m',
                                            acked: 'dba',
                                        },
                                        {
                                            alert: 'WAL Backlog',
                                            severity: 'WARN',
                                            triggered: '12h ago',
                                            resolved: '11h 50m ago',
                                            duration: '10m',
                                            acked: 'auto-resolve',
                                        },
                                    ]}
                                />
                            </Panel>
                            <Panel title="RESOLUTION TIME TREND" icon={TrendingUp} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={demoData.cpuMemory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="cpu"
                                            stroke={THEME.success}
                                            strokeWidth={2}
                                            name="Avg Resolution (min)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                            <Panel title="NOTIFICATION CHANNELS" icon={Network} accentColor={THEME.primary}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: 10,
                                    }}
                                >
                                    {[
                                        { channel: 'Email', status: 'operational', sent: 142 },
                                        { channel: 'Slack', status: 'operational', sent: 284 },
                                        { channel: 'PagerDuty', status: 'operational', sent: 38 },
                                        { channel: 'SMS', status: 'degraded', sent: 0 },
                                    ].map((ch, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '10px 12px',
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
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {ch.channel}
                                            </div>
                                            <StatusBadge
                                                label={ch.status}
                                                color={ch.status === 'operational' ? THEME.success : THEME.warning}
                                            />
                                            <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 4 }}>
                                                {ch.sent} sent (7d)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // ALERT RULES
        if (sectionKey === 'alerts' && itemKey === 'alert-rules') {
            const alertRules = [
                { name: 'High CPU Usage', condition: 'cpu > 80%', severity: 'critical', enabled: true },
                { name: 'Slow Queries', condition: 'query_time > 5s', severity: 'warning', enabled: true },
                { name: 'Replication Lag', condition: 'lag > 10s', severity: 'critical', enabled: true },
                { name: 'Connection Spike', condition: 'connections > 200', severity: 'warning', enabled: false },
                { name: 'Disk Space Low', condition: 'disk_free < 10%', severity: 'critical', enabled: true },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <MetricCard
                            icon={AlertTriangle}
                            label="Total Rules"
                            value={String(alertRules.length)}
                            color={THEME.warning}
                        />
                        <MetricCard icon={CheckCircle} label="Enabled" value="4" color={THEME.success} />
                        <MetricCard icon={Bell} label="Fired (24h)" value="12" color={THEME.danger} />
                    </div>
                    <Panel title="Alert Rules" icon={Bell} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Rule Name' },
                                { key: 'condition', label: 'Condition' },
                                { key: 'severity', label: 'Severity' },
                                { key: 'enabled', label: 'Enabled' },
                            ]}
                            rows={alertRules.map((r) => ({
                                ...r,
                                severity: (
                                    <StatusBadge
                                        label={r.severity}
                                        color={r.severity === 'critical' ? THEME.danger : THEME.warning}
                                    />
                                ),
                                enabled: (
                                    <StatusBadge
                                        label={r.enabled ? 'Yes' : 'No'}
                                        color={r.enabled ? THEME.success : THEME.textMuted}
                                    />
                                ),
                            }))}
                        />
                    </Panel>
                    <Panel title="Rule Templates" icon={Workflow} accentColor={THEME.primary}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {['CPU Threshold', 'Memory Alert', 'Latency Check', 'Error Rate'].map((t, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        fontSize: 12,
                                        color: THEME.textMain,
                                    }}
                                >
                                    {t}
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ALERT CORRELATION
        if (sectionKey === 'alerts' && itemKey === 'alert-correlation') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <MetricCard icon={Link2} label="Correlated" value="3" color={THEME.ai} />
                        <MetricCard icon={Clock} label="Time Window" value="5m" color={THEME.primary} />
                        <MetricCard icon={TrendingUp} label="Root Causes" value="2" color={THEME.warning} />
                    </div>
                    <Panel title="Correlation Timeline" icon={Clock} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="qps"
                                    stroke={THEME.ai}
                                    fill={`${THEME.ai}20`}
                                    name="Events"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Alert Correlation Matrix" icon={BarChart2} accentColor={THEME.primary}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {['CPU', 'Mem', 'Disk', 'Net'].map((h1) =>
                                ['CPU', 'Mem', 'Disk', 'Net'].map((h2) => (
                                    <div
                                        key={`${h1}-${h2}`}
                                        style={{
                                            padding: '8px',
                                            background: THEME.glass,
                                            borderRadius: 4,
                                            fontSize: 11,
                                            textAlign: 'center',
                                            color: THEME.textDim,
                                        }}
                                    >
                                        {h1 === h2 ? '100%' : Math.floor(Math.random() * 80 + 20) + '%'}
                                    </div>
                                )),
                            )}
                        </div>
                    </Panel>
                </div>
            );
        }

        // QUERY OPTIMIZER
        if (sectionKey === 'query-analysis' && itemKey === 'query-optimizer') {
            const queryTabKey = queryTab || 'optimizer';
            const optimizerData = [
                {
                    query: 'SELECT COUNT(*) FROM orders WHERE created_at...',
                    table: 'orders',
                    type: 'Seq Scan',
                    savings: '65%',
                    impact: 'HIGH',
                    recommendation: 'Add composite index on (created_at, status)',
                    status: 'pending',
                },
                {
                    query: 'SELECT u.*, o.total FROM users u JOIN orders o...',
                    table: 'users',
                    type: 'Nested Loop',
                    savings: '42%',
                    impact: 'HIGH',
                    recommendation: 'Rewrite as hash join with window function',
                    status: 'pending',
                },
                {
                    query: 'UPDATE inventory SET qty = qty - 1 WHERE...',
                    table: 'inventory',
                    type: 'Seq Scan',
                    savings: '38%',
                    impact: 'MED',
                    recommendation: 'Batch updates with WHERE IN clause',
                    status: 'applied',
                },
                {
                    query: 'SELECT DISTINCT category FROM products WHERE...',
                    table: 'products',
                    type: 'Sort',
                    savings: '28%',
                    impact: 'LOW',
                    recommendation: 'Add partial index on active products',
                    status: 'pending',
                },
                {
                    query: 'DELETE FROM sessions WHERE expires_at...',
                    table: 'sessions',
                    type: 'Seq Scan',
                    savings: '55%',
                    impact: 'HIGH',
                    recommendation: 'Add index on expires_at, schedule batch deletes',
                    status: 'review',
                },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'optimizer', label: 'Optimizer', icon: Zap },
                            { key: 'suggestions', label: 'AI Suggestions', icon: Brain, badge: '5' },
                            { key: 'history', label: 'History' },
                        ]}
                        active={queryTabKey}
                        onChange={setQueryTab}
                        accentColor={THEME.ai}
                    />

                    {queryTabKey === 'optimizer' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={Zap}
                                    label="Optimizations"
                                    value="12"
                                    color={THEME.ai}
                                    spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                                    trend="+3.1%"
                                />
                                <MetricCard
                                    icon={TrendingUp}
                                    label="Avg Savings"
                                    value="51%"
                                    color={THEME.success}
                                    trend="+3%"
                                />
                                <MetricCard icon={AlertTriangle} label="Pending" value="7" color={THEME.warning} />
                                <MetricCard
                                    icon={CheckCircle}
                                    label="Applied"
                                    value="5"
                                    color={THEME.success}
                                    trend="+2"
                                />
                            </div>

                            {/* Search / Filter Bar */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        minWidth: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                    }}
                                >
                                    <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: THEME.textDim }}>
                                        Search queries, tables, recommendations...
                                    </span>
                                </div>
                                {['All Impact', 'All Types', 'Pending Only'].map((f, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '5px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {f} ▾
                                    </div>
                                ))}
                            </div>

                            <Panel title="Query Optimization Recommendations" icon={Zap} accentColor={THEME.ai}>
                                <DataTable
                                    columns={[
                                        { key: 'query', label: 'Query' },
                                        { key: 'table', label: 'Table' },
                                        { key: 'type', label: 'Scan Type' },
                                        { key: 'savings', label: 'Savings' },
                                        { key: 'impact', label: 'Impact' },
                                        { key: 'action', label: '' },
                                    ]}
                                    rows={optimizerData.map((q) => ({
                                        query: (
                                            <span style={{ fontFamily: THEME.fontMono, fontSize: 10 }}>
                                                {q.query.substring(0, 40)}...
                                            </span>
                                        ),
                                        table: q.table,
                                        type: (
                                            <span
                                                style={{
                                                    color: q.type === 'Seq Scan' ? THEME.danger : THEME.warning,
                                                    fontSize: 10,
                                                }}
                                            >
                                                {q.type}
                                            </span>
                                        ),
                                        savings: (
                                            <span style={{ color: THEME.success, fontWeight: 600 }}>{q.savings}</span>
                                        ),
                                        impact: (
                                            <StatusBadge
                                                label={q.impact}
                                                color={
                                                    q.impact === 'HIGH'
                                                        ? THEME.danger
                                                        : q.impact === 'MED'
                                                          ? THEME.warning
                                                          : THEME.primary
                                                }
                                            />
                                        ),
                                        action:
                                            q.status === 'applied' ? (
                                                <StatusBadge label="Applied" color={THEME.success} />
                                            ) : (
                                                <span
                                                    style={{
                                                        padding: '3px 8px',
                                                        background: `${THEME.ai}20`,
                                                        border: `1px solid ${THEME.ai}40`,
                                                        borderRadius: 4,
                                                        fontSize: 9,
                                                        color: THEME.ai,
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Apply Fix
                                                </span>
                                            ),
                                    }))}
                                />
                            </Panel>

                            <Panel title="Optimization Impact Over Time" icon={TrendingUp} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={demoData.clusterVelocity}>
                                        <defs>
                                            <linearGradient id="qopt-grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={THEME.success} stopOpacity={0.3} />
                                                <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="qps"
                                            stroke={THEME.success}
                                            fill="url(#qopt-grad)"
                                            name="Perf Improvement %"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        </>
                    )}

                    {queryTabKey === 'suggestions' && (
                        <>
                            <div
                                style={{
                                    padding: '12px 16px',
                                    background: `${THEME.ai}12`,
                                    border: `1px solid ${THEME.ai}30`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <Brain size={18} style={{ color: THEME.ai }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>
                                        AI-Powered Query Analysis
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>
                                        Claude analyzed 2,456 queries and found 5 optimization opportunities
                                    </div>
                                </div>
                            </div>
                            {optimizerData
                                .filter((q) => q.status === 'pending' || q.status === 'review')
                                .map((q, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '14px 16px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 8,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <StatusBadge
                                                    label={q.impact}
                                                    color={q.impact === 'HIGH' ? THEME.danger : THEME.warning}
                                                />
                                                <span
                                                    style={{
                                                        fontFamily: THEME.fontMono,
                                                        fontSize: 11,
                                                        color: THEME.textMain,
                                                    }}
                                                >
                                                    {q.query.substring(0, 50)}...
                                                </span>
                                            </div>
                                            <span style={{ fontSize: 11, color: THEME.success, fontWeight: 700 }}>
                                                -{q.savings} cost
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 10, color: THEME.textDim, paddingLeft: 4 }}>
                                            💡 {q.recommendation}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                            <span
                                                style={{
                                                    padding: '3px 10px',
                                                    background: `${THEME.success}20`,
                                                    border: `1px solid ${THEME.success}40`,
                                                    borderRadius: 4,
                                                    fontSize: 9,
                                                    color: THEME.success,
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Apply
                                            </span>
                                            <span
                                                style={{
                                                    padding: '3px 10px',
                                                    background: `${THEME.warning}15`,
                                                    border: `1px solid ${THEME.warning}30`,
                                                    borderRadius: 4,
                                                    fontSize: 9,
                                                    color: THEME.warning,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Review
                                            </span>
                                            <span
                                                style={{
                                                    padding: '3px 10px',
                                                    background: THEME.glass,
                                                    border: `1px solid ${THEME.glassBorder}`,
                                                    borderRadius: 4,
                                                    fontSize: 9,
                                                    color: THEME.textMuted,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Dismiss
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </>
                    )}

                    {queryTabKey === 'history' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard icon={CheckCircle} label="Applied" value="28" color={THEME.success} />
                                <MetricCard icon={TrendingUp} label="Total Savings" value="34%" color={THEME.success} />
                                <MetricCard icon={Clock} label="Last Applied" value="2h ago" color={THEME.primary} />
                            </div>
                            <Panel title="Optimization History" icon={Clock} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'date', label: 'Date' },
                                        { key: 'query', label: 'Query' },
                                        { key: 'optimization', label: 'Optimization' },
                                        { key: 'result', label: 'Result' },
                                    ]}
                                    rows={[
                                        {
                                            date: '2h ago',
                                            query: 'UPDATE inventory...',
                                            optimization: 'Batch updates',
                                            result: <StatusBadge label="38% faster" color={THEME.success} />,
                                        },
                                        {
                                            date: '1d ago',
                                            query: 'SELECT u.*, o.*...',
                                            optimization: 'Added index',
                                            result: <StatusBadge label="52% faster" color={THEME.success} />,
                                        },
                                        {
                                            date: '3d ago',
                                            query: 'DELETE FROM logs...',
                                            optimization: 'Partition pruning',
                                            result: <StatusBadge label="71% faster" color={THEME.success} />,
                                        },
                                        {
                                            date: '1w ago',
                                            query: 'SELECT COUNT(*)...',
                                            optimization: 'Covering index',
                                            result: <StatusBadge label="45% faster" color={THEME.success} />,
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // QUERY PLAN
        if (sectionKey === 'query-analysis' && itemKey === 'query-plan') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MetricCard icon={BarChart2} label="Estimated Cost" value="1,245" color={THEME.warning} />
                    <Panel title="Execution Plan" icon={TreePine} accentColor={THEME.ai}>
                        <div
                            style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim, lineHeight: 1.6 }}
                        >
                            <div>{'→'} Seq Scan on orders (cost=0..1000)</div>
                            <div style={{ marginLeft: '20px' }}>Filter: (created_at {'>'} now())</div>
                            <div style={{ marginLeft: '20px' }}>{'→'} Hash Join (cost=500..800)</div>
                            <div style={{ marginLeft: '40px' }}>{'→'} Index Scan on users_pkey</div>
                            <div style={{ marginLeft: '40px' }}>{'→'} Hash Aggregate (cost=200..300)</div>
                        </div>
                    </Panel>
                    <Panel title="Cost Breakdown" icon={BarChart3} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Seq Scan', value: 400 },
                                        { name: 'Join', value: 600 },
                                        { name: 'Agg', value: 245 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    fill={THEME.ai}
                                    dataKey="value"
                                >
                                    <Cell fill={THEME.ai} />
                                    <Cell fill={THEME.warning} />
                                    <Cell fill={THEME.success} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // PLAN REGRESSION
        if (sectionKey === 'query-analysis' && itemKey === 'plan-regression') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={AlertTriangle} label="Regressions" value="3" color={THEME.danger} />
                        <MetricCard icon={TrendingUp} label="Avg Degradation" value="34%" color={THEME.warning} />
                        <MetricCard icon={Clock} label="Last Detected" value="2h ago" color={THEME.primary} />
                    </div>
                    <Panel title="Plan Changes Over Time" icon={TrendingUp} accentColor={THEME.danger}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    type="monotone"
                                    dataKey="qps"
                                    stroke={THEME.warning}
                                    strokeWidth={2}
                                    name="Cost"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Regressed Queries" icon={AlertTriangle} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'query', label: 'Query' },
                                { key: 'costBefore', label: 'Cost (Before)' },
                                { key: 'costAfter', label: 'Cost (After)' },
                                { key: 'change', label: 'Change' },
                            ]}
                            rows={[
                                {
                                    query: 'SELECT * FROM users...',
                                    costBefore: '234',
                                    costAfter: '1204',
                                    change: <span style={{ color: THEME.danger }}>+414%</span>,
                                },
                                {
                                    query: 'JOIN orders o ON...',
                                    costBefore: '567',
                                    costAfter: '892',
                                    change: <span style={{ color: THEME.warning }}>+57%</span>,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // INDEXES
        if (sectionKey === 'query-analysis' && itemKey === 'indexes') {
            const indexData = [
                { name: 'users_pkey', table: 'users', size: '2.3 MB', usage: 18234, type: 'B-tree', status: 'active' },
                {
                    name: 'orders_user_idx',
                    table: 'orders',
                    size: '1.8 MB',
                    usage: 5421,
                    type: 'B-tree',
                    status: 'active',
                },
                {
                    name: 'idx_orders_date',
                    table: 'orders',
                    size: '3.4 MB',
                    usage: 12045,
                    type: 'B-tree',
                    status: 'active',
                },
                {
                    name: 'idx_products_gin',
                    table: 'products',
                    size: '4.1 MB',
                    usage: 3201,
                    type: 'GIN',
                    status: 'active',
                },
                { name: 'legacy_idx_old', table: 'orders', size: '890 KB', usage: 0, type: 'B-tree', status: 'unused' },
                {
                    name: 'idx_users_old_email',
                    table: 'users',
                    size: '1.2 MB',
                    usage: 0,
                    type: 'B-tree',
                    status: 'unused',
                },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Database}
                            label="Total Indexes"
                            value={String(indexData.length)}
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 4 + Math.random() * 4)}
                        />
                        <MetricCard icon={CheckCircle} label="Active" value="4" color={THEME.success} />
                        <MetricCard icon={AlertTriangle} label="Unused" value="2" color={THEME.warning} />
                        <MetricCard icon={HardDrive} label="Total Size" value="13.7 MB" color={THEME.textMuted} />
                    </div>
                    {/* Search / Filter Bar */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div
                            style={{
                                flex: 1,
                                minWidth: 200,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                borderRadius: 6,
                                padding: '6px 10px',
                            }}
                        >
                            <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: THEME.textDim }}>Search indexes...</span>
                        </div>
                        <div
                            style={{
                                padding: '5px 10px',
                                background: `${THEME.warning}15`,
                                border: `1px solid ${THEME.warning}30`,
                                borderRadius: 6,
                                fontSize: 10,
                                color: THEME.warning,
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            Show Unused Only
                        </div>
                        <div
                            style={{
                                padding: '5px 10px',
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                borderRadius: 6,
                                fontSize: 10,
                                color: THEME.textMuted,
                                cursor: 'pointer',
                            }}
                        >
                            All Types ▾
                        </div>
                    </div>
                    <Panel title="Index Overview" icon={Database} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Index Name' },
                                { key: 'table', label: 'Table' },
                                { key: 'type', label: 'Type' },
                                { key: 'size', label: 'Size' },
                                { key: 'usage', label: 'Scans (24h)' },
                                { key: 'status', label: 'Status' },
                                { key: 'action', label: '' },
                            ]}
                            rows={indexData.map((idx) => ({
                                name: (
                                    <span
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            fontSize: 10,
                                            color: idx.usage > 0 ? THEME.primary : THEME.textMuted,
                                        }}
                                    >
                                        {idx.name}
                                    </span>
                                ),
                                table: idx.table,
                                type: (
                                    <span
                                        style={{ fontSize: 10, color: idx.type === 'GIN' ? THEME.ai : THEME.textDim }}
                                    >
                                        {idx.type}
                                    </span>
                                ),
                                size: idx.size,
                                usage: idx.usage.toLocaleString(),
                                status: (
                                    <StatusBadge
                                        label={idx.status}
                                        color={idx.usage > 0 ? THEME.success : THEME.warning}
                                    />
                                ),
                                action:
                                    idx.usage === 0 ? (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.danger}15`,
                                                border: `1px solid ${THEME.danger}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.danger,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Drop
                                        </span>
                                    ) : (
                                        ''
                                    ),
                            }))}
                        />
                    </Panel>
                    <Panel title="Index Usage Over Time" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <defs>
                                    <linearGradient id="idx-usage-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="qps"
                                    stroke={THEME.primary}
                                    fill="url(#idx-usage-grad)"
                                    name="Index Scans"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // BLOAT ANALYSIS
        if (sectionKey === 'query-analysis' && itemKey === 'bloat-analysis') {
            const bloatData = [
                { table: 'users', bloat: 23, bloatSize: '194 MB', recommendation: 'VACUUM FULL' },
                { table: 'orders', bloat: 18, bloatSize: '378 MB', recommendation: 'VACUUM' },
                { table: 'products', bloat: 5, bloatSize: '6 MB', recommendation: 'Monitor' },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'table-bloat', label: 'Table Bloat' },
                            { key: 'index-bloat', label: 'Index Bloat' },
                            { key: 'growth', label: 'Growth Predictor' },
                        ]}
                        active={bloatTab}
                        onChange={setBloatTab}
                        accentColor={THEME.warning}
                    />

                    {/* ── TAB 1: Table Bloat ── */}
                    {bloatTab === 'table-bloat' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={HardDrive}
                                    label="Avg Bloat"
                                    value="15.3%"
                                    color={THEME.warning}
                                    spark={Array.from({ length: 12 }, () => 10 + Math.random() * 10)}
                                    trend="+1.2%"
                                />
                                <MetricCard
                                    icon={Database}
                                    label="Total Wasted"
                                    value="578 MB"
                                    color={THEME.danger}
                                    trend="+24 MB"
                                />
                                <MetricCard
                                    icon={AlertTriangle}
                                    label="Critical Tables"
                                    value="2"
                                    color={THEME.danger}
                                />
                                <MetricCard
                                    icon={CheckCircle}
                                    label="Healthy Tables"
                                    value="38"
                                    color={THEME.success}
                                />
                            </div>
                            {/* Search / Filter Bar */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        minWidth: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                    }}
                                >
                                    <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: THEME.textDim }}>Search tables...</span>
                                </div>
                                <div
                                    style={{
                                        padding: '5px 10px',
                                        background: `${THEME.danger}15`,
                                        border: `1px solid ${THEME.danger}30`,
                                        borderRadius: 6,
                                        fontSize: 10,
                                        color: THEME.danger,
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                    }}
                                >
                                    High Bloat Only
                                </div>
                                <div
                                    style={{
                                        padding: '5px 10px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        fontSize: 10,
                                        color: THEME.textMuted,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Auto-refresh ▾
                                </div>
                            </div>
                            <Panel title="Table Bloat Analysis" icon={HardDrive} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'table', label: 'Table' },
                                        { key: 'bloat', label: 'Bloat %' },
                                        { key: 'bloatSize', label: 'Wasted Space' },
                                        { key: 'recommendation', label: 'Action' },
                                    ]}
                                    rows={bloatData.map((b) => ({
                                        ...b,
                                        bloat: (
                                            <span style={{ color: b.bloat > 20 ? THEME.danger : THEME.warning }}>
                                                {b.bloat}%
                                            </span>
                                        ),
                                    }))}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 2: Index Bloat ── */}
                    {bloatTab === 'index-bloat' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard icon={Layers} label="Bloated Indexes" value="4" color={THEME.warning} />
                                <MetricCard icon={HardDrive} label="Index Bloat" value="8.2%" color={THEME.success} />
                                <MetricCard icon={Database} label="Total Wasted" value="102 MB" color={THEME.danger} />
                            </div>
                            <Panel title="Index Bloat Details" icon={Layers} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'index', label: 'Index' },
                                        { key: 'table', label: 'Table' },
                                        { key: 'bloat', label: 'Bloat %' },
                                        { key: 'wasted', label: 'Wasted' },
                                    ]}
                                    rows={[
                                        {
                                            index: 'idx_users_email',
                                            table: 'users',
                                            bloat: '12%',
                                            wasted: '45 MB',
                                        },
                                        {
                                            index: 'idx_orders_date',
                                            table: 'orders',
                                            bloat: '8%',
                                            wasted: '34 MB',
                                        },
                                        {
                                            index: 'idx_products_sku',
                                            table: 'products',
                                            bloat: '3%',
                                            wasted: '8 MB',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: Growth Predictor ── */}
                    {bloatTab === 'growth' && (
                        <>
                            <Panel title="Growth Forecast" icon={TrendingUp} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={demoData.cpuMemory}>
                                        <defs>
                                            <linearGradient id="growth-grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="cpu"
                                            stroke={THEME.primary}
                                            fill="url(#growth-grad)"
                                            name="Projected Bloat %"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                            <Panel title="Growth Projections" icon={BarChart3} accentColor={THEME.ai}>
                                <DataTable
                                    columns={[
                                        { key: 'table', label: 'Table' },
                                        { key: 'current', label: 'Current Bloat' },
                                        { key: 'week', label: '1 Week' },
                                        { key: 'month', label: '1 Month' },
                                    ]}
                                    rows={[
                                        {
                                            table: 'users',
                                            current: '23%',
                                            week: '25%',
                                            month: '32%',
                                        },
                                        {
                                            table: 'orders',
                                            current: '18%',
                                            week: '19%',
                                            month: '24%',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // TABLE ANALYSIS
        if (sectionKey === 'query-analysis' && itemKey === 'table-analysis') {
            const tableTabKey = tableTab || 'findings';
            const tableData = [
                {
                    name: 'users',
                    schema: 'public',
                    rows: '2.3M',
                    size: '845 MB',
                    bloat: '12%',
                    indexes: 4,
                    lastVacuum: '2h ago',
                    health: 94,
                },
                {
                    name: 'orders',
                    schema: 'public',
                    rows: '8.9M',
                    size: '2.1 GB',
                    bloat: '18%',
                    indexes: 6,
                    lastVacuum: '45m ago',
                    health: 78,
                },
                {
                    name: 'products',
                    schema: 'public',
                    rows: '450K',
                    size: '123 MB',
                    bloat: '3%',
                    indexes: 3,
                    lastVacuum: '1h ago',
                    health: 98,
                },
                {
                    name: 'sessions',
                    schema: 'public',
                    rows: '12.4M',
                    size: '890 MB',
                    bloat: '24%',
                    indexes: 2,
                    lastVacuum: '6h ago',
                    health: 65,
                },
                {
                    name: 'inventory',
                    schema: 'warehouse',
                    rows: '1.2M',
                    size: '234 MB',
                    bloat: '8%',
                    indexes: 5,
                    lastVacuum: '3h ago',
                    health: 88,
                },
                {
                    name: 'audit_logs',
                    schema: 'logging',
                    rows: '45.2M',
                    size: '4.5 GB',
                    bloat: '5%',
                    indexes: 3,
                    lastVacuum: '12h ago',
                    health: 82,
                },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'findings', label: 'Findings', icon: ScanSearch },
                            { key: 'structure', label: 'Structure' },
                            { key: 'ask-claude', label: 'Ask Claude', icon: Brain, badge: 'AI' },
                        ]}
                        active={tableTabKey}
                        onChange={setTableTab}
                        accentColor={THEME.primary}
                    />

                    {/* ── TAB 1: Findings ── */}
                    {tableTabKey === 'findings' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={Database}
                                    label="Total Tables"
                                    value="45"
                                    color={THEME.primary}
                                    spark={Array.from({ length: 12 }, () => 40 + Math.random() * 10)}
                                />
                                <MetricCard icon={Layers} label="Partitions" value="12" color={THEME.ai} />
                                <MetricCard
                                    icon={HardDrive}
                                    label="Total Size"
                                    value="8.7 GB"
                                    color={THEME.textMuted}
                                    trend="+2.4%"
                                />
                                <MetricCard icon={AlertTriangle} label="Issues" value="3" color={THEME.warning} />
                            </div>

                            {/* Search / Filter Bar */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        minWidth: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                    }}
                                >
                                    <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: THEME.textDim }}>
                                        Search tables, schemas...
                                    </span>
                                </div>
                                {['All Schemas', 'All Health', 'Size ▾'].map((f, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '5px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <Panel title="Table Health Overview" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'name', label: 'Table' },
                                        { key: 'schema', label: 'Schema' },
                                        { key: 'rows', label: 'Rows' },
                                        { key: 'size', label: 'Size' },
                                        { key: 'bloat', label: 'Bloat' },
                                        { key: 'health', label: 'Health' },
                                        { key: 'lastVacuum', label: 'Last Vacuum' },
                                    ]}
                                    rows={tableData.map((t) => ({
                                        name: (
                                            <span
                                                style={{
                                                    fontFamily: THEME.fontMono,
                                                    fontSize: 10,
                                                    color: THEME.primary,
                                                }}
                                            >
                                                {t.name}
                                            </span>
                                        ),
                                        schema: <span style={{ fontSize: 10, color: THEME.textDim }}>{t.schema}</span>,
                                        rows: t.rows,
                                        size: t.size,
                                        bloat: (
                                            <span
                                                style={{
                                                    color:
                                                        parseInt(t.bloat) > 15
                                                            ? THEME.danger
                                                            : parseInt(t.bloat) > 8
                                                              ? THEME.warning
                                                              : THEME.success,
                                                }}
                                            >
                                                {t.bloat}
                                            </span>
                                        ),
                                        health: (
                                            <RingGauge
                                                value={t.health}
                                                max={100}
                                                label=""
                                                color={
                                                    t.health > 90
                                                        ? THEME.success
                                                        : t.health > 75
                                                          ? THEME.warning
                                                          : THEME.danger
                                                }
                                                size={32}
                                            />
                                        ),
                                        lastVacuum: t.lastVacuum,
                                    }))}
                                />
                            </Panel>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <Panel title="Size Distribution" icon={HardDrive} accentColor={THEME.primary}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={tableData.map((t) => ({
                                                    name: t.name,
                                                    value: parseFloat(t.size),
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={35}
                                                outerRadius={65}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {[
                                                    THEME.primary,
                                                    THEME.warning,
                                                    THEME.success,
                                                    THEME.danger,
                                                    THEME.ai,
                                                    THEME.textMuted,
                                                ].map((c, i) => (
                                                    <Cell key={i} fill={c} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Panel>
                                <Panel title="Row Growth Trend" icon={TrendingUp} accentColor={THEME.success}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <AreaChart data={demoData.clusterVelocity.slice(0, 10)}>
                                            <defs>
                                                <linearGradient id="ta-growth-grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                            <YAxis stroke={THEME.textDim} fontSize={9} />
                                            <Tooltip content={<ChartTip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="qps"
                                                stroke={THEME.primary}
                                                fill="url(#ta-growth-grad)"
                                                name="Total Rows (M)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Panel>
                            </div>
                        </>
                    )}

                    {/* ── TAB 2: Structure ── */}
                    {tableTabKey === 'structure' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard icon={Layers} label="Schemas" value="4" color={THEME.ai} />
                                <MetricCard icon={Database} label="Tables" value="45" color={THEME.primary} />
                                <MetricCard icon={Lock} label="Foreign Keys" value="28" color={THEME.warning} />
                                <MetricCard icon={CheckCircle} label="Constraints" value="64" color={THEME.success} />
                            </div>
                            <Panel title="Schema Overview" icon={ListTree} accentColor={THEME.ai}>
                                <div
                                    style={{
                                        fontFamily: THEME.fontMono,
                                        fontSize: 11,
                                        color: THEME.textDim,
                                        lineHeight: 2,
                                    }}
                                >
                                    {[
                                        { schema: 'public', tables: 32, color: THEME.primary },
                                        { schema: 'warehouse', tables: 8, color: THEME.warning },
                                        { schema: 'logging', tables: 3, color: THEME.ai },
                                        { schema: 'analytics', tables: 2, color: THEME.success },
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                background: i % 2 === 0 ? `${THEME.glass}` : 'transparent',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: s.color,
                                                }}
                                            />
                                            <span style={{ color: s.color, fontWeight: 600 }}>{s.schema}</span>
                                            <span style={{ color: THEME.textMuted }}>— {s.tables} tables</span>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <Panel title="Column Type Distribution" icon={TableProperties} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart
                                        data={[
                                            { type: 'varchar', count: 45 },
                                            { type: 'integer', count: 38 },
                                            { type: 'timestamp', count: 24 },
                                            { type: 'bigint', count: 18 },
                                            { type: 'boolean', count: 12 },
                                            { type: 'jsonb', count: 8 },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="type" stroke={THEME.textDim} fontSize={9} />
                                        <YAxis stroke={THEME.textDim} fontSize={9} />
                                        <Tooltip content={<ChartTip />} />
                                        <Bar dataKey="count" fill={THEME.primary} name="Columns" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: Ask Claude ── */}
                    {tableTabKey === 'ask-claude' && (
                        <>
                            <div
                                style={{
                                    padding: '12px 16px',
                                    background: `${THEME.ai}12`,
                                    border: `1px solid ${THEME.ai}30`,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <Brain size={18} style={{ color: THEME.ai }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>
                                        Claude Table Analyzer
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>
                                        Ask questions about your table structure, performance, and optimization
                                        opportunities
                                    </div>
                                </div>
                            </div>

                            {/* Chat input mockup */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.ai}30`,
                                        borderRadius: 8,
                                        padding: '8px 12px',
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: THEME.textDim }}>Ask about your tables...</span>
                                </div>
                                <div
                                    style={{
                                        padding: '8px 14px',
                                        background: `${THEME.ai}20`,
                                        border: `1px solid ${THEME.ai}40`,
                                        borderRadius: 8,
                                        fontSize: 11,
                                        color: THEME.ai,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ask
                                </div>
                            </div>

                            <Panel title="Recent Analysis" icon={Brain} accentColor={THEME.ai}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        {
                                            q: 'Why is the users table growing faster than expected?',
                                            a: 'The users table is experiencing linear growth due to increased signups (14K/month). Consider implementing archival policies for soft-deleted users.',
                                            color: THEME.ai,
                                        },
                                        {
                                            q: 'Should we partition the orders table?',
                                            a: 'Yes, partitioning by date (monthly) would improve query performance for recent data and enable efficient archival of historical orders.',
                                            color: THEME.success,
                                        },
                                        {
                                            q: 'Which indexes are unused and can be dropped?',
                                            a: 'Found 3 unused indexes: idx_orders_legacy, idx_users_old_email, idx_products_v1. Dropping them would save ~890 MB of disk space.',
                                            color: THEME.warning,
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '12px',
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                borderLeft: `3px solid ${item.color}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: THEME.textMain,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                Q: {item.q}
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textDim }}>A: {item.a}</div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // SCHEMA BROWSER
        if (sectionKey === 'schema' && itemKey === 'schema-browser') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={Database} label="Tables" value="45" color={THEME.primary} />
                        <MetricCard icon={Layers} label="Schemas" value="4" color={THEME.warning} />
                        <MetricCard icon={Lock} label="Foreign Keys" value="28" color={THEME.ai} />
                        <MetricCard icon={Eye} label="Views" value="12" color={THEME.success} />
                    </div>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div
                            style={{
                                flex: 1,
                                minWidth: 200,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                borderRadius: 6,
                                padding: '6px 10px',
                            }}
                        >
                            <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: THEME.textDim }}>Search tables, columns, types...</span>
                        </div>
                        {['All Schemas', 'Tables', 'Views'].map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '5px 10px',
                                    background: i === 1 ? `${THEME.primary}20` : THEME.glass,
                                    border: `1px solid ${i === 1 ? THEME.primary + '40' : THEME.glassBorder}`,
                                    borderRadius: 6,
                                    fontSize: 10,
                                    color: i === 1 ? THEME.primary : THEME.textMuted,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {f}
                            </div>
                        ))}
                    </div>
                    <Panel title="Schema Structure" icon={ListTree} accentColor={THEME.warning}>
                        <div
                            style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim, lineHeight: 1.8 }}
                        >
                            <div style={{ color: THEME.warning, fontWeight: 600 }}>public/</div>
                            {['users', 'orders', 'products', 'sessions', 'payments'].map((tbl, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginLeft: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '2px 4px',
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{i < 4 ? '├─' : '└─'}</span>
                                    <Database size={10} style={{ color: THEME.primary }} />
                                    <span style={{ color: THEME.textMain }}>{tbl}</span>
                                    <span style={{ color: THEME.textMuted, fontSize: 9, marginLeft: 'auto' }}>
                                        {['5 cols', '4 cols', '6 cols', '3 cols', '7 cols'][i]}
                                    </span>
                                </div>
                            ))}
                            <div style={{ color: THEME.ai, fontWeight: 600, marginTop: 8 }}>warehouse/</div>
                            {['inventory', 'shipments'].map((tbl, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginLeft: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '2px 4px',
                                    }}
                                >
                                    <span>{i < 1 ? '├─' : '└─'}</span>
                                    <Database size={10} style={{ color: THEME.ai }} />
                                    <span style={{ color: THEME.textMain }}>{tbl}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Columns — users" icon={TableProperties} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Column' },
                                { key: 'type', label: 'Type' },
                                { key: 'nullable', label: 'Nullable' },
                                { key: 'default', label: 'Default' },
                                { key: 'indexed', label: 'Indexed' },
                            ]}
                            rows={[
                                {
                                    name: 'id',
                                    type: 'bigint',
                                    nullable: 'No',
                                    default: 'nextval()',
                                    indexed: <StatusBadge label="PK" color={THEME.success} />,
                                },
                                {
                                    name: 'email',
                                    type: 'varchar(255)',
                                    nullable: 'No',
                                    default: '-',
                                    indexed: <StatusBadge label="UNIQUE" color={THEME.ai} />,
                                },
                                {
                                    name: 'name',
                                    type: 'varchar(100)',
                                    nullable: 'Yes',
                                    default: '-',
                                    indexed: <span style={{ color: THEME.textMuted, fontSize: 10 }}>—</span>,
                                },
                                {
                                    name: 'status',
                                    type: 'varchar(20)',
                                    nullable: 'No',
                                    default: "'active'",
                                    indexed: <StatusBadge label="IDX" color={THEME.primary} />,
                                },
                                {
                                    name: 'created_at',
                                    type: 'timestamp',
                                    nullable: 'No',
                                    default: 'now()',
                                    indexed: <StatusBadge label="IDX" color={THEME.primary} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // SCHEMA MIGRATIONS
        if (sectionKey === 'schema' && itemKey === 'schema-migrations') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={RefreshCw} label="Applied" value="24" color={THEME.success} />
                        <MetricCard icon={Clock} label="Pending" value="2" color={THEME.warning} />
                        <MetricCard icon={CheckCircle} label="Latest" value="v2.3.1" color={THEME.primary} />
                    </div>
                    <Panel title="Recent Migrations" icon={RefreshCw} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'version', label: 'Version' },
                                { key: 'description', label: 'Description' },
                                { key: 'status', label: 'Status' },
                                { key: 'date', label: 'Applied' },
                            ]}
                            rows={[
                                {
                                    version: 'v2.3.1',
                                    description: 'Add users table',
                                    status: <StatusBadge label="Applied" color={THEME.success} />,
                                    date: '2h ago',
                                },
                                {
                                    version: 'v2.3.0',
                                    description: 'Create orders index',
                                    status: <StatusBadge label="Applied" color={THEME.success} />,
                                    date: '1d ago',
                                },
                                {
                                    version: 'v2.2.9',
                                    description: 'Rename column',
                                    status: <StatusBadge label="Pending" color={THEME.warning} />,
                                    date: '-',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // SCHEMA VISUALIZER
        if (sectionKey === 'schema' && itemKey === 'schema-visualizer') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Entity Relationship Diagram" icon={Blocks} accentColor={THEME.warning}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                padding: '40px',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                style={{
                                    padding: '16px',
                                    background: THEME.glass,
                                    border: `2px solid ${THEME.primary}30`,
                                    borderRadius: 8,
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: THEME.textMain,
                                }}
                            >
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>users</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>id, email, name</div>
                            </div>
                            <div style={{ color: THEME.textMuted }}>─→</div>
                            <div
                                style={{
                                    padding: '16px',
                                    background: THEME.glass,
                                    border: `2px solid ${THEME.primary}30`,
                                    borderRadius: 8,
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: THEME.textMain,
                                }}
                            >
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>orders</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>id, user_id, total</div>
                            </div>
                            <div style={{ color: THEME.textMuted }}>─→</div>
                            <div
                                style={{
                                    padding: '16px',
                                    background: THEME.glass,
                                    border: `2px solid ${THEME.primary}30`,
                                    borderRadius: 8,
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: THEME.textMain,
                                }}
                            >
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>products</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>id, name, price</div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // TABLE DEPENDENCIES
        if (sectionKey === 'schema' && itemKey === 'table-dependencies') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Dependency Graph" icon={Layers} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                    style={{
                                        width: '100px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: 4,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        fontWeight: 600,
                                    }}
                                >
                                    users
                                </div>
                                <div style={{ flex: 1, height: '1px', background: THEME.glassBorder }}></div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>references</div>
                                <div style={{ flex: 1, height: '1px', background: THEME.glassBorder }}></div>
                                <div
                                    style={{
                                        width: '100px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: 4,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        fontWeight: 600,
                                    }}
                                >
                                    orders
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                    style={{
                                        width: '100px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: 4,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        fontWeight: 600,
                                    }}
                                >
                                    orders
                                </div>
                                <div style={{ flex: 1, height: '1px', background: THEME.glassBorder }}></div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>has</div>
                                <div style={{ flex: 1, height: '1px', background: THEME.glassBorder }}></div>
                                <div
                                    style={{
                                        width: '100px',
                                        padding: '8px',
                                        background: THEME.glass,
                                        borderRadius: 4,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        fontWeight: 600,
                                    }}
                                >
                                    products
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // CHART BUILDER
        if (sectionKey === 'schema' && itemKey === 'chart-builder') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Chart Configuration" icon={BarChart2} accentColor={THEME.warning}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain, marginBottom: 8 }}>
                                    Chart Type
                                </div>
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 4,
                                        color: THEME.textMain,
                                        fontSize: 11,
                                    }}
                                >
                                    <option>Line Chart</option>
                                    <option>Bar Chart</option>
                                    <option>Pie Chart</option>
                                </select>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain, marginBottom: 8 }}>
                                    Data Source
                                </div>
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 4,
                                        color: THEME.textMain,
                                        fontSize: 11,
                                    }}
                                >
                                    <option>users</option>
                                    <option>orders</option>
                                    <option>products</option>
                                </select>
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Preview" icon={Eye} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={demoData.clusterVelocity.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="qps" fill={THEME.ai} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // CONNECTION POOL
        if (sectionKey === 'infrastructure' && itemKey === 'connection-pool') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <RingGauge value={65} max={100} label="Pool Usage" color={THEME.ai} />
                        <RingGauge value={45} max={200} label="Active Conns" color={THEME.success} />
                        <RingGauge value={12} max={50} label="Idle Conns" color={THEME.textMuted} />
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={Network} label="Pool Size" value="200" color={THEME.primary} />
                        <MetricCard icon={Clock} label="Wait Time" value="12ms" color={THEME.warning} />
                        <MetricCard icon={AlertTriangle} label="Exhausted" value="0" color={THEME.success} />
                    </div>
                    <Panel title="Pool Connections" icon={Network} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.connectionTrends}>
                                <defs>
                                    <linearGradient id="pool-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    stroke={THEME.success}
                                    fill="url(#pool-grad)"
                                    name="Active"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // POOL METRICS
        if (sectionKey === 'infrastructure' && itemKey === 'pool-metrics') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Pool Utilization" icon={Network} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.connectionTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    stroke={THEME.ai}
                                    fill={`${THEME.ai}20`}
                                    name="Active"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="idle"
                                    stroke={THEME.textMuted}
                                    fill={`${THEME.textMuted}10`}
                                    name="Idle"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Wait Times" icon={Clock} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    type="monotone"
                                    dataKey="tps"
                                    stroke={THEME.warning}
                                    strokeWidth={2}
                                    name="Wait (ms)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // REPLICATION & WAL
        if (sectionKey === 'infrastructure' && itemKey === 'replication-wal') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={Server} label="Primary" value="prod-db-01" color={THEME.success} />
                        <MetricCard icon={Database} label="Replicas" value="2" color={THEME.primary} />
                        <MetricCard icon={Droplets} label="WAL Files" value="24" color={THEME.ai} />
                    </div>
                    <Panel title="Replication Topology" icon={Network} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
                            <div
                                style={{
                                    padding: '12px',
                                    background: `${THEME.success}15`,
                                    border: `1px solid ${THEME.success}30`,
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: THEME.textMain,
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>prod-db-01 (Primary)</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    Master - Accepting writes
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    color: THEME.textMuted,
                                    fontSize: 12,
                                }}
                            >
                                ↓
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>replica-01</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>Lag: 0ms</div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>replica-02</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>Lag: 2ms</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                    <Panel title="WAL Lag" icon={Droplets} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line type="monotone" dataKey="qps" stroke={THEME.ai} strokeWidth={2} name="Lag (ms)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // CHECKPOINT MONITOR
        if (sectionKey === 'infrastructure' && itemKey === 'checkpoint-monitor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Clock}
                            label="Last Checkpoint"
                            value="5m ago"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 8)}
                        />
                        <MetricCard icon={Zap} label="Duration" value="234ms" color={THEME.warning} trend="-12ms" />
                        <MetricCard
                            icon={HardDrive}
                            label="Buffers Written"
                            value="8,234"
                            color={THEME.ai}
                            trend="+1.2%"
                        />
                        <MetricCard icon={Activity} label="WAL Size" value="2.4 GB" color={THEME.success} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <RingGauge value={72} max={100} label="Buffer Hit %" color={THEME.success} />
                        <RingGauge value={234} max={500} label="Avg Duration" color={THEME.warning} />
                        <RingGauge value={85} max={100} label="Efficiency" color={THEME.primary} />
                    </div>
                    <Panel title="Checkpoint Timing" icon={Clock} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={generateChartData(12).map((d, i) => ({
                                    ...d,
                                    duration: Math.floor(150 + Math.sin(i / 3) * 80 + Math.random() * 60),
                                    buffers: Math.floor(5000 + Math.random() * 5000),
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="duration" fill={THEME.primary} name="Duration (ms)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Checkpoint History" icon={Database} accentColor={THEME.ai}>
                        <DataTable
                            columns={[
                                { key: 'time', label: 'Time' },
                                { key: 'type', label: 'Type' },
                                { key: 'duration', label: 'Duration' },
                                { key: 'buffers', label: 'Buffers' },
                                { key: 'wal', label: 'WAL Written' },
                            ]}
                            rows={[
                                {
                                    time: '5m ago',
                                    type: <StatusBadge label="Timed" color={THEME.primary} />,
                                    duration: '234ms',
                                    buffers: '8,234',
                                    wal: '128 MB',
                                },
                                {
                                    time: '35m ago',
                                    type: <StatusBadge label="Timed" color={THEME.primary} />,
                                    duration: '198ms',
                                    buffers: '6,891',
                                    wal: '96 MB',
                                },
                                {
                                    time: '1h ago',
                                    type: <StatusBadge label="Requested" color={THEME.warning} />,
                                    duration: '412ms',
                                    buffers: '12,456',
                                    wal: '256 MB',
                                },
                                {
                                    time: '1.5h ago',
                                    type: <StatusBadge label="Timed" color={THEME.primary} />,
                                    duration: '187ms',
                                    buffers: '5,234',
                                    wal: '84 MB',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // VACUUM & MAINTENANCE
        if (sectionKey === 'infrastructure' && itemKey === 'vacuum-maintenance') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={RefreshCw}
                            label="Tables Needing"
                            value="5"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 6)}
                            trend="+2"
                        />
                        <MetricCard icon={CheckCircle} label="Last Auto-Vacuum" value="12m ago" color={THEME.success} />
                        <MetricCard icon={Clock} label="Avg Duration" value="45s" color={THEME.primary} trend="-3s" />
                        <MetricCard
                            icon={Database}
                            label="Dead Tuples"
                            value="182K"
                            color={THEME.danger}
                            trend="+8.3%"
                        />
                    </div>

                    {/* Urgent banner */}
                    <div
                        style={{
                            padding: '10px 14px',
                            background: `${THEME.danger}12`,
                            border: `1px solid ${THEME.danger}30`,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <AlertTriangle size={16} style={{ color: THEME.danger }} />
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: THEME.danger }}>
                                2 tables require urgent VACUUM FULL
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textDim }}>
                                users table has 45K+ dead tuples — autovacuum threshold exceeded
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: 'auto',
                                padding: '4px 12px',
                                background: `${THEME.danger}20`,
                                border: `1px solid ${THEME.danger}40`,
                                borderRadius: 6,
                                fontSize: 10,
                                color: THEME.danger,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Run Now
                        </div>
                    </div>

                    <Panel title="Tables Needing Vacuum" icon={RefreshCw} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'table', label: 'Table' },
                                { key: 'schema', label: 'Schema' },
                                { key: 'lastVacuum', label: 'Last Vacuum' },
                                { key: 'deadRows', label: 'Dead Rows' },
                                { key: 'bloat', label: 'Bloat %' },
                                { key: 'priority', label: 'Priority' },
                                { key: 'action', label: '' },
                            ]}
                            rows={[
                                {
                                    table: 'users',
                                    schema: 'public',
                                    lastVacuum: '1d ago',
                                    deadRows: '45,234',
                                    bloat: <span style={{ color: THEME.danger }}>23%</span>,
                                    priority: <StatusBadge label="Critical" color={THEME.danger} />,
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.danger}15`,
                                                border: `1px solid ${THEME.danger}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.danger,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            VACUUM FULL
                                        </span>
                                    ),
                                },
                                {
                                    table: 'sessions',
                                    schema: 'public',
                                    lastVacuum: '2d ago',
                                    deadRows: '89,102',
                                    bloat: <span style={{ color: THEME.danger }}>28%</span>,
                                    priority: <StatusBadge label="Critical" color={THEME.danger} />,
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.danger}15`,
                                                border: `1px solid ${THEME.danger}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.danger,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            VACUUM FULL
                                        </span>
                                    ),
                                },
                                {
                                    table: 'orders',
                                    schema: 'public',
                                    lastVacuum: '6h ago',
                                    deadRows: '12,456',
                                    bloat: <span style={{ color: THEME.warning }}>12%</span>,
                                    priority: <StatusBadge label="Medium" color={THEME.warning} />,
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.warning}15`,
                                                border: `1px solid ${THEME.warning}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.warning,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            VACUUM
                                        </span>
                                    ),
                                },
                                {
                                    table: 'audit_logs',
                                    schema: 'logging',
                                    lastVacuum: '12h ago',
                                    deadRows: '34,567',
                                    bloat: <span style={{ color: THEME.warning }}>15%</span>,
                                    priority: <StatusBadge label="Medium" color={THEME.warning} />,
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.warning}15`,
                                                border: `1px solid ${THEME.warning}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.warning,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            VACUUM
                                        </span>
                                    ),
                                },
                                {
                                    table: 'products',
                                    schema: 'public',
                                    lastVacuum: '3h ago',
                                    deadRows: '1,234',
                                    bloat: <span style={{ color: THEME.success }}>3%</span>,
                                    priority: <StatusBadge label="Low" color={THEME.success} />,
                                    action: '',
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Dead Tuple Accumulation" icon={TrendingUp} accentColor={THEME.danger}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart
                                data={generateChartData(12).map((d, i) => ({
                                    ...d,
                                    deadTuples: Math.floor(120000 + Math.sin(i / 2) * 40000 + Math.random() * 20000),
                                }))}
                            >
                                <defs>
                                    <linearGradient id="vacuum-dead-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="deadTuples"
                                    stroke={THEME.danger}
                                    fill="url(#vacuum-dead-grad)"
                                    name="Dead Tuples"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // CAPACITY PLANNING
        if (sectionKey === 'infrastructure' && itemKey === 'capacity-planning') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={HardDrive}
                            label="Current Storage"
                            value="645 GB"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, (_, i) => 580 + i * 6 + Math.random() * 10)}
                            trend="+2.8%"
                        />
                        <MetricCard
                            icon={TrendingUp}
                            label="Growth Rate"
                            value="2.3 GB/d"
                            color={THEME.warning}
                            trend="+0.4 GB"
                        />
                        <MetricCard icon={Clock} label="Days to 80%" value="42 days" color={THEME.success} />
                        <MetricCard icon={Server} label="Total Capacity" value="1 TB" color={THEME.textMuted} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <RingGauge value={645} max={1000} label="Storage Used" color={THEME.warning} />
                        <RingGauge value={78} max={100} label="CPU Headroom" color={THEME.success} />
                        <RingGauge value={61} max={100} label="Memory Used" color={THEME.primary} />
                    </div>

                    <Panel title="Storage Growth Trend" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart
                                data={generateChartData(14).map((d, i) => ({
                                    ...d,
                                    storage: Math.floor(580 + i * 5 + Math.random() * 8),
                                }))}
                            >
                                <defs>
                                    <linearGradient id="cap-growth-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="storage"
                                    stroke={THEME.success}
                                    fill="url(#cap-growth-grad)"
                                    name="Storage (GB)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Capacity Projection" icon={BarChart2} accentColor={THEME.primary}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Storage', current: 645, max: 1000, unit: 'GB', color: THEME.warning },
                                { label: 'Connections', current: 120, max: 200, unit: '', color: THEME.primary },
                                { label: 'IOPS', current: 3400, max: 10000, unit: '', color: THEME.success },
                            ].map((r, i) => (
                                <div key={i}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 10,
                                            marginBottom: 4,
                                            color: THEME.textDim,
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, color: THEME.textMain }}>{r.label}</span>
                                        <span>
                                            {r.current} {r.unit} / {r.max} {r.unit} (
                                            {Math.round((r.current / r.max) * 100)}%)
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            height: '8px',
                                            background: THEME.glass,
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${(r.current / r.max) * 100}%`,
                                                height: '100%',
                                                background: r.color,
                                                borderRadius: 4,
                                                transition: 'width 0.3s',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Resource Forecast (90 days)" icon={Radar} accentColor={THEME.ai}>
                        <DataTable
                            columns={[
                                { key: 'resource', label: 'Resource' },
                                { key: 'current', label: 'Current' },
                                { key: 'day30', label: '30 Days' },
                                { key: 'day60', label: '60 Days' },
                                { key: 'day90', label: '90 Days' },
                                { key: 'risk', label: 'Risk' },
                            ]}
                            rows={[
                                {
                                    resource: 'Storage',
                                    current: '645 GB',
                                    day30: '724 GB',
                                    day60: '803 GB',
                                    day90: '912 GB',
                                    risk: <StatusBadge label="Medium" color={THEME.warning} />,
                                },
                                {
                                    resource: 'Connections',
                                    current: '120',
                                    day30: '135',
                                    day60: '148',
                                    day90: '162',
                                    risk: <StatusBadge label="Low" color={THEME.success} />,
                                },
                                {
                                    resource: 'CPU',
                                    current: '34%',
                                    day30: '38%',
                                    day60: '42%',
                                    day90: '47%',
                                    risk: <StatusBadge label="Low" color={THEME.success} />,
                                },
                                {
                                    resource: 'Memory',
                                    current: '61%',
                                    day30: '65%',
                                    day60: '70%',
                                    day90: '76%',
                                    risk: <StatusBadge label="Medium" color={THEME.warning} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // BACKUP & RECOVERY
        if (sectionKey === 'infrastructure' && itemKey === 'backup-recovery') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Archive}
                            label="Total Backups"
                            value="128"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 40)}
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Last Backup"
                            value="4h ago"
                            color={THEME.success}
                            trend="12.4 GB"
                        />
                        <MetricCard icon={Clock} label="Retention" value="30 days" color={THEME.textMuted} />
                        <MetricCard
                            icon={HardDrive}
                            label="Backup Size"
                            value="2.4 TB"
                            color={THEME.warning}
                            trend="+3.2%"
                        />
                    </div>

                    {/* Success banner */}
                    <div
                        style={{
                            padding: '10px 14px',
                            background: `${THEME.success}12`,
                            border: `1px solid ${THEME.success}30`,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <CheckCircle size={16} style={{ color: THEME.success }} />
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: THEME.success }}>
                                All backups healthy — last recovery test passed
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textDim }}>
                                Recovery Time Objective (RTO): 8m 23s | Recovery Point Objective (RPO): 4h
                            </div>
                        </div>
                    </div>

                    <Panel title="Backup Schedule" icon={Archive} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'time', label: 'Scheduled' },
                                { key: 'type', label: 'Type' },
                                { key: 'size', label: 'Size' },
                                { key: 'duration', label: 'Duration' },
                                { key: 'status', label: 'Status' },
                            ]}
                            rows={[
                                {
                                    time: '02:00 UTC',
                                    type: <StatusBadge label="Full" color={THEME.primary} />,
                                    size: '12.4 GB',
                                    duration: '18m 45s',
                                    status: <StatusBadge label="Completed" color={THEME.success} />,
                                },
                                {
                                    time: '08:00 UTC',
                                    type: <StatusBadge label="Incremental" color={THEME.ai} />,
                                    size: '1.2 GB',
                                    duration: '3m 12s',
                                    status: <StatusBadge label="Completed" color={THEME.success} />,
                                },
                                {
                                    time: '14:00 UTC',
                                    type: <StatusBadge label="Incremental" color={THEME.ai} />,
                                    size: '890 MB',
                                    duration: '2m 34s',
                                    status: <StatusBadge label="Completed" color={THEME.success} />,
                                },
                                {
                                    time: '20:00 UTC',
                                    type: <StatusBadge label="Incremental" color={THEME.ai} />,
                                    size: '-',
                                    duration: '-',
                                    status: <StatusBadge label="Scheduled" color={THEME.textMuted} />,
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Backup Size Trend" icon={TrendingUp} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart
                                data={generateChartData(14).map((d, i) => ({
                                    ...d,
                                    size: Math.floor(10 + i * 0.3 + Math.random() * 2),
                                }))}
                            >
                                <defs>
                                    <linearGradient id="backup-size-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.warning} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.warning} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="size"
                                    stroke={THEME.warning}
                                    fill="url(#backup-size-grad)"
                                    name="Backup Size (GB)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Recovery Test Results" icon={ShieldCheck} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'date', label: 'Date' },
                                { key: 'type', label: 'Test Type' },
                                { key: 'rto', label: 'Recovery Time' },
                                { key: 'dataLoss', label: 'Data Loss' },
                                { key: 'result', label: 'Result' },
                            ]}
                            rows={[
                                {
                                    date: '2d ago',
                                    type: 'Full Restore',
                                    rto: '8m 23s',
                                    dataLoss: '0 rows',
                                    result: <StatusBadge label="PASS" color={THEME.success} />,
                                },
                                {
                                    date: '1w ago',
                                    type: 'Point-in-Time',
                                    rto: '4m 12s',
                                    dataLoss: '0 rows',
                                    result: <StatusBadge label="PASS" color={THEME.success} />,
                                },
                                {
                                    date: '2w ago',
                                    type: 'Full Restore',
                                    rto: '9m 45s',
                                    dataLoss: '0 rows',
                                    result: <StatusBadge label="PASS" color={THEME.success} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // SECURITY & COMPLIANCE
        if (sectionKey === 'security' && itemKey === 'security-compliance') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={ShieldCheck}
                            label="Security Score"
                            value="94"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 88 + Math.random() * 10)}
                            trend="+2.1%"
                        />
                        <MetricCard icon={AlertTriangle} label="Issues" value="2" color={THEME.warning} />
                        <MetricCard icon={Lock} label="Encryption" value="AES-256" color={THEME.success} />
                        <MetricCard icon={Eye} label="Audit Events" value="12.4K" color={THEME.ai} trend="+5.3%" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <RingGauge value={94} max={100} label="Overall Score" color={THEME.success} />
                        <RingGauge value={100} max={100} label="Encryption" color={THEME.success} />
                        <RingGauge value={78} max={100} label="Access Control" color={THEME.warning} />
                    </div>

                    <Panel title="Compliance Checks" icon={ShieldCheck} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'check', label: 'Check' },
                                { key: 'category', label: 'Category' },
                                { key: 'status', label: 'Status' },
                                { key: 'lastRun', label: 'Last Run' },
                                { key: 'action', label: '' },
                            ]}
                            rows={[
                                {
                                    check: 'SSL/TLS Enabled',
                                    category: 'Encryption',
                                    status: <StatusBadge label="Pass" color={THEME.success} />,
                                    lastRun: '2h ago',
                                    action: '',
                                },
                                {
                                    check: 'Password Policy',
                                    category: 'Auth',
                                    status: <StatusBadge label="Pass" color={THEME.success} />,
                                    lastRun: '1d ago',
                                    action: '',
                                },
                                {
                                    check: 'Row-Level Security',
                                    category: 'Access',
                                    status: <StatusBadge label="Pass" color={THEME.success} />,
                                    lastRun: '4h ago',
                                    action: '',
                                },
                                {
                                    check: 'Audit Logging',
                                    category: 'Audit',
                                    status: <StatusBadge label="Warn" color={THEME.warning} />,
                                    lastRun: '3d ago',
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.warning}20`,
                                                border: `1px solid ${THEME.warning}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.warning,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Fix
                                        </span>
                                    ),
                                },
                                {
                                    check: 'Superuser Audit',
                                    category: 'Auth',
                                    status: <StatusBadge label="Warn" color={THEME.warning} />,
                                    lastRun: '1d ago',
                                    action: (
                                        <span
                                            style={{
                                                padding: '2px 8px',
                                                background: `${THEME.warning}20`,
                                                border: `1px solid ${THEME.warning}30`,
                                                borderRadius: 4,
                                                fontSize: 9,
                                                color: THEME.warning,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Fix
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Recent Security Events" icon={Shield} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                {
                                    time: '14:32',
                                    event: 'Failed login attempt from 192.168.1.45',
                                    severity: 'WARN',
                                    color: THEME.warning,
                                },
                                {
                                    time: '12:18',
                                    event: 'New superuser role created: dba_admin',
                                    severity: 'INFO',
                                    color: THEME.primary,
                                },
                                {
                                    time: '10:45',
                                    event: 'SSL certificate renewed successfully',
                                    severity: 'INFO',
                                    color: THEME.success,
                                },
                            ].map((e, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 12px',
                                        background: THEME.glass,
                                        borderRadius: 6,
                                        borderLeft: `3px solid ${e.color}`,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: THEME.fontMono,
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {e.time}
                                    </span>
                                    <StatusBadge label={e.severity} color={e.color} />
                                    <span style={{ fontSize: 11, color: THEME.textMain }}>{e.event}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // OBSERVABILITY HUB
        if (sectionKey === 'observability' && itemKey === 'observability-hub') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={BarChart2} label="Metrics" value="2,456" color={THEME.ai} />
                        <MetricCard icon={FileSearch} label="Logs" value="1.2M" color={THEME.warning} />
                        <MetricCard icon={Radar} label="Traces" value="45K" color={THEME.primary} />
                    </div>
                    <Panel title="Integration Status" icon={Radio} accentColor={THEME.warning}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {['Prometheus', 'Grafana', 'Loki', 'Jaeger'].map((t, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t}</div>
                                    <StatusBadge label="Connected" color={THEME.success} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // CLOUDWATCH
        if (sectionKey === 'observability' && itemKey === 'cloudwatch') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Bell}
                            label="CloudWatch Alarms"
                            value="24"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 15 + Math.random() * 30)}
                            trend="+2.3%"
                        />
                        <MetricCard
                            icon={Radio}
                            label="Metrics Streams"
                            value="8"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 12)}
                            trend="+0.8%"
                        />
                        <MetricCard
                            icon={LayoutDashboard}
                            label="Dashboards"
                            value="12"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 8 + Math.random() * 18)}
                            trend="+1.2%"
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Anomaly Detections"
                            value="156"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 100)}
                            trend="+5.1%"
                        />
                    </div>

                    <Panel title="CloudWatch Metrics" icon={Cloud} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoData.clusterVelocity}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line type="monotone" dataKey="qps" stroke={THEME.warning} strokeWidth={2} name="CPU" />
                                <Line type="monotone" dataKey="tps" stroke={THEME.ai} strokeWidth={2} name="Memory" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Alarm History" icon={Bell} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'timestamp', label: 'TIMESTAMP', width: '20%' },
                                { key: 'alarm', label: 'ALARM', width: '30%' },
                                { key: 'reason', label: 'REASON', width: '30%' },
                                { key: 'action', label: 'ACTION', width: '20%' },
                            ]}
                            rows={[
                                {
                                    timestamp: '14:32:45',
                                    alarm: 'High CPU Usage',
                                    reason: 'CPU > 80%',
                                    action: <StatusBadge label="Auto-scaled" color={THEME.success} />,
                                },
                                {
                                    timestamp: '12:18:22',
                                    alarm: 'Memory Pressure',
                                    reason: 'Memory > 85%',
                                    action: <StatusBadge label="Notified" color={THEME.warning} />,
                                },
                                {
                                    timestamp: '10:45:10',
                                    alarm: 'Disk Space Low',
                                    reason: 'Disk < 10%',
                                    action: <StatusBadge label="Escalated" color={THEME.danger} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // LOG PATTERN ANALYSIS
        if (sectionKey === 'observability' && itemKey === 'log-patterns') {
            const logPatternChartData = generateChartData(12).map((d, i) => ({
                ...d,
                connectionTimeout: Math.floor(150 + Math.sin(i / 4) * 50 + Math.random() * 40),
                querySlow: Math.floor(80 + Math.cos(i / 4) * 30 + Math.random() * 20),
                other: Math.floor(40 + Math.random() * 25),
            }));

            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'wait-events', label: 'Wait Events' },
                            { key: 'slow-queries', label: 'Slow Queries' },
                            { key: 'db-activity', label: 'DB Activity' },
                        ]}
                        active={logTab}
                        onChange={setLogTab}
                        accentColor={THEME.warning}
                    />

                    {/* ── TAB 1: Wait Events ── */}
                    {logTab === 'wait-events' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={Clock}
                                    label="Total Wait Events"
                                    value="1.2K"
                                    color={THEME.warning}
                                    spark={Array.from({ length: 12 }, () => 800 + Math.random() * 600)}
                                    trend="+3.2%"
                                />
                                <MetricCard
                                    icon={AlertTriangle}
                                    label="Avg Wait Time"
                                    value="23ms"
                                    color={THEME.danger}
                                    trend="-1.5%"
                                />
                                <MetricCard icon={Database} label="Lock Waits" value="234" color={THEME.ai} />
                                <MetricCard icon={Cpu} label="CPU Waits" value="42" color={THEME.primary} />
                            </div>
                            {/* Search / Filter Bar */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        flex: 1,
                                        minWidth: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                    }}
                                >
                                    <FileSearch size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: THEME.textDim }}>
                                        Search wait events, queries...
                                    </span>
                                </div>
                                {['All Types', 'Last 24h', 'Min 10ms'].map((f, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '5px 10px',
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 6,
                                            fontSize: 10,
                                            color: THEME.textMuted,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {f} ▾
                                    </div>
                                ))}
                            </div>
                            <Panel title="Wait Events Distribution" icon={FileSearch} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Lock', value: 324, fill: THEME.danger },
                                                { name: 'I/O', value: 156, fill: THEME.ai },
                                                { name: 'CPU', value: 42, fill: THEME.primary },
                                                { name: 'Other', value: 28, fill: THEME.warning },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {[THEME.danger, THEME.ai, THEME.primary, THEME.warning].map(
                                                (color, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={color} />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Panel>
                            <Panel title="Wait Event Frequency" icon={FileSearch} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'event', label: 'Event Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'avgTime', label: 'Avg Time' },
                                    ]}
                                    rows={[
                                        {
                                            event: 'Lock waits',
                                            count: '324',
                                            avgTime: '34ms',
                                        },
                                        {
                                            event: 'I/O waits',
                                            count: '156',
                                            avgTime: '12ms',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 2: Slow Queries ── */}
                    {logTab === 'slow-queries' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={FileSearch}
                                    label="Slow Query Patterns"
                                    value="234"
                                    color={THEME.warning}
                                    trend="+3.2%"
                                    spark={Array.from({ length: 12 }, () => Math.random() * 250)}
                                />
                                <MetricCard
                                    icon={AlertTriangle}
                                    label="Error Rate"
                                    value="2.3%"
                                    color={THEME.danger}
                                    trend="-0.5%"
                                    spark={Array.from({ length: 12 }, () => 1 + Math.random() * 4)}
                                />
                                <MetricCard
                                    icon={Zap}
                                    label="New Patterns"
                                    value="8"
                                    color={THEME.ai}
                                    trend="+1.1%"
                                    spark={Array.from({ length: 12 }, () => 4 + Math.random() * 8)}
                                />
                                <MetricCard
                                    icon={Database}
                                    label="Log Volume"
                                    value="892K"
                                    color={THEME.primary}
                                    trend="+4.8%"
                                    spark={Array.from({ length: 12 }, () => 600 + Math.random() * 400)}
                                />
                            </div>

                            <Panel title="Log Pattern Distribution" icon={FileSearch} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Connection Timeout', value: 324, fill: THEME.warning },
                                                { name: 'Query Slow', value: 156, fill: THEME.ai },
                                                { name: 'Auth Failed', value: 42, fill: THEME.danger },
                                                { name: 'Other', value: 28, fill: THEME.primary },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {[THEME.warning, THEME.ai, THEME.danger, THEME.primary].map(
                                                (color, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={color} />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Panel>

                            <Panel title="Slow Query Patterns" icon={FileSearch} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'pattern', label: 'Pattern' },
                                        { key: 'count', label: 'Occurrences' },
                                        { key: 'severity', label: 'Severity' },
                                    ]}
                                    rows={[
                                        {
                                            pattern: 'Connection timeout',
                                            count: '324',
                                            severity: <StatusBadge label="Warning" color={THEME.warning} />,
                                        },
                                        {
                                            pattern: 'Query slow',
                                            count: '156',
                                            severity: <StatusBadge label="Info" color={THEME.primary} />,
                                        },
                                        {
                                            pattern: 'Connection refused',
                                            count: '8',
                                            severity: <StatusBadge label="Error" color={THEME.danger} />,
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: DB Activity ── */}
                    {logTab === 'db-activity' && (
                        <>
                            <Panel title="Database Activity Patterns" icon={Activity} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={demoData.connectionTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="active"
                                            stroke={THEME.primary}
                                            strokeWidth={2}
                                            name="Connections"
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
                            <Panel title="Activity Summary" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'activity', label: 'Activity' },
                                        { key: 'current', label: 'Current' },
                                        { key: 'peak', label: 'Peak' },
                                        { key: 'avg', label: 'Avg' },
                                    ]}
                                    rows={[
                                        {
                                            activity: 'Active Connections',
                                            current: '42',
                                            peak: '128',
                                            avg: '67',
                                        },
                                        {
                                            activity: 'Queries/sec',
                                            current: '1,234',
                                            peak: '3,456',
                                            avg: '2,100',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // OPENTELEMETRY
        if (sectionKey === 'observability' && itemKey === 'opentelemetry') {
            const serviceLatencyChartData = generateChartData(12).map((d, i) => ({
                ...d,
                'API Gateway': Math.floor(45 + Math.sin(i / 3) * 20 + Math.random() * 15),
                'Auth Service': Math.floor(35 + Math.cos(i / 3) * 15 + Math.random() * 12),
                'DB Service': Math.floor(120 + Math.sin(i / 3) * 40 + Math.random() * 30),
                'Cache Service': Math.floor(8 + Math.cos(i / 3) * 3 + Math.random() * 2),
            }));

            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Radar}
                            label="Active Traces"
                            value="12,456"
                            color={THEME.primary}
                            trend="+2.1%"
                            spark={Array.from({ length: 12 }, () => 10000 + Math.random() * 5000)}
                        />
                        <MetricCard
                            icon={Network}
                            label="Spans/sec"
                            value="8,234"
                            color={THEME.ai}
                            trend="+3.4%"
                            spark={Array.from({ length: 12 }, () => 7000 + Math.random() * 2500)}
                        />
                        <MetricCard
                            icon={Globe}
                            label="Services"
                            value="18"
                            color={THEME.success}
                            trend="+0.0%"
                            spark={Array.from({ length: 12 }, () => 15 + Math.random() * 5)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Error Rate"
                            value="0.8%"
                            color={THEME.danger}
                            trend="-0.2%"
                            spark={Array.from({ length: 12 }, () => 0.5 + Math.random() * 1.5)}
                        />
                    </div>

                    <Panel title="Service Latency (p50)" icon={BarChart3} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={serviceLatencyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                <YAxis stroke={THEME.textDim} fontSize={9} />
                                <Tooltip content={<ChartTip />} />
                                <Legend />
                                <Bar dataKey="API Gateway" fill={THEME.primary} />
                                <Bar dataKey="DB Service" fill={THEME.warning} />
                                <Bar dataKey="Auth Service" fill={THEME.ai} />
                                <Bar dataKey="Cache Service" fill={THEME.success} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Trace Waterfall" icon={Radar} accentColor={THEME.primary}>
                        <div
                            style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim, lineHeight: 1.8 }}
                        >
                            <div style={{ color: THEME.ai }}>query_execute [→ 1.2s]</div>
                            <div style={{ marginLeft: '20px', color: THEME.warning }}>├─ parse [→ 12ms]</div>
                            <div style={{ marginLeft: '20px', color: THEME.warning }}>├─ plan [→ 34ms]</div>
                            <div style={{ marginLeft: '20px', color: THEME.success }}>└─ execute [→ 1.1s]</div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // KUBERNETES
        if (sectionKey === 'observability' && itemKey === 'kubernetes') {
            const kubeResourceChartData = generateChartData(12).map((d, i) => ({
                ...d,
                cpuUsage: Math.floor(35 + Math.sin(i / 3) * 20 + Math.random() * 15),
                memoryUsage: Math.floor(45 + Math.cos(i / 3) * 25 + Math.random() * 18),
                diskUsage: Math.floor(60 + Math.sin(i / 4) * 15 + Math.random() * 10),
                networkIn: Math.floor(200 + Math.random() * 150),
            }));

            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Container}
                            label="Total Pods"
                            value="18"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 15 + Math.random() * 8)}
                            trend="+0.0%"
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Healthy Pods"
                            value="17"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 16 + Math.random() * 2)}
                            trend="+5.9%"
                        />
                        <MetricCard
                            icon={RefreshCw}
                            label="Pod Restarts"
                            value="2"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 3)}
                            trend="+0.0%"
                        />
                        <MetricCard
                            icon={Cpu}
                            label="Avg CPU Usage"
                            value="34%"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 25 + Math.random() * 25)}
                            trend="+1.3%"
                        />
                    </div>

                    <Panel title="Resource Usage" icon={BarChart3} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={kubeResourceChartData}>
                                <defs>
                                    <linearGradient id="pg-cpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.ai} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.ai} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="pg-mem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                <YAxis stroke={THEME.textDim} fontSize={9} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cpuUsage"
                                    stroke={THEME.ai}
                                    fill="url(#pg-cpu)"
                                    name="CPU %"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="memoryUsage"
                                    stroke={THEME.warning}
                                    fill="url(#pg-mem)"
                                    name="Memory %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Pod Status" icon={Container} accentColor={THEME.primary}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {['postgres-0', 'postgres-1', 'postgres-2'].map((pod, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px',
                                        background: THEME.glass,
                                        borderRadius: 8,
                                        textAlign: 'center',
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
                                        {pod}
                                    </div>
                                    <StatusBadge label="Running" color={THEME.success} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // STATUS PAGE
        if (sectionKey === 'observability' && itemKey === 'status-page') {
            const uptimeChartData = generateChartData(24).map((d, i) => ({
                ...d,
                uptime: 99 + Math.sin(i / 8) * 0.98 + Math.random() * 0.02,
            }));

            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={CheckCircle}
                            label="System Uptime"
                            value="99.98%"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 99.9 + Math.random() * 0.1)}
                            trend="+0.02%"
                        />
                        <MetricCard
                            icon={Clock}
                            label="Avg Response Time"
                            value="142ms"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 100)}
                            trend="-1.8%"
                        />
                        <MetricCard
                            icon={AlertOctagon}
                            label="Incidents"
                            value="0"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 1)}
                            trend="+0.0%"
                        />
                        <MetricCard
                            icon={Globe}
                            label="Services"
                            value="24"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 20 + Math.random() * 8)}
                            trend="+0.0%"
                        />
                    </div>

                    <Panel title="Uptime History (24h)" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={uptimeChartData}>
                                <defs>
                                    <linearGradient id="pg-uptime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.success} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.success} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                <YAxis stroke={THEME.textDim} fontSize={9} domain={[99.8, 100]} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="uptime"
                                    stroke={THEME.success}
                                    fill="url(#pg-uptime)"
                                    name="Uptime %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="System Status" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { component: 'Database', status: 'Operational', uptime: '99.98%' },
                                { component: 'API', status: 'Operational', uptime: '99.99%' },
                                { component: 'Replication', status: 'Operational', uptime: '99.95%' },
                                { component: 'Backups', status: 'Operational', uptime: '100%' },
                            ].map((c, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px',
                                        background: THEME.glass,
                                        borderRadius: 6,
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: THEME.textMain }}>{c.component}</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <StatusBadge label={c.status} color={THEME.success} />
                                        <span style={{ fontSize: 10, color: THEME.textDim }}>{c.uptime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Recent Incidents" icon={AlertOctagon} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'date', label: 'DATE', width: '25%' },
                                { key: 'service', label: 'SERVICE', width: '25%' },
                                { key: 'duration', label: 'DURATION', width: '25%' },
                                { key: 'status', label: 'STATUS', width: '25%' },
                            ]}
                            rows={[
                                {
                                    date: '2024-03-20',
                                    service: 'API Gateway',
                                    duration: '12 min',
                                    status: <StatusBadge label="Resolved" color={THEME.success} />,
                                },
                                {
                                    date: '2024-03-15',
                                    service: 'Database',
                                    duration: '8 min',
                                    status: <StatusBadge label="Resolved" color={THEME.success} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // AI MONITORING
        if (sectionKey === 'observability' && itemKey === 'ai-monitoring') {
            const anomalyChartData = generateChartData(24).map((d, i) => ({
                ...d,
                anomalyScore: Math.floor(20 + Math.sin(i / 6) * 15 + Math.random() * 10),
                baseline: 25,
            }));

            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={Brain}
                            label="Anomalies"
                            value="3"
                            color={THEME.danger}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 5)}
                            trend="-1.2%"
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Model Accuracy"
                            value="96.2%"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 94 + Math.random() * 3)}
                            trend="+0.8%"
                        />
                        <MetricCard
                            icon={Layers}
                            label="Active Models"
                            value="7"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 4)}
                            trend="+0.0%"
                        />
                        <MetricCard
                            icon={Zap}
                            label="Predictions/hr"
                            value="24,582"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 20000 + Math.random() * 10000)}
                            trend="+3.6%"
                        />
                    </div>

                    <Panel title="Anomaly Detection Trends" icon={TrendingUp} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={anomalyChartData}>
                                <defs>
                                    <linearGradient id="pg-anomaly" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.danger} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.danger} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                <YAxis stroke={THEME.textDim} fontSize={9} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="anomalyScore"
                                    stroke={THEME.danger}
                                    fill="url(#pg-anomaly)"
                                    name="Anomaly Score"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="baseline"
                                    stroke={THEME.textDim}
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                    name="Baseline"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="AI-Powered Anomaly Detection" icon={Brain} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { anomaly: 'Unusual query pattern detected', score: 0.89, timestamp: '2h ago' },
                                { anomaly: 'Connection spike detected', score: 0.76, timestamp: '4h ago' },
                                { anomaly: 'Memory usage trend change', score: 0.62, timestamp: '6h ago' },
                            ].map((a, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: 6 }}>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {a.anomaly}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>
                                        Confidence: {(a.score * 100).toFixed(0)}% • {a.timestamp}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // SQL CONSOLE
        if (sectionKey === 'developer' && itemKey === 'sql-console') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="SQL Editor" icon={Terminal} accentColor={THEME.ai}>
                        <div
                            style={{
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                borderRadius: 6,
                                padding: '12px',
                                fontFamily: THEME.fontMono,
                                fontSize: 11,
                                color: THEME.textDim,
                                minHeight: 100,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            SELECT u.id, u.email, COUNT(o.id) as order_count{'\n'}FROM users u{'\n'}LEFT JOIN orders o
                            ON u.id = o.user_id{'\n'}GROUP BY u.id, u.email{'\n'}LIMIT 100;
                        </div>
                    </Panel>
                    <Panel title="Query Results" icon={CheckCircle} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'email', label: 'Email' },
                                { key: 'orders', label: 'Orders' },
                            ]}
                            rows={[
                                { id: '1', email: 'user1@example.com', orders: '5' },
                                { id: '2', email: 'user2@example.com', orders: '12' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // API TRACING
        if (sectionKey === 'developer' && itemKey === 'api-tracing') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MetricCard icon={Network} label="API Endpoints" value="45" color={THEME.primary} />
                    <Panel title="Endpoint Latency" icon={Network} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'endpoint', label: 'Endpoint' },
                                { key: 'method', label: 'Method' },
                                { key: 'latency', label: 'Avg Latency' },
                                { key: 'calls', label: 'Calls (24h)' },
                            ]}
                            rows={[
                                { endpoint: '/api/users', method: 'GET', latency: '45ms', calls: '12,456' },
                                { endpoint: '/api/orders', method: 'GET', latency: '123ms', calls: '8,234' },
                                { endpoint: '/api/users', method: 'POST', latency: '234ms', calls: '1,234' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // REPOSITORY
        if (sectionKey === 'developer' && itemKey === 'repository') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'code', label: 'Code' },
                            { key: 'insights', label: 'Insights' },
                            { key: 'cicd', label: 'CI/CD' },
                            { key: 'prs', label: 'Pull Requests' },
                            { key: 'database', label: 'Database' },
                        ]}
                        active={repoTab}
                        onChange={setRepoTab}
                        accentColor={THEME.primary}
                    />

                    {/* ── TAB 1: Code ── */}
                    {repoTab === 'code' && (
                        <>
                            <MetricCard icon={FolderGit2} label="Commits" value="1,234" color={THEME.primary} />
                            <Panel title="Recent Changes" icon={FolderGit2} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'commit', label: 'Commit' },
                                        { key: 'message', label: 'Message' },
                                        { key: 'author', label: 'Author' },
                                        { key: 'date', label: 'Date' },
                                    ]}
                                    rows={[
                                        {
                                            commit: 'a3f9e2c',
                                            message: 'Fix query optimizer',
                                            author: 'John Doe',
                                            date: '2h ago',
                                        },
                                        {
                                            commit: 'f7d4c89',
                                            message: 'Add replication monitoring',
                                            author: 'Jane Smith',
                                            date: '4h ago',
                                        },
                                        {
                                            commit: 'e1b2d45',
                                            message: 'Update schema browser',
                                            author: 'John Doe',
                                            date: '6h ago',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 2: Insights ── */}
                    {repoTab === 'insights' && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                <MetricCard
                                    icon={TrendingUp}
                                    label="Code Changes"
                                    value="342"
                                    sub="This Month"
                                    color={THEME.primary}
                                />
                                <MetricCard icon={GitBranch} label="Active Branches" value="12" color={THEME.ai} />
                                <MetricCard icon={Users} label="Contributors" value="8" color={THEME.success} />
                            </div>
                            <Panel title="Code Metrics" icon={BarChart3} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'metric', label: 'Metric' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'trend', label: 'Trend' },
                                    ]}
                                    rows={[
                                        {
                                            metric: 'Code Coverage',
                                            value: '78%',
                                            trend: '+2%',
                                        },
                                        {
                                            metric: 'Average PR Size',
                                            value: '145 lines',
                                            trend: '-5%',
                                        },
                                        {
                                            metric: 'Build Time',
                                            value: '4.2 min',
                                            trend: '-0.3min',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 3: CI/CD ── */}
                    {repoTab === 'cicd' && (
                        <>
                            <Panel title="Pipeline Status" icon={Workflow} accentColor={THEME.success}>
                                <DataTable
                                    columns={[
                                        { key: 'stage', label: 'Stage' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'duration', label: 'Duration' },
                                        { key: 'lastRun', label: 'Last Run' },
                                    ]}
                                    rows={[
                                        {
                                            stage: 'Build',
                                            status: 'Success',
                                            duration: '2m 30s',
                                            lastRun: '5m ago',
                                        },
                                        {
                                            stage: 'Test',
                                            status: 'Success',
                                            duration: '1m 45s',
                                            lastRun: '3m ago',
                                        },
                                        {
                                            stage: 'Deploy',
                                            status: 'Running',
                                            duration: '1m 12s',
                                            lastRun: '1m ago',
                                        },
                                    ]}
                                />
                            </Panel>
                            <Panel title="Build History" icon={BarChart3} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={generateChartData(10)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={9} />
                                        <YAxis stroke={THEME.textDim} fontSize={9} />
                                        <Bar dataKey="value" fill={THEME.success} name="Build Time (s)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 4: Pull Requests ── */}
                    {repoTab === 'prs' && (
                        <>
                            <Panel title="Open Pull Requests" icon={GitBranch} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'title', label: 'Title' },
                                        { key: 'author', label: 'Author' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'reviews', label: 'Reviews' },
                                    ]}
                                    rows={[
                                        {
                                            title: 'Add query caching layer',
                                            author: 'Alice Chen',
                                            status: 'In Review',
                                            reviews: '2/3',
                                        },
                                        {
                                            title: 'Implement connection pooling',
                                            author: 'Bob Wilson',
                                            status: 'Approved',
                                            reviews: '3/3',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}

                    {/* ── TAB 5: Database ── */}
                    {repoTab === 'database' && (
                        <>
                            <Panel title="Schema Connections" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'entity', label: 'Entity' },
                                        { key: 'type', label: 'Type' },
                                        { key: 'migrations', label: 'Migrations' },
                                        { key: 'status', label: 'Status' },
                                    ]}
                                    rows={[
                                        {
                                            entity: 'users_table',
                                            type: 'Table',
                                            migrations: '12',
                                            status: 'Current',
                                        },
                                        {
                                            entity: 'idx_users_email',
                                            type: 'Index',
                                            migrations: '5',
                                            status: 'Current',
                                        },
                                    ]}
                                />
                            </Panel>
                        </>
                    )}
                </div>
            );
        }

        // AI ADVISOR
        if (sectionKey === 'developer' && itemKey === 'ai-advisor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MetricCard icon={Brain} label="Recommendations" value="8" color={THEME.ai} />
                    <Panel title="Query Recommendations" icon={Brain} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                {
                                    query: 'SELECT COUNT(*) FROM users...',
                                    recommendation: 'Add index on created_at',
                                    priority: 'High',
                                },
                                {
                                    query: 'UPDATE orders SET status...',
                                    recommendation: 'Use batch updates',
                                    priority: 'Medium',
                                },
                            ].map((r, i) => (
                                <div key={i} style={{ padding: '12px', background: THEME.glass, borderRadius: 6 }}>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: THEME.textMain,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {r.recommendation}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>
                                        Priority:{' '}
                                        <span style={{ color: r.priority === 'High' ? THEME.danger : THEME.warning }}>
                                            {r.priority}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ADMIN SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'admin' && itemKey === 'dba-tasks') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        DBA Task Scheduler
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard
                            icon={Calendar}
                            label="Scheduled Tasks"
                            value="14"
                            sub="8 active"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                            trend="+2"
                            trendUp
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Completed Today"
                            value="23"
                            sub="0 failed"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 30)}
                        />
                        <MetricCard
                            icon={Clock}
                            label="Next Scheduled"
                            value="2m 14s"
                            sub="VACUUM ANALYZE"
                            color={THEME.warning}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Failed (7d)"
                            value="1"
                            sub="Retry scheduled"
                            color={THEME.danger}
                        />
                    </div>
                    <Panel title="ACTIVE TASKS" icon={Calendar} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Task Name' },
                                { key: 'schedule', label: 'Schedule' },
                                { key: 'last', label: 'Last Run' },
                                { key: 'status', label: 'Status' },
                            ]}
                            rows={[
                                { name: 'VACUUM ANALYZE', schedule: 'Every 4h', last: '1h 46m ago', status: 'Active' },
                                { name: 'pg_dump backup', schedule: 'Daily 02:00', last: '14h ago', status: 'Active' },
                                {
                                    name: 'Reindex large tables',
                                    schedule: 'Weekly Sun 03:00',
                                    last: '3d ago',
                                    status: 'Active',
                                },
                                { name: 'Stats reset', schedule: 'Monthly 1st', last: '22d ago', status: 'Active' },
                                {
                                    name: 'Archive old logs',
                                    schedule: 'Daily 04:00',
                                    last: '10h ago',
                                    status: 'Active',
                                },
                            ]}
                        />
                    </Panel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Panel title="TASK EXECUTION HISTORY" icon={BarChart3} accentColor={THEME.success}>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    data={[
                                        { name: 'Mon', success: 22, failed: 0 },
                                        { name: 'Tue', success: 24, failed: 1 },
                                        { name: 'Wed', success: 23, failed: 0 },
                                        { name: 'Thu', success: 21, failed: 0 },
                                        { name: 'Fri', success: 25, failed: 0 },
                                        { name: 'Sat', success: 18, failed: 0 },
                                        { name: 'Sun', success: 16, failed: 0 },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                    <XAxis dataKey="name" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                    <YAxis stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 8,
                                        }}
                                    />
                                    <Bar dataKey="success" fill={THEME.success} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="failed" fill={THEME.danger} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Panel>
                        <Panel title="UPCOMING SCHEDULE" icon={Clock} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { task: 'VACUUM ANALYZE public.orders', time: 'In 2m 14s', color: THEME.primary },
                                    { task: 'pg_dump full backup', time: 'In 8h 12m', color: THEME.success },
                                    { task: 'Reindex idx_orders_date', time: 'In 2d 14h', color: THEME.ai },
                                    { task: 'Monthly stats reset', time: 'In 5d', color: THEME.warning },
                                ].map((t, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: i < 3 ? `1px solid ${THEME.gridDark}` : 'none',
                                            fontSize: 11,
                                        }}
                                    >
                                        <span style={{ color: THEME.textMuted }}>{t.task}</span>
                                        <StatusBadge label={t.time} color={t.color} />
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'user-management') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        User Management
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard
                            icon={Users}
                            label="Total Users"
                            value="18"
                            sub="12 active"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 20)}
                        />
                        <MetricCard
                            icon={Shield}
                            label="Admin Users"
                            value="3"
                            sub="2 super-admin"
                            color={THEME.danger}
                        />
                        <MetricCard
                            icon={Lock}
                            label="2FA Enabled"
                            value="14"
                            sub="78% coverage"
                            color={THEME.success}
                            trend="+12%"
                            trendUp
                        />
                        <MetricCard
                            icon={Clock}
                            label="Avg Session"
                            value="4.2h"
                            sub="Peak: 12h"
                            color={THEME.warning}
                        />
                    </div>
                    <Panel title="USER ACCOUNTS" icon={Users} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'user', label: 'User' },
                                { key: 'role', label: 'Role' },
                                { key: 'lastLogin', label: 'Last Login' },
                                { key: 'status', label: 'Status' },
                                { key: 'twofa', label: '2FA' },
                            ]}
                            rows={[
                                {
                                    user: 'admin@vigil.io',
                                    role: 'Super Admin',
                                    lastLogin: '2m ago',
                                    status: 'Online',
                                    twofa: 'Enabled',
                                },
                                {
                                    user: 'dba@company.com',
                                    role: 'DBA',
                                    lastLogin: '1h ago',
                                    status: 'Online',
                                    twofa: 'Enabled',
                                },
                                {
                                    user: 'dev.lead@company.com',
                                    role: 'Developer',
                                    lastLogin: '3h ago',
                                    status: 'Offline',
                                    twofa: 'Enabled',
                                },
                                {
                                    user: 'analyst@company.com',
                                    role: 'Read Only',
                                    lastLogin: '1d ago',
                                    status: 'Offline',
                                    twofa: 'Disabled',
                                },
                                {
                                    user: 'monitoring@ops.io',
                                    role: 'Monitor',
                                    lastLogin: '5m ago',
                                    status: 'Online',
                                    twofa: 'Enabled',
                                },
                            ]}
                        />
                    </Panel>
                    <Panel title="ROLE PERMISSIONS" icon={Shield} accentColor={THEME.danger}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                {
                                    role: 'Super Admin',
                                    perms: 'Full access to all features',
                                    count: 2,
                                    color: THEME.danger,
                                },
                                {
                                    role: 'DBA',
                                    perms: 'Database management, backups, queries',
                                    count: 4,
                                    color: THEME.warning,
                                },
                                {
                                    role: 'Developer',
                                    perms: 'Query analysis, schema browser, read-only',
                                    count: 6,
                                    color: THEME.primary,
                                },
                                { role: 'Read Only', perms: 'Dashboard viewing only', count: 4, color: THEME.textDim },
                                {
                                    role: 'Monitor',
                                    perms: 'Alerts, observability, status page',
                                    count: 2,
                                    color: THEME.success,
                                },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: 12,
                                        borderRadius: 8,
                                        background: `${r.color}08`,
                                        border: `1px solid ${r.color}18`,
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginBottom: 4 }}>
                                        {r.role}
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 6 }}>{r.perms}</div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted }}>{r.count} users</div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'admin-panel') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        Admin Panel
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard
                            icon={Server}
                            label="Server Uptime"
                            value="99.97%"
                            sub="42d 6h 14m"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 99 + Math.random())}
                        />
                        <MetricCard
                            icon={Database}
                            label="DB Connections"
                            value="152"
                            sub="Max: 500"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 80)}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Storage Used"
                            value="234 GB"
                            sub="of 500 GB (47%)"
                            color={THEME.warning}
                            trend="+3.2%"
                            trendUp
                        />
                        <MetricCard
                            icon={Cpu}
                            label="Avg CPU"
                            value="38%"
                            sub="8 cores"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 20 + Math.random() * 40)}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Panel title="SYSTEM CONFIGURATION" icon={Settings} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { key: 'max_connections', val: '500', def: '100' },
                                    { key: 'shared_buffers', val: '4GB', def: '128MB' },
                                    { key: 'work_mem', val: '256MB', def: '4MB' },
                                    { key: 'maintenance_work_mem', val: '1GB', def: '64MB' },
                                    { key: 'effective_cache_size', val: '12GB', def: '4GB' },
                                    { key: 'wal_level', val: 'replica', def: 'replica' },
                                ].map((c, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 11,
                                            padding: '6px 0',
                                            borderBottom: i < 5 ? `1px solid ${THEME.gridDark}` : 'none',
                                        }}
                                    >
                                        <span style={{ fontFamily: THEME.fontMono, color: THEME.primary }}>
                                            {c.key}
                                        </span>
                                        <div>
                                            <span style={{ fontWeight: 600, color: THEME.textMain }}>{c.val}</span>
                                            <span style={{ color: THEME.textDim, marginLeft: 8, fontSize: 9 }}>
                                                default: {c.def}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                        <Panel title="RECENT ADMIN ACTIONS" icon={FileText} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    {
                                        action: 'Updated max_connections to 500',
                                        user: 'admin',
                                        time: '2h ago',
                                        color: THEME.primary,
                                    },
                                    {
                                        action: 'Added new user dev.lead@company.com',
                                        user: 'admin',
                                        time: '1d ago',
                                        color: THEME.success,
                                    },
                                    {
                                        action: 'Enabled pg_stat_statements',
                                        user: 'dba',
                                        time: '2d ago',
                                        color: THEME.ai,
                                    },
                                    {
                                        action: 'Rotated SSL certificates',
                                        user: 'admin',
                                        time: '5d ago',
                                        color: THEME.warning,
                                    },
                                    {
                                        action: 'Upgraded to PostgreSQL 16.2',
                                        user: 'admin',
                                        time: '14d ago',
                                        color: THEME.danger,
                                    },
                                ].map((a, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '8px 0',
                                            borderBottom: i < 4 ? `1px solid ${THEME.gridDark}` : 'none',
                                        }}
                                    >
                                        <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 2 }}>
                                            {a.action}
                                        </div>
                                        <div style={{ fontSize: 9, color: THEME.textDim }}>
                                            {a.user} • {a.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'data-retention') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        Data Retention
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard
                            icon={Archive}
                            label="Retention Policies"
                            value="6"
                            sub="All active"
                            color={THEME.primary}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Space Reclaimed"
                            value="48 GB"
                            sub="Last 30 days"
                            color={THEME.success}
                            trend="+12.4%"
                            trendUp
                        />
                        <MetricCard
                            icon={Clock}
                            label="Oldest Data"
                            value="365d"
                            sub="query_logs"
                            color={THEME.warning}
                        />
                        <MetricCard
                            icon={Database}
                            label="Tables Managed"
                            value="12"
                            sub="of 127 total"
                            color={THEME.ai}
                        />
                    </div>
                    <Panel title="RETENTION POLICIES" icon={Archive} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'table', label: 'Table' },
                                { key: 'policy', label: 'Retention' },
                                { key: 'rows', label: 'Rows Managed' },
                                { key: 'lastPurge', label: 'Last Purge' },
                                { key: 'nextPurge', label: 'Next Purge' },
                            ]}
                            rows={[
                                {
                                    table: 'query_logs',
                                    policy: '90 days',
                                    rows: '24.5M',
                                    lastPurge: '1d ago',
                                    nextPurge: 'Tomorrow 02:00',
                                },
                                {
                                    table: 'audit_trail',
                                    policy: '365 days',
                                    rows: '8.2M',
                                    lastPurge: '7d ago',
                                    nextPurge: 'In 7d',
                                },
                                {
                                    table: 'session_data',
                                    policy: '30 days',
                                    rows: '1.8M',
                                    lastPurge: '1d ago',
                                    nextPurge: 'Tomorrow 03:00',
                                },
                                {
                                    table: 'metrics_raw',
                                    policy: '14 days',
                                    rows: '45.6M',
                                    lastPurge: '12h ago',
                                    nextPurge: 'Tonight 01:00',
                                },
                                {
                                    table: 'error_logs',
                                    policy: '180 days',
                                    rows: '3.1M',
                                    lastPurge: '3d ago',
                                    nextPurge: 'In 4d',
                                },
                            ]}
                        />
                    </Panel>
                    <Panel title="STORAGE TREND" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart
                                data={[
                                    { name: 'Jan', total: 280, retained: 210 },
                                    { name: 'Feb', total: 300, retained: 220 },
                                    { name: 'Mar', total: 320, retained: 225 },
                                    { name: 'Apr', total: 340, retained: 230 },
                                    { name: 'May', total: 350, retained: 234 },
                                    { name: 'Jun', total: 360, retained: 234 },
                                ]}
                            >
                                <defs>
                                    <linearGradient id="pg-ret-total" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="pg-ret-kept" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                <XAxis dataKey="name" stroke={THEME.textDim} style={{ fontSize: 10 }} />
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
                                    dataKey="total"
                                    stroke={THEME.warning}
                                    fillOpacity={1}
                                    fill="url(#pg-ret-total)"
                                    name="Total GB"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="retained"
                                    stroke={THEME.success}
                                    fillOpacity={1}
                                    fill="url(#pg-ret-kept)"
                                    name="Retained GB"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'report-builder') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        Report Builder
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Panel title="REPORT CONFIGURATION" icon={Settings} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            textTransform: 'uppercase',
                                            fontWeight: 600,
                                            marginBottom: 4,
                                        }}
                                    >
                                        Report Name
                                    </div>
                                    <div
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            fontSize: 12,
                                            color: THEME.textMain,
                                        }}
                                    >
                                        VIGIL Report
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            textTransform: 'uppercase',
                                            fontWeight: 600,
                                            marginBottom: 4,
                                        }}
                                    >
                                        Date Range
                                    </div>
                                    <div
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            background: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            fontSize: 12,
                                            color: THEME.textMain,
                                        }}
                                    >
                                        Last 7 Days
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            textTransform: 'uppercase',
                                            fontWeight: 600,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Templates
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {[
                                            { name: 'Executive Summary', desc: 'High-level KPIs and trends' },
                                            {
                                                name: 'DBA Daily Report',
                                                desc: 'Full technical metrics and diagnostics',
                                                active: true,
                                            },
                                            { name: 'Security Audit', desc: 'Compliance and access logs' },
                                            { name: 'Capacity Report', desc: 'Storage and growth projections' },
                                        ].map((t, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: 6,
                                                    background: t.active ? `${THEME.primary}15` : THEME.glass,
                                                    border: `1px solid ${t.active ? THEME.primary : THEME.glassBorder}`,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: t.active ? THEME.primary : THEME.textMain,
                                                    }}
                                                >
                                                    {t.name}
                                                </div>
                                                <div style={{ fontSize: 10, color: THEME.textDim }}>{t.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                        <Panel title="REPORT PREVIEW" icon={FileText} accentColor={THEME.success}>
                            <div style={{ padding: 20, textAlign: 'center', color: THEME.textDim }}>
                                <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 13, marginBottom: 6 }}>
                                    Select sections and click &quot;Preview Report&quot; to see the report
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        justifyContent: 'center',
                                        marginTop: 16,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {['Performance', 'Security', 'Capacity', 'Alerts'].map((s, i) => (
                                        <StatusBadge
                                            key={i}
                                            label={s}
                                            color={[THEME.primary, THEME.danger, THEME.success, THEME.warning][i]}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    </div>
                    <Panel title="RECENT REPORTS" icon={Archive} accentColor={THEME.ai}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Report' },
                                { key: 'type', label: 'Template' },
                                { key: 'date', label: 'Generated' },
                                { key: 'size', label: 'Size' },
                            ]}
                            rows={[
                                { name: 'Weekly DBA Report', type: 'DBA Daily', date: '1d ago', size: '2.4 MB' },
                                { name: 'Q1 Security Audit', type: 'Security Audit', date: '3d ago', size: '5.1 MB' },
                                { name: 'Executive Summary Mar', type: 'Executive', date: '7d ago', size: '1.8 MB' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'terraform-export') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        Terraform Export
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard icon={Code} label="Resources" value="24" sub="Exportable" color={THEME.primary} />
                        <MetricCard
                            icon={Download}
                            label="Last Export"
                            value="2d ago"
                            sub="v1.4.2"
                            color={THEME.success}
                        />
                        <MetricCard
                            icon={GitBranch}
                            label="State Version"
                            value="4.2"
                            sub="Terraform"
                            color={THEME.ai}
                        />
                    </div>
                    <Panel title="TERRAFORM CONFIGURATION" icon={Code} accentColor={THEME.primary}>
                        <div
                            style={{
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                borderRadius: 6,
                                padding: 12,
                                fontFamily: THEME.fontMono,
                                fontSize: 10,
                                color: THEME.textDim,
                                whiteSpace: 'pre-wrap',
                                maxHeight: 200,
                                overflow: 'auto',
                            }}
                        >
                            {`resource "postgresql_database" "production" {\n  name     = "production"\n  owner    = "app_user"\n  encoding = "UTF8"\n  lc_collate = "en_US.UTF-8"\n}\n\nresource "postgresql_role" "app_user" {\n  name     = "app_user"\n  login    = true\n  password = var.db_password\n  connection_limit = 100\n}`}
                        </div>
                    </Panel>
                    <Panel title="EXPORTABLE RESOURCES" icon={Database} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'type', label: 'Resource Type' },
                                { key: 'count', label: 'Count' },
                                { key: 'status', label: 'Status' },
                            ]}
                            rows={[
                                { type: 'postgresql_database', count: '4', status: 'Ready' },
                                { type: 'postgresql_role', count: '8', status: 'Ready' },
                                { type: 'postgresql_grant', count: '6', status: 'Ready' },
                                { type: 'postgresql_extension', count: '3', status: 'Ready' },
                                { type: 'postgresql_schema', count: '3', status: 'Ready' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'admin' && itemKey === 'custom-dashboards') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, margin: '0 0 12px' }}>
                        Custom Dashboards
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                        <MetricCard
                            icon={LayoutDashboard}
                            label="Dashboards"
                            value="5"
                            sub="3 shared"
                            color={THEME.primary}
                        />
                        <MetricCard
                            icon={BarChart3}
                            label="Total Widgets"
                            value="32"
                            sub="Across all"
                            color={THEME.ai}
                        />
                        <MetricCard icon={Users} label="Viewers" value="12" sub="Active today" color={THEME.success} />
                        <MetricCard
                            icon={Clock}
                            label="Refresh Rate"
                            value="30s"
                            sub="Auto-refresh"
                            color={THEME.warning}
                        />
                    </div>
                    <Panel title="MY DASHBOARDS" icon={LayoutDashboard} accentColor={THEME.primary}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                { name: 'Production Overview', widgets: 8, shared: true, color: THEME.primary },
                                { name: 'Performance Deep Dive', widgets: 6, shared: true, color: THEME.ai },
                                { name: 'Alert Dashboard', widgets: 5, shared: false, color: THEME.danger },
                                { name: 'Replication Monitor', widgets: 4, shared: true, color: THEME.success },
                                { name: 'Dev Team View', widgets: 9, shared: false, color: THEME.warning },
                            ].map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: 14,
                                        borderRadius: 10,
                                        background: THEME.glass,
                                        border: `1px solid ${d.color}18`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 3,
                                            background: `linear-gradient(90deg, ${d.color}, transparent)`,
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: THEME.textMain,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {d.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
                                        <span style={{ color: THEME.textDim }}>{d.widgets} widgets</span>
                                        {d.shared && <StatusBadge label="Shared" color={THEME.success} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="WIDGET TYPES IN USE" icon={BarChart3} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                                data={[
                                    { type: 'Line Charts', count: 10 },
                                    { type: 'Metric Cards', count: 8 },
                                    { type: 'Tables', count: 6 },
                                    { type: 'Ring Gauges', count: 4 },
                                    { type: 'Bar Charts', count: 4 },
                                ]}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}40`} />
                                <XAxis type="number" stroke={THEME.textDim} style={{ fontSize: 10 }} />
                                <YAxis
                                    dataKey="type"
                                    type="category"
                                    stroke={THEME.textDim}
                                    style={{ fontSize: 10 }}
                                    width={90}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        borderRadius: 8,
                                    }}
                                />
                                <Bar dataKey="count" fill={THEME.ai} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // All other items - show a simple placeholder (keeping existing items)
        return (
            <div
                className="dpg-stagger"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: 18, fontWeight: 600, color: THEME.textMuted }}>
                    {sectionKey.toUpperCase()} / {itemKey.replace(/-/g, ' ').toUpperCase()}
                </div>
                <Panel>
                    <div
                        style={{
                            padding: '60px 40px',
                            textAlign: 'center',
                            color: THEME.textDim,
                        }}
                    >
                        <Database size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Rich content coming soon</div>
                        <div style={{ fontSize: 12 }}>This section is ready for expanded demo content</div>
                    </div>
                </Panel>
            </div>
        );
    };

    return (
        <DemoLayout
            sections={sections}
            renderContent={renderContent}
            title="PostgreSQL Demo"
            accentColor={THEME.primary}
            titleIcon={Database}
        />
    );
}

export default DemoPostgresTab;
