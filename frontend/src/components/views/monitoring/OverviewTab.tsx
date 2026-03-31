import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { GlassCard, LiveStatusBadge } from '../../ui/SharedComponents';
import { fetchData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { useNavigation } from '../../../context/NavigationContext';

import {
    Zap,
    Clock,
    Database,
    Activity,
    Server,
    HardDrive,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown,
    Shield,
    ShieldCheck,
    Cpu,
    Network,
    RefreshCw,
    Eye,
    BarChart3,
    Layers,
    Radio,
    Timer,
    CheckCircle,
    AlertTriangle,
    GitBranch,
    Gauge,
    Lock,
    Unlock,
    ArrowUp,
    ArrowDown,
    ChevronRight,
    MemoryStick,
    Bell,
    BellRing,
    ChevronDown,
    Play,
    Pause,
    HardDriveDownload,
    Leaf,
    GitCommit,
    Hourglass,
    ToggleLeft,
    ToggleRight,
    Package,
    CheckSquare,
    AlertCircle,
    Info,
    X,
    Sparkles,
    Boxes,
    FlaskConical,
    Terminal,
    Globe,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    ReferenceLine,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const OvStyles = () => (
    <style>{`
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
            0%, 100% { box-shadow: 0 0 0px rgba(139,92,246,0); }
            50%      { box-shadow: 0 0 22px rgba(139,92,246,0.18); }
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
            border-color: ${THEME.glassBorderHover} !important;
            transform: translateY(-2px);
            transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .ov-metric-card {
            transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .ov-vacuum-urgent { animation: ovVacuumPulse 2s ease-in-out infinite; }

        /* Mono font for metrics */
        .ov-mono { font-family: ${THEME.fontMono} !important; }
        .ov-display { font-family: ${THEME.fontBody} !important; }

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
    <div
        style={{
            background: THEME.glass,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${accentColor ? `${accentColor}22` : THEME.glassBorder}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: accentColor
                ? `0 0 0 1px ${accentColor}12, 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.08)`
                : `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)`,
            ...style,
        }}
    >
        <div className="ov-card-shine" />
        {title && (
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${accentColor ? `${accentColor}18` : THEME.glassBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    minHeight: 44,
                    background: accentColor ? `${accentColor}06` : 'rgba(255,255,255,0.02)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {TIcon && (
                        <div
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: accentColor ? `${accentColor}16` : `${THEME.textDim}12`,
                                boxShadow: accentColor ? `0 0 8px ${accentColor}20` : 'none',
                            }}
                        >
                            <TIcon size={13} color={accentColor || THEME.textDim} />
                        </div>
                    )}
                    <span
                        className="ov-display"
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: THEME.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {title}
                    </span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>{children}</div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const StatusBadge = ({ label, color, pulse }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 9.5,
            fontWeight: 700,
            padding: '4px 11px',
            borderRadius: 12,
            background: `${color}12`,
            color,
            border: `1px solid ${color}28`,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            fontFamily: THEME.fontMono,
            letterSpacing: '0.05em',
        }}
    >
        <span
            style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}80, 0 0 12px ${color}40`,
                flexShrink: 0,
                animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
            }}
        />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div
            style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}a0, 0 0 12px ${color}60`,
            }}
        />
        <div
            style={{
                position: 'absolute',
                inset: -3,
                borderRadius: '50%',
                border: `1px solid ${color}60`,
                animation: 'ovPulseRing 2s ease-out infinite',
            }}
        />
        <div
            style={{
                position: 'absolute',
                inset: -5,
                borderRadius: '50%',
                border: `1px solid ${color}35`,
                animation: 'ovPulseRing 2s ease-out infinite 0.5s',
            }}
        />
    </div>
);

const RingGauge = ({
    value,
    color,
    size = 80,
    strokeWidth = 6,
    label,
    showValue = true,
    secondaryValue,
    secondaryColor,
}) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = (circ * Math.min(value, 100)) / 100;
    const r2 = r - strokeWidth - 3;
    const circ2 = 2 * Math.PI * r2;
    const filled2 = secondaryValue !== null ? (circ2 * Math.min(secondaryValue, 100)) / 100 : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={`${THEME.grid}45`}
                    strokeWidth={strokeWidth}
                />
                {/* Main arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                        transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        filter: `drop-shadow(0 0 6px ${color}60) drop-shadow(0 0 12px ${color}30)`,
                    }}
                />
                {/* Optional inner ring */}
                {secondaryValue !== null && (
                    <>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={`${THEME.grid}35`}
                            strokeWidth={strokeWidth - 1.5}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={secondaryColor}
                            strokeWidth={strokeWidth - 1.5}
                            strokeDasharray={`${filled2} ${circ2 - filled2}`}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{
                                transition: 'stroke-dasharray 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
                                filter: `drop-shadow(0 0 5px ${secondaryColor}50) drop-shadow(0 0 10px ${secondaryColor}25)`,
                            }}
                        />
                    </>
                )}
            </svg>
            {showValue && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <span
                        className="ov-mono"
                        style={{ fontSize: size > 70 ? 17 : 10, fontWeight: 700, color, lineHeight: 1 }}
                    >
                        {value}%
                    </span>
                    {label && (
                        <span
                            style={{
                                fontSize: 7.5,
                                color: THEME.textDim,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginTop: 1,
                            }}
                        >
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

const MiniSparkline = ({ data = [], color = THEME.primary, width = 64, height = 20, filled = true }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data),
        max = Math.max(...data),
        range = max - min || 1;
    const pts = data
        .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
        .join(' ');
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
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: THEME.glassHeavy,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
        >
            {label && (
                <div
                    className="ov-mono"
                    style={{ fontWeight: 700, color: THEME.textMain, marginBottom: 6, fontSize: 11 }}
                >
                    {label}
                </div>
            )}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color || p.fill }} />
                    <span style={{ color: THEME.textMuted, flex: 1 }}>{p.name}:</span>
                    <span className="ov-mono" style={{ fontWeight: 700, color: p.color || p.fill }}>
                        {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

const Divider = ({ style = {} }) => (
    <div
        style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${THEME.glassBorder}, transparent)`,
            ...style,
        }}
    />
);

/* ── Helpers ── */
const fmtNum = (n) => {
    if (n === null) return '—';
    const v = Number(n);
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return String(Math.round(v));
};
const fmtRelTime = (isoStr) => {
    if (!isoStr) return 'Never';
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
};
/* sparkline removed — no historical data available from single-snapshot queries */

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: ENVIRONMENT SWITCHER
   ═══════════════════════════════════════════════════════════════════════════ */
/* Environments are derived from the active connection — no hardcoded list */
const ENVIRONMENTS = [];

const EnvSwitcher = ({ currentEnv, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const env = ENVIRONMENTS.find((e) => e.id === currentEnv) || ENVIRONMENTS[0];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 12,
                    background: `${env.color}12`,
                    border: `1px solid ${env.color}28`,
                    cursor: 'pointer',
                    color: env.color,
                    transition: 'all 0.18s ease',
                    boxShadow: `0 0 8px ${env.color}20`,
                }}
            >
                <env.icon size={12} />
                <span className="ov-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>
                    {env.label}
                </span>
                <ChevronDown
                    size={10}
                    style={{ transition: 'transform 0.18s', transform: open ? 'rotate(180deg)' : 'none' }}
                />
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        zIndex: 200,
                        background: THEME.glassHeavy,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        minWidth: 240,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ padding: '8px 12px 6px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <span
                            style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: THEME.textDim,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Switch Environment
                        </span>
                    </div>
                    {ENVIRONMENTS.map((e) => (
                        <button
                            key={e.id}
                            onClick={() => {
                                onChange(e.id);
                                setOpen(false);
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '11px 14px',
                                background: e.id === currentEnv ? `${e.color}10` : 'transparent',
                                border: 'none',
                                borderBottom: `1px solid ${THEME.glassBorder}20`,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(ev) => {
                                ev.currentTarget.style.background = `${e.color}08`;
                            }}
                            onMouseLeave={(ev) => {
                                ev.currentTarget.style.background =
                                    e.id === currentEnv ? `${e.color}10` : 'transparent';
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    background: `${e.color}16`,
                                    border: `1px solid ${e.color}28`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: `0 0 8px ${e.color}25`,
                                }}
                            >
                                <e.icon size={14} color={e.color} />
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: e.id === currentEnv ? e.color : THEME.textMain,
                                    }}
                                >
                                    {e.label}
                                </div>
                                <div className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 1 }}>
                                    {e.host}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                <StatusBadge label={`PG ${e.pg}`} color={e.color} />
                                {e.id === currentEnv && (
                                    <span style={{ fontSize: 8.5, color: e.color, fontWeight: 700 }}>ACTIVE</span>
                                )}
                            </div>
                        </button>
                    ))}
                    <div style={{ padding: '6px 12px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Boxes size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 9.5, color: THEME.textDim }}>{ENVIRONMENTS.length > 0 ? `${ENVIRONMENTS.length} environments configured` : 'No environments'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: NOTIFICATION BELL
   ═══════════════════════════════════════════════════════════════════════════ */
/* Alerts are fetched from /api/overview/alerts — no mock data */

const SEVERITY_COLOR = { critical: '#ef4444', warning: '#f59e0b', info: '#00b874' };
const SEVERITY_ICON = { critical: AlertCircle, warning: AlertTriangle, info: Info };

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [bellAnim, setBellAnim] = useState(false);
    const ref = useRef(null);
    const unread = alerts.filter((a) => !a.read).length;

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (unread > 0) {
            const t = setInterval(() => {
                setBellAnim(true);
                setTimeout(() => setBellAnim(false), 1300);
            }, 6000);
            return () => clearInterval(t);
        }
    }, [unread]);

    const markAllRead = () => setAlerts((al) => al.map((a) => ({ ...a, read: true })));
    const dismiss = (id) => setAlerts((al) => al.filter((a) => a.id !== id));

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Notifications"
                title="Notifications"
                style={{
                    position: 'relative',
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${unread > 0 ? `${SEVERITY_COLOR.critical}40` : THEME.glassBorder}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: unread > 0 ? `0 0 12px ${SEVERITY_COLOR.critical}30` : 'none',
                }}
            >
                {unread > 0 ? (
                    <BellRing size={15} color={SEVERITY_COLOR.critical} className={bellAnim ? 'ov-bell-anim' : ''} />
                ) : (
                    <Bell size={15} color={THEME.textMuted} />
                )}
                {unread > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            padding: '0 4px',
                            background: SEVERITY_COLOR.critical,
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: THEME.fontMono,
                            boxShadow: `0 0 8px ${SEVERITY_COLOR.critical}60`,
                            animation: 'ovPulse 2s ease-in-out infinite',
                        }}
                    >
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        zIndex: 200,
                        background: THEME.glassHeavy,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        width: 320,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div
                        style={{
                            padding: '10px 14px',
                            borderBottom: `1px solid ${THEME.glassBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BellRing size={13} color={unread > 0 ? SEVERITY_COLOR.critical : THEME.textMuted} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>Alerts</span>
                            {unread > 0 && <StatusBadge label={`${unread} unread`} color={SEVERITY_COLOR.critical} />}
                        </div>
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{
                                    fontSize: 10,
                                    color: THEME.primary,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                        {alerts.length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: THEME.textDim, fontSize: 12 }}>
                                <CheckCircle
                                    size={20}
                                    color={THEME.success}
                                    style={{ marginBottom: 8, opacity: 0.7 }}
                                />
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
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        padding: '11px 14px',
                                        background: a.read ? 'transparent' : `${sc}06`,
                                        borderBottom: `1px solid ${THEME.glassBorder}20`,
                                        borderLeft: a.read ? '2px solid transparent' : `2px solid ${sc}`,
                                    }}
                                >
                                    <SIcon size={13} color={sc} style={{ marginTop: 1, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 11.5,
                                                color: a.read ? THEME.textMuted : THEME.textMain,
                                                fontWeight: a.read ? 400 : 600,
                                                lineHeight: 1.35,
                                            }}
                                        >
                                            {a.title}
                                        </div>
                                        <div
                                            className="ov-mono"
                                            style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 3 }}
                                        >
                                            {a.time}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismiss(a.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: THEME.textDim,
                                            padding: 0,
                                            opacity: 0.6,
                                        }}
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        style={{
                            padding: '8px 14px',
                            borderTop: `1px solid ${THEME.glassBorder}`,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontSize: 10.5, color: THEME.primary, fontWeight: 600, cursor: 'pointer' }}>
                            View all alerts →
                        </span>
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
    { label: '5s', value: 5000 },
    { label: '15s', value: 15000 },
    { label: '30s', value: 30000 },
    { label: '60s', value: 60000 },
    { label: 'Off', value: 0 },
];

const RefreshControl = ({ interval, setInterval: setIv, onManualRefresh, loading }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const cur = REFRESH_OPTIONS.find((o) => o.value === interval) || REFRESH_OPTIONS[0];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Manual refresh button */}
            <button
                onClick={onManualRefresh}
                disabled={loading}
                aria-label="Refresh data"
                title="Refresh"
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${THEME.glassBorder}`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.5 : 1,
                }}
            >
                <RefreshCw
                    size={13}
                    color={THEME.textMuted}
                    style={{ animation: loading ? 'ovRotate 0.8s linear infinite' : 'none' }}
                />
            </button>

            {/* Interval picker */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label={interval === 0 ? "Resume auto-refresh" : "Pause auto-refresh"}
                title="Toggle auto-refresh"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 10,
                    height: 32,
                    background: interval === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${interval === 0 ? '#ef444440' : THEME.glassBorder}`,
                    cursor: 'pointer',
                    color: interval === 0 ? '#ef4444' : THEME.textMuted,
                    transition: 'all 0.15s',
                    boxShadow: interval === 0 ? '0 0 8px #ef444430' : 'none',
                }}
            >
                {interval === 0 ? <Pause size={11} /> : <Play size={11} />}
                <span className="ov-mono" style={{ fontSize: 10.5, fontWeight: 700 }}>
                    {cur.label}
                </span>
                <ChevronDown
                    size={9}
                    style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
                />
            </button>

            {open && (
                <div
                    className="ov-env-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        zIndex: 200,
                        background: THEME.glassHeavy,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${THEME.glassBorder}`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        minWidth: 140,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div style={{ padding: '7px 11px 5px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <span
                            style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: THEME.textDim,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Refresh interval
                        </span>
                    </div>
                    {REFRESH_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setIv(opt.value);
                                setOpen(false);
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '9px 12px',
                                background: opt.value === interval ? `${THEME.primary}12` : 'transparent',
                                border: 'none',
                                borderBottom: `1px solid ${THEME.glassBorder}15`,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                            }}
                            onMouseEnter={(ev) => {
                                if (opt.value !== interval)
                                    ev.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={(ev) => {
                                if (opt.value !== interval) ev.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <span
                                className="ov-mono"
                                style={{
                                    fontSize: 11.5,
                                    color: opt.value === interval ? THEME.primary : THEME.textMuted,
                                    fontWeight: opt.value === interval ? 700 : 400,
                                }}
                            >
                                {opt.label}
                            </span>
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
    const envData = ENVIRONMENTS.find((e) => e.id === environment) || ENVIRONMENTS[0];
    return (
        <div
            className="ov-pg-badge"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${envData.color}12, ${envData.color}08)`,
                border: `1px solid ${envData.color}28`,
                boxShadow: `0 0 8px ${envData.color}18`,
            }}
        >
            <div
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: 8,
                    background: `${envData.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Database size={10} color={envData.color} />
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span
                        className="ov-mono"
                        style={{ fontSize: 10.5, fontWeight: 700, color: envData.color, lineHeight: 1 }}
                    >
                        PostgreSQL {version}
                    </span>
                </div>
                <div className="ov-mono" style={{ fontSize: 8.5, color: THEME.textDim, marginTop: 1, lineHeight: 1 }}>
                    x86_64-linux-gnu
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: LAST BACKUP CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const BackupStatusCard = ({ lastBackup }) => {
    const backup = lastBackup || {
        timestamp: null,
        sizeGB: 0,
        type: 'N/A',
        status: 'unknown',
        duration: 'N/A',
        nextScheduled: 'N/A',
    };
    const isOld = backup.timestamp ? (Date.now() - new Date(backup.timestamp).getTime() > 26 * 3600 * 1000) : false;
    const statusColor = backup.status === 'success' ? THEME.success : backup.status === 'unknown' ? THEME.textDim : THEME.danger;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '16px 18px',
                borderRadius: 12,
                background: THEME.glass,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isOld ? `${THEME.warning}30` : THEME.glassBorder}`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isOld
                    ? `0 0 0 1px ${THEME.warning}12, 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.06)`
                    : `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)`,
            }}
            className={isOld ? 'ov-glow-warn' : ''}
        >
            <div className="ov-card-shine" />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: `${statusColor}14`,
                            border: `1px solid ${statusColor}28`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 8px ${statusColor}25`,
                        }}
                    >
                        <HardDriveDownload size={15} color={statusColor} />
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: THEME.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                lineHeight: 1,
                            }}
                        >
                            Last Backup
                        </div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>
                            {backup.type} backup
                        </div>
                    </div>
                </div>
                <StatusBadge label={backup.status === 'success' ? 'Verified' : backup.status === 'unknown' ? 'No data' : 'FAILED'} color={statusColor} />
            </div>

            {/* Main value */}
            <div>
                <div
                    className="ov-mono"
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: isOld ? THEME.warning : THEME.textMain,
                        lineHeight: 1,
                        letterSpacing: '-0.01em',
                    }}
                >
                    {fmtRelTime(backup.timestamp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: THEME.textDim }}>
                        <strong style={{ color: THEME.textMuted }}>{backup.sizeGB} GB</strong> compressed
                    </span>
                    <span style={{ fontSize: 11, color: THEME.textDim }}>
                        took <strong style={{ color: THEME.textMuted }}>{backup.duration}</strong>
                    </span>
                </div>
            </div>

            {/* Next scheduled */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    paddingTop: 8,
                    borderTop: `1px solid ${THEME.glassBorder}`,
                }}
            >
                <Clock size={9} color={THEME.textDim} />
                <span style={{ fontSize: 10, color: THEME.textDim }}>
                    Next scheduled: <strong style={{ color: THEME.textMuted }}>{backup.nextScheduled}</strong>
                </span>
                {isOld && <StatusBadge label="OVERDUE" color={THEME.warning} style={{ marginLeft: 'auto' }} />}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: LONG-RUNNING TRANSACTIONS CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const formatDuration = (totalSec) => {
    const sec = Math.round(Number(totalSec) || 0);
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
};

const LongTxnCard = ({ data }) => {
    const txns = (Array.isArray(data) ? data : []).map(t => ({
        pid: t.pid,
        duration: t.duration || formatDuration(t.txn_duration_sec || t.query_duration_sec || 0),
        query: t.query || 'Unknown query',
        state: t.state || 'unknown',
        waitEvent: t.waitEvent || t.wait_event || null,
    }));

    if (txns.length === 0) {
        return (
            <div
                style={{
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: THEME.glass,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${THEME.glassBorder}`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow:
                        '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)',
                }}
            >
                <div className="ov-card-shine" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                background: `${THEME.success}14`,
                                border: `1px solid ${THEME.success}28`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 8px ${THEME.success}25`,
                            }}
                        >
                            <Hourglass size={15} color={THEME.success} />
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: THEME.textMuted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    lineHeight: 1,
                                }}
                            >
                                Long-Running Txns
                            </div>
                            <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>
                                threshold: &gt; 1m
                            </div>
                        </div>
                    </div>
                    <div
                        className="ov-mono"
                        style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: THEME.success,
                            lineHeight: 1,
                        }}
                    >
                        0
                    </div>
                </div>
                <div style={{ fontSize: 10.5, color: THEME.textDim, textAlign: 'center', padding: '12px 0' }}>
                    No long-running transactions detected
                </div>
            </div>
        );
    }

    const maxDurMs = Math.max(
        ...txns.map((t) => {
            const [m, s] = t.duration.replace('m ', ':').replace('s', '').split(':').map(Number);
            return (m * 60 + s) * 1000;
        }),
    );

    return (
        <div
            style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: THEME.glass,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${THEME.glassBorder}`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow:
                    '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)',
            }}
        >
            <div className="ov-card-shine" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: `${THEME.warning}14`,
                            border: `1px solid ${THEME.warning}28`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 8px ${THEME.warning}25`,
                        }}
                    >
                        <Hourglass size={15} color={THEME.warning} />
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: THEME.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                lineHeight: 1,
                            }}
                        >
                            Long-Running Txns
                        </div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>
                            threshold: &gt; 1m
                        </div>
                    </div>
                </div>
                <div
                    className="ov-mono"
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: txns.length > 0 ? THEME.warning : THEME.success,
                        lineHeight: 1,
                    }}
                >
                    {txns.length}
                </div>
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
                                    <span className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim }}>
                                        PID {t.pid}
                                    </span>
                                    {t.waitEvent && <StatusBadge label={`Wait: ${t.waitEvent}`} color={THEME.danger} />}
                                    {isIdle && <StatusBadge label="Idle in Txn" color={THEME.warning} />}
                                </div>
                                <span
                                    className="ov-mono"
                                    style={{
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        color: i === 0 ? THEME.danger : THEME.warning,
                                    }}
                                >
                                    {t.duration}
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: THEME.textDim,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                }}
                            >
                                {t.query}
                            </div>
                            <div
                                style={{
                                    height: 4,
                                    borderRadius: 10,
                                    background: `${THEME.grid}50`,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    className="ov-bar-animate"
                                    style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        borderRadius: 10,
                                        background:
                                            i === 0
                                                ? `linear-gradient(90deg, ${THEME.danger}70, ${THEME.danger})`
                                                : `linear-gradient(90deg, ${THEME.warning}70, ${THEME.warning})`,
                                        animationDelay: `${i * 0.1}s`,
                                        boxShadow: i === 0 ? `0 0 6px ${THEME.danger}50` : `0 0 6px ${THEME.warning}40`,
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
    const raw = data || {};
    const summary = raw.summary || raw;
    const vacuum = {
        urgentCount: summary.urgentCount || summary.urgent || 0,
        warnCount: summary.warnCount || summary.warn || 0,
        healthyCount: summary.healthyCount || summary.healthy || 0,
        lastRunTable: summary.lastRunTable || (Array.isArray(raw.tables) && raw.tables.length > 0 ? `${raw.tables[0].schemaname || 'public'}.${raw.tables[0].relname || ''}` : 'N/A'),
        lastRunAgo: summary.lastRunAgo || 'N/A',
        bloatPct: Number(summary.bloatPct || summary.avgBloatPct || 0),
        deadTuples: Number(summary.deadTuples || summary.totalDeadTuples || 0),
    };
    const total = vacuum.urgentCount + vacuum.warnCount + vacuum.healthyCount;
    const urgentPct = Math.round((vacuum.urgentCount / total) * 100);
    const warnPct = Math.round((vacuum.warnCount / total) * 100);
    const healthPct = 100 - urgentPct - warnPct;

    const urgentColor = vacuum.urgentCount > 3 ? THEME.danger : THEME.warning;

    return (
        <div
            style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: THEME.glass,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${vacuum.urgentCount > 3 ? `${THEME.danger}28` : THEME.glassBorder}`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow:
                    vacuum.urgentCount > 3
                        ? `0 0 0 1px ${THEME.danger}12, 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.06)`
                        : `0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)`,
            }}
            className={vacuum.urgentCount > 3 ? 'ov-glow-warn' : ''}
        >
            <div className="ov-card-shine" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: `${urgentColor}14`,
                            border: `1px solid ${urgentColor}28`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 8px ${urgentColor}25`,
                        }}
                        className={vacuum.urgentCount > 3 ? 'ov-vacuum-urgent' : ''}
                    >
                        <Leaf size={15} color={urgentColor} />
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: THEME.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                lineHeight: 1,
                            }}
                        >
                            Vacuum Health
                        </div>
                        <div className="ov-mono" style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>
                            {total} tables tracked
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div
                        className="ov-mono"
                        style={{ fontSize: 22, fontWeight: 800, color: urgentColor, lineHeight: 1 }}
                    >
                        {vacuum.urgentCount}
                    </div>
                    <div
                        style={{
                            fontSize: 9,
                            color: THEME.textDim,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }}
                    >
                        urgent
                    </div>
                </div>
            </div>

            {/* Stacked bar */}
            <div
                style={{
                    height: 7,
                    borderRadius: 14,
                    background: `${THEME.grid}50`,
                    overflow: 'hidden',
                    display: 'flex',
                    marginBottom: 8,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                }}
            >
                <div
                    style={{
                        width: `${urgentPct}%`,
                        height: '100%',
                        background: THEME.danger,
                        transition: 'width 0.9s ease',
                        boxShadow: `0 0 8px ${THEME.danger}40`,
                    }}
                />
                <div
                    style={{
                        width: `${warnPct}%`,
                        height: '100%',
                        background: THEME.warning,
                        transition: 'width 0.9s ease 0.05s',
                        boxShadow: `0 0 6px ${THEME.warning}30`,
                    }}
                />
                <div
                    style={{
                        flex: 1,
                        height: '100%',
                        background: `${THEME.success}60`,
                        transition: 'width 0.9s ease 0.1s',
                        boxShadow: `0 0 6px ${THEME.success}25`,
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10,
                    color: THEME.textDim,
                    marginBottom: 10,
                }}
            >
                <span style={{ color: THEME.danger }}>{vacuum.urgentCount} urgent</span>
                <span style={{ color: THEME.warning }}>{vacuum.warnCount} soon</span>
                <span style={{ color: THEME.success }}>{vacuum.healthyCount} healthy</span>
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: THEME.textDim }}>
                    Dead tuples:{' '}
                    <strong className="ov-mono" style={{ color: THEME.textMuted }}>
                        {fmtNum(vacuum.deadTuples)}
                    </strong>
                </div>
                <div style={{ fontSize: 10, color: THEME.textDim }}>
                    Bloat:{' '}
                    <strong className="ov-mono" style={{ color: vacuum.bloatPct > 10 ? THEME.danger : THEME.warning }}>
                        {vacuum.bloatPct}%
                    </strong>
                </div>
            </div>
            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                Last run: <strong style={{ color: THEME.textMuted }}>{vacuum.lastRunTable}</strong>{' '}
                <span className="ov-mono">{vacuum.lastRunAgo}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONNECTION STATUS BANNER
   Shows the active DB connection prominently on the Overview and
   offers an onboarding card when no connections have been added yet.
   ═══════════════════════════════════════════════════════════════════════════ */

const ConnectionStatusBanner = () => {
    const { connections, activeConnection, activeConnectionId, loading, switchConnection } = useConnection();
    const nav = useNavigation();
    const [switching, setSwitching] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    const goToPool = () => nav?.goToTab('connections');

    // ── No connections at all → full onboarding card ──
    if (!loading && connections.length === 0) {
        return (
            <div
                style={{
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${THEME.primary}10, ${THEME.secondary || THEME.primary}08)`,
                    border: `1px dashed ${THEME.primary}50`,
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        flexShrink: 0,
                        background: `${THEME.primary}15`,
                        border: `1px solid ${THEME.primary}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Database size={28} color={THEME.primary} />
                </div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                        Connect your first database
                    </div>
                    <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6, maxWidth: 520 }}>
                        VIGIL needs a PostgreSQL connection to show live metrics. Add your host, port, database name and
                        credentials to get started.
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { icon: Server, label: 'Host & Port' },
                            { icon: Database, label: 'Database name' },
                            { icon: Shield, label: 'Credentials' },
                            { icon: Lock, label: 'SSL / SSH optional' },
                        ].map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    fontSize: 11,
                                    color: THEME.textMuted,
                                    fontFamily: 'monospace',
                                    padding: '3px 10px',
                                    borderRadius: 20,
                                    background: `${THEME.primary}10`,
                                    border: `1px solid ${THEME.primary}25`,
                                }}
                            >
                                <Icon size={10} color={THEME.primary} /> {label}
                            </span>
                        ))}
                    </div>
                </div>
                {/* CTA */}
                <button
                    onClick={goToPool}
                    style={{
                        flexShrink: 0,
                        padding: '11px 22px',
                        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: `0 4px 18px ${THEME.primary}40`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'transform 0.12s, box-shadow 0.12s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = `0 6px 24px ${THEME.primary}55`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = `0 4px 18px ${THEME.primary}40`;
                    }}
                >
                    <Network size={14} /> Add Connection
                </button>
            </div>
        );
    }

    // ── Has connections → show active connection bar ──
    if (!activeConnection || dismissed) return null;

    const statusColor =
        activeConnection.status === 'success'
            ? THEME.success
            : activeConnection.status === 'failed'
              ? THEME.danger
              : THEME.warning;
    const connStr = `${activeConnection.host}:${activeConnection.port}/${activeConnection.database}`;
    const hasMultiple = connections.length > 1;

    return (
        <div
            style={{
                borderRadius: 14,
                background: THEME.glass,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${statusColor}28`,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
            }}
        >
            {/* Status dot */}
            <span
                style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: statusColor,
                    boxShadow: `0 0 7px ${statusColor}`,
                    animation: activeConnection.status === 'success' ? 'dotBlink 2.5s ease-in-out infinite' : 'none',
                }}
            />

            {/* DB icon */}
            <Database size={14} color={THEME.primary} style={{ flexShrink: 0 }} />

            {/* Name + connection string */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                        {activeConnection.name}
                    </span>
                    <span
                        style={{
                            fontSize: 10,
                            color: statusColor,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        ● {activeConnection.status || 'untested'}
                    </span>
                    {activeConnection.ssl && (
                        <span
                            style={{
                                fontSize: 10,
                                color: THEME.success,
                                background: `${THEME.success}18`,
                                padding: '1px 7px',
                                borderRadius: 20,
                                fontFamily: 'monospace',
                            }}
                        >
                            SSL
                        </span>
                    )}
                    {activeConnection.sshEnabled && (
                        <span
                            style={{
                                fontSize: 10,
                                color: '#00e5a0',
                                background: '#00e5a018',
                                padding: '1px 7px',
                                borderRadius: 20,
                                fontFamily: 'monospace',
                            }}
                        >
                            SSH
                        </span>
                    )}
                </div>
                <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                    {activeConnection.username}@{connStr}
                </span>
            </div>

            {/* Switch buttons for other connections */}
            {hasMultiple && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: THEME.textDim, marginRight: 2 }}>Switch:</span>
                    {connections
                        .filter((c) => c.id !== activeConnectionId)
                        .slice(0, 3)
                        .map((c) => (
                            <button
                                key={c.id}
                                onClick={async () => {
                                    setSwitching(c.id);
                                    try {
                                        await switchConnection(c.id);
                                    } finally {
                                        setSwitching(null);
                                    }
                                }}
                                disabled={switching === c.id}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                    background: switching === c.id ? `${THEME.primary}20` : `${THEME.primary}12`,
                                    border: `1px solid ${THEME.primary}30`,
                                    color: THEME.primary,
                                    fontWeight: 500,
                                    transition: 'all 0.15s',
                                    opacity: switching && switching !== c.id ? 0.5 : 1,
                                }}
                            >
                                {switching === c.id ? '…' : c.name}
                            </button>
                        ))}
                    {connections.length > 4 && (
                        <span style={{ fontSize: 11, color: THEME.textDim }}>+{connections.length - 4} more</span>
                    )}
                </div>
            )}

            {/* Manage link */}
            <button
                onClick={goToPool}
                style={{
                    flexShrink: 0,
                    padding: '5px 12px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    background: 'transparent',
                    border: `1px solid ${THEME.border}`,
                    color: THEME.textMuted,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME.primary;
                    e.currentTarget.style.color = THEME.primary;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = THEME.border;
                    e.currentTarget.style.color = THEME.textMuted;
                }}
            >
                <Network size={11} /> Manage
            </button>

            {/* Dismiss */}
            <button
                onClick={() => setDismissed(true)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: THEME.textDim,
                    padding: 2,
                    flexShrink: 0,
                }}
                title="Dismiss"
            >
                <X size={13} />
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

// ── localStorage cache for instant render on refresh ──
const OV_CACHE_KEY = 'vigil_overview_cache';
function readOverviewCache() {
    try {
        const raw = localStorage.getItem(OV_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Expire cache after 2 minutes
        if (parsed._ts && Date.now() - parsed._ts > 120_000) return null;
        return parsed;
    } catch { return null; }
}
function writeOverviewCache(obj) {
    try { localStorage.setItem(OV_CACHE_KEY, JSON.stringify({ ...obj, _ts: Date.now() })); } catch {}
}

const OverviewTab = () => {
    useAdaptiveTheme(); // keeps THEME in sync with dark/light toggle
    const { activeConnection, loading: connectionsLoading } = useConnection();

    // Hydrate from localStorage so the dashboard renders instantly on refresh
    const cachedOv = useMemo(() => readOverviewCache(), []);
    const [data, setData] = useState(cachedOv?.data ?? null);
    const [loading, setLoading] = useState(!cachedOv?.data);
    const [refreshing, setRefreshing] = useState(false);
    const [tick, setTick] = useState(0);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    // Environment switcher removed — data comes from the real connected database
    const intervalRef = useRef(null);
    const [longTxns, setLongTxns] = useState(cachedOv?.longTxns ?? []);
    const [vacuumData, setVacuumData] = useState(cachedOv?.vacuumData ?? null);
    const [backupData, setBackupData] = useState(cachedOv?.backupData ?? null);
    const [replicationData, setReplicationData] = useState(cachedOv?.replicationData ?? null);
    const [topTables, setTopTables] = useState(cachedOv?.topTables ?? []);
    const [timeseriesData, setTimeseriesData] = useState(cachedOv?.timeseriesData ?? null);
    const [alertsData, setAlertsData] = useState(cachedOv?.alertsData ?? []);

    /* ── Live datasets (no synthetic generation) ── */
    const velocityData = useMemo(() => {
        if (timeseriesData?.velocity && Array.isArray(timeseriesData.velocity) && timeseriesData.velocity.length > 0) {
            return timeseriesData.velocity.map(v => ({
                time: v.time || v.t || '',
                qps: Number(v.qps || 0),
                tps: Number(v.tps || 0),
            }));
        }
        // Single current-snapshot point derived from cumulative counters
        const baseQps = Number(data?.traffic?.tup_fetched || 0) > 0 ? Math.round(Number(data?.traffic?.tup_fetched || 0) / Math.max(Number(data?.stats?.uptimeSeconds || 3600), 1)) : 0;
        const baseTps = Number(data?.traffic?.xact_commit || 0) > 0 ? Math.round(Number(data?.traffic?.xact_commit || 0) / Math.max(Number(data?.stats?.uptimeSeconds || 3600), 1)) : 0;
        const now = new Date();
        return [{ time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, qps: baseQps, tps: baseTps }];
    }, [timeseriesData, data]);

    const opsPerSec = useMemo(() => {
        if (timeseriesData?.opsPerSec && Array.isArray(timeseriesData.opsPerSec) && timeseriesData.opsPerSec.length > 0) {
            return timeseriesData.opsPerSec;
        }
        // Single-point snapshot from cumulative traffic counters
        return [{ t: 'Now', reads: Number(data?.traffic?.tup_fetched || 0), writes: Number(data?.traffic?.tup_inserted || 0) + Number(data?.traffic?.tup_updated || 0) + Number(data?.traffic?.tup_deleted || 0), commits: 0 }];
    }, [timeseriesData, data]);

    const txnLatencyData = useMemo(() => {
        if (timeseriesData?.latency && Array.isArray(timeseriesData.latency) && timeseriesData.latency.length > 0) {
            return timeseriesData.latency.map((v, i) => ({
                i,
                p50: Number(v.p50 || 0),
                p95: Number(v.p95 || 0),
                p99: Number(v.p99 || 0),
            }));
        }
        /* No latency percentile data available without pg_stat_statements histograms */
        return [];
    }, [timeseriesData]);

    /* No sparkline history — single-snapshot metrics only */

    const load = useCallback(async (isManual = false) => {
        if (!activeConnection) { setLoading(false); return; }
        if (isManual) setRefreshing(true);
        try {
            const withTimeout = (p, ms = 5000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
            const [statsRes, trafficRes, longTxnRes, vacuumRes, backupRes, replicationRes, topTablesRes, timeseriesRes, alertsRes] = await Promise.allSettled([
                withTimeout(fetchData('/api/overview/stats')),
                withTimeout(fetchData('/api/overview/traffic')),
                withTimeout(fetchData('/api/overview/long-transactions')),
                withTimeout(fetchData('/api/overview/vacuum')),
                withTimeout(fetchData('/api/overview/backup')),
                withTimeout(fetchData('/api/overview/replication')),
                withTimeout(fetchData('/api/overview/top-tables')),
                withTimeout(fetchData('/api/overview/timeseries')),
                withTimeout(fetchData('/api/overview/alerts')),
            ]);
            const val = (r) => (r.status === 'fulfilled' && !r.value?.error ? r.value : null);
            const newData = {
                stats: val(statsRes) || { activeConnections: 0, maxConnections: 0, uptimeSeconds: 0, diskUsedGB: 0, indexHitRatio: '0.0' },
                traffic: val(trafficRes) || { tup_fetched: 0, tup_inserted: 0, tup_updated: 0, tup_deleted: 0 },
            };
            setData(newData);

            const longTxnData = val(longTxnRes);
            const newLongTxns = Array.isArray(longTxnData) ? longTxnData : (longTxnData?.transactions || []);
            setLongTxns(newLongTxns);

            const newVacuumData = val(vacuumRes);
            const newBackupData = val(backupRes);
            const newReplicationData = val(replicationRes);
            setVacuumData(newVacuumData);
            setBackupData(newBackupData);
            setReplicationData(newReplicationData);

            const ttData = val(topTablesRes);
            const newTopTables = Array.isArray(ttData) ? ttData : (ttData?.tables || []);
            setTopTables(newTopTables);

            const newTimeseriesData = val(timeseriesRes);
            setTimeseriesData(newTimeseriesData);

            const aData = val(alertsRes);
            const newAlertsData = Array.isArray(aData) ? aData : (aData?.alerts || []);
            setAlertsData(newAlertsData);

            // Persist to localStorage for instant render on next refresh
            writeOverviewCache({
                data: newData, longTxns: newLongTxns, vacuumData: newVacuumData,
                backupData: newBackupData, replicationData: newReplicationData,
                topTables: newTopTables, timeseriesData: newTimeseriesData,
                alertsData: newAlertsData,
            });
        } catch (e) {
            console.error('Overview load failed', e);
            setData({
                stats: { activeConnections: 0, maxConnections: 0, uptimeSeconds: 0, diskUsedGB: 0, indexHitRatio: '0.0' },
                traffic: { tup_fetched: 0, tup_inserted: 0, tup_updated: 0, tup_deleted: 0 },
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setTick((t) => t + 1);
        }
    }, [activeConnection]);

    useEffect(() => {
        if (activeConnection) {
            load();
        } else {
            // If no active connection yet, stop showing the loading skeleton
            // (the !activeConnection guard below will show the welcome screen)
            setLoading(false);
        }
    }, [activeConnection]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (activeConnection && refreshInterval > 0) {
            intervalRef.current = setInterval(() => load(), refreshInterval);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [refreshInterval, load, activeConnection]);

    /* ── Guard: no active connection — show welcome with demo links ── */
    /* During initial loading, show the loading skeleton instead of the welcome screen */
    if (!activeConnection && !connectionsLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, minHeight: 400 }}>
                <OvStyles />
                <div style={{ textAlign: 'center', maxWidth: 480 }}>
                    <Database size={48} color={THEME.primary} style={{ marginBottom: 16, opacity: 0.7 }} />
                    <div style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>Welcome to VIGIL</div>
                    <div style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 24 }}>Connect a database to monitor it, or explore the interactive demos from the sidebar.</div>
                </div>
            </div>
        );
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
                <OvStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: 110,
                                borderRadius: 14,
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                opacity: 0.4,
                                animation: `ovPulse 1.5s ease-in-out infinite`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
                    <div
                        style={{
                            height: 320,
                            borderRadius: 16,
                            background: THEME.glass,
                            border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.2,
                            animation: 'ovPulse 1.5s ease-in-out infinite 0.5s',
                        }}
                    />
                    <div
                        style={{
                            height: 320,
                            borderRadius: 16,
                            background: THEME.glass,
                            border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.2,
                            animation: 'ovPulse 1.5s ease-in-out infinite 0.65s',
                        }}
                    />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <OvStyles />
                <AlertTriangle size={32} color={THEME.warning} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 16 }}>
                    Unable to load dashboard data.
                </div>
                <button
                    onClick={() => load(true)}
                    style={{
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: THEME.glass,
                        color: THEME.text,
                        cursor: 'pointer',
                        fontSize: 13,
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const { stats, traffic } = data;

    /* ── Derived values ── */
    const activeConns = Number(stats?.activeConnections || 0);
    const maxConns = Number(stats?.maxConnections || 100);
    const connPct = Math.round((activeConns / maxConns) * 100);
    const cacheHit = Number(stats?.indexHitRatio || 0);
    const diskGB = Number(stats?.diskUsedGB || 0);
    const uptimeHrs = (Number(stats?.uptimeSeconds || 0) / 3600).toFixed(1);
    const pgVersion = stats?.pgVersion || '';

    const fetched = Number(traffic?.tup_fetched || 0);
    const inserted = Number(traffic?.tup_inserted || 0);
    const updated = Number(traffic?.tup_updated || 0);
    const deleted = Number(traffic?.tup_deleted || 0);
    const totalOps = fetched + inserted + updated + deleted;
    const readPct = totalOps > 0 ? Math.round((fetched / totalOps) * 100) : 75;
    const writePct = 100 - readPct;

    const throughputRows = [
        { label: 'Tuples Fetched', raw: fetched, color: THEME.primary, icon: Eye },
        { label: 'Tuples Inserted', raw: inserted, color: THEME.success, icon: ArrowUp },
        { label: 'Tuples Updated', raw: updated, color: THEME.warning, icon: RefreshCw },
        { label: 'Tuples Deleted', raw: deleted, color: THEME.danger, icon: ArrowDown },
    ];
    const maxThroughput = Math.max(...throughputRows.map((r) => r.raw), 1);

    const connColor = connPct > 85 ? THEME.danger : connPct > 65 ? THEME.warning : THEME.success;
    const cacheColor = cacheHit > 98 ? THEME.success : cacheHit > 95 ? THEME.warning : THEME.danger;

    const healthScore = Math.round(
        (cacheHit > 99 ? 30 : cacheHit > 95 ? 20 : 10) +
            (connPct < 70 ? 30 : connPct < 85 ? 20 : 10) +
            (diskGB < 150 ? 20 : diskGB < 180 ? 12 : 5) +
            20,
    );
    const healthColor = healthScore >= 80 ? THEME.success : healthScore >= 60 ? THEME.warning : THEME.danger;

    const workloadData = [
        { name: 'Reads', value: readPct, color: THEME.primary },
        { name: 'Writes', value: writePct > 0 ? writePct : 1, color: THEME.secondary },
    ];

    /* ── Hero metric cards (6 across — all real data, no sparklines or fake trends) ── */
    const metricCards = [
        {
            label: 'Active Sessions',
            value: `${activeConns}`,
            sub: `of ${maxConns} max`,
            color: connColor,
            icon: Activity,
            detail: `${connPct.toFixed(0)}% used`,
            healthy: connPct < 70,
        },
        {
            label: 'Cache Hit Ratio',
            value: `${cacheHit}%`,
            sub: cacheHit >= 99 ? 'Excellent' : cacheHit >= 95 ? 'Good' : 'Below target',
            color: cacheColor,
            icon: Zap,
            detail: cacheHit >= 95 ? 'On target' : 'Needs tuning',
            healthy: cacheHit >= 95,
        },
        {
            label: 'Database Size',
            value: `${diskGB}`,
            sub: 'GB on disk',
            color: THEME.warning,
            icon: Database,
            detail: '',
            healthy: true,
        },
        {
            label: 'Uptime',
            value: uptimeHrs,
            sub: 'hours',
            color: THEME.info || THEME.primary,
            icon: Clock,
            detail: '',
            healthy: true,
        },
        {
            label: 'Long Txns',
            value: String(longTxns.length),
            sub: '> 1 min',
            color: longTxns.length > 0 ? THEME.warning : THEME.success,
            icon: Hourglass,
            detail: longTxns.length > 0 ? `${longTxns.length} active` : 'None',
            healthy: longTxns.length === 0,
        },
        {
            label: 'Urgent Vacuum',
            value: String(vacuumData?.urgentCount || vacuumData?.urgent || 0),
            sub: 'tables',
            color: (vacuumData?.urgentCount || 0) > 0 ? THEME.danger : THEME.success,
            icon: Leaf,
            detail: `${vacuumData?.warnCount || vacuumData?.warn || 0} warn`,
            healthy: (vacuumData?.urgentCount || 0) === 0,
        },
    ];

    /* ══════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '12px 0 48px 0' }}>
            <OvStyles />

            {/* ═══════ Connection Status / Onboarding Banner ═══════ */}
            <ConnectionStatusBanner />

            {/* ═══════ Top Bar: Refresh Control Only ═══════ */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                    gap: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ov-mono" style={{ fontSize: 10, color: THEME.textDim, opacity: 0.5 }}>
                        #{tick}
                    </span>
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
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
                {metricCards.map((m, i) => (
                    <div
                        key={i}
                        className={`ov-metric-card ${i >= 4 ? 'ov-glow-warn' : 'ov-glow'}`}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            padding: '16px 18px',
                            borderRadius: 12,
                            background: THEME.glass,
                            backdropFilter: 'blur(14px)',
                            border: `1px solid ${i >= 4 ? `${m.color}28` : THEME.glassBorder}`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow:
                                i >= 4
                                    ? `0 0 0 1px ${m.color}12, inset 0 1px 2px rgba(255,255,255,0.08)`
                                    : `0 0 0 1px ${THEME.glassBorder}, inset 0 1px 2px rgba(255,255,255,0.06)`,
                        }}
                    >
                        <div className="ov-card-shine" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${m.color}12`,
                                    border: `1px solid ${m.color}20`,
                                    boxShadow: `0 0 8px ${m.color}25`,
                                }}
                            >
                                <m.icon size={15} color={m.color} />
                            </div>
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 9.5,
                                    color: THEME.textDim,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    lineHeight: 1,
                                    marginBottom: 5,
                                }}
                            >
                                {m.label}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span
                                    className="ov-mono"
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: m.color,
                                        lineHeight: 1,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {m.value}
                                </span>
                                <span style={{ fontSize: 10, color: THEME.textDim }}>{m.sub}</span>
                            </div>
                        </div>
                        {m.detail && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                {m.healthy ? (
                                    <CheckCircle size={10} color={THEME.success} />
                                ) : (
                                    <AlertTriangle size={10} color={THEME.warning} />
                                )}
                                <span
                                    className="ov-mono"
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: m.healthy ? THEME.success : THEME.warning,
                                    }}
                                >
                                    {m.detail}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ═══════ Row 2: Backup + LongTxns + Vacuum (new focused cards) ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <BackupStatusCard lastBackup={backupData} />
                <LongTxnCard data={longTxns.length > 0 ? longTxns : null} />
                <VacuumHealthCard data={vacuumData} />
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
                                {[
                                    ['QPS', THEME.primary],
                                    ['TPS', THEME.secondary],
                                ].map(([l, c]) => (
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
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: THEME.fontMono }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={4}
                                />
                                <YAxis
                                    tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: THEME.fontMono }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={36}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="qps"
                                    name="Queries/sec"
                                    stroke={THEME.primary}
                                    strokeWidth={2.5}
                                    fill="url(#ovGradQps)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tps"
                                    name="Txns/sec"
                                    stroke={THEME.secondary}
                                    strokeWidth={1.5}
                                    fill="url(#ovGradTps)"
                                    strokeDasharray="5 3"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Summary strip */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: `1px solid ${THEME.glassBorder}`,
                        }}
                    >
                        {[
                            {
                                label: 'Peak QPS',
                                value: Math.max(...velocityData.map((d) => d.qps)).toLocaleString(),
                                color: THEME.primary,
                            },
                            {
                                label: 'Avg QPS',
                                value: Math.round(
                                    velocityData.reduce((s, d) => s + d.qps, 0) / velocityData.length,
                                ).toLocaleString(),
                                color: THEME.primary,
                            },
                            {
                                label: 'Peak TPS',
                                value: Math.max(...velocityData.map((d) => d.tps)).toLocaleString(),
                                color: THEME.secondary,
                            },
                            {
                                label: 'Avg TPS',
                                value: Math.round(
                                    velocityData.reduce((s, d) => s + d.tps, 0) / velocityData.length,
                                ).toLocaleString(),
                                color: THEME.secondary,
                            },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: 9,
                                        color: THEME.textDim,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        marginBottom: 3,
                                    }}
                                >
                                    {s.label}
                                </div>
                                <div
                                    className="ov-mono"
                                    style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}
                                >
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* ── Right column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Health Score */}
                    <Panel title="Database Health" icon={Shield} accentColor={healthColor}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <RingGauge
                                value={healthScore}
                                color={healthColor}
                                size={88}
                                strokeWidth={7}
                                label="HEALTH"
                                secondaryValue={cacheHit}
                                secondaryColor={cacheColor}
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Cache Hit', value: `${cacheHit}%`, pct: cacheHit, color: cacheColor },
                                    { label: 'Conn Usage', value: `${connPct}%`, pct: connPct, color: connColor },
                                    {
                                        label: 'Disk Usage',
                                        value: `${Math.round((diskGB / 200) * 100)}%`,
                                        pct: Math.round((diskGB / 200) * 100),
                                        color:
                                            diskGB > 160 ? THEME.danger : diskGB > 120 ? THEME.warning : THEME.success,
                                    },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>
                                                {item.label}
                                            </span>
                                            <span
                                                className="ov-mono"
                                                style={{ fontSize: 10, fontWeight: 700, color: item.color }}
                                            >
                                                {item.value}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 5,
                                                borderRadius: 10,
                                                background: `${THEME.grid}55`,
                                                overflow: 'hidden',
                                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            <div
                                                className="ov-bar-animate"
                                                style={{
                                                    width: `${Math.min(item.pct, 100)}%`,
                                                    height: '100%',
                                                    borderRadius: 10,
                                                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                                                    animationDelay: `${i * 0.12}s`,
                                                    boxShadow: `0 0 8px ${item.color}50`,
                                                }}
                                            />
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[
                                        { label: 'Active', value: activeConns, color: THEME.primary },
                                        {
                                            label: 'Idle',
                                            value: Math.max(0, maxConns - activeConns - 5),
                                            color: THEME.textDim,
                                        },
                                        { label: 'Waiting', value: Number(data?.stats?.waitingConnections || 0), color: THEME.warning },
                                        { label: 'Max', value: maxConns, color: THEME.textMuted },
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 10,
                                                background: THEME.surface,
                                                border: `1px solid ${THEME.grid}40`,
                                                boxShadow:
                                                    '0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {s.label}
                                            </div>
                                            <div
                                                className="ov-mono"
                                                style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}
                                            >
                                                {s.value}
                                            </div>
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
                        {[
                            ['P50', '#34d399'],
                            ['P95', THEME.warning],
                            ['P99', THEME.danger],
                        ].map(([l, c]) => (
                            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 3, borderRadius: 2, background: c }} />{' '}
                                <span className="ov-mono">{l}</span>
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
                            <YAxis
                                tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: THEME.fontMono }}
                                axisLine={false}
                                tickLine={false}
                                width={28}
                                unit="ms"
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <ReferenceLine
                                y={10}
                                stroke={`${THEME.warning}40`}
                                strokeDasharray="4 4"
                                label={{ value: 'SLA', fontSize: 9, fill: THEME.warning, position: 'right' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="p50"
                                name="P50"
                                stroke="#34d399"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="p95"
                                name="P95"
                                stroke={THEME.warning}
                                strokeWidth={1.5}
                                dot={false}
                                strokeDasharray="5 3"
                            />
                            <Line
                                type="monotone"
                                dataKey="p99"
                                name="P99"
                                stroke={THEME.danger}
                                strokeWidth={1.5}
                                dot={false}
                                strokeDasharray="3 3"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* Latency stats */}
                <div
                    style={{
                        display: 'flex',
                        gap: 0,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: `1px solid ${THEME.glassBorder}`,
                    }}
                >
                    {[
                        { label: 'P50 avg', value: data?.stats?.p50 ? `${Number(data.stats.p50).toFixed(1)} ms` : 'N/A', color: '#34d399' },
                        { label: 'P95 avg', value: data?.stats?.p95 ? `${Number(data.stats.p95).toFixed(1)} ms` : 'N/A', color: THEME.warning },
                        { label: 'P99 avg', value: data?.stats?.p99 ? `${Number(data.stats.p99).toFixed(1)} ms` : 'N/A', color: THEME.danger },
                        { label: 'Deadlocks', value: String(data?.traffic?.deadlocks || 0), color: Number(data?.traffic?.deadlocks || 0) > 0 ? THEME.danger : THEME.success },
                        { label: 'Rollbacks', value: String(data?.traffic?.xact_rollback || 0), color: Number(data?.traffic?.xact_rollback || 0) > 0 ? THEME.warning : THEME.success },
                    ].map((s, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                paddingRight: 12,
                                borderRight: i < 4 ? `1px solid ${THEME.glassBorder}` : 'none',
                                paddingLeft: i > 0 ? 12 : 0,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 9,
                                    color: THEME.textDim,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    marginBottom: 3,
                                }}
                            >
                                {s.label}
                            </div>
                            <div
                                className="ov-mono"
                                style={{ fontSize: 14, fontWeight: 700, color: s.color, lineHeight: 1 }}
                            >
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* ═══════ Row 5: Workload + Throughput + Ops ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.3fr', gap: 20 }}>
                {/* Workload Split */}
                <Panel title="Workload Split" icon={BarChart3}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 14,
                            height: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ position: 'relative', width: 130, height: 130 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={workloadData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={42}
                                        outerRadius={58}
                                        paddingAngle={5}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {workloadData.map((d, i) => (
                                            <Cell key={i} fill={d.color} opacity={0.88} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <span
                                    className="ov-mono"
                                    style={{ fontSize: 21, fontWeight: 800, color: THEME.textMain, lineHeight: 1 }}
                                >
                                    {readPct}%
                                </span>
                                <span
                                    style={{
                                        fontSize: 8,
                                        color: THEME.textDim,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginTop: 2,
                                    }}
                                >
                                    READS
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 18 }}>
                            {workloadData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{d.name}</span>
                                    <span className="ov-mono" style={{ fontSize: 11, fontWeight: 700, color: d.color }}>
                                        {d.value}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                fontSize: 10,
                                color: THEME.textDim,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <Layers size={10} /> Total:{' '}
                            <strong className="ov-mono" style={{ color: THEME.textMuted }}>
                                {fmtNum(totalOps)}
                            </strong>
                        </div>
                    </div>
                </Panel>

                {/* Throughput Breakdown */}
                <Panel title="Throughput Breakdown" icon={TrendingUp} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {throughputRows.map((row, i) => {
                            const pct = (row.raw / maxThroughput) * 100;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        padding: '14px 18px',
                                        borderBottom:
                                            i < throughputRows.length - 1 ? `1px solid ${THEME.grid}22` : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 10,
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `${row.color}12`,
                                            border: `1px solid ${row.color}20`,
                                            boxShadow: `0 0 8px ${row.color}25`,
                                        }}
                                    >
                                        <row.icon size={14} color={row.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 6,
                                            }}
                                        >
                                            <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted }}>
                                                {row.label}
                                            </span>
                                            <span
                                                className="ov-mono"
                                                style={{ fontSize: 11.5, fontWeight: 800, color: row.color }}
                                            >
                                                {fmtNum(row.raw)}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 4,
                                                borderRadius: 10,
                                                background: `${THEME.grid}45`,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                className="ov-bar-animate"
                                                style={{
                                                    width: `${pct}%`,
                                                    height: '100%',
                                                    borderRadius: 10,
                                                    background: `linear-gradient(90deg, ${row.color}65, ${row.color})`,
                                                    boxShadow: `0 0 8px ${row.color}30`,
                                                    animationDelay: `${i * 0.1}s`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '11px 18px',
                            borderTop: `1px solid ${THEME.glassBorder}`,
                        }}
                    >
                        <Layers size={11} color={THEME.textDim} />
                        <span
                            style={{
                                fontSize: 10,
                                color: THEME.textDim,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}
                        >
                            Total Ops
                        </span>
                        <span
                            className="ov-mono"
                            style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, marginLeft: 'auto' }}
                        >
                            {fmtNum(totalOps)}
                        </span>
                    </div>
                </Panel>

                {/* Ops/sec */}
                <Panel
                    title="Ops / Second (today)"
                    icon={Gauge}
                    rightNode={
                        <div style={{ display: 'flex', gap: 8, fontSize: 9.5, color: THEME.textDim }}>
                            {[
                                ['Reads', THEME.primary],
                                ['Writes', THEME.success],
                                ['Commits', THEME.secondary],
                            ].map(([l, c]) => (
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
                                <XAxis
                                    dataKey="t"
                                    tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: THEME.fontMono }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: THEME.fontMono }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar
                                    dataKey="reads"
                                    name="Reads"
                                    fill={THEME.primary}
                                    radius={[2, 2, 0, 0]}
                                    opacity={0.85}
                                />
                                <Bar
                                    dataKey="writes"
                                    name="Writes"
                                    fill={THEME.success}
                                    radius={[2, 2, 0, 0]}
                                    opacity={0.85}
                                />
                                <Bar
                                    dataKey="commits"
                                    name="Commits"
                                    fill={THEME.secondary}
                                    radius={[2, 2, 0, 0]}
                                    opacity={0.85}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>
            </div>

            {/* ═══════ Row 6: System Resources ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[
                    {
                        label: 'CPU Load',
                        value: Math.round(Number(data?.stats?.cpuUsage || 0)),
                        color: THEME.primary,
                        icon: Cpu,
                        detail: data?.stats?.cpuDetail || 'N/A',
                        status: Number(data?.stats?.cpuUsage || 0) > 80 ? 'High' : Number(data?.stats?.cpuUsage || 0) > 50 ? 'Moderate' : 'Normal',
                        secondary: Math.round(Number(data?.stats?.ioWait || 0)),
                        secondaryLabel: 'I/O Wait',
                    },
                    {
                        label: 'Memory Usage',
                        value: Math.round(Number(data?.stats?.memoryUsagePct || 0)),
                        color: THEME.secondary,
                        icon: MemoryStick || Server,
                        detail: data?.stats?.memoryDetail || `${data?.stats?.sharedBuffersMB ? Math.round(data.stats.sharedBuffersMB / 1024 * 10) / 10 + ' GB shared buffers' : 'N/A'}`,
                        status: Number(data?.stats?.memoryUsagePct || 0) > 80 ? 'High' : Number(data?.stats?.memoryUsagePct || 0) > 50 ? 'Moderate' : 'Normal',
                        secondary: Math.round(Number(data?.stats?.sharedBuffersPct || 0)),
                        secondaryLabel: 'Shared Buf',
                    },
                    {
                        label: 'Disk I/O',
                        value: Math.round((diskGB / 200) * 100),
                        color: THEME.warning,
                        icon: HardDrive,
                        detail: `${diskGB} GB used`,
                        status: diskGB > 160 ? 'High' : 'Normal',
                        secondary: 0,
                        secondaryLabel: 'Write Amp',
                    },
                ].map((r, i) => (
                    <Panel key={i} accentColor={r.color}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <RingGauge
                                value={r.value}
                                color={r.color}
                                size={60}
                                strokeWidth={5}
                                secondaryValue={r.secondary}
                                secondaryColor={`${r.color}80`}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                    <r.icon size={12} color={r.color} style={{ flexShrink: 0 }} />
                                    <span
                                        className="ov-display"
                                        style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}
                                    >
                                        {r.label}
                                    </span>
                                    <StatusBadge
                                        label={r.status}
                                        color={
                                            r.status === 'Normal'
                                                ? THEME.success
                                                : r.status === 'Moderate'
                                                  ? THEME.warning
                                                  : THEME.danger
                                        }
                                    />
                                </div>
                                <div style={{ fontSize: 10.5, color: THEME.textDim, marginBottom: 6 }}>{r.detail}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="ov-mono" style={{ fontSize: 9.5, color: THEME.textDim }}>
                                        {r.secondaryLabel}:
                                    </span>
                                    <span
                                        className="ov-mono"
                                        style={{ fontSize: 9.5, color: r.color, fontWeight: 700 }}
                                    >
                                        {r.secondary}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Panel>
                ))}
            </div>

            {/* ═══════ Row 7: Replication + Tables + WAL ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1.2fr', gap: 20 }}>
                {/* Replication & Locks */}
                <Panel
                    title="Replication & Locks"
                    icon={GitBranch}
                    accentColor={THEME.secondary}
                    rightNode={
                        <div style={{ display: 'flex', gap: 10, fontSize: 9.5, color: THEME.textDim }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Radio size={9} color={THEME.success} /> Primary
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Radio size={9} color={THEME.secondary} /> Replicas
                            </span>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    background: THEME.surface,
                                    border: `1px solid ${THEME.grid}50`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    minWidth: 115,
                                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.08)',
                                }}
                            >
                                <Server size={13} color={THEME.primary} />
                                <div>
                                    <span
                                        className="ov-mono"
                                        style={{
                                            fontSize: 10.5,
                                            fontWeight: 700,
                                            color: THEME.textMain,
                                            display: 'block',
                                        }}
                                    >
                                        {replicationData?.isStandby ? 'standby' : 'primary'}
                                    </span>
                                    <span className="ov-mono" style={{ fontSize: 9, color: THEME.textDim }}>
                                        lag: {replicationData?.isStandby ? `${replicationData?.replayLag || 0} ms` : '0 ms'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={13} color={THEME.textDim} />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {(replicationData?.replicas || []).length > 0 ? (replicationData.replicas || []).map((r, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 10,
                                            background: THEME.surface,
                                            border: `1px solid ${r.lagMs > 300 ? `${THEME.warning}40` : `${THEME.grid}50`}`,
                                            minWidth: 112,
                                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Server size={12} color={THEME.secondary} />
                                            <div>
                                                <span
                                                    className="ov-mono"
                                                    style={{
                                                        fontSize: 10.5,
                                                        fontWeight: 700,
                                                        color: THEME.textMain,
                                                        display: 'block',
                                                    }}
                                                >
                                                    {r.application_name || r.name}
                                                </span>
                                                <span
                                                    className="ov-mono"
                                                    style={{
                                                        fontSize: 9,
                                                        color: (r.replay_lag_ms || r.lagMs || 0) > 300 ? THEME.warning : THEME.textDim,
                                                    }}
                                                >
                                                    lag: {r.replay_lag_ms || r.lagMs || 0} ms
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <span style={{ fontSize: 10.5, color: THEME.textDim }}>No replicas detected</span>
                                )}
                            </div>
                        </div>

                        <Divider />

                        <div
                            style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12, alignItems: 'center' }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span
                                        style={{
                                            fontSize: 9.5,
                                            color: THEME.textDim,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                        }}
                                    >
                                        Blocked queries
                                    </span>
                                    <span
                                        className="ov-mono"
                                        style={{ fontSize: 12, fontWeight: 800, color: THEME.danger }}
                                    >
                                        {String(replicationData?.blockedQueries || 0)}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        height: 5,
                                        borderRadius: 10,
                                        background: `${THEME.grid}50`,
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <div
                                        className="ov-bar-animate"
                                        style={{
                                            width: `${replicationData?.lockContention ? Math.min(replicationData.lockContention, 100) : 0}%`,
                                            height: '100%',
                                            borderRadius: 10,
                                            background: `linear-gradient(90deg, ${THEME.danger}75, ${THEME.danger})`,
                                            boxShadow: `0 0 8px ${THEME.danger}40`,
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: 4, fontSize: 9.5, color: THEME.textDim }}>
                                    {String(replicationData?.blockedQueries || 0)} blocked{replicationData?.waitingQueries ? `, ${replicationData.waitingQueries} waiting` : ''} on locks.
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Lock size={10} color={THEME.warning} />
                                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>Lock contention</span>
                                    <StatusBadge label={replicationData?.lockContention > 50 ? "Elevated" : "Normal"} color={replicationData?.lockContention > 50 ? THEME.warning : THEME.success} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Unlock size={10} color={THEME.success} />
                                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>Deadlocks (5m)</span>
                                    <span
                                        className="ov-mono"
                                        style={{ fontSize: 11, fontWeight: 700, color: String(replicationData?.deadlocks || data?.traffic?.deadlocks || 0) > 0 ? THEME.danger : THEME.success }}
                                    >
                                        {String(replicationData?.deadlocks || data?.traffic?.deadlocks || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* Top Impacted Tables */}
                <Panel title="Top Impacted Tables" icon={BarChart3} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {(topTables.length > 0 ? topTables : []).map((t, i, arr) => {
                            const name = t.name || `${t.schemaname || 'public'}.${t.relname || 'unknown'}`;
                            const reads = Number(t.reads || t.seq_tup_read || 0);
                            const writes = Number(t.writes || 0);
                            const total = reads + writes;
                            const rp = total > 0 ? Math.round((reads / total) * 100) : 50;
                            return (
                                <div
                                    key={t.name}
                                    style={{
                                        padding: '10px 18px',
                                        borderBottom: i < arr.length - 1 ? `1px solid ${THEME.grid}22` : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 5,
                                        }}
                                    >
                                        <span
                                            className="ov-mono"
                                            style={{
                                                fontSize: 10.5,
                                                color: THEME.textMuted,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '62%',
                                            }}
                                            title={name}
                                        >
                                            {name}
                                        </span>
                                        <span style={{ fontSize: 10.5, color: THEME.textDim }}>
                                            {fmtNum(total)} ops
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            height: 6,
                                            borderRadius: 14,
                                            background: `${THEME.grid}50`,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <div
                                            className="ov-bar-animate"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                transformOrigin: 'left',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${rp}%`,
                                                    background: `linear-gradient(90deg, ${THEME.primary}80, ${THEME.primary})`,
                                                    boxShadow: `0 0 6px ${THEME.primary}40`,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    flex: 1,
                                                    background: `linear-gradient(90deg, ${THEME.secondary}80, ${THEME.secondary})`,
                                                    boxShadow: `0 0 6px ${THEME.secondary}40`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 9.5,
                                            color: THEME.textDim,
                                            marginTop: 4,
                                        }}
                                    >
                                        <span>R: {fmtNum(reads)}</span>
                                        <span>W: {fmtNum(writes)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                {/* WAL & Checkpoints */}
                <Panel title="WAL & Checkpoints" icon={Gauge} accentColor={THEME.info || THEME.primary}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.6 }}>
                            WAL generation rate and checkpoint timing require OS-level or <code style={{ color: THEME.primary }}>pg_stat_bgwriter</code> monitoring.
                            Visit the <strong style={{ color: THEME.textMain }}>Checkpoint Monitor</strong> tab for detailed checkpoint analysis.
                        </div>
                        <Divider />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {backupData?.role && <StatusBadge label={`Role: ${backupData.role}`} color={THEME.primary} />}
                            {backupData?.last_archived_time && <StatusBadge label={`Last WAL archived: ${fmtRelTime(backupData.last_archived_time)}`} color={THEME.success} />}
                            {backupData?.failed_count > 0 && <StatusBadge label={`${backupData.failed_count} archive failures`} color={THEME.danger} />}
                            {!backupData?.role && <StatusBadge label="Connect to see WAL status" color={THEME.textDim} />}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default React.memo(OverviewTab);
