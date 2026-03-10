import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, CartesianGrid, RadialBarChart, RadialBar, PieChart, Pie, AreaChart, Area, LineChart, Line
} from 'recharts';
import {
    Layers, RefreshCw, AlertTriangle, Database, Activity, Search,
    AlertCircle, Filter, TrendingUp, Zap, Shield, ChevronUp, ChevronDown,
    Eye, ArrowRight, Clock, HardDrive, BarChart2, Cpu, Lock, Users,
    BrainCircuit, Loader2, CheckCircle2, XCircle, Wifi, Server, FileText,
    Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Copy, ChevronRight
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────────────────────────── */
const FilterCtx = createContext({ db: '', schema: '', table: '' });

/* ─────────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#ffffff14;border-radius:4px}
@keyframes ud-spin  {to{transform:rotate(360deg)}}
@keyframes ud-rise  {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes ud-pulse {0%,100%{opacity:1}50%{opacity:.45}}
@keyframes ud-glow  {0%,100%{box-shadow:0 0 0 0 var(--glow)}60%{box-shadow:0 0 0 5px transparent}}
@keyframes ud-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes ud-typewriter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes ai-glow{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.0)}50%{box-shadow:0 0 20px 4px rgba(139,92,246,.18)}}
.ud-rise {animation:ud-rise .32s cubic-bezier(.2,0,0,1) both}
.ud-card {transition:border-color .2s,background .2s,transform .18s,box-shadow .2s}
.ud-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.45)!important}
.ud-navitem{transition:all .16s}
.ud-navitem:hover{background:rgba(255,255,255,.06)!important;color:#fff!important}
.ud-row{transition:background .14s}
.ud-row:hover{background:rgba(255,255,255,.04)!important}
.ud-btn{transition:all .16s;cursor:pointer}
.ud-btn:hover{opacity:.8}
.ai-thinking{background:linear-gradient(90deg,#8b5cf610 25%,#8b5cf630 50%,#8b5cf610 75%);background-size:200% 100%;animation:ud-shimmer 1.6s ease-in-out infinite}
.ai-glow{animation:ai-glow 3s ease-in-out infinite}
.ai-token{animation:ud-typewriter .15s ease both}
button{outline:none;font-family:inherit}
select,option{font-family:inherit}
`;

/* ─────────────────────────────────────────────────────────────────
   DATA HOOK
───────────────────────────────────────────────────────────────── */
const toArr = v => Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : Array.isArray(v?.data) ? v.data : [];
const safeStr = v => {
    if (v === null) return '';
    if (Array.isArray(v)) return v.join(', ');
    const s = String(v);
    if (s.startsWith('{') && s.endsWith('}')) return s.slice(1,-1).replace(/"/g,'').replace(/,/g,', ');
    return s;
};
const safeNum = (v, fb = 0) => { const n = Number(v); return isNaN(n) ? fb : n; };

function useTableData(endpoint, fallback = []) {
    const [data, setData]   = useState(fallback);
    const [loading, setLd]  = useState(true);
    const [error, setErr]   = useState(null);
    const load = useCallback(async () => {
        setLd(true);
        try { const j = await fetchData(endpoint); setData(Array.isArray(fallback) ? toArr(j) : (j ?? fallback)); setErr(null); }
        catch (e) { setErr(e.message); }
        finally { setLd(false); }
    }, [endpoint]);
    useEffect(() => { load(); }, [load]);
    return { data, loading, error, reload: load };
}

const matchFilter = (row, f, { nk = 'name', sk = 'schema', dk = 'db' } = {}) => {
    if (f.db     && row[dk] && row[dk] !== f.db)     return false;
    if (f.schema && row[sk] && row[sk] !== f.schema) return false;
    if (f.table  && row[nk] && row[nk] !== f.table)  return false;
    return true;
};

const fmtB  = b => b >= 1073741824 ? `${(b/1073741824).toFixed(2)} GB` : b >= 1048576 ? `${(b/1048576).toFixed(1)} MB` : b >= 1024 ? `${(b/1024).toFixed(0)} KB` : `${b} B`;
const hClr  = s => s > 70 ? THEME.success : s > 40 ? THEME.warning : THEME.danger;
const dClr  = p => p > 20 ? THEME.danger  : p > 10 ? THEME.warning : THEME.success;
const fmtMs = ms => ms >= 1000 ? `${(ms/1000).toFixed(2)}s` : `${ms}ms`;

/* ─────────────────────────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: THEME.fontMono, color: THEME.textMain }}>
            {label && <div style={{ color: THEME.textDim, marginBottom: 4 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>
            ))}
        </div>
    );
};

const Bar2 = ({ v, max, color, h = 5 }) => {
    const pct = max > 0 ? Math.min(100, (v / max) * 100) : 0;
    return (
        <div style={{ width: '100%', height: h, borderRadius: h, background: `${color}18`, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: h, background: `linear-gradient(90deg,${color}aa,${color})`, transition: 'width .6s cubic-bezier(.2,0,0,1)' }} />
        </div>
    );
};

const StackBar = ({ segs, h = 9 }) => (
    <div style={{ display: 'flex', height: h, borderRadius: h, overflow: 'hidden', background: `${THEME.glassBorder}60` }}>
        {segs.map((s, i) => <div key={i} style={{ width: `${s.pct}%`, background: s.color, flexShrink: 0, transition: 'width .6s' }} />)}
    </div>
);

const HealthRing = ({ score, size = 62 }) => {
    const color = hClr(score);
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <RadialBarChart width={size} height={size} cx={size/2} cy={size/2} innerRadius={size/2-10} outerRadius={size/2-2} data={[{ value: score }]} startAngle={90} endAngle={-270} barSize={6}>
                <RadialBar minAngle={0} background={{ fill: `${color}18` }} dataKey="value" cornerRadius={6} fill={color} />
            </RadialBarChart>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: THEME.fontMono, fontWeight: 700, fontSize: 14, color }}>{score}</span>
            </div>
        </div>
    );
};

const Chip = ({ children, color, size = 'md' }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: size === 'sm' ? '2px 7px' : '3px 10px',
        borderRadius: 5, fontFamily: THEME.fontMono,
        fontSize: size === 'sm' ? 10 : 11, fontWeight: 600,
        background: `${color}1a`, color, border: `1px solid ${color}30`,
        whiteSpace: 'nowrap', letterSpacing: '.01em',
    }}>{children}</span>
);

const Card = ({ children, accent, style = {}, className = '' }) => (
    <div className={`ud-card ${className}`} style={{
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 12,
        overflow: 'hidden',
        ...(accent ? { borderTop: `2px solid ${accent}` } : {}),
        ...style,
    }}>{children}</div>
);

const SecHead = ({ Icon, title, sub, accent, right }) => {
    const ac = accent || THEME.primary;
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${ac}12`, border: `1px solid ${ac}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={ac} strokeWidth={1.8} />
                </div>
                <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: THEME.textMain, letterSpacing: '-.02em' }}>{title}</div>
                    <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 3 }}>{sub}</div>
                </div>
            </div>
            {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{right}</div>}
        </div>
    );
};

const THead = ({ cols, labels }) => (
    <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '9px 18px', gap: 12, borderBottom: `1px solid ${THEME.glassBorder}`, fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: THEME.fontMono, background: `${THEME.primary}06` }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);

const TRow = ({ cols, children, i = 0 }) => (
    <div className="ud-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 18px', gap: 12, borderBottom: `1px solid ${THEME.glassBorder}50`, alignItems: 'center', background: i % 2 !== 0 ? `${THEME.glassBorder}30` : 'transparent' }}>
        {children}
    </div>
);

const Loader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${THEME.primary}30`, borderTopColor: THEME.primary, animation: 'ud-spin 1s linear infinite' }} />
        <span style={{ fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>Loading…</span>
    </div>
);

const ErrUI = ({ msg }) => (
    <div style={{ padding: '14px 18px', borderRadius: 10, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}25`, color: THEME.danger, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={16} />{msg}
    </div>
);

const EmptyUI = ({ msg = 'No data matches the current filters.' }) => (
    <div style={{ padding: 48, textAlign: 'center', color: THEME.textDim }}>
        <div style={{ fontSize: 30, marginBottom: 12, opacity: .4 }}>⊘</div>
        <p style={{ fontSize: 13, fontFamily: THEME.fontMono }}>{msg}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   FILTER SELECT
───────────────────────────────────────────────────────────────── */
const FilterSelect = React.memo(function FilterSelect({ label, filterKey, val, opts, ph, onUpd }) {
    const active = !!val;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 150 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <select
                    value={val}
                    onChange={e => onUpd(filterKey, e.target.value)}
                    disabled={opts.length === 0}
                    style={{
                        width: '100%', padding: '9px 32px 9px 12px', borderRadius: 8,
                        border: `1px solid ${active ? THEME.primary + '55' : THEME.glassBorder}`,
                        background: active ? `${THEME.primary}0c` : THEME.glass,
                        color: active ? THEME.textMain : THEME.textMuted,
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        appearance: 'none', cursor: opts.length === 0 ? 'not-allowed' : 'pointer',
                        outline: 'none', transition: 'border-color .2s, background .2s',
                    }}
                >
                    <option value="">{ph}</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} color={THEME.textDim} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
        </div>
    );
});

/* ─────────────────────────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────────────────────────── */
const FilterBar = React.memo(function FilterBar({ filter, setFilter, allTables, dbRaw }) {
    const tables = allTables || [];
    const dbs = useMemo(() => {
        const a = toArr(dbRaw).map(d => d.name || d).filter(Boolean);
        return a.length ? [...new Set(a)].sort() : [...new Set(tables.map(t => t.db).filter(Boolean))].sort();
    }, [dbRaw, tables]);
    const schemas = useMemo(() =>
            [...new Set(tables.filter(t => !filter.db || t.db === filter.db).map(t => t.schema).filter(Boolean))].sort(),
        [tables, filter.db]);
    const tableList = useMemo(() =>
            [...new Set(tables.filter(t => !filter.db || t.db === filter.db).filter(t => !filter.schema || t.schema === filter.schema).map(t => t.name).filter(Boolean))].sort(),
        [tables, filter.db, filter.schema]);
    const upd = useCallback((k, v) => {
        if (k === 'db')          setFilter({ db: v, schema: '', table: '' });
        else if (k === 'schema') setFilter(f => ({ ...f, schema: v, table: '' }));
        else                     setFilter(f => ({ ...f, table: v }));
    }, [setFilter]);
    const hasFilter = filter.db || filter.schema || filter.table;
    return (
        <div style={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 2 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${THEME.cyan}12`, border: `1px solid ${THEME.cyan}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Filter size={15} color={THEME.cyan} />
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>Filters</div>
                    <div style={{ fontSize: 11, color: THEME.textDim }}>{hasFilter ? `${[filter.db, filter.schema, filter.table].filter(Boolean).length} active` : 'Showing all'}</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                {dbs.length > 0 && <FilterSelect label="Database" filterKey="db" val={filter.db} opts={dbs} ph="All databases" onUpd={upd} />}
                <FilterSelect label="Schema" filterKey="schema" val={filter.schema} opts={schemas} ph="All schemas" onUpd={upd} />
                <FilterSelect label="Table"  filterKey="table"  val={filter.table}  opts={tableList} ph="All tables" onUpd={upd} />
            </div>
            {hasFilter && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 2 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: `${THEME.primary}10`, border: `1px solid ${THEME.primary}25`, fontSize: 12, color: THEME.primary, fontFamily: THEME.fontMono, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[filter.db, filter.schema, filter.table].filter(Boolean).join(' › ')}
                    </div>
                    <button className="ud-btn" onClick={() => setFilter({ db: '', schema: '', table: '' })}
                            style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${THEME.glassBorder}`, background: 'transparent', color: THEME.textDim, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                        ✕ Clear
                    </button>
                </div>
            )}
        </div>
    );
});

/* ─────────────────────────────────────────────────────────────────
   ORIGINAL SECTIONS (kept intact)
───────────────────────────────────────────────────────────────── */
function S_Health() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;
    const chartData = rows.slice(0, 8).map(t => ({ name: t.name, dead: Number(t.deadPct), health: Math.max(0, Math.round(100 - Number(t.deadPct) * 2)) }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Activity} accent={THEME.success} title="Health Scorecard"
                     sub="Per-table health score, dead tuple ratio, and VACUUM recommendations"
                     right={<Chip color={THEME.cyan}>{rows.length} tables</Chip>} />
            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Dead Tuple % Overview</div>
                <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={chartData} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="dead" name="Dead %" radius={[4, 4, 0, 0]}>
                            {chartData.map((d, i) => <Cell key={i} fill={dClr(d.dead)} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
                {rows.map((t, i) => {
                    const dead   = Number(t.deadPct);
                    const health = Math.max(0, Math.round(100 - dead * 2));
                    const color  = hClr(health);
                    const rec    = dead > 20 ? 'VACUUM urgently' : dead > 10 ? 'VACUUM soon' : 'Healthy';
                    return (
                        <Card key={i} accent={color} style={{ padding: 18, animationDelay: `${i * 40}ms` }} className="ud-rise">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                    <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{t.schema}</div>
                                </div>
                                <HealthRing score={health} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 12, color: THEME.textDim }}>Dead tuples</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: dClr(dead), fontWeight: 600 }}>{dead}%</span>
                            </div>
                            <Bar2 v={dead} max={50} color={dClr(dead)} h={4} />
                            <div style={{ marginTop: 12, padding: '5px 10px', borderRadius: 6, background: `${color}0f`, border: `1px solid ${color}20`, fontSize: 11, fontWeight: 600, color }}>
                                → {rec}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S_Activity() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;
    const chartData = rows.slice(0, 8).map(t => ({ name: t.name, seqScans: Number(t.seqScans), idxScans: Number(t.idxScans), inserts: Number(t.inserts) }));
    const metrics = [
        { key: 'seqScans', label: 'Seq Scans', color: THEME.danger },
        { key: 'idxScans', label: 'Idx Scans', color: THEME.success },
        { key: 'inserts',  label: 'Inserts',   color: THEME.primary },
    ];
    const maxes = { seqScans: Math.max(...rows.map(t => Number(t.seqScans)), 1), idxScans: Math.max(...rows.map(t => Number(t.idxScans)), 1), inserts: Math.max(...rows.map(t => Number(t.inserts)), 1) };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={BarChart2} accent={THEME.warning} title="Activity Heatmap" sub="Sequential vs. index scans and DML rates per table" />
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={32} />
                        <Tooltip content={<ChartTip />} />
                        {metrics.map(m => <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color} radius={[3,3,0,0]} />)}
                    </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', paddingTop: 6 }}>
                    {metrics.map(m => (
                        <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{m.label}</span>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <THead cols="160px repeat(3,1fr)" labels={['Table', ...metrics.map(m => m.label)]} />
                {rows.map((t, i) => (
                    <TRow key={i} cols="160px repeat(3,1fr)" i={i}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{t.schema}</div>
                        </div>
                        {metrics.map(m => {
                            const val = Number(t[m.key]);
                            const pct = Math.min(100, (val / maxes[m.key]) * 100);
                            return (
                                <div key={m.key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{val.toLocaleString()}</span>
                                        <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim }}>{pct.toFixed(0)}%</span>
                                    </div>
                                    <Bar2 v={val} max={maxes[m.key]} color={m.color} h={4} />
                                </div>
                            );
                        })}
                    </TRow>
                ))}
            </Card>
        </div>
    );
}

function S_Forecast() {
    const f = useContext(FilterCtx);
    const { data, loading } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    const rows = data.filter(t => matchFilter(t, f)).slice(0, f.table ? 1 : 6);
    if (!rows.length) return <EmptyUI />;
    const chartData = rows.map(t => ({ name: t.name, dead: Number(t.deadPct), threshold: 20 }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={TrendingUp} accent={THEME.danger} title="Dead Tuple Forecast" sub="Predicted autovacuum threshold hits based on current dead tuple accumulation" />
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="32%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="dead" name="Dead %" radius={[4,4,0,0]}>
                            {chartData.map((d, i) => <Cell key={i} fill={dClr(d.dead)} />)}
                        </Bar>
                        <Bar dataKey="threshold" name="Threshold" fill={`${THEME.warning}40`} radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                {rows.map((r, i) => {
                    const dead = Number(r.deadPct);
                    const risk = dead > 20 ? 'Critical' : dead > 10 ? 'High' : 'Normal';
                    const c    = dead > 20 ? THEME.danger : dead > 10 ? THEME.warning : THEME.success;
                    const est  = dead > 20 ? '< 3 days' : dead > 10 ? '~1 week' : '> 30 days';
                    return (
                        <Card key={i} style={{ padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{r.name}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{r.schema}</div>
                                </div>
                                <Chip color={c}>{risk}</Chip>
                            </div>
                            <Bar2 v={dead} max={50} color={c} h={7} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                                <span>0%</span>
                                <span style={{ color: THEME.warning }}>20% threshold</span>
                                <span>50%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '10px 14px', borderRadius: 8, background: `${THEME.glassBorder}40` }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, textTransform: 'uppercase', letterSpacing: '.05em' }}>Current</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: THEME.fontMono, marginTop: 2 }}>{dead}%</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, textTransform: 'uppercase', letterSpacing: '.05em' }}>VACUUM est.</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 2 }}>{est}</div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S_RowCounts() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;
    const maxLive = Math.max(...rows.map(t => Number(t.liveRows ?? t.rows ?? 0)), 1);
    const chartData = rows.slice(0, 8).map(t => ({ name: t.name, live: Number(t.liveRows ?? t.rows ?? 0), dead: Number(t.deadRows ?? 0) }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Database} accent={THEME.primary} title="Row Count Snapshot" sub="Live vs. dead tuple counts from pg_stat_user_tables" />
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="live" name="Live Rows" fill={THEME.success} radius={[3,3,0,0]} />
                        <Bar dataKey="dead" name="Dead Rows" fill={THEME.danger}  radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <THead cols="1.5fr 1.8fr 1fr 1fr" labels={['Table', 'Live Rows', 'Dead Rows', 'Dead Ratio']} />
                {rows.map((t, i) => {
                    const live  = Number(t.liveRows ?? t.rows ?? 0);
                    const dead  = Number(t.deadRows ?? 0);
                    const ratio = live + dead > 0 ? ((dead / (live + dead)) * 100).toFixed(1) : '0.0';
                    const rc    = dClr(Number(ratio));
                    return (
                        <TRow key={i} cols="1.5fr 1.8fr 1fr 1fr" i={i}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{t.schema}</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.success, marginBottom: 5 }}>{live.toLocaleString()}</div>
                                <Bar2 v={live} max={maxLive} color={THEME.success} h={4} />
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: dead > 0 ? THEME.danger : THEME.textDim }}>{dead.toLocaleString()}</span>
                            <Chip color={rc} size="sm">{ratio}%</Chip>
                        </TRow>
                    );
                })}
            </Card>
        </div>
    );
}

function pgArrayToString(val) {
    if (val === null) return '—';
    if (Array.isArray(val)) return val.join(', ') || '—';
    const s = String(val);
    if (s.startsWith('{') && s.endsWith('}')) return s.slice(1, -1).replace(/"/g, '').replace(/,/g, ', ') || '—';
    return s || '—';
}

function S_Columns() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/columns');
    if (loading) return <Loader />;
    if (error) return <ErrUI msg={error} />;
    const normalized = data.map(col => ({
        ...col,
        tablename: col.tablename || col.table_name || col.table || '',
        schema:    col.schema    || col.table_schema || '',
        name:      col.name      || col.column_name  || col.attname || '',
        nullPct:   safeNum(col.nullPct ?? col.null_pct ?? col.null_frac !== null ? (safeNum(col.null_frac) * 100) : 0),
        distinct:  safeNum(col.distinct ?? col.n_distinct ?? col.distinct_count),
        topValues: pgArrayToString(col.topValues ?? col.top_values ?? col.most_common_vals),
        dataType:  col.dataType  || col.data_type || col.typname || '',
    }));
    const rows = normalized.filter(col => {
        const tn = col.tablename || '';
        const cs = col.schema || (tn.includes('.') ? tn.split('.')[0] : null);
        const ct = tn.includes('.') ? tn.split('.')[1] : tn;
        if (f.schema && cs && cs !== f.schema) return false;
        if (f.table  && ct && ct !== f.table)  return false;
        return true;
    });
    if (!rows.length) return <EmptyUI />;
    const nullDist = [
        { name: '0%',    value: rows.filter(c => c.nullPct === 0).length },
        { name: '1–5%',  value: rows.filter(c => c.nullPct > 0 && c.nullPct <= 5).length },
        { name: '5–20%', value: rows.filter(c => c.nullPct > 5 && c.nullPct <= 20).length },
        { name: '>20%',  value: rows.filter(c => c.nullPct > 20).length },
    ];
    const PIE_COLORS = [THEME.success, THEME.primary, THEME.warning, THEME.danger];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Search} accent={THEME.purple} title="Column Stats Explorer"
                     sub="Null percentage, distinct counts, and most common values"
                     right={<Chip color={THEME.purple}>{rows.length} columns</Chip>} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono }}>Null Distribution</div>
                    <PieChart width={140} height={140}>
                        <Pie data={nullDist} cx={65} cy={65} innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                            {nullDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<ChartTip />} />
                    </PieChart>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
                        {nullDist.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                                <span style={{ fontSize: 10, color: THEME.textDim }}>{d.name} ({d.value})</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card style={{ maxHeight: 300, overflowY: 'auto', overflowX: 'auto' }}>
                    <div style={{ minWidth: 580 }}>
                        <THead cols="1.2fr 1.4fr 1fr 1fr 2fr" labels={['Table', 'Column', 'Null %', 'Distinct', 'Top Values']} />
                        {rows.map((col, i) => {
                            const np = col.nullPct.toFixed(1);
                            const nc = col.nullPct > 20 ? THEME.danger : col.nullPct > 5 ? THEME.warning : THEME.success;
                            return (
                                <TRow key={i} cols="1.2fr 1.4fr 1fr 1fr 2fr" i={i}>
                                    <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{col.tablename}</span>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, fontWeight: 600, color: THEME.primary }}>{col.name}</span>
                                    <div>
                                        <div style={{ fontFamily: THEME.fontMono, fontSize: 10, color: nc, fontWeight: 600, marginBottom: 4 }}>{np}%</div>
                                        <Bar2 v={col.nullPct} max={100} color={nc} h={3} />
                                    </div>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textMuted }}>{col.distinct.toLocaleString()}</span>
                                    <span style={{ fontSize: 10, color: THEME.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={col.topValues}>{col.topValues}</span>
                                </TRow>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function S_Toast() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/toast');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = f.table ? data.filter(t => t.table === f.table) : data.filter(t => matchFilter(t, f, { nk: 'table' }));
    if (!rows.length) return <EmptyUI msg="No TOAST data for the selected table." />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Layers} accent={THEME.warning} title="TOAST Table Bloat" sub="Oversized column TOAST storage and dead chunk percentages" />
            <Card>
                <THead cols="1.5fr 1fr 1.5fr" labels={['Main Table', 'TOAST Size', 'Dead Chunk %']} />
                {rows.map((t, i) => {
                    const dead = Number(t.deadPct);
                    const c = dead > 20 ? THEME.danger : dead > 5 ? THEME.warning : THEME.success;
                    return (
                        <TRow key={i} cols="1.5fr 1fr 1.5fr" i={i}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{t.table}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{t.toastTable}</div>
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 13, fontWeight: 600, color: THEME.cyan }}>{t.toastSize}</span>
                            <div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: c, fontWeight: 600, marginBottom: 5 }}>{dead}%</div>
                                <Bar2 v={dead} max={40} color={c} h={4} />
                            </div>
                        </TRow>
                    );
                })}
            </Card>
        </div>
    );
}

function S_Temp() {
    const { data, loading, error } = useTableData('/api/tables/temp');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Clock} accent={THEME.cyan} title="Temp Table Usage" sub="Temporary table sizes and session ages from pg_temp" />
            <Card>
                <THead cols="1.5fr 1fr 1fr 1fr" labels={['App / User', 'PID', 'Temp Size', 'Session Age']} />
                {data.length === 0
                    ? <div style={{ padding: 36, textAlign: 'center', color: THEME.textDim, fontSize: 13 }}>No active temp tables.</div>
                    : data.map((t, i) => (
                        <TRow key={i} cols="1.5fr 1fr 1fr 1fr" i={i}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{t.app || 'Unknown'}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{t.user}</div>
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{t.pid}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 600, color: THEME.warning }}>{t.size}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textDim }}>{t.age_sec}s</span>
                        </TRow>
                    ))
                }
            </Card>
        </div>
    );
}

function S_Schema() {
    const f = useContext(FilterCtx);
    const MOCK = [
        { ts: '2025-02-26', type: 'ALTER TABLE',  obj: 'users',             schema: 'public', detail: 'ADD COLUMN last_login timestamptz',     risk: 'medium' },
        { ts: '2025-02-25', type: 'CREATE INDEX', obj: 'idx_orders_status', schema: 'public', detail: 'CONCURRENTLY ON orders(status)',        risk: 'low' },
        { ts: '2025-02-24', type: 'DROP COLUMN',  obj: 'orders',            schema: 'public', detail: 'removed deprecated field: legacy_ref', risk: 'high' },
    ];
    const rows = MOCK.filter(e => (!f.schema || e.schema === f.schema) && (!f.table || e.obj === f.table));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={HardDrive} accent={THEME.purple} title="Schema Change History" sub="DDL audit log — requires pgAudit extension for live tracking" />
            {!rows.length ? <EmptyUI msg="No DDL events for the selected scope." /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rows.map((e, i) => {
                        const tc = e.risk === 'high' ? THEME.danger : e.risk === 'medium' ? THEME.warning : THEME.success;
                        return (
                            <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: 3, background: tc, flexShrink: 0 }} />
                                    <div style={{ padding: '14px 18px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Chip color={tc} size="sm">{e.type}</Chip>
                                                <span style={{ fontFamily: THEME.fontMono, fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{e.schema}.{e.obj}</span>
                                            </div>
                                            <span style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono }}>{e.ts}</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>{e.detail}</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function toSafeArr(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    const s = String(v).trim();
    if (s.startsWith('{') && s.endsWith('}'))
        return s.slice(1, -1).split(',').map(x => x.trim().replace(/"/g, '')).filter(Boolean);
    if (s.includes(','))
        return s.split(',').map(x => x.trim()).filter(Boolean);
    return s ? [s] : [];
}

function S_Deps() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/dependencies');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const normalized = data.map(t => ({ ...t, refsTo: toSafeArr(t.refsTo), refsBy: toSafeArr(t.refsBy) }));
    const rows = f.table
        ? normalized.filter(t => t.name === f.table || t.refsTo.includes(f.table) || t.refsBy.includes(f.table))
        : normalized.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Zap} accent={THEME.cyan} title="Dependency Map" sub="Foreign key relationships, cascade chains, and drop-impact analysis" />
            <Card>
                <THead cols="1fr 1.5fr 1.5fr" labels={['Table', 'Depends On (FK)', 'Referenced By']} />
                {rows.map((t, i) => (
                    <TRow key={i} cols="1fr 1.5fr 1.5fr" i={i}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: THEME.cyan }}>{t.name}</div>
                            {t.refsBy.length > 2 && <Chip color={THEME.danger} size="sm">Critical</Chip>}
                        </div>
                        <span style={{ fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>{t.refsTo.length ? t.refsTo.join(', ') : '—'}</span>
                        <span style={{ fontSize: 12, color: t.refsBy.length ? THEME.textMuted : THEME.textDim, fontFamily: THEME.fontMono }}>{t.refsBy.length ? t.refsBy.join(', ') : '—'}</span>
                    </TRow>
                ))}
            </Card>
        </div>
    );
}

function S_Write() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f)).filter(t => Number(t.updates) > 0 || Number(t.inserts) > 0).slice(0, 10);
    if (!rows.length) return <EmptyUI msg="No write activity for the selected scope." />;
    const chartData = rows.slice(0, 8).map(t => ({ name: t.name, updates: Number(t.updates), inserts: Number(t.inserts) }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Shield} accent={THEME.warning} title="Write Amplification" sub="HOT update percentage, tuple update vs. insert ratios, WAL impact" />
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="updates" name="Updates" fill={THEME.warning} radius={[3,3,0,0]} />
                        <Bar dataKey="inserts" name="Inserts" fill={THEME.primary} radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <THead cols="1.5fr 1fr 1fr 1.2fr" labels={['Table', 'Updates/hr', 'Inserts/hr', 'HOT %']} />
                {rows.map((w, i) => {
                    const hot = Number(w.hotPct);
                    const c   = hot > 80 ? THEME.success : hot > 30 ? THEME.warning : THEME.danger;
                    return (
                        <TRow key={i} cols="1.5fr 1fr 1fr 1.2fr" i={i}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{w.name}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{w.schema}</div>
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{Number(w.updates).toLocaleString()}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{Number(w.inserts).toLocaleString()}</span>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: c, fontWeight: 600 }}>{hot}%</span>
                                </div>
                                <Bar2 v={hot} max={100} color={c} h={4} />
                                {hot < 30 && Number(w.updates) > 100 && <div style={{ fontSize: 10, color: THEME.danger, marginTop: 4 }}>↓ Lower fillfactor</div>}
                            </div>
                        </TRow>
                    );
                })}
            </Card>
        </div>
    );
}

function S_Indexes() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/indexes');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(ix => (!f.schema || ix.schema === f.schema) && (!f.table || ix.tableName === f.table));
    if (!rows.length) return <EmptyUI msg="No indexes found for the selected table." />;
    const unused = rows.filter(ix => Number(ix.scans ?? 0) === 0);
    const chartData = rows.slice(0, 10).map(ix => ({ name: ix.name?.slice(0, 14) + (ix.name?.length > 14 ? '…' : ''), scans: Number(ix.scans ?? 0) }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Eye} accent={THEME.primary} title="Index Analysis"
                     sub="Usage rates, sizes, scan counts, and unused index detection"
                     right={<div style={{ display: 'flex', gap: 8 }}><Chip color={THEME.primary}>{rows.length} indexes</Chip>{unused.length > 0 && <Chip color={THEME.danger}>{unused.length} unused</Chip>}</div>} />
            {unused.length > 0 && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}25`, fontSize: 13, color: THEME.danger, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={15} />
                    {unused.length} unused index{unused.length > 1 ? 'es' : ''} detected — consuming write overhead with no read benefit.
                </div>
            )}
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={chartData} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 9, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="scans" name="Scans" radius={[3,3,0,0]}>
                            {chartData.map((d, i) => <Cell key={i} fill={d.scans === 0 ? THEME.danger : d.scans < 10 ? THEME.warning : THEME.success} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 780 }}>
                    <THead cols="2fr 1fr 1fr 1fr 1fr 1.2fr" labels={['Index Name', 'Table', 'Type', 'Size', 'Scans', 'Status']} />
                    {rows.map((ix, i) => {
                        const scans = Number(ix.scans ?? 0);
                        const isU = scans === 0;
                        const sc  = isU ? THEME.danger : scans < 10 ? THEME.warning : THEME.success;
                        const sl  = isU ? 'Unused' : scans < 10 ? 'Rare' : 'Active';
                        const sizeMb = ix.sizeBytes ? `${(ix.sizeBytes / 1048576).toFixed(1)} MB` : '—';
                        return (
                            <TRow key={i} cols="2fr 1fr 1fr 1fr 1fr 1.2fr" i={i}>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 11, fontWeight: 600, color: THEME.textMain }}>{ix.name}</div>
                                    {ix.definition && <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }} title={ix.definition}>{ix.definition}</div>}
                                    <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                                        {ix.isPrimary && <Chip color={THEME.purple} size="sm">PK</Chip>}
                                        {ix.isUnique  && <Chip color={THEME.cyan}   size="sm">UQ</Chip>}
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{ix.tableName}</span>
                                <Chip color={THEME.primary} size="sm">{(ix.type || 'btree').toUpperCase()}</Chip>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{ix.size || sizeMb}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 600, color: isU ? THEME.danger : THEME.success }}>{scans.toLocaleString()}</span>
                                <div><Chip color={sc} size="sm">{sl}</Chip>{isU && <div style={{ fontSize: 9, color: THEME.danger, marginTop: 4 }}>→ Consider dropping</div>}</div>
                            </TRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function S_Sizes() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/sizes');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(s => (!f.schema || s.schema === f.schema) && (!f.table || s.name === f.table));
    if (!rows.length) return <EmptyUI msg="No size data for the selected scope." />;
    const chartData = rows.slice(0, 8).map(s => ({ name: s.name, heap: Number(s.heapBytes ?? 0) / 1048576, idx: Number(s.indexBytes ?? 0) / 1048576, toast: Number(s.toastBytes ?? 0) / 1048576 }));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Cpu} accent={THEME.cyan} title="Table Size Breakdown" sub="Heap, index, and TOAST storage split with bloat ratio analysis" />
            <Card style={{ padding: '18px 18px 10px' }}>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={32} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="heap"  name="Heap"    stackId="a" fill={THEME.cyan}    radius={[0,0,0,0]} />
                        <Bar dataKey="idx"   name="Indexes" stackId="a" fill={THEME.purple}  radius={[0,0,0,0]} />
                        <Bar dataKey="toast" name="TOAST"   stackId="a" fill={THEME.warning} radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
                {rows.map((s, i) => {
                    const heap  = Number(s.heapBytes  ?? 0);
                    const idx   = Number(s.indexBytes ?? 0);
                    const toast = Number(s.toastBytes ?? 0);
                    const total = heap + idx + toast || 1;
                    const bloat = Number(s.bloatPct ?? 0);
                    const bc    = bloat > 30 ? THEME.danger : bloat > 15 ? THEME.warning : THEME.success;
                    const segs  = [
                        { label: 'Heap',    bytes: heap,  color: THEME.cyan,    pct: (heap  / total) * 100 },
                        { label: 'Indexes', bytes: idx,   color: THEME.purple,  pct: (idx   / total) * 100 },
                        { label: 'TOAST',   bytes: toast, color: THEME.warning, pct: (toast / total) * 100 },
                    ];
                    return (
                        <Card key={i} style={{ padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain }}>{s.name}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 2 }}>{s.schema} · {fmtB(total)}</div>
                                </div>
                                <Chip color={bc}>Bloat {bloat}%</Chip>
                            </div>
                            <StackBar segs={segs} h={9} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                {segs.map(seg => (
                                    <div key={seg.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color }} />
                                            <span style={{ fontSize: 12, color: THEME.textDim }}>{seg.label}</span>
                                        </div>
                                        <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{fmtB(seg.bytes)}</span>
                                    </div>
                                ))}
                            </div>
                            {bloat > 30 && (
                                <div style={{ marginTop: 12, padding: '7px 10px', borderRadius: 6, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}20`, fontSize: 11, color: THEME.danger }}>
                                    → Consider VACUUM FULL or pg_repack
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ★ SECTION: QUERY PERFORMANCE (pg_stat_statements)
═══════════════════════════════════════════════════════════════ */
function S_QueryPerf() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/queries');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;

    const rows = data.filter(q =>
        (!f.table || (q.query || '').toLowerCase().includes(f.table.toLowerCase()))
    ).slice(0, 20);
    if (!rows.length) return <EmptyUI msg="No query stats. Ensure pg_stat_statements is installed." />;

    const maxMean = Math.max(...rows.map(q => safeNum(q.meanMs ?? q.mean_exec_time)), 1);
    const chartData = rows.slice(0, 8).map(q => ({ name: (q.query || '').slice(0, 16) + '…', calls: safeNum(q.calls), mean: safeNum(q.meanMs ?? q.mean_exec_time) }));
    const totalCalls = rows.reduce((s, q) => s + safeNum(q.calls), 0);
    const slowQueries = rows.filter(q => safeNum(q.meanMs ?? q.mean_exec_time) > 100).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={FileText} accent={THEME.warning} title="Query Performance"
                     sub="Slow queries, call frequency, and execution time from pg_stat_statements"
                     right={<div style={{ display: 'flex', gap: 8 }}>
                         <Chip color={THEME.primary}>{totalCalls.toLocaleString()} calls</Chip>
                         {slowQueries > 0 && <Chip color={THEME.danger}>{slowQueries} slow</Chip>}
                     </div>} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total Queries', val: rows.length, color: THEME.primary },
                    { label: 'Total Calls',   val: totalCalls.toLocaleString(), color: THEME.cyan },
                    { label: 'Slow (>100ms)', val: slowQueries, color: slowQueries > 0 ? THEME.danger : THEME.success },
                    { label: 'Avg Mean Time', val: fmtMs(Math.round(rows.reduce((s,q) => s + safeNum(q.meanMs ?? q.mean_exec_time), 0) / rows.length)), color: THEME.warning },
                ].map((k, i) => (
                    <Card key={i} style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: k.color, fontFamily: THEME.fontMono }}>{k.val}</div>
                        <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>{k.label}</div>
                    </Card>
                ))}
            </div>
            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Call Frequency vs. Mean Exec Time (ms)</div>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 9, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left"  tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={30} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip content={<ChartTip />} />
                        <Bar yAxisId="left"  dataKey="calls" name="Calls"    fill={THEME.primary} radius={[3,3,0,0]} />
                        <Bar yAxisId="right" dataKey="mean"  name="Mean ms"  fill={THEME.warning} radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 800 }}>
                    <THead cols="3fr 1fr 1fr 1fr 1fr 1fr" labels={['Query', 'Calls', 'Mean', 'Max', 'Total Time', 'Rows/Call']} />
                    {rows.map((q, i) => {
                        const mean = safeNum(q.meanMs ?? q.mean_exec_time);
                        const max  = safeNum(q.maxMs  ?? q.max_exec_time);
                        const tot  = safeNum(q.totalMs ?? q.total_exec_time);
                        const rpc  = safeNum(q.calls) > 0 ? (safeNum(q.rows) / safeNum(q.calls)).toFixed(1) : '0';
                        const mc   = mean > 500 ? THEME.danger : mean > 100 ? THEME.warning : THEME.success;
                        const qShort = (q.query || '').replace(/\s+/g, ' ').slice(0, 80);
                        return (
                            <TRow key={i} cols="3fr 1fr 1fr 1fr 1fr 1fr" i={i}>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }} title={q.query}>{qShort}</div>
                                    {mean > 100 && <div style={{ fontSize: 9, color: THEME.danger, marginTop: 3 }}>⚠ Slow query detected</div>}
                                </div>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{safeNum(q.calls).toLocaleString()}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, fontWeight: 600, color: mc }}>{fmtMs(Math.round(mean))}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{fmtMs(Math.round(max))}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{fmtMs(Math.round(tot))}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{rpc}</span>
                            </TRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ★ SECTION: LOCK & CONTENTION MONITOR
═══════════════════════════════════════════════════════════════ */
function S_Locks() {
    const { data, loading, error } = useTableData('/api/tables/locks');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;

    const blocked  = data.filter(l => l.blocked || l.waiting);
    const lockTypes = [...new Set(data.map(l => l.lockType || l.locktype).filter(Boolean))];

    const pieData = lockTypes.map(lt => ({
        name: lt,
        value: data.filter(l => (l.lockType || l.locktype) === lt).length,
    }));
    const PIE_COLORS = [THEME.primary, THEME.cyan, THEME.purple, THEME.warning, THEME.success, THEME.danger];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Lock} accent={THEME.danger} title="Lock & Contention Monitor"
                     sub="Active locks, blocking chains, and deadlock risk from pg_locks"
                     right={<div style={{ display: 'flex', gap: 8 }}>
                         <Chip color={THEME.primary}>{data.length} locks</Chip>
                         {blocked.length > 0 && <Chip color={THEME.danger}>{blocked.length} blocked</Chip>}
                     </div>} />
            {blocked.length > 0 && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}25`, fontSize: 13, color: THEME.danger, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={15} />
                    {blocked.length} session{blocked.length > 1 ? 's are' : ' is'} blocked — potential deadlock or long-running transaction holding locks.
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono }}>Lock Types</div>
                    {pieData.length > 0 ? (
                        <>
                            <PieChart width={140} height={140}>
                                <Pie data={pieData} cx={65} cy={65} innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<ChartTip />} />
                            </PieChart>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
                                {pieData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span style={{ fontSize: 10, color: THEME.textDim }}>{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <EmptyUI msg="No locks detected." />}
                </Card>
                <Card>
                    <THead cols="1fr 1fr 1fr 1fr 1fr" labels={['PID', 'Relation', 'Lock Type', 'Mode', 'Status']} />
                    {data.length === 0
                        ? <div style={{ padding: 36, textAlign: 'center', color: THEME.textDim, fontSize: 13, fontFamily: THEME.fontMono }}>No active locks.</div>
                        : data.slice(0, 12).map((l, i) => {
                            const isBlocked = l.blocked || l.waiting;
                            const sc = isBlocked ? THEME.danger : THEME.success;
                            return (
                                <TRow key={i} cols="1fr 1fr 1fr 1fr 1fr" i={i}>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{l.pid}</span>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{l.relation || l.relname || '—'}</span>
                                    <Chip color={THEME.primary} size="sm">{(l.lockType || l.locktype || 'relation').slice(0, 10)}</Chip>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim }}>{(l.mode || '').replace('Lock', '')}</span>
                                    <Chip color={sc} size="sm">{isBlocked ? 'Blocked' : 'Granted'}</Chip>
                                </TRow>
                            );
                        })
                    }
                </Card>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ★ SECTION: AUTOVACUUM TRACKER
═══════════════════════════════════════════════════════════════ */
function S_Autovacuum() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/autovacuum');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;

    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI msg="No autovacuum data. Check pg_stat_user_tables." />;

    const neverVacuumed = rows.filter(t => !t.lastVacuum && !t.lastAutovacuum).length;
    const overdue = rows.filter(t => {
        const last = t.lastAutovacuum || t.lastVacuum;
        if (!last) return true;
        const daysAgo = (Date.now() - new Date(last).getTime()) / 86400000;
        return daysAgo > 7;
    }).length;

    const chartData = rows.slice(0, 8).map(t => ({
        name: t.name,
        vacuumCount:  safeNum(t.vacuumCount  ?? t.vacuum_count),
        analyzeCount: safeNum(t.analyzeCount ?? t.analyze_count),
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={RefreshCw} accent={THEME.success} title="Autovacuum Tracker"
                     sub="Last vacuum/analyze timestamps, daemon run counts, and overdue tables"
                     right={<div style={{ display: 'flex', gap: 8 }}>
                         {neverVacuumed > 0 && <Chip color={THEME.danger}>{neverVacuumed} never vacuumed</Chip>}
                         {overdue > 0 && <Chip color={THEME.warning}>{overdue} overdue</Chip>}
                     </div>} />
            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Vacuum & Analyze Run Counts</div>
                <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={chartData} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={`${THEME.glassBorder}60`} />
                        <XAxis dataKey="name" tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: THEME.textDim, fontSize: 10, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="vacuumCount"  name="Vacuum"  fill={THEME.success} radius={[3,3,0,0]} />
                        <Bar dataKey="analyzeCount" name="Analyze" fill={THEME.cyan}    radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <THead cols="1.5fr 1fr 1fr 1fr 1fr 1fr" labels={['Table', 'Last Vacuum', 'Last Analyze', 'V Count', 'A Count', 'Status']} />
                {rows.map((t, i) => {
                    const last = t.lastAutovacuum || t.lastVacuum;
                    const daysAgo = last ? ((Date.now() - new Date(last).getTime()) / 86400000) : 999;
                    const sc = daysAgo > 7 ? THEME.danger : daysAgo > 3 ? THEME.warning : THEME.success;
                    const sl = !last ? 'Never' : daysAgo > 7 ? 'Overdue' : 'Recent';
                    const fmt = d => d ? new Date(d).toLocaleDateString() : '—';
                    return (
                        <TRow key={i} cols="1.5fr 1fr 1fr 1fr 1fr 1fr" i={i}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textMain }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{t.schema}</div>
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim }}>{fmt(t.lastVacuum || t.lastAutovacuum)}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim }}>{fmt(t.lastAnalyze || t.lastAutoanalyze)}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.success }}>{safeNum(t.vacuumCount ?? t.vacuum_count)}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.cyan }}>{safeNum(t.analyzeCount ?? t.analyze_count)}</span>
                            <Chip color={sc} size="sm">{sl}</Chip>
                        </TRow>
                    );
                })}
            </Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ★ SECTION: CONNECTION POOL STATS
═══════════════════════════════════════════════════════════════ */
function S_Connections() {
    const { data: raw, loading, error } = useTableData('/api/tables/connections');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;

    const data = Array.isArray(raw) ? raw : [];
    const total   = data.reduce((s, c) => s + safeNum(c.count ?? c.total), 0);
    const active  = data.filter(c => (c.state || '').toLowerCase() === 'active').reduce((s,c) => s + safeNum(c.count ?? c.total), 0);
    const idle    = data.filter(c => (c.state || '').toLowerCase().includes('idle')).reduce((s,c) => s + safeNum(c.count ?? c.total), 0);
    const waiting = data.filter(c => (c.state || '').toLowerCase().includes('wait')).reduce((s,c) => s + safeNum(c.count ?? c.total), 0);

    const stateGroups = [...new Set(data.map(c => c.state).filter(Boolean))];
    const chartData = stateGroups.map(s => ({ name: s, count: data.filter(c => c.state === s).reduce((sum, c) => sum + safeNum(c.count ?? c.total), 0) }));
    const PIE_COLORS = [THEME.success, THEME.warning, THEME.danger, THEME.primary, THEME.cyan, THEME.purple];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Users} accent={THEME.cyan} title="Connection Pool Stats"
                     sub="Active, idle, and waiting connections from pg_stat_activity"
                     right={<Chip color={total > 80 ? THEME.danger : THEME.primary}>{total} total</Chip>} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total',   val: total,   color: THEME.primary },
                    { label: 'Active',  val: active,  color: THEME.success },
                    { label: 'Idle',    val: idle,    color: THEME.warning },
                    { label: 'Waiting', val: waiting, color: waiting > 0 ? THEME.danger : THEME.textDim },
                ].map((k, i) => (
                    <Card key={i} style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: k.color, fontFamily: THEME.fontMono }}>{k.val}</div>
                        <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>{k.label} connections</div>
                        <Bar2 v={k.val} max={total || 1} color={k.color} h={3} />
                    </Card>
                ))}
            </div>
            {total > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                    <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono }}>By State</div>
                        <PieChart width={140} height={140}>
                            <Pie data={chartData} cx={65} cy={65} innerRadius={38} outerRadius={60} dataKey="count" paddingAngle={3}>
                                {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<ChartTip />} />
                        </PieChart>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
                            {chartData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span style={{ fontSize: 10, color: THEME.textDim }}>{d.name} ({d.count})</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <THead cols="1fr 1fr 1fr 1fr" labels={['App', 'User', 'DB', 'Count']} />
                        {data.slice(0, 10).map((c, i) => {
                            const cnt = safeNum(c.count ?? c.total);
                            const sc  = (c.state || '').includes('active') ? THEME.success : (c.state || '').includes('idle') ? THEME.warning : THEME.textDim;
                            return (
                                <TRow key={i} cols="1fr 1fr 1fr 1fr" i={i}>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{c.appName || c.application_name || '—'}</span>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{c.useName || c.user || '—'}</span>
                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{c.datName || c.db || '—'}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: sc }}>{cnt}</span>
                                        <Chip color={sc} size="sm">{c.state || '—'}</Chip>
                                    </div>
                                </TRow>
                            );
                        })}
                    </Card>
                </div>
            )}
            {total === 0 && <EmptyUI msg="No connection data. Check pg_stat_activity access." />}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ★ SECTION: AI DEEP ANALYSIS  (Claude-powered)
   FIX: robust JSON parsing + max_tokens bumped to 2000
═══════════════════════════════════════════════════════════════ */

const SeverityBadge = ({ level }) => {
    const map = {
        critical: { color: THEME.danger,  icon: '🔴', label: 'Critical' },
        warning:  { color: THEME.warning, icon: '🟡', label: 'Warning'  },
        info:     { color: THEME.primary, icon: '🔵', label: 'Info'     },
        success:  { color: THEME.success, icon: '🟢', label: 'Healthy'  },
    };
    const m = map[level] || map.info;
    return <Chip color={m.color}>{m.icon} {m.label}</Chip>;
};

const FindingCard = ({ finding, delay = 0 }) => {
    const [open, setOpen] = useState(false);
    const sevColor = finding.severity === 'critical' ? THEME.danger
        : finding.severity === 'warning'  ? THEME.warning
            : finding.severity === 'info'      ? THEME.primary
                : THEME.success;
    return (
        <Card accent={sevColor} style={{ padding: 0, overflow: 'hidden', animationDelay: `${delay}ms` }} className="ud-rise">
            <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '14px 18px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <SeverityBadge level={finding.severity} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>{finding.title}</div>
                            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono }}>{finding.category} · {finding.table || 'Global'}</div>
                        </div>
                    </div>
                    <ChevronDown size={14} color={THEME.textDim} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                </div>
            </button>
            {open && (
                <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${THEME.glassBorder}` }}>
                    <p style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.7, marginTop: 12 }}>{finding.description}</p>
                    {finding.impact && (
                        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: `${THEME.warning}0d`, border: `1px solid ${THEME.warning}20` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.warning, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Impact</div>
                            <p style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>{finding.impact}</p>
                        </div>
                    )}
                    {finding.recommendation && (
                        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: `${THEME.success}0d`, border: `1px solid ${THEME.success}20` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.success, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Recommendation</div>
                            <p style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>{finding.recommendation}</p>
                        </div>
                    )}
                    {finding.sql && (
                        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: `${THEME.glassBorder}60`, border: `1px solid ${THEME.glassBorder}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.cyan, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>SQL Fix</div>
                            <pre style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{finding.sql}</pre>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

const AskBox = ({ onAsk, disabled }) => {
    const [val, setVal] = useState('');
    const presets = [
        'What indexes should I add?',
        'Why is my VACUUM not running?',
        'Which tables risk data loss?',
        'Explain the HOT update issue',
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {presets.map((p, i) => (
                    <button key={i} onClick={() => onAsk(p)} disabled={disabled}
                            className="ud-btn"
                            style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${THEME.purple}30`, background: `${THEME.purple}0d`, color: THEME.purple, fontSize: 11, fontWeight: 600 }}>
                        {p}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onAsk(val.trim()); setVal(''); } }}
                    placeholder="Ask a follow-up question about your database…"
                    disabled={disabled}
                    style={{
                        flex: 1, padding: '10px 14px', borderRadius: 8,
                        border: `1px solid ${THEME.glassBorder}`, background: THEME.glass,
                        color: THEME.textMain, fontSize: 13, fontFamily: THEME.fontMono,
                        outline: 'none', transition: 'border-color .2s',
                    }}
                    onFocus={e => e.target.style.borderColor = `${THEME.purple}55`}
                    onBlur={e => e.target.style.borderColor = THEME.glassBorder}
                />
                <button onClick={() => { if (val.trim()) { onAsk(val.trim()); setVal(''); } }}
                        disabled={disabled || !val.trim()} className="ud-btn"
                        style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: THEME.purple, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: (!val.trim() || disabled) ? .5 : 1 }}>
                    <Sparkles size={14} /> Ask
                </button>
            </div>
        </div>
    );
};

// ── Robust JSON extractor ──────────────────────────────────────
function extractJSON(text) {
    // Strip markdown fences
    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find the outermost { ... } block
    const start = stripped.indexOf('{');
    const end   = stripped.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error(`No JSON object found in response. Preview: ${stripped.slice(0, 200)}`);
    }
    return JSON.parse(stripped.slice(start, end + 1));
}

function S_AIAnalysis() {
    const f = useContext(FilterCtx);
    const { data: statsData }  = useTableData('/api/tables/stats');
    const { data: indexData }  = useTableData('/api/tables/indexes');
    const { data: sizeData }   = useTableData('/api/tables/sizes');

    const [findings,    setFindings]    = useState([]);
    const [summary,     setSummary]     = useState('');
    const [chatLog,     setChatLog]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [error,       setError]       = useState(null);
    const [activeTab,   setActiveTab]   = useState('findings');
    const [score,       setScore]       = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);

    const buildSnapshot = useCallback(() => {
        const tables  = (statsData || []).filter(t => matchFilter(t, f)).slice(0, 12);
        const indexes = (indexData || []).filter(ix => (!f.schema || ix.schema === f.schema) && (!f.table || ix.tableName === f.table)).slice(0, 20);
        const sizes   = (sizeData  || []).filter(s  => (!f.schema || s.schema === f.schema)  && (!f.table || s.name === f.table)).slice(0, 12);
        return {
            scope: f.table || f.schema || 'global',
            tables: tables.map(t => ({
                name: t.name, schema: t.schema,
                liveRows: safeNum(t.liveRows ?? t.rows ?? 0),
                deadPct:  safeNum(t.deadPct),
                seqScans: safeNum(t.seqScans),
                idxScans: safeNum(t.idxScans),
                updates:  safeNum(t.updates),
                inserts:  safeNum(t.inserts),
                hotPct:   safeNum(t.hotPct),
            })),
            indexes: indexes.map(ix => ({
                name: ix.name, table: ix.tableName,
                type: ix.type || 'btree',
                scans: safeNum(ix.scans ?? 0),
                sizeBytes: safeNum(ix.sizeBytes ?? 0),
                isPrimary: ix.isPrimary, isUnique: ix.isUnique,
            })),
            sizes: sizes.map(s => ({
                name: s.name, schema: s.schema,
                heapBytes: safeNum(s.heapBytes), indexBytes: safeNum(s.indexBytes),
                toastBytes: safeNum(s.toastBytes), bloatPct: safeNum(s.bloatPct),
            })),
        };
    }, [statsData, indexData, sizeData, f]);

    const runAnalysis = useCallback(async () => {
        setLoading(true);
        setError(null);
        setFindings([]);
        setSummary('');
        setScore(null);
        try {
            const snapshot = buildSnapshot();
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true',
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000, // ← bumped from 1000 to prevent truncated JSON
                    system: `You are an expert PostgreSQL DBA analyst. Analyze database telemetry and return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON.

Return this exact structure:
{
  "overallScore": <integer 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "findings": [
    {
      "title": "<short finding title>",
      "severity": "<critical|warning|info|success>",
      "category": "<Performance|Bloat|Indexes|Schema|Connections|Security>",
      "table": "<table name or null>",
      "description": "<detailed explanation, 2-4 sentences>",
      "impact": "<what happens if not addressed>",
      "recommendation": "<specific actionable fix>",
      "sql": "<optional SQL fix, or null>"
    }
  ]
}

Rules:
- severity "critical" = immediate action needed
- severity "warning" = should fix soon
- severity "info" = awareness only
- severity "success" = good practice noted
- Generate 4-8 findings minimum
- SQL must be valid PostgreSQL
- Be specific with table names from the data`,
                    messages: [{
                        role: 'user',
                        content: `Analyze this PostgreSQL database snapshot and return findings JSON:\n\n${JSON.stringify(snapshot, null, 2)}`,
                    }],
                }),
            });

            const apiResp = await response.json();

            // Surface API-level errors (auth, quota, etc.) immediately
            if (apiResp.error) {
                throw new Error(apiResp.error.message || JSON.stringify(apiResp.error));
            }

            const rawText = (apiResp.content || []).map(c => c.text || '').join('');
            const parsed  = extractJSON(rawText); // robust extraction

            setFindings(parsed.findings || []);
            setSummary(parsed.summary   || '');
            setScore(parsed.overallScore ?? null);
            setChatLog([{
                role: 'assistant',
                content: `Analysis complete. Overall health score: ${parsed.overallScore}/100. ${parsed.summary}`,
            }]);
        } catch (e) {
            setError(`AI analysis failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [buildSnapshot]);

    const askFollowUp = useCallback(async (question) => {
        if (!summary) return;
        setChatLoading(true);
        setChatLog(l => [...l, { role: 'user', content: question }]);
        try {
            const snapshot = buildSnapshot();
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true',
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: `You are an expert PostgreSQL DBA. Answer questions about the provided database telemetry. Be concise, technical, and actionable. Use plain text — no markdown headers. Include SQL examples where relevant.`,
                    messages: [{
                        role: 'user',
                        content: `Database snapshot:\n${JSON.stringify(snapshot, null, 2)}\n\nPrevious analysis summary: ${summary}\n\nQuestion: ${question}`,
                    }],
                }),
            });
            const apiResp = await response.json();
            if (apiResp.error) throw new Error(apiResp.error.message || JSON.stringify(apiResp.error));
            const text = (apiResp.content || []).map(c => c.text || '').join('') || 'No response.';
            setChatLog(l => [...l, { role: 'assistant', content: text }]);
        } catch (e) {
            setChatLog(l => [...l, { role: 'assistant', content: `Error: ${e.message}` }]);
        } finally {
            setChatLoading(false);
        }
    }, [summary, buildSnapshot]);

    const criticals   = findings.filter(f => f.severity === 'critical').length;
    const warnings    = findings.filter(f => f.severity === 'warning').length;
    const scoreColor  = score === null ? THEME.textDim : score >= 75 ? THEME.success : score >= 50 ? THEME.warning : THEME.danger;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={BrainCircuit} accent={THEME.purple} title="AI Deep Analysis"
                     sub="Claude-powered PostgreSQL diagnostics with actionable findings and follow-up Q&A"
                     right={
                         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                             {score !== null && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: `${scoreColor}15`, border: `1px solid ${scoreColor}30` }}>
                                     <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>Health</span>
                                     <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor, fontFamily: THEME.fontMono }}>{score}</span>
                                 </div>
                             )}
                             <button onClick={runAnalysis} disabled={loading} className="ud-btn ai-glow"
                                     style={{
                                         padding: '9px 18px', borderRadius: 9,
                                         border: `1px solid ${THEME.purple}40`,
                                         background: loading ? `${THEME.purple}15` : `linear-gradient(135deg, ${THEME.purple}25, ${THEME.purple}10)`,
                                         color: THEME.purple, fontSize: 13, fontWeight: 700,
                                         display: 'flex', alignItems: 'center', gap: 7,
                                         cursor: loading ? 'not-allowed' : 'pointer',
                                     }}>
                                 {loading
                                     ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${THEME.purple}40`, borderTopColor: THEME.purple, animation: 'ud-spin 1s linear infinite' }} /> Analyzing…</>
                                     : <><Sparkles size={14} /> {findings.length > 0 ? 'Re-analyze' : 'Run AI Analysis'}</>
                                 }
                             </button>
                         </div>
                     } />

            {/* Idle state */}
            {!loading && findings.length === 0 && !error && (
                <Card className="ai-glow" style={{ padding: 48, textAlign: 'center', border: `1px dashed ${THEME.purple}40`, background: `${THEME.purple}05` }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>AI-Powered Database Analysis</div>
                    <div style={{ fontSize: 13, color: THEME.textDim, maxWidth: 480, margin: '0 auto', lineHeight: 1.7, marginBottom: 24 }}>
                        Claude will analyze your live database telemetry — including table health, index efficiency, bloat, write patterns, and more — then generate prioritized findings with SQL fixes.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                        {['Dead tuple analysis', 'Index efficiency', 'Write amplification', 'VACUUM scheduling', 'Bloat estimation', 'Schema risks'].map((feat, i) => (
                            <div key={i} style={{ padding: '5px 12px', borderRadius: 20, background: `${THEME.purple}10`, border: `1px solid ${THEME.purple}20`, fontSize: 11, color: THEME.purple, fontFamily: THEME.fontMono }}>{feat}</div>
                        ))}
                    </div>
                    <button onClick={runAnalysis} className="ud-btn"
                            style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${THEME.purple}, ${THEME.primary})`, color: '#fff', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={16} /> Run Deep Analysis
                    </button>
                </Card>
            )}

            {/* Loading shimmer */}
            {loading && (
                <Card style={{ padding: 32, border: `1px solid ${THEME.purple}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${THEME.purple}30`, borderTopColor: THEME.purple, animation: 'ud-spin 1s linear infinite', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain }}>Running deep analysis…</div>
                            <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 3 }}>Claude is examining table stats, indexes, write patterns, and bloat data</div>
                        </div>
                    </div>
                    {['Scanning table health metrics', 'Analysing index usage patterns', 'Computing write amplification', 'Evaluating bloat thresholds', 'Generating prioritized findings'].map((step, i) => (
                        <div key={i} className="ai-thinking" style={{ height: 14, borderRadius: 7, marginBottom: 8, width: `${60 + (i * 7)}%`, opacity: .7 }} />
                    ))}
                </Card>
            )}

            {error && <ErrUI msg={error} />}

            {/* Results */}
            {!loading && findings.length > 0 && (
                <>
                    {summary && (
                        <Card style={{ padding: '16px 20px', borderLeft: `3px solid ${THEME.purple}`, background: `${THEME.purple}06` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.purple, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono, marginBottom: 6 }}>Executive Summary</div>
                                    <p style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.7 }}>{summary}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                                    {criticals > 0 && <Chip color={THEME.danger}>{criticals} critical</Chip>}
                                    {warnings  > 0 && <Chip color={THEME.warning}>{warnings} warnings</Chip>}
                                    <Chip color={THEME.success}>{findings.filter(f => f.severity === 'success').length} healthy</Chip>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: `${THEME.glassBorder}60`, width: 'fit-content' }}>
                        {[
                            { id: 'findings', label: `Findings (${findings.length})`, Icon: AlertCircle },
                            { id: 'chat',     label: 'Ask Claude',                    Icon: MessageSquare },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        background: activeTab === tab.id ? THEME.glass : 'transparent',
                                        color: activeTab === tab.id ? THEME.textMain : THEME.textDim,
                                        fontWeight: activeTab === tab.id ? 700 : 500,
                                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                                        boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,.2)' : 'none',
                                        transition: 'all .16s',
                                    }}>
                                <tab.Icon size={13} />{tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'findings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {['critical', 'warning', 'info', 'success'].map(sev => {
                                const group = findings.filter(f => f.severity === sev);
                                if (!group.length) return null;
                                const sevColor = sev === 'critical' ? THEME.danger : sev === 'warning' ? THEME.warning : sev === 'info' ? THEME.primary : THEME.success;
                                return (
                                    <div key={sev}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
                                            <div style={{ height: 1, flex: 1, background: `${sevColor}25` }} />
                                            <SeverityBadge level={sev} />
                                            <div style={{ height: 1, flex: 1, background: `${sevColor}25` }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {group.map((finding, i) => <FindingCard key={i} finding={finding} delay={i * 50} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Card style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ maxHeight: 400, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {chatLog.map((msg, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                background: msg.role === 'user' ? `${THEME.primary}30` : `${THEME.purple}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                                            }}>
                                                {msg.role === 'user' ? '👤' : '🧠'}
                                            </div>
                                            <div style={{
                                                maxWidth: '78%', padding: '10px 14px',
                                                borderRadius: msg.role === 'user' ? '14px 2px 14px 14px' : '2px 14px 14px 14px',
                                                background: msg.role === 'user' ? `${THEME.primary}15` : `${THEME.purple}10`,
                                                border: `1px solid ${msg.role === 'user' ? THEME.primary : THEME.purple}25`,
                                                fontSize: 13, color: THEME.textMuted, lineHeight: 1.7,
                                                fontFamily: msg.role === 'assistant' ? 'inherit' : THEME.fontMono,
                                                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${THEME.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🧠</div>
                                            <div style={{ padding: '12px 16px', borderRadius: '2px 14px 14px 14px', background: `${THEME.purple}10`, border: `1px solid ${THEME.purple}25` }}>
                                                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                                    {[0, 1, 2].map(j => (
                                                        <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.purple, animation: `ud-pulse 1.2s ease ${j * 0.2}s infinite` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </Card>
                            <AskBox onAsk={askFollowUp} disabled={chatLoading} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   NAV REGISTRY
───────────────────────────────────────────────────────────────── */
const GROUPS = [
    {
        id: 'health', label: 'Health', Icon: Activity, color: () => THEME.success,
        items: [
            { id: 'scorecard',  label: 'Health Scorecard', Icon: Activity,   sub: 'VACUUM & health rings',  component: S_Health },
            { id: 'activity',   label: 'Activity Heatmap', Icon: BarChart2,  sub: 'Scans & DML rates',      component: S_Activity },
            { id: 'forecast',   label: 'Forecast',         Icon: TrendingUp, sub: 'Dead tuple projection',  component: S_Forecast },
            { id: 'rows',       label: 'Row Counts',       Icon: Database,   sub: 'Live vs dead tuples',    component: S_RowCounts },
            { id: 'autovacuum', label: 'Autovacuum',       Icon: RefreshCw,  sub: 'Daemon run tracker',     component: S_Autovacuum },
        ],
    },
    {
        id: 'diagnostics', label: 'Diagnostics', Icon: Search, color: () => THEME.warning,
        items: [
            { id: 'columns',   label: 'Column Stats',  Icon: Search,   sub: 'Null % & distinct values',   component: S_Columns },
            { id: 'toast',     label: 'TOAST Bloat',   Icon: Layers,   sub: 'Oversized columns',          component: S_Toast },
            { id: 'temp',      label: 'Temp Tables',   Icon: Clock,    sub: 'Session temp usage',         component: S_Temp,        hideWhenTable: true },
            { id: 'queryPerf', label: 'Query Perf',    Icon: FileText, sub: 'pg_stat_statements',         component: S_QueryPerf },
            { id: 'locks',     label: 'Lock Monitor',  Icon: Lock,     sub: 'Blocking chains & deadlocks',component: S_Locks },
            { id: 'conns',     label: 'Connections',   Icon: Users,    sub: 'Pool & pg_stat_activity',    component: S_Connections, hideWhenTable: true },
        ],
    },
    {
        id: 'architecture', label: 'Architecture', Icon: Zap, color: () => THEME.cyan,
        items: [
            { id: 'schema', label: 'Schema History', Icon: HardDrive, sub: 'DDL timeline',         component: S_Schema },
            { id: 'deps',   label: 'Dependencies',   Icon: Zap,       sub: 'FK chains & cascades', component: S_Deps },
            { id: 'write',  label: 'Write Amp',      Icon: Shield,    sub: 'HOT updates & WAL',    component: S_Write },
        ],
    },
    {
        id: 'table', label: 'Table Details', Icon: Eye, color: () => THEME.primary, tableOnly: true,
        items: [
            { id: 'indexes', label: 'Index Analysis', Icon: Eye, sub: 'Usage & unused detection', component: S_Indexes, tableOnly: true },
            { id: 'sizes',   label: 'Size Breakdown', Icon: Cpu, sub: 'Heap / index / TOAST',     component: S_Sizes,   tableOnly: true },
        ],
    },
    {
        id: 'ai', label: 'AI Intelligence', Icon: BrainCircuit, color: () => THEME.purple,
        items: [
            { id: 'ai-analysis', label: 'AI Deep Analysis', Icon: BrainCircuit, sub: 'Claude-powered diagnostics', component: S_AIAnalysis },
        ],
    },
];

/* ─────────────────────────────────────────────────────────────────
   LIVE CLOCK
───────────────────────────────────────────────────────────────── */
const LiveClock = React.memo(function LiveClock() {
    const [tick, setTick] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setTick(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim }}>
            {tick.toTimeString().slice(0, 8)}
        </span>
    );
});

/* ─────────────────────────────────────────────────────────────────
   MAIN SHELL
───────────────────────────────────────────────────────────────── */
export default function UnifiedDashboard() {
    useAdaptiveTheme();
    const [filter, setFilter]       = useState({ db: '', schema: '', table: '' });
    const [activeId, setActiveId]   = useState('scorecard');
    const [collapsed, setCollapsed] = useState({});

    const { data: allTables } = useTableData('/api/tables/stats');
    const { data: dbRaw }     = useTableData('/api/databases');

    const handleFilter = useCallback(v => {
        setFilter(p => typeof v === 'function' ? v(p) : v);
        setActiveId('scorecard');
    }, []);

    const visibleGroups = GROUPS.map(g => ({
        ...g,
        items: g.items.filter(s => {
            if (s.tableOnly)     return !!filter.table;
            if (s.hideWhenTable) return !filter.table;
            return true;
        }),
    })).filter(g => (!g.tableOnly || !!filter.table) && g.items.length > 0);

    const allItems    = visibleGroups.flatMap(g => g.items);
    const activeItem  = allItems.find(s => s.id === activeId) || allItems[0];
    const Preview     = activeItem?.component;
    const activeGroup = visibleGroups.find(g => g.items.some(s => s.id === activeItem?.id));

    const toggleGroup = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

    return (
        <FilterCtx.Provider value={filter}>
            <style>{CSS}</style>
            <div style={{ display: 'flex', height: '100%', width: '100%', background: THEME.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif", color: THEME.textMain, overflow: 'hidden' }}>

                {/* ── SIDEBAR ─────────────────────────────────── */}
                <aside style={{ width: 244, flexShrink: 0, background: THEME.surface, borderRight: `1px solid ${THEME.glassBorder}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${THEME.primary}20`, border: `1px solid ${THEME.primary}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🐘</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, letterSpacing: '-.03em' }}>TableScope</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>Analytics Dashboard</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '9px 14px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 5px ${THEME.success}`, animation: 'ud-pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, color: THEME.textMuted }}>Live data</span>
                        </div>
                        <LiveClock />
                    </div>

                    {(filter.schema || filter.table) && (
                        <div style={{ margin: '10px 12px 0', padding: '8px 12px', borderRadius: 8, background: `${THEME.primary}0f`, border: `1px solid ${THEME.primary}22` }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: THEME.primary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono, marginBottom: 4 }}>Scope</div>
                            {filter.schema && <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{filter.schema}</div>}
                            {filter.table  && <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, fontFamily: THEME.fontMono, marginTop: 2 }}>{filter.table}</div>}
                        </div>
                    )}

                    <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
                        {visibleGroups.map(g => {
                            const gColor = g.color();
                            const isOpen = !collapsed[g.id];
                            const isAI   = g.id === 'ai';
                            return (
                                <div key={g.id}>
                                    <button onClick={() => toggleGroup(g.id)}
                                            style={{ width: '100%', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isAI ? `${THEME.purple}06` : 'transparent', border: 'none', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <g.Icon size={11} color={gColor} />
                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: gColor, fontFamily: THEME.fontMono }}>{g.label}</span>
                                            {isAI && <span style={{ fontSize: 8, fontWeight: 700, color: THEME.purple, background: `${THEME.purple}20`, padding: '1px 5px', borderRadius: 3, letterSpacing: '.04em' }}>NEW</span>}
                                        </div>
                                        <ChevronDown size={11} color={THEME.textDim} style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                                    </button>

                                    {isOpen && g.items.map(s => {
                                        const isActive  = activeItem?.id === s.id;
                                        const isNewItem = ['queryPerf','locks','conns','autovacuum','ai-analysis'].includes(s.id);
                                        return (
                                            <button key={s.id} onClick={() => setActiveId(s.id)} className={isActive ? '' : 'ud-navitem'}
                                                    style={{
                                                        width: '100%', padding: '8px 14px 8px 30px',
                                                        display: 'flex', alignItems: 'center', gap: 10,
                                                        background: isActive ? `${gColor}14` : 'transparent',
                                                        border: 'none', cursor: 'pointer',
                                                        borderLeft: `3px solid ${isActive ? gColor : 'transparent'}`,
                                                        transition: 'all .16s',
                                                    }}>
                                                <s.Icon size={13} color={isActive ? gColor : THEME.textDim} strokeWidth={isActive ? 2 : 1.5} />
                                                <div style={{ textAlign: 'left', flex: 1 }}>
                                                    <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? THEME.textMain : THEME.textMuted, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {s.label}
                                                        {isNewItem && <span style={{ fontSize: 8, fontWeight: 700, color: gColor, background: `${gColor}20`, padding: '1px 4px', borderRadius: 3 }}>★</span>}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{s.sub}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    <div style={{ height: 6 }} />
                                </div>
                            );
                        })}
                    </nav>

                    <div style={{ padding: '10px 14px', borderTop: `1px solid ${THEME.glassBorder}`, fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, display: 'flex', justifyContent: 'space-between' }}>
                        <span>TableScope v3</span>
                        <span>{allItems.length} sections</span>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ──────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <header style={{ padding: '0 26px', height: 54, borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: THEME.surface, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {activeItem && (
                                <>
                                    {activeGroup && (
                                        <>
                                            <span style={{ fontSize: 12, color: THEME.textDim }}>{activeGroup.label}</span>
                                            <ArrowRight size={12} color={THEME.textDim} />
                                        </>
                                    )}
                                    <activeItem.Icon size={15} color={activeGroup ? activeGroup.color() : THEME.primary} />
                                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>{activeItem.label}</span>
                                    <span style={{ fontSize: 12, color: THEME.textDim }}>· {activeItem.sub}</span>
                                </>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {filter.db     && <Chip color={THEME.cyan}    size="sm">db: {filter.db}</Chip>}
                            {filter.schema && <Chip color={THEME.primary} size="sm">schema: {filter.schema}</Chip>}
                            {filter.table  && <Chip color={THEME.success} size="sm">table: {filter.table}</Chip>}
                            <button className="ud-btn" onClick={() => activeItem?.reload?.()}
                                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${THEME.glassBorder}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw size={13} color={THEME.textDim} />
                            </button>
                        </div>
                    </header>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <FilterBar filter={filter} setFilter={handleFilter} allTables={allTables} dbRaw={dbRaw} />

                        <div key={`${activeItem?.id}-${filter.db}-${filter.schema}-${filter.table}`} className="ud-rise"
                             style={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 14, padding: 24, minHeight: 280 }}>
                            {Preview && <Preview />}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px', borderTop: `1px solid ${THEME.glassBorder}` }}>
                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>TableScope v3 · Unified Dashboard</span>
                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{filter.table ? `Scoped: ${filter.table}` : 'Global view'} · {allItems.length} sections</span>
                        </div>
                    </div>
                </div>

            </div>
        </FilterCtx.Provider>
    );
}