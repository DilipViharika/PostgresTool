import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData, postData, deleteData } from '../../utils/api';
import { TrendingUp, RefreshCw, AlertTriangle, CheckCircle, Play, Trash2, Database, Clock, AlertCircle, PlusCircle, GitCompare, BookOpen } from 'lucide-react';

const Styles = () => (
    <style>{`
        @keyframes qrSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes qrFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .qr-card   { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:qrFade .3s ease; }
        .qr-metric { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .qr-badge  { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; }
        .qr-textarea { width:100%; background:${THEME.bg}90; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:12px; font-family:'Space Mono',monospace; font-size:12px; outline:none; resize:vertical; line-height:1.6; }
        .qr-textarea:focus { border-color:${THEME.primary}60; }
        .qr-btn    { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; }
        .qr-baseline-row { padding:14px 16px; border-bottom:1px solid ${THEME.grid}20; display:flex; align-items:center; gap:12px; font-size:12px; }
        .qr-baseline-row:last-child { border-bottom:none; }
        .qr-baseline-row:hover { background:${THEME.primary}05; }
        .qr-plan-box { background:${THEME.bg}; border:1px solid ${THEME.grid}; border-radius:8px; padding:14px; font-family:'Space Mono',monospace; font-size:11px; color:${THEME.textMuted}; white-space:pre-wrap; overflow-x:auto; max-height:320px; overflow-y:auto; line-height:1.7; }
    `}</style>
);

const fmt    = n => n==null?'—':Number(n).toLocaleString();
const fmtMs  = ms => { const m=Number(ms)||0; if(m<1000) return `${m.toFixed(1)}ms`; return `${(m/1000).toFixed(2)}s`; };
const fmtDate = d => d?new Date(d).toLocaleString():'—';

const StatusBadge = ({ status, change }) => {
    if (status==='regression') return <span className="qr-badge" style={{background:`${THEME.danger}15`,color:THEME.danger,border:`1px solid ${THEME.danger}30`}}><AlertTriangle size={10}/> Regression +{change}%</span>;
    if (status==='ok')         return <span className="qr-badge" style={{background:`${THEME.success}15`,color:THEME.success,border:`1px solid ${THEME.success}30`}}><CheckCircle size={10}/> OK {change>0?`+${change}%`:change<0?`${change}%`:''}</span>;
    if (status==='no_baseline') return <span className="qr-badge" style={{background:`${THEME.primary}15`,color:THEME.primary,border:`1px solid ${THEME.primary}30`}}><BookOpen size={10}/> No Baseline</span>;
    return null;
};

const MetricCard = ({ icon:Icon, label, value, sub, color=THEME.primary }) => (
    <div className="qr-metric">
        <div style={{width:40,height:40,borderRadius:10,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon size={20} color={color}/>
        </div>
        <div>
            <div style={{fontSize:22,fontWeight:800,color:THEME.textMain,lineHeight:1}}>{value}</div>
            <div style={{fontSize:11,color:THEME.textMuted,marginTop:3,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
            {sub && <div style={{fontSize:11,color:THEME.textDim,marginTop:2}}>{sub}</div>}
        </div>
    </div>
);

const PlanTree = ({ plan, title, accent }) => {
    if (!plan) return null;
    const node = plan['Plan']||plan;
    const renderNode = (n, depth=0) => {
        if (!n) return null;
        const type = n['Node Type']||'Unknown';
        const cost = n['Total Cost']?.toFixed(2);
        const rows = n['Plan Rows'];
        const rel  = n['Relation Name']||n['Alias']||'';
        const children = n['Plans']||[];
        return (
            <div key={`${depth}-${type}`} style={{paddingLeft:depth>0?14:0,borderLeft:depth>0?`1px solid ${accent}30`:undefined,marginLeft:depth>0?6:0}}>
                <div style={{color:accent,fontWeight:700,fontSize:11}}>{type}{rel?` → ${rel}`:''}</div>
                <div style={{color:THEME.textDim,fontSize:10,marginBottom:4}}>cost={cost} rows={fmt(rows)}</div>
                {children.map((c,i)=>renderNode(c,depth+1))}
            </div>
        );
    };
    return (
        <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:accent,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>{title}</div>
            <div style={{background:THEME.bg,border:`1px solid ${THEME.grid}`,borderRadius:8,padding:12,maxHeight:280,overflowY:'auto'}}>
                {renderNode(node)}
            </div>
        </div>
    );
};

export default function QueryPlanRegressionTab() {
    const [baselines,   setBaselines]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [query,       setQuery]       = useState('');
    const [label,       setLabel]       = useState('');
    const [capturing,   setCapturing]   = useState(false);
    const [comparing,   setComparing]   = useState(false);
    const [captureMsg,  setCaptureMsg]  = useState(null);
    const [compareResult, setCompareResult] = useState(null);
    const [error,       setError]       = useState(null);
    const [activeTab,   setActiveTab]   = useState('compare');

    const loadBaselines = useCallback(async () => {
        try {
            const d = await fetchData('/api/regression/baselines');
            setBaselines(d||[]);
        } catch(e) {
            console.warn('Could not load baselines', e.message);
        } finally {
            setLoading(false);
        }
    },[]);

    useEffect(()=>{ loadBaselines(); },[loadBaselines]);

    const handleCapture = async () => {
        if (!query.trim()) return;
        setCapturing(true);
        setCaptureMsg(null);
        setError(null);
        try {
            const r = await postData('/api/regression/capture', { query: query.trim(), label: label.trim()||undefined });
            setCaptureMsg({ ok:true, cost:r.cost, fp:r.fingerprint });
            await loadBaselines();
        } catch(e) {
            setCaptureMsg({ ok:false, msg:e.message });
        } finally {
            setCapturing(false);
        }
    };

    const handleCompare = async () => {
        if (!query.trim()) return;
        setComparing(true);
        setCompareResult(null);
        setError(null);
        try {
            const r = await postData('/api/regression/compare', { query: query.trim() });
            setCompareResult(r);
        } catch(e) {
            setError(e.message);
        } finally {
            setComparing(false);
        }
    };

    const handleDelete = async (fp) => {
        try {
            await deleteData(`/api/regression/baselines/${fp}`);
            setBaselines(prev=>prev.filter(b=>b.fingerprint!==fp));
        } catch(e) {
            console.warn('Delete failed', e.message);
        }
    };

    const regressions = baselines.length; // simplified count since compare is per-query
    const fmtRel = d => { if(!d) return ''; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60) return `${s}s ago`; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

    if (loading) return (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:THEME.textMuted}}>
            <RefreshCw size={24} style={{animation:'qrSpin 1s linear infinite',marginRight:10}}/> Loading regression data…
        </div>
    );

    return (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <Styles/>

            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',background:THEME.surface,borderRadius:12,border:`1px solid ${THEME.grid}`}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <TrendingUp size={20} color={THEME.primary}/>
                    <span style={{fontWeight:700,fontSize:15,color:THEME.textMain}}>Query Plan Regression Detection</span>
                </div>
                <button onClick={loadBaselines} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,border:`1px solid ${THEME.primary}40`,background:`${THEME.primary}10`,color:THEME.primary,cursor:'pointer',fontSize:13,fontWeight:600}}>
                    <RefreshCw size={13}/> Refresh
                </button>
            </div>

            {/* Metric cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
                <MetricCard icon={BookOpen} label="Stored Baselines" value={baselines.length} sub="Query plan snapshots" color={THEME.primary}/>
                <MetricCard icon={GitCompare} label="How it Works" value="Capture → Compare" sub="Detect plan regressions ≥20% cost increase" color={THEME.secondary}/>
                <MetricCard icon={AlertTriangle} label="Sensitivity" value=">20% Cost Rise" sub="Configurable threshold for regression alerts" color={THEME.warning}/>
            </div>

            {/* Sub-tabs */}
            <div style={{display:'flex',gap:6}}>
                {[{id:'compare',label:'Compare & Detect',icon:GitCompare},{id:'baselines',label:`Baselines (${baselines.length})`,icon:BookOpen}].map(({id,label:lbl,icon:Icon})=>(
                    <button key={id} onClick={()=>setActiveTab(id)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',borderRadius:8,border:`1px solid ${activeTab===id?THEME.primary:THEME.grid}`,background:activeTab===id?`${THEME.primary}12`:'transparent',color:activeTab===id?THEME.primary:THEME.textMuted,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s'}}>
                        <Icon size={14}/> {lbl}
                    </button>
                ))}
            </div>

            {/* Compare tab */}
            {activeTab==='compare' && (
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div className="qr-card">
                        <div style={{fontSize:13,fontWeight:700,color:THEME.textMain,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                            <GitCompare size={15} color={THEME.primary}/> Analyze a Query
                        </div>

                        <div style={{marginBottom:12}}>
                            <label style={{display:'block',fontSize:11,fontWeight:700,color:THEME.textMuted,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>SQL Query</label>
                            <textarea className="qr-textarea" rows={6} placeholder="SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.created_at > NOW() - INTERVAL '30 days';" value={query} onChange={e=>setQuery(e.target.value)}/>
                        </div>

                        <div style={{marginBottom:14}}>
                            <label style={{display:'block',fontSize:11,fontWeight:700,color:THEME.textMuted,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Label (optional)</label>
                            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Orders last 30 days — before index" style={{background:THEME.bg,border:`1px solid ${THEME.grid}`,color:THEME.textMain,borderRadius:8,padding:'8px 12px',fontSize:13,outline:'none',width:'100%'}}/>
                        </div>

                        <div style={{display:'flex',gap:10}}>
                            <button className="qr-btn" onClick={handleCapture} disabled={!query.trim()||capturing}
                                style={{background:`${THEME.secondary}15`,color:THEME.secondary,border:`1px solid ${THEME.secondary}30`,opacity:!query.trim()?0.5:1}}>
                                {capturing?<RefreshCw size={13} style={{animation:'qrSpin 1s linear infinite'}}/>:<PlusCircle size={13}/>}
                                {capturing?'Capturing…':'Capture as Baseline'}
                            </button>
                            <button className="qr-btn" onClick={handleCompare} disabled={!query.trim()||comparing}
                                style={{background:`linear-gradient(135deg,${THEME.primary},${THEME.secondary})`,color:'#fff',opacity:!query.trim()?0.5:1}}>
                                {comparing?<RefreshCw size={13} style={{animation:'qrSpin 1s linear infinite'}}/>:<Play size={13}/>}
                                {comparing?'Comparing…':'Compare vs Baseline'}
                            </button>
                        </div>

                        {captureMsg && (
                            <div style={{marginTop:12,padding:12,borderRadius:8,background:captureMsg.ok?`${THEME.success}10`:`${THEME.danger}10`,border:`1px solid ${captureMsg.ok?THEME.success:THEME.danger}30`,color:captureMsg.ok?THEME.success:THEME.danger,fontSize:12,display:'flex',alignItems:'center',gap:8}}>
                                {captureMsg.ok?<CheckCircle size={14}/>:<AlertCircle size={14}/>}
                                {captureMsg.ok?`✓ Baseline captured — cost ${captureMsg.cost?.toFixed(2)} (fingerprint: ${captureMsg.fp?.slice(0,12)}…)`:captureMsg.msg}
                            </div>
                        )}
                        {error && <div style={{marginTop:12,padding:12,borderRadius:8,background:`${THEME.danger}10`,border:`1px solid ${THEME.danger}30`,color:THEME.danger,fontSize:12,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={14}/> {error}</div>}
                    </div>

                    {/* Compare result */}
                    {compareResult && (
                        <div className="qr-card" style={{borderColor:compareResult.regression?`${THEME.danger}40`:compareResult.status==='ok'?`${THEME.success}30`:`${THEME.primary}30`}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                                <div style={{fontSize:13,fontWeight:700,color:THEME.textMain,display:'flex',alignItems:'center',gap:10}}>
                                    <GitCompare size={15} color={THEME.primary}/> Comparison Result
                                    <StatusBadge status={compareResult.status} change={compareResult.costChange}/>
                                </div>
                                {compareResult.baseline && (
                                    <div style={{fontSize:11,color:THEME.textDim}}>Baseline from {fmtRel(compareResult.baseline.ts)}</div>
                                )}
                            </div>

                            {compareResult.status==='no_baseline' ? (
                                <div style={{padding:20,textAlign:'center',color:THEME.textMuted,fontSize:13}}>
                                    <BookOpen size={32} style={{opacity:.3,marginBottom:12,display:'block',margin:'0 auto 12px'}}/> No baseline found for this query. Click "Capture as Baseline" first to establish a reference plan.
                                </div>
                            ) : (
                                <>
                                    {/* Cost comparison */}
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                                        {[
                                            {label:'Baseline Plan Cost', value:compareResult.baseline?.cost?.toFixed(2), color:THEME.success},
                                            {label:'Current Plan Cost',  value:compareResult.current?.cost?.toFixed(2),  color:compareResult.regression?THEME.danger:THEME.success},
                                        ].map(({label:lbl,value,color})=>(
                                            <div key={lbl} style={{padding:'16px',background:`${color}08`,border:`1px solid ${color}25`,borderRadius:10,textAlign:'center'}}>
                                                <div style={{fontSize:26,fontWeight:800,color}}>{value}</div>
                                                <div style={{fontSize:11,color:THEME.textMuted,marginTop:4,fontWeight:600}}>{lbl}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {compareResult.regression && (
                                        <div style={{marginBottom:16,padding:12,background:`${THEME.danger}10`,border:`1px solid ${THEME.danger}30`,borderRadius:8,fontSize:12,color:THEME.danger}}>
                                            ⚠ <strong>Plan regression detected!</strong> The planner chose a significantly more expensive plan (+{compareResult.costChange}%). Consider running ANALYZE, checking for missing indexes, or reviewing recent schema changes.
                                        </div>
                                    )}

                                    {/* Side-by-side plan trees */}
                                    <div style={{display:'flex',gap:16}}>
                                        <PlanTree plan={compareResult.baseline?.plan} title="Baseline Plan" accent={THEME.success}/>
                                        <PlanTree plan={compareResult.current?.plan}  title="Current Plan"  accent={compareResult.regression?THEME.danger:THEME.primary}/>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Baselines tab */}
            {activeTab==='baselines' && (
                <div className="qr-card" style={{padding:0}}>
                    <div style={{padding:'14px 16px',borderBottom:`1px solid ${THEME.grid}`,fontSize:13,fontWeight:700,color:THEME.textMain,display:'flex',alignItems:'center',gap:8}}>
                        <BookOpen size={15} color={THEME.primary}/> Stored Plan Baselines
                        <span style={{fontSize:11,color:THEME.textDim,fontWeight:400,marginLeft:'auto'}}>{baselines.length} baseline{baselines.length!==1?'s':''} in memory — cleared on server restart</span>
                    </div>
                    {baselines.length===0 ? (
                        <div style={{padding:40,textAlign:'center',color:THEME.textDim}}>
                            <BookOpen size={36} style={{opacity:.25,marginBottom:12,display:'block',margin:'0 auto 12px'}}/>
                            <div style={{fontSize:13,fontWeight:600,color:THEME.textMuted}}>No baselines stored</div>
                            <div style={{fontSize:12,marginTop:6}}>Go to the Compare tab, enter a query, and click "Capture as Baseline" to start tracking plan regressions.</div>
                        </div>
                    ) : baselines.map((b,i)=>(
                        <div key={b.fingerprint} className="qr-baseline-row">
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:700,color:THEME.textMain,fontSize:13}}>{b.label}</div>
                                <div style={{fontFamily:'Space Mono,monospace',fontSize:10,color:THEME.textDim,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.queryPreview}</div>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0,marginLeft:16}}>
                                <div style={{fontSize:12,fontWeight:700,color:THEME.primary}}>Cost: {Number(b.cost).toFixed(2)}</div>
                                <div style={{fontSize:11,color:THEME.textDim,marginTop:2}}>{fmtRel(b.ts)}</div>
                            </div>
                            <button onClick={()=>handleDelete(b.fingerprint)}
                                style={{padding:'6px 10px',borderRadius:6,border:`1px solid ${THEME.danger}30`,background:`${THEME.danger}10`,color:THEME.danger,cursor:'pointer',marginLeft:12,display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700}}>
                                <Trash2 size={12}/> Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* How it works */}
            <div className="qr-card" style={{borderColor:`${THEME.primary}25`}}>
                <div style={{fontSize:12,fontWeight:700,color:THEME.primary,marginBottom:10,display:'flex',alignItems:'center',gap:8}}>
                    <CheckCircle size={14}/> How Plan Regression Detection Works
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                    {[
                        {step:'1. Capture Baseline',  desc:'Run a query at a known-good state (after fresh ANALYZE, with correct indexes). The planner cost is stored as your reference point.'},
                        {step:'2. Compare Later',     desc:'After schema changes, new indexes, or PostgreSQL upgrades, compare the current plan against the baseline. A >20% cost increase flags a regression.'},
                        {step:'3. Investigate',       desc:'Side-by-side plan trees show exactly which nodes changed — e.g. a sequential scan replacing an index scan signals a missing or bloated index.'},
                    ].map(({step,desc})=>(
                        <div key={step} style={{padding:'12px 14px',background:`${THEME.bg}60`,borderRadius:8,border:`1px solid ${THEME.grid}`}}>
                            <div style={{fontSize:12,fontWeight:700,color:THEME.primary,marginBottom:6}}>{step}</div>
                            <div style={{fontSize:11,color:THEME.textMuted,lineHeight:1.6}}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
