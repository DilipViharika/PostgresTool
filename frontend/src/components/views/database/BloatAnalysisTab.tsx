import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, CartesianGrid, RadialBarChart, RadialBar, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
    Layers, RefreshCw, AlertTriangle, Database, Activity, Search,
    AlertCircle, Filter, TrendingUp, Zap, Shield, ChevronUp, ChevronDown,
    Eye, ArrowRight, Clock, HardDrive, BarChart2, Cpu
} from 'lucide-react';

/**
 * REQUIRED BACKEND SQL QUERIES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/bloat/tables
 * SELECT schemaname, relname AS tablename,
 *   pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
 *   pg_total_relation_size(relid) AS total_bytes,
 *   n_live_tup, n_dead_tup,
 *   CASE WHEN (n_live_tup+n_dead_tup)>0
 *     THEN ROUND(100.0*n_dead_tup/(n_live_tup+n_dead_tup),2) ELSE 0 END AS dead_pct,
 *   pg_size_pretty(GREATEST(pg_total_relation_size(relid)-(n_live_tup*100),0)) AS estimated_bloat_size
 * FROM pg_stat_user_tables ORDER BY dead_pct DESC;
 *
 * GET /api/bloat/indexes
 * SELECT ix.schemaname, ix.indexrelname AS indexname, ix.relname AS tablename,
 *   pg_size_pretty(pg_relation_size(ix.indexrelid)) AS index_size,
 *   pg_relation_size(ix.indexrelid) AS index_bytes, ix.idx_scan,
 *   CASE WHEN ix.idx_tup_read>0
 *     THEN ROUND(100.0*(ix.idx_tup_read-ix.idx_tup_fetch)/ix.idx_tup_read,2) ELSE 0 END AS inefficiency_pct
 * FROM pg_stat_user_indexes ix ORDER BY index_bytes DESC;
 *
 * GET /api/bloat/summary
 * SELECT pg_size_pretty(pg_database_size(current_database())) AS total_db_size,
 *   COUNT(*) AS total_tables,
 *   SUM(CASE WHEN dead_pct>10 THEN 1 ELSE 0 END) AS high_bloat_tables,
 *   SUM(CASE WHEN dead_pct>20 THEN 1 ELSE 0 END) AS critical_bloat_tables,
 *   ROUND(AVG(dead_pct),2) AS avg_dead_pct, SUM(n_dead_tup) AS total_dead_tuples
 * FROM (SELECT n_dead_tup, CASE WHEN (n_live_tup+n_dead_tup)>0
 *   THEN ROUND(100.0*n_dead_tup/(n_live_tup+n_dead_tup),2) ELSE 0 END AS dead_pct
 *   FROM pg_stat_user_tables) sub;
 */

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtBytes = b => {
    const n = Number(b) || 0;
    if (n < 1024)       return `${n} B`;
    if (n < 1048576)    return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
    return `${(n / 1073741824).toFixed(2)} GB`;
};
const fmt     = n  => (n == null ? '—' : Number(n).toLocaleString());
const deadCol = p  => { const v = Number(p)||0; if(v>20) return THEME.danger; if(v>10) return THEME.warning; return THEME.success; };
const healthScore = (avgDead, critCount, totalTables) => {
    if (!totalTables) return 100;
    const critRatio = (critCount / totalTables) * 100;
    return Math.max(0, Math.round(100 - (avgDead * 1.5) - (critRatio * 2)));
};

const normaliseTable = row => ({ ...row, tablename: row.tablename ?? row.relname ?? '', schemaname: row.schemaname ?? row.nspname ?? '' });
const normaliseIndex = row => ({ ...row, indexname: row.indexname ?? row.indexrelname ?? '', tablename: row.tablename ?? row.relname ?? '', schemaname: row.schemaname ?? row.nspname ?? '' });

// ─── Styles ────────────────────────────────────────────────────────────────
const BA_STYLE_ID = 'ba-adaptive-styles';

function ensureBaStyles() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(BA_STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = BA_STYLE_ID; document.head.appendChild(el); }
    el.textContent = [
        '@keyframes baSpin { to { transform: rotate(360deg) } }',
        '@keyframes baFadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }',
        '@keyframes baPulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }',
        `@keyframes baGlow { 0%,100% { box-shadow: 0 0 8px ${THEME.danger}40 } 50% { box-shadow: 0 0 20px ${THEME.danger}70 } }`,
        '@keyframes baSlide { from { width: 0 } }',
        '@keyframes baCounter { from { opacity:0; transform: scale(.8) } to { opacity:1; transform: scale(1) } }',
        '',
        `.ba-wrap { font-family: ${THEME.fontBody}; }`,
        `.ba-mono { font-family: ${THEME.fontMono} !important; }`,
        '',
        `.ba-card {`,
        `    background: ${THEME.surface};`,
        `    border: 1px solid ${THEME.glassBorder};`,
        `    border-radius: 14px;`,
        `    padding: 20px;`,
        `    animation: baFadeUp .4s ease both;`,
        `    position: relative;`,
        `    overflow: hidden;`,
        `}`,
        `.ba-card::before {`,
        `    content: '';`,
        `    position: absolute;`,
        `    inset: 0;`,
        `    border-radius: 14px;`,
        `    background: ${THEME.surface};`,
        `    pointer-events: none;`,
        `}`,
        '',
        `.ba-metric-card {`,
        `    background: ${THEME.surface};`,
        `    border: 1px solid ${THEME.glassBorder};`,
        `    border-radius: 16px;`,
        `    padding: 20px 24px;`,
        `    display: flex; flex-direction: column; gap: 10px;`,
        `    position: relative; overflow: hidden;`,
        `    transition: transform .2s, border-color .2s;`,
        `    cursor: default;`,
        `    animation: baFadeUp .4s ease both;`,
        `}`,
        `.ba-metric-card:hover { transform: translateY(-2px); border-color: ${THEME.glassBorderHover}; }`,
        `.ba-metric-card::after {`,
        `    content: '';`,
        `    position: absolute;`,
        `    top: -30px; right: -30px;`,
        `    width: 100px; height: 100px;`,
        `    border-radius: 50%;`,
        `    opacity: .06;`,
        `}`,
        '',
        `.ba-row {`,
        `    display: grid;`,
        `    align-items: center;`,
        `    padding: 11px 16px;`,
        `    border-bottom: 1px solid ${THEME.grid}40;`,
        `    font-size: 12.5px;`,
        `    transition: background .15s;`,
        `    position: relative;`,
        `}`,
        `.ba-row:hover { background: ${THEME.surfaceHover}; }`,
        `.ba-row:last-child { border-bottom: none; }`,
        '',
        `.ba-head {`,
        `    display: grid;`,
        `    gap: 8px;`,
        `    padding: 10px 16px;`,
        `    font-size: 10px;`,
        `    font-weight: 700;`,
        `    color: ${THEME.textDim};`,
        `    text-transform: uppercase;`,
        `    letter-spacing: 1px;`,
        `    border-bottom: 1px solid ${THEME.grid};`,
        `    background: ${THEME.surfaceHover};`,
        `}`,
        '',
        `.ba-input {`,
        `    background: ${THEME.surfaceHover};`,
        `    border: 1px solid ${THEME.grid};`,
        `    color: ${THEME.textMain};`,
        `    border-radius: 10px;`,
        `    padding: 9px 12px;`,
        `    font-size: 13px;`,
        `    outline: none;`,
        `    transition: border-color .2s, background .2s;`,
        `    font-family: inherit;`,
        `}`,
        `.ba-input:focus { border-color: ${THEME.primary}99; background: ${THEME.surfaceHover}; }`,
        `.ba-input::placeholder { color: ${THEME.textDim}; }`,
        '',
        `.ba-tab {`,
        `    padding: 8px 18px;`,
        `    border-radius: 9px;`,
        `    border: 1px solid ${THEME.grid};`,
        `    background: transparent;`,
        `    color: ${THEME.textMuted};`,
        `    cursor: pointer;`,
        `    font-size: 13px;`,
        `    font-weight: 700;`,
        `    font-family: inherit;`,
        `    transition: all .2s;`,
        `    letter-spacing: .3px;`,
        `}`,
        `.ba-tab.active {`,
        `    background: linear-gradient(135deg, ${THEME.primary}25, ${THEME.primaryRaised || THEME.primary}15);`,
        `    border-color: ${THEME.primary}80;`,
        `    color: ${THEME.primary}DD;`,
        `    box-shadow: 0 0 16px ${THEME.primary}33;`,
        `}`,
        `.ba-tab:hover:not(.active) { border-color: ${THEME.glassBorderHover}; color: ${THEME.textMain}; }`,
        '',
        `.ba-badge {`,
        `    display: inline-flex; align-items: center; gap: 4px;`,
        `    padding: 3px 9px;`,
        `    border-radius: 6px;`,
        `    font-size: 11px; font-weight: 700;`,
        `    animation: baCounter .3s ease;`,
        `}`,
        '',
        `.ba-progress-track {`,
        `    height: 6px;`,
        `    border-radius: 3px;`,
        `    background: ${THEME.grid};`,
        `    overflow: visible;`,
        `    position: relative;`,
        `}`,
        `.ba-progress-fill {`,
        `    height: 100%;`,
        `    border-radius: 3px;`,
        `    animation: baSlide .6s ease both;`,
        `    position: relative;`,
        `}`,
        `.ba-progress-fill::after {`,
        `    content: '';`,
        `    position: absolute;`,
        `    right: -1px; top: -2px;`,
        `    width: 10px; height: 10px;`,
        `    border-radius: 50%;`,
        `    background: inherit;`,
        `    box-shadow: 0 0 8px currentColor;`,
        `}`,
        '',
        `.ba-health-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }`,
        '',
        '',
        `.ba-sort-btn {`,
        `    background: none; border: none; cursor: pointer;`,
        `    color: ${THEME.textDim}; padding: 0;`,
        `    display: inline-flex; align-items: center; gap: 2px;`,
        `    transition: color .15s; font-size: 10px; font-weight: 700;`,
        `    font-family: inherit; letter-spacing: 1px; text-transform: uppercase;`,
        `}`,
        `.ba-sort-btn:hover, .ba-sort-btn.active { color: ${THEME.primary}DD; }`,
        '',
        `.severity-dot {`,
        `    width: 6px; height: 6px; border-radius: 50%;`,
        `    display: inline-block; flex-shrink: 0;`,
        `}`,
        `.severity-dot.critical { background: ${THEME.danger}; box-shadow: 0 0 6px ${THEME.danger}; animation: baPulse 1.5s ease infinite; }`,
        `.severity-dot.high { background: ${THEME.warning}; }`,
        `.severity-dot.ok { background: ${THEME.success}; }`,
        '',
        `::-webkit-scrollbar { width: 4px; height: 4px; }`,
        `::-webkit-scrollbar-track { background: transparent; }`,
        `::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 2px; }`,
        `::-webkit-scrollbar-thumb:hover { background: ${THEME.glassBorderHover}; }`,
    ].join('\n');
}

const Styles = () => { useAdaptiveTheme(); ensureBaStyles(); return null; };

// ─── Health Score Widget ───────────────────────────────────────────────────
const HealthGauge = ({ score }) => {
    const color = score > 70 ? THEME.success : score > 40 ? THEME.warning : THEME.danger;
    const label = score > 70 ? 'HEALTHY' : score > 40 ? 'DEGRADED' : 'CRITICAL';
    const data = [{ value: score }, { value: 100 - score }];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                            <Cell fill={color} />
                            <Cell fill={THEME.grid} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
                </div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color }}>{label}</span>
        </div>
    );
};

// ─── Mini sparkline bar ────────────────────────────────────────────────────
const SparkBar = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: THEME.grid, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width .4s ease' }} />
        </div>
    );
};

// ─── Progress bar ──────────────────────────────────────────────────────────
const DeadBar = ({ pct }) => {
    const p = Math.min(100, Number(pct) || 0);
    const c = deadCol(pct);
    const grad = p > 20
        ? `linear-gradient(90deg, ${THEME.danger}90, ${THEME.danger})`
        : p > 10
            ? `linear-gradient(90deg, ${THEME.warning}90, ${THEME.warning})`
            : `linear-gradient(90deg, ${THEME.success}90, ${THEME.success})`;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="ba-progress-track" style={{ flex: 1, minWidth: 60 }}>
                <div className="ba-progress-fill" style={{ width: `${p}%`, background: grad }} />
            </div>
            <span className="ba-mono" style={{ fontSize: 11, fontWeight: 700, color: c, minWidth: 36, textAlign: 'right' }}>{p.toFixed(1)}%</span>
        </div>
    );
};

// ─── Inefficiency bar ──────────────────────────────────────────────────────
const IneffBar = ({ pct }) => {
    const p = Math.min(100, Number(pct) || 0);
    const c = p > 50 ? THEME.danger : p > 20 ? THEME.warning : THEME.success;
    const grad = p > 50
        ? `linear-gradient(90deg, ${THEME.danger}70, ${THEME.danger})`
        : p > 20
            ? `linear-gradient(90deg, ${THEME.warning}70, ${THEME.warning})`
            : `linear-gradient(90deg, ${THEME.success}70, ${THEME.success})`;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="ba-progress-track" style={{ flex: 1, minWidth: 60 }}>
                <div className="ba-progress-fill" style={{ width: `${p}%`, background: grad }} />
            </div>
            <span className="ba-mono" style={{ fontSize: 11, fontWeight: 700, color: c, minWidth: 36, textAlign: 'right' }}>{p.toFixed(0)}%</span>
        </div>
    );
};

// ─── Tooltip ───────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.surface, border: '1px solid ' + THEME.glassBorder, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: THEME.textDim, marginBottom: 6, fontSize: 11 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.fill || THEME.primaryFaint, fontWeight: 700, display: 'flex', gap: 8 }}>
                    <span style={{ color: THEME.textDim, fontWeight: 400 }}>{p.name}</span>
                    <span>{typeof p.value === 'number' && p.value > 10000 ? fmtBytes(p.value) : typeof p.value === 'number' ? `${p.value}${p.name.includes('%') ? '%' : ''}` : p.value}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Metric Card ───────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, accent = THEME.primary, warn, critical, delay = 0 }) => {
    const borderColor = critical ? THEME.danger + '59' : warn ? THEME.warning + '4D' : THEME.glassBorder;
    const glowClass = critical ? 'critical-glow' : '';
    return (
        <div
            className={`ba-metric-card ${glowClass}`}
            style={{ borderColor, animationDelay: `${delay}ms` }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}30` }}>
                    <Icon size={18} color={accent} />
                </div>
                {(warn || critical) && (
                    <span className={`severity-dot ${critical ? 'critical' : 'high'}`} style={{ marginTop: 6 }} />
                )}
            </div>
            <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: THEME.textMain, lineHeight: 1, letterSpacing: -.5 }}>{value}</div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, fontWeight: 700,  letterSpacing: .8 }}>{label}</div>
                {sub && <div style={{ fontSize: 11, color: critical ? THEME.danger : warn ? THEME.warning : THEME.textDim, marginTop: 3 }}>{sub}</div>}
            </div>
        </div>
    );
};

// ─── Sortable column header ────────────────────────────────────────────────
const SortHeader = ({ label, col, sortCol, sortDir, onSort }) => {
    const active = sortCol === col;
    return (
        <button className={`ba-sort-btn ${active ? 'active' : ''}`} onClick={() => onSort(col)}>
            {label}
            {active ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null}
        </button>
    );
};

// ─── Constants ─────────────────────────────────────────────────────────────
const COLS_TABLE = '2.2fr 0.9fr 1fr 1fr 1.4fr 1fr';
const COLS_INDEX = '2.2fr 1fr 0.9fr 0.9fr 1.4fr';

export default function BloatAnalysisTab() {
    useAdaptiveTheme(); // keeps THEME in sync with dark/light toggle
    const [tables,     setTables]     = useState([]);
    const [indexes,    setIndexes]    = useState([]);
    const [summary,    setSummary]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState(null);
    const [lastAt,     setLastAt]     = useState(null);
    const [autoRfsh,   setAutoRfsh]   = useState(60);
    const [activeTab,  setActiveTab]  = useState('tables');
    const [search,     setSearch]     = useState('');
    const [sortCol,    setSortCol]    = useState('dead_pct');
    const [sortDir,    setSortDir]    = useState('desc');
    const [filterHigh, setFilterHigh] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const intervalRef = useRef(null);

    const load = useCallback(async (initial = false) => {
        let cancelled = false;
        if (!initial) setRefreshing(true);
        try {
            const [tRes, iRes, sRes] = await Promise.allSettled([
                fetchData('/api/bloat/tables'),
                fetchData('/api/bloat/indexes'),
                fetchData('/api/bloat/summary'),
            ]);

            if (cancelled) return;

            const val = r => (r.status === 'fulfilled' ? r.value : null);
            const rejected = [tRes, iRes, sRes].find(r => r.status === 'rejected');
            setTables(((val(tRes)) || []).map(normaliseTable));
            setIndexes(((val(iRes)) || []).map(normaliseIndex));
            setSummary(val(sRes) || {});
            // Only show an error if ALL three requests failed (real connection issue)
            setError((!val(tRes) && !val(iRes) && !val(sRes)) ? (rejected?.reason?.message || 'Failed to load bloat data') : null);
        } catch (e) {
            if (!cancelled) {
                setError(e.message);
            }
        } finally {
            if (!cancelled) {
                setLastAt(Date.now());
                setRefreshing(false);
                if (initial) setLoading(false);
            }
        }
    }, []);

    useEffect(() => { load(true); }, [load]);
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoRfsh > 0) intervalRef.current = setInterval(() => load(false), autoRfsh * 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRfsh, load]);

    const fmtRel = d => {
        if (!d) return '';
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        return `${Math.floor(s / 3600)}h ago`;
    };

    const handleSort = col => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('desc'); }
    };

    const filteredTables = useMemo(() => tables
        .filter(t => {
            const matchSearch = !search || `${t.schemaname}.${t.tablename}`.toLowerCase().includes(search.toLowerCase());
            const matchHigh   = !filterHigh || Number(t.dead_pct) > 10;
            return matchSearch && matchHigh;
        })
        .sort((a, b) => {
            let va, vb;
            if (sortCol === 'dead_pct')    { va = Number(a.dead_pct);    vb = Number(b.dead_pct); }
            else if (sortCol === 'total_bytes') { va = Number(a.total_bytes); vb = Number(b.total_bytes); }
            else if (sortCol === 'n_dead_tup')  { va = Number(a.n_dead_tup);  vb = Number(b.n_dead_tup); }
            else { va = 0; vb = 0; }
            return sortDir === 'asc' ? va - vb : vb - va;
        }), [tables, search, filterHigh, sortCol, sortDir]);

    const filteredIndexes = useMemo(() => indexes
            .filter(i => !search || `${i.schemaname}.${i.indexname}`.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => Number(b.index_bytes) - Number(a.index_bytes)),
        [indexes, search]);

    const chartDeadData = useMemo(() =>
            [...tables].sort((a, b) => Number(b.dead_pct) - Number(a.dead_pct)).slice(0, 10)
                .map(t => ({ name: t.tablename.length > 20 ? t.tablename.slice(0, 18) + '…' : t.tablename, dead: Math.round(Number(t.dead_pct) || 0) })),
        [tables]);

    const chartSizeData = useMemo(() =>
            [...tables].sort((a, b) => Number(b.total_bytes) - Number(a.total_bytes)).slice(0, 10)
                .map(t => ({ name: t.tablename.length > 20 ? t.tablename.slice(0, 18) + '…' : t.tablename, size: Number(t.total_bytes) || 0 })),
        [tables]);

    const score = useMemo(() => healthScore(
        Number(summary?.avg_dead_pct) || 0,
        Number(summary?.critical_bloat_tables) || 0,
        Number(summary?.total_tables) || 1
    ), [summary]);

    // Severity distribution for mini pie
    const severityData = useMemo(() => {
        const critical = tables.filter(t => Number(t.dead_pct) > 20).length;
        const high = tables.filter(t => Number(t.dead_pct) > 10 && Number(t.dead_pct) <= 20).length;
        const ok = tables.length - critical - high;
        return [{ value: critical, fill: THEME.danger }, { value: high, fill: THEME.warning }, { value: ok, fill: THEME.success }];
    }, [tables]);

    const maxDeadBytes = useMemo(() => tables.length > 0 ? Math.max(...tables.map(t => Number(t.total_bytes) || 0)) : 1, [tables]);
    const maxIndexBytes = useMemo(() => indexes.length > 0 ? Math.max(...indexes.map(i => Number(i.index_bytes) || 0)) : 1, [indexes]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 16, color: THEME.textMuted }}>
            <Styles />
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${THEME.primary}4D`, borderTopColor: THEME.primary, animation: 'baSpin 1s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: .5 }}>Analysing bloat…</span>
        </div>
    );

    return (
        <div className="ba-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Styles />

            {/* ── Toolbar ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: THEME.surface, borderRadius: 14, border: '1px solid ' + THEME.glassBorder }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: THEME.primary + '26', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.primary}4D` }}>
                        <Layers size={18} color={THEME.primaryFaint} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textMain, letterSpacing: -.2 }}>Bloat Analysis</div>
                        <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 1 }}>{fmt(summary?.total_tables)} tables monitored</div>
                    </div>
                    {Number(summary?.critical_bloat_tables) > 0 && (
                        <span className="ba-badge" style={{ background: THEME.danger + '1F', color: THEME.danger + 'CC', border: `1px solid ${THEME.danger}4D` }}>
                            <AlertTriangle size={10} />
                            {summary.critical_bloat_tables} critical
                        </span>
                    )}
                    {Number(summary?.high_bloat_tables) > 0 && (
                        <span className="ba-badge" style={{ background: THEME.warning + '1A', color: THEME.warning + 'E0', border: `1px solid ${THEME.warning}40` }}>
                            {summary.high_bloat_tables} high bloat
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {lastAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: THEME.textDim }}>
                            <Clock size={11} />
                            {fmtRel(lastAt)}
                        </div>
                    )}
                    <select
                        value={autoRfsh}
                        onChange={e => setAutoRfsh(+e.target.value)}
                        style={{ background: THEME.surfaceHover, border: '1px solid ' + THEME.grid, color: THEME.textMain, borderRadius: 8, padding: '5px 10px', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={300}>5m</option>
                        <option value={0}>Off</option>
                    </select>
                    <button
                        onClick={() => load(false)}
                        disabled={refreshing}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 9, border: `1px solid ${THEME.primary}66`, background: THEME.primary + '1F', color: THEME.primaryFaint, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all .2s' }}
                    >
                        <RefreshCw size={13} style={{ animation: refreshing ? 'baSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Error ────────────────────────────────────────────────────── */}
            {error && (
                <div style={{ padding: 14, background: THEME.danger + '1A', border: `1px solid ${THEME.danger}4D`, borderRadius: 12, color: THEME.danger + 'CC', fontSize: 13, display: 'flex', alignItems: 'center', gap: 9 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* ── Metrics row ──────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 1fr auto', gap: 14, alignItems: 'stretch' }}>
                <MetricCard icon={Database} label="Total DB Size" value={summary?.total_db_size || '—'} sub={`${fmt(summary?.total_tables)} tables`} accent={THEME.primary} delay={0} />
                <MetricCard icon={AlertTriangle} label="High Bloat" value={fmt(summary?.high_bloat_tables)} sub=">10% dead tuples" accent={THEME.warning} warn={Number(summary?.high_bloat_tables) > 0} delay={60} />
                <MetricCard icon={Zap} label="Critical Bloat" value={fmt(summary?.critical_bloat_tables)} sub=">20% dead tuples" accent={THEME.danger} critical={Number(summary?.critical_bloat_tables) > 0} delay={120} />
                <MetricCard icon={TrendingUp} label="Avg Dead %" value={`${summary?.avg_dead_pct || 0}%`} sub={`${fmt(summary?.total_dead_tuples)} dead rows`} accent={Number(summary?.avg_dead_pct) > 10 ? THEME.warning : THEME.success} warn={Number(summary?.avg_dead_pct) > 10} delay={180} />

                {/* Health score + severity donut */}
                <div className="ba-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, minWidth: 200 }}>
                    <HealthGauge score={score} />
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted,  letterSpacing: .8, marginBottom: 8 }}>Severity</div>
                        {[
                            { label: 'Critical', color: THEME.danger, count: tables.filter(t => Number(t.dead_pct) > 20).length },
                            { label: 'High', color: THEME.warning, count: tables.filter(t => Number(t.dead_pct) > 10 && Number(t.dead_pct) <= 20).length },
                            { label: 'OK', color: THEME.success, count: tables.filter(t => Number(t.dead_pct) <= 10).length },
                        ].map(({ label, color, count }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: THEME.textMuted, flex: 1 }}>{label}</span>
                                <span className="ba-mono" style={{ fontSize: 11, fontWeight: 700, color }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Charts ───────────────────────────────────────────────────── */}
            {chartDeadData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18 }}>
                    {/* Dead % chart */}
                    <div className="ba-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={14} color={THEME.warning} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>Top 10 — Dead Tuple %</span>
                            </div>
                            <span className="ba-badge" style={{ background: THEME.warning + '1A', color: THEME.warning + 'E0', border: `1px solid ${THEME.warning}33` }}>
                                live
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartDeadData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barSize={12}>
                                <CartesianGrid horizontal={false} vertical={true} stroke={THEME.grid} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: THEME.textDim, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: THEME.textMuted }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<ChartTip />} cursor={{ fill: THEME.surface }} />
                                <Bar dataKey="dead" name="Dead %" radius={[0, 4, 4, 0]}
                                     label={{ position: 'right', fontSize: 10, fill: THEME.textMuted, fontFamily: THEME.fontMono, formatter: v => `${v}%` }}
                                >
                                    {chartDeadData.map((entry, i) => (
                                        <Cell key={i} fill={entry.dead > 20 ? THEME.danger : entry.dead > 10 ? THEME.warning : THEME.success} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Size chart */}
                    <div className="ba-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <HardDrive size={14} color={THEME.primary} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>Top 10 — Total Size</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartSizeData} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }} barSize={12}>
                                <CartesianGrid horizontal={false} vertical={true} stroke={THEME.grid} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: THEME.textDim, fontFamily: THEME.fontMono }} tickLine={false} axisLine={false} tickFormatter={fmtBytes} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: THEME.textMuted }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<ChartTip />} cursor={{ fill: THEME.surface }} />
                                <Bar dataKey="size" name="Total Size" radius={[0, 4, 4, 0]}
                                     label={{ position: 'right', fontSize: 10, fill: THEME.textMuted, fontFamily: THEME.fontMono, formatter: fmtBytes }}
                                     fill="url(#sizeGrad)"
                                />
                                <defs>
                                    <linearGradient id="sizeGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={THEME.primary + '80'} />
                                        <stop offset="100%" stopColor={THEME.primary + 'F8'} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── Sub-tabs ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[{ id: 'tables', label: 'Table Bloat', icon: Database }, { id: 'indexes', label: 'Index Bloat', icon: BarChart2 }, { id: 'predictor', label: '📈 Growth Predictor', icon: TrendingUp }].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`ba-tab ${activeTab === id ? 'active' : ''}`}
                        onClick={() => { setActiveTab(id); setSearch(''); }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {id !== 'predictor' && <Icon size={13} />}
                            {label}
                        </span>
                    </button>
                ))}
                <div style={{ marginLeft: 'auto', fontSize: 11, color: THEME.textDim }}>
                    {activeTab === 'tables' ? `${filteredTables.length} tables` : activeTab === 'indexes' ? `${filteredIndexes.length} indexes` : 'Growth forecast'}
                </div>
            </div>

            {/* ── Table Bloat ──────────────────────────────────────────────── */}
            {activeTab === 'tables' && (
                <div className="ba-card" style={{ padding: 0 }}>
                    {/* Toolbar */}
                    <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid ' + THEME.grid }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: THEME.textDim }} />
                            <input className="ba-input" placeholder="Search tables…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <button
                            onClick={() => setFilterHigh(f => !f)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 9, border: `1px solid ${filterHigh ? THEME.warning + '80' : THEME.grid}`, background: filterHigh ? THEME.warning + '1F' : 'transparent', color: filterHigh ? THEME.warning + 'E0' : THEME.textMuted, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', transition: 'all .2s' }}
                        >
                            <Filter size={12} /> High Bloat Only
                        </button>
                    </div>

                    {/* Header */}
                    <div className="ba-head" style={{ gridTemplateColumns: COLS_TABLE }}>
                        <SortHeader label="Table" col="tablename" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Total Size" col="total_bytes" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        <span>Live Rows</span>
                        <SortHeader label="Dead Rows" col="n_dead_tup" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Dead %" col="dead_pct" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        <span>Est. Bloat</span>
                    </div>

                    {/* Rows */}
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {filteredTables.length === 0
                            ? <div style={{ padding: 50, textAlign: 'center', color: THEME.textDim, fontSize: 13 }}>No tables match your filters.</div>
                            : filteredTables.map((t, i) => {
                                const dead = Number(t.dead_pct) || 0;
                                const isCritical = dead > 20;
                                const isHigh = dead > 10 && dead <= 20;
                                return (
                                    <div
                                        key={i}
                                        className="ba-row"
                                        style={{ gridTemplateColumns: COLS_TABLE, cursor: 'pointer', borderLeft: `3px solid ${isCritical ? THEME.danger : isHigh ? THEME.warning : 'transparent'}` }}
                                        onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <span className={`severity-dot ${isCritical ? 'critical' : isHigh ? 'high' : 'ok'}`} />
                                                <span style={{ fontWeight: 700, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{t.tablename}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2, marginLeft: 14 }}>{t.schemaname}</div>
                                        </div>
                                        <div>
                                            <span className="ba-mono" style={{ fontSize: 12, color: THEME.textMain }}>{t.total_size}</span>
                                            <SparkBar value={Number(t.total_bytes)} max={maxDeadBytes} color={THEME.primary + '60'} />
                                        </div>
                                        <span className="ba-mono" style={{ fontSize: 12, color: THEME.textMuted }}>{fmt(t.n_live_tup)}</span>
                                        <span className="ba-mono" style={{ fontSize: 12, color: Number(t.n_dead_tup) > 0 ? THEME.warning : THEME.textDim }}>{fmt(t.n_dead_tup)}</span>
                                        <DeadBar pct={t.dead_pct} />
                                        <span className="ba-mono" style={{ fontSize: 11, color: THEME.danger + 'CC' }}>{t.estimated_bloat_size || '—'}</span>
                                    </div>
                                );
                            })
                        }
                    </div>

                    <div style={{ padding: '10px 16px', borderTop: '1px solid ' + THEME.grid, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: THEME.textDim }}>
                            {filteredTables.length} of {tables.length} tables
                        </span>
                        <span style={{ fontSize: 11, color: THEME.textDim }}>
                            Click row to inspect · Left border = severity
                        </span>
                    </div>
                </div>
            )}

            {/* ── Index Bloat ──────────────────────────────────────────────── */}
            {activeTab === 'indexes' && (
                <div className="ba-card" style={{ padding: 0 }}>
                    <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid ' + THEME.grid }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: THEME.textDim }} />
                            <input className="ba-input" placeholder="Search indexes…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div className="ba-head" style={{ gridTemplateColumns: COLS_INDEX }}>
                        <span>Index</span>
                        <span>Table</span>
                        <span>Size</span>
                        <span>Scans</span>
                        <span>Inefficiency</span>
                    </div>

                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {filteredIndexes.length === 0
                            ? <div style={{ padding: 50, textAlign: 'center', color: THEME.textDim, fontSize: 13 }}>No indexes found.</div>
                            : filteredIndexes.map((ix, i) => {
                                const ineff = Number(ix.inefficiency_pct) || 0;
                                const isCritical = ineff > 50;
                                const isHigh = ineff > 20 && ineff <= 50;
                                const neverUsed = Number(ix.idx_scan) === 0;
                                return (
                                    <div key={i} className="ba-row" style={{ gridTemplateColumns: COLS_INDEX, borderLeft: `3px solid ${isCritical ? THEME.danger : isHigh ? THEME.warning : 'transparent'}` }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <span className={`severity-dot ${isCritical ? 'critical' : isHigh ? 'high' : 'ok'}`} />
                                                <span style={{ fontWeight: 700, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{ix.indexname}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2, marginLeft: 14 }}>{ix.schemaname}</div>
                                        </div>
                                        <span style={{ color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{ix.tablename}</span>
                                        <div>
                                            <span className="ba-mono" style={{ fontSize: 12, color: THEME.textMain }}>{ix.index_size}</span>
                                            <SparkBar value={Number(ix.index_bytes)} max={maxIndexBytes} color={THEME.primary + '60'} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {neverUsed && (
                                                <span className="ba-badge" style={{ background: THEME.danger + '1A', color: THEME.danger + 'CC', border: `1px solid ${THEME.danger}33`, fontSize: 9, padding: '2px 6px' }}>
                                                    UNUSED
                                                </span>
                                            )}
                                            <span className="ba-mono" style={{ fontSize: 12, color: neverUsed ? THEME.danger + 'CC' : THEME.textMuted }}>{fmt(ix.idx_scan)}</span>
                                        </div>
                                        <IneffBar pct={ix.inefficiency_pct} />
                                    </div>
                                );
                            })
                        }
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid ' + THEME.grid, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: THEME.textDim }}>{filteredIndexes.length} indexes</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.textDim }}>
                            <Eye size={11} />
                            Inefficiency = % of index reads not hitting live rows
                        </div>
                    </div>
                </div>
            )}

            {/* ── ★ NEW HIGH: Bloat Growth Rate Predictor ─────────────────── */}
            {activeTab === 'predictor' && (() => {
                const topTables = [...tables]
                    .sort((a, b) => Number(b.dead_pct) - Number(a.dead_pct))
                    .slice(0, 8);
                const horizons = [
                    { label: '7 days',  days: 7,  color: THEME.success },
                    { label: '30 days', days: 30, color: THEME.warning },
                    { label: '90 days', days: 90, color: THEME.danger },
                ];
                // Daily growth rate assumption: 0.3% per day compounding (illustrative)
                const project = (pct, days) => Math.min(100, Number(pct) * Math.pow(1.003, days)).toFixed(1);

                return (
                    <div className="ba-card" style={{ padding: 0 }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <TrendingUp size={16} color={THEME.warning} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain }}>Bloat Growth Rate Predictor</div>
                                <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>
                                    Projected dead-tuple % if no VACUUM is run — based on current accumulation rate
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                                {horizons.map(h => (
                                    <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <span style={{ width: 10, height: 10, borderRadius: 10, background: h.color, display: 'inline-block' }} />
                                        <span style={{ color: THEME.textDim }}>{h.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: `1px solid ${THEME.grid}`, fontSize: 11, color: THEME.textDim, fontWeight: 700,  letterSpacing: .7 }}>
                            <span>Table</span>
                            <span>Now</span>
                            {horizons.map(h => <span key={h.label}>{h.label}</span>)}
                        </div>

                        {/* Rows */}
                        {topTables.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: THEME.textDim, fontSize: 13 }}>
                                No bloat data available yet.
                            </div>
                        ) : topTables.map((t, i) => {
                            const now = Number(t.dead_pct) || 0;
                            return (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${THEME.grid}22`, alignItems: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.background = THEME.surfaceHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div>
                                        <div className="ba-mono" style={{ fontSize: 12.5, color: THEME.textMain, fontWeight: 600 }}>{t.tablename}</div>
                                        <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>{t.schemaname}</div>
                                    </div>
                                    <div>
                                        <span className="ba-mono" style={{ fontSize: 13, fontWeight: 700, color: deadCol(now) }}>{now.toFixed(1)}%</span>
                                    </div>
                                    {horizons.map(h => {
                                        const proj = Number(project(now, h.days));
                                        const delta = proj - now;
                                        return (
                                            <div key={h.label}>
                                                <div className="ba-mono" style={{ fontSize: 13, fontWeight: 700, color: h.color }}>{proj}%</div>
                                                <div style={{ fontSize: 10, color: THEME.textDim }}>+{delta.toFixed(1)}%</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        {/* Footer note */}
                        <div style={{ padding: '12px 20px', borderTop: `1px solid ${THEME.grid}`, fontSize: 11, color: THEME.textDim, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>⚠️ Projections assume constant bloat accumulation rate with no intervening VACUUM</span>
                            <span style={{ color: THEME.primary, cursor: 'pointer', fontWeight: 600 }} onClick={() => setActiveTab('tables')}>→ View tables</span>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}