import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData, postData } from '../../utils/api';
import {
    Zap, RefreshCw, AlertTriangle, Clock, CheckCircle,
    Database, Activity, Settings, AlertCircle, Play, Search, Filter
} from 'lucide-react';

/* ── Styles ───────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes vmSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes vmFade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vmPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .vm-card { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:vmFade .3s ease; }
        .vm-metric { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .vm-row { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr 80px; gap:8px; align-items:center; padding:10px 14px; border-bottom:1px solid ${THEME.grid}30; font-size:12px; }
        .vm-row:hover { background:${THEME.primary}05; }
        .vm-row:last-child { border-bottom:none; }
        .vm-header { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr 1fr 80px; gap:8px; padding:8px 14px; font-size:10px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid ${THEME.grid}; }
        .vm-btn { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
        .vm-input { background:${THEME.surface}; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:8px 12px; font-size:13px; outline:none; }
        .vm-input:focus { border-color:${THEME.primary}60; }
        .vm-setting-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid ${THEME.grid}30; font-size:12px; }
        .vm-setting-row:last-child { border-bottom:none; }
    `}</style>
);

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt  = (n) => n == null ? '—' : Number(n).toLocaleString();
const fmtDate = (d) => {
    if (!d) return <span style={{ color:THEME.textDim }}>Never</span>;
    const ago = Math.floor((Date.now() - new Date(d)) / 86400000);
    const label = ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago}d ago`;
    return <span title={new Date(d).toLocaleString()}>{label}</span>;
};
const deadColor = (pct) => {
    const p = Number(pct) || 0;
    if (p > 20) return THEME.danger;
    if (p > 10) return THEME.warning;
    return THEME.success;
};

/* ── Progress bar ─────────────────────────────────────────────────────────── */
const DeadBar = ({ pct }) => {
    const p = Math.min(100, Number(pct) || 0);
    const color = deadColor(pct);
    return (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ flex:1, height:5, borderRadius:3, background:`${THEME.grid}`, overflow:'hidden', minWidth:40 }}>
                <div style={{ width:`${p}%`, height:'100%', background:color, borderRadius:3, transition:'width .3s' }}/>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color, minWidth:32, textAlign:'right' }}>{p}%</span>
        </div>
    );
};

/* ── Metric card ──────────────────────────────────────────────────────────── */
const MetricCard = ({ icon:Icon, label, value, sub, color = THEME.primary }) => (
    <div className="vm-metric">
        <div style={{ width:40, height:40, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={20} color={color}/>
        </div>
        <div>
            <div style={{ fontSize:22, fontWeight:800, color:THEME.textMain, lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color:THEME.textMuted, marginTop:3, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>{label}</div>
            {sub && <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>{sub}</div>}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   VACUUM & MAINTENANCE TAB
   ═══════════════════════════════════════════════════════════════════════════ */
export default function VacuumMaintenanceTab() {
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState(null);
    const [lastAt,     setLastAt]     = useState(null);
    const [autoRfsh,   setAutoRfsh]   = useState(30);
    const [search,     setSearch]     = useState('');
    const [filterHigh, setFilterHigh] = useState(false);
    const [activeTab,  setActiveTab]  = useState('tables');
    const [showSets,   setShowSets]   = useState(false);
    const [vacuuming,  setVacuuming]  = useState({});   // { 'schema.table': true }
    const [vacMsg,     setVacMsg]     = useState({});   // { 'schema.table': 'OK' | 'Error: ...' }
    const intervalRef                 = useRef(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/maintenance/vacuum-stats');
            setData(d);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLastAt(Date.now());
            setRefreshing(false);
            if (initial) setLoading(false);
        }
    }, []);

    useEffect(() => { load(true); }, [load]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoRfsh > 0) intervalRef.current = setInterval(() => load(false), autoRfsh * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [autoRfsh, load]);

    const runVacuum = async (schema, relname) => {
        const key = `${schema}.${relname}`;
        setVacuuming(v => ({ ...v, [key]: true }));
        setVacMsg(m => ({ ...m, [key]: null }));
        try {
            const r = await postData('/api/maintenance/vacuum', { schema, table: relname, analyze: true });
            setVacMsg(m => ({ ...m, [key]: r.success ? '✓ Done' : `Error` }));
            setTimeout(() => load(false), 2000);
        } catch (e) {
            setVacMsg(m => ({ ...m, [key]: `✗ ${e.message?.slice(0,40) || 'Error'}` }));
        } finally {
            setVacuuming(v => ({ ...v, [key]: false }));
        }
    };

    /* ── Derived ────────────────────────────────────────────────────────── */
    const tables   = data?.tables   || [];
    const workers  = data?.workers  || [];
    const settings = data?.settings || [];

    const filtered = tables.filter(t => {
        const matchSearch = !search || `${t.schemaname}.${t.relname}`.toLowerCase().includes(search.toLowerCase());
        const matchHigh   = !filterHigh || Number(t.dead_pct) > 10;
        return matchSearch && matchHigh;
    });

    const highBloat  = tables.filter(t => Number(t.dead_pct) > 10).length;
    const neverVac   = tables.filter(t => !t.last_autovacuum && !t.last_vacuum).length;
    const totalDead  = tables.reduce((s, t) => s + (Number(t.n_dead_tup) || 0), 0);
    const avgDeadPct = tables.length > 0
        ? (tables.reduce((s,t) => s + (Number(t.dead_pct)||0), 0) / tables.length).toFixed(1)
        : 0;

    const fmtRelative = (d) => {
        if (!d) return '';
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        return `${Math.floor(s/3600)}h ago`;
    };

    /* ── Loading ────────────────────────────────────────────────────────── */
    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, color:THEME.textMuted }}>
            <RefreshCw size={24} style={{ animation:'vmSpin 1s linear infinite', marginRight:10 }}/> Loading vacuum statistics…
        </div>
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Styles/>

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:THEME.surface, borderRadius:12, border:`1px solid ${THEME.grid}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Zap size={20} color={THEME.primary}/>
                    <span style={{ fontWeight:700, fontSize:15, color:THEME.textMain }}>Vacuum & Maintenance</span>
                    {workers.length > 0 && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:`${THEME.success}15`, color:THEME.success, border:`1px solid ${THEME.success}30`, animation:'vmPulse 2s infinite' }}>
                            <Activity size={10}/> {workers.length} autovacuum worker{workers.length > 1 ? 's' : ''} active
                        </span>
                    )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:11, color:THEME.textDim }}>{lastAt ? `Updated ${fmtRelative(lastAt)}` : ''}</span>
                    <select value={autoRfsh} onChange={e => setAutoRfsh(+e.target.value)}
                        style={{ background:THEME.surface, border:`1px solid ${THEME.grid}`, color:THEME.textMain, borderRadius:6, padding:'4px 8px', fontSize:12 }}>
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={0}>Off</option>
                    </select>
                    <button onClick={() => load(false)} disabled={refreshing}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:8, border:`1px solid ${THEME.primary}40`, background:`${THEME.primary}10`, color:THEME.primary, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                        <RefreshCw size={13} style={{ animation: refreshing ? 'vmSpin 1s linear infinite' : 'none' }}/> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding:14, background:`${THEME.danger}10`, border:`1px solid ${THEME.danger}30`, borderRadius:10, color:THEME.danger, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                    <AlertCircle size={16}/> {error}
                </div>
            )}

            {/* ── Metric cards ──────────────────────────────────────────── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
                <MetricCard icon={Activity} label="Active Workers" value={workers.length} sub={workers.length === 0 ? 'All idle' : `${workers.map(w=>w.table_name).join(', ').slice(0,30)}…`} color={workers.length > 0 ? THEME.success : THEME.textDim}/>
                <MetricCard icon={AlertTriangle} label="High-Bloat Tables" value={highBloat} sub=">10% dead tuples" color={highBloat > 0 ? THEME.warning : THEME.success}/>
                <MetricCard icon={Database} label="Never Vacuumed" value={neverVac} sub="Tables with no vacuum history" color={neverVac > 0 ? THEME.danger : THEME.success}/>
                <MetricCard icon={Zap} label="Avg Dead Tuple %" value={`${avgDeadPct}%`} sub={`${fmt(totalDead)} total dead tuples`} color={Number(avgDeadPct) > 10 ? THEME.warning : THEME.primary}/>
            </div>

            {/* ── Active autovacuum workers ─────────────────────────────── */}
            {workers.length > 0 && (
                <div className="vm-card" style={{ borderColor:`${THEME.success}30` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                        <Activity size={15} color={THEME.success}/> Active Autovacuum Workers
                    </div>
                    {workers.map((w, i) => (
                        <div key={w.pid} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:`${THEME.success}08`, borderRadius:8, border:`1px solid ${THEME.success}20`, marginBottom: i < workers.length-1 ? 8 : 0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:8, height:8, borderRadius:'50%', background:THEME.success, animation:'vmPulse 1.5s infinite' }}/>
                                <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>{w.table_name || w.datname}</div>
                                    <div style={{ fontSize:11, color:THEME.textDim }}>PID {w.pid} · {w.datname}</div>
                                </div>
                            </div>
                            <div style={{ fontSize:12, color:THEME.success, fontWeight:700 }}>
                                {w.duration_sec ? `${w.duration_sec}s` : 'Running'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Sub-tabs ──────────────────────────────────────────────── */}
            <div style={{ display:'flex', gap:6 }}>
                {[
                    { id:'tables',   label:'Table Bloat', icon:Database },
                    { id:'settings', label:'Autovacuum Settings', icon:Settings },
                ].map(({ id, label, icon:Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8, border:`1px solid ${activeTab===id ? THEME.primary : THEME.grid}`, background: activeTab===id ? `${THEME.primary}12` : 'transparent', color: activeTab===id ? THEME.primary : THEME.textMuted, cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .15s' }}>
                        <Icon size={14}/> {label}
                    </button>
                ))}
            </div>

            {/* ── Table bloat view ──────────────────────────────────────── */}
            {activeTab === 'tables' && (
                <div className="vm-card" style={{ padding:0 }}>
                    {/* Filters */}
                    <div style={{ padding:'14px 16px', display:'flex', gap:10, alignItems:'center', borderBottom:`1px solid ${THEME.grid}` }}>
                        <div style={{ position:'relative', flex:1, maxWidth:320 }}>
                            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:THEME.textDim }}/>
                            <input className="vm-input" placeholder="Search tables…" value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft:30, width:'100%' }}/>
                        </div>
                        <button onClick={() => setFilterHigh(f => !f)}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, border:`1px solid ${filterHigh ? THEME.warning : THEME.grid}`, background: filterHigh ? `${THEME.warning}10` : 'transparent', color: filterHigh ? THEME.warning : THEME.textMuted, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                            <Filter size={12}/> High Bloat Only
                        </button>
                        <span style={{ fontSize:12, color:THEME.textDim }}>{filtered.length} tables</span>
                    </div>

                    {/* Column headers */}
                    <div className="vm-header">
                        <span>Table</span>
                        <span>Dead Tuples</span>
                        <span>Dead %</span>
                        <span>Last Vacuum</span>
                        <span>Last Analyze</span>
                        <span>Action</span>
                    </div>

                    {/* Rows */}
                    <div style={{ maxHeight:460, overflowY:'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding:40, textAlign:'center', color:THEME.textDim, fontSize:13 }}>
                                No tables match the current filter.
                            </div>
                        ) : (
                            filtered.map(t => {
                                const key = `${t.schemaname}.${t.relname}`;
                                const isRunning = vacuuming[key];
                                const msg = vacMsg[key];
                                return (
                                    <div key={key} className="vm-row">
                                        <div>
                                            <div style={{ fontWeight:700, color:THEME.textMain, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.relname}</div>
                                            <div style={{ fontSize:10, color:THEME.textDim }}>{t.schemaname} · {t.total_size}</div>
                                        </div>
                                        <span style={{ fontFamily:'Space Mono, monospace', color:Number(t.n_dead_tup)>0 ? THEME.warning : THEME.textDim }}>
                                            {fmt(t.n_dead_tup)}
                                        </span>
                                        <DeadBar pct={t.dead_pct}/>
                                        <span style={{ color:THEME.textMuted }}>{fmtDate(t.last_autovacuum || t.last_vacuum)}</span>
                                        <span style={{ color:THEME.textMuted }}>{fmtDate(t.last_autoanalyze || t.last_analyze)}</span>
                                        <div>
                                            {msg ? (
                                                <span style={{ fontSize:11, fontWeight:700, color: msg.startsWith('✓') ? THEME.success : THEME.danger }}>{msg}</span>
                                            ) : (
                                                <button className="vm-btn" onClick={() => runVacuum(t.schemaname, t.relname)} disabled={isRunning}
                                                    style={{ background:`${THEME.primary}12`, color:THEME.primary, border:`1px solid ${THEME.primary}30`, opacity: isRunning ? .6 : 1 }}>
                                                    {isRunning
                                                        ? <RefreshCw size={10} style={{ animation:'vmSpin 1s linear infinite' }}/>
                                                        : <Play size={10}/>}
                                                    {isRunning ? 'Running…' : 'Vacuum'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ── Autovacuum settings ───────────────────────────────────── */}
            {activeTab === 'settings' && (
                <div className="vm-card">
                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                        <Settings size={15} color={THEME.textMuted}/> Autovacuum Configuration
                    </div>
                    <div style={{ fontSize:12, color:THEME.textDim, marginBottom:16 }}>
                        These settings are read from pg_settings. To change them, edit postgresql.conf or use ALTER SYSTEM and SELECT pg_reload_conf().
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 40px' }}>
                        {settings.map(s => (
                            <div key={s.name} className="vm-setting-row">
                                <div>
                                    <div style={{ fontWeight:600, color:THEME.textMain }}>{s.name}</div>
                                    <div style={{ fontSize:10, color:THEME.textDim, marginTop:2 }}>{s.short_desc}</div>
                                </div>
                                <span style={{ fontFamily:'Space Mono, monospace', fontSize:12, fontWeight:700, color:THEME.primary, marginLeft:12, whiteSpace:'nowrap' }}>
                                    {s.setting}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Guidance */}
                    <div style={{ marginTop:20, padding:'14px 16px', background:`${THEME.primary}08`, border:`1px solid ${THEME.primary}20`, borderRadius:10 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:THEME.primary, marginBottom:8 }}>Tuning Tips</div>
                        <div style={{ fontSize:12, color:THEME.textMuted, lineHeight:1.7 }}>
                            • Reduce <strong style={{color:THEME.textMain}}>autovacuum_vacuum_scale_factor</strong> (e.g. 0.01) for large tables to vacuum more aggressively.<br/>
                            • Increase <strong style={{color:THEME.textMain}}>autovacuum_vacuum_cost_delay</strong> to reduce I/O impact during business hours.<br/>
                            • Set <strong style={{color:THEME.textMain}}>autovacuum_max_workers</strong> higher if multiple large tables bloat simultaneously.<br/>
                            • Use per-table storage parameters (ALTER TABLE … SET autovacuum_…) to override global settings.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
