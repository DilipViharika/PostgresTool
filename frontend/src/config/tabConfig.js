// ==========================================================================
//  VIGIL — Tab Configuration (central registry of all dashboard tabs)
// ==========================================================================
//
//  Each entry is either a section header { section, accent }
//  or a tab definition { id, icon, label, component, badge }.
//  The TAB_CONFIG array drives the sidebar, routing, and access control.
// ==========================================================================

import {
    Activity,
    Zap,
    HardDrive,
    Bell,
    Layers,
    Network,
    Terminal,
    Users,
    Shield,
    GitBranch,
    TrendingUp,
    CalendarCheck,
    FileSearch,
    Link2,
    Cpu,
    BarChart2,
    Lock,
    Radio,
    Cloud,
    Archive,
    RefreshCw,
    Radar,
    Brain,
    Container,
    LayoutDashboard,
    Globe,
    Download,
    Clock,
    CheckCircle,
    Database,
    Gauge,
    Server,
    HardDriveDownload,
    Workflow,
    GitMerge,
    Eye,
    FileText,
    TreePine,
    BarChart3,
    AlertOctagon,
    Droplets,
    PanelTop,
    TableProperties,
    ScanSearch,
    FolderGit2,
    ShieldCheck,
    ListTree,
    DatabaseZap,
    Blocks,
    FlaskConical,
} from 'lucide-react';

import { getDS } from './designTokens.js';

// These will be set by App.jsx after lazy imports are created
let _components = {};

export function registerComponents(components) {
    _components = components;
}

export function buildTabConfig() {
    const DS = getDS();
    return [
        // ── Overview & Health ────────────────────────────────────────
        //    Top-level dashboards: fleet-wide health and single-DB overview
        { section: 'Overview', accent: DS.cyan },
        {
            id: 'fleet-overview',
            icon: PanelTop,
            label: 'Fleet Overview',
            component: _components.FleetOverviewTab,
            badge: null,
        },
        { id: 'overview', icon: Activity, label: 'Database Overview', component: _components.OverviewTab, badge: null },
        { id: 'performance', icon: Zap, label: 'Performance', component: _components.PerformanceTab, badge: null },
        { id: 'resources', icon: HardDrive, label: 'Resources', component: _components.ResourcesTab, badge: null },
        {
            id: 'reliability',
            icon: CheckCircle,
            label: 'Reliability',
            component: _components.ReliabilityTab,
            badge: null,
        },

        // ── Alerts & Rules ───────────────────────────────────────────
        //    All alerting in one place: active alerts, rule config, correlation
        { section: 'Alerts & Rules', accent: DS.rose },
        { id: 'alerts', icon: Bell, label: 'Active Alerts', component: _components.AlertsComponent, badge: '3' },
        {
            id: 'alert-rules',
            icon: AlertOctagon,
            label: 'Alert Rules',
            component: _components.AlertRuleEditor,
            badge: null,
        },
        {
            id: 'alert-correlation',
            icon: Link2,
            label: 'Alert Correlation',
            component: _components.AlertCorrelationTab,
            badge: null,
        },

        // ── Query Analysis ───────────────────────────────────────────
        //    Query optimization, plan inspection, index management
        { section: 'Query Analysis', accent: DS.violet },
        {
            id: 'optimizer',
            icon: DatabaseZap,
            label: 'Query Optimizer',
            component: _components.QueryOptimizerTab,
            badge: null,
        },
        {
            id: 'query-plan',
            icon: Workflow,
            label: 'Query Plan Viewer',
            component: _components.QueryPlanViewer,
            badge: null,
        },
        {
            id: 'regression',
            icon: TrendingUp,
            label: 'Plan Regression',
            component: _components.QueryPlanRegressionTab,
            badge: null,
        },
        { id: 'indexes', icon: Layers, label: 'Indexes', component: _components.IndexesTab, badge: null },
        {
            id: 'bloat',
            icon: ScanSearch,
            label: 'Bloat Analysis',
            component: _components.BloatAnalysisTab,
            badge: null,
        },
        {
            id: 'Table',
            icon: TableProperties,
            label: 'Table Analysis',
            component: _components.TableAnalytics,
            badge: null,
        },

        // ── Schema & Data ────────────────────────────────────────────
        //    Schema browsing, visualization, migrations, and charting
        { section: 'Schema & Data', accent: DS.amber },
        {
            id: 'schema-tree',
            icon: TreePine,
            label: 'Schema Browser',
            component: _components.SchemaTreeBrowser,
            badge: null,
        },
        {
            id: 'schema',
            icon: FolderGit2,
            label: 'Schema & Migrations',
            component: _components.SchemaVersioningTab,
            badge: null,
        },
        {
            id: 'schema-visualizer',
            icon: Blocks,
            label: 'Schema Visualizer',
            component: _components.SchemaVisualizerTab,
            badge: null,
        },
        {
            id: 'table-dependencies',
            icon: ListTree,
            label: 'Table Dependencies',
            component: _components.TableDependencyMindMap,
            badge: null,
        },
        {
            id: 'chart-builder',
            icon: BarChart3,
            label: 'Chart Builder',
            component: _components.ChartBuilder,
            badge: null,
        },

        // ── Infrastructure ───────────────────────────────────────────
        //    Connection pools, replication, maintenance, capacity
        { section: 'Infrastructure', accent: DS.emerald },
        { id: 'pool', icon: Network, label: 'Connection Pool', component: _components.ConnectionPoolTab, badge: null },
        {
            id: 'pool-metrics',
            icon: Droplets,
            label: 'Pool Metrics',
            component: _components.PoolMetricsDashboard,
            badge: null,
        },
        {
            id: 'replication',
            icon: Radio,
            label: 'Replication & WAL',
            component: _components.ReplicationWALTab,
            badge: null,
        },
        {
            id: 'checkpoint',
            icon: CheckCircle,
            label: 'Checkpoint Monitor',
            component: _components.CheckpointMonitorTab,
            badge: null,
        },
        {
            id: 'maintenance',
            icon: RefreshCw,
            label: 'Vacuum & Maintenance',
            component: _components.VacuumMaintenanceTab,
            badge: null,
        },
        {
            id: 'capacity',
            icon: BarChart2,
            label: 'Capacity Planning',
            component: _components.CapacityPlanningTab,
            badge: null,
        },
        {
            id: 'backup',
            icon: Archive,
            label: 'Backup & Recovery',
            component: _components.BackupRecoveryTab,
            badge: null,
        },

        // ── Security ─────────────────────────────────────────────────
        { section: 'Security', accent: DS.rose },
        {
            id: 'security',
            icon: ShieldCheck,
            label: 'Security & Compliance',
            component: _components.SecurityComplianceTab,
            badge: null,
        },

        // ── Observability ────────────────────────────────────────────
        //    Logs, tracing, external integrations, status
        { section: 'Observability', accent: DS.amber },
        {
            id: 'observability-hub',
            icon: Eye,
            label: 'Observability Hub',
            component: _components.ObservabilityHub,
            badge: null,
        },
        { id: 'cloudwatch', icon: Cloud, label: 'CloudWatch', component: _components.CloudWatchTab, badge: null },
        {
            id: 'log-patterns',
            icon: FileSearch,
            label: 'Log Pattern Analysis',
            component: _components.LogPatternAnalysisTab,
            badge: null,
        },
        {
            id: 'opentelemetry',
            icon: Radar,
            label: 'OpenTelemetry',
            component: _components.OpenTelemetryTab,
            badge: null,
        },
        { id: 'kubernetes', icon: Container, label: 'Kubernetes', component: _components.KubernetesTab, badge: null },
        { id: 'status-page', icon: Globe, label: 'Status Page', component: _components.StatusPageTab, badge: null },
        {
            id: 'ai-monitoring',
            icon: Brain,
            label: 'AI Monitoring',
            component: _components.AIMonitoringTab,
            badge: null,
        },

        // ── Developer Tools ──────────────────────────────────────────
        { section: 'Developer Tools', accent: DS.violet },
        { id: 'sql', icon: Terminal, label: 'SQL Console', component: _components.SqlConsoleTab, badge: null },
        { id: 'api', icon: Cpu, label: 'API Tracing', component: _components.ApiQueriesTab, badge: null },
        { id: 'repository', icon: GitBranch, label: 'Repository', component: _components.RepositoryTab, badge: null },
        {
            id: 'ai-advisor',
            icon: Brain,
            label: 'AI Query Advisor',
            component: _components.AIQueryAdvisorTab,
            badge: null,
        },

        // ── MongoDB ──────────────────────────────────────────────────
        { section: 'MongoDB', accent: DS.emerald },
        {
            id: 'mongo-overview',
            icon: Database,
            label: 'Mongo Overview',
            component: _components.MongoOverviewTab,
            badge: null,
        },
        {
            id: 'mongo-performance',
            icon: Gauge,
            label: 'Mongo Performance',
            component: _components.MongoPerformanceTab,
            badge: null,
        },
        {
            id: 'mongo-storage',
            icon: HardDriveDownload,
            label: 'Mongo Storage',
            component: _components.MongoStorageTab,
            badge: null,
        },
        {
            id: 'mongo-replication',
            icon: GitMerge,
            label: 'Mongo Replication',
            component: _components.MongoReplicationTab,
            badge: null,
        },
        {
            id: 'mongo-data-tools',
            icon: Workflow,
            label: 'Mongo Data Tools',
            component: _components.MongoDataToolsTab,
            badge: null,
        },
        {
            id: 'mongo-sharding',
            icon: Server,
            label: 'Mongo Sharding',
            component: _components.MongoShardingTab,
            badge: null,
        },

        // ══════════════════════════════════════════════════════════════
        //  DEMO — Hierarchical: Group → Section → Tabs
        //  Mirrors real app sections exactly. Each section carries a
        //  `group` key so the sidebar nests them under a DB parent.
        // ══════════════════════════════════════════════════════════════

        // ┌─────────────────────────────────────────────────────────┐
        // │  Demo › PostgreSQL  (mirrors real PG sections exactly)  │
        // └─────────────────────────────────────────────────────────┘
        { section: 'Overview', accent: DS.cyan, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-fleet',
            icon: PanelTop,
            label: 'Fleet Overview',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-overview',
            icon: Activity,
            label: 'Database Overview',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-performance',
            icon: Zap,
            label: 'Performance',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-resources',
            icon: HardDrive,
            label: 'Resources',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-reliability',
            icon: CheckCircle,
            label: 'Reliability',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Alerts & Rules', accent: DS.rose, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-alerts',
            icon: Bell,
            label: 'Active Alerts',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-alert-rules',
            icon: AlertOctagon,
            label: 'Alert Rules',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-alert-correlation',
            icon: Link2,
            label: 'Alert Correlation',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Query Analysis', accent: DS.violet, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-optimizer',
            icon: DatabaseZap,
            label: 'Query Optimizer',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-query-plan',
            icon: Workflow,
            label: 'Query Plan Viewer',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-regression',
            icon: TrendingUp,
            label: 'Plan Regression',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        { id: 'demo-pg-indexes', icon: Layers, label: 'Indexes', component: _components.DemoPostgresTab, badge: null },
        {
            id: 'demo-pg-bloat',
            icon: ScanSearch,
            label: 'Bloat Analysis',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-table',
            icon: TableProperties,
            label: 'Table Analysis',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Schema & Data', accent: DS.amber, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-schema-tree',
            icon: TreePine,
            label: 'Schema Browser',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-schema',
            icon: FolderGit2,
            label: 'Schema & Migrations',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-schema-viz',
            icon: Blocks,
            label: 'Schema Visualizer',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-table-deps',
            icon: ListTree,
            label: 'Table Dependencies',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-chart-builder',
            icon: BarChart3,
            label: 'Chart Builder',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Infrastructure', accent: DS.emerald, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-pool',
            icon: Network,
            label: 'Connection Pool',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-pool-metrics',
            icon: Droplets,
            label: 'Pool Metrics',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-replication',
            icon: Radio,
            label: 'Replication & WAL',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-checkpoint',
            icon: CheckCircle,
            label: 'Checkpoint Monitor',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-maintenance',
            icon: RefreshCw,
            label: 'Vacuum & Maintenance',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-capacity',
            icon: BarChart2,
            label: 'Capacity Planning',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-backup',
            icon: Archive,
            label: 'Backup & Recovery',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Security', accent: DS.rose, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-security',
            icon: ShieldCheck,
            label: 'Security & Compliance',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Observability', accent: DS.amber, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-obs-hub',
            icon: Eye,
            label: 'Observability Hub',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-cloudwatch',
            icon: Cloud,
            label: 'CloudWatch',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-log-patterns',
            icon: FileSearch,
            label: 'Log Pattern Analysis',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-opentelemetry',
            icon: Radar,
            label: 'OpenTelemetry',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-kubernetes',
            icon: Container,
            label: 'Kubernetes',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-status-page',
            icon: Globe,
            label: 'Status Page',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-ai-monitoring',
            icon: Brain,
            label: 'AI Monitoring',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        { section: 'Developer Tools', accent: DS.violet, group: 'Demo PostgreSQL' },
        {
            id: 'demo-pg-sql',
            icon: Terminal,
            label: 'SQL Console',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        { id: 'demo-pg-api', icon: Cpu, label: 'API Tracing', component: _components.DemoPostgresTab, badge: null },
        {
            id: 'demo-pg-repository',
            icon: GitBranch,
            label: 'Repository',
            component: _components.DemoPostgresTab,
            badge: null,
        },
        {
            id: 'demo-pg-ai-advisor',
            icon: Brain,
            label: 'AI Query Advisor',
            component: _components.DemoPostgresTab,
            badge: null,
        },

        // ┌─────────────────────────────────────────────────────────┐
        // │  Demo › MySQL  (mirrors real PG sections for MySQL)     │
        // └─────────────────────────────────────────────────────────┘
        { section: 'Overview', accent: DS.cyan, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-fleet',
            icon: PanelTop,
            label: 'Fleet Overview',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-overview',
            icon: Activity,
            label: 'Database Overview',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-performance',
            icon: Zap,
            label: 'Performance',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-resources',
            icon: HardDrive,
            label: 'Resources',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-reliability',
            icon: CheckCircle,
            label: 'Reliability',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Alerts & Rules', accent: DS.rose, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-alerts',
            icon: Bell,
            label: 'Active Alerts',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-alert-rules',
            icon: AlertOctagon,
            label: 'Alert Rules',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-alert-correlation',
            icon: Link2,
            label: 'Alert Correlation',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Query Analysis', accent: DS.violet, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-optimizer',
            icon: DatabaseZap,
            label: 'Query Optimizer',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-query-plan',
            icon: Workflow,
            label: 'Query Plan Viewer',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-regression',
            icon: TrendingUp,
            label: 'Plan Regression',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        { id: 'demo-mysql-indexes', icon: Layers, label: 'Indexes', component: _components.DemoMySQLTab, badge: null },
        {
            id: 'demo-mysql-bloat',
            icon: ScanSearch,
            label: 'Bloat Analysis',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-table',
            icon: TableProperties,
            label: 'Table Analysis',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Schema & Data', accent: DS.amber, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-schema-tree',
            icon: TreePine,
            label: 'Schema Browser',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-schema',
            icon: FolderGit2,
            label: 'Schema & Migrations',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-schema-viz',
            icon: Blocks,
            label: 'Schema Visualizer',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-table-deps',
            icon: ListTree,
            label: 'Table Dependencies',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-chart-builder',
            icon: BarChart3,
            label: 'Chart Builder',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Infrastructure', accent: DS.emerald, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-pool',
            icon: Network,
            label: 'Connection Pool',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-pool-metrics',
            icon: Droplets,
            label: 'Pool Metrics',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-replication',
            icon: Radio,
            label: 'Replication',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-checkpoint',
            icon: CheckCircle,
            label: 'Checkpoint Monitor',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-maintenance',
            icon: RefreshCw,
            label: 'Maintenance',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-capacity',
            icon: BarChart2,
            label: 'Capacity Planning',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-backup',
            icon: Archive,
            label: 'Backup & Recovery',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Security', accent: DS.rose, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-security',
            icon: ShieldCheck,
            label: 'Security & Compliance',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Observability', accent: DS.amber, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-obs-hub',
            icon: Eye,
            label: 'Observability Hub',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-cloudwatch',
            icon: Cloud,
            label: 'CloudWatch',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-log-patterns',
            icon: FileSearch,
            label: 'Log Pattern Analysis',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-opentelemetry',
            icon: Radar,
            label: 'OpenTelemetry',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-kubernetes',
            icon: Container,
            label: 'Kubernetes',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-status-page',
            icon: Globe,
            label: 'Status Page',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-ai-monitoring',
            icon: Brain,
            label: 'AI Monitoring',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        { section: 'Developer Tools', accent: DS.violet, group: 'Demo MySQL' },
        {
            id: 'demo-mysql-sql',
            icon: Terminal,
            label: 'SQL Console',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        { id: 'demo-mysql-api', icon: Cpu, label: 'API Tracing', component: _components.DemoMySQLTab, badge: null },
        {
            id: 'demo-mysql-repository',
            icon: GitBranch,
            label: 'Repository',
            component: _components.DemoMySQLTab,
            badge: null,
        },
        {
            id: 'demo-mysql-ai-advisor',
            icon: Brain,
            label: 'AI Query Advisor',
            component: _components.DemoMySQLTab,
            badge: null,
        },

        // ┌─────────────────────────────────────────────────────────┐
        // │  Demo › MongoDB  (mirrors uploaded HTML sidebar)        │
        // └─────────────────────────────────────────────────────────┘
        { section: 'Overview', accent: DS.cyan, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-exec-dash',
            icon: Activity,
            label: 'Executive Dashboard',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-connection',
            icon: Network,
            label: 'Connection',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-serverinfo',
            icon: Server,
            label: 'Server Info',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-databases',
            icon: Database,
            label: 'Databases',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-join-viz',
            icon: Workflow,
            label: 'Collection Relationships',
            component: _components.DemoMongoDBTab,
            badge: null,
        },

        { section: 'Performance', accent: DS.violet, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-serverstatus',
            icon: Gauge,
            label: 'Server Status',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-realtimeops',
            icon: Zap,
            label: 'Real-time Ops',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-latency',
            icon: TrendingUp,
            label: 'Latency Percentiles',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-namespace',
            icon: Layers,
            label: 'Namespace Insights',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-explain',
            icon: DatabaseZap,
            label: 'Explain Plan',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-activeops',
            icon: Activity,
            label: 'Active Operations',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-slowqueries',
            icon: Clock,
            label: 'Slow Queries',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-profiler',
            icon: FileSearch,
            label: 'Query Profiler',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-cost',
            icon: BarChart2,
            label: 'Query Cost Estimator',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-locks',
            icon: Lock,
            label: 'Lock Analysis',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-anomaly',
            icon: Brain,
            label: 'Anomaly Detection',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-metrics',
            icon: Eye,
            label: 'Metrics Preview',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-agent',
            icon: Radio,
            label: 'Live Agent',
            component: _components.DemoMongoDBTab,
            badge: null,
        },

        { section: 'Storage', accent: DS.amber, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-index-advisor',
            icon: Layers,
            label: 'Index Advisor',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-schema',
            icon: FolderGit2,
            label: 'Schema Analyzer',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-collstats',
            icon: HardDriveDownload,
            label: 'Collection Stats',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-wiredtiger',
            icon: HardDrive,
            label: 'WiredTiger Cache',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-backup',
            icon: Archive,
            label: 'Backup Monitor',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-capacity',
            icon: BarChart2,
            label: 'Capacity Planning',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-network',
            icon: Network,
            label: 'Network',
            component: _components.DemoMongoDBTab,
            badge: null,
        },

        { section: 'Data', accent: DS.emerald, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-doceditor',
            icon: FileText,
            label: 'Document Editor',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-pipeline',
            icon: Workflow,
            label: 'Aggregation Builder',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-nl-query',
            icon: Brain,
            label: 'NL Query Generator',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-import-export',
            icon: Download,
            label: 'Import / Export',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-sql-translator',
            icon: Terminal,
            label: 'SQL Translator',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-schema-compare',
            icon: Blocks,
            label: 'Schema Compare',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        { id: 'demo-mongo-geo', icon: Globe, label: 'Geo-spatial', component: _components.DemoMongoDBTab, badge: null },

        { section: 'Intelligence', accent: DS.violet, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-ai-hints',
            icon: Brain,
            label: 'AI Hints',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-compare',
            icon: BarChart3,
            label: 'Compare Clusters',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-historical',
            icon: TrendingUp,
            label: 'Historical Trends',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-perf-advisor',
            icon: DatabaseZap,
            label: 'Perf Advisor v2',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-trace',
            icon: Radar,
            label: 'Trace Correlator',
            component: _components.DemoMongoDBTab,
            badge: null,
        },

        { section: 'Replication', accent: DS.emerald, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-failover',
            icon: GitMerge,
            label: 'Replica Set & Failover',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-sharding',
            icon: Server,
            label: 'Sharding',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-oplog',
            icon: Radio,
            label: 'Oplog Tail',
            component: _components.DemoMongoDBTab,
            badge: null,
        },

        { section: 'Management', accent: DS.rose, group: 'Demo MongoDB' },
        {
            id: 'demo-mongo-alert-mgr',
            icon: Bell,
            label: 'Alert Manager',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-prometheus',
            icon: Radar,
            label: 'Prometheus Export',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        { id: 'demo-mongo-sso', icon: Shield, label: 'SSO / Auth', component: _components.DemoMongoDBTab, badge: null },
        {
            id: 'demo-mongo-atlas',
            icon: Cloud,
            label: 'Atlas API Bridge',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-dashboards',
            icon: LayoutDashboard,
            label: 'Dashboards',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-reports',
            icon: FileText,
            label: 'Reports',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        {
            id: 'demo-mongo-auditlog',
            icon: ShieldCheck,
            label: 'Audit Log',
            component: _components.DemoMongoDBTab,
            badge: null,
        },
        { id: 'demo-mongo-users', icon: Users, label: 'Users', component: _components.DemoMongoDBTab, badge: null },

        // ── Admin ────────────────────────────────────────────────────
        { section: 'Admin', accent: DS.rose },
        {
            id: 'tasks',
            icon: CalendarCheck,
            label: 'DBA Task Scheduler',
            component: _components.DBATaskSchedulerTab,
            badge: null,
        },
        {
            id: 'UserManagement',
            icon: Users,
            label: 'User Management',
            component: _components.UserManagementTab,
            badge: null,
        },
        { id: 'admin', icon: Shield, label: 'Admin Panel', component: _components.AdminTab, badge: null },
        {
            id: 'retention',
            icon: Clock,
            label: 'Data Retention',
            component: _components.RetentionManagementTab,
            badge: null,
        },
        {
            id: 'report-builder',
            icon: FileText,
            label: 'Report Builder',
            component: _components.ReportBuilderTab,
            badge: null,
        },
        {
            id: 'terraform',
            icon: Download,
            label: 'Terraform Export',
            component: _components.TerraformExportTab,
            badge: null,
        },
        {
            id: 'custom-dashboard',
            icon: LayoutDashboard,
            label: 'Custom Dashboards',
            component: _components.CustomDashboardTab,
            badge: null,
        },
    ];
}

export function getTabsOnly(config) {
    return config.filter((t) => t.id);
}

export function getSectionGroups(config) {
    const groups = [];
    let current = null;
    for (const item of config) {
        if (item.section) {
            current = { section: item.section, tabs: [], accent: item.accent || getDS().cyan };
            if (item.group) current.group = item.group;
            groups.push(current);
        } else if (current) {
            current.tabs.push(item);
        }
    }
    return groups;
}

export function getSectionForTab(groups, tabId) {
    for (const g of groups) {
        if (g.tabs.some((t) => t.id === tabId)) return g.section;
    }
    return null;
}

export function getSectionAccent(groups, tabId) {
    for (const g of groups) {
        if (g.tabs.some((t) => t.id === tabId)) return g.accent;
    }
    return getDS().cyan;
}

export const STORAGE_KEYS = {
    ACTIVE_TAB: 'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED: 'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED: 'pg_monitor_notifications_dismissed',
    FEEDBACK_PROMPT: 'pg_monitor_feedback_prompt_shown',
};
