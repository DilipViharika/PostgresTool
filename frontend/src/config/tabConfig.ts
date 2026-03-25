// ==========================================================================
//  VIGIL — Tab Configuration (central registry of all dashboard tabs)
// ==========================================================================
//
//  Each entry is either a section header { section, accent }
//  or a tab definition { id, icon, label, component, badge }.
//  The TAB_CONFIG array drives the sidebar, routing, and access control.
// ==========================================================================

import { FC, ComponentType, ReactNode } from 'react';
import {
    Activity, Zap, HardDrive, Bell, Layers, Network,
    Terminal, Users, Shield, GitBranch, TrendingUp,
    CalendarCheck, FileSearch, Link2, Cpu, BarChart2, Lock,
    Radio, Cloud, Archive, RefreshCw,
    Radar, Brain, Container, LayoutDashboard, Globe, Download, Clock, CheckCircle,
    Database, Gauge, Server, HardDriveDownload, Workflow, GitMerge, Eye, FileText,
    TreePine, BarChart3, AlertOctagon, Droplets, PanelTop,
    TableProperties, ScanSearch, FolderGit2, ShieldCheck, ListTree, DatabaseZap, Blocks,
    LucideIcon,
} from 'lucide-react';

import { getDS } from './designTokens';

// ── Type definitions ────────────────────────────────────────────────────

interface TabEntry {
    id: string;
    icon: LucideIcon;
    label: string;
    component: ComponentType<any>;
    badge: string | null;
}

interface SectionHeader {
    section: string;
    accent: string;
    group?: string;
}

type TabConfigItem = TabEntry | SectionHeader;

interface SectionGroup {
    section: string;
    tabs: TabEntry[];
    accent: string;
    group?: string;
}

type ComponentRegistry = Record<string, ComponentType<any>>;

interface TabConfigFunctions {
    registerComponents: (components: ComponentRegistry) => void;
    buildTabConfig: () => TabConfigItem[];
    getTabsOnly: (config: TabConfigItem[]) => TabEntry[];
    getSectionGroups: (config: TabConfigItem[]) => SectionGroup[];
    getSectionForTab: (groups: SectionGroup[], tabId: string) => string | null;
    getSectionAccent: (groups: SectionGroup[], tabId: string) => string;
}

// ── Component registry ──────────────────────────────────────────────────

let _components: ComponentRegistry = {};

export function registerComponents(components: ComponentRegistry): void {
    _components = components;
}

// ── Tab configuration builder ──────────────────────────────────────────

export function buildTabConfig(): TabConfigItem[] {
    const DS = getDS();
    return [
        // ── Overview & Health ────────────────────────────────────────
        //    Top-level dashboards: fleet-wide health and single-DB overview
        { section: 'Overview', accent: DS.cyan },
        { id: 'fleet-overview',    icon: PanelTop,       label: 'Fleet Overview',        component: _components.FleetOverviewTab,        badge: null },
        { id: 'overview',          icon: Activity,       label: 'Database Overview',     component: _components.OverviewTab,             badge: null },
        { id: 'performance',       icon: Zap,            label: 'Performance',           component: _components.PerformanceTab,          badge: null },
        { id: 'resources',         icon: HardDrive,      label: 'Resources',             component: _components.ResourcesTab,            badge: null },
        { id: 'reliability',       icon: CheckCircle,    label: 'Reliability',           component: _components.ReliabilityTab,          badge: null },

        // ── Alerts & Rules ───────────────────────────────────────────
        //    All alerting in one place: active alerts, rule config, correlation
        { section: 'Alerts & Rules', accent: DS.rose },
        { id: 'alerts',            icon: Bell,           label: 'Active Alerts',         component: _components.AlertsComponent,         badge: '3' },
        { id: 'alert-rules',       icon: AlertOctagon,   label: 'Alert Rules',           component: _components.AlertRuleEditor,         badge: null },
        { id: 'alert-correlation', icon: Link2,          label: 'Alert Correlation',     component: _components.AlertCorrelationTab,     badge: null },

        // ── Query Analysis ───────────────────────────────────────────
        //    Query optimization, plan inspection, index management
        { section: 'Query Analysis', accent: DS.violet },
        { id: 'optimizer',         icon: DatabaseZap,    label: 'Query Optimizer',       component: _components.QueryOptimizerTab,       badge: null },
        { id: 'query-plan',        icon: Workflow,        label: 'Query Plan Viewer',     component: _components.QueryPlanViewer,         badge: null },
        { id: 'regression',        icon: TrendingUp,     label: 'Plan Regression',       component: _components.QueryPlanRegressionTab,  badge: null },
        { id: 'indexes',           icon: Layers,         label: 'Indexes',               component: _components.IndexesTab,              badge: null },
        { id: 'bloat',             icon: ScanSearch,     label: 'Bloat Analysis',        component: _components.BloatAnalysisTab,        badge: null },
        { id: 'Table',             icon: TableProperties,label: 'Table Analysis',        component: _components.TableAnalytics,          badge: null },

        // ── Schema & Data ────────────────────────────────────────────
        //    Schema browsing, visualization, migrations, and charting
        { section: 'Schema & Data', accent: DS.amber },
        { id: 'schema-tree',       icon: TreePine,       label: 'Schema Browser',        component: _components.SchemaTreeBrowser,       badge: null },
        { id: 'schema',            icon: FolderGit2,     label: 'Schema & Migrations',   component: _components.SchemaVersioningTab,     badge: null },
        { id: 'schema-visualizer', icon: Blocks,         label: 'Schema Visualizer',     component: _components.SchemaVisualizerTab,     badge: null },
        { id: 'table-dependencies',icon: ListTree,       label: 'Table Dependencies',    component: _components.TableDependencyMindMap,  badge: null },
        { id: 'chart-builder',     icon: BarChart3,      label: 'Chart Builder',         component: _components.ChartBuilder,            badge: null },

        // ── Infrastructure ───────────────────────────────────────────
        //    Connection pools, replication, maintenance, capacity
        { section: 'Infrastructure', accent: DS.emerald },
        { id: 'pool',              icon: Network,        label: 'Connection Pool',       component: _components.ConnectionPoolTab,       badge: null },
        { id: 'pool-metrics',      icon: Droplets,       label: 'Pool Metrics',          component: _components.PoolMetricsDashboard,    badge: null },
        { id: 'replication',       icon: Radio,          label: 'Replication & WAL',     component: _components.ReplicationWALTab,       badge: null },
        { id: 'checkpoint',        icon: CheckCircle,    label: 'Checkpoint Monitor',    component: _components.CheckpointMonitorTab,    badge: null },
        { id: 'maintenance',       icon: RefreshCw,      label: 'Vacuum & Maintenance',  component: _components.VacuumMaintenanceTab,    badge: null },
        { id: 'capacity',          icon: BarChart2,      label: 'Capacity Planning',     component: _components.CapacityPlanningTab,     badge: null },
        { id: 'backup',            icon: Archive,        label: 'Backup & Recovery',     component: _components.BackupRecoveryTab,       badge: null },

        // ── Security ─────────────────────────────────────────────────
        { section: 'Security', accent: DS.rose },
        { id: 'security',          icon: ShieldCheck,    label: 'Security & Compliance', component: _components.SecurityComplianceTab,   badge: null },

        // ── Observability ────────────────────────────────────────────
        //    Logs, tracing, external integrations, status
        { section: 'Observability', accent: DS.amber },
        { id: 'observability-hub', icon: Eye,            label: 'Observability Hub',     component: _components.ObservabilityHub,        badge: null },
        { id: 'cloudwatch',        icon: Cloud,          label: 'CloudWatch',            component: _components.CloudWatchTab,           badge: null },
        { id: 'log-patterns',      icon: FileSearch,     label: 'Log Pattern Analysis',  component: _components.LogPatternAnalysisTab,   badge: null },
        { id: 'opentelemetry',     icon: Radar,          label: 'OpenTelemetry',         component: _components.OpenTelemetryTab,        badge: null },
        { id: 'kubernetes',        icon: Container,      label: 'Kubernetes',            component: _components.KubernetesTab,           badge: null },
        { id: 'status-page',       icon: Globe,          label: 'Status Page',           component: _components.StatusPageTab,           badge: null },
        { id: 'ai-monitoring',     icon: Brain,          label: 'AI Monitoring',         component: _components.AIMonitoringTab,         badge: null },

        // ── Developer Tools ──────────────────────────────────────────
        { section: 'Developer Tools', accent: DS.violet },
        { id: 'sql',               icon: Terminal,       label: 'SQL Console',           component: _components.SqlConsoleTab,           badge: null },
        { id: 'api',               icon: Cpu,            label: 'API Tracing',           component: _components.ApiQueriesTab,           badge: null },
        { id: 'repository',        icon: GitBranch,      label: 'Repository',            component: _components.RepositoryTab,           badge: null },
        { id: 'ai-advisor',        icon: Brain,          label: 'AI Query Advisor',      component: _components.AIQueryAdvisorTab,       badge: null },

        // ── MongoDB ──────────────────────────────────────────────────
        { section: 'MongoDB', accent: DS.emerald },
        { id: 'mongo-overview',     icon: Database,          label: 'Mongo Overview',        component: _components.MongoOverviewTab,        badge: null },
        { id: 'mongo-performance',  icon: Gauge,             label: 'Mongo Performance',     component: _components.MongoPerformanceTab,     badge: null },
        { id: 'mongo-storage',      icon: HardDriveDownload, label: 'Mongo Storage',         component: _components.MongoStorageTab,         badge: null },
        { id: 'mongo-replication',  icon: GitMerge,          label: 'Mongo Replication',     component: _components.MongoReplicationTab,     badge: null },
        { id: 'mongo-data-tools',   icon: Workflow,          label: 'Mongo Data Tools',      component: _components.MongoDataToolsTab,       badge: null },
        { id: 'mongo-sharding',     icon: Server,            label: 'Mongo Sharding',        component: _components.MongoShardingTab,        badge: null },

        // ── Admin ────────────────────────────────────────────────────
        { section: 'Admin', accent: DS.rose },
        { id: 'tasks',             icon: CalendarCheck,  label: 'DBA Task Scheduler',    component: _components.DBATaskSchedulerTab,     badge: null },
        { id: 'UserManagement',    icon: Users,          label: 'User Management',       component: _components.UserManagementTab,       badge: null },
        { id: 'admin',             icon: Shield,         label: 'Admin Panel',           component: _components.AdminTab,                badge: null },
        { id: 'retention',         icon: Clock,          label: 'Data Retention',        component: _components.RetentionManagementTab,  badge: null },
        { id: 'report-builder',    icon: FileText,       label: 'Report Builder',        component: _components.ReportBuilderTab,        badge: null },
        { id: 'terraform',         icon: Download,       label: 'Terraform Export',      component: _components.TerraformExportTab,      badge: null },
        { id: 'custom-dashboard',  icon: LayoutDashboard,label: 'Custom Dashboards',     component: _components.CustomDashboardTab,      badge: null },
    ];
}

// ── Helper functions ───────────────────────────────────────────────────

export function getTabsOnly(config: TabConfigItem[]): TabEntry[] {
    return config.filter((t): t is TabEntry => 'id' in t);
}

export function getSectionGroups(config: TabConfigItem[]): SectionGroup[] {
    const groups: SectionGroup[] = [];
    let current: SectionGroup | null = null;

    for (const item of config) {
        if ('section' in item) {
            current = {
                section: item.section,
                tabs: [],
                accent: item.accent || getDS().cyan,
            };
            if (item.group) current.group = item.group;
            groups.push(current);
        } else if (current) {
            current.tabs.push(item);
        }
    }

    return groups;
}

export function getSectionForTab(groups: SectionGroup[], tabId: string): string | null {
    for (const g of groups) {
        if (g.tabs.some(t => t.id === tabId)) return g.section;
    }
    return null;
}

export function getSectionAccent(groups: SectionGroup[], tabId: string): string {
    for (const g of groups) {
        if (g.tabs.some(t => t.id === tabId)) return g.accent;
    }
    return getDS().cyan;
}

// ── Storage key constants ──────────────────────────────────────────────

export const STORAGE_KEYS = {
    ACTIVE_TAB: 'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED: 'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED: 'pg_monitor_notifications_dismissed',
    FEEDBACK_PROMPT: 'pg_monitor_feedback_prompt_shown',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
