import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, CartesianGrid, RadialBarChart, RadialBar, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
    Layers, RefreshCw, AlertTriangle, Database, Activity, Search,
    AlertCircle, Filter, TrendingUp, Zap, Shield, ChevronUp, ChevronDown,
    Eye, ArrowRight, Clock, HardDrive, BarChart2, Cpu
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────────────────────────── */
const FilterCtx = createContext({ db: '', schema: '', table: '' });

/* ─────────────────────────────────────────────────────────────────
   GLOBAL CSS  (injected once)
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
.ud-rise {animation:ud-rise .32s cubic-bezier(.2,0,0,1) both}
.ud-card {transition:border-color .2s,background .2s,transform .18s,box-shadow .2s}
.ud-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.45)!important}
.ud-navitem{transition:all .16s}
.ud-navitem:hover{background:rgba(255,255,255,.06)!important;color:#fff!important}
.ud-row{transition:background .14s}
.ud-row:hover{background:rgba(255,255,255,.04)!important}
.ud-btn{transition:all .16s;cursor:pointer}
.ud-btn:hover{opacity:.8}
button{outline:none;font-family:inherit}
select,option{font-family:inherit}
`;

/* ─────────────────────────────────────────────────────────────────
   DATA HOOK
───────────────────────────────────────────────────────────────── */
const toArr = v => Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : Array.isArray(v?.data) ? v.data : [];

// Safe coercions — prevents crashes from unexpected Postgres types (anyarray, numeric, etc.)
const safeStr = v => {
    if (v == null) return '';
    if (Array.isArray(v)) return v.join(', ');
    const s = String(v);
    // Unwrap Postgres {a,b,c} arrays
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

/* ─────────────────────────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────────────────────────── */

/* Recharts custom tooltip */
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

/* Thin progress bar */
const Bar2 = ({ v, max, color, h = 5 }) => {
    const pct = max > 0 ? Math.min(100, (v / max) * 100) : 0;
    return (
        <div style={{ width: '100%', height: h, borderRadius: h, background: `${color}18`, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: h, background: `linear-gradient(90deg,${color}aa,${color})`, transition: 'width .6s cubic-bezier(.2,0,0,1)' }} />
        </div>
    );
};

/* Stacked bar */
const StackBar = ({ segs, h = 9 }) => (
    <div style={{ display: 'flex', height: h, borderRadius: h, overflow: 'hidden', background: `${THEME.glassBorder}60` }}>
        {segs.map((s, i) => <div key={i} style={{ width: `${s.pct}%`, background: s.color, flexShrink: 0, transition: 'width .6s' }} />)}
    </div>
);

/* Radial health ring using Recharts RadialBarChart */
const HealthRing = ({ score, size = 62 }) => {
    const color = hClr(score);
    const data  = [{ value: score, fill: color }, { value: 100 - score, fill: 'transparent' }];
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

/* Badge chip */
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

/* Card */
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

/* Section header */
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

/* Table head */
const THead = ({ cols, labels }) => (
    <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '9px 18px', gap: 12, borderBottom: `1px solid ${THEME.glassBorder}`, fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: THEME.fontMono, background: `${THEME.primary}06` }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);

/* Table row */
const TRow = ({ cols, children, i = 0 }) => (
    <div className="ud-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 18px', gap: 12, borderBottom: `1px solid ${THEME.glassBorder}50`, alignItems: 'center', background: i % 2 !== 0 ? `${THEME.glassBorder}30` : 'transparent' }}>
        {children}
    </div>
);

/* Loader */
const Loader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${THEME.primary}30`, borderTopColor: THEME.primary, animation: 'ud-spin 1s linear infinite' }} />
        <span style={{ fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>Loading…</span>
    </div>
);

/* Error */
const ErrUI = ({ msg }) => (
    <div style={{ padding: '14px 18px', borderRadius: 10, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}25`, color: THEME.danger, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={16} />{msg}
    </div>
);

/* Empty */
const EmptyUI = ({ msg = 'No data matches the current filters.' }) => (
    <div style={{ padding: 48, textAlign: 'center', color: THEME.textDim }}>
        <div style={{ fontSize: 30, marginBottom: 12, opacity: .4 }}>⊘</div>
        <p style={{ fontSize: 13, fontFamily: THEME.fontMono }}>{msg}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   FILTER SELECT — defined at module scope so React never treats it
   as a new component type on re-render. If defined inside FilterBar,
   every render creates a new function reference → React unmounts the
   <select> mid-click → dropdown disappears instantly.
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
// FilterBar is purely presentational — no data fetching, no hooks that
// change during interaction. All options come from the shell as stable props.
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
                {dbs.length > 0 && <FilterSelect label="Database" filterKey="db"     val={filter.db}     opts={dbs}       ph="All databases" onUpd={upd} />}
                <FilterSelect label="Schema"     filterKey="schema" val={filter.schema} opts={schemas}   ph="All schemas"   onUpd={upd} />
                <FilterSelect label="Table"      filterKey="table"  val={filter.table}  opts={tableList} ph="All tables"    onUpd={upd} />
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
},or)

/* ─────────────────────────────────────────────────────────────────
   SECTION: HEALTH SCORECARD
───────────────────────────────────────────────────────────────── */
function S_Health() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;

    // Mini bar chart data for dead pct overview
    const chartData = rows.slice(0, 8).map(t => ({ name: t.name, dead: Number(t.deadPct), health: Math.max(0, Math.round(100 - Number(t.deadPct) * 2)) }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Activity} accent={THEME.success} title="Health Scorecard"
                     sub="Per-table health score, dead tuple ratio, and VACUUM recommendations"
                     right={<Chip color={THEME.cyan}>{rows.length} tables</Chip>} />

            {/* Overview bar chart */}
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

            {/* Cards grid */}
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: ACTIVITY HEATMAP
───────────────────────────────────────────────────────────────── */
function S_Activity() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;

    const chartData = rows.slice(0, 8).map(t => ({
        name:     t.name,
        seqScans: Number(t.seqScans),
        idxScans: Number(t.idxScans),
        inserts:  Number(t.inserts),
    }));

    const metrics = [
        { key: 'seqScans', label: 'Seq Scans', color: THEME.danger },
        { key: 'idxScans', label: 'Idx Scans', color: THEME.success },
        { key: 'inserts',  label: 'Inserts',   color: THEME.primary },
    ];
    const maxes = { seqScans: Math.max(...rows.map(t => Number(t.seqScans)), 1), idxScans: Math.max(...rows.map(t => Number(t.idxScans)), 1), inserts: Math.max(...rows.map(t => Number(t.inserts)), 1) };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={BarChart2} accent={THEME.warning} title="Activity Heatmap"
                     sub="Sequential vs. index scans and DML rates per table" />

            {/* Grouped bar chart */}
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

            {/* Heatmap table */}
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: FORECAST
───────────────────────────────────────────────────────────────── */
function S_Forecast() {
    const f = useContext(FilterCtx);
    const { data, loading } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    const rows = data.filter(t => matchFilter(t, f)).slice(0, f.table ? 1 : 6);
    if (!rows.length) return <EmptyUI />;

    const chartData = rows.map(t => ({ name: t.name, dead: Number(t.deadPct), threshold: 20 }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={TrendingUp} accent={THEME.danger} title="Dead Tuple Forecast"
                     sub="Predicted autovacuum threshold hits based on current dead tuple accumulation" />

            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Dead % vs Threshold</div>
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: ROW COUNTS
───────────────────────────────────────────────────────────────── */
function S_RowCounts() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;

    const maxLive = Math.max(...rows.map(t => Number(t.liveRows ?? t.rows ?? 0)), 1);
    const chartData = rows.slice(0, 8).map(t => ({
        name: t.name,
        live: Number(t.liveRows ?? t.rows ?? 0),
        dead: Number(t.deadRows ?? 0),
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Database} accent={THEME.primary} title="Row Count Snapshot"
                     sub="Live vs. dead tuple counts from pg_stat_user_tables" />

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

/* ─────────────────────────────────────────────────────────────────
   SECTION: COLUMN STATS
───────────────────────────────────────────────────────────────── */
// Converts any PostgreSQL array representation to a readable string.
// Handles: actual JS arrays, "{a,b,c}" strings, anyarray objects, null, etc.
function pgArrayToString(val) {
    if (val == null) return '—';
    if (Array.isArray(val)) return val.join(', ') || '—';
    const s = String(val);
    // Strip PostgreSQL curly-brace array syntax: {val1,val2,...}
    if (s.startsWith('{') && s.endsWith('}')) {
        return s.slice(1, -1).replace(/"/g, '').replace(/,/g, ', ') || '—';
    }
    return s || '—';
}


function S_Columns() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/columns');
    if (loading) return <Loader />;

    // Show a helpful message for the anyarray cast error specifically
    if (error) {
        const isArrayErr = error.toLowerCase().includes('anyarray') || error.toLowerCase().includes('cast');
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ErrUI msg={error} />
                {isArrayErr && (
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: `${THEME.warning}0d`, border: `1px solid ${THEME.warning}25`, fontSize: 12, color: THEME.warning, fontFamily: THEME.fontMono, lineHeight: 1.7 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>💡 Fix: cast most_common_vals in your SQL</div>
                        <div style={{ color: THEME.textMuted }}>Change your query to:</div>
                        <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 6, background: `${THEME.glassBorder}60`, fontSize: 11 }}>
                            {'most_common_vals::text AS "topValues"'}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Normalize each row — defensively coerce all fields
    const normalized = data.map(col => ({
        ...col,
        tablename: col.tablename || col.table_name || col.table || '',
        schema:    col.schema    || col.table_schema || '',
        name:      col.name      || col.column_name  || col.attname || '',
        nullPct:   safeNum(col.nullPct ?? col.null_pct ?? col.null_frac != null ? (safeNum(col.null_frac) * 100) : 0),
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: TOAST BLOAT
───────────────────────────────────────────────────────────────── */
function S_Toast() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/toast');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = f.table ? data.filter(t => t.table === f.table) : data.filter(t => matchFilter(t, f, { nk: 'table' }));
    if (!rows.length) return <EmptyUI msg="No TOAST data for the selected table." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Layers} accent={THEME.warning} title="TOAST Table Bloat"
                     sub="Oversized column TOAST storage and dead chunk percentages" />
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: TEMP TABLES
───────────────────────────────────────────────────────────────── */
function S_Temp() {
    const { data, loading, error } = useTableData('/api/tables/temp');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Clock} accent={THEME.cyan} title="Temp Table Usage"
                     sub="Temporary table sizes and session ages from pg_temp" />
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: SCHEMA HISTORY
───────────────────────────────────────────────────────────────── */
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
            <SecHead Icon={HardDrive} accent={THEME.purple} title="Schema Change History"
                     sub="DDL audit log — requires pgAudit extension for live tracking" />
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

/* ─────────────────────────────────────────────────────────────────
   SECTION: DEPENDENCIES
───────────────────────────────────────────────────────────────── */
function S_Deps() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/dependencies');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = f.table
        ? data.filter(t => t.name === f.table || t.refsTo?.includes(f.table) || t.refsBy?.includes(f.table))
        : data.filter(t => matchFilter(t, f));
    if (!rows.length) return <EmptyUI />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Zap} accent={THEME.cyan} title="Dependency Map"
                     sub="Foreign key relationships, cascade chains, and drop-impact analysis" />
            <Card>
                <THead cols="1fr 1.5fr 1.5fr" labels={['Table', 'Depends On (FK)', 'Referenced By']} />
                {rows.map((t, i) => (
                    <TRow key={i} cols="1fr 1.5fr 1.5fr" i={i}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: THEME.cyan }}>{t.name}</div>
                            {t.refsBy?.length > 2 && <Chip color={THEME.danger} size="sm">Critical</Chip>}
                        </div>
                        <span style={{ fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>{t.refsTo?.join(', ') || '—'}</span>
                        <span style={{ fontSize: 12, color: t.refsBy?.length ? THEME.textMuted : THEME.textDim, fontFamily: THEME.fontMono }}>{t.refsBy?.join(', ') || '—'}</span>
                    </TRow>
                ))}
            </Card>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION: WRITE AMPLIFICATION
───────────────────────────────────────────────────────────────── */
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
            <SecHead Icon={Shield} accent={THEME.warning} title="Write Amplification"
                     sub="HOT update percentage, tuple update vs. insert ratios, WAL impact" />

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

/* ─────────────────────────────────────────────────────────────────
   SECTION: INDEX ANALYSIS
───────────────────────────────────────────────────────────────── */
function S_Indexes() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/indexes');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(ix => (!f.schema || ix.schema === f.schema) && (!f.table || ix.tableName === f.table));
    if (!rows.length) return <EmptyUI msg="No indexes found for the selected table." />;
    const unused = rows.filter(ix => Number(ix.scans ?? 0) === 0);

    const chartData = rows.slice(0, 10).map(ix => ({
        name:  ix.name?.slice(0, 14) + (ix.name?.length > 14 ? '…' : ''),
        scans: Number(ix.scans ?? 0),
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Eye} accent={THEME.primary} title="Index Analysis"
                     sub="Usage rates, sizes, scan counts, and unused index detection"
                     right={
                         <div style={{ display: 'flex', gap: 8 }}>
                             <Chip color={THEME.primary}>{rows.length} indexes</Chip>
                             {unused.length > 0 && <Chip color={THEME.danger}>{unused.length} unused</Chip>}
                         </div>
                     } />

            {unused.length > 0 && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: `${THEME.danger}0d`, border: `1px solid ${THEME.danger}25`, fontSize: 13, color: THEME.danger, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={15} />
                    {unused.length} unused index{unused.length > 1 ? 'es' : ''} detected — consuming write overhead with no read benefit.
                </div>
            )}

            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Scan Counts per Index</div>
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
                        const isU   = scans === 0;
                        const sc    = isU ? THEME.danger : scans < 10 ? THEME.warning : THEME.success;
                        const sl    = isU ? 'Unused' : scans < 10 ? 'Rare' : 'Active';
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
                                <div>
                                    <Chip color={sc} size="sm">{sl}</Chip>
                                    {isU && <div style={{ fontSize: 9, color: THEME.danger, marginTop: 4 }}>→ Consider dropping</div>}
                                </div>
                            </TRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION: TABLE SIZES
───────────────────────────────────────────────────────────────── */
function S_Sizes() {
    const f = useContext(FilterCtx);
    const { data, loading, error } = useTableData('/api/tables/sizes');
    if (loading) return <Loader />;
    if (error)   return <ErrUI msg={error} />;
    const rows = data.filter(s => (!f.schema || s.schema === f.schema) && (!f.table || s.name === f.table));
    if (!rows.length) return <EmptyUI msg="No size data for the selected scope." />;

    const chartData = rows.slice(0, 8).map(s => ({
        name:  s.name,
        heap:  Number(s.heapBytes  ?? 0) / 1048576,
        idx:   Number(s.indexBytes ?? 0) / 1048576,
        toast: Number(s.toastBytes ?? 0) / 1048576,
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecHead Icon={Cpu} accent={THEME.cyan} title="Table Size Breakdown"
                     sub="Heap, index, and TOAST storage split with bloat ratio analysis" />

            <Card style={{ padding: '18px 18px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, fontFamily: THEME.fontMono }}>Storage Breakdown (MB)</div>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={chartData} barCategoryGap="28%" stackOffset="expand">
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

/* ─────────────────────────────────────────────────────────────────
   NAV REGISTRY
───────────────────────────────────────────────────────────────── */
const GROUPS = [
    {
        id: 'health', label: 'Health', Icon: Activity, color: () => THEME.success,
        items: [
            { id: 'scorecard', label: 'Health Scorecard', Icon: Activity,   sub: 'VACUUM & health rings',  component: S_Health },
            { id: 'activity',  label: 'Activity Heatmap', Icon: BarChart2,  sub: 'Scans & DML rates',      component: S_Activity },
            { id: 'forecast',  label: 'Forecast',         Icon: TrendingUp, sub: 'Dead tuple projection',  component: S_Forecast },
            { id: 'rows',      label: 'Row Counts',        Icon: Database,   sub: 'Live vs dead tuples',   component: S_RowCounts },
        ],
    },
    {
        id: 'diagnostics', label: 'Diagnostics', Icon: Search, color: () => THEME.warning,
        items: [
            { id: 'columns', label: 'Column Stats',  Icon: Search,    sub: 'Null % & distinct values', component: S_Columns },
            { id: 'toast',   label: 'TOAST Bloat',   Icon: Layers,    sub: 'Oversized columns',        component: S_Toast },
            { id: 'temp',    label: 'Temp Tables',   Icon: Clock,     sub: 'Session temp usage',       component: S_Temp, hideWhenTable: true },
        ],
    },
    {
        id: 'architecture', label: 'Architecture', Icon: Zap, color: () => THEME.cyan,
        items: [
            { id: 'schema', label: 'Schema History', Icon: HardDrive,    sub: 'DDL timeline',        component: S_Schema },
            { id: 'deps',   label: 'Dependencies',   Icon: Zap,          sub: 'FK chains & cascades', component: S_Deps },
            { id: 'write',  label: 'Write Amp',      Icon: Shield,       sub: 'HOT updates & WAL',   component: S_Write },
        ],
    },
    {
        id: 'table', label: 'Table Details', Icon: Eye, color: () => THEME.primary, tableOnly: true,
        items: [
            { id: 'indexes', label: 'Index Analysis', Icon: Eye,     sub: 'Usage & unused detection', component: S_Indexes, tableOnly: true },
            { id: 'sizes',   label: 'Size Breakdown', Icon: Cpu,     sub: 'Heap / index / TOAST',     component: S_Sizes,   tableOnly: true },
        ],
    },
];

/* ─────────────────────────────────────────────────────────────────
   LIVE CLOCK — isolated component so its 1s tick NEVER causes the
   parent shell to re-render (which would make selects lose focus).
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

    // Fetch filter option data here (not inside FilterBar) so FilterBar
    // never triggers a data-fetch re-render while a select is open
    const { data: allTables } = useTableData('/api/tables/stats');
    const { data: dbRaw }     = useTableData('/api/databases');

    const handleFilter = useCallback(v => {
        setFilter(p => typeof v === 'function' ? v(p) : v);
        setActiveId('scorecard');
    }, []);

    // Compute visible groups + items
    const visibleGroups = GROUPS.map(g => ({
        ...g,
        items: g.items.filter(s => {
            if (s.tableOnly)     return !!filter.table;
            if (s.hideWhenTable) return !filter.table;
            return true;
        }),
    })).filter(g => (!g.tableOnly || !!filter.table) && g.items.length > 0);

    const allItems      = visibleGroups.flatMap(g => g.items);
    const activeItem    = allItems.find(s => s.id === activeId) || allItems[0];
    const Preview       = activeItem?.component;
    const activeGroup   = visibleGroups.find(g => g.items.some(s => s.id === activeItem?.id));

    const toggleGroup = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

    return (
        <FilterCtx.Provider value={filter}>
            <style>{CSS}</style>
            <div style={{ display: 'flex', height: '100vh', background: THEME.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif", color: THEME.textMain, overflow: 'hidden' }}>

                {/* ── SIDEBAR ─────────────────────────────────── */}
                <aside style={{ width: 244, flexShrink: 0, background: THEME.surface, borderRight: `1px solid ${THEME.glassBorder}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Logo */}
                    <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${THEME.glassBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${THEME.primary}20`, border: `1px solid ${THEME.primary}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🐘</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, letterSpacing: '-.03em' }}>TableScope</div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>Analytics Dashboard</div>
                            </div>
                        </div>
                    </div>

                    {/* Live indicator */}
                    <div style={{ padding: '9px 14px', borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 5px ${THEME.success}`, animation: 'ud-pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, color: THEME.textMuted }}>Live data</span>
                        </div>
                        <LiveClock />
                    </div>

                    {/* Active scope pill */}
                    {(filter.schema || filter.table) && (
                        <div style={{ margin: '10px 12px 0', padding: '8px 12px', borderRadius: 8, background: `${THEME.primary}0f`, border: `1px solid ${THEME.primary}22` }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: THEME.primary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: THEME.fontMono, marginBottom: 4 }}>Scope</div>
                            {filter.schema && <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{filter.schema}</div>}
                            {filter.table  && <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, fontFamily: THEME.fontMono, marginTop: 2 }}>{filter.table}</div>}
                        </div>
                    )}

                    {/* Nav */}
                    <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
                        {visibleGroups.map(g => {
                            const gColor = g.color();
                            const isOpen = !collapsed[g.id];
                            return (
                                <div key={g.id}>
                                    <button onClick={() => toggleGroup(g.id)}
                                            style={{ width: '100%', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <g.Icon size={11} color={gColor} />
                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: gColor, fontFamily: THEME.fontMono }}>{g.label}</span>
                                        </div>
                                        <ChevronDown size={11} color={THEME.textDim} style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                                    </button>

                                    {isOpen && g.items.map(s => {
                                        const isActive = activeItem?.id === s.id;
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
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? THEME.textMain : THEME.textMuted, lineHeight: 1.3 }}>{s.label}</div>
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

                    {/* Sidebar footer */}
                    <div style={{ padding: '10px 14px', borderTop: `1px solid ${THEME.glassBorder}`, fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, display: 'flex', justifyContent: 'space-between' }}>
                        <span>TableScope v2</span>
                        <span>{allItems.length} sections</span>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ──────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Top bar */}
                    <header style={{ padding: '0 26px', height: 54, borderBottom: `1px solid ${THEME.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: THEME.surface, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {activeItem && (
                                <>
                                    {/* Group breadcrumb */}
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
                            {filter.db     && <Chip color={THEME.cyan}   size="sm">db: {filter.db}</Chip>}
                            {filter.schema && <Chip color={THEME.primary} size="sm">schema: {filter.schema}</Chip>}
                            {filter.table  && <Chip color={THEME.success} size="sm">table: {filter.table}</Chip>}
                            <button className="ud-btn" onClick={() => activeItem?.reload?.()}
                                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${THEME.glassBorder}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw size={13} color={THEME.textDim} />
                            </button>
                        </div>
                    </header>

                    {/* Scrollable content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Filters */}
                        <FilterBar filter={filter} setFilter={handleFilter} allTables={allTables} dbRaw={dbRaw} />

                        {/* Active section */}
                        <div key={`${activeItem?.id}-${filter.db}-${filter.schema}-${filter.table}`} className="ud-rise"
                             style={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 14, padding: 24, minHeight: 280 }}>
                            {Preview && <Preview />}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px', borderTop: `1px solid ${THEME.glassBorder}` }}>
                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>TableScope · Unified Dashboard</span>
                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{filter.table ? `Scoped: ${filter.table}` : 'Global view'} · {allItems.length} sections</span>
                        </div>
                    </div>
                </div>

            </div>
        </FilterCtx.Provider>
    );
}