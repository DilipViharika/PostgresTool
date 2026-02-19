// ==========================================================================
//  VIGIL — OverviewTab  (v4 — Advanced+)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard, LiveStatusBadge } from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';

import {
    Zap, Clock, Database, Activity, Server, HardDrive,
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
    Shield, ShieldCheck, Cpu, Network, RefreshCw, Eye,
    BarChart3, Layers, Radio, Timer, CheckCircle,
    AlertTriangle, GitBranch, Gauge, Lock, Unlock,
    ArrowUp, ArrowDown, ChevronRight, MemoryStick,
    Bell, BellRing, ChevronDown, Play, Pause,
    HardDriveDownload, Leaf, GitCommit, Hourglass,
    ToggleLeft, ToggleRight, Package, CheckSquare,
    AlertCircle, Info, X, Sparkles, Boxes,
    FlaskConical, Terminal, Globe
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, ReferenceLine
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const OvStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        @keyframes ovFadeIn {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovFadeInLeft {
            from { opacity: 0; transform: translateX(-10px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ovPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.3; }
        }
        @keyframes ovPulseRing {
            0%   { transform: scale(0.8); opacity: 0.7; }
            100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes ovPulseRingSlower {
            0%   { transform: scale(0.8); opacity: 0.4; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ovBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes ovGlowPulse {
            0%, 100% { box-shadow: 0 0 0px rgba(14,165,233,0); }
            50%      { box-shadow: 0 0 22px rgba(14,165,233,0.18); }
        }
        @keyframes ovGlowPulseWarn {
            0%, 100% { box-shadow: 0 0 0px rgba(251,146,60,0); }
            50%      { box-shadow: 0 0 20px rgba(251,146,60,0.2); }
        }
        @keyframes ovSweep {
            0%   { left: -40%; }
            100% { left: 140%; }
        }
        @keyframes ovRotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes ovBell {
            0%, 100% { transform: rotate(0deg); }
            20%      { transform: rotate(-15deg); }
            40%      { transform: rotate(12deg); }
            60%      { transform: rotate(-8deg); }
            80%      { transform: rotate(5deg); }
        }
        @keyframes ovDropIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ovNotifSlide {
            from { opacity: 0; transform: translateX(12px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ovPgBadge {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ovShimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes ovCountUp {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovVacuumPulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.04); }
        }

        .ov-stagger > * { animation: ovFadeIn 0.45s ease-out both; }
        .ov-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .ov-stagger > *:nth-child(2) { animation-delay: 0.07s; }
        .ov-stagger > *:nth-child(3) { animation-delay: 0.14s; }
        .ov-stagger > *:nth-child(4) { animation-delay: 0.21s; }
        .ov-stagger > *:nth-child(5) { animation-delay: 0.28s; }
        .ov-stagger > *:nth-child(6) { animation-delay: 0.35s; }
        .ov-stagger > *:nth-child(7) { animation-delay: 0.42s; }
        .ov-stagger > *:nth-child(8) { animation-delay: 0.49s; }

        .ov-bar-animate {
            transform-origin: left;
            animation: ovBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ov-glow         { animation: ovGlowPulse 3.5s ease-in-out infinite; }
        .ov-glow-warn    { animation: ovGlowPulseWarn 2.8s ease-in-out infinite; }
        .ov-bell-anim    { animation: ovBell 1.2s ease-in-out; }

        .ov-notif-item {
            animation: ovNotifSlide 0.28s ease-out both;
        }
        .ov-notif-item:nth-child(1) { animation-delay: 0.03s; }
        .ov-notif-item:nth-child(2) { animation-delay: 0.09s; }
        .ov-notif-item:nth-child(3) { animation-delay: 0.15s; }
        .ov-notif-item:nth-child(4) { animation-delay: 0.21s; }

        .ov-pg-badge { animation: ovPgBadge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 0.3s; }

        .ov-env-dropdown { animation: ovDropIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .ov-shimmer-btn {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
            background-size: 200% 100%;
            animation: ovShimmer 2s linear infinite;
        }

        .ov-metric-card:hover {
            border-color: rgba(255,255,255,0.12) !important;
            transform: translateY(-2px);
            transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .ov-metric-card {
            transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .ov-vacuum-urgent { animation: ovVacuumPulse 2s ease-in-out infinite; }

        /* Mono font for metrics */
        .ov-mono { font-family: 'JetBrains Mono', monospace !important; }
        .ov-display { font-family: 'Syne', sans-serif !important; }

        .ov-card-shine {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%);
            pointer-events: none;
            border-radius: inherit;
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, accentColor }) => (
    <div style={{
        background: THEME.glass,
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${accentColor ? `${accentColor}22` : THEME.glassBorder}`,
        borderRadius: 16, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        boxShadow: accentColor ? `0 0 0 1px ${accentColor}08, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
    }}>
        <div className="ov-card-shine" />
        {title && (
            <div style={{
                padding: '12px 18px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, minHeight: 44,
                background: 'rgba(255,255,255,0.012)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && (
                        <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: accentColor ? `${accentColor}14` : `${THEME.textDim}10`,
                        }}>
                            <TIcon size={12} color={accentColor || THEME.textDim} />
                        </div>
                    )}
                    <span className="ov-display" style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>
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
        fontSize: 9.5, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
        background: `${color}12`, color, border: `1px solid ${color}22`,
        lineHeight: 1.3, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.04em',
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: '50%', background: color,
            boxShadow: `0 0 5px ${color}70`, flexShrink: 0,
            animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
        }} />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}90` }} />
        <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${color}50`, animation: 'ovPulseRing 2s ease-out infinite' }} />
        <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `1px solid ${color}25`, animation: 'ovPulseRing 2s ease-out infinite 0.5s' }} />
    </div>
);

const RingGauge = ({ value, color, size = 80, strokeWidth = 6, label, showValue = true, secondaryValue, secondaryColor }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = circ * Math.min(value, 100) / 100;
    const r2 = r - strokeWidth - 3;
    const circ2 = 2 * Math.PI * r2;
    const filled2 = secondaryValue != null ? circ2 * Math.min(secondaryValue, 100) / 100 : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${THEME.grid}45`} strokeWidth={strokeWidth} />
                {/* Main arc */}
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)', filter: `drop-shadow(0 0 5px ${color}50)` }}
                />
                {/* Optional inner ring */}
                {secondaryValue != null && (
                    <>
                        <circle cx={size / 2} cy={size / 2} r={r2} fill="none" stroke={`${THEME.grid}35`} strokeWidth={strokeWidth - 1.5} />
                        <circle
                            cx={size / 2} cy={size / 2} r={r2} fill="none" stroke={secondaryColor}
                            strokeWidth={strokeWidth - 1.5}
                            strokeDasharray={`${filled2} ${circ2 - filled2}`}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s', filter: `drop-shadow(0 0 3px ${secondaryColor}40)` }}
                        />
                    </>
                )}
            </svg>
            {showValue && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span className="ov-mono" style={{ fontSize: size > 70 ? 17 : 10, fontWeight: 700, color, lineHeight: 1 }}>{value}%</span>
                    {label && <span style={{ fontSize: 7.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>{label}</span>}
                </div>
            )}
        </div>
    );
};

const MiniSparkline = ({ data = [], color = THEME.primary, width = 64, height = 20, filled = true }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
    const uid = `ovsp-${color.replace(/[^a-z0-9]/gi, '')}-${width}`;
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            {filled && <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${uid})`} />}
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy, backdropFilter: 'blur(16px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            {label && <div className="ov-mono" style={{ fontWeight: 700, color: THEME.textMain, marginBottom: 6, fontSize: 11 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color || p.fill }} />
                    <span style={{ color: THEME.textMuted, flex: 1 }}>{p.name}:</span>
                    <span className="ov-mono" style={{ fontWeight: 700, color: p.color || p.fill }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </div>
            ))}
        </div>
    );
};

const Divider = ({ style = {} }) => (
    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${THEME.glassBorder}, transparent)`, ...style }} />
);

/* ── Helpers ── */
const fmtNum = (n) => {
    if (n == null) return '—';
    const v = Number(n);
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return String(Math.round(v));
};
const fmtRelTime = (isoStr) => {
    if (!isoStr) return 'Never';
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60)   return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
};
const genSparkline = (n = 10, base = 40, variance = 30) =>
    Array.from({ length: n }, () => base + Math.random() * variance);

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: ENVIRONMENT SWITCHER
   ═══════════════════════════════════════════════════════════════════════════ */
const ENVIRONMENTS = [
    { id: 'prod',    label: 'Production',  icon: Globe,        color: '#ef4444', pg: '16.2', host: 'pg-primary-01.internal' },
    { id: 'staging', label: 'Staging',     icon: FlaskConical, color: '#f59e0b', pg: '16.1', host: 'pg-staging-01.internal' },
    { id: 'dev',     label: 'Development', icon: Terminal,     color: '#22c55e', pg: '15.5', host: 'pg-dev-01.local' },
];

const EnvSwitcher = ({ currentEnv, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const env = ENVIRONMENTS.find(e => e.id === currentEnv) || ENVIRONMENTS[0];

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 10,
                    background: `${env.color}10`,
                    border: `1px solid ${env.color}28`,
                    cursor: 'pointer', color: env.color,
                    transition: 'all 0.18s ease',
                }}
            >
                <env.icon size={12} />
                <span className="ov-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>{env.label}</span>
                <ChevronDown size={10} style={{ transition: 'transform 0.18s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
                        background: THEME.glassHeavy, backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`, borderRadius: 12,
                        overflow: 'hidden', minWidth: 240,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ padding: '8px 12px 6px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Switch Environment</span>
                    </div>
                    {ENVIRONMENTS.map(e => (
                        <button
                            key={e.id}
                            onClick={() => { onChange(e.id); setOpen(false); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 14px', background: e.id === currentEnv ? `${e.color}10` : 'transparent',
                                border: 'none', borderBottom: `1px solid ${THEME.glassBorder}20`,
                                cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={ev => { ev.currentTarget.style.background = `${e.color}08`; }}
                            onMouseLeave={ev => { ev.currentTarget.style.background = e.id === currentEnv ? `${e.color}10` : 'transparent'; }}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: `${e.color}15`, border: `1px solid ${e.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <e.icon size={13} color={e.color} />
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: e.id === currentEnv ? e.color : THEME.textMain }}>{e.label}</div>
                                <div className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 1 }}>{e.host}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                <StatusBadge label={`PG ${e.pg}`} color={e.color} />
                                {e.id === currentEnv && <span style={{ fontSize: 8.5, color: e.color, fontWeight: 700 }}>ACTIVE</span>}
                            </div>
                        </button>
                    ))}
                    <div style={{ padding: '6px 12px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Boxes size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 9.5, color: THEME.textDim }}>3 environments configured</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: NOTIFICATION BELL
   ═══════════════════════════════════════════════════════════════════════════ */
const MOCK_ALERTS = [
    { id: 1, severity: 'critical', title: 'High replication lag on replica-2', time: '2m ago', read: false },
    { id: 2, severity: 'warning',  title: '5 tables require urgent VACUUM', time: '8m ago', read: false },
    { id: 3, severity: 'warning',  title: 'Checkpoint duration exceeded 1s (×2)', time: '15m ago', read: false },
    { id: 4, severity: 'info',     title: 'Autovacuum ran on public.orders', time: '34m ago', read: true },
    { id: 5, severity: 'info',     title: 'Cache hit ratio dipped to 97.2%', time: '1h ago', read: true },
];

const SEVERITY_COLOR = { critical: '#ef4444', warning: '#f59e0b', info: '#38bdf8' };
const SEVERITY_ICON  = { critical: AlertCircle, warning: AlertTriangle, info: Info };

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [bellAnim, setBellAnim] = useState(false);
    const ref = useRef(null);
    const unread = alerts.filter(a => !a.read).length;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (unread > 0) {
            const t = setInterval(() => { setBellAnim(true); setTimeout(() => setBellAnim(false), 1300); }, 6000);
            return () => clearInterval(t);
        }
    }, [unread]);

    const markAllRead = () => setAlerts(al => al.map(a => ({ ...a, read: true })));
    const dismiss = (id) => setAlerts(al => al.filter(a => a.id !== id));

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'relative', width: 36, height: 36, borderRadius: 10,
                    background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${unread > 0 ? `${SEVERITY_COLOR.critical}35` : THEME.glassBorder}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                }}
            >
                {unread > 0
                    ? <BellRing size={15} color={SEVERITY_COLOR.critical} className={bellAnim ? 'ov-bell-anim' : ''} />
                    : <Bell size={15} color={THEME.textMuted} />
                }
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                        background: SEVERITY_COLOR.critical, color: '#fff',
                        fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'JetBrains Mono, monospace',
                        boxShadow: `0 0 8px ${SEVERITY_COLOR.critical}60`,
                        animation: 'ovPulse 2s ease-in-out infinite',
                    }}>
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                        background: THEME.glassHeavy, backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`, borderRadius: 14,
                        overflow: 'hidden', width: 320,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BellRing size={13} color={unread > 0 ? SEVERITY_COLOR.critical : THEME.textMuted} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>Alerts</span>
                            {unread > 0 && <StatusBadge label={`${unread} unread`} color={SEVERITY_COLOR.critical} />}
                        </div>
                        {unread > 0 && (
                            <button onClick={markAllRead} style={{ fontSize: 10, color: THEME.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                        {alerts.length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: THEME.textDim, fontSize: 12 }}>
                                <CheckCircle size={20} color={THEME.success} style={{ marginBottom: 8, opacity: 0.7 }} />
                                <div>All clear — no active alerts.</div>
                            </div>
                        )}
                        {alerts.map((a, i) => {
                            const SIcon = SEVERITY_ICON[a.severity];
                            const sc = SEVERITY_COLOR[a.severity];
                            return (
                                <div
                                    key={a.id}
                                    className="ov-notif-item"
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '11px 14px',
                                        background: a.read ? 'transparent' : `${sc}06`,
                                        borderBottom: `1px solid ${THEME.glassBorder}20`,
                                        borderLeft: a.read ? '2px solid transparent' : `2px solid ${sc}`,
                                    }}
                                >
                                    <SIcon size={13} color={sc} style={{ marginTop: 1, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11.5, color: a.read ? THEME.textMuted : THEME.textMain, fontWeight: a.read ? 400 : 600, lineHeight: 1.35 }}>{a.title}</div>
                                        <div className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 3 }}>{a.time}</div>
                                    </div>
                                    <button onClick={() => dismiss(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 0, opacity: 0.6 }}>
                                        <X size={11} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ padding: '8px 14px', borderTop: `1px solid ${THEME.glassBorder}`, display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10.5, color: THEME.primary, fontWeight: 600, cursor: 'pointer' }}>View all alerts →</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: REFRESH INTERVAL CONTROL
   ═══════════════════════════════════════════════════════════════════════════ */
const REFRESH_OPTIONS = [
    { label: '5s',  value: 5000 },
    { label: '15s', value: 15000 },
    { label: '30s', value: 30000 },
    { label: '60s', value: 60000 },
    { label: 'Off', value: 0 },
];

const RefreshControl = ({ interval, setInterval: setIv, onManualRefresh, loading }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const cur = REFRESH_OPTIONS.find(o => o.value === interval) || REFRESH_OPTIONS[0];

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Manual refresh button */}
            <button
                onClick={onManualRefresh}
                disabled={loading}
                style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.glassBorder}`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.5 : 1,
                }}
                title="Manual refresh"
            >
                <RefreshCw size={13} color={THEME.textMuted} style={{ animation: loading ? 'ovRotate 0.8s linear infinite' : 'none' }} />
            </button>

            {/* Interval picker */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 8, height: 32,
                    background: interval === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${interval === 0 ? '#ef444430' : THEME.glassBorder}`,
                    cursor: 'pointer', color: interval === 0 ? '#ef4444' : THEME.textMuted,
                    transition: 'all 0.15s',
                }}
            >
                {interval === 0
                    ? <Pause size={11} />
                    : <Play size={11} />
                }
                <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700 }}>{cur.label}</span>
                <ChevronDown size={9} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
                        background: THEME.glassHeavy, backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`, borderRadius: 10,
                        overflow: 'hidden', minWidth: 140,
                        boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ padding: '7px 11px 5px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refresh interval</span>
                    </div>
                    {REFRESH_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setIv(opt.value); setOpen(false); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '9px 12px', background: opt.value === interval ? `${THEME.primary}12` : 'transparent',
                                border: 'none', borderBottom: `1px solid ${THEME.glassBorder}15`,
                                cursor: 'pointer', transition: 'background 0.12s',
                            }}
                            onMouseEnter={ev => { if (opt.value !== interval) ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={ev => { if (opt.value !== interval) ev.currentTarget.style.background = 'transparent'; }}
                        >
                            <span className="ov-mono" style={{ fontSize: 11.5, color: opt.value === interval ? THEME.primary : THEME.textMuted, fontWeight: opt.value === interval ? 700 : 400 }}>{opt.label}</span>
                            {opt.value === interval && <CheckCircle size={11} color={THEME.primary} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: POSTGRESQL VERSION BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
const PgVersionBadge = ({ version = '16.2', environment = 'prod' }) => {
    const envData = ENVIRONMENTS.find(e => e.id === environment) || ENVIRONMENTS[0];
    return (
        <div
            className="ov-pg-badge"
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', borderRadius: 8,
                background: `linear-gradient(135deg, ${envData.color}12, ${envData.color}08)`,
                border: `1px solid ${envData.color}28`,
            }}
        >
            <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: `${envData.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Database size={10} color={envData.color} />
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700, color: envData.color, lineHeight: 1 }}>PostgreSQL {version}</span>
                </div>
                <div className="ov-mono" style={{ fontSize: 8.5, color: THEME.textDim, marginTop: 1, lineHeight: 1 }}>x86_64-linux-gnu</div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: LAST BACKUP CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const BackupStatusCard = ({ lastBackup }) => {
    const backup = lastBackup || {
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        sizeGB: 12.4,
        type: 'Full',
        status: 'success',
        duration: '4m 32s',
        nextScheduled: '02:00 UTC',
    };
    const isOld = (Date.now() - new Date(backup.timestamp).getTime()) > 26 * 3600 * 1000;
    const statusColor = backup.status === 'success' ? THEME.success : THEME.danger;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '14px 16px', borderRadius: 14,
            background: THEME.glass, backdropFilter: 'blur(12px)',
            border: `1px solid ${isOld ? `${THEME.warning}30` : THEME.glassBorder}`,
            position: 'relative', overflow: 'hidden',
        }}
             className={isOld ? 'ov-glow-warn' : ''}>
            <div className="ov-card-shine" />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${statusColor}12`, border: `1px solid ${statusColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HardDriveDownload size={14} color={statusColor} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Last Backup</div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>{backup.type} backup</div>
                    </div>
                </div>
                <StatusBadge label={backup.status === 'success' ? 'Verified' : 'FAILED'} color={statusColor} />
            </div>

            {/* Main value */}
            <div>
                <div className="ov-mono" style={{ fontSize: 20, fontWeight: 700, color: isOld ? THEME.warning : THEME.textMain, lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {fmtRelTime(backup.timestamp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: THEME.textDim }}><strong style={{ color: THEME.textMuted }}>{backup.sizeGB} GB</strong> compressed</span>
                    <span style={{ fontSize: 11, color: THEME.textDim }}>took <strong style={{ color: THEME.textMuted }}>{backup.duration}</strong></span>
                </div>
            </div>

            {/* Next scheduled */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 8, borderTop: `1px solid ${THEME.glassBorder}` }}>
                <Clock size={9} color={THEME.textDim} />
                <span style={{ fontSize: 10, color: THEME.textDim }}>Next scheduled: <strong style={{ color: THEME.textMuted }}>{backup.nextScheduled}</strong></span>
                {isOld && <StatusBadge label="OVERDUE" color={THEME.warning} style={{ marginLeft: 'auto' }} />}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: LONG-RUNNING TRANSACTIONS CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const LongTxnCard = ({ data }) => {
    const txns = data || [
        { pid: 54231, duration: '18m 42s', query: 'UPDATE public.orders SET ...', state: 'active', waitEvent: null },
        { pid: 54188, duration: '9m 11s',  query: 'BEGIN; SELECT * FROM sessions ...', state: 'idle in transaction', waitEvent: 'Lock' },
        { pid: 53990, duration: '4m 05s',  query: 'VACUUM ANALYZE public.events', state: 'active', waitEvent: null },
    ];
    const maxDurMs = Math.max(...txns.map(t => {
        const [m, s] = t.duration.replace('m ', ':').replace('s', '').split(':').map(Number);
        return (m * 60 + s) * 1000;
    }));

    return (
        <div style={{ padding: '14px 16px', borderRadius: 14, background: THEME.glass, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}`, position: 'relative', overflow: 'hidden' }}>
            <div className="ov-card-shine" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${THEME.warning}12`, border: `1px solid ${THEME.warning}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Hourglass size={14} color={THEME.warning} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Long-Running Txns</div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>threshold: &gt; 1m</div>
                    </div>
                </div>
                <div className="ov-mono" style={{ fontSize: 24, fontWeight: 800, color: txns.length > 0 ? THEME.warning : THEME.success, lineHeight: 1 }}>{txns.length}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {txns.slice(0, 3).map((t, i) => {
                    const [m, s] = t.duration.replace('m ', ':').replace('s', '').split(':').map(Number);
                    const durSec = m * 60 + s;
                    const pct = Math.min((durSec / (maxDurMs / 1000)) * 100, 100);
                    const isIdle = t.state.includes('idle');
                    return (
                        <div key={t.pid} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim }}>PID {t.pid}</span>
                                    {t.waitEvent && <StatusBadge label={`Wait: ${t.waitEvent}`} color={THEME.danger} />}
                                    {isIdle && <StatusBadge label="Idle in Txn" color={THEME.warning} />}
                                </div>
                                <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700, color: i === 0 ? THEME.danger : THEME.warning }}>{t.duration}</span>
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{t.query}</div>
                            <div style={{ height: 3, borderRadius: 2, background: `${THEME.grid}40`, overflow: 'hidden' }}>
                                <div
                                    className="ov-bar-animate"
                                    style={{
                                        width: `${pct}%`, height: '100%', borderRadius: 2,
                                        background: i === 0 ? `linear-gradient(90deg, ${THEME.danger}60, ${THEME.danger})` : `linear-gradient(90deg, ${THEME.warning}60, ${THEME.warning})`,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: VACUUM HEALTH CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const VacuumHealthCard = ({ data }) => {
    const vacuum = data || {
        urgentCount: 5,
        warnCount: 12,
        healthyCount: 183,
        lastRunTable: 'public.orders',
        lastRunAgo: '3m ago',
        bloatPct: 4.2,
        deadTuples: 182400,
    };
    const total = vacuum.urgentCount + vacuum.warnCount + vacuum.healthyCount;
    const urgentPct = Math.round((vacuum.urgentCount / total) * 100);
    const warnPct = Math.round((vacuum.warnCount / total) * 100);
    const healthPct = 100 - urgentPct - warnPct;

    const urgentColor = vacuum.urgentCount > 3 ? THEME.danger : THEME.warning;

    return (
        <div
            style={{ padding: '14px 16px', borderRadius: 14, background: THEME.glass, backdropFilter: 'blur(12px)', border: `1px solid ${vacuum.urgentCount > 3 ? `${THEME.danger}28` : THEME.glassBorder}`, position: 'relative', overflow: 'hidden' }}
            className={vacuum.urgentCount > 3 ? 'ov-glow-warn' : ''}
        >
            <div className="ov-card-shine" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${urgentColor}12`, border: `1px solid ${urgentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={vacuum.urgentCount > 3 ? 'ov-vacuum-urgent' : ''}>
                        <Leaf size={14} color={urgentColor} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Vacuum Health</div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>{total} tables tracked</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="ov-mono" style={{ fontSize: 22, fontWeight: 800, color: urgentColor, lineHeight: 1 }}>{vacuum.urgentCount}</div>
                    <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>urgent</div>
                </div>
            </div>

            {/* Stacked bar */}
            <div style={{ height: 6, borderRadius: 4, background: `${THEME.grid}40`, overflow: 'hidden', display: 'flex', marginBottom: 6 }}>
                <div style={{ width: `${urgentPct}%`, height: '100%', background: THEME.danger, transition: 'width 0.9s ease' }} />
                <div style={{ width: `${warnPct}%`, height: '100%', background: THEME.warning, transition: 'width 0.9s ease 0.05s' }} />
                <div style={{ flex: 1, height: '100%', background: `${THEME.success}50`, transition: 'width 0.9s ease 0.1s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textDim, marginBottom: 10 }}>
                <span style={{ color: THEME.danger }}>{vacuum.urgentCount} urgent</span>
                <span style={{ color: THEME.warning }}>{vacuum.warnCount} soon</span>
                <span style={{ color: THEME.success }}>{vacuum.healthyCount} healthy</span>
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: THEME.textDim }}>
                    Dead tuples: <strong className="ov-mono" style={{ color: THEME.textMuted }}>{fmtNum(vacuum.deadTuples)}</strong>
                </div>
                <div style={{ fontSize: 10, color: THEME.textDim }}>
                    Bloat: <strong className="ov-mono" style={{ color: vacuum.bloatPct > 10 ? THEME.danger : THEME.warning }}>{vacuum.bloatPct}%</strong>
                </div>
            </div>
            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                Last run: <strong style={{ color: THEME.textMuted }}>{vacuum.lastRunTable}</strong> <span className="ov-mono">{vacuum.lastRunAgo}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const OverviewTab = () => {
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [tick, setTick]               = useState(0);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [currentEnv, setCurrentEnv]   = useState('prod');
    const intervalRef = useRef(null);

    const env = ENVIRONMENTS.find(e => e.id === currentEnv) || ENVIRONMENTS[0];

    /* ── Synthetic datasets ── */
    const velocityData = useMemo(() => {
        const pts = [];
        const now = Date.now();
        for (let i = 29; i >= 0; i--) {
            const t = new Date(now - i * 60000);
            pts.push({
                time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
                qps: Math.round(800 + Math.sin(i * 0.4) * 300 + Math.random() * 200),
                tps: Math.round(120 + Math.sin(i * 0.3) * 60 + Math.random() * 40),
            });
        }
        return pts;
    }, [tick]);

    const opsPerSec = useMemo(() => {
        const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
        return labels.map(t => ({
            t,
            reads: Math.round(Math.random() * 1200 + 400),
            writes: Math.round(Math.random() * 600 + 100),
            commits: Math.round(Math.random() * 800 + 200),
        }));
    }, []);

    const txnLatencyData = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            i,
            p50: Math.round(1.2 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.3),
            p95: Math.round(8 + Math.sin(i * 0.4) * 3 + Math.random() * 2),
            p99: Math.round(22 + Math.sin(i * 0.3) * 6 + Math.random() * 4),
        }));
    }, [tick]);

    const sessionSparks  = useMemo(() => genSparkline(10), [tick]);
    const cacheSparks    = useMemo(() => genSparkline(10, 98, 2), [tick]);
    const diskSparks     = useMemo(() => genSparkline(10, 40, 15), [tick]);
    const uptimeSparks   = useMemo(() => genSparkline(10, 80, 10), [tick]);

    const load = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [stats, traffic] = await Promise.all([
                fetchData('/api/overview/stats'),
                fetchData('/api/overview/traffic'),
            ]);
            setData({ stats, traffic });
        } catch (e) {
            console.error('Overview load failed', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setTick(t => t + 1);
        }
    }, []);

    useEffect(() => {
        load();
    }, [currentEnv]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (refreshInterval > 0) {
            intervalRef.current = setInterval(() => load(), refreshInterval);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [refreshInterval, load]);

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
                <OvStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                    {[0,1,2,3,4,5].map(i => (
                        <div key={i} style={{ height: 110, borderRadius: 14, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.4, animation: `ovPulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
                    <div style={{ height: 320, borderRadius: 16, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.2, animation: 'ovPulse 1.5s ease-in-out infinite 0.5s' }} />
                    <div style={{ height: 320, borderRadius: 16, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.2, animation: 'ovPulse 1.5s ease-in-out infinite 0.65s' }} />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <OvStyles />
                <AlertTriangle size={32} color={THEME.warning} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: THEME.textMuted }}>Unable to load dashboard data.</div>
            </div>
        );
    }

    const { stats, traffic } = data;

    /* ── Derived values ── */
    const activeConns   = Number(stats?.activeConnections || 0);
    const maxConns      = Number(stats?.maxConnections || 100);
    const connPct       = Math.round((activeConns / maxConns) * 100);
    const cacheHit      = Number(stats?.indexHitRatio || 0);
    const diskGB        = Number(stats?.diskUsedGB || 0);
    const uptimeHrs     = ((Number(stats?.uptimeSeconds || 0)) / 3600).toFixed(1);
    const pgVersion     = stats?.pgVersion || env.pg;

    const fetched  = Number(traffic?.tup_fetched || 0);
    const inserted = Number(traffic?.tup_inserted || 0);
    const updated  = Number(traffic?.tup_updated || 0);
    const deleted  = Number(traffic?.tup_deleted || 0);
    const totalOps = fetched + inserted + updated + deleted;
    const readPct  = totalOps > 0 ? Math.round((fetched / totalOps) * 100) : 75;
    const writePct = 100 - readPct;

    const throughputRows = [
        { label: 'Tuples Fetched',  raw: fetched,  color: THEME.primary,  icon: Eye },
        { label: 'Tuples Inserted', raw: inserted, color: THEME.success,  icon: ArrowUp },
        { label: 'Tuples Updated',  raw: updated,  color: THEME.warning,  icon: RefreshCw },
        { label: 'Tuples Deleted',  raw: deleted,  color: THEME.danger,   icon: ArrowDown },
    ];
    const maxThroughput = Math.max(...throughputRows.map(r => r.raw), 1);

    const connColor  = connPct > 85 ? THEME.danger  : connPct > 65  ? THEME.warning : THEME.success;
    const cacheColor = cacheHit > 98 ? THEME.success : cacheHit > 95 ? THEME.warning : THEME.danger;

    const healthScore = Math.round(
        (cacheHit > 99 ? 30 : cacheHit > 95 ? 20 : 10) +
        (connPct < 70  ? 30 : connPct < 85   ? 20 : 10) +
        (diskGB < 150  ? 20 : diskGB < 180    ? 12 : 5)  +
        20
    );
    const healthColor = healthScore >= 80 ? THEME.success : healthScore >= 60 ? THEME.warning : THEME.danger;

    const workloadData = [
        { name: 'Reads',  value: readPct,              color: THEME.primary },
        { name: 'Writes', value: writePct > 0 ? writePct : 1, color: THEME.secondary },
    ];

    /* ── Hero metric cards (now 6 across including backup + vacuum summary) ── */
    const metricCards = [
        { label: 'Active Sessions', value: `${activeConns}`, sub: `of ${maxConns} max`, color: connColor, icon: Activity, spark: sessionSparks, trend: connPct < 70 ? '+2.3%' : '+8.1%', trendUp: connPct < 70 },
        { label: 'Cache Hit Ratio', value: `${cacheHit}%`,  sub: cacheHit >= 99 ? 'Excellent' : 'Below target', color: cacheColor, icon: Zap, spark: cacheSparks, trend: cacheHit >= 99 ? '+0.1%' : '-0.4%', trendUp: cacheHit >= 99 },
        { label: 'Database Size',   value: `${diskGB}`,      sub: 'GB on disk', color: THEME.warning, icon: Database, spark: diskSparks, trend: '+1.2%', trendUp: false },
        { label: 'Uptime',          value: uptimeHrs,        sub: 'hours', color: THEME.info, icon: Clock, spark: uptimeSparks, trend: '99.97%', trendUp: true },
        { label: 'Long Txns',       value: '3',              sub: '> 1 min', color: THEME.warning, icon: Hourglass, spark: genSparkline(10, 2, 4), trend: '+1', trendUp: false },
        { label: 'Urgent Vacuum',   value: '5',              sub: 'tables', color: THEME.danger, icon: Leaf, spark: genSparkline(10, 4, 6), trend: '+2', trendUp: false },
    ];

    /* ══════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '0 0 48px 0' }}>
            <OvStyles />

            {/* ═══════ Top Bar ═══════ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                {/* Left: Status + Env Switcher + PG Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <LiveDot color={connPct > 85 ? THEME.danger : THEME.success} size={7} />
                    <span className="ov-display" style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.03em' }}>
                        {connPct > 85 ? 'High Load' : 'Operational'}
                    </span>
                    <EnvSwitcher currentEnv={currentEnv} onChange={setCurrentEnv} />
                    <PgVersionBadge version={pgVersion} environment={currentEnv} />
                    <StatusBadge label={`${activeConns} connections`} color={connColor} />
                </div>

                {/* Right: Tick + Refresh Control + Notification Bell */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ov-mono" style={{ fontSize: 10, color: THEME.textDim, opacity: 0.5 }}>#{tick}</span>
                    <RefreshControl
                        interval={refreshInterval}
                        setInterval={setRefreshInterval}
                        onManualRefresh={() => load(true)}
                        loading={refreshing}
                    />
                    <NotificationBell />
                </div>
            </div>

            {/* ═══════ Row 1: 6 Hero Metric Cards ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                {metricCards.map((m, i) => (
                    <div
                        key={i}
                        className={`ov-metric-card ${i >= 4 ? 'ov-glow-warn' : 'ov-glow'}`}
                        style={{
                            display: 'flex', flexDirection: 'column', gap: 10,
                            padding: '14px 16px', borderRadius: 14,
                            background: THEME.glass, backdropFilter: 'blur(14px)',
                            border: `1px solid ${i >= 4 ? `${m.color}28` : THEME.glassBorder}`,
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <div className="ov-card-shine" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${m.color}10`, border: `1px solid ${m.color}18` }}>
                                <m.icon size={14} color={m.color} />
                            </div>
                            <MiniSparkline data={m.spark} color={m.color} width={48} height={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 5 }}>{m.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span className="ov-mono" style={{ fontSize: 22, fontWeight: 700, color: m.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{m.value}</span>
                                <span style={{ fontSize: 10, color: THEME.textDim }}>{m.sub}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {m.trendUp ? <ArrowUpRight size={10} color={THEME.success} /> : <ArrowDownRight size={10} color={THEME.danger} />}
                            <span className="ov-mono" style={{ fontSize: 10, fontWeight: 700, color: m.trendUp ? THEME.success : THEME.danger }}>{m.trend}</span>
                            <span style={{ fontSize: 9.5, color: THEME.textDim, marginLeft: 2 }}>vs last hr</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════ Row 2: Backup + LongTxns + Vacuum (new focused cards) ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <BackupStatusCard />
                <LongTxnCard />
                <VacuumHealthCard />
            </div>

            {/* ═══════ Row 3: Velocity Chart + Health + Connection Pool ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18 }}>

                {/* ── Cluster Velocity ── */}
                <Panel
                    title="Cluster Velocity"
                    icon={Activity}
                    accentColor={THEME.primary}
                    rightNode={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 10, fontSize: 9.5, color: THEME.textDim }}>
                                {[['QPS', THEME.primary], ['TPS', THEME.secondary]].map(([l, c]) => (
                                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 10, height: 3, borderRadius: 2, background: c }} /> {l}
                                    </span>
                                ))}
                            </div>
                            <StatusBadge label="LIVE" color={THEME.success} pulse />
                        </div>
                    }
                >
                    <div style={{ height: 230 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={velocityData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                <defs>
                                    <linearGradient id="ovGradQps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ovGradTps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.22} />
                                        <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={`${THEME.grid}35`} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="qps" name="Queries/sec" stroke={THEME.primary} strokeWidth={2.5} fill="url(#ovGradQps)" />
                                <Area type="monotone" dataKey="tps" name="Txns/sec" stroke={THEME.secondary} strokeWidth={1.5} fill="url(#ovGradTps)" strokeDasharray="5 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Summary strip */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.glassBorder}` }}>
                        {[
                            { label: 'Peak QPS',  value: Math.max(...velocityData.map(d => d.qps)).toLocaleString(), color: THEME.primary },
                            { label: 'Avg QPS',   value: Math.round(velocityData.reduce((s, d) => s + d.qps, 0) / velocityData.length).toLocaleString(), color: THEME.primary },
                            { label: 'Peak TPS',  value: Math.max(...velocityData.map(d => d.tps)).toLocaleString(), color: THEME.secondary },
                            { label: 'Avg TPS',   value: Math.round(velocityData.reduce((s, d) => s + d.tps, 0) / velocityData.length).toLocaleString(), color: THEME.secondary },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.label}</div>
                                <div className="ov-mono" style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* ── Right column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Health Score */}
                    <Panel title="Database Health" icon={Shield} accentColor={healthColor}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <RingGauge value={healthScore} color={healthColor} size={88} strokeWidth={7} label="HEALTH" secondaryValue={cacheHit} secondaryColor={cacheColor} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Cache Hit',   value: `${cacheHit}%`, pct: cacheHit, color: cacheColor },
                                    { label: 'Conn Usage',  value: `${connPct}%`, pct: connPct, color: connColor },
                                    { label: 'Disk Usage',  value: `${Math.round(diskGB / 200 * 100)}%`, pct: Math.round(diskGB / 200 * 100), color: diskGB > 160 ? THEME.danger : diskGB > 120 ? THEME.warning : THEME.success },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>{item.label}</span>
                                            <span className="ov-mono" style={{ fontSize: 10, fontWeight: 700, color: item.color }}>{item.value}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 2, background: `${THEME.grid}55`, overflow: 'hidden' }}>
                                            <div className="ov-bar-animate" style={{ width: `${Math.min(item.pct, 100)}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${item.color}70, ${item.color})`, animationDelay: `${i * 0.12}s` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    {/* Connection Pool */}
                    <Panel title="Connection Pool" icon={Network} accentColor={connColor}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <RingGauge value={connPct} color={connColor} size={68} strokeWidth={6} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                                    {[
                                        { label: 'Active',  value: activeConns,                             color: THEME.primary },
                                        { label: 'Idle',    value: Math.max(0, maxConns - activeConns - 5), color: THEME.textDim },
                                        { label: 'Waiting', value: connPct > 80 ? 3 : 0,                   color: THEME.warning },
                                        { label: 'Max',     value: maxConns,                                color: THEME.textMuted },
                                    ].map((s, i) => (
                                        <div key={i} style={{ padding: '7px 10px', borderRadius: 7, background: THEME.surface, border: `1px solid ${THEME.grid}35` }}>
                                            <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{s.label}</div>
                                            <div className="ov-mono" style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ═══════ Row 4: Txn Latency Percentiles (new) ═══════ */}
            <Panel
                title="Transaction Latency Percentiles"
                icon={Gauge}
                accentColor={THEME.secondary}
                rightNode={
                    <div style={{ display: 'flex', gap: 12, fontSize: 9.5, color: THEME.textDim }}>
                        {[['P50', '#34d399'], ['P95', THEME.warning], ['P99', THEME.danger]].map(([l, c]) => (
                            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 3, borderRadius: 2, background: c }} /> <span className="ov-mono">{l}</span>
                            </span>
                        ))}
                    </div>
                }
            >
                <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={txnLatencyData} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                            <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="i" hide />
                            <YAxis tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={28} unit="ms" />
                            <Tooltip content={<ChartTooltip />} />
                            <ReferenceLine y={10} stroke={`${THEME.warning}40`} strokeDasharray="4 4" label={{ value: 'SLA', fontSize: 9, fill: THEME.warning, position: 'right' }} />
                            <Line type="monotone" dataKey="p50" name="P50" stroke="#34d399" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="p95" name="P95" stroke={THEME.warning} strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                            <Line type="monotone" dataKey="p99" name="P99" stroke={THEME.danger} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* Latency stats */}
                <div style={{ display: 'flex', gap: 0, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${THEME.glassBorder}` }}>
                    {[
                        { label: 'P50 avg', value: '1.4 ms', color: '#34d399' },
                        { label: 'P95 avg', value: '9.2 ms', color: THEME.warning },
                        { label: 'P99 avg', value: '24.8 ms', color: THEME.danger },
                        { label: 'SLA breach', value: '0', color: THEME.success },
                        { label: 'Timeout (5m)', value: '2', color: THEME.warning },
                    ].map((s, i) => (
                        <div key={i} style={{ flex: 1, paddingRight: 12, borderRight: i < 4 ? `1px solid ${THEME.glassBorder}` : 'none', paddingLeft: i > 0 ? 12 : 0 }}>
                            <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.label}</div>
                            <div className="ov-mono" style={{ fontSize: 14, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* ═══════ Row 5: Workload + Throughput + Ops ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.3fr', gap: 18 }}>

                {/* Workload Split */}
                <Panel title="Workload Split" icon={BarChart3}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, height: '100%', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: 130, height: 130 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={workloadData} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={5} dataKey="value" strokeWidth={0}>
                                        {workloadData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.88} />)}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span className="ov-mono" style={{ fontSize: 21, fontWeight: 800, color: THEME.textMain, lineHeight: 1 }}>{readPct}%</span>
                                <span style={{ fontSize: 8, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>READS</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 18 }}>
                            {workloadData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{d.name}</span>
                                    <span className="ov-mono" style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}%</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Layers size={10} /> Total: <strong className="ov-mono" style={{ color: THEME.textMuted }}>{fmtNum(totalOps)}</strong>
                        </div>
                    </div>
                </Panel>

                {/* Throughput Breakdown */}
                <Panel title="Throughput Breakdown" icon={TrendingUp} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {throughputRows.map((row, i) => {
                            const pct = (row.raw / maxThroughput) * 100;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < throughputRows.length - 1 ? `1px solid ${THEME.grid}22` : 'none' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${row.color}10`, border: `1px solid ${row.color}15` }}>
                                        <row.icon size={13} color={row.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted }}>{row.label}</span>
                                            <span className="ov-mono" style={{ fontSize: 11.5, fontWeight: 800, color: row.color }}>{fmtNum(row.raw)}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 3, background: `${THEME.grid}45`, overflow: 'hidden' }}>
                                            <div className="ov-bar-animate" style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${row.color}65, ${row.color})`, boxShadow: `0 0 8px ${row.color}30`, animationDelay: `${i * 0.1}s` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderTop: `1px solid ${THEME.glassBorder}` }}>
                        <Layers size={11} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Ops</span>
                        <span className="ov-mono" style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, marginLeft: 'auto' }}>{fmtNum(totalOps)}</span>
                    </div>
                </Panel>

                {/* Ops/sec */}
                <Panel
                    title="Ops / Second (today)"
                    icon={Gauge}
                    rightNode={
                        <div style={{ display: 'flex', gap: 8, fontSize: 9.5, color: THEME.textDim }}>
                            {[['Reads', THEME.primary], ['Writes', THEME.success], ['Commits', THEME.secondary]].map(([l, c]) => (
                                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 8, height: 3, borderRadius: 1, background: c }} /> {l}
                                </span>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: 185 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={opsPerSec} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid stroke={`${THEME.grid}35`} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={30} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="reads"   name="Reads"   fill={THEME.primary}   radius={[2,2,0,0]} opacity={0.85} />
                                <Bar dataKey="writes"  name="Writes"  fill={THEME.success}   radius={[2,2,0,0]} opacity={0.85} />
                                <Bar dataKey="commits" name="Commits" fill={THEME.secondary} radius={[2,2,0,0]} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>
            </div>

            {/* ═══════ Row 6: System Resources ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {[
                    { label: 'CPU Load', value: 38, color: THEME.primary, icon: Cpu, detail: '4 cores • 1.8 load avg', status: 'Normal', secondary: 22, secondaryLabel: 'I/O Wait' },
                    { label: 'Memory Usage', value: 72, color: THEME.secondary, icon: MemoryStick || Server, detail: '12 GB / 16 GB allocated', status: 'Moderate', secondary: 55, secondaryLabel: 'Shared Buf' },
                    { label: 'Disk I/O', value: Math.round(diskGB / 200 * 100), color: THEME.warning, icon: HardDrive, detail: `${diskGB} GB / 200 GB SSD`, status: diskGB > 160 ? 'High' : 'Normal', secondary: 30, secondaryLabel: 'Write Amp' },
                ].map((r, i) => (
                    <Panel key={i} accentColor={r.color}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <RingGauge value={r.value} color={r.color} size={60} strokeWidth={5} secondaryValue={r.secondary} secondaryColor={`${r.color}80`} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                    <r.icon size={12} color={r.color} style={{ flexShrink: 0 }} />
                                    <span className="ov-display" style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{r.label}</span>
                                    <StatusBadge label={r.status} color={r.status === 'Normal' ? THEME.success : r.status === 'Moderate' ? THEME.warning : THEME.danger} />
                                </div>
                                <div style={{ fontSize: 10.5, color: THEME.textDim, marginBottom: 6 }}>{r.detail}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim }}>{r.secondaryLabel}:</span>
                                    <span className="ov-mono" style={{ fontSize: 9.5, color: r.color, fontWeight: 700 }}>{r.secondary}%</span>
                                </div>
                            </div>
                        </div>
                    </Panel>
                ))}
            </div>

            {/* ═══════ Row 7: Replication + Tables + WAL ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1.2fr', gap: 18 }}>

                {/* Replication & Locks */}
                <Panel
                    title="Replication & Locks"
                    icon={GitBranch}
                    accentColor={THEME.secondary}
                    rightNode={
                        <div style={{ display: 'flex', gap: 10, fontSize: 9.5, color: THEME.textDim }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Radio size={9} color={THEME.success} /> Primary</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Radio size={9} color={THEME.secondary} /> Replicas</span>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ padding: '7px 10px', borderRadius: 9, background: THEME.surface, border: `1px solid ${THEME.grid}45`, display: 'flex', alignItems: 'center', gap: 6, minWidth: 115 }}>
                                <Server size={13} color={THEME.primary} />
                                <div>
                                    <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMain, display: 'block' }}>primary-1</span>
                                    <span className="ov-mono" style={{ fontSize: 9, color: THEME.textDim }}>lag: 0 ms</span>
                                </div>
                            </div>
                            <ChevronRight size={13} color={THEME.textDim} />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {[{ name: 'replica-1', lagMs: 120 }, { name: 'replica-2', lagMs: 480 }].map((r, i) => (
                                    <div key={i} style={{ padding: '7px 10px', borderRadius: 9, background: THEME.surface, border: `1px solid ${r.lagMs > 300 ? `${THEME.warning}35` : `${THEME.grid}45`}`, minWidth: 108 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Server size={12} color={THEME.secondary} />
                                            <div>
                                                <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMain, display: 'block' }}>{r.name}</span>
                                                <span className="ov-mono" style={{ fontSize: 9, color: r.lagMs > 300 ? THEME.warning : THEME.textDim }}>lag: {r.lagMs} ms</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Divider />

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12, alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Blocked queries</span>
                                    <span className="ov-mono" style={{ fontSize: 12, fontWeight: 800, color: THEME.danger }}>3</span>
                                </div>
                                <div style={{ height: 4, borderRadius: 2, background: `${THEME.grid}45`, overflow: 'hidden' }}>
                                    <div className="ov-bar-animate" style={{ width: '60%', height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${THEME.danger}65, ${THEME.danger})`, boxShadow: `0 0 8px ${THEME.danger}30` }} />
                                </div>
                                <div style={{ marginTop: 4, fontSize: 9.5, color: THEME.textDim }}>3 blocked, 5 waiting on row/page locks.</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Lock size={10} color={THEME.warning} />
                                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>Lock contention</span>
                                    <StatusBadge label="Elevated" color={THEME.warning} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Unlock size={10} color={THEME.success} />
                                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>Deadlocks (5m)</span>
                                    <span className="ov-mono" style={{ fontSize: 11, fontWeight: 700, color: THEME.success }}>0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* Top Impacted Tables */}
                <Panel title="Top Impacted Tables" icon={BarChart3} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[
                            { name: 'public.orders',       reads: 42000, writes: 9000 },
                            { name: 'public.events',       reads: 31000, writes: 14000 },
                            { name: 'public.sessions',     reads: 26000, writes: 6000 },
                            { name: 'audit.log_entries',   reads: 18000, writes: 3000 },
                            { name: 'public.users',        reads: 15000, writes: 1200 },
                        ].map((t, i, arr) => {
                            const total = t.reads + t.writes;
                            const rp = total > 0 ? Math.round((t.reads / total) * 100) : 50;
                            return (
                                <div key={t.name} style={{ padding: '10px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${THEME.grid}22` : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                        <span className="ov-mono" style={{ fontSize: 10.5, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '62%' }} title={t.name}>{t.name}</span>
                                        <span style={{ fontSize: 10.5, color: THEME.textDim }}>{fmtNum(total)} ops</span>
                                    </div>
                                    <div style={{ height: 5, borderRadius: 4, background: `${THEME.grid}40`, overflow: 'hidden', display: 'flex' }}>
                                        <div className="ov-bar-animate" style={{ width: '100%', height: '100%', display: 'flex', transformOrigin: 'left' }}>
                                            <div style={{ width: `${rp}%`, background: `linear-gradient(90deg, ${THEME.primary}70, ${THEME.primary})` }} />
                                            <div style={{ flex: 1, background: `linear-gradient(90deg, ${THEME.secondary}70, ${THEME.secondary})` }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: THEME.textDim, marginTop: 4 }}>
                                        <span>R: {fmtNum(t.reads)}</span>
                                        <span>W: {fmtNum(t.writes)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                {/* WAL & Checkpoints */}
                <Panel title="WAL & Checkpoints" icon={Gauge} accentColor={THEME.info}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>WAL generation</span>
                                    <span className="ov-mono" style={{ fontSize: 12, fontWeight: 800, color: THEME.textMain }}>12.4 MB/s</span>
                                </div>
                                <MiniSparkline data={genSparkline(16)} color={THEME.primary} width={140} height={32} />
                                <div style={{ marginTop: 4, fontSize: 9.5, color: THEME.textDim }}>Last 5 minutes across cluster.</div>
                            </div>
                            <div style={{ padding: '8px 10px', borderRadius: 9, background: THEME.surface, border: `1px solid ${THEME.grid}45`, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Timer size={12} color={THEME.secondary} />
                                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>Checkpoint avg</span>
                                    <span className="ov-mono" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: THEME.secondary }}>420 ms</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <AlertTriangle size={11} color={THEME.warning} />
                                    <span style={{ fontSize: 9.5, color: THEME.textDim }}>2 exceeded 1s in 10 min.</span>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <StatusBadge label="WAL archive: OK" color={THEME.success} />
                            <StatusBadge label="Checkpoint: Normal" color={THEME.primary} />
                            <StatusBadge label="Autovacuum on" color={THEME.secondary} />
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default OverviewTab;