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
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={['Activity & Queries', 'Deep Insights', 'Resources & Health']}
                        active={perfTab}
                        onChange={setPerfTab}
                        accentColor={THEME.primary}
                    />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <Panel noPad title="Active" accentColor={THEME.success} style={{ minHeight: 100 }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px 16px',
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: THEME.success,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    42
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    SESSIONS
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Long Running" accentColor={THEME.warning} style={{ minHeight: 100 }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px 16px',
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    7
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    SESSIONS
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Idle" accentColor={THEME.textMuted} style={{ minHeight: 100 }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px 16px',
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: THEME.textMuted,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    31
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    SESSIONS
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Blocked" accentColor={THEME.danger} style={{ minHeight: 100 }}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px 16px',
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: THEME.danger,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    2
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    SESSIONS
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Session Traffic" icon={Network} accentColor={THEME.primary}>
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

                    <Panel title="Transaction Latency Percentiles" icon={Clock} accentColor={THEME.ai}>
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

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <Panel noPad title="P50 AVG" accentColor={THEME.primary}>
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
                                        color: THEME.primary,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    2.3ms
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim }}>↓ 0.2ms vs 1h</div>
                            </div>
                        </Panel>
                        <Panel noPad title="P95 AVG" accentColor={THEME.ai}>
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
                                        color: THEME.ai,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    8.7ms
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim }}>↑ 1.2ms vs 1h</div>
                            </div>
                        </Panel>
                        <Panel noPad title="P99 AVG" accentColor={THEME.warning}>
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
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    31ms
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim }}>↑ 4.1ms vs 1h</div>
                            </div>
                        </Panel>
                        <Panel noPad title="SLA Breach" accentColor={THEME.danger}>
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
                                        color: THEME.danger,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    0.2%
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim }}>Target: 0.1%</div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Slow Query Trends" icon={Zap} accentColor={THEME.warning}>
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
                </div>
            );
        }

        // RESOURCES
        if (sectionKey === 'overview' && itemKey === 'resources') {
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
                        <MetricCard
                            icon={Container}
                            label="Context Switches"
                            value="28.4K"
                            sub="per sec"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => 20 + Math.random() * 10)}
                        />
                        <MetricCard
                            icon={Droplets}
                            label="System Load"
                            value="2.8"
                            sub="4 cores"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 2)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                        <Panel title="CPU Load" icon={Cpu} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                <RingGauge value={38} color={THEME.primary} size={100} label="Usage" />
                                <div style={{ width: '100%', fontSize: 9, color: THEME.textDim, lineHeight: 1.6 }}>
                                    <div>4 cores active</div>
                                    <div>Load avg: 1.8</div>
                                    <div>I/O Wait: 22%</div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Memory Usage" icon={HardDrive} accentColor={THEME.warning}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                <RingGauge value={72} color={THEME.warning} size={100} label="Allocated" />
                                <div style={{ width: '100%', fontSize: 9, color: THEME.textDim, lineHeight: 1.6 }}>
                                    <div>12 GB / 16 GB</div>
                                    <div>Shared Buf: 55%</div>
                                    <div>Swap: 0 GB</div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Disk I/O" icon={HardDrive} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                <RingGauge value={44} color={THEME.ai} size={100} label="Utilization" />
                                <div style={{ width: '100%', fontSize: 9, color: THEME.textDim, lineHeight: 1.6 }}>
                                    <div>0 GB / 200 GB SSD</div>
                                    <div>Write Amp: 30%</div>
                                    <div>IOPS: 2,847</div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <Panel title="CPU & Memory Trends" icon={TrendingUp} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={demoData.cpuMemory}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke={THEME.primary}
                                    strokeWidth={2.5}
                                    name="CPU %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="memory"
                                    stroke={THEME.warning}
                                    strokeWidth={2}
                                    name="Memory %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>

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

                    <Panel title="Top Resource Consumers" icon={BarChart3} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'pid', label: 'PID', width: '15%' },
                                { key: 'user', label: 'USER', width: '20%' },
                                { key: 'query', label: 'QUERY', width: '45%' },
                                { key: 'cpu', label: 'CPU', width: '10%' },
                                { key: 'mem', label: 'MEM', width: '10%' },
                            ]}
                            rows={[
                                {
                                    pid: '12845',
                                    user: 'app_user',
                                    query: 'SELECT * FROM orders o LEFT...',
                                    cpu: '18%',
                                    mem: '2.3 GB',
                                },
                                {
                                    pid: '12901',
                                    user: 'analytics',
                                    query: 'INSERT INTO logs SELECT...',
                                    cpu: '12%',
                                    mem: '1.8 GB',
                                },
                                {
                                    pid: '12756',
                                    user: 'system',
                                    query: 'VACUUM ANALYZE public.users',
                                    cpu: '8%',
                                    mem: '0.9 GB',
                                },
                            ]}
                        />
                    </Panel>
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
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <Panel noPad title="Total Alerts" accentColor={THEME.warning}>
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 90,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    7
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    ACTIVE
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Critical" accentColor={THEME.danger}>
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 90,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: THEME.danger,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    2
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    CRITICAL
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Warning" accentColor={THEME.warning}>
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 90,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    3
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    WARNING
                                </div>
                            </div>
                        </Panel>
                        <Panel noPad title="Active Rules" accentColor={THEME.success}>
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 90,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: THEME.success,
                                        fontFamily: THEME.fontMono,
                                    }}
                                >
                                    6/7
                                </div>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>
                                    ENABLED
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '12px',
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
                            color={THEME.warning}
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
                            color={THEME.warning}
                            progress={56}
                            spark={Array.from({ length: 12 }, () => 100 + Math.random() * 150)}
                        />
                    </div>

                    <TabPills
                        tabs={['ACTIVE 5', 'CONFIG', 'HISTORY']}
                        active={alertsTab}
                        onChange={setAlertsTab}
                        accentColor={THEME.danger}
                    />

                    <Panel title="Active Alerts" icon={AlertTriangle} accentColor={THEME.danger}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <AlertRow
                                severity="critical"
                                title="High Database Load"
                                time="5m ago"
                                source="prod_main"
                                color={THEME.danger}
                            />
                            <AlertRow
                                severity="critical"
                                title="Replication Lag Exceeded"
                                time="12m ago"
                                source="replica-01"
                                color={THEME.danger}
                            />
                            <AlertRow
                                severity="warning"
                                title="Connection Pool Usage"
                                time="23m ago"
                                source="app-pool"
                                color={THEME.warning}
                            />
                            <AlertRow
                                severity="warning"
                                title="Slow Query Detected"
                                time="31m ago"
                                source="query-monitor"
                                color={THEME.warning}
                            />
                            <AlertRow
                                severity="warning"
                                title="WAL Segment Backlog"
                                time="45m ago"
                                source="wal-manager"
                                color={THEME.warning}
                            />
                        </div>
                    </Panel>

                    <Panel title="Alert Trend (24h)" icon={TrendingUp} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <defs>
                                    <linearGradient id="alert-grad" x1="0" y1="0" x2="0" y2="1">
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
                                    dataKey="qps"
                                    stroke={THEME.danger}
                                    fill="url(#alert-grad)"
                                    name="Alert Count"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Notification Channels" icon={Bell} accentColor={THEME.primary}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '10px',
                            }}
                        >
                            {[
                                { channel: 'Email', status: 'Active', count: '12' },
                                { channel: 'Slack', status: 'Active', count: '28' },
                                { channel: 'PagerDuty', status: 'Active', count: '5' },
                                { channel: 'SMS', status: 'Inactive', count: '0' },
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
                                    <div style={{ fontSize: 10, fontWeight: 600, color: THEME.textMain }}>
                                        {ch.channel}
                                    </div>
                                    <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>
                                        {ch.status} {ch.status === 'Active' && `(${ch.count})`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
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
            const slowQueries = [
                {
                    query: 'SELECT COUNT(*) FROM orders...',
                    optimization: 'Add index on date',
                    savings: '65%',
                    status: 'pending',
                },
                {
                    query: 'JOIN users u ON u.id = o.user_id...',
                    optimization: 'Rewrite with window fn',
                    savings: '42%',
                    status: 'pending',
                },
                {
                    query: 'UPDATE inventory SET qty = qty - 1...',
                    optimization: 'Batch updates',
                    savings: '38%',
                    status: 'applied',
                },
            ];
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                        />
                        <MetricCard
                            icon={TrendingUp}
                            label="Avg Savings"
                            value="51%"
                            color={THEME.success}
                            trend="+3%"
                            trendUp
                        />
                        <MetricCard icon={AlertTriangle} label="Pending" value="7" color={THEME.warning} />
                    </div>
                    <Panel title="Slow Query Recommendations" icon={Zap} accentColor={THEME.ai}>
                        <DataTable
                            columns={[
                                { key: 'query', label: 'Query' },
                                { key: 'optimization', label: 'Recommendation' },
                                { key: 'savings', label: 'Est. Savings' },
                            ]}
                            rows={slowQueries.map((q) => ({
                                query: q.query.substring(0, 30) + '...',
                                optimization: q.optimization,
                                savings: <span style={{ color: THEME.success, fontWeight: 600 }}>{q.savings}</span>,
                            }))}
                        />
                    </Panel>
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
                { name: 'users_pkey', table: 'users', size: '2.3 MB', usage: 18234, status: 'active' },
                { name: 'orders_user_idx', table: 'orders', size: '1.8 MB', usage: 5421, status: 'active' },
                { name: 'legacy_idx_old', table: 'orders', size: '890 KB', usage: 0, status: 'unused' },
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
                        />
                        <MetricCard icon={CheckCircle} label="Active" value="2" color={THEME.success} />
                        <MetricCard icon={AlertTriangle} label="Unused" value="1" color={THEME.warning} />
                    </div>
                    <Panel title="Indexes" icon={Database} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Index Name' },
                                { key: 'table', label: 'Table' },
                                { key: 'size', label: 'Size' },
                                { key: 'usage', label: 'Scans (24h)' },
                            ]}
                            rows={indexData.map((idx) => ({
                                ...idx,
                                status: (
                                    <StatusBadge
                                        label={idx.status}
                                        color={idx.usage > 0 ? THEME.success : THEME.textMuted}
                                    />
                                ),
                            }))}
                        />
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
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={HardDrive} label="Avg Bloat" value="15.3%" color={THEME.warning} />
                        <MetricCard icon={Database} label="Total Wasted" value="578 MB" color={THEME.danger} />
                        <MetricCard icon={AlertTriangle} label="Tables" value="3" color={THEME.warning} />
                    </div>
                    <Panel title="Bloat Analysis" icon={HardDrive} accentColor={THEME.warning}>
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
                </div>
            );
        }

        // TABLE ANALYSIS
        if (sectionKey === 'query-analysis' && itemKey === 'table-analysis') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard icon={Database} label="Total Tables" value="45" color={THEME.primary} />
                        <MetricCard icon={Layers} label="Partitions" value="12" color={THEME.ai} />
                        <MetricCard icon={HardDrive} label="Total Size" value="4.2 GB" color={THEME.textMuted} />
                    </div>
                    <Panel title="Table Stats" icon={Database} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Table' },
                                { key: 'rows', label: 'Rows' },
                                { key: 'size', label: 'Size' },
                                { key: 'indexes', label: 'Indexes' },
                            ]}
                            rows={[
                                { name: 'users', rows: '2.3M', size: '845 MB', indexes: 4 },
                                { name: 'orders', rows: '8.9M', size: '2.1 GB', indexes: 6 },
                                { name: 'products', rows: '450K', size: '123 MB', indexes: 3 },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // SCHEMA BROWSER
        if (sectionKey === 'schema' && itemKey === 'schema-browser') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Schema Structure" icon={ListTree} accentColor={THEME.warning}>
                        <div
                            style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim, lineHeight: 1.8 }}
                        >
                            <div>public/</div>
                            <div style={{ marginLeft: '20px' }}>├─ users</div>
                            <div style={{ marginLeft: '40px' }}>│ ├─ id (bigint)</div>
                            <div style={{ marginLeft: '40px' }}>│ ├─ email (varchar)</div>
                            <div style={{ marginLeft: '40px' }}>│ └─ created_at (timestamp)</div>
                            <div style={{ marginLeft: '20px' }}>├─ orders</div>
                            <div style={{ marginLeft: '40px' }}>│ ├─ id (bigint)</div>
                            <div style={{ marginLeft: '40px' }}>│ ├─ user_id (bigint)</div>
                            <div style={{ marginLeft: '40px' }}>│ └─ total (numeric)</div>
                        </div>
                    </Panel>
                    <Panel title="Columns" icon={TableProperties} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Column' },
                                { key: 'type', label: 'Type' },
                                { key: 'nullable', label: 'Nullable' },
                                { key: 'default', label: 'Default' },
                            ]}
                            rows={[
                                { name: 'id', type: 'bigint', nullable: 'No', default: 'nextval()' },
                                { name: 'email', type: 'varchar(255)', nullable: 'No', default: '-' },
                                { name: 'created_at', type: 'timestamp', nullable: 'No', default: 'now()' },
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
                        <MetricCard icon={Clock} label="Last Checkpoint" value="5m ago" color={THEME.primary} />
                        <MetricCard icon={Zap} label="Duration" value="234ms" color={THEME.warning} />
                        <MetricCard icon={HardDrive} label="Buffers" value="8,234" color={THEME.ai} />
                    </div>
                    <Panel title="Checkpoint Timing" icon={Clock} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={demoData.clusterVelocity.slice(0, 12)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="qps" fill={THEME.primary} name="Duration (ms)" />
                            </BarChart>
                        </ResponsiveContainer>
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
                        <MetricCard icon={RefreshCw} label="Tables" value="3" color={THEME.warning} />
                        <MetricCard icon={CheckCircle} label="Last Run" value="2h ago" color={THEME.success} />
                        <MetricCard icon={Clock} label="Avg Duration" value="45s" color={THEME.primary} />
                    </div>
                    <Panel title="Tables Needing Vacuum" icon={RefreshCw} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'table', label: 'Table' },
                                { key: 'lastVacuum', label: 'Last Vacuum' },
                                { key: 'deadRows', label: 'Dead Rows' },
                                { key: 'priority', label: 'Priority' },
                            ]}
                            rows={[
                                {
                                    table: 'users',
                                    lastVacuum: '1d ago',
                                    deadRows: '45,234',
                                    priority: <StatusBadge label="High" color={THEME.danger} />,
                                },
                                {
                                    table: 'orders',
                                    lastVacuum: '6h ago',
                                    deadRows: '12,456',
                                    priority: <StatusBadge label="Medium" color={THEME.warning} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        // CAPACITY PLANNING
        if (sectionKey === 'infrastructure' && itemKey === 'capacity-planning') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Storage Growth Trend" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <defs>
                                    <linearGradient id="growth-grad" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#growth-grad)"
                                    name="Storage (GB)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                    <Panel title="Capacity Projection" icon={BarChart2} accentColor={THEME.primary}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 11,
                                    marginBottom: 8,
                                }}
                            >
                                <span>Current: 645 GB</span>
                                <span>30 days: 724 GB</span>
                                <span>90 days: 912 GB</span>
                            </div>
                            <div
                                style={{ height: '8px', background: THEME.glass, borderRadius: 4, overflow: 'hidden' }}
                            >
                                <div style={{ width: '71%', height: '100%', background: THEME.success }} />
                            </div>
                        </div>
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
                        <MetricCard icon={Archive} label="Backups" value="8" color={THEME.primary} />
                        <MetricCard icon={CheckCircle} label="Last Backup" value="4h ago" color={THEME.success} />
                        <MetricCard icon={Clock} label="Retention" value="30d" color={THEME.textMuted} />
                    </div>
                    <Panel title="Backup Schedule" icon={Archive} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'time', label: 'Scheduled' },
                                { key: 'type', label: 'Type' },
                                { key: 'size', label: 'Size' },
                                { key: 'status', label: 'Status' },
                            ]}
                            rows={[
                                {
                                    time: '02:00 UTC',
                                    type: 'Full',
                                    size: '645 GB',
                                    status: <StatusBadge label="Completed" color={THEME.success} />,
                                },
                                {
                                    time: '08:00 UTC',
                                    type: 'Incremental',
                                    size: '120 GB',
                                    status: <StatusBadge label="Scheduled" color={THEME.primary} />,
                                },
                            ]}
                        />
                    </Panel>
                    <Panel title="Recovery Test Results" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                                <div style={{ fontWeight: 600 }}>Last Test: 2 days ago</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    Recovery Time: 8m 23s - PASS
                                </div>
                            </div>
                        </div>
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
                        <MetricCard icon={ShieldCheck} label="Security Score" value="94" color={THEME.success} />
                        <MetricCard icon={AlertTriangle} label="Issues" value="2" color={THEME.warning} />
                        <MetricCard icon={Lock} label="Encryption" value="On" color={THEME.success} />
                    </div>
                    <Panel title="Compliance Checks" icon={ShieldCheck} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'check', label: 'Check' },
                                { key: 'status', label: 'Status' },
                                { key: 'lastRun', label: 'Last Run' },
                            ]}
                            rows={[
                                {
                                    check: 'SSL/TLS Enabled',
                                    status: <StatusBadge label="Pass" color={THEME.success} />,
                                    lastRun: '2h ago',
                                },
                                {
                                    check: 'Password Policy',
                                    status: <StatusBadge label="Pass" color={THEME.success} />,
                                    lastRun: '1d ago',
                                },
                                {
                                    check: 'Audit Logging',
                                    status: <StatusBadge label="Warn" color={THEME.warning} />,
                                    lastRun: '3d ago',
                                },
                            ]}
                        />
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
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <MetricCard
                            icon={FileSearch}
                            label="Log Patterns"
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
                                    {[THEME.warning, THEME.ai, THEME.danger, THEME.primary].map((color, idx) => (
                                        <Cell key={`cell-${idx}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Pattern Frequency" icon={FileSearch} accentColor={THEME.warning}>
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
