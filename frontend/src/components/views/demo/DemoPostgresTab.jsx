import React, { useMemo } from 'react';
import {
    Activity,
    Database,
    AlertCircle,
    Code,
    Lock,
    Eye,
    Zap,
    Wrench,
    LayoutDashboard,
    Network,
    Server,
    Package,
    TrendingUp,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    HardDrive,
    Cpu,
    Gauge,
    Shield,
    Terminal,
    BookOpen,
    GitBranch,
    Sparkles,
    Settings,
    Volume2,
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

function DemoPostgresTab({ tabId }) {
    useAdaptiveTheme();

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const base30d = generateChartData(30);

        return {
            clusterVelocity: base24h.map((d) => ({
                ...d,
                qps: Math.floor(1200 + Math.sin(d.index / 6) * 400 + Math.random() * 200),
                tps: Math.floor(850 + Math.cos(d.index / 6) * 300 + Math.random() * 150),
            })),
            connectionTrends: base24h.map((d) => ({
                ...d,
                active: Math.floor(45 + Math.sin(d.index / 8) * 15 + Math.random() * 10),
                idle: Math.floor(35 + Math.cos(d.index / 8) * 20 + Math.random() * 12),
            })),
            databaseList: [
                { name: 'production_db', size: '48.2 GB', connections: 23, txns: 1240, uptime: '45d' },
                { name: 'analytics_db', size: '32.5 GB', connections: 8, txns: 340, uptime: '45d' },
                { name: 'backup_db', size: '16.1 GB', connections: 2, txns: 12, uptime: '45d' },
                { name: 'test_db', size: '8.3 GB', connections: 1, txns: 2, uptime: '45d' },
            ],
            alertMetrics: { critical: 2, warning: 5, info: 12, resolved: 47 },
            alertTrends: base24h.map((d) => ({
                ...d,
                alerts: Math.floor(8 + Math.sin(d.index / 7) * 4 + Math.random() * 3),
            })),
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
            queryDist: base24h.map((d) => ({
                ...d,
                select: Math.floor(400 + Math.random() * 300),
                insert: Math.floor(150 + Math.random() * 100),
                update: Math.floor(120 + Math.random() * 80),
                delete: Math.floor(30 + Math.random() * 20),
            })),
            bloatAnalysis: [
                { table: 'orders', bloat: 32, size: '12.4 GB' },
                { table: 'users', bloat: 18, size: '2.1 GB' },
                { table: 'transactions', bloat: 45, size: '8.9 GB' },
            ],
            schemaStats: [
                { object: 'Tables', count: 124 },
                { object: 'Views', count: 38 },
                { object: 'Functions', count: 67 },
                { object: 'Triggers', count: 42 },
            ],
            tableSizes: [
                { name: 'orders', size: 12.4 },
                { name: 'users', size: 2.1 },
                { name: 'transactions', size: 8.9 },
                { name: 'products', size: 1.8 },
                { name: 'audit_log', size: 3.2 },
            ],
            poolMetrics: { available: 78, waiting: 2, active: 20, max: 100 },
            poolTrends: base24h.map((d) => ({
                ...d,
                utilization: Math.floor(18 + Math.sin(d.index / 6) * 8 + Math.random() * 6),
            })),
            replicationLag: base24h.map((d) => ({
                ...d,
                replica1: Math.floor(2.5 + Math.random() * 2),
                replica2: Math.floor(2.3 + Math.random() * 1.8),
            })),
            backupHistory: [
                { name: 'Full #142', size: '48.2 GB', duration: '2h 34m', date: '2h ago', status: 'Success' },
                { name: 'Incr #143', size: '2.1 GB', duration: '12m', date: '1h ago', status: 'Success' },
                { name: 'Full #141', size: '48.2 GB', duration: '2h 28m', date: '1d ago', status: 'Success' },
            ],
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

    const renderContent = (sectionKey, itemKey) => {
        if (sectionKey === 'overview' && itemKey === 'executive') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <StatusBadge status="operational" label="Operational" />
                        <StatusBadge status="active" label="Production" />
                        <StatusBadge status="default" label="PostgreSQL 16.2" />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Uptime" value="63" unit="days" icon={Clock} />
                        <HeroMetric label="Active Sessions" value="52" unit="/ 100" icon={Activity} />
                        <HeroMetric label="Cache Hit Ratio" value="99.4" unit="%" icon={Zap} trend="up" />
                        <HeroMetric label="Database Size" value="148" unit="GB" icon={HardDrive} />
                        <HeroMetric label="Long Transactions" value="3" unit="active" icon={Clock} />
                        <HeroMetric label="Urgent Vacuums" value="5" unit="pending" icon={Wrench} trend="up" />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        <Panel title="Cluster Velocity" icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={demoData.clusterVelocity}>
                                    <defs>
                                        <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME.secondary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: THEME.glass,
                                            border: `1px solid ${THEME.glassBorder}`,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="qps"
                                        stroke={THEME.primary}
                                        fillOpacity={1}
                                        fill="url(#colorQps)"
                                        name="QPS"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="tps"
                                        stroke={THEME.secondary}
                                        fillOpacity={1}
                                        fill="url(#colorTps)"
                                        name="TPS"
                                    />
                                    <Legend />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Database Health" icon={Gauge}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <RingGauge value={99.4} max={100} label="Cache Hit" unit="%" />
                                <RingGauge value={97.2} max={100} label="Index Hit" unit="%" />
                                <RingGauge value={0.01} max={1} label="Deadlock" unit="%" />
                            </div>
                        </Panel>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <Panel title="Last Backup" icon={HardDrive}>
                            <div style={{ fontSize: '14px', color: THEME.textMuted }}>
                                <p>
                                    <strong>Full Backup #142</strong>
                                </p>
                                <p>Size: 48.2 GB | Duration: 2h 34m</p>
                                <p style={{ color: THEME.success, marginTop: '8px' }}>✓ Success</p>
                            </div>
                        </Panel>
                        <Panel title="Long-Running Transactions" icon={Clock}>
                            <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                                <div>txid: 12450 | Duration: 2h 15m</div>
                                <div style={{ color: THEME.warning, marginTop: '4px' }}>⚠ Blocking</div>
                            </div>
                        </Panel>
                        <Panel title="Vacuum Health" icon={Wrench}>
                            <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                                <p>Last run: 45m ago | Duration: 8m 23s</p>
                                <p style={{ color: THEME.success, marginTop: '8px' }}>✓ Healthy</p>
                            </div>
                        </Panel>
                    </div>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'connections') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric label="Active" value="52" unit="connections" icon={Activity} />
                        <HeroMetric label="Idle" value="18" unit="connections" icon={Clock} />
                        <HeroMetric label="Waiting" value="2" unit="connections" icon={AlertCircle} />
                        <HeroMetric label="Max" value="100" unit="limit" icon={Gauge} />
                    </div>
                    <Panel title="Connection Trends (24h)" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={demoData.connectionTrends}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    stroke={THEME.primary}
                                    fill="url(#colorActive)"
                                    name="Active Connections"
                                />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'serverinfo') {
            return (
                <Panel title="Server Information" icon={Server}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
                        <div>
                            <p style={{ color: THEME.textMuted }}>PostgreSQL Version</p>
                            <p style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px' }}>16.2.1</p>
                            <p style={{ color: THEME.textMuted }}>Uptime</p>
                            <p style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px' }}>
                                63 days, 4 hours
                            </p>
                            <p style={{ color: THEME.textMuted }}>Max Connections</p>
                            <p style={{ color: THEME.textMain, fontSize: '16px' }}>100</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMuted }}>Data Directory</p>
                            <p
                                style={{
                                    color: THEME.textMain,
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                    fontFamily: THEME.fontMono,
                                }}
                            >
                                /var/lib/postgresql/16/main
                            </p>
                            <p style={{ color: THEME.textMuted }}>WAL Level</p>
                            <p style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px' }}>logical</p>
                            <p style={{ color: THEME.textMuted }}>SSL Status</p>
                            <p style={{ color: THEME.success, fontSize: '16px' }}>✓ Enabled</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'databases') {
            return (
                <Panel title="Databases" icon={Package}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Size</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Conns</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Txns</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Uptime
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.databaseList.map((db, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{db.name}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.size}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.connections}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.txns}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{db.uptime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'overview' && itemKey === 'perfsnap') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <RingGauge value={99.4} max={100} label="Cache Hit" unit="%" />
                        <RingGauge value={97.2} max={100} label="Index Hit" unit="%" />
                        <RingGauge value={0.01} max={1} label="Deadlock Rate" unit="%" />
                    </div>
                    <Panel title="Performance Metrics (24h)" icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.clusterVelocity}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="qps"
                                    stroke={THEME.primary}
                                    fill={THEME.primary}
                                    fillOpacity={0.3}
                                    name="QPS"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'active') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric
                            label="Critical"
                            value={String(demoData.alertMetrics.critical)}
                            unit="alerts"
                            icon={AlertTriangle}
                        />
                        <HeroMetric
                            label="Warning"
                            value={String(demoData.alertMetrics.warning)}
                            unit="alerts"
                            icon={AlertCircle}
                        />
                        <HeroMetric label="Info" value={String(demoData.alertMetrics.info)} unit="alerts" icon={Info} />
                        <HeroMetric
                            label="Resolved"
                            value={String(demoData.alertMetrics.resolved)}
                            unit="alerts"
                            icon={CheckCircle}
                        />
                    </div>
                    <Panel title="Alert Trend (24h)" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={demoData.alertTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Line type="monotone" dataKey="alerts" stroke={THEME.warning} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'rules') {
            return (
                <Panel title="Alert Rules Configuration" icon={AlertCircle}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Cache Hit Ratio &lt; 95%</p>
                            <p>Action: Email notification</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Connection Pool &gt; 80%</p>
                            <p>Action: Slack alert</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Query Duration &gt; 5s</p>
                            <p>Action: Log event</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'alerts' && itemKey === 'corr') {
            return (
                <Panel title="Alert Correlation" icon={Activity}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>High CPU + Slow Queries</p>
                            <p>Correlation: 87%</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>Connection Spike + Cache Miss</p>
                            <p>Correlation: 72%</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>Low Disk Space + Vacuum</p>
                            <p>Correlation: 94%</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'query' && itemKey === 'optimizer') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Panel title="Slow Queries" icon={Code}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Query
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            ms
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                            Calls
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
                                                    fontSize: '11px',
                                                }}
                                            >
                                                {q.query.slice(0, 35)}...
                                            </td>
                                            <td style={{ padding: '8px', color: THEME.textMuted }}>{q.duration}</td>
                                            <td style={{ padding: '8px', color: THEME.textMuted }}>{q.calls}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Query Distribution (24h)" icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={demoData.queryDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="select"
                                    stackId="1"
                                    stroke={THEME.primary}
                                    fill={THEME.primary}
                                    fillOpacity={0.6}
                                    name="SELECT"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="insert"
                                    stackId="1"
                                    stroke={THEME.secondary}
                                    fill={THEME.secondary}
                                    fillOpacity={0.6}
                                    name="INSERT"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="update"
                                    stackId="1"
                                    stroke={THEME.success}
                                    fill={THEME.success}
                                    fillOpacity={0.6}
                                    name="UPDATE"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="delete"
                                    stackId="1"
                                    stroke={THEME.danger}
                                    fill={THEME.danger}
                                    fillOpacity={0.6}
                                    name="DELETE"
                                />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'query' && itemKey === 'plans') {
            return (
                <Panel title="Query Execution Plans" icon={Code}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <pre
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                maxHeight: '400px',
                            }}
                        >
                            {`Seq Scan on orders (cost=0.00..15234.50 rows=50000)
  Filter: (status = 'shipped')
  Planning: 0.187 ms | Execution: 2340 ms

Index Scan using users_pkey on users (cost=0.29..8.31 rows=1)
  Index Cond: (id = 12345) | Loops: 8420
  Planning: 0.045 ms | Execution: 156 ms`}
                        </pre>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'query' && itemKey === 'regdet') {
            return (
                <Panel title="Regression Detector" icon={TrendingUp}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <p style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
                                Baseline (Last Week)
                            </p>
                            <p style={{ color: THEME.textMain, fontSize: '18px' }}>1840 ms</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
                                Current (This Week)
                            </p>
                            <p style={{ color: THEME.danger, fontSize: '18px' }}>2340 ms (↑ 27%)</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'query' && itemKey === 'idxadv') {
            return (
                <Panel title="Index Advisor" icon={Zap}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Missing: idx_orders_status</p>
                            <p>Estimated speedup: 12x on status filter</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>
                                Unused: idx_users_created_unused
                            </p>
                            <p style={{ color: THEME.warning }}>Free 245 MB by dropping</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'query' && itemKey === 'bloat') {
            return (
                <Panel title="Table Bloat Analysis" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={demoData.bloatAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis dataKey="table" stroke={THEME.textMuted} />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: THEME.glass,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            />
                            <Bar dataKey="bloat" fill={THEME.warning} name="Bloat %" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'query' && itemKey === 'tblstat') {
            return (
                <Panel title="Table Statistics" icon={BarChart3}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>orders table</p>
                            <p>Sequential: 234 | Index: 8420 | Dead tuples: 12,345</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>users table</p>
                            <p>Sequential: 12 | Index: 2340 | Dead tuples: 45</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'tree') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Panel title="Schema Objects" icon={Package}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '12px',
                            }}
                        >
                            {demoData.schemaStats.map((stat, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: THEME.glass,
                                        padding: '12px',
                                        borderRadius: '6px',
                                        borderLeft: `3px solid ${THEME.primary}`,
                                    }}
                                >
                                    <p style={{ color: THEME.textMuted, fontSize: '12px' }}>{stat.object}</p>
                                    <p style={{ color: THEME.textMain, fontSize: '20px', fontWeight: 'bold' }}>
                                        {stat.count}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Largest Tables by Size" icon={HardDrive}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={demoData.tableSizes}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <XAxis dataKey="name" stroke={THEME.textMuted} />
                                <YAxis
                                    stroke={THEME.textMuted}
                                    label={{ value: 'Size (GB)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Bar dataKey="size" fill={THEME.secondary} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'visualizer') {
            return (
                <Panel title="Schema Entity Relationship" icon={Network}>
                    <div style={{ padding: '20px', textAlign: 'center', color: THEME.textMuted, fontSize: '14px' }}>
                        <p>Entity Relationship Diagram</p>
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '16px',
                                backgroundColor: THEME.glass,
                                borderRadius: '6px',
                            }}
                        >
                            <div>users ↔ orders ↔ products</div>
                            <div style={{ marginTop: '8px', fontSize: '12px' }}>+ payments, shipments, audit_log</div>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'deps') {
            return (
                <Panel title="Foreign Key Dependencies" icon={GitBranch}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>orders.user_id → users.id</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>orders.product_id → products.id</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>payments.order_id → orders.id</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>shipments.order_id → orders.id</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'schema' && itemKey === 'chartbldr') {
            return (
                <Panel title="Custom Chart Builder" icon={BarChart3}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <p style={{ marginBottom: '12px' }}>Build visualizations from any query</p>
                        <div
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '12px',
                            }}
                        >
                            <p
                                style={{
                                    color: THEME.textMain,
                                    fontSize: '12px',
                                    marginBottom: '8px',
                                    fontFamily: THEME.fontMono,
                                }}
                            >
                                SELECT DATE(created_at), COUNT(*)
                                <br />
                                FROM orders GROUP BY DATE(created_at)
                            </p>
                        </div>
                        <p style={{ color: THEME.success }}>✓ Chart with 365 data points</p>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'pool') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <HeroMetric
                            label="Available"
                            value={String(demoData.poolMetrics.available)}
                            unit="connections"
                            icon={CheckCircle}
                        />
                        <HeroMetric
                            label="Active"
                            value={String(demoData.poolMetrics.active)}
                            unit="connections"
                            icon={Activity}
                        />
                        <HeroMetric
                            label="Waiting"
                            value={String(demoData.poolMetrics.waiting)}
                            unit="connections"
                            icon={Clock}
                        />
                        <HeroMetric label="Max" value={String(demoData.poolMetrics.max)} unit="limit" icon={Gauge} />
                    </div>
                    <Panel title="Pool Utilization (24h)" icon={Gauge}>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={demoData.poolTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: THEME.glass,
                                        border: `1px solid ${THEME.glassBorder}`,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="utilization"
                                    stroke={THEME.primary}
                                    fill={THEME.primary}
                                    fillOpacity={0.3}
                                    name="Utilization %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'repl') {
            return (
                <Panel title="Replication Status" icon={Network}>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={demoData.replicationLag}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis dataKey="index" stroke={THEME.textMuted} />
                            <YAxis
                                stroke={THEME.textMuted}
                                label={{ value: 'Lag (ms)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: THEME.glass,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="replica1"
                                stroke={THEME.primary}
                                name="Replica 1"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="replica2"
                                stroke={THEME.secondary}
                                name="Replica 2"
                                strokeWidth={2}
                            />
                            <Legend />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'checkpoint') {
            return (
                <Panel title="Checkpoint Activity" icon={Clock}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain, marginBottom: '4px' }}>Last Checkpoint</p>
                            <p>Duration: 2m 34s | Size: 12.4 GB</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMuted }}>Interval: 5 minutes</p>
                            <p style={{ color: THEME.success, marginTop: '8px' }}>✓ Healthy</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'maint') {
            return (
                <Panel title="Maintenance Schedule" icon={Wrench}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>VACUUM: Daily 02:00 UTC</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>ANALYZE: Daily 03:00 UTC</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>REINDEX: Weekly Sunday 04:00</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success }}>✓ All jobs on schedule</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'cap') {
            return (
                <Panel title="Capacity Planning" icon={HardDrive}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
                        <div>
                            <p style={{ color: THEME.textMuted }}>Current Used</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', marginBottom: '12px' }}>148 GB</p>
                            <p style={{ color: THEME.textMuted }}>Growth Rate</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px' }}>2.3 GB/week</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMuted }}>Total Disk</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px', marginBottom: '12px' }}>500 GB</p>
                            <p style={{ color: THEME.textMain }}>Full in: 148 days</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'infra' && itemKey === 'backup') {
            return (
                <Panel title="Backup History" icon={HardDrive}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        {demoData.backupHistory.map((backup, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom:
                                        i < demoData.backupHistory.length - 1
                                            ? `1px solid ${THEME.glassBorder}`
                                            : 'none',
                                }}
                            >
                                <p style={{ color: THEME.textMain }}>{backup.name}</p>
                                <p>
                                    {backup.size} | {backup.duration} | {backup.date}
                                </p>
                                <p style={{ color: THEME.success }}>✓ {backup.status}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'ssl') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <RingGauge value={demoData.sslRatio} max={100} label="SSL Connections" unit="%" />
                    <Panel title="Certificate Details" icon={Shield}>
                        <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                            <div style={{ marginBottom: '8px' }}>
                                <p style={{ color: THEME.textMuted }}>Issuer</p>
                                <p style={{ color: THEME.textMain }}>Let's Encrypt</p>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <p style={{ color: THEME.textMuted }}>Valid Until</p>
                                <p style={{ color: THEME.textMain }}>2026-06-15</p>
                            </div>
                            <div>
                                <p style={{ color: THEME.textMuted }}>Protocol</p>
                                <p style={{ color: THEME.textMain }}>TLS 1.3</p>
                            </div>
                        </div>
                    </Panel>
                </div>
            );
        }

        if (sectionKey === 'security' && itemKey === 'roles') {
            return (
                <Panel title="Roles & Privileges" icon={Lock}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>Conns</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: THEME.textMuted }}>
                                        Privileges
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {demoData.roleStats.map((role, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        <td style={{ padding: '8px', color: THEME.textMain }}>{role.role}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{role.conns}</td>
                                        <td style={{ padding: '8px', color: THEME.textMuted }}>{role.perms}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'audit') {
            return (
                <Panel title="Audit Log" icon={Eye}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        {demoData.auditEvents.map((event, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '10px',
                                    paddingBottom: '10px',
                                    borderBottom:
                                        i < demoData.auditEvents.length - 1 ? `1px solid ${THEME.glassBorder}` : 'none',
                                }}
                            >
                                <p style={{ color: THEME.textMain }}>
                                    {event.event} by {event.user}
                                </p>
                                <p>
                                    {event.time} - {event.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'security' && itemKey === 'rls') {
            return (
                <Panel title="Row-Level Security Policies" icon={Shield}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>orders - authenticated_users</p>
                            <p>SELECT: user_id = current_user_id</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>users - public_profile</p>
                            <p>SELECT: public = true</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success }}>✓ 2 policies active</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'hub') {
            return (
                <Panel title="Observability Hub" icon={Eye}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        <div style={{ backgroundColor: THEME.glass, padding: '16px', borderRadius: '6px' }}>
                            <p style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>Metrics</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px' }}>2.4K/s</p>
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>data points</p>
                        </div>
                        <div style={{ backgroundColor: THEME.glass, padding: '16px', borderRadius: '6px' }}>
                            <p style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>Logs</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px' }}>542K/h</p>
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>events</p>
                        </div>
                        <div style={{ backgroundColor: THEME.glass, padding: '16px', borderRadius: '6px' }}>
                            <p style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>Traces</p>
                            <p style={{ color: THEME.textMain, fontSize: '18px' }}>84K/h</p>
                            <p style={{ color: THEME.textMuted, fontSize: '11px' }}>spans</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'cloudwatch') {
            return (
                <Panel title="AWS CloudWatch Integration" icon={Gauge}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>RDS CPU Utilization</p>
                            <p>Current: 34% | Max (24h): 67%</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>RDS Network In/Out</p>
                            <p>IN: 2.3 MB/s | OUT: 1.8 MB/s</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success }}>✓ Synced 45s ago</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'logs') {
            return (
                <Panel title="Log Pattern Detection" icon={Activity}>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={demoData.logPatterns}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} />
                            <XAxis dataKey="pattern" stroke={THEME.textMuted} angle={-15} height={60} />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: THEME.glass,
                                    border: `1px solid ${THEME.glassBorder}`,
                                }}
                            />
                            <Bar dataKey="frequency" fill={THEME.warning} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'otel') {
            return (
                <Panel title="OpenTelemetry Configuration" icon={Sparkles}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <pre
                            style={{
                                backgroundColor: THEME.glass,
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                            }}
                        >
                            {`exporter: jaeger
endpoint: localhost:14268
sampling_rate: 0.1
batch_size: 512
trace_attributes:
  service.name: postgresql
  service.version: 16.2`}
                        </pre>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'kube') {
            return (
                <Panel title="Kubernetes Monitoring" icon={Cpu}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>Pod: pg-primary-0</p>
                            <p>CPU: 340m / 2000m | Memory: 2.4 Gi / 4 Gi</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success }}>✓ All pods healthy</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'status') {
            return (
                <Panel title="Status Page Overview" icon={CheckCircle}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.success }}>✓ Database: Operational</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.success }}>✓ API: Operational</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.success }}>✓ Backups: Operational</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>Uptime (30d): 99.98%</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'observability' && itemKey === 'aimon') {
            return (
                <Panel title="AI Monitoring" icon={Sparkles}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>Anomaly Detection</p>
                            <p>12 anomalies detected in 24h</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>Predictive Alerts</p>
                            <p style={{ color: THEME.warning }}>Disk usage exceeds 400GB in 4 days</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'tools' && itemKey === 'console') {
            return (
                <Panel title="SQL Console" icon={Terminal}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <p style={{ marginBottom: '12px', color: THEME.textMain }}>Recent Queries:</p>
                        {demoData.recentQueries.map((q, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '10px',
                                    paddingBottom: '10px',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}
                            >
                                <p style={{ color: THEME.primary, fontSize: '11px' }}>{q.query.slice(0, 50)}...</p>
                                <p style={{ color: THEME.textMuted, fontSize: '11px' }}>{q.time}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'tools' && itemKey === 'apiex') {
            return (
                <Panel title="API Explorer" icon={BookOpen}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.primary }}>GET /api/databases</p>
                            <p>Returns list of databases with stats</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.secondary }}>POST /api/query</p>
                            <p>Execute custom SQL query</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.success }}>GET /api/health</p>
                            <p>Database health status endpoint</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'tools' && itemKey === 'repo') {
            return (
                <Panel title="Migration Repository" icon={GitBranch}>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>v1.4.2 - 2026-03-20</p>
                            <p>Add user_preferences table</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.textMain }}>v1.4.1 - 2026-03-15</p>
                            <p>Index optimization on orders</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.textMain }}>v1.4.0 - 2026-03-10</p>
                            <p>Add RLS policies</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        if (sectionKey === 'tools' && itemKey === 'aiadv') {
            return (
                <Panel title="AI Advisor" icon={Sparkles}>
                    <div style={{ fontSize: '13px', color: THEME.textMuted }}>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.primary }}>Idea: Query Optimization</p>
                            <p>Add index on orders.status for 12x speedup</p>
                        </div>
                        <div
                            style={{
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                            }}
                        >
                            <p style={{ color: THEME.primary }}>Idea: Schema Insight</p>
                            <p>45GB table bloat detected - run VACUUM</p>
                        </div>
                        <div>
                            <p style={{ color: THEME.primary }}>Idea: Performance</p>
                            <p>Connection pool at 87% - consider scaling</p>
                        </div>
                    </div>
                </Panel>
            );
        }

        return <div style={{ color: THEME.textMain }}>Select an item</div>;
    };

    const sections = [
        {
            key: 'overview',
            label: 'Overview',
            icon: Activity,
            accent: THEME.primary,
            items: [
                { key: 'executive', label: 'Executive Dashboard', icon: LayoutDashboard },
                { key: 'connections', label: 'Connections', icon: Network },
                { key: 'serverinfo', label: 'Server Info', icon: Server },
                { key: 'databases', label: 'Databases', icon: Package },
                { key: 'perfsnap', label: 'Performance Snapshot', icon: TrendingUp },
            ],
        },
        {
            key: 'alerts',
            label: 'Alerts & Rules',
            icon: AlertCircle,
            accent: THEME.danger,
            items: [
                { key: 'active', label: 'Active Alerts', icon: AlertTriangle },
                { key: 'rules', label: 'Alert Rules', icon: Settings },
                { key: 'corr', label: 'Alert Correlation', icon: Network },
            ],
        },
        {
            key: 'query',
            label: 'Query Analysis',
            icon: Code,
            accent: THEME.secondary,
            items: [
                { key: 'optimizer', label: 'Query Optimizer', icon: Zap },
                { key: 'plans', label: 'Query Plans', icon: Code },
                { key: 'regdet', label: 'Regression Detector', icon: TrendingUp },
                { key: 'idxadv', label: 'Index Advisor', icon: Zap },
                { key: 'bloat', label: 'Bloat Analyzer', icon: BarChart3 },
                { key: 'tblstat', label: 'Table Stats', icon: Package },
            ],
        },
        {
            key: 'schema',
            label: 'Schema & Data',
            icon: Package,
            accent: THEME.primary,
            items: [
                { key: 'tree', label: 'Schema Tree', icon: Package },
                { key: 'visualizer', label: 'Schema Visualizer', icon: Network },
                { key: 'deps', label: 'Table Dependencies', icon: GitBranch },
                { key: 'chartbldr', label: 'Chart Builder', icon: BarChart3 },
            ],
        },
        {
            key: 'infra',
            label: 'Infrastructure',
            icon: Cpu,
            accent: THEME.warning,
            items: [
                { key: 'pool', label: 'Connection Pool', icon: Network },
                { key: 'repl', label: 'Replication', icon: Volume2 },
                { key: 'checkpoint', label: 'Checkpoints', icon: Clock },
                { key: 'maint', label: 'Maintenance', icon: Wrench },
                { key: 'cap', label: 'Capacity', icon: HardDrive },
                { key: 'backup', label: 'Backups', icon: HardDrive },
            ],
        },
        {
            key: 'security',
            label: 'Security',
            icon: Lock,
            accent: THEME.ai,
            items: [
                { key: 'ssl', label: 'SSL/TLS Status', icon: Shield },
                { key: 'roles', label: 'Roles & Privileges', icon: Lock },
                { key: 'audit', label: 'Audit Log', icon: Eye },
                { key: 'rls', label: 'Row-Level Security', icon: Shield },
            ],
        },
        {
            key: 'observability',
            label: 'Observability',
            icon: Eye,
            accent: THEME.secondary,
            items: [
                { key: 'hub', label: 'Observability Hub', icon: Eye },
                { key: 'cloudwatch', label: 'CloudWatch', icon: Gauge },
                { key: 'logs', label: 'Log Patterns', icon: Activity },
                { key: 'otel', label: 'OpenTelemetry', icon: Sparkles },
                { key: 'kube', label: 'Kubernetes', icon: Cpu },
                { key: 'status', label: 'Status Page', icon: CheckCircle },
                { key: 'aimon', label: 'AI Monitoring', icon: Sparkles },
            ],
        },
        {
            key: 'tools',
            label: 'Developer Tools',
            icon: Wrench,
            accent: THEME.success,
            items: [
                { key: 'console', label: 'SQL Console', icon: Terminal },
                { key: 'apiex', label: 'API Explorer', icon: BookOpen },
                { key: 'repo', label: 'Repository', icon: GitBranch },
                { key: 'aiadv', label: 'AI Advisor', icon: Sparkles },
            ],
        },
    ];

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
