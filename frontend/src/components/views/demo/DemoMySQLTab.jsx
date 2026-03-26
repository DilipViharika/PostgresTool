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
                bufferPoolPages: 2048000,
                readHits: 99.2,
                writeHits: 87.3,
                pagesRead: 1240,
                pagesWritten: 560,
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
            alertTrends: base24h.map((d, i) => ({
                ...d,
                alerts: Math.floor(6 + Math.sin(i / 7) * 3 + Math.random() * 2),
            })),
            slowQueries: [
                { id: 'q1', query: 'SELECT * FROM orders WHERE status = %s', duration: 1850, calls: 203, rows: 9240 },
                {
                    id: 'q2',
                    query: 'SELECT COUNT(*) FROM transactions GROUP BY user_id',
                    duration: 1420,
                    calls: 945,
                    rows: 8324,
                },
                {
                    id: 'q3',
                    query: 'JOIN orders o, users u WHERE o.user_id = u.id',
                    duration: 1260,
                    calls: 124,
                    rows: 42100,
                },
            ],
            queryDist: base24h.map((d, i) => ({
                ...d,
                select: Math.floor(480 + Math.random() * 280),
                insert: Math.floor(160 + Math.random() * 110),
                update: Math.floor(130 + Math.random() * 90),
                delete: Math.floor(40 + Math.random() * 30),
            })),
            tableStats: [
                { name: 'orders', engine: 'InnoDB', rows: 845000, size: '18.4 GB', autoIncrement: 2450000 },
                { name: 'users', engine: 'InnoDB', rows: 123000, size: '2.8 GB', autoIncrement: 450000 },
                { name: 'transactions', engine: 'InnoDB', rows: 2340000, size: '28.9 GB', autoIncrement: 5000000 },
            ],
            replication: {
                status: 'running',
                binlogFile: 'mysql-bin.000142',
                binlogPosition: 245600000,
                slaveGtidExec: '4a2c8d3e-1234-5678-abcd-ef0123456789:1-58493',
                lag: 0,
            },
            threadPool: {
                running: 12,
                sleeping: 34,
                cached: 156,
                max: 200,
            },
            performanceSchema: {
                events: 14287,
                waits: 3420,
                stages: 890,
                statements: 4500,
            },
            locks: [
                { type: 'Table Lock', tables: 2, mode: 'WRITE' },
                { type: 'Row Lock', rows: 45, mode: 'SHARED' },
                { type: 'MDL', objects: 3, mode: 'SHARED_READ' },
            ],
            securityStatus: {
                sslEnabled: true,
                users: 18,
                privilegedAccounts: 3,
                passwordExpired: 0,
            },
            errorLog: [
                { timestamp: '2m ago', level: 'WARNING', message: 'Aborted connection from host' },
                { timestamp: '8m ago', level: 'ERROR', message: 'Table is marked as crashed' },
                { timestamp: '15m ago', level: 'WARNING', message: 'InnoDB: Deadlock detected' },
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
                { key: 'dashboard', label: 'Executive Dashboard' },
                { key: 'innodb', label: 'InnoDB Status' },
                { key: 'serverVars', label: 'Server Variables' },
                { key: 'databases', label: 'Databases' },
                { key: 'perfSchema', label: 'Performance Schema' },
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
                { key: 'alertHistory', label: 'Alert History' },
            ],
        },
        {
            key: 'queryAnalysis',
            label: 'Query Analysis',
            icon: Eye,
            accent: THEME.ai,
            items: [
                { key: 'slowLog', label: 'Slow Query Log' },
                { key: 'queryDigest', label: 'Query Digest' },
                { key: 'explainAnalyzer', label: 'EXPLAIN Analyzer' },
                { key: 'indexStats', label: 'Index Statistics' },
                { key: 'tableStats', label: 'Table Statistics' },
                { key: 'profiler', label: 'Query Profiler' },
            ],
        },
        {
            key: 'schemaData',
            label: 'Schema & Data',
            icon: Database,
            accent: THEME.warning,
            items: [
                { key: 'schemaBrowser', label: 'Schema Browser' },
                { key: 'tableInspector', label: 'Table Inspector' },
                { key: 'foreignKeys', label: 'Foreign Keys' },
                { key: 'storedPrograms', label: 'Stored Programs' },
            ],
        },
        {
            key: 'infrastructure',
            label: 'Infrastructure',
            icon: Server,
            accent: THEME.success,
            items: [
                { key: 'connectionPool', label: 'Connection Pool' },
                { key: 'replication', label: 'Replication' },
                { key: 'binlog', label: 'Binary Logs' },
                { key: 'threadPool', label: 'Thread Pool' },
                { key: 'bufferPool', label: 'Buffer Pool' },
                { key: 'tablespaces', label: 'Tablespaces' },
                { key: 'backups', label: 'Backups' },
            ],
        },
        {
            key: 'security',
            label: 'Security',
            icon: Shield,
            accent: THEME.danger,
            items: [
                { key: 'userAccounts', label: 'User Accounts' },
                { key: 'privileges', label: 'Privileges' },
                { key: 'sslStatus', label: 'SSL Status' },
                { key: 'auditLog', label: 'Audit Log' },
            ],
        },
        {
            key: 'observability',
            label: 'Observability',
            icon: Gauge,
            accent: THEME.warning,
            items: [
                { key: 'metricsHub', label: 'Metrics Hub' },
                { key: 'errorLog', label: 'Error Log' },
                { key: 'generalLog', label: 'General Log' },
                { key: 'perfInsights', label: 'Performance Insights' },
                { key: 'statusPage', label: 'Status Page' },
            ],
        },
        {
            key: 'developerTools',
            label: 'Developer Tools',
            icon: Terminal,
            accent: THEME.ai,
            items: [
                { key: 'sqlEditor', label: 'SQL Editor' },
                { key: 'migrationTool', label: 'Migration Tool' },
                { key: 'importExport', label: 'Import/Export' },
                { key: 'tuningAdvisor', label: 'AI Tuning Advisor' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        // OVERVIEW SECTION
        if (sectionKey === 'overview' && itemKey === 'dashboard') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatusBadge label="Operational" color={THEME.success} />
                        <StatusBadge label="Production" color={THEME.primary} />
                        <StatusBadge label="MySQL 8.0.36" color={THEME.secondary} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Uptime" value="72" icon={Clock} />
                        <HeroMetric label="QPS" value="856" icon={Zap} />
                        <HeroMetric label="Active Conn" value="38" icon={Activity} />
                        <HeroMetric label="InnoDB Cache" value="78.5" icon={HardDrive} />
                        <HeroMetric label="Slow Queries" value="3" icon={AlertCircle} />
                        <HeroMetric label="Database Size" value="107.6GB" icon={Database} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        <Panel title="Query Throughput (24h)" icon={TrendingUp} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={demoData.qps}>
                                    <defs>
                                        <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={THEME.primary}
                                        fillOpacity={1}
                                        fill="url(#colorQps)"
                                        name="QPS"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="InnoDB Health" icon={Gauge} accentColor={THEME.success}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <RingGauge value={78} color={THEME.primary} label="Buffer Pool" />
                                <RingGauge value={99} color={THEME.success} label="Cache Hit" />
                            </div>
                        </Panel>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <Panel title="Last Checkpoint" icon={CheckCircle} accentColor={THEME.success}>
                            <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                                <p style={{ color: THEME.textMain, marginBottom: '8px' }}>
                                    <strong>Type:</strong> Full Flush
                                </p>
                                <p style={{ marginBottom: '4px' }}>Time: 2m ago</p>
                                <p style={{ color: THEME.success }}>✓ Clean</p>
                            </div>
                        </Panel>
                        <Panel title="Thread Status" icon={Users} accentColor={THEME.primary}>
                            <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                                <p style={{ marginBottom: '6px' }}>Running: 12</p>
                                <p style={{ marginBottom: '6px' }}>Sleeping: 34</p>
                                <p>Cached: 156</p>
                            </div>
                        </Panel>
                        <Panel title="Binlog Status" icon={Radio} accentColor={THEME.warning}>
                            <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                                <p style={{ marginBottom: '4px' }}>mysql-bin.000142</p>
                                <p style={{ color: THEME.textMain }}>245.6M pos</p>
                            </div>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'innodb') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Buffer Pool Usage" value="78.5" icon={HardDrive} />
                        <HeroMetric label="Read Efficiency" value="99.2" icon={Zap} />
                        <HeroMetric label="Write Efficiency" value="87.3" icon={RefreshCw} />
                        <HeroMetric label="Pages Read/s" value="1.2K" icon={Activity} />
                    </div>

                    <Panel title="InnoDB Configuration" icon={Settings} accentColor={THEME.success}>
                        <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '20px',
                                }}
                            >
                                <div>
                                    <p style={{ marginBottom: '8px' }}>
                                        <strong style={{ color: THEME.textMain }}>Buffer Pool Size:</strong> 16 GB
                                    </p>
                                    <p style={{ marginBottom: '8px' }}>
                                        <strong style={{ color: THEME.textMain }}>Log File Size:</strong> 1 GB
                                    </p>
                                    <p>
                                        <strong style={{ color: THEME.textMain }}>Flush Method:</strong> O_DIRECT
                                    </p>
                                </div>
                                <div>
                                    <p style={{ marginBottom: '8px' }}>
                                        <strong style={{ color: THEME.textMain }}>Flush Log at Trx:</strong> 1
                                    </p>
                                    <p style={{ marginBottom: '8px' }}>
                                        <strong style={{ color: THEME.textMain }}>Doublewrite:</strong> ON
                                    </p>
                                    <p>
                                        <strong style={{ color: THEME.textMain }}>Compression:</strong> OFF
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Panel title="InnoDB Metrics (24h)" icon={BarChart3} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.qps}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={THEME.success}
                                    fill={THEME.success}
                                    fillOpacity={0.3}
                                    name="Buffer Pool Pages"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'serverVars') {
            return (
                <Panel title="Key Server Variables" icon={Settings} accentColor={THEME.primary}>
                    <div
                        style={{
                            fontSize: '12px',
                            color: THEME.textMuted,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                        }}
                    >
                        <div>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>max_connections:</strong> 512
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>max_allowed_packet:</strong> 64M
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>tmp_table_size:</strong> 32M
                            </p>
                            <p>
                                <strong style={{ color: THEME.textMain }}>query_cache_size:</strong> 128M
                            </p>
                        </div>
                        <div>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>binlog_format:</strong> ROW
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>slow_query_log:</strong> ON
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>long_query_time:</strong> 2s
                            </p>
                            <p>
                                <strong style={{ color: THEME.textMain }}>log_queries_not_using_indexes:</strong> ON
                            </p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'databases') {
            return (
                <Panel title="Databases Overview" icon={Database} accentColor={THEME.warning}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Engine
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Size</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Tables
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Rows</th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.databases.map((db, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{db.name}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.engine}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.size}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.tables}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>
                                            {(db.rows / 1000000).toFixed(2)}M
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'perfSchema') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Event Classes" value="14.3K" icon={BarChart3} />
                        <HeroMetric label="Wait Events" value="3.4K" icon={Clock} />
                        <HeroMetric label="Stage Events" value="890" icon={Layers} />
                        <HeroMetric label="Statements" value="4.5K" icon={Code} />
                    </div>

                    <Panel title="Performance Schema Instruments" icon={Gauge} accentColor={THEME.warning}>
                        <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                            <div
                                style={{
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Events (wait_class)</p>
                                <p>Statement: 2.4K | Transaction: 890 | Idle: 1.1K</p>
                            </div>
                            <div>
                                <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Table I/O</p>
                                <p>Read: 145K | Write: 34K | Fetch: 234K</p>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        // ALERTS & RULES SECTION
        if (sectionKey === 'alerts' && itemKey === 'activeAlerts') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Critical" value={String(demoData.alerts.critical)} icon={AlertTriangle} />
                        <HeroMetric label="Warning" value={String(demoData.alerts.warning)} icon={AlertCircle} />
                        <HeroMetric label="Info" value={String(demoData.alerts.info)} icon={FileText} />
                        <HeroMetric label="Resolved" value={String(demoData.alerts.resolved)} icon={CheckCircle} />
                    </div>

                    <Panel title="Alert Timeline (24h)" icon={TrendingUp} accentColor={THEME.danger}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.alertTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip content={<ChartTip />} />
                                <Line type="monotone" dataKey="alerts" stroke={THEME.danger} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alertRules') {
            return (
                <Panel title="Alert Rules Configuration" icon={Bell} accentColor={THEME.danger}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Buffer Pool Usage {'>'} 90%</p>
                            <p>Severity: Warning | Action: Email + Slack</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Replication Lag {'>'} 10s</p>
                            <p>Severity: Critical | Action: PagerDuty + SMS</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Slow Query Rate {'>'} 50/min</p>
                            <p>Severity: Warning | Action: Webhook</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Connection Pool {'>'} 85%</p>
                            <p>Severity: Warning | Action: Log event</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'alertHistory') {
            return (
                <Panel title="Recent Alert Events" icon={FileText} accentColor={THEME.warning}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.danger, marginBottom: '3px' }}>3m ago - CRITICAL</p>
                            <p>InnoDB deadlock detected on orders table</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.warning, marginBottom: '3px' }}>12m ago - WARNING</p>
                            <p>Slow query log entries: 142 (threshold: 50)</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.warning, marginBottom: '3px' }}>28m ago - WARNING</p>
                            <p>Buffer pool hit ratio dropped to 92.1%</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success, marginBottom: '3px' }}>35m ago - RESOLVED</p>
                            <p>Connection pool utilization normalized</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        // QUERY ANALYSIS SECTION
        if (sectionKey === 'queryAnalysis' && itemKey === 'slowLog') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Panel title="Slow Query Log" icon={Code} accentColor={THEME.ai}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Query
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Time (ms)
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Calls
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Rows
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demoData.slowQueries.map((q, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                            <td
                                                style={{
                                                    padding: '8px',
                                                    color: THEME.textMain,
                                                    fontFamily: THEME.fontMono,
                                                    fontSize: '10px',
                                                }}
                                            >
                                                {q.query.slice(0, 40)}...
                                            </td>
                                            <td style={{ padding: '8px', color: THEME.textMuted }}>{q.duration}</td>
                                            <td style={{ padding: '8px', color: THEME.textMuted }}>{q.calls}</td>
                                            <td style={{ padding: '8px', color: THEME.textMuted }}>
                                                {q.rows.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Slow Query Distribution" icon={BarChart3} accentColor={THEME.secondary}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={demoData.slowQueries}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="id" stroke={THEME.textMuted} />
                                <YAxis stroke={THEME.textMuted} />
                                <Tooltip content={<ChartTip />} />
                                <Bar
                                    dataKey="duration"
                                    fill={THEME.warning}
                                    name="Duration (ms)"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'queryDigest') {
            return (
                <Panel title="Query Digest Summary" icon={Code} accentColor={THEME.ai}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Query: SELECT * FROM orders WHERE status = ?
                            </p>
                            <p>Count: 203 | Avg Time: 9.1ms | Max Time: 1850ms</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Query: SELECT COUNT(*) FROM transactions GROUP BY user_id
                            </p>
                            <p>Count: 945 | Avg Time: 1.5ms | Max Time: 1420ms</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Query: JOIN orders o, users u WHERE o.user_id = u.id
                            </p>
                            <p>Count: 124 | Avg Time: 10.2ms | Max Time: 1260ms</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'explainAnalyzer') {
            return (
                <Panel title="EXPLAIN Plan Analysis" icon={Code} accentColor={THEME.ai}>
                    <div style={{ fontSize: '11px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <pre
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                maxHeight: '350px',
                            }}
                        >
                            {`id | select_type | table | partitions | type | rows | filtered | Extra
1  | SIMPLE      | o     | NULL       | ALL  | 8420 | 5.00     | Using where
1  | SIMPLE      | u     | NULL       | ref  | 1    | 100.00   | Using index`}
                        </pre>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'indexStats') {
            return (
                <Panel title="Index Statistics" icon={Zap} accentColor={THEME.ai}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                idx_orders_status (orders table)
                            </p>
                            <p>Cardinality: 8420 | Size: 24MB | Leaf pages: 512 | Reads: 18.4K</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>PRIMARY (users table)</p>
                            <p>Cardinality: 123K | Size: 8MB | Leaf pages: 256 | Reads: 42.1K</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.warning, marginBottom: '4px' }}>
                                idx_unused_column (transactions table)
                            </p>
                            <p>Cardinality: 890 | Size: 6MB | Reads: 12 (consider dropping)</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'tableStats') {
            return (
                <Panel title="Table I/O Statistics" icon={BarChart3} accentColor={THEME.ai}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Table</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Rows</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Auto_Inc
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.tableStats.map((t, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{t.name}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>
                                            {(t.rows / 1000000).toFixed(2)}M
                                        </td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>
                                            {(t.autoIncrement / 1000000).toFixed(2)}M
                                        </td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{t.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'queryAnalysis' && itemKey === 'profiler') {
            return (
                <Panel title="Query Profiler Results" icon={Activity} accentColor={THEME.ai}>
                    <div style={{ fontSize: '11px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <div
                            style={{
                                marginBottom: '8px',
                                paddingBottom: '8px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>SELECT * FROM orders WHERE status = 'pending'</p>
                            <p>Starting: 1.234ms | Checking privileges: 0.023ms</p>
                            <p>Opening tables: 0.156ms | Query optimization: 0.847ms</p>
                            <p>Executing: 1850.234ms | Sending data: 0.45ms</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>Total: 1852.939ms</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        // SCHEMA & DATA SECTION
        if (sectionKey === 'schemaData' && itemKey === 'schemaBrowser') {
            return (
                <Panel title="Schema Objects" icon={Database} accentColor={THEME.warning}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.primary}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Tables</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', fontWeight: 'bold' }}>247</p>
                        </div>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.secondary}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Views</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', fontWeight: 'bold' }}>34</p>
                        </div>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.success}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Procedures</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', fontWeight: 'bold' }}>56</p>
                        </div>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.warning}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Functions</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', fontWeight: 'bold' }}>23</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'tableInspector') {
            return (
                <Panel title="Table Structure Inspector" icon={Layers} accentColor={THEME.warning}>
                    <div style={{ fontSize: '11px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Table: orders</p>
                            <p>Engine: InnoDB | Columns: 12 | Primary Key: id | Charset: utf8mb4</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Table: users</p>
                            <p>Engine: InnoDB | Columns: 8 | Primary Key: id | Charset: utf8mb4</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Table: transactions</p>
                            <p>Engine: InnoDB | Columns: 15 | Primary Key: id | Charset: utf8mb4</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'foreignKeys') {
            return (
                <Panel title="Foreign Key Constraints" icon={Network} accentColor={THEME.warning}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>orders → users (user_id)</p>
                            <p>Referential Action: CASCADE</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                transactions → orders (order_id)
                            </p>
                            <p>Referential Action: RESTRICT</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>transactions → users (user_id)</p>
                            <p>Referential Action: SET NULL</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schemaData' && itemKey === 'storedPrograms') {
            return (
                <Panel title="Stored Programs" icon={Code} accentColor={THEME.warning}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '3px' }}>PROCEDURE calculate_totals()</p>
                            <p>Parameters: 2 | Lines: 34 | Last Modified: 2h ago</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '3px' }}>
                                FUNCTION get_customer_total(cid INT)
                            </p>
                            <p>Parameters: 1 | Lines: 12 | Returns: DECIMAL</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '3px' }}>TRIGGER orders_audit_trigger</p>
                            <p>Event: AFTER INSERT | Table: orders | Status: Active</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        // INFRASTRUCTURE SECTION
        if (sectionKey === 'infrastructure' && itemKey === 'connectionPool') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Active" value="38" icon={Activity} />
                        <HeroMetric label="Idle" value="28" icon={Clock} />
                        <HeroMetric label="Waiting" value="1" icon={AlertCircle} />
                        <HeroMetric label="Max" value="200" icon={Gauge} />
                    </div>

                    <Panel title="Connection Pool Trends (24h)" icon={TrendingUp} accentColor={THEME.success}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.connections}>
                                <defs>
                                    <linearGradient id="colorActive2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.success} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    stroke={THEME.success}
                                    fill="url(#colorActive2)"
                                    name="Active Connections"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'replication') {
            return (
                <Panel title="Replication Status" icon={Network} accentColor={THEME.success}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                            }}
                        >
                            <div>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Status:</strong>{' '}
                                    <span style={{ color: THEME.success }}>Running</span>
                                </p>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Binlog File:</strong> mysql-bin.000142
                                </p>
                                <p>
                                    <strong style={{ color: THEME.textMain }}>Position:</strong> 245.6M
                                </p>
                            </div>
                            <div>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Seconds Behind Master:</strong> 0
                                </p>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Slave IO Running:</strong> Yes
                                </p>
                                <p>
                                    <strong style={{ color: THEME.textMain }}>Slave SQL Running:</strong> Yes
                                </p>
                            </div>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'binlog') {
            return (
                <Panel title="Binary Log Status" icon={Radio} accentColor={THEME.success}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                            }}
                        >
                            <div>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Format:</strong> ROW
                                </p>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Current File:</strong> mysql-bin.000142
                                </p>
                                <p>
                                    <strong style={{ color: THEME.textMain }}>Max Size:</strong> 1GB
                                </p>
                            </div>
                            <div>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Total Binlogs:</strong> 142
                                </p>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: THEME.textMain }}>Purge Before:</strong> 2w ago
                                </p>
                                <p>
                                    <strong style={{ color: THEME.textMain }}>Total Size:</strong> 285GB
                                </p>
                            </div>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'threadPool') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Running" value={String(demoData.threadPool.running)} icon={Activity} />
                        <HeroMetric label="Sleeping" value={String(demoData.threadPool.sleeping)} icon={Clock} />
                        <HeroMetric label="Cached" value={String(demoData.threadPool.cached)} icon={Archive} />
                        <HeroMetric label="Max Threads" value={String(demoData.threadPool.max)} icon={Server} />
                    </div>

                    <Panel title="Thread Pool Configuration" icon={Settings} accentColor={THEME.success}>
                        <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>thread_stack:</strong> 262144 bytes
                            </p>
                            <p style={{ marginBottom: '8px' }}>
                                <strong style={{ color: THEME.textMain }}>max_connections:</strong> 512
                            </p>
                            <p>
                                <strong style={{ color: THEME.textMain }}>thread_priority:</strong> 0
                            </p>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'bufferPool') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <RingGauge
                        value={78}
                        color={THEME.primary}
                        size={100}
                        label="Buffer Pool Usage"
                        secondaryValue={99}
                        secondaryColor={THEME.success}
                    />

                    <Panel title="Buffer Pool Metrics" icon={HardDrive} accentColor={THEME.success}>
                        <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                            <div
                                style={{
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Pool Size: 16 GB</p>
                                <p>Total Pages: 2,048,000 | Free Pages: 451,200 | Dirty Pages: 125,000</p>
                            </div>
                            <div>
                                <p style={{ color: THEME.textMain, marginBottom: '4px' }}>I/O Activity</p>
                                <p>Read Ahead: 1.2K/s | Writes: 560/s | Flushes: 340/s</p>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'tablespaces') {
            return (
                <Panel title="Tablespace Management" icon={Database} accentColor={THEME.success}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>System Tablespace</p>
                            <p>Type: Shared | Size: 24 MB | Status: Active</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Undo Tablespace</p>
                            <p>Count: 2 | Total Size: 4 GB | Purge: Active</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Temp Tablespace</p>
                            <p>Size: 2 GB | Allocations: 1,240 | Status: Active</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infrastructure' && itemKey === 'backups') {
            return (
                <Panel title="Backup History" icon={Archive} accentColor={THEME.success}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Full #285</p>
                            <p>Size: 107.6 GB | Duration: 3h 42m | Date: 2h ago</p>
                            <p style={{ color: THEME.success }}>✓ Success</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Incremental #286</p>
                            <p>Size: 3.2 GB | Duration: 18m | Date: 1h ago</p>
                            <p style={{ color: THEME.success }}>✓ Success</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Full #284</p>
                            <p>Size: 107.6 GB | Duration: 3h 48m | Date: 1d ago</p>
                            <p style={{ color: THEME.success }}>✓ Success</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        // SECURITY SECTION
        if (sectionKey === 'security' && itemKey === 'userAccounts') {
            return (
                <Panel title="User Accounts" icon={Users} accentColor={THEME.danger}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>User</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Host</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Connections
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { user: 'root', host: 'localhost', conns: 2 },
                                    { user: 'app_user', host: '%', conns: 38 },
                                    { user: 'readonly_user', host: '%', conns: 12 },
                                    { user: 'backup_user', host: 'backup.local', conns: 1 },
                                ].map((u, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{u.user}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{u.host}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{u.conns}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'privileges') {
            return (
                <Panel title="User Privileges" icon={Lock} accentColor={THEME.danger}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>root@localhost</p>
                            <p>Grant Type: ALL PRIVILEGES | With Grant: Yes</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>app_user@%</p>
                            <p>Grant Type: SELECT, INSERT, UPDATE, DELETE | Database: production</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>readonly_user@%</p>
                            <p>Grant Type: SELECT | Database: analytics</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'sslStatus') {
            return (
                <Panel title="SSL/TLS Configuration" icon={Shield} accentColor={THEME.danger}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <p
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <strong style={{ color: THEME.textMain }}>SSL Status:</strong>{' '}
                            <span style={{ color: THEME.success }}>Enabled</span>
                        </p>
                        <p
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <strong style={{ color: THEME.textMain }}>Protocol Version:</strong> TLSv1.3
                        </p>
                        <p
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <strong style={{ color: THEME.textMain }}>Certificate Valid Until:</strong> 2026-12-31
                        </p>
                        <p>
                            <strong style={{ color: THEME.textMain }}>Cipher Suite:</strong> TLS_AES_256_GCM_SHA384
                        </p>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'auditLog') {
            return (
                <Panel title="Audit Log Events" icon={FileText} accentColor={THEME.danger}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        {demoData.errorLog.map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '10px',
                                    paddingBottom: '10px',
                                    borderBottom:
                                        i < demoData.errorLog.length - 1 ? `1px solid ${THEME.glassBorder}` : 'none',
                                }}
                            >
                                <p style={{ color: THEME.textMain, marginBottom: '3px' }}>
                                    {e.timestamp} - {e.level}
                                </p>
                                <p>{e.message}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        // OBSERVABILITY SECTION
        if (sectionKey === 'observability' && itemKey === 'metricsHub') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Avg QPS" value="856" icon={Zap} />
                        <HeroMetric label="Avg TPS" value="620" icon={Activity} />
                        <HeroMetric label="P95 Latency" value="145ms" icon={Clock} />
                        <HeroMetric label="Error Rate" value="0.12%" icon={AlertCircle} />
                    </div>

                    <Panel title="System Metrics (24h)" icon={BarChart3} accentColor={THEME.warning}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.qps}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip content={<ChartTip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={THEME.warning}
                                    fill={THEME.warning}
                                    fillOpacity={0.3}
                                    name="Throughput"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'errorLog') {
            return (
                <Panel title="MySQL Error Log" icon={FileText} accentColor={THEME.warning}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        {demoData.errorLog.map((e, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '10px',
                                    paddingBottom: '10px',
                                    borderBottom:
                                        i < demoData.errorLog.length - 1 ? `1px solid ${THEME.glassBorder}` : 'none',
                                }}
                            >
                                <p
                                    style={{
                                        color: e.level === 'ERROR' ? THEME.danger : THEME.warning,
                                        marginBottom: '3px',
                                    }}
                                >
                                    [{e.level}] {e.timestamp}
                                </p>
                                <p>{e.message}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'generalLog') {
            return (
                <Panel title="General Query Log" icon={Code} accentColor={THEME.warning}>
                    <div
                        style={{
                            fontSize: '11px',
                            color: THEME.textMuted,
                            fontFamily: THEME.fontMono,
                            overflowX: 'auto',
                        }}
                    >
                        <pre
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                maxHeight: '350px',
                                overflow: 'auto',
                            }}
                        >
                            {`2024-01-15 14:23:45 app_user@[127.0.0.1] Query SELECT * FROM users WHERE id = 123
2024-01-15 14:23:46 app_user@[127.0.0.1] Query INSERT INTO logs (action) VALUES ('login')
2024-01-15 14:23:47 app_user@[127.0.0.1] Query SELECT COUNT(*) FROM orders
2024-01-15 14:23:48 readonly_user@[192.168.1.1] Query SELECT * FROM products LIMIT 10`}
                        </pre>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'perfInsights') {
            return (
                <Panel title="Performance Insights" icon={TrendingUp} accentColor={THEME.warning}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Top Wait Event</p>
                            <p>io/file/innodb/innodb_data_file (34% of load)</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Top SQL Statement</p>
                            <p>SELECT * FROM orders WHERE status = 'pending' (18% of load)</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Top Table</p>
                            <p>orders (42% of I/O operations)</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'statusPage') {
            return (
                <Panel title="System Status Summary" icon={CheckCircle} accentColor={THEME.success}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.success}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Overall Status</p>
                            <p style={{ color: THEME.success, fontSize: '16px', fontWeight: 'bold' }}>HEALTHY</p>
                        </div>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.success}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Uptime</p>
                            <p style={{ color: THEME.textMain, fontSize: '14px', fontWeight: 'bold' }}>72 days</p>
                        </div>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${THEME.success}`,
                            }}
                        >
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>Replication</p>
                            <p style={{ color: THEME.success, fontSize: '14px', fontWeight: 'bold' }}>IN SYNC</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        // DEVELOPER TOOLS SECTION
        if (sectionKey === 'developerTools' && itemKey === 'sqlEditor') {
            return (
                <Panel title="SQL Query Editor" icon={Code} accentColor={THEME.ai}>
                    <div style={{ fontSize: '11px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <pre
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                maxHeight: '350px',
                            }}
                        >
                            {`SELECT o.id, o.status, u.name, COUNT(t.id) as txn_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN transactions t ON o.id = t.order_id
WHERE o.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY o.id, o.status, u.name
ORDER BY txn_count DESC
LIMIT 100;`}
                        </pre>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'migrationTool') {
            return (
                <Panel title="Database Migration Tool" icon={GitBranch} accentColor={THEME.ai}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Migration #0042: Add orders_status_index
                            </p>
                            <p>Status: Applied | Date: 1d ago | Rollback: Supported</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Migration #0041: Alter transactions schema
                            </p>
                            <p>Status: Applied | Date: 3d ago | Rollback: Supported</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Migration #0040: Create audit_log table
                            </p>
                            <p>Status: Applied | Date: 5d ago | Rollback: Supported</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'importExport') {
            return (
                <Panel title="Data Import/Export" icon={Archive} accentColor={THEME.ai}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Recent Export: users_backup.sql
                            </p>
                            <p>Size: 2.4 MB | Rows: 123K | Date: 2h ago</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Recent Import: products_update.sql
                            </p>
                            <p>Size: 1.8 MB | Rows: 8420 | Status: Success</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Available Formats</p>
                            <p>SQL | CSV | JSON | Parquet</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'developerTools' && itemKey === 'tuningAdvisor') {
            return (
                <Panel title="AI Tuning Advisor" icon={Zap} accentColor={THEME.ai}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Recommendation: Add idx_orders_user_status
                            </p>
                            <p style={{ color: THEME.success }}>
                                Expected improvement: +28% query speed on status filters
                            </p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Recommendation: Increase buffer pool to 24GB
                            </p>
                            <p style={{ color: THEME.success }}>Expected improvement: +12% cache hit ratio</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Recommendation: Optimize innodb_flush_log_at_trx_commit
                            </p>
                            <p style={{ color: THEME.success }}>Expected improvement: +8% write throughput</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        return (
            <Panel title="No Content" icon={FileText}>
                Select an item from the sidebar.
            </Panel>
        );
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
