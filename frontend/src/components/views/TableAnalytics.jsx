import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { fetchData } from '../../utils/api';
import {
    Layers, Database, Activity, Search, AlertCircle, Filter,
    TrendingUp, GitBranch, Thermometer, FileText, Pen, ListChecks,
    Ruler, BarChart2, ChevronRight
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
    bg:          '#04080f',
    surface:     '#080e1a',
    panel:       '#0b1322',
    card:        '#0d1628',
    cardHover:   '#101c30',
    border:      '#1a2a42',
    borderBright:'#243a58',
    green:   '#00ff88',
    cyan:    '#00d4ff',
    amber:   '#ffaa00',
    red:     '#ff3c5a',
    purple:  '#a855f7',
    blue:    '#3b82f6',
    textMain: '#e8f4ff',
    textSub:  '#7a9abb',
    textDim:  '#3d5c7a',
    fontMono: "'IBM Plex Mono', 'Courier New', monospace",
    fontBody: "'DM Sans', system-ui, sans-serif",
    fontHead: "'Syne', system-ui, sans-serif",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: ${T.surface}; }
::-webkit-scrollbar-thumb { background: ${T.green}44; border-radius: 2px; }
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
.ud-fade { animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both; }
.ud-card:hover  { background: ${T.cardHover} !important; border-color: ${T.borderBright} !important; }
.ud-nav:hover   { background: ${T.green}10 !important; border-color: ${T.green}40 !important; color: ${T.green} !important; }
.ud-nav:hover .ud-sub { color: ${T.green}70 !important; }
.ud-row:hover   { background: #ffffff06 !important; }
.ud-clr:hover   { background: ${T.red}15 !important; border-color: ${T.red}50 !important; color: ${T.red} !important; }
button { outline: none; }
select:focus { box-shadow: 0 0 0 2px ${T.green}30; }
.ud-root::after {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.012) 2px, rgba(0,255,136,0.012) 4px);
}
`;

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const FilterContext = createContext({ db:'', schema:'', table:'' });

// ─── UTILITIES ───────────────────────────────────────────────────────────────
const toArr = v => Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : Array.isArray(v?.data) ? v.data : [];

function useTableData(endpoint, fallback = []) {
    const [data, setData]    = useState(fallback);
    const [loading, setLoad] = useState(true);
    const [error, setError]  = useState(null);
    const load = useCallback(async () => {
        setLoad(true);
        try { const j = await fetchData(endpoint); setData(Array.isArray(fallback) ? toArr(j) : (j ?? fallback)); setError(null); }
        catch (e) { setError(e.message); }
        finally { setLoad(false); }
    }, [endpoint]);
    useEffect(() => { load(); }, [load]);
    return { data, loading, error, reload: load };
}

const matchFilter = (row, filter, { nameKey='name', schemaKey='schema', dbKey='db' } = {}) => {
    if (filter.db     && row[dbKey]     && row[dbKey]     !== filter.db)     return false;
    if (filter.schema && row[schemaKey] && row[schemaKey] !== filter.schema) return false;
    if (filter.table  && row[nameKey]   && row[nameKey]   !== filter.table)  return false;
    return true;
};

const fmtBytes = b => b >= 1073741824 ? `${(b/1073741824).toFixed(2)}GB`
    : b >= 1048576    ? `${(b/1048576).toFixed(1)}MB`
        : b >= 1024       ? `${(b/1024).toFixed(0)}KB`
            : `${b}B`;

const hColor = s => s > 70 ? T.green : s > 40 ? T.amber : T.red;
const dColor = p => p > 20 ? T.red   : p > 10 ? T.amber : T.green;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
const MiniBar = ({ v, max, color = T.green, h = 4 }) => {
    const pct = max > 0 ? Math.min(100, (v / max) * 100) : 0;
    return (
        <div style={{ width:'100%', height:h, borderRadius:h, background:'#ffffff08', overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', borderRadius:h, background:`linear-gradient(90deg, ${color}88, ${color})`, boxShadow:`0 0 6px ${color}50`, transition:'width .6s cubic-bezier(.22,1,.36,1)' }} />
        </div>
    );
};

const StackBar = ({ segments, h = 8 }) => (
    <div style={{ width:'100%', height:h, borderRadius:h, overflow:'hidden', display:'flex', background:'#ffffff08' }}>
        {segments.map((s, i) => <div key={i} style={{ width:`${s.pct}%`, background:s.color, flexShrink:0, transition:'width .6s' }} />)}
    </div>
);

const Ring = ({ score, size = 52 }) => {
    const c = hColor(score), r = size/2-6, circ = 2*Math.PI*r, dash = (score/100)*circ;
    return (
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff0a" strokeWidth={5} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ filter:`drop-shadow(0 0 4px ${c}80)` }} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size*.22} fontWeight="700" fontFamily={T.fontMono} style={{ transform:'rotate(90deg)', transformOrigin:'50% 50%' }}>{score}</text>
        </svg>
    );
};

const Badge = ({ children, color = T.green }) => (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:T.fontMono, letterSpacing:.5, background:`${color}15`, color, border:`1px solid ${color}35`, whiteSpace:'nowrap' }}>{children}</span>
);

const Pill = ({ children, color = T.cyan }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:2, fontSize:10, fontWeight:500, fontFamily:T.fontMono, background:`${color}12`, color, border:`1px solid ${color}28` }}>
        <span style={{ width:4, height:4, borderRadius:'50%', background:color, flexShrink:0, boxShadow:`0 0 4px ${color}` }} />{children}
    </span>
);

const Card = ({ children, style = {} }) => (
    <div className="ud-card" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden', transition:'background .2s, border-color .2s', ...style }}>{children}</div>
);

const GridHead = ({ cols, labels }) => (
    <div style={{ display:'grid', gridTemplateColumns:cols, padding:'8px 16px', gap:8, borderBottom:`1px solid ${T.border}`, fontSize:9, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:1.2, fontFamily:T.fontMono, background:`${T.green}05` }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);

const GridRow = ({ cols, children, i = 0 }) => (
    <div className="ud-row" style={{ display:'grid', gridTemplateColumns:cols, padding:'12px 16px', gap:8, borderBottom:`1px solid ${T.border}50`, alignItems:'center', background: i%2===0 ? 'transparent' : '#ffffff03', transition:'background .15s' }}>
        {children}
    </div>
);

const SectionHead = ({ icon: Icon, title, sub, accent = T.green, right }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:6, background:`${accent}12`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`inset 0 0 12px ${accent}08` }}>
                {Icon && <Icon size={16} color={accent} />}
            </div>
            <div>
                <div style={{ fontSize:13, fontWeight:700, color:T.textMain, fontFamily:T.fontHead, letterSpacing:-.2 }}>{title}</div>
                <div style={{ fontSize:11, color:T.textDim, marginTop:2, fontFamily:T.fontBody }}>{sub}</div>
            </div>
        </div>
        {right}
    </div>
);

const Loader = () => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:160, gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${T.green}20`, borderTopColor:T.green, animation:'spin 1s linear infinite', boxShadow:`0 0 10px ${T.green}30` }} />
        <span style={{ fontSize:11, color:T.textDim, fontFamily:T.fontMono, letterSpacing:.5 }}>FETCHING DATA<span style={{ animation:'blink 1s infinite' }}>_</span></span>
    </div>
);

const Err = ({ msg }) => (
    <div style={{ padding:'14px 16px', borderRadius:6, fontSize:12, background:`${T.red}0f`, border:`1px solid ${T.red}30`, color:T.red, display:'flex', alignItems:'center', gap:10, fontFamily:T.fontMono }}>
        <AlertCircle size={14} color={T.red} /> ERROR: {msg}
    </div>
);

const Empty = ({ label = 'No data matches the current filter.' }) => (
    <div style={{ padding:40, textAlign:'center', color:T.textDim, fontFamily:T.fontMono, fontSize:12 }}>
        <div style={{ fontSize:24, marginBottom:12, opacity:.4 }}>⬡</div>{label}
    </div>
);

// ─── FILTER BAR ──────────────────────────────────────────────────────────────
function FilterBar({ filter, setFilter }) {
    const { data: tables }    = useTableData('/api/tables/stats');
    const { data: dbListRaw } = useTableData('/api/databases');

    const dbList = useMemo(() => {
        const a = toArr(dbListRaw).map(d => d.name||d).filter(Boolean);
        return a.length ? [...new Set(a)].sort() : [...new Set(toArr(tables).map(t=>t.db).filter(Boolean))].sort();
    }, [dbListRaw, tables]);

    const schemas   = useMemo(() => [...new Set(toArr(tables).filter(t => !filter.db||t.db===filter.db).map(t=>t.schema).filter(Boolean))].sort(), [tables, filter.db]);
    const tableList = useMemo(() => [...new Set(toArr(tables).filter(t=>!filter.db||t.db===filter.db).filter(t=>!filter.schema||t.schema===filter.schema).map(t=>t.name).filter(Boolean))].sort(), [tables, filter.db, filter.schema]);

    const upd = (k, v) => {
        if (k==='db')     setFilter({ db:v, schema:'', table:'' });
        else if (k==='schema') setFilter(f => ({ ...f, schema:v, table:'' }));
        else              setFilter(f => ({ ...f, table:v }));
    };
    const hasFilter = filter.db || filter.schema || filter.table;

    const selStyle = active => ({
        width:'100%', padding:'8px 28px 8px 10px', borderRadius:5,
        border:`1px solid ${active ? T.green+'55' : T.border}`,
        background: active ? `${T.green}08` : T.surface,
        color: active ? T.green : T.textSub,
        fontFamily:T.fontMono, fontSize:11, fontWeight: active ? 700 : 400,
        cursor:'pointer', appearance:'none', outline:'none', transition:'all .2s',
    });

    const Sel = ({ label, k, value, opts, ph, disabled }) => (
        <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1, minWidth:140 }}>
            <label style={{ fontSize:9, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:1.2, fontFamily:T.fontMono }}>{label}</label>
            <div style={{ position:'relative' }}>
                <select value={value} onChange={e=>upd(k,e.target.value)} disabled={disabled||opts.length===0} style={selStyle(!!value)}>
                    <option value="">{ph}</option>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:T.textDim, pointerEvents:'none', fontSize:9 }}>▾</span>
            </div>
        </div>
    );

    return (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'flex-end', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, paddingBottom:1 }}>
                <Filter size={13} color={T.cyan} />
                <span style={{ fontSize:9, fontWeight:700, color:T.cyan, fontFamily:T.fontMono, textTransform:'uppercase', letterSpacing:1.2 }}>SCOPE</span>
            </div>
            {dbList.length > 0 && <Sel label="Database" k="db"     value={filter.db}     opts={dbList}    ph="ALL DATABASES" disabled={false} />}
            <Sel label="Schema"   k="schema" value={filter.schema} opts={schemas}   ph="ALL SCHEMAS"   disabled={false} />
            <Sel label="Table"    k="table"  value={filter.table}  opts={tableList} ph="ALL TABLES"    disabled={tableList.length===0} />
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, paddingBottom:1 }}>
                {hasFilter ? (
                    <>
                        <div style={{ padding:'7px 12px', borderRadius:4, background:`${T.green}10`, border:`1px solid ${T.green}30`, fontSize:11, color:T.green, fontFamily:T.fontMono, fontWeight:600, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {[filter.db,filter.schema,filter.table].filter(Boolean).join(' › ')}
                        </div>
                        <button className="ud-clr" onClick={()=>setFilter({db:'',schema:'',table:''})} style={{ padding:'7px 12px', borderRadius:4, border:`1px solid ${T.border}`, background:'transparent', color:T.textDim, cursor:'pointer', fontFamily:T.fontMono, fontSize:10, fontWeight:700, transition:'all .15s', letterSpacing:.5 }}>✕ CLEAR</button>
                    </>
                ) : <span style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono }}>ALL DATA</span>}
            </div>
        </div>
    );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────
function S1_HealthScorecard() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(t => matchFilter(t, filter));
    if (!rows.length) return <Empty />;
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Activity} accent={T.green} title="Table Health Scorecard" sub="Per-table health score · VACUUM recommendations" right={<Badge color={T.cyan}>{rows.length} TABLE{rows.length!==1?'S':''}</Badge>} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:10 }}>
                {rows.map((t, i) => {
                    const dead = Number(t.deadPct), health = Math.max(0, Math.round(100 - dead*2)), c = hColor(health);
                    const rec = dead > 20 ? 'VACUUM URGENTLY' : dead > 10 ? 'VACUUM RECOMMENDED' : 'HEALTHY';
                    const rc  = dead > 20 ? T.red : dead > 10 ? T.amber : T.green;
                    return (
                        <Card key={i} style={{ padding:'14px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:13, color:T.textMain, fontFamily:T.fontMono }}>{t.name}</div>
                                    <div style={{ fontSize:10, color:T.textDim, marginTop:2 }}>{t.schema}</div>
                                </div>
                                <Ring score={health} />
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:T.textDim, marginBottom:5, fontFamily:T.fontMono }}>
                                <span>DEAD TUPLES</span><span style={{ color:dColor(dead), fontWeight:700 }}>{dead}%</span>
                            </div>
                            <MiniBar v={dead} max={50} color={dColor(dead)} h={3} />
                            <div style={{ marginTop:10, padding:'5px 9px', borderRadius:3, background:`${rc}10`, border:`1px solid ${rc}25`, fontSize:9, fontWeight:700, color:rc, fontFamily:T.fontMono, letterSpacing:.5 }}>→ {rec}</div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S2_ColumnStats() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/columns');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(col => {
        const cs = col.schema || (col.tablename?.includes('.')?col.tablename.split('.')[0]:null);
        const ct = col.tablename?.includes('.')?col.tablename.split('.')[1]:col.tablename;
        if (filter.schema && cs && cs !== filter.schema) return false;
        if (filter.table  && ct && ct !== filter.table)  return false;
        return true;
    });
    if (!rows.length) return <Empty />;
    const COLS = '1.2fr 1.4fr 1fr 1fr 2fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Search} accent={T.purple} title="Column Stats Explorer" sub="Null % · distinct values · most common values" right={<Badge color={T.purple}>{rows.length} COLS</Badge>} />
            <Card style={{ overflowX:'auto', maxHeight:480, overflowY:'auto' }}>
                <div style={{ minWidth:600 }}>
                    <GridHead cols={COLS} labels={['TABLE','COLUMN','NULL %','DISTINCT','TOP VALUES']} />
                    {rows.map((col, i) => {
                        const np = Number(col.nullPct).toFixed(1);
                        const nc = Number(np)>20?T.red:Number(np)>5?T.amber:T.green;
                        return (
                            <GridRow key={i} cols={COLS} i={i}>
                                <span style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono }}>{col.tablename}</span>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, fontWeight:700, color:T.cyan }}>{col.name}</span>
                                <div>
                                    <div style={{ fontFamily:T.fontMono, fontSize:10, color:nc, fontWeight:700, marginBottom:4 }}>{np}%</div>
                                    <MiniBar v={np} max={100} color={nc} h={2} />
                                </div>
                                <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textSub }}>{Number(col.distinct).toLocaleString()}</span>
                                <span style={{ fontSize:10, color:T.textDim, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={col.topValues||'—'}>{col.topValues||'—'}</span>
                            </GridRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function S3_ActivityHeatmap() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(t => matchFilter(t, filter));
    if (!rows.length) return <Empty />;
    const maxSeq = Math.max(...rows.map(t=>Number(t.seqScans)),1);
    const maxIdx = Math.max(...rows.map(t=>Number(t.idxScans)),1);
    const maxIns = Math.max(...rows.map(t=>Number(t.inserts)),1);
    const metrics = [
        { key:'seqScans', label:'SEQ SCANS', max:maxSeq, color:T.red },
        { key:'idxScans', label:'IDX SCANS', max:maxIdx, color:T.green },
        { key:'inserts',  label:'INSERTS',   max:maxIns, color:T.cyan },
    ];
    const COLS = '160px repeat(3,1fr)';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={BarChart2} accent={T.amber} title="Table Activity Heatmap" sub="Sequential vs index scans · DML rates" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:540 }}>
                    <div style={{ display:'grid', gridTemplateColumns:COLS, padding:'8px 16px', borderBottom:`1px solid ${T.border}`, gap:8, background:`${T.amber}05` }}>
                        <span style={{ fontSize:9, color:T.textDim, fontWeight:700, fontFamily:T.fontMono, textTransform:'uppercase', letterSpacing:1.2 }}>TABLE</span>
                        {metrics.map(m=><span key={m.key} style={{ fontSize:9, fontWeight:700, color:m.color, fontFamily:T.fontMono, textTransform:'uppercase', letterSpacing:1.2 }}>{m.label}</span>)}
                    </div>
                    {rows.map((t,i)=>(
                        <div key={i} className="ud-row" style={{ display:'grid', gridTemplateColumns:COLS, padding:'12px 16px', gap:8, alignItems:'center', borderBottom:`1px solid ${T.border}50`, background:i%2===0?'transparent':'#ffffff03', transition:'background .15s' }}>
                            <div>
                                <div style={{ fontSize:12, fontWeight:700, color:T.textMain, fontFamily:T.fontMono }}>{t.name}</div>
                                <div style={{ fontSize:9, color:T.textDim, marginTop:2 }}>{t.schema}</div>
                            </div>
                            {metrics.map(m=>{
                                const val=Number(t[m.key]), pct=Math.min(100,(val/m.max)*100);
                                const alpha=Math.max(8,Math.round(pct*.4)).toString(16).padStart(2,'0');
                                return (
                                    <div key={m.key}>
                                        <div style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, marginBottom:5 }}>{val.toLocaleString()}</div>
                                        <div style={{ height:20, borderRadius:3, background:`${m.color}${alpha}`, border:`1px solid ${m.color}25`, position:'relative', overflow:'hidden' }}>
                                            <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, background:`linear-gradient(90deg,${m.color}20,${m.color}50)`, borderRight:`1px solid ${m.color}80` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function SB_DependencyMap() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/dependencies');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = filter.table ? data.filter(t=>t.name===filter.table||t.refsTo?.includes(filter.table)||t.refsBy?.includes(filter.table)) : data.filter(t=>matchFilter(t,filter));
    if (!rows.length) return <Empty />;
    const COLS = '1fr 1.5fr 1.5fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={GitBranch} accent={T.cyan} title="Table Dependency Map" sub="Foreign keys · cascade chains · drop-impact analysis" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:500 }}>
                    <GridHead cols={COLS} labels={['TABLE','DEPENDS ON (FK)','REFERENCED BY']} />
                    {rows.map((t,i)=>(
                        <GridRow key={i} cols={COLS} i={i}>
                            <div>
                                <div style={{ fontWeight:700, color:T.cyan, fontSize:12, fontFamily:T.fontMono }}>{t.name}</div>
                                {t.refsBy?.length>2 && <div style={{ marginTop:4 }}><Badge color={T.red}>CRITICAL</Badge></div>}
                            </div>
                            <div style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono }}>{t.refsTo?.length?t.refsTo.join(', '):'—'}</div>
                            <div style={{ fontSize:10, color:t.refsBy?.length?T.textSub:T.textDim, fontFamily:T.fontMono }}>{t.refsBy?.length?t.refsBy.join(', '):'—'}</div>
                        </GridRow>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function SC_WriteAmplification() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(t=>matchFilter(t,filter)).filter(t=>Number(t.updates)>0||Number(t.inserts)>0).slice(0,10);
    if (!rows.length) return <Empty label="No write activity for the selected table." />;
    const COLS = '1.5fr 1fr 1fr 1.2fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Pen} accent={T.amber} title="Write Amplification" sub="HOT update % · tuple updates vs inserts" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:500 }}>
                    <GridHead cols={COLS} labels={['TABLE','UPDATES/HR','INSERTS/HR','HOT UPD %']} />
                    {rows.map((w,i)=>{
                        const hot=Number(w.hotPct), c=hot>80?T.green:hot>30?T.amber:T.red;
                        return (
                            <GridRow key={i} cols={COLS} i={i}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:12, color:T.textMain, fontFamily:T.fontMono }}>{w.name}</div>
                                    <div style={{ fontSize:9, color:T.textDim }}>{w.schema}</div>
                                </div>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSub }}>{Number(w.updates).toLocaleString()}</span>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSub }}>{Number(w.inserts).toLocaleString()}</span>
                                <div>
                                    <div style={{ fontFamily:T.fontMono, fontSize:11, color:c, fontWeight:700 }}>{hot}%</div>
                                    {hot<30&&Number(w.updates)>100&&<div style={{ fontSize:9, color:T.red, marginTop:3, fontFamily:T.fontMono }}>↓ lower fillfactor</div>}
                                </div>
                            </GridRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function SE_ToastBloat() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/toast');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = filter.table ? data.filter(t=>t.table===filter.table) : data.filter(t=>matchFilter(t,filter,{nameKey:'table'}));
    if (!rows.length) return <Empty label="No TOAST data for the selected table." />;
    const COLS = '1.5fr 1.2fr 1.5fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Layers} accent={T.amber} title="TOAST Table Bloat" sub="Oversized column TOAST storage · dead chunks" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:500 }}>
                    <GridHead cols={COLS} labels={['MAIN TABLE','TOAST SIZE','DEAD CHUNK %']} />
                    {rows.map((t,i)=>{
                        const dead=Number(t.deadPct), c=dead>20?T.red:dead>5?T.amber:T.green;
                        return (
                            <GridRow key={i} cols={COLS} i={i}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:12, fontFamily:T.fontMono, color:T.textMain }}>{t.table}</div>
                                    <div style={{ fontSize:9, color:T.textDim, marginTop:2, fontFamily:T.fontMono }}>{t.toastTable}</div>
                                </div>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.cyan, fontWeight:700 }}>{t.toastSize}</span>
                                <div>
                                    <div style={{ fontFamily:T.fontMono, fontSize:10, color:c, marginBottom:4 }}>{dead}%</div>
                                    <MiniBar v={dead} max={40} color={c} h={3} />
                                </div>
                            </GridRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function SF_TempTables() {
    const { data, loading, error } = useTableData('/api/tables/temp');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const COLS = '1fr 1fr 1fr 1fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Thermometer} accent={T.cyan} title="Temp Table Usage" sub="Temp table size per session · session age" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:500 }}>
                    <GridHead cols={COLS} labels={['APP / USER','PID','TEMP SIZE','SESSION AGE']} />
                    {data.length===0
                        ? <div style={{ padding:24, textAlign:'center', color:T.textDim, fontFamily:T.fontMono, fontSize:11 }}>NO TEMP TABLES ACTIVE</div>
                        : data.map((t,i)=>(
                            <GridRow key={i} cols={COLS} i={i}>
                                <div>
                                    <div style={{ fontSize:12, fontWeight:600, color:T.textMain }}>{t.app||'UNKNOWN'}</div>
                                    <div style={{ fontSize:9, color:T.textDim, fontFamily:T.fontMono }}>{t.user}</div>
                                </div>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSub }}>{t.pid}</span>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.amber, fontWeight:700 }}>{t.size}</span>
                                <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim }}>{t.age_sec}s</span>
                            </GridRow>
                        ))
                    }
                </div>
            </Card>
        </div>
    );
}

function SA_SchemaHistory() {
    const filter = useContext(FilterContext);
    const MOCK = [
        { ts:new Date().toISOString().split('T')[0], type:'ALTER TABLE',  object:'users',             schema:'public', detail:'ADD COLUMN last_login timestamptz',     risk:'medium' },
        { ts:new Date().toISOString().split('T')[0], type:'CREATE INDEX', object:'idx_orders_status', schema:'public', detail:'CONCURRENTLY ON orders(status)',        risk:'low' },
        { ts:new Date().toISOString().split('T')[0], type:'DROP COLUMN',  object:'orders',            schema:'public', detail:'removed deprecated field: legacy_ref', risk:'high' },
    ];
    const rows = MOCK.filter(e=>(!filter.schema||e.schema===filter.schema)&&(!filter.table||e.object===filter.table));
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={FileText} accent={T.purple} title="Schema Change History" sub="DDL audit log — requires pgAudit for live tracking" />
            {!rows.length ? <Empty label="No DDL events for the selected table." /> : (
                <Card style={{ padding:18 }}>
                    <div style={{ position:'relative', paddingLeft:22 }}>
                        <div style={{ position:'absolute', left:7, top:4, bottom:4, width:1, background:`linear-gradient(to bottom, ${T.purple}80, transparent)` }} />
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            {rows.map((e,i)=>{
                                const tc=e.risk==='high'?T.red:e.risk==='medium'?T.amber:T.green;
                                return (
                                    <div key={i} style={{ position:'relative' }}>
                                        <div style={{ position:'absolute', left:-18, top:10, width:8, height:8, borderRadius:'50%', background:tc, boxShadow:`0 0 6px ${tc}`, border:`2px solid ${T.panel}` }} />
                                        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:'10px 14px' }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:6 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                    <Pill color={tc}>{e.type}</Pill>
                                                    <span style={{ fontFamily:T.fontMono, fontSize:11, fontWeight:700, color:T.textMain }}>{e.schema}.{e.object}</span>
                                                </div>
                                                <span style={{ fontSize:9, color:T.textDim, fontFamily:T.fontMono }}>{e.ts}</span>
                                            </div>
                                            <div style={{ fontSize:11, color:T.textSub, fontFamily:T.fontMono }}>{e.detail}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

function SD_Forecast() {
    const filter = useContext(FilterContext);
    const { data, loading } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    const rows = data.filter(t=>matchFilter(t,filter)).slice(0,filter.table?1:4);
    if (!rows.length) return <Empty />;
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={TrendingUp} accent={T.red} title="Dead Tuple Forecast" sub="Predicts autovacuum threshold hits based on current deadPct" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
                {rows.map((f,i)=>{
                    const dead=Number(f.deadPct), risk=dead>20?'CRITICAL':dead>10?'HIGH':'NOMINAL';
                    const c=risk==='CRITICAL'?T.red:risk==='HIGH'?T.amber:T.green;
                    return (
                        <Card key={i} style={{ padding:'14px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                                <span style={{ fontWeight:700, fontSize:12, color:T.textMain, fontFamily:T.fontMono }}>{f.name}</span>
                                <Pill color={c}>{risk}</Pill>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:6, fontFamily:T.fontMono }}>
                                <span style={{ color:T.textDim }}>NOW <span style={{ color:c, fontWeight:700 }}>{dead}%</span></span>
                                <span style={{ color:T.textDim }}>TARGET 20%</span>
                            </div>
                            <MiniBar v={dead} max={50} color={c} h={5} />
                            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                                {[0,10,20,30,40,50].map(n=><span key={n} style={{ fontSize:8, color:T.textDim, fontFamily:T.fontMono }}>{n}</span>)}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S_IndexAnalysis() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/indexes');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(ix=>(!filter.schema||ix.schema===filter.schema)&&(!filter.table||ix.tableName===filter.table));
    if (!rows.length) return <Empty label="No indexes found for the selected table." />;
    const unused = rows.filter(ix=>Number(ix.scans??0)===0);
    const COLS = '2fr 1fr 1fr 1fr 1fr 1.2fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={ListChecks} accent={T.purple} title="Index Analysis" sub="Usage · size · scan counts · unused detection"
                         right={<div style={{ display:'flex', gap:8 }}><Badge color={T.purple}>{rows.length} IDX</Badge>{unused.length>0&&<Badge color={T.red}>{unused.length} UNUSED</Badge>}</div>} />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:780 }}>
                    <GridHead cols={COLS} labels={['INDEX NAME','TABLE','TYPE','SIZE','SCANS','STATUS']} />
                    {rows.map((ix,i)=>{
                        const scans=Number(ix.scans??0), isU=scans===0;
                        const sizeMb=ix.sizeBytes?`${(ix.sizeBytes/1048576).toFixed(1)}MB`:'—';
                        const sc=isU?T.red:scans<10?T.amber:T.green, sl=isU?'UNUSED':scans<10?'RARE':'ACTIVE';
                        return (
                            <GridRow key={i} cols={COLS} i={i}>
                                <div>
                                    <div style={{ fontFamily:T.fontMono, fontSize:11, fontWeight:700, color:T.textMain }}>{ix.name}</div>
                                    {ix.definition&&<div style={{ fontSize:9, color:T.textDim, marginTop:2, fontFamily:T.fontMono, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:240 }} title={ix.definition}>{ix.definition}</div>}
                                    <div style={{ display:'flex', gap:4, marginTop:4 }}>
                                        {ix.isPrimary&&<Badge color={T.purple}>PK</Badge>}
                                        {ix.isUnique &&<Badge color={T.cyan}>UQ</Badge>}
                                    </div>
                                </div>
                                <span style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono }}>{ix.tableName}</span>
                                <Pill color={T.purple}>{(ix.type||'btree').toUpperCase()}</Pill>
                                <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textSub }}>{ix.size||sizeMb}</span>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:isU?T.red:T.green, fontWeight:700 }}>{scans.toLocaleString()}</span>
                                <div>
                                    <Pill color={sc}>{sl}</Pill>
                                    {isU&&<div style={{ fontSize:9, color:T.red, marginTop:4, fontFamily:T.fontMono }}>→ CONSIDER DROP</div>}
                                </div>
                            </GridRow>
                        );
                    })}
                </div>
            </Card>
            {unused.length>0&&<div style={{ padding:'10px 14px', borderRadius:5, background:`${T.red}0f`, border:`1px solid ${T.red}30`, fontSize:11, color:T.red, fontFamily:T.fontMono }}>⚠ {unused.length} UNUSED INDEX{unused.length>1?'ES':''} — write overhead with no read benefit.</div>}
        </div>
    );
}

function S_TableSizes() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/sizes');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(s=>(!filter.schema||s.schema===filter.schema)&&(!filter.table||s.name===filter.table));
    if (!rows.length) return <Empty label="No size data for the selected table." />;
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Ruler} accent={T.cyan} title="Table Size Breakdown" sub="Heap · index · TOAST storage split · bloat ratio" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
                {rows.map((s,i)=>{
                    const heap=Number(s.heapBytes??0), idx=Number(s.indexBytes??0), toast=Number(s.toastBytes??0), total=heap+idx+toast||1;
                    const bloat=Number(s.bloatPct??0), bc=bloat>30?T.red:bloat>15?T.amber:T.green;
                    const segs=[
                        { label:'HEAP',    bytes:heap,  color:T.cyan,   pct:(heap/total)*100 },
                        { label:'INDEXES', bytes:idx,   color:T.purple, pct:(idx/total)*100 },
                        { label:'TOAST',   bytes:toast, color:T.amber,  pct:(toast/total)*100 },
                    ];
                    return (
                        <Card key={i} style={{ padding:'16px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:13, color:T.textMain, fontFamily:T.fontMono }}>{s.name}</div>
                                    <div style={{ fontSize:9, color:T.textDim, marginTop:3, fontFamily:T.fontMono }}>{s.schema} · {fmtBytes(total)} TOTAL</div>
                                </div>
                                <Pill color={bc}>BLOAT {bloat}%</Pill>
                            </div>
                            <StackBar segments={segs} h={8} />
                            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
                                {segs.map(seg=>(
                                    <div key={seg.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <div style={{ width:6, height:6, borderRadius:1, background:seg.color, boxShadow:`0 0 4px ${seg.color}80` }} />
                                            <span style={{ fontSize:10, color:T.textSub, fontFamily:T.fontMono }}>{seg.label}</span>
                                        </div>
                                        <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textMain }}>{fmtBytes(seg.bytes)}</span>
                                    </div>
                                ))}
                            </div>
                            {bloat>30&&<div style={{ marginTop:10, padding:'6px 10px', borderRadius:3, background:`${T.red}10`, border:`1px solid ${T.red}25`, fontSize:9, fontWeight:700, color:T.red, fontFamily:T.fontMono }}>→ VACUUM FULL or pg_repack recommended</div>}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S_RowCounts() {
    const filter = useContext(FilterContext);
    const { data, loading, error } = useTableData('/api/tables/stats');
    if (loading) return <Loader />;
    if (error)   return <Err msg={error} />;
    const rows = data.filter(t=>matchFilter(t,filter));
    if (!rows.length) return <Empty />;
    const maxLive = Math.max(...rows.map(t=>Number(t.liveRows??t.rows??0)),1);
    const COLS = '1.5fr 1.5fr 1fr 1fr';
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <SectionHead icon={Database} accent={T.blue} title="Row Count Snapshot" sub="Live vs dead tuples · from pg_stat_user_tables" />
            <Card style={{ overflowX:'auto' }}>
                <div style={{ minWidth:500 }}>
                    <GridHead cols={COLS} labels={['TABLE','LIVE ROWS','DEAD ROWS','DEAD RATIO']} />
                    {rows.map((t,i)=>{
                        const live=Number(t.liveRows??t.rows??0), dead=Number(t.deadRows??0);
                        const ratio=live+dead>0?((dead/(live+dead))*100).toFixed(1):'0.0';
                        const rc=dColor(Number(ratio));
                        return (
                            <GridRow key={i} cols={COLS} i={i}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:12, color:T.textMain, fontFamily:T.fontMono }}>{t.name}</div>
                                    <div style={{ fontSize:9, color:T.textDim, marginTop:2 }}>{t.schema}</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily:T.fontMono, fontSize:11, color:T.green, marginBottom:4 }}>{live.toLocaleString()}</div>
                                    <MiniBar v={live} max={maxLive} color={T.green} h={3} />
                                </div>
                                <span style={{ fontFamily:T.fontMono, fontSize:11, color:dead>0?T.red:T.textDim }}>{dead.toLocaleString()}</span>
                                <Pill color={rc}>{ratio}%</Pill>
                            </GridRow>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
    { group:'Health & Growth', label:'Health Scorecard', icon:'⬡', sub:'Health ring & VACUUM tips',      component:S1_HealthScorecard },
    { group:'Health & Growth', label:'Activity Heatmap', icon:'◈', sub:'Seq vs idx scans & DML',          component:S3_ActivityHeatmap },
    { group:'Health & Growth', label:'Forecast',         icon:'◬', sub:'Dead tuple predictions',           component:SD_Forecast },
    { group:'Health & Growth', label:'Row Counts',       icon:'▦', sub:'Live vs dead tuple ratio',         component:S_RowCounts },
    { group:'Diagnostics',     label:'Column Stats',     icon:'≡', sub:'Null % & distinct values',         component:S2_ColumnStats },
    { group:'Diagnostics',     label:'TOAST Bloat',      icon:'▣', sub:'Oversized column chunks',          component:SE_ToastBloat },
    { group:'Diagnostics',     label:'Temp Tables',      icon:'◎', sub:'Session temp sizes & leaks',       component:SF_TempTables, hideWhenTable:true },
    { group:'Architecture',    label:'Schema History',   icon:'⊞', sub:'DDL timeline & risk',              component:SA_SchemaHistory },
    { group:'Architecture',    label:'Dependency Map',   icon:'◇', sub:'FK chains & cascades',             component:SB_DependencyMap },
    { group:'Architecture',    label:'Write Amp',        icon:'⟳', sub:'WAL & tuple churn',               component:SC_WriteAmplification },
    { group:'Table Details',   label:'Index Analysis',   icon:'⊟', sub:'Index usage & unused detection',  component:S_IndexAnalysis, tableOnly:true },
    { group:'Table Details',   label:'Size Breakdown',   icon:'⊡', sub:'Heap / index / TOAST split',      component:S_TableSizes,    tableOnly:true },
];

const GROUP_COLORS = { 'Health & Growth':T.green, 'Diagnostics':T.amber, 'Architecture':T.cyan, 'Table Details':T.purple };

// ─── SHELL ───────────────────────────────────────────────────────────────────
export default function UnifiedDashboard() {
    const [filter, setFilter] = useState({ db:'', schema:'', table:'' });
    const [active, setActive] = useState(0);
    const [tick, setTick]     = useState(new Date());

    useEffect(() => { const id = setInterval(()=>setTick(new Date()),1000); return ()=>clearInterval(id); }, []);

    const SECTIONS   = ALL_SECTIONS.filter(s => s.tableOnly ? !!filter.table : s.hideWhenTable ? !filter.table : true);
    const safeActive = Math.min(active, SECTIONS.length-1);
    const Preview    = SECTIONS[safeActive]?.component;
    const groups     = [...new Set(SECTIONS.map(s=>s.group))];

    const handleFilter = useCallback(v => { setFilter(p => typeof v==='function'?v(p):v); setActive(0); }, []);

    return (
        <FilterContext.Provider value={filter}>
            <style>{GLOBAL_CSS}</style>
            <div className="ud-root" style={{ background:T.bg, minHeight:'100vh', padding:'28px 24px', fontFamily:T.fontBody, color:T.textMain, position:'relative' }}>

                {/* Grid bg */}
                <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(${T.green}06 1px,transparent 1px),linear-gradient(90deg,${T.green}06 1px,transparent 1px)`, backgroundSize:'40px 40px' }} />

                <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>

                    {/* ── HEADER ── */}
                    <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ width:44, height:44, borderRadius:8, background:`${T.green}0f`, border:`1px solid ${T.green}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:`0 0 20px ${T.green}15` }}>🐘</div>
                        <div>
                            <div style={{ fontSize:20, fontWeight:800, color:T.textMain, fontFamily:T.fontHead, letterSpacing:-.5 }}>TABLE ANALYTICS</div>
                            <div style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono, letterSpacing:1, marginTop:2 }}>UNIFIED DASHBOARD</div>
                        </div>
                        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
                            <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textDim, letterSpacing:.5 }}>{tick.toTimeString().slice(0,8)}</span>
                            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:4, background:`${T.green}0f`, border:`1px solid ${T.green}25` }}>
                                <div style={{ width:6, height:6, borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}`, animation:'pulse 2s infinite' }} />
                                <span style={{ fontSize:10, color:T.green, fontFamily:T.fontMono, fontWeight:700, letterSpacing:.5 }}>LIVE</span>
                            </div>
                            {filter.table && <div style={{ padding:'5px 10px', borderRadius:4, background:`${T.cyan}0f`, border:`1px solid ${T.cyan}25`, fontSize:10, color:T.cyan, fontFamily:T.fontMono, fontWeight:700 }}>⊕ {filter.table}</div>}
                        </div>
                    </div>

                    {/* ── FILTER BAR ── */}
                    <FilterBar filter={filter} setFilter={handleFilter} />

                    {/* Scope banner */}
                    {filter.table && (
                        <div style={{ marginBottom:18, padding:'9px 14px', borderRadius:5, background:`${T.cyan}08`, border:`1px solid ${T.cyan}20`, display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ color:T.cyan, fontFamily:T.fontMono, fontSize:11 }}>▸</span>
                            <span style={{ color:T.textDim, fontFamily:T.fontMono, fontSize:10 }}>
                                SCOPED TO <span style={{ color:T.cyan, fontWeight:700 }}>{filter.schema}.{filter.table}</span> · session-level sections hidden
                            </span>
                        </div>
                    )}

                    {/* ── NAV ── */}
                    <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:28 }}>
                        {groups.map(g => {
                            const ac = GROUP_COLORS[g] || T.green;
                            return (
                                <div key={g}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                                        <div style={{ width:3, height:14, borderRadius:2, background:ac, boxShadow:`0 0 6px ${ac}` }} />
                                        <span style={{ fontSize:9, fontWeight:700, color:ac, fontFamily:T.fontMono, textTransform:'uppercase', letterSpacing:1.5 }}>{g}</span>
                                        {g==='Table Details' && <span style={{ padding:'2px 7px', borderRadius:2, fontSize:8, fontFamily:T.fontMono, fontWeight:700, background:`${T.purple}15`, color:T.purple, border:`1px solid ${T.purple}30`, letterSpacing:.5 }}>TABLE SELECTED</span>}
                                    </div>
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                        {SECTIONS.map((s,i) => {
                                            if (s.group!==g) return null;
                                            const isA = safeActive===i, sac = GROUP_COLORS[s.group]||T.green;
                                            return (
                                                <button key={i} onClick={()=>setActive(i)} className={isA?'':' ud-nav'}
                                                        style={{ padding:'10px 14px', borderRadius:6, cursor:'pointer', border:`1px solid ${isA?sac+'60':T.border}`, background:isA?`${sac}12`:T.surface, color:isA?sac:T.textSub, fontFamily:T.fontMono, fontWeight:700, fontSize:11, transition:'all .2s', textAlign:'left', minWidth:160, boxShadow:isA?`0 0 12px ${sac}15,inset 0 0 20px ${sac}05`:'none' }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                                        <span style={{ fontSize:14, lineHeight:1 }}>{s.icon}</span><span>{s.label}</span>
                                                    </div>
                                                    <div className="ud-sub" style={{ fontSize:9, fontWeight:400, color:isA?`${sac}80`:T.textDim, letterSpacing:.3 }}>{s.sub}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── PANEL HEADER ── */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <ChevronRight size={14} color={T.green} />
                            <div>
                                <div style={{ fontSize:16, fontWeight:800, color:T.textMain, fontFamily:T.fontHead, letterSpacing:-.3 }}>{SECTIONS[safeActive]?.label?.toUpperCase()}</div>
                                <div style={{ fontSize:10, color:T.textDim, fontFamily:T.fontMono, marginTop:2 }}>{SECTIONS[safeActive]?.sub}</div>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                            {filter.db     && <Badge color={T.cyan}>DB: {filter.db}</Badge>}
                            {filter.schema && <Badge color={T.purple}>SCHEMA: {filter.schema}</Badge>}
                            {filter.table  && <Badge color={T.green}>TABLE: {filter.table}</Badge>}
                        </div>
                    </div>

                    {/* ── ACTIVE PANEL ── */}
                    <div key={`${safeActive}-${filter.db}-${filter.schema}-${filter.table}`} className="ud-fade"
                         style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:8, padding:24 }}>
                        {Preview && <Preview />}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop:24, paddingTop:16, borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:9, color:T.textDim, fontFamily:T.fontMono, letterSpacing:.5 }}>TABLE ANALYTICS · UNIFIED DASHBOARD</span>
                        <span style={{ fontSize:9, color:T.textDim, fontFamily:T.fontMono }}>{SECTIONS.length} SECTIONS · {filter.table?`SCOPED: ${filter.table}`:'GLOBAL VIEW'}</span>
                    </div>
                </div>
            </div>
        </FilterContext.Provider>
    );
}