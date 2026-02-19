// ==========================================================================
//  VIGIL — ResourcesTab  (v4 — Auto-Refresh)
// ==========================================================================
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard, ResourceGauge, NeonProgressBar, EmptyState } from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';
import FeedbackModal from './FeedbackModal.jsx';
import {
    Database, Search, ChevronRight, History, HardDrive, ChevronDown,
    Cpu, Server, Trash2, RefreshCw, CheckCircle, Filter,
    AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Layers, BarChart3,
    Activity, Zap, TrendingUp, TrendingDown, Eye, GitBranch,
    Table2, ArrowUp, ArrowDown, Gauge, Network,
    Timer, Radio, ShieldAlert, Settings, PieChart as PieIcon,
    MemoryStick, X, Wifi, WifiOff
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, Cell,
    PieChart as RePieChart, Pie
} from 'recharts';
import AdvancedAnalysisPanel from './AdvancedAnalysisPanel';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const ResStyles = () => (
    <style>{`
        @keyframes resFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes resBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes resPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.35; }
        }
        @keyframes resPulseRing {
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes resGaugeStroke {
            from { stroke-dasharray: 0 999; }
        }
        @keyframes resSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes resFlashBg {
            0%   { background: transparent; }
            30%  { background: ${THEME.primary}10; }
            100% { background: transparent; }
        }
        @keyframes resResolveFlash {
            0%   { box-shadow: 0 0 0 0 ${THEME.success}00; }
            40%  { box-shadow: 0 0 0 6px ${THEME.success}30; }
            100% { box-shadow: 0 0 0 0 ${THEME.success}00; }
        }
        .res-resolved-flash { animation: resResolveFlash 0.8s ease-out; }
        .res-stagger > * { animation: resFadeIn 0.4s ease-out both; }
        .res-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .res-stagger > *:nth-child(2) { animation-delay: 0.05s; }
        .res-stagger > *:nth-child(3) { animation-delay: 0.10s; }
        .res-stagger > *:nth-child(4) { animation-delay: 0.15s; }
        .res-stagger > *:nth-child(5) { animation-delay: 0.20s; }
        .res-stagger > *:nth-child(6) { animation-delay: 0.25s; }
        .res-stagger > *:nth-child(7) { animation-delay: 0.30s; }
        .res-stagger > *:nth-child(8) { animation-delay: 0.35s; }
        .res-row-hover { transition: background 0.15s; }
        .res-row-hover:hover { background: ${THEME.primary}08 !important; }
        .res-bar-animate { transform-origin: left; animation: resBarGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .res-scrollbar::-webkit-scrollbar { width: 4px; }
        .res-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .res-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 2px; }
        .res-refresh-spin { animation: resSpin 0.8s linear infinite; }
        .res-metric-flash { animation: resFlashBg 1s ease-out; }
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
        border: `1px solid ${refreshing ? `${THEME.primary}40` : THEME.glassBorder}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s',
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
                        <span style={{ fontSize: 9, color: THEME.primary, fontWeight: 700, animation: 'resPulse 1s ease-in-out infinite' }}>UPDATING</span>
                    )}
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 20px' }}>
            {children}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const StatusBadge = ({ label, color }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
        background: `${color}12`, color, border: `1px solid ${color}20`,
        lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}60`, flexShrink: 0 }} />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}50`, animation: 'resPulseRing 2s ease-out infinite' }} />
    </div>
);

const MiniSparkline = ({ data = [], color = THEME.primary, width = 60, height = 18 }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={`rsp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#rsp-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const RingGauge = ({ value, color, size = 44, strokeWidth = 4 }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = circ * value / 100;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${THEME.grid}60`} strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}%</div>
        </div>
    );
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color }} />
                    <span style={{ color: THEME.textMuted, flex: 1 }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: p.color, fontVariantNumeric: 'tabular-nums' }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Helpers ── */
const bloatColor = (pct) => pct > 30 ? THEME.danger : pct > 15 ? THEME.warning : THEME.success;

const fmtSize = (gb) => {
    if (gb == null) return '—';
    const n = Number(gb);
    if (n >= 1) return `${n.toFixed(1)} GB`;
    if (n >= 0.001) return `${(n * 1024).toFixed(0)} MB`;
    return `${(n * 1048576).toFixed(0)} KB`;
};

const fmtNum = (n) => {
    if (n == null) return '—';
    const num = Number(n);
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return String(num);
};

const fmtLastRefreshed = (ts) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
};

/* ── Synthetic data generators ── */
const genSparkline = () => Array.from({ length: 8 }, () => Math.random() * 50 + 20);

const genGrowthTrend = () => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    let base = 78;
    return months.map(m => {
        base += Math.random() * 14 + 3;
        return { month: m, tables: Math.round(base), indexes: Math.round(base * 0.32), toast: Math.round(base * 0.06) };
    });
};

const genDiskIO = () => {
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
    return labels.map(t => ({
        t,
        reads: Math.round(Math.random() * 800 + 200),
        writes: Math.round(Math.random() * 400 + 100),
    }));
};

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTDOWN BAR
   ═══════════════════════════════════════════════════════════════════════════ */
const CountdownBar = ({ intervalSec, lastRefreshed }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!intervalSec || !lastRefreshed) { setProgress(100); return; }
        const tick = () => {
            const elapsed = (Date.now() - lastRefreshed) / 1000;
            setProgress(Math.max(0, 100 - (elapsed / intervalSec) * 100));
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [intervalSec, lastRefreshed]);

    if (!intervalSec) return null;
    return (
        <div style={{ height: 2, background: `${THEME.primary}18`, borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 1, transition: 'width 0.25s linear' }} />
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   REFRESH STATUS BAR
   ═══════════════════════════════════════════════════════════════════════════ */
const RefreshBar = ({ lastRefreshed, isRefreshing, intervalSec, onIntervalChange, onRefresh, error }) => {
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
            padding: '9px 16px', borderRadius: 10,
            background: THEME.glass, backdropFilter: 'blur(12px)',
            border: `1px solid ${error ? `${THEME.danger}30` : THEME.glassBorder}`,
            fontSize: 11,
        }}>
            {/* Connection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {error ? <WifiOff size={11} color={THEME.danger} /> : <Wifi size={11} color={THEME.success} />}
                <span style={{ color: error ? THEME.danger : THEME.success, fontWeight: 600 }}>
                    {error ? 'Connection error' : 'Connected'}
                </span>
            </div>

            <div style={{ width: 1, height: 12, background: THEME.grid, flexShrink: 0 }} />

            {/* Last updated */}
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
                            <button key={opt.value} onClick={() => onIntervalChange(opt.value)} style={{
                                padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                fontSize: 10, fontWeight: 700, transition: 'all 0.15s',
                                background: active ? `${THEME.primary}20` : 'transparent',
                                color: active ? THEME.primary : THEME.textDim,
                                outline: active ? `1px solid ${THEME.primary}30` : 'none',
                            }}>{opt.label}</button>
                        );
                    })}
                </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Manual refresh */}
            <button onClick={onRefresh} disabled={isRefreshing} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7, border: 'none', cursor: isRefreshing ? 'default' : 'pointer',
                fontWeight: 700, fontSize: 11,
                background: isRefreshing ? `${THEME.primary}10` : `${THEME.primary}18`,
                color: THEME.primary, transition: 'all 0.15s', opacity: isRefreshing ? 0.7 : 1,
            }}
                    onMouseEnter={e => { if (!isRefreshing) e.currentTarget.style.background = `${THEME.primary}28`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isRefreshing ? `${THEME.primary}10` : `${THEME.primary}18`; }}
            >
                <RefreshCw size={11} className={isRefreshing ? 'res-refresh-spin' : ''} />
                {isRefreshing ? 'Refreshing…' : 'Refresh Now'}
            </button>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM OPTIMIZATION PANEL
   Shows a checklist the user must verify before marking as done.
   ═══════════════════════════════════════════════════════════════════════════ */
const ConfirmOptimizationPanel = ({ tableName, bloatPct, onConfirm, onCancel }) => {
    const [checks, setChecks] = useState({
        ran:     false,
        bloat:   false,
        perf:    false,
    });

    const allChecked = Object.values(checks).every(Boolean);

    const toggle = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

    const CHECKLIST = [
        { key: 'ran',   label: 'I ran the optimization SQL (VACUUM, REINDEX, or suggested script)' },
        { key: 'bloat', label: `I verified bloat has dropped — either by re-querying or running ANALYZE on ${tableName}` },
        { key: 'perf',  label: 'No errors or lock timeouts were reported during execution' },
    ];

    return (
        <div style={{
            borderRadius: 12, overflow: 'hidden',
            background: THEME.glass, backdropFilter: 'blur(16px)',
            border: `1px solid ${THEME.primary}30`,
            animation: 'resFadeIn 0.2s ease-out',
        }}>
            {/* Header */}
            <div style={{
                padding: '13px 18px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${THEME.warning}15`, border: `1px solid ${THEME.warning}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={13} color={THEME.warning} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>Verify Before Marking Done</div>
                        <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{tableName} · {bloatPct}% bloat</div>
                    </div>
                </div>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, display: 'flex', padding: 4 }}>
                    <X size={13} />
                </button>
            </div>

            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Warning notice */}
                <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}18`,
                    fontSize: 11, color: THEME.textMuted, lineHeight: 1.5,
                }}>
                    ⚠ Marking without actually applying the fix will hide this issue from the bloat list until the next DB refresh reveals it again.
                </div>

                {/* Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {CHECKLIST.map(({ key, label }) => {
                        const checked = checks[key];
                        return (
                            <div
                                key={key}
                                onClick={() => toggle(key)}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                    background: checked ? `${THEME.success}08` : THEME.surface,
                                    border: `1px solid ${checked ? `${THEME.success}25` : `${THEME.grid}40`}`,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {/* Checkbox */}
                                <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                    border: `2px solid ${checked ? THEME.success : THEME.grid}`,
                                    background: checked ? THEME.success : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s',
                                }}>
                                    {checked && (
                                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                            <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span style={{ fontSize: 12, color: checked ? THEME.textMain : THEME.textMuted, lineHeight: 1.5, transition: 'color 0.15s' }}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Progress hint */}
                <div style={{ fontSize: 10, color: THEME.textDim, textAlign: 'center' }}>
                    {Object.values(checks).filter(Boolean).length} / {CHECKLIST.length} items confirmed
                    {!allChecked && ' — check all items to proceed'}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${THEME.grid}50`,
                        background: 'transparent', color: THEME.textMuted, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = THEME.grid}
                            onMouseLeave={e => e.currentTarget.style.borderColor = `${THEME.grid}50`}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!allChecked}
                        onClick={() => onConfirm(tableName, `Bloat fix verified & applied (was ${bloatPct}%)`)}
                        style={{
                            flex: 2, padding: '9px', borderRadius: 8, border: 'none',
                            fontSize: 12, fontWeight: 700, cursor: allChecked ? 'pointer' : 'not-allowed',
                            background: allChecked
                                ? `linear-gradient(135deg, ${THEME.success}, ${THEME.success}bb)`
                                : `${THEME.grid}30`,
                            color: allChecked ? '#fff' : THEME.textDim,
                            boxShadow: allChecked ? `0 3px 12px ${THEME.success}40` : 'none',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                        onMouseEnter={e => { if (allChecked) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 5px 18px ${THEME.success}55`; }}}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = allChecked ? `0 3px 12px ${THEME.success}40` : 'none'; }}
                    >
                        <CheckCircle size={13} />
                        {allChecked ? 'Confirmed — Mark as Done' : 'Check all items above first'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ResourcesTab = () => {
    const [growth, setGrowth]               = useState([]);
    const [vacuum, setVacuum]               = useState([]);
    const [growthTrend, setGrowthTrend]     = useState(() => genGrowthTrend());
    const [diskIO, setDiskIO]               = useState(() => genDiskIO());
    const [logs, setLogs]                   = useState([
        { id: 1, table: 'notification_audit',    action: 'VACUUM FULL', date: '2026-02-08', saved: '1.2 GB',  status: 'Success', duration: '3m 12s' },
        { id: 2, table: 'api_monitoring_payload', action: 'REINDEX',    date: '2026-02-05', saved: '400 MB',  status: 'Success', duration: '1m 45s' },
        { id: 3, table: 'session_tokens',         action: 'VACUUM',     date: '2026-02-03', saved: '80 MB',   status: 'Success', duration: '0m 28s' },
        { id: 4, table: 'audit_events',            action: 'CLUSTER',   date: '2026-01-28', saved: '2.1 GB',  status: 'Success', duration: '8m 04s' },
        { id: 5, table: 'user_profiles',           action: 'ANALYZE',   date: '2026-01-25', saved: '—',       status: 'Success', duration: '0m 12s' },
        { id: 6, table: 'videos',                  action: 'VACUUM',    date: '2026-01-20', saved: '340 MB',  status: 'Failed',  duration: '—' },
    ]);

    // Refresh state
    const [loading, setLoading]             = useState(true);
    const [isRefreshing, setIsRefreshing]   = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [refreshError, setRefreshError]   = useState(false);
    const [refreshingPanels, setRefreshingPanels] = useState(new Set());

    // UI state
    const [selectedTable, setSelectedTable] = useState(null);
    const [activeTab, setActiveTab]         = useState('inventory');
    const [sortKey, setSortKey]             = useState('size');
    const [sortDir, setSortDir]             = useState('desc');
    const [bloatFilter, setBloatFilter]     = useState('all');

    const intervalRef = useRef(null);

    /* ── Core fetch ── */
    const fetchAll = useCallback(async (isInitial = false) => {
        if (!isInitial) setIsRefreshing(true);
        setRefreshingPanels(new Set(['inventory', 'bloat', 'storage', 'io', 'logs', 'resources']));

        try {
            // Growth / table inventory
            const growthData = await fetchData('/api/resources/growth').catch(() => null);
            const enriched = (growthData || []).map(t => ({
                ...t,
                spark: t.spark || genSparkline(),
                row_count: t.row_count || Math.round(Math.random() * 5e6 + 10000),
                index_size_gb: t.index_size_gb || (Number(t.total_size_gb || 0) * (0.2 + Math.random() * 0.3)),
                toast_size_gb: t.toast_size_gb || (Number(t.total_size_gb || 0) * Math.random() * 0.08),
                growth_rate: t.growth_rate || (Math.random() * 12 - 2).toFixed(1),
                seq_scan: t.seq_scan || Math.round(Math.random() * 100000),
                idx_scan: t.idx_scan || Math.round(Math.random() * 500000),
            }));
            setGrowth(enriched);
            setRefreshingPanels(p => { const n = new Set(p); n.delete('inventory'); n.delete('storage'); return n; });

            // Vacuum / bloat
            const vacuumData = await fetchData('/api/resources/vacuum-status').catch(() => null);
            setVacuum(vacuumData || []);
            setRefreshingPanels(p => { const n = new Set(p); n.delete('bloat'); return n; });

            // Disk I/O
            const ioData = await fetchData('/api/resources/disk-io').catch(() => null);
            setDiskIO(ioData && ioData.length > 0 ? ioData : genDiskIO());
            setRefreshingPanels(p => { const n = new Set(p); n.delete('io'); return n; });

            // Growth trend chart
            const trendData = await fetchData('/api/resources/growth-trend').catch(() => null);
            setGrowthTrend(trendData && trendData.length > 0 ? trendData : genGrowthTrend());
            setRefreshingPanels(p => { const n = new Set(p); n.delete('resources'); return n; });

            // Maintenance logs
            const logsData = await fetchData('/api/resources/maintenance-logs').catch(() => null);
            if (logsData && logsData.length > 0) setLogs(logsData);
            setRefreshingPanels(p => { const n = new Set(p); n.delete('logs'); return n; });

            setRefreshError(false);
        } catch {
            setRefreshError(true);
        } finally {
            setRefreshingPanels(new Set());
            setLastRefreshed(Date.now());
            setIsRefreshing(false);
            if (isInitial) setLoading(false);
        }
    }, []);

    /* ── Initial load ── */
    useEffect(() => { fetchAll(true); }, [fetchAll]);

    /* ── Auto-refresh interval ── */
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (refreshInterval > 0) {
            intervalRef.current = setInterval(() => fetchAll(false), refreshInterval * 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [refreshInterval, fetchAll]);

    /* ── Resolved optimization tracking ── */
    // { [tableName]: { ts: number, note: string } }
    const [resolvedOptimizations, setResolvedOptimizations] = useState({});
    // confirmPending: tableName currently in the "verify before marking done" step
    const [confirmPending, setConfirmPending] = useState(null);

    // Step 1 — user clicks "Mark Optimization Done" → opens confirmation panel
    const handleRequestConfirm = useCallback((tableName) => {
        setConfirmPending(tableName);
    }, []);

    // Step 2 — user has verified and clicks "Yes, I applied it"
    const handleMarkResolved = useCallback((tableName, note = 'Optimization applied') => {
        setResolvedOptimizations(prev => ({
            ...prev,
            [tableName]: { ts: Date.now(), note },
        }));
        setConfirmPending(null);
    }, []);

    const handleCancelConfirm = useCallback(() => {
        setConfirmPending(null);
    }, []);

    const handleUnmarkResolved = useCallback((tableName) => {
        setResolvedOptimizations(prev => {
            const next = { ...prev };
            delete next[tableName];
            return next;
        });
    }, []);

    // After each DB refresh, auto-clear resolved entries whose bloat_ratio_pct
    // dropped below 10 — the DB has confirmed the fix, marker no longer needed
    useEffect(() => {
        if (!vacuum.length) return;
        setResolvedOptimizations(prev => {
            const next = { ...prev };
            let changed = false;
            vacuum.forEach(v => {
                if (next[v.table_name] && v.bloat_ratio_pct < 10) {
                    delete next[v.table_name];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [vacuum]);

    /* ── Sort / filter ── */
    const sortedGrowth = useMemo(() => {
        return [...growth].sort((a, b) => {
            const m = sortDir === 'asc' ? 1 : -1;
            if (sortKey === 'name') return a.table_name.localeCompare(b.table_name) * m;
            if (sortKey === 'size') return (Number(a.total_size_gb) - Number(b.total_size_gb)) * m;
            if (sortKey === 'rows') return ((a.row_count || 0) - (b.row_count || 0)) * m;
            if (sortKey === 'growth') return (Number(a.growth_rate) - Number(b.growth_rate)) * m;
            return 0;
        });
    }, [growth, sortKey, sortDir]);

    const filteredVacuum = useMemo(() => {
        if (bloatFilter === 'all') return vacuum;
        if (bloatFilter === 'high') return vacuum.filter(v => v.bloat_ratio_pct > 30);
        if (bloatFilter === 'medium') return vacuum.filter(v => v.bloat_ratio_pct > 15 && v.bloat_ratio_pct <= 30);
        return vacuum.filter(v => v.bloat_ratio_pct <= 15);
    }, [vacuum, bloatFilter]);

    const toggleSort = useCallback((key) => {
        setSortKey(prev => { setSortDir(prev === key ? (d => d === 'asc' ? 'desc' : 'asc') : () => 'desc'); return key; });
    }, []);

    /* ── Computed metrics ── */
    const totalSize  = growth.reduce((s, t) => s + Number(t.total_size_gb || 0), 0);
    const totalRows  = growth.reduce((s, t) => s + (t.row_count || 0), 0);
    const avgBloat   = vacuum.length ? vacuum.reduce((s, v) => s + v.bloat_ratio_pct, 0) / vacuum.length : 0;
    const highBloat  = vacuum.filter(v => v.bloat_ratio_pct > 20 && !resolvedOptimizations[v.table_name]).length;

    const storageBreakdown = useMemo(() => {
        const tblData   = growth.reduce((s, t) => s + Math.max(0, Number(t.total_size_gb || 0) - Number(t.index_size_gb || 0) - Number(t.toast_size_gb || 0)), 0);
        const idxData   = growth.reduce((s, t) => s + Number(t.index_size_gb || 0), 0);
        const toastData = growth.reduce((s, t) => s + Number(t.toast_size_gb || 0), 0);
        const free = Math.max(0, 200 - tblData - idxData - toastData);
        return [
            { name: 'Table Data', value: Math.round(tblData * 10) / 10, color: THEME.primary },
            { name: 'Indexes',    value: Math.round(idxData * 10) / 10, color: THEME.secondary },
            { name: 'TOAST',      value: Math.round(toastData * 10) / 10, color: THEME.warning },
            { name: 'Free Space', value: Math.round(free * 10) / 10, color: `${THEME.textDim}60` },
        ];
    }, [growth]);

    const totalStorageGB = storageBreakdown.reduce((s, d) => s + d.value, 0);

    /* ── Tab button ── */
    const TabBtn = ({ id, label, icon: Icon, count }) => {
        const active = activeTab === id;
        return (
            <button onClick={() => setActiveTab(id)} style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontWeight: 600, fontSize: 12.5, lineHeight: 1,
                transition: 'all 0.25s', whiteSpace: 'nowrap', border: 'none',
                background: active ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` : THEME.surface,
                color: active ? '#fff' : THEME.textMuted,
                boxShadow: active ? `0 4px 16px ${THEME.primary}35` : 'none',
                outline: active ? 'none' : `1px solid ${THEME.grid}60`,
            }}>
                <Icon size={13} style={{ flexShrink: 0 }} />
                {label}
                {count != null && (
                    <span style={{
                        fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 10,
                        background: active ? 'rgba(255,255,255,0.2)' : `${THEME.primary}15`,
                        color: active ? '#fff' : THEME.primary, fontVariantNumeric: 'tabular-nums',
                    }}>{count}</span>
                )}
            </button>
        );
    };

    /* ── Sort header ── */
    const SortTh = ({ label, sortId, align = 'left', width }) => {
        const active = sortKey === sortId;
        return (
            <th onClick={() => toggleSort(sortId)} style={{
                padding: '10px 16px', textAlign: align, width,
                fontSize: 10, fontWeight: 700, color: active ? THEME.primary : THEME.textDim,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: `1px solid ${THEME.grid}50`,
                cursor: 'pointer', userSelect: 'none', transition: 'color 0.15s',
                position: 'sticky', top: 0, background: THEME.surface, zIndex: 1,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
                    {label}
                    {active && (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
                </div>
            </th>
        );
    };

    /* ────────────────────── LOADING ────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px' }}>
                <ResStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ height: 96, borderRadius: 14, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.4, animation: 'resPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20 }}>
                    {[0, 1].map(i => (
                        <div key={i} style={{ height: 340, borderRadius: 16, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, opacity: 0.25, animation: 'resPulse 1.5s ease-in-out infinite', animationDelay: `${0.5 + i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Metric cards ── */
    const metricCards = [
        { label: 'Total Storage', value: `${totalSize.toFixed(1)} GB`, sub: `of ${totalStorageGB.toFixed(0)} GB capacity`, color: THEME.primary, icon: HardDrive },
        { label: 'Total Rows', value: fmtNum(totalRows), sub: `${growth.length} tables tracked`, color: THEME.secondary, icon: Table2 },
        { label: 'Avg Bloat', value: `${avgBloat.toFixed(1)}%`, sub: highBloat > 0 ? `${highBloat} need attention` : 'all healthy', color: avgBloat > 20 ? THEME.danger : THEME.success, icon: Trash2 },
        { label: 'Disk I/O', value: fmtNum(diskIO[diskIO.length - 1].reads + diskIO[diskIO.length - 1].writes), sub: 'ops/sec now', color: THEME.warning, icon: Activity },
    ];

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px 24px' }}>
            <ResStyles />

            {/* ── Refresh status bar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <RefreshBar
                    lastRefreshed={lastRefreshed}
                    isRefreshing={isRefreshing}
                    intervalSec={refreshInterval}
                    onIntervalChange={setRefreshInterval}
                    onRefresh={() => { if (!isRefreshing) fetchAll(false); }}
                    error={refreshError}
                />
                <CountdownBar intervalSec={refreshInterval} lastRefreshed={lastRefreshed} />
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <TabBtn id="inventory" label="Table Inventory" icon={Database} count={growth.length} />
                    <TabBtn id="storage"   label="Storage & I/O"   icon={HardDrive} />
                    <TabBtn id="logs"      label="Maintenance"      icon={History}   count={logs.length} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: THEME.textDim }}>
                    <LiveDot color={refreshError ? THEME.danger : THEME.success} size={6} />
                    <span>{refreshError ? 'Fetch error' : 'Live'}</span>
                </div>
            </div>

            {/* ── Quick metric strip ── */}
            <div className="res-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {metricCards.map((m, i) => (
                    <div key={i}
                         className={isRefreshing ? 'res-metric-flash' : ''}
                         style={{
                             display: 'flex', alignItems: 'center', gap: 14,
                             padding: '15px 18px', borderRadius: 14,
                             background: THEME.glass, backdropFilter: 'blur(12px)',
                             border: `1px solid ${isRefreshing ? `${THEME.primary}25` : THEME.glassBorder}`,
                             transition: 'border-color 0.3s',
                             animationDelay: `${i * 0.05}s`,
                         }}
                    >
                        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${m.color}10`, border: `1px solid ${m.color}18` }}>
                            <m.icon size={18} color={m.color} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>{m.value}</div>
                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3, lineHeight: 1 }}>{m.sub}</div>
                        </div>
                    </div>
                ))}
            </div>


            {/* ════════════════════════════════════════════════════════════
                INVENTORY VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'inventory' && (
                <div className="res-stagger" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20, alignItems: 'start' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Table inventory */}
                        <Panel title="Table Inventory" icon={Database} noPad refreshing={refreshingPanels.has('inventory')}
                               rightNode={<span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>{growth.length} tables</span>}
                        >
                            {growth.length === 0 ? (
                                <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                    <EmptyState icon={Database} text="No table data" />
                                </div>
                            ) : (
                                <div className="res-scrollbar" style={{ overflowY: 'auto', maxHeight: 400 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                        <tr>
                                            <SortTh label="Table"  sortId="name"   width="32%" />
                                            <SortTh label="Size"   sortId="size"   align="right" width="14%" />
                                            <SortTh label="Rows"   sortId="rows"   align="right" width="14%" />
                                            <SortTh label="Growth" sortId="growth" align="right" width="14%" />
                                            <th style={{ padding: '10px 14px', width: '14%', textAlign: 'right', fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50`, position: 'sticky', top: 0, background: THEME.surface, zIndex: 1 }}>Trend</th>
                                            <th style={{ padding: '10px 8px', width: '12%', textAlign: 'right', fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50`, position: 'sticky', top: 0, background: THEME.surface, zIndex: 1 }}>Scans</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sortedGrowth.map(t => {
                                            const sel = selectedTable?.table_name === t.table_name;
                                            const gr = Number(t.growth_rate || 0);
                                            const scanRatio = t.idx_scan / Math.max(t.seq_scan + t.idx_scan, 1) * 100;
                                            return (
                                                <tr key={t.table_name} onClick={() => setSelectedTable(t)} className="res-row-hover"
                                                    style={{ cursor: 'pointer', background: sel ? `${THEME.primary}08` : 'transparent', borderLeft: sel ? `2px solid ${THEME.primary}` : '2px solid transparent' }}>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: sel ? THEME.textMain : THEME.textMuted, borderBottom: `1px solid ${THEME.grid}20`, transition: 'color 0.15s' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                            <Database size={11} color={sel ? THEME.primary : THEME.textDim} style={{ flexShrink: 0 }} />
                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.table_name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: THEME.primary, fontWeight: 700, borderBottom: `1px solid ${THEME.grid}20` }}>{fmtSize(t.total_size_gb)}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: THEME.textMuted, borderBottom: `1px solid ${THEME.grid}20` }}>{fmtNum(t.row_count)}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 11, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700, borderBottom: `1px solid ${THEME.grid}20`, color: gr > 0 ? THEME.success : gr < 0 ? THEME.danger : THEME.textDim }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                                            {gr > 0 ? <ArrowUpRight size={10} /> : gr < 0 ? <ArrowDownRight size={10} /> : null}
                                                            {gr > 0 ? '+' : ''}{t.growth_rate}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${THEME.grid}20` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                            <MiniSparkline data={t.spark} color={gr >= 0 ? THEME.primary : THEME.danger} width={52} height={16} />
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px 8px', borderBottom: `1px solid ${THEME.grid}20`, textAlign: 'right' }}>
                                                        <div title={`${(scanRatio).toFixed(0)}% index scans`} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                                            <div style={{ width: 32, height: 4, borderRadius: 2, background: `${THEME.grid}60`, overflow: 'hidden' }}>
                                                                <div style={{ width: `${scanRatio}%`, height: '100%', borderRadius: 2, background: scanRatio > 80 ? THEME.success : scanRatio > 50 ? THEME.warning : THEME.danger }} />
                                                            </div>
                                                            <span style={{ fontSize: 9, color: THEME.textDim, fontVariantNumeric: 'tabular-nums', width: 20, textAlign: 'right' }}>{Math.round(scanRatio)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Panel>

                        {/* Bloat & Vacuum */}
                        <Panel title="Bloat & Auto-Vacuum" icon={Trash2} refreshing={refreshingPanels.has('bloat')}
                               rightNode={
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                       {['all', 'high', 'medium', 'low'].map(f => (
                                           <button key={f} onClick={() => setBloatFilter(f)} style={{
                                               padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                               fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
                                               background: bloatFilter === f ? `${THEME.primary}20` : 'transparent',
                                               color: bloatFilter === f ? THEME.primary : THEME.textDim,
                                               transition: 'all 0.15s',
                                           }}>{f}</button>
                                       ))}
                                       {highBloat > 0 && <StatusBadge label={`${highBloat} critical`} color={THEME.danger} />}
                                   </div>
                               }
                        >
                            {filteredVacuum.length === 0 ? (
                                <EmptyState icon={Trash2} text={`No ${bloatFilter === 'all' ? '' : bloatFilter + ' '}bloat tables`} />
                            ) : (
                                <div className="res-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                                    {filteredVacuum.map((v, i) => {
                                        const sel = selectedTable?.table_name === v.table_name;
                                        const resolved = resolvedOptimizations[v.table_name];
                                        const bc = resolved ? THEME.success : bloatColor(v.bloat_ratio_pct);
                                        return (
                                            <div key={i} onClick={() => setSelectedTable(v)}
                                                 className={resolved ? 'res-resolved-flash' : ''}
                                                 style={{
                                                     padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                                                     background: resolved ? `${THEME.success}06` : sel ? `${bc}08` : THEME.surface,
                                                     border: `1px solid ${resolved ? `${THEME.success}25` : sel ? `${bc}35` : `${THEME.grid}50`}`,
                                                     transition: 'all 0.2s',
                                                     opacity: resolved ? 0.72 : 1,
                                                 }}
                                                 onMouseEnter={e => { if (!sel && !resolved) e.currentTarget.style.borderColor = `${THEME.grid}90`; }}
                                                 onMouseLeave={e => { if (!sel && !resolved) e.currentTarget.style.borderColor = `${THEME.grid}50`; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                        {resolved
                                                            ? <CheckCircle size={11} color={THEME.success} style={{ flexShrink: 0 }} />
                                                            : <Trash2 size={11} color={bc} style={{ flexShrink: 0 }} />
                                                        }
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: resolved ? THEME.textDim : THEME.textMain }}>{v.table_name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {resolved ? (
                                                            <>
                                                                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: `${THEME.success}12`, color: THEME.success, border: `1px solid ${THEME.success}20` }}>
                                                                    ✓ Optimization Applied
                                                                </span>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); handleUnmarkResolved(v.table_name); }}
                                                                    title="Undo — mark as still pending"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2, display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span style={{ fontSize: 12, fontWeight: 800, color: bc, fontVariantNumeric: 'tabular-nums' }}>{v.bloat_ratio_pct}%</span>
                                                                {sel ? (
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); setSelectedTable(v); handleRequestConfirm(v.table_name); }}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                            padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                                                            fontSize: 10, fontWeight: 700,
                                                                            background: `${THEME.success}18`, color: THEME.success,
                                                                            border: `1px solid ${THEME.success}30`,
                                                                            transition: 'all 0.15s',
                                                                        }}
                                                                        onMouseEnter={e => e.currentTarget.style.background = `${THEME.success}28`}
                                                                        onMouseLeave={e => e.currentTarget.style.background = `${THEME.success}18`}
                                                                    >
                                                                        <CheckCircle size={10} /> Mark Optimized
                                                                    </button>
                                                                ) : (
                                                                    <ChevronRight size={12} color={THEME.textDim} />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!resolved && (
                                                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: `${THEME.grid}80`, overflow: 'hidden' }}>
                                                        <div className="res-bar-animate" style={{ width: `${Math.min(v.bloat_ratio_pct, 100)}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${bc}90, ${bc})`, boxShadow: `0 0 8px ${bc}40`, animationDelay: `${i * 0.06}s` }} />
                                                    </div>
                                                )}
                                                {resolved && (
                                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>
                                                        {resolved.note} — pending DB confirmation on next refresh
                                                    </div>
                                                )}
                                                {!resolved && (v.last_autovacuum || v.dead_tuples != null) && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 7, fontSize: 10, color: THEME.textDim }}>
                                                        {v.last_autovacuum && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {v.last_autovacuum}</span>}
                                                        {v.dead_tuples != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={9} color={THEME.warning} /> {fmtNum(v.dead_tuples)} dead</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Panel>
                    </div>

                    {/* Right: Analysis panel */}
                    <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>

                        {/* ── Optimization status banner ── */}
                        {selectedTable && (() => {
                            const vEntry = vacuum.find(v => v.table_name === selectedTable.table_name);
                            if (!vEntry) return null;
                            const res = resolvedOptimizations[selectedTable.table_name];
                            const bc   = bloatColor(vEntry.bloat_ratio_pct);
                            if (res) {
                                return (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 16px', borderRadius: 10,
                                        background: `${THEME.success}08`, border: `1px solid ${THEME.success}25`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CheckCircle size={14} color={THEME.success} />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.success }}>Optimization Marked as Applied</div>
                                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{res.note} — will auto-clear from bloat list on next DB refresh if bloat &lt; 10%</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleUnmarkResolved(selectedTable.table_name)} style={{
                                            background: 'none', border: `1px solid ${THEME.grid}40`, borderRadius: 5,
                                            cursor: 'pointer', color: THEME.textDim, fontSize: 10, fontWeight: 600,
                                            padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4,
                                        }}>
                                            <X size={9} /> Undo
                                        </button>
                                    </div>
                                );
                            }
                            return (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 16px', borderRadius: 10,
                                    background: `${bc}07`, border: `1px solid ${bc}25`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertTriangle size={13} color={bc} />
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: bc }}>{vEntry.bloat_ratio_pct}% bloat on {selectedTable.table_name}</div>
                                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>Apply the optimization below, then click the button →</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRequestConfirm(selectedTable.table_name)}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                                            background: `linear-gradient(135deg, ${THEME.success}, ${THEME.success}bb)`,
                                            color: '#fff', boxShadow: `0 3px 12px ${THEME.success}40`,
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 5px 18px ${THEME.success}55`; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 3px 12px ${THEME.success}40`; }}
                                    >
                                        <CheckCircle size={12} /> Mark Optimization Done
                                    </button>
                                </div>
                            );
                        })()}

                        {selectedTable ? (
                            <>
                                {confirmPending === selectedTable.table_name && (() => {
                                    const vEntry = vacuum.find(v => v.table_name === selectedTable.table_name);
                                    return (
                                        <ConfirmOptimizationPanel
                                            tableName={selectedTable.table_name}
                                            bloatPct={vEntry?.bloat_ratio_pct ?? '?'}
                                            onConfirm={handleMarkResolved}
                                            onCancel={handleCancelConfirm}
                                        />
                                    );
                                })()}
                                <AdvancedAnalysisPanel
                                    table={selectedTable}
                                    resolvedOptimizations={resolvedOptimizations}
                                    onMarkResolved={handleMarkResolved}
                                    onUnmarkResolved={handleUnmarkResolved}
                                /></>
                        ) : (
                            <Panel style={{ minHeight: 500 }}>
                                <div style={{ height: '100%', minHeight: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 18, background: `${THEME.primary}08`, border: `1px solid ${THEME.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Search size={28} color={THEME.primary} style={{ opacity: 0.5 }} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textMuted, marginBottom: 8 }}>Select a Table</div>
                                        <div style={{ fontSize: 12, color: THEME.textDim, lineHeight: 1.6, maxWidth: 260 }}>
                                            Click any table from the inventory or bloat list to view deep diagnostic analysis, schema details, and optimization suggestions.
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                        {['Schema', 'Indexes', 'Bloat', 'Growth'].map(tag => (
                                            <span key={tag} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: `${THEME.primary}08`, color: THEME.textDim, border: `1px solid ${THEME.primary}12` }}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </Panel>
                        )}
                    </div>
                </div>
            )}


            {/* ════════════════════════════════════════════════════════════
                STORAGE & I/O VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'storage' && (
                <div className="res-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>

                        {/* Storage Donut */}
                        <Panel title="Storage Breakdown" icon={PieIcon} refreshing={refreshingPanels.has('storage')}
                               rightNode={<span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{totalStorageGB.toFixed(0)} GB</span>}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', height: 270 }}>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie data={storageBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={74} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                                {storageBreakdown.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flexShrink: 0 }}>
                                    {storageBreakdown.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 0' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 10.5, color: THEME.textMuted, flex: 1 }}>{d.name}</span>
                                            <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMain, fontVariantNumeric: 'tabular-nums' }}>{d.value} GB</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Panel>

                        {/* Growth Trend */}
                        <Panel title="Growth Trend (6 months)" icon={TrendingUp} refreshing={refreshingPanels.has('resources')}
                               rightNode={
                                   <div style={{ display: 'flex', gap: 14, fontSize: 10, color: THEME.textDim }}>
                                       {[{ l: 'Tables', c: THEME.primary }, { l: 'Indexes', c: THEME.secondary }, { l: 'TOAST', c: THEME.warning }].map(x => (
                                           <span key={x.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 10, height: 3, borderRadius: 2, background: x.c }} /> {x.l}
                                        </span>
                                       ))}
                                   </div>
                               }
                        >
                            <div style={{ height: 270 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growthTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                        <defs>
                                            <linearGradient id="rgT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={THEME.primary} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="rgI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.2} /><stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} /></linearGradient>
                                            <linearGradient id="rgO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.warning} stopOpacity={0.15} /><stop offset="100%" stopColor={THEME.warning} stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} unit=" GB" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="tables"  name="Tables"  stroke={THEME.primary}   strokeWidth={2}   fill="url(#rgT)" />
                                        <Area type="monotone" dataKey="indexes" name="Indexes" stroke={THEME.secondary} strokeWidth={1.5} fill="url(#rgI)" />
                                        <Area type="monotone" dataKey="toast"   name="TOAST"   stroke={THEME.warning}   strokeWidth={1}   fill="url(#rgO)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

                        {/* Disk I/O */}
                        <Panel title="Disk I/O Throughput" icon={Activity} refreshing={refreshingPanels.has('io')}
                               rightNode={
                                   <div style={{ display: 'flex', gap: 14, fontSize: 10, color: THEME.textDim }}>
                                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.primary }} /> Reads</span>
                                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.success }} /> Writes</span>
                                   </div>
                               }
                        >
                            <div style={{ height: 210 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={diskIO} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                        <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="reads"  name="Reads"  fill={THEME.primary} radius={[3, 3, 0, 0]} opacity={0.85} />
                                        <Bar dataKey="writes" name="Writes" fill={THEME.success} radius={[3, 3, 0, 0]} opacity={0.85} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>

                        {/* System Resources */}
                        <Panel title="System Resources" icon={Cpu} refreshing={refreshingPanels.has('resources')}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'CPU',    value: 45, color: THEME.primary,   detail: '4 cores • 2.1 load avg',     icon: Cpu },
                                    { label: 'Memory', value: 72, color: THEME.secondary, detail: '12 GB / 16 GB allocated',     icon: Server },
                                    { label: 'Disk',   value: 54, color: THEME.warning,   detail: '108 GB / 200 GB SSD vol',     icon: HardDrive },
                                ].map((r, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <RingGauge value={r.value} color={r.color} size={48} strokeWidth={4.5} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                <r.icon size={11} color={r.color} style={{ flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{r.label}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textDim }}>{r.detail}</div>
                                        </div>
                                        <StatusBadge label={r.value > 80 ? 'High' : r.value > 60 ? 'Moderate' : 'Normal'} color={r.value > 80 ? THEME.danger : r.value > 60 ? THEME.warning : THEME.success} />
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    {/* Storage Distribution */}
                    <Panel title="Storage Distribution by Table" icon={BarChart3} noPad refreshing={refreshingPanels.has('storage')}>
                        <div style={{ padding: '4px 0' }}>
                            {sortedGrowth.slice(0, 8).map((t, i) => {
                                const maxSize = Number(sortedGrowth[0]?.total_size_gb) || 1;
                                const pct = (Number(t.total_size_gb) / maxSize) * 100;
                                const idxPct = (Number(t.index_size_gb || 0) / Math.max(Number(t.total_size_gb), 0.01)) * 100;
                                return (
                                    <div key={i} style={{
                                        display: 'grid', gridTemplateColumns: '150px 1fr 70px',
                                        alignItems: 'center', gap: 16,
                                        padding: '9px 20px',
                                        borderBottom: i < 7 ? `1px solid ${THEME.grid}20` : 'none',
                                    }}>
                                        <div style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.table_name}</div>
                                        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: `${THEME.grid}40` }}>
                                            <div className="res-bar-animate" style={{ width: `${pct * (100 - idxPct) / 100}%`, background: THEME.primary,   height: '100%', animationDelay: `${i * 0.05}s` }} />
                                            <div className="res-bar-animate" style={{ width: `${pct * idxPct / 100}%`,           background: THEME.secondary, height: '100%', animationDelay: `${i * 0.05 + 0.08}s` }} />
                                        </div>
                                        <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMain, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtSize(t.total_size_gb)}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: 20, padding: '10px 20px', borderTop: `1px solid ${THEME.glassBorder}`, fontSize: 10, color: THEME.textDim }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 5, borderRadius: 2, background: THEME.primary }} /> Data</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 5, borderRadius: 2, background: THEME.secondary }} /> Indexes</span>
                        </div>
                    </Panel>
                </div>
            )}


            {/* ════════════════════════════════════════════════════════════
                LOGS VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'logs' && (
                <div className="res-stagger">
                    <Panel title="Maintenance History" icon={History} noPad refreshing={refreshingPanels.has('logs')}
                           rightNode={
                               <div style={{ display: 'flex', gap: 8 }}>
                                   <StatusBadge label={`${logs.filter(l => l.status === 'Success').length} success`} color={THEME.success} />
                                   {logs.some(l => l.status === 'Failed') && <StatusBadge label={`${logs.filter(l => l.status === 'Failed').length} failed`} color={THEME.danger} />}
                               </div>
                           }
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                {[
                                    { l: 'Date', a: 'left', w: '13%' }, { l: 'Table', a: 'left', w: '24%' },
                                    { l: 'Action', a: 'left', w: '14%' }, { l: 'Duration', a: 'right', w: '13%' },
                                    { l: 'Saved', a: 'right', w: '15%' }, { l: 'Status', a: 'right', w: '21%' },
                                ].map(h => (
                                    <th key={h.l} style={{ padding: '11px 20px', textAlign: h.a, width: h.w, fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50` }}>{h.l}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map(log => {
                                const fail = log.status === 'Failed';
                                return (
                                    <tr key={log.id} className="res-row-hover" style={{ background: fail ? `${THEME.danger}04` : 'transparent' }}>
                                        <td style={{ padding: '13px 20px', fontSize: 12, color: THEME.textDim, borderBottom: `1px solid ${THEME.grid}20`, fontVariantNumeric: 'tabular-nums' }}>{log.date}</td>
                                        <td style={{ padding: '13px 20px', fontSize: 12.5, fontWeight: 600, color: THEME.textMain, borderBottom: `1px solid ${THEME.grid}20` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <Database size={11} color={THEME.textDim} style={{ flexShrink: 0 }} /> {log.table}
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 20px', borderBottom: `1px solid ${THEME.grid}20` }}>
                                            <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 5, background: `${THEME.primary}0a`, border: `1px solid ${THEME.primary}15`, fontSize: 10.5, fontWeight: 700, color: THEME.primary, fontFamily: 'monospace' }}>{log.action}</span>
                                        </td>
                                        <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 11.5, color: THEME.textMuted, borderBottom: `1px solid ${THEME.grid}20`, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>{log.duration}</td>
                                        <td style={{ padding: '13px 20px', textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: log.saved === '—' ? THEME.textDim : THEME.success, fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${THEME.grid}20` }}>
                                            {log.saved !== '—' && <TrendingUp size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}{log.saved}
                                        </td>
                                        <td style={{ padding: '13px 20px', textAlign: 'right', borderBottom: `1px solid ${THEME.grid}20` }}>
                                            <StatusBadge label={log.status} color={fail ? THEME.danger : THEME.success} />
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {/* Summary footer */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: `1px solid ${THEME.glassBorder}` }}>
                            {[
                                { label: 'Total Saved',  value: '4.12 GB', color: THEME.success, icon: TrendingUp },
                                { label: 'Operations',   value: String(logs.length), color: THEME.primary, icon: Zap },
                                { label: 'Success Rate', value: `${Math.round(logs.filter(l => l.status === 'Success').length / logs.length * 100)}%`, color: logs.some(l => l.status === 'Failed') ? THEME.warning : THEME.success, icon: CheckCircle },
                                { label: 'Avg Duration', value: '2m 40s', color: THEME.warning, icon: Timer },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderRight: i < 3 ? `1px solid ${THEME.glassBorder}` : 'none' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}10` }}>
                                        <s.icon size={13} color={s.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 3 }}>{s.label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            )}
        </div>
    );
};

export default ResourcesTab;
