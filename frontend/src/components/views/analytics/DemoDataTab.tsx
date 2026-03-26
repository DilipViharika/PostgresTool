import React, { FC } from 'react';
import { THEME } from '../../../utils/theme';
import {
    Database, Activity, Zap, Clock, HardDrive, Shield,
    ArrowUpRight, ArrowDownRight, Leaf, Hourglass,
    CheckCircle, AlertTriangle, Server, Cpu, Network,
    BarChart3, Lock, Globe, ChevronDown, GitBranch,
    Gauge, Layers, Radio, Eye, Code,
    TrendingUp, RefreshCw, Archive, Users, Cloud, Bell,
    FileSearch, Link2, Radar, Container, Brain, Terminal,
    Star, CalendarCheck, LayoutDashboard
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid, PieChart, Pie, Cell,
    BarChart, Bar, LineChart, Line, ReferenceLine, Legend
} from 'recharts';

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface KPI {
    label: string;
    value: string | number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    sparkline: number[];
}

interface Metric {
    label: string;
    value: string | number;
    unit: string;
}

interface Tab {
    name: string;
    metrics: Metric[];
}

interface Section {
    id: string;
    name: string;
    tabs: Tab[];
}

interface DatabaseConfig {
    name: string;
    color: string;
    icon: React.ComponentType<any>;
    kpis: KPI[];
    sections: Section[];
}

interface DemoDataStructure {
    postgresql: DatabaseConfig;
    mongodb?: DatabaseConfig;
    mysql?: DatabaseConfig;
}

/* ── DATABASE COLORS ───────────────────────────────────────────────────── */
const DB_COLORS = {
    postgresql: '#6495ED',
    mysql: '#00B4D8',
    mongodb: '#2EE89C',
};

/* ── DEMO DATA STRUCTURE ───────────────────────────────────────────────── */
const DATABASE_STRUCTURE: DemoDataStructure = {
    postgresql: {
        name: 'PostgreSQL',
        color: DB_COLORS.postgresql,
        icon: Database,
        kpis: [
            { label: 'TPS', value: '1,247', unit: '/s', status: 'healthy', sparkline: [1100, 1200, 1150, 1300, 1400, 1250, 1200] },
            { label: 'Cache Hit', value: '99.2', unit: '%', status: 'healthy', sparkline: [98, 98.5, 99, 99.1, 99.2, 99.1, 99.2] },
            { label: 'Connections', value: '42', unit: '', status: 'healthy', sparkline: [38, 40, 39, 42, 41, 42, 42] },
            { label: 'Uptime', value: '47d', unit: '12h', status: 'healthy', sparkline: [30, 35, 40, 45, 46, 47, 47] },
            { label: 'DB Size', value: '14.8', unit: 'GB', status: 'warning', sparkline: [10, 11, 12, 13, 14, 14.5, 14.8] },
        ],
        sections: [
            {
                id: 'core',
                name: 'Engine Health',
                tabs: [
                    { name: 'Overview', metrics: [{ label: 'QPS', value: '1,247', unit: '/s' }, { label: 'Commits', value: '98.5', unit: '%' }, { label: 'Rollbacks', value: '0.2', unit: '%' }, { label: 'Uptime', value: '47', unit: 'days' }, { label: 'WAL Generation Rate', value: '45', unit: 'MB/s' }, { label: 'Temp Files Created', value: '23', unit: '/hour' }, { label: 'Deadlocks', value: '0', unit: '/day' }, { label: 'Tuple Insert Rate', value: '12,450', unit: '/s' }] },
                    { name: 'Performance', metrics: [{ label: 'Avg Query Time', value: '2.3', unit: 'ms' }, { label: 'Slow Queries', value: '12', unit: '' }, { label: 'Query Count', value: '18,450', unit: '/hour' }, { label: 'P95 Latency', value: '5.8', unit: 'ms' }, { label: 'Tuple Update Rate', value: '3,200', unit: '/s' }, { label: 'Tuple Delete Rate', value: '890', unit: '/s' }] },
                    { name: 'Resources', metrics: [{ label: 'CPU Usage', value: '34', unit: '%' }, { label: 'Memory Usage', value: '62', unit: '%' }, { label: 'Disk I/O', value: '245', unit: 'MB/s' }, { label: 'Swap Usage', value: '0', unit: 'MB' }, { label: 'Live Tuples', value: '45.2M', unit: '' }, { label: 'Dead Tuples', value: '23K', unit: '' }] },
                    { name: 'Reliability', metrics: [{ label: 'Error Rate', value: '0.01', unit: '%' }, { label: 'Failed Transactions', value: '0', unit: '/hour' }, { label: 'Recovery Time', value: '2.1', unit: 's' }, { label: 'Availability', value: '99.99', unit: '%' }] },
                    { name: 'Alerts', metrics: [{ label: 'Active Alerts', value: '0', unit: '' }, { label: 'Total Rules', value: '34', unit: '' }, { label: 'Triggered Today', value: '2', unit: '' }, { label: 'Avg Response', value: '5', unit: 'mins' }] },
                ]
            },
            {
                id: 'query',
                name: 'Query Intelligence',
                tabs: [
                    { name: 'Query Optimizer', metrics: [{ label: 'Index Scans', value: '89', unit: '%' }, { label: 'Sequential Scans', value: '11', unit: '%' }, { label: 'Avg Cost', value: '245.7', unit: 'units' }, { label: 'Plans Cached', value: '8,234', unit: '' }, { label: 'Query Plan Cache Hit', value: '87.3', unit: '%' }, { label: 'Parallel Query Workers', value: '4', unit: '' }] },
                    { name: 'Indexes', metrics: [{ label: 'Total Indexes', value: '342', unit: '' }, { label: 'Unused Indexes', value: '23', unit: '' }, { label: 'Bloated Indexes', value: '5', unit: '' }, { label: 'Index Hit Ratio', value: '94.2', unit: '%' }] },
                    { name: 'Plan Regression', metrics: [{ label: 'Plan Changes', value: '3', unit: '' }, { label: 'Regressions', value: '0', unit: '' }, { label: 'Performance Delta', value: '+2.1', unit: '%' }, { label: 'Last Analyzed', value: '15', unit: 'mins' }] },
                    { name: 'Bloat Analysis', metrics: [{ label: 'Bloated Tables', value: '8', unit: '' }, { label: 'Total Bloat', value: '234', unit: 'MB' }, { label: 'Bloat Ratio', value: '12.3', unit: '%' }, { label: 'Vacuum Needed', value: '3', unit: '' }] },
                    { name: 'Table Analysis', metrics: [{ label: 'Total Tables', value: '567', unit: '' }, { label: 'Analyzed', value: '98.2', unit: '%' }, { label: 'Autovacuum Runs', value: '456', unit: '/day' }, { label: 'Last Analyze', value: '2', unit: 'hours' }, { label: 'Hash Join Efficiency', value: '92.1', unit: '%' }, { label: 'Sort Operations', value: '1,234', unit: '/hour' }] },
                ]
            },
            {
                id: 'infra',
                name: 'Infrastructure & HA',
                tabs: [
                    { name: 'Connection Pool', metrics: [{ label: 'Active Conn', value: '42', unit: '' }, { label: 'Idle Conn', value: '8', unit: '' }, { label: 'Max Pool Size', value: '100', unit: '' }, { label: 'Pool Efficiency', value: '95.3', unit: '%' }, { label: 'Connection Wait Time', value: '0.5', unit: 'ms' }, { label: 'pgBouncer Queue', value: '0', unit: '' }] },
                    { name: 'Replication & WAL', metrics: [{ label: 'WAL Level', value: 'replica', unit: '' }, { label: 'Replication Lag', value: '0.3', unit: 'ms' }, { label: 'WAL Files', value: '42', unit: '' }, { label: 'Archiving Status', value: 'active', unit: '' }, { label: 'Streaming Replicas', value: '2', unit: '' }, { label: 'Logical Slots', value: '3', unit: '' }, { label: 'WAL Retention', value: '2', unit: 'GB' }] },
                    { name: 'Checkpoint Monitor', metrics: [{ label: 'Checkpoints/Day', value: '288', unit: '' }, { label: 'Checkpoint Duration', value: '12.5', unit: 's' }, { label: 'Avg Interval', value: '300', unit: 's' }, { label: 'Last Checkpoint', value: '45', unit: 's ago' }] },
                    { name: 'Vacuum & Maintenance', metrics: [{ label: 'Vacuum Runs/Day', value: '576', unit: '' }, { label: 'Analyze Runs', value: '288', unit: '/day' }, { label: 'Dead Tuples Removed', value: '234K', unit: '/day' }, { label: 'Avg Runtime', value: '2.3', unit: 's' }] },
                    { name: 'Capacity Planning', metrics: [{ label: 'DB Size Growth', value: '2.1', unit: 'GB/week' }, { label: 'Projected Size', value: '45.2', unit: 'GB/90d' }, { label: 'Tablespace Util', value: '62.1', unit: '%' }, { label: 'Estimated Time Full', value: '180', unit: 'days' }] },
                    { name: 'Backup & Recovery', metrics: [{ label: 'Last Backup', value: '1', unit: 'hour' }, { label: 'Backup Size', value: '8.9', unit: 'GB' }, { label: 'Restore Time Est', value: '12', unit: 'mins' }, { label: 'Backup Status', value: 'healthy', unit: '' }] },
                ]
            },
            {
                id: 'schema',
                name: 'Data Governance',
                tabs: [
                    { name: 'Schema & Migrations', metrics: [{ label: 'Tables', value: '234', unit: '' }, { label: 'Views', value: '89', unit: '' }, { label: 'Pending Migrations', value: '0', unit: '' }, { label: 'Last Migration', value: '3', unit: 'days' }] },
                    { name: 'Schema Visualizer', metrics: [{ label: 'Relations', value: '456', unit: '' }, { label: 'Foreign Keys', value: '178', unit: '' }, { label: 'Constraints', value: '234', unit: '' }, { label: 'Triggers', value: '42', unit: '' }] },
                    { name: 'Security & Compliance', metrics: [{ label: 'Roles', value: '18', unit: '' }, { label: 'Policies', value: '23', unit: '' }, { label: 'Audit Events', value: '12,450', unit: '/day' }, { label: 'Failed Auth', value: '0', unit: '' }, { label: 'RLS Policies', value: '12', unit: '' }, { label: 'Column Encryption', value: '8', unit: 'tables' }, { label: 'SSL Connections', value: '100', unit: '%' }, { label: 'pg_audit Events', value: '5,600', unit: '/day' }] },
                ]
            },
            {
                id: 'observability',
                name: 'Platform Observability',
                tabs: [
                    { name: 'CloudWatch', metrics: [{ label: 'Metrics', value: '124', unit: '' }, { label: 'Alarms Active', value: '0', unit: '' }, { label: 'Data Points', value: '98.2M', unit: '' }, { label: 'Last Sync', value: '30', unit: 's' }] },
                ]
            },
            {
                id: 'dev',
                name: 'DevOps Tooling',
                tabs: [
                    { name: 'SQL Console', metrics: [{ label: 'Queries Run', value: '1,245', unit: '/day' }, { label: 'Avg Time', value: '3.2', unit: 'ms' }, { label: 'Favorites', value: '34', unit: '' }, { label: 'Recent', value: '12', unit: '' }] },
                ]
            },
            {
                id: 'admin',
                name: 'Administration',
                tabs: [
                    { name: 'User Management', metrics: [{ label: 'Users', value: '234', unit: '' }, { label: 'Roles', value: '18', unit: '' }, { label: 'Active Sessions', value: '42', unit: '' }, { label: 'Failed Logins', value: '0', unit: '/day' }] },
                ]
            }
        ]
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO DATA TAB COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const DemoDataTab: FC = () => {
    const [selectedDb, setSelectedDb] = React.useState<string>('postgresql');
    const [selectedSection, setSelectedSection] = React.useState<string>('core');

    const db = DATABASE_STRUCTURE[selectedDb as keyof DemoDataStructure];
    const section = db?.sections.find(s => s.id === selectedSection);

    return (
        <div style={{ padding: '20px', maxWidth: '1600px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                    Demo Data & Metrics
                </h1>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: '8px' }}>
                    Comprehensive sample data for testing and demonstration
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
                <div style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    borderRadius: '12px',
                    padding: '16px',
                    height: 'fit-content'
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Databases
                    </div>
                    {Object.entries(DATABASE_STRUCTURE).map(([key, dbConfig]) => (
                        <div
                            key={key}
                            onClick={() => setSelectedDb(key)}
                            style={{
                                padding: '12px',
                                borderRadius: '6px',
                                background: selectedDb === key ? `${THEME.primary}20` : THEME.bg,
                                border: `1px solid ${selectedDb === key ? THEME.primary : THEME.grid}`,
                                marginBottom: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                                {dbConfig.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    {db && (
                        <>
                            <div style={{
                                background: THEME.surface,
                                border: `1px solid ${THEME.grid}`,
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: '16px' }}>
                                    KPIs
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                    {db.kpis.map((kpi, idx) => (
                                        <div key={idx} style={{
                                            background: THEME.bg,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${THEME.grid}`
                                        }}>
                                            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: '4px' }}>
                                                {kpi.label}
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: THEME.primary }}>
                                                {kpi.value}
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textMuted }}>
                                                {kpi.unit}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                background: THEME.surface,
                                border: `1px solid ${THEME.grid}`,
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: '16px' }}>
                                    Sections
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                    {db.sections.map(sec => (
                                        <button
                                            key={sec.id}
                                            onClick={() => setSelectedSection(sec.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                background: selectedSection === sec.id ? THEME.primary : THEME.bg,
                                                color: selectedSection === sec.id ? '#fff' : THEME.textMain,
                                                border: `1px solid ${selectedSection === sec.id ? THEME.primary : THEME.grid}`,
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {sec.name}
                                        </button>
                                    ))}
                                </div>

                                {section && (
                                    <div>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: '12px' }}>
                                            {section.name}
                                        </h4>
                                        {section.tabs.map((tab, idx) => (
                                            <div key={idx} style={{ marginBottom: '20px' }}>
                                                <h5 style={{ fontSize: 13, fontWeight: 700, color: THEME.primary, marginBottom: '8px' }}>
                                                    {tab.name}
                                                </h5>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                                    {tab.metrics.map((metric, midx) => (
                                                        <div key={midx} style={{
                                                            background: THEME.bg,
                                                            padding: '10px',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${THEME.grid}`
                                                        }}>
                                                            <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: '3px' }}>
                                                                {metric.label}
                                                            </div>
                                                            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.primary }}>
                                                                {metric.value}
                                                            </div>
                                                            <div style={{ fontSize: 9, color: THEME.textMuted }}>
                                                                {metric.unit}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemoDataTab;
