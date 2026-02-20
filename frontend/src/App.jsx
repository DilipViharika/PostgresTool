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
    CalendarCheck, FileSearch, Link2, Cpu, BarChart2, Lock
} from 'lucide-react';
import { WebSocketStatus, AlertBanner } from './components/ui/SharedComponents.jsx';

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS — single source of truth for the new visual system
   ───────────────────────────────────────────────────────────────── */
const DS = {
    // Palette
    bg:           '#04060f',
    bgDeep:       '#020409',
    surface:      '#0a0f1e',
    surfaceHover: '#0e1528',
    border:       'rgba(255,255,255,0.06)',
    borderAccent: 'rgba(56,189,248,0.25)',

    cyan:         '#38bdf8',
    cyanDim:      'rgba(56,189,248,0.15)',
    cyanGlow:     'rgba(56,189,248,0.35)',
    violet:       '#818cf8',
    violetDim:    'rgba(129,140,248,0.15)',
    emerald:      '#34d399',
    amber:        '#fbbf24',
    rose:         '#fb7185',

    textPrimary:  '#f0f4ff',
    textSub:      '#94a3b8',
    textMuted:    '#475569',

    // Fonts
    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:   `'DM Sans', 'Sora', system-ui, sans-serif`,

    // Shadows / Glows
    glowCyan:   '0 0 20px rgba(56,189,248,0.18), 0 0 60px rgba(56,189,248,0.06)',
    glowViolet: '0 0 20px rgba(129,140,248,0.18), 0 0 60px rgba(129,140,248,0.06)',
    shadowCard: '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep: '0 20px 60px rgba(0,0,0,0.7)',
};

/* ─────────────────────────────────────────────────────────────────
   TAB CONFIG
   ───────────────────────────────────────────────────────────────── */
const TAB_CONFIG = [
    { section: 'Core Monitoring', accent: DS.cyan },
    { id: 'overview',          icon: Activity,      label: 'Overview',              component: OverviewTab,             badge: null },
    { id: 'connections',       icon: Database,      label: 'Connections',           component: ConnectionsTab,          badge: null },
    { id: 'performance',       icon: Zap,           label: 'Performance',           component: PerformanceTab,          badge: null },
    { id: 'resources',         icon: HardDrive,     label: 'Resources',             component: ResourcesTab,            badge: null },
    { id: 'reliability',       icon: CheckCircle,   label: 'Reliability',           component: ReliabilityTab,          badge: null },
    { id: 'alerts',            icon: Bell,          label: 'Alerts',                component: AlertsComponent,         badge: '3' },

    { section: 'Query & Indexes', accent: DS.violet },
    { id: 'optimizer',         icon: Zap,           label: 'Query Optimizer',       component: QueryOptimizerTab,       badge: null },
    { id: 'indexes',           icon: Layers,        label: 'Indexes',               component: IndexesTab,              badge: null },
    { id: 'regression',        icon: TrendingUp,    label: 'Plan Regression',       component: QueryPlanRegressionTab,  badge: null },
    { id: 'bloat',             icon: Layers,        label: 'Bloat Analysis',        component: BloatAnalysisTab,        badge: null },

    { section: 'Infrastructure', accent: DS.emerald },
    { id: 'pool',              icon: Network,       label: 'Connection Pool',       component: ConnectionPoolTab,       badge: null },
    { id: 'replication',       icon: Radio,         label: 'Replication & WAL',     component: ReplicationWALTab,       badge: null },
    { id: 'checkpoint',        icon: CheckCircle,   label: 'Checkpoint Monitor',    component: CheckpointMonitorTab,    badge: null },
    { id: 'maintenance',       icon: RefreshCw,     label: 'Vacuum & Maintenance',  component: VacuumMaintenanceTab,    badge: null },
    { id: 'capacity',          icon: BarChart2,     label: 'Capacity Planning',     component: CapacityPlanningTab,     badge: null },
    { id: 'backup',            icon: Archive,       label: 'Backup & Recovery',     component: BackupRecoveryTab,       badge: null },

    { section: 'Schema & Security', accent: DS.rose },
    { id: 'schema',            icon: GitBranch,     label: 'Schema & Migrations',   component: SchemaVersioningTab,     badge: null },
    { id: 'security',          icon: Lock,          label: 'Security & Compliance', component: SecurityComplianceTab,   badge: null },

    { section: 'Observability', accent: DS.amber },
    { id: 'cloudwatch',        icon: Cloud,         label: 'CloudWatch',            component: CloudWatchTab,           badge: null },
    { id: 'log-patterns',      icon: FileSearch,    label: 'Log Pattern Analysis',  component: LogPatternAnalysisTab,   badge: null },
    { id: 'alert-correlation', icon: Link2,         label: 'Alert Correlation',     component: AlertCorrelationTab,     badge: null },

    { section: 'Developer Tools', accent: DS.violet },
    { id: 'sql',               icon: Terminal,      label: 'SQL Console',           component: SqlConsoleTab,           badge: null },
    { id: 'api',               icon: Cpu,           label: 'API Tracing',           component: ApiQueriesTab,           badge: null },
    { id: 'repository',        icon: GitBranch,     label: 'Repository',            component: RepositoryTab,           badge: null },

    { section: 'Admin', accent: DS.rose },
    { id: 'tasks',             icon: CalendarCheck, label: 'DBA Task Scheduler',    component: DBATaskSchedulerTab,     badge: null },
    { id: 'UserManagement',    icon: Users,         label: 'User Management',       component: UserManagementTab,       badge: null },
    { id: 'admin',             icon: Shield,        label: 'Admin',                 component: AdminTab,                badge: null },
];

const TABS_ONLY = TAB_CONFIG.filter(t => t.id);

const SECTION_GROUPS = (() => {
    const groups = [];
    let current = null;
    for (const item of TAB_CONFIG) {
        if (item.section) {
            current = { section: item.section, tabs: [], accent: item.accent || DS.cyan };
            groups.push(current);
        } else if (current) {
            current.tabs.push(item);
        }
    }
    return groups;
})();

const getSectionForTab = (tabId) => {
    for (const g of SECTION_GROUPS) {
        if (g.tabs.some(t => t.id === tabId)) return g.section;
    }
    return null;
};

const getSectionAccent = (tabId) => {
    for (const g of SECTION_GROUPS) {
        if (g.tabs.some(t => t.id === tabId)) return g.accent;
    }
    return DS.cyan;
};

const STORAGE_KEYS = {
    ACTIVE_TAB:               'pg_monitor_active_tab',
    SIDEBAR_COLLAPSED:        'pg_monitor_sidebar_collapsed',
    NOTIFICATIONS_DISMISSED:  'pg_monitor_notifications_dismissed',
    FEEDBACK_PROMPT:          'pg_monitor_feedback_prompt_shown',
};

const WS_RECONNECT_INTERVAL   = 5000;
const ALERT_AUTO_DISMISS_TIME  = 5000;
const MAX_NOTIFICATIONS        = 50;

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES
   ───────────────────────────────────────────────────────────────── */
const AppStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes slideIn         { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight    { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn          { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown       { from { transform: translateY(-14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp         { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes sectionOpen     { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse           { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce          { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes shimmer         { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes scanline        { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes glowPulse       { 0%, 100% { box-shadow: 0 0 8px rgba(56,189,248,0.2); } 50% { box-shadow: 0 0 24px rgba(56,189,248,0.5); } }
        @keyframes orb             { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.05); } 66% { transform: translate(-20px,15px) scale(0.97); } }
        @keyframes rotate          { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes tabIn           { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes notifPop        { 0% { transform: scale(0.85); opacity: 0; } 80% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes badgePop        { 0% { transform: scale(0); } 70% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes headerGlow      { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes waveFlow        { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes dotBlink        { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

        body {
            margin: 0;
            font-family: ${DS.fontUI};
            background: ${DS.bg};
            color: ${DS.textPrimary};
            -webkit-font-smoothing: antialiased;
        }

        /* ── Sidebar scroll ── */
        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sidebar-nav::-webkit-scrollbar-thumb:hover { background: ${DS.cyan}60; }

        /* ── Nav hover transition ── */
        .nav-item { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
        .nav-item:hover { transform: translateX(2px); }

        /* ── Section header ── */
        .section-btn { transition: all 0.18s ease; }
        .section-btn:hover { background: rgba(255,255,255,0.04) !important; }

        /* ── Section tab animation ── */
        .section-open { animation: sectionOpen 0.2s ease-out both; }

        /* ── Content tab mount ── */
        .tab-mount { animation: tabIn 0.22s ease-out both; }

        /* ── Notification panel ── */
        .notif-panel { animation: slideDown 0.22s cubic-bezier(0.34,1.4,0.64,1) both; }
        .notif-item { transition: background 0.15s ease; }
        .notif-item:hover { background: rgba(56,189,248,0.05) !important; }

        /* ── Feedback overlay ── */
        .feedback-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease-out; }
        .feedback-modal   { animation: slideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both; }

        /* ── Tooltip ── */
        [data-tip] { position: relative; }
        [data-tip]::after { content: attr(data-tip); position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%); background: ${DS.surface}; color: ${DS.textPrimary}; font-size: 11px; padding: 5px 9px; border-radius: 6px; border: 1px solid ${DS.border}; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 999; }
        [data-tip]:hover::after { opacity: 1; }

        /* ── Star button ── */
        .star-btn { transition: transform 0.15s ease; }
        .star-btn:hover { transform: scale(1.2); }

        /* ── Collapse button ── */
        .collapse-btn { transition: all 0.2s ease; }
        .collapse-btn:hover { transform: scale(1.12); }

        /* ── Tag badge ── */
        .badge-new { animation: badgePop 0.35s ease-out both; }

        /* ── Scrollbar global ── */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${DS.bgDeep}; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.3); }
    `}</style>
);

/* ─────────────────────────────────────────────────────────────────
   AMBIENT BACKGROUND ORBS (decorative, pointer-events: none)
   ───────────────────────────────────────────────────────────────── */
const AmbientOrbs = () => (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Top-left cyan orb */}
        <div style={{
            position: 'absolute', top: -120, left: -80, width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
            animation: 'orb 18s ease-in-out infinite',
        }} />
        {/* Bottom-right violet orb */}
        <div style={{
            position: 'absolute', bottom: -100, right: -60, width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)',
            animation: 'orb 24s ease-in-out infinite reverse',
        }} />
        {/* Center subtle emerald hint */}
        <div style={{
            position: 'absolute', top: '40%', left: '50%', width: 800, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 70%)',
            transform: 'translate(-50%,-50%)',
        }} />
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   LIVE MINI-SPARKLINE in header (purely visual / decorative)
   ───────────────────────────────────────────────────────────────── */
const MiniSparkline = ({ color = DS.cyan, width = 80, height = 28 }) => {
    const [pts, setPts] = useState(() => Array.from({ length: 20 }, () => Math.random()));
    useEffect(() => {
        const id = setInterval(() => {
            setPts(prev => {
                const next = [...prev.slice(1), Math.random()];
                return next;
            });
        }, 600);
        return () => clearInterval(id);
    }, []);

    const toSvg = (values) => {
        const n = values.length;
        return values.map((v, i) => {
            const x = (i / (n - 1)) * width;
            const y = height - 2 - v * (height - 4);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');
    };

    const fillPath = `${toSvg(pts)} L ${width} ${height} L 0 ${height} Z`;

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            <defs>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillPath} fill="url(#spark-fill)" />
            <path d={toSvg(pts)} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────────────
   LIVE STATUS PILL
   ───────────────────────────────────────────────────────────────── */
const StatusPill = ({ connected }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 20,
        background: connected ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
        border: `1px solid ${connected ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        color: connected ? DS.emerald : DS.rose,
        fontFamily: DS.fontMono,
    }}>
        <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? DS.emerald : DS.rose,
            animation: connected ? 'dotBlink 2s ease-in-out infinite' : 'none',
            flexShrink: 0,
        }} />
        {connected ? 'LIVE' : 'OFFLINE'}
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   FEEDBACK MODAL — glassmorphic redesign
   ───────────────────────────────────────────────────────────────── */
const FeedbackModal = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('feature');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const CATEGORIES = [
        { val: 'feature',     label: '✦ Feature Request' },
        { val: 'bug',         label: '⚠ Bug Report' },
        { val: 'general',     label: '✴ General' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await postData('/api/feedback', { rating, category, comment, timestamp: new Date() });
            setSuccess(true);
            setTimeout(onClose, 2200);
        } catch {
            setSubmitting(false);
        }
    };

    if (success) return (
        <div className="feedback-overlay">
            <div className="feedback-modal" style={{
                background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20, padding: '48px 40px', textAlign: 'center',
                boxShadow: DS.glowCyan, maxWidth: 380, width: '90%',
            }}>
                <div style={{
                    width: 64, height: 64, margin: '0 auto 20px',
                    borderRadius: '50%', background: 'rgba(52,211,153,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(52,211,153,0.4)', animation: 'glowPulse 2s ease infinite',
                }}>
                    <CheckCircle size={30} color={DS.emerald} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: DS.textPrimary }}>Thank You!</h3>
                <p style={{ color: DS.textSub, margin: 0, fontSize: 13, lineHeight: 1.6 }}>Your feedback helps us make Vigil better for everyone.</p>
            </div>
        </div>
    );

    return (
        <div className="feedback-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="feedback-modal" style={{
                background: DS.surface,
                border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20, width: 460, maxWidth: '92%',
                boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`,
                overflow: 'hidden',
            }}>
                {/* Header gradient bar */}
                <div style={{
                    height: 3,
                    background: `linear-gradient(90deg, ${DS.cyan}, ${DS.violet}, ${DS.emerald})`,
                    backgroundSize: '200% 100%',
                    animation: 'waveFlow 3s ease infinite',
                }} />

                <div style={{ padding: '24px 28px', borderBottom: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: DS.textPrimary }}>Send Feedback</h3>
                        <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 3, fontFamily: DS.fontMono }}>VIGIL · DATABASE MONITOR</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${DS.border}`, color: DS.textSub, cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)'; e.currentTarget.style.color = DS.rose; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = DS.textSub; }}>
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Star rating */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Rate your experience</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {[1,2,3,4,5].map(s => (
                                <button key={s} type="button" className="star-btn"
                                        onClick={() => setRating(s)}
                                        onMouseEnter={() => setHoverRating(s)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                    <Star size={26}
                                          fill={(hoverRating || rating) >= s ? DS.amber : 'transparent'}
                                          color={(hoverRating || rating) >= s ? DS.amber : DS.textMuted}
                                          strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Category</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {CATEGORIES.map(({ val, label }) => {
                                const active = category === val;
                                return (
                                    <button key={val} type="button" onClick={() => setCategory(val)} style={{
                                        flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                        border: `1px solid ${active ? DS.cyan + '60' : DS.border}`,
                                        background: active ? DS.cyanDim : 'transparent',
                                        color: active ? DS.cyan : DS.textMuted, cursor: 'pointer',
                                        transition: 'all 0.18s ease', fontFamily: DS.fontUI,
                                    }}>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Message</div>
                        <textarea value={comment} onChange={e => setComment(e.target.value)}
                                  placeholder="Tell us what you love or what could be better…"
                                  rows={4}
                                  style={{
                                      width: '100%', background: 'rgba(255,255,255,0.03)',
                                      border: `1px solid ${DS.border}`, borderRadius: 10,
                                      padding: '12px 14px', color: DS.textPrimary, fontSize: 13,
                                      outline: 'none', resize: 'none', fontFamily: DS.fontUI,
                                      lineHeight: 1.6, transition: 'border-color 0.2s',
                                  }}
                                  onFocus={e => e.target.style.borderColor = DS.cyan + '60'}
                                  onBlur={e => e.target.style.borderColor = DS.border}
                        />
                    </div>

                    <button type="submit" disabled={submitting || !comment.trim()} style={{
                        padding: '13px', borderRadius: 10, border: 'none',
                        background: comment.trim()
                            ? `linear-gradient(135deg, ${DS.cyan}, ${DS.violet})`
                            : 'rgba(255,255,255,0.06)',
                        color: comment.trim() ? '#fff' : DS.textMuted,
                        fontSize: 13, fontWeight: 700, cursor: submitting || !comment.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        letterSpacing: '0.04em', transition: 'opacity 0.2s',
                        opacity: submitting ? 0.7 : 1,
                        fontFamily: DS.fontUI,
                    }}>
                        <Send size={14} />
                        {submitting ? 'Sending…' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────
   ERROR BOUNDARY
   ───────────────────────────────────────────────────────────────── */
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, info) { console.error('Error Boundary caught:', error, info); }
    render() {
        if (this.state.hasError) return (
            <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 20, padding: 40, color: DS.textPrimary,
            }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 18, background: 'rgba(251,113,133,0.1)',
                    border: '1px solid rgba(251,113,133,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <AlertCircle size={36} color={DS.rose} />
                </div>
                <div style={{ textAlign: 'center', maxWidth: 440 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Component Error</h2>
                    <p style={{ color: DS.textSub, margin: '0 0 20px', lineHeight: 1.6, fontSize: 13 }}>
                        {this.state.error?.message || 'An unexpected error occurred in this view.'}
                    </p>
                    <button onClick={() => window.location.reload()} style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: `linear-gradient(135deg, ${DS.rose}, ${DS.violet})`,
                        color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: DS.fontUI,
                    }}>Reload Page</button>
                </div>
            </div>
        );
        return this.props.children;
    }
}

/* ─────────────────────────────────────────────────────────────────
   NOTIFICATION CENTER — redesigned with severity colors + timeline
   ───────────────────────────────────────────────────────────────── */
const SEV_COLORS = {
    critical: DS.rose,
    warning:  DS.amber,
    info:     DS.cyan,
};

const NotificationCenter = ({ notifications, onDismiss, onClearAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unread = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setIsOpen(o => !o)} style={{
                position: 'relative', width: 38, height: 38, borderRadius: 10,
                background: isOpen ? DS.cyanDim : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isOpen ? DS.cyan + '60' : DS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.18s ease',
                boxShadow: isOpen ? DS.glowCyan : 'none',
            }} aria-label="Notifications">
                <Bell size={17} color={isOpen ? DS.cyan : DS.textSub} />
                {unread > 0 && (
                    <span className="badge-new" style={{
                        position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18,
                        borderRadius: 9, background: DS.rose, color: '#fff',
                        fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 4px',
                        border: `2px solid ${DS.bg}`,
                        fontFamily: DS.fontMono,
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                    <div className="notif-panel" style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 390,
                        maxHeight: 520, background: DS.surface,
                        border: `1px solid ${DS.borderAccent}`,
                        borderRadius: 14, boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`,
                        zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }}>
                        {/* Rainbow top bar */}
                        <div style={{ height: 2, background: `linear-gradient(90deg, ${DS.cyan}, ${DS.violet})`, flexShrink: 0 }} />

                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bell size={14} color={DS.cyan} />
                                Notifications
                                {notifications.length > 0 && (
                                    <span style={{ fontSize: 10, background: DS.cyanDim, color: DS.cyan, padding: '2px 7px', borderRadius: 20, fontFamily: DS.fontMono }}>
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button onClick={onClearAll} style={{
                                    background: 'none', border: 'none', color: DS.textMuted,
                                    fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '4px 8px',
                                    borderRadius: 6, transition: 'color 0.15s',
                                }} onMouseEnter={e => e.currentTarget.style.color = DS.rose}
                                        onMouseLeave={e => e.currentTarget.style.color = DS.textMuted}>
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '48px 20px', textAlign: 'center', color: DS.textMuted }}>
                                    <Bell size={28} style={{ opacity: 0.2, marginBottom: 10 }} />
                                    <div style={{ fontSize: 12 }}>All caught up</div>
                                </div>
                            ) : notifications.map((n, idx) => {
                                const col = SEV_COLORS[n.severity] || DS.cyan;
                                return (
                                    <div key={n.id} className="notif-item" style={{
                                        padding: '13px 18px', borderBottom: `1px solid ${DS.border}`,
                                        display: 'flex', gap: 12, alignItems: 'flex-start',
                                        background: !n.read ? `${col}06` : 'transparent',
                                        cursor: 'default',
                                        animation: `notifPop 0.25s ${idx * 0.04}s ease-out both`,
                                    }}>
                                        {/* Severity dot + icon */}
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                            background: `${col}12`, border: `1px solid ${col}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <AlertCircle size={15} color={col} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: DS.textPrimary, marginBottom: 3 }}>{n.title}</div>
                                            <div style={{ fontSize: 11, color: DS.textSub, lineHeight: 1.5 }}>{n.message}</div>
                                            <div style={{ fontSize: 10, color: DS.textMuted, marginTop: 5, fontFamily: DS.fontMono }}>
                                                {new Date(n.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); onDismiss(n.id); }} style={{
                                            width: 22, height: 22, borderRadius: 5, border: 'none',
                                            background: 'transparent', color: DS.textMuted, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            transition: 'all 0.15s',
                                        }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)'; e.currentTarget.style.color = DS.rose; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = DS.textMuted; }}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR — sectioned, collapsible, with accent-colored indicators
   ───────────────────────────────────────────────────────────────── */
const Sidebar = ({ activeTab, onTabChange, onLogout, currentUser, collapsed, onToggleCollapse, onOpenFeedback, allowedTabIds }) => {
    const [openSections, setOpenSections] = useState(() => {
        const active = getSectionForTab(activeTab);
        return active ? new Set([active]) : new Set();
    });

    useEffect(() => {
        const sec = getSectionForTab(activeTab);
        if (sec) setOpenSections(prev => prev.has(sec) ? prev : new Set([...prev, sec]));
    }, [activeTab]);

    const toggleSection = useCallback((sec) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(sec) ? next.delete(sec) : next.add(sec);
            return next;
        });
    }, []);

    const visibleGroups = useMemo(() =>
            SECTION_GROUPS
                .map(g => ({ ...g, tabs: g.tabs.filter(t => allowedTabIds.includes(t.id)) }))
                .filter(g => g.tabs.length > 0),
        [allowedTabIds]);

    const accent = getSectionAccent(activeTab);

    return (
        <aside style={{
            width: collapsed ? 66 : 248,
            background: DS.bgDeep,
            borderRight: `1px solid ${DS.border}`,
            display: 'flex', flexDirection: 'column',
            zIndex: 50, flexShrink: 0,
            transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
        }}>
            {/* Sidebar inner glow line */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: 1, height: '100%',
                background: `linear-gradient(180deg, transparent 0%, ${DS.cyan}30 30%, ${DS.violet}20 70%, transparent 100%)`,
                pointerEvents: 'none',
            }} />

            {/* Logo */}
            <div style={{
                padding: collapsed ? '20px 0' : '20px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 11, borderBottom: `1px solid ${DS.border}`,
                minHeight: 70, flexShrink: 0,
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: `linear-gradient(135deg, ${DS.cyan}, ${DS.violet})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: DS.glowCyan,
                    animation: 'glowPulse 4s ease-in-out infinite',
                }}>
                    <Database color="#fff" size={17} />
                </div>
                {!collapsed && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: DS.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Vigil</div>
                        <div style={{ fontSize: 9, color: DS.textMuted, fontFamily: DS.fontMono, letterSpacing: '0.12em', textTransform: 'uppercase' }}>PG MONITOR</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <div className="sidebar-nav" style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {visibleGroups.map(group => {
                    const isOpen = collapsed || openSections.has(group.section);
                    const hasActive = group.tabs.some(t => t.id === activeTab);

                    return (
                        <div key={group.section} style={{ marginBottom: 4 }}>
                            {/* Section header */}
                            {collapsed ? (
                                <div style={{ margin: '8px 10px 4px', height: 1, background: `${group.accent}25`, borderRadius: 1 }} />
                            ) : (
                                <button className="section-btn" onClick={() => toggleSection(group.section)} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                                    background: hasActive ? `${group.accent}10` : 'transparent',
                                    marginBottom: 2,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        {hasActive && (
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: group.accent, flexShrink: 0, boxShadow: `0 0 6px ${group.accent}` }} />
                                        )}
                                        <span style={{
                                            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
                                            textTransform: 'uppercase', fontFamily: DS.fontMono,
                                            color: hasActive ? group.accent : DS.textMuted,
                                        }}>{group.section}</span>
                                    </div>
                                    <ChevronDown size={11} color={hasActive ? group.accent : DS.textMuted}
                                                 style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)', flexShrink: 0 }} />
                                </button>
                            )}

                            {/* Tabs */}
                            {isOpen && (
                                <div className={collapsed ? '' : 'section-open'} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {group.tabs.map(tab => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button key={tab.id} className="nav-item"
                                                    onClick={() => onTabChange(tab.id)}
                                                    title={collapsed ? tab.label : undefined}
                                                    data-tip={collapsed ? tab.label : undefined}
                                                    aria-label={tab.label}
                                                    aria-current={isActive ? 'page' : undefined}
                                                    style={{
                                                        display: 'flex', alignItems: 'center',
                                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                                        gap: 9,
                                                        padding: collapsed ? '10px 0' : '8px 10px 8px 20px',
                                                        background: isActive ? `${group.accent}14` : 'transparent',
                                                        border: `1px solid ${isActive ? group.accent + '35' : 'transparent'}`,
                                                        borderRadius: 8, cursor: 'pointer',
                                                        color: isActive ? group.accent : DS.textMuted,
                                                        fontWeight: isActive ? 600 : 400,
                                                        fontSize: 12.5, textAlign: 'left',
                                                        position: 'relative', whiteSpace: 'nowrap',
                                                        overflow: 'hidden', width: '100%',
                                                        fontFamily: DS.fontUI,
                                                        boxShadow: isActive ? `inset 0 0 20px ${group.accent}08` : 'none',
                                                    }}>
                                                {/* Active left accent bar */}
                                                {isActive && (
                                                    <div style={{
                                                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                                        width: 2.5, background: group.accent,
                                                        borderRadius: '0 2px 2px 0',
                                                        boxShadow: `0 0 8px ${group.accent}`,
                                                    }} />
                                                )}
                                                <tab.icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
                                                {!collapsed && (
                                                    <>
                                                        <span style={{ flex: 1 }}>{tab.label}</span>
                                                        {tab.badge && (
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                                                                background: `${DS.rose}22`, color: DS.rose,
                                                                border: `1px solid ${DS.rose}40`, fontFamily: DS.fontMono,
                                                            }}>{tab.badge}</span>
                                                        )}
                                                    </>
                                                )}
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
            <div style={{ padding: collapsed ? '12px 0' : '12px 10px', borderTop: `1px solid ${DS.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button className="nav-item" onClick={onOpenFeedback} title={collapsed ? 'Feedback' : undefined} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 9, background: 'transparent', border: '1px solid transparent',
                    color: DS.textMuted, cursor: 'pointer',
                    padding: collapsed ? '8px 0' : '7px 10px',
                    fontSize: 12.5, fontWeight: 500, borderRadius: 8, width: '100%',
                    fontFamily: DS.fontUI,
                }} onMouseEnter={e => { e.currentTarget.style.color = DS.violet; e.currentTarget.style.background = DS.violetDim; }}
                        onMouseLeave={e => { e.currentTarget.style.color = DS.textMuted; e.currentTarget.style.background = 'transparent'; }}>
                    <MessageSquarePlus size={14} />
                    {!collapsed && 'Feedback'}
                </button>

                {!collapsed && (
                    <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                            background: `linear-gradient(135deg, ${DS.cyan}40, ${DS.violet}40)`,
                            border: `1px solid ${DS.borderAccent}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={13} color={DS.cyan} />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: DS.textPrimary }}>{currentUser?.name}</div>
                            <div style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.fontMono }}>DBA · Active</div>
                        </div>
                    </div>
                )}

                <button className="nav-item" onClick={onLogout} title={collapsed ? 'Logout' : undefined} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 9, background: 'none', border: '1px solid transparent',
                    color: DS.textMuted, cursor: 'pointer',
                    padding: collapsed ? '8px 0' : '7px 10px',
                    fontSize: 12.5, borderRadius: 8, width: '100%', fontFamily: DS.fontUI,
                }} onMouseEnter={e => { e.currentTarget.style.color = DS.rose; e.currentTarget.style.background = 'rgba(251,113,133,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = DS.textMuted; e.currentTarget.style.background = 'none'; }}>
                    <LogOut size={14} />
                    {!collapsed && 'Sign Out'}
                </button>
            </div>

            {/* Collapse toggle */}
            <button className="collapse-btn" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand' : 'Collapse'} style={{
                position: 'absolute', right: -13, top: 84,
                width: 26, height: 26, borderRadius: '50%',
                background: DS.surface, border: `1px solid ${DS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: DS.textMuted, zIndex: 51,
            }} onMouseEnter={e => { e.currentTarget.style.background = DS.cyan; e.currentTarget.style.color = DS.bg; e.currentTarget.style.borderColor = DS.cyan; e.currentTarget.style.boxShadow = DS.glowCyan; }}
                    onMouseLeave={e => { e.currentTarget.style.background = DS.surface; e.currentTarget.style.color = DS.textMuted; e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = 'none'; }}>
                {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────
   WEBSOCKET HOOK
   ───────────────────────────────────────────────────────────────── */
const useWebSocket = (onMessage) => {
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const disconnectRef = useRef(null);
    const timerRef = useRef(null);

    const connect = useCallback(() => {
        setReconnecting(true);
        try {
            disconnectRef.current = connectWS(msg => {
                setConnected(true); setReconnecting(false); onMessage(msg);
            });
        } catch {
            setConnected(false); setReconnecting(false);
            timerRef.current = setTimeout(connect, WS_RECONNECT_INTERVAL);
        }
    }, [onMessage]);

    useEffect(() => { connect(); return () => { if (disconnectRef.current) disconnectRef.current(); clearTimeout(timerRef.current); }; }, [connect]);
    return { connected, reconnecting };
};

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD
   ───────────────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { logout, currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState(() => { try { return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'overview'; } catch { return 'overview'; } });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'; } catch { return false; } });
    const [notifications, setNotifications] = useState([]);
    const [latestAlert, setLatestAlert] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const prevTabRef = useRef(activeTab);

    // Feedback prompt
    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPT)) {
            const t = setTimeout(() => { setShowFeedback(true); localStorage.setItem(STORAGE_KEYS.FEEDBACK_PROMPT, 'true'); }, 3000);
            return () => clearTimeout(t);
        }
    }, []);

    const handleWSMessage = useCallback((msg) => {
        if (msg.type === 'alert') {
            const n = { id: Date.now(), title: msg.payload.title || 'Alert', message: msg.payload.message, severity: msg.payload.severity || 'info', timestamp: Date.now(), read: false };
            setNotifications(p => [n, ...p].slice(0, MAX_NOTIFICATIONS));
            setLatestAlert(msg.payload);
            setTimeout(() => setLatestAlert(null), ALERT_AUTO_DISMISS_TIME);
        }
    }, []);

    const { connected, reconnecting } = useWebSocket(handleWSMessage);

    const allowedTabIds = useMemo(() => TABS_ONLY.filter(t => currentUser.allowedScreens.includes(t.id)).map(t => t.id), [currentUser.allowedScreens]);

    const ActiveComponent = useMemo(() => {
        const tab = TABS_ONLY.find(t => t.id === activeTab && allowedTabIds.includes(t.id));
        if (tab) return tab.component;
        return TABS_ONLY.find(t => allowedTabIds.includes(t.id))?.component;
    }, [activeTab, allowedTabIds]);

    const activeTabMeta = useMemo(() => TABS_ONLY.find(t => t.id === activeTab), [activeTab]);
    const accent = useMemo(() => getSectionAccent(activeTab), [activeTab]);

    const handleTabChange = useCallback((id) => {
        prevTabRef.current = activeTab;
        setActiveTab(id);
        try { localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, id); } catch {}
    }, [activeTab]);

    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed(p => {
            const v = !p;
            try { localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, v.toString()); } catch {}
            return v;
        });
    }, []);

    const handleDismissNotification = useCallback((id) => setNotifications(p => p.filter(n => n.id !== id)), []);
    const handleClearAllNotifications = useCallback(() => setNotifications([]), []);

    // Keyboard shortcut Ctrl+B
    useEffect(() => {
        const handler = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); handleToggleCollapse(); } };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleToggleCollapse]);

    return (
        <div style={{ display: 'flex', height: '100vh', background: DS.bg, color: DS.textPrimary, overflow: 'hidden', fontFamily: DS.fontUI, position: 'relative', zIndex: 1 }}>
            <AppStyles />
            <ChartDefs />
            <AmbientOrbs />

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

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                {/* ── TOP HEADER ── */}
                <header style={{
                    height: 62, flexShrink: 0,
                    borderBottom: `1px solid ${DS.border}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 28px',
                    background: 'rgba(4,6,15,0.85)',
                    backdropFilter: 'blur(20px)',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    {/* Accent underline */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                        background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
                        animation: 'headerGlow 4s ease-in-out infinite',
                    }} />

                    {/* Left: breadcrumb + reconnecting */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Section crumb */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.fontMono, letterSpacing: '0.06em' }}>
                                {getSectionForTab(activeTab)?.toUpperCase() || 'CORE'}
                            </span>
                            <span style={{ color: DS.textMuted, fontSize: 13 }}>/</span>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: DS.textPrimary, letterSpacing: '-0.01em' }}>
                                {activeTabMeta?.label || ''}
                            </h2>
                        </div>

                        {reconnecting && (
                            <div style={{
                                fontSize: 11, color: DS.amber,
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', background: 'rgba(251,191,36,0.08)',
                                borderRadius: 20, border: '1px solid rgba(251,191,36,0.25)',
                                fontFamily: DS.fontMono,
                            }}>
                                <WifiOff size={12} style={{ animation: 'pulse 1.5s infinite' }} />
                                RECONNECTING…
                            </div>
                        )}
                    </div>

                    {/* Right: sparkline + status + bell */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'rgba(56,189,248,0.05)', borderRadius: 8, border: `1px solid ${DS.border}` }}>
                            <MiniSparkline color={DS.cyan} />
                            <span style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.fontMono }}>QPS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'rgba(52,211,153,0.05)', borderRadius: 8, border: `1px solid ${DS.border}` }}>
                            <MiniSparkline color={DS.emerald} />
                            <span style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.fontMono }}>CPU</span>
                        </div>
                        <div style={{ width: 1, height: 24, background: DS.border }} />
                        <StatusPill connected={connected} />
                        <NotificationCenter notifications={notifications} onDismiss={handleDismissNotification} onClearAll={handleClearAllNotifications} />
                    </div>
                </header>

                {/* ── MAIN CONTENT ── */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {/* Floating alert toast */}
                    {latestAlert && (
                        <div style={{ position: 'fixed', top: 78, right: 28, zIndex: 200, width: 380, animation: 'slideInRight 0.3s cubic-bezier(0.34,1.4,0.64,1) both' }}>
                            <div style={{
                                background: DS.surface, borderRadius: 12, overflow: 'hidden',
                                border: `1px solid ${SEV_COLORS[latestAlert.severity] || DS.cyan}50`,
                                boxShadow: `${DS.shadowCard}, 0 0 20px ${SEV_COLORS[latestAlert.severity] || DS.cyan}20`,
                            }}>
                                <div style={{ height: 2.5, background: SEV_COLORS[latestAlert.severity] || DS.cyan }} />
                                <AlertBanner alert={latestAlert} onDismiss={() => setLatestAlert(null)} />
                            </div>
                        </div>
                    )}

                    <div style={{ padding: '28px 32px', maxWidth: 1640, margin: '0 auto', minHeight: '100%' }}>
                        <ErrorBoundary key={activeTab}>
                            <div key={activeTab} className="tab-mount">
                                {ActiveComponent && <ActiveComponent />}
                            </div>
                        </ErrorBoundary>
                    </div>
                </div>
            </main>

            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────
   LOADING SCREEN
   ───────────────────────────────────────────────────────────────── */
const LoadingScreen = () => (
    <div style={{
        height: '100vh', background: DS.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 20, color: DS.textPrimary, fontFamily: DS.fontUI,
    }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
            {/* Spinning ring */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${DS.border}`,
                borderTopColor: DS.cyan,
                animation: 'rotate 1.1s linear infinite',
            }} />
            {/* Inner logo */}
            <div style={{
                position: 'absolute', inset: 8, borderRadius: '50%',
                background: `linear-gradient(135deg, ${DS.cyan}30, ${DS.violet}30)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Database color={DS.cyan} size={18} />
            </div>
        </div>
        <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: DS.textPrimary, textAlign: 'center', letterSpacing: '-0.01em' }}>Vigil</div>
            <div style={{ fontSize: 11, color: DS.textMuted, textAlign: 'center', marginTop: 4, fontFamily: DS.fontMono, letterSpacing: '0.1em' }}>INITIALIZING…</div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   AUTH CONSUMER + APP ENTRY
   ───────────────────────────────────────────────────────────────── */
const AuthConsumer = () => {
    const { currentUser, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return currentUser ? <ErrorBoundary><Dashboard /></ErrorBoundary> : <LoginPage />;
};

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        </ErrorBoundary>
    );
}