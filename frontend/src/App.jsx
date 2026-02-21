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
    CalendarCheck, FileSearch, Link2, Cpu, BarChart2, Lock,
    ThumbsUp, Lightbulb, AlertTriangle, PlusCircle
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
const AUTH_TOKEN_KEY           = 'vigil_token';
const FEEDBACK_RATE_LIMIT_MS   = 5 * 60 * 1000; // 5 minutes

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
        .nav-item { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .nav-item:hover .nav-icon { opacity: 1 !important; }

        /* ── Section header ── */
        .section-btn { transition: all 0.15s ease; }
        .section-btn:hover { background: rgba(255,255,255,0.03) !important; }

        /* ── Section tab animation ── */
        .section-open { animation: sectionOpen 0.18s ease-out both; }

        /* ── Content tab mount ── */
        .tab-mount { animation: tabIn 0.22s ease-out both; }

        /* ── Notification panel ── */
        .notif-panel { animation: slideDown 0.22s cubic-bezier(0.34,1.4,0.64,1) both; }
        .notif-item { transition: background 0.15s ease; }
        .notif-item:hover { background: rgba(56,189,248,0.05) !important; }

        /* ── Feedback overlay ── */
        .feedback-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease-out; }
        .feedback-modal   { animation: slideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both; }
        .fb-input:focus   { border-color: rgba(56,189,248,0.5) !important; box-shadow: 0 0 0 3px rgba(56,189,248,0.1) !important; }
        .fb-tab:hover     { opacity: 1 !important; }
        .fb-prio:hover    { opacity: 1 !important; }
        .fb-opt:hover     { background: rgba(56,189,248,0.06) !important; }
        .fb-submit:not(:disabled):hover { filter: brightness(1.12); transform: translateY(-1px); }
        .fb-submit:not(:disabled):active { transform: translateY(0); }

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
   FEEDBACK MODAL — full per-screen feedback, feature requests,
   bug reports. Maps to every column in user_feedback DB table.
   ───────────────────────────────────────────────────────────────── */

/* ── Data ─────────────────────────────────────────────────────── */
const FB_MODES = [
    { id: 'feature', label: 'Feature Request', icon: Lightbulb,     color: DS.cyan   },
    { id: 'bug',     label: 'Bug Report',       icon: AlertTriangle, color: DS.rose   },
    { id: 'general', label: 'General',          icon: MessageSquarePlus, color: DS.violet },
];

const FB_PRIORITY = [
    { val: 'Low',    color: DS.emerald },
    { val: 'Medium', color: DS.amber   },
    { val: 'High',   color: DS.rose    },
];

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

/* All screens grouped — mirrors TAB_CONFIG exactly */
const FB_GROUPS = (() => {
    const groups = [];
    let cur = null;
    for (const item of TAB_CONFIG) {
        if (item.section) { cur = { group: item.section, accent: item.accent, tabs: [] }; groups.push(cur); }
        else if (cur) cur.tabs.push({ id: item.id, label: item.label });
    }
    return groups;
})();
const FB_ALL_TABS = FB_GROUPS.flatMap(g => g.tabs);
const emptyRow = () => ({ rating: 0, comment: '', remarks: '' });

/* ── Shared primitives ────────────────────────────────────────── */
const FbLabel = ({ children, color }) => (
    <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: color || DS.textMuted,
        marginBottom: 8, fontFamily: DS.fontMono,
        display: 'flex', alignItems: 'center', gap: 5,
    }}>{children}</div>
);

const FbInput = ({ value, onChange, placeholder, maxLength, style: extraStyle }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
               placeholder={placeholder} maxLength={maxLength}
               className="fb-input"
               style={{
                   width: '100%', boxSizing: 'border-box',
                   background: 'rgba(255,255,255,0.03)',
                   border: `1px solid ${focused ? DS.borderAccent : DS.border}`,
                   borderRadius: 9, padding: '10px 13px', color: DS.textPrimary,
                   fontSize: 13, outline: 'none', fontFamily: DS.fontUI,
                   transition: 'border-color 0.2s, box-shadow 0.2s',
                   ...extraStyle,
               }}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
        />
    );
};

const FbTextarea = ({ value, onChange, placeholder, rows = 3, maxLength = 500, showCount = true }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <textarea value={value} onChange={e => onChange(e.target.value)}
                      placeholder={placeholder} rows={rows} maxLength={maxLength}
                      className="fb-input"
                      style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${focused ? DS.borderAccent : DS.border}`,
                          borderRadius: 9, padding: '10px 13px', color: DS.textPrimary,
                          fontSize: 13, outline: 'none', resize: 'none', fontFamily: DS.fontUI,
                          lineHeight: 1.6, transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
            />
            {showCount && (
                <div style={{ fontSize: 10, color: DS.textMuted, textAlign: 'right', marginTop: 3, fontFamily: DS.fontMono }}>
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
};

const FbStarRow = ({ value, onChange, size = 22 }) => {
    const [hov, setHov] = useState(0);
    const d = hov || value;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" className="star-btn"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHov(s)}
                        onMouseLeave={() => setHov(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}
                >
                    <Star size={size}
                          fill={s <= d ? DS.amber : 'transparent'}
                          color={s <= d ? DS.amber : DS.textMuted}
                          strokeWidth={1.5}
                          style={{ display: 'block', transition: 'fill 0.12s' }}
                    />
                </button>
            ))}
            {d > 0 && (
                <span style={{ fontSize: 10, color: DS.textMuted, fontFamily: DS.fontMono, marginLeft: 4, userSelect: 'none' }}>
                    {STAR_LABELS[d - 1]}
                </span>
            )}
        </div>
    );
};

/* Full grouped dropdown for section picker */
const FbSectionDropdown = ({ value, onChange, includeAll = false }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const label = (!value || value === 'all')
        ? 'All Sections'
        : (FB_ALL_TABS.find(t => t.id === value)?.label || value);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)}
                    className="fb-input"
                    style={{
                        width: '100%', boxSizing: 'border-box', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${open ? DS.borderAccent : DS.border}`,
                        borderRadius: 9, padding: '10px 13px', color: DS.textPrimary,
                        fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: DS.fontUI,
                        transition: 'border-color 0.2s',
                    }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={DS.cyan} /> {label}
                </span>
                <ChevronDown size={13} color={DS.textMuted}
                             style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                    background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                    borderRadius: 10, boxShadow: DS.shadowDeep, zIndex: 30,
                    maxHeight: 260, overflowY: 'auto',
                }}>
                    {includeAll && (
                        <button type="button" className="fb-opt"
                                onClick={() => { onChange('all'); setOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '9px 14px',
                                    background: (!value || value === 'all') ? DS.cyanDim : 'transparent',
                                    color: (!value || value === 'all') ? DS.cyan : DS.textSub,
                                    border: 'none', borderBottom: `1px solid ${DS.border}`,
                                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                    fontFamily: DS.fontUI, transition: 'background 0.15s',
                                }}>
                            All Sections
                        </button>
                    )}
                    {FB_GROUPS.map(g => (
                        <React.Fragment key={g.group}>
                            <div style={{
                                padding: '5px 14px 4px',
                                fontSize: 9, fontWeight: 700, color: g.accent,
                                fontFamily: DS.fontMono, letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: `${g.accent}08`,
                                borderBottom: `1px solid ${DS.border}`,
                            }}>{g.group}</div>
                            {g.tabs.map(tab => (
                                <button key={tab.id} type="button" className="fb-opt"
                                        onClick={() => { onChange(tab.id); setOpen(false); }}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '8px 14px 8px 22px',
                                            background: value === tab.id ? DS.cyanDim : 'transparent',
                                            color: value === tab.id ? DS.cyan : DS.textSub,
                                            border: 'none', borderBottom: `1px solid ${DS.border}`,
                                            cursor: 'pointer', fontSize: 12,
                                            fontWeight: value === tab.id ? 600 : 400,
                                            fontFamily: DS.fontUI, transition: 'background 0.15s',
                                        }}>
                                    {tab.label}
                                </button>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

/* Single section card (used in both single + all-sections modes) */
const FbSectionCard = ({ label, data, onChange, compact = false, accent = DS.cyan }) => (
    <div style={{
        border: `1px solid ${DS.border}`, borderRadius: 10,
        padding: compact ? '12px 14px' : '18px',
        background: 'rgba(255,255,255,0.015)',
        marginBottom: compact ? 8 : 0,
    }}>
        {compact && (
            <div style={{
                fontSize: 10, fontWeight: 700, color: accent, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: DS.fontMono,
                letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
                <Layers size={10} /> {label}
            </div>
        )}
        <div style={{ marginBottom: 12 }}>
            <FbLabel>Rating</FbLabel>
            <FbStarRow value={data.rating} onChange={v => onChange('rating', v)} size={compact ? 18 : 22} />
        </div>
        <div style={{ marginBottom: 10 }}>
            <FbLabel>Feedback</FbLabel>
            <FbTextarea value={data.comment} onChange={v => onChange('comment', v)}
                        placeholder="What do you love, or what could be better?" rows={compact ? 2 : 3} />
        </div>
        <div>
            <FbLabel>Suggestions</FbLabel>
            <FbTextarea value={data.remarks} onChange={v => onChange('remarks', v)}
                        placeholder="Any specific improvements you'd recommend?"
                        rows={compact ? 2 : 2} showCount={false} />
        </div>
    </div>
);

/* Feature request form */
const FbFeatureForm = ({ data, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
            <FbLabel>Related Section</FbLabel>
            <FbSectionDropdown value={data.section} onChange={v => onChange('section', v)} />
        </div>
        <div>
            <FbLabel>Feature Title <span style={{ color: DS.rose }}>*</span></FbLabel>
            <FbInput value={data.title} onChange={v => onChange('title', v)}
                     placeholder="Give your feature a short, descriptive name" maxLength={120} />
        </div>
        <div>
            <FbLabel>Description / Use Case <span style={{ color: DS.rose }}>*</span></FbLabel>
            <FbTextarea value={data.description} onChange={v => onChange('description', v)}
                        placeholder="Describe the feature and why it would be valuable…" rows={3} />
        </div>
        <div>
            <FbLabel>Additional Remarks</FbLabel>
            <FbTextarea value={data.remarks} onChange={v => onChange('remarks', v)}
                        placeholder="Implementation ideas, references, or further context…" rows={2} showCount={false} />
        </div>
        {/* Suggest new tab */}
        <div style={{
            padding: '14px 16px',
            border: `1px dashed ${DS.borderAccent}`,
            borderRadius: 10, background: DS.cyanDim,
        }}>
            <FbLabel color={DS.cyan}>
                <PlusCircle size={10} /> Suggest a New Tab
                <span style={{ color: DS.textMuted, textTransform: 'none', fontWeight: 400, letterSpacing: 0, marginLeft: 2 }}>(optional)</span>
            </FbLabel>
            <FbInput value={data.suggestedTab} onChange={v => onChange('suggestedTab', v)}
                     placeholder="e.g. Query History, Cost Estimator, Live Replication…" maxLength={80} />
        </div>
        {/* Priority */}
        <div>
            <FbLabel>Priority</FbLabel>
            <div style={{ display: 'flex', gap: 8 }}>
                {FB_PRIORITY.map(({ val, color }) => {
                    const active = data.priority === val;
                    return (
                        <button key={val} type="button" className="fb-prio"
                                onClick={() => onChange('priority', val)}
                                style={{
                                    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                    border: `1px solid ${active ? color : DS.border}`,
                                    background: active ? `${color}15` : 'transparent',
                                    color: active ? color : DS.textMuted,
                                    cursor: 'pointer', fontFamily: DS.fontUI, transition: 'all 0.18s',
                                    opacity: active ? 1 : 0.7,
                                }}>
                            {val}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

/* Bug / General form */
const FbBugGeneralForm = ({ section, onSectionChange, forms, onFieldChange }) => {
    const showAll = section === 'all';
    const accentFor = id => FB_GROUPS.find(g => g.tabs.some(t => t.id === id))?.accent || DS.cyan;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <FbLabel>Screen / Section</FbLabel>
                <FbSectionDropdown value={section} onChange={onSectionChange} includeAll />
            </div>
            {showAll ? (
                <>
                    <div style={{
                        fontSize: 12, color: DS.textSub, padding: '9px 13px',
                        background: DS.cyanDim, border: `1px solid ${DS.borderAccent}`,
                        borderRadius: 8, lineHeight: 1.55,
                    }}>
                        Rate any screens you've used. Leave sections blank to skip them — only filled sections will be submitted.
                    </div>
                    {FB_GROUPS.map(g => (
                        <div key={g.group}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, color: g.accent,
                                fontFamily: DS.fontMono, letterSpacing: '0.1em',
                                textTransform: 'uppercase', marginBottom: 6, marginTop: 4, paddingLeft: 2,
                            }}>{g.group}</div>
                            {g.tabs.map(tab => (
                                <FbSectionCard key={tab.id} label={tab.label}
                                               data={forms[tab.id] || emptyRow()}
                                               onChange={(field, val) => onFieldChange(tab.id, field, val)}
                                               compact accent={g.accent} />
                            ))}
                        </div>
                    ))}
                </>
            ) : (
                <FbSectionCard
                    label={FB_ALL_TABS.find(t => t.id === section)?.label || section}
                    data={forms[section] || emptyRow()}
                    onChange={(field, val) => onFieldChange(section, field, val)}
                    accent={accentFor(section)}
                />
            )}
        </div>
    );
};

/* ── Main modal ───────────────────────────────────────────────── */
const FeedbackModal = ({ onClose, initialSection }) => {
    const { currentUser } = useAuth();

    const [mode, setMode]       = useState('feature');
    const [feature, setFeature] = useState({
        section: initialSection || null,
        title: '', description: '', remarks: '', priority: 'Medium', suggestedTab: '',
    });
    const [section, setSection]       = useState(initialSection || 'all');
    const [forms, setForms]           = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent]             = useState(false);
    const [error, setError]           = useState('');

    /* Pre-populate section form when initialSection is provided */
    useEffect(() => {
        if (initialSection && initialSection !== 'all' && !forms[initialSection]) {
            setForms(p => ({ ...p, [initialSection]: emptyRow() }));
        }
    }, []);

    /* Ensure row exists when section changes */
    useEffect(() => {
        if (section !== 'all' && !forms[section]) {
            setForms(p => ({ ...p, [section]: emptyRow() }));
        }
    }, [section]);

    /* Rate-limit notice (non-blocking — just a warning) */
    const [rateLimited, setRateLimited] = useState(false);
    useEffect(() => {
        try {
            const last = parseInt(localStorage.getItem('vigil_last_feedback') || '0', 10);
            if (last > 0 && Date.now() - last < FEEDBACK_RATE_LIMIT_MS)
                setRateLimited(true);
        } catch {}
    }, []);

    /* Esc to close */
    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const updateFeature   = (k, v) => setFeature(p => ({ ...p, [k]: v }));
    const updateFormField = (tabId, field, val) =>
        setForms(p => ({ ...p, [tabId]: { ...(p[tabId] || emptyRow()), [field]: val } }));

    const canSubmit = useCallback(() => {
        if (sent || submitting) return false;
        if (mode === 'feature') return feature.title.trim().length > 0 && feature.description.trim().length > 0;
        if (section === 'all') return FB_ALL_TABS.some(t => (forms[t.id]?.comment || '').trim().length > 0);
        return (forms[section]?.comment || '').trim().length > 0;
    }, [sent, submitting, mode, feature, section, forms]);

    /* Build payload — maps 1-to-1 to user_feedback columns.
       username / user_id are resolved server-side from the Bearer token. */
    const buildPayload = useCallback(() => {
        const meta = {
            page:       window.location.pathname,
            userAgent:  navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            timestamp:  new Date().toISOString(),
        };

        if (mode === 'feature') {
            const sugTab = feature.suggestedTab.trim() || null;
            return {
                feedback_type:    'feature',
                rating:           null,
                comment:          feature.description.trim() || '',  // NOT NULL column
                remarks:          feature.remarks.trim()    || null,
                section:          feature.section           || null,
                feature_title:    feature.title.trim(),
                feature_priority: feature.priority,
                suggested_tab:    sugTab,                            // dedicated column (not buried in JSONB)
                section_feedback: null,
                user_metadata:    { ...meta },
            };
        }

        if (section === 'all') {
            const sectionFeedback = FB_ALL_TABS
                .map(tab => {
                    const row = forms[tab.id] || emptyRow();
                    return {
                        section_id:    tab.id,
                        section_label: tab.label,
                        rating:        row.rating  || null,
                        comment:       row.comment.trim(),
                        remarks:       row.remarks.trim() || null,
                    };
                })
                .filter(r => r.comment || r.rating);
            return {
                feedback_type:    mode,
                rating:           null,
                comment:          sectionFeedback
                    .map(r => `[${r.section_label}] ${r.comment}`)
                    .filter(Boolean)
                    .join('\n') || '',              // NOT NULL column
                remarks:          null,
                section:          null,
                feature_title:    null,
                feature_priority: null,
                suggested_tab:    null,
                section_feedback: sectionFeedback,
                user_metadata:    { ...meta, mode: 'all-sections' },
            };
        }

        /* Single section */
        const row = forms[section] || emptyRow();
        return {
            feedback_type:    mode,
            rating:           row.rating  || null,
            comment:          row.comment.trim() || '',              // NOT NULL column
            remarks:          row.remarks.trim() || null,
            section:          section,
            feature_title:    null,
            feature_priority: null,
            suggested_tab:    null,
            section_feedback: null,
            user_metadata:    meta,
        };
    }, [mode, feature, section, forms]);

    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setSubmitting(true);
        setError('');

        const payload = buildPayload();
        console.debug('[FeedbackModal] payload →', JSON.stringify(payload, null, 2));

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('Not authenticated — please refresh and log in again.');

            const res = await fetch('/api/feedback', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            /* Try to parse response body regardless of status */
            let resBody = {};
            try { resBody = await res.json(); } catch {}

            if (!res.ok) {
                const msg = resBody?.error || resBody?.message || resBody?.detail;
                if      (res.status === 400) throw new Error(`Validation error: ${msg || 'check required fields'}`);
                else if (res.status === 401) throw new Error('Session expired — please log in again.');
                else if (res.status === 403) throw new Error('Permission denied (403).');
                else if (res.status === 404) throw new Error('Feedback endpoint not found (404) — check server routing.');
                else if (res.status === 405) throw new Error('Method not allowed (405) — server must accept POST /api/feedback.');
                else if (res.status === 422) throw new Error(`Unprocessable data (422): ${msg || 'invalid payload shape'}`);
                else if (res.status >= 500)  throw new Error(`Server error (${res.status})${msg ? ': ' + msg : ' — check server logs'}.`);
                else                         throw new Error(`Request failed (${res.status})${msg ? ': ' + msg : ''}.`);
            }

            /* ✓ Success */
            try { localStorage.setItem('vigil_last_feedback', Date.now().toString()); } catch {}
            setSent(true);
            setTimeout(onClose, 2800);

        } catch (e) {
            console.error('[FeedbackModal] submit error:', e);
            setError(e.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const ready = canSubmit();
    const wide = mode !== 'feature' && section === 'all';

    /* Success state */
    if (sent) return (
        <div className="feedback-overlay">
            <div className="feedback-modal" style={{
                background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20, padding: '52px 44px', textAlign: 'center',
                boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`, maxWidth: 360, width: '90%',
            }}>
                <div style={{
                    width: 68, height: 68, margin: '0 auto 22px', borderRadius: '50%',
                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'glowPulse 2s ease infinite',
                }}>
                    <ThumbsUp size={30} color={DS.emerald} strokeWidth={1.5} />
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: DS.textPrimary, letterSpacing: '-0.02em' }}>
                    Thank you!
                </h3>
                <p style={{ color: DS.textSub, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                    Your feedback helps us make Vigil better for everyone.
                </p>
            </div>
        </div>
    );

    return (
        <div className="feedback-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="feedback-modal" style={{
                background: DS.surface,
                border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20,
                width: wide ? 580 : 490,
                maxWidth: '94vw',
                maxHeight: '90vh',
                boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Animated rainbow top bar */}
                <div style={{
                    height: 3, flexShrink: 0,
                    background: `linear-gradient(90deg, ${DS.cyan}, ${DS.violet}, ${DS.emerald})`,
                    backgroundSize: '200% 100%',
                    animation: 'waveFlow 3s ease infinite',
                }} />

                {/* Header */}
                <div style={{
                    padding: '20px 26px 18px',
                    borderBottom: `1px solid ${DS.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexShrink: 0,
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: DS.textPrimary, letterSpacing: '-0.02em' }}>
                            Send Feedback
                        </h3>
                        <div style={{ fontSize: 10, color: DS.textMuted, marginTop: 4, fontFamily: DS.fontMono, letterSpacing: '0.1em' }}>
                            VIGIL · DATABASE MONITOR
                        </div>
                    </div>
                    <button onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: `1px solid ${DS.border}`,
                                color: DS.textSub, cursor: 'pointer', width: 32, height: 32, borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s', flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)'; e.currentTarget.style.color = DS.rose; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = DS.textSub; e.currentTarget.style.borderColor = DS.border; }}
                            aria-label="Close feedback"
                    >
                        <X size={15} strokeWidth={2} />
                    </button>
                </div>

                {/* Mode tabs */}
                <div style={{
                    display: 'flex', gap: 6, padding: '14px 26px 12px',
                    borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
                    background: 'rgba(255,255,255,0.01)',
                }}>
                    {FB_MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                            <button key={m.id} type="button" className="fb-tab"
                                    onClick={() => { setMode(m.id); setError(''); }}
                                    style={{
                                        flex: 1, padding: '9px 6px', borderRadius: 9,
                                        border: `1px solid ${active ? `${m.color}50` : DS.border}`,
                                        background: active ? `${m.color}12` : 'transparent',
                                        color: active ? m.color : DS.textMuted,
                                        cursor: 'pointer', fontSize: 11, fontWeight: active ? 600 : 400,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                        transition: 'all 0.18s', fontFamily: DS.fontUI, opacity: active ? 1 : 0.65,
                                    }}>
                                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                                {m.label}
                            </button>
                        );
                    })}
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px' }}>
                    {mode === 'feature' ? (
                        <FbFeatureForm data={feature} onChange={updateFeature} />
                    ) : (
                        <FbBugGeneralForm
                            section={section}
                            onSectionChange={s => { setSection(s); setError(''); }}
                            forms={forms}
                            onFieldChange={updateFormField}
                        />
                    )}

                    {/* Rate-limit soft notice */}
                    {rateLimited && !error && (
                        <div style={{
                            marginTop: 16, padding: '9px 13px', borderRadius: 9,
                            background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.22)',
                            color: DS.amber, fontSize: 11, lineHeight: 1.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                                You submitted feedback recently — you can still submit again if needed.
                            </span>
                            <button type="button" onClick={() => setRateLimited(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.amber, opacity: 0.6, padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                            ><X size={13} /></button>
                        </div>
                    )}

                    {/* Hard error */}
                    {error && (
                        <div style={{
                            marginTop: 16, padding: '10px 14px', borderRadius: 9,
                            background: 'rgba(251,113,133,0.08)',
                            border: '1px solid rgba(251,113,133,0.25)',
                            color: DS.rose, fontSize: 12, lineHeight: 1.5,
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                        }}>
                            <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                {error}
                            </span>
                            <button type="button" onClick={() => setError('')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.rose, opacity: 0.6, padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                    aria-label="Dismiss error"
                            ><X size={14} /></button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 26px 20px', borderTop: `1px solid ${DS.border}`, flexShrink: 0 }}>
                    <div style={{
                        fontSize: 10, color: DS.textMuted, marginBottom: 10,
                        fontFamily: DS.fontMono, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span style={{ color: DS.rose }}>*</span>
                        {mode === 'feature'
                            ? 'Title and description are required'
                            : 'At least one section comment is required'}
                    </div>
                    <button type="button" className="fb-submit" onClick={handleSubmit} disabled={!ready}
                            style={{
                                width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                                background: ready
                                    ? `linear-gradient(135deg, ${DS.cyan}, ${DS.violet})`
                                    : 'rgba(255,255,255,0.05)',
                                color: ready ? '#fff' : DS.textMuted,
                                fontSize: 13, fontWeight: 700,
                                cursor: ready ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                letterSpacing: '0.03em', fontFamily: DS.fontUI,
                                transition: 'filter 0.2s, transform 0.15s, box-shadow 0.2s',
                                opacity: submitting ? 0.7 : 1,
                                boxShadow: ready ? '0 4px 20px rgba(56,189,248,0.22)' : 'none',
                            }}>
                        {submitting ? (
                            <><Zap size={14} /> Sending…</>
                        ) : mode === 'feature' ? (
                            <><PlusCircle size={14} /> Submit Feature Request</>
                        ) : (
                            <><Send size={14} /> Send Feedback</>
                        )}
                    </button>
                </div>
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
   SIDEBAR
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

    const W = collapsed ? 64 : 252;

    return (
        <aside style={{
            width: W,
            minWidth: W,
            background: '#050810',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            flexShrink: 0,
            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* Right-edge gradient rule */}
            <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 1, pointerEvents: 'none',
                background: 'linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.18) 40%, rgba(129,140,248,0.12) 75%, transparent 100%)',
            }} />

            {/* ── LOGO ── */}
            <div style={{
                height: 64, flexShrink: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? 0 : '0 18px',
                gap: 12,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                {/* Icon mark */}
                <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(56,189,248,0.35)',
                }}>
                    <Database color="#fff" size={15} strokeWidth={2.5} />
                </div>

                {/* Wordmark — hidden when collapsed */}
                {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{
                            fontSize: 15, fontWeight: 800, letterSpacing: '-0.03em',
                            color: '#f0f4ff',
                        }}>
                            PG <span style={{ color: '#38bdf8' }}>Monitor</span>
                        </span>
                        <span style={{
                            fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                            color: '#475569', fontFamily: DS.fontMono, marginTop: 2,
                        }}>
                            Database Intelligence
                        </span>
                    </div>
                )}
            </div>

            {/* ── NAV ── */}
            <div className="sidebar-nav" style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '8px 0',
            }}>
                {visibleGroups.map((group, gi) => {
                    const isOpen = collapsed || openSections.has(group.section);
                    const hasActive = group.tabs.some(t => t.id === activeTab);

                    return (
                        <div key={group.section} style={{ marginBottom: 2 }}>

                            {/* ── Section label / divider ── */}
                            {collapsed ? (
                                /* Icon-only mode: just a thin colored divider */
                                gi > 0 && (
                                    <div style={{
                                        margin: '6px 16px',
                                        height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${group.accent}40, transparent)`,
                                    }} />
                                )
                            ) : (
                                <button
                                    className="section-btn"
                                    onClick={() => toggleSection(group.section)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '7px 16px 5px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRadius: 0,
                                        marginTop: gi === 0 ? 2 : 8,
                                    }}
                                >
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        fontFamily: DS.fontMono,
                                        color: hasActive ? group.accent : '#334155',
                                    }}>
                                        {group.section}
                                    </span>
                                    <ChevronDown
                                        size={12}
                                        color={hasActive ? group.accent : '#334155'}
                                        style={{
                                            transition: 'transform 0.2s ease',
                                            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            flexShrink: 0,
                                        }}
                                    />
                                </button>
                            )}

                            {/* ── Tab items ── */}
                            {isOpen && (
                                <div className={collapsed ? '' : 'section-open'}>
                                    {group.tabs.map(tab => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => onTabChange(tab.id)}
                                                aria-label={tab.label}
                                                aria-current={isActive ? 'page' : undefined}
                                                title={collapsed ? tab.label : undefined}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                                    gap: 10,
                                                    /* Left padding: 16px base + 4px for the active bar space */
                                                    padding: collapsed
                                                        ? '9px 0'
                                                        : isActive
                                                            ? '8px 14px 8px 13px'
                                                            : '8px 14px 8px 16px',
                                                    background: isActive
                                                        ? `linear-gradient(90deg, ${group.accent}1a 0%, ${group.accent}08 100%)`
                                                        : 'transparent',
                                                    border: 'none',
                                                    borderLeft: isActive
                                                        ? `3px solid ${group.accent}`
                                                        : '3px solid transparent',
                                                    cursor: 'pointer',
                                                    color: isActive ? group.accent : '#64748b',
                                                    fontWeight: isActive ? 600 : 400,
                                                    fontSize: 13,
                                                    textAlign: 'left',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontFamily: DS.fontUI,
                                                    transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                                                    position: 'relative',
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                        e.currentTarget.style.color = '#94a3b8';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = '#64748b';
                                                    }
                                                }}
                                            >
                                                {/* Icon */}
                                                <tab.icon
                                                    size={15}
                                                    style={{
                                                        flexShrink: 0,
                                                        opacity: isActive ? 1 : 0.6,
                                                        filter: isActive ? `drop-shadow(0 0 4px ${group.accent}80)` : 'none',
                                                    }}
                                                />

                                                {/* Label + badge */}
                                                {!collapsed && (
                                                    <>
                                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {tab.label}
                                                        </span>
                                                        {tab.badge && (
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 700,
                                                                padding: '1px 6px', borderRadius: 10,
                                                                background: 'rgba(251,113,133,0.15)',
                                                                color: DS.rose,
                                                                border: '1px solid rgba(251,113,133,0.3)',
                                                                fontFamily: DS.fontMono,
                                                                lineHeight: '16px',
                                                                flexShrink: 0,
                                                            }}>
                                                                {tab.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {/* Active right-side glow smear */}
                                                {isActive && !collapsed && (
                                                    <div style={{
                                                        position: 'absolute', right: 0, top: 0, bottom: 0, width: 60,
                                                        background: `linear-gradient(270deg, ${group.accent}10, transparent)`,
                                                        pointerEvents: 'none',
                                                    }} />
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

            {/* ── FOOTER ── */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: collapsed ? '10px 0' : '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}>
                {/* User info row */}
                {!collapsed && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', marginBottom: 2,
                        background: 'rgba(56,189,248,0.04)',
                        borderRadius: 8,
                        border: '1px solid rgba(56,189,248,0.1)',
                    }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(129,140,248,0.25))',
                            border: '1px solid rgba(56,189,248,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={14} color={DS.cyan} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentUser?.name}
                            </div>
                            <div style={{ fontSize: 10, color: '#38bdf8', fontFamily: DS.fontMono, letterSpacing: '0.06em' }}>
                                ● Online
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                <button
                    onClick={onOpenFeedback}
                    title={collapsed ? 'Feedback' : undefined}
                    style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: 10, background: 'transparent', border: 'none',
                        color: '#475569', cursor: 'pointer',
                        padding: collapsed ? '9px 0' : '8px 10px',
                        fontSize: 13, fontWeight: 400, borderRadius: 8, width: '100%',
                        fontFamily: DS.fontUI, transition: 'color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = DS.violet; e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <MessageSquarePlus size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && 'Feedback'}
                </button>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    title={collapsed ? 'Sign out' : undefined}
                    style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: 10, background: 'none', border: 'none',
                        color: '#475569', cursor: 'pointer',
                        padding: collapsed ? '9px 0' : '8px 10px',
                        fontSize: 13, borderRadius: 8, width: '100%',
                        fontFamily: DS.fontUI, transition: 'color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = DS.rose; e.currentTarget.style.background = 'rgba(251,113,133,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none'; }}
                >
                    <LogOut size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && 'Sign Out'}
                </button>
            </div>

            {/* ── COLLAPSE TOGGLE ── */}
            <button
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    position: 'absolute', right: -11, top: 76,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#0a0f1e',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#475569', zIndex: 51,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = DS.cyan;
                    e.currentTarget.style.color = '#020409';
                    e.currentTarget.style.borderColor = DS.cyan;
                    e.currentTarget.style.boxShadow = DS.glowCyan;
                    e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = '#0a0f1e';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
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

            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} initialSection={activeTab} />}
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