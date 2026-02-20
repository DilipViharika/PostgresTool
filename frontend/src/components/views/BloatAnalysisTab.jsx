import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Treemap } from 'recharts';
import { Layers, RefreshCw, AlertTriangle, Database, Activity, Search, AlertCircle, Filter, TrendingUp } from 'lucide-react';

const Styles = () => (
    <style>{`
        @keyframes baSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes baFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .ba-card   { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:baFade .3s ease; }
        .ba-metric { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .ba-head   { display:grid; gap:8px; padding:8px 14px; font-size:10px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid ${THEME.grid}; }
        .ba-row    { display:grid; gap:8px; align-items:center; padding:10px 14px; border-bottom:1px solid ${THEME.grid}20; font-size:12px; }
        .ba-row:hover { background:${THEME.primary}05; }
        .ba-row:last-child { border-bottom:none; }
        .ba-input  { background:${THEME.surface}; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:8px 12px; font-size:13px; outline:none; }
        .ba-input:focus { border-color:${THEME.primary}60; }
    `}</style>
);

const fmtBytes = b => { const n=Number(b)||0; if(n<1024) return `${n} B`; if(n<1048576) return `${(n/1024).toFixed(1)} KB`; if(n<1073741824) return `${(n/1048576).toFixed(1)} MB`; return `${(n/1073741824).toFixed(2)} GB`; };
const fmt      = n => n==null?'—':Number(n).toLocaleString();
const deadCol  = p => { const v=Number(p)||0; if(v>20) return THEME.danger; if(v>10) return THEME.warning; return THEME.success; };

const MetricCard = ({ icon:Icon, label, value, sub, color=THEME.primary, warn }) => (
    <div className="ba-metric" style={{borderColor:warn?`${THEME.warning}40`:undefined}}>
        <div style={{width:40,height:40,borderRadius:10,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon size={20} color={color}/>
        </div>
        <div>
            <div style={{fontSize:22,fontWeight:800,color:THEME.textMain,lineHeight:1}}>{value}</div>
            <div style={{fontSize:11,color:THEME.textMuted,marginTop:3,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
            {sub && <div style={{fontSize:11,color:warn?THEME.warning:THEME.textDim,marginTop:2}}>{sub}</div>}
        </div>
    </div>
);

const DeadBar = ({ pct }) => {
    const p=Math.min(100,Number(pct)||0);
    const c=deadCol(pct);
    return (
        <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{flex:1,height:5,borderRadius:3,background:THEME.grid,overflow:'hidden',minWidth:50}}>
                <div style={{width:`${p}%`,height:'100%',background:c,borderRadius:3,transition:'width .3s'}}/>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:c,minWidth:32,textAlign:'right'}}>{p.toFixed(1)}%</span>
        </div>
    );
};

const ChartTip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
        <div style={{background:THEME.surface,border:`1px solid ${THEME.grid}`,borderRadius:8,padding:'8px 12px',fontSize:12}}>
            <div style={{color:THEME.textMuted,marginBottom:4}}>{label}</div>
            {payload.map(p=><div key={p.name} style={{color:p.fill||THEME.primary,fontWeight:600}}>{p.name}: {typeof p.value==='number'&&p.value>1000?fmtBytes(p.value):p.value}</div>)}
        </div>
    );
};

const COLS_TABLE = '2fr 1fr 1fr 1fr 1fr 1.5fr';
const COLS_INDEX = '2fr 1fr 1fr 1fr 1fr';

export default function BloatAnalysisTab() {
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
    const [filterHigh, setFilterHigh] = useState(false);
    const intervalRef                 = useRef(null);

    const load = useCallback(async (initial=false) => {
        if (!initial) setRefreshing(true);
        try {
            const [t,i,s] = await Promise.all([
                fetchData('/api/bloat/tables'),
                fetchData('/api/bloat/indexes'),
                fetchData('/api/bloat/summary'),
            ]);
            setTables(t||[]);
            setIndexes(i||[]);
            setSummary(s||{});
            setError(null);
        } catch(e) {
            setError(e.message);
        } finally {
            setLastAt(Date.now());
            setRefreshing(false);
            if (initial) setLoading(false);
        }
    },[]);

    useEffect(()=>{ load(true); },[load]);
    useEffect(()=>{
        if(intervalRef.current) clearInterval(intervalRef.current);
        if(autoRfsh>0) intervalRef.current=setInterval(()=>load(false),autoRfsh*1000);
        return ()=>{ if(intervalRef.current) clearInterval(intervalRef.current); };
    },[autoRfsh,load]);

    const fmtRel = d => { if(!d) return ''; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60) return `${s}s ago`; if(s<3600) return `${Math.floor(s/60)}m ago`; return `${Math.floor(s/3600)}h ago`; };

    const filteredTables = tables
        .filter(t => {
            const matchSearch = !search || `${t.schemaname}.${t.tablename}`.toLowerCase().includes(search.toLowerCase());
            const matchHigh   = !filterHigh || Number(t.dead_pct)>10;
            return matchSearch && matchHigh;
        })
        .sort((a,b)=>{
            if (sortCol==='dead_pct')    return Number(b.dead_pct)    - Number(a.dead_pct);
            if (sortCol==='total_bytes') return Number(b.total_bytes) - Number(a.total_bytes);
            if (sortCol==='n_dead_tup')  return Number(b.n_dead_tup)  - Number(a.n_dead_tup);
            return 0;
        });

    const filteredIndexes = indexes
        .filter(i=>!search||`${i.schemaname}.${i.indexname}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a,b)=>Number(b.index_bytes)-Number(a.index_bytes));

    // Top 10 for chart
    const chartData = tables.slice(0,10).map(t=>({
        name: t.tablename.length>14?t.tablename.slice(0,12)+'…':t.tablename,
        dead: Math.round(Number(t.dead_pct)||0),
        size: Number(t.total_bytes)||0,
    }));

    // Treemap data for table sizes
    const treemapData = tables.slice(0,20).filter(t=>Number(t.total_bytes)>0).map(t=>({
        name: t.tablename,
        size: Number(t.total_bytes)||0,
        dead: Number(t.dead_pct)||0,
    }));

    if (loading) return (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:THEME.textMuted}}>
            <RefreshCw size={24} style={{animation:'baSpin 1s linear infinite',marginRight:10}}/> Loading bloat analysis…
        </div>
    );

    return (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <Styles/>

            {/* Toolbar */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',background:THEME.surface,borderRadius:12,border:`1px solid ${THEME.grid}`}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <Layers size={20} color={THEME.primary}/>
                    <span style={{fontWeight:700,fontSize:15,color:THEME.textMain}}>Bloat Analysis</span>
                    {Number(summary?.critical_bloat_tables)>0 && (
                        <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:5,fontSize:11,fontWeight:700,background:`${THEME.danger}15`,color:THEME.danger,border:`1px solid ${THEME.danger}30`}}>
                            <AlertTriangle size={10}/> {summary.critical_bloat_tables} critical tables
                        </span>
                    )}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:11,color:THEME.textDim}}>{lastAt?`Updated ${fmtRel(lastAt)}`:''}</span>
                    <select value={autoRfsh} onChange={e=>setAutoRfsh(+e.target.value)} style={{background:THEME.surface,border:`1px solid ${THEME.grid}`,color:THEME.textMain,borderRadius:6,padding:'4px 8px',fontSize:12}}>
                        <option value={30}>30s</option><option value={60}>1m</option><option value={300}>5m</option><option value={0}>Off</option>
                    </select>
                    <button onClick={()=>load(false)} disabled={refreshing} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,border:`1px solid ${THEME.primary}40`,background:`${THEME.primary}10`,color:THEME.primary,cursor:'pointer',fontSize:13,fontWeight:600}}>
                        <RefreshCw size={13} style={{animation:refreshing?'baSpin 1s linear infinite':'none'}}/> Refresh
                    </button>
                </div>
            </div>

            {error && <div style={{padding:14,background:`${THEME.danger}10`,border:`1px solid ${THEME.danger}30`,borderRadius:10,color:THEME.danger,fontSize:13,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={16}/> {error}</div>}

            {/* Summary metrics */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
                <MetricCard icon={Database} label="Total DB Size" value={summary?.total_db_size||'—'} sub={`${fmt(summary?.total_tables)} tables`} color={THEME.primary}/>
                <MetricCard icon={AlertTriangle} label="High Bloat Tables" value={fmt(summary?.high_bloat_tables)} sub=">10% dead tuples" color={Number(summary?.high_bloat_tables)>0?THEME.warning:THEME.success} warn={Number(summary?.high_bloat_tables)>0}/>
                <MetricCard icon={Activity} label="Critical Bloat" value={fmt(summary?.critical_bloat_tables)} sub=">20% dead tuples" color={Number(summary?.critical_bloat_tables)>0?THEME.danger:THEME.success} warn={Number(summary?.critical_bloat_tables)>0}/>
                <MetricCard icon={TrendingUp} label="Avg Dead Tuple %" value={`${summary?.avg_dead_pct||0}%`} sub={`${fmt(summary?.total_dead_tuples)} total dead`} color={Number(summary?.avg_dead_pct)>10?THEME.warning:THEME.success}/>
            </div>

            {/* Charts */}
            {chartData.length>0 && (
                <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20}}>
                    <div className="ba-card">
                        <div style={{fontSize:13,fontWeight:700,color:THEME.textMain,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                            <Activity size={15} color={THEME.primary}/> Top 10 Tables by Dead Tuple %
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={chartData} layout="vertical" margin={{top:0,right:40,left:0,bottom:0}}>
                                <XAxis type="number" domain={[0,100]} tick={{fontSize:10,fill:THEME.textDim}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:THEME.textDim}} tickLine={false} axisLine={false} width={70}/>
                                <Tooltip content={<ChartTip/>}/>
                                <Bar dataKey="dead" name="Dead %" radius={[0,3,3,0]}
                                    fill={THEME.warning}
                                    label={{position:'right',fontSize:10,fill:THEME.textDim,formatter:v=>`${v}%`}}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="ba-card">
                        <div style={{fontSize:13,fontWeight:700,color:THEME.textMain,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                            <Database size={15} color={THEME.secondary}/> Top 10 by Total Size
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={chartData} layout="vertical" margin={{top:0,right:40,left:0,bottom:0}}>
                                <XAxis type="number" tick={{fontSize:10,fill:THEME.textDim}} tickLine={false} axisLine={false} tickFormatter={fmtBytes}/>
                                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:THEME.textDim}} tickLine={false} axisLine={false} width={70}/>
                                <Tooltip content={<ChartTip/>}/>
                                <Bar dataKey="size" name="Total Size" fill={THEME.primary} radius={[0,3,3,0]}
                                    label={{position:'right',fontSize:10,fill:THEME.textDim,formatter:fmtBytes}}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Sub-tabs */}
            <div style={{display:'flex',gap:6}}>
                {[{id:'tables',label:'Table Bloat'},{id:'indexes',label:'Index Bloat'}].map(({id,label})=>(
                    <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'8px 16px',borderRadius:8,border:`1px solid ${activeTab===id?THEME.primary:THEME.grid}`,background:activeTab===id?`${THEME.primary}12`:'transparent',color:activeTab===id?THEME.primary:THEME.textMuted,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s'}}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Table Bloat */}
            {activeTab==='tables' && (
                <div className="ba-card" style={{padding:0}}>
                    <div style={{padding:'14px 16px',display:'flex',gap:10,alignItems:'center',borderBottom:`1px solid ${THEME.grid}`}}>
                        <div style={{position:'relative',flex:1,maxWidth:300}}>
                            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:THEME.textDim}}/>
                            <input className="ba-input" placeholder="Search tables…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30,width:'100%'}}/>
                        </div>
                        <button onClick={()=>setFilterHigh(f=>!f)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:8,border:`1px solid ${filterHigh?THEME.warning:THEME.grid}`,background:filterHigh?`${THEME.warning}10`:'transparent',color:filterHigh?THEME.warning:THEME.textMuted,cursor:'pointer',fontSize:12,fontWeight:600}}>
                            <Filter size={12}/> High Bloat Only
                        </button>
                        <select value={sortCol} onChange={e=>setSortCol(e.target.value)} style={{background:THEME.surface,border:`1px solid ${THEME.grid}`,color:THEME.textMain,borderRadius:6,padding:'6px 10px',fontSize:12}}>
                            <option value="dead_pct">Sort: Dead %</option>
                            <option value="total_bytes">Sort: Size</option>
                            <option value="n_dead_tup">Sort: Dead Rows</option>
                        </select>
                        <span style={{fontSize:12,color:THEME.textDim}}>{filteredTables.length} tables</span>
                    </div>
                    <div className="ba-head" style={{gridTemplateColumns:COLS_TABLE}}>
                        <span>Table</span><span>Total Size</span><span>Live Rows</span><span>Dead Rows</span><span>Dead %</span><span>Est. Bloat</span>
                    </div>
                    <div style={{maxHeight:480,overflowY:'auto'}}>
                        {filteredTables.length===0
                            ? <div style={{padding:40,textAlign:'center',color:THEME.textDim}}>No tables match.</div>
                            : filteredTables.map((t,i)=>(
                                <div key={i} className="ba-row" style={{gridTemplateColumns:COLS_TABLE}}>
                                    <div>
                                        <div style={{fontWeight:700,color:THEME.textMain,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.tablename}</div>
                                        <div style={{fontSize:10,color:THEME.textDim}}>{t.schemaname}</div>
                                    </div>
                                    <span style={{fontFamily:'Space Mono,monospace',color:THEME.textMain}}>{t.total_size}</span>
                                    <span style={{fontFamily:'Space Mono,monospace',color:THEME.textMuted}}>{fmt(t.n_live_tup)}</span>
                                    <span style={{fontFamily:'Space Mono,monospace',color:Number(t.n_dead_tup)>0?THEME.warning:THEME.textDim}}>{fmt(t.n_dead_tup)}</span>
                                    <DeadBar pct={t.dead_pct}/>
                                    <span style={{fontFamily:'Space Mono,monospace',color:THEME.danger,fontSize:11}}>{t.estimated_bloat_size||'—'}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Index Bloat */}
            {activeTab==='indexes' && (
                <div className="ba-card" style={{padding:0}}>
                    <div style={{padding:'14px 16px',display:'flex',gap:10,alignItems:'center',borderBottom:`1px solid ${THEME.grid}`}}>
                        <div style={{position:'relative',flex:1,maxWidth:300}}>
                            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:THEME.textDim}}/>
                            <input className="ba-input" placeholder="Search indexes…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30,width:'100%'}}/>
                        </div>
                        <span style={{fontSize:12,color:THEME.textDim}}>{filteredIndexes.length} indexes</span>
                    </div>
                    <div className="ba-head" style={{gridTemplateColumns:COLS_INDEX}}>
                        <span>Index</span><span>Table</span><span>Size</span><span>Scans</span><span>Inefficiency</span>
                    </div>
                    <div style={{maxHeight:480,overflowY:'auto'}}>
                        {filteredIndexes.length===0
                            ? <div style={{padding:40,textAlign:'center',color:THEME.textDim}}>No indexes found.</div>
                            : filteredIndexes.map((ix,i)=>{
                                const ineff=Number(ix.inefficiency_pct)||0;
                                return (
                                    <div key={i} className="ba-row" style={{gridTemplateColumns:COLS_INDEX}}>
                                        <div>
                                            <div style={{fontWeight:700,color:THEME.textMain,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ix.indexname}</div>
                                            <div style={{fontSize:10,color:THEME.textDim}}>{ix.schemaname}</div>
                                        </div>
                                        <span style={{color:THEME.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ix.tablename}</span>
                                        <span style={{fontFamily:'Space Mono,monospace'}}>{ix.index_size}</span>
                                        <span style={{fontFamily:'Space Mono,monospace',color:Number(ix.idx_scan)===0?THEME.danger:THEME.textMuted}}>{fmt(ix.idx_scan)}</span>
                                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                                            <div style={{flex:1,height:5,borderRadius:3,background:THEME.grid,overflow:'hidden',minWidth:40}}>
                                                <div style={{width:`${Math.min(100,ineff)}%`,height:'100%',background:ineff>50?THEME.danger:ineff>20?THEME.warning:THEME.success,borderRadius:3}}/>
                                            </div>
                                            <span style={{fontSize:11,fontWeight:700,color:ineff>50?THEME.danger:ineff>20?THEME.warning:THEME.success,minWidth:32,textAlign:'right'}}>{ineff.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div style={{padding:'12px 16px',borderTop:`1px solid ${THEME.grid}`,fontSize:11,color:THEME.textDim}}>
                        ⓘ Inefficiency % = percentage of index tuples fetched that don't correspond to live heap rows. High values indicate index bloat or stale statistics.
                    </div>
                </div>
            )}
        </div>
    );
}
