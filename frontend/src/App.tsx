import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ConnectionProvider, useConnection } from './context/ConnectionContext';
import { NavigationContext } from './context/NavigationContext';
import { DemoProvider, useDemo, DEMO_USER } from './context/DemoContext';
import { THEME, ChartDefs, useAdaptiveTheme } from './utils/theme';
import { connectWS, postData } from './utils/api';
import { DS_DARK, DS_LIGHT, DS_ACCENTS, setDS, getDS } from './config/designTokens';
import { registerComponents, buildTabConfig, getTabsOnly, getSectionGroups, STORAGE_KEYS } from './config/tabConfig';

import LoginPage from './components/auth/LoginPage';
import ForcePasswordChangeModal from './components/auth/ForcePasswordChangeModal';
import { ToastProvider, useToast, Breadcrumbs, ProgressBar } from './components/ui/SharedComponents';

// Layout components (extracted from App.tsx)
import { AppStyles } from './components/layout/AppStyles';
import { FeedbackModal } from './components/layout/FeedbackModal';
import { ProfileModal } from './components/layout/ProfileModal';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { Sidebar } from './components/layout/Sidebar';
import { ConnectionSelector } from './components/layout/ConnectionSelector';

// Enterprise context providers and components
import { LicenseProvider } from './enterprise/context/LicenseContext';
import { OrgProvider } from './enterprise/context/OrgContext';
import LicenseGate from './enterprise/components/LicenseGate';
import LicenseStatus from './enterprise/components/LicenseStatus';
import OrgSwitcher from './enterprise/components/OrgSwitcher';

/* ── Retry wrapper for lazy imports (handles stale chunk hashes after deploy) ── */
const lazyRetry = (importFn) =>
    lazy(() =>
        importFn().catch((err) => {
            // Chunk fetch failed (likely stale hash after deploy) — force-reload once
            const key = 'vigil_chunk_retry';
            try {
                if (!sessionStorage.getItem(key)) {
                    sessionStorage.setItem(key, '1');
                    window.location.reload();
                    return new Promise(() => {}); // hang while reloading
                }
                sessionStorage.removeItem(key);
            } catch {
                /* sessionStorage unavailable — fall through */
            }
            // second attempt with cache-bust
            return importFn().catch(() => {
                // final fallback: hard reload with cache-bust query
                window.location.href = window.location.pathname + '?cb=' + Date.now();
                return new Promise(() => {});
            });
        }),
    );

const SSOCallback = lazyRetry(() => import('./components/auth/SSOCallback'));

/* ── Lazy-loaded tab components for faster initial load ── */
// Monitoring features
const OverviewTab = lazyRetry(() => import('./components/views/monitoring/OverviewTab'));
const PerformanceTab = lazyRetry(() => import('./components/views/monitoring/PerformanceTab'));
const ResourcesTab = lazyRetry(() => import('./components/views/monitoring/ResourcesTab'));
const CloudWatchTab = lazyRetry(() => import('./components/views/monitoring/CloudWatchTab'));
const CheckpointMonitorTab = lazyRetry(() => import('./components/views/monitoring/CheckpointMonitorTab'));

// Security features
const SecurityComplianceTab = lazyRetry(() => import('./components/views/security/SecurityComplianceTab'));
const AlertsComponent = lazyRetry(() => import('./components/views/security/AlertsTab'));
const AlertCorrelationTab = lazyRetry(() => import('./components/views/security/AlertCorrelationTab'));

// Database features
const IndexesTab = lazyRetry(() => import('./components/views/database/IndexesTab'));
const SqlConsoleTab = lazyRetry(() => import('./components/views/database/SqlConsoleTab'));
const BloatAnalysisTab = lazyRetry(() => import('./components/views/database/BloatAnalysisTab'));
const TableAnalytics = lazyRetry(() => import('./components/views/database/TableAnalytics'));
const QueryOptimizerTab = lazyRetry(() => import('./components/views/database/QueryOptimizerTab'));
const QueryPlanRegressionTab = lazyRetry(() => import('./components/views/database/QueryPlanRegressionTab'));
const SchemaVersioningTab = lazyRetry(() => import('./components/views/database/SchemaVersioningTab'));
const TableDependencyMindMap = lazyRetry(() => import('./components/views/database/TableDependencyMindMap'));

// Operations features
const BackupRecoveryTab = lazyRetry(() => import('./components/views/operations/BackupRecoveryTab'));
const VacuumMaintenanceTab = lazyRetry(() => import('./components/views/operations/VacuumMaintenanceTab'));
const DBATaskSchedulerTab = lazyRetry(() => import('./components/views/operations/DBATaskSchedulerTab'));
const ReplicationWALTab = lazyRetry(() => import('./components/views/operations/ReplicationWALTab'));
const ConnectionPoolTab = lazyRetry(() => import('./components/views/operations/ConnectionPoolTab'));

// Analytics features
const CapacityPlanningTab = lazyRetry(() => import('./components/views/analytics/CapacityPlanningTab'));
const LogPatternAnalysisTab = lazyRetry(() => import('./components/views/analytics/LogPatternAnalysisTab'));
const CustomDashboardTab = lazyRetry(() => import('./components/views/analytics/CustomDashboardTab'));
/* Demo data components removed — production metrics now served via metricsRegistry.js */

// Admin features
const AdminTab = lazyRetry(() => import('./components/views/admin/AdminTab'));
const RepositoryTab = lazyRetry(() => import('./components/views/admin/RepositoryTab'));
const ApiQueriesTab = lazyRetry(() => import('./components/views/admin/ApiQueriesTab'));
const RetentionManagementTab = lazyRetry(() => import('./components/views/admin/RetentionManagementTab'));
const TerraformExportTab = lazyRetry(() => import('./components/views/admin/TerraformExportTab'));
const ReportBuilderTab = lazyRetry(() => import('./components/views/admin/ReportBuilderTab'));

// Gap features — Monitoring
const OpenTelemetryTab = lazyRetry(() => import('./components/views/monitoring/OpenTelemetryTab'));
const KubernetesTab = lazyRetry(() => import('./components/views/monitoring/KubernetesTab'));
const StatusPageTab = lazyRetry(() => import('./components/views/monitoring/StatusPageTab'));
const AIMonitoringTab = lazyRetry(() => import('./components/views/monitoring/AIMonitoringTab'));
const ObservabilityHub = lazyRetry(() => import('./components/views/monitoring/ObservabilityHub'));
const SDKDashboardTab = lazyRetry(() => import('./components/views/monitoring/SDKDashboardTab'));

// Gap features — Database
const AIQueryAdvisorTab = lazyRetry(() => import('./components/views/database/AIQueryAdvisorTab'));

// MySQL features
const MySQLOverviewTab = lazyRetry(() => import('./components/views/mysql/MySQLOverviewTab'));
const MySQLPerformanceTab = lazyRetry(() => import('./components/views/mysql/MySQLPerformanceTab'));
const MySQLReplicationTab = lazyRetry(() => import('./components/views/mysql/MySQLReplicationTab'));

// MongoDB features
const MongoOverviewTab = lazyRetry(() => import('./components/views/mongodb/MongoOverviewTab'));
const MongoPerformanceTab = lazyRetry(() => import('./components/views/mongodb/MongoPerformanceTab'));
const MongoStorageTab = lazyRetry(() => import('./components/views/mongodb/MongoStorageTab'));
const MongoReplicationTab = lazyRetry(() => import('./components/views/mongodb/MongoReplicationTab'));
const MongoDataToolsTab = lazyRetry(() => import('./components/views/mongodb/MongoDataToolsTab'));
const MongoShardingTab = lazyRetry(() => import('./components/views/mongodb/MongoShardingTab'));

// Demo
const DemoPostgresTab = lazyRetry(() => import('./components/views/demo/DemoPostgresTab'));
const DemoMySQLTab = lazyRetry(() => import('./components/views/demo/DemoMySQLTab'));
const DemoMongoDBTab = lazyRetry(() => import('./components/views/demo/DemoMongoDBTab'));

// Other
const ReliabilityTab = lazyRetry(() => import('./components/views/ReliabilityTab'));
const UserManagementTab = lazyRetry(() => import('./usermanagement/UserManagementTab'));
const AuditAndSecurityTab = lazyRetry(() => import('./usermanagement/AuditAndSecurityTab'));

// Phase 1 — Connection Onboarding
const ConnectionWizard = lazyRetry(() => import('./components/views/onboarding/ConnectionWizard'));

// Phase 2 — Multi-DB Fleet Dashboard
const FleetOverviewTab = lazyRetry(() => import('./components/views/monitoring/FleetOverviewTab'));

// Phase 3 — Visualization Layer
const QueryPlanViewer = lazyRetry(() => import('./components/views/database/QueryPlanViewer'));
const ChartBuilder = lazyRetry(() => import('./components/views/database/ChartBuilder'));

// Phase 4 — Monitoring & Reliability
const AlertRuleEditor = lazyRetry(() => import('./components/views/monitoring/AlertRuleEditor'));
const PoolMetricsDashboard = lazyRetry(() => import('./components/views/monitoring/PoolMetricsDashboard'));

// Layout — Enhanced Connection Switcher (replaces inline ConnectionSelector)
const ConnectionSwitcherLazy = lazyRetry(() => import('./components/layout/ConnectionSwitcher'));

// Shared — Per-section error boundary for graceful tab-level recovery (eager — must be class component)
import SectionErrorBoundary from './components/shared/SectionErrorBoundary';
const ErrorBoundary = SectionErrorBoundary;
import CommandPalette from './components/shared/CommandPalette';

// Enterprise edition
const LicenseManagement = lazyRetry(() => import('./enterprise/views/LicenseManagement'));
const OrgManagement = lazyRetry(() => import('./enterprise/views/OrgManagement'));

import {
    Activity,
    Zap,
    CheckCircle,
    HardDrive,
    Layers,
    Shield,
    Terminal,
    Network,
    LogOut,
    Database,
    WifiOff,
    Bell,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    AlertCircle,
    X,
    User,
    GitBranch,
    Users,
    TrendingUp,
    MessageSquarePlus,
    Star,
    Send,
    Archive,
    RefreshCw,
    Radio,
    Cloud,
    CalendarCheck,
    FileSearch,
    Link2,
    Cpu,
    BarChart2,
    Lock,
    ThumbsUp,
    Lightbulb,
    AlertTriangle,
    PlusCircle,
    Sun,
    Moon,
    Save,
    Edit2,
    Radar,
    Brain,
    Container,
    LayoutDashboard,
    Globe,
    Download,
    Clock,
} from 'lucide-react';
import { WebSocketStatus, AlertBanner } from './components/ui/SharedComponents';

/* ── Local DS alias — kept in sync with designTokens module by setDS() ── */
let DS = getDS();

/* ── Register lazy-loaded components with tabConfig ── */
registerComponents({
    OverviewTab,
    PerformanceTab,
    ResourcesTab,
    ReliabilityTab,
    AlertsComponent,
    QueryOptimizerTab,
    IndexesTab,
    QueryPlanRegressionTab,
    BloatAnalysisTab,
    TableAnalytics,
    ConnectionPoolTab,
    ReplicationWALTab,
    CheckpointMonitorTab,
    VacuumMaintenanceTab,
    CapacityPlanningTab,
    BackupRecoveryTab,
    SchemaVersioningTab,
    TableDependencyMindMap,
    SecurityComplianceTab,
    CloudWatchTab,
    LogPatternAnalysisTab,
    AlertCorrelationTab,
    OpenTelemetryTab,
    KubernetesTab,
    StatusPageTab,
    AIMonitoringTab,
    ObservabilityHub,
    SDKDashboardTab,
    SqlConsoleTab,
    ApiQueriesTab,
    RepositoryTab,
    AIQueryAdvisorTab,
    DBATaskSchedulerTab,
    UserManagementTab,
    AuditAndSecurityTab,
    AdminTab,
    RetentionManagementTab,
    TerraformExportTab,
    ReportBuilderTab,
    CustomDashboardTab,
    MySQLOverviewTab,
    MySQLPerformanceTab,
    MySQLReplicationTab,
    MongoOverviewTab,
    MongoPerformanceTab,
    MongoStorageTab,
    MongoReplicationTab,
    MongoDataToolsTab,
    MongoShardingTab,
    DemoPostgresTab,
    DemoMySQLTab,
    DemoMongoDBTab,
    // Phase 1–4 new components
    FleetOverviewTab,
    ConnectionWizard,
    QueryPlanViewer,
    ChartBuilder,
    AlertRuleEditor,
    PoolMetricsDashboard,
});

const useWebSocket = (onMessage) => {
    const [connected, setConnected] = useState(false);
    const [reconnecting] = useState(false); // polling never shows "reconnecting"
    const stopRef = useRef(null);

    useEffect(() => {
        // connectWS now uses HTTP polling — no WebSocket, works on Vercel
        stopRef.current = connectWS((msg) => {
            setConnected(true);
            onMessage(msg);
        });
        return () => {
            if (stopRef.current) stopRef.current();
        };
    }, [onMessage]);

    return { connected, reconnecting };
};

const Dashboard = ({ onLogout }) => (
    <ErrorBoundary>
        <ConnectionProvider>
            {/* Enterprise providers (hidden — uncomment when ready) */}
            {/* <LicenseProvider><OrgProvider> */}
            <DashboardInner onLogout={onLogout} />
            {/* </OrgProvider></LicenseProvider> */}
        </ConnectionProvider>
    </ErrorBoundary>
);

const DashboardInner = ({ onLogout }) => {
    const { logout: authLogout, currentUser: authUser } = useAuth();
    const { isDemo, demoUser } = useDemo();
    const currentUser = authUser || (isDemo ? demoUser : null);
    // Use the parent-provided onLogout (which plays the fade-out) if available,
    // falling back to the raw logout for any edge-cases.
    const logout = onLogout || authLogout;
    const { isDark } = useTheme();
    useAdaptiveTheme(); // also keeps module-level THEME in sync for ChartDefs + GlobalStyles

    /* Keep module-level DS in sync with ThemeContext on every render */
    DS = isDark ? DS_DARK : DS_LIGHT;
    setDS(DS);

    // Default to 'overview' always. The ACTIVE_TAB key is cleared by AuthContext
    // on logout, so every fresh login session starts at the Overview page.
    // Within a session, tab navigation is persisted as before.
    const [activeTab, setActiveTab] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
            // Migrate legacy default: UserManagement → connections
            if (saved === 'UserManagement') return 'connections';
            return saved || 'connections';
        } catch {
            return 'connections';
        }
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
        } catch {
            return false;
        }
    });
    const [notifications, setNotifications] = useState([]);
    const [latestAlert, setLatestAlert] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profileUser, setProfileUser] = useState(currentUser);
    const prevTabRef = useRef(activeTab);

    // Feedback prompt
    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPT)) {
            const t = setTimeout(() => {
                setShowFeedback(true);
                localStorage.setItem(STORAGE_KEYS.FEEDBACK_PROMPT, 'true');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, []);

    const handleWSMessage = useCallback((msg) => {
        if (msg.type === 'alert') {
            const n = {
                id: Date.now(),
                title: msg.payload.title || 'Alert',
                message: msg.payload.message,
                severity: msg.payload.severity || 'info',
                timestamp: Date.now(),
                read: false,
            };
            setNotifications((p) => [n, ...p].slice(0, MAX_NOTIFICATIONS));
            setLatestAlert(msg.payload);
            setTimeout(() => setLatestAlert(null), ALERT_AUTO_DISMISS_TIME);
        }
    }, []);

    const { connected, reconnecting } = useWebSocket(handleWSMessage);
    const { activeConnection, loading: connectionsLoading } = useConnection();

    // Track whether ConnectionContext has completed its first load.
    // Until that happens, we must NOT redirect — activeConnection is null
    // simply because the API hasn't responded yet, not because there's no connection.
    const connectionsInitialized = useRef(false);
    useEffect(() => {
        if (!connectionsLoading) connectionsInitialized.current = true;
    }, [connectionsLoading]);

    // Track the previous activeConnection id to detect actual connection *changes*
    // (switch/delete), as opposed to first-load resolution.
    const prevConnectionId = useRef(activeConnection?.id ?? '__initial__');

    // Auto-navigate to appropriate overview tab when connection changes
    // This ensures users see the right dashboard after switching databases
    // Also redirects to connections tab when no connection exists and user is on a connection-dependent tab
    useEffect(() => {
        // Don't redirect while connections are still loading from the backend
        if (!connectionsInitialized.current) return;

        // No connection → only demo tabs, connections, and user management are allowed
        if (!activeConnection) {
            if (activeTab?.startsWith('demo-')) return;
            if (activeTab === 'connections') return;
            if (activeTab === 'UserManagement' || activeTab === 'user-audit') return;
            setActiveTab('connections');
            try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, 'connections');
            } catch {}
            prevConnectionId.current = null;
            return;
        }

        const dbType = activeConnection.dbType?.toLowerCase();
        let targetTab = 'overview'; // Default to PostgreSQL overview

        if (dbType === 'mysql' || dbType === 'mariadb') {
            targetTab = 'mysql-overview';
        } else if (dbType === 'mongodb') {
            targetTab = 'mongo-overview';
        }

        // Only auto-navigate when the connection actually CHANGES (user switched DBs),
        // NOT on initial page load where we should respect the saved tab.
        const connectionChanged = prevConnectionId.current !== '__initial__'
            && prevConnectionId.current !== activeConnection.id;
        prevConnectionId.current = activeConnection.id;

        if (!connectionChanged) return; // On page load, stay on the saved tab

        // Only navigate if we're not already on a relevant tab for this connection
        // This avoids jarring navigation if user is already viewing a universal tab (like Alerts)
        const isRelevantTab = (tabId) => {
            // Always allow demo tabs and connections
            if (tabId?.startsWith('demo-')) return true;
            if (tabId === 'connections') return true;
            // Always allow universal sections
            const universalSections = [
                'Overview',
                'Alerts & Rules',
                'Security',
                'Observability',
                'Developer Tools',
                'User Management',
                'Admin',
                'Connections',
            ];
            const currentSection = SECTION_GROUPS.find((g) => g.tabs.some((t) => t.id === tabId))?.section;
            if (universalSections.includes(currentSection)) return true;

            // For DB-specific tabs, only allow if they match current connection
            if (
                dbType === 'postgresql' &&
                ['Query Analysis', 'Schema & Data', 'Infrastructure'].includes(currentSection)
            )
                return true;
            if ((dbType === 'mysql' || dbType === 'mariadb') && currentSection === 'MySQL') return true;
            if (dbType === 'mongodb' && currentSection === 'MongoDB') return true;
            return false;
        };

        // Only auto-navigate if current tab is not relevant for this connection
        if (!isRelevantTab(activeTab)) {
            setActiveTab(targetTab);
            try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, targetTab);
            } catch {}
        }
    }, [connectionsLoading, activeConnection?.id, activeTab]); // Re-run when loading finishes, connection changes, or tab changes

    const allowedTabIds = useMemo(
        () =>
            TABS_ONLY.filter((t) => {
                // Demo tabs are always visible for any logged-in user
                if (t.id.startsWith('demo-')) return true;
                // If user is logged in, show all tabs
                if (currentUser) return true;
                // Fallback: check allowedScreens
                return (currentUser?.allowedScreens || []).includes(t.id);
            }).map((t) => t.id),
        [currentUser],
    );

    const ActiveComponent = useMemo(() => {
        const tab = TABS_ONLY.find((t) => t.id === activeTab && allowedTabIds.includes(t.id));
        if (tab) return tab.component;
        return TABS_ONLY.find((t) => allowedTabIds.includes(t.id))?.component;
    }, [activeTab, allowedTabIds]);

    const activeTabMeta = useMemo(() => TABS_ONLY.find((t) => t.id === activeTab), [activeTab]);
    const accent = useMemo(() => getSectionAccent(activeTab), [activeTab]);
    const isDemoFullPage = activeTab?.startsWith('demo-');

    const handleTabChange = useCallback(
        (id) => {
            prevTabRef.current = activeTab;
            setActiveTab(id);
            try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, id);
            } catch {}
        },
        [activeTab],
    );

    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed((p) => {
            const v = !p;
            try {
                localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, v.toString());
            } catch {}
            return v;
        });
    }, []);

    const handleDismissNotification = useCallback((id) => setNotifications((p) => p.filter((n) => n.id !== id)), []);
    const handleClearAllNotifications = useCallback(() => setNotifications([]), []);

    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    /* Keyboard shortcuts: Ctrl+B (sidebar), Ctrl+K (search), Ctrl+? (help), etc. */
    useEffect(() => {
        const handler = (e) => {
            const isMod = e.ctrlKey || e.metaKey;

            // Escape: Close help dialog if open
            if (e.key === 'Escape' && showKeyboardHelp) {
                e.preventDefault();
                setShowKeyboardHelp(false);
                return;
            }

            // Ctrl+B: Toggle sidebar
            if (isMod && e.key === 'b') {
                e.preventDefault();
                handleToggleCollapse();
            }
            // Ctrl+?: Show keyboard help
            else if (isMod && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
                e.preventDefault();
                setShowKeyboardHelp((prev) => !prev);
            }
            // Ctrl+O: Go to overview
            else if (isMod && e.key === 'o') {
                e.preventDefault();
                handleTabChange('overview');
            }
            // Ctrl+Shift+D: Toggle demo mode
            else if (isMod && e.shiftKey && e.key === 'd') {
                e.preventDefault();
                // Demo mode toggle would be handled by DemoContext
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleToggleCollapse, handleTabChange, showKeyboardHelp]);

    return (
        <NavigationContext.Provider value={{ goToTab: handleTabChange }}>
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    background: isDemoFullPage ? THEME.surfaceHover : DS.bg,
                    color: isDemoFullPage ? THEME.bg : DS.textPrimary,
                    overflow: 'hidden',
                    fontFamily: DS.fontUI,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <AppStyles />
                <ChartDefs />
                <AmbientOrbs />

                {!isDemoFullPage && (
                    <Sidebar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        onLogout={logout}
                        currentUser={profileUser}
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={handleToggleCollapse}
                        onOpenFeedback={() => setShowFeedback(true)}
                        onOpenProfile={() => setShowProfile(true)}
                        allowedTabIds={allowedTabIds}
                    />
                )}

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* ── TOP HEADER ── */}
                    <header
                        style={{
                            height: isDemoFullPage ? 0 : 54,
                            flexShrink: 0,
                            borderBottom: isDemoFullPage ? 'none' : `1px solid ${DS.border}`,
                            display: isDemoFullPage ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 24px',
                            background: DS.headerBg,
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 40,
                        }}
                    >
                        {/* Clean bottom border — no animation */}

                        {/* Left: breadcrumb + reconnecting */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {/* Breadcrumb navigation — shows current section / tab */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: DS.textMuted,
                                            fontFamily: DS.fontMono,
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        {getSectionForTab(activeTab) || 'Core'}
                                    </span>
                                    <span style={{ color: DS.textMuted, fontSize: 13 }}>/</span>
                                    <h2
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 700,
                                            margin: 0,
                                            color: DS.textPrimary,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {activeTabMeta?.label || ''}
                                    </h2>
                                </div>
                            </div>

                            {reconnecting && (
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: DS.amber,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 10px',
                                        background: 'rgba(251,191,36,0.08)',
                                        borderRadius: 20,
                                        border: '1px solid rgba(251,191,36,0.25)',
                                        fontFamily: DS.fontMono,
                                    }}
                                >
                                    <WifiOff size={12} style={{ animation: 'pulse 1.5s infinite' }} />
                                    RECONNECTING…
                                </div>
                            )}
                        </div>

                        {/* Right: connection switcher + status + refresh + bell + theme */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <Suspense fallback={<ConnectionSelector />}>
                                <ConnectionSwitcherLazy />
                            </Suspense>
                            <div style={{ width: 1, height: 24, background: DS.border }} />
                            <GlobalRefreshButton />
                            <ThemeToggle />
                            <StatusPill connected={connected} />
                            <NotificationCenter
                                notifications={notifications}
                                onDismiss={handleDismissNotification}
                                onClearAll={handleClearAllNotifications}
                            />
                        </div>
                    </header>

                    {/* Demo mode banner removed — live data only */}

                    {/* ── MAIN CONTENT ── */}
                    <div
                        className="main-scroll"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            position: 'relative',
                            background: isDemoFullPage
                                ? 'transparent'
                                : DS.bg,
                        }}
                    >
                        {/* Floating alert toast */}
                        {latestAlert && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 78,
                                    right: 28,
                                    zIndex: 200,
                                    width: 380,
                                    animation: 'slideInRight 0.3s cubic-bezier(0.34,1.4,0.64,1) both',
                                }}
                            >
                                <div
                                    style={{
                                        background: DS.surface,
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: `1px solid ${SEV_COLORS[latestAlert.severity] || DS.cyan}50`,
                                        boxShadow: DS.shadowCard,
                                    }}
                                >
                                    <div
                                        style={{ height: 2.5, background: SEV_COLORS[latestAlert.severity] || DS.cyan }}
                                    />
                                    <AlertBanner alert={latestAlert} onDismiss={() => setLatestAlert(null)} />
                                </div>
                            </div>
                        )}

                        <div
                            style={{
                                padding: isDemoFullPage ? 0 : '16px 20px',
                                width: '100%',
                                minHeight: '100%',
                                position: 'relative',
                            }}
                        >
                            <ErrorBoundary key={activeTab}>
                                <Suspense
                                    fallback={
                                        <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
                                            {/* Enhanced loading state with skeleton cards */}
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                    gap: 16,
                                                    marginBottom: 24,
                                                }}
                                            >
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            height: 160,
                                                            borderRadius: 12,
                                                            background: `linear-gradient(90deg, ${DS.surface} 0%, ${DS.surfaceHover} 50%, ${DS.surface} 100%)`,
                                                            backgroundSize: '200% 100%',
                                                            animation: 'shimmer 2s infinite',
                                                            border: `1px solid ${DS.border}`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div
                                                style={{
                                                    height: 300,
                                                    borderRadius: 12,
                                                    background: `linear-gradient(90deg, ${DS.surface} 0%, ${DS.surfaceHover} 50%, ${DS.surface} 100%)`,
                                                    backgroundSize: '200% 100%',
                                                    animation: 'shimmer 2s infinite',
                                                    border: `1px solid ${DS.border}`,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: 24,
                                                    gap: 12,
                                                    color: DS.textMuted,
                                                    fontFamily: DS.fontUI,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: '50%',
                                                        border: `2px solid ${DS.border}`,
                                                        borderTopColor: DS.cyan,
                                                        animation: 'rotate 0.9s linear infinite',
                                                    }}
                                                />
                                                <span style={{ fontSize: 13 }}>Loading tab…</span>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div
                                        key={activeTab}
                                        className="tab-mount"
                                        role="tabpanel"
                                        aria-labelledby={`${activeTab}-tab`}
                                    >
                                        <SectionErrorBoundary
                                            sectionName={activeTabMeta?.label || activeTab}
                                            key={activeTab}
                                        >
                                            {ActiveComponent && <ActiveComponent tabId={activeTab} />}
                                        </SectionErrorBoundary>
                                    </div>
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
                </main>

                {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} initialSection={activeTab} />}
                {showProfile && (
                    <ProfileModal
                        user={profileUser}
                        onClose={() => setShowProfile(false)}
                        onSave={(u) => setProfileUser(u)}
                    />
                )}

                {/* Keyboard Shortcuts Help Modal */}
                {showKeyboardHelp && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.2s ease-out',
                        }}
                        onClick={(e) => e.target === e.currentTarget && setShowKeyboardHelp(false)}
                    >
                        <div
                            style={{
                                background: DS.surface,
                                border: `1px solid ${DS.borderAccent}`,
                                borderRadius: 16,
                                width: 520,
                                maxWidth: '90vw',
                                maxHeight: '80vh',
                                boxShadow: `${DS.shadowDeep}`,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                animation: 'slideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both',
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    padding: '20px 26px 18px',
                                    borderBottom: `1px solid ${DS.border}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            margin: '0 0 4px',
                                            fontSize: 17,
                                            fontWeight: 700,
                                            color: DS.textPrimary,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Keyboard Shortcuts
                                    </h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 11,
                                            color: DS.textMuted,
                                            fontFamily: DS.fontMono,
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        Press Ctrl+? anytime to toggle this dialog
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowKeyboardHelp(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${DS.border}`,
                                        color: DS.textSub,
                                        cursor: 'pointer',
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(251,113,133,0.12)';
                                        e.currentTarget.style.color = DS.rose;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.color = DS.textSub;
                                    }}
                                >
                                    <X size={15} strokeWidth={2} />
                                </button>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    {/* Navigation */}
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: '0.02em',
                                                color: DS.cyan,
                                                marginBottom: 12,
                                            }}
                                        >
                                            Navigation
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <kbd
                                                    style={{
                                                        fontSize: 11,
                                                        color: DS.textMuted,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${DS.border}`,
                                                        padding: '4px 8px',
                                                        borderRadius: 14,
                                                        fontFamily: DS.fontMono,
                                                    }}
                                                >
                                                    Ctrl+B
                                                </kbd>
                                                <span style={{ fontSize: 12, color: DS.textSub }}>Toggle sidebar</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <kbd
                                                    style={{
                                                        fontSize: 11,
                                                        color: DS.textMuted,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${DS.border}`,
                                                        padding: '4px 8px',
                                                        borderRadius: 14,
                                                        fontFamily: DS.fontMono,
                                                    }}
                                                >
                                                    Ctrl+K
                                                </kbd>
                                                <span style={{ fontSize: 12, color: DS.textSub }}>Focus search</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <kbd
                                                    style={{
                                                        fontSize: 11,
                                                        color: DS.textMuted,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${DS.border}`,
                                                        padding: '4px 8px',
                                                        borderRadius: 14,
                                                        fontFamily: DS.fontMono,
                                                    }}
                                                >
                                                    Ctrl+O
                                                </kbd>
                                                <span style={{ fontSize: 12, color: DS.textSub }}>Go to Overview</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: '0.02em',
                                                color: DS.emerald,
                                                marginBottom: 12,
                                            }}
                                        >
                                            Other
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <kbd
                                                    style={{
                                                        fontSize: 11,
                                                        color: DS.textMuted,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${DS.border}`,
                                                        padding: '4px 8px',
                                                        borderRadius: 14,
                                                        fontFamily: DS.fontMono,
                                                    }}
                                                >
                                                    Ctrl+?
                                                </kbd>
                                                <span style={{ fontSize: 12, color: DS.textSub }}>Show this help</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <kbd
                                                    style={{
                                                        fontSize: 11,
                                                        color: DS.textMuted,
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: `1px solid ${DS.border}`,
                                                        padding: '4px 8px',
                                                        borderRadius: 14,
                                                        fontFamily: DS.fontMono,
                                                    }}
                                                >
                                                    Esc
                                                </kbd>
                                                <span style={{ fontSize: 12, color: DS.textSub }}>
                                                    Close this dialog
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: 20,
                                        padding: '12px 14px',
                                        background: `${DS.cyan}10`,
                                        border: `1px solid ${DS.cyan}30`,
                                        borderRadius: 8,
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: 12, color: DS.textSub, lineHeight: 1.5 }}>
                                        Tip: Use the search bar (Ctrl+K) to quickly find tabs by name.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Command Palette (Ctrl+K) */}
                <CommandPalette />
            </div>
        </NavigationContext.Provider>
    );
};

/* ─────────────────────────────────────────────────────────────────
   LOADING SCREEN
   ───────────────────────────────────────────────────────────────── */
const LoadingScreen = () => (
    <div
        style={{
            height: '100vh',
            background: DS.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            color: DS.textPrimary,
            fontFamily: DS.fontUI,
        }}
    >
        <div style={{ position: 'relative', width: 56, height: 56 }}>
            {/* Spinning ring */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `2px solid ${DS.border}`,
                    borderTopColor: DS.cyan,
                    animation: 'rotate 1.1s linear infinite',
                }}
            />
            {/* Inner logo */}
            <div
                style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${DS.cyan}30, ${DS.violet}30)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Database color={DS.cyan} size={18} />
            </div>
        </div>
        <div>
            <div
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: DS.textPrimary,
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                }}
            >
                Vigil
            </div>
            <div
                style={{
                    fontSize: 11,
                    color: DS.textMuted,
                    textAlign: 'center',
                    marginTop: 4,
                    fontFamily: DS.fontMono,
                    letterSpacing: '0.02em',
                }}
            >
                INITIALIZING…
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   AUTH CONSUMER + APP ENTRY
   ─────────────────────────────────────────────────────────────────
   Handles the login→dashboard and logout→login transitions.

   Login flow:
     - LoginPage fires login() → AuthContext sets currentUser
     - We hold the route switch for LOGIN_REDIRECT_DELAY ms so the
       "Authenticated / Redirecting…" success animation has time to
       complete before we unmount the login page.

   Logout flow:
     - Dashboard calls handleLogout() → starts a 400 ms fade-out
       overlay, then calls AuthContext logout() which clears the user
       and triggers the route change to /login.
   ───────────────────────────────────────────────────────────────── */

const AuthConsumer = () => {
    const { currentUser, loading, logout, mustChangePassword, clearMustChangePassword } = useAuth();
    const { isDemo, enterDemo, exitDemo } = useDemo();

    // readyToEnter is true immediately when logged in — no delay needed
    // (the login-success overlay has been removed; we go straight to the dashboard)
    const [readyToEnter, setReadyToEnter] = useState(!!currentUser || isDemo);
    const prevUser = useRef(currentUser);

    useEffect(() => {
        // User just logged in or demo activated → enter immediately
        if ((!prevUser.current && currentUser) || isDemo) {
            setReadyToEnter(true);
            prevUser.current = currentUser;
            return;
        }
        // User logged out and not demo → reset gate for next login
        if (prevUser.current && !currentUser && !isDemo) {
            setReadyToEnter(false);
        }
        prevUser.current = currentUser;
    }, [currentUser, isDemo]);

    // ── Logout fade-out ──────────────────────────────────────────
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = useCallback(() => {
        setLoggingOut(true);
        // Wait for fade-out animation, then clear auth state
        setTimeout(() => {
            if (isDemo) exitDemo();
            logout();
            setLoggingOut(false);
        }, 400);
    }, [logout, isDemo, exitDemo]);

    if (loading) return <LoadingScreen />;

    return (
        <Router>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* 1. Login Route: redirect immediately to dashboard if already logged in */}
                    <Route
                        path="/login"
                        element={!currentUser && !isDemo ? <LoginPage /> : <Navigate to="/" replace />}
                    />

                    {/* 2. SSO Callback Route */}
                    <Route path="/auth/callback" element={<SSOCallback />} />

                    {/* 3. Connection Onboarding Wizard */}
                    <Route
                        path="/onboarding"
                        element={
                            currentUser || isDemo ? (
                                <NavigationContext.Provider value={{ goToTab: () => (window.location.href = '/') }}>
                                    <ConnectionWizard />
                                </NavigationContext.Provider>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* 4. Protected Dashboard Route */}
                    <Route
                        path="/"
                        element={
                            (currentUser || isDemo) && readyToEnter ? (
                                <ErrorBoundary>
                                    {/* Force password change modal — blocks dashboard access */}
                                    {mustChangePassword && !isDemo && (
                                        <ForcePasswordChangeModal
                                            onSuccess={clearMustChangePassword}
                                            onLogout={handleLogout}
                                        />
                                    )}
                                    {/* Full-screen fade overlay shown during logout */}
                                    {loggingOut && (
                                        <div
                                            style={{
                                                position: 'fixed',
                                                inset: 0,
                                                zIndex: 500,
                                                background: DS.bg,
                                                animation: 'fadeIn 0.4s ease-out both',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                gap: 16,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${DS.border}`,
                                                    borderTopColor: DS.cyan,
                                                    animation: 'rotate 0.9s linear infinite',
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: DS.textMuted,
                                                    fontFamily: DS.fontMono,
                                                    letterSpacing: '0.02em',
                                                }}
                                            >
                                                SIGNING OUT…
                                            </span>
                                        </div>
                                    )}
                                    <Dashboard onLogout={handleLogout} />
                                </ErrorBoundary>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* 5. Catch-all 404 Route */}
                    <Route
                        path="*"
                        element={
                            (currentUser || isDemo) && readyToEnter ? (
                                <ErrorBoundary>
                                    <NotFoundPage />
                                </ErrorBoundary>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default function App() {
    return (
        <ErrorBoundary>
            <DemoProvider>
                <AuthProvider>
                    <ToastProvider>
                        <AuthConsumer />
                    </ToastProvider>
                </AuthProvider>
            </DemoProvider>
        </ErrorBoundary>
    );
}