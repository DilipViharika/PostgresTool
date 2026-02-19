// components/tabs/PerformanceTab.jsx — v4 Advanced+
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { THEME, ChartDefs } from '../../utils/theme.jsx';
import {
    GlassCard, MetricCard, ResourceGauge, DataTable,
    ConnectionPoolBar, SkeletonLoader, NeonProgressBar,
    BloatStatusBadge, EmptyState
} from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';
import {
    Activity, Clock, Server, Lock, Copy, ShieldAlert,
    Cpu, Database, ChevronLeft, Sparkles, Zap,
    ArrowRight, ArrowDown, CheckCircle, Play, X, AlertTriangle,
    FileSearch, BarChart3, HardDrive, Gauge, Network,
    Timer, TrendingUp, TrendingDown, Eye, Layers, GitBranch,
    RotateCcw, Terminal, Workflow, CircleDot, Radio,
    Tag, Bookmark, BookmarkCheck, Trash2, Search, Filter,
    ChevronDown, ChevronRight, MemoryStick, Disc, Wifi,
    SquareStack, FlaskConical, XCircle, List, Calendar,
    Hash, User, AppWindow, RefreshCcw, BarChart2,
    AlertCircle, Info, MoreHorizontal, SlidersHorizontal,
    Layers3, Box, Package, Merge, GitMerge, Columns, Rows,
    PanelLeftOpen, Maximize2, Minimize2, FileText,
    ToggleLeft, ToggleRight, GitCompare, Sigma,
    Wrench, Bot, Leaf, RefreshCw, Archive, Boxes,
    BarChart, TrendingUp as Trend, ChevronUp,
    ArrowUpDown, PieChart, Braces, FileCode,
    Cpu as CpuIcon, MousePointer, Layers2
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, BarChart as RBarChart, Bar, LineChart, Line,
    ReferenceLine, Cell, ComposedChart, ScatterChart, Scatter,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    ReferenceArea
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const PerfStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');

        * { box-sizing: border-box; }

        @keyframes perfFadeIn {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes perfSlideIn {
            from { opacity: 0; transform: translateX(-16px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes perfSlideRight {
            from { opacity: 0; transform: translateX(12px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes perfPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.35; }
        }
        @keyframes perfSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes perfGlow {
            0%, 100% { box-shadow: 0 0 6px var(--gc, #38bdf8), 0 0 0px transparent; }
            50%      { box-shadow: 0 0 18px var(--gc, #38bdf8), 0 0 36px color-mix(in srgb, var(--gc, #38bdf8) 25%, transparent); }
        }
        @keyframes perfBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes perfModalIn {
            from { opacity: 0; transform: scale(0.95) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes perfRipple {
            0%   { transform: scale(0.8); opacity: 0.7; }
            100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes ganttSlide {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes histoGrow {
            from { transform: scaleY(0); }
            to   { transform: scaleY(1); }
        }
        @keyframes workerPulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50%      { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmerScan {
            0%   { left: -60%; }
            100% { left: 130%; }
        }
        @keyframes compareReveal {
            from { opacity: 0; clip-path: inset(0 100% 0 0); }
            to   { opacity: 0.55; clip-path: inset(0 0% 0 0); }
        }
        @keyframes killFlash {
            0%   { background: #ef444430; }
            50%  { background: #ef444418; }
            100% { background: #ef444430; }
        }

        .perf-stagger > * { animation: perfFadeIn 0.42s ease-out both; }
        .perf-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .perf-stagger > *:nth-child(2) { animation-delay: 0.07s; }
        .perf-stagger > *:nth-child(3) { animation-delay: 0.14s; }
        .perf-stagger > *:nth-child(4) { animation-delay: 0.21s; }
        .perf-stagger > *:nth-child(5) { animation-delay: 0.28s; }
        .perf-stagger > *:nth-child(6) { animation-delay: 0.35s; }
        .perf-stagger > *:nth-child(7) { animation-delay: 0.42s; }
        .perf-stagger > *:nth-child(8) { animation-delay: 0.49s; }

        .perf-row-hover { transition: background 0.12s, transform 0.12s; }
        .perf-row-hover:hover {
            background: ${THEME.primary}08 !important;
            transform: translateX(2px);
        }
        .perf-bar-animate {
            transform-origin: left;
            animation: perfBarGrow 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .histo-bar {
            transform-origin: bottom;
            animation: histoGrow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .perf-spin { animation: perfSpin 0.9s linear infinite; }
        .gantt-bar {
            transform-origin: left;
            animation: ganttSlide 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .worker-dot { animation: workerPulse 2.2s ease-in-out infinite; }
        .kill-flash { animation: killFlash 0.8s ease-in-out; }

        .perf-card {
            background: ${THEME.glass};
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid ${THEME.glassBorder};
            border-radius: 14px;
            overflow: hidden;
            position: relative;
        }
        .perf-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.035) 0%, transparent 50%);
            pointer-events: none;
            border-radius: inherit;
        }

        .compare-overlay {
            animation: compareReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .perf-kill-btn {
            transition: all 0.15s;
        }
        .perf-kill-btn:hover {
            background: ${THEME.danger}20 !important;
            border-color: ${THEME.danger}60 !important;
            color: ${THEME.danger} !important;
            transform: scale(1.05);
        }

        .plan-node:hover {
            border-color: rgba(56,189,248,0.35) !important;
            background: rgba(56,189,248,0.04) !important;
        }

        .tag-btn { transition: all 0.15s; }
        .tag-btn:hover { transform: scale(1.04); }

        .filter-chip { transition: all 0.2s; cursor: pointer; }
        .filter-chip:hover { opacity: 0.85; transform: translateY(-1px); }

        /* Monospace everywhere it matters */
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .dm   { font-family: 'DM Sans', sans-serif !important; }
        .bebas { font-family: 'Bebas Neue', sans-serif !important; }

        /* Histogram bars */
        .histo-bucket:hover rect { opacity: 1 !important; }

        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${THEME.grid}60; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.textDim}; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const AnimValue = ({ value, decimals = 0, suffix = '', prefix = '' }) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef();
    useEffect(() => {
        const target = Number(value) || 0;
        let startTime = null;
        const step = ts => {
            if (!startTime) startTime = ts;
            const p = Math.min((ts - startTime) / 900, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(ease * target);
            if (p < 1) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value]);
    return <span className="mono">{prefix}{display.toFixed(decimals)}{suffix}</span>;
};

const LiveDot = ({ color = THEME.success, size = 8, slow = false }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
        <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1.5px solid ${color}`, animation: `perfRipple ${slow ? '3s' : '1.8s'} ease-out infinite` }} />
        <span style={{ width: size * 0.58, height: size * 0.58, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
    </span>
);

const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, accent }) => (
    <div className="perf-card" style={{ display: 'flex', flexDirection: 'column', ...style }}>
        {title && (
            <div style={{
                padding: '11px 16px', borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, minHeight: 44,
                background: accent ? `${accent}06` : 'rgba(255,255,255,0.01)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && (
                        <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent || THEME.primary}14` }}>
                            <TIcon size={12} color={accent || THEME.textDim} />
                        </div>
                    )}
                    <span className="dm" style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '14px 16px' }}>
            {children}
        </div>
    </div>
);

const SeverityTag = ({ ms }) => {
    const n = Number(ms);
    const level = n > 5000 ? { label: 'CRITICAL', color: THEME.danger }
        : n > 1000 ? { label: 'HIGH', color: THEME.warning }
            : n > 200  ? { label: 'MEDIUM', color: THEME.primary }
                : { label: 'LOW', color: THEME.textDim };
    return (
        <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', padding: '2px 7px', borderRadius: 4, background: `${level.color}15`, color: level.color, border: `1px solid ${level.color}25` }}>{level.label}</span>
    );
};

const StatChip = ({ label, value, color = THEME.textMain, icon: Icon, small }) => (
    <div style={{ padding: small ? '8px 11px' : '11px 13px', background: THEME.surface, borderRadius: 8, border: `1px solid ${THEME.grid}35`, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            {Icon && <Icon size={9} color={THEME.textDim} />}
            <span style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{label}</span>
        </div>
        <span className="mono" style={{ fontSize: small ? 14 : 17, fontWeight: 700, color, letterSpacing: '-0.01em', lineHeight: 1 }}>{value}</span>
    </div>
);

const MiniSparkline = ({ data, color, width = 80, height = 24 }) => {
    if (!data?.length) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
    const id = `msp${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).slice(2, 5)}`;
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const SeverityBar = ({ value, max = 100, color = THEME.danger, delay = 0, height = 4 }) => (
    <div style={{ width: '100%', height, background: `${THEME.grid}55`, borderRadius: height, overflow: 'hidden' }}>
        <div className="perf-bar-animate" style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', borderRadius: height, background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 6px ${color}35`, animationDelay: `${delay}s` }} />
    </div>
);

const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy || THEME.surface, backdropFilter: 'blur(14px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 10px 28px rgba(0,0,0,0.45)' }}>
            {label != null && <div className="mono" style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < payload.length - 1 ? 2 : 0 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color || p.fill }} />
                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{p.name}:</span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: p.color || p.fill }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
                </div>
            ))}
        </div>
    );
};

const Divider = ({ style = {} }) => (
    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${THEME.glassBorder}, transparent)`, flexShrink: 0, ...style }} />
);

/* ── Helpers ── */
const fmtMs = v => {
    const n = Number(v);
    return n >= 1000 ? `${(n / 1000).toFixed(2)}s` : `${n.toFixed(1)}ms`;
};
const fmtBytes = v => {
    if (v >= 1073741824) return `${(v / 1073741824).toFixed(1)} GB`;
    if (v >= 1048576)   return `${(v / 1048576).toFixed(1)} MB`;
    if (v >= 1024)      return `${(v / 1024).toFixed(0)} KB`;
    return `${v} B`;
};
const genSpark = (n = 14, base = 40, v = 30) => Array.from({ length: n }, () => base + Math.random() * v);

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: LATENCY HISTOGRAM (p50/p95/p99 visual)
   ═══════════════════════════════════════════════════════════════════════════ */
const LatencyHistogram = ({ queries }) => {
    const buckets = useMemo(() => {
        const edges = [0, 10, 50, 100, 200, 500, 1000, 2000, 5000, Infinity];
        const labels = ['<10ms', '10-50', '50-100', '100-200', '200-500', '500ms-1s', '1-2s', '2-5s', '>5s'];
        const counts = new Array(labels.length).fill(0);
        const synth = queries.length > 0 ? queries : Array.from({ length: 80 }, (_, i) => ({ mean_time_ms: Math.exp(Math.random() * 8) }));
        synth.forEach(q => {
            const ms = Number(q.mean_time_ms || 0);
            for (let i = 0; i < edges.length - 1; i++) {
                if (ms >= edges[i] && ms < edges[i + 1]) { counts[i]++; break; }
            }
        });
        return labels.map((label, i) => ({ label, count: counts[i], pct: (counts[i] / Math.max(synth.length, 1)) * 100 }));
    }, [queries]);

    const max = Math.max(...buckets.map(b => b.count), 1);

    // Compute p50/p95/p99 markers from synthetic data
    const sortedMs = useMemo(() => {
        const arr = queries.length > 0
            ? queries.map(q => Number(q.mean_time_ms || 0)).sort((a, b) => a - b)
            : Array.from({ length: 80 }, () => Math.exp(Math.random() * 8)).sort((a, b) => a - b);
        return arr;
    }, [queries]);

    const pctile = (p) => sortedMs[Math.floor(sortedMs.length * p / 100)] || 0;
    const p50 = pctile(50), p95 = pctile(95), p99 = pctile(99);

    const getBucketIdx = (ms) => {
        const edges = [0, 10, 50, 100, 200, 500, 1000, 2000, 5000, Infinity];
        for (let i = 0; i < edges.length - 1; i++) {
            if (ms >= edges[i] && ms < edges[i + 1]) return i;
        }
        return edges.length - 2;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Percentile summary row */}
            <div style={{ display: 'flex', gap: 10 }}>
                {[
                    { label: 'P50', value: p50, color: '#34d399' },
                    { label: 'P95', value: p95, color: THEME.warning },
                    { label: 'P99', value: p99, color: THEME.danger },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ flex: 1, padding: '10px 12px', borderRadius: 9, background: `${color}08`, border: `1px solid ${color}22`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className="mono" style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.06em' }}>{label}</span>
                        <span className="mono" style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{fmtMs(value)}</span>
                        <div style={{ height: 3, borderRadius: 2, background: `${color}20`, overflow: 'hidden' }}>
                            <div className="perf-bar-animate" style={{ width: `${Math.min((value / (p99 || 1)) * 100, 100)}%`, height: '100%', background: color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Histogram bars */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80, padding: '0 2px' }}>
                {buckets.map((b, i) => {
                    const heightPct = (b.count / max) * 100;
                    const isP50 = i === getBucketIdx(p50);
                    const isP95 = i === getBucketIdx(p95);
                    const isP99 = i === getBucketIdx(p99);
                    const color = isP99 ? THEME.danger : isP95 ? THEME.warning : isP50 ? '#34d399' : THEME.primary;
                    return (
                        <div key={i} className="histo-bucket" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}
                             title={`${b.label}: ${b.count} queries (${b.pct.toFixed(1)}%)`}>
                            {(isP99 || isP95 || isP50) && (
                                <div style={{ position: 'absolute', top: -14, fontSize: 8, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                                    {isP99 ? 'P99' : isP95 ? 'P95' : 'P50'}
                                </div>
                            )}
                            <div
                                className="histo-bar"
                                style={{
                                    width: '100%', height: `${Math.max(heightPct, b.count > 0 ? 4 : 1)}%`,
                                    background: `linear-gradient(180deg, ${color}, ${color}80)`,
                                    borderRadius: '3px 3px 0 0', opacity: b.count > 0 ? 0.88 : 0.2,
                                    boxShadow: b.count > 0 ? `0 0 8px ${color}30` : 'none',
                                    animationDelay: `${i * 0.04}s`,
                                    cursor: 'default',
                                    transition: 'opacity 0.15s',
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            {/* X-axis labels */}
            <div style={{ display: 'flex', gap: 4 }}>
                {buckets.map((b, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: THEME.textDim, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.2, overflow: 'hidden' }}>
                        {b.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: PLAN CACHE STATS PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const PlanCachePanel = ({ stats }) => {
    const cacheData = useMemo(() => ({
        mode: stats?.plan_cache_mode || 'auto',
        cached: stats?.cached_plans || 1842,
        evictions: stats?.plan_evictions || 14,
        hitRatio: stats?.plan_cache_hit_ratio || 94.7,
        genericPlans: stats?.generic_plans || 1620,
        customPlans: stats?.custom_plans || 222,
        avgPlanTime: stats?.avg_plan_time_ms || 0.42,
        preparedStmts: stats?.prepared_statements || 312,
        staleInvalidations: stats?.plan_invalidations || 3,
    }), [stats]);

    const modeColors = { auto: THEME.primary, force_generic: THEME.success, force_custom: THEME.warning };
    const modeColor = modeColors[cacheData.mode] || THEME.primary;

    const pieData = [
        { name: 'Generic', value: cacheData.genericPlans, color: THEME.primary },
        { name: 'Custom', value: cacheData.customPlans, color: THEME.secondary || THEME.warning },
    ];
    const total = cacheData.genericPlans + cacheData.customPlans || 1;

    const trendData = Array.from({ length: 20 }, (_, i) => ({
        t: i,
        hitRatio: Math.max(85, cacheData.hitRatio + Math.sin(i / 3) * 3 - Math.random() * 2),
        evictions: Math.round(Math.random() * 3),
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Mode + summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: `${modeColor}08`, border: `1px solid ${modeColor}25` }}>
                    <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>plan_cache_mode</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: modeColor }}>{cacheData.mode}</span>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${modeColor}18`, color: modeColor, border: `1px solid ${modeColor}25`, fontWeight: 700 }}>
                            {cacheData.mode === 'auto' ? 'Default' : cacheData.mode === 'force_generic' ? 'Perf optimized' : 'Debug mode'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1.5 }}>
                    <StatChip label="Cached Plans" value={cacheData.cached.toLocaleString()} color={THEME.primary} icon={Archive} small />
                    <StatChip label="Hit Ratio" value={`${cacheData.hitRatio.toFixed(1)}%`} color={cacheData.hitRatio > 90 ? THEME.success : THEME.warning} icon={CheckCircle} small />
                    <StatChip label="Prepared Stmts" value={cacheData.preparedStmts} color={THEME.textMuted} icon={Braces} small />
                    <StatChip label="Evictions" value={cacheData.evictions} color={cacheData.evictions > 20 ? THEME.danger : THEME.textDim} icon={Trash2} small />
                </div>
            </div>

            {/* Generic vs Custom split bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>Generic vs Custom Plans</span>
                    <div style={{ display: 'flex', gap: 10, fontSize: 9.5, color: THEME.textDim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: THEME.primary }} /> Generic {Math.round(cacheData.genericPlans / total * 100)}%</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: THEME.secondary || THEME.warning }} /> Custom {Math.round(cacheData.customPlans / total * 100)}%</span>
                    </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: `${THEME.grid}40`, overflow: 'hidden', display: 'flex' }}>
                    <div className="perf-bar-animate" style={{ width: `${(cacheData.genericPlans / total) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${THEME.primary}80, ${THEME.primary})` }} />
                    <div className="perf-bar-animate" style={{ flex: 1, height: '100%', background: `linear-gradient(90deg, ${THEME.secondary || THEME.warning}80, ${THEME.secondary || THEME.warning})`, animationDelay: '0.15s' }} />
                </div>
            </div>

            {/* Hit ratio + eviction trend */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>Cache Hit Ratio Trend</span>
                    <div style={{ display: 'flex', gap: 8, fontSize: 9.5, color: THEME.textDim }}>
                        <span><span style={{ display: 'inline-block', width: 16, height: 2, background: THEME.success, borderRadius: 1, verticalAlign: 'middle', marginRight: 4 }} />Hit Ratio</span>
                        <span><span style={{ display: 'inline-block', width: 16, height: 2, background: THEME.danger, borderRadius: 1, verticalAlign: 'middle', marginRight: 4 }} />Evictions</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                    <ComposedChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis yAxisId="ratio" domain={[80, 100]} tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="%" />
                        <YAxis yAxisId="evict" orientation="right" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip />} />
                        <Area yAxisId="ratio" type="monotone" dataKey="hitRatio" stroke={THEME.success} fill={`${THEME.success}12`} strokeWidth={2} name="Hit %" isAnimationActive />
                        <Bar yAxisId="evict" dataKey="evictions" fill={THEME.danger} opacity={0.7} radius={[2, 2, 0, 0]} name="Evictions" isAnimationActive barSize={6} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Alerts */}
            {cacheData.staleInvalidations > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 7, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}20` }}>
                    <AlertTriangle size={11} color={THEME.warning} />
                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>
                        <strong style={{ color: THEME.warning }}>{cacheData.staleInvalidations}</strong> plan invalidations due to schema changes in last 30 min.
                    </span>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 7, background: `${THEME.primary}06`, border: `1px solid ${THEME.primary}18` }}>
                <Info size={11} color={THEME.primary} />
                <span style={{ fontSize: 10.5, color: THEME.textMuted }}>
                    Avg plan generation: <strong className="mono" style={{ color: THEME.primary }}>{cacheData.avgPlanTime}ms</strong> · Custom plans replan per execution.
                </span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: BACKGROUND WORKER PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const BG_WORKER_TYPES = [
    { type: 'autovacuum worker',   icon: Leaf,     color: '#34d399', desc: 'Vacuum & analyze' },
    { type: 'logical replication', icon: GitBranch,color: '#38bdf8', desc: 'Logical slot replay' },
    { type: 'bgwriter',            icon: RefreshCw, color: '#a78bfa', desc: 'Dirty buffer flush' },
    { type: 'walwriter',           icon: Archive,  color: '#f59e0b', desc: 'WAL segment writer' },
    { type: 'checkpointer',        icon: CheckCircle, color: '#22c55e', desc: 'Checkpoint management' },
    { type: 'parallel worker',     icon: Boxes,    color: '#e879f9', desc: 'Parallel query exec' },
];

const BackgroundWorkerPanel = ({ conns, stats }) => {
    const workers = useMemo(() => {
        // Synthetic workers since real data may vary
        return [
            { pid: 1204, type: 'autovacuum worker', target: 'public.orders', duration: '2m 14s', progress: 68, color: '#34d399' },
            { pid: 1207, type: 'autovacuum worker', target: 'audit.log_entries', duration: '45s', progress: 23, color: '#34d399' },
            { pid: 1189, type: 'autovacuum worker', target: 'public.sessions', duration: '1m 02s', progress: 91, color: '#34d399' },
            { pid: 1210, type: 'logical replication', target: 'slot: replica_1', duration: 'ongoing', progress: null, color: '#38bdf8' },
            { pid: 1195, type: 'parallel worker', target: 'SELECT orders JOIN...', duration: '340ms', progress: null, color: '#e879f9' },
        ];
    }, []);

    const summary = useMemo(() => {
        const counts = {};
        BG_WORKER_TYPES.forEach(t => { counts[t.type] = 0; });
        workers.forEach(w => {
            const key = BG_WORKER_TYPES.find(t => w.type.includes(t.type.split(' ')[0]))?.type;
            if (key) counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [workers]);

    const vacuumWorkers = workers.filter(w => w.type.includes('autovacuum'));
    const replWorkers   = workers.filter(w => w.type.includes('logical'));
    const otherWorkers  = workers.filter(w => !w.type.includes('autovacuum') && !w.type.includes('logical'));

    // Autovacuum history sparkline (synthetic)
    const vacuumHistory = genSpark(16, 2, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Summary badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {BG_WORKER_TYPES.map(wt => {
                    const count = workers.filter(w => w.type.includes(wt.type.split(' ')[0])).length;
                    return (
                        <div key={wt.type} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: count > 0 ? `${wt.color}10` : `${THEME.grid}15`, border: `1px solid ${count > 0 ? `${wt.color}25` : `${THEME.grid}30`}` }}>
                            <wt.icon size={11} color={count > 0 ? wt.color : THEME.textDim} className={count > 0 ? 'worker-dot' : ''} />
                            <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: count > 0 ? wt.color : THEME.textDim }}>{count}</span>
                            <span style={{ fontSize: 9.5, color: THEME.textDim, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wt.type.replace('worker', '').trim()}</span>
                        </div>
                    );
                })}
            </div>

            <Divider />

            {/* Autovacuum workers */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Leaf size={11} color="#34d399" />
                        <span className="dm" style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autovacuum Workers ({vacuumWorkers.length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: THEME.textDim }}>
                        <span>Last 15m:</span>
                        <MiniSparkline data={vacuumHistory} color="#34d399" width={60} height={18} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {vacuumWorkers.map((w, i) => (
                        <div key={w.pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: `#34d39910`, border: `1px solid #34d39922` }}>
                            <div className="worker-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span className="mono" style={{ fontSize: 9.5, color: THEME.textDim }}>PID {w.pid}</span>
                                        <span style={{ fontSize: 11, color: THEME.textMain, fontWeight: 600 }}>{w.target}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {w.progress != null && (
                                            <span className="mono" style={{ fontSize: 9.5, color: '#34d399', fontWeight: 700 }}>{w.progress}%</span>
                                        )}
                                        <span className="mono" style={{ fontSize: 9.5, color: THEME.textDim }}>{w.duration}</span>
                                    </div>
                                </div>
                                {w.progress != null && (
                                    <div style={{ height: 3, borderRadius: 2, background: `#34d39920`, overflow: 'hidden' }}>
                                        <div className="perf-bar-animate" style={{ width: `${w.progress}%`, height: '100%', background: 'linear-gradient(90deg, #34d39970, #34d399)', animationDelay: `${i * 0.1}s` }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logical replication workers */}
            {replWorkers.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <GitBranch size={11} color="#38bdf8" />
                        <span className="dm" style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logical Replication Workers ({replWorkers.length})</span>
                    </div>
                    {replWorkers.map(w => (
                        <div key={w.pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: `#38bdf810`, border: `1px solid #38bdf822`, marginBottom: 6 }}>
                            <LiveDot color="#38bdf8" size={7} slow />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 11, color: THEME.textMain, fontWeight: 600 }}>{w.target}</span>
                                    <span className="mono" style={{ fontSize: 9.5, color: '#38bdf8' }}>streaming</span>
                                </div>
                                <span className="mono" style={{ fontSize: 9, color: THEME.textDim }}>PID {w.pid} · {w.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Other workers */}
            {otherWorkers.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Bot size={11} color="#e879f9" />
                        <span className="dm" style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Other Workers</span>
                    </div>
                    {otherWorkers.map(w => {
                        const wt = BG_WORKER_TYPES.find(t => w.type.includes(t.type.split(' ')[0])) || BG_WORKER_TYPES[5];
                        return (
                            <div key={w.pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 7, background: `${wt.color}08`, border: `1px solid ${wt.color}18`, marginBottom: 5 }}>
                                <wt.icon size={11} color={wt.color} />
                                <span className="mono" style={{ fontSize: 9.5, color: THEME.textDim }}>PID {w.pid}</span>
                                <span style={{ fontSize: 11, color: THEME.textMuted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.target}</span>
                                <span className="mono" style={{ fontSize: 9.5, color: wt.color }}>{w.duration}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: "COMPARE TO YESTERDAY" SESSION TRAFFIC TOGGLE
   ═══════════════════════════════════════════════════════════════════════════ */
const SessionTrafficChart = ({ sessionTimeline }) => {
    const [compareYesterday, setCompareYesterday] = useState(false);

    const yesterdayData = useMemo(() => sessionTimeline.map(d => ({
        ...d,
        activeYest: Math.max(0, d.active + Math.round(Math.sin(parseInt(d.t) / 3) * 5 - 2 + Math.random() * 3)),
        idleYest: Math.max(0, d.idle + Math.round(Math.cos(parseInt(d.t) / 4) * 3 - 1 + Math.random() * 2)),
    })), [sessionTimeline]);

    const data = compareYesterday ? yesterdayData : sessionTimeline;

    // Anomaly detection: find points where today is > yesterday + some threshold
    const anomalies = useMemo(() => {
        if (!compareYesterday) return [];
        return yesterdayData.filter(d => d.active > d.activeYest * 1.4).map(d => d.t);
    }, [compareYesterday, yesterdayData]);

    return (
        <Panel
            title="Session Traffic"
            icon={Activity}
            accent={THEME.primary}
            rightNode={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, fontSize: 9.5, color: THEME.textDim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.primary }} />Active</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: `${THEME.textDim}80` }} />Idle</span>
                        {compareYesterday && <>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: `${THEME.primary}50`, border: `1px dashed ${THEME.primary}80` }} />Yesterday</span>
                        </>}
                    </div>
                    {/* Compare toggle */}
                    <button
                        onClick={() => setCompareYesterday(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 10px', borderRadius: 7,
                            background: compareYesterday ? `${THEME.secondary || THEME.warning}12` : `${THEME.grid}20`,
                            border: `1px solid ${compareYesterday ? `${THEME.secondary || THEME.warning}35` : `${THEME.grid}40`}`,
                            color: compareYesterday ? (THEME.secondary || THEME.warning) : THEME.textDim,
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: 10, fontWeight: 700,
                        }}
                    >
                        <GitCompare size={11} />
                        vs Yesterday
                        {compareYesterday && anomalies.length > 0 && (
                            <span style={{ marginLeft: 3, padding: '1px 5px', borderRadius: 3, background: THEME.warning, color: '#000', fontSize: 8.5, fontWeight: 800 }}>
                                {anomalies.length} spikes
                            </span>
                        )}
                    </button>
                </div>
            }
        >
            <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                        <defs>
                            <linearGradient id="sessActiveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.38} />
                                <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="sessIdleGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={THEME.textDim} stopOpacity={0.18} />
                                <stop offset="100%" stopColor={THEME.textDim} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="sessYestGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9.5, fill: THEME.textDim, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={32} />
                        <Tooltip content={<ChartTip />} />

                        {/* Anomaly highlights */}
                        {compareYesterday && anomalies.map(t => (
                            <ReferenceArea key={t} x1={t} x2={t} fill={`${THEME.warning}15`} stroke={`${THEME.warning}40`} strokeWidth={1} />
                        ))}

                        {/* Yesterday (behind today) */}
                        {compareYesterday && (
                            <Area
                                type="monotone" dataKey="activeYest" name="Active (Yesterday)"
                                stroke={`${THEME.primary}55`} strokeWidth={1.5} strokeDasharray="5 4"
                                fill="url(#sessYestGrad)" isAnimationActive className="compare-overlay"
                            />
                        )}

                        <Area type="monotone" dataKey="idle" name="Idle" stroke={`${THEME.textDim}60`} strokeWidth={1.5} fill="url(#sessIdleGrad)" isAnimationActive />
                        <Area type="monotone" dataKey="active" name="Active" stroke={THEME.primary} strokeWidth={2.5} fill="url(#sessActiveGrad)" isAnimationActive />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            {compareYesterday && anomalies.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '7px 11px', borderRadius: 7, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}20` }}>
                    <AlertTriangle size={11} color={THEME.warning} />
                    <span style={{ fontSize: 10.5, color: THEME.textMuted }}>
                        <strong style={{ color: THEME.warning }}>{anomalies.length} anomalous spikes</strong> detected vs yesterday — {anomalies.slice(0, 2).map(t => `t=${t}`).join(', ')} exceeded expected by &gt;40%.
                    </span>
                </div>
            )}
        </Panel>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY FINGERPRINTING & HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const fingerprintQuery = (query) => {
    if (!query) return '';
    return query.replace(/\b\d+(\.\d+)?\b/g, '?').replace(/'[^']*'/g, "'?'").replace(/\s+/g, ' ').trim().toLowerCase().substring(0, 80);
};

const groupByFingerprint = (queries) => {
    const groups = {};
    queries.forEach(q => {
        const fp = fingerprintQuery(q.query);
        if (!groups[fp]) groups[fp] = { fingerprint: fp, queries: [], totalCalls: 0, maxTime: 0, minTime: Infinity, avgTime: 0 };
        groups[fp].queries.push(q);
        groups[fp].totalCalls += Number(q.calls || 1);
        groups[fp].maxTime = Math.max(groups[fp].maxTime, Number(q.mean_time_ms || 0));
        groups[fp].minTime = Math.min(groups[fp].minTime, Number(q.mean_time_ms || 0));
    });
    Object.values(groups).forEach(g => {
        g.avgTime = g.queries.reduce((s, q) => s + Number(q.mean_time_ms || 0), 0) / g.queries.length;
        g.representative = g.queries[0];
    });
    return Object.values(groups);
};

const detectN1Patterns = (queries) => {
    const fingerprints = {};
    queries.forEach(q => {
        const fp = fingerprintQuery(q.query);
        fingerprints[fp] = (fingerprints[fp] || 0) + Number(q.calls || 1);
    });
    return Object.entries(fingerprints).filter(([_, c]) => c > 10).map(([fp, count]) => ({ fingerprint: fp, callCount: count, severity: count > 100 ? 'high' : count > 50 ? 'medium' : 'low' })).sort((a, b) => b.callCount - a.callCount);
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI OPTIMIZER
   ═══════════════════════════════════════════════════════════════════════════ */
const generateOptimization = (query) => {
    if (query?.includes('SELECT *')) {
        return { optimized: query.replace('SELECT *', 'SELECT id, name, created_at, status'), reason: 'SELECT * fetches all columns including BLOBs and unused fields, increasing IO by 3-5×.', fixType: 'Column Pruning', category: 'IO Optimization', improvement: '~40% IO Reduction', costBefore: 1240, costAfter: 45, planBefore: [{ op: 'Seq Scan', table: 'users', cost: 1240, rows: '125k' }], planAfter: [{ op: 'Index Scan', table: 'users', cost: 45, rows: '125k', index: 'idx_users_pkey' }] };
    }
    if (query?.includes('OR')) {
        return { optimized: query.replace(/\bOR\b/g, '\nUNION ALL\nSELECT … WHERE'), reason: 'OR conditions disable index usage, forcing sequential scans on both predicates.', fixType: 'Query Rewrite', category: 'Index Utilization', improvement: 'Enables Index Scan', costBefore: 890, costAfter: 120, planBefore: [{ op: 'Seq Scan', table: 'orders', cost: 890, rows: '50k' }], planAfter: [{ op: 'Index Scan (status)', table: 'orders', cost: 60, rows: '25k' }] };
    }
    return { optimized: (query || '') + '\n-- CREATE INDEX idx_users_email ON users(email);', reason: 'No index on "email". Every lookup triggers a full table scan across 2M+ rows.', fixType: 'Index Creation', category: 'Missing Index', improvement: '95% Faster (Seek vs Scan)', costBefore: 2100, costAfter: 8, planBefore: [{ op: 'Seq Scan', table: 'users', cost: 2100, rows: '2.1M' }], planAfter: [{ op: 'Index Scan', table: 'users', cost: 8, rows: 1 }] };
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPLAIN PLAN TREE
   ═══════════════════════════════════════════════════════════════════════════ */
const generateExplainTree = () => [{
    id: 1, op: 'Hash Join', cost: '0.43..2845.12', rows: 12840, actualTime: '45.2..892.3',
    detail: 'Hash Cond: (o.user_id = u.id)', children: [
        { id: 2, op: 'Seq Scan', table: 'orders', cost: '0.00..1240.50', rows: 50000, actualTime: '0.1..210.4', detail: "Filter: (status = 'active')", rowsRemoved: 45200, children: [] },
        { id: 3, op: 'Hash', cost: '0.00..480.20', rows: 8000, actualTime: '12.1..45.6', detail: 'Buckets: 8192  Memory: 512kB', children: [
                { id: 4, op: 'Index Scan', table: 'users', index: 'idx_users_pkey', cost: '0.43..420.10', rows: 8000, actualTime: '0.04..28.3', detail: 'Index Cond: (id > 0)', children: [] }
            ]}
    ]
}];

const ExplainTreeNode = ({ node, depth = 0, maxCost = 2845 }) => {
    const [expanded, setExpanded] = useState(true);
    const costPct = (parseFloat(node.cost?.split('..')[1]) / maxCost) * 100;
    const isExpensive = costPct > 60;
    const color = isExpensive ? THEME.danger : costPct > 30 ? THEME.warning : THEME.success;
    return (
        <div style={{ marginLeft: depth > 0 ? 22 : 0 }}>
            <div className="plan-node" onClick={() => node.children?.length && setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4, cursor: node.children?.length ? 'pointer' : 'default', background: isExpensive ? `${THEME.danger}06` : `${THEME.grid}12`, border: `1px solid ${isExpensive ? `${THEME.danger}20` : `${THEME.grid}28`}`, transition: 'all 0.15s', position: 'relative' }}>
                {depth > 0 && <div style={{ position: 'absolute', left: -22, top: '50%', width: 18, height: 1, background: `${THEME.grid}50` }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                    {node.children?.length ? (
                        <div style={{ color: THEME.textDim, flexShrink: 0, marginTop: 1 }}>
                            {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </div>
                    ) : <div style={{ width: 11 }} />}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="dm" style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>{node.op}</span>
                            {node.table && <span className="mono" style={{ fontSize: 10, color: THEME.primary }}>on {node.table}</span>}
                            {node.index && <span style={{ fontSize: 9.5, color: THEME.success, padding: '1px 6px', borderRadius: 3, background: `${THEME.success}10`, border: `1px solid ${THEME.success}20` }}>idx: {node.index}</span>}
                        </div>
                        <div className="mono" style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 2 }}>{node.detail}</div>
                        {node.rowsRemoved && <div style={{ fontSize: 9.5, color: THEME.warning, marginTop: 1 }}>⚠ {node.rowsRemoved.toLocaleString()} rows removed</div>}
                    </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 800, color }}>{parseFloat(node.cost?.split('..')[1]).toFixed(1)}</span>
                    <div style={{ width: 56, height: 3, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${costPct}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
                    </div>
                    {node.actualTime && <span className="mono" style={{ fontSize: 8.5, color: THEME.textDim }}>{node.actualTime}ms</span>}
                </div>
            </div>
            {expanded && node.children?.map(child => (
                <ExplainTreeNode key={child.id} node={child} depth={depth + 1} maxCost={maxCost} />
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   GANTT CHART
   ═══════════════════════════════════════════════════════════════════════════ */
const GanttChart = ({ queries }) => {
    const now = Date.now();
    const ganttData = (queries.length > 0 ? queries : Array.from({ length: 8 }, (_, i) => ({ query: `SELECT query_${i}…`, mean_time_ms: Math.random() * 3000 + 50 }))).slice(0, 8).map((q, i) => {
        const start = now - Math.random() * 5000;
        const dur = Number(q.mean_time_ms || 100);
        return { ...q, start, end: start + dur, duration: dur, lane: i };
    });
    const minTime = Math.min(...ganttData.map(d => d.start));
    const maxTime = Math.max(...ganttData.map(d => d.end));
    const totalSpan = maxTime - minTime || 1;

    return (
        <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 500 }}>
                <div style={{ display: 'flex', marginLeft: 180, marginBottom: 6 }}>
                    {[0, 25, 50, 75, 100].map(pct => (
                        <div key={pct} style={{ flex: pct === 100 ? 0 : 1, fontSize: 8.5, color: THEME.textDim, textAlign: 'left', borderLeft: `1px dashed ${THEME.grid}40`, paddingLeft: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                            {Math.round(totalSpan * pct / 100)}ms
                        </div>
                    ))}
                </div>
                {ganttData.map((row, i) => {
                    const left = ((row.start - minTime) / totalSpan) * 100;
                    const width = Math.max((row.duration / totalSpan) * 100, 0.5);
                    const color = row.duration > 5000 ? THEME.danger : row.duration > 1000 ? THEME.warning : THEME.primary;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div className="mono" style={{ width: 170, fontSize: 9.5, color: THEME.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
                                {(row.query || `Query ${i + 1}`).substring(0, 22)}…
                            </div>
                            <div style={{ flex: 1, height: 22, background: `${THEME.grid}20`, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                                <div className="gantt-bar" style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 4, minWidth: 4, boxShadow: `0 0 7px ${color}30`, animationDelay: `${i * 0.05}s` }} />
                                <div className="mono" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 8.5, color: THEME.textDim, pointerEvents: 'none' }}>{row.duration.toFixed(0)}ms</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOCK WAIT DETAILS
   ═══════════════════════════════════════════════════════════════════════════ */
const LockWaitDetails = ({ locks, conns }) => {
    const waitChains = useMemo(() => {
        const holders = conns.filter(c => c.state === 'active').slice(0, 3);
        return (locks.length > 0 ? locks : Array.from({ length: 3 }, (_, i) => ({ pid: 8800 + i, query: 'SELECT FOR UPDATE...' }))).slice(0, 5).map((w, i) => ({
            waiter: { pid: w.pid || 8800 + i, query: w.query || 'SELECT FOR UPDATE...', waitTime: `${Math.round(Math.random() * 30) + 5}s` },
            holder: holders[i % Math.max(holders.length, 1)] || { pid: 9000 + i, query: 'UPDATE users SET...', application_name: 'pgadmin4' },
            lockType: ['RowExclusiveLock', 'ShareLock', 'ExclusiveLock', 'RowShareLock'][i % 4],
            relation: ['orders', 'users', 'products', 'inventory', 'sessions'][i % 5],
        }));
    }, [locks, conns]);

    if (!waitChains.length) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}><span style={{ color: THEME.textDim, fontSize: 12 }}>No lock waits detected</span></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {waitChains.map((chain, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, background: `${THEME.danger}04`, border: `1px solid ${THEME.danger}14` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                        <span className="mono" style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${THEME.danger}18`, color: THEME.danger, border: `1px solid ${THEME.danger}25` }}>{chain.lockType}</span>
                        <span style={{ fontSize: 10, color: THEME.textDim }}>on <span className="mono" style={{ color: THEME.primary }}>{chain.relation}</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, padding: '9px 11px', borderRadius: 8, background: `${THEME.danger}08`, border: `1px solid ${THEME.danger}14` }}>
                            <div className="mono" style={{ fontSize: 9.5, color: THEME.danger, fontWeight: 700, marginBottom: 3 }}>WAITING — PID {chain.waiter.pid} ({chain.waiter.waitTime})</div>
                            <div className="mono" style={{ fontSize: 10.5, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chain.waiter.query}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                            <ArrowRight size={13} color={THEME.warning} />
                            <span style={{ fontSize: 8.5, color: THEME.textDim }}>blocked by</span>
                        </div>
                        <div style={{ flex: 1, padding: '9px 11px', borderRadius: 8, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}14` }}>
                            <div className="mono" style={{ fontSize: 9.5, color: THEME.warning, fontWeight: 700, marginBottom: 3 }}>HOLDING — PID {chain.holder.pid}</div>
                            <div className="mono" style={{ fontSize: 10.5, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chain.holder.query || 'BEGIN; UPDATE...'}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NEW: KILL QUERY MODAL (Enhanced)
   ═══════════════════════════════════════════════════════════════════════════ */
const KillQueryModal = ({ query, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [killing, setKilling] = useState(false);
    const reasons = ['Blocking other queries', 'Consuming excessive resources', 'Runaway query / no end condition', 'User requested termination', 'Maintenance window'];

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, animation: 'perfFadeIn 0.2s ease-out' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 490, background: THEME.surface, border: `1px solid ${THEME.danger}30`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px ${THEME.danger}15`, animation: 'perfModalIn 0.3s ease-out' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${THEME.glassBorder}`, background: `linear-gradient(135deg, ${THEME.danger}12, transparent)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: `${THEME.danger}18`, border: `1px solid ${THEME.danger}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'perfGlow 2s ease-in-out infinite', '--gc': THEME.danger }}>
                        <XCircle size={18} color={THEME.danger} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="dm" style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain }}>Terminate Query</div>
                        <div className="mono" style={{ fontSize: 10.5, color: THEME.textMuted }}>PID {query.pid || '—'} · Immediate, cannot be undone</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 4 }}><X size={15} /></button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ padding: 12, borderRadius: 8, background: THEME.bg || THEME.glass, border: `1px solid ${THEME.grid}40`, fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: THEME.textMuted, maxHeight: 70, overflow: 'hidden', lineHeight: 1.5 }}>
                        {(query.query || '').substring(0, 120)}…
                    </div>
                    <div>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textDim, marginBottom: 8 }}>Reason for termination</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {reasons.map(r => (
                                <div key={r} onClick={() => setReason(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 7, cursor: 'pointer', background: reason === r ? `${THEME.danger}10` : 'transparent', border: `1px solid ${reason === r ? `${THEME.danger}28` : `${THEME.grid}30`}`, transition: 'all 0.12s' }}>
                                    <div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${reason === r ? THEME.danger : THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {reason === r && <div style={{ width: 5, height: 5, borderRadius: '50%', background: THEME.danger }} />}
                                    </div>
                                    <span style={{ fontSize: 12, color: reason === r ? THEME.textMain : THEME.textMuted }}>{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${THEME.glassBorder}`, background: 'transparent', color: THEME.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Cancel</button>
                        <button disabled={!reason || killing} onClick={() => { setKilling(true); setTimeout(() => { onConfirm(query, reason); onClose(); }, 1200); }}
                                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: killing ? `${THEME.danger}80` : THEME.danger, color: '#fff', cursor: reason ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12, opacity: !reason ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                            {killing ? <RotateCcw size={12} className="perf-spin" /> : <XCircle size={12} />}
                            {killing ? 'Terminating…' : 'Terminate Query'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY ANALYSIS MODAL (full, with plan tree, trends, tags, inline kill)
   ═══════════════════════════════════════════════════════════════════════════ */
const QueryAnalysisModal = ({ queryData, onClose, onApply, onKill, tags, onTag }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [activePanel, setActivePanel] = useState('diff');
    const [showKillModal, setShowKillModal] = useState(false);
    const opt = generateOptimization(queryData.query);
    const explainTree = generateExplainTree();
    const currentTag = tags?.[queryData.id];

    const trendData = Array.from({ length: 12 }, (_, i) => ({
        t: `${i * 5}m`,
        ms: Number(queryData.mean_time_ms) * (0.7 + Math.sin(i / 3) * 0.3 + Math.random() * 0.2),
        calls: Math.round(Number(queryData.calls || 10) * (0.8 + Math.random() * 0.4)),
    })).reverse();

    const panels = [
        { id: 'diff', label: 'Query Diff', icon: GitBranch },
        { id: 'plan', label: 'Plan Tree', icon: Workflow },
        { id: 'trends', label: 'Trends', icon: TrendingUp },
    ];

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'perfFadeIn 0.2s ease-out' }}>
                <div onClick={e => e.stopPropagation()} style={{ width: '94%', maxWidth: 1110, maxHeight: '90vh', background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.65)', animation: 'perfModalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    {/* Header */}
                    <div style={{ padding: '14px 22px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${THEME.danger}07, transparent)`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${THEME.danger}14`, border: `1px solid ${THEME.danger}25`, animation: 'perfGlow 3s ease-in-out infinite', '--gc': THEME.danger }}>
                                <AlertTriangle size={18} color={THEME.danger} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                                    <h3 className="dm" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: THEME.textMain }}>Slow Query Analysis</h3>
                                    <SeverityTag ms={queryData.mean_time_ms} />
                                    {currentTag && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: currentTag === 'known-slow' ? `${THEME.warning}14` : `${THEME.success}12`, color: currentTag === 'known-slow' ? THEME.warning : THEME.success, border: `1px solid ${currentTag === 'known-slow' ? `${THEME.warning}22` : `${THEME.success}18`}` }}>{currentTag === 'known-slow' ? '⚑ KNOWN SLOW' : '✓ ACCEPTABLE'}</span>}
                                </div>
                                <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <span className="mono">PID <strong style={{ color: THEME.textMain }}>{queryData.pid || 8821}</strong></span>
                                    <span className="mono">Avg <strong style={{ color: THEME.danger }}>{fmtMs(queryData.mean_time_ms)}</strong></span>
                                    <span className="mono">Cache Hit <strong style={{ color: THEME.success }}>{queryData.cacheHit || '94.2'}%</strong></span>
                                    <span className="mono">Temp Files <strong style={{ color: queryData.tempFiles > 0 ? THEME.warning : THEME.textDim }}>{queryData.tempFiles || 0} ({queryData.tempSizeMB || 0} MB)</strong></span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <button className="tag-btn" onClick={() => onTag(queryData.id, currentTag === 'known-slow' ? null : 'known-slow')} style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${THEME.warning}30`, background: currentTag === 'known-slow' ? `${THEME.warning}14` : 'transparent', color: currentTag === 'known-slow' ? THEME.warning : THEME.textDim, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Tag size={10} /> Known Slow
                            </button>
                            <button className="tag-btn" onClick={() => onTag(queryData.id, currentTag === 'acceptable' ? null : 'acceptable')} style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${THEME.success}28`, background: currentTag === 'acceptable' ? `${THEME.success}12` : 'transparent', color: currentTag === 'acceptable' ? THEME.success : THEME.textDim, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={10} /> Acceptable
                            </button>
                            <button onClick={() => setShowKillModal(true)} style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${THEME.danger}28`, background: 'transparent', color: THEME.danger, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}14`; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <XCircle size={10} /> Kill PID
                            </button>
                            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${THEME.grid}`, background: 'transparent', color: THEME.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}18`; e.currentTarget.style.color = THEME.danger; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.textMuted; }}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', overflow: 'hidden' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.glassBorder}`, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', borderBottom: `1px solid ${THEME.glassBorder}`, flexShrink: 0 }}>
                                {panels.map(t => (
                                    <button key={t.id} onClick={() => setActivePanel(t.id)} style={{ flex: 1, padding: '10px 10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, transition: 'all 0.18s', background: activePanel === t.id ? `${THEME.primary}10` : 'transparent', color: activePanel === t.id ? THEME.primary : THEME.textDim, borderBottom: `2px solid ${activePanel === t.id ? THEME.primary : 'transparent'}` }}>
                                        <t.icon size={11} /> {t.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
                                {activePanel === 'diff' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {[
                                            { side: 'Original', color: THEME.danger, code: queryData.query, accent: 'ffaaaa' },
                                            { side: 'Optimized', color: THEME.success, code: opt.optimized, accent: 'aaffcc', badge: opt.fixType },
                                        ].map(({ side, color, code, accent, badge }, idx) => (
                                            <div key={side}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                    <span style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
                                                    <span style={{ fontSize: 9.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{side}</span>
                                                    {badge && <span style={{ marginLeft: 4, fontSize: 8.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${color}14`, color, border: `1px solid ${color}20` }}>{badge}</span>}
                                                </div>
                                                <div style={{ background: `${color}06`, border: `1px solid ${color}18`, padding: '12px 14px', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '8px 0 0 8px' }} />
                                                    <code className="mono" style={{ paddingLeft: 8, display: 'block', fontSize: 11, lineHeight: 1.7, color: `#${accent}`, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</code>
                                                </div>
                                                {idx === 0 && <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}><div style={{ width: 26, height: 26, borderRadius: '50%', background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={12} color={THEME.textDim} /></div></div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activePanel === 'plan' && (
                                    <div>
                                        <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Workflow size={9.5} /> EXPLAIN ANALYZE — Tree View
                                            <span style={{ marginLeft: 'auto', fontSize: 8.5, padding: '2px 7px', borderRadius: 4, background: `${THEME.primary}10`, color: THEME.primary }}>width ∝ cost</span>
                                        </div>
                                        {explainTree.map(node => <ExplainTreeNode key={node.id} node={node} maxCost={2845} />)}
                                    </div>
                                )}
                                {activePanel === 'trends' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div>
                                            <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Execution Time Trend (60 min)</div>
                                            <ResponsiveContainer width="100%" height={130}>
                                                <ComposedChart data={trendData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                                    <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="t" tick={{ fontSize: 8.5, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={2} />
                                                    <YAxis tick={{ fontSize: 8.5, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                                    <Tooltip content={<ChartTip />} />
                                                    <Area type="monotone" dataKey="ms" name="ms" stroke={THEME.danger} fill={`${THEME.danger}10`} strokeWidth={2} isAnimationActive />
                                                    <ReferenceLine y={Number(queryData.mean_time_ms)} stroke={`${THEME.warning}60`} strokeDasharray="4 4" label={{ value: 'avg', position: 'right', fontSize: 8.5, fill: THEME.warning }} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Call Volume</div>
                                            <ResponsiveContainer width="100%" height={90}>
                                                <RBarChart data={trendData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                                    <XAxis dataKey="t" tick={{ fontSize: 8.5, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={2} />
                                                    <YAxis tick={{ fontSize: 8.5, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                                    <Tooltip content={<ChartTip />} />
                                                    <Bar dataKey="calls" name="calls" fill={THEME.primary} opacity={0.75} radius={[2, 2, 0, 0]} isAnimationActive />
                                                </RBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div>
                                    <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Root Cause</div>
                                    <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, background: `${THEME.warning}07`, border: `1px solid ${THEME.warning}14` }}>
                                        <FileSearch size={14} color={THEME.warning} style={{ marginTop: 1, flexShrink: 0 }} />
                                        <div style={{ fontSize: 11.5, color: THEME.textMuted, lineHeight: 1.55 }}>{opt.reason}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Performance Metrics</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                                        <StatChip label="Cache Hit" value={`${queryData.cacheHit || 94.2}%`} color={THEME.success} icon={Database} small />
                                        <StatChip label="Temp Files" value={`${queryData.tempFiles || 0} (${queryData.tempSizeMB || 0} MB)`} color={queryData.tempFiles > 0 ? THEME.warning : THEME.textDim} icon={HardDrive} small />
                                        <StatChip label="Category" value={opt.category} color={THEME.primary} icon={Layers} small />
                                        <StatChip label="Impact" value={opt.improvement} color={THEME.success} icon={TrendingUp} small />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cost Comparison</div>
                                    <div style={{ padding: 14, background: THEME.bg || THEME.glass, borderRadius: 8, border: `1px solid ${THEME.grid}35` }}>
                                        {[{ label: 'Before', value: opt.costBefore, color: THEME.danger, delay: 0 }, { label: 'After', value: opt.costAfter, color: THEME.success, delay: 0.3 }].map((bar, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: i === 0 ? 10 : 12 }}>
                                                <span style={{ width: 36, fontSize: 9.5, color: bar.color, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{bar.label}</span>
                                                <div style={{ flex: 1 }}><SeverityBar value={bar.value} max={opt.costBefore} color={bar.color} delay={bar.delay} /></div>
                                                <span className="mono" style={{ width: 42, fontSize: 12, fontWeight: 800, color: bar.color, textAlign: 'right', flexShrink: 0 }}>{bar.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <Divider style={{ margin: '0 0 10px' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 10.5, color: THEME.textDim }}>Cost reduction</span>
                                            <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: THEME.success }}>{((1 - opt.costAfter / opt.costBefore) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '14px 18px', borderTop: `1px solid ${THEME.glassBorder}`, display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
                                {applied ? (
                                    <div style={{ padding: 12, borderRadius: 8, background: `${THEME.success}14`, border: `1px solid ${THEME.success}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: THEME.success, fontWeight: 700, fontSize: 13, animation: 'perfFadeIn 0.3s ease-out' }}>
                                        <CheckCircle size={15} /> Optimization Applied
                                    </div>
                                ) : (
                                    <>
                                        <button style={{ padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 11.5, background: 'transparent', border: `1px solid ${THEME.glassBorder}`, color: THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.18s' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.color = THEME.primary; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.glassBorder; e.currentTarget.style.color = THEME.textMuted; }}>
                                            <Play size={12} /> Test in Sandbox
                                        </button>
                                        <button onClick={() => { setIsApplying(true); setTimeout(() => { setIsApplying(false); setApplied(true); onApply(queryData.id); setTimeout(onClose, 1200); }, 1500); }}
                                                disabled={isApplying}
                                                style={{ padding: 10, borderRadius: 8, border: 'none', cursor: isApplying ? 'wait' : 'pointer', fontWeight: 700, fontSize: 11.5, color: '#fff', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || '#7c3aed'})`, boxShadow: `0 4px 18px ${THEME.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.18s', opacity: isApplying ? 0.8 : 1 }}>
                                            {isApplying ? <RotateCcw size={12} className="perf-spin" /> : <Sparkles size={12} />}
                                            {isApplying ? 'Applying…' : 'Apply Optimization'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showKillModal && <KillQueryModal query={queryData} onConfirm={onKill} onClose={() => setShowKillModal(false)} />}
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const PerformanceTab = () => {
    const [activeView, setActiveView]       = useState('activity');
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [sessionFilter, setSessionFilter] = useState(null);
    const [data, setData]                   = useState(null);
    const [loading, setLoading]             = useState(true);

    const [queryTags, setQueryTags]             = useState({});
    const [bookmarkedQueries, setBookmarkedQueries] = useState(new Set());
    const [queryGroupMode, setQueryGroupMode]   = useState(false);
    const [activitySubView, setActivitySubView] = useState('queries');
    const [filterUser, setFilterUser]           = useState('');
    const [filterApp, setFilterApp]             = useState('');
    const [searchQuery, setSearchQuery]         = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [killedQueries, setKilledQueries]     = useState(new Set());
    const [healthSubView, setHealthSubView]     = useState('overview');

    useEffect(() => {
        const load = async () => {
            try {
                const [stats, conns, locks, io, repl] = await Promise.all([
                    fetchData('/api/performance/stats'),
                    fetchData('/api/reliability/active-connections'),
                    fetchData('/api/reliability/locks'),
                    fetchData('/api/performance/table-io'),
                    fetchData('/api/reliability/replication'),
                ]);
                setData({ stats, conns: conns || [], locks: locks || [], io: io || [], repl: repl || [] });
            } catch (e) {
                console.error('Perf load error', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div style={{ padding: 24 }}><SkeletonLoader rows={5} height={100} /></div>;
    if (!data) return null;

    const { stats, conns, locks, io, repl } = data;

    const activeSessions  = conns.filter(c => c.state === 'active');
    const idleSessions    = conns.filter(c => c.state?.includes('idle'));
    const longRunning     = conns.filter(c => c.is_slow);
    const totalConns      = conns.length;

    const sessionTimeline = Array.from({ length: 24 }, (_, i) => ({
        t: String(i),
        active: activeSessions.length + Math.round(Math.sin(i / 3) * 4 + Math.random() * 3),
        idle: idleSessions.length + Math.round(Math.cos(i / 4) * 2 + Math.random() * 2),
    }));

    const ioSparklines = (io || []).slice(0, 6).map(t => ({ ...t, spark: genSpark(14) }));

    const uniqueApps  = [...new Set(conns.map(c => c.application_name).filter(Boolean))];
    const uniqueUsers = [...new Set(conns.map(c => c.usename || c.user).filter(Boolean))];

    // Enrich slow queries with temp file sizes
    const rawSlowQueries = (stats?.slowQueries || []).map((q, i) => ({
        ...q, id: q.id ?? i,
        cacheHit: (90 + Math.random() * 9.9).toFixed(1),
        tempFiles: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
        tempSizeMB: Math.random() > 0.7 ? (Math.random() * 48 + 2).toFixed(1) : 0,
        pid: 8800 + i,
    }));

    const filteredSlowQueries = rawSlowQueries.filter(q => {
        const matchSearch = !searchQuery || q.query?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchApp  = !filterApp   || q.application_name === filterApp;
        const matchUser = !filterUser  || q.usename === filterUser;
        return matchSearch && matchApp && matchUser;
    });

    const groupedQueries = queryGroupMode ? groupByFingerprint(filteredSlowQueries) : null;
    const n1Patterns = detectN1Patterns(rawSlowQueries);

    const getFilteredSessionList = () => {
        if (sessionFilter === 'active') return activeSessions;
        if (sessionFilter === 'long')   return longRunning;
        if (sessionFilter === 'idle')   return idleSessions;
        if (sessionFilter === 'blocked') return locks;
        return [];
    };

    const handleTagQuery  = (id, tag) => setQueryTags(prev => tag ? { ...prev, [id]: tag } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== String(id))));
    const handleKillQuery = (query, reason) => { setKilledQueries(prev => new Set([...prev, query.id])); console.log(`KILL PID ${query.pid}: ${reason}`); };

    // Synthetic health timelines
    const cpuTimeline  = Array.from({ length: 30 }, (_, i) => ({ t: `${i * 2}m`, total: 30 + Math.sin(i / 5) * 20 + Math.random() * 15, core0: 40 + Math.sin(i / 4) * 25, core1: 25 + Math.cos(i / 4) * 20, core2: 35 + Math.sin(i / 6) * 15, core3: 20 + Math.cos(i / 5) * 10 }));
    const memTimeline  = Array.from({ length: 30 }, (_, i) => ({ t: `${i * 2}m`, used: 55 + Math.sin(i / 8) * 10, swap: 5 + Math.random() * 3, buffers: 20 + Math.sin(i / 10) * 5 }));
    const diskTimeline = Array.from({ length: 30 }, (_, i) => ({ t: `${i * 2}m`, read: 40 + Math.random() * 60, write: 20 + Math.random() * 40, latency: 1 + Math.random() * 4 }));
    const netTimeline  = Array.from({ length: 30 }, (_, i) => ({ t: `${i * 2}m`, bytesIn: 500 + Math.random() * 800, bytesOut: 200 + Math.random() * 400 }));
    const bufferData   = Array.from({ length: 20 }, (_, i) => ({ t: `${i * 3}m`, hitRatio: 97 + Math.random() * 2.5, dirtyPages: 5 + Math.sin(i / 4) * 3, checkpoints: Math.random() > 0.85 ? 1 : 0 }));

    const ViewTab = ({ id, label, icon: Icon }) => {
        const active = activeView === id;
        return (
            <button onClick={() => setActiveView(id)} style={{ padding: '9px 20px', borderRadius: 8, border: active ? 'none' : `1px solid ${THEME.grid}55`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 12.5, lineHeight: 1, letterSpacing: '0.01em', transition: 'all 0.22s', background: active ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || '#7c3aed'})` : THEME.surface, color: active ? '#fff' : THEME.textMuted, boxShadow: active ? `0 4px 18px ${THEME.primary}35` : 'none' }}>
                <Icon size={13} /> {label}
            </button>
        );
    };

    const SubTab = ({ id, label, icon: Icon, current, set }) => {
        const active = current === id;
        return (
            <button onClick={() => set(id)} style={{ padding: '6px 13px', borderRadius: 6, border: `1px solid ${active ? `${THEME.primary}45` : `${THEME.grid}40`}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 10.5, background: active ? `${THEME.primary}12` : 'transparent', color: active ? THEME.primary : THEME.textMuted, transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
                <Icon size={11} /> {label}
            </button>
        );
    };

    const SessionMetric = ({ icon: Icon, title, value, color, filterKey }) => {
        const isActive = sessionFilter === filterKey;
        return (
            <div onClick={() => setSessionFilter(filterKey)} style={{ cursor: 'pointer', padding: '18px', borderRadius: 12, background: isActive ? `${color}12` : THEME.surface, border: `1px solid ${isActive ? `${color}30` : `${THEME.grid}45`}`, transition: 'all 0.2s', position: 'relative', overflow: 'hidden', minHeight: 105 }}
                 onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = `${color}22`; e.currentTarget.style.background = `${color}06`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                 onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = `${THEME.grid}45`; e.currentTarget.style.background = THEME.surface; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}18` }}>
                        <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    <AnimValue value={value} />
                </div>
            </div>
        );
    };

    const HealthMetricCard = ({ title, value, unit, icon: Icon, color, trend, detail }) => (
        <div style={{ padding: 14, borderRadius: 10, background: THEME.surface, border: `1px solid ${THEME.grid}38`, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={color} /></div>
                    <span style={{ fontSize: 10.5, color: THEME.textDim, fontWeight: 600 }}>{title}</span>
                </div>
                {trend !== undefined && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: trend > 0 ? THEME.danger : THEME.success, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}<span style={{ fontSize: 12, fontWeight: 500, color: THEME.textDim, marginLeft: 3 }}>{unit}</span></div>
            {detail && <div style={{ fontSize: 9.5, color: THEME.textDim }}>{detail}</div>}
        </div>
    );

    /* ── Slow query table columns ── */
    const slowQueryCols = [
        { key: 'sev',        label: '',          maxWidth: 68,  align: 'center', render: (_, row) => <SeverityTag ms={row.mean_time_ms} /> },
        {
            key: 'query', label: 'Query', mono: true, maxWidth: 300,
            render: (t, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={e => { e.stopPropagation(); setBookmarkedQueries(prev => { const s = new Set(prev); s.has(row.id) ? s.delete(row.id) : s.add(row.id); return s; }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: bookmarkedQueries.has(row.id) ? THEME.warning : THEME.grid, padding: 2, flexShrink: 0 }}>
                        {bookmarkedQueries.has(row.id) ? <BookmarkCheck size={10} /> : <Bookmark size={10} />}
                    </button>
                    <span style={{ fontSize: 10.5, lineHeight: 1.4 }}>{t?.length > 55 ? `${t.substring(0, 55)}…` : t}</span>
                    {queryTags[row.id] && <span style={{ fontSize: 7.5, padding: '1px 5px', borderRadius: 3, background: queryTags[row.id] === 'known-slow' ? `${THEME.warning}14` : `${THEME.success}10`, color: queryTags[row.id] === 'known-slow' ? THEME.warning : THEME.success, flexShrink: 0 }}>{queryTags[row.id] === 'known-slow' ? '⚑' : '✓'}</span>}
                </div>
            )
        },
        { key: 'calls',        label: 'Calls',    align: 'right', maxWidth: 60,  render: v => <span className="mono" style={{ color: THEME.textMuted, fontSize: 11 }}>{Number(v || 0).toLocaleString()}</span> },
        { key: 'cacheHit',     label: 'Cache',    align: 'right', maxWidth: 65,  render: (v, row) => <span className="mono" style={{ fontWeight: 700, color: Number(row.cacheHit) > 95 ? THEME.success : THEME.warning, fontSize: 11 }}>{row.cacheHit}%</span> },
        {
            key: 'tmp',        label: 'Tmp Files', align: 'center', maxWidth: 90,
            render: (_, row) => row.tempFiles > 0
                ? <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <span className="mono" style={{ color: THEME.warning, fontWeight: 700, fontSize: 10.5 }}>⚠ {row.tempFiles}</span>
                    <span className="mono" style={{ color: THEME.textDim, fontSize: 9 }}>{row.tempSizeMB} MB</span>
                  </span>
                : <span style={{ color: THEME.textDim, fontSize: 11 }}>—</span>
        },
        {
            key: 'mean_time_ms', label: 'Avg Time', align: 'right', maxWidth: 90,
            render: v => <span className="mono" style={{ fontWeight: 700, color: Number(v) > 1000 ? THEME.danger : THEME.warning }}>{fmtMs(v)}</span>
        },
        {
            key: 'cost_bar', label: 'Cost', maxWidth: 65,
            render: (_, row) => <SeverityBar value={Number(row.mean_time_ms)} max={Number(stats?.slowQueries?.[0]?.mean_time_ms || 100)} color={Number(row.mean_time_ms) > 5000 ? THEME.danger : THEME.warning} height={3} />
        },
        {
            key: 'actions', label: '', align: 'right', maxWidth: 120,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                    {/* NEW: Inline Kill button */}
                    <button
                        className="perf-kill-btn"
                        onClick={e => { e.stopPropagation(); setSelectedQuery({ ...row, _showKill: true }); }}
                        style={{ background: 'transparent', border: `1px solid ${THEME.danger}25`, color: THEME.textDim, padding: '4px 8px', borderRadius: 5, cursor: 'pointer', fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}>
                        <XCircle size={9} /> Kill
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSelectedQuery(row); }} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '4px 9px', borderRadius: 5, cursor: 'pointer', fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${THEME.primary}22`; }} onMouseLeave={e => { e.currentTarget.style.background = `${THEME.primary}10`; }}>
                        <Sparkles size={9} /> Analyze
                    </button>
                </div>
            )
        },
    ];

    const sessionListCols = [
        { key: 'pid',              label: 'PID',   mono: true, maxWidth: 70,  render: v => <span style={{ color: THEME.primary }}>{v}</span> },
        { key: 'usename',          label: 'User',  maxWidth: 90,  render: v => <span style={{ fontSize: 11, color: THEME.textMuted }}>{v || '—'}</span> },
        { key: 'application_name', label: 'App',   maxWidth: 100 },
        { key: 'query',            label: 'Query', mono: true,  render: t => <span style={{ opacity: 0.7, fontSize: 10.5 }}>{t ? t.substring(0, 36) + '…' : '—'}</span> },
        {
            key: 'state', label: 'State', align: 'right',
            render: v => { const c = v === 'active' ? THEME.success : v?.includes('idle') ? THEME.textDim : THEME.warning; return <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${c}14`, color: c, border: `1px solid ${c}18` }}>{v || '—'}</span>; }
        },
    ];

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '0 0 48px 0' }}>
            <PerfStyles />

            {/* View tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ViewTab id="activity" label="Activity & Queries" icon={Zap} />
                <ViewTab id="health"   label="Resources & Health" icon={Cpu} />
            </div>

            {/* ══════════════════ ACTIVITY VIEW ══════════════════ */}
            {activeView === 'activity' && (
                <div className="perf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Live Sessions */}
                    <Panel
                        title={sessionFilter ? `${sessionFilter.charAt(0).toUpperCase() + sessionFilter.slice(1)} Sessions` : 'Live Sessions'}
                        icon={Activity}
                        accent={THEME.primary}
                        rightNode={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: THEME.textDim }}>
                                    <LiveDot color={THEME.success} size={7} />
                                    <span>{totalConns} total connections</span>
                                </div>
                                {sessionFilter && (
                                    <button onClick={() => setSessionFilter(null)} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '4px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <ChevronLeft size={11} /> Back
                                    </button>
                                )}
                            </div>
                        }
                    >
                        {sessionFilter ? (
                            <div style={{ minHeight: 180 }}>
                                <DataTable columns={sessionListCols} data={getFilteredSessionList()} pageSize={6} compact />
                                {getFilteredSessionList().length === 0 && <div style={{ textAlign: 'center', padding: 32, color: THEME.textDim, fontSize: 12 }}>No sessions in this category</div>}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <SessionMetric icon={Activity} title="Active"       value={activeSessions.length} color={THEME.success}   filterKey="active"  />
                                <SessionMetric icon={Clock}    title="Long Running" value={longRunning.length}    color={THEME.warning}   filterKey="long"    />
                                <SessionMetric icon={Server}   title="Idle"         value={idleSessions.length}   color={THEME.textMuted} filterKey="idle"    />
                                <SessionMetric icon={Lock}     title="Blocked"      value={locks.length}          color={THEME.danger}    filterKey="blocked" />
                            </div>
                        )}
                    </Panel>

                    {/* Session Traffic (with compare-to-yesterday) */}
                    <SessionTrafficChart sessionTimeline={sessionTimeline} />

                    {/* Latency Histogram */}
                    <Panel title="Query Latency Distribution" icon={BarChart3} accent={THEME.warning}
                           rightNode={<span style={{ fontSize: 9.5, color: THEME.textDim }}>Histogram of all executed queries</span>}>
                        <LatencyHistogram queries={rawSlowQueries} />
                    </Panel>

                    {/* Slow Query Analysis */}
                    <Panel
                        title="Query Analysis"
                        icon={Zap}
                        accent={THEME.danger}
                        noPad
                        style={{ minHeight: 380 }}
                        rightNode={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 9px', borderRadius: 5, background: `${THEME.danger}12`, color: THEME.danger, border: `1px solid ${THEME.danger}20` }}>{filteredSlowQueries.length} slow</span>
                                {n1Patterns.length > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 9px', borderRadius: 5, background: `${THEME.warning}12`, color: THEME.warning, border: `1px solid ${THEME.warning}20` }}>{n1Patterns.length} N+1</span>}
                            </div>
                        }
                    >
                        {/* Sub-view toolbar */}
                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap' }}>
                                <SubTab id="queries" label="Slow Queries" icon={List}     current={activitySubView} set={setActivitySubView} />
                                <SubTab id="gantt"   label="Timeline"    icon={Calendar}  current={activitySubView} set={setActivitySubView} />
                                <SubTab id="locks"   label="Lock Waits"  icon={Lock}      current={activitySubView} set={setActivitySubView} />
                                <SubTab id="n1"      label="N+1 Patterns"icon={Merge}     current={activitySubView} set={setActivitySubView} />
                            </div>
                            {activitySubView === 'queries' && (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Search size={11} color={THEME.textDim} style={{ position: 'absolute', left: 7 }} />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search…" style={{ paddingLeft: 24, paddingRight: 8, paddingTop: 5, paddingBottom: 5, borderRadius: 6, border: `1px solid ${THEME.grid}50`, background: THEME.bg || THEME.glass, color: THEME.textMain, fontSize: 10.5, width: 140, outline: 'none' }} />
                                    </div>
                                    <button onClick={() => setQueryGroupMode(!queryGroupMode)} style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${queryGroupMode ? `${THEME.primary}40` : `${THEME.grid}40`}`, background: queryGroupMode ? `${THEME.primary}12` : 'transparent', color: queryGroupMode ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.18s' }}>
                                        <Merge size={11} /> Group
                                    </button>
                                    <button onClick={() => setShowFilterPanel(!showFilterPanel)} style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${showFilterPanel ? `${THEME.primary}40` : `${THEME.grid}40`}`, background: showFilterPanel ? `${THEME.primary}12` : 'transparent', color: showFilterPanel ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.18s' }}>
                                        <Filter size={11} /> Filter {(filterApp || filterUser) && <span style={{ width: 5, height: 5, borderRadius: '50%', background: THEME.warning, flexShrink: 0 }} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Filter panel */}
                        {showFilterPanel && activitySubView === 'queries' && (
                            <div style={{ padding: '8px 14px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', gap: 10, background: `${THEME.primary}04`, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600 }}>FILTER:</span>
                                {[{ label: 'All Apps', val: filterApp, set: setFilterApp, options: uniqueApps }, { label: 'All Users', val: filterUser, set: setFilterUser, options: uniqueUsers }].map(({ label, val, set, options }) => (
                                    <select key={label} value={val} onChange={e => set(e.target.value)} style={{ padding: '4px 9px', borderRadius: 5, border: `1px solid ${THEME.grid}50`, background: THEME.surface, color: val ? THEME.primary : THEME.textDim, fontSize: 10.5, cursor: 'pointer', outline: 'none' }}>
                                        <option value="">{label}</option>
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                ))}
                                {(filterApp || filterUser || searchQuery) && (
                                    <button onClick={() => { setFilterApp(''); setFilterUser(''); setSearchQuery(''); }} style={{ padding: '4px 9px', borderRadius: 5, border: `1px solid ${THEME.danger}28`, background: 'transparent', color: THEME.danger, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <X size={9} /> Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sub-view content */}
                        <div style={{ padding: activitySubView === 'queries' && !queryGroupMode ? 0 : 14 }}>
                            {activitySubView === 'queries' && !queryGroupMode && (
                                <DataTable columns={slowQueryCols} data={filteredSlowQueries.filter(q => !killedQueries.has(q.id))} pageSize={7} compact />
                            )}

                            {activitySubView === 'queries' && queryGroupMode && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', padding: '7px 14px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        {['Query Fingerprint', 'Variants', 'Total Calls', 'Avg Time', ''].map((h, i) => (
                                            <div key={i} style={{ fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left', padding: '0 7px' }}>{h}</div>
                                        ))}
                                    </div>
                                    {(groupedQueries || []).map((g, i) => (
                                        <div key={i} className="perf-row-hover" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', padding: '9px 14px', borderBottom: `1px solid ${THEME.grid}18`, alignItems: 'center' }}>
                                            <div className="mono" style={{ fontSize: 10.5, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 7px' }}><Hash size={9} color={THEME.textDim} style={{ marginRight: 4 }} />{g.fingerprint}</div>
                                            <div style={{ textAlign: 'right', fontSize: 11, color: THEME.primary, fontWeight: 600, padding: '0 12px' }}>{g.queries.length}</div>
                                            <div className="mono" style={{ textAlign: 'right', fontSize: 11, color: THEME.textMuted, padding: '0 12px' }}>{g.totalCalls.toLocaleString()}</div>
                                            <div className="mono" style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: g.avgTime > 1000 ? THEME.danger : THEME.warning, padding: '0 12px' }}>{fmtMs(g.avgTime)}</div>
                                            <div style={{ padding: '0 7px' }}>
                                                <button onClick={() => setSelectedQuery(g.representative)} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '4px 9px', borderRadius: 5, cursor: 'pointer', fontSize: 9.5, fontWeight: 600 }}><Sparkles size={9} style={{ marginRight: 3 }} />Analyze</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activitySubView === 'gantt' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                        <span style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textDim }}>Execution Timeline</span>
                                        <span style={{ fontSize: 9.5, color: THEME.textDim, padding: '2px 7px', borderRadius: 4, background: `${THEME.grid}30`, border: `1px solid ${THEME.grid}40` }}>last 5 seconds</span>
                                    </div>
                                    <GanttChart queries={rawSlowQueries} />
                                </div>
                            )}

                            {activitySubView === 'locks' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                        <span style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textDim }}>Lock Wait Chains</span>
                                        <span style={{ fontSize: 9.5, color: locks.length > 0 ? THEME.danger : THEME.success, padding: '2px 7px', borderRadius: 4, background: locks.length > 0 ? `${THEME.danger}10` : `${THEME.success}10` }}>{locks.length} blocked</span>
                                    </div>
                                    <LockWaitDetails locks={locks} conns={conns} />
                                </div>
                            )}

                            {activitySubView === 'n1' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                    <div style={{ fontSize: 10.5, fontWeight: 600, color: THEME.textDim, marginBottom: 4 }}>Repetitive Query Patterns — Potential N+1 Issues</div>
                                    {n1Patterns.length === 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 36 }}><span style={{ color: THEME.textDim, fontSize: 12 }}>No N+1 patterns detected</span></div>
                                    ) : n1Patterns.map((p, i) => (
                                        <div key={i} style={{ padding: 12, borderRadius: 9, background: p.severity === 'high' ? `${THEME.danger}05` : `${THEME.warning}05`, border: `1px solid ${p.severity === 'high' ? `${THEME.danger}14` : `${THEME.warning}14`}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                                        <span style={{ fontSize: 8.5, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: p.severity === 'high' ? `${THEME.danger}18` : `${THEME.warning}15`, color: p.severity === 'high' ? THEME.danger : THEME.warning, textTransform: 'uppercase' }}>{p.severity} N+1</span>
                                                        <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: p.severity === 'high' ? THEME.danger : THEME.warning }}>{p.callCount.toLocaleString()}×</span>
                                                    </div>
                                                    <div className="mono" style={{ fontSize: 10.5, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.fingerprint}</div>
                                                    <div style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 5 }}>⚡ Consider batching with <code style={{ color: THEME.primary }}>IN (?, ?…)</code> or use a JOIN.</div>
                                                </div>
                                                <div style={{ width: 80, flexShrink: 0 }}>
                                                    <SeverityBar value={p.callCount} max={Math.max(...n1Patterns.map(x => x.callCount))} color={p.severity === 'high' ? THEME.danger : THEME.warning} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* Plan Cache + Background Workers (NEW row) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <Panel title="Query Plan Cache" icon={Archive} accent={THEME.primary}>
                            <PlanCachePanel stats={stats} />
                        </Panel>
                        <Panel title="Background Workers" icon={Bot} accent="#34d399">
                            <BackgroundWorkerPanel conns={conns} stats={stats} />
                        </Panel>
                    </div>
                </div>
            )}

            {/* ══════════════════ HEALTH VIEW ══════════════════ */}
            {activeView === 'health' && (
                <div className="perf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                            { id: 'overview', label: 'Overview',     icon: BarChart3 },
                            { id: 'cpu',      label: 'CPU',          icon: Cpu },
                            { id: 'memory',   label: 'Memory',       icon: MemoryStick },
                            { id: 'disk',     label: 'Disk',         icon: Disc },
                            { id: 'network',  label: 'Network',      icon: Wifi },
                            { id: 'buffer',   label: 'Buffer Cache', icon: Database },
                        ].map(t => <SubTab key={t.id} id={t.id} label={t.label} icon={t.icon} current={healthSubView} set={setHealthSubView} />)}
                    </div>

                    {/* ── OVERVIEW ── */}
                    {healthSubView === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                                {[
                                    { title: 'CPU Usage', label: 'CPU', value: stats?.cpu_percent || 45, color: THEME.primary, chips: [{ label: 'Cores', value: stats?.cpu_cores || 8, icon: Cpu }, { label: 'Load Avg', value: stats?.load_avg || '2.4', icon: Gauge }] },
                                    { title: 'Memory', label: 'RAM', value: stats?.memory_percent || 62, color: THEME.success, chips: [{ label: 'Used', value: stats?.memory_used || '12.4 GB', icon: HardDrive }, { label: 'Buffers', value: stats?.shared_buffers || '4 GB', icon: Database }] },
                                    { title: 'Connections', label: 'Pool', value: Math.round((totalConns / (stats?.max_connections || 100)) * 100), color: totalConns > 80 ? THEME.warning : THEME.primary, chips: [{ label: 'Active', value: totalConns, color: THEME.primary, icon: Network }, { label: 'Max', value: stats?.max_connections || 100, icon: Server }] },
                                ].map((card, idx) => (
                                    <Panel key={idx} title={card.title}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 210 }}>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                                                <ResourceGauge label={card.label} value={card.value} color={card.color} size={118} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, flexShrink: 0 }}>
                                                {card.chips.map((chip, i) => <StatChip key={i} label={chip.label} value={chip.value} color={chip.color} icon={chip.icon} small />)}
                                            </div>
                                        </div>
                                    </Panel>
                                ))}
                            </div>

                            {/* IO + Replication */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
                                <Panel title="Top Tables by I/O" noPad>
                                    <div style={{ overflowY: 'auto', minHeight: 260 }}>
                                        {ioSparklines.length === 0 ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: THEME.textDim, fontSize: 12 }}>No IO data</div> : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                <tr>{['Table', 'Reads', 'Writes', 'Hit Ratio', 'Trend'].map((h, i) => (
                                                    <th key={h} style={{ padding: '9px 13px', textAlign: i > 0 ? 'right' : 'left', fontSize: 9.5, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50`, position: 'sticky', top: 0, background: THEME.surface, zIndex: 1 }}>{h}</th>
                                                ))}</tr>
                                                </thead>
                                                <tbody>
                                                {ioSparklines.map((t, i) => {
                                                    const reads = Number(t.heap_blks_read || t.seq_scan || 0);
                                                    const writes = Number(t.heap_blks_hit || t.idx_scan || 0);
                                                    const hitRatio = reads + writes > 0 ? ((writes / (reads + writes)) * 100).toFixed(0) : 99;
                                                    return (
                                                        <tr key={i} className="perf-row-hover">
                                                            <td style={{ padding: '9px 13px', fontSize: 11.5, fontWeight: 600, color: THEME.textMain, borderBottom: `1px solid ${THEME.grid}18` }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: THEME.primary }} />{t.table_name || t.relname || `table_${i}`}</div></td>
                                                            <td className="mono" style={{ padding: '9px 13px', fontSize: 11, color: THEME.primary, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}18` }}>{reads.toLocaleString()}</td>
                                                            <td className="mono" style={{ padding: '9px 13px', fontSize: 11, color: THEME.success, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}18` }}>{writes.toLocaleString()}</td>
                                                            <td className="mono" style={{ padding: '9px 13px', fontSize: 11, fontWeight: 700, color: Number(hitRatio) > 95 ? THEME.success : THEME.warning, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}18` }}>{hitRatio}%</td>
                                                            <td style={{ padding: '9px 13px', borderBottom: `1px solid ${THEME.grid}18` }}><div style={{ display: 'flex', justifyContent: 'flex-end' }}><MiniSparkline data={t.spark} color={THEME.primary} width={56} height={18} /></div></td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </Panel>
                                <Panel title="Replication Status">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 260 }}>
                                        {repl.length === 0 ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textDim, fontSize: 12 }}>Standalone Instance</div> : repl.map((r, i) => {
                                            const lagBytes = Number(r.replication_lag_bytes || 0);
                                            const lagColor = lagBytes > 10000000 ? THEME.danger : lagBytes > 1000000 ? THEME.warning : THEME.success;
                                            return (
                                                <div key={i} style={{ padding: 12, borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}45` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><LiveDot color={lagColor} size={7} /><span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>{r.client_addr || `Replica ${i + 1}`}</span></div>
                                                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${lagColor}14`, color: lagColor }}>{r.state || 'streaming'}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                                                        <StatChip label="Lag" value={lagBytes > 1000000 ? `${(lagBytes / 1048576).toFixed(1)} MB` : `${(lagBytes / 1024).toFixed(0)} KB`} color={lagColor} icon={Timer} small />
                                                        <StatChip label="LSN Diff" value={r.sent_lsn ? r.sent_lsn.split('/')[1] : '—'} icon={GitBranch} small />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Panel>
                            </div>

                            {/* Quick strip */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderRadius: 12, background: THEME.glass, overflow: 'hidden', backdropFilter: 'blur(14px)', border: `1px solid ${THEME.glassBorder}` }}>
                                {[
                                    { label: 'Cache Hit',   value: `${stats?.cache_hit_ratio || 99.2}%`, color: THEME.success, icon: CheckCircle },
                                    { label: 'Tx/sec',      value: stats?.tps || '1.2k',              color: THEME.primary, icon: Zap },
                                    { label: 'Deadlocks',   value: stats?.deadlocks || 0,             color: stats?.deadlocks > 0 ? THEME.danger : THEME.textDim, icon: ShieldAlert },
                                    { label: 'Temp Files',  value: stats?.temp_files || '12 MB',      color: THEME.warning, icon: HardDrive },
                                    { label: 'Uptime',      value: stats?.uptime || '14d 6h',         color: THEME.textMain, icon: Radio },
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', height: 56, borderRight: i < 4 ? `1px solid ${THEME.glassBorder}` : 'none' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}10` }}><s.icon size={13} color={s.color} /></div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 8.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 3 }}>{s.label}</div>
                                            <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── CPU ── */}
                    {healthSubView === 'cpu' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Total CPU"    value={`${stats?.cpu_percent || 45}`} unit="%" icon={Cpu}    color={THEME.primary} trend={3.2}  detail={`${stats?.cpu_cores || 8} cores`} />
                                <HealthMetricCard title="Load Avg 1m"  value={stats?.load_avg || '2.4'}      unit="" icon={Gauge}   color={THEME.success} trend={-1.1} detail="5m: 2.1 · 15m: 1.8" />
                                <HealthMetricCard title="User CPU"     value="31.2"                          unit="%" icon={User}    color={THEME.primary} trend={2.0}  detail="Userland processes" />
                                <HealthMetricCard title="System CPU"   value="13.8"                          unit="%" icon={Server}  color={THEME.warning} trend={1.2}  detail="Kernel + interrupts" />
                            </div>
                            <Panel title="CPU Usage Over Time — Per Core" icon={Cpu} accent={THEME.primary}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={cpuTimeline} margin={{ top: 10, right: 10, bottom: 4, left: -18 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim, fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                                        <Tooltip content={<ChartTip />} />
                                        <Line type="monotone" dataKey="total" stroke={THEME.primary} strokeWidth={2.5} dot={false} name="Total" />
                                        {[['core0', THEME.success], ['core1', THEME.warning], ['core2', `${THEME.danger}90`], ['core3', `${THEME.primary}60`]].map(([k, c]) => (
                                            <Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={1} dot={false} strokeDasharray="4 4" name={k} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>
                    )}

                    {/* ── MEMORY ── */}
                    {healthSubView === 'memory' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="RAM Used"       value={stats?.memory_used || '12.4'} unit="GB" icon={MemoryStick} color={THEME.success} trend={1.5}  detail={`of ${stats?.total_memory || '32'} GB`} />
                                <HealthMetricCard title="Swap Used"      value="0.8"                          unit="GB" icon={RefreshCcw}  color={THEME.warning} trend={0.2}  detail="Swap pressure: low" />
                                <HealthMetricCard title="Shared Buffers" value={stats?.shared_buffers || '4'} unit="GB" icon={Database}    color={THEME.primary} trend={0}    detail="PostgreSQL buffer pool" />
                                <HealthMetricCard title="Work Mem"       value="64"                           unit="MB" icon={Layers}      color={THEME.textMuted} trend={0}   detail="Per-sort allocation" />
                            </div>
                            <Panel title="Memory Usage Trends" icon={MemoryStick} accent={THEME.success}>
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart data={memTimeline} margin={{ top: 10, right: 10, bottom: 4, left: -18 }}>
                                        <defs>
                                            {[['mU', THEME.success], ['mS', THEME.warning], ['mB', THEME.primary]].map(([id, c]) => (
                                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip content={<ChartTip />} />
                                        <Area type="monotone" dataKey="buffers" stroke={THEME.primary}  fill="url(#mB)" strokeWidth={1.5} name="Buffers %" />
                                        <Area type="monotone" dataKey="swap"    stroke={THEME.warning}  fill="url(#mS)" strokeWidth={1.5} name="Swap %" />
                                        <Area type="monotone" dataKey="used"    stroke={THEME.success}  fill="url(#mU)" strokeWidth={2}   name="RAM %" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>
                    )}

                    {/* ── DISK ── */}
                    {healthSubView === 'disk' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Read Throughput"  value="148" unit="MB/s" icon={HardDrive} color={THEME.primary} trend={5.2}  detail="Peak: 420 MB/s" />
                                <HealthMetricCard title="Write Throughput" value="62"  unit="MB/s" icon={HardDrive} color={THEME.success} trend={-2.1} detail="Peak: 180 MB/s" />
                                <HealthMetricCard title="Avg Latency"      value="1.8" unit="ms"   icon={Timer}     color={THEME.warning} trend={0.3}  detail="P95: 4.2ms · P99: 8ms" />
                                <HealthMetricCard title="Queue Depth"      value="1.4" unit=""     icon={Layers}    color={THEME.textMuted} trend={0.1} detail="Avg I/O queue" />
                            </div>
                            <Panel title="Disk I/O & Latency" icon={Disc} accent={THEME.warning}>
                                <ResponsiveContainer width="100%" height={210}>
                                    <ComposedChart data={diskTimeline} margin={{ top: 10, right: 10, bottom: 4, left: -18 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis yAxisId="tp" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="lat" orientation="right" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="ms" />
                                        <Tooltip content={<ChartTip />} />
                                        <Bar yAxisId="tp" dataKey="read"  name="Read MB/s"  fill={THEME.primary} opacity={0.65} radius={[2,2,0,0]} />
                                        <Bar yAxisId="tp" dataKey="write" name="Write MB/s" fill={THEME.success} opacity={0.65} radius={[2,2,0,0]} />
                                        <Line yAxisId="lat" type="monotone" dataKey="latency" stroke={THEME.warning} strokeWidth={2} dot={false} name="Latency ms" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>
                    )}

                    {/* ── NETWORK ── */}
                    {healthSubView === 'network' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Bytes In/s"     value="820" unit="KB/s" icon={Wifi}         color={THEME.primary} trend={12.0} detail="Client → Server" />
                                <HealthMetricCard title="Bytes Out/s"    value="340" unit="KB/s" icon={Wifi}         color={THEME.success} trend={-4.2} detail="Server → Client" />
                                <HealthMetricCard title="Connections/s"  value="48"  unit="/s"   icon={Network}      color={THEME.warning} trend={3.1}  detail="New conn rate" />
                                <HealthMetricCard title="Errors"         value="0"   unit=""     icon={AlertCircle}  color={THEME.textDim} trend={0}    detail="Packet errors" />
                            </div>
                            <Panel title="Network Throughput (KB/s)" icon={Wifi} accent={THEME.primary}>
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart data={netTimeline} margin={{ top: 10, right: 10, bottom: 4, left: -18 }}>
                                        <defs>
                                            {[['nI', THEME.primary], ['nO', THEME.success]].map(([id, c]) => (
                                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="KB" />
                                        <Tooltip content={<ChartTip />} />
                                        <Area type="monotone" dataKey="bytesIn"  stroke={THEME.primary} fill="url(#nI)" strokeWidth={2} name="In KB/s" />
                                        <Area type="monotone" dataKey="bytesOut" stroke={THEME.success} fill="url(#nO)" strokeWidth={2} name="Out KB/s" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        </div>
                    )}

                    {/* ── BUFFER CACHE ── */}
                    {healthSubView === 'buffer' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Cache Hit Ratio"     value={`${stats?.cache_hit_ratio || 99.2}`} unit="%" icon={Database}    color={THEME.success} trend={0.1}  detail="Block-level hit rate" />
                                <HealthMetricCard title="Dirty Pages"         value="7.4"                                unit="%" icon={HardDrive}   color={THEME.warning} trend={-0.5} detail="Awaiting flush" />
                                <HealthMetricCard title="Checkpoints/hr"      value="3"                                  unit=""  icon={RefreshCcw}  color={THEME.primary} trend={0}    detail="Scheduled" />
                                <HealthMetricCard title="Evictions/s"         value="142"                                unit="/s" icon={TrendingDown}color={THEME.textMuted}trend={-8.3}detail="Buffer eviction rate" />
                            </div>
                            <Panel title="Buffer Cache Efficiency" icon={Database} accent={THEME.success}>
                                <ResponsiveContainer width="100%" height={210}>
                                    <ComposedChart data={bufferData} margin={{ top: 10, right: 10, bottom: 4, left: -18 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={3} />
                                        <YAxis yAxisId="ratio" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} domain={[94, 100]} unit="%" />
                                        <YAxis yAxisId="dirty" orientation="right" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip content={<ChartTip />} />
                                        <Area yAxisId="ratio" type="monotone" dataKey="hitRatio"   stroke={THEME.success} fill={`${THEME.success}10`} strokeWidth={2} name="Hit Ratio %" />
                                        <Line yAxisId="dirty"  type="monotone" dataKey="dirtyPages" stroke={THEME.warning} strokeWidth={1.5} dot={false} name="Dirty %" />
                                        {bufferData.map((d, i) => d.checkpoints > 0 && (
                                            <ReferenceLine key={i} yAxisId="ratio" x={d.t} stroke={`${THEME.primary}55`} strokeDasharray="3 3" label={{ value: '⟳', position: 'top', fontSize: 9, fill: THEME.primary }} />
                                        ))}
                                    </ComposedChart>
                                </ResponsiveContainer>
                                <div style={{ fontSize: 9.5, color: THEME.textDim, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ color: THEME.primary }}>⟳</span> checkpoint events
                                </div>
                            </Panel>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {selectedQuery && !selectedQuery._showKill && (
                <QueryAnalysisModal
                    queryData={selectedQuery}
                    onClose={() => setSelectedQuery(null)}
                    onApply={(id) => console.log('Optimized query', id)}
                    onKill={handleKillQuery}
                    tags={queryTags}
                    onTag={handleTagQuery}
                />
            )}
            {selectedQuery && selectedQuery._showKill && (
                <KillQueryModal
                    query={selectedQuery}
                    onConfirm={handleKillQuery}
                    onClose={() => setSelectedQuery(null)}
                />
            )}
        </div>
    );
};

export default PerformanceTab;