import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AlertCircle, AlertTriangle, Info, Check, RefreshCw, CheckCircle2,
  Bell, Settings, History, Plus, Search, X, Clock, Shield, Zap,
  Filter, MoreVertical, PauseCircle, PlayCircle, Share2, ArrowUpRight,
  Trash2, ChevronDown, Activity, TrendingUp, TrendingDown, Eye,
  EyeOff, Volume2, VolumeX, Layers, BarChart2, Target, Terminal,
  AlertOctagon, Cpu, Database, Server, Wifi, HardDrive, GitBranch,
  CornerDownRight, ExternalLink, ChevronRight, Minus, Edit3, Copy,
  Download, Upload, Moon, Sun, SlidersHorizontal
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   VIGIL v2 – Advanced Monitoring & Alert Intelligence Platform
   Aesthetic: Refined dark-industrial terminal. Monospaced data,
   sharp accent lines, layered glass panels, precision micro-motion.
───────────────────────────────────────────────────────────────── */

// ─── CONSTANTS ──────────────────────────────────────────────────
const SEVERITY = {
  critical: { color: '#ff3b5c', glow: 'rgba(255,59,92,0.25)', bg: 'rgba(255,59,92,0.08)', icon: AlertOctagon, label: 'CRIT' },
  warning:  { color: '#ffaa00', glow: 'rgba(255,170,0,0.2)',   bg: 'rgba(255,170,0,0.07)',  icon: AlertTriangle, label: 'WARN' },
  info:     { color: '#38bdf8', glow: 'rgba(56,189,248,0.18)', bg: 'rgba(56,189,248,0.06)', icon: Info, label: 'INFO' },
  resolved: { color: '#22d3a5', glow: 'rgba(34,211,165,0.15)', bg: 'rgba(34,211,165,0.05)', icon: CheckCircle2, label: 'RSLV' },
};

const METRICS = {
  cpu_usage:    { label: 'CPU Usage', unit: '%', icon: Cpu, max: 100 },
  memory_usage: { label: 'Memory', unit: '%', icon: Database, max: 100 },
  disk_free:    { label: 'Disk Free', unit: 'GB', icon: HardDrive, max: 500 },
  api_latency:  { label: 'API Latency', unit: 'ms', icon: Wifi, max: 2000 },
  error_rate:   { label: 'Error Rate', unit: '%', icon: AlertCircle, max: 100 },
  throughput:   { label: 'Throughput', unit: 'rps', icon: Activity, max: 10000 },
  network_in:   { label: 'Network In', unit: 'MB/s', icon: Upload, max: 1000 },
  network_out:  { label: 'Network Out', unit: 'MB/s', icon: Download, max: 1000 },
};

const CATEGORIES = ['performance', 'security', 'reliability', 'resources', 'maintenance', 'network'];

// ─── MOCK DATA ───────────────────────────────────────────────────
const MOCK_ALERTS = [
  { id: 'alr-001', severity: 'critical', category: 'security',     message: 'Unauthorized root access attempt detected on prod-auth-02', timestamp: Date.now() - 120000,   acknowledged: false, source: '192.168.1.105', rule: 'Security Breach Detector', tags: ['auth', 'prod'], count: 7 },
  { id: 'alr-002', severity: 'critical', category: 'reliability',  message: 'Database connection pool exhaustion — 0/200 connections free', timestamp: Date.now() - 300000,  acknowledged: false, source: 'db-primary-01', rule: 'DB Pool Monitor', tags: ['database', 'prod'], count: 1 },
  { id: 'alr-003', severity: 'warning',  category: 'performance',  message: 'High memory usage (87%) sustained on node-04 for >15m', timestamp: Date.now() - 2700000,  acknowledged: false, source: 'node-04', rule: 'Memory High', tags: ['memory', 'k8s'], count: 3 },
  { id: 'alr-004', severity: 'warning',  category: 'resources',    message: 'Disk utilization exceeding 78% on /var/log partition', timestamp: Date.now() - 5400000,  acknowledged: false, source: 'log-collector', rule: 'Disk Space Low', tags: ['disk', 'logs'], count: 2 },
  { id: 'alr-005', severity: 'info',     category: 'maintenance',  message: 'Scheduled backup completed — 2.4 TB archived successfully', timestamp: Date.now() - 7200000,  acknowledged: true,  source: 'backup-service', rule: 'Backup Status', tags: ['backup'], acknowledged_by: 'System', count: 1 },
  { id: 'alr-006', severity: 'warning',  category: 'network',      message: 'Packet loss 3.2% detected between us-east and eu-west', timestamp: Date.now() - 900000,   acknowledged: false, source: 'network-probe', rule: 'Packet Loss', tags: ['network', 'cross-region'], count: 5 },
  { id: 'alr-007', severity: 'info',     category: 'performance',  message: 'API p99 latency elevated to 412ms — within acceptable range', timestamp: Date.now() - 10800000, acknowledged: true,  source: 'api-gateway', rule: 'Latency Monitor', tags: ['api'], acknowledged_by: 'jane.doe', count: 1 },
];

const MOCK_RULES = [
  { id: 'rule-001', name: 'Security Breach Detector', metric: 'error_rate',   condition: 'gt', threshold: 5,   severity: 'critical', active: true,  category: 'security',     duration: 1,  channels: { email: true, slack: true, pagerduty: true  }, triggerCount: 12, lastTriggered: Date.now() - 120000 },
  { id: 'rule-002', name: 'High CPU Load',            metric: 'cpu_usage',    condition: 'gt', threshold: 90,  severity: 'critical', active: true,  category: 'performance',  duration: 5,  channels: { email: true, slack: true, pagerduty: false }, triggerCount: 8,  lastTriggered: Date.now() - 3600000 },
  { id: 'rule-003', name: 'Memory High',              metric: 'memory_usage', condition: 'gt', threshold: 85,  severity: 'warning',  active: true,  category: 'performance',  duration: 15, channels: { email: true, slack: false, pagerduty: false }, triggerCount: 3,  lastTriggered: Date.now() - 2700000 },
  { id: 'rule-004', name: 'Disk Space Low',           metric: 'disk_free',    condition: 'lt', threshold: 20,  severity: 'warning',  active: true,  category: 'resources',    duration: 10, channels: { email: true, slack: false, pagerduty: false }, triggerCount: 6,  lastTriggered: Date.now() - 86400000 },
  { id: 'rule-005', name: 'API Latency Spike',        metric: 'api_latency',  condition: 'gt', threshold: 500, severity: 'warning',  active: false, category: 'performance',  duration: 2,  channels: { email: false, slack: true, pagerduty: false }, triggerCount: 21, lastTriggered: Date.now() - 172800000 },
  { id: 'rule-006', name: 'DB Pool Monitor',          metric: 'throughput',   condition: 'lt', threshold: 10,  severity: 'critical', active: true,  category: 'reliability',  duration: 3,  channels: { email: true, slack: true, pagerduty: true  }, triggerCount: 2,  lastTriggered: Date.now() - 300000 },
  { id: 'rule-007', name: 'Packet Loss',              metric: 'network_in',   condition: 'lt', threshold: 100, severity: 'warning',  active: true,  category: 'network',      duration: 5,  channels: { email: false, slack: true, pagerduty: false }, triggerCount: 5,  lastTriggered: Date.now() - 900000 },
];

const MOCK_HISTORY = [
  { id: 'hist-001', message: 'High CPU Load — prod-web-cluster sustained 94% for 12m', timestamp: Date.now() - 86400000,   severity: 'critical', duration: '45m', rule: 'High CPU Load',   resolvedBy: 'k8s-autoscaler' },
  { id: 'hist-002', message: 'API Latency Spike — gateway p99 >500ms', timestamp: Date.now() - 172800000,  severity: 'warning',  duration: '8m',  rule: 'API Latency Spike', resolvedBy: 'john.smith' },
  { id: 'hist-003', message: 'Memory High — node-02 at 89%', timestamp: Date.now() - 259200000,  severity: 'warning',  duration: '22m', rule: 'Memory High',        resolvedBy: 'auto-restart' },
  { id: 'hist-004', message: 'SSL Certificate expiring in 7 days on api.example.com', timestamp: Date.now() - 345600000,  severity: 'info',     duration: '1d',  rule: 'Cert Expiry',       resolvedBy: 'cert-bot' },
  { id: 'hist-005', message: 'Unauthorized login attempt from 185.220.101.x (Tor exit)', timestamp: Date.now() - 432000000, severity: 'critical', duration: '2m',  rule: 'Security Breach',   resolvedBy: 'firewall-auto-block' },
  { id: 'hist-006', message: 'Disk Space Low — /var/log at 82%', timestamp: Date.now() - 518400000, severity: 'warning',  duration: '35m', rule: 'Disk Space Low',    resolvedBy: 'log-rotation' },
];

// Sparkline data generator
const genSparkData = (points = 20, base = 50, variance = 20) =>
    Array.from({ length: points }, (_, i) => ({
      v: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance * 2 + Math.sin(i / 3) * 10)),
      t: i
    }));

const LIVE_METRICS = {
  cpu_usage:    { current: 73, data: genSparkData(20, 73, 15), trend: 'up' },
  memory_usage: { current: 61, data: genSparkData(20, 61, 10), trend: 'stable' },
  error_rate:   { current: 2.4, data: genSparkData(20, 2.4, 2), trend: 'down' },
  api_latency:  { current: 187, data: genSparkData(20, 187, 80), trend: 'up' },
};

// ─── UTILITIES ───────────────────────────────────────────────────
const formatAge = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const formatTime = (ts) => new Date(ts).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
});

// ─── SPARKLINE ───────────────────────────────────────────────────
const Sparkline = ({ data, color, width = 80, height = 28 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.v), 0.01);
  const min = Math.min(...data.map(d => d.v));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const lastPt = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((lastPt.v - min) / range) * (height - 4) - 2;
  return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      </svg>
  );
};

// ─── PULSE DOT ───────────────────────────────────────────────────
const PulseDot = ({ color, size = 8 }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 8, height: size + 8 }}>
    <span style={{
      position: 'absolute', borderRadius: '50%', background: color, opacity: 0.3,
      width: size + 8, height: size + 8,
      animation: 'pulse-ring 1.8s ease infinite',
    }} />
    <span style={{ borderRadius: '50%', background: color, width: size, height: size, display: 'block', position: 'relative', zIndex: 1 }} />
  </span>
);

// ─── MINI BADGE ──────────────────────────────────────────────────
const SeverityBadge = ({ severity, small }) => {
  const s = SEVERITY[severity] || SEVERITY.info;
  return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: small ? '2px 6px' : '3px 8px',
        borderRadius: 3,
        background: s.bg,
        border: `1px solid ${s.color}30`,
        color: s.color,
        fontSize: small ? 9 : 10,
        fontFamily: '"JetBrains Mono", "Fira Mono", monospace',
        fontWeight: 700,
        letterSpacing: '0.08em',
      }}>
      {s.label}
    </span>
  );
};

// ─── TOGGLE SWITCH ───────────────────────────────────────────────
const Toggle = ({ on, onChange, accent = '#6366f1' }) => (
    <button
        onClick={onChange}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', padding: 0,
          background: on ? accent : 'rgba(255,255,255,0.08)',
          position: 'relative', transition: 'background 0.25s', outline: 'none', flexShrink: 0,
        }}
        aria-checked={on}
        role="switch"
    >
    <span style={{
      width: 14, height: 14, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 3, left: on ? 19 : 3,
      transition: 'left 0.2s cubic-bezier(.4,0,.2,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
    }} />
    </button>
);

// ─── CHANNEL ICONS ───────────────────────────────────────────────
const ChannelDot = ({ active, label }) => (
    <span title={label} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: 4,
      background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
      fontSize: 8, fontWeight: 700, letterSpacing: 0.04,
      color: active ? '#818cf8' : '#4b5563',
      fontFamily: 'monospace',
      cursor: 'default',
      transition: 'all 0.2s',
    }}>
    {label.slice(0,2).toUpperCase()}
  </span>
);

// ─── LIVE METRIC CARD ────────────────────────────────────────────
const MetricCard = ({ metricKey, data }) => {
  const m = METRICS[metricKey];
  const Icon = m.icon;
  const pct = Math.min(100, (data.current / m.max) * 100);
  const color = pct > 85 ? SEVERITY.critical.color : pct > 65 ? SEVERITY.warning.color : SEVERITY.info.color;
  return (
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`, opacity: 0.6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={13} color={color} />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{m.label.toUpperCase()}</span>
          </div>
          {data.trend === 'up' && <TrendingUp size={12} color={SEVERITY.warning.color} />}
          {data.trend === 'down' && <TrendingDown size={12} color={SEVERITY.resolved.color} />}
          {data.trend === 'stable' && <Minus size={12} color="#4b5563" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
          {data.current}
          <span style={{ fontSize: 11, color: '#4b5563', fontWeight: 400, marginLeft: 3 }}>{m.unit}</span>
        </span>
          <Sparkline data={data.data} color={color} />
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
const VIGILDashboard = () => {
  const [activeTab, setActiveTab]           = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [soundEnabled, setSoundEnabled]     = useState(true);
  const [alerts, setAlerts]                 = useState(MOCK_ALERTS);
  const [alertRules, setAlertRules]         = useState(MOCK_RULES);
  const [history]                           = useState(MOCK_HISTORY);
  const [liveMetrics]                       = useState(LIVE_METRICS);
  const [tickCount, setTickCount]           = useState(0);
  const [filters, setFilters]               = useState({ severity: 'all', category: 'all', search: '', acknowledged: 'all' });
  const [histFilter, setHistFilter]         = useState('');
  const [editingRule, setEditingRule]       = useState(null);
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [bulkMenu, setBulkMenu]             = useState(false);
  const [toast, setToast]                   = useState(null);
  const [newRule, setNewRule]               = useState({
    name: '', metric: 'cpu_usage', condition: 'gt', threshold: 80, duration: 5,
    severity: 'warning', channels: { email: true, slack: false, pagerduty: false },
    category: 'performance', description: ''
  });

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setTickCount(c => c + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── COMPUTED ──────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning:  alerts.filter(a => a.severity === 'warning').length,
    info:     alerts.filter(a => a.severity === 'info').length,
    unacked:  alerts.filter(a => !a.acknowledged).length,
    activeRules: alertRules.filter(r => r.active).length,
  }), [alerts, alertRules]);

  const filteredAlerts = useMemo(() => alerts.filter(a => {
    if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.category !== 'all' && a.category !== filters.category) return false;
    if (filters.acknowledged === 'unacked' && a.acknowledged) return false;
    if (filters.acknowledged === 'acked' && !a.acknowledged) return false;
    if (filters.search && !a.message.toLowerCase().includes(filters.search.toLowerCase()) &&
        !a.source.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }), [alerts, filters, tickCount]);

  const filteredHistory = useMemo(() =>
          history.filter(h => !histFilter || h.message.toLowerCase().includes(histFilter.toLowerCase())),
      [history, histFilter]
  );

  // ─── ACTIONS ───────────────────────────────────────────────────
  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true, acknowledged_by: 'you' } : a));
    showToast('Alert acknowledged');
  };

  const acknowledgeMany = () => {
    setAlerts(prev => prev.map(a => selectedAlerts.has(a.id) ? { ...a, acknowledged: true, acknowledged_by: 'you' } : a));
    showToast(`${selectedAlerts.size} alerts acknowledged`);
    setSelectedAlerts(new Set()); setBulkMenu(false);
  };

  const snoozeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert snoozed for 1 hour', 'info');
  };

  const escalateAlert = (id) => showToast(`Alert ${id} escalated to L2 on-call`, 'warning');

  const toggleSelect = (id) => {
    setSelectedAlerts(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
  const clearSelection = () => setSelectedAlerts(new Set());

  const toggleRule = (id) => setAlertRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));

  const deleteRule = (id) => {
    setAlertRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule deleted', 'warning');
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (editingRule) {
      setAlertRules(prev => prev.map(r => r.id === editingRule ? { ...r, ...newRule } : r));
      showToast('Rule updated');
    } else {
      setAlertRules(prev => [{
        ...newRule, id: `rule-${Date.now()}`, active: true,
        triggerCount: 0, lastTriggered: null
      }, ...prev]);
      showToast('Alert rule created');
    }
    setShowCreateModal(false); setEditingRule(null);
    setNewRule({ name: '', metric: 'cpu_usage', condition: 'gt', threshold: 80, duration: 5, severity: 'warning', channels: { email: true, slack: false, pagerduty: false }, category: 'performance', description: '' });
  };

  const openEditRule = (rule) => {
    setEditingRule(rule.id);
    setNewRule({ name: rule.name, metric: rule.metric, condition: rule.condition, threshold: rule.threshold, duration: rule.duration, severity: rule.severity, channels: { ...rule.channels }, category: rule.category, description: rule.description || '' });
    setShowCreateModal(true);
  };

  // ─── STYLES ────────────────────────────────────────────────────
  const css = {
    wrap:      { color: '#e5e7eb', fontFamily: '"JetBrains Mono", "Fira Mono", "IBM Plex Mono", monospace' },
    card:      { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 },
    input:     { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '7px 10px', color: '#e5e7eb', width: '100%', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    label:     { display: 'block', fontSize: 10, color: '#6b7280', marginBottom: 5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    tab:       (on) => ({ background: on ? 'rgba(99,102,241,0.12)' : 'transparent', border: `1px solid ${on ? 'rgba(99,102,241,0.3)' : 'transparent'}`, borderRadius: 6, padding: '7px 14px', color: on ? '#818cf8' : '#6b7280', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', outline: 'none', letterSpacing: '0.06em', fontFamily: 'inherit' }),
    btn:       (v = 'ghost') => ({ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.15s', outline: 'none', padding: '6px 12px', ...(v === 'primary' ? { background: '#4f46e5', color: '#fff' } : v === 'danger' ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' } : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }) }),
    modal:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalBox:  { background: '#0f1623', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 520, maxWidth: '95vw', padding: 24, boxShadow: '0 32px 64px rgba(0,0,0,0.6)', color: '#e5e7eb', maxHeight: '90vh', overflowY: 'auto' },
  };

  // ─── RENDER: HEADER STATS ──────────────────────────────────────
  const renderStats = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Alerts', val: stats.total,    sub: `${stats.unacked} unacknowledged`, color: '#e5e7eb' },
          { label: 'Critical',     val: stats.critical, sub: 'requires attention', color: SEVERITY.critical.color },
          { label: 'Warning',      val: stats.warning,  sub: 'monitor closely',   color: SEVERITY.warning.color },
          { label: 'Active Rules', val: stats.activeRules + '/' + alertRules.length, sub: 'rules enabled', color: '#818cf8' },
        ].map((s, i) => (
            <div key={i} style={{ ...css.card, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle, ${s.color}12 0%, transparent 70%)` }} />
              <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#4b5563' }}>{s.sub}</div>
            </div>
        ))}
      </div>
  );

  // ─── RENDER: LIVE METRICS ──────────────────────────────────────
  const renderLiveMetrics = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
        {Object.entries(liveMetrics).map(([k, v]) => (
            <MetricCard key={k} metricKey={k} data={v} />
        ))}
      </div>
  );

  // ─── RENDER: ACTIVE ALERTS ─────────────────────────────────────
  const renderActive = () => (
      <div>
        {/* Toolbar */}
        <div style={{ ...css.card, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
            <input style={{ ...css.input, paddingLeft: 30 }} placeholder="Search alerts, sources…" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          {[
            { key: 'severity', options: ['all','critical','warning','info'], label: { all: 'All Severities', critical: 'Critical', warning: 'Warning', info: 'Info' } },
            { key: 'category', options: ['all', ...CATEGORIES], label: { all: 'All Categories' } },
            { key: 'acknowledged', options: ['all','unacked','acked'], label: { all: 'All Status', unacked: 'Unacknowledged', acked: 'Acknowledged' } },
          ].map(f => (
              <select key={f.key} style={{ ...css.input, width: 'auto', minWidth: 130 }}
                      value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}>
                {f.options.map(o => <option key={o} value={o}>{f.label?.[o] || (o.charAt(0).toUpperCase() + o.slice(1))}</option>)}
              </select>
          ))}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
            {selectedAlerts.size > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{selectedAlerts.size} selected</span>
                  <button style={css.btn('ghost')} onClick={acknowledgeMany}><Check size={12} /> Ack All</button>
                  <button style={css.btn('ghost')} onClick={clearSelection}><X size={12} /></button>
                </div>
            )}
            <button onClick={() => setMaintenanceMode(m => !m)} style={{ ...css.tab(maintenanceMode), borderColor: maintenanceMode ? SEVERITY.warning.color : 'transparent', color: maintenanceMode ? SEVERITY.warning.color : '#6b7280' }}>
              <Shield size={13} /> {maintenanceMode ? 'MAINT ON' : 'MAINTENANCE'}
            </button>
          </div>
        </div>

        {/* Select all bar */}
        {filteredAlerts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, paddingLeft: 4 }}>
              <input type="checkbox" checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                     onChange={e => e.target.checked ? selectAll() : clearSelection()}
                     style={{ accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.06em' }}>
            {filteredAlerts.length} ALERT{filteredAlerts.length !== 1 ? 'S' : ''}
          </span>
            </div>
        )}

        {/* Alert List */}
        <div style={{ ...css.card, overflow: 'hidden' }}>
          {filteredAlerts.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#4b5563' }}>
                <CheckCircle2 size={32} style={{ display: 'block', margin: '0 auto 14px', color: '#22d3a5' }} />
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>All systems nominal</div>
                <div style={{ fontSize: 10, color: '#374151' }}>No alerts match the current filters</div>
              </div>
          ) : (
              filteredAlerts.map((alert, idx) => {
                const s = SEVERITY[alert.severity] || SEVERITY.info;
                const Icon = s.icon;
                const isSelected = selectedAlerts.has(alert.id);
                const isDetail = showDetailPanel === alert.id;
                return (
                    <div key={alert.id}>
                      <div
                          style={{
                            padding: '14px 16px',
                            borderBottom: idx < filteredAlerts.length - 1 || isDetail ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            display: 'flex', gap: 14, alignItems: 'flex-start',
                            background: isSelected ? 'rgba(99,102,241,0.05)' : alert.acknowledged ? 'rgba(255,255,255,0.01)' : 'transparent',
                            borderLeft: `2px solid ${isSelected ? '#6366f1' : s.color}`,
                            transition: 'background 0.15s',
                            cursor: 'default',
                          }}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(alert.id)}
                               style={{ accentColor: '#6366f1', marginTop: 3, cursor: 'pointer', flexShrink: 0 }} />
                        <div style={{ marginTop: 2, flexShrink: 0 }}>
                          {!alert.acknowledged
                              ? <PulseDot color={s.color} size={8} />
                              : <Icon size={14} color="#4b5563" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
                              <SeverityBadge severity={alert.severity} />
                              <span style={{ fontSize: 13, color: alert.acknowledged ? '#6b7280' : '#e5e7eb', fontFamily: '"Inter", sans-serif', fontWeight: 500, letterSpacing: 0 }}>
                          {alert.message}
                        </span>
                              {alert.count > 1 && (
                                  <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                            ×{alert.count}
                          </span>
                              )}
                            </div>
                            <span style={{ fontSize: 10, color: '#4b5563', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatAge(alert.timestamp)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: alert.acknowledged ? 0 : 10 }}>
                      <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, padding: '2px 7px', fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>
                        {alert.source}
                      </span>
                            <span style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{alert.category}</span>
                            <span style={{ fontSize: 10, color: '#374151' }}>⟵ {alert.rule}</span>
                            {alert.tags?.map(t => (
                                <span key={t} style={{ fontSize: 9, color: '#4b5563', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', padding: '1px 5px' }}>#{t}</span>
                            ))}
                            {alert.acknowledged && <span style={{ color: '#22d3a5', fontSize: 10 }}>✓ acked by {alert.acknowledged_by}</span>}
                          </div>
                          {!alert.acknowledged && (
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button onClick={() => acknowledgeAlert(alert.id)} style={{ ...css.btn('ghost'), borderColor: 'rgba(34,211,165,0.25)', color: '#22d3a5' }}>
                                  <Check size={11} /> Acknowledge
                                </button>
                                <button onClick={() => snoozeAlert(alert.id)} style={css.btn('ghost')}>
                                  <Clock size={11} /> Snooze 1h
                                </button>
                                <button onClick={() => escalateAlert(alert.id)} style={{ ...css.btn('ghost'), color: '#f87171', borderColor: 'rgba(248,113,113,0.2)' }}>
                                  <ArrowUpRight size={11} /> Escalate
                                </button>
                                <button onClick={() => setShowDetailPanel(isDetail ? null : alert.id)} style={{ ...css.btn('ghost'), marginLeft: 'auto' }}>
                                  <ChevronRight size={11} style={{ transform: isDetail ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} /> Details
                                </button>
                              </div>
                          )}
                        </div>
                      </div>
                      {/* Detail Drawer */}
                      {isDetail && (
                          <div style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '16px 20px 16px 56px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                            {[
                              { label: 'First Seen',   val: formatTime(alert.timestamp - (alert.count - 1) * 60000) },
                              { label: 'Last Seen',    val: formatTime(alert.timestamp) },
                              { label: 'Occurrences',  val: alert.count },
                              { label: 'Alert Rule',   val: alert.rule },
                              { label: 'Source Host',  val: alert.source },
                              { label: 'Category',     val: alert.category },
                            ].map(item => (
                                <div key={item.label}>
                                  <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{item.val}</div>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                );
              })
          )}
        </div>
      </div>
  );

  // ─── RENDER: CONFIG ────────────────────────────────────────────
  const renderConfig = () => (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 700, marginBottom: 3 }}>Alert Rules</div>
            <div style={{ fontSize: 10, color: '#4b5563' }}>{stats.activeRules} active / {alertRules.length} total</div>
          </div>
          <button onClick={() => { setEditingRule(null); setShowCreateModal(true); }} style={css.btn('primary')}>
            <Plus size={13} /> New Rule
          </button>
        </div>

        {/* Rule List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alertRules.map(rule => {
            const s = SEVERITY[rule.severity] || SEVERITY.info;
            return (
                <div key={rule.id} style={{ ...css.card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `2px solid ${rule.active ? s.color : 'rgba(255,255,255,0.06)'}`, opacity: rule.active ? 1 : 0.55 }}>
                  <Toggle on={rule.active} onChange={() => toggleRule(rule.id)} accent={s.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 700 }}>{rule.name}</span>
                      <SeverityBadge severity={rule.severity} small />
                      <span style={{ fontSize: 9, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{rule.category}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                      <span style={{ color: '#818cf8' }}>{METRICS[rule.metric]?.label || rule.metric}</span>
                      <span style={{ color: '#4b5563' }}> {rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='} </span>
                      <span style={{ color: '#9ca3af' }}>{rule.threshold}{METRICS[rule.metric]?.unit}</span>
                      <span style={{ color: '#4b5563' }}> for {rule.duration}m</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.06em', marginBottom: 3 }}>FIRED</div>
                      <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>{rule.triggerCount}×</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.06em', marginBottom: 3 }}>CHANNELS</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ChannelDot active={rule.channels?.email} label="Email" />
                        <ChannelDot active={rule.channels?.slack} label="Slack" />
                        <ChannelDot active={rule.channels?.pagerduty} label="PagerDuty" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEditRule(rule)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteRule(rule.id)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
            );
          })}
          {alertRules.length === 0 && (
              <div style={{ ...css.card, padding: 40, textAlign: 'center', color: '#4b5563', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.06)' }}>
                <Target size={24} style={{ display: 'block', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12 }}>No alert rules configured</div>
                <div style={{ fontSize: 10, marginTop: 6 }}>Click "New Rule" to create your first rule</div>
              </div>
          )}
        </div>
      </div>
  );

  // ─── RENDER: HISTORY ───────────────────────────────────────────
  const renderHistory = () => (
      <div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
            <input style={{ ...css.input, paddingLeft: 30 }} placeholder="Filter history…" value={histFilter} onChange={e => setHistFilter(e.target.value)} />
          </div>
        </div>
        <div style={{ ...css.card, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '80px 1fr 80px 90px 100px', gap: 16, alignItems: 'center' }}>
            {['SEVERITY', 'MESSAGE', 'DURATION', 'RULE', 'RESOLVED AT'].map(h => (
                <div key={h} style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.1em', fontWeight: 700 }}>{h}</div>
            ))}
          </div>
          {filteredHistory.map((item, i) => (
              <div key={item.id} style={{ padding: '12px 16px', borderBottom: i < filteredHistory.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', display: 'grid', gridTemplateColumns: '80px 1fr 80px 90px 100px', gap: 16, alignItems: 'center' }}>
                <SeverityBadge severity={item.severity} small />
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: '"Inter", sans-serif', marginBottom: 3 }}>{item.message}</div>
                  <div style={{ fontSize: 10, color: '#374151' }}>resolved by <span style={{ color: '#4b5563' }}>{item.resolvedBy}</span></div>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{item.duration}</div>
                <div style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace' }}>{item.rule}</div>
                <div style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace' }}>{formatTime(item.timestamp)}</div>
              </div>
          ))}
          {filteredHistory.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#4b5563', fontSize: 12 }}>No historical alerts found</div>
          )}
        </div>
      </div>
  );

  // ─── RENDER: CREATE/EDIT MODAL ─────────────────────────────────
  const renderModal = () => (
      <div style={css.modal} onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
        <div style={css.modalBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb', marginBottom: 3 }}>
                {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
              </div>
              <div style={{ fontSize: 10, color: '#4b5563' }}>Define conditions to trigger alerts and notifications</div>
            </div>
            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateRule}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={css.label}>Rule Name *</label>
                <input required style={css.input} placeholder="e.g., Database High CPU" value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={css.label}>Category</label>
                  <select style={css.input} value={newRule.category} onChange={e => setNewRule(r => ({ ...r, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={css.label}>Severity</label>
                  <select style={css.input} value={newRule.severity} onChange={e => setNewRule(r => ({ ...r, severity: e.target.value }))}>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={css.label}>Metric</label>
                <select style={css.input} value={newRule.metric} onChange={e => setNewRule(r => ({ ...r, metric: e.target.value }))}>
                  {Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v.label} ({v.unit})</option>)}
                </select>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 6, padding: '12px 14px' }}>
                <label style={{ ...css.label, marginBottom: 10 }}>Trigger Condition</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>If</span>
                  <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700 }}>{METRICS[newRule.metric]?.label}</span>
                  <select style={{ ...css.input, width: 60 }} value={newRule.condition} onChange={e => setNewRule(r => ({ ...r, condition: e.target.value }))}>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="eq">=</option>
                  </select>
                  <input type="number" style={{ ...css.input, width: 80 }} value={newRule.threshold} onChange={e => setNewRule(r => ({ ...r, threshold: e.target.value }))} />
                  <span style={{ fontSize: 11, color: '#4b5563' }}>{METRICS[newRule.metric]?.unit}</span>
                  <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>for</span>
                  <input type="number" style={{ ...css.input, width: 60 }} value={newRule.duration} onChange={e => setNewRule(r => ({ ...r, duration: e.target.value }))} />
                  <span style={{ fontSize: 11, color: '#4b5563' }}>min</span>
                </div>
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(99,102,241,0.06)', borderRadius: 4, fontSize: 11, color: '#6b7280', fontFamily: '"Inter", sans-serif' }}>
                  Alert fires when <strong style={{ color: '#818cf8' }}>{METRICS[newRule.metric]?.label}</strong> is {newRule.condition === 'gt' ? 'above' : newRule.condition === 'lt' ? 'below' : 'equal to'} <strong style={{ color: '#9ca3af' }}>{newRule.threshold}{METRICS[newRule.metric]?.unit}</strong> for <strong style={{ color: '#9ca3af' }}>{newRule.duration} minutes</strong>
                </div>
              </div>
              <div>
                <label style={css.label}>Notification Channels</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { key: 'email', label: 'Email', icon: '✉' },
                    { key: 'slack', label: 'Slack', icon: '#' },
                    { key: 'pagerduty', label: 'PagerDuty', icon: '⚡' },
                  ].map(ch => (
                      <label key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', background: newRule.channels[ch.key] ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${newRule.channels[ch.key] ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={!!newRule.channels[ch.key]} style={{ accentColor: '#6366f1' }}
                               onChange={e => setNewRule(r => ({ ...r, channels: { ...r.channels, [ch.key]: e.target.checked } }))} />
                        <span style={{ fontSize: 12, color: newRule.channels[ch.key] ? '#818cf8' : '#6b7280' }}>{ch.icon} {ch.label}</span>
                      </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={css.btn('ghost')}>Cancel</button>
              <button type="submit" style={css.btn('primary')}><Check size={13} /> {editingRule ? 'Save Changes' : 'Create Rule'}</button>
            </div>
          </form>
        </div>
      </div>
  );

  // ─── RENDER: TOAST ─────────────────────────────────────────────
  const renderToast = () => toast && (
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
        background: '#111827', border: `1px solid ${toast.type === 'warning' ? SEVERITY.warning.color : toast.type === 'info' ? SEVERITY.info.color : SEVERITY.resolved.color}40`,
        borderRadius: 8, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.2s ease',
        fontSize: 12, color: '#e5e7eb', fontFamily: '"JetBrains Mono", monospace',
      }}>
        {toast.type === 'warning' ? <AlertTriangle size={14} color={SEVERITY.warning.color} /> :
            toast.type === 'info' ? <Info size={14} color={SEVERITY.info.color} /> :
                <Check size={14} color={SEVERITY.resolved.color} />}
        {toast.msg}
      </div>
  );

  // ─── MAIN RENDER ───────────────────────────────────────────────
  return (
      <div style={css.wrap}>
        <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.7);opacity:0} }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        select option { background: #111827; color: #fff; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Terminal size={16} color="#818cf8" />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.06em' }}>VIGIL</span>
              <span style={{ fontSize: 9, color: '#4b5563', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, padding: '2px 6px', letterSpacing: '0.1em' }}>v2.0</span>
              {maintenanceMode && (
                  <span style={{ fontSize: 9, background: 'rgba(255,170,0,0.1)', border: `1px solid ${SEVERITY.warning.color}40`, color: SEVERITY.warning.color, borderRadius: 3, padding: '2px 8px', letterSpacing: '0.1em', fontWeight: 700 }}>
                MAINTENANCE WINDOW
              </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#4b5563' }}>
              <PulseDot color={SEVERITY.resolved.color} size={6} />
              <span style={{ marginLeft: 6 }}>Connected · Last sync {formatAge(Date.now() - 8000)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setSoundEnabled(s => !s)} title={soundEnabled ? 'Mute alerts' : 'Enable sounds'} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, color: '#4b5563', cursor: 'pointer', padding: '6px 8px' }}>
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
            <button style={css.btn('ghost')}><RefreshCw size={12} /> Refresh</button>
          </div>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Live Metrics */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            ▸ Live Metrics
          </div>
          {renderLiveMetrics()}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 18 }}>
          <button onClick={() => setActiveTab('active')} style={css.tab(activeTab === 'active')}>
            <Bell size={12} /> ACTIVE
            {stats.unacked > 0 && <span style={{ background: SEVERITY.critical.color, color: '#fff', borderRadius: 3, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>{stats.unacked}</span>}
          </button>
          <button onClick={() => setActiveTab('config')} style={css.tab(activeTab === 'config')}>
            <SlidersHorizontal size={12} /> CONFIG
          </button>
          <button onClick={() => setActiveTab('history')} style={css.tab(activeTab === 'history')}>
            <History size={12} /> HISTORY
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeSlide 0.2s ease' }} key={activeTab}>
          {activeTab === 'active'  && renderActive()}
          {activeTab === 'config'  && renderConfig()}
          {activeTab === 'history' && renderHistory()}
        </div>

        {showCreateModal && renderModal()}
        {renderToast()}
      </div>
  );
};

const AlertsComponent = VIGILDashboard;
export default AlertsComponent;