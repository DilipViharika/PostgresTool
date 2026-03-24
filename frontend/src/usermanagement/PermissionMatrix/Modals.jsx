import React, {
    useState, useCallback, useEffect, useMemo, useRef, memo,
} from 'react';
import { createPortal } from 'react-dom';

import { T } from '../constants/theme.js';
import { THEME } from '../../utils/theme.jsx';
import { ROLES, DEPARTMENTS, LOCATIONS } from '../constants/index.js';
import { generatePassword, validateUserForm } from '../helpers/index.js';
import { Ico, RoleBadge, StatusBadge, FormField, Toggle } from '../shared/components/ui.jsx';

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN CATEGORIES & PRESETS
═══════════════════════════════════════════════════════════════════════════ */
const SCREEN_CATEGORIES = [
  {
    label: 'Core Monitoring',
    color: '#00D4FF',
    screens: [
      { id: 'connections',  label: 'Connections',     icon: '🔌' },
      { id: 'overview',     label: 'Overview',        icon: '📊' },
      { id: 'performance',  label: 'Performance',     icon: '⚡' },
      { id: 'resources',    label: 'Resources',       icon: '💾' },
      { id: 'reliability',  label: 'Reliability',     icon: '✅' },
      { id: 'alerts',       label: 'Alerts',          icon: '🔔' },
    ],
  },
  {
    label: 'Query & Analysis',
    color: '#2AFFD4',
    screens: [
      { id: 'sql',          label: 'SQL Console',     icon: '🖥️' },
      { id: 'optimizer',    label: 'Query Optimizer', icon: '🔍' },
      { id: 'indexes',      label: 'Indexes',         icon: '📑' },
      { id: 'api',          label: 'API Tracing',     icon: '🌐' },
      { id: 'regression',   label: 'Plan Regression', icon: '📉' },
    ],
  },
  {
    label: 'Infrastructure',
    color: '#B88BFF',
    screens: [
      { id: 'replication',  label: 'Replication & WAL', icon: '🔁' },
      { id: 'checkpoint',   label: 'Checkpoint Monitor',icon: '📍' },
      { id: 'maintenance',  label: 'Vacuum & Maintenance', icon: '🧹' },
      { id: 'backup',       label: 'Backup & Recovery',icon: '💿' },
      { id: 'bloat',        label: 'Bloat Analysis',  icon: '📦' },
      { id: 'pool',         label: 'Connection Pool', icon: '🌊' },
    ],
  },
  {
    label: 'Schema & Capacity',
    color: '#FFB520',
    screens: [
      { id: 'schema',            label: 'Schema & Migrations', icon: '🗂️' },
      { id: 'schema-visualizer', label: 'Schema Visualizer',   icon: '🔀' },
      { id: 'capacity',          label: 'Capacity Planning',   icon: '📈' },
      { id: 'repository',        label: 'Repository',          icon: '🗄️' },
    ],
  },
  {
    label: 'Security & Admin',
    color: '#FF4560',
    screens: [
      { id: 'security',       label: 'Security & Compliance', icon: '🛡️' },
      { id: 'admin',          label: 'Admin',                 icon: '⚙️' },
      { id: 'UserManagement', label: 'User Management',       icon: '👥' },
      { id: 'demo-data',      label: 'Demo Data',             icon: '🧪' },
    ],
  },
  {
    label: 'Cloud & Observability',
    color: '#2EE89C',
    screens: [
      { id: 'cloudwatch',        label: 'CloudWatch',           icon: '☁️' },
      { id: 'log-patterns',      label: 'Log Pattern Analysis', icon: '🔎' },
      { id: 'alert-correlation', label: 'Alert Correlation',    icon: '🔗' },
      { id: 'ai-monitoring',     label: 'AI Monitoring',        icon: '🤖' },
      { id: 'tasks',             label: 'DBA Task Scheduler',   icon: '📅' },
    ],
  },
  {
    label: 'MongoDB',
    color: '#2EE89C',
    screens: [
      { id: 'mongo-overview',    label: 'Mongo Overview',     icon: '🍃' },
      { id: 'mongo-performance', label: 'Mongo Performance',  icon: '⚡' },
      { id: 'mongo-storage',     label: 'Mongo Storage',      icon: '💾' },
      { id: 'mongo-replication', label: 'Mongo Replication',  icon: '🔄' },
      { id: 'mongo-data-tools',  label: 'Mongo Data Tools',   icon: '🛠️' },
      { id: 'mongo-sharding',    label: 'Mongo Sharding',     icon: '🗂️' },
    ],
  },
  {
    label: 'Demo',
    color: '#2EE89C',
    screens: [
      { id: 'demo-pg-overview', label: 'Demo PG Overview', icon: '🐘' },
      { id: 'demo-pg-performance', label: 'Demo PG Performance', icon: '🐘' },
      { id: 'demo-pg-resources', label: 'Demo PG Resources', icon: '🐘' },
      { id: 'demo-pg-reliability', label: 'Demo PG Reliability', icon: '🐘' },
      { id: 'demo-pg-alerts', label: 'Demo PG Alerts', icon: '🐘' },
      { id: 'demo-pg-optimizer', label: 'Demo PG Query Optimizer', icon: '🐘' },
      { id: 'demo-pg-indexes', label: 'Demo PG Indexes', icon: '🐘' },
      { id: 'demo-pg-regression', label: 'Demo PG Plan Regression', icon: '🐘' },
      { id: 'demo-pg-bloat', label: 'Demo PG Bloat Analysis', icon: '🐘' },
      { id: 'demo-pg-table', label: 'Demo PG Table Analysis', icon: '🐘' },
      { id: 'demo-pg-pool', label: 'Demo PG Connection Pool', icon: '🐘' },
      { id: 'demo-pg-replication', label: 'Demo PG Replication & WAL', icon: '🐘' },
      { id: 'demo-pg-checkpoint', label: 'Demo PG Checkpoint', icon: '🐘' },
      { id: 'demo-pg-maintenance', label: 'Demo PG Vacuum & Maintenance', icon: '🐘' },
      { id: 'demo-pg-capacity', label: 'Demo PG Capacity Planning', icon: '🐘' },
      { id: 'demo-pg-backup', label: 'Demo PG Backup & Recovery', icon: '🐘' },
      { id: 'demo-pg-schema', label: 'Demo PG Schema & Migrations', icon: '🐘' },
      { id: 'demo-pg-schema-viz', label: 'Demo PG Schema Visualizer', icon: '🐘' },
      { id: 'demo-pg-security', label: 'Demo PG Security & Compliance', icon: '🐘' },
      { id: 'demo-pg-cloudwatch', label: 'Demo PG CloudWatch', icon: '🐘' },
      { id: 'demo-pg-log-patterns', label: 'Demo PG Log Patterns', icon: '🐘' },
      { id: 'demo-pg-alert-correlation', label: 'Demo PG Alert Correlation', icon: '🐘' },
      { id: 'demo-pg-opentelemetry', label: 'Demo PG OpenTelemetry', icon: '🐘' },
      { id: 'demo-pg-kubernetes', label: 'Demo PG Kubernetes', icon: '🐘' },
      { id: 'demo-pg-status-page', label: 'Demo PG Status Page', icon: '🐘' },
      { id: 'demo-pg-ai-monitoring', label: 'Demo PG AI Monitoring', icon: '🐘' },
      { id: 'demo-pg-sql', label: 'Demo PG SQL Console', icon: '🐘' },
      { id: 'demo-pg-api', label: 'Demo PG API Tracing', icon: '🐘' },
      { id: 'demo-pg-repository', label: 'Demo PG Repository', icon: '🐘' },
      { id: 'demo-pg-ai-advisor', label: 'Demo PG AI Query Advisor', icon: '🐘' },
      { id: 'demo-pg-tasks', label: 'Demo PG Task Scheduler', icon: '🐘' },
      { id: 'demo-pg-users', label: 'Demo PG User Management', icon: '🐘' },
      { id: 'demo-pg-admin-panel', label: 'Demo PG Admin', icon: '🐘' },
      { id: 'demo-pg-retention', label: 'Demo PG Data Retention', icon: '🐘' },
      { id: 'demo-pg-terraform', label: 'Demo PG Terraform Export', icon: '🐘' },
      { id: 'demo-pg-custom-dashboard', label: 'Demo PG Custom Dashboards', icon: '🐘' },
      { id: 'demo-mysql-overview', label: 'Demo MySQL Overview', icon: '🐬' },
      { id: 'demo-mysql-performance', label: 'Demo MySQL Performance', icon: '🐬' },
      { id: 'demo-mysql-resources', label: 'Demo MySQL Resources', icon: '🐬' },
      { id: 'demo-mysql-reliability', label: 'Demo MySQL Reliability', icon: '🐬' },
      { id: 'demo-mysql-alerts', label: 'Demo MySQL Alerts', icon: '🐬' },
      { id: 'demo-mysql-optimizer', label: 'Demo MySQL Query Optimizer', icon: '🐬' },
      { id: 'demo-mysql-indexes', label: 'Demo MySQL Indexes', icon: '🐬' },
      { id: 'demo-mysql-regression', label: 'Demo MySQL Plan Regression', icon: '🐬' },
      { id: 'demo-mysql-bloat', label: 'Demo MySQL Bloat Analysis', icon: '🐬' },
      { id: 'demo-mysql-table', label: 'Demo MySQL Table Analysis', icon: '🐬' },
      { id: 'demo-mysql-pool', label: 'Demo MySQL Connection Pool', icon: '🐬' },
      { id: 'demo-mysql-replication', label: 'Demo MySQL Replication & WAL', icon: '🐬' },
      { id: 'demo-mysql-checkpoint', label: 'Demo MySQL Checkpoint', icon: '🐬' },
      { id: 'demo-mysql-maintenance', label: 'Demo MySQL Vacuum & Maintenance', icon: '🐬' },
      { id: 'demo-mysql-capacity', label: 'Demo MySQL Capacity Planning', icon: '🐬' },
      { id: 'demo-mysql-backup', label: 'Demo MySQL Backup & Recovery', icon: '🐬' },
      { id: 'demo-mysql-schema', label: 'Demo MySQL Schema & Migrations', icon: '🐬' },
      { id: 'demo-mysql-schema-viz', label: 'Demo MySQL Schema Visualizer', icon: '🐬' },
      { id: 'demo-mysql-security', label: 'Demo MySQL Security & Compliance', icon: '🐬' },
      { id: 'demo-mysql-cloudwatch', label: 'Demo MySQL CloudWatch', icon: '🐬' },
      { id: 'demo-mysql-log-patterns', label: 'Demo MySQL Log Patterns', icon: '🐬' },
      { id: 'demo-mysql-alert-correlation', label: 'Demo MySQL Alert Correlation', icon: '🐬' },
      { id: 'demo-mysql-opentelemetry', label: 'Demo MySQL OpenTelemetry', icon: '🐬' },
      { id: 'demo-mysql-kubernetes', label: 'Demo MySQL Kubernetes', icon: '🐬' },
      { id: 'demo-mysql-status-page', label: 'Demo MySQL Status Page', icon: '🐬' },
      { id: 'demo-mysql-ai-monitoring', label: 'Demo MySQL AI Monitoring', icon: '🐬' },
      { id: 'demo-mysql-sql', label: 'Demo MySQL SQL Console', icon: '🐬' },
      { id: 'demo-mysql-api', label: 'Demo MySQL API Tracing', icon: '🐬' },
      { id: 'demo-mysql-repository', label: 'Demo MySQL Repository', icon: '🐬' },
      { id: 'demo-mysql-ai-advisor', label: 'Demo MySQL AI Query Advisor', icon: '🐬' },
      { id: 'demo-mysql-tasks', label: 'Demo MySQL Task Scheduler', icon: '🐬' },
      { id: 'demo-mysql-users', label: 'Demo MySQL User Management', icon: '🐬' },
      { id: 'demo-mysql-admin-panel', label: 'Demo MySQL Admin', icon: '🐬' },
      { id: 'demo-mysql-retention', label: 'Demo MySQL Data Retention', icon: '🐬' },
      { id: 'demo-mysql-terraform', label: 'Demo MySQL Terraform Export', icon: '🐬' },
      { id: 'demo-mysql-custom-dashboard', label: 'Demo MySQL Custom Dashboards', icon: '🐬' },
      { id: 'demo-mssql-overview', label: 'Demo MSSQL Overview', icon: '🔷' },
      { id: 'demo-mssql-performance', label: 'Demo MSSQL Performance', icon: '🔷' },
      { id: 'demo-mssql-resources', label: 'Demo MSSQL Resources', icon: '🔷' },
      { id: 'demo-mssql-reliability', label: 'Demo MSSQL Reliability', icon: '🔷' },
      { id: 'demo-mssql-alerts', label: 'Demo MSSQL Alerts', icon: '🔷' },
      { id: 'demo-mssql-optimizer', label: 'Demo MSSQL Query Optimizer', icon: '🔷' },
      { id: 'demo-mssql-indexes', label: 'Demo MSSQL Indexes', icon: '🔷' },
      { id: 'demo-mssql-regression', label: 'Demo MSSQL Plan Regression', icon: '🔷' },
      { id: 'demo-mssql-bloat', label: 'Demo MSSQL Bloat Analysis', icon: '🔷' },
      { id: 'demo-mssql-table', label: 'Demo MSSQL Table Analysis', icon: '🔷' },
      { id: 'demo-mssql-pool', label: 'Demo MSSQL Connection Pool', icon: '🔷' },
      { id: 'demo-mssql-replication', label: 'Demo MSSQL Replication & WAL', icon: '🔷' },
      { id: 'demo-mssql-checkpoint', label: 'Demo MSSQL Checkpoint', icon: '🔷' },
      { id: 'demo-mssql-maintenance', label: 'Demo MSSQL Vacuum & Maintenance', icon: '🔷' },
      { id: 'demo-mssql-capacity', label: 'Demo MSSQL Capacity Planning', icon: '🔷' },
      { id: 'demo-mssql-backup', label: 'Demo MSSQL Backup & Recovery', icon: '🔷' },
      { id: 'demo-mssql-schema', label: 'Demo MSSQL Schema & Migrations', icon: '🔷' },
      { id: 'demo-mssql-schema-viz', label: 'Demo MSSQL Schema Visualizer', icon: '🔷' },
      { id: 'demo-mssql-security', label: 'Demo MSSQL Security & Compliance', icon: '🔷' },
      { id: 'demo-mssql-cloudwatch', label: 'Demo MSSQL CloudWatch', icon: '🔷' },
      { id: 'demo-mssql-log-patterns', label: 'Demo MSSQL Log Patterns', icon: '🔷' },
      { id: 'demo-mssql-alert-correlation', label: 'Demo MSSQL Alert Correlation', icon: '🔷' },
      { id: 'demo-mssql-opentelemetry', label: 'Demo MSSQL OpenTelemetry', icon: '🔷' },
      { id: 'demo-mssql-kubernetes', label: 'Demo MSSQL Kubernetes', icon: '🔷' },
      { id: 'demo-mssql-status-page', label: 'Demo MSSQL Status Page', icon: '🔷' },
      { id: 'demo-mssql-ai-monitoring', label: 'Demo MSSQL AI Monitoring', icon: '🔷' },
      { id: 'demo-mssql-sql', label: 'Demo MSSQL SQL Console', icon: '🔷' },
      { id: 'demo-mssql-api', label: 'Demo MSSQL API Tracing', icon: '🔷' },
      { id: 'demo-mssql-repository', label: 'Demo MSSQL Repository', icon: '🔷' },
      { id: 'demo-mssql-ai-advisor', label: 'Demo MSSQL AI Query Advisor', icon: '🔷' },
      { id: 'demo-mssql-tasks', label: 'Demo MSSQL Task Scheduler', icon: '🔷' },
      { id: 'demo-mssql-users', label: 'Demo MSSQL User Management', icon: '🔷' },
      { id: 'demo-mssql-admin-panel', label: 'Demo MSSQL Admin', icon: '🔷' },
      { id: 'demo-mssql-retention', label: 'Demo MSSQL Data Retention', icon: '🔷' },
      { id: 'demo-mssql-terraform', label: 'Demo MSSQL Terraform Export', icon: '🔷' },
      { id: 'demo-mssql-custom-dashboard', label: 'Demo MSSQL Custom Dashboards', icon: '🔷' },
      { id: 'demo-oracle-overview', label: 'Demo Oracle Overview', icon: '🔴' },
      { id: 'demo-oracle-performance', label: 'Demo Oracle Performance', icon: '🔴' },
      { id: 'demo-oracle-resources', label: 'Demo Oracle Resources', icon: '🔴' },
      { id: 'demo-oracle-reliability', label: 'Demo Oracle Reliability', icon: '🔴' },
      { id: 'demo-oracle-alerts', label: 'Demo Oracle Alerts', icon: '🔴' },
      { id: 'demo-oracle-optimizer', label: 'Demo Oracle Query Optimizer', icon: '🔴' },
      { id: 'demo-oracle-indexes', label: 'Demo Oracle Indexes', icon: '🔴' },
      { id: 'demo-oracle-regression', label: 'Demo Oracle Plan Regression', icon: '🔴' },
      { id: 'demo-oracle-bloat', label: 'Demo Oracle Bloat Analysis', icon: '🔴' },
      { id: 'demo-oracle-table', label: 'Demo Oracle Table Analysis', icon: '🔴' },
      { id: 'demo-oracle-pool', label: 'Demo Oracle Connection Pool', icon: '🔴' },
      { id: 'demo-oracle-replication', label: 'Demo Oracle Replication & WAL', icon: '🔴' },
      { id: 'demo-oracle-checkpoint', label: 'Demo Oracle Checkpoint', icon: '🔴' },
      { id: 'demo-oracle-maintenance', label: 'Demo Oracle Vacuum & Maintenance', icon: '🔴' },
      { id: 'demo-oracle-capacity', label: 'Demo Oracle Capacity Planning', icon: '🔴' },
      { id: 'demo-oracle-backup', label: 'Demo Oracle Backup & Recovery', icon: '🔴' },
      { id: 'demo-oracle-schema', label: 'Demo Oracle Schema & Migrations', icon: '🔴' },
      { id: 'demo-oracle-schema-viz', label: 'Demo Oracle Schema Visualizer', icon: '🔴' },
      { id: 'demo-oracle-security', label: 'Demo Oracle Security & Compliance', icon: '🔴' },
      { id: 'demo-oracle-cloudwatch', label: 'Demo Oracle CloudWatch', icon: '🔴' },
      { id: 'demo-oracle-log-patterns', label: 'Demo Oracle Log Patterns', icon: '🔴' },
      { id: 'demo-oracle-alert-correlation', label: 'Demo Oracle Alert Correlation', icon: '🔴' },
      { id: 'demo-oracle-opentelemetry', label: 'Demo Oracle OpenTelemetry', icon: '🔴' },
      { id: 'demo-oracle-kubernetes', label: 'Demo Oracle Kubernetes', icon: '🔴' },
      { id: 'demo-oracle-status-page', label: 'Demo Oracle Status Page', icon: '🔴' },
      { id: 'demo-oracle-ai-monitoring', label: 'Demo Oracle AI Monitoring', icon: '🔴' },
      { id: 'demo-oracle-sql', label: 'Demo Oracle SQL Console', icon: '🔴' },
      { id: 'demo-oracle-api', label: 'Demo Oracle API Tracing', icon: '🔴' },
      { id: 'demo-oracle-repository', label: 'Demo Oracle Repository', icon: '🔴' },
      { id: 'demo-oracle-ai-advisor', label: 'Demo Oracle AI Query Advisor', icon: '🔴' },
      { id: 'demo-oracle-tasks', label: 'Demo Oracle Task Scheduler', icon: '🔴' },
      { id: 'demo-oracle-users', label: 'Demo Oracle User Management', icon: '🔴' },
      { id: 'demo-oracle-admin-panel', label: 'Demo Oracle Admin', icon: '🔴' },
      { id: 'demo-oracle-retention', label: 'Demo Oracle Data Retention', icon: '🔴' },
      { id: 'demo-oracle-terraform', label: 'Demo Oracle Terraform Export', icon: '🔴' },
      { id: 'demo-oracle-custom-dashboard', label: 'Demo Oracle Custom Dashboards', icon: '🔴' },
      { id: 'demo-mongo-overview', label: 'Demo Mongo Overview', icon: '🍃' },
      { id: 'demo-mongo-performance', label: 'Demo Mongo Performance', icon: '🍃' },
      { id: 'demo-mongo-storage', label: 'Demo Mongo Storage', icon: '🍃' },
      { id: 'demo-mongo-replication', label: 'Demo Mongo Replication', icon: '🍃' },
      { id: 'demo-mongo-sharding', label: 'Demo Mongo Sharding', icon: '🍃' },
      { id: 'demo-mongo-data-tools', label: 'Demo Mongo Data Tools', icon: '🍃' },
    ],
  },
];

// Role-based default screen presets
const ROLE_SCREEN_PRESETS = {
  super_admin: SCREEN_CATEGORIES.flatMap(c => c.screens.map(s => s.id)),
  admin:       SCREEN_CATEGORIES.flatMap(c => c.screens.map(s => s.id)).filter(id => id !== 'UserManagement'),
  developer:   ['connections','overview','performance','sql','optimizer','indexes','api','schema','regression','bloat','replication','checkpoint','pool','repository'],
  analyst:     ['connections','overview','performance','resources','reliability','sql','optimizer','indexes','capacity','bloat','alerts'],
  viewer:      ['connections','overview','performance','resources','reliability'],
};

const DATA_ACCESS_LEVELS = [
  { id: 'public', label: 'Public', color: '#2EE89C' },
  { id: 'internal', label: 'Internal', color: '#00D4FF' },
  { id: 'confidential', label: 'Confidential', color: '#FFB520' },
  { id: 'restricted', label: 'Restricted', color: '#FF4560' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   OVERLAY WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
const OverlayWrapper = memo(({ children, onClose }) => (
  createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>,
    document.body
  )
));
OverlayWrapper.displayName = 'OverlayWrapper';

/* ═══════════════════════════════════════════════════════════════════════════
   USER FORM MODAL — Main user editing form with 4 tabs
═══════════════════════════════════════════════════════════════════════════ */
const UserFormModal = memo(({ user, onSave, onCancel }) => {
  const [form, setForm] = useState(() => ({
    id: user?.id || null,
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    password: user?.password || '',
    role: user?.role || 'viewer',
    department: user?.department || '',
    location: user?.location || '',
    mfaEnabled: user?.mfaEnabled ?? false,
    apiAccess: user?.apiAccess ?? false,
    allowedScreens: user?.allowedScreens ?? [],
    dataAccess: user?.dataAccess ?? 'internal',
  }));
  
  const [activeTab, setActiveTab] = useState('info');
  const [showRoleDefaults, setShowRoleDefaults] = useState(false);
  const [errors, setErrors] = useState({});
  const prevRoleRef = useRef(form.role);

  const tabs = ['info', 'access', 'screens', 'security'];

  // Detect role change and show prompt
  useEffect(() => {
    if (prevRoleRef.current !== form.role && activeTab === 'access') {
      setShowRoleDefaults(true);
    }
    prevRoleRef.current = form.role;
  }, [form.role, activeTab]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleScreenToggle = useCallback((screenId) => {
    setForm(prev => ({
      ...prev,
      allowedScreens: prev.allowedScreens.includes(screenId)
        ? prev.allowedScreens.filter(id => id !== screenId)
        : [...prev.allowedScreens, screenId],
    }));
  }, []);

  const handleApplyRoleDefaults = useCallback(() => {
    setForm(prev => ({
      ...prev,
      allowedScreens: ROLE_SCREEN_PRESETS[form.role] || [],
    }));
    setShowRoleDefaults(false);
  }, [form.role]);

  const handleCategoryToggleAll = useCallback((categoryIndex, shouldAdd) => {
    const category = SCREEN_CATEGORIES[categoryIndex];
    const screenIds = category.screens.map(s => s.id);
    setForm(prev => {
      const current = new Set(prev.allowedScreens);
      if (shouldAdd) {
        screenIds.forEach(id => current.add(id));
      } else {
        screenIds.forEach(id => current.delete(id));
      }
      return { ...prev, allowedScreens: Array.from(current) };
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Name is required';
    if (!form.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.username?.trim()) newErrors.username = 'Username is required';
    if (!user?.id && !form.password?.trim()) newErrors.password = 'Password required for new user';
    if (!form.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, user]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(form);
    }
  }, [form, validateForm, onSave]);

  const countScreensInCategory = useCallback((categoryIndex) => {
    return SCREEN_CATEGORIES[categoryIndex].screens.filter(s => form.allowedScreens.includes(s.id)).length;
  }, [form.allowedScreens]);

  const categoryFullySelected = useCallback((categoryIndex) => {
    const category = SCREEN_CATEGORIES[categoryIndex];
    return category.screens.every(s => form.allowedScreens.includes(s.id));
  }, [form.allowedScreens]);

  const strictInputStyle = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${T.border}`,
    background: T.surfaceHigh,
    color: T.text,
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  return (
    <OverlayWrapper onClose={onCancel}>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: '16px',
          maxWidth: '640px',
          width: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: T.text }}>
              {user?.id ? `Edit ${form.name || 'User'}` : 'New User'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: T.textDim,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${T.border}`,
          background: T.surfaceHigh,
          gap: '2px',
          padding: '8px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                background: activeTab === tab ? T.surface : 'transparent',
                color: activeTab === tab ? T.primary : T.textDim,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>

            {/* INFO TAB */}
            {activeTab === 'info' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.name ? T.danger : T.border,
                    }}
                  />
                  {errors.name && <div style={{ fontSize: '12px', color: T.danger, marginTop: '4px' }}>{errors.name}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.email ? T.danger : T.border,
                    }}
                  />
                  {errors.email && <div style={{ fontSize: '12px', color: T.danger, marginTop: '4px' }}>{errors.email}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.username ? T.danger : T.border,
                    }}
                  />
                  {errors.username && <div style={{ fontSize: '12px', color: T.danger, marginTop: '4px' }}>{errors.username}</div>}
                </div>

                {!user?.id && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      style={{
                        ...strictInputStyle,
                        width: '100%',
                        borderColor: errors.password ? T.danger : T.border,
                      }}
                    />
                    {errors.password && <div style={{ fontSize: '12px', color: T.danger, marginTop: '4px' }}>{errors.password}</div>}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                      Department
                    </label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                      style={{
                        ...strictInputStyle,
                        width: '100%',
                      }}
                    >
                      <option value="">Select...</option>
                      {DEPARTMENTS?.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '6px' }}>
                      Location
                    </label>
                    <select
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                      style={{
                        ...strictInputStyle,
                        width: '100%',
                      }}
                    >
                      <option value="">Select...</option>
                      {LOCATIONS?.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ACCESS TAB */}
            {activeTab === 'access' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '10px' }}>
                    Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {ROLES?.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, role: role.id }))}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: `2px solid ${form.role === role.id ? role.color || T.primary : T.border}`,
                          background: form.role === role.id ? `${role.color || T.primary}20` : T.surfaceHigh,
                          color: form.role === role.id ? role.color || T.primary : T.text,
                          fontWeight: form.role === role.id ? '600' : '500',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '10px' }}>
                    Data Access Level
                  </label>
                  <select
                    name="dataAccess"
                    value={form.dataAccess}
                    onChange={handleInputChange}
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      paddingLeft: '40px',
                      backgroundImage: `radial-gradient(circle, ${DATA_ACCESS_LEVELS.find(d => d.id === form.dataAccess)?.color} 5px, transparent 5px)`,
                      backgroundPosition: '12px center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {DATA_ACCESS_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* SCREENS TAB */}
            {activeTab === 'screens' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Header with role defaults button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <button
                    type="button"
                    onClick={handleApplyRoleDefaults}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: `1px solid ${T.primary}`,
                      background: `${T.primary}20`,
                      color: T.primary,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Apply {form.role} Defaults
                  </button>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: T.surfaceRaised,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: T.primary,
                  }}>
                    {form.allowedScreens.length} selected
                  </div>
                </div>

                {/* Role defaults banner */}
                {showRoleDefaults && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: `${T.primary}15`,
                    border: `1px solid ${T.primary}40`,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '13px', color: T.text, flex: 1 }}>
                      Apply role defaults for {form.role}?
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyRoleDefaults}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: T.primary,
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRoleDefaults(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${T.border}`,
                        background: 'transparent',
                        color: T.textDim,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Keep
                    </button>
                  </div>
                )}

                {/* Categories */}
                {SCREEN_CATEGORIES.map((category, catIdx) => {
                  const count = countScreensInCategory(catIdx);
                  const isFullySelected = categoryFullySelected(catIdx);
                  return (
                    <div key={category.label}>
                      {/* Category Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: `2px solid ${category.color}40`,
                      }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: category.color,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ fontSize: '13px', fontWeight: '600', color: T.text, flex: 1 }}>
                          {category.label}
                        </div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: T.surfaceRaised,
                          fontSize: '11px',
                          fontWeight: '600',
                          color: T.textDim,
                        }}>
                          {count} / {category.screens.length}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCategoryToggleAll(catIdx, !isFullySelected)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            border: 'none',
                            background: isFullySelected ? category.color : T.surfaceRaised,
                            color: isFullySelected ? '#000' : T.textDim,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isFullySelected ? 'All' : 'None'}
                        </button>
                      </div>

                      {/* Screen Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '10px',
                        marginBottom: '16px',
                      }}>
                        {category.screens.map(screen => {
                          const isSelected = form.allowedScreens.includes(screen.id);
                          return (
                            <button
                              key={screen.id}
                              type="button"
                              onClick={() => handleScreenToggle(screen.id)}
                              style={{
                                padding: '12px 10px',
                                borderRadius: '8px',
                                border: `1px solid ${isSelected ? category.color + '50' : T.border}`,
                                background: isSelected ? category.color + '12' : T.surfaceHigh,
                                color: isSelected ? category.color : T.textDim,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '24px',
                              }}
                            >
                              <div>{screen.icon}</div>
                              <div style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                textAlign: 'center',
                                lineHeight: '1.2',
                              }}>
                                {screen.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Summary */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: T.surfaceRaised,
                  fontSize: '13px',
                  color: T.textDim,
                  textAlign: 'center',
                }}>
                  {form.allowedScreens.length} of {SCREEN_CATEGORIES.flatMap(c => c.screens).length} screens granted
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${T.border}`,
                  background: T.surfaceHigh,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>
                      Multi-Factor Authentication
                    </div>
                    <div style={{ fontSize: '12px', color: T.textDim, marginTop: '4px' }}>
                      Require 2FA for account login
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="mfaEnabled"
                    checked={form.mfaEnabled}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                <div style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${T.border}`,
                  background: T.surfaceHigh,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: T.text }}>
                      API Access
                    </div>
                    <div style={{ fontSize: '12px', color: T.textDim, marginTop: '4px' }}>
                      Allow API token generation
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="apiAccess"
                    checked={form.apiAccess}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: `1px solid ${T.border}`,
                background: 'transparent',
                color: T.textDim,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: T.primary,
                color: '#000',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {user?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </OverlayWrapper>
  );
});
UserFormModal.displayName = 'UserFormModal';

/* ═══════════════════════════════════════════════════════════════════════════
   USER DRAWER — Right sidebar with user overview
═══════════════════════════════════════════════════════════════════════════ */
const UserDrawer = memo(({ user, onClose, onEdit, onResetPassword }) => {
  if (!user) return null;

  return createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '400px',
          height: '100vh',
          background: T.surface,
          borderLeft: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: T.text }}>
            {user.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: T.textDim,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto', display: 'grid', gap: '20px' }}>
          {/* Info Section */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Email
            </div>
            <div style={{ fontSize: '13px', color: T.text }}>
              {user.email}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Username
            </div>
            <div style={{ fontSize: '13px', color: T.text }}>
              {user.username}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Role
            </div>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '6px',
              background: `${T.primary}20`,
              color: T.primary,
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {user.role || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Department
            </div>
            <div style={{ fontSize: '13px', color: T.text }}>
              {user.department || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Location
            </div>
            <div style={{ fontSize: '13px', color: T.text }}>
              {user.location || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              Status
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: user.status === 'active' ? '#2EE89C20' : '#FF456020',
              color: user.status === 'active' ? '#2EE89C' : '#FF4560',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'currentColor',
              }} />
              {user.status || 'unknown'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          gap: '10px',
        }}>
          <button
            onClick={() => onResetPassword(user)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.textDim,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reset Password
          </button>
          <button
            onClick={() => onEdit(user)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: T.primary,
              color: '#000',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Edit User
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});
UserDrawer.displayName = 'UserDrawer';

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD MODAL
═══════════════════════════════════════════════════════════════════════════ */
const PasswordModal = memo(({ user, onConfirm, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = useCallback(() => {
    const newPass = generatePassword();
    setPassword(newPass);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(user.id, password);
    }
  }, [password, user, onConfirm]);

  return (
    <OverlayWrapper onClose={onClose}>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: '16px',
          maxWidth: '400px',
          width: '90vw',
          boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: T.text }}>
            Reset Password for {user?.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: T.textDim,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textDim, marginBottom: '8px' }}>
              New Password
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${T.border}`,
                  background: T.surfaceHigh,
                  color: T.text,
                  fontSize: '13px',
                  fontFamily: THEME.fontMono,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${T.border}`,
                  background: T.surfaceHigh,
                  color: T.textDim,
                  cursor: 'pointer',
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeneratePassword}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${T.border}`,
              background: T.surfaceHigh,
              color: T.textDim,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Generate Password
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '8px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: `1px solid ${T.border}`,
                background: 'transparent',
                color: T.textDim,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: password.trim() ? T.primary : T.border,
                color: password.trim() ? '#000' : T.textDim,
                fontSize: '13px',
                fontWeight: '600',
                cursor: password.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </OverlayWrapper>
  );
});
PasswordModal.displayName = 'PasswordModal';

export { UserFormModal, UserDrawer, PasswordModal, SCREEN_CATEGORIES, ROLE_SCREEN_PRESETS };
