// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import type { PlanNode, QueryPlan, IndexInfo, TableBloat, Column, Table, SchemaMigration, QueryResult } from './types';

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN SYSTEM — Adaptive light/dark via THEME
───────────────────────────────────────────────────────────────────────── */
const C = {
    get bg()          { return THEME.surface; },
    get bgAlt()       { return THEME.surfaceRaised || THEME.surface; },
    get surface()     { return THEME.surfaceHover; },
    get surfaceHi()   { return THEME.glass; },
    get border()      { return THEME.grid; },
    get borderSub()   { return THEME.glassBorder; },

    get accent()      { return THEME.primary; },
    get accentDim()   { return THEME.primaryFaint; },
    get accentBg()    { return THEME.primary + '10'; },

    get ok()          { return THEME.success; },
    get okBg()        { return THEME.success + '0D'; },
    get warn()        { return THEME.warning; },
    get warnBg()      { return THEME.warning + '0D'; },
    get err()         { return THEME.danger; },
    get errBg()       { return THEME.danger + '10'; },

    get textPrimary() { return THEME.textMain; },
    get textSub()     { return THEME.textMuted; },
    get textDim()     { return THEME.textDim; },
};

/* ─────────────────────────────────────────────────────────────────────────
   LIVE DATA HOOK — replaces all dummy DATA const
───────────────────────────────────────────────────────────────────────── */
const EMPTY_DATA = {
    health: { hitRatio: 0, totalIndexes: 0, totalSize: '—', totalBytes: 0, criticalCount: 0, seqScanRate: 0 },
    missing: [], duplicates: [], bloat: [], unused: [],
    pgvector: { installed: false, version: null, indexes: [] },
    rowEstDivergence: [], foreignKeyMissing: [], history: [],
};

function useIndexData(live) {
    const [data, setData] = useState(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [health, missing, unused, dupes, bloat] = await Promise.all([
                fetchData('/api/indexes/health').catch(() => null),
                fetchData('/api/indexes/missing').catch(() => []),
                fetchData('/api/indexes/unused').catch(() => []),
                fetchData('/api/indexes/duplicates').catch(() => []),
                fetchData('/api/indexes/bloat').catch(() => []),
            ]);

            // normalise missing rows
            const missingNorm = (Array.isArray(missing) ? missing : []).map((r, i) => ({
                id: i + 1,
                table: r.table,
                schema: r.schema,
                column: '—',
                severity: r.severity,
                seq_scan: parseInt(r.seq_scan || 0),
                idx_scan: parseInt(r.idx_scan || 0),
                seq_tup_read: parseInt(r.seq_tup_read || 0),
                tableSize: r.tableSize,
                tableSizeBytes: parseInt(r.tableSizeBytes || 0),
                estSize: '—',
                currentLatency: null,
                estLatency: null,
                writes: null,
                reads: null,
                type: 'missing',
                hash: String(r.table || '').slice(0, 4).toUpperCase(),
            }));

            // normalise unused rows
            const unusedNorm = (Array.isArray(unused) ? unused : []).map((r, i) => ({
                id: 100 + i,
                indexName: r.indexName,
                table: r.table,
                schema: r.schema,
                size: r.size,
                sizeBytes: parseInt(r.sizeBytes || 0),
                scans: parseInt(r.scans || 0),
                lastUsed: r.scans === 0 ? 'Never' : `${r.scans} scan(s)`,
                definition: r.definition,
                isUnique: r.isUnique,
                type: 'unused',
                hash: String(r.indexName || '').slice(-4).toUpperCase(),
            }));

            // normalise duplicate rows
            const dupesNorm = (Array.isArray(dupes) ? dupes : []).map((r, i) => ({
                id: 200 + i,
                indexName: r.indexName,
                table: r.table,
                schema: r.schema,
                definition: r.definition,
                shadowedBy: r.shadowedBy,
                wastedSpace: r.wastedSpace,
                wastedBytes: parseInt(r.wastedBytes || 0),
                writes: parseInt(r.writes || 0),
                type: 'duplicates',
                hash: String(r.indexName || '').slice(-4).toUpperCase(),
            }));

            // normalise bloat rows
            const bloatNorm = (Array.isArray(bloat) ? bloat : []).map((r, i) => ({
                id: 300 + i,
                indexName: r.indexName,
                table: r.table,
                schema: r.schema,
                size: r.size,
                sizeBytes: parseInt(r.sizeBytes || 0),
                bloatPct: parseFloat(r.bloatPct || 0),
                wastedSpace: '—',
                lastVacuum: '—',
                writes: parseInt(r.idx_scan || 0),
                severity: r.severity,
                definition: r.definition,
                type: 'bloat',
                hash: String(r.indexName || '').slice(-4).toUpperCase(),
            }));

            const h = health || EMPTY_DATA.health;
            setData({
                health: {
                    hitRatio: parseFloat(h.hitRatio || 0),
                    totalIndexes: parseInt(h.totalIndexes || 0),
                    totalSize: h.totalSize || '—',
                    totalBytes: parseInt(h.totalBytes || 0),
                    criticalCount: parseInt(h.criticalCount || 0),
                    seqScanRate: parseFloat(h.seqScanRate || 0),
                },
                missing: missingNorm,
                unused: unusedNorm,
                duplicates: dupesNorm,
                bloat: bloatNorm,
                pgvector: EMPTY_DATA.pgvector,
                rowEstDivergence: EMPTY_DATA.rowEstDivergence,
                foreignKeyMissing: EMPTY_DATA.foreignKeyMissing,
                history: EMPTY_DATA.history,
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Refresh every 60 s when live mode is on
    useEffect(() => {
        if (!live) return;
        const t = setInterval(load, 60_000);
        return () => clearInterval(t);
    }, [live, load]);

    return { data, loading, error, refresh: load };
}

const genSQL = idx => {
    if (idx.type==='missing') return [
        `CREATE INDEX CONCURRENTLY`,
        `  idx_${idx.table}_${idx.column.replace(/[, ]+/g,'_')}`,
        `  ON ${idx.schema}.${idx.table} USING btree (${idx.column})`,
        idx.include ? `  INCLUDE (${idx.include})` : null,
        idx.partial  ? `  WHERE ${idx.partial}` : null,
        `;`,
    ].filter(Boolean).join('\n');
    if (idx.type==='duplicates') return `DROP INDEX CONCURRENTLY ${idx.indexName};\n-- Covered by: ${idx.shadowedBy}`;
    if (idx.type==='bloat') return `REINDEX INDEX CONCURRENTLY ${idx.indexName};\nANALYZE ${idx.schema}.${idx.table};`;
    return `DROP INDEX CONCURRENTLY ${idx.indexName};\n-- Zero usage confirmed`;
};

/* ─────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────── */
const IDX_STYLE_ID = 'idx-adaptive-styles';
function ensureIdxStyles() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(IDX_STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = IDX_STYLE_ID; document.head.appendChild(el); }
    el.textContent = [
        '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}',
        '@keyframes fadeIn {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
        '@keyframes slideR {from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}',
        '@keyframes grow   {from{transform:scaleX(0)}to{transform:scaleX(1)}}',
        '@keyframes spin   {to{transform:rotate(360deg)}}',
        '@keyframes pulse  {0%,100%{opacity:1}50%{opacity:.3}}',
        '@keyframes wave   {0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}',
        '.fade-in{animation:fadeIn .35s ease both;}',
        '.s1{animation-delay:.04s}.s2{animation-delay:.08s}.s3{animation-delay:.12s}',
        '.s4{animation-delay:.16s}.s5{animation-delay:.20s}',
        '.rh{transition:background .1s;cursor:pointer;}',
        `.rh:hover{background:${C.surfaceHi}!important;}`,
        '.rh:hover .pk{opacity:1!important;}',
        '.pk{opacity:0;transition:opacity .15s;}',
        '::-webkit-scrollbar{width:3px;height:3px}',
        `::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}`,
        '::-webkit-scrollbar-track{background:transparent}',
        `.btn{transition:all .15s;cursor:pointer;font-family:${THEME.fontBody};}`,
        `.btn:hover{background:${C.surfaceHi}!important;border-color:${C.accent}!important;color:${C.accent}!important;}`,
        `.tab{transition:all .15s;cursor:pointer;background:none;border:none;font-family:${THEME.fontBody};}`,
        `.ir{background:none;border:none;outline:none;font-family:${THEME.fontMono};color:${C.textSub};}`,
        '.wv{animation:wave 1.1s ease-in-out infinite;}',
        '.wv:nth-child(2){animation-delay:.12s}.wv:nth-child(3){animation-delay:.24s}',
        '.wv:nth-child(4){animation-delay:.36s}.wv:nth-child(5){animation-delay:.48s}',
        '.bar-g{transform-origin:left;animation:grow 1s cubic-bezier(.22,1,.36,1) both;}',
    ].join('\n');
}
const Styles = () => { useAdaptiveTheme(); ensureIdxStyles(); return null; };

/* ─────────────────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────────────────── */
const M = ({c,sz=11,w=400,children,style={}}) =>
    <span style={{fontFamily:THEME.fontMono,fontSize:sz,color:c||C.textSub,fontWeight:w,...style}}>{children}</span>;

const Lbl = ({c,children}) =>
    <span style={{fontFamily:THEME.fontMono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:c||C.textDim,fontWeight:500}}>{children}</span>;

const Sev = ({level}) => {
    const m={critical:{l:'Critical',c:C.err,bg:C.errBg},high:{l:'High',c:C.warn,bg:C.warnBg},
        medium:{l:'Medium',c:C.accent,bg:C.accentBg},low:{l:'Low',c:C.ok,bg:C.okBg}}[level]||{l:level,c:C.textSub,bg:'transparent'};
    return <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,fontWeight:600,
        padding:'3px 9px',borderRadius:4,background:m.bg,color:m.c,border:`1px solid ${m.c}25`,
        fontFamily:THEME.fontBody}}>
    <span style={{width:5,height:5,borderRadius:'50%',background:m.c,flexShrink:0,
        animation:level==='critical'?'pulse 1.4s infinite':'none'}}/>
        {m.l}
  </span>;
};

const Spark = ({data,color,w=80,h=22}) => {
    if(!data||data.length<2) return null;
    const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
    const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*(h-4)-2}`).join(' ');
    const lp=pts.split(' ').pop().split(',');
    return <svg width={w} height={h} style={{display:'block',overflow:'visible'}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={.85}/>
        <circle cx={lp[0]} cy={lp[1]} r={2.5} fill={color}/>
    </svg>;
};

const MiniBar = ({data,color,h=40}) => {
    const mx=Math.max(...data,1);
    return <div style={{display:'flex',gap:1.5,alignItems:'flex-end',height:h}}>
        {data.map((v,i)=><div key={i} style={{flex:1,height:`${Math.max(8,(v/mx)*100)}%`,
            background:`${color}${i===data.length-1?'ff':'55'}`,borderRadius:'2px 2px 0 0',minWidth:2}}/>)}
    </div>;
};

const Arc = ({value,max=100,color,size=88,label}) => {
    const sw=6,r=(size-sw)/2,circ=2*Math.PI*r;
    const off=circ*(1-Math.min(value/max,1));
    return <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
        <svg width={size} height={size}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={sw}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                    style={{transition:'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
            alignItems:'center',justifyContent:'center',gap:2}}>
            <span style={{fontSize:15,fontWeight:700,color,fontFamily:THEME.fontBody,lineHeight:1}}>{value}{max===100?'%':''}</span>
            {label&&<Lbl color={C.textDim}>{label}</Lbl>}
        </div>
    </div>;
};

const SegBar = ({pct,color,h=4}) =>
    <div style={{height:h,background:C.border,borderRadius:2,overflow:'hidden',flex:1}}>
        <div className="bar-g" style={{width:`${Math.min(100,pct)}%`,height:'100%',background:color,borderRadius:2}}/>
    </div>;

const Card = ({children,style={}}) =>
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,...style}}>{children}</div>;

const CH = ({title,right,sub}) =>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
        padding:'13px 18px',borderBottom:`1px solid ${C.border}`}}>
        <div>
            <Lbl>{title}</Lbl>
            {sub&&<div style={{fontSize:11,color:C.textDim,fontFamily:THEME.fontBody,marginTop:2}}>{sub}</div>}
        </div>
        {right}
    </div>;

const SqlBlock = ({sql}) => {
    const [cp,setCp]=useState(false);
    const h=sql
        .replace(/(CREATE|DROP|REINDEX|ANALYZE|SELECT|FROM|WHERE|INDEX|ON|USING|CONCURRENTLY|INCLUDE)\b/g,`<span style="color:${C.accent}">$1</span>`)
        .replace(/(btree|hash|gin|gist)/gi,`<span style="color:${C.ok}">$1</span>`)
        .replace(/('.*?')/g,`<span style="color:${C.warn}">$1</span>`)
        .replace(/(--.*$)/gm,`<span style="color:${C.textDim}">$1</span>`);
    return <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 14px',
            background:C.bg,borderBottom:`1px solid ${C.border}`}}>
            <Lbl>SQL · PostgreSQL 14+</Lbl>
            <button onClick={()=>{navigator.clipboard?.writeText(sql);setCp(true);setTimeout(()=>setCp(false),2000);}}
                    className="btn" style={{background:'none',border:`1px solid ${C.border}`,borderRadius:4,
                color:cp?C.ok:C.textSub,fontSize:11,fontFamily:THEME.fontMono,padding:'3px 10px'}}>
                {cp?'✓ Copied':'Copy'}
            </button>
        </div>
        <pre style={{margin:0,padding:'14px 16px',fontSize:12,lineHeight:1.8,background:C.bg,
            color:C.textPrimary,fontFamily:THEME.fontMono,overflowX:'auto',whiteSpace:'pre-wrap'}}>
      <code dangerouslySetInnerHTML={{__html:h}}/>
    </pre>
    </div>;
};

/* ─────────────────────────────────────────────────────────────────────────
   COMMAND PALETTE
───────────────────────────────────────────────────────────────────────── */
const CmdPalette = ({onClose,data,onSelect}) => {
    const [q,setQ]=useState('');
    const ref=React.useRef();
    useEffect(()=>{ref.current?.focus();},[]);
    useEffect(()=>{const h=e=>e.key==='Escape'&&onClose();document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h);},[onClose]);
    const all=useMemo(()=>[
        ...data.missing.map(d=>({...d,_g:'Missing',_c:C.warn})),
        ...data.duplicates.map(d=>({...d,_g:'Duplicate',_c:C.err})),
        ...data.bloat.map(d=>({...d,_g:'Bloat',_c:C.warn})),
        ...data.unused.map(d=>({...d,_g:'Unused',_c:C.textSub})),
    ],[data]);
    const hits=q?all.filter(i=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase())):all.slice(0,8);
    return <div style={{position:'fixed',inset:0,background:'rgba(13,15,20,.82)',backdropFilter:'blur(8px)',
        display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:1001,paddingTop:'14vh'}} onClick={onClose}>
        <div onClick={e=>e.stopPropagation()} style={{width:560,background:C.bgAlt,
            border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',
            animation:'fadeIn .18s ease',boxShadow:'0 32px 64px rgba(0,0,0,.8)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',
                background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:14,color:C.textDim}}>⌕</span>
                <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tables, indexes…"
                       className="ir" style={{flex:1,fontSize:13,color:C.textPrimary}}/>
                <M sz={10}>ESC</M>
            </div>
            <div style={{maxHeight:360,overflowY:'auto'}} className="scroll-thin">
                {hits.map(item=><div key={item.id} onClick={()=>{onSelect(item);onClose();}}
                                     className="rh" style={{padding:'11px 16px',borderBottom:`1px solid ${C.border}15`,
                    display:'flex',gap:12,alignItems:'center'}}>
                    <div style={{width:3,height:30,background:item._c,borderRadius:2,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {item.table||item.indexName}
                            {item.column&&<span style={{color:C.textSub,fontWeight:400,marginLeft:8}}>· {item.column}</span>}
                        </div>
                        <div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,marginTop:1,display:'flex',gap:10}}>
                            <span>{item.schema}</span><span style={{color:item._c}}>{item._g}</span>
                        </div>
                    </div>
                    <span style={{color:C.textDim}}>→</span>
                </div>)}
            </div>
            <div style={{padding:'8px 16px',borderTop:`1px solid ${C.border}`,
                display:'flex',gap:14,fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>
                <span>↑↓ navigate</span><span>↵ open</span><span>ESC close</span>
            </div>
        </div>
    </div>;
};

/* ─────────────────────────────────────────────────────────────────────────
   DRAWER
───────────────────────────────────────────────────────────────────────── */
const Drawer = ({index,onClose,onApply}) => {
    const [tab,setTab]=useState('overview');
    if(!index) return null;
    const sql=genSQL(index);
    const im=index.type==='missing',id=index.type==='duplicates',ib=index.type==='bloat',iu=index.type==='unused';

    return <div style={{position:'fixed',inset:0,zIndex:900,display:'flex',pointerEvents:'none'}}>
        <div style={{flex:1,pointerEvents:'auto'}} onClick={onClose}/>
        <div style={{width:480,background:C.bgAlt,borderLeft:`1px solid ${C.border}`,
            display:'flex',flexDirection:'column',pointerEvents:'auto',
            animation:'slideR .25s cubic-bezier(.22,1,.36,1)',boxShadow:'-20px 0 60px rgba(0,0,0,.5)'}}>

            <div style={{padding:'18px 22px 14px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                        {index.severity&&<Sev level={index.severity}/>}
                        <span style={{fontSize:10,color:C.textDim,background:C.surface,border:`1px solid ${C.border}`,
                            padding:'2px 8px',borderRadius:4,fontFamily:THEME.fontMono}}>{index.type}</span>
                    </div>
                    <button onClick={onClose} className="btn" style={{background:'none',border:`1px solid ${C.border}`,
                        borderRadius:5,color:C.textSub,padding:'5px 12px',fontSize:12}}>Close</button>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:C.textPrimary,fontFamily:THEME.fontBody,marginBottom:4}}>
                    {index.indexName||`${index.schema}.${index.table}`}
                </div>
                <M c={C.textSub} sz={12}>{index.schema}.{index.table}{index.column&&` · (${index.column})`}</M>
            </div>

            <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>
                {['overview','sql','impact','activity'].map(t=><button key={t} className="tab" onClick={()=>setTab(t)} style={{
                    flex:1,padding:'10px 6px',borderBottom:tab===t?`2px solid ${C.accent}`:'2px solid transparent',
                    color:tab===t?C.accent:C.textSub,fontSize:11,fontWeight:tab===t?600:400,letterSpacing:'.03em',textTransform:'capitalize'}}>
                    {t}
                </button>)}
            </div>

            <div style={{flex:1,overflowY:'auto',padding:'16px 22px',display:'flex',flexDirection:'column',gap:12}} className="scroll-thin">

                {tab==='overview'&&<>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        {[
                            im&&{l:'Table size',v:index.tableSize,c:C.textPrimary},
                            im&&{l:'Est. index',v:index.estSize,c:C.textPrimary},
                            im&&{l:'Seq scans/day',v:index.seq_scan?.toLocaleString(),c:C.err},
                            im&&{l:'Current latency',v:`${index.currentLatency}ms`,c:C.warn},
                            ib&&{l:'Index size',v:index.size,c:C.textPrimary},
                            ib&&{l:'Wasted',v:index.wastedSpace,c:C.err},
                            ib&&{l:'Bloat',v:`${index.bloatPct}%`,c:C.err},
                            ib&&{l:'Last vacuum',v:index.lastVacuum,c:C.textSub},
                            id&&{l:'Wasted',v:index.wastedSpace,c:C.err},
                            id&&{l:'Writes/min',v:index.writes,c:C.warn},
                            iu&&{l:'Index size',v:index.size,c:C.textPrimary},
                            iu&&{l:'Total scans',v:index.scans,c:C.err},
                        ].filter(Boolean).map((m,i)=><div key={i} style={{padding:'12px 14px',background:C.surface,
                            border:`1px solid ${C.border}`,borderRadius:6}}>
                            <Lbl style={{display:'block',marginBottom:6}}>{m.l}</Lbl>
                            <div style={{fontSize:20,fontWeight:700,color:m.c,fontFamily:THEME.fontBody,lineHeight:1,marginTop:6}}>{m.v}</div>
                        </div>)}
                    </div>
                    {id&&<Card style={{padding:'14px'}}>
                        <Lbl>Covered by</Lbl>
                        <M c={C.ok} sz={12} style={{display:'block',marginTop:6}}>{index.shadowedBy}</M>
                        <div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,marginTop:6,lineHeight:1.6}}>
                            Dropping won't affect any queries. Covering index handles all access patterns.
                        </div>
                    </Card>}
                    {im&&index.partial&&<Card style={{padding:'14px'}}>
                        <Lbl>Partial condition</Lbl>
                        <M c={C.ok} sz={12} style={{display:'block',marginTop:6}}>{index.partial}</M>
                    </Card>}
                    <Card style={{padding:'14px'}}>
                        <Lbl style={{display:'block',marginBottom:10}}>Risk assessment</Lbl>
                        {[
                            {l:'Downtime risk',v:'None',n:'CONCURRENTLY prevents lock',g:true},
                            {l:'Rollback',v:'Instant',n:'DROP INDEX reverts immediately',g:true},
                            {l:'Write overhead',v:(index.writes||0)>2000?'Medium':'Low',n:`${index.writes||0} writes/min`,g:(index.writes||0)<=2000},
                        ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'8px 0',borderBottom:i<2?`1px solid ${C.borderSub}`:'none'}}>
                            <div>
                                <div style={{fontSize:12,color:C.textSub,fontFamily:THEME.fontBody}}>{r.l}</div>
                                <div style={{fontSize:11,color:C.textDim,fontFamily:THEME.fontBody,marginTop:1}}>{r.n}</div>
                            </div>
                            <span style={{fontSize:12,fontWeight:600,color:r.g?C.ok:C.warn,fontFamily:THEME.fontBody}}>{r.v}</span>
                        </div>)}
                    </Card>
                </>}

                {tab==='sql'&&<>
                    <SqlBlock sql={sql}/>
                    <Card style={{padding:'14px'}}>
                        <Lbl style={{display:'block',marginBottom:8}}>Expected plan change</Lbl>
                        <pre style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontMono,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap'}}>
{`Seq Scan on ${index.table}
  cost=0.00..${((index.currentLatency||400)*4.2).toFixed(0)}
↓
Index Scan using new_idx
  cost=0.43..8.45`}
            </pre>
                    </Card>
                </>}

                {tab==='impact'&&<>
                    {im&&<>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                            {[{l:'Current',v:`${index.currentLatency}ms`,c:C.err},{l:'Projected',v:`${index.estLatency}ms`,c:C.ok}].map(m=><Card key={m.l} style={{padding:'14px',textAlign:'center'}}>
                                <Lbl style={{display:'block',marginBottom:8}}>{m.l} latency</Lbl>
                                <div style={{fontSize:28,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                            </Card>)}
                        </div>
                        <Card style={{padding:'14px',textAlign:'center'}}>
                            <Lbl style={{display:'block',marginBottom:4}}>Performance gain</Lbl>
                            <div style={{fontSize:44,fontWeight:700,color:C.ok,fontFamily:THEME.fontBody,lineHeight:1}}>
                                {Math.round(((index.currentLatency-index.estLatency)/index.currentLatency)*100)}%
                            </div>
                        </Card>
                    </>}
                    {id&&<Card style={{padding:'20px',textAlign:'center'}}>
                        <div style={{fontSize:32,fontWeight:700,color:C.ok,fontFamily:THEME.fontBody,marginBottom:6}}>Zero impact</div>
                        <div style={{fontSize:12,color:C.textSub,fontFamily:THEME.fontBody}}>Queries auto-rerouted to covering index</div>
                    </Card>}
                    <Card style={{padding:'14px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                            <span>✦</span><Lbl>AI prediction</Lbl>
                        </div>
                        <div style={{fontSize:12,color:C.textSub,fontFamily:THEME.fontBody,lineHeight:1.7}}>
                            {im&&`Based on ${index.seq_scan?.toLocaleString()} seq scans/day and ${index.reads?.toLocaleString()} reads/min, this index will reduce CPU load by ~${14+Math.floor(Math.random()*8)}% during peak hours.`}
                            {ib&&`Rebuilding reclaims ${index.wastedSpace}. Expect ${10+Math.floor(index.bloatPct/5)}% faster range scans post-rebuild.`}
                            {id&&`Dropping reduces INSERT overhead by ~${3+Math.floor(Math.random()*4)}% (${index.writes} writes/min). Zero query regressions expected.`}
                            {iu&&`Zero utilization over 90 days. Dropping eliminates one B-tree maintenance operation per write on ${index.table}.`}
                        </div>
                    </Card>
                </>}

                {tab==='activity'&&<>
                    <Lbl>Write pressure · 24h</Lbl>
                    <Card style={{padding:'14px'}}>
                        <div style={{display:'flex',gap:1.5,alignItems:'flex-end',height:44}}>
                            {Array.from({length:24},(_,i)=>{const h=15+Math.sin(i*.5)*20+Math.random()*30;
                                return <div key={i} style={{flex:1,height:`${h}%`,borderRadius:'2px 2px 0 0',
                                    background:h>55?C.err:h>35?C.warn:C.accent,opacity:.7,minWidth:3}}/>;
                            })}
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                            <M sz={10}>00:00</M><M sz={10}>12:00</M><M sz={10}>Now</M>
                        </div>
                    </Card>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        {[{l:'Writes/min',v:(index.writes||0).toLocaleString(),c:C.warn},
                            {l:'Reads/min',v:(index.reads||0).toLocaleString(),c:C.accent},
                            {l:'Lock wait',v:'0.2ms',c:C.ok},{l:'Dead tuples',v:'~4.1K',c:C.textSub}].map(m=>
                            <Card key={m.l} style={{padding:'12px 14px'}}>
                                <Lbl style={{display:'block',marginBottom:5}}>{m.l}</Lbl>
                                <div style={{fontSize:18,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                            </Card>)}
                    </div>
                </>}
            </div>

            <div style={{padding:'14px 22px',borderTop:`1px solid ${C.border}`,background:C.bg,display:'flex',gap:10,flexShrink:0}}>
                <button onClick={()=>onApply(index)} style={{flex:2,padding:'11px',borderRadius:6,background:C.accent,
                    border:'none',color:'#fff',fontWeight:600,fontSize:13,fontFamily:THEME.fontBody,cursor:'pointer'}}>
                    Apply fix
                </button>
                <button className="btn" style={{flex:1,padding:'11px',borderRadius:6,background:C.surface,
                    border:`1px solid ${C.border}`,color:C.textSub,fontSize:12,fontFamily:THEME.fontBody}}>
                    Export SQL
                </button>
            </div>
        </div>
    </div>;
};

/* ─────────────────────────────────────────────────────────────────────────
   APPLY MODAL
───────────────────────────────────────────────────────────────────────── */
const ApplyModal = ({index,onClose}) => {
    const [step,setStep]=useState('ready');
    const sql=genSQL(index);
    return <div style={{position:'fixed',inset:0,background:'rgba(13,15,20,.85)',backdropFilter:'blur(8px)',
        display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
        <div onClick={e=>e.stopPropagation()} style={{width:520,background:C.bgAlt,
            border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',
            animation:'fadeIn .2s ease',boxShadow:'0 40px 80px rgba(0,0,0,.7)'}}>
            <div style={{padding:'18px 22px',borderBottom:`1px solid ${C.border}`,
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                    <Lbl style={{display:'block',marginBottom:4}}>Apply index operation</Lbl>
                    <div style={{fontSize:14,fontWeight:700,color:C.textPrimary,fontFamily:THEME.fontBody}}>{index.table||index.indexName}</div>
                </div>
                <button onClick={onClose} className="btn" style={{background:'none',border:`1px solid ${C.border}`,
                    borderRadius:5,color:C.textSub,padding:'5px 12px',fontSize:12}}>Close</button>
            </div>
            <div style={{padding:'20px 22px'}}>
                <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:20}}>
                    {['Dry run','Review','Execute','Done'].map((s,i)=>{
                        const done=['confirm','executing','done'].includes(step)&&i===0||
                            ['executing','done'].includes(step)&&i===1||step==='done'&&i===2;
                        const active={'ready':0,'dry-run':0,'confirm':1,'executing':2,'done':3}[step]===i;
                        const col=done||active?C.accent:C.border;
                        return <React.Fragment key={s}>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                                <div style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${col}`,
                                    background:done||active?`${C.accent}15`:'transparent',
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    fontSize:11,color:col,fontWeight:600,fontFamily:THEME.fontBody}}>
                                    {done?'✓':i+1}
                                </div>
                                <Lbl color={active?C.accent:done?C.textSub:C.textDim}>{s}</Lbl>
                            </div>
                            {i<3&&<div style={{flex:1,height:1,background:done?C.accent:C.border,marginBottom:16}}/>}
                        </React.Fragment>;
                    })}
                </div>

                {step==='ready'&&<>
                    <SqlBlock sql={sql}/>
                    <button onClick={()=>{setStep('dry-run');setTimeout(()=>setStep('confirm'),1400);}}
                            style={{width:'100%',marginTop:14,padding:'11px',borderRadius:6,background:C.surface,
                                border:`1px solid ${C.border}`,color:C.textPrimary,fontSize:13,fontWeight:600,
                                fontFamily:THEME.fontBody,cursor:'pointer'}}>
                        Run dry-run analysis
                    </button>
                </>}

                {step==='dry-run'&&<div style={{padding:'32px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                    <div style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${C.accent}`,
                        borderTopColor:'transparent',animation:'spin .8s linear infinite'}}/>
                    <M c={C.textSub}>Analyzing execution plan…</M>
                </div>}

                {step==='confirm'&&<>
          <pre style={{padding:'14px',background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:6,fontSize:11,color:C.ok,fontFamily:THEME.fontMono,lineHeight:1.8,whiteSpace:'pre-wrap',marginBottom:14}}>
{`-- DRY RUN RESULTS
-- Lock required:  NONE (CONCURRENTLY)
-- Est. size:      ${index.estSize||index.size||'N/A'}
-- Write overhead: ~3 µs/INSERT
-- Planner:        Index Scan (was Seq Scan)
-- Rows/day:       ${(index.seq_scan||0).toLocaleString()}

-- VERDICT: SAFE TO EXECUTE ✓`}
          </pre>
                    <div style={{display:'flex',gap:10}}>
                        <button onClick={onClose} className="btn" style={{flex:1,padding:'11px',borderRadius:6,
                            background:C.surface,border:`1px solid ${C.border}`,color:C.textSub,fontSize:13,fontFamily:THEME.fontBody,fontWeight:500}}>Cancel</button>
                        <button onClick={()=>{setStep('executing');setTimeout(()=>setStep('done'),2200);}}
                                style={{flex:2,padding:'11px',borderRadius:6,background:C.accent,border:'none',
                                    color:'#fff',fontSize:13,fontWeight:600,fontFamily:THEME.fontBody,cursor:'pointer'}}>
                            Confirm &amp; execute
                        </button>
                    </div>
                </>}

                {step==='executing'&&<>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <M sz={11}>Executing concurrently</M><M sz={11} c={C.ok}>No locks held</M>
                    </div>
                    <div style={{height:4,background:C.border,borderRadius:2,overflow:'hidden',marginBottom:16}}>
                        <div className="bar-g" style={{width:'100%',height:'100%',borderRadius:2,background:C.accent,
                            animationDuration:'2.2s'}}/>
                    </div>
                    {['Acquiring metadata snapshot…','Building index structure…','Validating…'].map((t,i)=>
                        <div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 0',
                            fontSize:12,color:C.textSub,fontFamily:THEME.fontBody}}>
                            <div style={{width:6,height:6,borderRadius:'50%',background:C.ok,flexShrink:0}}/>
                            {t}
                        </div>)}
                </>}

                {step==='done'&&<div style={{textAlign:'center',padding:'24px 0'}}>
                    <div style={{width:56,height:56,borderRadius:'50%',background:C.okBg,
                        border:`2px solid ${C.ok}`,display:'flex',alignItems:'center',justifyContent:'center',
                        margin:'0 auto 14px',fontSize:24}}>✓</div>
                    <div style={{fontSize:18,fontWeight:700,color:C.ok,fontFamily:THEME.fontBody,marginBottom:6}}>Applied successfully</div>
                    <div style={{fontSize:12,color:C.textSub,fontFamily:THEME.fontBody}}>Added to operation log · ANALYZE scheduled</div>
                </div>}
            </div>
        </div>
    </div>;
};

/* ─────────────────────────────────────────────────────────────────────────
   INDEX TABLE
───────────────────────────────────────────────────────────────────────── */
const IndexTable = ({rows,view,onSelect}) => {
    const [sort,setSort]=useState({field:null,dir:'desc'});
    const [filter,setFilter]=useState('');
    const sorted=useMemo(()=>{
        let l=[...rows];
        if(filter) l=l.filter(r=>JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()));
        if(sort.field) l.sort((a,b)=>{const av=a[sort.field],bv=b[sort.field];const c=typeof av==='number'?av-bv:String(av||'').localeCompare(String(bv||''));return sort.dir==='asc'?c:-c;});
        return l;
    },[rows,filter,sort]);
    const tog=f=>setSort(s=>({field:f,dir:s.field===f&&s.dir==='asc'?'desc':'asc'}));

    const TH=({f,children,right})=><th onClick={()=>f&&tog(f)} style={{padding:'10px 16px',
        textAlign:right?'right':'left',fontSize:9.5,fontWeight:500,
        color:sort.field===f?C.accent:C.textDim,cursor:f?'pointer':'default',
        fontFamily:THEME.fontMono,letterSpacing:'.08em',textTransform:'uppercase',
        borderBottom:`1px solid ${C.border}`,background:C.bg,whiteSpace:'nowrap',userSelect:'none'}}>
        {children}{f&&sort.field===f&&<span style={{marginLeft:3,fontSize:9}}>{sort.dir==='asc'?'↑':'↓'}</span>}
    </th>;

    return <>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 16px',
            borderBottom:`1px solid ${C.border}`,background:C.bg}}>
            <span style={{color:C.textDim,fontSize:13}}>⌕</span>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter rows…"
                   className="ir" style={{flex:1,fontSize:12}}/>
            {filter&&<button onClick={()=>setFilter('')} style={{background:'none',border:'none',cursor:'pointer',color:C.textDim,fontSize:13}}>✕</button>}
            <M sz={10}>{sorted.length} rows</M>
        </div>
        <div style={{overflowX:'auto'}} className="scroll-thin">
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
                <thead><tr>
                    {view==='missing'&&<><TH>Severity</TH><TH f="table">Table</TH><TH>Table size</TH><TH f="seq_scan" right>Seq scans</TH><TH f="idx_scan" right>Idx scans</TH><TH></TH></>}
                    {view==='bloat'&&<><TH f="indexName">Index</TH><TH f="table">Table</TH><TH f="bloatPct" right>Bloat</TH><TH>Size</TH><TH>Wasted</TH><TH>Last vacuum</TH><TH></TH></>}
                    {view==='duplicates'&&<><TH f="indexName">Index</TH><TH f="table">Table</TH><TH>Covered by</TH><TH f="wastedSpace" right>Wasted</TH><TH></TH></>}
                    {view==='unused'&&<><TH f="indexName">Index</TH><TH f="table">Table</TH><TH>Size</TH><TH f="scans" right>Scans</TH><TH>Last used</TH><TH></TH></>}
                </tr></thead>
                <tbody>
                {sorted.map((row,i)=><tr key={row.id} className="rh fade-in"
                                         onClick={()=>onSelect(row)}
                                         style={{borderBottom:`1px solid ${C.border}20`,animationDelay:`${i*.03}s`,
                                             background:i%2===0?'transparent':`${C.bg}60`}}>

                    {view==='missing'&&<>
                        <td style={{padding:'12px 16px'}}><Sev level={row.severity}/></td>
                        <td style={{padding:'12px 16px'}}>
                            <div style={{fontSize:13,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody}}>{row.table}</div>
                            <div style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono,marginTop:1}}>{row.schema}</div>
                        </td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textSub}}>{row.tableSize||'—'}</td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:13,fontWeight:500,color:row.seq_scan>100000?C.err:C.warn}}>{(row.seq_scan||0).toLocaleString()}</td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:12,color:C.textSub}}>{(row.idx_scan||0).toLocaleString()}</td>
                        <td style={{padding:'12px 16px'}}><span className="pk" style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono,background:C.surface,border:`1px solid ${C.border}`,padding:'2px 6px',borderRadius:4}}>·</span></td>
                    </>}

                    {view==='bloat'&&<>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textPrimary}}>{row.indexName}</td>
                        <td style={{padding:'12px 16px'}}><div style={{fontSize:13,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody}}>{row.table}</div><div style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>{row.schema}</div></td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:14,fontWeight:600,color:row.bloatPct>50?C.err:C.warn}}>{row.bloatPct}%</td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textSub}}>{row.size}</td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.err}}>{row.wastedSpace}</td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textDim}}>{row.lastVacuum}</td>
                        <td style={{padding:'12px 16px'}}><span className="pk" style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>#{row.hash}</span></td>
                    </>}

                    {view==='duplicates'&&<>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.err}}>{row.indexName}</td>
                        <td style={{padding:'12px 16px'}}><div style={{fontSize:13,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody}}>{row.table}</div><div style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>{row.schema}</div></td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:11,color:C.ok}}>{row.shadowedBy}</td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:13,color:C.warn}}>{row.wastedSpace}</td>
                        <td style={{padding:'12px 16px'}}><span className="pk" style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>#{row.hash}</span></td>
                    </>}

                    {view==='unused'&&<>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textPrimary}}>{row.indexName}</td>
                        <td style={{padding:'12px 16px'}}><div style={{fontSize:13,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody}}>{row.table}</div><div style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>{row.schema}</div></td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.accent}}>{row.size}</td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:13,fontWeight:600,color:row.scans===0?C.err:C.textSub}}>{row.scans}</td>
                        <td style={{padding:'12px 16px',fontFamily:THEME.fontMono,fontSize:12,color:C.textSub}}>{row.lastUsed}</td>
                        <td style={{padding:'12px 16px'}}><span className="pk" style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono}}>#{row.hash}</span></td>
                    </>}
                </tr>)}
                </tbody>
            </table>
        </div>
    </>;
};

/* ─────────────────────────────────────────────────────────────────────────
   RIGHT PANELS
───────────────────────────────────────────────────────────────────────── */
const HealthPanel = ({data}) => {
    const hitRatio = parseFloat(data.hitRatio || 0);
    const seqRate  = parseFloat(data.seqScanRate || 0);
    const efficiency = Math.max(0, Math.round(100 - seqRate * 5));
    return <>
    <Card>
        <CH title="Health gauges"/>
        <div style={{padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:16}}>
                <Arc value={hitRatio} color={C.ok} size={82} label="Hit rate"/>
                <Arc value={Math.min(100, efficiency)} color={C.warn} size={82} label="Efficiency"/>
                <Arc value={Math.max(0,Math.round(100-seqRate*10))} color={C.accent} size={82} label="Scan health"/>
            </div>
            <div style={{height:1,background:C.border,marginBottom:14}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[{l:'Index hit ratio',v:`${hitRatio}%`,c:C.ok},
                  {l:'Seq scan rate',v:`${seqRate}%`,c:C.warn},
                  {l:'Total indexes',v:data.totalIndexes,c:C.accent},
                  {l:'Total size',v:data.totalSize,c:C.textPrimary}].map(m=>
                    <div key={m.l} style={{padding:'10px 12px',background:C.surfaceHi,borderRadius:6}}>
                        <Lbl style={{display:'block',marginBottom:5}}>{m.l}</Lbl>
                        <div style={{fontSize:18,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                    </div>)}
            </div>
        </div>
    </Card>
    </>;
};

const AIPanel = ({view}) => {
    const insights={
        missing:{title:'Sequential scan storm detected',items:[
                {icon:'⚡',head:'Top priority',body:`orders.customer_id + status — 14× speedup on 892K daily seq scans.`},
                {icon:'📐',head:'Size tip',body:`audit_logs partial index saves ~60% (450 MB → 180 MB) via time filter.`},
                {icon:'⚠',head:'Write risk',body:`events at 5,400 writes/min — benchmark covering index before deploy.`},
                {icon:'🧬',head:'Pattern',body:`3 of 6 missing indexes follow (FK, status) — standardize index naming.`},
            ],action:`Deploy orders index first. Est. 847 CPU-hours/month saved.`},
        bloat:{title:'1.4 GB reclaim available now',items:[
                {icon:'🔥',head:'Critical',body:`idx_logs_meta at 65% bloat, 28d since vacuum. REINDEX within 48h.`},
                {icon:'⏱',head:'Vacuum lag',body:`5,200 writes/min with 28d gap — autovacuum_scale_factor too high.`},
                {icon:'📅',head:'Schedule',body:`Optimal window: 02:00–04:00 UTC. ~12–18 min per index.`},
                {icon:'⚙',head:'Config fix',body:`Lower autovacuum_vacuum_scale_factor 0.2 → 0.05 for busy tables.`},
            ],action:`2.6 GB total reclaim. Run sequentially with 5-min cooldowns.`},
        duplicates:{title:'214 MB zero-risk recovery',items:[
                {icon:'✅',head:'Safe to drop',body:`All 4 are strict subsets of covering indexes. Planner auto-reroutes.`},
                {icon:'💾',head:'Write savings',body:`Dropping saves ~1,640 write ops/min across 4 tables.`},
                {icon:'⚠',head:'Code check',body:`Search for USE INDEX (idx_orders_cust) hints before dropping.`},
                {icon:'🔒',head:'Constraint',body:`Confirm idx_users_email_uniq replacement has UNIQUE constraint.`},
            ],action:`Safe to drop all 4 in one maintenance window.`},
        unused:{title:'748 MB of dead indexes',items:[
                {icon:'🗑',head:'idx_temp_fix_2023',body:`Zero scans ever. Likely a 2023 workaround — verify and drop.`},
                {icon:'👻',head:'Batch job risk',body:`Check nightly ETL — batch jobs invisible to pg_stat_user_indexes.`},
                {icon:'📊',head:'Write waste',body:`760 writes/min wasted. ~15% INSERT overhead on orders.`},
                {icon:'🕐',head:'Confidence',body:`Use 90-day pg_stat baseline. Monitor 48h post-drop.`},
            ],action:`Drop in next sprint after 90-day stats confirmation.`},
    };
    const a=insights[view]||insights.missing;
    const [exp,setExp]=useState(false);
    return <Card>
        <CH title="AI analysis" right={<Lbl color={C.textDim}>{view}</Lbl>}/>
        <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
            <div style={{padding:'10px 12px',background:C.accentBg,border:`1px solid ${C.accent}20`,borderRadius:6}}>
                <div style={{fontSize:12,fontWeight:600,color:C.accent,fontFamily:THEME.fontBody,lineHeight:1.4}}>{a.title}</div>
            </div>
            {(exp?a.items:a.items.slice(0,2)).map((it,i)=><div key={i} style={{display:'flex',gap:10,
                padding:'10px 12px',background:C.surfaceHi,borderRadius:6}}>
                <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{it.icon}</span>
                <div>
                    <div style={{fontSize:11,fontWeight:600,color:C.textPrimary,fontFamily:THEME.fontBody,marginBottom:2}}>{it.head}</div>
                    <div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,lineHeight:1.6}}>{it.body}</div>
                </div>
            </div>)}
            <button onClick={()=>setExp(e=>!e)} className="btn" style={{padding:'7px',background:C.surface,
                border:`1px solid ${C.border}`,borderRadius:5,color:C.textSub,fontSize:11,fontFamily:THEME.fontBody}}>
                {exp?'Show less ↑':'Show all insights ↓'}
            </button>
            <div style={{padding:'10px 12px',background:C.okBg,border:`1px solid ${C.ok}18`,borderRadius:6}}>
                <Lbl color={C.ok} style={{display:'block',marginBottom:4}}>Recommendation</Lbl>
                <div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,lineHeight:1.6}}>{a.action}</div>
            </div>
        </div>
    </Card>;
};

const TrendPanel = ({rows,view}) => {
    const [sel,setSel]=useState(0);
    if(!rows.length) return null;
    const row=rows[Math.min(sel,rows.length-1)];
    // Use seq_scan for missing, sizeBytes for others as the "value" metric
    const metric = view==='missing' ? (r=>r.seq_scan||0) : (r=>r.sizeBytes||r.tableSizeBytes||0);
    const maxVal = Math.max(...rows.map(metric), 1);
    const color=view==='missing'?C.warn:view==='bloat'?C.err:C.accent;
    // Build a simple bar chart from sorted rows
    const barData = rows.slice(0,15).map(metric);
    return <Card>
        <CH title="Distribution" right={
            <select value={sel} onChange={e=>setSel(+e.target.value)}
                    style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,
                        color:C.textSub,fontFamily:THEME.fontMono,fontSize:10,padding:'3px 8px',
                        outline:'none',cursor:'pointer'}}>
                {rows.map((r,i)=><option key={i} value={i}>{r.table||r.indexName}</option>)}
            </select>}/>
        <div style={{padding:'14px 18px'}}>
            <MiniBar data={barData} color={color} h={44}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5,marginBottom:12}}>
                <M sz={9}>top {barData.length}</M><M sz={9}>by {view==='missing'?'seq scans':'size'}</M>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[{l:view==='missing'?'Seq scans':'Size bytes',v:metric(row).toLocaleString(),c:color},
                    {l:'Schema',v:row.schema||'—',c:C.textSub},
                    {l:'Issues',v:rows.length,c:C.accent}].map(m=>
                    <div key={m.l} style={{padding:'9px 10px',background:C.surfaceHi,borderRadius:5}}>
                        <Lbl style={{display:'block',marginBottom:4}}>{m.l}</Lbl>
                        <div style={{fontSize:14,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                    </div>)}
            </div>
        </div>
    </Card>;
};

const PgVectorPanel = ({pgvector}) => {
    if (!pgvector || !pgvector.installed) return <Card>
        <CH title="pgvector"/>
        <div style={{padding:'24px',textAlign:'center'}}>
            <div style={{fontSize:12,color:C.textDim,fontFamily:THEME.fontBody}}>pgvector extension not installed or no vector indexes found.</div>
        </div>
    </Card>;
    return <Card>
    <CH title={`pgvector ${pgvector.version||''}`} right={<Lbl color={C.textDim}>{pgvector.indexes.length} indexes</Lbl>}/>
    <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
        {pgvector.indexes.map(idx=><div key={idx.id} style={{padding:'12px 14px',background:C.surfaceHi,
            borderRadius:6,border:`1px solid ${idx.status==='building'?C.warn+'30':C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                    <M sz={12} c={C.textPrimary} w={500} style={{display:'block'}}>{idx.indexName}</M>
                    <M sz={10} style={{display:'block',marginTop:2}}>{idx.type.toUpperCase()} · {idx.dimensions}d</M>
                </div>
                <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4,
                    background:idx.status==='building'?C.warnBg:C.okBg,
                    color:idx.status==='building'?C.warn:C.ok,fontFamily:THEME.fontBody}}>
          {idx.status==='building'?`Building ${idx.buildProgress}%`:'Healthy'}
        </span>
            </div>
            {idx.status==='building'&&<div style={{height:3,background:C.border,borderRadius:2,overflow:'hidden',marginBottom:10}}>
                <div style={{width:`${idx.buildProgress}%`,height:'100%',background:C.warn,borderRadius:2,animation:'pulse 2s infinite'}}/>
            </div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                {[{l:'ANN Recall',v:`${(idx.annRecall*100).toFixed(1)}%`,c:idx.annRecall>0.95?C.ok:C.warn},
                    {l:'Avg query',v:`${idx.avgQueryMs}ms`,c:C.accent},
                    {l:'Vectors',v:`${(idx.totalVectors/1e6).toFixed(1)}M`,c:C.textPrimary}].map(m=>
                    <div key={m.l} style={{padding:'7px',background:C.surface,borderRadius:4,textAlign:'center'}}>
                        <Lbl style={{display:'block',marginBottom:3}}>{m.l}</Lbl>
                        <div style={{fontSize:13,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                    </div>)}
            </div>
            {idx.annRecall<0.95&&<div style={{marginTop:8,padding:'7px 10px',background:C.warnBg,
                border:`1px solid ${C.warn}20`,borderRadius:4,fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,lineHeight:1.5}}>
                Recall below 95% — increase lists or migrate to HNSW for better accuracy.
            </div>}
        </div>)}
    </div>
</Card>;
};

const RowDivPanel = ({data}) => !data||!data.length ? <Card><CH title="Row estimate divergence"/><div style={{padding:'24px',textAlign:'center',fontSize:12,color:C.textDim,fontFamily:THEME.fontBody}}>No divergence data available. Run ANALYZE on your tables.</div></Card> : <Card>
    <CH title="Row estimate divergence" right={<Lbl color={C.err}>{data.length} tables</Lbl>}/>
    <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
        {data.map(row=><div key={row.id} style={{padding:'12px 14px',background:C.surfaceHi,borderRadius:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                    <M sz={12} c={C.textPrimary} w={500}>{row.schema}.{row.table}</M>
                    <div style={{marginTop:2}}><M sz={10}>Last ANALYZE: {row.lastAnalyze}</M></div>
                </div>
                <span style={{fontSize:15,fontWeight:700,color:row.divergence>200?C.err:C.warn,fontFamily:THEME.fontBody}}>{row.divergence}×</span>
            </div>
            {[{l:'Planner',v:row.plannerEst,c:C.accent},{l:'Actual',v:row.actualRows,c:C.err}].map(b=><div key={b.l} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                <div style={{width:50,fontSize:10,color:C.textDim,fontFamily:THEME.fontBody}}>{b.l}</div>
                <div style={{flex:1,height:4,background:C.border,borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:`${Math.max(2,(b.v/row.actualRows)*100)}%`,height:'100%',background:b.c,borderRadius:2,transformOrigin:'left',animation:'grow 1s cubic-bezier(.22,1,.36,1) both'}}/>
                </div>
                <div style={{width:70,fontSize:10,color:b.c,textAlign:'right',fontFamily:THEME.fontMono,fontWeight:500}}>{b.v.toLocaleString()}</div>
            </div>)}
            <div style={{marginTop:8,padding:'5px 8px',background:C.surface,borderRadius:4,fontSize:10.5,color:C.textSub,fontFamily:THEME.fontMono}}>
                ANALYZE {row.schema}.{row.table};
            </div>
        </div>)}
    </div>
</Card>;

const FKPanel = ({data}) => !data||!data.length ? <Card><CH title="FK index gaps"/><div style={{padding:'24px',textAlign:'center',fontSize:12,color:C.textDim,fontFamily:THEME.fontBody}}>No unindexed FK columns detected.</div></Card> : <Card>
    <CH title="FK index gaps" right={<Lbl color={C.err}>{data.length} unindexed</Lbl>}/>
    <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:8}}>
        {data.map(fk=><div key={fk.id} style={{padding:'11px 12px',background:C.surfaceHi,borderRadius:6}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <div>
                    <M sz={12} c={C.textPrimary} w={500}>{fk.table}</M>
                    <M sz={11} c={C.textSub} style={{marginLeft:4}}>.{fk.fkColumn}</M>
                </div>
                <M sz={10}>→ {fk.refsTable}</M>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <M sz={10}>{(fk.rowCount/1e6).toFixed(1)}M rows</M>
                <M sz={10} c={C.warn}>{fk.writes.toLocaleString()} writes/min</M>
            </div>
            <div style={{padding:'5px 8px',background:C.surface,borderRadius:4,fontSize:10.5,color:C.ok,fontFamily:THEME.fontMono,lineHeight:1.6,overflowX:'auto',whiteSpace:'nowrap'}}>
                CREATE INDEX CONCURRENTLY idx_{fk.table}_{fk.fkColumn} ON {fk.schema}.{fk.table} ({fk.fkColumn});
            </div>
        </div>)}
    </div>
</Card>;

const HistoryPanel = ({data}) => {
    const cols={CREATE:C.ok,DROP:C.err,REINDEX:C.accent,VACUUM:C.textSub};
    return <Card>
        <CH title="Operation log"/>
        <div style={{padding:'6px 18px'}}>
            {(!data||data.length===0)&&<div style={{padding:'20px 0',textAlign:'center',fontSize:12,color:C.textDim,fontFamily:THEME.fontBody}}>No operation history available.</div>}
            {(data||[]).map((e,i)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',
                borderBottom:i<data.length-1?`1px solid ${C.borderSub}`:'none'}}>
        <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4,flexShrink:0,
            background:`${cols[e.action]||C.textSub}12`,color:cols[e.action]||C.textSub,fontFamily:THEME.fontMono}}>
          {e.action}
        </span>
                <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:C.textPrimary,fontFamily:THEME.fontMono,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.name}</div>
                    <div style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontBody,marginTop:1}}>{e.ts} · {e.user} · {e.dur}</div>
                </div>
                <span style={{fontSize:13,color:e.ok?C.ok:C.err,flexShrink:0}}>{e.ok?'✓':'✗'}</span>
            </div>)}
        </div>
    </Card>;
};

/* ─────────────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────────────── */
export default function IndexIntelligence() {
    useAdaptiveTheme();
    const [view,setView]=useState('missing');
    const [detail,setDetail]=useState(null);
    const [apply,setApply]=useState(null);
    const [cmd,setCmd]=useState(false);
    const [live,setLive]=useState(true);
    const [rTab,setRTab]=useState('health');

    const { data, loading, error, refresh } = useIndexData(live);

    useEffect(()=>{
        const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setCmd(p=>!p);}};
        document.addEventListener('keydown',h);
        return()=>document.removeEventListener('keydown',h);
    },[]);

    const rows=data[view]||[];
    const total=data.missing.length+data.duplicates.length+data.bloat.length+data.unused.length;

    const VIEWS=[
        {id:'missing',    label:'Missing',    c:C.warn, n:data.missing.length},
        {id:'bloat',      label:'Bloat',      c:C.err,  n:data.bloat.length},
        {id:'duplicates', label:'Duplicates', c:C.warn, n:data.duplicates.length},
        {id:'unused',     label:'Unused',     c:C.textDim, n:data.unused.length},
    ];

    const RTABS=[
        {id:'ai',label:'AI'},{id:'health',label:'Health'},{id:'trend',label:'Trend'},
        {id:'pgvector',label:'pgvector'},{id:'rowdiv',label:'Row est.'},{id:'fk',label:'FK gaps'},{id:'history',label:'Log'},
    ];

    return (
        <div style={{background:C.bg,minHeight:'100vh',fontFamily:THEME.fontBody}}>
            <Styles/>
            <div style={{maxWidth:1400,margin:'0 auto',padding:'0 24px 48px'}}>

                {/* TOPBAR */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'18px 0 20px',borderBottom:`1px solid ${C.border}`,marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:18}}>
                        <div>
                            <div style={{fontSize:18,fontWeight:700,color:C.textPrimary,letterSpacing:'-.01em'}}>
                                Index Intelligence
                            </div>
                            <M sz={10} c={C.textDim} style={{letterSpacing:'.06em',marginTop:2,display:'block'}}>
                                VIGIL · v5.0 · PostgreSQL 14+
                            </M>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 12px',
                            background:loading?C.surface:data.health.criticalCount>0?C.errBg:C.okBg,
                            border:`1px solid ${loading?C.border:data.health.criticalCount>0?C.err+'22':C.ok+'22'}`,borderRadius:20}}>
                            <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,
                                background:loading?C.textDim:data.health.criticalCount>0?C.err:C.ok,
                                animation:!loading&&data.health.criticalCount>0?'pulse 1.4s infinite':'none'}}/>
                            <span style={{fontSize:11,color:loading?C.textDim:data.health.criticalCount>0?C.err:C.ok,fontWeight:600}}>
                {loading?'Loading…':data.health.criticalCount>0?`${data.health.criticalCount} unused`:'All nominal'}
              </span>
                        </div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>setCmd(true)} className="btn" style={{display:'flex',gap:7,alignItems:'center',
                            padding:'7px 14px',border:`1px solid ${C.border}`,borderRadius:6,background:C.surface,color:C.textSub,fontSize:12}}>
                            Search
                            <span style={{border:`1px solid ${C.border}`,padding:'1px 6px',fontSize:10,borderRadius:4,fontFamily:THEME.fontMono}}>⌘K</span>
                        </button>
                        <button onClick={()=>setLive(l=>!l)} style={{display:'flex',gap:6,alignItems:'center',
                            padding:'7px 12px',border:`1px solid ${live?C.ok+'35':C.border}`,borderRadius:6,
                            background:live?C.okBg:C.surface,cursor:'pointer',color:live?C.ok:C.textSub,
                            fontSize:12,fontWeight:500,transition:'all .2s'}}>
                            <div style={{width:7,height:7,borderRadius:'50%',background:live?C.ok:C.textDim,animation:live?'pulse 1.6s infinite':'none'}}/>
                            {live?'Live':'Paused'}
                        </button>
                        <button className="btn" style={{padding:'7px 14px',border:`1px solid ${C.border}`,borderRadius:6,background:C.surface,color:C.textSub,fontSize:12}}>Export</button>
                    </div>
                </div>

                {/* LOADING / ERROR BANNER */}
                {loading&&<div style={{padding:'12px 16px',marginBottom:16,background:`${C.accent}0D`,border:`1px solid ${C.accent}25`,borderRadius:6,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${C.accent}`,borderTopColor:'transparent',animation:'spin .8s linear infinite',flexShrink:0}}/>
                    <span style={{fontSize:12,color:C.textSub,fontFamily:THEME.fontBody}}>Loading live index data…</span>
                </div>}
                {error&&!loading&&<div style={{padding:'12px 16px',marginBottom:16,background:`${C.err}0D`,border:`1px solid ${C.err}25`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                    <span style={{fontSize:12,color:C.err,fontFamily:THEME.fontBody}}>Failed to load: {error}</span>
                    <button onClick={refresh} className="btn" style={{padding:'4px 10px',background:'none',border:`1px solid ${C.err}`,borderRadius:4,color:C.err,fontSize:11}}>Retry</button>
                </div>}

                {/* KPI */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
                    {[
                        {l:'Index hit ratio',v:`${data.health.hitRatio}%`,c:C.ok,cls:'s1'},
                        {l:'Open issues',v:total,c:C.warn,sub:`${data.health.criticalCount} unused`,cls:'s2'},
                        {l:'Total indexes',v:data.health.totalIndexes,c:C.accent,sub:'across all schemas',cls:'s3'},
                        {l:'Index storage',v:data.health.totalSize,c:C.textPrimary,sub:'all indexes',cls:'s4'},
                        {l:'Seq scan rate',v:`${data.health.seqScanRate}%`,c:C.warn,cls:'s5'},
                    ].map(t=><div key={t.l} className={`fade-in ${t.cls}`} style={{padding:'18px 20px',background:C.surface,
                        border:`1px solid ${C.border}`,borderRadius:8,position:'relative',overflow:'hidden',
                        opacity:loading?0.5:1,transition:'opacity .3s'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                            <Lbl>{t.l}</Lbl>
                        </div>
                        <div style={{fontSize:30,fontWeight:700,color:t.c,fontFamily:THEME.fontBody,lineHeight:1,letterSpacing:'-.01em',marginBottom:4}}>{t.v}</div>
                        {t.sub&&<div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody}}>{t.sub}</div>}
                    </div>)}
                </div>

                {/* MAIN */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 295px',gap:16,alignItems:'start'}}>

                    {/* LEFT */}
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${C.border}`}}>
                            {VIEWS.map(v=><button key={v.id} className="tab" onClick={()=>setView(v.id)} style={{
                                padding:'10px 18px',borderBottom:view===v.id?`2px solid ${v.c}`:'2px solid transparent',
                                color:view===v.id?v.c:C.textSub,fontSize:13,fontWeight:view===v.id?600:400}}>
                                {v.label}
                                <span style={{marginLeft:8,fontSize:11,fontWeight:700,color:view===v.id?v.c:C.textDim,fontFamily:THEME.fontMono}}>{v.n}</span>
                            </button>)}
                        </div>

                        <Card>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                                padding:'10px 16px',borderBottom:`1px solid ${C.border}`}}>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                    <Lbl>{VIEWS.find(v=>v.id===view)?.label} indexes</Lbl>
                                    {live&&<div style={{display:'flex',gap:2,alignItems:'center',height:11}}>
                                        {[0,1,2,3,4].map(i=><div key={i} className="wv" style={{width:2.5,height:8,background:C.ok,borderRadius:1}}/>)}
                                    </div>}
                                </div>
                                <div style={{display:'flex',gap:8}}>
                                    <button onClick={refresh} className="btn" style={{padding:'5px 12px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:5,color:C.textSub,fontSize:11}}>Refresh</button>
                                    <button onClick={()=>rows[0]&&setApply(rows[0])} style={{padding:'5px 14px',background:C.accent,border:'none',borderRadius:5,color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>Apply top priority</button>
                                </div>
                            </div>
                            <IndexTable rows={rows} view={view} onSelect={setDetail}/>
                        </Card>

                        <TrendPanel rows={rows} view={view}/>
                    </div>

                    {/* RIGHT */}
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                        <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                            {RTABS.map(t=><button key={t.id} className="tab" onClick={()=>setRTab(t.id)} style={{
                                padding:'5px 10px',borderRadius:5,fontSize:11,fontWeight:rTab===t.id?600:400,
                                background:rTab===t.id?C.surface:C.bg,border:`1px solid ${rTab===t.id?C.border:C.borderSub}`,
                                color:rTab===t.id?C.accent:C.textDim}}>
                                {t.label}
                            </button>)}
                        </div>
                        {rTab==='ai'       &&<AIPanel view={view}/>}
                        {rTab==='health'   &&<HealthPanel data={data.health}/>}
                        {rTab==='trend'    &&<TrendPanel rows={rows} view={view}/>}
                        {rTab==='pgvector' &&<PgVectorPanel pgvector={data.pgvector}/>}
                        {rTab==='rowdiv'   &&<RowDivPanel data={data.rowEstDivergence}/>}
                        {rTab==='fk'       &&<FKPanel data={data.foreignKeyMissing}/>}
                        {rTab==='history'  &&<HistoryPanel data={data.history}/>}
                    </div>
                </div>
            </div>

            {cmd&&<CmdPalette onClose={()=>setCmd(false)} data={data} onSelect={r=>{setDetail(r);setView(r.type);}}/>}
            {detail&&<Drawer index={detail} onClose={()=>setDetail(null)} onApply={idx=>{setDetail(null);setApply(idx);}}/>}
            {apply&&<ApplyModal index={apply} onClose={()=>setApply(null)}/>}
        </div>
    );
}