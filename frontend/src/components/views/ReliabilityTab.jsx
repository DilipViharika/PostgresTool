// ==========================================================================
//  VIGIL — ReliabilityTab  (v4 — Auto-Refresh)
// ==========================================================================
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard, EmptyState } from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';
import FeedbackModal from './FeedbackModal.jsx';
import {
    AlertTriangle, AlertCircle, CheckCircle, Bell, BellOff, BellRing,
    Shield, ShieldCheck, ShieldAlert, ShieldX,
    Clock, Timer, TrendingUp, TrendingDown, Activity,
    Eye, EyeOff, ChevronRight, ChevronDown, ChevronUp,
    RefreshCw, Search, Filter, X, MoreHorizontal,
    Zap, Server, Database, HardDrive, Cpu, Network,
    ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight,
    Calendar, BarChart3, Radio, History, Settings,
    CheckCheck, XCircle, Info, Flame, Gauge, Wifi, WifiOff
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const RelStyles = () => (
    <style>{`
        @keyframes relFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes relPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.35; }
        }
        @keyframes relPulseRing {
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes relBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes relFlash {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
        }
        @keyframes relSlideDown {
            from { opacity: 0; max-height: 0; }
            to   { opacity: 1; max-height: 500px; }
        }
        @keyframes relSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes relCountdown {
            from { width: 100%; }
            to   { width: 0%; }
        }
        @keyframes relFlashBg {
            0%   { background: transparent; }
            30%  { background: ${THEME.primary}10; }
            100% { background: transparent; }
        }
        .rel-stagger > * { animation: relFadeIn 0.4s ease-out both; }
        .rel-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .rel-stagger > *:nth-child(2) { animation-delay: 0.05s; }
        .rel-stagger > *:nth-child(3) { animation-delay: 0.10s; }
        .rel-stagger > *:nth-child(4) { animation-delay: 0.15s; }
        .rel-stagger > *:nth-child(5) { animation-delay: 0.20s; }
        .rel-stagger > *:nth-child(6) { animation-delay: 0.25s; }
        .rel-stagger > *:nth-child(7) { animation-delay: 0.30s; }
        .rel-stagger > *:nth-child(8) { animation-delay: 0.35s; }
        .rel-row-hover { transition: background 0.15s; }
        .rel-row-hover:hover { background: ${THEME.primary}06 !important; }
        .rel-bar-animate { transform-origin: left; animation: relBarGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .rel-scrollbar::-webkit-scrollbar { width: 4px; }
        .rel-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .rel-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 2px; }
        .rel-refresh-spin { animation: relSpin 0.8s linear infinite; }
        .rel-metric-flash { animation: relFlashBg 1s ease-out; }
    `}</style>
);

/* ── Refresh interval options ── */
const REFRESH_INTERVALS = [
    { label: '10s',  value: 10 },
    { label: '30s',  value: 30 },
    { label: '1m',   value: 60 },
    { label: '5m',   value: 300 },
    { label: 'Off',  value: 0 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL — manual glass card
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, refreshing }) => (
    <div style={{
        background: THEME.glass,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s',
        ...(refreshing ? { borderColor: `${THEME.primary}40` } : {}),
        ...style,
    }}>
        {title && (
            <div style={{
                padding: '13px 20px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, minHeight: 46,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && <TIcon size={13} color={refreshing ? THEME.primary : THEME.textDim} style={{ transition: 'color 0.3s' }} />}
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
                    {refreshing && (
                        <span style={{ fontSize: 9, color: THEME.primary, fontWeight: 700, animation: 'relPulse 1s ease-in-out infinite' }}>UPDATING</span>
                    )}
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 20px', position: 'relative' }}>
            {children}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const StatusBadge = ({ label, color, pulse }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
        background: `${color}12`, color, border: `1px solid ${color}20`,
        lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: '50%', background: color,
            boxShadow: `0 0 4px ${color}60`, flexShrink: 0,
            animation: pulse ? 'relFlash 1.5s ease-in-out infinite' : 'none',
        }} />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}50`, animation: 'relPulseRing 2s ease-out infinite' }} />
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color }} />
                    <span style={{ color: THEME.textMuted, flex: 1 }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: p.color, fontVariantNumeric: 'tabular-nums' }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Severity helpers ── */
const SEV = {
    critical: { color: THEME.danger, icon: Flame, label: 'Critical', bg: `${THEME.danger}08`, border: `${THEME.danger}25` },
    warning:  { color: THEME.warning, icon: AlertTriangle, label: 'Warning', bg: `${THEME.warning}06`, border: `${THEME.warning}20` },
    info:     { color: THEME.info, icon: Info, label: 'Info', bg: `${THEME.info}05`, border: `${THEME.info}15` },
};
const getSev = (s) => SEV[s] || SEV.info;

const CATEGORY_ICONS = {
    cpu: Cpu, memory: Server, disk: HardDrive, connection: Network,
    replication: RefreshCw, query: Database, lock: ShieldAlert, vacuum: Activity,
};

const fmtTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const fmtLastRefreshed = (ts) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
};

/* ── Synthetic data ── */
const genAlertTrend = () => {
    const hrs = [];
    for (let i = 23; i >= 0; i--) {
        hrs.push({
            h: `${String(23 - i).padStart(2, '0')}:00`,
            critical: Math.round(Math.random() * 3),
            warning: Math.round(Math.random() * 6 + 1),
            info: Math.round(Math.random() * 8 + 2),
        });
    }
    return hrs;
};

const genUptimeDays = () => {
    const days = [];
    const now = Date.now();
    for (let i = 89; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const r = Math.random();
        days.push({
            date: d.toISOString().split('T')[0],
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            status: r < 0.02 ? 'outage' : r < 0.07 ? 'degraded' : 'up',
            uptime: r < 0.02 ? 95 + Math.random() * 3 : r < 0.07 ? 99 + Math.random() * 0.8 : 99.9 + Math.random() * 0.1,
        });
    }
    return days;
};

const MOCK_ALERTS = [
    { id: 1, severity: 'critical', category: 'connection', title: 'Connection pool exhausted', message: 'Active connections reached 98/100 max limit. New connections are being rejected.', created_at: new Date(Date.now() - 180000).toISOString(), acknowledged: false, source: 'pg_stat_activity', metric_value: '98/100', threshold: '> 90' },
    { id: 2, severity: 'critical', category: 'replication', title: 'Replication lag exceeding threshold', message: 'Replica lag is 45MB behind primary, exceeding 10MB threshold.', created_at: new Date(Date.now() - 600000).toISOString(), acknowledged: false, source: 'pg_stat_replication', metric_value: '45 MB', threshold: '> 10 MB' },
    { id: 3, severity: 'warning', category: 'disk', title: 'Disk usage above 80%', message: 'Storage volume /pgdata is at 84% capacity. Consider expanding or cleaning up.', created_at: new Date(Date.now() - 1800000).toISOString(), acknowledged: false, source: 'system_monitor', metric_value: '84%', threshold: '> 80%' },
    { id: 4, severity: 'warning', category: 'vacuum', title: 'Autovacuum long-running on audit_events', message: 'Autovacuum has been running for 47 minutes on audit_events (12.8M dead tuples).', created_at: new Date(Date.now() - 2820000).toISOString(), acknowledged: true, source: 'pg_stat_activity', metric_value: '47m', threshold: '> 30m' },
    { id: 5, severity: 'warning', category: 'query', title: 'Slow query spike detected', message: 'Average query time jumped from 12ms to 340ms in the last 5 minutes.', created_at: new Date(Date.now() - 3600000).toISOString(), acknowledged: false, source: 'pg_stat_statements', metric_value: '340ms avg', threshold: '> 100ms' },
    { id: 6, severity: 'warning', category: 'lock', title: 'Lock contention on user_sessions', message: '14 transactions waiting for locks on user_sessions table. Possible deadlock risk.', created_at: new Date(Date.now() - 5400000).toISOString(), acknowledged: true, source: 'pg_locks', metric_value: '14 waiting', threshold: '> 10' },
    { id: 7, severity: 'info', category: 'cpu', title: 'CPU usage elevated', message: 'System CPU at 72% — elevated but within acceptable range during peak hours.', created_at: new Date(Date.now() - 7200000).toISOString(), acknowledged: true, source: 'system_monitor', metric_value: '72%', threshold: '> 70%' },
    { id: 8, severity: 'info', category: 'memory', title: 'Shared buffers cache miss rate increased', message: 'Cache hit ratio dropped to 97.2% from 99.8% in the last hour.', created_at: new Date(Date.now() - 10800000).toISOString(), acknowledged: true, source: 'pg_stat_bgwriter', metric_value: '97.2%', threshold: '< 98%' },
    { id: 9, severity: 'info', category: 'connection', title: 'New connection burst detected', message: '23 new connections opened within 10 seconds from app-server-03.', created_at: new Date(Date.now() - 14400000).toISOString(), acknowledged: true, source: 'pg_stat_activity', metric_value: '23 conns', threshold: '> 15/10s' },
];

const MOCK_INCIDENTS = [
    { id: 'INC-001', title: 'Database failover triggered', severity: 'critical', started: '2026-02-07T14:23:00Z', resolved: '2026-02-07T14:41:00Z', duration: '18m', impact: 'Full service interruption — writes unavailable for 18 minutes', root_cause: 'Primary node OOM kill due to runaway analytical query' },
    { id: 'INC-002', title: 'Replication lag spike', severity: 'warning', started: '2026-02-05T08:10:00Z', resolved: '2026-02-05T08:34:00Z', duration: '24m', impact: 'Read replicas serving stale data — API latency +200ms', root_cause: 'VACUUM FULL on 14GB table blocking WAL sender' },
    { id: 'INC-003', title: 'Connection pool saturation', severity: 'critical', started: '2026-02-01T22:05:00Z', resolved: '2026-02-01T22:18:00Z', duration: '13m', impact: 'New connections rejected — 503 errors for 13 minutes', root_cause: 'Leaked connections from microservice deployment v2.4.1' },
    { id: 'INC-004', title: 'High lock contention', severity: 'warning', started: '2026-01-28T11:30:00Z', resolved: '2026-01-28T11:42:00Z', duration: '12m', impact: 'Write latency +5x on orders table', root_cause: 'Concurrent schema migration and bulk insert conflict' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTDOWN BAR — shows time until next auto-refresh
   ═══════════════════════════════════════════════════════════════════════════ */
const CountdownBar = ({ intervalSec, lastRefreshed }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!intervalSec || !lastRefreshed) {
            setProgress(100);
            return;
        }
        const tick = () => {
            const elapsed = (Date.now() - lastRefreshed) / 1000;
            const pct = Math.max(0, 100 - (elapsed / intervalSec) * 100);
            setProgress(pct);
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [intervalSec, lastRefreshed]);

    if (!intervalSec) return null;

    return (
        <div style={{ height: 2, background: `${THEME.primary}18`, borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`,
                borderRadius: 1,
                transition: 'width 0.25s linear',
            }} />
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   REFRESH STATUS BAR — top-level info strip
   ═══════════════════════════════════════════════════════════════════════════ */
const RefreshBar = ({ lastRefreshed, isRefreshing, intervalSec, onIntervalChange, onRefresh, error }) => {
    const [tick, setTick] = useState(0);

    // Re-render every second so "last refreshed X ago" stays live
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 16px',
            borderRadius: 10,
            background: THEME.glass,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${error ? `${THEME.danger}30` : THEME.glassBorder}`,
            fontSize: 11,
            flexWrap: 'wrap',
            gap: 8,
        }}>
            {/* Connection indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {error
                    ? <WifiOff size={11} color={THEME.danger} />
                    : <Wifi size={11} color={THEME.success} />
                }
                <span style={{ color: error ? THEME.danger : THEME.success, fontWeight: 600 }}>
                    {error ? 'Connection error' : 'Connected'}
                </span>
            </div>

            <div style={{ width: 1, height: 12, background: THEME.grid, flexShrink: 0 }} />

            {/* Last refreshed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: THEME.textDim }}>
                <Clock size={10} />
                <span>Last updated: <strong style={{ color: THEME.textMuted }}>{fmtLastRefreshed(lastRefreshed)}</strong></span>
            </div>

            {/* Interval picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: THEME.textDim }}>Auto-refresh:</span>
                <div style={{ display: 'flex', gap: 3 }}>
                    {REFRESH_INTERVALS.map(opt => {
                        const active = intervalSec === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => onIntervalChange(opt.value)}
                                style={{
                                    padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                    fontSize: 10, fontWeight: 700,
                                    transition: 'all 0.15s',
                                    background: active ? `${THEME.primary}20` : 'transparent',
                                    color: active ? THEME.primary : THEME.textDim,
                                    outline: active ? `1px solid ${THEME.primary}30` : 'none',
                                }}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Manual refresh button */}
            <button
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 7, border: 'none', cursor: isRefreshing ? 'default' : 'pointer',
                    fontWeight: 700, fontSize: 11,
                    background: isRefreshing ? `${THEME.primary}10` : `${THEME.primary}18`,
                    color: THEME.primary,
                    transition: 'all 0.15s',
                    opacity: isRefreshing ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!isRefreshing) e.currentTarget.style.background = `${THEME.primary}28`; }}
                onMouseLeave={e => { e.currentTarget.style.background = isRefreshing ? `${THEME.primary}10` : `${THEME.primary}18`; }}
            >
                <RefreshCw size={11} className={isRefreshing ? 'rel-refresh-spin' : ''} style={{ transition: 'none' }} />
                {isRefreshing ? 'Refreshing…' : 'Refresh Now'}
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ALERT CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const AlertCard = ({ alert, onAcknowledge, expanded, onToggle, isNew }) => {
    const sev = getSev(alert.severity);
    const CatIcon = CATEGORY_ICONS[alert.category] || AlertCircle;
    const isCritical = alert.severity === 'critical';

    return (
        <div
            className={isNew ? 'rel-metric-flash' : ''}
            style={{
                borderRadius: 12, overflow: 'hidden',
                background: alert.acknowledged ? THEME.surface : sev.bg,
                border: `1px solid ${alert.acknowledged ? `${THEME.grid}60` : sev.border}`,
                transition: 'all 0.2s',
                opacity: alert.acknowledged ? 0.65 : 1,
            }}
        >
            {/* Main row */}
            <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${sev.color}12`, border: `1px solid ${sev.color}20`,
                }}>
                    <sev.icon size={16} color={sev.color} style={{ animation: isCritical && !alert.acknowledged ? 'relFlash 1.5s ease-in-out infinite' : 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</span>
                        {isNew && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${THEME.primary}18`, color: THEME.primary, border: `1px solid ${THEME.primary}20` }}>NEW</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <StatusBadge label={sev.label} color={sev.color} pulse={isCritical && !alert.acknowledged} />
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: THEME.textDim }}>
                            <CatIcon size={10} /> {alert.category}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: THEME.textDim }}>
                            <Clock size={10} /> {fmtTime(alert.created_at)}
                        </span>
                        {alert.acknowledged && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: THEME.success }}>
                                <CheckCheck size={10} /> Acknowledged
                            </span>
                        )}
                    </div>
                </div>
                {alert.metric_value && (
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: sev.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{alert.metric_value}</div>
                        {alert.threshold && <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 3 }}>threshold {alert.threshold}</div>}
                    </div>
                )}
                <ChevronDown size={14} color={THEME.textDim} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
            </div>
            {expanded && (
                <div style={{ padding: '0 18px 16px 68px', animation: 'relFadeIn 0.2s ease', borderTop: `1px solid ${THEME.grid}30`, marginTop: -1 }}>
                    <p style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6, margin: '12px 0' }}>{alert.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {alert.source && (
                            <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 5, background: `${THEME.primary}0a`, border: `1px solid ${THEME.primary}12`, color: THEME.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                                {alert.source}
                            </span>
                        )}
                        {!alert.acknowledged && (
                            <button onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }} style={{
                                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                fontSize: 11, fontWeight: 700,
                                background: `${THEME.success}15`, color: THEME.success,
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                transition: 'all 0.15s',
                            }}
                                    onMouseEnter={e => e.currentTarget.style.background = `${THEME.success}25`}
                                    onMouseLeave={e => e.currentTarget.style.background = `${THEME.success}15`}
                            >
                                <CheckCheck size={12} /> Acknowledge
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   UPTIME HEATMAP — 90 days
   ═══════════════════════════════════════════════════════════════════════════ */
const UptimeHeatmap = ({ days }) => {
    const [hoveredDay, setHoveredDay] = useState(null);
    const statusColor = (s) => s === 'outage' ? THEME.danger : s === 'degraded' ? THEME.warning : THEME.success;
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    return (
        <div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {week.map((day, di) => (
                            <div key={di}
                                 onMouseEnter={() => setHoveredDay(day)}
                                 onMouseLeave={() => setHoveredDay(null)}
                                 style={{
                                     width: 12, height: 12, borderRadius: 2, background: statusColor(day.status),
                                     opacity: day.status === 'up' ? 0.6 : 0.9, cursor: 'pointer', transition: 'all 0.15s',
                                     boxShadow: hoveredDay?.date === day.date ? `0 0 6px ${statusColor(day.status)}60` : 'none',
                                     transform: hoveredDay?.date === day.date ? 'scale(1.3)' : 'scale(1)',
                                 }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {hoveredDay && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 8,
                    background: THEME.surface, border: `1px solid ${THEME.grid}60`, fontSize: 11,
                }}>
                    <span style={{ color: THEME.textDim }}>{hoveredDay.date}</span>
                    <StatusBadge label={hoveredDay.status === 'up' ? 'Operational' : hoveredDay.status === 'degraded' ? 'Degraded' : 'Outage'} color={statusColor(hoveredDay.status)} />
                    <span style={{ fontWeight: 700, color: THEME.textMain, fontVariantNumeric: 'tabular-nums' }}>{hoveredDay.uptime.toFixed(2)}%</span>
                </div>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 10, color: THEME.textDim, marginTop: hoveredDay ? 8 : 0 }}>
                {[{ l: 'Operational', c: THEME.success }, { l: 'Degraded', c: THEME.warning }, { l: 'Outage', c: THEME.danger }].map(x => (
                    <span key={x.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: x.c, opacity: 0.7 }} /> {x.l}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ReliabilityTab = () => {
    const [alerts, setAlerts]           = useState([]);
    const [uptimeDays, setUptimeDays]   = useState(() => genUptimeDays());
    const [alertTrend, setAlertTrend]   = useState(() => genAlertTrend());
    const [incidents, setIncidents]     = useState(MOCK_INCIDENTS);

    // Refresh state
    const [loading, setLoading]         = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds; 0 = off
    const [refreshError, setRefreshError] = useState(false);
    const [newAlertIds, setNewAlertIds] = useState(new Set());

    // Track which sections are currently refreshing for per-panel indicators
    const [refreshingPanels, setRefreshingPanels] = useState(new Set());

    // UI state
    const [activeTab, setActiveTab]     = useState('alerts');
    const [filter, setFilter]           = useState('all');
    const [showAcked, setShowAcked]     = useState(true);
    const [expandedId, setExpandedId]   = useState(null);
    const [sortBy, setSortBy]           = useState('time');

    const intervalRef = useRef(null);
    const prevAlertIdsRef = useRef(new Set());

    /* ── Core fetch function ── */
    const fetchAll = useCallback(async (isInitial = false) => {
        if (!isInitial) setIsRefreshing(true);

        // Mark all panels as refreshing
        setRefreshingPanels(new Set(['alerts', 'trend', 'severity', 'uptime', 'incidents', 'sla']));

        try {
            // --- Alerts ---
            const alertData = await fetchData('/api/alerts').catch(() => null);
            const nextAlerts = (alertData && alertData.length > 0) ? alertData : MOCK_ALERTS;

            // Detect newly arrived alert IDs
            const prevIds = prevAlertIdsRef.current;
            const arrivedIds = new Set(nextAlerts.map(a => a.id).filter(id => !prevIds.has(id)));
            if (arrivedIds.size > 0) {
                setNewAlertIds(arrivedIds);
                setTimeout(() => setNewAlertIds(new Set()), 4000); // clear "NEW" badge after 4s
            }
            prevAlertIdsRef.current = new Set(nextAlerts.map(a => a.id));
            setAlerts(nextAlerts);
            setRefreshingPanels(p => { const n = new Set(p); n.delete('alerts'); n.delete('trend'); n.delete('severity'); return n; });

            // --- Uptime data ---
            const uptimeData = await fetchData('/api/uptime').catch(() => null);
            setUptimeDays(uptimeData && uptimeData.length > 0 ? uptimeData : genUptimeDays());
            setRefreshingPanels(p => { const n = new Set(p); n.delete('uptime'); n.delete('sla'); return n; });

            // --- Incidents ---
            const incidentData = await fetchData('/api/incidents').catch(() => null);
            setIncidents(incidentData && incidentData.length > 0 ? incidentData : MOCK_INCIDENTS);
            setRefreshingPanels(p => { const n = new Set(p); n.delete('incidents'); return n; });

            // --- Alert trend (chart) ---
            const trendData = await fetchData('/api/alerts/trend').catch(() => null);
            if (trendData && trendData.length > 0) setAlertTrend(trendData);
            else setAlertTrend(genAlertTrend()); // regenerate for demo

            setRefreshError(false);
        } catch (err) {
            setRefreshError(true);
        } finally {
            setRefreshingPanels(new Set());
            setLastRefreshed(Date.now());
            setIsRefreshing(false);
            if (isInitial) setLoading(false);
        }
    }, []);

    /* ── Initial load ── */
    useEffect(() => {
        fetchAll(true);
    }, [fetchAll]);

    /* ── Auto-refresh interval ── */
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (refreshInterval > 0) {
            intervalRef.current = setInterval(() => fetchAll(false), refreshInterval * 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [refreshInterval, fetchAll]);

    const handleManualRefresh = useCallback(() => {
        if (!isRefreshing) fetchAll(false);
    }, [isRefreshing, fetchAll]);

    const handleIntervalChange = useCallback((val) => {
        setRefreshInterval(val);
    }, []);

    const handleAcknowledge = useCallback((id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    }, []);

    const handleAcknowledgeAll = useCallback(() => {
        setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    }, []);

    /* ── Filter / sort ── */
    const processedAlerts = useMemo(() => {
        let list = [...alerts];
        if (filter !== 'all') list = list.filter(a => a.severity === filter);
        if (!showAcked) list = list.filter(a => !a.acknowledged);
        if (sortBy === 'severity') {
            const order = { critical: 0, warning: 1, info: 2 };
            list.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));
        } else {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return list;
    }, [alerts, filter, showAcked, sortBy]);

    /* ── Counts ── */
    const counts = useMemo(() => ({
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
        warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
        info: alerts.filter(a => a.severity === 'info' && !a.acknowledged).length,
        active: alerts.filter(a => !a.acknowledged).length,
        acknowledged: alerts.filter(a => a.acknowledged).length,
    }), [alerts]);

    /* ── Uptime stats ── */
    const uptimeStats = useMemo(() => {
        const avg = uptimeDays.reduce((s, d) => s + d.uptime, 0) / uptimeDays.length;
        const outages = uptimeDays.filter(d => d.status === 'outage').length;
        const degraded = uptimeDays.filter(d => d.status === 'degraded').length;
        return { avg, outages, degraded };
    }, [uptimeDays]);

    /* ── Tab button ── */
    const TabBtn = ({ id, label, icon: Icon, count }) => {
        const active = activeTab === id;
        return (
            <button onClick={() => setActiveTab(id)} style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer', border: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontWeight: 600, fontSize: 12.5, lineHeight: 1,
                transition: 'all 0.25s', whiteSpace: 'nowrap',
                background: active ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` : THEME.surface,
                color: active ? '#fff' : THEME.textMuted,
                boxShadow: active ? `0 4px 16px ${THEME.primary}35` : 'none',
                outline: active ? 'none' : `1px solid ${THEME.grid}60`,
            }}>
                <Icon size={13} style={{ flexShrink: 0 }} />
                {label}
                {count != null && count > 0 && (
                    <span style={{
                        fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 10,
                        background: active ? 'rgba(255,255,255,0.2)' : `${THEME.danger}20`,
                        color: active ? '#fff' : THEME.danger, fontVariantNumeric: 'tabular-nums',
                    }}>{count}</span>
                )}
            </button>
        );
    };

    /* ── Filter pill ── */
    const FilterPill = ({ id, label, color, count }) => {
        const active = filter === id;
        return (
            <button onClick={() => setFilter(id)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                background: active ? `${color}18` : 'transparent',
                color: active ? color : THEME.textDim,
                display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
                {label}
                {count > 0 && <span style={{ fontSize: 9, fontWeight: 800, fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>{count}</span>}
            </button>
        );
    };

    /* ────────────────────── LOADING ────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px' }}>
                <RelStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ height: 96, borderRadius: 14, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.4, animation: 'relPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
                    ))}
                </div>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{ height: 80, borderRadius: 12, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.25, animation: 'relPulse 1.5s ease-in-out infinite', animationDelay: `${0.5 + i * 0.1}s` }} />
                ))}
            </div>
        );
    }

    /* ── Metric cards ── */
    const metricCards = [
        { label: 'Active Alerts', value: String(counts.active), sub: `${counts.total} total`, color: counts.critical > 0 ? THEME.danger : THEME.success, icon: counts.critical > 0 ? BellRing : CheckCircle },
        { label: 'Critical', value: String(counts.critical), sub: counts.critical > 0 ? 'Immediate attention' : 'All clear', color: counts.critical > 0 ? THEME.danger : THEME.success, icon: Flame },
        { label: 'Uptime (90d)', value: `${uptimeStats.avg.toFixed(2)}%`, sub: `${uptimeStats.outages} outages`, color: uptimeStats.avg > 99.9 ? THEME.success : uptimeStats.avg > 99 ? THEME.warning : THEME.danger, icon: Shield },
        { label: 'MTTR', value: '16m', sub: 'avg resolution', color: THEME.primary, icon: Timer },
    ];

    /* ═══════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px 24px' }}>
            <RelStyles />

            {/* ── Refresh status bar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <RefreshBar
                    lastRefreshed={lastRefreshed}
                    isRefreshing={isRefreshing}
                    intervalSec={refreshInterval}
                    onIntervalChange={handleIntervalChange}
                    onRefresh={handleManualRefresh}
                    error={refreshError}
                />
                <CountdownBar intervalSec={refreshInterval} lastRefreshed={lastRefreshed} />
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <TabBtn id="alerts" label="Alert Feed" icon={Bell} count={counts.active} />
                    <TabBtn id="uptime" label="Uptime & SLA" icon={Shield} />
                    <TabBtn id="incidents" label="Incidents" icon={History} count={incidents.length} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: THEME.textDim }}>
                    <LiveDot color={counts.critical > 0 ? THEME.danger : THEME.success} size={6} />
                    <span>{counts.critical > 0 ? `${counts.critical} critical` : 'All clear'}</span>
                </div>
            </div>

            {/* ── Metric strip ── */}
            <div className="rel-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {metricCards.map((m, i) => (
                    <div key={i}
                         className={isRefreshing ? 'rel-metric-flash' : ''}
                         style={{
                             display: 'flex', alignItems: 'center', gap: 14,
                             padding: '15px 18px', borderRadius: 14,
                             background: THEME.glass, backdropFilter: 'blur(12px)',
                             border: `1px solid ${isRefreshing ? `${THEME.primary}25` : THEME.glassBorder}`,
                             transition: 'border-color 0.3s',
                             animationDelay: `${i * 0.05}s`,
                         }}
                    >
                        <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${m.color}10`, border: `1px solid ${m.color}18`,
                        }}>
                            <m.icon size={18} color={m.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>{m.value}</div>
                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3, lineHeight: 1 }}>{m.sub}</div>
                        </div>
                    </div>
                ))}
            </div>


            {/* ════════════════════════════════════════════════════════════
                ALERTS VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'alerts' && (
                <div className="rel-stagger" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>

                    {/* ── Alert feed ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FilterPill id="all" label="All" color={THEME.primary} count={counts.total} />
                                <FilterPill id="critical" label="Critical" color={THEME.danger} count={counts.critical} />
                                <FilterPill id="warning" label="Warning" color={THEME.warning} count={counts.warning} />
                                <FilterPill id="info" label="Info" color={THEME.info} count={counts.info} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => setShowAcked(!showAcked)} style={{
                                    padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                    fontSize: 10, fontWeight: 600,
                                    background: showAcked ? `${THEME.textDim}15` : 'transparent',
                                    color: THEME.textDim, display: 'inline-flex', alignItems: 'center', gap: 4,
                                    transition: 'all 0.15s',
                                }}>
                                    {showAcked ? <Eye size={10} /> : <EyeOff size={10} />} Ack'd
                                </button>
                                <button onClick={() => setSortBy(s => s === 'time' ? 'severity' : 'time')} style={{
                                    padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                    fontSize: 10, fontWeight: 600, color: THEME.textDim,
                                    background: `${THEME.textDim}10`,
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    transition: 'all 0.15s',
                                }}>
                                    <ArrowDown size={10} /> {sortBy === 'time' ? 'Time' : 'Severity'}
                                </button>
                                {counts.active > 0 && (
                                    <button onClick={handleAcknowledgeAll} style={{
                                        padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                        fontSize: 10, fontWeight: 700, color: THEME.success,
                                        background: `${THEME.success}10`,
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                    }}>
                                        <CheckCheck size={10} /> Ack All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Alert list */}
                        <div className="rel-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                            {processedAlerts.length === 0 ? (
                                <Panel style={{ minHeight: 200 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${THEME.success}08`, border: `1px solid ${THEME.success}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CheckCircle size={22} color={THEME.success} style={{ opacity: 0.6 }} />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>No alerts matching filters</div>
                                            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>Adjust your filters or check back later.</div>
                                        </div>
                                    </div>
                                </Panel>
                            ) : (
                                processedAlerts.map(alert => (
                                    <AlertCard
                                        key={alert.id}
                                        alert={alert}
                                        onAcknowledge={handleAcknowledge}
                                        expanded={expandedId === alert.id}
                                        onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                                        isNew={newAlertIds.has(alert.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Alert trend chart */}
                        <Panel title="Alert Trend (24h)" icon={BarChart3} refreshing={refreshingPanels.has('trend')}
                               rightNode={
                                   <div style={{ display: 'flex', gap: 10, fontSize: 10, color: THEME.textDim }}>
                                       {[{ l: 'Critical', c: THEME.danger }, { l: 'Warning', c: THEME.warning }, { l: 'Info', c: THEME.info }].map(x => (
                                           <span key={x.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 8, height: 3, borderRadius: 1, background: x.c }} /> {x.l}
                                        </span>
                                       ))}
                                   </div>
                               }
                        >
                            <div style={{ height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={alertTrend} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="relGC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.danger} stopOpacity={0.3} /><stop offset="100%" stopColor={THEME.danger} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="relGW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.warning} stopOpacity={0.2} /><stop offset="100%" stopColor={THEME.warning} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="relGI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.info} stopOpacity={0.15} /><stop offset="100%" stopColor={THEME.info} stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="h" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={3} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} width={28} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="critical" name="Critical" stroke={THEME.danger} strokeWidth={1.5} fill="url(#relGC)" />
                                        <Area type="monotone" dataKey="warning" name="Warning" stroke={THEME.warning} strokeWidth={1.5} fill="url(#relGW)" />
                                        <Area type="monotone" dataKey="info" name="Info" stroke={THEME.info} strokeWidth={1} fill="url(#relGI)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>

                        {/* Severity breakdown */}
                        <Panel title="Severity Distribution" icon={BarChart3} refreshing={refreshingPanels.has('severity')}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, active: counts.critical, color: THEME.danger },
                                    { label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length, active: counts.warning, color: THEME.warning },
                                    { label: 'Info', count: alerts.filter(a => a.severity === 'info').length, active: counts.info, color: THEME.info },
                                ].map((s, i) => {
                                    const maxCount = Math.max(counts.critical, counts.warning, counts.info,
                                        alerts.filter(a => a.severity === 'critical').length,
                                        alerts.filter(a => a.severity === 'warning').length,
                                        alerts.filter(a => a.severity === 'info').length, 1);
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>{s.label}</span>
                                                <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                                                    <span style={{ color: s.color, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{s.active} active</span>
                                                    <span style={{ color: THEME.textDim }}>{s.count} total</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 3, overflow: 'hidden', background: `${THEME.grid}40` }}>
                                                <div className="rel-bar-animate" style={{ width: `${(s.active / maxCount) * 100}%`, background: s.color, borderRadius: 3, animationDelay: `${i * 0.1}s` }} />
                                                <div className="rel-bar-animate" style={{ width: `${((s.count - s.active) / maxCount) * 100}%`, background: `${s.color}30`, borderRadius: 3, animationDelay: `${i * 0.1 + 0.1}s` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>

                        {/* Response targets */}
                        <Panel title="Response Targets" icon={Timer}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { sev: 'Critical', target: '5m', actual: '3m', met: true, color: THEME.danger },
                                    { sev: 'Warning', target: '30m', actual: '22m', met: true, color: THEME.warning },
                                    { sev: 'Info', target: '4h', actual: '1.5h', met: true, color: THEME.info },
                                ].map((r, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: 8, background: THEME.surface,
                                        border: `1px solid ${THEME.grid}40`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>{r.sev}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>target: <strong style={{ color: THEME.textMuted }}>{r.target}</strong></span>
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>actual: <strong style={{ color: r.met ? THEME.success : THEME.danger }}>{r.actual}</strong></span>
                                            {r.met ? <CheckCircle size={12} color={THEME.success} /> : <XCircle size={12} color={THEME.danger} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>
            )}


            {/* ════════════════════════════════════════════════════════════
                UPTIME & SLA VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'uptime' && (
                <div className="rel-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        {[
                            { label: '30-Day Uptime', value: `${(uptimeDays.slice(-30).reduce((s, d) => s + d.uptime, 0) / 30).toFixed(3)}%`, target: '99.95%', icon: Shield, color: THEME.success },
                            { label: '90-Day Uptime', value: `${uptimeStats.avg.toFixed(3)}%`, target: '99.90%', icon: ShieldCheck, color: THEME.primary },
                            { label: 'Error Budget', value: '63%', target: 'remaining this month', icon: Gauge, color: THEME.warning },
                        ].map((s, i) => (
                            <Panel key={i} refreshing={refreshingPanels.has('sla')}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}10`, border: `1px solid ${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <s.icon size={22} color={s.color} />
                                    </div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>target: {s.target}</div>
                                </div>
                            </Panel>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
                        <Panel title="90-Day Uptime Heatmap" icon={Calendar} refreshing={refreshingPanels.has('uptime')}>
                            <UptimeHeatmap days={uptimeDays} />
                        </Panel>

                        <Panel title="Downtime Events" icon={XCircle} noPad refreshing={refreshingPanels.has('uptime')}>
                            {(() => {
                                const downtimeDays = uptimeDays.filter(d => d.status !== 'up');
                                if (downtimeDays.length === 0) {
                                    return (
                                        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <CheckCircle size={28} color={THEME.success} style={{ opacity: 0.5, marginBottom: 8 }} />
                                                <div style={{ fontSize: 12, color: THEME.textMuted }}>No downtime recorded</div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="rel-scrollbar" style={{ maxHeight: 280, overflowY: 'auto' }}>
                                        {downtimeDays.map((d, i) => {
                                            const c = d.status === 'outage' ? THEME.danger : THEME.warning;
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${THEME.grid}25` }}>
                                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 4px ${c}60`, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 11, color: THEME.textDim, fontVariantNumeric: 'tabular-nums', width: 70, flexShrink: 0 }}>{d.date}</span>
                                                    <StatusBadge label={d.status === 'outage' ? 'Outage' : 'Degraded'} color={c} />
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>{d.uptime.toFixed(2)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </Panel>
                    </div>
                </div>
            )}


            {/* ════════════════════════════════════════════════════════════
                INCIDENTS VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'incidents' && (
                <div className="rel-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
                        borderRadius: 12, background: THEME.glass, overflow: 'hidden',
                        backdropFilter: 'blur(12px)', border: `1px solid ${refreshingPanels.has('incidents') ? `${THEME.primary}30` : THEME.glassBorder}`,
                        transition: 'border-color 0.3s',
                    }}>
                        {[
                            { label: 'Total Incidents', value: String(incidents.length), color: THEME.primary, icon: AlertCircle },
                            { label: 'Critical', value: String(incidents.filter(i => i.severity === 'critical').length), color: THEME.danger, icon: Flame },
                            { label: 'Avg Duration', value: '16.8m', color: THEME.warning, icon: Timer },
                            { label: 'Resolved', value: String(incidents.length), color: THEME.success, icon: CheckCircle },
                        ].map((s, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
                                borderRight: i < 3 ? `1px solid ${THEME.glassBorder}` : 'none',
                            }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}10` }}>
                                    <s.icon size={13} color={s.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 3 }}>{s.label}</div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {incidents.map((inc, i) => {
                            const sev = getSev(inc.severity);
                            return (
                                <div key={inc.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: sev.color, border: `2px solid ${THEME.bg}`, boxShadow: `0 0 6px ${sev.color}40`, flexShrink: 0, zIndex: 1 }} />
                                        {i < incidents.length - 1 && <div style={{ width: 2, flex: 1, background: `${THEME.grid}80`, minHeight: 20 }} />}
                                    </div>
                                    <div style={{ flex: 1, marginBottom: 16, padding: '16px 20px', borderRadius: 12, background: THEME.glass, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: THEME.textDim, background: `${THEME.primary}08`, padding: '2px 8px', borderRadius: 4, border: `1px solid ${THEME.primary}12` }}>{inc.id}</span>
                                                    <StatusBadge label={sev.label} color={sev.color} />
                                                    <StatusBadge label="Resolved" color={THEME.success} />
                                                </div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>{inc.title}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: THEME.warning, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{inc.duration}</div>
                                                <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 3 }}>duration</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, background: `${sev.color}06`, border: `1px solid ${sev.color}12` }}>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Impact</div>
                                            <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{inc.impact}</div>
                                        </div>
                                        <div style={{ padding: '10px 14px', borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}40` }}>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Root Cause</div>
                                            <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{inc.root_cause}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 10, color: THEME.textDim }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <AlertTriangle size={9} color={sev.color} /> Started: {new Date(inc.started).toLocaleString()}
                                            </span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircle size={9} color={THEME.success} /> Resolved: {new Date(inc.resolved).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReliabilityTab;