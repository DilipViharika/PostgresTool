import React, { useState, useEffect, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';

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

const gen30 = (base, v) => Array.from({length:30},(_,i)=>
    Math.max(0, base + Math.sin(i*0.6)*v*0.6 + (Math.random()-0.5)*v*0.5));

const DATA = {
    health: {
        hitRatio: 98.2, totalIndexes: 84, totalWaste: '2.8 GB',
        avgBloat: 44, seqScanRate: 3.7, criticalCount: 2,
        history: gen30(97.5, 1.8),
        seqHistory: gen30(4.2, 1.1),
    },
    missing: [
        { id:1, table:'orders', schema:'public', column:'customer_id, status', severity:'critical',
            seq_scan:892400, tableSize:'4.2 GB', estSize:'210 MB', currentLatency:350, estLatency:12,
            include:'total_amount, created_at', partial:null, writes:420, reads:18200, type:'missing', hash:'4A9F',
            scanHistory: gen30(29000,5000) },
        { id:2, table:'audit_logs', schema:'public', column:'created_at', severity:'critical',
            seq_scan:341000, tableSize:'12 GB', estSize:'450 MB', currentLatency:890, estLatency:28,
            include:null, partial:"created_at > NOW() - INTERVAL '1 year'", writes:2100, reads:8400, type:'missing', hash:'7C3B',
            scanHistory: gen30(11000,2000) },
        { id:3, table:'user_sessions', schema:'auth', column:'user_id, expires_at', severity:'high',
            seq_scan:92000, tableSize:'850 MB', estSize:'38 MB', currentLatency:210, estLatency:8,
            include:'session_token', partial:'expires_at > NOW()', writes:880, reads:6200, type:'missing', hash:'2E8A',
            scanHistory: gen30(3100,600) },
        { id:4, table:'events', schema:'analytics', column:'account_id, event_type', severity:'high',
            seq_scan:74000, tableSize:'8.1 GB', estSize:'320 MB', currentLatency:680, estLatency:40,
            include:'properties', partial:null, writes:5400, reads:4100, type:'missing', hash:'9D2C',
            scanHistory: gen30(2500,500) },
        { id:5, table:'products', schema:'inventory', column:'category_id', severity:'medium',
            seq_scan:18000, tableSize:'290 MB', estSize:'14 MB', currentLatency:95, estLatency:4,
            include:'name, price', partial:'is_active = true', writes:120, reads:3800, type:'missing', hash:'5F1D',
            scanHistory: gen30(600,120) },
        { id:6, table:'notifications', schema:'messaging', column:'recipient_id, read', severity:'medium',
            seq_scan:14200, tableSize:'180 MB', estSize:'9 MB', currentLatency:78, estLatency:5,
            include:'created_at', partial:'read = false', writes:740, reads:2900, type:'missing', hash:'1B6E',
            scanHistory: gen30(480,90) },
    ],
    duplicates: [
        { id:10, indexName:'idx_users_email_uniq', table:'users', schema:'auth', definition:'(email)', shadowedBy:'idx_users_email_name_role', wastedSpace:'45 MB', writes:220, type:'duplicates', hash:'D4A9' },
        { id:11, indexName:'idx_orders_cust', table:'orders', schema:'public', definition:'(customer_id)', shadowedBy:'idx_orders_cust_status_date', wastedSpace:'120 MB', writes:420, type:'duplicates', hash:'F2C7' },
        { id:12, indexName:'idx_products_cat_old', table:'products', schema:'inventory', definition:'(category_id, created_at)', shadowedBy:'idx_products_cat_active_ts', wastedSpace:'31 MB', writes:120, type:'duplicates', hash:'8E3B' },
        { id:13, indexName:'idx_sessions_user', table:'user_sessions', schema:'auth', definition:'(user_id)', shadowedBy:'idx_sessions_user_expires', wastedSpace:'18 MB', writes:880, type:'duplicates', hash:'A1F4' },
    ],
    bloat: [
        { id:20, indexName:'pk_transactions', table:'transactions', schema:'billing', bloatPct:42, size:'850 MB', wastedSpace:'357 MB', fragLevel:4, lastVacuum:'14d ago', writes:1800, type:'bloat', hash:'3C8D', bloatHistory:gen30(40,4) },
        { id:21, indexName:'idx_logs_meta', table:'app_logs', schema:'public', bloatPct:65, size:'2.1 GB', wastedSpace:'1.4 GB', fragLevel:5, lastVacuum:'28d ago', writes:5200, type:'bloat', hash:'6F2A', bloatHistory:gen30(60,6) },
        { id:22, indexName:'idx_audit_ts', table:'audit_logs', schema:'public', bloatPct:38, size:'490 MB', wastedSpace:'186 MB', fragLevel:3, lastVacuum:'7d ago', writes:2100, type:'bloat', hash:'B9E1', bloatHistory:gen30(35,5) },
        { id:23, indexName:'idx_events_acct', table:'events', schema:'analytics', bloatPct:51, size:'1.3 GB', wastedSpace:'663 MB', fragLevel:4, lastVacuum:'21d ago', writes:5400, type:'bloat', hash:'4D7C', bloatHistory:gen30(48,5) },
    ],
    unused: [
        { id:30, indexName:'idx_temp_fix_2023', table:'products', schema:'inventory', size:'450 MB', scans:0, lastUsed:'Never', writes:120, type:'unused', hash:'C2B5' },
        { id:31, indexName:'idx_users_legacy_id', table:'users', schema:'auth', size:'88 MB', scans:0, lastUsed:'180d ago', writes:220, type:'unused', hash:'E8F3' },
        { id:32, indexName:'idx_orders_ref_code', table:'orders', schema:'public', size:'210 MB', scans:2, lastUsed:'94d ago', writes:420, type:'unused', hash:'7A1D' },
    ],
    pgvector: {
        installed: true, version:'0.7.1',
        indexes: [
            { id:40, indexName:'idx_embeddings_hnsw', table:'document_embeddings', schema:'ai', type:'hnsw',
                dimensions:1536, m:16, efConstruction:64, efSearch:40, buildProgress:100,
                annRecall:0.967, avgQueryMs:2.8, totalVectors:2840000, size:'4.2 GB', status:'healthy' },
            { id:41, indexName:'idx_product_ivfflat', table:'product_embeddings', schema:'ai', type:'ivfflat',
                dimensions:768, buildProgress:78, annRecall:0.891, avgQueryMs:8.1, totalVectors:440000,
                listCount:256, size:'890 MB', status:'building' },
        ]
    },
    rowEstDivergence: [
        { id:50, table:'order_items', schema:'public', plannerEst:420, actualRows:184200, divergence:438.6, lastAnalyze:'34d ago', severity:'critical' },
        { id:51, table:'event_properties', schema:'analytics', plannerEst:88, actualRows:27400, divergence:311.4, lastAnalyze:'19d ago', severity:'high' },
        { id:52, table:'notifications', schema:'messaging', plannerEst:3200, actualRows:41800, divergence:13.1, lastAnalyze:'8d ago', severity:'medium' },
    ],
    foreignKeyMissing: [
        { id:60, table:'order_items', schema:'public', fkColumn:'order_id', refsTable:'orders', rowCount:12400000, writes:2800 },
        { id:61, table:'payment_transactions', schema:'billing', fkColumn:'customer_id', refsTable:'customers', rowCount:4200000, writes:1200 },
        { id:62, table:'audit_events', schema:'public', fkColumn:'user_id', refsTable:'users', rowCount:28000000, writes:3400 },
    ],
    history: [
        { ts:'Feb 22, 14:33', action:'CREATE', name:'idx_orders_cust_new', table:'orders', user:'dba_auto', dur:'2m 14s', ok:true },
        { ts:'Feb 21, 03:01', action:'DROP',   name:'idx_users_old_email',  table:'users',  user:'miguel.r', dur:'0.1s', ok:true },
        { ts:'Feb 20, 18:45', action:'REINDEX',name:'pk_transactions',      table:'transactions', user:'scheduler', dur:'8m 42s', ok:true },
        { ts:'Feb 19, 09:12', action:'CREATE', name:'idx_events_tmp',       table:'events', user:'api_svc', dur:'ERR', ok:false },
        { ts:'Feb 18, 02:14', action:'VACUUM', name:'idx_audit_ts',         table:'audit_logs', user:'autovacuum', dur:'14m 02s', ok:true },
    ],
};

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
                    {view==='missing'&&<><TH>Severity</TH><TH f="table">Table</TH><TH>Columns</TH><TH f="seq_scan" right>Seq scans</TH><TH f="currentLatency" right>Latency</TH><TH>Gain</TH><TH></TH></>}
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
                        <td style={{padding:'12px 16px',maxWidth:200}}>
                            <M c={C.ok} sz={11} style={{background:C.okBg,padding:'2px 8px',borderRadius:4,display:'inline-block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{row.column}</M>
                        </td>
                        <td style={{padding:'12px 16px',textAlign:'right',fontFamily:THEME.fontMono,fontSize:13,fontWeight:500,color:row.seq_scan>100000?C.err:C.warn}}>{row.seq_scan.toLocaleString()}</td>
                        <td style={{padding:'12px 16px',textAlign:'right'}}>
                            <div style={{fontFamily:THEME.fontMono,fontSize:12,color:C.err}}>{row.currentLatency}ms</div>
                            <div style={{fontFamily:THEME.fontMono,fontSize:11,color:C.ok}}>→ {row.estLatency}ms</div>
                        </td>
                        <td style={{padding:'12px 16px',minWidth:90}}>
                            <div style={{fontSize:11,color:C.ok,fontFamily:THEME.fontMono,marginBottom:4}}>{Math.round(((row.currentLatency-row.estLatency)/row.currentLatency)*100)}%</div>
                            <SegBar pct={(1-(row.estLatency/row.currentLatency))*100} color={C.ok}/>
                        </td>
                        <td style={{padding:'12px 16px'}}><span className="pk" style={{fontSize:10,color:C.textDim,fontFamily:THEME.fontMono,background:C.surface,border:`1px solid ${C.border}`,padding:'2px 6px',borderRadius:4}}>#{row.hash}</span></td>
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
const HealthPanel = ({data}) => <>
    <Card>
        <CH title="Health gauges"/>
        <div style={{padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:16}}>
                <Arc value={data.hitRatio} color={C.ok} size={82} label="Hit rate"/>
                <Arc value={Math.round(100-data.avgBloat)} color={C.warn} size={82} label="Bloat-free"/>
                <Arc value={Math.round(100-data.seqScanRate*5)} color={C.accent} size={82} label="Efficiency"/>
            </div>
            <div style={{height:1,background:C.border,marginBottom:14}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[{l:'Hit rate 30d',v:`${data.hitRatio}%`,c:C.ok,spark:data.history},
                    {l:'Seq scan rate',v:`${data.seqScanRate}%`,c:C.warn,spark:data.seqHistory}].map(m=>
                    <div key={m.l} style={{padding:'10px 12px',background:C.surfaceHi,borderRadius:6}}>
                        <Lbl style={{display:'block',marginBottom:5}}>{m.l}</Lbl>
                        <div style={{fontSize:18,fontWeight:700,color:m.c,fontFamily:THEME.fontBody,marginBottom:6}}>{m.v}</div>
                        <Spark data={m.spark} color={m.c} w={88} h={20}/>
                    </div>)}
            </div>
        </div>
    </Card>
</>;

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
    const row=rows[sel];
    const hist=row.scanHistory||row.bloatHistory||Array(30).fill(0);
    const color=view==='missing'?C.warn:view==='bloat'?C.err:C.accent;
    const avg7=hist.slice(-7).reduce((a,b)=>a+b,0)/7;
    const avg30=hist.reduce((a,b)=>a+b,0)/hist.length;
    const trend=avg30?((avg7-avg30)/avg30*100).toFixed(1):0;
    return <Card>
        <CH title="30-day trend" right={
            <select value={sel} onChange={e=>setSel(+e.target.value)}
                    style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,
                        color:C.textSub,fontFamily:THEME.fontMono,fontSize:10,padding:'3px 8px',
                        outline:'none',cursor:'pointer'}}>
                {rows.map((r,i)=><option key={i} value={i}>{r.table||r.indexName}</option>)}
            </select>}/>
        <div style={{padding:'14px 18px'}}>
            <MiniBar data={hist} color={color} h={44}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5,marginBottom:12}}>
                <M sz={9}>–30d</M><M sz={9}>Today</M>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[{l:'7-day avg',v:Math.round(avg7).toLocaleString(),c:color},
                    {l:'30-day avg',v:Math.round(avg30).toLocaleString(),c:C.textSub},
                    {l:'Trend',v:`${+trend>0?'+':''}${trend}%`,c:+trend>0?C.err:C.ok}].map(m=>
                    <div key={m.l} style={{padding:'9px 10px',background:C.surfaceHi,borderRadius:5}}>
                        <Lbl style={{display:'block',marginBottom:4}}>{m.l}</Lbl>
                        <div style={{fontSize:14,fontWeight:700,color:m.c,fontFamily:THEME.fontBody}}>{m.v}</div>
                    </div>)}
            </div>
        </div>
    </Card>;
};

const PgVectorPanel = ({pgvector}) => <Card>
    <CH title={`pgvector ${pgvector.version}`} right={<Lbl color={C.textDim}>{pgvector.indexes.length} indexes</Lbl>}/>
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

const RowDivPanel = ({data}) => <Card>
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

const FKPanel = ({data}) => <Card>
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
            {data.map((e,i)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',
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
    const [data]=useState(DATA);
    const [detail,setDetail]=useState(null);
    const [apply,setApply]=useState(null);
    const [cmd,setCmd]=useState(false);
    const [live,setLive]=useState(true);
    const [rTab,setRTab]=useState('ai');

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
                            background:data.health.criticalCount>0?C.errBg:C.okBg,
                            border:`1px solid ${data.health.criticalCount>0?C.err+'22':C.ok+'22'}`,borderRadius:20}}>
                            <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,
                                background:data.health.criticalCount>0?C.err:C.ok,
                                animation:data.health.criticalCount>0?'pulse 1.4s infinite':'none'}}/>
                            <span style={{fontSize:11,color:data.health.criticalCount>0?C.err:C.ok,fontWeight:600}}>
                {data.health.criticalCount>0?`${data.health.criticalCount} critical`:'All nominal'}
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

                {/* KPI */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
                    {[
                        {l:'Index hit ratio',v:`${data.health.hitRatio}%`,c:C.ok,spark:data.health.history,trend:0.4,cls:'s1'},
                        {l:'Open issues',v:total,c:C.warn,sub:`${data.health.criticalCount} critical`,cls:'s2'},
                        {l:'Total indexes',v:data.health.totalIndexes,c:C.accent,sub:'across all schemas',cls:'s3'},
                        {l:'Wasted space',v:data.health.totalWaste,c:C.err,sub:'recoverable',cls:'s4'},
                        {l:'Seq scan rate',v:`${data.health.seqScanRate}%`,c:C.warn,spark:data.health.seqHistory,trend:-0.3,cls:'s5'},
                    ].map(t=><div key={t.l} className={`fade-in ${t.cls}`} style={{padding:'18px 20px',background:C.surface,
                        border:`1px solid ${C.border}`,borderRadius:8,position:'relative',overflow:'hidden'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                            <Lbl>{t.l}</Lbl>
                            {t.trend!=null&&<span style={{fontSize:10,fontWeight:600,color:t.trend>0?C.ok:C.err,fontFamily:THEME.fontBody}}>
                {t.trend>0?'↑':'↓'}{Math.abs(t.trend)}%
              </span>}
                        </div>
                        <div style={{fontSize:30,fontWeight:700,color:t.c,fontFamily:THEME.fontBody,lineHeight:1,letterSpacing:'-.01em',marginBottom:4}}>{t.v}</div>
                        {t.sub&&<div style={{fontSize:11,color:C.textSub,fontFamily:THEME.fontBody,marginBottom:t.spark?8:0}}>{t.sub}</div>}
                        {t.spark&&<Spark data={t.spark} color={t.c} w={110} h={22}/>}
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
                                    <button className="btn" style={{padding:'5px 12px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:5,color:C.textSub,fontSize:11}}>Refresh</button>
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