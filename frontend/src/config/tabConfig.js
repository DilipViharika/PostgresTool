// ==========================================================================
//  VIGIL — Tab Configuration (central registry of all dashboard tabs)
// ==========================================================================
//
//  Each entry is either a section header { section, accent }
//  or a tab definition { id, icon, label, component, badge }.
//  The TAB_CONFIG array drives the sidebar, routing, and access control.
// ==========================================================================

import {
    Activity, Zap, HardDrive, Bell, Layers, Network,
    Terminal, Users, Shield, GitBranch, TrendingUp,
    CalendarCheck, FileSearch, Link2, Cpu, BarChart2, Lock,
    Radio, Cloud, Archive, RefreshCw, Star,
    Radar, Brain, Container, LayoutDashboard, Globe, Download, Clock, CheckCircle,
    Database, Gauge, Server, HardDriveDownload, Workflow, GitMerge, FlaskConical, Eye, FileText,
} from 'lucide-react';

import { getDS } from './designTokens.js';

// These will be set by App.jsx after lazy imports are created
let _components = {};

export function registerComponents(components) {
    _components = components;
}

/** Helper: generate demo tabs for a SQL database with three-level hierarchy:
 *  Parent group (e.g. "Demo PG") → Sub-sections (e.g. "Core Monitoring") → Individual tabs
 */
function buildDemoSqlTabs(dbShort, dbLabel, accent) {
    const D = _components.DemoSectionView;
    const group = `Demo ${dbLabel}`;
    return [
        { section: `Demo ${dbLabel} — Core Monitoring`, accent, group },
        { id: `demo-${dbShort}-overview`,      icon: Activity,    label: 'Overview',          component: D, badge: null },
        { id: `demo-${dbShort}-performance`,   icon: Zap,         label: 'Performance',       component: D, badge: null },
        { id: `demo-${dbShort}-resources`,     icon: HardDrive,   label: 'Resources',         component: D, badge: null },
        { id: `demo-${dbShort}-reliability`,   icon: CheckCircle, label: 'Reliability',       component: D, badge: null },
        { id: `demo-${dbShort}-alerts`,        icon: Bell,        label: 'Alerts',            component: D, badge: '3' },

        { section: `Demo ${dbLabel} — Query & Indexes`, accent, group },
        { id: `demo-${dbShort}-optimizer`,     icon: Zap,         label: 'Query Optimizer',   component: D, badge: null },
        { id: `demo-${dbShort}-indexes`,       icon: Layers,      label: 'Indexes',           component: D, badge: null },
        { id: `demo-${dbShort}-regression`,    icon: TrendingUp,  label: 'Plan Regression',   component: D, badge: null },
        { id: `demo-${dbShort}-bloat`,         icon: Layers,      label: 'Bloat Analysis',    component: D, badge: null },
        { id: `demo-${dbShort}-table`,         icon: Layers,      label: 'Table Analysis',    component: D, badge: null },

        { section: `Demo ${dbLabel} — Infrastructure`, accent, group },
        { id: `demo-${dbShort}-pool`,          icon: Network,     label: 'Connection Pool',      component: D, badge: null },
        { id: `demo-${dbShort}-replication`,   icon: Radio,       label: 'Replication & WAL',    component: D, badge: null },
        { id: `demo-${dbShort}-checkpoint`,    icon: CheckCircle, label: 'Checkpoint Monitor',   component: D, badge: null },
        { id: `demo-${dbShort}-maintenance`,   icon: RefreshCw,   label: 'Vacuum & Maintenance', component: D, badge: null },
        { id: `demo-${dbShort}-capacity`,      icon: BarChart2,   label: 'Capacity Planning',    component: D, badge: null },
        { id: `demo-${dbShort}-backup`,        icon: Archive,     label: 'Backup & Recovery',    component: D, badge: null },

        { section: `Demo ${dbLabel} — Schema & Security`, accent, group },
        { id: `demo-${dbShort}-schema`,        icon: GitBranch,   label: 'Schema & Migrations',    component: D, badge: null },
        { id: `demo-${dbShort}-schema-viz`,    icon: GitBranch,   label: 'Schema Visualizer',      component: D, badge: null },
        { id: `demo-${dbShort}-table-deps`,    icon: GitBranch,   label: 'Table Dependencies',     component: D, badge: null },
        { id: `demo-${dbShort}-security`,      icon: Lock,        label: 'Security & Compliance',  component: D, badge: null },

        { section: `Demo ${dbLabel} — Observability`, accent, group },
        { id: `demo-${dbShort}-cloudwatch`,       icon: Cloud,      label: 'CloudWatch',            component: D, badge: null },
        { id: `demo-${dbShort}-log-patterns`,     icon: FileSearch,  label: 'Log Pattern Analysis',  component: D, badge: null },
        { id: `demo-${dbShort}-alert-correlation`, icon: Link2,      label: 'Alert Correlation',     component: D, badge: null },
        { id: `demo-${dbShort}-opentelemetry`,    icon: Radar,       label: 'OpenTelemetry',         component: D, badge: null },
        { id: `demo-${dbShort}-kubernetes`,       icon: Container,   label: 'Kubernetes',            component: D, badge: null },
        { id: `demo-${dbShort}-status-page`,      icon: Globe,       label: 'Status Page',           component: D, badge: null },
        { id: `demo-${dbShort}-ai-monitoring`,    icon: Brain,       label: 'AI Monitoring',         component: D, badge: null },

        { section: `Demo ${dbLabel} — Developer Tools`, accent, group },
        { id: `demo-${dbShort}-sql`,           icon: Terminal,    label: 'SQL Console',        component: D, badge: null },
        { id: `demo-${dbShort}-api`,           icon: Cpu,         label: 'API Tracing',        component: D, badge: null },
        { id: `demo-${dbShort}-repository`,    icon: GitBranch,   label: 'Repository',         component: D, badge: null },
        { id: `demo-${dbShort}-ai-advisor`,    icon: Brain,       label: 'AI Query Advisor',   component: D, badge: null },

        { section: `Demo ${dbLabel} — Admin`, accent, group },
        { id: `demo-${dbShort}-tasks`,            icon: CalendarCheck,    label: 'DBA Task Scheduler', component: D, badge: null },
        { id: `demo-${dbShort}-users`,            icon: Users,            label: 'User Management',    component: D, badge: null },
        { id: `demo-${dbShort}-admin-panel`,      icon: Shield,           label: 'Admin',              component: D, badge: null },
        { id: `demo-${dbShort}-retention`,        icon: Clock,            label: 'Data Retention',     component: D, badge: null },
        { id: `demo-${dbShort}-terraform`,        icon: Download,         label: 'Terraform Export',   component: D, badge: null },
        { id: `demo-${dbShort}-custom-dashboard`, icon: LayoutDashboard,  label: 'Custom Dashboards',  component: D, badge: null },
    ];
}

export function buildTabConfig() {
    const DS = getDS();
    return [
        { section: 'Core Monitoring', accent: DS.cyan },
        { id: 'overview',          icon: Activity,      label: 'Overview',              component: _components.OverviewTab,             badge: null },
        { id: 'performance',       icon: Zap,           label: 'Performance',           component: _components.PerformanceTab,          badge: null },
        { id: 'resources',         icon: HardDrive,     label: 'Resources',             component: _components.ResourcesTab,            badge: null },
        { id: 'reliability',       icon: CheckCircle,   label: 'Reliability',           component: _components.ReliabilityTab,          badge: null },
        { id: 'alerts',            icon: Bell,          label: 'Alerts',                component: _components.AlertsComponent,         badge: '3' },

        { section: 'Query & Indexes', accent: DS.violet },
        { id: 'optimizer',         icon: Zap,           label: 'Query Optimizer',       component: _components.QueryOptimizerTab,       badge: null },
        { id: 'indexes',           icon: Layers,        label: 'Indexes',               component: _components.IndexesTab,              badge: null },
        { id: 'regression',        icon: TrendingUp,    label: 'Plan Regression',       component: _components.QueryPlanRegressionTab,  badge: null },
        { id: 'bloat',             icon: Layers,        label: 'Bloat Analysis',        component: _components.BloatAnalysisTab,        badge: null },
        { id: 'Table',             icon: Layers,        label: 'Table Analysis',        component: _components.TableAnalytics,          badge: null },

        { section: 'Infrastructure', accent: DS.emerald },
        { id: 'pool',              icon: Network,       label: 'Connection Pool',       component: _components.ConnectionPoolTab,       badge: null },
        { id: 'replication',       icon: Radio,         label: 'Replication & WAL',     component: _components.ReplicationWALTab,       badge: null },
        { id: 'checkpoint',        icon: CheckCircle,   label: 'Checkpoint Monitor',    component: _components.CheckpointMonitorTab,    badge: null },
        { id: 'maintenance',       icon: RefreshCw,     label: 'Vacuum & Maintenance',  component: _components.VacuumMaintenanceTab,    badge: null },
        { id: 'capacity',          icon: BarChart2,     label: 'Capacity Planning',     component: _components.CapacityPlanningTab,     badge: null },
        { id: 'backup',            icon: Archive,       label: 'Backup & Recovery',     component: _components.BackupRecoveryTab,       badge: null },

        { section: 'Schema & Security', accent: DS.rose },
        { id: 'schema',            icon: GitBranch,     label: 'Schema & Migrations',   component: _components.SchemaVersioningTab,     badge: null },
        { id: 'schema-visualizer', icon: GitBranch,     label: 'Schema Visualizer',     component: _components.SchemaVisualizerTab,     badge: null },
        { id: 'table-dependencies', icon: GitBranch,    label: 'Table Dependencies',    component: _components.TableDependencyMindMap,  badge: null },
        { id: 'security',          icon: Lock,          label: 'Security & Compliance', component: _components.SecurityComplianceTab,   badge: null },

        { section: 'Observability', accent: DS.amber },
        { id: 'observability-hub', icon: Eye,           label: 'Observability Hub',     component: _components.ObservabilityHub,        badge: null },
        { id: 'cloudwatch',        icon: Cloud,         label: 'CloudWatch',            component: _components.CloudWatchTab,           badge: null },
        { id: 'log-patterns',      icon: FileSearch,    label: 'Log Pattern Analysis',  component: _components.LogPatternAnalysisTab,   badge: null },
        { id: 'alert-correlation', icon: Link2,         label: 'Alert Correlation',     component: _components.AlertCorrelationTab,     badge: null },
        { id: 'opentelemetry',     icon: Radar,         label: 'OpenTelemetry',         component: _components.OpenTelemetryTab,        badge: null },
        { id: 'kubernetes',        icon: Container,     label: 'Kubernetes',            component: _components.KubernetesTab,           badge: null },
        { id: 'status-page',       icon: Globe,         label: 'Status Page',           component: _components.StatusPageTab,           badge: null },
        { id: 'ai-monitoring',     icon: Brain,         label: 'AI Monitoring',         component: _components.AIMonitoringTab,         badge: null },

        { section: 'Developer Tools', accent: DS.violet },
        { id: 'sql',               icon: Terminal,      label: 'SQL Console',           component: _components.SqlConsoleTab,           badge: null },
        { id: 'api',               icon: Cpu,           label: 'API Tracing',           component: _components.ApiQueriesTab,           badge: null },
        { id: 'repository',        icon: GitBranch,     label: 'Repository',            component: _components.RepositoryTab,           badge: null },
        { id: 'ai-advisor',        icon: Brain,         label: 'AI Query Advisor',      component: _components.AIQueryAdvisorTab,       badge: null },

        { section: 'MongoDB', accent: DS.emerald },
        { id: 'mongo-overview',     icon: Database,          label: 'Mongo Overview',        component: _components.MongoOverviewTab,        badge: null },
        { id: 'mongo-performance',  icon: Gauge,             label: 'Mongo Performance',     component: _components.MongoPerformanceTab,     badge: null },
        { id: 'mongo-storage',      icon: HardDriveDownload, label: 'Mongo Storage',         component: _components.MongoStorageTab,         badge: null },
        { id: 'mongo-replication',  icon: GitMerge,          label: 'Mongo Replication',     component: _components.MongoReplicationTab,     badge: null },
        { id: 'mongo-data-tools',   icon: Workflow,          label: 'Mongo Data Tools',      component: _components.MongoDataToolsTab,       badge: null },
        { id: 'mongo-sharding',     icon: Server,            label: 'Mongo Sharding',        component: _components.MongoShardingTab,        badge: null },

        { section: 'Admin', accent: DS.rose },
        { id: 'tasks',             icon: CalendarCheck, label: 'DBA Task Scheduler',    component: _components.DBATaskSchedulerTab,     badge: null },
        { id: 'UserManagement',    icon: Users,         label: 'User Management',       component: _components.UserManagementTab,       badge: null },
        { id: 'admin',             icon: Shield,        label: 'Admin',                 component: _components.AdminTab,                badge: null },
        { id: 'retention',         icon: Clock,         label: 'Data Retention',        component: _components.RetentionManagementTab,  badge: null },
        { id: 'report-builder',    icon: FileText,      label: 'Report Builder',        component: _components.ReportBuilderTab,        badge: null },
        { id: 'terraform',         icon: Download,      label: 'Terraform Export',      component: _components.TerraformExportTab,      badge: null },
        { id: 'custom-dashboard',  icon: LayoutDashboard, label: 'Custom Dashboards',   component: _components.CustomDashboardTab,      badge: null },
        /* ══════════════════════════════════════════════════════════════════
           Demo databases — two-level hierarchy matching real sidebar:
           Each database has section headers that expand to individual tabs,
           mirroring the real Core Monitoring → Overview/Performance/… pattern.
           ══════════════════════════════════════════════════════════════════ */
        ...buildDemoSqlTabs('pg',     'PG',         '#6495ED'),
        ...buildDemoSqlTabs('mysql',  'MySQL',      '#00B4D8'),
        ...buildDemoSqlTabs('mssql',  'SQL Server', '#F97316'),
        ...buildDemoSqlTabs('oracle', 'Oracle',     '#FF4560'),

        /* ── Demo: MongoDB (matches real MongoDB section structure) ── */
        { section: 'Demo MongoDB — Core', accent: '#2EE89C', group: 'Demo MongoDB' },
        { id: 'demo-mongo-overview',     icon: Database,          label: 'Mongo Overview',    component: _components.DemoSectionView, badge: null },
        { id: 'demo-mongo-performance',  icon: Gauge,             label: 'Mongo Performance', component: _components.DemoSectionView, badge: null },
        { id: 'demo-mongo-storage',      icon: HardDriveDownload, label: 'Mongo Storage',     component: _components.DemoSectionView, badge: null },

        { section: 'Demo MongoDB — Replication', accent: '#2EE89C', group: 'Demo MongoDB' },
        { id: 'demo-mongo-replication',  icon: GitMerge,          label: 'Mongo Replication', component: _components.DemoSectionView, badge: null },
        { id: 'demo-mongo-sharding',     icon: Server,            label: 'Mongo Sharding',    component: _components.DemoSectionView, badge: null },

        { section: 'Demo MongoDB — Data & Tools', accent: '#2EE89C', group: 'Demo MongoDB' },
        { id: 'demo-mongo-data-tools',   icon: Workflow,          label: 'Mongo Data Tools',  component: _components.DemoSectionView, badge: null },
    ];
}

export function getTabsOnly(config) {
    return config.filter(t => t.id);
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
        if (g.tabs.some(t => t.id === tabId)) return g.section;
    }
    return null;
}

export function getSectionAccent(groups, tabId) {
    for (const g of groups) {
        if (g.tabs.some(t => t.id === tabId)) return g.accent;
    }
    return getDS().cyan;
}

export const STORAGE_KEYS = {
    ACTIVE_TAB:               'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED:        'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED:  'pg_monitor_notifications_dismissed',
    FEEDBACK_PROMPT:          'pg_monitor_feedback_prompt_shown',
};
