import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { THEME, ChartDefs } from './utils/theme.jsx';
import { connectWS } from './utils/api';
import LoginPage from './components/auth/LoginPage.jsx';

import OverviewTab from './components/views/OverviewTab.jsx';
import PerformanceTab from './components/views/PerformanceTab.jsx';
import ReliabilityTab from './components/views/ReliabilityTab.jsx';
import ResourcesTab from './components/views/ResourcesTab.jsx';
import IndexesTab from './components/views/IndexesTab.jsx';
import AdminTab from './components/views/AdminTab.jsx';
import SqlConsoleTab from './components/views/SqlConsoleTab.jsx';
import ApiQueriesTab from './components/views/ApiQueriesTab.jsx';
import UserManagementTab from './components/views/UserManagementTab.jsx';
import RepositoryTab from './components/views/RepositoryTab.jsx';
import AlertsComponent from './components/AlertsComponent';
import ConnectionsTab from './components/views/ConnectionsTab.jsx';
import QueryOptimizerTab from './components/views/QueryOptimizerTab.jsx';
import ConnectionPoolTab from './components/views/ConnectionPoolTab.jsx';
import SchemaVersioningTab  from "./components/views/SchemaVersioningTab.jsx";
import SecurityComplianceTab from './components/views/SecurityComplianceTab.jsx';
import CapacityPlanningTab from './components/views/CapacityPlanningTab.jsx';


import {
    Activity, Zap, CheckCircle, HardDrive, Layers, Shield, Terminal, Network,
    LogOut, Database, Wifi, WifiOff, Bell, ChevronLeft, ChevronRight,
    AlertCircle, X, Menu, Search, Settings, User, GitBranch, Users, Server, TrendingUp
} from 'lucide-react';
import { WebSocketStatus, AlertBanner } from './components/ui/SharedComponents.jsx';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const TAB_CONFIG = [
    { id: 'connections', icon: Database, label: 'Connections', component: ConnectionsTab },
    { id: 'overview', icon: Activity, label: 'Overview', component: OverviewTab },
    { id: 'performance', icon: Zap, label: 'Performance', component: PerformanceTab },
    { id: 'optimizer', icon: Zap, label: 'Query Optimizer', component: QueryOptimizerTab },
    { id: 'resources', icon: HardDrive, label: 'Resources', component: ResourcesTab },
    { id: 'reliability', icon: CheckCircle, label: 'Reliability', component: ReliabilityTab },
    { id: 'indexes', icon: Layers, label: 'Indexes', component: IndexesTab },
    { id: 'alerts', icon: Bell, label: 'Alerts', component: AlertsComponent },
    { id: 'sql', icon: Terminal, label: 'SQL Console', component: SqlConsoleTab },
    { id: 'api', icon: Network, label: 'API Tracing', component: ApiQueriesTab },
    { id: 'repository', icon: GitBranch, label: 'Repository', component: RepositoryTab },
    { id: 'admin', icon: Shield, label: 'Admin', component: AdminTab },
    { id: 'UserManagement', icon: Users, label: 'User Management', component: UserManagementTab },
    { id: 'pool', icon: Network, label: 'Connection Pool', component: ConnectionPoolTab },
    { id: 'schema', icon: Layers, label: 'Schema & Migrations', component: SchemaVersioningTab },
    { id: 'security', icon: Shield, label: 'Security & Compliance', component: SecurityComplianceTab },
    { id: 'capacity', icon: TrendingUp, label: 'Capacity Planning', component: CapacityPlanningTab },


];

const STORAGE_KEYS = {
    ACTIVE_TAB: 'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED: 'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED: 'pg_monitor_notifications_dismissed',
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
        .nav-item-hover {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item-hover:hover {
            transform: translateX(4px);
            background: ${THEME.primary}08 !important;
        }
        .notification-item:hover {
            background: ${THEME.primary}05 !important;
        }
        .smooth-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   ═══════════════════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: THEME.bg, color: THEME.textMain, flexDirection: 'column', gap: 20, padding: 40
                }}>
                    <AlertCircle size={64} color={THEME.danger} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
                    <p style={{ color: THEME.textMuted, textAlign: 'center', maxWidth: 500 }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                            color: '#fff', fontWeight: 600, fontSize: 14
                        }}
                    >
                        Reload Page
                    </button>
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
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative', width: 36, height: 36, borderRadius: 8,
                    background: isOpen ? `${THEME.primary}15` : 'transparent',
                    border: `1px solid ${isOpen ? THEME.primary : THEME.grid}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s'
                }}
                aria-label="Notifications"
            >
                <Bell size={18} color={isOpen ? THEME.primary : THEME.textMuted} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, width: 18, height: 18,
                        borderRadius: '50%', background: THEME.danger, color: '#fff',
                        fontSize: 10, fontWeight: 700, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        animation: 'bounce 2s infinite'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999,
                            background: 'transparent'
                        }}
                    />
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 380, maxHeight: 500, background: THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`, borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1000,
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        animation: 'slideDown 0.2s ease-out'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '12px 16px', borderBottom: `1px solid ${THEME.glassBorder}`,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                                Notifications ({notifications.length})
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={onClearAll}
                                    style={{
                                        background: 'none', border: 'none', color: THEME.textDim,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        padding: '4px 8px', borderRadius: 4, transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = THEME.primary}
                                    onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: 40, textAlign: 'center', color: THEME.textDim
                                }}>
                                    <Bell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <div style={{ fontSize: 12 }}>No notifications</div>
                                </div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <div
                                        key={notif.id}
                                        className="notification-item"
                                        style={{
                                            padding: '12px 16px', borderBottom: `1px solid ${THEME.grid}40`,
                                            display: 'flex', gap: 10, alignItems: 'flex-start',
                                            background: notif.read ? 'transparent' : `${THEME.primary}05`,
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                                            background: `${notif.severity === 'critical' ? THEME.danger : notif.severity === 'warning' ? THEME.warning : THEME.primary}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <AlertCircle size={16} color={notif.severity === 'critical' ? THEME.danger : notif.severity === 'warning' ? THEME.warning : THEME.primary} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain, marginBottom: 2 }}>
                                                {notif.title}
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.4 }}>
                                                {notif.message}
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>
                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                                            style={{
                                                width: 20, height: 20, borderRadius: 4, border: 'none',
                                                background: 'transparent', color: THEME.textDim,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}20`; e.currentTarget.style.color = THEME.danger; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.textDim; }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLLAPSIBLE SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = ({ tabs, activeTab, onTabChange, onLogout, currentUser, collapsed, onToggleCollapse }) => {
    return (
        <aside style={{
            width: collapsed ? 70 : 240,
            background: 'rgba(2,6,23,0.95)',
            borderRight: `1px solid ${THEME.grid}`,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
        }}>
            {/* Logo */}
            <div style={{
                padding: collapsed ? '24px 0' : 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                borderBottom: `1px solid ${THEME.grid}`,
                minHeight: 72
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Database color="#fff" size={16} />
                </div>
                {!collapsed && (
                    <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
                        PG Monitor
                    </span>
                )}
            </div>

            {/* Navigation */}
            <div style={{
                flex: 1,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="nav-item-hover"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: 12,
                                padding: collapsed ? '12px 0' : '12px 16px',
                                background: isActive ? `${THEME.primary}15` : 'transparent',
                                border: isActive ? `1px solid ${THEME.primary}30` : '1px solid transparent',
                                borderRadius: 8,
                                cursor: 'pointer',
                                color: isActive ? THEME.primary : THEME.textMuted,
                                fontWeight: isActive ? 600 : 500,
                                textAlign: 'left',
                                fontSize: 14,
                                position: 'relative',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                            title={collapsed ? tab.label : undefined}
                            aria-label={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <tab.icon size={18} style={{ flexShrink: 0 }} />
                            {!collapsed && <span>{tab.label}</span>}
                            {isActive && !collapsed && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 3,
                                    background: THEME.primary,
                                    borderRadius: '0 4px 4px 0'
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* User Section */}
            <div style={{
                padding: collapsed ? '16px 0' : 20,
                borderTop: `1px solid ${THEME.grid}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            }}>
                {!collapsed && (
                    <div>
                        <div style={{
                            fontSize: 10,
                            color: THEME.textMuted,
                            textTransform: 'uppercase',
                            marginBottom: 4
                        }}>
                            User
                        </div>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: THEME.textMain,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <User size={14} />
                            {currentUser?.name}
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        color: THEME.textMuted,
                        cursor: 'pointer',
                        padding: collapsed ? '8px 0' : '8px 0',
                        fontSize: 13,
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = THEME.danger}
                    onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={16} />
                    {!collapsed && 'Logout'}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={onToggleCollapse}
                style={{
                    position: 'absolute',
                    right: -12,
                    top: 80,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: THEME.textMuted,
                    transition: 'all 0.2s',
                    zIndex: 51
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = THEME.primary;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = THEME.primary;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = THEME.surface;
                    e.currentTarget.style.color = THEME.textMuted;
                    e.currentTarget.style.borderColor = THEME.grid;
                }}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
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
            // Schedule reconnect
            reconnectTimerRef.current = setTimeout(connect, WS_RECONNECT_INTERVAL);
        }
    }, [onMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (disconnectRef.current) {
                disconnectRef.current();
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, [connect]);

    return { connected, reconnecting };
};

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const { logout, currentUser } = useAuth();

    // Load saved preferences
    const [activeTab, setActiveTab] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'overview';
        } catch {
            return 'overview';
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

    // WebSocket handler
    const handleWSMessage = useCallback((msg) => {
        if (msg.type === 'alert') {
            const notification = {
                id: Date.now(),
                title: msg.payload.title || 'Alert',
                message: msg.payload.message || 'System alert',
                severity: msg.payload.severity || 'info',
                timestamp: Date.now(),
                read: false
            };

            setNotifications(prev => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
            setLatestAlert(msg.payload);

            // Auto-dismiss toast
            setTimeout(() => setLatestAlert(null), ALERT_AUTO_DISMISS_TIME);
        }
    }, []);

    const { connected, reconnecting } = useWebSocket(handleWSMessage);

    // Filter tabs based on user permissions
    const allowedTabs = useMemo(() =>
            TAB_CONFIG.filter(t => currentUser.allowedScreens.includes(t.id)),
        [currentUser.allowedScreens]
    );

    // Get active tab component
    const ActiveComponent = useMemo(() => {
        const tab = allowedTabs.find(t => t.id === activeTab);
        return tab ? tab.component : allowedTabs[0]?.component;
    }, [activeTab, allowedTabs]);

    // Persist active tab
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
        } catch (e) {
            console.warn('Failed to save active tab:', e);
        }
    }, []);

    // Toggle sidebar collapse
    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed(prev => {
            const newValue = !prev;
            try {
                localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, newValue.toString());
            } catch (e) {
                console.warn('Failed to save sidebar state:', e);
            }
            return newValue;
        });
    }, []);

    // Notification handlers
    const handleDismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const handleClearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ctrl/Cmd + B: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                handleToggleCollapse();
            }
            // Ctrl/Cmd + K: Focus search (if implemented)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Implement global search focus
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleToggleCollapse]);

    const activeTabConfig = allowedTabs.find(t => t.id === activeTab);

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: THEME.bg,
            color: THEME.textMain,
            overflow: 'hidden'
        }}>
            <AppStyles />
            <ChartDefs />

            {/* Sidebar */}
            <Sidebar
                tabs={allowedTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={logout}
                currentUser={currentUser}
                collapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{
                    height: 64,
                    borderBottom: `1px solid ${THEME.grid}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    background: 'rgba(2,6,23,0.8)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                            {activeTabConfig?.label}
                        </h2>
                        {reconnecting && (
                            <div style={{
                                fontSize: 11,
                                color: THEME.warning,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                background: `${THEME.warning}15`,
                                borderRadius: 6,
                                border: `1px solid ${THEME.warning}30`
                            }}>
                                <div style={{ animation: 'pulse 1.5s infinite' }}>
                                    <WifiOff size={14} />
                                </div>
                                Reconnecting...
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* WebSocket Status */}
                        <WebSocketStatus connected={connected} />

                        {/* Notification Center */}
                        <NotificationCenter
                            notifications={notifications}
                            onDismiss={handleDismissNotification}
                            onClearAll={handleClearAllNotifications}
                        />
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    <div style={{
                        padding: 32,
                        maxWidth: 1600,
                        margin: '0 auto',
                        position: 'relative',
                        minHeight: '100%'
                    }}>
                        {/* Toast Alert */}
                        {latestAlert && (
                            <div style={{
                                position: 'fixed',
                                top: 80,
                                right: 32,
                                zIndex: 100,
                                width: 400,
                                animation: 'slideInRight 0.3s ease-out'
                            }}>
                                <AlertBanner
                                    alert={latestAlert}
                                    onDismiss={() => setLatestAlert(null)}
                                />
                            </div>
                        )}

                        {/* Tab Content */}
                        <ErrorBoundary key={activeTab}>
                            {ActiveComponent && <ActiveComponent />}
                        </ErrorBoundary>
                    </div>
                </div>
            </main>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════════════════ */
const LoadingScreen = () => (
    <div style={{
        height: '100vh',
        background: THEME.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        color: THEME.textMain
    }}>
        <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite'
        }}>
            <Database color="#fff" size={24} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textDim }}>
            Loading...
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   AUTH CONSUMER
   ═══════════════════════════════════════════════════════════════════════════ */
const AuthConsumer = () => {
    const { currentUser, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return currentUser ? (
        <ErrorBoundary>
            <Dashboard />
        </ErrorBoundary>
    ) : (
        <LoginPage />
    );
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