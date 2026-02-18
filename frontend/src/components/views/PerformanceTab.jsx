// components/tabs/PerformanceTab.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { THEME, ChartDefs } from '../../utils/theme.jsx';
import {
    GlassCard,
    MetricCard,
    ResourceGauge,
    DataTable,
    ConnectionPoolBar,
    SkeletonLoader,
    NeonProgressBar,
    BloatStatusBadge,
    EmptyState
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
    Hash, User, AppWindow, RefreshCcw, TrendingUp as Trend,
    BarChart2, AlertCircle, Info, MoreHorizontal, SlidersHorizontal,
    Layers3, Box, Package, Merge, GitMerge, Columns, Rows,
    PanelLeftOpen, Maximize2, Minimize2, FileText
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, BarChart, Bar, LineChart, Line, ReferenceLine,
    Cell, ComposedChart
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const PerfStyles = () => (
    <style>{`
        @keyframes perfFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes perfSlideIn {
            from { opacity: 0; transform: translateX(-16px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes perfPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
        }
        @keyframes perfSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes perfGlow {
            0%, 100% { box-shadow: 0 0 4px var(--glow-color, ${THEME.primary}); }
            50%      { box-shadow: 0 0 16px var(--glow-color, ${THEME.primary}), 0 0 32px color-mix(in srgb, var(--glow-color, ${THEME.primary}) 30%, transparent); }
        }
        @keyframes perfBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes perfModalIn {
            from { opacity: 0; transform: scale(0.96) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes perfRipple {
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ganttSlide {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes treeExpand {
            from { opacity: 0; max-height: 0; }
            to   { opacity: 1; max-height: 800px; }
        }
        .perf-stagger > * {
            animation: perfFadeIn 0.4s ease-out both;
        }
        .perf-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .perf-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .perf-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .perf-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .perf-stagger > *:nth-child(5) { animation-delay: 0.24s; }
        .perf-stagger > *:nth-child(6) { animation-delay: 0.30s; }
        .perf-row-hover { transition: background 0.15s, transform 0.15s; }
        .perf-row-hover:hover {
            background: ${THEME.primary}08 !important;
            transform: translateX(2px);
        }
        .perf-bar-animate {
            transform-origin: left;
            animation: perfBarGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .perf-spin { animation: perfSpin 1s linear infinite; }
        .gantt-bar {
            transform-origin: left;
            animation: ganttSlide 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .perf-equal-row {
            display: grid;
            gap: 20px;
        }
        .perf-equal-row > * {
            height: 100%;
            min-height: 0;
        }
        .perf-equal-row > * > * {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .tree-node-line::before {
            content: '';
            position: absolute;
            left: -12px;
            top: 50%;
            width: 12px;
            height: 1px;
            background: ${THEME.grid}60;
        }
        .tree-node-vert::after {
            content: '';
            position: absolute;
            left: -12px;
            top: -50%;
            bottom: 50%;
            width: 1px;
            background: ${THEME.grid}60;
        }
        .tag-btn { transition: all 0.15s; }
        .tag-btn:hover { transform: scale(1.05); }
        .filter-chip { transition: all 0.2s; cursor: pointer; }
        .filter-chip:hover { opacity: 0.85; transform: translateY(-1px); }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const AnimValue = ({ value, decimals = 0, suffix = '', prefix = '' }) => {
    const [display, setDisplay] = useState(0);
    const ref = useRef();
    useEffect(() => {
        const target = Number(value) || 0;
        let startTime = null;
        const step = ts => {
            if (!startTime) startTime = ts;
            const p = Math.min((ts - startTime) / 800, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(ease * target);
            if (p < 1) ref.current = requestAnimationFrame(step);
        };
        ref.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);
    return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
};

const LiveDot = ({ color = THEME.success, size = 8 }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1.5px solid ${color}`, animation: 'perfRipple 2s ease-out infinite' }} />
        <span style={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', background: color }} />
    </span>
);

const MiniSparkline = ({ data, color, width = 80, height = 24 }) => {
    if (!data?.length) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) =>
        `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`
    ).join(' ');
    const id = `msp-${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).slice(2, 6)}`;
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const SeverityBar = ({ value, max = 100, color = THEME.danger, delay = 0 }) => (
    <div style={{ width: '100%', height: 4, background: `${THEME.grid}60`, borderRadius: 2, overflow: 'hidden' }}>
        <div className="perf-bar-animate" style={{
            width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', borderRadius: 2,
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: `0 0 8px ${color}40`, animationDelay: `${delay}s`
        }} />
    </div>
);

const SeverityTag = ({ ms }) => {
    const n = Number(ms);
    const level = n > 5000 ? { label: 'CRITICAL', color: THEME.danger, bg: `${THEME.danger}18` }
        : n > 1000 ? { label: 'HIGH', color: THEME.warning, bg: `${THEME.warning}15` }
            : n > 200 ? { label: 'MEDIUM', color: THEME.primary, bg: `${THEME.primary}12` }
                : { label: 'LOW', color: THEME.textDim, bg: `${THEME.textDim}15` };
    return (
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 4, background: level.bg, color: level.color, border: `1px solid ${level.color}25` }}>{level.label}</span>
    );
};

const StatChip = ({ label, value, color = THEME.textMain, icon: Icon, small }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: small ? 3 : 5,
        padding: small ? '8px 12px' : '12px 14px',
        background: THEME.surface, borderRadius: 8, border: `1px solid ${THEME.grid}40`,
        minWidth: 0, minHeight: small ? 52 : 62,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1 }}>
            {Icon && <Icon size={10} color={THEME.textDim} style={{ flexShrink: 0 }} />}
            <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>{label}</span>
        </div>
        <span style={{ fontSize: small ? 15 : 18, fontWeight: 800, color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy || THEME.surface, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 2 }}>t = {label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || THEME.primary }}>
                    {Number(p.value).toFixed(1)} {p.name}
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY FINGERPRINTING & HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const fingerprintQuery = (query) => {
    if (!query) return '';
    return query
        .replace(/\b\d+(\.\d+)?\b/g, '?')
        .replace(/'[^']*'/g, "'?'")
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .substring(0, 80);
};

const groupByFingerprint = (queries) => {
    const groups = {};
    queries.forEach(q => {
        const fp = fingerprintQuery(q.query);
        if (!groups[fp]) {
            groups[fp] = { fingerprint: fp, queries: [], totalCalls: 0, maxTime: 0, minTime: Infinity, avgTime: 0 };
        }
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
    return Object.entries(fingerprints)
        .filter(([_, count]) => count > 10)
        .map(([fp, count]) => ({ fingerprint: fp, callCount: count, severity: count > 100 ? 'high' : count > 50 ? 'medium' : 'low' }))
        .sort((a, b) => b.callCount - a.callCount);
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI OPTIMIZER
   ═══════════════════════════════════════════════════════════════════════════ */
const generateOptimization = (query) => {
    if (query.includes('SELECT *')) {
        return {
            optimized: query.replace('SELECT *', 'SELECT id, name, created_at, status'),
            reason: 'SELECT * fetches all columns including BLOBs and unused fields, increasing IO by 3-5×.',
            fixType: 'Column Pruning', category: 'IO Optimization', improvement: '~40% IO Reduction',
            costBefore: 1240, costAfter: 45,
            planBefore: [{ op: 'Seq Scan', table: 'users', cost: 1240, rows: '125k', width: 842 }, { op: 'Sort', cost: 320, rows: '125k' }],
            planAfter: [{ op: 'Index Scan', table: 'users', cost: 45, rows: '125k', width: 64, index: 'idx_users_pkey' }],
        };
    }
    if (query.includes('OR')) {
        return {
            optimized: query.replace(/\bOR\b/g, '\nUNION ALL\nSELECT … WHERE'),
            reason: 'OR conditions disable index usage, forcing full sequential scans on both predicates.',
            fixType: 'Query Rewrite', category: 'Index Utilization', improvement: 'Enables Index Scan',
            costBefore: 890, costAfter: 120,
            planBefore: [{ op: 'Seq Scan', table: 'orders', cost: 890, rows: '50k', filter: 'status OR region' }],
            planAfter: [{ op: 'Append', cost: 120, rows: '50k' }, { op: '→ Index Scan (status)', table: 'orders', cost: 60, rows: '25k', index: 'idx_orders_status' }, { op: '→ Index Scan (region)', table: 'orders', cost: 60, rows: '25k', index: 'idx_orders_region' }],
        };
    }
    return {
        optimized: query + '\n-- CREATE INDEX idx_users_email ON users(email);',
        reason: 'No index exists on the "email" column. Every lookup triggers a full table scan across 2M+ rows.',
        fixType: 'Index Creation', category: 'Missing Index', improvement: '95% Faster (Seek vs Scan)',
        costBefore: 2100, costAfter: 8,
        planBefore: [{ op: 'Seq Scan', table: 'users', cost: 2100, rows: '2.1M', filter: 'email = ?' }],
        planAfter: [{ op: 'Index Scan', table: 'users', cost: 8, rows: 1, index: 'idx_users_email' }],
    };
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPLAIN PLAN TREE VISUALIZER
   ═══════════════════════════════════════════════════════════════════════════ */
const generateExplainTree = (query) => {
    const base = [
        {
            id: 1, op: 'Hash Join', cost: '0.43..2845.12', rows: 12840, width: 124, actualTime: '45.2..892.3',
            detail: 'Hash Cond: (o.user_id = u.id)', children: [
                {
                    id: 2, op: 'Seq Scan', table: 'orders', cost: '0.00..1240.50', rows: 50000, width: 64, actualTime: '0.1..210.4',
                    detail: 'Filter: (status = \'active\')', rowsRemoved: 45200, children: []
                },
                {
                    id: 3, op: 'Hash', cost: '0.00..480.20', rows: 8000, width: 60, actualTime: '12.1..45.6',
                    detail: 'Buckets: 8192  Batches: 1  Memory Usage: 512kB', children: [
                        {
                            id: 4, op: 'Index Scan', table: 'users', index: 'idx_users_pkey', cost: '0.43..420.10', rows: 8000, width: 60,
                            actualTime: '0.04..28.3', detail: 'Index Cond: (id > 0)', children: []
                        }
                    ]
                }
            ]
        }
    ];
    return base;
};

const ExplainTreeNode = ({ node, depth = 0, maxCost = 2845 }) => {
    const [expanded, setExpanded] = useState(true);
    const costPct = (parseFloat(node.cost?.split('..')[1]) / maxCost) * 100;
    const isExpensive = costPct > 60;
    const color = isExpensive ? THEME.danger : costPct > 30 ? THEME.warning : THEME.success;

    return (
        <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
            <div
                onClick={() => node.children?.length && setExpanded(!expanded)}
                style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                    borderRadius: 8, marginBottom: 4, cursor: node.children?.length ? 'pointer' : 'default',
                    background: isExpensive ? `${THEME.danger}06` : `${THEME.grid}15`,
                    border: `1px solid ${isExpensive ? `${THEME.danger}20` : `${THEME.grid}30`}`,
                    transition: 'all 0.15s', position: 'relative'
                }}
            >
                {depth > 0 && (
                    <div style={{ position: 'absolute', left: -24, top: '50%', width: 20, height: 1, background: `${THEME.grid}50` }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    {node.children?.length ? (
                        <div style={{ color: THEME.textDim, flexShrink: 0 }}>
                            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </div>
                    ) : <div style={{ width: 12, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{node.op}</span>
                            {node.table && <span style={{ fontSize: 11, color: THEME.primary, fontFamily: 'monospace' }}>on {node.table}</span>}
                            {node.index && <span style={{ fontSize: 10, color: THEME.success, padding: '1px 6px', borderRadius: 3, background: `${THEME.success}10`, border: `1px solid ${THEME.success}20` }}>idx: {node.index}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2, fontFamily: 'monospace' }}>{node.detail}</div>
                        {node.rowsRemoved && (
                            <div style={{ fontSize: 10, color: THEME.warning, marginTop: 1 }}>⚠ {node.rowsRemoved.toLocaleString()} rows removed by filter</div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
                        {parseFloat(node.cost?.split('..')[1]).toFixed(1)}
                    </span>
                    <div style={{ width: 60, height: 3, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${costPct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                    {node.actualTime && (
                        <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: 'monospace' }}>{node.actualTime}ms</span>
                    )}
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
    const ganttData = queries.slice(0, 8).map((q, i) => {
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
                {/* Time axis */}
                <div style={{ display: 'flex', marginLeft: 180, marginBottom: 6 }}>
                    {[0, 25, 50, 75, 100].map(pct => (
                        <div key={pct} style={{ flex: pct === 100 ? 0 : 1, fontSize: 9, color: THEME.textDim, textAlign: 'left', borderLeft: `1px dashed ${THEME.grid}40`, paddingLeft: 3 }}>
                            {Math.round((totalSpan * pct) / 100)}ms
                        </div>
                    ))}
                </div>
                {ganttData.map((row, i) => {
                    const left = ((row.start - minTime) / totalSpan) * 100;
                    const width = Math.max((row.duration / totalSpan) * 100, 0.5);
                    const color = row.duration > 5000 ? THEME.danger : row.duration > 1000 ? THEME.warning : THEME.primary;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{ width: 170, fontSize: 10, color: THEME.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'monospace', textAlign: 'right' }}>
                                {row.query?.substring(0, 24) || `Query ${i + 1}`}…
                            </div>
                            <div style={{ flex: 1, height: 22, background: `${THEME.grid}20`, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                                <div className="gantt-bar" style={{
                                    position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%',
                                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                                    borderRadius: 4, minWidth: 4, boxShadow: `0 0 6px ${color}30`,
                                    animationDelay: `${i * 0.05}s`
                                }} />
                                <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: THEME.textDim, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}>
                                    {row.duration.toFixed(0)}ms
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOCK WAIT GRAPH
   ═══════════════════════════════════════════════════════════════════════════ */
const LockWaitDetails = ({ locks, conns }) => {
    const waitChains = useMemo(() => {
        const holders = conns.filter(c => c.state === 'active').slice(0, 3);
        const waiters = locks.slice(0, 5);
        return waiters.map((w, i) => ({
            waiter: { pid: w.pid || 8800 + i, query: w.query || 'SELECT FOR UPDATE...', waitTime: Math.round(Math.random() * 30) + 's' },
            holder: holders[i % holders.length] || { pid: 9000 + i, query: 'UPDATE users SET...', application_name: 'pgadmin4' },
            lockType: ['RowExclusiveLock', 'ShareLock', 'ExclusiveLock', 'RowShareLock'][i % 4],
            relation: ['orders', 'users', 'products', 'inventory', 'sessions'][i % 5]
        }));
    }, [locks, conns]);

    if (!waitChains.length) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <EmptyState icon={Lock} text="No lock waits detected" />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {waitChains.map((chain, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: `${THEME.danger}05`, border: `1px solid ${THEME.danger}15` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: `${THEME.danger}15`, color: THEME.danger, border: `1px solid ${THEME.danger}20` }}>{chain.lockType}</span>
                        <span>on <span style={{ color: THEME.primary, fontFamily: 'monospace' }}>{chain.relation}</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: `${THEME.danger}08`, border: `1px solid ${THEME.danger}15` }}>
                            <div style={{ fontSize: 10, color: THEME.danger, fontWeight: 700, marginBottom: 4 }}>WAITING — PID {chain.waiter.pid} ({chain.waiter.waitTime})</div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chain.waiter.query}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                            <ArrowRight size={14} color={THEME.warning} />
                            <span style={{ fontSize: 9, color: THEME.textDim }}>blocked by</span>
                        </div>
                        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}15` }}>
                            <div style={{ fontSize: 10, color: THEME.warning, fontWeight: 700, marginBottom: 4 }}>HOLDING — PID {chain.holder.pid} ({chain.holder.application_name || 'app'})</div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chain.holder.query || 'BEGIN; UPDATE...'}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY KILL MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const KillQueryModal = ({ query, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [killing, setKilling] = useState(false);
    const reasons = ['Blocking other queries', 'Consuming excessive resources', 'Runaway query / no end condition', 'User requested termination', 'Maintenance window'];

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, animation: 'perfFadeIn 0.2s ease-out' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 480, background: THEME.surface, border: `1px solid ${THEME.danger}30`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${THEME.danger}20`, animation: 'perfModalIn 0.3s ease-out' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.glassBorder}`, background: `linear-gradient(135deg, ${THEME.danger}10, transparent)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${THEME.danger}15`, border: `1px solid ${THEME.danger}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={18} color={THEME.danger} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: THEME.textMain }}>Terminate Query</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>PID {query.pid || '—'} · This action cannot be undone</div>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 4 }}><X size={16} /></button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: 12, borderRadius: 8, background: THEME.bg, border: `1px solid ${THEME.grid}40`, fontFamily: 'monospace', fontSize: 11, color: THEME.textMuted, maxHeight: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {query.query?.substring(0, 120)}…
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, marginBottom: 8 }}>Reason for termination</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {reasons.map(r => (
                                <div key={r} onClick={() => setReason(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 7, cursor: 'pointer', background: reason === r ? `${THEME.danger}10` : 'transparent', border: `1px solid ${reason === r ? `${THEME.danger}25` : `${THEME.grid}30`}`, transition: 'all 0.15s' }}>
                                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${reason === r ? THEME.danger : THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {reason === r && <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.danger }} />}
                                    </div>
                                    <span style={{ fontSize: 12, color: reason === r ? THEME.textMain : THEME.textMuted }}>{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${THEME.glassBorder}`, background: 'transparent', color: THEME.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Cancel</button>
                        <button disabled={!reason || killing} onClick={() => { setKilling(true); setTimeout(() => { onConfirm(query, reason); onClose(); }, 1000); }} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: killing ? `${THEME.danger}50` : `${THEME.danger}`, color: '#fff', cursor: reason ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12, opacity: !reason ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            {killing ? <RotateCcw size={13} className="perf-spin" /> : <XCircle size={13} />}
                            {killing ? 'Terminating…' : 'Terminate Query'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY ANALYSIS MODAL (enhanced with plan tree, trends, tags, kill)
   ═══════════════════════════════════════════════════════════════════════════ */
const QueryAnalysisModal = ({ queryData, onClose, onApply, onKill, tags, onTag }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [activePanel, setActivePanel] = useState('diff');
    const [showKillModal, setShowKillModal] = useState(false);
    const opt = generateOptimization(queryData.query);
    const explainTree = generateExplainTree(queryData.query);
    const currentTag = tags?.[queryData.id];

    const trendData = Array.from({ length: 12 }, (_, i) => ({
        t: `${i * 5}m ago`,
        ms: Number(queryData.mean_time_ms) * (0.7 + Math.sin(i / 3) * 0.3 + Math.random() * 0.2),
        calls: Math.round(Number(queryData.calls || 10) * (0.8 + Math.random() * 0.4))
    })).reverse();

    const handleApply = () => {
        setIsApplying(true);
        setTimeout(() => { setIsApplying(false); setApplied(true); onApply(queryData.id); setTimeout(() => onClose(), 1200); }, 1500);
    };

    const panels = [
        { id: 'diff', label: 'Query Diff', icon: GitBranch },
        { id: 'plan', label: 'Plan Tree', icon: Workflow },
        { id: 'trends', label: 'Trends', icon: TrendingUp },
    ];

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'perfFadeIn 0.2s ease-out' }}>
                <div onClick={e => e.stopPropagation()} style={{ width: '94%', maxWidth: 1100, maxHeight: '90vh', background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: `0 24px 64px rgba(0,0,0,0.6)`, animation: 'perfModalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    {/* Header */}
                    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${THEME.danger}08, transparent)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${THEME.danger}15`, border: `1px solid ${THEME.danger}25`, '--glow-color': THEME.danger, animation: 'perfGlow 3s ease-in-out infinite' }}>
                                <AlertTriangle size={18} color={THEME.danger} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.textMain }}>Slow Query Detected</h3>
                                    <SeverityTag ms={queryData.mean_time_ms} />
                                    {/* Tag badge */}
                                    {currentTag && (
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: currentTag === 'known-slow' ? `${THEME.warning}15` : `${THEME.success}12`, color: currentTag === 'known-slow' ? THEME.warning : THEME.success, border: `1px solid ${currentTag === 'known-slow' ? `${THEME.warning}25` : `${THEME.success}20`}` }}>
                                            {currentTag === 'known-slow' ? '⚑ KNOWN SLOW' : '✓ ACCEPTABLE'}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <span>PID <span style={{ color: THEME.textMain, fontWeight: 600, fontFamily: 'monospace' }}>{queryData.pid || 8821}</span></span>
                                    <span>Duration <span style={{ color: THEME.danger, fontWeight: 600 }}>{Number(queryData.mean_time_ms).toFixed(1)}ms</span></span>
                                    <span>Cache Hit <span style={{ color: THEME.success, fontWeight: 600 }}>{queryData.cacheHit || '94.2'}%</span></span>
                                    <span>Temp Files <span style={{ color: queryData.tempFiles > 0 ? THEME.warning : THEME.textDim, fontWeight: 600 }}>{queryData.tempFiles || 0}</span></span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Tag buttons */}
                            <button className="tag-btn" onClick={() => onTag(queryData.id, currentTag === 'known-slow' ? null : 'known-slow')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${THEME.warning}30`, background: currentTag === 'known-slow' ? `${THEME.warning}15` : 'transparent', color: currentTag === 'known-slow' ? THEME.warning : THEME.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Tag size={11} /> Known Slow
                            </button>
                            <button className="tag-btn" onClick={() => onTag(queryData.id, currentTag === 'acceptable' ? null : 'acceptable')} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${THEME.success}30`, background: currentTag === 'acceptable' ? `${THEME.success}12` : 'transparent', color: currentTag === 'acceptable' ? THEME.success : THEME.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={11} /> Acceptable
                            </button>
                            <button onClick={() => setShowKillModal(true)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${THEME.danger}30`, background: 'transparent', color: THEME.danger, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}15`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            ><XCircle size={11} /> Kill</button>
                            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${THEME.grid}`, background: 'transparent', color: THEME.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}20`; e.currentTarget.style.color = THEME.danger; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.textMuted; }}
                            ><X size={16} /></button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', overflow: 'hidden' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.glassBorder}`, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                {panels.map(t => (
                                    <button key={t.id} onClick={() => setActivePanel(t.id)} style={{ flex: 1, padding: '10px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 600, transition: 'all 0.2s', background: activePanel === t.id ? `${THEME.primary}10` : 'transparent', color: activePanel === t.id ? THEME.primary : THEME.textDim, borderBottom: `2px solid ${activePanel === t.id ? THEME.primary : 'transparent'}` }}>
                                        <t.icon size={12} /> {t.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                                {activePanel === 'diff' && (
                                    <div className="perf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: THEME.danger }} />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.danger, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Original Query</span>
                                            </div>
                                            <div style={{ background: `${THEME.danger}06`, border: `1px solid ${THEME.danger}18`, padding: '14px 16px', borderRadius: 8, fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 12, lineHeight: 1.7, color: '#ffaaaa', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: THEME.danger, borderRadius: '8px 0 0 8px' }} />
                                                <code style={{ paddingLeft: 8, display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{queryData.query}</code>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ArrowDown size={13} color={THEME.textDim} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: THEME.success }} />
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: THEME.success, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Optimized</span>
                                                </div>
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${THEME.success}15`, color: THEME.success, border: `1px solid ${THEME.success}20` }}>{opt.fixType}</span>
                                            </div>
                                            <div style={{ background: `${THEME.success}06`, border: `1px solid ${THEME.success}18`, padding: '14px 16px', borderRadius: 8, fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 12, lineHeight: 1.7, color: '#aaffcc', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: THEME.success, borderRadius: '8px 0 0 8px' }} />
                                                <code style={{ paddingLeft: 8, display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{opt.optimized}</code>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activePanel === 'plan' && (
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Workflow size={10} /> EXPLAIN ANALYZE — Visual Tree
                                            <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${THEME.primary}10`, color: THEME.primary, border: `1px solid ${THEME.primary}20` }}>Cost scale: node bar width</span>
                                        </div>
                                        {explainTree.map(node => (
                                            <ExplainTreeNode key={node.id} node={node} maxCost={2845} />
                                        ))}
                                    </div>
                                )}
                                {activePanel === 'trends' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Execution Time Trend (last 60min)</div>
                                            <ResponsiveContainer width="100%" height={140}>
                                                <ComposedChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                    <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={2} />
                                                    <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                                    <Tooltip content={<ChartTooltip />} />
                                                    <Area type="monotone" dataKey="ms" stroke={THEME.danger} fill={`${THEME.danger}10`} strokeWidth={2} isAnimationActive />
                                                    <ReferenceLine y={Number(queryData.mean_time_ms)} stroke={`${THEME.warning}60`} strokeDasharray="4 4" label={{ value: 'avg', position: 'right', fontSize: 9, fill: THEME.warning }} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Call Volume Trend</div>
                                            <ResponsiveContainer width="100%" height={100}>
                                                <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={2} />
                                                    <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                                    <Tooltip content={<ChartTooltip />} />
                                                    <Bar dataKey="calls" fill={THEME.primary} opacity={0.7} radius={[2, 2, 0, 0]} isAnimationActive />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Root Cause</div>
                                    <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 8, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}15` }}>
                                        <FileSearch color={THEME.warning} size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                                        <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>{opt.reason}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Performance Metrics</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <StatChip label="Cache Hit" value={`${queryData.cacheHit || 94.2}%`} color={THEME.success} icon={Database} small />
                                        <StatChip label="Temp Files" value={queryData.tempFiles || 0} color={queryData.tempFiles > 0 ? THEME.warning : THEME.textDim} icon={HardDrive} small />
                                        <StatChip label="Category" value={opt.category} color={THEME.primary} icon={Layers} small />
                                        <StatChip label="Impact" value={opt.improvement} color={THEME.success} icon={TrendingUp} small />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Cost Comparison</div>
                                    <div style={{ padding: 16, background: THEME.bg, borderRadius: 8, border: `1px solid ${THEME.grid}40` }}>
                                        {[{ label: 'Before', value: opt.costBefore, max: opt.costBefore, color: THEME.danger, delay: 0 }, { label: 'After', value: opt.costAfter, max: opt.costBefore, color: THEME.success, delay: 0.3 }].map((bar, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i === 0 ? 12 : 14 }}>
                                                <span style={{ width: 40, fontSize: 10, color: bar.color, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{bar.label}</span>
                                                <div style={{ flex: 1 }}><SeverityBar value={bar.value} max={bar.max} color={bar.color} delay={bar.delay} /></div>
                                                <span style={{ width: 44, fontSize: 12, fontWeight: 800, color: bar.color, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{bar.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div style={{ height: 1, background: THEME.grid, margin: '0 0 10px' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>Reduction</span>
                                            <span style={{ fontSize: 18, fontWeight: 800, color: THEME.success }}>{((1 - opt.costAfter / opt.costBefore) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '16px 20px', borderTop: `1px solid ${THEME.glassBorder}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {applied ? (
                                    <div style={{ padding: 14, borderRadius: 8, background: `${THEME.success}15`, border: `1px solid ${THEME.success}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: THEME.success, fontWeight: 700, fontSize: 13, animation: 'perfFadeIn 0.3s ease-out' }}>
                                        <CheckCircle size={16} /> Optimization Applied
                                    </div>
                                ) : (
                                    <>
                                        <button style={{ padding: 11, borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12, background: 'transparent', border: `1px solid ${THEME.glassBorder}`, color: THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.color = THEME.primary; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.glassBorder; e.currentTarget.style.color = THEME.textMuted; }}
                                        ><Play size={13} /> Test in Sandbox</button>
                                        <button onClick={handleApply} disabled={isApplying} style={{ padding: 11, borderRadius: 8, border: 'none', cursor: isApplying ? 'wait' : 'pointer', fontWeight: 700, fontSize: 12, color: '#fff', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, boxShadow: `0 4px 16px ${THEME.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', opacity: isApplying ? 0.8 : 1 }}>
                                            {isApplying ? <RotateCcw size={13} className="perf-spin" /> : <Sparkles size={13} />}
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
    const [activeView, setActiveView] = useState('activity');
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [sessionFilter, setSessionFilter] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // New state
    const [queryTags, setQueryTags] = useState({});
    const [bookmarkedQueries, setBookmarkedQueries] = useState(new Set());
    const [queryGroupMode, setQueryGroupMode] = useState(false); // fingerprint grouping
    const [activitySubView, setActivitySubView] = useState('queries'); // queries | gantt | locks | n1
    const [filterUser, setFilterUser] = useState('');
    const [filterDb, setFilterDb] = useState('');
    const [filterApp, setFilterApp] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [killedQueries, setKilledQueries] = useState(new Set());

    // Health sub-state
    const [healthSubView, setHealthSubView] = useState('overview'); // overview | cpu | memory | disk | network | buffer

    useEffect(() => {
        const load = async () => {
            try {
                const [stats, conns, locks, io, repl] = await Promise.all([
                    fetchData('/api/performance/stats'),
                    fetchData('/api/reliability/active-connections'),
                    fetchData('/api/reliability/locks'),
                    fetchData('/api/performance/table-io'),
                    fetchData('/api/reliability/replication')
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

    const activeSessions = conns.filter(c => c.state === 'active');
    const idleSessions = conns.filter(c => c.state?.includes('idle'));
    const longRunning = conns.filter(c => c.is_slow);
    const totalConns = conns.length;

    const sessionTimeline = Array.from({ length: 24 }, (_, i) => ({
        t: `${i}`, active: activeSessions.length + Math.round(Math.sin(i / 3) * 4 + Math.random() * 3),
        idle: idleSessions.length + Math.round(Math.cos(i / 4) * 2 + Math.random() * 2),
    }));

    const ioSparklines = (io || []).slice(0, 6).map(t => ({ ...t, spark: Array.from({ length: 14 }, () => Math.random() * 100) }));

    // Unique users/apps/dbs for filter dropdowns
    const uniqueApps = [...new Set(conns.map(c => c.application_name).filter(Boolean))];
    const uniqueUsers = [...new Set(conns.map(c => c.usename || c.user).filter(Boolean))];

    // Slow queries with filter applied
    const rawSlowQueries = (stats?.slowQueries || []).map((q, i) => ({
        ...q,
        id: q.id || i,
        cacheHit: (90 + Math.random() * 9.9).toFixed(1),
        tempFiles: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
        pid: 8800 + i,
    }));

    const filteredSlowQueries = rawSlowQueries.filter(q => {
        const matchSearch = !searchQuery || q.query?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchApp = !filterApp || q.application_name === filterApp;
        const matchUser = !filterUser || q.usename === filterUser;
        return matchSearch && matchApp && matchUser;
    });

    const groupedQueries = queryGroupMode ? groupByFingerprint(filteredSlowQueries) : null;
    const n1Patterns = detectN1Patterns(rawSlowQueries);

    // Synthetic health time-series data
    const cpuTimeline = Array.from({ length: 30 }, (_, i) => ({
        t: `${i * 2}m`, total: 30 + Math.sin(i / 5) * 20 + Math.random() * 15,
        core0: 40 + Math.sin(i / 4) * 25, core1: 25 + Math.cos(i / 4) * 20,
        core2: 35 + Math.sin(i / 6) * 15, core3: 20 + Math.cos(i / 5) * 10,
    }));
    const memTimeline = Array.from({ length: 30 }, (_, i) => ({
        t: `${i * 2}m`, used: 55 + Math.sin(i / 8) * 10, swap: 5 + Math.random() * 3, buffers: 20 + Math.sin(i / 10) * 5,
    }));
    const diskTimeline = Array.from({ length: 30 }, (_, i) => ({
        t: `${i * 2}m`, read: 40 + Math.random() * 60, write: 20 + Math.random() * 40, latency: 1 + Math.random() * 4, queueDepth: Math.random() * 3,
    }));
    const networkTimeline = Array.from({ length: 30 }, (_, i) => ({
        t: `${i * 2}m`, bytesIn: 500 + Math.random() * 800, bytesOut: 200 + Math.random() * 400,
    }));
    const bufferData = Array.from({ length: 20 }, (_, i) => ({
        t: `${i * 3}m`, hitRatio: 97 + Math.random() * 2.5, dirtyPages: 5 + Math.sin(i / 4) * 3, checkpoints: Math.random() > 0.85 ? 1 : 0,
    }));

    const getFilteredSessionList = () => {
        if (sessionFilter === 'active') return activeSessions;
        if (sessionFilter === 'long') return longRunning;
        if (sessionFilter === 'idle') return idleSessions;
        if (sessionFilter === 'blocked') return locks;
        return [];
    };

    const handleTagQuery = (id, tag) => {
        setQueryTags(prev => tag ? { ...prev, [id]: tag } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== String(id))));
    };

    const handleKillQuery = (query, reason) => {
        setKilledQueries(prev => new Set([...prev, query.id]));
        console.log(`KILL PID ${query.pid}: ${reason}`);
    };

    // Column definitions
    const slowQueryCols = [
        { key: 'severity', label: '', maxWidth: 60, align: 'center', render: (_, row) => <SeverityTag ms={row.mean_time_ms} /> },
        {
            key: 'query', label: 'Query', mono: true, maxWidth: 340,
            render: (t, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={e => { e.stopPropagation(); setBookmarkedQueries(prev => { const s = new Set(prev); s.has(row.id) ? s.delete(row.id) : s.add(row.id); return s; }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: bookmarkedQueries.has(row.id) ? THEME.warning : THEME.grid, padding: 2, flexShrink: 0 }}>
                        {bookmarkedQueries.has(row.id) ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
                    </button>
                    <span style={{ fontSize: 11, lineHeight: 1.4, opacity: 0.85 }}>{t?.length > 60 ? `${t.substring(0, 60)}…` : t}</span>
                    {queryTags[row.id] && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: queryTags[row.id] === 'known-slow' ? `${THEME.warning}15` : `${THEME.success}12`, color: queryTags[row.id] === 'known-slow' ? THEME.warning : THEME.success, border: `1px solid ${queryTags[row.id] === 'known-slow' ? `${THEME.warning}25` : `${THEME.success}20`}`, flexShrink: 0 }}>{queryTags[row.id] === 'known-slow' ? '⚑' : '✓'}</span>}
                </div>
            )
        },
        { key: 'calls', label: 'Calls', align: 'right', maxWidth: 65, render: v => <span style={{ fontVariantNumeric: 'tabular-nums', color: THEME.textMuted }}>{Number(v || 0).toLocaleString()}</span> },
        {
            key: 'cacheHit', label: 'Cache Hit', align: 'right', maxWidth: 75,
            render: (v, row) => <span style={{ fontWeight: 700, color: Number(row.cacheHit) > 95 ? THEME.success : Number(row.cacheHit) > 85 ? THEME.warning : THEME.danger, fontSize: 11 }}>{row.cacheHit}%</span>
        },
        {
            key: 'tempFiles', label: 'Tmp', align: 'center', maxWidth: 45,
            render: (_, row) => row.tempFiles > 0 ? <span style={{ color: THEME.warning, fontWeight: 700, fontSize: 11 }}>⚠ {row.tempFiles}</span> : <span style={{ color: THEME.textDim, fontSize: 11 }}>—</span>
        },
        {
            key: 'mean_time_ms', label: 'Avg Time', align: 'right', maxWidth: 90,
            render: v => <span style={{ fontWeight: 700, color: Number(v) > 1000 ? THEME.danger : THEME.warning, fontVariantNumeric: 'tabular-nums' }}>{Number(v).toFixed(1)}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 1 }}>ms</span></span>
        },
        {
            key: 'cost_bar', label: 'Cost', maxWidth: 70,
            render: (_, row) => <SeverityBar value={Number(row.mean_time_ms)} max={Number(stats?.slowQueries?.[0]?.mean_time_ms || 100)} color={Number(row.mean_time_ms) > 5000 ? THEME.danger : THEME.warning} />
        },
        {
            key: 'actions', label: '', align: 'right', maxWidth: 80,
            render: (_, row) => (
                <button onClick={() => setSelectedQuery(row)} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${THEME.primary}25`; e.currentTarget.style.borderColor = THEME.primary; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${THEME.primary}10`; e.currentTarget.style.borderColor = `${THEME.primary}20`; }}
                ><Sparkles size={10} /> Analyze</button>
            )
        }
    ];

    const sessionListCols = [
        { key: 'pid', label: 'PID', mono: true, maxWidth: 70, render: v => <span style={{ color: THEME.primary }}>{v}</span> },
        { key: 'usename', label: 'User', maxWidth: 90, render: v => <span style={{ fontSize: 11, color: THEME.textMuted }}>{v || '—'}</span> },
        { key: 'application_name', label: 'App', maxWidth: 100 },
        { key: 'query', label: 'Query', mono: true, render: t => <span style={{ opacity: 0.7, fontSize: 11 }}>{t ? t.substring(0, 36) + '…' : '—'}</span> },
        {
            key: 'state', label: 'State', align: 'right',
            render: v => {
                const c = v === 'active' ? THEME.success : v?.includes('idle') ? THEME.textDim : THEME.warning;
                return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${c}15`, color: c, border: `1px solid ${c}20` }}>{v || '—'}</span>;
            }
        }
    ];

    const ViewTab = ({ id, label, icon: Icon }) => {
        const active = activeView === id;
        return (
            <button onClick={() => setActiveView(id)} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 13, lineHeight: 1, letterSpacing: '0.01em', transition: 'all 0.25s', whiteSpace: 'nowrap', background: active ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})` : THEME.surface, color: active ? '#fff' : THEME.textMuted, boxShadow: active ? `0 4px 16px ${THEME.primary}35` : 'none', border: active ? 'none' : `1px solid ${THEME.grid}60` }}>
                <Icon size={14} style={{ flexShrink: 0 }} /> {label}
            </button>
        );
    };

    const SubViewTab = ({ id, label, icon: Icon, stateKey, setState }) => {
        const active = stateKey === id;
        return (
            <button onClick={() => setState(id)} style={{ padding: '7px 14px', borderRadius: 6, border: `1px solid ${active ? THEME.primary + '40' : THEME.grid + '40'}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 11, background: active ? `${THEME.primary}12` : 'transparent', color: active ? THEME.primary : THEME.textMuted, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                <Icon size={12} /> {label}
            </button>
        );
    };

    const SessionMetric = ({ icon: Icon, title, value, color, filterKey }) => {
        const isActive = sessionFilter === filterKey;
        return (
            <div onClick={() => setSessionFilter(filterKey)} style={{ cursor: 'pointer', padding: '20px 20px', borderRadius: 12, background: isActive ? `${color}12` : THEME.surface, border: `1px solid ${isActive ? `${color}30` : `${THEME.grid}50`}`, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden', minHeight: 110 }}
                 onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.background = `${color}06`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                 onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = `${THEME.grid}50`; e.currentTarget.style.background = THEME.surface; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
                {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}18` }}>
                        <Icon size={17} color={color} />
                    </div>
                    <div style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    <AnimValue value={value} />
                </div>
            </div>
        );
    };

    /* ─── Health Sub-Views ─── */
    const HealthMetricCard = ({ title, value, unit, icon: Icon, color, trend, detail }) => (
        <div style={{ padding: 16, borderRadius: 10, background: THEME.surface, border: `1px solid ${THEME.grid}40`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} color={color} /></div>
                    <span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 600 }}>{title}</span>
                </div>
                {trend !== undefined && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: trend > 0 ? THEME.danger : THEME.success, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{value}<span style={{ fontSize: 13, fontWeight: 500, color: THEME.textDim, marginLeft: 3 }}>{unit}</span></div>
            {detail && <div style={{ fontSize: 10, color: THEME.textDim }}>{detail}</div>}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px 24px' }}>
            <PerfStyles />

            {/* View Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ViewTab id="activity" label="Activity & Queries" icon={Zap} />
                <ViewTab id="health" label="Resources & Health" icon={Cpu} />
            </div>

            {/* ════════════════════ ACTIVITY VIEW ════════════════════ */}
            {activeView === 'activity' && (
                <div className="perf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Live Sessions */}
                    <GlassCard title={sessionFilter ? `${sessionFilter.charAt(0).toUpperCase() + sessionFilter.slice(1)} Sessions` : "Live Sessions"}
                               rightNode={
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.textDim }}>
                                           <LiveDot color={THEME.success} size={7} />
                                           <span>{totalConns} total connections</span>
                                       </div>
                                       {sessionFilter && (
                                           <button onClick={() => setSessionFilter(null)} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                               <ChevronLeft size={12} /> Back
                                           </button>
                                       )}
                                   </div>
                               }
                    >
                        {sessionFilter ? (
                            <div style={{ minHeight: 200 }}>
                                <DataTable columns={sessionListCols} data={getFilteredSessionList()} pageSize={6} compact />
                                {getFilteredSessionList().length === 0 && <div style={{ textAlign: 'center', padding: 32, color: THEME.textDim, fontSize: 12 }}>No sessions in this category</div>}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '4px 0' }}>
                                <SessionMetric icon={Activity} title="Active" value={activeSessions.length} color={THEME.success} filterKey="active" />
                                <SessionMetric icon={Clock} title="Long Running" value={longRunning.length} color={THEME.warning} filterKey="long" />
                                <SessionMetric icon={Server} title="Idle" value={idleSessions.length} color={THEME.textMuted} filterKey="idle" />
                                <SessionMetric icon={Lock} title="Blocked" value={locks.length} color={THEME.danger} filterKey="blocked" />
                            </div>
                        )}
                    </GlassCard>

                    {/* Session Traffic */}
                    <GlassCard title="Session Traffic" style={{ minHeight: 280 }}
                               rightNode={
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: THEME.textDim }}>
                                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.primary }} /> Active</span>
                                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: `${THEME.textDim}80` }} /> Idle</span>
                                   </div>
                               }
                    >
                        <div style={{ flex: 1, width: '100%', minHeight: 180 }}>
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={sessionTimeline} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                    <defs>
                                        <linearGradient id="perfActiveGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.35} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="perfIdleGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.textDim} stopOpacity={0.15} />
                                            <stop offset="100%" stopColor={THEME.textDim} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="idle" stroke={`${THEME.textDim}60`} strokeWidth={1.5} fill="url(#perfIdleGrad)" fillOpacity={1} isAnimationActive />
                                    <Area type="monotone" dataKey="active" stroke={THEME.primary} strokeWidth={2} fill="url(#perfActiveGrad)" fillOpacity={1} isAnimationActive />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Slow Query Analysis — main section with sub-views */}
                    <GlassCard title="Query Analysis" noPad style={{ minHeight: 400 }}
                               rightNode={
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${THEME.danger}12`, color: THEME.danger, border: `1px solid ${THEME.danger}20` }}>
                                    {filteredSlowQueries.length} slow queries
                                </span>
                                       {n1Patterns.length > 0 && (
                                           <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${THEME.warning}12`, color: THEME.warning, border: `1px solid ${THEME.warning}20` }}>
                                        {n1Patterns.length} N+1 patterns
                                    </span>
                                       )}
                                   </div>
                               }
                    >
                        {/* Sub-view toolbar */}
                        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                                <SubViewTab id="queries" label="Slow Queries" icon={List} stateKey={activitySubView} setState={setActivitySubView} />
                                <SubViewTab id="gantt" label="Timeline" icon={Calendar} stateKey={activitySubView} setState={setActivitySubView} />
                                <SubViewTab id="locks" label="Lock Waits" icon={Lock} stateKey={activitySubView} setState={setActivitySubView} />
                                <SubViewTab id="n1" label="N+1 Patterns" icon={Merge} stateKey={activitySubView} setState={setActivitySubView} />
                            </div>
                            {activitySubView === 'queries' && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {/* Search */}
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Search size={12} color={THEME.textDim} style={{ position: 'absolute', left: 8, pointerEvents: 'none' }} />
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search queries…" style={{ paddingLeft: 26, paddingRight: 10, paddingTop: 6, paddingBottom: 6, borderRadius: 6, border: `1px solid ${THEME.grid}50`, background: THEME.bg, color: THEME.textMain, fontSize: 11, width: 160, outline: 'none' }} />
                                    </div>
                                    {/* Group toggle */}
                                    <button onClick={() => setQueryGroupMode(!queryGroupMode)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${queryGroupMode ? THEME.primary + '40' : THEME.grid + '40'}`, background: queryGroupMode ? `${THEME.primary}12` : 'transparent', color: queryGroupMode ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                                        <Merge size={12} /> Group
                                    </button>
                                    {/* Filter */}
                                    <button onClick={() => setShowFilterPanel(!showFilterPanel)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${showFilterPanel ? THEME.primary + '40' : THEME.grid + '40'}`, background: showFilterPanel ? `${THEME.primary}12` : 'transparent', color: showFilterPanel ? THEME.primary : THEME.textDim, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                                        <Filter size={12} /> Filter {(filterApp || filterUser) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.warning, flexShrink: 0 }} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Filter panel */}
                        {showFilterPanel && activitySubView === 'queries' && (
                            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', gap: 12, background: `${THEME.primary}04`, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>FILTER BY:</span>
                                <select value={filterApp} onChange={e => setFilterApp(e.target.value)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${THEME.grid}50`, background: THEME.surface, color: filterApp ? THEME.primary : THEME.textDim, fontSize: 11, cursor: 'pointer', outline: 'none' }}>
                                    <option value="">All Apps</option>
                                    {uniqueApps.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${THEME.grid}50`, background: THEME.surface, color: filterUser ? THEME.primary : THEME.textDim, fontSize: 11, cursor: 'pointer', outline: 'none' }}>
                                    <option value="">All Users</option>
                                    {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                {(filterApp || filterUser || searchQuery) && (
                                    <button onClick={() => { setFilterApp(''); setFilterUser(''); setSearchQuery(''); }} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${THEME.danger}30`, background: 'transparent', color: THEME.danger, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <X size={10} /> Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sub-view content */}
                        <div style={{ padding: activitySubView === 'queries' && !queryGroupMode ? 0 : 16, flex: 1 }}>
                            {activitySubView === 'queries' && !queryGroupMode && (
                                <DataTable columns={slowQueryCols} data={filteredSlowQueries} pageSize={7} compact />
                            )}

                            {activitySubView === 'queries' && queryGroupMode && (
                                <div>
                                    {/* Grouped view header */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 0, padding: '8px 16px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                                        {['Query Fingerprint', 'Variants', 'Total Calls', 'Avg Time', ''].map((h, i) => (
                                            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left', padding: '0 8px' }}>{h}</div>
                                        ))}
                                    </div>
                                    {(groupedQueries || []).map((g, i) => (
                                        <div key={i} className="perf-row-hover" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 0, padding: '10px 16px', borderBottom: `1px solid ${THEME.grid}20`, alignItems: 'center' }}>
                                            <div style={{ fontFamily: 'monospace', fontSize: 11, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px' }}>
                                                <Hash size={10} color={THEME.textDim} style={{ marginRight: 5 }} />
                                                {g.fingerprint}
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: 12, color: THEME.primary, fontWeight: 600, padding: '0 12px' }}>{g.queries.length}</div>
                                            <div style={{ textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums', color: THEME.textMuted, padding: '0 12px' }}>{g.totalCalls.toLocaleString()}</div>
                                            <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: g.avgTime > 1000 ? THEME.danger : THEME.warning, fontVariantNumeric: 'tabular-nums', padding: '0 12px' }}>{g.avgTime.toFixed(1)}ms</div>
                                            <div style={{ padding: '0 8px' }}>
                                                <button onClick={() => setSelectedQuery(g.representative)} style={{ background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}20`, color: THEME.primary, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                                                    <Sparkles size={9} style={{ marginRight: 3 }} />Analyze
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activitySubView === 'gantt' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim }}>Query Execution Timeline</span>
                                        <span style={{ fontSize: 10, color: THEME.textDim, padding: '2px 8px', borderRadius: 4, background: `${THEME.grid}30`, border: `1px solid ${THEME.grid}40` }}>last 5 seconds</span>
                                    </div>
                                    <GanttChart queries={rawSlowQueries} />
                                </div>
                            )}

                            {activitySubView === 'locks' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim }}>Active Lock Wait Chains</span>
                                        <span style={{ fontSize: 10, color: locks.length > 0 ? THEME.danger : THEME.success, padding: '2px 8px', borderRadius: 4, background: locks.length > 0 ? `${THEME.danger}10` : `${THEME.success}10`, border: `1px solid ${locks.length > 0 ? `${THEME.danger}20` : `${THEME.success}20`}` }}>
                                            {locks.length} blocked queries
                                        </span>
                                    </div>
                                    <LockWaitDetails locks={locks} conns={conns} />
                                </div>
                            )}

                            {activitySubView === 'n1' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDim, marginBottom: 4 }}>
                                        Repetitive Query Patterns — Potential N+1 Issues
                                    </div>
                                    {n1Patterns.length === 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                                            <EmptyState icon={CheckCircle} text="No N+1 patterns detected" />
                                        </div>
                                    ) : n1Patterns.map((p, i) => (
                                        <div key={i} style={{ padding: 14, borderRadius: 10, background: p.severity === 'high' ? `${THEME.danger}06` : `${THEME.warning}06`, border: `1px solid ${p.severity === 'high' ? `${THEME.danger}15` : `${THEME.warning}15`}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: p.severity === 'high' ? `${THEME.danger}18` : `${THEME.warning}15`, color: p.severity === 'high' ? THEME.danger : THEME.warning, border: `1px solid ${p.severity === 'high' ? `${THEME.danger}25` : `${THEME.warning}20`}`, textTransform: 'uppercase' }}>{p.severity} N+1</span>
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: p.severity === 'high' ? THEME.danger : THEME.warning, fontVariantNumeric: 'tabular-nums' }}>{p.callCount.toLocaleString()}× calls</span>
                                                    </div>
                                                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.fingerprint}</div>
                                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 6 }}>
                                                        ⚡ Consider batching with <code style={{ color: THEME.primary }}>IN (?, ?, ...)</code> or using a JOIN to eliminate repetition
                                                    </div>
                                                </div>
                                                <div style={{ flexShrink: 0 }}>
                                                    <SeverityBar value={p.callCount} max={Math.max(...n1Patterns.map(x => x.callCount))} color={p.severity === 'high' ? THEME.danger : THEME.warning} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* ════════════════════ HEALTH VIEW ════════════════════ */}
            {activeView === 'health' && (
                <div className="perf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Sub-view tabs */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'cpu', label: 'CPU', icon: Cpu },
                            { id: 'memory', label: 'Memory', icon: MemoryStick },
                            { id: 'disk', label: 'Disk', icon: Disc },
                            { id: 'network', label: 'Network', icon: Wifi },
                            { id: 'buffer', label: 'Buffer Cache', icon: Database },
                        ].map(t => (
                            <SubViewTab key={t.id} id={t.id} label={t.label} icon={t.icon} stateKey={healthSubView} setState={setHealthSubView} />
                        ))}
                    </div>

                    {/* ── OVERVIEW ── */}
                    {healthSubView === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Gauges */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                                {[
                                    { title: 'CPU Usage', label: 'CPU', value: stats?.cpu_percent || 45, color: THEME.primary, chips: [{ label: 'Cores', value: stats?.cpu_cores || 8, icon: Cpu }, { label: 'Load Avg', value: stats?.load_avg || '2.4', icon: Gauge }] },
                                    { title: 'Memory', label: 'RAM', value: stats?.memory_percent || 62, color: THEME.success, chips: [{ label: 'Used', value: stats?.memory_used || '12.4 GB', icon: HardDrive }, { label: 'Buffers', value: stats?.shared_buffers || '4 GB', icon: Database }] },
                                    { title: 'Connections', label: 'Pool', value: Math.round((totalConns / (stats?.max_connections || 100)) * 100), color: totalConns > 80 ? THEME.warning : THEME.secondary || THEME.info, chips: [{ label: 'Active', value: totalConns, color: THEME.primary, icon: Network }, { label: 'Max', value: stats?.max_connections || 100, icon: Server }] },
                                ].map((card, idx) => (
                                    <GlassCard key={idx} title={card.title}>
                                        <div style={{ display: 'flex', flexDirection: 'column', height: 220, gap: 0 }}>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                                                <ResourceGauge label={card.label} value={card.value} color={card.color} size={120} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0 }}>
                                                {card.chips.map((chip, i) => (
                                                    <StatChip key={i} label={chip.label} value={chip.value} color={chip.color} icon={chip.icon} small />
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>

                            {/* IO + Replication */}
                            <div className="perf-equal-row" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
                                <GlassCard title="Top Tables by I/O" noPad>
                                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 280 }}>
                                        {ioSparklines.length === 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: 200 }}>
                                                <EmptyState icon={HardDrive} text="No IO data" />
                                            </div>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                <tr>
                                                    {[{ label: 'Table', align: 'left', width: '30%' }, { label: 'Reads', align: 'right', width: '18%' }, { label: 'Writes', align: 'right', width: '18%' }, { label: 'Hit Ratio', align: 'right', width: '14%' }, { label: 'Trend', align: 'right', width: '20%' }].map(h => (
                                                        <th key={h.label} style={{ padding: '10px 14px', textAlign: h.align, width: h.width, fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50`, position: 'sticky', top: 0, background: THEME.surface, zIndex: 1 }}>{h.label}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {ioSparklines.map((t, i) => {
                                                    const reads = Number(t.heap_blks_read || t.seq_scan || 0);
                                                    const writes = Number(t.heap_blks_hit || t.idx_scan || 0);
                                                    const hitRatio = reads + writes > 0 ? ((writes / (reads + writes)) * 100).toFixed(0) : 99;
                                                    return (
                                                        <tr key={i} className="perf-row-hover">
                                                            <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: THEME.textMain, borderBottom: `1px solid ${THEME.grid}20` }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.primary, flexShrink: 0 }} />
                                                                    {t.table_name || t.relname || `table_${i}`}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '10px 14px', fontSize: 12, fontVariantNumeric: 'tabular-nums', color: THEME.primary, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}20` }}>{reads.toLocaleString()}</td>
                                                            <td style={{ padding: '10px 14px', fontSize: 12, fontVariantNumeric: 'tabular-nums', color: THEME.success, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}20` }}>{writes.toLocaleString()}</td>
                                                            <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: Number(hitRatio) > 95 ? THEME.success : THEME.warning, textAlign: 'right', borderBottom: `1px solid ${THEME.grid}20` }}>{hitRatio}%</td>
                                                            <td style={{ padding: '10px 14px', borderBottom: `1px solid ${THEME.grid}20` }}>
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                    <MiniSparkline data={t.spark} color={THEME.primary} width={60} height={18} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </GlassCard>
                                <GlassCard title="Replication Status">
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 280 }}>
                                        {repl.length === 0 ? (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                                                <EmptyState icon={Copy} text="Standalone Instance" />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                {repl.map((r, i) => {
                                                    const lagBytes = Number(r.replication_lag_bytes || 0);
                                                    const lagColor = lagBytes > 10000000 ? THEME.danger : lagBytes > 1000000 ? THEME.warning : THEME.success;
                                                    return (
                                                        <div key={i} style={{ padding: 14, borderRadius: 8, background: THEME.surface, border: `1px solid ${THEME.grid}50` }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <LiveDot color={lagColor} size={7} />
                                                                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{r.client_addr || `Replica ${i + 1}`}</span>
                                                                </div>
                                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${lagColor}15`, color: lagColor, border: `1px solid ${lagColor}20` }}>{r.state || 'streaming'}</span>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                                <StatChip label="Lag" value={lagBytes > 1000000 ? `${(lagBytes / 1048576).toFixed(1)} MB` : `${(lagBytes / 1024).toFixed(0)} KB`} color={lagColor} icon={Timer} small />
                                                                <StatChip label="LSN Diff" value={r.sent_lsn ? r.sent_lsn.split('/')[1] : '—'} icon={GitBranch} small />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Quick stats strip */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderRadius: 12, background: THEME.glass, overflow: 'hidden', backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}` }}>
                                {[
                                    { label: 'Cache Hit', value: `${stats?.cache_hit_ratio || 99.2}%`, color: THEME.success, icon: CheckCircle },
                                    { label: 'Tx/sec', value: stats?.tps || '1.2k', color: THEME.primary, icon: Zap },
                                    { label: 'Deadlocks', value: stats?.deadlocks || 0, color: stats?.deadlocks > 0 ? THEME.danger : THEME.textDim, icon: ShieldAlert },
                                    { label: 'Temp Files', value: stats?.temp_files || '12 MB', color: THEME.warning, icon: HardDrive },
                                    { label: 'Uptime', value: stats?.uptime || '14d 6h', color: THEME.textMain, icon: Radio },
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', height: 58, borderRight: i < 4 ? `1px solid ${THEME.glassBorder}` : 'none' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}10` }}>
                                            <s.icon size={14} color={s.color} />
                                        </div>
                                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 4 }}>{s.label}</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── CPU ── */}
                    {healthSubView === 'cpu' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Total CPU" value={`${stats?.cpu_percent || 45}`} unit="%" icon={Cpu} color={THEME.primary} trend={3.2} detail={`${stats?.cpu_cores || 8} cores`} />
                                <HealthMetricCard title="Load Avg 1m" value={stats?.load_avg || '2.4'} unit="" icon={Gauge} color={THEME.success} trend={-1.1} detail="5m: 2.1 · 15m: 1.8" />
                                <HealthMetricCard title="User CPU" value="31.2" unit="%" icon={User} color={THEME.primary} trend={2.0} detail="Userland processes" />
                                <HealthMetricCard title="System CPU" value="13.8" unit="%" icon={Server} color={THEME.warning} trend={1.2} detail="Kernel + interrupts" />
                            </div>
                            <GlassCard title="CPU Usage Over Time — Per Core">
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={cpuTimeline} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Line type="monotone" dataKey="total" stroke={THEME.primary} strokeWidth={2.5} dot={false} name="Total" isAnimationActive />
                                        {[['core0', THEME.success], ['core1', THEME.warning], ['core2', THEME.danger + '90'], ['core3', THEME.primary + '60']].map(([key, color]) => (
                                            <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={1} dot={false} strokeDasharray="4 4" name={key} isAnimationActive />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: 16, padding: '4px 0 2px', flexWrap: 'wrap' }}>
                                    {[['Total', THEME.primary, 2.5, false], ['Core 0', THEME.success, 1, true], ['Core 1', THEME.warning, 1, true], ['Core 2', THEME.danger + '90', 1, true], ['Core 3', THEME.primary + '60', 1, true]].map(([l, c]) => (
                                        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: THEME.textDim }}>
                                            <span style={{ width: 20, height: 2, background: c, borderRadius: 1 }} />{l}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    )}

                    {/* ── MEMORY ── */}
                    {healthSubView === 'memory' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="RAM Used" value={stats?.memory_used || '12.4'} unit="GB" icon={MemoryStick} color={THEME.success} trend={1.5} detail={`of ${stats?.total_memory || '32'} GB total`} />
                                <HealthMetricCard title="Swap Used" value="0.8" unit="GB" icon={RefreshCcw} color={THEME.warning} trend={0.2} detail="Swap pressure: low" />
                                <HealthMetricCard title="Shared Buffers" value={stats?.shared_buffers || '4'} unit="GB" icon={Database} color={THEME.primary} trend={0} detail="PostgreSQL buffer pool" />
                                <HealthMetricCard title="Work Mem" value="64" unit="MB" icon={Layers} color={THEME.textMuted} trend={0} detail="Per-sort allocation" />
                            </div>
                            <GlassCard title="Memory Usage Trends">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={memTimeline} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                        <defs>
                                            {[['memUsed', THEME.success], ['memSwap', THEME.warning], ['memBuf', THEME.primary]].map(([id, color]) => (
                                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="buffers" stroke={THEME.primary} fill="url(#memBuf)" strokeWidth={1.5} name="Buffers %" isAnimationActive />
                                        <Area type="monotone" dataKey="swap" stroke={THEME.warning} fill="url(#memSwap)" strokeWidth={1.5} name="Swap %" isAnimationActive />
                                        <Area type="monotone" dataKey="used" stroke={THEME.success} fill="url(#memUsed)" strokeWidth={2} name="RAM %" isAnimationActive />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </div>
                    )}

                    {/* ── DISK ── */}
                    {healthSubView === 'disk' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Read Throughput" value="148" unit="MB/s" icon={HardDrive} color={THEME.primary} trend={5.2} detail="Peak: 420 MB/s" />
                                <HealthMetricCard title="Write Throughput" value="62" unit="MB/s" icon={HardDrive} color={THEME.success} trend={-2.1} detail="Peak: 180 MB/s" />
                                <HealthMetricCard title="Avg Latency" value="1.8" unit="ms" icon={Timer} color={THEME.warning} trend={0.3} detail="P95: 4.2ms · P99: 8ms" />
                                <HealthMetricCard title="Queue Depth" value="1.4" unit="" icon={Layers} color={THEME.textMuted} trend={0.1} detail="Avg I/O queue" />
                            </div>
                            <GlassCard title="Disk I/O & Latency">
                                <ResponsiveContainer width="100%" height={220}>
                                    <ComposedChart data={diskTimeline} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis yAxisId="throughput" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="latency" orientation="right" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="ms" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar yAxisId="throughput" dataKey="read" fill={THEME.primary} opacity={0.6} radius={[2, 2, 0, 0]} name="Read MB/s" isAnimationActive />
                                        <Bar yAxisId="throughput" dataKey="write" fill={THEME.success} opacity={0.6} radius={[2, 2, 0, 0]} name="Write MB/s" isAnimationActive />
                                        <Line yAxisId="latency" type="monotone" dataKey="latency" stroke={THEME.warning} strokeWidth={2} dot={false} name="Latency ms" isAnimationActive />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </div>
                    )}

                    {/* ── NETWORK ── */}
                    {healthSubView === 'network' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Bytes In/s" value="820" unit="KB/s" icon={Wifi} color={THEME.primary} trend={12.0} detail="Client → Server" />
                                <HealthMetricCard title="Bytes Out/s" value="340" unit="KB/s" icon={Wifi} color={THEME.success} trend={-4.2} detail="Server → Client" />
                                <HealthMetricCard title="Connections/s" value="48" unit="/s" icon={Network} color={THEME.warning} trend={3.1} detail="New conn rate" />
                                <HealthMetricCard title="Errors" value="0" unit="" icon={AlertCircle} color={THEME.textDim} trend={0} detail="Packet errors" />
                            </div>
                            <GlassCard title="Network Throughput (KB/s)">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={networkTimeline} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                        <defs>
                                            {[['netIn', THEME.primary], ['netOut', THEME.success]].map(([id, color]) => (
                                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="KB" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="bytesIn" stroke={THEME.primary} fill="url(#netIn)" strokeWidth={2} name="In KB/s" isAnimationActive />
                                        <Area type="monotone" dataKey="bytesOut" stroke={THEME.success} fill="url(#netOut)" strokeWidth={2} name="Out KB/s" isAnimationActive />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </div>
                    )}

                    {/* ── BUFFER CACHE ── */}
                    {healthSubView === 'buffer' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <HealthMetricCard title="Cache Hit Ratio" value={`${stats?.cache_hit_ratio || 99.2}`} unit="%" icon={Database} color={THEME.success} trend={0.1} detail="Block-level hit rate" />
                                <HealthMetricCard title="Dirty Pages" value="7.4" unit="%" icon={HardDrive} color={THEME.warning} trend={-0.5} detail="Awaiting flush" />
                                <HealthMetricCard title="Bgwriter Checkpoints" value="3" unit="/hr" icon={RefreshCcw} color={THEME.primary} trend={0} detail="Scheduled checkpoints" />
                                <HealthMetricCard title="Evictions/s" value="142" unit="/s" icon={TrendingDown} color={THEME.textMuted} trend={-8.3} detail="Buffer eviction rate" />
                            </div>
                            <GlassCard title="Buffer Cache Efficiency Over Time">
                                <ResponsiveContainer width="100%" height={220}>
                                    <ComposedChart data={bufferData} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
                                        <CartesianGrid stroke={`${THEME.grid}30`} strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={3} />
                                        <YAxis yAxisId="ratio" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} domain={[94, 100]} unit="%" />
                                        <YAxis yAxisId="dirty" orientation="right" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area yAxisId="ratio" type="monotone" dataKey="hitRatio" stroke={THEME.success} fill={`${THEME.success}10`} strokeWidth={2} name="Hit Ratio %" isAnimationActive />
                                        <Line yAxisId="dirty" type="monotone" dataKey="dirtyPages" stroke={THEME.warning} strokeWidth={1.5} dot={false} name="Dirty %" isAnimationActive />
                                        {/* Checkpoint markers */}
                                        {bufferData.map((d, i) => d.checkpoints > 0 && (
                                            <ReferenceLine key={i} yAxisId="ratio" x={d.t} stroke={`${THEME.primary}60`} strokeDasharray="3 3" label={{ value: '⟳', position: 'top', fontSize: 10, fill: THEME.primary }} />
                                        ))}
                                    </ComposedChart>
                                </ResponsiveContainer>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: THEME.primary }}>⟳</span> checkpoint events · dashed line = dirty page % · solid = hit ratio
                                </div>
                            </GlassCard>

                            {/* Buffer efficiency by table */}
                            <GlassCard title="Buffer Efficiency per Table" noPad>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr>
                                        {['Table', 'Heap Reads', 'Buffer Hits', 'Hit Ratio', 'Efficiency'].map((h, i) => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${THEME.grid}50`, position: 'sticky', top: 0, background: THEME.surface, zIndex: 1 }}>{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {ioSparklines.map((t, i) => {
                                        const reads = Number(t.heap_blks_read || 100);
                                        const hits = Number(t.heap_blks_hit || t.seq_scan || 900);
                                        const ratio = (hits / (reads + hits) * 100);
                                        return (
                                            <tr key={i} className="perf-row-hover">
                                                <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: THEME.textMain, borderBottom: `1px solid ${THEME.grid}20` }}>{t.table_name || t.relname || `table_${i}`}</td>
                                                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'right', color: THEME.textMuted, fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${THEME.grid}20` }}>{reads.toLocaleString()}</td>
                                                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'right', color: THEME.primary, fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${THEME.grid}20` }}>{hits.toLocaleString()}</td>
                                                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'right', fontWeight: 700, color: ratio > 95 ? THEME.success : ratio > 80 ? THEME.warning : THEME.danger, fontVariantNumeric: 'tabular-nums', borderBottom: `1px solid ${THEME.grid}20` }}>{ratio.toFixed(1)}%</td>
                                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${THEME.grid}20` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <SeverityBar value={ratio} max={100} color={ratio > 95 ? THEME.success : ratio > 80 ? THEME.warning : THEME.danger} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </GlassCard>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {selectedQuery && (
                <QueryAnalysisModal
                    queryData={selectedQuery}
                    onClose={() => setSelectedQuery(null)}
                    onApply={(id) => console.log("Optimized query", id)}
                    onKill={handleKillQuery}
                    tags={queryTags}
                    onTag={handleTagQuery}
                />
            )}
        </div>
    );
};

export default PerformanceTab;