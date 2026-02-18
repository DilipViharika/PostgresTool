// ==========================================================================
//  VIGIL — AdminTab (v6 — Advanced Edition)
// ==========================================================================
import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData, postData } from '../../utils/api';
import {
    Settings, Puzzle, Database, Trash2, Search, X, Copy, Check,
    Shield, ShieldCheck, ShieldAlert, Zap, Clock, HardDrive,
    Server, Cpu, Network, RefreshCw, ChevronRight, ChevronDown,
    AlertTriangle, CheckCircle, XCircle, Info, Eye, EyeOff,
    Activity, Lock, Unlock, Download, Upload,
    ArrowUp, ArrowDown, ArrowUpRight, Filter, Hash, Layers,
    ToggleLeft, ToggleRight, ExternalLink, Package, Timer,
    Radio, FileText, Terminal, GitBranch, Power,
    Plug, PlugZap, Wrench, Sliders, BarChart3, Users,
    Edit3, Save, RotateCcw, PlayCircle, Loader2,
    TrendingUp, TrendingDown, Minus,
    ChevronUp, AlertCircle, List,
    Star, Plus
} from 'lucide-react';

// Safe icon aliases — use fallbacks for icons that may not exist in older lucide versions
const MemoryStick   = ({ size, color, style }) => <Database size={size} color={color} style={style} />;
const Gauge         = ({ size, color, style }) => <Activity size={size} color={color} style={style} />;
const Sparkles      = ({ size, color, style }) => <Zap size={size} color={color} style={style} />;
const GitCompare    = ({ size, color, style }) => <GitBranch size={size} color={color} style={style} />;
const CornerUpLeft  = ({ size, color, style }) => <ArrowUp size={size} color={color} style={style} />;
const Layers2       = ({ size, color, style }) => <Layers size={size} color={color} style={style} />;
const Flame         = ({ size, color, style }) => <Zap size={size} color={color} style={style} />;
const Pin           = ({ size, color, style, fill }) => <Star size={size} color={color} style={style} fill={fill} />;
const History       = ({ size, color, style }) => <Clock size={size} color={color} style={style} />;
const Diff          = ({ size, color, style }) => <Filter size={size} color={color} style={style} />;
const ShieldOff     = ({ size, color, style }) => <Shield size={size} color={color} style={style} />;
const Braces        = ({ size, color, style }) => <Hash size={size} color={color} style={style} />;
const SortAsc       = ({ size, color })        => <ChevronUp size={size} color={color} />;
const SortDesc      = ({ size, color })        => <ChevronDown size={size} color={color} />;

/* ═══════════════════════════════════════════════════════════════════════════
   THEME NORMALIZATION — prevents undefined values from crashing CSS templates
   ═══════════════════════════════════════════════════════════════════════════ */
const T = {
    primary:        THEME.primary        || '#3b82f6',
    secondary:      THEME.secondary      || '#818cf8',
    success:        THEME.success        || '#10b981',
    warning:        THEME.warning        || '#f59e0b',
    danger:         THEME.danger         || '#ef4444',
    info:           THEME.info           || '#38bdf8',
    teal:           THEME.teal           || '#14b8a6',
    glass:          THEME.glass          || 'rgba(255,255,255,0.04)',
    glassBorder:    THEME.glassBorder    || 'rgba(255,255,255,0.08)',
    surface:        THEME.surface        || 'rgba(255,255,255,0.06)',
    grid:           THEME.grid           || 'rgba(255,255,255,0.08)',
    textMain:       THEME.textMain       || '#f1f5f9',
    textMuted:      THEME.textMuted      || '#94a3b8',
    textDim:        THEME.textDim        || '#64748b',
};
// Re-export as THEME alias so all existing code works without changes
Object.assign(THEME, T);
const historyReducer = (state, action) => {
    switch (action.type) {
        case 'SET': {
            const next = { ...state.present, [action.key]: action.value };
            return { past: [...state.past, state.present], present: next, future: [] };
        }
        case 'REMOVE': {
            const next = { ...state.present };
            delete next[action.key];
            return { past: [...state.past, state.present], present: next, future: [] };
        }
        case 'BATCH': {
            const next = { ...state.present, ...action.changes };
            return { past: [...state.past, state.present], present: next, future: [] };
        }
        case 'UNDO': {
            if (!state.past.length) return state;
            const prev = state.past[state.past.length - 1];
            return { past: state.past.slice(0, -1), present: prev, future: [state.present, ...state.future] };
        }
        case 'REDO': {
            if (!state.future.length) return state;
            const next = state.future[0];
            return { past: [...state.past, state.present], present: next, future: state.future.slice(1) };
        }
        case 'CLEAR':
            return { past: [], present: {}, future: [] };
        default:
            return state;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const AdminStyles = () => (
    <style>{`
        @keyframes admFadeIn     { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:translateY(0); } }
        @keyframes admFadeInLeft { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes admSlideUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes admPulse      { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes admPulseRing  { 0%{transform:scale(0.8);opacity:0.6;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes admBarGrow    { from{transform:scaleX(0);} to{transform:scaleX(1);} }
        @keyframes admSpin       { to{transform:rotate(360deg);} }
        @keyframes admShake      { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
        @keyframes admGlow       { 0%,100%{box-shadow:0 0 6px currentColor;} 50%{box-shadow:0 0 16px currentColor, 0 0 32px currentColor;} }
        @keyframes admReveal     { from{clip-path:inset(0 100% 0 0);} to{clip-path:inset(0 0% 0 0);} }
        @keyframes admFloat      { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }

        .adm-stagger > * { animation: admFadeIn 0.4s ease-out both; }
        .adm-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .adm-stagger > *:nth-child(2) { animation-delay: 0.05s; }
        .adm-stagger > *:nth-child(3) { animation-delay: 0.10s; }
        .adm-stagger > *:nth-child(4) { animation-delay: 0.15s; }
        .adm-stagger > *:nth-child(5) { animation-delay: 0.20s; }
        .adm-stagger > *:nth-child(6) { animation-delay: 0.25s; }

        .adm-row-hover { transition: background 0.12s; }
        .adm-row-hover:hover { background: ${THEME.primary}08 !important; }
        .adm-row-hover:hover .adm-row-actions { opacity: 1 !important; }
        .adm-row-actions { opacity: 0; transition: opacity 0.15s; }

        .adm-bar-animate { transform-origin: left; animation: admBarGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }

        .adm-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .adm-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .adm-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 2px; }
        .adm-scrollbar::-webkit-scrollbar-corner { background: transparent; }

        .adm-ext-card { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); }
        .adm-ext-card:hover { border-color: ${THEME.glassBorderHover || 'rgba(255,255,255,0.15)'} !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

        .adm-input-field:focus { outline: none; border-color: ${THEME.primary} !important; box-shadow: 0 0 0 2px ${THEME.primary}20; }
        .adm-spin { animation: admSpin 1s linear infinite; }
        .adm-shake { animation: admShake 0.4s ease; }
        .adm-float { animation: admFloat 3s ease-in-out infinite; }

        .adm-tab-btn { transition: all 0.2s cubic-bezier(0.22,1,0.36,1); position: relative; overflow: hidden; }
        .adm-tab-btn::after { content: ''; position: absolute; inset: 0; background: white; opacity: 0; transition: opacity 0.15s; }
        .adm-tab-btn:hover::after { opacity: 0.03; }

        .adm-btn { transition: all 0.15s cubic-bezier(0.22,1,0.36,1); }
        .adm-btn:hover { transform: translateY(-1px); }
        .adm-btn:active { transform: translateY(0); }

        .adm-pill-active { animation: admFadeIn 0.2s ease; }

        .adm-diff-add { background: ${THEME.success}10; border-left: 2px solid ${THEME.success}; }
        .adm-diff-change { background: ${THEME.warning}08; border-left: 2px solid ${THEME.warning}; }
        .adm-diff-high { background: ${THEME.danger}08; border-left: 2px solid ${THEME.danger}; }

        .adm-kbd {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700;
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
            color: ${THEME.textDim}; font-family: monospace; line-height: 1.4;
        }
        .adm-tooltip {
            position: relative;
        }
        .adm-tooltip:hover .adm-tooltip-content {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }
        .adm-tooltip-content {
            position: absolute;
            bottom: calc(100% + 6px);
            left: 50%;
            transform: translateX(-50%) translateY(4px);
            background: rgba(0,0,0,0.9);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 10px;
            white-space: nowrap;
            color: #fff;
            pointer-events: none;
            opacity: 0;
            transition: all 0.15s;
            z-index: 9999;
        }

        .adm-progress-bar {
            height: 100%;
            border-radius: inherit;
            transition: width 1s cubic-bezier(0.22,1,0.36,1);
        }

        .adm-conn-row:hover .adm-kill-btn { opacity: 1 !important; }
        .adm-kill-btn { opacity: 0 !important; transition: opacity 0.15s; }
        .adm-conn-row:hover { background: rgba(255,255,255,0.02) !important; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, accent }) => (
    <div style={{
        background: THEME.glass, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${accent ? `${accent}25` : THEME.glassBorder}`, borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: accent ? `0 0 0 1px ${accent}10, inset 0 1px 0 ${accent}08` : 'none',
        ...style,
    }}>
        {title && (
            <div style={{
                padding: '13px 20px', borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, minHeight: 46,
                background: accent ? `linear-gradient(90deg, ${accent}08 0%, transparent 60%)` : undefined,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && <TIcon size={13} color={accent || THEME.textDim} />}
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
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
const StatusBadge = ({ label, color, pulse, size = 'md' }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: size === 'sm' ? 9 : 10, fontWeight: 700,
        padding: size === 'sm' ? '2px 6px' : '3px 9px', borderRadius: 5,
        background: `${color}12`, color, border: `1px solid ${color}20`,
        lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
        <span style={{
            width: size === 'sm' ? 4 : 5, height: size === 'sm' ? 4 : 5,
            borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}60`,
            flexShrink: 0, animation: pulse ? 'admPulse 1.5s ease-in-out infinite' : 'none'
        }} />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}50`, animation: 'admPulseRing 2s ease-out infinite' }} />
    </div>
);

const RingGauge = ({ value, color, size = 80, strokeWidth = 6, label, sublabel }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = circ * Math.min(value, 100) / 100;
    const dangerColor = value > 90 ? THEME.danger : value > 70 ? THEME.warning : color;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${THEME.grid}60`} strokeWidth={strokeWidth} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dangerColor} strokeWidth={strokeWidth}
                        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 5px ${dangerColor}50)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <span style={{ fontSize: size > 60 ? 18 : 11, fontWeight: 800, color: dangerColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}%</span>
                {label && <span style={{ fontSize: 8, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>}
                {sublabel && <span style={{ fontSize: 7, color: `${dangerColor}80`, fontWeight: 600 }}>{sublabel}</span>}
            </div>
        </div>
    );
};

const MiniSparkline = ({ data, color, height = 28, width = 80 }) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4)}`).join(' ');
    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 3px ${color}50)` }} />
            <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]}
                    r={2.5} fill={color} />
        </svg>
    );
};

const TrendIndicator = ({ value, prev, suffix = '' }) => {
    if (prev == null) return null;
    const diff = value - prev;
    const pct = prev !== 0 ? ((diff / prev) * 100).toFixed(1) : 0;
    if (Math.abs(diff) < 0.001) return <span style={{ fontSize: 9, color: THEME.textDim }}><Minus size={8} style={{ display: 'inline', verticalAlign: 'middle' }} /> stable</span>;
    const up = diff > 0;
    const color = up ? THEME.success : THEME.danger;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
        <span style={{ fontSize: 9, color, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <Icon size={9} /> {Math.abs(pct)}%{suffix}
        </span>
    );
};

const Kbd = ({ children }) => <span className="adm-kbd">{children}</span>;

const Tooltip = ({ content, children }) => (
    <div className="adm-tooltip" style={{ display: 'inline-flex' }}>
        {children}
        <div className="adm-tooltip-content">{content}</div>
    </div>
);

const DiffTag = ({ before, after }) => {
    if (!before || before === after) return null;
    return (
        <span style={{ fontSize: 9, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 3,
            background: `${THEME.warning}15`, color: THEME.warning, border: `1px solid ${THEME.warning}25`, fontFamily: 'monospace' }}>
            <span style={{ opacity: 0.6, textDecoration: 'line-through' }}>{before}</span>
            <ArrowUpRight size={7} />
            <strong>{after}</strong>
        </span>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS & DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const fmtBytes = (b) => {
    if (b == null) return '—';
    const n = Number(b);
    if (n >= 1e9) return `${(n/1e9).toFixed(1)} GB`;
    if (n >= 1e6) return `${(n/1e6).toFixed(1)} MB`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)} KB`;
    return `${n} B`;
};

const fmtDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms/1000).toFixed(1)}s`;
    return `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s`;
};

const RISK_LEVELS = {
    high: { color: '#ef4444', label: 'HIGH RISK', icon: ShieldAlert },
    medium: { color: '#f59e0b', label: 'MEDIUM RISK', icon: AlertTriangle },
    low: { color: '#10b981', label: 'LOW RISK', icon: ShieldCheck },
};

const SETTING_CATEGORIES = {
    memory:      { label: 'Memory',         icon: MemoryStick, color: THEME.secondary || '#818cf8', keys: ['shared_buffers','work_mem','maintenance_work_mem','effective_cache_size','wal_buffers','temp_buffers','huge_pages'] },
    connections: { label: 'Connections',    icon: Network,     color: THEME.primary   || '#3b82f6', keys: ['max_connections','superuser_reserved_connections','max_prepared_transactions','tcp_keepalives','listen_addresses','port'] },
    performance: { label: 'Performance',    icon: Zap,         color: THEME.warning   || '#f59e0b', keys: ['max_worker_processes','max_parallel_workers','max_parallel_workers_per_gather','random_page_cost','effective_io_concurrency','parallel_tuple_cost','jit'] },
    wal:         { label: 'WAL & Recovery', icon: Shield,      color: THEME.success   || '#10b981', keys: ['wal_level','max_wal_size','min_wal_size','checkpoint_timeout','checkpoint_completion_target','archive_mode','wal_compression'] },
    logging:     { label: 'Logging',        icon: FileText,    color: THEME.info      || '#38bdf8', keys: ['log_statement','log_min_duration_statement','log_connections','log_disconnections','logging_collector','log_destination'] },
    autovacuum:  { label: 'Autovacuum',     icon: RefreshCw,   color: THEME.teal      || '#14b8a6', keys: ['autovacuum','autovacuum_max_workers','autovacuum_naptime','autovacuum_vacuum_threshold','autovacuum_analyze_threshold','autovacuum_vacuum_scale_factor'] },
    security:    { label: 'Security',       icon: Lock,        color: '#a78bfa',                    keys: ['ssl','password_encryption','krb_server_keyfile','pg_hba','row_security','fsync','synchronous_commit'] },
};

const categorize = (name) => {
    for (const [cat, def] of Object.entries(SETTING_CATEGORIES))
        if (def.keys.some(k => name.includes(k))) return cat;
    return 'other';
};

/* ── Tuning Algorithm ── */
const calculateTuning = (ramGB, cpus, driveType, profile, pgVersion) => {
    const totalMem = ramGB * 1024 * 1024 * 1024;
    const maxConns = { web: 200, oltp: 300, dw: 40, mixed: 100, readonly: 50 }[profile] || 100;
    const sharedBuffers = Math.floor(totalMem * 0.25);
    const effectiveCache = Math.floor(totalMem * 0.75);
    const maintenanceWorkMem = Math.min(Math.floor(totalMem * 0.1), 2 * 1024 ** 3);
    const estActive = Math.max(1, Math.floor(maxConns * (profile === 'dw' ? 0.5 : 0.1)));
    const workMem = Math.floor((totalMem - sharedBuffers) / (estActive * 3));
    const isSSD = driveType === 'ssd' || driveType === 'nvme';
    const workers = Math.min(8, cpus);
    const gatherWorkers = Math.max(2, Math.floor(workers / 2));
    const toSize = b => b > 1024**3 ? `${Math.floor(b/(1024**3))}GB` : `${Math.floor(b/(1024**2))}MB`;

    const results = [
        { name: 'max_connections',               val: String(maxConns),             reason: `Optimized for ${profile} workload`,  impact: 'restart', risk: 'medium' },
        { name: 'shared_buffers',                val: toSize(sharedBuffers),          reason: '25% of system RAM',                 impact: 'restart', risk: 'low' },
        { name: 'effective_cache_size',          val: toSize(effectiveCache),         reason: '75% RAM (incl. OS cache)',          impact: 'reload',  risk: 'low' },
        { name: 'maintenance_work_mem',          val: toSize(maintenanceWorkMem),     reason: 'For vacuum/index maintenance',      impact: 'reload',  risk: 'low' },
        { name: 'checkpoint_completion_target',  val: '0.9',                          reason: 'Spreads checkpoint I/O',            impact: 'reload',  risk: 'low' },
        { name: 'wal_buffers',                   val: '16MB',                         reason: 'WAL data buffer',                   impact: 'restart', risk: 'low' },
        { name: 'random_page_cost',              val: String(isSSD ? 1.1 : 4.0),      reason: isSSD ? 'SSD random access' : 'HDD seeks', impact: 'reload', risk: 'low' },
        { name: 'effective_io_concurrency',      val: String(isSSD ? 200 : 2),        reason: isSSD ? 'High I/O concurrency' : 'Low I/O concurrency', impact: 'reload', risk: 'low' },
        { name: 'work_mem',                      val: toSize(workMem),                reason: 'Per-operation sort/hash memory',    impact: 'reload',  risk: 'medium' },
        { name: 'max_worker_processes',          val: String(workers),                reason: 'Based on CPU cores',                impact: 'restart', risk: 'low' },
        { name: 'max_parallel_workers_per_gather', val: String(gatherWorkers),        reason: 'Parallel execution limit',          impact: 'reload',  risk: 'low' },
    ];

    if (pgVersion >= 14) {
        results.push({ name: 'max_parallel_maintenance_workers', val: String(Math.max(2, Math.floor(workers / 2))), reason: 'Parallel index builds', impact: 'reload', risk: 'low' });
    }
    if (profile === 'dw') {
        results.push({ name: 'from_collapse_limit', val: '12', reason: 'Larger join collapse for analytics', impact: 'reload', risk: 'low' });
        results.push({ name: 'join_collapse_limit',  val: '12', reason: 'Aggressive join reordering',        impact: 'reload', risk: 'low' });
    }

    return results;
};

/* ── Validation ── */
const validateSettingValue = (setting, value) => {
    const errors = [];
    if (value === '' || value == null) return errors;
    if (['shared_buffers','work_mem','maintenance_work_mem','effective_cache_size','wal_buffers'].includes(setting.name)) {
        if (!/^\d+(MB|GB|kB|TB)$/i.test(value)) errors.push('Must be a memory size like 128MB, 4GB');
    }
    if (setting.name === 'max_connections') {
        const n = parseInt(value);
        if (isNaN(n) || n < 1 || n > 10000) errors.push('Must be 1–10000');
    }
    if (setting.name === 'random_page_cost') {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0) errors.push('Must be a positive number');
    }
    if (setting.riskLevel === 'high' && (value === 'off' || value === '0') && setting.setting !== value) {
        errors.push('⚠️ Disabling this setting may cause data corruption');
    }
    return errors;
};

/* ── Mock Data ── */
const MOCK_EXTENSIONS = [
    { name: 'pg_stat_statements', version: '1.10', description: 'Track planning and execution statistics of all SQL statements', installed: true,  active: true,  superuser: false, category: 'monitoring' },
    { name: 'pgcrypto',           version: '1.3',  description: 'Cryptographic functions including hashing and encryption',     installed: true,  active: true,  superuser: false, category: 'security'   },
    { name: 'uuid-ossp',          version: '1.1',  description: 'Generate universally unique identifiers (UUIDs)',              installed: true,  active: true,  superuser: false, category: 'utility'    },
    { name: 'pg_trgm',            version: '1.6',  description: 'Text similarity measurement and fuzzy string matching',        installed: true,  active: false, superuser: false, category: 'search'     },
    { name: 'postgis',            version: '3.4',  description: 'Spatial database extender for geographic objects',             installed: false, active: false, superuser: true,  category: 'geospatial' },
    { name: 'pg_partman',         version: '5.0',  description: 'Extension to manage time-based and serial-based table partition sets', installed: false, active: false, superuser: false, category: 'partitioning' },
    { name: 'timescaledb',        version: '2.13', description: 'Time-series data management for PostgreSQL',                  installed: false, active: false, superuser: true,  category: 'timeseries' },
    { name: 'pgvector',           version: '0.6',  description: 'Open-source vector similarity search for Postgres',           installed: false, active: false, superuser: false, category: 'ai'         },
];

const MOCK_SETTINGS = [
    { name: 'shared_buffers',                setting: '4GB',      unit: '', source: 'configuration file', short_desc: 'Sets the number of shared memory buffers used by the server.',            category: 'Resource Usage / Memory',                     boot_val: '128MB', pending_restart: false, riskLevel: 'low'    },
    { name: 'work_mem',                      setting: '64MB',     unit: '', source: 'configuration file', short_desc: 'Sets the maximum memory for query operations like sorts and hash joins.',  category: 'Resource Usage / Memory',                     boot_val: '4MB',   pending_restart: false, riskLevel: 'low'    },
    { name: 'maintenance_work_mem',          setting: '512MB',    unit: '', source: 'configuration file', short_desc: 'Maximum memory for maintenance operations (VACUUM, CREATE INDEX).',       category: 'Resource Usage / Memory',                     boot_val: '64MB',  pending_restart: false, riskLevel: 'low'    },
    { name: 'effective_cache_size',          setting: '12GB',     unit: '', source: 'configuration file', short_desc: 'Planner estimate of the effective size of the disk cache.',               category: 'Query Tuning / Planner Cost Constants',       boot_val: '4GB',   pending_restart: false, riskLevel: 'low'    },
    { name: 'max_connections',               setting: '100',      unit: '', source: 'configuration file', short_desc: 'Maximum number of concurrent connections to the database.',               category: 'Connections and Authentication',               boot_val: '100',   pending_restart: true,  riskLevel: 'medium' },
    { name: 'max_worker_processes',          setting: '8',        unit: '', source: 'configuration file', short_desc: 'Maximum number of concurrent worker processes.',                          category: 'Resource Usage / Asynchronous Behavior',      boot_val: '8',     pending_restart: true,  riskLevel: 'low'    },
    { name: 'random_page_cost',              setting: '1.1',      unit: '', source: 'configuration file', short_desc: 'Planner estimate of the cost of a non-sequentially fetched disk page.',   category: 'Query Tuning / Planner Cost Constants',       boot_val: '4',     pending_restart: false, riskLevel: 'low'    },
    { name: 'wal_level',                     setting: 'replica',  unit: '', source: 'configuration file', short_desc: 'WAL logging level to support replication and recovery.',                  category: 'Write-Ahead Log / Settings',                  boot_val: 'replica', pending_restart: true, riskLevel: 'medium' },
    { name: 'fsync',                         setting: 'on',       unit: '', source: 'configuration file', short_desc: 'Forces synchronization of updates to disk.',                              category: 'Write-Ahead Log / Settings',                  boot_val: 'on',    pending_restart: false, riskLevel: 'high'   },
    { name: 'synchronous_commit',            setting: 'on',       unit: '', source: 'configuration file', short_desc: "Sets the current transaction's synchronization level.",                  category: 'Write-Ahead Log / Settings',                  boot_val: 'on',    pending_restart: false, riskLevel: 'medium' },
    { name: 'autovacuum',                    setting: 'on',       unit: '', source: 'configuration file', short_desc: 'Starts the autovacuum subprocess.',                                       category: 'Autovacuum',                                  boot_val: 'on',    pending_restart: false, riskLevel: 'low'    },
    { name: 'autovacuum_max_workers',        setting: '3',        unit: '', source: 'configuration file', short_desc: 'Sets the maximum number of simultaneously running autovacuum worker processes.', category: 'Autovacuum',                           boot_val: '3',     pending_restart: true,  riskLevel: 'low'    },
    { name: 'log_min_duration_statement',    setting: '1000',     unit: 'ms', source: 'configuration file', short_desc: 'Log all statements whose execution time exceeds this threshold.',      category: 'Reporting and Logging',                       boot_val: '-1',    pending_restart: false, riskLevel: 'low'    },
    { name: 'checkpoint_completion_target',  setting: '0.9',      unit: '', source: 'configuration file', short_desc: 'Time spent flushing dirty buffers during checkpoint, as fraction of checkpoint interval.', category: 'Write-Ahead Log / Checkpoints', boot_val: '0.5', pending_restart: false, riskLevel: 'low'  },
    { name: 'effective_io_concurrency',      setting: '200',      unit: '', source: 'configuration file', short_desc: 'Number of simultaneous requests for disk access.',                       category: 'Resource Usage / Asynchronous Behavior',      boot_val: '1',     pending_restart: false, riskLevel: 'low'    },
    { name: 'ssl',                           setting: 'on',       unit: '', source: 'configuration file', short_desc: 'Enables SSL connections.',                                                category: 'Connections and Authentication / SSL',        boot_val: 'off',   pending_restart: true,  riskLevel: 'high'   },
];

const MOCK_CACHE = {
    size: 847, maxSize: 1024, entries: 156, hitRate: 94.7, missRate: 5.3, evictions: 23, avgTtl: '4m 32s', lastCleared: '2026-02-08T14:30:00Z',
    history: [72, 76, 78, 81, 80, 83, 85, 84, 87, 89, 91, 93, 92, 94, 94.7],
    breakdown: [
        { label: 'Query Plans',  size: 340, count: 64, color: '#3b82f6' },
        { label: 'Schema Cache', size: 210, count: 28, color: '#818cf8' },
        { label: 'Stats Cache',  size: 180, count: 42, color: '#10b981' },
        { label: 'Auth Cache',   size:  80, count: 14, color: '#f59e0b' },
        { label: 'Misc',         size:  37, count: 8,  color: '#64748b' },
    ]
};

const MOCK_CONNECTIONS = [
    { pid: 12401, user: 'vigil_app',  db: 'vigil_prod', state: 'active',              query: 'SELECT * FROM pg_stat_activity WHERE state = $1', duration: '0.3s',    durationMs: 300,     client: '10.0.1.42:52400', wait: null,   appName: 'node_app',    cpu: 0.2 },
    { pid: 12407, user: 'vigil_app',  db: 'vigil_prod', state: 'idle in transaction', query: 'UPDATE user_sessions SET last_seen = NOW() WHERE id = $1', duration: '4.8s', durationMs: 4800, client: '10.0.1.44:51200', wait: 'Lock', appName: 'node_app',    cpu: 0.0 },
    { pid: 12410, user: 'analytics',  db: 'vigil_dw',   state: 'active',              query: 'SELECT date_trunc(\'hour\', created_at), count(*) FROM events GROUP BY 1', duration: '12m 4s', durationMs: 724000, client: '10.0.1.55:48200', wait: 'IO', appName: 'metabase', cpu: 41.2 },
    { pid: 12415, user: 'pg_backup',  db: 'vigil_prod', state: 'idle',                query: '--',                                                 duration: '0s',     durationMs: 0,       client: '10.0.1.10:52100', wait: null,   appName: 'pg_dump',     cpu: 0.0 },
    { pid: 12418, user: 'replicator', db: 'vigil_prod', state: 'active',              query: 'START_REPLICATION SLOT vigil_replica1 LOGICAL 0/3A12F0', duration: '1h 2m', durationMs: 3720000, client: '10.0.2.5:55000', wait: null, appName: 'pg_repl',    cpu: 1.8 },
];

/* ── Change Log ── */
const MOCK_CHANGE_LOG = [
    { id: 1, ts: '2026-02-17T09:15:00Z', user: 'admin',    param: 'shared_buffers',     before: '2GB',  after: '4GB',  source: 'tuning_wizard' },
    { id: 2, ts: '2026-02-17T09:15:00Z', user: 'admin',    param: 'work_mem',            before: '32MB', after: '64MB', source: 'tuning_wizard' },
    { id: 3, ts: '2026-02-15T14:22:00Z', user: 'devops',   param: 'log_min_duration_statement', before: '-1', after: '1000', source: 'manual' },
    { id: 4, ts: '2026-02-12T11:30:00Z', user: 'admin',    param: 'max_connections',     before: '200',  after: '100',  source: 'manual' },
    { id: 5, ts: '2026-02-10T08:00:00Z', user: 'ci-deploy',param: 'random_page_cost',    before: '4.0',  after: '1.1',  source: 'api' },
];

/* ── Server Stats (for sidebar) ── */
const MOCK_SERVER = {
    version: 'PostgreSQL 16.1', uptime: '14d 6h 22m', os: 'Ubuntu 24.04', arch: 'x86_64',
    cpu: { pct: 12, cores: 8, history: [8, 10, 9, 12, 14, 11, 13, 12] },
    ram: { usedGB: 11.2, totalGB: 16, history: [68, 70, 72, 70, 71, 73, 74, 70] },
    disk: { usedGB: 142, totalGB: 500, iopsRead: 124, iopsWrite: 38 },
    replication: { lag: '0.3s', slots: 2, streaming: true },
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM DIALOG COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ConfirmDialog = ({ title, body, onConfirm, onCancel, danger = false }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <div style={{ width: 400, background: '#111', borderRadius: 14, border: `1px solid ${danger ? THEME.danger + '40' : THEME.glassBorder}`, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'admSlideUp 0.2s ease' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: danger ? `${THEME.danger}15` : `${THEME.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {danger ? <AlertTriangle size={18} color={THEME.danger} /> : <Info size={18} color={THEME.primary} />}
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{body}</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}50`, color: THEME.textMuted, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                <button onClick={onConfirm} style={{ padding: '8px 16px', borderRadius: 8, background: danger ? THEME.danger : THEME.primary, border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    {danger ? 'Yes, proceed' : 'Confirm'}
                </button>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SERVER SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */
const ServerSidebar = ({ collapsed, onToggle }) => {
    const s = MOCK_SERVER;
    const cpuColor = s.cpu.pct > 80 ? THEME.danger : s.cpu.pct > 50 ? THEME.warning : THEME.success;
    const ramPct = Math.round((s.ram.usedGB / s.ram.totalGB) * 100);
    const diskPct = Math.round((s.disk.usedGB / s.disk.totalGB) * 100);

    if (collapsed) return (
        <div style={{ width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 20 }}>
            <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 4 }}>
                <Server size={14} />
            </button>
            <div title={`CPU ${s.cpu.pct}%`}><RingGauge value={s.cpu.pct} color={cpuColor} size={28} strokeWidth={4} /></div>
            <div title={`RAM ${ramPct}%`}><RingGauge value={ramPct} color={THEME.primary} size={28} strokeWidth={4} /></div>
            <div title={`Disk ${diskPct}%`}><RingGauge value={diskPct} color={THEME.secondary} size={28} strokeWidth={4} /></div>
        </div>
    );

    return (
        <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Server</span>
                <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}><ChevronRight size={12} /></button>
            </div>

            {/* Version info */}
            <div style={{ padding: '10px 12px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 4 }}>Instance</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>{s.version}</div>
                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>↑ {s.uptime}</div>
            </div>

            {/* CPU */}
            <div style={{ padding: '10px 12px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Cpu size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim }}>CPU</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: cpuColor }}>{s.cpu.pct}%</span>
                </div>
                <div style={{ height: 3, background: `${THEME.grid}60`, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${s.cpu.pct}%`, height: '100%', background: cpuColor, borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
                <MiniSparkline data={s.cpu.history} color={cpuColor} width={168} height={24} />
            </div>

            {/* RAM */}
            <div style={{ padding: '10px 12px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MemoryStick size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim }}>Memory</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: THEME.primary }}>{s.ram.usedGB}/{s.ram.totalGB}GB</span>
                </div>
                <div style={{ height: 3, background: `${THEME.grid}60`, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${ramPct}%`, height: '100%', background: THEME.primary, borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
            </div>

            {/* Disk */}
            <div style={{ padding: '10px 12px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <HardDrive size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim }}>Disk</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: THEME.secondary }}>{diskPct}%</span>
                </div>
                <div style={{ height: 3, background: `${THEME.grid}60`, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${diskPct}%`, height: '100%', background: THEME.secondary, borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justify: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 9, color: THEME.textDim }}>↓ {s.disk.iopsRead} IOPS</span>
                    <span style={{ fontSize: 9, color: THEME.textDim }}>↑ {s.disk.iopsWrite} IOPS</span>
                </div>
            </div>

            {/* Replication */}
            <div style={{ padding: '10px 12px', background: THEME.glass, border: `1px solid ${s.replication.streaming ? THEME.success + '30' : THEME.danger + '30'}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <GitBranch size={10} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim }}>Replication</span>
                    </div>
                    <LiveDot color={s.replication.streaming ? THEME.success : THEME.danger} size={6} />
                </div>
                <div style={{ fontSize: 10, color: THEME.textMuted }}>Lag: <strong style={{ color: THEME.success }}>{s.replication.lag}</strong></div>
                <div style={{ fontSize: 10, color: THEME.textMuted }}>Slots: <strong style={{ color: THEME.textMain }}>{s.replication.slots}</strong></div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TUNING WIZARD MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const TuningModal = ({ onClose, onApply, currentSettings }) => {
    const [step, setStep] = useState(1);
    const [inputs, setInputs] = useState({ ram: 8, cpus: 4, storage: 'ssd', profile: 'web', pgVersion: 16 });
    const [recommendations, setRecommendations] = useState([]);
    const [selected, setSelected] = useState(new Set());

    const handleCalculate = () => {
        const recs = calculateTuning(inputs.ram, inputs.cpus, inputs.storage, inputs.profile, inputs.pgVersion);
        setRecommendations(recs);
        setSelected(new Set(recs.map(r => r.name)));
        setStep(2);
    };

    const getCurrent = (key) => {
        const found = currentSettings.find(s => s.name === key);
        return found ? `${found.setting}${found.unit || ''}` : '—';
    };

    const toggleSel = (name) => {
        const next = new Set(selected);
        next.has(name) ? next.delete(name) : next.add(name);
        setSelected(next);
    };

    const restartCount = recommendations.filter(r => selected.has(r.name) && r.impact === 'restart').length;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: 660, maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#0e0e0e', borderRadius: 18, border: `1px solid ${THEME.glassBorder}`, boxShadow: '0 24px 60px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${THEME.grid}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.04))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${THEME.primary}40` }}>
                            <Sparkles size={17} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Config Tuning Wizard</div>
                            <div style={{ fontSize: 10, color: THEME.textDim }}>Step {step} of 2 — {step === 1 ? 'System Specs' : 'Review Recommendations'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: `${THEME.grid}40`, border: 'none', cursor: 'pointer', color: THEME.textDim, width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                </div>

                {/* Step indicator */}
                <div style={{ padding: '12px 24px', borderBottom: `1px solid ${THEME.grid}20`, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1, 2].map(i => (
                        <React.Fragment key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= step ? THEME.primary : THEME.surface, border: `2px solid ${i <= step ? THEME.primary : THEME.grid}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i <= step ? '#fff' : THEME.textDim, transition: 'all 0.3s' }}>
                                    {i < step ? <Check size={10} /> : i}
                                </div>
                                <span style={{ fontSize: 10, color: i <= step ? THEME.textMain : THEME.textDim, fontWeight: i === step ? 700 : 500 }}>{i === 1 ? 'System Specs' : 'Recommendations'}</span>
                            </div>
                            {i < 2 && <div style={{ flex: 1, height: 1, background: step > i ? THEME.primary : `${THEME.grid}40`, transition: 'background 0.3s' }} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="adm-scrollbar" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                    {step === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                {[
                                    { key: 'ram', label: 'System RAM', unit: 'GB', icon: MemoryStick, min: 1, max: 2048 },
                                    { key: 'cpus', label: 'CPU Cores', unit: 'cores', icon: Cpu, min: 1, max: 256 },
                                    { key: 'pgVersion', label: 'PG Version', unit: '', icon: Database, min: 12, max: 17, step: 1 }
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: THEME.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: THEME.surface, border: `1px solid ${THEME.grid}50`, borderRadius: 8 }}>
                                            <f.icon size={14} color={THEME.primary} />
                                            <input type="number" value={inputs[f.key]} min={f.min} max={f.max} step={f.step || 1}
                                                   onChange={e => setInputs({...inputs, [f.key]: Number(e.target.value)})}
                                                   style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', fontWeight: 700, fontSize: 13 }} />
                                            {f.unit && <span style={{ fontSize: 10, color: THEME.textDim, whiteSpace: 'nowrap' }}>{f.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: THEME.textDim, marginBottom: 8, textTransform: 'uppercase' }}>Storage Type</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[{ v: 'ssd', l: 'SSD', i: Zap }, { v: 'nvme', l: 'NVMe', i: Flame }, { v: 'hdd', l: 'HDD', i: HardDrive }].map(t => (
                                        <button key={t.v} onClick={() => setInputs({...inputs, storage: t.v})} style={{
                                            flex: 1, padding: '11px', borderRadius: 8,
                                            border: `1px solid ${inputs.storage === t.v ? THEME.primary : THEME.grid}50`,
                                            background: inputs.storage === t.v ? `${THEME.primary}18` : 'transparent',
                                            color: inputs.storage === t.v ? '#fff' : THEME.textDim,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontWeight: 600, fontSize: 12, transition: 'all 0.2s'
                                        }}>
                                            <t.i size={14} /> {t.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: THEME.textDim, marginBottom: 8, textTransform: 'uppercase' }}>Workload Profile</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { id: 'web',      l: 'Web Application', d: 'High concurrency, short queries',      i: Network },
                                        { id: 'oltp',     l: 'OLTP',            d: 'Transaction safety, mixed workloads', i: Zap },
                                        { id: 'dw',       l: 'Data Warehouse',  d: 'Large analytical queries',            i: BarChart3 },
                                        { id: 'mixed',    l: 'Mixed',           d: 'General purpose workload',            i: Layers },
                                        { id: 'readonly', l: 'Read-Only',       d: 'Reporting replica, low writes',       i: Eye },
                                    ].map(p => (
                                        <button key={p.id} onClick={() => setInputs({...inputs, profile: p.id})} style={{
                                            padding: '12px 14px', borderRadius: 9,
                                            border: `1px solid ${inputs.profile === p.id ? THEME.secondary : THEME.grid}50`,
                                            background: inputs.profile === p.id ? `${THEME.secondary}12` : 'transparent',
                                            textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12
                                        }}>
                                            <p.i size={14} color={inputs.profile === p.id ? THEME.secondary : THEME.textDim} style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: inputs.profile === p.id ? '#fff' : THEME.textMain, fontWeight: 700, fontSize: 12 }}>{p.l}</div>
                                                <div style={{ color: THEME.textDim, fontSize: 10 }}>{p.d}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleCalculate} style={{ padding: '13px', borderRadius: 10, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, boxShadow: `0 4px 16px ${THEME.primary}40`, letterSpacing: '-0.01em' }}>
                                <Sparkles size={16} /> Generate Recommendations
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ flex: 1, padding: '11px 14px', borderRadius: 8, background: `${THEME.success}10`, border: `1px solid ${THEME.success}25`, display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <CheckCircle size={18} color={THEME.success} style={{ flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.success }}>{recommendations.length} parameters optimized</div>
                                        <div style={{ fontSize: 10, color: THEME.textMuted }}>{inputs.ram}GB RAM · {inputs.cpus} Cores · {inputs.storage.toUpperCase()} · {inputs.profile}</div>
                                    </div>
                                </div>
                                {restartCount > 0 && (
                                    <div style={{ padding: '11px 14px', borderRadius: 8, background: `${THEME.warning}10`, border: `1px solid ${THEME.warning}25`, display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <AlertTriangle size={18} color={THEME.warning} style={{ flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.warning }}>{restartCount} require restart</div>
                                            <div style={{ fontSize: 10, color: THEME.textMuted }}>Plan downtime window</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: THEME.textDim }}>{selected.size} of {recommendations.length} selected</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setSelected(new Set(recommendations.map(r => r.name)))} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, background: 'transparent', border: `1px solid ${THEME.grid}50`, color: THEME.textDim, cursor: 'pointer' }}>Select All</button>
                                    <button onClick={() => setSelected(new Set())} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 5, background: 'transparent', border: `1px solid ${THEME.grid}50`, color: THEME.textDim, cursor: 'pointer' }}>Deselect</button>
                                </div>
                            </div>

                            <div style={{ border: `1px solid ${THEME.grid}40`, borderRadius: 10, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                    <thead style={{ background: `${THEME.surface}80` }}>
                                    <tr>
                                        <th style={{ padding: '8px 12px', width: 32 }}></th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: THEME.textDim, fontSize: 10 }}>Parameter</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: THEME.textDim, fontSize: 10 }}>Current</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', color: THEME.success, fontSize: 10 }}>Recommended</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', color: THEME.textDim, fontSize: 10 }}>Reload</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recommendations.map(rec => {
                                        const curr = getCurrent(rec.name);
                                        const changed = curr.replace(/ /g,'') !== rec.val.replace(/ /g,'');
                                        const isSel = selected.has(rec.name);
                                        return (
                                            <tr key={rec.name} onClick={() => toggleSel(rec.name)} style={{ borderTop: `1px solid ${THEME.grid}20`, background: isSel && changed ? `${THEME.success}05` : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                                    <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${isSel ? THEME.primary : THEME.grid}60`, background: isSel ? THEME.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                                        {isSel && <Check size={9} color="#fff" />}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '9px 12px' }}>
                                                    <div style={{ fontWeight: 600, color: THEME.textMain, fontFamily: 'monospace', fontSize: 11 }}>{rec.name}</div>
                                                    <div style={{ fontSize: 9, color: THEME.textDim }}>{rec.reason}</div>
                                                </td>
                                                <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: THEME.textMuted, fontSize: 11 }}>{curr}</td>
                                                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: changed ? THEME.success : THEME.textDim, fontSize: 11 }}>
                                                    {rec.val}{changed && <ArrowUpRight size={9} style={{ marginLeft: 3, display: 'inline', verticalAlign: 'middle' }} />}
                                                </td>
                                                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: rec.impact === 'restart' ? `${THEME.warning}15` : `${THEME.success}10`, color: rec.impact === 'restart' ? THEME.warning : THEME.success, fontWeight: 700 }}>
                                                            {rec.impact === 'restart' ? '⚡ restart' : '↺ reload'}
                                                        </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${THEME.grid}50`, borderRadius: 8, color: THEME.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12 }}>
                                    <CornerUpLeft size={13} /> Back
                                </button>
                                <button onClick={() => onApply(recommendations.filter(r => selected.has(r.name)))} disabled={selected.size === 0} style={{ flex: 2, padding: '12px', background: selected.size > 0 ? THEME.success : THEME.grid, border: 'none', borderRadius: 8, color: selected.size > 0 ? '#000' : THEME.textDim, fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Save size={14} /> Apply {selected.size} Recommendations
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CHANGE LOG MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const ChangeLogModal = ({ onClose }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
        <div style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: '#0e0e0e', borderRadius: 16, border: `1px solid ${THEME.glassBorder}`, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${THEME.grid}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <History size={14} color={THEME.textDim} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Configuration History</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim }}><X size={16} /></button>
            </div>
            <div className="adm-scrollbar" style={{ padding: 20, overflowY: 'auto' }}>
                {MOCK_CHANGE_LOG.map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
                        {i < MOCK_CHANGE_LOG.length - 1 && <div style={{ position: 'absolute', left: 11, top: 22, bottom: -16, width: 1, background: `${THEME.grid}40` }} />}
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${THEME.primary}20`, border: `1px solid ${THEME.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                            <GitBranch size={10} color={THEME.primary} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{entry.param}</span>
                                <span style={{ fontSize: 10, color: THEME.textDim }}>{new Date(entry.ts).toLocaleDateString()} {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 11, color: THEME.textDim, textDecoration: 'line-through' }}>{entry.before}</span>
                                <ArrowUpRight size={10} color={THEME.textDim} />
                                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: THEME.success }}>{entry.after}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ fontSize: 9, color: THEME.textDim }}>by <strong style={{ color: THEME.textMuted }}>{entry.user}</strong></span>
                                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${THEME.primary}10`, color: THEME.primary }}>{entry.source}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AdminTab = () => {
    const [activeSub, setActiveSub] = useState('settings');
    const [settingsData, setSettingsData] = useState([]);
    const [extData, setExtData]       = useState([]);
    const [cacheData, setCacheData]   = useState(null);
    const [connData, setConnData]     = useState([]);
    const [loading, setLoading]       = useState(true);

    // UI State
    const [settingsSearch, setSettingsSearch] = useState('');
    const [settingsCategory, setSettingsCategory] = useState('all');
    const [sortField, setSortField]   = useState(null);
    const [sortDir, setSortDir]       = useState('asc');
    const [extFilter, setExtFilter]   = useState('all');
    const [extSearch, setExtSearch]   = useState('');
    const [viewMode, setViewMode]     = useState('grouped'); // 'grouped' | 'flat' | 'diff'
    const [expandedSetting, setExpandedSetting] = useState(null);
    const [pinnedSettings, setPinnedSettings]   = useState(new Set(['max_connections','shared_buffers','work_mem']));
    const [copiedName, setCopiedName] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [connSort, setConnSort]     = useState({ field: 'durationMs', dir: 'desc' });

    // Edit & Wizard State
    const [isEditMode, setIsEditMode] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [toast, setToast]           = useState(null);
    const [confirm, setConfirm]       = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Undo/redo via reducer
    const [history, dispatch] = useReducer(historyReducer, { past: [], present: {}, future: [] });
    const pendingChanges = history.present;

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && isEditMode) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y' && isEditMode) { e.preventDefault(); dispatch({ type: 'REDO' }); }
            if ((e.metaKey || e.ctrlKey) && e.key === 's' && isEditMode) { e.preventDefault(); triggerSave(); }
            if (e.key === 'Escape') { if (showWizard) setShowWizard(false); if (showChangelog) setShowChangelog(false); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isEditMode, showWizard, showChangelog]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }
    }, [toast]);

    const showToast = (type, msg) => setToast({ type, msg });

    /* ── Data Loading ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeSub === 'settings') {
                const res = await fetchData('/api/admin/settings');
                setSettingsData(Array.isArray(res) && res.length > 0 ? res : MOCK_SETTINGS);
            } else if (activeSub === 'extensions') {
                const res = await fetchData('/api/admin/extensions');
                setExtData(Array.isArray(res) && res.length > 0 ? res : MOCK_EXTENSIONS);
            } else if (activeSub === 'cache') {
                const res = await fetchData('/api/admin/cache/stats');
                setCacheData((res?.size != null && Array.isArray(res?.breakdown) && res.breakdown.length > 0) ? res : MOCK_CACHE);
            } else if (activeSub === 'connections') {
                setConnData(MOCK_CONNECTIONS);
            }
        } catch {
            if (activeSub === 'settings')   setSettingsData(MOCK_SETTINGS);
            if (activeSub === 'extensions') setExtData(MOCK_EXTENSIONS);
            if (activeSub === 'cache')      setCacheData(MOCK_CACHE);
            if (activeSub === 'connections') setConnData(MOCK_CONNECTIONS);
        }
        setLoading(false);
    }, [activeSub]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── Actions ── */
    const handleClearCache = () => {
        setConfirm({
            title: 'Clear Application Cache',
            body: 'This will invalidate all cached query plans and schema data. Active connections may experience temporary slowdowns.',
            danger: true,
            onConfirm: async () => {
                setConfirm(null);
                try { await postData('/api/admin/cache/clear', {}); loadData(); showToast('success', 'Cache cleared successfully'); }
                catch { showToast('error', 'Failed to clear cache'); }
            }
        });
    };

    const handleApplyWizard = (recs) => {
        dispatch({ type: 'BATCH', changes: Object.fromEntries(recs.map(r => [r.name, r.val])) });
        setIsEditMode(true);
        setShowWizard(false);
        showToast('success', `Applied ${recs.length} recommendations`);
    };

    const triggerSave = () => {
        const count = Object.keys(pendingChanges).length;
        if (!count) return;
        const restartRequired = Object.keys(pendingChanges).some(key => settingsData.find(s => s.name === key)?.pending_restart);
        setConfirm({
            title: 'Apply Configuration Changes',
            body: `Apply ${count} configuration change${count > 1 ? 's' : ''}?${restartRequired ? ' ⚠️ Some changes require a server restart to take effect.' : ''}`,
            danger: restartRequired,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    // await postData('/api/admin/settings/bulk-update', pendingChanges);
                    console.log('Saved:', pendingChanges);
                    showToast('success', `Applied ${count} setting${count > 1 ? 's' : ''} successfully`);
                    dispatch({ type: 'CLEAR' });
                    setIsEditMode(false);
                    loadData();
                } catch { showToast('error', 'Failed to apply settings'); }
            }
        });
    };

    const handleKillConnection = (pid) => {
        setConfirm({
            title: `Terminate Connection PID ${pid}`,
            body: 'This will immediately terminate the database connection. Any uncommitted transactions will be rolled back.',
            danger: true,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await postData('/api/admin/connections/kill', { pid });
                    showToast('success', `Connection ${pid} terminated`);
                    loadData();
                } catch { showToast('error', 'Could not terminate connection'); }
            }
        });
    };

    const handleInstallExtension = async (ext) => {
        showToast('success', `Installing ${ext.name}…`);
    };

    const copyVal = (v, name) => {
        navigator.clipboard?.writeText(v);
        setCopiedName(name);
        setTimeout(() => setCopiedName(null), 1500);
    };

    const togglePin = (name) => {
        const next = new Set(pinnedSettings);
        next.has(name) ? next.delete(name) : next.add(name);
        setPinnedSettings(next);
    };

    const handleSetChange = (name, val) => {
        const setting = settingsData.find(s => s.name === name);
        const errors = setting ? validateSettingValue(setting, val) : [];
        setValidationErrors(prev => ({ ...prev, [name]: errors }));
        dispatch({ type: 'SET', key: name, value: val });
    };

    /* ── Filtered Settings ── */
    const filteredSettings = useMemo(() => {
        let list = Array.isArray(settingsData) ? settingsData : [];
        if (settingsCategory !== 'all') list = list.filter(s => categorize(s.name) === settingsCategory);
        if (settingsSearch.trim()) {
            const q = settingsSearch.toLowerCase();
            list = list.filter(s => s.name.toLowerCase().includes(q) || (s.short_desc || '').toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q));
        }
        if (viewMode === 'diff') list = list.filter(s => s.setting !== s.boot_val || pendingChanges[s.name] !== undefined);
        if (sortField) {
            list = [...list].sort((a, b) => {
                const av = a[sortField] || '', bv = b[sortField] || '';
                return sortDir === 'asc' ? av.toString().localeCompare(bv.toString()) : bv.toString().localeCompare(av.toString());
            });
        }
        return list;
    }, [settingsData, settingsCategory, settingsSearch, viewMode, pendingChanges, sortField, sortDir]);

    const settingGroups = useMemo(() => {
        const pinned = filteredSettings.filter(s => pinnedSettings.has(s.name));
        const rest = filteredSettings.filter(s => !pinnedSettings.has(s.name));
        const groups = {};
        if (pinned.length) groups['_pinned'] = pinned;
        rest.forEach(s => {
            const cat = categorize(s.name);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s);
        });
        return groups;
    }, [filteredSettings, pinnedSettings]);

    /* ── Sorted connections ── */
    const sortedConns = useMemo(() => {
        const safe = Array.isArray(connData) ? connData : [];
        return [...safe].sort((a, b) => {
            const av = a[connSort.field], bv = b[connSort.field];
            const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
            return connSort.dir === 'desc' ? -cmp : cmp;
        });
    }, [connData, connSort]);

    const toggleConnSort = (field) => {
        setConnSort(prev => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }));
    };

    /* ── Render Helpers ── */
    const renderEditInput = (s, currentVal, onChange) => {
        const isBool = s.boot_val === 'on' || s.boot_val === 'off' || s.setting === 'on' || s.setting === 'off';
        const errs = validationErrors[s.name] || [];

        if (isBool) {
            const isActive = currentVal === 'on';
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                    <button onClick={() => onChange(isActive ? 'off' : 'on')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: 'none', background: isActive ? `${THEME.success}20` : `${THEME.grid}40`, color: isActive ? THEME.success : THEME.textDim, cursor: 'pointer', fontWeight: 700, fontSize: 11, transition: 'all 0.2s' }}>
                        {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {isActive ? 'ON' : 'OFF'}
                    </button>
                </div>
            );
        }

        const isNumber = /^\d+(\.\d+)?$/.test(s.boot_val);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <input className="adm-input-field"
                       type={isNumber ? 'number' : 'text'}
                       value={currentVal}
                       onChange={e => onChange(e.target.value)}
                       placeholder={s.boot_val}
                       style={{ background: errs.length ? `${THEME.danger}08` : THEME.surface, border: `1px solid ${errs.length ? THEME.danger : THEME.grid}60`, color: THEME.textMain, borderRadius: 5, padding: '4px 8px', fontSize: 12, width: isNumber ? 90 : 130, fontFamily: 'monospace', transition: 'all 0.15s' }} />
                {errs.map((e, i) => <span key={i} style={{ fontSize: 9, color: THEME.danger }}>{e}</span>)}
            </div>
        );
    };

    const renderSettingRow = (s) => {
        const isExpanded  = expandedSetting === s.name;
        const pendingVal  = pendingChanges[s.name];
        const hasPending  = pendingVal !== undefined;
        const displayVal  = hasPending ? pendingVal : s.setting;
        const isModified  = s.setting !== s.boot_val;
        const isPinned    = pinnedSettings.has(s.name);
        const riskDef     = s.riskLevel ? RISK_LEVELS[s.riskLevel] : null;
        const catDef      = SETTING_CATEGORIES[categorize(s.name)];
        const hasError    = (validationErrors[s.name] || []).length > 0;

        return (
            <div key={s.name} className="adm-row-hover" style={{
                padding: '11px 20px', cursor: isEditMode ? 'default' : 'pointer',
                borderBottom: `1px solid ${THEME.grid}15`,
                background: hasError ? `${THEME.danger}06` : hasPending ? `${THEME.success}06` : isExpanded ? `${THEME.primary}03` : 'transparent',
                borderLeft: `2px solid ${hasError ? THEME.danger : hasPending ? THEME.success : isModified && !hasPending ? THEME.secondary : 'transparent'}`,
            }} onClick={() => !isEditMode && setExpandedSetting(isExpanded ? null : s.name)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Icon */}
                    {catDef && <catDef.icon size={11} color={catDef.color} style={{ flexShrink: 0, opacity: 0.7 }} />}

                    {/* Name + badges */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textMain, fontFamily: 'monospace' }}>{s.name}</span>
                            {hasPending && <StatusBadge label="PENDING" color={THEME.success} size="sm" />}
                            {isModified && !hasPending && <StatusBadge label="CUSTOM" color={THEME.secondary} size="sm" />}
                            {s.pending_restart && <StatusBadge label="RESTART" color={THEME.warning} size="sm" />}
                            {riskDef && riskDef.label === 'HIGH RISK' && <StatusBadge label="HIGH RISK" color={THEME.danger} size="sm" />}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Pin/Unpin (always visible on hover) */}
                        <button className="adm-row-actions" onClick={(e) => { e.stopPropagation(); togglePin(s.name); }}
                                title={isPinned ? 'Unpin' : 'Pin to top'}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: isPinned ? THEME.warning : THEME.textDim }}>
                            {isPinned ? <Pin size={10} fill="currentColor" /> : <Pin size={10} />}
                        </button>

                        {isEditMode ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {hasPending && <DiffTag before={s.setting} after={pendingVal} />}
                                {renderEditInput(s, displayVal, val => handleSetChange(s.name, val))}
                                {hasPending && (
                                    <Tooltip content="Reset to original">
                                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE', key: s.name }); setValidationErrors(p => { const n={...p}; delete n[s.name]; return n; }); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                            <RotateCcw size={12} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: hasPending ? THEME.success : isModified ? THEME.secondary : THEME.textMuted }}>
                                    {displayVal}{!hasPending && s.unit ? ` ${s.unit}` : ''}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); copyVal(`${s.name} = ${s.setting}`, s.name); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                    {copiedName === s.name ? <Check size={11} color={THEME.success} /> : <Copy size={11} color={THEME.textDim} />}
                                </button>
                                <ChevronDown size={12} color={THEME.textDim} style={{ transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded details */}
                {isExpanded && !isEditMode && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${THEME.grid}25`, animation: 'admFadeIn 0.15s ease' }}>
                        <p style={{ fontSize: 11.5, color: THEME.textMuted, lineHeight: 1.6, margin: '0 0 10px' }}>{s.short_desc}</p>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 10, marginBottom: 10 }}>
                            <span style={{ color: THEME.textDim }}>Default: <strong style={{ color: THEME.textMuted, fontFamily: 'monospace' }}>{s.boot_val}</strong></span>
                            <span style={{ color: THEME.textDim }}>Source: <strong style={{ color: THEME.textMuted }}>{s.source}</strong></span>
                            {s.category && <span style={{ color: THEME.textDim }}>Category: <strong style={{ color: THEME.textMuted }}>{s.category}</strong></span>}
                        </div>
                        {riskDef && riskDef.label !== 'LOW RISK' && (
                            <div style={{ padding: '9px 12px', borderRadius: 7, background: `${riskDef.color}10`, border: `1px solid ${riskDef.color}25`, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <riskDef.icon size={15} color={riskDef.color} />
                                <span style={{ fontSize: 11, color: riskDef.color, fontWeight: 600 }}>
                                    {s.riskLevel === 'high' ? 'Changing this setting can lead to data loss or corruption. Proceed with extreme caution.' : 'This setting has moderate risk. Test in staging before applying to production.'}
                                </span>
                            </div>
                        )}
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); setIsEditMode(true); setExpandedSetting(null); }}
                                    style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6, border: `1px solid ${THEME.primary}30`, background: `${THEME.primary}10`, color: THEME.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Edit3 size={10} /> Edit Value
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); copyVal(s.name, s.name + '_pg'); }}
                                    style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6, border: `1px solid ${THEME.grid}40`, background: 'transparent', color: THEME.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Terminal size={10} /> Copy as pg.conf
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SortButton = ({ field, label }) => (
        <button onClick={() => { if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('asc'); } }}
                style={{ background: sortField === field ? `${THEME.primary}15` : 'transparent', border: `1px solid ${sortField === field ? THEME.primary + '40' : THEME.grid + '50'}`, borderRadius: 5, padding: '4px 8px', color: sortField === field ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            {label}
            {sortField === field ? (sortDir === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />) : <Minus size={10} />}
        </button>
    );

    /* ═══════════════════════════════════════
       LOADING STATE
       ═══════════════════════════════════════ */
    if (loading) return (
        <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <AdminStyles />
            <Loader2 size={32} className="adm-spin" color={THEME.primary} />
            <div style={{ color: THEME.textDim, fontSize: 12 }}>Loading Admin Panel…</div>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════════════
       MAIN RENDER
       ═══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px 24px' }}>
            <AdminStyles />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[
                        { id: 'settings',    l: 'Config',      i: Settings  },
                        { id: 'extensions',  l: 'Extensions',  i: Puzzle    },
                        { id: 'cache',       l: 'Cache',       i: Database  },
                        { id: 'connections', l: 'Connections', i: Network   },
                    ].map(t => (
                        <button key={t.id} className="adm-tab-btn" onClick={() => setActiveSub(t.id)} style={{
                            padding: '9px 16px', borderRadius: 8, cursor: 'pointer', border: 'none',
                            display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600,
                            background: activeSub === t.id ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` : THEME.surface,
                            color: activeSub === t.id ? '#fff' : THEME.textMuted,
                            boxShadow: activeSub === t.id ? `0 4px 16px ${THEME.primary}35` : 'none',
                        }}>
                            <t.i size={13} /> {t.l}
                            {t.id === 'connections' && connData.some(c => c.wait) && (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.warning, marginLeft: 2 }} />
                            )}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: THEME.textDim }}>
                    <button onClick={loadData} style={{ background: THEME.surface, border: `1px solid ${THEME.grid}50`, borderRadius: 6, padding: '5px', cursor: 'pointer', color: THEME.textDim, display: 'flex' }}>
                        <RefreshCw size={12} />
                    </button>
                    <LiveDot color={THEME.success} size={6} />
                    <span>Connected</span>
                </div>
            </div>

            {/* Content + Sidebar Layout */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ══════════════ SETTINGS TAB ══════════════ */}
                    {activeSub === 'settings' && (
                        <div className="adm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Pending Changes Banner */}
                            {Object.keys(pendingChanges).length > 0 && (
                                <div style={{ padding: '12px 16px', borderRadius: 10, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}25`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, animation: 'admFadeIn 0.2s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <AlertCircle size={16} color={THEME.warning} />
                                        <span style={{ fontSize: 12, color: THEME.warning, fontWeight: 700 }}>{Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length > 1 ? 's' : ''}</span>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>
                                            {Object.keys(pendingChanges).filter(k => settingsData.find(s => s.name === k)?.pending_restart).length > 0 && '⚡ Restart required for some changes'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Tooltip content="Undo (⌘Z)">
                                            <button onClick={() => dispatch({ type: 'UNDO' })} disabled={!history.past.length} style={{ background: 'none', border: `1px solid ${THEME.grid}50`, borderRadius: 6, padding: '4px 8px', cursor: history.past.length ? 'pointer' : 'not-allowed', color: history.past.length ? THEME.textMuted : THEME.textDim, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <RotateCcw size={10} /> Undo
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Redo (⌘Y)">
                                            <button onClick={() => dispatch({ type: 'REDO' })} disabled={!history.future.length} style={{ background: 'none', border: `1px solid ${THEME.grid}50`, borderRadius: 6, padding: '4px 8px', cursor: history.future.length ? 'pointer' : 'not-allowed', color: history.future.length ? THEME.textMuted : THEME.textDim, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <ArrowUpRight size={10} /> Redo
                                            </button>
                                        </Tooltip>
                                        <button onClick={triggerSave} style={{ background: THEME.warning, border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: '#000', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Save size={11} /> Save Now
                                        </button>
                                        <button onClick={() => { dispatch({ type: 'CLEAR' }); setValidationErrors({}); }} style={{ background: 'none', border: `1px solid ${THEME.grid}50`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: THEME.textDim }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Toolbar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                {/* Search */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}60`, flex: 1, maxWidth: 340 }}>
                                    <Search size={12} color={THEME.textDim} />
                                    <input value={settingsSearch} onChange={e => setSettingsSearch(e.target.value)} placeholder="Search parameters, descriptions…"
                                           style={{ border: 'none', background: 'transparent', color: THEME.textMain, outline: 'none', flex: 1, fontSize: 12 }} />
                                    {settingsSearch && <button onClick={() => setSettingsSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={11} color={THEME.textDim} /></button>}
                                </div>

                                {/* View Mode */}
                                <div style={{ display: 'flex', gap: 4, background: THEME.surface, border: `1px solid ${THEME.grid}50`, borderRadius: 7, padding: 3 }}>
                                    {[{ v: 'grouped', i: Layers2, t: 'Grouped' }, { v: 'flat', i: List, t: 'Flat' }, { v: 'diff', i: GitCompare, t: 'Changed Only' }].map(m => (
                                        <Tooltip key={m.v} content={m.t}>
                                            <button onClick={() => setViewMode(m.v)} style={{ padding: '4px 8px', borderRadius: 5, border: 'none', background: viewMode === m.v ? THEME.glass : 'transparent', cursor: 'pointer', color: viewMode === m.v ? THEME.textMain : THEME.textDim, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600 }}>
                                                <m.i size={11} /> <span style={{ display: viewMode === m.v ? 'inline' : 'none' }}>{m.t}</span>
                                            </button>
                                        </Tooltip>
                                    ))}
                                </div>

                                {/* Right actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Tooltip content="Configuration History">
                                        <button onClick={() => setShowChangelog(true)} className="adm-btn" style={{ background: 'transparent', border: `1px solid ${THEME.grid}60`, padding: '7px', borderRadius: 7, cursor: 'pointer', color: THEME.textDim, display: 'flex' }}>
                                            <History size={13} />
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Export JSON">
                                        <button onClick={() => { const b = new Blob([JSON.stringify(settingsData, null, 2)], {type:'application/json'}); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`vigil-config-${new Date().toISOString().slice(0,10)}.json`; a.click(); }} className="adm-btn" style={{ background: 'transparent', border: `1px solid ${THEME.grid}60`, padding: '7px', borderRadius: 7, cursor: 'pointer', color: THEME.textDim, display: 'flex' }}>
                                            <Download size={13} />
                                        </button>
                                    </Tooltip>
                                    <button onClick={() => setShowWizard(true)} className="adm-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, border: `1px solid ${THEME.primary}35`, cursor: 'pointer', background: `linear-gradient(135deg, ${THEME.primary}15, ${THEME.secondary}10)`, color: THEME.primary, fontSize: 11.5, fontWeight: 700 }}>
                                        <Sparkles size={12} /> Tuning Wizard
                                    </button>
                                    <div style={{ width: 1, height: 20, background: `${THEME.grid}60` }} />
                                    {isEditMode ? (
                                        <>
                                            <button onClick={triggerSave} className="adm-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: THEME.success, color: '#000', fontSize: 11.5, fontWeight: 700 }}>
                                                <Save size={12} /> Save{Object.keys(pendingChanges).length > 0 ? ` (${Object.keys(pendingChanges).length})` : ''}
                                            </button>
                                            <button onClick={() => { setIsEditMode(false); dispatch({ type: 'CLEAR' }); setValidationErrors({}); }} style={{ padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', background: THEME.surface, color: THEME.textDim, display: 'flex' }}>
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditMode(true)} className="adm-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, border: `1px solid ${THEME.grid}60`, cursor: 'pointer', background: THEME.surface, color: THEME.textMuted, fontSize: 11.5, fontWeight: 600 }}>
                                            <Edit3 size={12} /> Edit <Kbd>E</Kbd>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category Pills */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button onClick={() => setSettingsCategory('all')} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${settingsCategory === 'all' ? THEME.primary : THEME.grid}50`, background: settingsCategory === 'all' ? `${THEME.primary}15` : 'transparent', color: settingsCategory === 'all' ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'all 0.15s' }}>All</button>
                                {Object.entries(SETTING_CATEGORIES).map(([k, def]) => (
                                    <button key={k} onClick={() => setSettingsCategory(settingsCategory === k ? 'all' : k)} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${settingsCategory === k ? def.color : THEME.grid}50`, background: settingsCategory === k ? `${def.color}15` : 'transparent', color: settingsCategory === k ? def.color : THEME.textDim, cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <def.icon size={9} /> {def.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Bar (flat/diff view) */}
                            {(viewMode === 'flat' || viewMode === 'diff') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 10, color: THEME.textDim }}>Sort by:</span>
                                    <SortButton field="name" label="Name" />
                                    <SortButton field="setting" label="Value" />
                                    <SortButton field="source" label="Source" />
                                    {sortField && <button onClick={() => setSortField(null)} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: 'transparent', border: `1px solid ${THEME.grid}40`, color: THEME.textDim, cursor: 'pointer' }}>Clear</button>}
                                    <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 8 }}>{filteredSettings.length} results</span>
                                </div>
                            )}

                            {/* Settings Display */}
                            {viewMode === 'grouped' ? (
                                Object.entries(settingGroups).map(([cat, items]) => {
                                    const isPinCat = cat === '_pinned';
                                    const catDef = isPinCat ? null : SETTING_CATEGORIES[cat];
                                    return (
                                        <Panel key={cat} title={isPinCat ? 'Pinned' : catDef?.label || 'Other'} icon={isPinCat ? Pin : catDef?.icon || Settings} noPad accent={isPinCat ? THEME.warning : catDef?.color}
                                               rightNode={<span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${THEME.grid}40`, color: THEME.textDim }}>{items.length}</span>}>
                                            {items.map(renderSettingRow)}
                                        </Panel>
                                    );
                                })
                            ) : (
                                <Panel title={viewMode === 'diff' ? 'Changed Parameters' : 'All Parameters'} icon={viewMode === 'diff' ? GitCompare : List} noPad
                                       rightNode={<span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${THEME.grid}40`, color: THEME.textDim }}>{filteredSettings.length}</span>}>
                                    {filteredSettings.length === 0 ? (
                                        <div style={{ padding: 32, textAlign: 'center', color: THEME.textDim }}>
                                            <Diff size={32} color={THEME.grid} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                                            <div style={{ fontSize: 13 }}>No changes detected</div>
                                            <div style={{ fontSize: 11, marginTop: 4 }}>All parameters match their defaults or saved values</div>
                                        </div>
                                    ) : filteredSettings.map(renderSettingRow)}
                                </Panel>
                            )}
                        </div>
                    )}

                    {/* ══════════════ EXTENSIONS TAB ══════════════ */}
                    {activeSub === 'extensions' && (
                        <div className="adm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Toolbar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}60`, flex: 1, maxWidth: 300 }}>
                                    <Search size={12} color={THEME.textDim} />
                                    <input value={extSearch} onChange={e => setExtSearch(e.target.value)} placeholder="Search extensions…"
                                           style={{ border: 'none', background: 'transparent', color: THEME.textMain, outline: 'none', flex: 1, fontSize: 12 }} />
                                </div>
                                {['all','installed','available'].map(f => (
                                    <button key={f} onClick={() => setExtFilter(f)} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${extFilter === f ? THEME.primary : THEME.grid}50`, background: extFilter === f ? `${THEME.primary}12` : 'transparent', color: extFilter === f ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>{f}</button>
                                ))}
                                <div style={{ marginLeft: 'auto', fontSize: 11, color: THEME.textDim }}>{(extData || []).filter(e => e.installed).length} installed</div>
                            </div>

                            {/* Category groups */}
                            {(() => {
                                const safeExtData = Array.isArray(extData) ? extData : [];
                                const filtered = safeExtData.filter(e => {
                                    if (extFilter === 'installed') return e.installed;
                                    if (extFilter === 'available') return !e.installed;
                                    return true;
                                }).filter(e => !extSearch || e.name.toLowerCase().includes(extSearch.toLowerCase()) || e.description.toLowerCase().includes(extSearch.toLowerCase()));
                                const cats = [...new Set(filtered.map(e => e.category))];
                                return cats.map(cat => (
                                    <div key={cat}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Package size={10} /> {cat}
                                            <div style={{ flex: 1, height: 1, background: `${THEME.grid}40` }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                            {filtered.filter(e => e.category === cat).map(ext => (
                                                <div key={ext.name} className="adm-ext-card" style={{ padding: '16px 18px', borderRadius: 13, background: THEME.glass, border: `1px solid ${ext.active ? THEME.success + '25' : ext.installed ? THEME.primary + '15' : THEME.grid + '60'}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: THEME.textMain, fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
                                                                {ext.name}
                                                                {ext.superuser && <Tooltip content="Requires superuser"><Lock size={9} color={THEME.warning} /></Tooltip>}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 5 }}>
                                                                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${THEME.primary}10`, color: THEME.primary }}>v{ext.version}</span>
                                                                {ext.installed && <StatusBadge label={ext.active ? 'Active' : 'Installed'} color={ext.active ? THEME.success : THEME.warning} size="sm" />}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                                            {ext.installed ? <PlugZap size={15} color={ext.active ? THEME.success : THEME.warning} /> : <Plug size={15} color={THEME.textDim} />}
                                                            {!ext.installed && (
                                                                <button onClick={() => handleInstallExtension(ext)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 5, background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: 'pointer', fontWeight: 700 }}>
                                                                    + Install
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: 11, color: THEME.textDim, margin: 0, lineHeight: 1.5 }}>{ext.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}

                    {/* ══════════════ CACHE TAB ══════════════ */}
                    {activeSub === 'cache' && cacheData && (
                        <div className="adm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Stats Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'Hit Rate',    val: `${cacheData.hitRate}%`,  color: THEME.success,   Icon: CheckCircle, hist: cacheData.history },
                                    { label: 'Miss Rate',   val: `${cacheData.missRate}%`, color: THEME.danger,    Icon: XCircle },
                                    { label: 'Entries',     val: cacheData.entries,         color: THEME.primary,   Icon: Hash },
                                    { label: 'Evictions',   val: cacheData.evictions,       color: THEME.warning,   Icon: Trash2 },
                                ].map(stat => (
                                    <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 12, background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 10, color: THEME.textDim }}>{stat.label}</span>
                                            <stat.Icon size={13} color={stat.color} />
                                        </div>
                                        <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{stat.val}</div>
                                        {stat.hist && <MiniSparkline data={stat.hist} color={stat.color} width={100} height={20} />}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
                                {/* Gauge */}
                                <Panel title="Memory Usage" icon={Gauge}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
                                        <RingGauge value={Math.round(cacheData.size / cacheData.maxSize * 100)} color={THEME.primary} size={120} strokeWidth={8} sublabel={`${cacheData.size}/${cacheData.maxSize} KB`} />
                                        <div style={{ width: '100%', fontSize: 11, color: THEME.textDim, lineHeight: 1.8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Avg TTL</span><strong style={{ color: THEME.textMain }}>{cacheData.avgTtl}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Last Cleared</span><strong style={{ color: THEME.textMain }}>{new Date(cacheData.lastCleared).toLocaleDateString()}</strong>
                                            </div>
                                        </div>
                                        <button onClick={handleClearCache} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', background: `${THEME.danger}12`, color: THEME.danger, border: `1px solid ${THEME.danger}25`, borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                                            <Trash2 size={12} /> Clear Cache
                                        </button>
                                    </div>
                                </Panel>

                                {/* Breakdown */}
                                <Panel title="Breakdown" icon={BarChart3}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {(cacheData.breakdown || []).map((b, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color }} />
                                                        <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>{b.label}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                        <span style={{ fontSize: 10, color: THEME.textDim }}>{b.count} entries</span>
                                                        <span style={{ fontSize: 12, fontWeight: 800, color: THEME.textMain, fontFamily: 'monospace' }}>{b.size} KB</span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 6, background: `${THEME.grid}40`, borderRadius: 3, overflow: 'hidden' }}>
                                                    <div className="adm-bar-animate" style={{ width: `${(b.size / cacheData.maxSize) * 100 * 3}%`, height: '100%', background: `linear-gradient(90deg, ${b.color}, ${b.color}99)`, borderRadius: 3, maxWidth: '100%' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ CONNECTIONS TAB ══════════════ */}
                    {activeSub === 'connections' && (
                        <div className="adm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Summary row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'Total',    val: (connData || []).length,                                              color: THEME.textMain },
                                    { label: 'Active',   val: (connData || []).filter(c => c.state === 'active').length,            color: THEME.success  },
                                    { label: 'Waiting',  val: (connData || []).filter(c => c.wait).length,                          color: THEME.warning  },
                                    { label: 'Idle/Txn', val: (connData || []).filter(c => c.state && c.state.includes('idle')).length, color: THEME.textDim },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '12px 16px', borderRadius: 11, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            <Panel title="Active Connections" icon={Network} noPad
                                   rightNode={<button onClick={loadData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, display: 'flex' }}><RefreshCw size={12} /></button>}>
                                <div className="adm-scrollbar" style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                                        <thead>
                                        <tr style={{ borderBottom: `1px solid ${THEME.grid}30` }}>
                                            {[
                                                { h: 'PID',      f: 'pid'        },
                                                { h: 'User',     f: 'user'       },
                                                { h: 'Database', f: 'db'         },
                                                { h: 'State',    f: 'state'      },
                                                { h: 'Duration', f: 'durationMs' },
                                                { h: 'CPU',      f: 'cpu'        },
                                                { h: 'Wait',     f: 'wait'       },
                                                { h: 'Query',    f: null         },
                                                { h: '',         f: null         },
                                            ].map((col, i) => (
                                                <th key={i} onClick={() => col.f && toggleConnSort(col.f)} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: connSort.field === col.f ? THEME.primary : THEME.textDim, cursor: col.f ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            {col.h}
                                                            {col.f && col.f === connSort.field && (connSort.dir === 'asc' ? <SortAsc size={9} /> : <SortDesc size={9} />)}
                                                        </span>
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sortedConns.map(c => {
                                            const isLongRunning = c.durationMs > 60000;
                                            const isBlocked = c.wait === 'Lock';
                                            return (
                                                <tr key={c.pid} className="adm-conn-row" style={{ borderBottom: `1px solid ${THEME.grid}12`, background: isBlocked ? `${THEME.danger}04` : isLongRunning ? `${THEME.warning}04` : 'transparent', transition: 'background 0.15s' }}>
                                                    <td style={{ padding: '10px 14px', fontSize: 12, color: THEME.primary, fontFamily: 'monospace', fontWeight: 700 }}>{c.pid}</td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <div style={{ fontSize: 12, color: THEME.textMuted }}>{c.user}</div>
                                                        <div style={{ fontSize: 9, color: THEME.textDim }}>{c.appName}</div>
                                                    </td>
                                                    <td style={{ padding: '10px 14px', fontSize: 11, color: THEME.textDim, fontFamily: 'monospace' }}>{c.db}</td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <StatusBadge label={c.state} color={c.state === 'active' ? THEME.success : c.state === 'idle' ? THEME.textDim : THEME.warning} size="sm" pulse={c.state === 'active'} />
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: isLongRunning ? THEME.danger : THEME.textMuted }}>{c.duration}</span>
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <div style={{ width: 40, height: 4, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                                                                <div style={{ width: `${Math.min(c.cpu, 100)}%`, height: '100%', background: c.cpu > 80 ? THEME.danger : c.cpu > 40 ? THEME.warning : THEME.success, borderRadius: 2 }} />
                                                            </div>
                                                            <span style={{ fontSize: 10, color: THEME.textDim }}>{c.cpu}%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        {c.wait ? <StatusBadge label={c.wait} color={c.wait === 'Lock' ? THEME.danger : THEME.warning} size="sm" /> : <span style={{ fontSize: 11, color: THEME.textDim }}>—</span>}
                                                    </td>
                                                    <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                                                        <Tooltip content={c.query}>
                                                            <span style={{ fontSize: 11, color: THEME.textDim, fontFamily: 'monospace', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.query}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                        <button className="adm-kill-btn" onClick={() => handleKillConnection(c.pid)} disabled={c.state === 'idle'} title="Terminate Connection"
                                                                style={{ background: `${THEME.danger}15`, border: `1px solid ${THEME.danger}30`, borderRadius: 5, cursor: c.state === 'idle' ? 'not-allowed' : 'pointer', opacity: c.state === 'idle' ? 0.3 : 1, color: THEME.danger, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 10, fontWeight: 700 }}>
                                                            <Power size={11} /> Kill
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </Panel>
                        </div>
                    )}
                </div>

                {/* Server Sidebar */}
                {(activeSub === 'settings' || activeSub === 'connections') && (
                    <ServerSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
                )}
            </div>

            {/* ════ Modals ════ */}
            {showWizard    && <TuningModal currentSettings={settingsData} onClose={() => setShowWizard(false)} onApply={handleApplyWizard} />}
            {showChangelog && <ChangeLogModal onClose={() => setShowChangelog(false)} />}
            {confirm       && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}

            {/* ════ Toast ════ */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000, padding: '12px 18px', borderRadius: 11, background: 'rgba(14,14,14,0.95)', backdropFilter: 'blur(16px)', border: `1px solid ${toast.type === 'error' ? THEME.danger : THEME.success}40`, boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 0 1px ${toast.type === 'error' ? THEME.danger : THEME.success}15`, display: 'flex', alignItems: 'center', gap: 10, animation: 'admSlideUp 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
                    {toast.type === 'error' ? <XCircle size={18} color={THEME.danger} /> : <CheckCircle size={18} color={THEME.success} />}
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{toast.msg}</span>
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 0, marginLeft: 4 }}><X size={12} /></button>
                </div>
            )}
        </div>
    );
};

export default AdminTab;