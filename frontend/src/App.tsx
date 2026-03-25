// @ts-nocheck
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
  useContext,
  ReactNode,
  ComponentType,
  ReactElement,
  FC,
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import {
  ConnectionProvider,
  useConnection,
} from './context/ConnectionContext.jsx';
import { NavigationContext } from './context/NavigationContext.jsx';
import { DemoProvider, useDemo, DEMO_USER } from './context/DemoContext.jsx';
import { THEME, ChartDefs, useAdaptiveTheme } from './utils/theme.jsx';
import { connectWS, postData } from './utils/api';
import {
  DS_DARK,
  DS_LIGHT,
  DS_ACCENTS,
  setDS,
  getDS,
} from './config/designTokens.js';
import {
  registerComponents,
  buildTabConfig,
  getTabsOnly,
  getSectionGroups,
  STORAGE_KEYS,
} from './config/tabConfig.js';

import LoginPage from './components/auth/LoginPage.jsx';
import {
  ToastProvider,
  useToast,
  Breadcrumbs,
  ProgressBar,
} from './components/ui/SharedComponents.jsx';

// Enterprise context providers and components
import { LicenseProvider } from './enterprise/context/LicenseContext.jsx';
import { OrgProvider } from './enterprise/context/OrgContext.jsx';
import LicenseGate from './enterprise/components/LicenseGate.jsx';
import LicenseStatus from './enterprise/components/LicenseStatus.jsx';
import OrgSwitcher from './enterprise/components/OrgSwitcher.jsx';

/* ── Retry wrapper for lazy imports (handles stale chunk hashes after deploy) ── */
const lazyRetry = (
  importFn: () => Promise<{ default: ComponentType<any> }>
): ComponentType<any> =>
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
    })
  );

const SSOCallback = lazyRetry(() => import('./components/auth/SSOCallback.jsx'));

/* ── Lazy-loaded tab components for faster initial load ── */
// Monitoring features
const OverviewTab = lazyRetry(() =>
  import('./components/views/monitoring/OverviewTab.jsx')
);
const PerformanceTab = lazyRetry(() =>
  import('./components/views/monitoring/PerformanceTab.jsx')
);
const ResourcesTab = lazyRetry(() =>
  import('./components/views/monitoring/ResourcesTab.jsx')
);
const CloudWatchTab = lazyRetry(() =>
  import('./components/views/monitoring/CloudWatchTab.jsx')
);
const CheckpointMonitorTab = lazyRetry(() =>
  import('./components/views/monitoring/CheckpointMonitorTab.jsx')
);

// Security features
const SecurityComplianceTab = lazyRetry(() =>
  import('./components/views/security/SecurityComplianceTab.jsx')
);
const AlertsComponent = lazyRetry(() =>
  import('./components/views/security/AlertsTab.jsx')
);
const AlertCorrelationTab = lazyRetry(() =>
  import('./components/views/security/AlertCorrelationTab.jsx')
);

// Database features
const IndexesTab = lazyRetry(() =>
  import('./components/views/database/IndexesTab.jsx')
);
const SqlConsoleTab = lazyRetry(() =>
  import('./components/views/database/SqlConsoleTab.jsx')
);
const BloatAnalysisTab = lazyRetry(() =>
  import('./components/views/database/BloatAnalysisTab.jsx')
);
const TableAnalytics = lazyRetry(() =>
  import('./components/views/database/TableAnalytics.jsx')
);
const QueryOptimizerTab = lazyRetry(() =>
  import('./components/views/database/QueryOptimizerTab.jsx')
);
const QueryPlanRegressionTab = lazyRetry(() =>
  import('./components/views/database/QueryPlanRegressionTab.jsx')
);
const SchemaVersioningTab = lazyRetry(() =>
  import('./components/views/database/SchemaVersioningTab.jsx')
);
const SchemaVisualizerTab = lazyRetry(() =>
  import('./components/views/database/SchemaVisualizerTab.jsx')
);
const TableDependencyMindMap = lazyRetry(() =>
  import('./components/views/database/TableDependencyMindMap.jsx')
);

// Operations features
const BackupRecoveryTab = lazyRetry(() =>
  import('./components/views/operations/BackupRecoveryTab.jsx')
);
const VacuumMaintenanceTab = lazyRetry(() =>
  import('./components/views/operations/VacuumMaintenanceTab.jsx')
);
const DBATaskSchedulerTab = lazyRetry(() =>
  import('./components/views/operations/DBATaskSchedulerTab.jsx')
);
const ReplicationWALTab = lazyRetry(() =>
  import('./components/views/operations/ReplicationWALTab.jsx')
);
const ConnectionPoolTab = lazyRetry(() =>
  import('./components/views/operations/ConnectionPoolTab.jsx')
);

// Analytics features
const CapacityPlanningTab = lazyRetry(() =>
  import('./components/views/analytics/CapacityPlanningTab.jsx')
);
const LogPatternAnalysisTab = lazyRetry(() =>
  import('./components/views/analytics/LogPatternAnalysisTab.jsx')
);
const CustomDashboardTab = lazyRetry(() =>
  import('./components/views/analytics/CustomDashboardTab.jsx')
);
/* Demo data components removed — production metrics now served via metricsRegistry.js */

// Admin features
const AdminTab = lazyRetry(() =>
  import('./components/views/admin/AdminTab.jsx')
);
const RepositoryTab = lazyRetry(() =>
  import('./components/views/admin/RepositoryTab.jsx')
);
const ApiQueriesTab = lazyRetry(() =>
  import('./components/views/admin/ApiQueriesTab.jsx')
);
const RetentionManagementTab = lazyRetry(() =>
  import('./components/views/admin/RetentionManagementTab.jsx')
);
const TerraformExportTab = lazyRetry(() =>
  import('./components/views/admin/TerraformExportTab.jsx')
);
const ReportBuilderTab = lazyRetry(() =>
  import('./components/views/admin/ReportBuilderTab.jsx')
);

// Gap features — Monitoring
const OpenTelemetryTab = lazyRetry(() =>
  import('./components/views/monitoring/OpenTelemetryTab.jsx')
);
const KubernetesTab = lazyRetry(() =>
  import('./components/views/monitoring/KubernetesTab.jsx')
);
const StatusPageTab = lazyRetry(() =>
  import('./components/views/monitoring/StatusPageTab.jsx')
);
const AIMonitoringTab = lazyRetry(() =>
  import('./components/views/monitoring/AIMonitoringTab.jsx')
);
const ObservabilityHub = lazyRetry(() =>
  import('./components/views/monitoring/ObservabilityHub.jsx')
);

// Gap features — Database
const AIQueryAdvisorTab = lazyRetry(() =>
  import('./components/views/database/AIQueryAdvisorTab.jsx')
);

// MongoDB features
const MongoOverviewTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoOverviewTab.jsx')
);
const MongoPerformanceTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoPerformanceTab.jsx')
);
const MongoStorageTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoStorageTab.jsx')
);
const MongoReplicationTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoReplicationTab.jsx')
);
const MongoDataToolsTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoDataToolsTab.jsx')
);
const MongoShardingTab = lazyRetry(() =>
  import('./components/views/mongodb/MongoShardingTab.jsx')
);

// Other
const ReliabilityTab = lazyRetry(() =>
  import('./components/views/ReliabilityTab.jsx')
);
const UserManagementTab = lazyRetry(() =>
  import('./usermanagement/UserManagementTab.jsx')
);

// Phase 1 — Connection Onboarding
const ConnectionWizard = lazyRetry(() =>
  import('./components/views/onboarding/ConnectionWizard.jsx')
);

// Phase 2 — Multi-DB Fleet Dashboard
const FleetOverviewTab = lazyRetry(() =>
  import('./components/views/monitoring/FleetOverviewTab.jsx')
);

// Phase 3 — Visualization Layer
const SchemaTreeBrowser = lazyRetry(() =>
  import('./components/views/database/SchemaTreeBrowser.jsx')
);
const QueryPlanViewer = lazyRetry(() =>
  import('./components/views/database/QueryPlanViewer.jsx')
);
const ChartBuilder = lazyRetry(() =>
  import('./components/views/database/ChartBuilder.jsx')
);

// Phase 4 — Monitoring & Reliability
const AlertRuleEditor = lazyRetry(() =>
  import('./components/views/monitoring/AlertRuleEditor.jsx')
);
const PoolMetricsDashboard = lazyRetry(() =>
  import('./components/views/monitoring/PoolMetricsDashboard.jsx')
);

// Layout — Enhanced Connection Switcher (replaces inline ConnectionSelector)
const ConnectionSwitcherLazy = lazyRetry(() =>
  import('./components/layout/ConnectionSwitcher.jsx')
);

// Shared — Per-section error boundary for graceful tab-level recovery (eager — must be class component)
import SectionErrorBoundary from './components/shared/SectionErrorBoundary.jsx';

// Enterprise edition
const LicenseManagement = lazyRetry(() =>
  import('./enterprise/views/LicenseManagement.jsx')
);
const OrgManagement = lazyRetry(() =>
  import('./enterprise/views/OrgManagement.jsx')
);

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
import {
  WebSocketStatus,
  AlertBanner,
} from './components/ui/SharedComponents.jsx';

/* ── Local DS alias — kept in sync with designTokens module by setDS() ── */
let DS = getDS();

interface ComponentRegistry {
  [key: string]: ComponentType<any>;
}

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
  SchemaVisualizerTab,
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
  SqlConsoleTab,
  ApiQueriesTab,
  RepositoryTab,
  AIQueryAdvisorTab,
  DBATaskSchedulerTab,
  UserManagementTab,
  AdminTab,
  RetentionManagementTab,
  TerraformExportTab,
  ReportBuilderTab,
  CustomDashboardTab,
  MongoOverviewTab,
  MongoPerformanceTab,
  MongoStorageTab,
  MongoReplicationTab,
  MongoDataToolsTab,
  MongoShardingTab,
  // Phase 1–4 new components
  FleetOverviewTab,
  ConnectionWizard,
  SchemaTreeBrowser,
  QueryPlanViewer,
  ChartBuilder,
  AlertRuleEditor,
  PoolMetricsDashboard,
  // Enterprise (uncomment when ready): LicenseManagement, OrgManagement,
} as ComponentRegistry);

const TAB_CONFIG = buildTabConfig();
const TABS_ONLY = getTabsOnly(TAB_CONFIG);
const SECTION_GROUPS = getSectionGroups(TAB_CONFIG);

const getSectionForTab = (tabId: string): string | null => {
  for (const g of SECTION_GROUPS) {
    if (g.tabs.some((t: any) => t.id === tabId)) return g.section;
  }
  return null;
};

const getGroupForTab = (): null => null;

const getSectionAccent = (tabId: string): string => {
  for (const g of SECTION_GROUPS) {
    if (g.tabs.some((t: any) => t.id === tabId)) return g.accent;
  }
  return DS.cyan;
};

const WS_RECONNECT_INTERVAL = 5000;
const ALERT_AUTO_DISMISS_TIME = 5000;
const MAX_NOTIFICATIONS = 50;
const AUTH_TOKEN_KEY = 'vigil_token';
const FEEDBACK_RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES
   ───────────────────────────────────────────────────────────────── */
const AppStyles: FC = () => (
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
    .sidebar-nav::-webkit-scrollbar-thumb { background: ${DS.border}; border-radius: 2px; }
    .sidebar-nav::-webkit-scrollbar-thumb:hover { background: ${DS.cyan}60; }

    /* ── Nav hover transition ── */
    .nav-item { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
    .nav-item:hover { background: ${DS.sidebarHover} !important; }
    .nav-item:hover .nav-icon { opacity: 1 !important; }

    /* ── Section header ── */
    .section-btn { transition: all 0.15s ease; }
    .section-btn:hover { background: ${DS.sidebarHover} !important; }

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
    ::-webkit-scrollbar-thumb { background: ${DS.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.3); }

    /* ── Responsive Design Improvements ── */
    @media (max-width: 768px) {
        /* Force sidebar collapse on tablets */
        body { --sidebar-collapsed: true; }

        /* Adjust header padding on smaller screens */
        header { padding: 0 16px !important; }

        /* Stack breadcrumb items on mobile */
        @media (max-width: 640px) {
            header { height: auto; flex-wrap: wrap; gap: 8px; }
        }
    }

    @media (max-width: 480px) {
        /* Reduce padding on very small screens */
        .tab-mount { padding: 16px 12px !important; }

        /* Stack everything on mobile */
        main > div { flex-direction: column !important; }

        /* Make buttons full-width on mobile */
        button { min-width: 100%; }
    }

    /* ── Chart responsiveness ── */
    @media (max-width: 900px) {
        /* Reduce chart container heights */
        [class*="chart"], [class*="graph"] { min-height: 200px !important; }
    }

    /* ── Improved touch targets for mobile ── */
    @media (hover: none) and (pointer: coarse) {
        button, [role="button"], .nav-item, .section-btn {
            min-height: 44px;
            min-width: 44px;
            padding: 12px !important;
        }
    }

    /* ── Accessibility: Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────
   AMBIENT BACKGROUND ORBS (decorative, pointer-events: none)
   ───────────────────────────────────────────────────────────────── */
const AmbientOrbs: FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {[
      { size: 400, top: -80, left: -100, color: DS.cyan, op: 0.06 },
      { size: 300, top: 200, right: -60, color: DS.violet, op: 0.04 },
      { size: 350, bottom: -100, left: 80, color: DS.emerald, op: 0.05 },
    ].map((orb, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: orb.size,
          height: orb.size,
          borderRadius: '50%',
          background: orb.color,
          opacity: orb.op,
          filter: 'blur(80px)',
          top: orb.top,
          left: orb.left,
          right: orb.right,
          bottom: orb.bottom,
          animation: `orb ${12 + i * 2}s ease-in-out infinite`,
        }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   SPARKLINE (simple mini chart for notification badges)
   ───────────────────────────────────────────────────────────────── */

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline: FC<SparklineProps> = ({
  points,
  width = 60,
  height = 20,
  color = DS.cyan,
}) => {
  if (!points || points.length === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const margin = 3;
  const graphWidth = width - margin * 2;
  const graphHeight = height - margin * 2;

  const pts = points.map((p, i) => {
    const x = margin + (i / (points.length - 1)) * graphWidth;
    const y = margin + graphHeight - ((p - min) / range) * graphHeight;
    return [x, y] as [number, number];
  });

  const toSvg = (ps: [number, number][]): string =>
    ps.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const fillPath =
    'M ' +
    margin +
    ` ${margin + graphHeight} ` +
    toSvg(pts) +
    ` L ${graphWidth + margin} ${margin + graphHeight} Z`;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#spark-fill)" />
      <path
        d={toSvg(pts)}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────
   LIVE STATUS PILL
   ───────────────────────────────────────────────────────────────── */

interface StatusPillProps {
  connected: boolean;
}

const StatusPill: FC<StatusPillProps> = ({ connected }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '5px 12px',
      borderRadius: 20,
      background: connected
        ? 'rgba(52,211,153,0.1)'
        : 'rgba(251,113,133,0.1)',
      border: `1px solid ${
        connected ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'
      }`,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      color: connected ? DS.emerald : DS.rose,
      fontFamily: DS.fontMono,
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: connected ? DS.emerald : DS.rose,
        animation: connected ? 'dotBlink 2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    />
    {connected ? 'LIVE' : 'OFFLINE'}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   THEME TOGGLE — uses ThemeContext as single source of truth and
   also keeps the mutable DS object in sync for legacy consumers
   ───────────────────────────────────────────────────────────────── */
const ThemeToggle: FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    const next = !isDark;
    /* Sync module-level DS so legacy inline styles re-read it on next render */
    DS = next ? DS_DARK : DS_LIGHT;
    setDS(DS);
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(14,165,233,0.08)',
        border: `1px solid ${
          isDark ? 'rgba(251,191,36,0.25)' : 'rgba(14,165,233,0.3)'
        }`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {isDark
        ? (
          <Sun
            size={16}
            color="rgba(251,191,36,0.9)"
          />
        )
        : (
          <Moon
            size={16}
            color="rgba(14,165,233,0.9)"
          />
        )}
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FEEDBACK MODAL — full per-screen feedback, feature requests,
   bug reports. Maps to every column in user_feedback DB table.
   ───────────────────────────────────────────────────────────────── */

/* ── Data ─────────────────────────────────────────────────────── */
const FB_MODES = [
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: DS.cyan },
  { id: 'bug', label: 'Bug Report', icon: AlertTriangle, color: DS.rose },
  {
    id: 'general',
    label: 'General',
    icon: MessageSquarePlus,
    color: DS.violet,
  },
];

const FB_PRIORITY = [
  { val: 'Low', color: DS.emerald },
  { val: 'Medium', color: DS.amber },
  { val: 'High', color: DS.rose },
];

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

/* All screens grouped — mirrors TAB_CONFIG exactly */
const FB_GROUPS = (() => {
  const groups: any[] = [];
  let cur: any = null;
  for (const item of TAB_CONFIG) {
    if (item.section) {
      cur = { group: item.section, accent: item.accent, tabs: [] };
      groups.push(cur);
    } else if (cur) cur.tabs.push({ id: item.id, label: item.label });
  }
  return groups;
})();
const FB_ALL_TABS = FB_GROUPS.flatMap((g) => g.tabs);
const emptyRow = () => ({ rating: 0, comment: '', remarks: '' });

/* ── Shared primitives ────────────────────────────────────────── */

interface FbLabelProps {
  children: ReactNode;
  color?: string;
}

const FbLabel: FC<FbLabelProps> = ({ children, color }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      color: color || DS.textMuted,
      marginBottom: 8,
      fontFamily: DS.fontMono,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
    }}
  >
    {children}
  </div>
);

interface FbInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  style?: React.CSSProperties;
}

const FbInput: FC<FbInputProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  style: extraStyle,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="fb-input"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${focused ? DS.borderAccent : DS.border}`,
        borderRadius: 9,
        padding: '10px 13px',
        color: DS.textPrimary,
        fontSize: 13,
        outline: 'none',
        fontFamily: DS.fontUI,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...extraStyle,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

interface FbTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}

const FbTextarea: FC<FbTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength = 500,
  showCount = true,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="fb-input"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? DS.borderAccent : DS.border}`,
          borderRadius: 9,
          padding: '10px 13px',
          color: DS.textPrimary,
          fontSize: 13,
          outline: 'none',
          resize: 'none',
          fontFamily: DS.fontUI,
          lineHeight: 1.6,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showCount && (
        <div
          style={{
            fontSize: 10,
            color: DS.textMuted,
            textAlign: 'right',
            marginTop: 3,
            fontFamily: DS.fontMono,
          }}
        >
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

interface FbStarRowProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

const FbStarRow: FC<FbStarRowProps> = ({ value, onChange, size = 22 }) => {
  const [hov, setHov] = useState(0);
  const d = hov || value;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className="star-btn"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHov(s)}
          onMouseLeave={() => setHov(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 1,
          }}
        >
          <Star
            size={size}
            fill={s <= d ? DS.amber : 'transparent'}
            color={s <= d ? DS.amber : DS.textMuted}
            strokeWidth={1.5}
            style={{ display: 'block', transition: 'fill 0.12s' }}
          />
        </button>
      ))}
      {d > 0 && (
        <span
          style={{
            fontSize: 10,
            color: DS.textMuted,
            fontFamily: DS.fontMono,
            marginLeft: 4,
            userSelect: 'none',
          }}
        >
          {STAR_LABELS[d - 1]}
        </span>
      )}
    </div>
  );
};

/* Full grouped dropdown for section picker */

interface FbSectionDropdownProps {
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
}

const FbSectionDropdown: FC<FbSectionDropdownProps> = ({
  value,
  onChange,
  includeAll = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 13px',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${open ? DS.borderAccent : DS.border}`,
          borderRadius: 9,
          color: DS.textPrimary,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
        }}
      >
        {value || 'Select a section...'}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 5,
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: 9,
            overflow: 'hidden',
            zIndex: 1000,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {includeAll && (
            <button
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 13px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                color: DS.textPrimary,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  DS.sidebarHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
              }}
            >
              All Screens
            </button>
          )}
          {FB_GROUPS.map((g) => (
            <div key={g.group}>
              <div
                style={{
                  padding: '8px 13px',
                  background: DS.bgDeep,
                  fontSize: 10,
                  color: g.accent,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: DS.fontMono,
                }}
              >
                {g.group}
              </div>
              {g.tabs.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 13px',
                    background: value === t.id ? `${g.accent}15` : 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: DS.textPrimary,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== t.id) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        DS.sidebarHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      value === t.id ? `${g.accent}15` : 'none';
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* Loading screen — shown during initial auth check */
const LoadingScreen: FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: DS.bg,
      color: DS.textPrimary,
    }}
  >
    <div style={{ textAlign: 'center', gap: 20, display: 'flex', flexDirection: 'column' }}>
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
          letterSpacing: '0.08em',
        }}
      >
        LOADING…
      </span>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   ERROR BOUNDARY
   ────────────────────────────────────────────────────────────── */

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showStackTrace: boolean;
  errorInfo: { componentStack: string } | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showStackTrace: false,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): ReactElement {
    if (this.state.hasError)
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 20,
            padding: 40,
            color: DS.textPrimary,
            background: DS.bg,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: 'rgba(251,113,133,0.1)',
              border: '1px solid rgba(251,113,133,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={36} color={DS.rose} />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: DS.textSub,
                margin: '0 0 24px',
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred in this view.'}
            </p>

            {/* Stack trace section (collapsible) */}
            {this.state.errorInfo && (
              <div
                style={{
                  textAlign: 'left',
                  background: `${DS.surface}dd`,
                  border: `1px solid ${DS.border}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 20,
                  maxHeight: this.state.showStackTrace ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <button
                  onClick={() =>
                    this.setState((s) => ({
                      showStackTrace: !s.showStackTrace,
                    }))
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: DS.cyan,
                    fontWeight: 600,
                    fontSize: 12,
                    marginBottom: this.state.showStackTrace ? 12 : 0,
                    fontFamily: DS.fontMono,
                    letterSpacing: '0.05em',
                  }}
                >
                  {this.state.showStackTrace ? '▼ Hide' : '▶ Show'} Developer
                  Info
                </button>
                {this.state.showStackTrace && (
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 10,
                      color: DS.textMuted,
                      fontFamily: DS.fontMono,
                      overflow: 'auto',
                      maxHeight: 160,
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('vigil_active_tab');
                    localStorage.removeItem('vigil_sidebar_collapsed');
                  } catch {}
                  window.location.href = '/';
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: 8,
                  border: `1px solid ${DS.cyan}`,
                  cursor: 'pointer',
                  background: 'none',
                  color: DS.cyan,
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s',
                  fontFamily: DS.fontUI,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    `${DS.cyan}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }}
              >
                Reset Dashboard
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch {}
                  window.location.href = '/login';
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: 8,
                  border: `1px solid ${DS.border}`,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)',
                  color: DS.textPrimary,
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s',
                  fontFamily: DS.fontUI,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    DS.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.03)';
                }}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );

    return this.props.children as ReactElement;
  }
}

/* ──────────────────────────────────────────────────────────────
   WEBSOCKET HOOK
   ────────────────────────────────────────────────────────────── */

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseWebSocketReturn {
  connected: boolean;
  reconnecting: boolean;
}

const useWebSocket = (
  onMessage: (msg: WebSocketMessage) => void
): UseWebSocketReturn => {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const wsUrl =
        (window.location.protocol === 'https:' ? 'wss:' : 'ws:') +
        '//' +
        window.location.host +
        '/ws';
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setConnected(true);
          setReconnecting(false);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as WebSocketMessage;
            onMessage(msg);
          } catch {}
        };

        wsRef.current.onclose = () => {
          setConnected(false);
          setReconnecting(true);
          reconnectTimeoutRef.current = setTimeout(
            connect,
            WS_RECONNECT_INTERVAL
          );
        };

        wsRef.current.onerror = () => {
          setConnected(false);
        };
      } catch (err) {
        setConnected(false);
        setReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(
          connect,
          WS_RECONNECT_INTERVAL
        );
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onMessage]);

  return { connected, reconnecting };
};

/* ──────────────────────────────────────────────────────────────
   MAIN APP COMPONENT
   ────────────────────────────────────────────────────────────── */

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: FC<DashboardProps> = ({ onLogout }) => (
  <ConnectionProvider>
    {/* Enterprise providers (hidden — uncomment when ready) */}
    {/* <LicenseProvider><OrgProvider> */}
    <DashboardInner onLogout={onLogout} />
    {/* </OrgProvider></LicenseProvider> */}
  </ConnectionProvider>
);

interface DashboardInnerProps {
  onLogout: () => void;
}

const DashboardInner: FC<DashboardInnerProps> = ({ onLogout }) => {
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [latestAlert, setLatestAlert] = useState<any>(null);
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

  const handleWSMessage = useCallback((msg: WebSocketMessage) => {
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

  const allowedTabIds = useMemo(
    () =>
      TABS_ONLY.filter((t: any) =>
        (currentUser?.allowedScreens || []).includes(t.id)
      ).map((t: any) => t.id),
    [currentUser?.allowedScreens]
  );

  const ActiveComponent = useMemo(() => {
    const tab = TABS_ONLY.find(
      (t: any) => t.id === activeTab && allowedTabIds.includes(t.id)
    );
    if (tab) return tab.component;
    return TABS_ONLY.find((t: any) => allowedTabIds.includes(t.id))?.component;
  }, [activeTab, allowedTabIds]);

  const activeTabMeta = useMemo(
    () => TABS_ONLY.find((t: any) => t.id === activeTab),
    [activeTab]
  );
  const accent = useMemo(() => getSectionAccent(activeTab), [activeTab]);

  const handleTabChange = useCallback(
    (id: string) => {
      prevTabRef.current = activeTab;
      setActiveTab(id);
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, id);
      } catch {}
    },
    [activeTab]
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

  const handleDismissNotification = useCallback(
    (id: number) =>
      setNotifications((p) => p.filter((n) => n.id !== id)),
    []
  );
  const handleClearAllNotifications = useCallback(
    () => setNotifications([]),
    []
  );

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  /* Keyboard shortcuts: Ctrl+B (sidebar), Ctrl+K (search), Ctrl+? (help), etc. */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
          background: DS.bg,
          color: DS.textPrimary,
          overflow: 'hidden',
          fontFamily: DS.fontUI,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AppStyles />
        <ChartDefs />
        <AmbientOrbs />

        {/* Sidebar would go here — placeholder for now */}
        {/* <Sidebar {...sidebarProps} /> */}

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
              height: 62,
              flexShrink: 0,
              borderBottom: `1px solid ${DS.border}`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 20,
              paddingRight: 20,
              gap: 12,
              background: DS.bg,
            }}
          >
            {/* Breadcrumbs and active tab label */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              {activeTabMeta && (
                <>
                  <Breadcrumbs />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: DS.textSub,
                      fontFamily: DS.fontMono,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeTabMeta.label}
                  </span>
                </>
              )}
            </div>

            {/* Right-side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusPill connected={connected} />
              <ThemeToggle />
            </div>
          </header>

          {/* ── MAIN CONTENT ── */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              position: 'relative',
              background: DS.bg,
            }}
          >
            {ActiveComponent ? (
              <Suspense fallback={<LoadingScreen />}>
                <SectionErrorBoundary>
                  <div className="tab-mount" style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                    <ActiveComponent />
                  </div>
                </SectionErrorBoundary>
              </Suspense>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: DS.textMuted,
                }}
              >
                <span>No matching tab found.</span>
              </div>
            )}
          </div>

          {/* Notifications panel */}
          {notifications.length > 0 && (
            <div
              className="notif-panel"
              style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                width: 360,
                maxHeight: 400,
                overflow: 'auto',
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderRadius: 12,
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom: `1px solid ${DS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: DS.textPrimary,
                  }}
                >
                  Notifications
                </span>
                <button
                  onClick={handleClearAllNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: DS.textMuted,
                    cursor: 'pointer',
                    fontSize: 12,
                    textDecoration: 'underline',
                  }}
                >
                  Clear All
                </button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="notif-item"
                  style={{
                    padding: 12,
                    borderBottom: `1px solid ${DS.border}`,
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: DS.textPrimary,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: DS.textMuted,
                        marginTop: 4,
                      }}
                    >
                      {n.message}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissNotification(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: DS.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </NavigationContext.Provider>
  );
};

const AuthConsumer: FC = () => {
  const { currentUser, loading, logout } = useAuth();
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
            element={
              !currentUser && !isDemo ? (
                <LoginPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
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
            path="/*"
            element={
              currentUser || (isDemo && readyToEnter) ? (
                <ErrorBoundary>
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
                          letterSpacing: '0.08em',
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
