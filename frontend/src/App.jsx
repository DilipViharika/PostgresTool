import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { THEME, ChartDefs } from './utils/theme.jsx';
import { connectWS, postData } from './utils/api';
import LoginPage from './components/auth/LoginPage.jsx';

import OverviewTab from './components/views/OverviewTab.jsx';
import PerformanceTab from './components/views/PerformanceTab.jsx';
import ReliabilityTab from './components/views/ReliabilityTab.jsx';
import ResourcesTab from './components/views/ResourcesTab.jsx';
import IndexesTab from './components/views/IndexesTab.jsx';
import AdminTab from './components/views/AdminTab.jsx';
import SqlConsoleTab from './components/views/SqlConsoleTab.jsx';
import ApiQueriesTab from './components/views/ApiQueriesTab.jsx';
import UserManagementTab from './usermanagement/UserManagementTab.jsx';
import RepositoryTab from './components/views/RepositoryTab.jsx';
import AlertsComponent from './components/AlertsComponent';
import ConnectionsTab from './components/views/ConnectionsTab.jsx';
import QueryOptimizerTab from './components/views/QueryOptimizerTab.jsx';
import ConnectionPoolTab from './components/views/ConnectionPoolTab.jsx';
import SchemaVersioningTab from "./components/views/SchemaVersioningTab.jsx";
import SecurityComplianceTab from './components/views/SecurityComplianceTab.jsx';
import CapacityPlanningTab from './components/views/CapacityPlanningTab.jsx';
import BackupRecoveryTab from './components/views/BackupRecoveryTab.jsx';
import CheckpointMonitorTab from './components/views/CheckpointMonitorTab.jsx';
import VacuumMaintenanceTab from './components/views/VacuumMaintenanceTab.jsx';
import ReplicationWALTab from './components/views/ReplicationWALTab.jsx';
import BloatAnalysisTab from './components/views/BloatAnalysisTab.jsx';
import QueryPlanRegressionTab from './components/views/QueryPlanRegressionTab.jsx';
import CloudWatchTab from './components/views/CloudWatchTab.jsx';
import DBATaskSchedulerTab from './components/views/DBATaskSchedulerTab.jsx';
import LogPatternAnalysisTab from './components/views/LogPatternAnalysisTab.jsx';
import AlertCorrelationTab from './components/views/AlertCorrelationTab.jsx';

import {
    Activity, Zap, CheckCircle, HardDrive, Layers, Shield, Terminal, Network,
    LogOut, Database, WifiOff, Bell, ChevronLeft, ChevronRight, ChevronDown,
    AlertCircle, X, User, GitBranch, Users, TrendingUp,
    MessageSquarePlus, Star, Send, Archive, RefreshCw, Radio, Cloud,
    CalendarCheck, FileSearch, Link2
} from 'lucide-react';
import { WebSocketStatus, AlertBanner } from './components/ui/SharedComponents.jsx';

/* ═══════════════════════════════════════════════════════════════════════════
   TAB CONFIG  — section headers drive collapsible groups in the sidebar
   ═══════════════════════════════════════════════════════════════════════════ */
const TAB_CONFIG = [
    { section: 'Core Monitoring' },
    { id: 'overview',          icon: Activity,      label: 'Overview',              component: OverviewTab },
    { id: 'connections',       icon: Database,      label: 'Connections',           component: ConnectionsTab },
    { id: 'performance',       icon: Zap,           label: 'Performance',           component: PerformanceTab },
    { id: 'resources',         icon: HardDrive,     label: 'Resources',             component: ResourcesTab },
    { id: 'reliability',       icon: CheckCircle,   label: 'Reliability',           component: ReliabilityTab },
    { id: 'alerts',            icon: Bell,          label: 'Alerts',                component: AlertsComponent },

    { section: 'Query & Indexes' },
    { id: 'optimizer',         icon: Zap,           label: 'Query Optimizer',       component: QueryOptimizerTab },
    { id: 'indexes',           icon: Layers,        label: 'Indexes',               component: IndexesTab },
    { id: 'regression',        icon: TrendingUp,    label: 'Plan Regression',       component: QueryPlanRegressionTab },
    { id: 'bloat',             icon: Layers,        label: 'Bloat Analysis',        component: BloatAnalysisTab },

    { section: 'Infrastructure' },
    { id: 'pool',              icon: Network,       label: 'Connection Pool',       component: ConnectionPoolTab },
    { id: 'replication',       icon: Radio,         label: 'Replication & WAL',     component: ReplicationWALTab },
    { id: 'checkpoint',        icon: CheckCircle,   label: 'Checkpoint Monitor',    component: CheckpointMonitorTab },
    { id: 'maintenance',       icon: RefreshCw,     label: 'Vacuum & Maintenance',  component: VacuumMaintenanceTab },
    { id: 'capacity',          icon: TrendingUp,    label: 'Capacity Planning',     component: CapacityPlanningTab },
    { id: 'backup',            icon: Archive,       label: 'Backup & Recovery',     component: BackupRecoveryTab },

    { section: 'Schema & Security' },
    { id: 'schema',            icon: Layers,        label: 'Schema & Migrations',   component: SchemaVersioningTab },
    { id: 'security',          icon: Shield,        label: 'Security & Compliance', component: SecurityComplianceTab },

    { section: 'Observability' },
    { id: 'cloudwatch',        icon: Cloud,         label: 'CloudWatch',            component: CloudWatchTab },
    { id: 'log-patterns',      icon: FileSearch,    label: 'Log Pattern Analysis',  component: LogPatternAnalysisTab },
    { id: 'alert-correlation', icon: Link2,         label: 'Alert Correlation',     component: AlertCorrelationTab },

    { section: 'Developer Tools' },
    { id: 'sql',               icon: Terminal,      label: 'SQL Console',           component: SqlConsoleTab },
    { id: 'api',               icon: Network,       label: 'API Tracing',           component: ApiQueriesTab },
    { id: 'repository',        icon: GitBranch,     label: 'Repository',            component: RepositoryTab },

    { section: 'Admin' },
    { id: 'tasks',             icon: CalendarCheck, label: 'DBA Task Scheduler',    component: DBATaskSchedulerTab },
    { id: 'UserManagement',    icon: Users,         label: 'User Management',       component: UserManagementTab },
    { id: 'admin',             icon: Shield,        label: 'Admin',                 component: AdminTab },
];

// Flat list of real tabs only — used for routing / logic
const TABS_ONLY = TAB_CONFIG.filter(t => t.id);

/**
 * Build an array of section groups:
 * [{ section: 'Core Monitoring', tabs: [{ id, icon, label, component }, ...] }, ...]
 */
const SECTION_GROUPS = (() => {
    const groups = [];
    let current = null;
    for (const item of TAB_CONFIG) {
        if (item.section) {
            current = { section: item.section, tabs: [] };
            groups.push(current);
        } else if (current) {
            current.tabs.push(item);
        }
    }
    return groups;
})();

/** Given a tab id, return which section it belongs to */
const getSectionForTab = (tabId) => {
    for (const g of SECTION_GROUPS) {
        if (g.tabs.some(t => t.id === tabId)) return g.section;
    }
    return null;
};

const STORAGE_KEYS = {
    ACTIVE_TAB: 'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED: 'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED: 'pg_monitor_notifications_dismissed',
    FEEDBACK_PROMPT: 'pg_monitor_feedback_prompt_shown'
};

const WS_RECONNECT_INTERVAL = 5000;
const ALERT_AUTO_DISMISS_TIME = 5000;
const MAX_NOTIFICATIONS = 50;

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const AppStyles = () => (
    <style>{`
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        @keyframes sectionOpen {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .nav-item-hover {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item-hover:hover {
            transform: translateX(3px);
            background: ${THEME.primary}08 !important;
        }
        .section-header-btn {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .section-header-btn:hover {
            background: ${THEME.primary}0a !important;
        }
        .section-tabs-open {
            animation: sectionOpen 0.18s ease-out both;
        }
        .notification-item:hover {
            background: ${THEME.primary}05 !important;
        }
        .feedback-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            z-index: 2000; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease-out;
        }
        .feedback-modal {
            background: ${THEME.surface}; border: 1px solid ${THEME.glassBorder};
            border-radius: 16px; width: 450px; max-width: 90%;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden;
        }
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 4px; }
        .sidebar-nav::-webkit-scrollbar-thumb:hover { background: ${THEME.primary}60; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FEEDBACK MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const FeedbackModal = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('feature');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await postData('/api/feedback', { rating, category, comment, timestamp: new Date() });
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="feedback-overlay">
                <div className="feedback-modal" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${THEME.success}20`, color: THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h3 style={{ margin: 0, color: THEME.textMain }}>Thank You!</h3>
                    <p style={{ color: THEME.textMuted, marginTop: 8 }}>Your feedback helps us improve Vigil.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="feedback-modal">
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: THEME.textMain }}>Send Feedback</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ marginBottom: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>How likely are you to recommend us?</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <Star size={28} fill={rating >= star ? THEME.warning : 'transparent'} color={rating >= star ? THEME.warning : THEME.grid} strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMain, marginBottom: 8, fontWeight: 600 }}>Category</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {['Feature Request', 'Bug Report', 'General Improvement'].map(cat => {
                                const val = cat.toLowerCase().split(' ')[0];
                                const active = category === val;
                                return (
                                    <button key={val} type="button" onClick={() => setCategory(val)} style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, border: `1px solid ${active ? THEME.primary : THEME.grid}`, background: active ? `${THEME.primary}15` : 'transparent', color: active ? THEME.primary : THEME.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMain, marginBottom: 8, fontWeight: 600 }}>Comments</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us what you love or what could be better..." rows={4} style={{ width: '100%', background: `${THEME.bg}80`, border: `1px solid ${THEME.grid}`, borderRadius: 8, padding: 12, color: THEME.textMain, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                    </div>
                    <button type="submit" disabled={submitting || !comment} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !comment ? 0.6 : 1 }}>
                        {submitting ? 'Sending...' : <><Send size={16} /> Submit Feedback</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   ═══════════════════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, info) { console.error('Error Boundary caught:', error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.bg, color: THEME.textMain, flexDirection: 'column', gap: 20, padding: 40 }}>
                    <AlertCircle size={64} color={THEME.danger} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
                    <p style={{ color: THEME.textMuted, textAlign: 'center', maxWidth: 500 }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, color: '#fff', fontWeight: 600, fontSize: 14 }}>Reload Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATION CENTER
   ═══════════════════════════════════════════════════════════════════════════ */
const NotificationCenter = ({ notifications, onDismiss, onClearAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setIsOpen(!isOpen)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, background: isOpen ? `${THEME.primary}15` : 'transparent', border: `1px solid ${isOpen ? THEME.primary : THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} aria-label="Notifications">
                <Bell size={18} color={isOpen ? THEME.primary : THEME.textMuted} />
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: THEME.danger, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bounce 2s infinite' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'transparent' }} />
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 380, maxHeight: 500, background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideDown 0.2s ease-out' }}>
                        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>Notifications ({notifications.length})</div>
                            {notifications.length > 0 && (
                                <button onClick={onClearAll} style={{ background: 'none', border: 'none', color: THEME.textDim, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.color = THEME.primary} onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}>
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 40, textAlign: 'center', color: THEME.textDim }}>
                                    <Bell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <div style={{ fontSize: 12 }}>No notifications</div>
                                </div>
                            ) : notifications.map((notif) => (
                                <div key={notif.id} className="notification-item" style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.grid}40`, display: 'flex', gap: 10, alignItems: 'flex-start', background: notif.read ? 'transparent' : `${THEME.primary}05`, cursor: 'pointer' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: `${notif.severity === 'critical' ? THEME.danger : notif.severity === 'warning' ? THEME.warning : THEME.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AlertCircle size={16} color={notif.severity === 'critical' ? THEME.danger : notif.severity === 'warning' ? THEME.warning : THEME.primary} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain, marginBottom: 2 }}>{notif.title}</div>
                                        <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.4 }}>{notif.message}</div>
                                        <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>{new Date(notif.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', color: THEME.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}20`; e.currentTarget.style.color = THEME.danger; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.textDim; }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR — collapsible sections, active section auto-expands
   ═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = ({ activeTab, onTabChange, onLogout, currentUser, collapsed, onToggleCollapse, onOpenFeedback, allowedTabIds }) => {

    // Track which sections are open. Default: the section containing the active tab.
    const [openSections, setOpenSections] = useState(() => {
        const active = getSectionForTab(activeTab);
        return active ? new Set([active]) : new Set();
    });

    // When active tab changes, auto-open its section
    useEffect(() => {
        const section = getSectionForTab(activeTab);
        if (section) {
            setOpenSections(prev => {
                if (prev.has(section)) return prev;
                const next = new Set(prev);
                next.add(section);
                return next;
            });
        }
    }, [activeTab]);

    const toggleSection = useCallback((sectionName) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionName)) next.delete(sectionName);
            else next.add(sectionName);
            return next;
        });
    }, []);

    // Filtered section groups — only sections with ≥1 allowed tab
    const visibleGroups = useMemo(() =>
            SECTION_GROUPS
                .map(g => ({ ...g, tabs: g.tabs.filter(t => allowedTabIds.includes(t.id)) }))
                .filter(g => g.tabs.length > 0),
        [allowedTabIds]
    );

    return (
        <aside style={{ width: collapsed ? 70 : 240, background: 'rgba(2,6,23,0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 50, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', flexShrink: 0 }}>

            {/* Logo */}
            <div style={{ padding: collapsed ? '24px 0' : 24, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12, borderBottom: `1px solid ${THEME.grid}`, minHeight: 72 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Database color="#fff" size={16} />
                </div>
                {!collapsed && <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>PG Monitor</span>}
            </div>

            {/* Navigation — collapsible section groups */}
            <div className="sidebar-nav" style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
                {visibleGroups.map((group) => {
                    const isOpen = collapsed || openSections.has(group.section); // always open when icon-only
                    const hasActiveTab = group.tabs.some(t => t.id === activeTab);

                    return (
                        <div key={group.section} style={{ marginBottom: 2 }}>

                            {/* ── Section Header Button ── */}
                            {collapsed ? (
                                /* Collapsed: thin divider line only */
                                <div style={{ margin: '6px 8px 4px', height: 1, background: `${THEME.grid}60`, borderRadius: 1 }} />
                            ) : (
                                <button
                                    onClick={() => toggleSection(group.section)}
                                    className="section-header-btn"
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                        background: hasActiveTab ? `${THEME.primary}10` : 'transparent',
                                        marginBottom: 2,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {/* Active section indicator dot */}
                                        {hasActiveTab && (
                                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: THEME.primary, flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                            fontSize: 10, fontWeight: 700,
                                            color: hasActiveTab ? THEME.primary : THEME.textMuted,
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                        }}>
                                            {group.section}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={12}
                                        color={hasActiveTab ? THEME.primary : THEME.textMuted}
                                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}
                                    />
                                </button>
                            )}

                            {/* ── Section Tabs ── */}
                            {isOpen && (
                                <div className={collapsed ? '' : 'section-tabs-open'} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {group.tabs.map(tab => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => onTabChange(tab.id)}
                                                className="nav-item-hover"
                                                title={collapsed ? tab.label : undefined}
                                                aria-label={tab.label}
                                                aria-current={isActive ? 'page' : undefined}
                                                style={{
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                                    gap: 9,
                                                    /* indent tabs under their section when expanded */
                                                    padding: collapsed ? '10px 0' : '8px 10px 8px 22px',
                                                    background: isActive ? `${THEME.primary}18` : 'transparent',
                                                    border: isActive ? `1px solid ${THEME.primary}35` : '1px solid transparent',
                                                    borderRadius: 7, cursor: 'pointer',
                                                    color: isActive ? THEME.primary : THEME.textMuted,
                                                    fontWeight: isActive ? 600 : 400,
                                                    textAlign: 'left', fontSize: 13,
                                                    position: 'relative', whiteSpace: 'nowrap',
                                                    overflow: 'hidden', width: '100%',
                                                }}
                                            >
                                                {/* Active left bar */}
                                                {isActive && (
                                                    <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, background: THEME.primary, borderRadius: '0 3px 3px 0' }} />
                                                )}
                                                <tab.icon size={15} style={{ flexShrink: 0 }} />
                                                {!collapsed && <span>{tab.label}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ padding: collapsed ? '12px 0' : '12px 16px', borderTop: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={onOpenFeedback} className="nav-item-hover" title="Give Feedback" style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: collapsed ? '8px 0' : '7px 8px', fontSize: 13, fontWeight: 500, borderRadius: 7, width: '100%' }}>
                    <MessageSquarePlus size={15} />
                    {!collapsed && 'Feedback'}
                </button>

                {!collapsed && (
                    <div style={{ padding: '4px 8px' }}>
                        <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Logged in as</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 7 }}>
                            <User size={13} />{currentUser?.name}
                        </div>
                    </div>
                )}

                <button onClick={onLogout} title={collapsed ? 'Logout' : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: collapsed ? '8px 0' : '7px 8px', fontSize: 13, transition: 'color 0.2s', borderRadius: 7, width: '100%' }} onMouseEnter={e => e.currentTarget.style.color = THEME.danger} onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}>
                    <LogOut size={15} />
                    {!collapsed && 'Logout'}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{ position: 'absolute', right: -12, top: 80, width: 24, height: 24, borderRadius: '50%', background: THEME.surface, border: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: THEME.textMuted, transition: 'all 0.2s', zIndex: 51 }} onMouseEnter={e => { e.currentTarget.style.background = THEME.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = THEME.primary; }} onMouseLeave={e => { e.currentTarget.style.background = THEME.surface; e.currentTarget.style.color = THEME.textMuted; e.currentTarget.style.borderColor = THEME.grid; }}>
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   WEBSOCKET MANAGER
   ═══════════════════════════════════════════════════════════════════════════ */
const useWebSocket = (onMessage) => {
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const disconnectRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const connect = useCallback(() => {
        try {
            setReconnecting(true);
            disconnectRef.current = connectWS((msg) => {
                setConnected(true);
                setReconnecting(false);
                onMessage(msg);
            });
        } catch (error) {
            console.error('WebSocket connection error:', error);
            setConnected(false);
            setReconnecting(false);
            reconnectTimerRef.current = setTimeout(connect, WS_RECONNECT_INTERVAL);
        }
    }, [onMessage]);

    useEffect(() => {
        connect();
        return () => {
            if (disconnectRef.current) disconnectRef.current();
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        };
    }, [connect]);

    return { connected, reconnecting };
};

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const { logout, currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState(() => {
        try { return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'overview'; }
        catch { return 'overview'; }
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try { return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'; }
        catch { return false; }
    });

    const [notifications, setNotifications] = useState([]);
    const [latestAlert, setLatestAlert] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        const hasSeenPrompt = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPT);
        if (!hasSeenPrompt) {
            const timer = setTimeout(() => {
                setShowFeedback(true);
                localStorage.setItem(STORAGE_KEYS.FEEDBACK_PROMPT, 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleWSMessage = useCallback((msg) => {
        if (msg.type === 'alert') {
            const notification = { id: Date.now(), title: msg.payload.title || 'Alert', message: msg.payload.message || 'System alert', severity: msg.payload.severity || 'info', timestamp: Date.now(), read: false };
            setNotifications(prev => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
            setLatestAlert(msg.payload);
            setTimeout(() => setLatestAlert(null), ALERT_AUTO_DISMISS_TIME);
        }
    }, []);

    const { connected, reconnecting } = useWebSocket(handleWSMessage);

    const allowedTabIds = useMemo(() =>
            TABS_ONLY.filter(t => currentUser.allowedScreens.includes(t.id)).map(t => t.id),
        [currentUser.allowedScreens]
    );

    const ActiveComponent = useMemo(() => {
        const tab = TABS_ONLY.find(t => t.id === activeTab && allowedTabIds.includes(t.id));
        if (tab) return tab.component;
        return TABS_ONLY.find(t => allowedTabIds.includes(t.id))?.component;
    }, [activeTab, allowedTabIds]);

    const activeTabLabel = useMemo(() => TABS_ONLY.find(t => t.id === activeTab)?.label || '', [activeTab]);

    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        try { localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId); }
        catch (e) { console.warn('Failed to save active tab:', e); }
    }, []);

    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed(prev => {
            const newValue = !prev;
            try { localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, newValue.toString()); }
            catch (e) { console.warn('Failed to save sidebar state:', e); }
            return newValue;
        });
    }, []);

    const handleDismissNotification = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
    const handleClearAllNotifications = useCallback(() => setNotifications([]), []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); handleToggleCollapse(); }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleToggleCollapse]);

    return (
        <div style={{ display: 'flex', height: '100vh', background: THEME.bg, color: THEME.textMain, overflow: 'hidden' }}>
            <AppStyles />
            <ChartDefs />

            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={logout}
                currentUser={currentUser}
                collapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                onOpenFeedback={() => setShowFeedback(true)}
                allowedTabIds={allowedTabIds}
            />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ height: 64, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{activeTabLabel}</h2>
                        {reconnecting && (
                            <div style={{ fontSize: 11, color: THEME.warning, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${THEME.warning}15`, borderRadius: 6, border: `1px solid ${THEME.warning}30` }}>
                                <div style={{ animation: 'pulse 1.5s infinite' }}><WifiOff size={14} /></div>
                                Reconnecting...
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <WebSocketStatus connected={connected} />
                        <NotificationCenter notifications={notifications} onDismiss={handleDismissNotification} onClearAll={handleClearAllNotifications} />
                    </div>
                </header>

                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    <div style={{ padding: 32, maxWidth: 1600, margin: '0 auto', position: 'relative', minHeight: '100%' }}>
                        {latestAlert && (
                            <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 100, width: 400, animation: 'slideInRight 0.3s ease-out' }}>
                                <AlertBanner alert={latestAlert} onDismiss={() => setLatestAlert(null)} />
                            </div>
                        )}
                        <ErrorBoundary key={activeTab}>
                            {ActiveComponent && <ActiveComponent />}
                        </ErrorBoundary>
                    </div>
                </div>
            </main>

            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════════════════ */
const LoadingScreen = () => (
    <div style={{ height: '100vh', background: THEME.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: THEME.textMain }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
            <Database color="#fff" size={24} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textDim }}>Loading...</div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   AUTH CONSUMER
   ═══════════════════════════════════════════════════════════════════════════ */
const AuthConsumer = () => {
    const { currentUser, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return currentUser ? <ErrorBoundary><Dashboard /></ErrorBoundary> : <LoginPage />;
};

/* ═══════════════════════════════════════════════════════════════════════════
   APP ENTRY POINT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        </ErrorBoundary>
    );
}