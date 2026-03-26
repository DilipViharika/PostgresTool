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
                { query: 'DELETE FROM audit_logs WHERE created_at < NOW()...', duration: 876, calls: 23 },
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
        // ═══════════════════════════════════════════════════════════════════════
        // OVERVIEW SECTION
        // ═══════════════════════════════════════════════════════════════════════
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
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'database-overview') {
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
                            icon={Clock}
                            label="Uptime"
                            value="45 d"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Activity}
                            label="Active Sessions"
                            value="52"
                            sub="of 100"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 40 + Math.random() * 30)}
                            trend="+3"
                            trendUp
                        />
                        <MetricCard
                            icon={Zap}
                            label="Cache Hit Ratio"
                            value="99.4%"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 98 + Math.random() * 2)}
                            trend="+0.1%"
                            trendUp
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="DB Size"
                            value="264 GB"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Clock}
                            label="Long Txns"
                            value="3"
                            sub="active"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 5)}
                            warn
                        />
                        <MetricCard
                            icon={RefreshCw}
                            label="Pending Ops"
                            value="5"
                            sub="vacuum"
                            color={THEME.danger}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 8)}
                            warn
                        />
                    </div>

                    <Panel title="Databases" icon={Database} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'NAME', width: '25%' },
                                { key: 'size', label: 'SIZE', width: '20%' },
                                { key: 'connections', label: 'CONNECTIONS', width: '20%' },
                                { key: 'txns', label: 'TRANSACTIONS', width: '20%' },
                                { key: 'status', label: 'STATUS', width: '15%' },
                            ]}
                            rows={[
                                {
                                    name: 'prod_main',
                                    size: '145 GB',
                                    connections: 89,
                                    txns: '1.2M',
                                    status: 'healthy',
                                    statusColor: THEME.success,
                                },
                                {
                                    name: 'analytics',
                                    size: '67 GB',
                                    connections: 23,
                                    txns: '450K',
                                    status: 'healthy',
                                    statusColor: THEME.success,
                                },
                                {
                                    name: 'staging',
                                    size: '52 GB',
                                    connections: 12,
                                    txns: '320K',
                                    status: 'healthy',
                                    statusColor: THEME.success,
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Transaction Throughput" icon={TrendingUp} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <defs>
                                    <linearGradient id="tps-grad" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#tps-grad)"
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
                    <TabPills
                        tabs={[
                            { key: 'activity', label: 'Activity', icon: Activity },
                            { key: 'insights', label: 'Deep Insights', icon: Brain },
                            { key: 'resources', label: 'Resources', icon: BarChart2 },
                        ]}
                        active={perfTab}
                        onChange={setPerfTab}
                        accentColor={THEME.primary}
                    />

                    {perfTab === 'activity' && (
                        <>
                            <Panel title="Live Sessions" icon={Network} accentColor={THEME.primary}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: '10px',
                                    }}
                                >
                                    <LiveMetric
                                        icon={Activity}
                                        label="Active"
                                        value="52"
                                        unit="sessions"
                                        color={THEME.success}
                                        spark={Array.from({ length: 12 }, () => 40 + Math.random() * 30)}
                                        progress={52}
                                    />
                                    <LiveMetric
                                        icon={Clock}
                                        label="Long Running"
                                        value="3"
                                        unit="txns"
                                        color={THEME.warning}
                                        spark={Array.from({ length: 12 }, () => 1 + Math.random() * 5)}
                                        progress={15}
                                    />
                                    <LiveMetric
                                        icon={Radio}
                                        label="Idle"
                                        value="28"
                                        unit="sessions"
                                        color={THEME.textMuted}
                                        spark={Array.from({ length: 12 }, () => 20 + Math.random() * 20)}
                                        progress={28}
                                    />
                                    <LiveMetric
                                        icon={AlertTriangle}
                                        label="Blocked"
                                        value="1"
                                        unit="query"
                                        color={THEME.danger}
                                        spark={Array.from({ length: 12 }, () => Math.random() * 3)}
                                        progress={5}
                                    />
                                </div>
                            </Panel>

                            <Panel title="Session Activity" icon={TrendingUp} accentColor={THEME.ai}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={demoData.connectionTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
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
                        </>
                    )}

                    {perfTab === 'insights' && (
                        <Panel title="Performance Insights" icon={Brain} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        background: `${THEME.ai}08`,
                                        borderRadius: 8,
                                        borderLeft: `2px solid ${THEME.ai}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                        Peak Load: 15:30-16:00 UTC
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3 }}>
                                        CPU spiked to 67%, Cache hit dropped to 94%
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        background: `${THEME.warning}08`,
                                        borderRadius: 8,
                                        borderLeft: `2px solid ${THEME.warning}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                        Slow Query: orders JOIN products
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3 }}>
                                        Avg 3.24s, Missing index on order_id
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        background: `${THEME.danger}08`,
                                        borderRadius: 8,
                                        borderLeft: `2px solid ${THEME.danger}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain }}>
                                        Lock Contention: audit_logs table
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3 }}>
                                        1 blocked query, 12.3s duration
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}

                    {perfTab === 'resources' && (
                        <Panel title="Resource Utilization" icon={BarChart2} accentColor={THEME.warning}>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={demoData.cpuMemory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} domain={[0, 100]} />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="cpu"
                                        stroke={THEME.warning}
                                        strokeWidth={2.5}
                                        name="CPU %"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="memory"
                                        stroke={THEME.primary}
                                        strokeWidth={2.5}
                                        name="Memory %"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    )}
                </div>
            );
        }

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
                            label="CPU Usage"
                            value="34.2%"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 20 + Math.random() * 30)}
                            trend="+2.1%"
                            trendUp={false}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Memory"
                            value="58.7 GB"
                            sub="of 128 GB"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 50 + Math.random() * 20)}
                        />
                        <MetricCard
                            icon={BarChart2}
                            label="I/O Ops"
                            value="2,543"
                            sub="IOPS"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 1800 + Math.random() * 1000)}
                        />
                        <MetricCard
                            icon={Network}
                            label="Disk I/O"
                            value="8.2 ms"
                            sub="avg latency"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 5)}
                        />
                        <MetricCard
                            icon={Zap}
                            label="Swap Used"
                            value="0 MB"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 10)}
                        />
                        <MetricCard
                            icon={Cloud}
                            label="Disk Free"
                            value="1.2 TB"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="CPU & Memory Timeline" icon={Cpu} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={demoData.cpuMemory}>
                                <defs>
                                    <linearGradient id="cpu-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} domain={[0, 100]} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke={THEME.warning}
                                    fillOpacity={1}
                                    fill="url(#cpu-grad)"
                                    name="CPU %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="I/O & Latency" icon={BarChart2} accentColor={THEME.ai}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={demoData.iopsLatency}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis yAxisId="left" stroke={THEME.textDim} fontSize={10} />
                                <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="iops"
                                    stroke={THEME.ai}
                                    strokeWidth={2.5}
                                    name="IOPS"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="latency"
                                    stroke={THEME.warning}
                                    strokeWidth={2}
                                    name="Latency (ms)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
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
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={CheckCircle}
                            label="Availability"
                            value="99.97%"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 99 + Math.random() * 1)}
                            trend="+0.02%"
                            trendUp
                        />
                        <MetricCard
                            icon={Clock}
                            label="MTBF"
                            value="156 d"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Failed Ops"
                            value="2"
                            sub="last 24h"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => Math.random() * 5)}
                        />
                        <MetricCard
                            icon={Archive}
                            label="Last Backup"
                            value="1 h"
                            sub="ago"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={RefreshCw}
                            label="RTO"
                            value="15 min"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Droplets}
                            label="RPO"
                            value="5 min"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="System Health Gauge" icon={Shield} accentColor={THEME.success}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                padding: '20px 0',
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <RingGauge
                                    value={99}
                                    color={THEME.success}
                                    size={100}
                                    label="Availability"
                                    secondaryValue={98}
                                    secondaryColor={THEME.primary}
                                />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <RingGauge value={92} color={THEME.primary} size={100} label="Reliability" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <RingGauge value={86} color={THEME.ai} size={100} label="Performance" />
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Replication Status" icon={GitBranch} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glass,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain, marginBottom: 3 }}>
                                    Primary {'→'} Replica-1
                                </div>
                                <div style={{ fontSize: 10, color: THEME.success }}>Lag: 0.3 ms • Synced</div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glass,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMain, marginBottom: 3 }}>
                                    Primary {'→'} Replica-2
                                </div>
                                <div style={{ fontSize: 10, color: THEME.success }}>Lag: 1.2 ms • Synced</div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ALERTS SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'alerts') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={AlertOctagon}
                            label="Total Alerts"
                            value="7"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 10)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Critical"
                            value="1"
                            color={THEME.danger}
                            spark={Array.from({ length: 12 }, () => Math.random() * 3)}
                            warn
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Warning"
                            value="4"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 6)}
                            warn
                        />
                        <MetricCard
                            icon={Radio}
                            label="Info"
                            value="2"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 5)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: `1px solid ${THEME.glassBorder}`,
                                background: THEME.glass,
                                color: THEME.textMain,
                                fontSize: 12,
                                outline: 'none',
                            }}
                        />
                    </div>

                    <TabPills
                        tabs={[
                            { key: 'active', label: 'Active', icon: Bell, badge: '7' },
                            { key: 'config', label: 'Config', icon: BarChart2 },
                            { key: 'history', label: 'History', icon: Clock },
                        ]}
                        active={alertsTab}
                        onChange={setAlertsTab}
                        accentColor={THEME.danger}
                    />

                    {alertsTab === 'active' && (
                        <Panel title="Active Alerts" icon={Bell} accentColor={THEME.danger}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <AlertRow
                                    severity="CRITICAL"
                                    title="Connection pool exhausted on prod-db-01"
                                    time="12 min ago"
                                    source="prod-db-01"
                                    color={THEME.danger}
                                />
                                <AlertRow
                                    severity="WARNING"
                                    title="Long-running transaction on orders table"
                                    time="34 min ago"
                                    source="prod_main"
                                    color={THEME.warning}
                                />
                                <AlertRow
                                    severity="WARNING"
                                    title="Cache hit ratio dropped below 95%"
                                    time="1 hr ago"
                                    source="fleet"
                                    color={THEME.warning}
                                />
                                <AlertRow
                                    severity="WARNING"
                                    title="Replication lag exceeding 2s threshold"
                                    time="2 hr ago"
                                    source="replica-2"
                                    color={THEME.warning}
                                />
                                <AlertRow
                                    severity="INFO"
                                    title="Vacuum operation completed successfully"
                                    time="3 hr ago"
                                    source="prod_main"
                                    color={THEME.primary}
                                />
                                <AlertRow
                                    severity="INFO"
                                    title="Backup to S3 finished"
                                    time="4 hr ago"
                                    source="backup-service"
                                    color={THEME.primary}
                                />
                            </div>
                        </Panel>
                    )}

                    {alertsTab === 'config' && (
                        <Panel title="Alert Rules" icon={BarChart2} accentColor={THEME.warning}>
                            <DataTable
                                columns={[
                                    { key: 'name', label: 'RULE', width: '30%' },
                                    { key: 'condition', label: 'CONDITION', width: '35%' },
                                    { key: 'status', label: 'STATUS', width: '15%' },
                                    { key: 'triggers', label: 'TRIGGERS', width: '20%' },
                                ]}
                                rows={[
                                    {
                                        name: 'High CPU',
                                        condition: 'CPU {' >= '} 75%',
                                        status: 'enabled',
                                        triggers: '12',
                                    },
                                    {
                                        name: 'Conn Pool',
                                        condition: 'Pool usage {' >= '} 90%',
                                        status: 'enabled',
                                        triggers: '8',
                                    },
                                    {
                                        name: 'Slow Query',
                                        condition: 'Duration {' >= '} 5s',
                                        status: 'enabled',
                                        triggers: '45',
                                    },
                                ]}
                            />
                        </Panel>
                    )}

                    {alertsTab === 'history' && (
                        <Panel title="Alert History (Last 7 Days)" icon={Clock} accentColor={THEME.warning}>
                            <DataTable
                                columns={[
                                    { key: 'title', label: 'ALERT', width: '40%' },
                                    { key: 'time', label: 'TIME', width: '25%' },
                                    { key: 'resolved', label: 'RESOLVED IN', width: '20%' },
                                    { key: 'severity', label: 'SEV', width: '15%' },
                                ]}
                                rows={[
                                    {
                                        title: 'Connection pool max reached',
                                        time: '2 days ago',
                                        resolved: '8 min',
                                        severity: 'critical',
                                    },
                                    {
                                        title: 'High replication lag',
                                        time: '3 days ago',
                                        resolved: '23 min',
                                        severity: 'warning',
                                    },
                                    {
                                        title: 'Slow query detected',
                                        time: '5 days ago',
                                        resolved: '2.4s (query)',
                                        severity: 'info',
                                    },
                                ]}
                            />
                        </Panel>
                    )}
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // QUERY ANALYSIS SECTION
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'query-analysis' && itemKey === 'query-optimizer') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TabPills
                        tabs={[
                            { key: 'optimizer', label: 'Optimizer', icon: Brain },
                            { key: 'execution', label: 'Execution', icon: Zap },
                            { key: 'recommendations', label: 'Recommendations', icon: TrendingUp },
                        ]}
                        active={queryTab}
                        onChange={setQueryTab}
                        accentColor={THEME.ai}
                    />

                    {queryTab === 'optimizer' && (
                        <>
                            <Panel title="Top Slow Queries" icon={Zap} accentColor={THEME.ai}>
                                <DataTable
                                    columns={[
                                        { key: 'query', label: 'QUERY', width: '50%' },
                                        { key: 'duration', label: 'AVG TIME', width: '20%', mono: true },
                                        { key: 'calls', label: 'CALLS', width: '15%', mono: true },
                                        { key: 'total', label: 'TOTAL TIME', width: '15%', mono: true },
                                    ]}
                                    rows={[
                                        {
                                            query: 'SELECT * FROM orders o LEFT JOIN...',
                                            duration: '3.24s',
                                            calls: '145',
                                            total: '469s',
                                        },
                                        {
                                            query: 'UPDATE inventory SET qty = qty - 1 WHERE...',
                                            duration: '1.89s',
                                            calls: '89',
                                            total: '168s',
                                        },
                                        {
                                            query: 'DELETE FROM audit_logs WHERE created_at...',
                                            duration: '876ms',
                                            calls: '23',
                                            total: '20s',
                                        },
                                    ]}
                                />
                            </Panel>

                            <Panel title="Query Performance Trends" icon={TrendingUp} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={demoData.clusterVelocity}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip content={<ChartTip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="qps"
                                            stroke={THEME.ai}
                                            strokeWidth={2}
                                            name="Queries/sec"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        </>
                    )}

                    {queryTab === 'execution' && (
                        <Panel title="Active Query Sessions" icon={Activity} accentColor={THEME.success}>
                            <DataTable
                                columns={[
                                    { key: 'pid', label: 'PID', width: '12%', mono: true },
                                    { key: 'user', label: 'USER', width: '15%' },
                                    { key: 'query', label: 'QUERY', width: '45%' },
                                    { key: 'duration', label: 'DURATION', width: '15%', mono: true },
                                    { key: 'state', label: 'STATE', width: '13%' },
                                ]}
                                rows={[
                                    {
                                        pid: '12845',
                                        user: 'app_user',
                                        query: 'SELECT * FROM orders WHERE...',
                                        duration: '2.3s',
                                        state: 'active',
                                    },
                                    {
                                        pid: '12901',
                                        user: 'analytics',
                                        query: 'INSERT INTO logs VALUES...',
                                        duration: '5.1s',
                                        state: 'active',
                                    },
                                    {
                                        pid: '12756',
                                        user: 'system',
                                        query: 'VACUUM ANALYZE public.users',
                                        duration: '12.4s',
                                        state: 'active',
                                    },
                                ]}
                            />
                        </Panel>
                    )}

                    {queryTab === 'recommendations' && (
                        <Panel title="AI Recommendations" icon={Brain} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div
                                    style={{
                                        padding: '12px 14px',
                                        background: `${THEME.success}08`,
                                        borderRadius: 10,
                                        borderLeft: `3px solid ${THEME.success}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                        Create Index: order_id
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                        Would improve query time by ~60% on the slow join query
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px 14px',
                                        background: `${THEME.primary}08`,
                                        borderRadius: 10,
                                        borderLeft: `3px solid ${THEME.primary}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                        Analyze Table: audit_logs
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                        Statistics are 7 days old, run ANALYZE for better plans
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px 14px',
                                        background: `${THEME.warning}08`,
                                        borderRadius: 10,
                                        borderLeft: `3px solid ${THEME.warning}`,
                                    }}
                                >
                                    <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                        Query Rewrite: inventory update
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                        Batching updates would reduce lock contention by 40%
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'query-plan') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Query Plan Viewer" icon={TreePine} accentColor={THEME.ai}>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: 11,
                                color: THEME.textMuted,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                            }}
                        >
                            {`Seq Scan on orders o  (cost=0.00..45234.67 rows=123456)
  Filter: (status = 'active')
  →  Hash Join  (cost=1234.56..67890.12 rows=89012)
        Hash Cond: (o.customer_id = c.id)
        →  Seq Scan on customers c  (cost=0.00..456.78)
        →  Hash  (cost=890.12..890.12 rows=54321)
              →  Seq Scan on products p  (cost=0.00..678.90)`}
                        </div>
                    </Panel>

                    <Panel title="Plan Analysis" icon={BarChart2} accentColor={THEME.warning}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: `${THEME.warning}08`,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.warning}30`,
                                }}
                            >
                                <div style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textMain }}>
                                    Sequential Scan Detected
                                </div>
                                <div style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 3 }}>
                                    Consider adding index on status column
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: `${THEME.primary}08`,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.primary}30`,
                                }}
                            >
                                <div style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textMain }}>
                                    Hash Join Used
                                </div>
                                <div style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 3 }}>
                                    Good choice for 89K rows, Memory: 12.4 MB
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'plan-regression') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Plan Changes Detected" icon={AlertTriangle} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'query', label: 'QUERY', width: '40%' },
                                { key: 'oldCost', label: 'OLD COST', width: '15%', mono: true },
                                { key: 'newCost', label: 'NEW COST', width: '15%', mono: true },
                                { key: 'change', label: 'CHANGE', width: '15%', mono: true },
                                { key: 'status', label: 'STATUS', width: '15%' },
                            ]}
                            rows={[
                                {
                                    query: 'orders JOIN products',
                                    oldCost: '1,234',
                                    newCost: '4,567',
                                    change: '+270%',
                                    status: 'regressed',
                                },
                                {
                                    query: 'user analysis query',
                                    oldCost: '890',
                                    newCost: '845',
                                    change: '-5%',
                                    status: 'improved',
                                },
                            ]}
                        />
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
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={Layers}
                            label="Total Indexes"
                            value="127"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Unused Indexes"
                            value="12"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 20)}
                            warn
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Index Size"
                            value="1.2 GB"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={TrendingUp}
                            label="Bloat %"
                            value="8.3%"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 15)}
                        />
                    </div>

                    <Panel title="Index Health" icon={Layers} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'INDEX NAME', width: '30%' },
                                { key: 'table', label: 'TABLE', width: '20%' },
                                { key: 'size', label: 'SIZE', width: '15%', mono: true },
                                { key: 'scans', label: 'SCANS', width: '15%', mono: true },
                                { key: 'status', label: 'STATUS', width: '20%' },
                            ]}
                            rows={[
                                {
                                    name: 'idx_orders_user_id',
                                    table: 'orders',
                                    size: '234 MB',
                                    scans: '12.4K',
                                    status: 'healthy',
                                },
                                {
                                    name: 'idx_users_email',
                                    table: 'users',
                                    size: '45 MB',
                                    scans: '0',
                                    status: 'unused',
                                },
                                {
                                    name: 'idx_products_sku',
                                    table: 'products',
                                    size: '12 MB',
                                    scans: '3.2K',
                                    status: 'healthy',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'bloat-analysis') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Table Bloat Analysis" icon={Archive} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={[
                                    { name: 'users', bloat: 12, size: 845 },
                                    { name: 'orders', bloat: 8, size: 2100 },
                                    { name: 'products', bloat: 3, size: 123 },
                                    { name: 'audit_logs', bloat: 15, size: 450 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="bloat" fill={THEME.warning} name="Bloat %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel title="Bloat Details" icon={BarChart2} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'table', label: 'TABLE', width: '25%' },
                                { key: 'bloat', label: 'BLOAT %', width: '15%', mono: true },
                                { key: 'wastedBytes', label: 'WASTED', width: '20%', mono: true },
                                { key: 'recommendation', label: 'RECOMMENDATION', width: '40%' },
                            ]}
                            rows={[
                                {
                                    table: 'audit_logs',
                                    bloat: '15%',
                                    wastedBytes: '67.5 MB',
                                    recommendation: 'REINDEX + VACUUM',
                                },
                                { table: 'users', bloat: '12%', wastedBytes: '101 MB', recommendation: 'VACUUM FULL' },
                                { table: 'orders', bloat: '8%', wastedBytes: '168 MB', recommendation: 'ANALYZE' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query-analysis' && itemKey === 'table-analysis') {
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
                            icon={Database}
                            label="Total Tables"
                            value="89"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Layers}
                            label="Total Rows"
                            value="125.3M"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Total Size"
                            value="2.8 TB"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={TrendingUp}
                            label="Largest Table"
                            value="456 GB"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Top Tables" icon={Database} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'TABLE', width: '20%' },
                                { key: 'rows', label: 'ROWS', width: '15%', mono: true },
                                { key: 'size', label: 'SIZE', width: '15%', mono: true },
                                { key: 'indexSize', label: 'INDEX SIZE', width: '15%', mono: true },
                                { key: 'bloat', label: 'BLOAT', width: '10%', mono: true },
                                { key: 'lastVacuum', label: 'LAST VACUUM', width: '25%' },
                            ]}
                            rows={[
                                {
                                    name: 'users',
                                    rows: '2.3M',
                                    size: '845 MB',
                                    indexSize: '234 MB',
                                    bloat: '12%',
                                    lastVacuum: '2 days ago',
                                },
                                {
                                    name: 'orders',
                                    rows: '8.9M',
                                    size: '2.1 GB',
                                    indexSize: '567 MB',
                                    bloat: '8%',
                                    lastVacuum: '6 hrs ago',
                                },
                                {
                                    name: 'products',
                                    rows: '450K',
                                    size: '123 MB',
                                    indexSize: '45 MB',
                                    bloat: '3%',
                                    lastVacuum: '1 day ago',
                                },
                            ]}
                        />
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
                    <Panel title="Schema Structure" icon={Database} accentColor={THEME.warning}>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: 10.5,
                                color: THEME.textMuted,
                                lineHeight: 1.7,
                            }}
                        >
                            <div style={{ color: THEME.warning }}>public</div>
                            <div style={{ marginLeft: '16px' }}>
                                <div style={{ color: THEME.textMain }}>├── users</div>
                                <div style={{ marginLeft: '16px', fontSize: 9.5 }}>
                                    <div>├── id (bigint, PK)</div>
                                    <div>├── email (varchar, UNIQUE)</div>
                                    <div>├── created_at (timestamp)</div>
                                    <div>└── updated_at (timestamp)</div>
                                </div>
                                <div style={{ color: THEME.textMain }}>├── orders</div>
                                <div style={{ marginLeft: '16px', fontSize: 9.5 }}>
                                    <div>├── id (bigint, PK)</div>
                                    <div>├── user_id (FK)</div>
                                    <div>├── total (decimal)</div>
                                    <div>└── status (varchar)</div>
                                </div>
                                <div style={{ color: THEME.textMain }}>└── products</div>
                                <div style={{ marginLeft: '16px', fontSize: 9.5 }}>
                                    <div>├── id (bigint, PK)</div>
                                    <div>├── sku (varchar, UNIQUE)</div>
                                    <div>├── name (varchar)</div>
                                    <div>└── price (decimal)</div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Tables Overview" icon={TableProperties} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'TABLE', width: '20%' },
                                { key: 'rows', label: 'ROWS', width: '18%', mono: true },
                                { key: 'columns', label: 'COLUMNS', width: '15%', mono: true },
                                { key: 'indexes', label: 'INDEXES', width: '12%', mono: true },
                                { key: 'size', label: 'SIZE', width: '20%', mono: true },
                                { key: 'owner', label: 'OWNER', width: '15%' },
                            ]}
                            rows={[
                                {
                                    name: 'users',
                                    rows: '2.3M',
                                    columns: '12',
                                    indexes: '5',
                                    size: '845 MB',
                                    owner: 'postgres',
                                },
                                {
                                    name: 'orders',
                                    rows: '8.9M',
                                    columns: '8',
                                    indexes: '7',
                                    size: '2.1 GB',
                                    owner: 'postgres',
                                },
                                {
                                    name: 'products',
                                    rows: '450K',
                                    columns: '6',
                                    indexes: '3',
                                    size: '123 MB',
                                    owner: 'postgres',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'schema-migrations') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Migration History" icon={Workflow} accentColor={THEME.ai}>
                        <DataTable
                            columns={[
                                { key: 'version', label: 'VERSION', width: '15%', mono: true },
                                { key: 'description', label: 'DESCRIPTION', width: '40%' },
                                { key: 'executedAt', label: 'EXECUTED', width: '25%' },
                                { key: 'duration', label: 'DURATION', width: '20%', mono: true },
                            ]}
                            rows={[
                                {
                                    version: '20240326_001',
                                    description: 'Create users table with indexes',
                                    executedAt: '2 days ago',
                                    duration: '245ms',
                                },
                                {
                                    version: '20240325_002',
                                    description: 'Add email uniqueness constraint',
                                    executedAt: '3 days ago',
                                    duration: '125ms',
                                },
                                {
                                    version: '20240324_003',
                                    description: 'Add orders table structure',
                                    executedAt: '4 days ago',
                                    duration: '387ms',
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Pending Changes" icon={AlertTriangle} accentColor={THEME.warning}>
                        <div style={{ fontSize: 12, color: THEME.textDim, padding: '20px 0', textAlign: 'center' }}>
                            No pending migrations
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'schema-visualizer') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Entity Relationship Diagram" icon={FolderGit2} accentColor={THEME.ai}>
                        <div
                            style={{
                                padding: '40px 20px',
                                background: `linear-gradient(135deg, ${THEME.primary}08, ${THEME.ai}08)`,
                                borderRadius: 8,
                                border: `1px dashed ${THEME.glassBorder}`,
                                textAlign: 'center',
                                minHeight: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div>
                                <Eye size={28} color={THEME.textDim} style={{ marginBottom: 12 }} />
                                <div style={{ fontSize: 12, color: THEME.textDim }}>Interactive ERD visualization</div>
                                <div style={{ fontSize: 10.5, color: THEME.textDim, marginTop: 4 }}>
                                    users ← orders → products
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'table-dependencies') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Foreign Key Dependencies" icon={Link2} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'from', label: 'FROM TABLE', width: '25%' },
                                { key: 'column', label: 'COLUMN', width: '20%', mono: true },
                                { key: 'to', label: 'REFERENCES', width: '25%' },
                                { key: 'constraint', label: 'CONSTRAINT NAME', width: '30%' },
                            ]}
                            rows={[
                                { from: 'orders', column: 'user_id', to: 'users(id)', constraint: 'fk_orders_user_id' },
                                {
                                    from: 'order_items',
                                    column: 'order_id',
                                    to: 'orders(id)',
                                    constraint: 'fk_order_items_order',
                                },
                                {
                                    from: 'order_items',
                                    column: 'product_id',
                                    to: 'products(id)',
                                    constraint: 'fk_order_items_product',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'chart-builder') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Data Distribution" icon={BarChart2} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'users', value: 2.3, fill: THEME.primary },
                                        { name: 'orders', value: 8.9, fill: THEME.ai },
                                        { name: 'products', value: 0.45, fill: THEME.success },
                                        { name: 'logs', value: 1.2, fill: THEME.warning },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}M`}
                                    outerRadius={80}
                                >
                                    <Cell fill={THEME.primary} />
                                    <Cell fill={THEME.ai} />
                                    <Cell fill={THEME.success} />
                                    <Cell fill={THEME.warning} />
                                </Pie>
                                <Tooltip content={<ChartTip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        // ═══════════════════════════════════════════════════════════════════════
        // INFRASTRUCTURE SECTION (7 items)
        // ═══════════════════════════════════════════════════════════════════════
        if (sectionKey === 'infrastructure' && itemKey === 'connection-pool') {
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
                            icon={Network}
                            label="Pool Connections"
                            value="52"
                            sub="of 100"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => 40 + Math.random() * 25)}
                            trend="+2"
                            trendUp
                        />
                        <MetricCard
                            icon={Activity}
                            label="In Use"
                            value="45"
                            sub="active"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 35 + Math.random() * 30)}
                        />
                        <MetricCard
                            icon={Radio}
                            label="Idle"
                            value="7"
                            sub="available"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => 5 + Math.random() * 15)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Connection Waits"
                            value="3"
                            sub="last hour"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 1 + Math.random() * 5)}
                            warn
                        />
                    </div>

                    <Panel title="Pool Configuration" icon={Network} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 12 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingBottom: '8px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <span style={{ color: THEME.textDim }}>Max Connections</span>
                                <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain, fontWeight: 600 }}>
                                    100
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingBottom: '8px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <span style={{ color: THEME.textDim }}>Min Connections</span>
                                <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain, fontWeight: 600 }}>
                                    10
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingBottom: '8px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <span style={{ color: THEME.textDim }}>Connection Timeout</span>
                                <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain, fontWeight: 600 }}>
                                    30s
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: THEME.textDim }}>Idle Timeout</span>
                                <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain, fontWeight: 600 }}>
                                    600s
                                </span>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'pool-metrics') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Pool Utilization Trend" icon={TrendingUp} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={demoData.connectionTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} domain={[0, 100]} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    type="monotone"
                                    dataKey="active"
                                    stroke={THEME.primary}
                                    strokeWidth={2.5}
                                    name="In Use %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'replication-wal') {
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
                            icon={GitBranch}
                            label="WAL Write Rate"
                            value="125 MB/h"
                            color={THEME.ai}
                            spark={Array.from({ length: 12 }, () => 80 + Math.random() * 80)}
                        />
                        <MetricCard
                            icon={Radio}
                            label="Replication Lag"
                            value="0.3 ms"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 2)}
                        />
                        <MetricCard
                            icon={Droplets}
                            label="WAL Files"
                            value="28"
                            sub="archived"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Sync Status"
                            value="Synced"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Streaming Replication Status" icon={Radio} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'pid', label: 'PID', width: '12%', mono: true },
                                { key: 'client', label: 'CLIENT', width: '25%' },
                                { key: 'state', label: 'STATE', width: '20%' },
                                { key: 'lag', label: 'LAG', width: '18%', mono: true },
                                { key: 'lsn', label: 'LSN', width: '25%', mono: true },
                            ]}
                            rows={[
                                {
                                    pid: '5432',
                                    client: 'replica-1 (10.0.1.2)',
                                    state: 'streaming',
                                    lag: '0.3 ms',
                                    lsn: '0/1A2B3C4D',
                                },
                                {
                                    pid: '5433',
                                    client: 'replica-2 (10.0.1.3)',
                                    state: 'streaming',
                                    lag: '1.2 ms',
                                    lsn: '0/1A2B3C40',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'checkpoint-monitor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Checkpoint Activity" icon={Radio} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={[
                                    { time: '10:00', duration: 12, buffers: 2340 },
                                    { time: '11:00', duration: 8, buffers: 1890 },
                                    { time: '12:00', duration: 15, buffers: 3120 },
                                    { time: '13:00', duration: 10, buffers: 2100 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="duration" fill={THEME.primary} name="Duration (ms)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'vacuum-maintenance') {
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
                            icon={RefreshCw}
                            label="Pending Vacuums"
                            value="5"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => 2 + Math.random() * 10)}
                            warn
                        />
                        <MetricCard
                            icon={Archive}
                            label="Last Vacuum"
                            value="1 h"
                            sub="ago"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Zap}
                            label="Autovacuum"
                            value="Enabled"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Clock}
                            label="Vacuum Duration"
                            value="2.3 h"
                            sub="total last 7d"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Maintenance Operations" icon={RefreshCw} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'table', label: 'TABLE', width: '25%' },
                                { key: 'operation', label: 'OPERATION', width: '20%' },
                                { key: 'lastRun', label: 'LAST RUN', width: '25%' },
                                { key: 'duration', label: 'DURATION', width: '15%', mono: true },
                                { key: 'status', label: 'STATUS', width: '15%' },
                            ]}
                            rows={[
                                {
                                    table: 'orders',
                                    operation: 'VACUUM ANALYZE',
                                    lastRun: '6 hrs ago',
                                    duration: '2.3s',
                                    status: 'completed',
                                },
                                {
                                    table: 'users',
                                    operation: 'VACUUM',
                                    lastRun: '12 hrs ago',
                                    duration: '1.1s',
                                    status: 'completed',
                                },
                                {
                                    table: 'audit_logs',
                                    operation: 'VACUUM FULL',
                                    lastRun: '2 days ago',
                                    duration: '12.4s',
                                    status: 'completed',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'capacity-planning') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Storage Growth Forecast" icon={TrendingUp} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart
                                data={[
                                    { month: 'Jan', used: 1200, forecast: 1200 },
                                    { month: 'Feb', used: 1450, forecast: 1450 },
                                    { month: 'Mar', used: 1680, forecast: 1680 },
                                    { month: 'Apr', forecast: 1920 },
                                    { month: 'May', forecast: 2180 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="month" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Line
                                    type="monotone"
                                    dataKey="used"
                                    stroke={THEME.primary}
                                    strokeWidth={2.5}
                                    name="Current"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke={THEME.warning}
                                    strokeDasharray="5 5"
                                    name="Projected"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'backup-recovery') {
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
                            icon={Archive}
                            label="Last Backup"
                            value="1 h"
                            sub="ago"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={Cloud}
                            label="Backups"
                            value="147"
                            sub="total"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={HardDrive}
                            label="Backup Size"
                            value="2.3 TB"
                            color={THEME.textMuted}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={CheckCircle}
                            label="Recovery"
                            value="100%"
                            sub="verified"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Backup History" icon={Archive} accentColor={THEME.success}>
                        <DataTable
                            columns={[
                                { key: 'timestamp', label: 'TIMESTAMP', width: '25%' },
                                { key: 'type', label: 'TYPE', width: '15%' },
                                { key: 'size', label: 'SIZE', width: '15%', mono: true },
                                { key: 'duration', label: 'DURATION', width: '15%', mono: true },
                                { key: 'status', label: 'STATUS', width: '30%' },
                            ]}
                            rows={[
                                {
                                    timestamp: '1 hr ago',
                                    type: 'incremental',
                                    size: '2.3 GB',
                                    duration: '45s',
                                    status: 'completed',
                                },
                                {
                                    timestamp: '1 day ago',
                                    type: 'full',
                                    size: '145 GB',
                                    duration: '12m 34s',
                                    status: 'completed',
                                },
                                {
                                    timestamp: '7 days ago',
                                    type: 'full',
                                    size: '142 GB',
                                    duration: '13m 02s',
                                    status: 'completed',
                                },
                            ]}
                        />
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
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                        }}
                        className="dpg-stagger"
                    >
                        <MetricCard
                            icon={ShieldCheck}
                            label="Security Score"
                            value="92"
                            sub="of 100"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => 85 + Math.random() * 15)}
                        />
                        <MetricCard
                            icon={Lock}
                            label="Encrypted Tables"
                            value="89"
                            sub="of 89"
                            color={THEME.success}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Failed Logins"
                            value="3"
                            sub="last 24h"
                            color={THEME.warning}
                            spark={Array.from({ length: 12 }, () => Math.random() * 10)}
                        />
                        <MetricCard
                            icon={Eye}
                            label="Audit Events"
                            value="1.2K"
                            sub="logged"
                            color={THEME.primary}
                            spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                        />
                    </div>

                    <Panel title="Access Control" icon={Lock} accentColor={THEME.danger}>
                        <DataTable
                            columns={[
                                { key: 'user', label: 'USER', width: '25%' },
                                { key: 'role', label: 'ROLE', width: '20%' },
                                { key: 'lastLogin', label: 'LAST LOGIN', width: '25%' },
                                { key: 'status', label: 'STATUS', width: '30%' },
                            ]}
                            rows={[
                                { user: 'postgres', role: 'superuser', lastLogin: 'never', status: 'system' },
                                { user: 'app_user', role: 'read_write', lastLogin: '5 mins ago', status: 'active' },
                                { user: 'analytics', role: 'read_only', lastLogin: '2 hrs ago', status: 'active' },
                            ]}
                        />
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
                    <Panel title="System Metrics" icon={Radar} accentColor={THEME.warning}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <RingGauge value={76} color={THEME.warning} size={90} label="CPU" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <RingGauge value={58} color={THEME.primary} size={90} label="Memory" />
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Observability Status" icon={Eye} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'metric', label: 'METRIC', width: '30%' },
                                { key: 'provider', label: 'PROVIDER', width: '25%' },
                                { key: 'status', label: 'STATUS', width: '20%' },
                                { key: 'lastUpdate', label: 'LAST UPDATE', width: '25%' },
                            ]}
                            rows={[
                                {
                                    metric: 'Metrics',
                                    provider: 'Prometheus',
                                    status: 'connected',
                                    lastUpdate: '30s ago',
                                },
                                { metric: 'Logs', provider: 'CloudWatch', status: 'connected', lastUpdate: '5s ago' },
                                { metric: 'Traces', provider: 'Datadog', status: 'connected', lastUpdate: '2min ago' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'cloudwatch') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="CloudWatch Integration" icon={Cloud} accentColor={THEME.primary}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 12 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: `${THEME.success}08`,
                                    borderRadius: 8,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ fontWeight: 600, color: THEME.textMain }}>Database Metrics</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>
                                    Connected • Last sync: 1min ago
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: `${THEME.success}08`,
                                    borderRadius: 8,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ fontWeight: 600, color: THEME.textMain }}>RDS Enhanced Monitoring</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>
                                    Enabled • granularity: 60s
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: `${THEME.warning}08`,
                                    borderRadius: 8,
                                    borderLeft: `2px solid ${THEME.warning}`,
                                }}
                            >
                                <div style={{ fontWeight: 600, color: THEME.textMain }}>Custom Metrics</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>
                                    23 metrics publishing
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'log-patterns') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Log Pattern Analysis" icon={FileSearch} accentColor={THEME.warning}>
                        <DataTable
                            columns={[
                                { key: 'pattern', label: 'PATTERN', width: '40%' },
                                { key: 'count', label: 'COUNT', width: '15%', mono: true },
                                { key: 'lastSeen', label: 'LAST SEEN', width: '25%' },
                                { key: 'severity', label: 'SEV', width: '20%' },
                            ]}
                            rows={[
                                {
                                    pattern: 'Connection timeout',
                                    count: '127',
                                    lastSeen: '5min ago',
                                    severity: 'warning',
                                },
                                {
                                    pattern: 'Slow query detected',
                                    count: '89',
                                    lastSeen: '12min ago',
                                    severity: 'info',
                                },
                                { pattern: 'Auth failure', count: '3', lastSeen: '2hrs ago', severity: 'warning' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'opentelemetry') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="OpenTelemetry Configuration" icon={Radar} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 12 }}>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glass,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ fontWeight: 600, color: THEME.textMain, marginBottom: 3 }}>Traces</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>
                                    OTLP HTTP exporter • 100% sampling
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: THEME.glass,
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <div style={{ fontWeight: 600, color: THEME.textMain, marginBottom: 3 }}>Metrics</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>
                                    Prometheus remote write • 15s interval
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'kubernetes') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Kubernetes Integration" icon={Container} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'pod', label: 'POD', width: '30%' },
                                { key: 'namespace', label: 'NAMESPACE', width: '20%' },
                                { key: 'status', label: 'STATUS', width: '20%' },
                                { key: 'restarts', label: 'RESTARTS', width: '15%', mono: true },
                                { key: 'age', label: 'AGE', width: '15%' },
                            ]}
                            rows={[
                                {
                                    pod: 'postgres-primary-0',
                                    namespace: 'default',
                                    status: 'running',
                                    restarts: '0',
                                    age: '45d',
                                },
                                {
                                    pod: 'postgres-replica-0',
                                    namespace: 'default',
                                    status: 'running',
                                    restarts: '1',
                                    age: '40d',
                                },
                                {
                                    pod: 'postgres-backup-0',
                                    namespace: 'backup',
                                    status: 'running',
                                    restarts: '0',
                                    age: '30d',
                                },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'status-page') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Service Status" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 10px',
                                    background: `${THEME.success}08`,
                                    borderRadius: 8,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.success }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>Database</span>
                                <span style={{ marginLeft: 'auto', fontSize: 10, color: THEME.textDim }}>
                                    99.99% • 45d uptime
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 10px',
                                    background: `${THEME.success}08`,
                                    borderRadius: 8,
                                    borderLeft: `2px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.success }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>Backups</span>
                                <span style={{ marginLeft: 'auto', fontSize: 10, color: THEME.textDim }}>
                                    All healthy
                                </span>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'ai-monitoring') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="AI-Powered Insights" icon={Brain} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                style={{
                                    padding: '12px 14px',
                                    background: `${THEME.ai}08`,
                                    borderRadius: 10,
                                    borderLeft: `3px solid ${THEME.ai}`,
                                }}
                            >
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                    Anomaly: Query Performance
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    Detected 15% slowdown in order processing queries over last 6 hours
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '12px 14px',
                                    background: `${THEME.primary}08`,
                                    borderRadius: 10,
                                    borderLeft: `3px solid ${THEME.primary}`,
                                }}
                            >
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                    Trend: Connection Growth
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    Connection pool usage trending +3.2% per day, will reach 90% in 8 days
                                </div>
                            </div>
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
                    <Panel title="SQL Editor" icon={Terminal} accentColor={THEME.ai} noPad>
                        <div
                            style={{
                                fontFamily: THEME.fontMono,
                                fontSize: 11,
                                color: THEME.textMuted,
                                background: `${THEME.primary}04`,
                                padding: '14px',
                                borderRadius: 8,
                                border: `1px solid ${THEME.glassBorder}`,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                            }}
                        >
                            {`SELECT
  u.id, u.name, u.email,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '90 days'
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 100;`}
                        </div>
                    </Panel>

                    <Panel title="Execution Results" icon={CheckCircle} accentColor={THEME.success}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 12 }}>
                            <div style={{ color: THEME.success, fontWeight: 600 }}>✓ Query executed successfully</div>
                            <div style={{ color: THEME.textDim }}>Rows returned: 1,247 • Duration: 234 ms</div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'api-tracing') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="API Request Trace" icon={Radar} accentColor={THEME.ai}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: 11,
                                fontFamily: THEME.fontMono,
                            }}
                        >
                            <div style={{ color: THEME.ai }}>→ GET /api/orders/123</div>
                            <div style={{ marginLeft: '16px', color: THEME.primary }}>├─ db.query (45ms)</div>
                            <div style={{ marginLeft: '32px', color: THEME.textDim }}>
                                │ └─ SELECT * FROM orders WHERE id = $1
                            </div>
                            <div style={{ marginLeft: '16px', color: THEME.primary }}>├─ cache.get (12ms)</div>
                            <div style={{ marginLeft: '32px', color: THEME.textDim }}>│ └─ Hit: order:123:details</div>
                            <div style={{ marginLeft: '16px', color: THEME.success }}>└─ response (2ms) • 200 OK</div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'repository') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="Repository Information" icon={FolderGit2} accentColor={THEME.primary}>
                        <DataTable
                            columns={[
                                { key: 'key', label: 'KEY', width: '30%' },
                                { key: 'value', label: 'VALUE', width: '70%' },
                            ]}
                            rows={[
                                { key: 'Remote', value: 'git@github.com:company/postgres-monitoring.git' },
                                { key: 'Branch', value: 'main' },
                                { key: 'Commit', value: '3a7c2f9d (2 hours ago)' },
                                { key: 'Status', value: 'Up to date' },
                            ]}
                        />
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'developer' && itemKey === 'ai-advisor') {
            return (
                <div className="dpg-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Panel title="AI Query Advisor" icon={Brain} accentColor={THEME.ai}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                style={{
                                    padding: '12px 14px',
                                    background: `${THEME.ai}08`,
                                    borderRadius: 10,
                                    borderLeft: `3px solid ${THEME.ai}`,
                                }}
                            >
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                    Query Optimization
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    Your JOIN order is suboptimal. Try: JOIN products AFTER customers for 30% faster
                                    execution.
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '12px 14px',
                                    background: `${THEME.success}08`,
                                    borderRadius: 10,
                                    borderLeft: `3px solid ${THEME.success}`,
                                }}
                            >
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMain }}>
                                    Index Suggestion
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                    CREATE INDEX idx_orders_user_created on orders(user_id, created_at);
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        return <div style={{ padding: '24px', color: THEME.textDim }}>Loading...</div>;
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
