import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
    CheckCircle, RefreshCw, AlertTriangle, Clock, Zap,
    HardDrive, Activity, Settings, AlertCircle
} from 'lucide-react';

/* ── Styles ───────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes cmSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes cmFade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cm-card { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:cmFade .3s ease; }
        .cm-metric { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .cm-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid ${THEME.grid}40; font-size:13px; }
        .cm-row:last-child { border-bottom:none; }
    `}</style>
);

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (n) => n == null ? '—' : Number(n).toLocaleString();
const fmtMs = (ms) => {
    if (ms == null) return '—';
    const m = Number(ms);
    if (m < 1000) return `${m}ms`;
    if (m < 60000) return `${(m/1000).toFixed(1)}s`;
    return `${(m/60000).toFixed(1)}min`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleString() : '—';

/* ── Metric card ──────────────────────────────────────────────────────────── */
const MetricCard = ({ icon: Icon, label, value, sub, color = THEME.primary, warn }) => (
    <div className="cm-metric" style={{ borderColor: warn ? `${THEME.warning}40` : undefined }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={20} color={color}/>
        </div>
        <div>
            <div style={{ fontSize:22, fontWeight:800, color:THEME.textMain, lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color:THEME.textMuted, marginTop:3, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 }}>{label}</div>
            {sub && <div style={{ fontSize:11, color: warn ? THEME.warning : THEME.textDim, marginTop:2 }}>{sub}</div>}
        </div>
    </div>
);

/* ── Custom tooltip ───────────────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background:THEME.surface, border:`1px solid ${THEME.grid}`, borderRadius:8, padding:'8px 12px', fontSize:12 }}>
            <div style={{ color:THEME.textMuted, marginBottom:4 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color:p.color, fontWeight:600 }}>{p.name}: {fmt(p.value)}</div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CHECKPOINT MONITOR TAB
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CheckpointMonitorTab() {
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState(null);
    const [lastAt,     setLastAt]     = useState(null);
    const [autoRfsh,   setAutoRfsh]   = useState(30);
    const [history,    setHistory]    = useState([]);
    const [showSets,   setShowSets]   = useState(false);
    const intervalRef                 = useRef(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/checkpoint/stats');
            setData(d);
            setError(null);
            // Keep a rolling 20-point history of buffer counts for mini chart
            setHistory(prev => {
                const entry = {
                    t: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
                    checkpoint: Number(d?.bgwriter?.buffers_checkpoint ?? 0),
                    bgwriter:   Number(d?.bgwriter?.buffers_clean       ?? 0),
                    backend:    Number(d?.bgwriter?.buffers_backend      ?? 0),
                };
                return [...prev.slice(-19), entry];
            });
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

    /* ── Derived ────────────────────────────────────────────────────────── */
    const bg  = data?.bgwriter  || {};
    const wal = data?.wal       || {};
    const settings = data?.settings || [];

    const totalCheckpoints  = (Number(bg.checkpoints_timed) || 0) + (Number(bg.checkpoints_req) || 0);
    const reqRatio = totalCheckpoints > 0
        ? Math.round((Number(bg.checkpoints_req) / totalCheckpoints) * 100)
        : 0;
    // High requested-checkpoint ratio = checkpoints being forced too frequently (bad)
    const reqWarn = reqRatio > 30;

    const totalBufs = (Number(bg.buffers_checkpoint)||0) + (Number(bg.buffers_clean)||0) + (Number(bg.buffers_backend)||0);
    const bufferPie = [
        { name:'Checkpoint', value: Number(bg.buffers_checkpoint)||0, color: THEME.primary },
        { name:'BGWriter',   value: Number(bg.buffers_clean)||0,      color: THEME.secondary },
        { name:'Backend',    value: Number(bg.buffers_backend)||0,     color: THEME.warning },
    ].filter(d => d.value > 0);

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
            <RefreshCw size={24} style={{ animation:'cmSpin 1s linear infinite', marginRight:10 }}/> Loading checkpoint stats…
        </div>
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Styles/>

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:THEME.surface, borderRadius:12, border:`1px solid ${THEME.grid}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <CheckCircle size={20} color={THEME.primary}/>
                    <span style={{ fontWeight:700, fontSize:15, color:THEME.textMain }}>Checkpoint Monitor</span>
                    {reqWarn && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:`${THEME.warning}15`, color:THEME.warning, border:`1px solid ${THEME.warning}30` }}>
                            <AlertTriangle size={10}/> High requested-checkpoint rate
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
                        <RefreshCw size={13} style={{ animation: refreshing ? 'cmSpin 1s linear infinite' : 'none' }}/> Refresh
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
                <MetricCard icon={CheckCircle} label="Total Checkpoints" value={fmt(totalCheckpoints)} sub={`Since ${fmtDate(bg.stats_reset).split(',')[0]}`} color={THEME.primary}/>
                <MetricCard icon={AlertTriangle} label="Requested (Forced)" value={`${reqRatio}%`} sub={reqWarn ? '⚠ Above 30% threshold' : `${fmt(bg.checkpoints_req)} of ${fmt(totalCheckpoints)}`} color={reqWarn ? THEME.warning : THEME.success} warn={reqWarn}/>
                <MetricCard icon={Clock} label="Avg Write Time" value={fmtMs(bg.checkpoint_write_ms)} sub="Time writing dirty buffers" color={THEME.secondary}/>
                <MetricCard icon={HardDrive} label="Buffers Allocated" value={fmt(bg.buffers_alloc)} sub={`BGWriter stops: ${fmt(bg.maxwritten_clean)}`} color={THEME.info || THEME.primary}/>
            </div>

            {/* ── Main grid ─────────────────────────────────────────────── */}
            <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>

                {/* Buffer write history chart */}
                <div className="cm-card">
                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                        <Activity size={15} color={THEME.primary}/> Buffer Writes Over Time
                        <span style={{ fontSize:11, color:THEME.textDim, fontWeight:400, marginLeft:'auto' }}>Cumulative — last {history.length} snapshots</span>
                    </div>
                    {history.length < 2 ? (
                        <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:THEME.textDim, fontSize:12 }}>
                            Collecting data… refresh again in {autoRfsh || 30}s
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={history} margin={{ top:4, right:0, left:0, bottom:0 }}>
                                <defs>
                                    <linearGradient id="gcChk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={.3}/>
                                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gcBgw" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.secondary} stopOpacity={.3}/>
                                        <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gcBe" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={.3}/>
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="t" tick={{ fontSize:10, fill:THEME.textDim }} tickLine={false} axisLine={false}/>
                                <YAxis tick={{ fontSize:10, fill:THEME.textDim }} tickLine={false} axisLine={false} width={45}/>
                                <Tooltip content={<ChartTip/>}/>
                                <Area type="monotone" dataKey="checkpoint" name="Checkpoint" stroke={THEME.primary} fill="url(#gcChk)" strokeWidth={1.5}/>
                                <Area type="monotone" dataKey="bgwriter"   name="BGWriter"   stroke={THEME.secondary} fill="url(#gcBgw)" strokeWidth={1.5}/>
                                <Area type="monotone" dataKey="backend"    name="Backend"    stroke={THEME.warning}  fill="url(#gcBe)"  strokeWidth={1.5}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    <div style={{ display:'flex', gap:16, marginTop:8 }}>
                        {[{ color:THEME.primary, label:'Checkpoint' }, { color:THEME.secondary, label:'BGWriter' }, { color:THEME.warning, label:'Backend' }].map(({ color, label }) => (
                            <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:THEME.textMuted }}>
                                <div style={{ width:10, height:3, borderRadius:2, background:color }}/>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buffer distribution pie */}
                <div className="cm-card">
                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                        <HardDrive size={15} color={THEME.secondary}/> Buffer Write Distribution
                    </div>
                    {totalBufs === 0 ? (
                        <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:THEME.textDim, fontSize:12 }}>No buffer data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={bufferPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                    {bufferPie.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                                </Pie>
                                <Tooltip formatter={(v) => [fmt(v), 'Buffers']}/>
                                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize:11 }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div style={{ display:'flex', flexDirection:'column', gap:0, marginTop:4 }}>
                        {[
                            { label:'Checkpoint buffers',  value: bg.buffers_checkpoint,   color: THEME.primary },
                            { label:'BGWriter buffers',    value: bg.buffers_clean,         color: THEME.secondary },
                            { label:'Backend writes',      value: bg.buffers_backend,       color: THEME.warning },
                            { label:'Backend fsync calls', value: bg.buffers_backend_fsync, color: THEME.danger },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="cm-row">
                                <span style={{ color:THEME.textMuted, display:'flex', alignItems:'center', gap:6 }}>
                                    <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }}/>
                                    {label}
                                </span>
                                <span style={{ fontWeight:700, color:THEME.textMain, fontFamily:'Space Mono, monospace', fontSize:12 }}>{fmt(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Timing breakdown ──────────────────────────────────────── */}
            <div className="cm-card">
                <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <Clock size={15} color={THEME.primary}/> Checkpoint Timing Breakdown
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
                    {[
                        { label:'Write Time (total)', value: fmtMs(bg.checkpoint_write_ms), desc:'Time spent writing dirty buffers to disk', color:THEME.primary },
                        { label:'Sync Time (total)',  value: fmtMs(bg.checkpoint_sync_ms),  desc:'Time spent syncing files to durable storage (fsync)', color:THEME.secondary },
                        { label:'Timed Checkpoints',  value: fmt(bg.checkpoints_timed),      desc:'Scheduled by checkpoint_timeout (healthy)', color:THEME.success },
                    ].map(({ label, value, desc, color }) => (
                        <div key={label} style={{ padding:'14px 16px', background:`${THEME.bg}60`, borderRadius:10, border:`1px solid ${THEME.grid}` }}>
                            <div style={{ fontSize:20, fontWeight:800, color, lineHeight:1, marginBottom:6 }}>{value}</div>
                            <div style={{ fontSize:12, fontWeight:700, color:THEME.textMain, marginBottom:4 }}>{label}</div>
                            <div style={{ fontSize:11, color:THEME.textDim, lineHeight:1.5 }}>{desc}</div>
                        </div>
                    ))}
                </div>
                {Number(bg.checkpoint_sync_ms) > Number(bg.checkpoint_write_ms) && (
                    <div style={{ marginTop:14, padding:12, background:`${THEME.warning}10`, border:`1px solid ${THEME.warning}30`, borderRadius:8, fontSize:12, color:THEME.warning }}>
                        ⚠ Sync time exceeds write time — this may indicate slow storage I/O. Consider faster disks or adjusting <code>checkpoint_completion_target</code>.
                    </div>
                )}
            </div>

            {/* ── Settings ──────────────────────────────────────────────── */}
            <div className="cm-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showSets ? 16 : 0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, display:'flex', alignItems:'center', gap:8 }}>
                        <Settings size={15} color={THEME.textMuted}/> Checkpoint & BGWriter Settings
                    </div>
                    <button onClick={() => setShowSets(s => !s)}
                        style={{ background:'none', border:'none', color:THEME.textMuted, cursor:'pointer', fontSize:12, fontWeight:600, padding:'4px 8px' }}>
                        {showSets ? 'Hide' : 'Show'}
                    </button>
                </div>
                {showSets && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 32px' }}>
                        {settings.map(s => (
                            <div key={s.name} className="cm-row">
                                <span style={{ color:THEME.textMuted, fontSize:12 }}>{s.name}</span>
                                <span style={{ fontFamily:'Space Mono, monospace', fontSize:12, color:THEME.textMain, fontWeight:600 }}>
                                    {s.setting}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── WAL info ──────────────────────────────────────────────── */}
            <div className="cm-card">
                <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                    <Zap size={15} color={THEME.secondary}/> WAL Configuration
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                    {[
                        { label:'Current WAL File',        value: wal.current_wal     || '—' },
                        { label:'Max WAL Size',             value: wal.max_wal_mb      ? `${wal.max_wal_mb} MB` : '—' },
                        { label:'Checkpoint Timeout',       value: wal.checkpoint_timeout_sec ? `${wal.checkpoint_timeout_sec}s` : '—' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ padding:'12px 14px', background:`${THEME.bg}60`, borderRadius:8, border:`1px solid ${THEME.grid}` }}>
                            <div style={{ fontSize:11, color:THEME.textMuted, textTransform:'uppercase', letterSpacing:.5, marginBottom:6 }}>{label}</div>
                            <div style={{ fontFamily:'Space Mono, monospace', fontSize:13, fontWeight:700, color:THEME.textMain }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
