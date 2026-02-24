import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Void Operations / Deep Space Command Center
   Pitch-black void. Phosphor green terminals. Plasma orange threat signals.
   Quantum blue data streams. Font stack: Space Grotesk → actually Syne + JetBrains Mono
   ═══════════════════════════════════════════════════════════════════════════ */
const T = {
    void: '#04050C',
    abyss: '#070912',
    deep: '#0C0F1E',
    surface: '#101426',
    raised: '#141829',
    glass: '#1A1F35',

    cyan: '#00E5FF',
    cyanDim: '#0099BB',
    cyanFaint: '#00E5FF12',
    cyanGlow: '#00E5FF30',

    plasma: '#FF6B35',
    plasmaFaint: '#FF6B3510',
    plasmaGlow: '#FF6B3530',

    nova: '#FF2D55',
    novaFaint: '#FF2D5510',

    aurora: '#00FF88',
    auroraFaint: '#00FF8808',
    auroraGlow: '#00FF8825',

    stellar: '#FFD60A',
    stellarFaint: '#FFD60A0C',

    nebula: '#BF5AF2',
    nebulaFaint: '#BF5AF210',

    textMain: '#E8ECFF',
    textSub: '#8892AA',
    textDim: '#4A5268',

    border: '#1E2540',
    borderHot: '#2A3060',
    borderActive: '#00E5FF35',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — Rich 30-day histories + all new panels
   ═══════════════════════════════════════════════════════════════════════════ */
const gen30 = (base, variance) => Array.from({length: 30}, (_, i) =>
    Math.max(0, base + (Math.sin(i * 0.4) * variance) + (Math.random() - 0.5) * variance * 0.6)
);

const DATA = {
    health: {
        hitRatio: 98.2, totalIndexes: 84, totalWaste: '2.8 GB',
        avgBloat: 44, seqScanRate: 3.7, criticalCount: 2,
        indexScans: 284710, seqScans: 10922,
        history: gen30(97.5, 1.8),
        seqHistory: gen30(4.2, 1.1),
        writeIOPS: gen30(4200, 800),
        cacheHitHistory: gen30(98.1, 0.6),
    },
    missing: [
        { id:1, table:'orders', schema:'public', column:'customer_id, status', severity:'critical',
            seq_scan:892400, tableSize:'4.2 GB', estSize:'210 MB', currentLatency:350, estLatency:12,
            include:'total_amount, created_at', partial:null, writes:420, reads:18200, type:'missing', hash:'4A9F',
            scanHistory: gen30(29000, 5000), plannerRows: 18200, actualRows: 892400 },
        { id:2, table:'audit_logs', schema:'public', column:'created_at', severity:'critical',
            seq_scan:341000, tableSize:'12 GB', estSize:'450 MB', currentLatency:890, estLatency:28,
            include:null, partial:"created_at > NOW() - INTERVAL '1 year'", writes:2100, reads:8400, type:'missing', hash:'7C3B',
            scanHistory: gen30(11000, 2000), plannerRows: 5000, actualRows: 341000 },
        { id:3, table:'user_sessions', schema:'auth', column:'user_id, expires_at', severity:'high',
            seq_scan:92000, tableSize:'850 MB', estSize:'38 MB', currentLatency:210, estLatency:8,
            include:'session_token', partial:'expires_at > NOW()', writes:880, reads:6200, type:'missing', hash:'2E8A',
            scanHistory: gen30(3100, 600), plannerRows: 3500, actualRows: 92000 },
        { id:4, table:'events', schema:'analytics', column:'account_id, event_type', severity:'high',
            seq_scan:74000, tableSize:'8.1 GB', estSize:'320 MB', currentLatency:680, estLatency:40,
            include:'properties', partial:null, writes:5400, reads:4100, type:'missing', hash:'9D2C',
            scanHistory: gen30(2500, 500), plannerRows: 1200, actualRows: 74000 },
        { id:5, table:'products', schema:'inventory', column:'category_id', severity:'medium',
            seq_scan:18000, tableSize:'290 MB', estSize:'14 MB', currentLatency:95, estLatency:4,
            include:'name, price', partial:'is_active = true', writes:120, reads:3800, type:'missing', hash:'5F1D',
            scanHistory: gen30(600, 120), plannerRows: 900, actualRows: 18000 },
        { id:6, table:'notifications', schema:'messaging', column:'recipient_id, read', severity:'medium',
            seq_scan:14200, tableSize:'180 MB', estSize:'9 MB', currentLatency:78, estLatency:5,
            include:'created_at', partial:'read = false', writes:740, reads:2900, type:'missing', hash:'1B6E',
            scanHistory: gen30(480, 90), plannerRows: 700, actualRows: 14200 },
    ],
    duplicates: [
        { id:10, indexName:'idx_users_email_uniq', table:'users', schema:'auth', definition:'(email)',
            shadowedBy:'idx_users_email_name_role', wastedSpace:'45 MB', writes:220, type:'duplicates', hash:'D4A9' },
        { id:11, indexName:'idx_orders_cust', table:'orders', schema:'public', definition:'(customer_id)',
            shadowedBy:'idx_orders_cust_status_date', wastedSpace:'120 MB', writes:420, type:'duplicates', hash:'F2C7' },
        { id:12, indexName:'idx_products_cat_old', table:'products', schema:'inventory', definition:'(category_id, created_at)',
            shadowedBy:'idx_products_cat_active_ts', wastedSpace:'31 MB', writes:120, type:'duplicates', hash:'8E3B' },
        { id:13, indexName:'idx_sessions_user', table:'user_sessions', schema:'auth', definition:'(user_id)',
            shadowedBy:'idx_sessions_user_expires', wastedSpace:'18 MB', writes:880, type:'duplicates', hash:'A1F4' },
    ],
    bloat: [
        { id:20, indexName:'pk_transactions', table:'transactions', schema:'billing', bloatPct:42,
            size:'850 MB', wastedSpace:'357 MB', fragLevel:4, lastVacuum:'14d ago', writes:1800, type:'bloat', hash:'3C8D',
            bloatHistory: gen30(40, 4) },
        { id:21, indexName:'idx_logs_meta', table:'app_logs', schema:'public', bloatPct:65,
            size:'2.1 GB', wastedSpace:'1.4 GB', fragLevel:5, lastVacuum:'28d ago', writes:5200, type:'bloat', hash:'6F2A',
            bloatHistory: gen30(60, 6) },
        { id:22, indexName:'idx_audit_ts', table:'audit_logs', schema:'public', bloatPct:38,
            size:'490 MB', wastedSpace:'186 MB', fragLevel:3, lastVacuum:'7d ago', writes:2100, type:'bloat', hash:'B9E1',
            bloatHistory: gen30(35, 5) },
        { id:23, indexName:'idx_events_acct', table:'events', schema:'analytics', bloatPct:51,
            size:'1.3 GB', wastedSpace:'663 MB', fragLevel:4, lastVacuum:'21d ago', writes:5400, type:'bloat', hash:'4D7C',
            bloatHistory: gen30(48, 5) },
    ],
    unused: [
        { id:30, indexName:'idx_temp_fix_2023', table:'products', schema:'inventory', size:'450 MB',
            scans:0, lastUsed:'Never', writes:120, type:'unused', hash:'C2B5',
            usageHistory: Array(30).fill(0) },
        { id:31, indexName:'idx_users_legacy_id', table:'users', schema:'auth', size:'88 MB',
            scans:0, lastUsed:'180d ago', writes:220, type:'unused', hash:'E8F3',
            usageHistory: Array(30).fill(0) },
        { id:32, indexName:'idx_orders_ref_code', table:'orders', schema:'public', size:'210 MB',
            scans:2, lastUsed:'94d ago', writes:420, type:'unused', hash:'7A1D',
            usageHistory: [0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    ],
    pgvector: {
        installed: true,
        version: '0.7.1',
        indexes: [
            { id:40, indexName:'idx_embeddings_hnsw', table:'document_embeddings', schema:'ai', type:'hnsw',
                dimensions:1536, m:16, efConstruction:64, efSearch:40, buildProgress:100,
                annRecall:0.967, avgQueryMs:2.8, totalVectors:2840000, listCount:null,
                size:'4.2 GB', lastBuild:'2d ago', status:'healthy' },
            { id:41, indexName:'idx_product_ivfflat', table:'product_embeddings', schema:'ai', type:'ivfflat',
                dimensions:768, m:null, efConstruction:null, efSearch:null, buildProgress:78,
                annRecall:0.891, avgQueryMs:8.1, totalVectors:440000, listCount:256,
                size:'890 MB', lastBuild:'In progress', status:'building' },
        ]
    },
    rowEstDivergence: [
        { id:50, table:'order_items', schema:'public', plannerEst:420, actualRows:184200, divergence:438.6,
            lastAnalyze:'34d ago', severity:'critical', rowCount:12400000 },
        { id:51, table:'event_properties', schema:'analytics', plannerEst:88, actualRows:27400, divergence:311.4,
            lastAnalyze:'19d ago', severity:'high', rowCount:8200000 },
        { id:52, table:'notifications', schema:'messaging', plannerEst:3200, actualRows:41800, divergence:13.1,
            lastAnalyze:'8d ago', severity:'medium', rowCount:920000 },
        { id:53, table:'user_preferences', schema:'auth', plannerEst:8800, actualRows:68200, divergence:7.75,
            lastAnalyze:'12d ago', severity:'medium', rowCount:310000 },
    ],
    foreignKeyMissing: [
        { id:60, table:'order_items', schema:'public', fkColumn:'order_id', refsTable:'orders', hasSupportingIndex:false,
            rowCount:12400000, writes:2800 },
        { id:61, table:'payment_transactions', schema:'billing', fkColumn:'customer_id', refsTable:'customers', hasSupportingIndex:false,
            rowCount:4200000, writes:1200 },
        { id:62, table:'audit_events', schema:'public', fkColumn:'user_id', refsTable:'users', hasSupportingIndex:false,
            rowCount:28000000, writes:3400 },
    ],
    creationHistory: [
        { ts:'2026-02-22 14:33 UTC', action:'CREATE', indexName:'idx_orders_cust_new', table:'orders', user:'dba_auto', duration:'2m 14s', status:'success' },
        { ts:'2026-02-21 03:01 UTC', action:'DROP',   indexName:'idx_users_old_email', table:'users',  user:'miguel.r',  duration:'0.1s',   status:'success' },
        { ts:'2026-02-20 18:45 UTC', action:'REINDEX',indexName:'pk_transactions',    table:'transactions', user:'scheduler', duration:'8m 42s', status:'success' },
        { ts:'2026-02-19 09:12 UTC', action:'CREATE', indexName:'idx_events_tmp',     table:'events',  user:'api_svc',   duration:'ERROR',  status:'failed' },
        { ts:'2026-02-18 02:14 UTC', action:'VACUUM', indexName:'idx_audit_ts',       table:'audit_logs', user:'autovacuum', duration:'14m 02s', status:'success' },
    ],
};

const genSQL = (idx) => {
    if (idx.type === 'missing') {
        return [
            `CREATE INDEX CONCURRENTLY`,
            `  idx_${idx.table}_${idx.column.replace(/[, ]+/g,'_')}`,
            `  ON ${idx.schema}.${idx.table} USING btree (${idx.column})`,
            idx.include ? `  INCLUDE (${idx.include})` : null,
            idx.partial  ? `  WHERE ${idx.partial}` : null,
            `;`,
        ].filter(Boolean).join('\n');
    }
    if (idx.type === 'duplicates') return `-- Safely drop: fully covered by ${idx.shadowedBy}\nDROP INDEX CONCURRENTLY ${idx.indexName};`;
    if (idx.type === 'bloat') return `-- Rebuild with zero downtime\nREINDEX INDEX CONCURRENTLY ${idx.indexName};\n\n-- Then analyze:\nANALYZE ${idx.schema}.${idx.table};`;
    if (idx.type === 'unused') return `-- Verify zero usage, then:\nDROP INDEX CONCURRENTLY ${idx.indexName};\n\n-- Safety check:\nSELECT idx_scan FROM pg_stat_user_indexes\n  WHERE indexrelname = '${idx.indexName}';`;
    return '';
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL CSS
   ═══════════════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    @keyframes slideIn   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:none} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.2} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes scanLine  { 0%{top:-20%} 100%{top:120%} }
    @keyframes ripple    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(3);opacity:0} }
    @keyframes barGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    @keyframes blink     { 0%,80%,100%{opacity:1} 81%,93%{opacity:0} }
    @keyframes waveBar   { 0%,100%{transform:scaleY(.25)} 50%{transform:scaleY(1)} }
    @keyframes glitch    {
      0%,92%,100%{clip-path:none;transform:none}
      93%{clip-path:polygon(0 18%,100% 18%,100% 24%,0 24%);transform:translate(-2px)}
      96%{clip-path:polygon(0 60%,100% 60%,100% 66%,0 66%);transform:translate(2px)}
    }
    @keyframes shimmer   { 0%{left:-100%} 100%{left:200%} }
    @keyframes orbitDot  { 0%{transform:rotate(0deg) translateX(20px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(20px) rotate(-360deg)} }
    @keyframes breathe   { 0%,100%{opacity:.06;transform:scale(1)} 50%{opacity:.14;transform:scale(1.05)} }
    @keyframes countUp   { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:none} }
    @keyframes dataFlow  { 0%{stroke-dashoffset:120} 100%{stroke-dashoffset:0} }

    .stagger>*:nth-child(1){animation-delay:.00s}
    .stagger>*:nth-child(2){animation-delay:.06s}
    .stagger>*:nth-child(3){animation-delay:.12s}
    .stagger>*:nth-child(4){animation-delay:.18s}
    .stagger>*:nth-child(5){animation-delay:.24s}
    .stagger>*:nth-child(6){animation-delay:.30s}
    .stagger>*:nth-child(7){animation-delay:.36s}

    .row-hover { transition:background .1s, border-left-color .1s; cursor:pointer; border-left:2px solid transparent; }
    .row-hover:hover { background:${T.cyanFaint} !important; border-left-color:${T.cyan} !important; }
    .row-hover:hover .reveal { opacity:1 !important; }
    .reveal { opacity:0; transition:opacity .15s; }

    .scroll-thin::-webkit-scrollbar { width:3px; height:3px }
    .scroll-thin::-webkit-scrollbar-thumb { background:${T.cyanDim}; border-radius:2px }
    .scroll-thin::-webkit-scrollbar-track { background:transparent }

    .btn-ghost { transition:all .15s; }
    .btn-ghost:hover { border-color:${T.cyan} !important; background:${T.cyanFaint} !important; color:${T.cyan} !important; }

    .panel-bracket { position:relative; }
    .panel-bracket::before,.panel-bracket::after { content:'';position:absolute;width:12px;height:12px;border-color:${T.cyan};border-style:solid; }
    .panel-bracket::before { top:-1px;left:-1px;border-width:1.5px 0 0 1.5px; }
    .panel-bracket::after  { bottom:-1px;right:-1px;border-width:0 1.5px 1.5px 0; }

    .scan-anim { position:relative; overflow:hidden; }
    .scan-anim::after { content:'';position:absolute;left:0;right:0;height:60px;pointer-events:none;
      background:linear-gradient(to bottom,transparent,${T.cyanFaint},transparent);
      animation:scanLine 7s linear infinite; }

    .glitch-text:hover { animation:glitch .6s step-end; }

    .wave-bar { animation:waveBar 1.1s ease-in-out infinite; }
    .wave-bar:nth-child(2){animation-delay:.12s}
    .wave-bar:nth-child(3){animation-delay:.24s}
    .wave-bar:nth-child(4){animation-delay:.36s}
    .wave-bar:nth-child(5){animation-delay:.48s}

    .cursor-blink::after { content:'▋';animation:blink 1.2s step-end infinite;margin-left:2px; }

    .bar-anim { transform-origin:left; animation:barGrow 1.2s cubic-bezier(.22,1,.36,1) both; }

    .tooltip-wrap { position:relative; display:inline-flex; }
    .tooltip-wrap:hover .tooltip-box { opacity:1; transform:translateX(-50%) translateY(0); pointer-events:auto; }
    .tooltip-box {
      position:absolute; bottom:calc(100% + 8px); left:50%;
      transform:translateX(-50%) translateY(6px);
      background:${T.abyss}; border:1px solid ${T.borderHot};
      padding:5px 10px; border-radius:3px; font-size:10px;
      white-space:nowrap; color:${T.textMain}; pointer-events:none;
      opacity:0; transition:all .15s; z-index:9999;
      font-family:'JetBrains Mono',monospace;
    }

    .grid-bg {
      background-image:
        linear-gradient(${T.cyan}05 1px,transparent 1px),
        linear-gradient(90deg,${T.cyan}05 1px,transparent 1px);
      background-size:24px 24px;
    }

    .glow-text { text-shadow:0 0 24px currentColor; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ATOMIC UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const Dot = ({ color, pulse, size=6 }) => (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
        <div style={{position:'absolute', inset:0, borderRadius:'50%', background:color, boxShadow:`0 0 ${size+2}px ${color}`}} />
        {pulse && <div style={{position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${color}60`, animation:'ripple 2s ease-out infinite'}} />}
    </div>
);

const Badge = ({ level }) => {
    const cfg = {
        critical:{ label:'CRITICAL', color:T.nova   },
        high:    { label:'HIGH',     color:T.plasma  },
        medium:  { label:'MEDIUM',   color:T.stellar },
        low:     { label:'LOW',      color:T.aurora  },
    }[level] || {label:'?', color:T.textSub};
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:5, fontSize:9, fontWeight:700,
            letterSpacing:'.12em', padding:'3px 8px', borderRadius:2,
            background:`${cfg.color}10`, color:cfg.color, border:`1px solid ${cfg.color}25`,
            fontFamily:"'JetBrains Mono',monospace",
        }}>
      <span style={{animation:level==='critical'?'pulse .9s infinite':'none', display:'inline-block', width:5, height:5, borderRadius:'50%', background:cfg.color}} />
            {cfg.label}
    </span>
    );
};

const Waves = ({ count=5, color, height=16 }) => (
    <div style={{display:'flex', gap:2, alignItems:'center', height}}>
        {Array.from({length:count}).map((_,i) => (
            <div key={i} className="wave-bar" style={{
                width:3, height:height*(0.3+Math.random()*0.7),
                background:color, borderRadius:1, animationDelay:`${i*.12}s`,
                boxShadow:`0 0 4px ${color}50`,
            }} />
        ))}
    </div>
);

const SegBar = ({ pct, color, height=5 }) => (
    <div style={{height, background:`${T.textDim}20`, borderRadius:2, overflow:'hidden', flex:1}}>
        <div className="bar-anim" style={{width:`${Math.min(100,pct)}%`, height:'100%',
            background:`linear-gradient(90deg,${color},${color}99)`,
            boxShadow:`0 0 6px ${color}40`}} />
    </div>
);

const FragBar = ({ level }) => (
    <div style={{display:'flex', gap:2}}>
        {[1,2,3,4,5].map(i => {
            const c = level>=5?T.nova:level>=4?T.plasma:level>=3?T.stellar:T.aurora;
            return <div key={i} style={{width:6, height:10, borderRadius:1,
                background:i<=level?c:`${T.textDim}30`,
                boxShadow:i<=level?`0 0 4px ${c}70`:'none'}} />;
        })}
    </div>
);

/* Mini sparkline */
const Spark = ({ data, color, w=80, h=28, fill=false }) => {
    if (!data||data.length<2) return null;
    const min=Math.min(...data), max=Math.max(...data), rng=max-min||1;
    const pts=data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/rng)*(h-4)-2}`).join(' ');
    const lp=pts.split(' ').pop().split(',');
    return (
        <svg width={w} height={h} style={{overflow:'visible',display:'block'}}>
            {fill&&<polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}12`}/>}
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{filter:`drop-shadow(0 0 3px ${color}60)`}}/>
            <circle cx={lp[0]} cy={lp[1]} r={2.5} fill={color} style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
        </svg>
    );
};

/* 30-day bar chart */
const BarChart30 = ({ data, color, h=48, label }) => {
    const max = Math.max(...data);
    return (
        <div>
            {label && <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', marginBottom:6}}>{label}</div>}
            <div style={{display:'flex', gap:1.5, alignItems:'flex-end', height:h}}>
                {data.map((v,i) => (
                    <div key={i} style={{flex:1, height:`${(v/max)*100}%`, minHeight:2,
                        background:v===max?`${color}cc`:`${color}50`,
                        borderRadius:'1px 1px 0 0',
                        transition:`height .4s ease ${i*.01}s`,
                        boxShadow:v===max?`0 0 6px ${color}60`:'none'}} />
                ))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:4}}>
                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>-30d</span>
                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>today</span>
            </div>
        </div>
    );
};

/* SQL highlighter */
const SqlBlock = ({ sql }) => {
    const [copied, setCopied] = useState(false);
    const html = sql
        .replace(/(CREATE|DROP|REINDEX|VACUUM|ANALYZE|SELECT|FROM|WHERE|INDEX|ON|USING|CONCURRENTLY|INCLUDE|AND|OR)\b/g,
            `<span style="color:${T.cyan};font-weight:600">$1</span>`)
        .replace(/(btree|hash|gin|gist|hnsw|ivfflat)/gi, `<span style="color:${T.nebula}">$1</span>`)
        .replace(/('.*?')/g, `<span style="color:${T.aurora}">$1</span>`)
        .replace(/(--.*$)/gm, `<span style="color:${T.textDim}">$1</span>`)
        .replace(/\b(\d+)\b/g, `<span style="color:${T.stellar}">$1</span>`);
    return (
        <div style={{border:`1px solid ${T.border}`, borderRadius:3, overflow:'hidden'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px',
                background:T.void, borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>SQL · PostgreSQL 14+</span>
                <button onClick={() => {navigator.clipboard?.writeText(sql); setCopied(true); setTimeout(()=>setCopied(false),2000);}}
                        style={{background:'none', border:`1px solid ${copied?T.aurora:T.border}`, borderRadius:2,
                            cursor:'pointer', color:copied?T.aurora:T.textDim, fontSize:9.5,
                            fontFamily:"'JetBrains Mono',monospace", padding:'2px 8px', transition:'all .2s',
                            display:'flex', alignItems:'center', gap:5}}>
                    {copied ? '✓ COPIED' : '⎘ COPY'}
                </button>
            </div>
            <pre style={{margin:0, padding:'14px 16px', fontSize:11.5, lineHeight:1.8, background:T.void,
                color:T.textMain, fontFamily:"'JetBrains Mono',monospace", overflowX:'auto'}}>
        <code dangerouslySetInnerHTML={{__html:html}} />
      </pre>
        </div>
    );
};

/* Arc gauge */
const ArcGauge = ({ value, max=100, color, size=100, label }) => {
    const sw=7, r=(size-sw)/2, circ=2*Math.PI*r, filled=circ*(value/max);
    return (
        <div style={{position:'relative', width:size, height:size}}>
            <svg width={size} height={size}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}15`} strokeWidth={sw}/>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                        strokeDasharray={`${filled} ${circ-filled}`} strokeLinecap="round"
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                        style={{transition:'stroke-dasharray 1.5s cubic-bezier(.22,1,.36,1)',
                            filter:`drop-shadow(0 0 6px ${color}60)`}}/>
            </svg>
            <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center'}}>
        <span style={{fontSize:size>80?20:14, fontWeight:800, color, fontFamily:"'Syne',sans-serif", lineHeight:1}}>
          {value}{max===100?'%':''}
        </span>
                {label&&<span style={{fontSize:7.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                    textAlign:'center', marginTop:2, letterSpacing:'.05em'}}>{label}</span>}
            </div>
        </div>
    );
};

/* Metric tile */
const MetTile = ({ label, value, color=T.cyan, Icon, sub, spark, trend }) => (
    <div className="panel-bracket" style={{padding:'16px 18px', background:T.surface,
        border:`1px solid ${color}14`, borderRadius:3, position:'relative', overflow:'hidden',
        animation:'fadeUp .5s ease both', boxShadow:`inset 0 1px 0 ${color}10`}}>
        <div style={{position:'absolute', top:-20, right:-20, width:80, height:80,
            borderRadius:'50%', background:`${color}06`, filter:'blur(20px)', pointerEvents:'none'}} />
        <div style={{position:'relative'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                {Icon && <div style={{padding:7, borderRadius:2, background:`${color}10`, border:`1px solid ${color}18`}}>
                    <Icon size={13} color={color} />
                </div>}
                {trend!=null && <span style={{fontSize:9, fontWeight:700,
                    color:trend>0?T.aurora:T.nova, display:'flex', alignItems:'center', gap:2,
                    fontFamily:"'JetBrains Mono',monospace"}}>
          {trend>0?'↑':'↓'} {Math.abs(trend)}%
        </span>}
            </div>
            <div style={{fontSize:32, fontWeight:800, color, fontFamily:"'Syne',sans-serif",
                lineHeight:1, letterSpacing:'-.01em', marginBottom:4}}>{value}</div>
            <div style={{fontSize:9, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                textTransform:'uppercase', letterSpacing:'.1em', marginBottom:sub?3:0}}>{label}</div>
            {sub&&<div style={{fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{sub}</div>}
            {spark&&<div style={{marginTop:8}}><Spark data={spark} color={color} w={130} h={26} fill/></div>}
        </div>
    </div>
);

/* Latency comparison */
const LatencyViz = ({ before, after }) => {
    const gain = Math.round(((before-after)/before)*100);
    return (
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[{val:before,color:T.nova,label:'CURRENT'},{val:after,color:T.aurora,label:'PROJECTED'}].map(({val,color,label})=>(
                <div key={label} style={{padding:'12px 14px', background:`${color}07`, border:`1px solid ${color}18`, borderRadius:3}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:8.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>{label}</span>
                        <span style={{fontSize:22, fontWeight:800, color, fontFamily:"'Syne',sans-serif"}}>{val}<span style={{fontSize:11}}>ms</span></span>
                    </div>
                    <SegBar pct={(val/Math.max(before,after))*100} color={color} height={4}/>
                </div>
            ))}
            <div style={{textAlign:'center', padding:'12px', background:`${T.aurora}06`,
                border:`1px solid ${T.aurora}18`, borderRadius:3}}>
                <div style={{fontSize:36, fontWeight:800, color:T.aurora, fontFamily:"'Syne',sans-serif", lineHeight:1}}>{gain}%</div>
                <div style={{fontSize:8.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', marginTop:3}}>PERFORMANCE GAIN</div>
            </div>
        </div>
    );
};

/* Radar chart */
const RadarChart = ({ d, size=160 }) => {
    const cx=size/2, cy=size/2, r=size*.36;
    const axes=[
        {label:'Hit Rate',  val:d.hitRatio/100},
        {label:'Low Bloat', val:1-d.avgBloat/100},
        {label:'Efficiency',val:1-d.seqScanRate/20},
        {label:'Coverage',  val:.88},
        {label:'Freshness', val:.76},
        {label:'Perf',      val:.82},
    ];
    const pt=(i,f) => {const a=(i/axes.length)*Math.PI*2-Math.PI/2; return [cx+f*r*Math.cos(a),cy+f*r*Math.sin(a)];};
    const webPts=axes.map((_,i)=>pt(i,axes[i].val).join(',')).join(' ');
    return (
        <svg width={size} height={size}>
            {[.25,.5,.75,1].map(fr=>(
                <polygon key={fr} points={axes.map((_,i)=>pt(i,fr).join(',')).join(' ')}
                         fill="none" stroke={`${T.cyan}08`} strokeWidth={.8}/>
            ))}
            {axes.map((_,i)=>{const[x,y]=pt(i,1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={`${T.cyan}10`} strokeWidth={.8}/>;} )}
            <polygon points={webPts} fill={`${T.cyan}12`} stroke={T.cyan} strokeWidth={1.5}
                     style={{filter:`drop-shadow(0 0 8px ${T.cyan}40)`}}/>
            {axes.map((a,i)=>{const[x,y]=pt(i,1.3); return (
                <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                      fill={T.textSub} fontSize={7.5} fontFamily="'JetBrains Mono',monospace">{a.label}</text>
            );})}
        </svg>
    );
};

/* Row estimate divergence bar */
const DivergenceBar = ({ planner, actual, maxActual }) => {
    const color = actual/planner > 200 ? T.nova : actual/planner > 50 ? T.plasma : T.stellar;
    return (
        <div style={{display:'flex', flexDirection:'column', gap:3}}>
            <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <div style={{fontSize:8.5, color:T.textDim, width:52, fontFamily:"'JetBrains Mono',monospace"}}>Planner</div>
                <div style={{flex:1, height:4, background:`${T.textDim}20`, borderRadius:2, overflow:'hidden'}}>
                    <div className="bar-anim" style={{width:`${(planner/maxActual)*100}%`, height:'100%',
                        background:T.cyanDim, borderRadius:2}} />
                </div>
                <div style={{fontSize:8.5, color:T.cyanDim, width:50, textAlign:'right', fontFamily:"'JetBrains Mono',monospace"}}>{planner.toLocaleString()}</div>
            </div>
            <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <div style={{fontSize:8.5, color:T.textDim, width:52, fontFamily:"'JetBrains Mono',monospace"}}>Actual</div>
                <div style={{flex:1, height:4, background:`${T.textDim}20`, borderRadius:2, overflow:'hidden'}}>
                    <div className="bar-anim" style={{width:`${Math.min(100,(actual/maxActual)*100)}%`, height:'100%',
                        background:color, borderRadius:2, boxShadow:`0 0 6px ${color}60`}} />
                </div>
                <div style={{fontSize:8.5, color, width:50, textAlign:'right', fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>{actual.toLocaleString()}</div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PGVECTOR HEALTH PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const PgVectorPanel = ({ pgvector }) => {
    if (!pgvector.installed) return null;
    return (
        <div style={{background:T.surface, border:`1px solid ${T.nebula}20`, borderRadius:3,
            overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:T.nebula, boxShadow:`0 0 8px ${T.nebula}`}} />
                    <span style={{fontSize:9, color:T.nebula, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700}}>
            PGVECTOR {pgvector.version}
          </span>
                </div>
                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", background:`${T.nebula}10`,
                    padding:'2px 8px', borderRadius:10, border:`1px solid ${T.nebula}20`}}>
          {pgvector.indexes.length} ANN INDEXES
        </span>
            </div>
            <div style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:10}}>
                {pgvector.indexes.map(idx => (
                    <div key={idx.id} style={{padding:'12px', background:`${T.nebula}06`,
                        border:`1px solid ${idx.status==='building'?T.stellar+'30':T.nebula+'18'}`, borderRadius:3}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                            <div>
                                <div style={{fontSize:11, fontWeight:700, color:T.textMain, fontFamily:"'JetBrains Mono',monospace"}}>{idx.indexName}</div>
                                <div style={{fontSize:9, color:T.textDim, marginTop:2, fontFamily:"'JetBrains Mono',monospace"}}>
                                    {idx.schema}.{idx.table} · {idx.type.toUpperCase()} · {idx.dimensions}d
                                </div>
                            </div>
                            <span style={{fontSize:8.5, fontWeight:700, padding:'2px 8px', borderRadius:2,
                                background:idx.status==='building'?`${T.stellar}12`:`${T.aurora}10`,
                                color:idx.status==='building'?T.stellar:T.aurora,
                                border:`1px solid ${idx.status==='building'?T.stellar+'25':T.aurora+'25'}`,
                                fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em'}}>
                {idx.status.toUpperCase()}
              </span>
                        </div>
                        {/* Build progress */}
                        {idx.status==='building' && (
                            <div style={{marginBottom:10}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                                    <span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>BUILD PROGRESS</span>
                                    <span style={{fontSize:8.5, color:T.stellar, fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>{idx.buildProgress}%</span>
                                </div>
                                <div style={{height:5, background:`${T.textDim}20`, borderRadius:3, overflow:'hidden'}}>
                                    <div style={{width:`${idx.buildProgress}%`, height:'100%', borderRadius:3,
                                        background:`linear-gradient(90deg,${T.stellar},${T.plasma})`,
                                        animation:'pulse 2s ease-in-out infinite',
                                        boxShadow:`0 0 8px ${T.stellar}50`}} />
                                </div>
                            </div>
                        )}
                        {/* Metrics grid */}
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
                            {[
                                {l:'ANN RECALL', v:`${(idx.annRecall*100).toFixed(1)}%`, c:idx.annRecall>0.95?T.aurora:idx.annRecall>0.90?T.stellar:T.plasma},
                                {l:'AVG QUERY',  v:`${idx.avgQueryMs}ms`, c:T.cyan},
                                {l:'VECTORS',    v:(idx.totalVectors/1e6).toFixed(1)+'M', c:T.nebula},
                            ].map(m=>(
                                <div key={m.l} style={{padding:'8px 10px', background:`${m.c}06`,
                                    border:`1px solid ${m.c}15`, borderRadius:2}}>
                                    <div style={{fontSize:7.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginBottom:3, letterSpacing:'.08em'}}>{m.l}</div>
                                    <div style={{fontSize:14, fontWeight:800, color:m.c, fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                                </div>
                            ))}
                        </div>
                        {/* HNSW params */}
                        {idx.type==='hnsw' && (
                            <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
                                {[
                                    {l:'m', v:idx.m}, {l:'ef_construction', v:idx.efConstruction}, {l:'ef_search', v:idx.efSearch}
                                ].map(p=>(
                                    <span key={p.l} style={{fontSize:8.5, fontFamily:"'JetBrains Mono',monospace",
                                        color:T.textSub, background:`${T.nebula}08`,
                                        padding:'2px 8px', borderRadius:10, border:`1px solid ${T.nebula}18`}}>
                    {p.l}={p.v}
                  </span>
                                ))}
                            </div>
                        )}
                        {idx.type==='ivfflat' && idx.listCount && (
                            <div style={{marginTop:8}}>
                <span style={{fontSize:8.5, fontFamily:"'JetBrains Mono',monospace",
                    color:T.textSub, background:`${T.nebula}08`,
                    padding:'2px 8px', borderRadius:10, border:`1px solid ${T.nebula}18`}}>
                  lists={idx.listCount}
                </span>
                            </div>
                        )}
                        {/* Recall quality bar */}
                        <div style={{marginTop:8}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>RECALL QUALITY</span>
                                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>
                  Target: &gt;0.95 · {idx.annRecall<0.95?'⚠ Below target':'✓ On target'}
                </span>
                            </div>
                            <div style={{height:4, background:`${T.textDim}20`, borderRadius:2, overflow:'hidden'}}>
                                <div className="bar-anim" style={{width:`${idx.annRecall*100}%`, height:'100%',
                                    background:idx.annRecall>0.95?T.aurora:T.stellar, borderRadius:2}} />
                            </div>
                        </div>
                    </div>
                ))}
                {/* Recommendations */}
                <div style={{padding:'10px 12px', background:`${T.nebula}05`, border:`1px solid ${T.nebula}15`, borderRadius:3}}>
                    <div style={{fontSize:8.5, color:T.nebula, fontFamily:"'JetBrains Mono',monospace",
                        letterSpacing:'.1em', marginBottom:6, fontWeight:700}}>✦ VECTOR INDEX ADVISOR</div>
                    <p style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.7, margin:0}}>
                        idx_product_ivfflat recall at 89.1% — below 95% threshold. Consider increasing <span style={{color:T.nebula}}>lists=512</span> or rebuilding with <span style={{color:T.nebula}}>m=32, ef_construction=128</span> for HNSW migration. idx_embeddings_hnsw performing well at 96.7% recall with 2.8ms avg.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROW ESTIMATE DIVERGENCE PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const RowDivergencePanel = ({ data }) => {
    const maxActual = Math.max(...data.map(r=>r.actualRows));
    return (
        <div style={{background:T.surface, border:`1px solid ${T.plasma}18`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:T.plasma, boxShadow:`0 0 8px ${T.plasma}`}} />
                    <span style={{fontSize:9, color:T.plasma, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700}}>
            ROW ESTIMATE DIVERGENCE
          </span>
                </div>
                <span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>STALE STATS</span>
            </div>
            <div style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:10}}>
                {data.map((row, i) => (
                    <div key={row.id} style={{padding:'12px', background:`${T.surface}`, border:`1px solid ${T.border}`, borderRadius:3,
                        animation:`fadeUp .4s ease ${i*.08}s both`}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                            <div>
                                <div style={{fontSize:11, fontWeight:700, color:T.textMain, fontFamily:"'JetBrains Mono',monospace"}}>{row.schema}.{row.table}</div>
                                <div style={{fontSize:8.5, color:T.textDim, marginTop:2, fontFamily:"'JetBrains Mono',monospace"}}>
                                    Last ANALYZE: {row.lastAnalyze} · {(row.rowCount/1e6).toFixed(1)}M rows
                                </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:16, fontWeight:800,
                                    color:row.divergence>200?T.nova:row.divergence>50?T.plasma:T.stellar,
                                    fontFamily:"'Syne',sans-serif", lineHeight:1}}>{row.divergence}×</div>
                                <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>off by</div>
                            </div>
                        </div>
                        <DivergenceBar planner={row.plannerEst} actual={row.actualRows} maxActual={maxActual}/>
                        <div style={{marginTop:8, padding:'6px 8px', background:`${T.stellar}07`, border:`1px solid ${T.stellar}18`, borderRadius:2,
                            display:'flex', alignItems:'center', gap:8}}>
                            <span style={{fontSize:8, color:T.stellar, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em'}}>FIX:</span>
                            <code style={{fontSize:9, color:T.textSub, fontFamily:"'JetBrains Mono',monospace"}}>
                                ANALYZE {row.schema}.{row.table}; -- or increase default_statistics_target
                            </code>
                        </div>
                    </div>
                ))}
                <div style={{padding:'10px 12px', background:`${T.plasma}05`, border:`1px solid ${T.plasma}15`, borderRadius:3}}>
                    <div style={{fontSize:8.5, color:T.plasma, fontFamily:"'JetBrains Mono',monospace",
                        letterSpacing:'.1em', marginBottom:5, fontWeight:700}}>⚠ PLANNER IMPACT</div>
                    <p style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.7, margin:0}}>
                        3 tables with stale statistics causing suboptimal query plans. order_items (438× divergence) is the most critical — planner choosing sequential scans over index scans due to row estimate error. Run <span style={{color:T.aurora}}>ANALYZE</span> or schedule autovacuum scale factor tuning.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FOREIGN KEY INDEX CHECKER
   ═══════════════════════════════════════════════════════════════════════════ */
const FKIndexPanel = ({ data }) => (
    <div style={{background:T.surface, border:`1px solid ${T.stellar}18`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
        <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
            background:T.abyss, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <div style={{width:8, height:8, borderRadius:'50%', background:T.stellar, boxShadow:`0 0 8px ${T.stellar}`}} />
                <span style={{fontSize:9, color:T.stellar, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700}}>
          FK INDEX COVERAGE
        </span>
            </div>
            <span style={{fontSize:8.5, color:T.nova, fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>
        {data.length} UNINDEXED
      </span>
        </div>
        <div style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:8}}>
            {data.map((fk,i) => (
                <div key={fk.id} style={{padding:'11px 12px', background:`${T.stellar}05`,
                    border:`1px solid ${T.stellar}15`, borderRadius:3, animation:`fadeUp .4s ease ${i*.08}s both`}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                        <div>
              <span style={{fontSize:10.5, fontWeight:700, color:T.nova, fontFamily:"'JetBrains Mono',monospace"}}>
                {fk.schema}.{fk.table}
              </span>
                            <span style={{fontSize:10, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginLeft:6}}>
                .{fk.fkColumn}
              </span>
                        </div>
                        <span style={{fontSize:8, color:T.nova, background:`${T.nova}10`, padding:'2px 6px',
                            borderRadius:2, border:`1px solid ${T.nova}20`, fontFamily:"'JetBrains Mono',monospace"}}>
              MISSING INDEX
            </span>
                    </div>
                    <div style={{fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginBottom:6}}>
                        → references <span style={{color:T.cyanDim}}>{fk.refsTable}</span>
                        · {(fk.rowCount/1e6).toFixed(1)}M rows · {fk.writes.toLocaleString()} writes/min
                    </div>
                    <div style={{padding:'5px 8px', background:`${T.aurora}07`, border:`1px solid ${T.aurora}18`, borderRadius:2}}>
                        <code style={{fontSize:9, color:T.aurora, fontFamily:"'JetBrains Mono',monospace"}}>
                            CREATE INDEX CONCURRENTLY idx_{fk.table}_{fk.fkColumn} ON {fk.schema}.{fk.table} ({fk.fkColumn});
                        </code>
                    </div>
                </div>
            ))}
            <div style={{padding:'9px 12px', background:`${T.stellar}06`, border:`1px solid ${T.stellar}15`, borderRadius:3}}>
                <p style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.7, margin:0}}>
                    Unindexed FK columns cause full table scans during ON DELETE/UPDATE cascades and JOIN operations. <span style={{color:T.stellar}}>audit_events.user_id</span> is highest priority with 28M rows.
                </p>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   CREATION HISTORY LOG
   ═══════════════════════════════════════════════════════════════════════════ */
const HistoryPanel = ({ data }) => {
    const colors = {CREATE:T.aurora, DROP:T.nova, REINDEX:T.cyan, VACUUM:T.nebula};
    return (
        <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center'}}>
                <Waves count={4} color={T.cyan} height={12}/>
                <span style={{fontSize:9, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em'}}>
          INDEX OPERATION LOG
        </span>
            </div>
            <div style={{padding:'10px 14px', display:'flex', flexDirection:'column', gap:0}}>
                {data.map((e,i) => (
                    <div key={i} style={{display:'flex', gap:10, alignItems:'center', padding:'9px 0',
                        borderBottom:i<data.length-1?`1px solid ${T.border}30`:'none',
                        animation:`fadeUp .3s ease ${i*.06}s both`}}>
                        <div style={{width:60, fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", flexShrink:0}}>
                            {e.ts.split(' ')[0].slice(5)}
                        </div>
                        <span style={{fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:2, flexShrink:0,
                            background:`${colors[e.action]||T.textSub}12`, color:colors[e.action]||T.textSub,
                            border:`1px solid ${colors[e.action]||T.textSub}22`,
                            fontFamily:"'JetBrains Mono',monospace"}}>
              {e.action}
            </span>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:10, color:T.textMain, fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{e.indexName}</div>
                            <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>by {e.user} · {e.duration}</div>
                        </div>
                        <span style={{fontSize:8.5, color:e.status==='failed'?T.nova:T.aurora,
                            fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>
              {e.status==='failed'?'✗':'✓'}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PARTIAL INDEX SIMULATOR
   ═══════════════════════════════════════════════════════════════════════════ */
const PartialSimulator = ({ index }) => {
    const [clause, setClause] = useState(index?.partial || "status = 'active'");
    const [selectivity, setSelectivity] = useState(28);

    const fullSize = index ? parseFloat(index.estSize) : 210;
    const unit = index ? (index.estSize.includes('MB')?'MB':'GB') : 'MB';
    const partialSize = (fullSize * (selectivity/100)).toFixed(1);
    const savings = (100-selectivity).toFixed(0);

    return (
        <div style={{background:T.surface, border:`1px solid ${T.aurora}18`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center'}}>
                <div style={{width:8, height:8, borderRadius:'50%', background:T.aurora, boxShadow:`0 0 8px ${T.aurora}`}}/>
                <span style={{fontSize:9, color:T.aurora, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700}}>
          PARTIAL INDEX SIMULATOR
        </span>
            </div>
            <div style={{padding:'14px'}}>
                <div style={{marginBottom:12}}>
                    <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', marginBottom:6}}>WHERE CLAUSE</div>
                    <div style={{display:'flex', gap:6, alignItems:'center', padding:'8px 12px',
                        background:T.abyss, border:`1px solid ${T.borderHot}`, borderRadius:3}}>
                        <span style={{fontSize:10, color:T.cyan, fontFamily:"'JetBrains Mono',monospace"}}>WHERE</span>
                        <input value={clause} onChange={e=>setClause(e.target.value)}
                               style={{flex:1, background:'none', border:'none', outline:'none',
                                   color:T.aurora, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5}}
                               placeholder="status = 'active'"/>
                    </div>
                </div>
                <div style={{marginBottom:12}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                        <span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>SELECTIVITY</span>
                        <span style={{fontSize:9, color:T.stellar, fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>{selectivity}% of rows</span>
                    </div>
                    <input type="range" min={2} max={95} value={selectivity} onChange={e=>setSelectivity(+e.target.value)}
                           style={{width:'100%', accentColor:T.aurora}}/>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
                    {[
                        {l:'FULL INDEX', v:`${fullSize}${unit}`, c:T.nova},
                        {l:'PARTIAL INDEX', v:`${partialSize}${unit}`, c:T.aurora},
                        {l:'SIZE SAVED', v:`${savings}%`, c:T.cyan},
                    ].map(m=>(
                        <div key={m.l} style={{padding:'10px 12px', background:`${m.c}07`,
                            border:`1px solid ${m.c}18`, borderRadius:3, textAlign:'center'}}>
                            <div style={{fontSize:7.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', marginBottom:4}}>{m.l}</div>
                            <div style={{fontSize:20, fontWeight:800, color:m.c, fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                        </div>
                    ))}
                </div>
                <div style={{height:8, background:`${T.textDim}20`, borderRadius:4, overflow:'hidden', position:'relative'}}>
                    <div className="bar-anim" style={{width:`${selectivity}%`, height:'100%',
                        background:`linear-gradient(90deg,${T.aurora},${T.cyan})`,
                        borderRadius:4, boxShadow:`0 0 8px ${T.aurora}50`}}/>
                </div>
                {clause && (
                    <div style={{marginTop:12, padding:'8px 12px', background:`${T.aurora}06`,
                        border:`1px solid ${T.aurora}15`, borderRadius:3}}>
                        <code style={{fontSize:9.5, color:T.aurora, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6}}>
                            CREATE INDEX CONCURRENTLY<br/>
                            &nbsp;&nbsp;idx_{index?.table||'table'}_partial<br/>
                            &nbsp;&nbsp;ON {index?.schema||'schema'}.{index?.table||'table'} ({index?.column||'column'})<br/>
                            &nbsp;&nbsp;WHERE {clause};
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   30-DAY USAGE TREND PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const UsageTrendPanel = ({ rows, view }) => {
    const [selected, setSelected] = useState(0);
    if (!rows.length) return null;
    const row = rows[selected];
    const hist = row.scanHistory || row.bloatHistory || row.usageHistory || gen30(100, 20);
    const color = view==='missing'?T.plasma:view==='bloat'?T.nova:view==='unused'?T.textSub:T.stellar;

    return (
        <div style={{background:T.surface, border:`1px solid ${color}18`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'11px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <Waves count={4} color={color} height={12}/>
                    <span style={{fontSize:9, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em'}}>
            30-DAY USAGE TREND
          </span>
                </div>
                <select value={selected} onChange={e=>setSelected(+e.target.value)}
                        style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:2,
                            color:T.textSub, fontFamily:"'JetBrains Mono',monospace", fontSize:9, padding:'2px 6px',
                            outline:'none', cursor:'pointer'}}>
                    {rows.map((r,i)=>(
                        <option key={i} value={i}>{r.table||r.indexName}</option>
                    ))}
                </select>
            </div>
            <div style={{padding:'14px'}}>
                <div style={{marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <div style={{fontSize:12, fontWeight:700, color:T.textMain, fontFamily:"'JetBrains Mono',monospace"}}>{row.table||row.indexName}</div>
                        <div style={{fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginTop:2}}>{row.schema}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:20, fontWeight:800, color, fontFamily:"'Syne',sans-serif"}}>{Math.round(hist[hist.length-1]).toLocaleString()}</div>
                        <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{view==='bloat'?'bloat %':'scans/day'}</div>
                    </div>
                </div>
                <BarChart30 data={hist} color={color} h={52}/>
                {/* Trend analysis */}
                {(() => {
                    const avg7 = hist.slice(-7).reduce((a,b)=>a+b,0)/7;
                    const avg30 = hist.reduce((a,b)=>a+b,0)/hist.length;
                    const trend = ((avg7-avg30)/avg30*100).toFixed(1);
                    const trendUp = +trend > 0;
                    return (
                        <div style={{marginTop:10, display:'flex', gap:8}}>
                            <div style={{flex:1, padding:'8px 10px', background:`${T.surface}`, border:`1px solid ${T.border}`, borderRadius:2}}>
                                <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>7-DAY AVG</div>
                                <div style={{fontSize:14, fontWeight:700, color, fontFamily:"'Syne',sans-serif"}}>{Math.round(avg7).toLocaleString()}</div>
                            </div>
                            <div style={{flex:1, padding:'8px 10px', background:`${T.surface}`, border:`1px solid ${T.border}`, borderRadius:2}}>
                                <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>30-DAY AVG</div>
                                <div style={{fontSize:14, fontWeight:700, color:T.textSub, fontFamily:"'Syne',sans-serif"}}>{Math.round(avg30).toLocaleString()}</div>
                            </div>
                            <div style={{flex:1, padding:'8px 10px',
                                background:trendUp?`${T.nova}07`:`${T.aurora}07`,
                                border:`1px solid ${trendUp?T.nova:T.aurora}18`, borderRadius:2}}>
                                <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>TREND</div>
                                <div style={{fontSize:14, fontWeight:700, color:trendUp?T.nova:T.aurora, fontFamily:"'Syne',sans-serif"}}>
                                    {trendUp?'↑':'↓'}{Math.abs(+trend)}%
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI ANALYSIS PANEL — advanced multi-signal
   ═══════════════════════════════════════════════════════════════════════════ */
const AIAnalysisPanel = ({ view, data }) => {
    const [expanded, setExpanded] = useState(false);
    const analyses = {
        missing: {
            headline: 'Sequential scan storm detected on 2 critical tables',
            signals: [
                {icon:'⚡', label:'Highest ROI', text:`orders.customer_id,status composite: 14.2× speedup, 892K seq scans/day. Priority #1.`, color:T.nova},
                {icon:'📦', label:'Size Optimization', text:`audit_logs partial index saves ~60% (450MB→180MB) via temporal WHERE clause. Recommend time-partitioned partial index.`, color:T.stellar},
                {icon:'🔮', label:'Write Impact', text:`events table (5,400 writes/min) — covering index may slow inserts by ~4%. Benchmark before production deploy.`, color:T.plasma},
                {icon:'🧬', label:'Schema Pattern', text:`3 of 6 missing indexes follow (foreign_key, status) pattern — consider standardizing composite index convention.`, color:T.nebula},
            ],
            recommendation: 'Deploy orders index in next maintenance window. Estimated cumulative query time savings: 847 CPU-hours/month.',
        },
        bloat: {
            headline: 'idx_logs_meta at 65% bloat — 1.4 GB reclaim available immediately',
            signals: [
                {icon:'💥', label:'Critical: idx_logs_meta', text:`65% bloat, 5/5 fragmentation. REINDEX CONCURRENTLY should run within 48h. Requires ~4GB temp space.`, color:T.nova},
                {icon:'⏱', label:'Vacuum Lag Analysis', text:`idx_logs_meta last vacuumed 28d ago despite 5,200 writes/min. autovacuum_vacuum_cost_delay likely misconfigured.`, color:T.plasma},
                {icon:'📅', label:'Schedule', text:`Optimal rebuild window: 02:00–04:00 UTC (lowest write IOPS). Estimated completion: 12–18 min per index.`, color:T.stellar},
                {icon:'⚙', label:'Config Recommendation', text:`Increase autovacuum_vacuum_scale_factor from 0.2 → 0.05 for high-write tables. Would prevent this recurrence.`, color:T.cyan},
            ],
            recommendation: 'Total reclaim: 2.6 GB across 4 indexes. Run REINDEX operations sequentially with 5-minute cooldown intervals.',
        },
        duplicates: {
            headline: 'Zero-risk 214 MB recovery — all 4 duplicates safe to drop',
            signals: [
                {icon:'🔍', label:'Coverage Analysis', text:`All 4 indexes are strict subsets of existing covering indexes. Query planner will auto-route with no hints required.`, color:T.aurora},
                {icon:'💾', label:'Write Savings', text:`Dropping reduces B-tree maintenance per INSERT: saves ~1,640 write operations/min across 4 tables.`, color:T.stellar},
                {icon:'⚠', label:'idx_orders_cust Warning', text:`Verify no application code specifies USE INDEX (orders.idx_orders_cust) — search codebase before dropping.`, color:T.plasma},
                {icon:'🔒', label:'Constraint Check', text:`idx_users_email_uniq — confirm replacement carries UNIQUE constraint before dropping.`, color:T.cyan},
            ],
            recommendation: 'Safe to drop all 4 in a single maintenance window. Use CONCURRENTLY to avoid table locks.',
        },
        unused: {
            headline: 'idx_temp_fix_2023 — 450 MB dead index, 0 scans in 90+ days',
            signals: [
                {icon:'🗑', label:'idx_temp_fix_2023', text:`Zero scans ever. Name suggests temporary fix from 2023. Verify with engineering team — likely safe to drop immediately.`, color:T.nova},
                {icon:'👻', label:'idx_users_legacy_id', text:`Last used 180d ago. Check if any batch jobs or reports reference this — nightly ETL processes often invisible to pg_stat.`, color:T.plasma},
                {icon:'🕐', label:'idx_orders_ref_code', text:`2 scans in 94 days is effectively zero. Investigate if ref_code column is still actively used in business logic.`, color:T.stellar},
                {icon:'📊', label:'Write Impact', text:`Combined 760 writes/min wasted on 3 dead indexes. Dropping saves ~15% INSERT overhead on orders and products.`, color:T.cyan},
            ],
            recommendation: 'Confirm with 90-day pg_stat_user_indexes baseline. Schedule drop in next sprint. Monitor for 48h post-drop.',
        },
    };
    const a = analyses[view] || analyses.missing;

    return (
        <div style={{background:T.surface, border:`1px solid ${T.stellar}20`, borderRadius:3, overflow:'hidden'}} className="panel-bracket">
            <div style={{padding:'12px 14px', borderBottom:`1px solid ${T.border}`,
                background:T.abyss, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{position:'relative'}}>
                        <div style={{width:28, height:28, borderRadius:'50%', background:`${T.stellar}15`,
                            border:`1px solid ${T.stellar}30`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <span style={{fontSize:14}}>✦</span>
                        </div>
                        <div style={{position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${T.stellar}30`,
                            animation:'ripple 2s ease-out infinite'}} />
                    </div>
                    <div>
                        <div style={{fontSize:9, color:T.stellar, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700}}>AI ANALYSIS ENGINE</div>
                        <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>Multi-signal · 30-day window</div>
                    </div>
                </div>
                <Waves count={5} color={T.stellar} height={14}/>
            </div>
            <div style={{padding:'14px'}}>
                {/* Headline */}
                <div style={{padding:'10px 12px', background:`${T.stellar}07`, border:`1px solid ${T.stellar}18`,
                    borderRadius:3, marginBottom:12}}>
                    <div style={{fontSize:10.5, fontWeight:700, color:T.stellar, fontFamily:"'JetBrains Mono',monospace",
                        lineHeight:1.5}}>{a.headline}</div>
                </div>
                {/* Signal cards */}
                <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:12}}>
                    {(expanded ? a.signals : a.signals.slice(0,2)).map((s,i) => (
                        <div key={i} style={{display:'flex', gap:10, padding:'10px 11px',
                            background:`${s.color}06`, border:`1px solid ${s.color}15`, borderRadius:3}}>
                            <div style={{width:28, height:28, borderRadius:2, background:`${s.color}12`,
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14}}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{fontSize:8.5, color:s.color, fontFamily:"'JetBrains Mono',monospace",
                                    letterSpacing:'.1em', fontWeight:700, marginBottom:3}}>{s.label}</div>
                                <div style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.65}}>{s.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Expand */}
                <button onClick={() => setExpanded(e=>!e)}
                        className="btn-ghost" style={{width:'100%', padding:'7px', marginBottom:10,
                    background:'transparent', border:`1px solid ${T.border}`, borderRadius:2,
                    cursor:'pointer', color:T.textDim, fontSize:9, fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:'.1em'}}>
                    {expanded?'▲ SHOW LESS':'▼ SHOW ALL SIGNALS'}
                </button>
                {/* Recommendation */}
                <div style={{padding:'10px 12px', background:`${T.aurora}05`, border:`1px solid ${T.aurora}15`, borderRadius:3}}>
                    <div style={{fontSize:8.5, color:T.aurora, fontFamily:"'JetBrains Mono',monospace",
                        letterSpacing:'.1em', fontWeight:700, marginBottom:5}}>⟶ RECOMMENDATION</div>
                    <div style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.7}}>{a.recommendation}</div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════════════════════ */
const CmdPalette = ({ onClose, data, onSelect }) => {
    const [q, setQ] = useState('');
    const ref = useRef();
    useEffect(() => { ref.current?.focus(); }, []);
    useEffect(() => {
        const h = e => e.key==='Escape' && onClose();
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);

    const all = useMemo(() => [
        ...data.missing.map(d=>({...d,_g:'MISSING',_c:T.plasma})),
        ...data.duplicates.map(d=>({...d,_g:'DUPLICATE',_c:T.nova})),
        ...data.bloat.map(d=>({...d,_g:'BLOAT',_c:T.plasma})),
        ...data.unused.map(d=>({...d,_g:'UNUSED',_c:T.textSub})),
    ], [data]);

    const hits = q ? all.filter(i=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase())) : all.slice(0,8);

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(4,5,12,.9)', backdropFilter:'blur(10px)',
            display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:10001, paddingTop:'12vh'}}
             onClick={onClose}>
            <div onClick={e=>e.stopPropagation()} style={{width:580, background:T.surface,
                border:`1px solid ${T.borderActive}`, borderRadius:4, overflow:'hidden',
                animation:'fadeUp .2s ease', boxShadow:`0 40px 80px rgba(0,0,0,.95), 0 0 60px ${T.cyanGlow}`}}>
                <div style={{display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                    background:T.abyss, borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:13}}>⌖</span>
                    <input ref={ref} value={q} onChange={e=>setQ(e.target.value)}
                           placeholder="Search indexes, tables, columns…"
                           style={{flex:1, background:'none', border:'none', outline:'none',
                               color:T.textMain, fontFamily:"'JetBrains Mono',monospace", fontSize:12.5}}/>
                    <span style={{fontSize:9, color:T.textDim, border:`1px solid ${T.border}`,
                        padding:'1px 6px', borderRadius:2, fontFamily:"'JetBrains Mono',monospace"}}>ESC</span>
                </div>
                <div className="scroll-thin" style={{maxHeight:380, overflowY:'auto'}}>
                    {hits.map(item=>(
                        <div key={item.id} onClick={() => {onSelect(item); onClose();}}
                             style={{padding:'11px 16px', borderBottom:`1px solid ${T.border}20`,
                                 display:'flex', gap:12, alignItems:'center', cursor:'pointer', transition:'background .1s'}}
                             onMouseEnter={e=>e.currentTarget.style.background=T.cyanFaint}
                             onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <div style={{width:3, height:28, background:item._c, borderRadius:2, flexShrink:0}} />
                            <div style={{flex:1, minWidth:0}}>
                                <div style={{fontSize:12, fontWeight:600, color:T.textMain,
                                    fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                    {item.table||item.indexName}
                                    {item.column&&<span style={{color:T.cyanDim, marginLeft:8}}>· {item.column}</span>}
                                </div>
                                <div style={{fontSize:9, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                                    marginTop:2, display:'flex', gap:10}}>
                                    <span>{item.schema}</span>
                                    <span style={{color:item._c}}>{item._g}</span>
                                    {item.hash&&<span style={{color:T.textDim}}>#{item.hash}</span>}
                                </div>
                            </div>
                            <span style={{color:T.textDim, fontSize:12}}>→</span>
                        </div>
                    ))}
                </div>
                <div style={{padding:'7px 16px', borderTop:`1px solid ${T.border}`,
                    display:'flex', gap:14, fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>
                    <span>↑↓ navigate</span><span>↵ open</span><span>ESC dismiss</span>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ONE-CLICK APPLY MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const ApplyModal = ({ index, onClose }) => {
    const [step, setStep] = useState('ready'); // ready | dry-run | confirm | executing | done
    const [dryRunOutput, setDryRunOutput] = useState('');
    const sql = genSQL(index);

    const doDryRun = () => {
        setStep('dry-run');
        setTimeout(() => {
            setDryRunOutput(`-- DRY RUN ANALYSIS\n-- Table: ${index.schema}.${index.table}\n-- Estimated index size: ${index.estSize||index.size||'N/A'}\n-- Write overhead: +${index.type==='missing'?'~3':'0'} µs/INSERT\n-- Lock required: NONE (CONCURRENTLY)\n-- Planner will use: Index Scan\n-- Rows estimated to benefit: ${(index.seq_scan||0).toLocaleString()}\n\n-- VERDICT: SAFE TO EXECUTE ✓`);
            setStep('confirm');
        }, 1200);
    };

    const doExecute = () => {
        setStep('executing');
        setTimeout(() => setStep('done'), 2500);
    };

    const stepColors = {ready:T.cyan, 'dry-run':T.stellar, confirm:T.aurora, executing:T.plasma, done:T.aurora};
    const color = stepColors[step] || T.cyan;

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(4,5,12,.88)', backdropFilter:'blur(10px)',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:10002}}
             onClick={onClose}>
            <div onClick={e=>e.stopPropagation()} style={{width:540, background:T.surface,
                border:`1px solid ${color}30`, borderRadius:4, overflow:'hidden',
                animation:'fadeUp .25s ease', boxShadow:`0 40px 80px rgba(0,0,0,.9), 0 0 50px ${color}15`}}>
                <div style={{padding:'16px 20px', borderBottom:`1px solid ${T.border}`,
                    background:T.abyss, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <div style={{fontSize:9, color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', fontWeight:700, marginBottom:3}}>
                            {step==='done'?'✓ APPLIED':'⟶ INDEX OPERATION'}
                        </div>
                        <div style={{fontSize:13, fontWeight:700, color:T.textMain, fontFamily:"'Space Grotesk',sans-serif"}}>{index.table||index.indexName}</div>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:`1px solid ${T.border}`, borderRadius:2,
                        cursor:'pointer', color:T.textDim, padding:'4px 10px', fontSize:9,
                        fontFamily:"'JetBrains Mono',monospace"}}>✕ CLOSE</button>
                </div>
                <div style={{padding:'20px'}}>
                    {/* Progress steps */}
                    <div style={{display:'flex', gap:0, marginBottom:20}}>
                        {['Dry Run','Confirm','Execute','Done'].map((s,i) => {
                            const stepMap = ['dry-run','confirm','executing','done'];
                            const idx = stepMap.indexOf(step);
                            const done = idx > i || step==='done';
                            const active = stepMap[i]===step;
                            const c = done||active?color:T.textDim;
                            return (
                                <div key={s} style={{flex:1, display:'flex', alignItems:'center'}}>
                                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', flex:1}}>
                                        <div style={{width:24, height:24, borderRadius:'50%', border:`1.5px solid ${c}`,
                                            background:done||active?`${c}18`:'transparent',
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            fontSize:10, color:c, fontWeight:700, marginBottom:4}}>
                                            {done&&!active?'✓':i+1}
                                        </div>
                                        <span style={{fontSize:8, color:c, fontFamily:"'JetBrains Mono',monospace"}}>{s}</span>
                                    </div>
                                    {i<3 && <div style={{height:1, width:'100%', background:done?color:T.border, flex:1, marginBottom:16, flexShrink:1}} />}
                                </div>
                            );
                        })}
                    </div>

                    {step === 'ready' && (
                        <>
                            <div style={{marginBottom:14}}><SqlBlock sql={sql}/></div>
                            <button onClick={doDryRun} style={{width:'100%', padding:'12px',
                                background:`linear-gradient(135deg,${T.cyan},${T.cyanDim})`,
                                border:'none', borderRadius:3, cursor:'pointer', color:T.void,
                                fontSize:13, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif",
                                letterSpacing:'.06em', boxShadow:`0 4px 20px ${T.cyanGlow}`}}>
                                ▶ RUN DRY-RUN ANALYSIS
                            </button>
                        </>
                    )}

                    {step === 'dry-run' && (
                        <div style={{textAlign:'center', padding:'30px 0'}}>
                            <div style={{width:40, height:40, borderRadius:'50%', border:`2px solid ${T.stellar}`,
                                borderTopColor:'transparent', animation:'spin .8s linear infinite', margin:'0 auto 14px'}}/>
                            <div style={{fontSize:10, color:T.stellar, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em'}} className="cursor-blink">ANALYZING EXECUTION PLAN</div>
                        </div>
                    )}

                    {step === 'confirm' && (
                        <>
              <pre style={{padding:'12px 14px', background:T.abyss, border:`1px solid ${T.aurora}20`,
                  borderRadius:3, fontSize:10.5, color:T.aurora, fontFamily:"'JetBrains Mono',monospace",
                  lineHeight:1.7, marginBottom:14, overflowX:'auto', whiteSpace:'pre-wrap'}}>
                {dryRunOutput}
              </pre>
                            <div style={{display:'flex', gap:10}}>
                                <button onClick={onClose} className="btn-ghost" style={{flex:1, padding:'11px',
                                    background:'transparent', border:`1px solid ${T.border}`, borderRadius:3,
                                    cursor:'pointer', color:T.textSub, fontSize:12, fontFamily:"'Space Grotesk',sans-serif", fontWeight:600}}>
                                    CANCEL
                                </button>
                                <button onClick={doExecute} style={{flex:2, padding:'11px',
                                    background:`linear-gradient(135deg,${T.aurora},${T.cyanDim})`,
                                    border:'none', borderRadius:3, cursor:'pointer', color:T.void,
                                    fontSize:13, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif",
                                    letterSpacing:'.06em', boxShadow:`0 4px 20px ${T.auroraGlow}`}}>
                                    ✓ CONFIRM &amp; APPLY
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'executing' && (
                        <div style={{padding:'20px 0'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                                <span style={{fontSize:9, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>EXECUTING CONCURRENTLY</span>
                                <span style={{fontSize:9, color:T.plasma, fontFamily:"'JetBrains Mono',monospace"}}>NO LOCKS HELD</span>
                            </div>
                            <div style={{height:6, background:`${T.textDim}20`, borderRadius:3, overflow:'hidden', marginBottom:14}}>
                                <div style={{height:'100%', borderRadius:3,
                                    background:`linear-gradient(90deg,${T.plasma},${T.stellar},${T.aurora})`,
                                    animation:'shimmer 1.5s ease-in-out infinite',
                                    backgroundSize:'200% 100%'}}/>
                            </div>
                            {['Acquiring metadata lock...', 'Building index structure...', 'Indexing row heap...'].map((t,i)=>(
                                <div key={i} style={{display:'flex', gap:8, alignItems:'center', padding:'4px 0',
                                    fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace"}}>
                                    <div style={{width:6, height:6, borderRadius:'50%', background:T.aurora,
                                        animation:`ripple ${1+i*.5}s ease-out infinite`}}/>
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'done' && (
                        <div style={{textAlign:'center', padding:'20px 0'}}>
                            <div style={{width:60, height:60, borderRadius:'50%', border:`2px solid ${T.aurora}`,
                                display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px',
                                boxShadow:`0 0 30px ${T.auroraGlow}`, background:`${T.aurora}10`}}>
                                <span style={{fontSize:28, color:T.aurora}}>✓</span>
                            </div>
                            <div style={{fontSize:16, fontWeight:800, color:T.aurora, fontFamily:"'Syne',sans-serif", marginBottom:6}}>
                                INDEX APPLIED SUCCESSFULLY
                            </div>
                            <div style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace"}}>
                                Added to operation log · ANALYZE scheduled
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL PANEL (side drawer)
   ═══════════════════════════════════════════════════════════════════════════ */
const DetailPanel = ({ index, onClose, onApply }) => {
    const [tab, setTab] = useState('overview');
    if (!index) return null;
    const isMissing=index.type==='missing', isDupe=index.type==='duplicates',
        isBloat=index.type==='bloat', isUnused=index.type==='unused';
    const sql = genSQL(index);

    return (
        <div style={{position:'fixed', inset:0, zIndex:9000, display:'flex', pointerEvents:'none'}}>
            <div style={{flex:1, background:'rgba(4,5,12,.6)', pointerEvents:'auto'}} onClick={onClose}/>
            <div style={{width:520, background:T.surface, borderLeft:`1px solid ${T.borderActive}`,
                display:'flex', flexDirection:'column', pointerEvents:'auto',
                animation:'slideIn .28s cubic-bezier(.22,1,.36,1)',
                boxShadow:`-20px 0 80px rgba(0,0,0,.9), -2px 0 30px ${T.cyanGlow}`,
                position:'relative', overflow:'hidden'}}>
                {/* Corner brackets */}
                <div style={{position:'absolute', top:0, left:0, width:16, height:16,
                    borderTop:`2px solid ${T.cyan}`, borderLeft:`2px solid ${T.cyan}`, zIndex:2}}/>
                <div style={{position:'absolute', bottom:0, right:0, width:16, height:16,
                    borderBottom:`2px solid ${T.cyanDim}`, borderRight:`2px solid ${T.cyanDim}`, zIndex:2}}/>

                {/* Header */}
                <div className="scan-anim" style={{padding:'20px 24px 16px', background:T.abyss,
                    borderBottom:`1px solid ${T.border}`, flexShrink:0, position:'relative', overflow:'hidden'}}>
                    <div className="grid-bg" style={{position:'absolute', inset:0}}/>
                    <div style={{position:'relative'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                            <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                                {index.severity&&<Badge level={index.severity}/>}
                                <span style={{fontSize:8.5, color:T.textDim, background:`${T.cyan}08`,
                                    border:`1px solid ${T.border}`, padding:'2px 7px', borderRadius:2,
                                    fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>
                  {index.type?.toUpperCase()}
                </span>
                                {index.hash&&<span style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                    background:T.void, border:`1px solid ${T.border}`, padding:'2px 6px', borderRadius:2}}>#{index.hash}</span>}
                            </div>
                            <button onClick={onClose} className="btn-ghost" style={{background:'none',
                                border:`1px solid ${T.border}`, borderRadius:2, cursor:'pointer',
                                color:T.textSub, padding:'4px 9px', fontSize:9,
                                fontFamily:"'JetBrains Mono',monospace"}}>✕ CLOSE</button>
                        </div>
                        <div style={{fontSize:16, fontWeight:700, color:T.textMain,
                            fontFamily:"'Space Grotesk',sans-serif", marginBottom:4}}>
                            {index.indexName||`${index.schema}.${index.table}`}
                        </div>
                        <div style={{fontSize:10, color:T.cyanDim, fontFamily:"'JetBrains Mono',monospace"}}>
                            {index.schema}.{index.table}
                            {index.column&&<span style={{color:T.textSub}}> · {index.column}</span>}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{display:'flex', borderBottom:`1px solid ${T.border}`, background:T.abyss}}>
                    {['overview','sql','impact','trend','activity'].map(t => (
                        <button key={t} onClick={()=>setTab(t)} style={{flex:1, padding:'10px 4px',
                            background:tab===t?`${T.cyan}08`:'transparent', border:'none',
                            borderBottom:tab===t?`2px solid ${T.cyan}`:'2px solid transparent',
                            color:tab===t?T.cyan:T.textSub, fontSize:8.5, fontWeight:700, cursor:'pointer',
                            textTransform:'uppercase', letterSpacing:'.12em',
                            fontFamily:"'JetBrains Mono',monospace", transition:'all .15s'}}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="scroll-thin" style={{flex:1, overflowY:'auto', padding:'18px 22px',
                    display:'flex', flexDirection:'column', gap:12}}>

                    {tab==='overview' && <>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                            {[
                                isMissing&&{l:'TABLE SIZE',v:index.tableSize,c:T.cyan},
                                isMissing&&{l:'EST. INDEX',v:index.estSize,c:T.stellar},
                                isMissing&&{l:'SEQ SCANS',v:index.seq_scan?.toLocaleString(),c:T.nova},
                                isMissing&&{l:'CUR LATENCY',v:`${index.currentLatency}ms`,c:T.plasma},
                                isBloat&&{l:'INDEX SIZE',v:index.size,c:T.cyan},
                                isBloat&&{l:'WASTED',v:index.wastedSpace,c:T.nova},
                                isBloat&&{l:'BLOAT %',v:`${index.bloatPct}%`,c:T.nova},
                                isBloat&&{l:'LAST VACUUM',v:index.lastVacuum,c:T.textSub},
                                isDupe&&{l:'WASTED',v:index.wastedSpace,c:T.nova},
                                isDupe&&{l:'WRITES/MIN',v:index.writes,c:T.plasma},
                                isUnused&&{l:'INDEX SIZE',v:index.size,c:T.cyan},
                                isUnused&&{l:'TOTAL SCANS',v:index.scans,c:T.nova},
                            ].filter(Boolean).map((m,i)=>(
                                <div key={i} style={{padding:'12px 14px', background:`${m.c}06`,
                                    border:`1px solid ${m.c}14`, borderRadius:3}}>
                                    <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                        letterSpacing:'.1em', marginBottom:5}}>{m.l}</div>
                                    <div style={{fontSize:22, fontWeight:800, color:m.c, fontFamily:"'Syne',sans-serif", lineHeight:1}}>{m.v}</div>
                                </div>
                            ))}
                        </div>
                        {isBloat&&<div>
                            <div style={{fontSize:8.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em', marginBottom:6}}>FRAGMENTATION LEVEL</div>
                            <div style={{display:'flex', alignItems:'center', gap:10}}>
                                <FragBar level={index.fragLevel}/>
                                <span style={{fontSize:10, fontWeight:700,
                                    color:[,,T.stellar,T.stellar,T.plasma,T.nova][index.fragLevel]||T.aurora,
                                    fontFamily:"'JetBrains Mono',monospace"}}>
                  {['','LOW','LOW','MEDIUM','HIGH','CRITICAL'][index.fragLevel]}
                </span>
                            </div>
                        </div>}
                        {isDupe&&<div style={{padding:'12px 14px', background:`${T.stellar}07`,
                            border:`1px solid ${T.stellar}18`, borderRadius:3}}>
                            <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em', marginBottom:5}}>COVERED BY</div>
                            <code style={{fontSize:11, color:T.aurora, fontFamily:"'JetBrains Mono',monospace"}}>{index.shadowedBy}</code>
                        </div>}
                        {isMissing&&index.partial&&<div style={{padding:'9px 12px', background:`${T.aurora}06`,
                            border:`1px solid ${T.aurora}16`, borderRadius:3}}>
                            <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginBottom:3}}>PARTIAL CONDITION</div>
                            <code style={{fontSize:11, color:T.aurora, fontFamily:"'JetBrains Mono',monospace"}}>{index.partial}</code>
                        </div>}
                        {/* Risk assessment */}
                        <div style={{padding:'12px 14px', background:T.abyss, border:`1px solid ${T.border}`, borderRadius:3}}>
                            <div style={{fontSize:8.5, color:T.cyanDim, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em', marginBottom:8}}>⬡ RISK ASSESSMENT</div>
                            {[
                                {l:'Downtime Risk', v:'NONE', note:'CONCURRENTLY prevents lock', c:T.aurora},
                                {l:'Rollback', v:'INSTANT', note:'DROP INDEX reverts immediately', c:T.aurora},
                                {l:'Write Overhead', v:(index.writes||0)>2000?'MEDIUM':'LOW',
                                    note:`${index.writes||0} writes/min`,
                                    c:(index.writes||0)>2000?T.stellar:T.aurora},
                            ].map((r,i)=>(
                                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'7px 0',
                                    borderBottom:i<2?`1px solid ${T.border}30`:'none'}}>
                                    <span style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace"}}>{r.l}</span>
                                    <div style={{textAlign:'right'}}>
                                        <div style={{fontSize:10.5, fontWeight:700, color:r.c, fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</div>
                                        <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{r.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>}

                    {tab==='sql' && <>
                        <SqlBlock sql={sql}/>
                        {isMissing&&<PartialSimulator index={index}/>}
                        <div style={{padding:'10px 12px', background:`${T.nebula}06`,
                            border:`1px solid ${T.nebula}15`, borderRadius:3}}>
                            <div style={{fontSize:8.5, color:T.nebula, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em', marginBottom:5}}>EXPECTED PLAN CHANGE</div>
                            <pre style={{fontSize:10, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                                margin:0, lineHeight:1.8}}>
{`Seq Scan on ${index.table}  [BEFORE]
  cost=0.00..${(index.currentLatency*4.2||500).toFixed(0)}
→ Index Scan using new_idx  [AFTER]
  cost=0.43..8.45
  Index Cond: (${index.column||'col'} = ?)`}
              </pre>
                        </div>
                    </>}

                    {tab==='impact' && <>
                        {(isMissing||isBloat)&&<LatencyViz
                            before={isMissing?index.currentLatency:Math.round(120*(1+index.bloatPct/100))}
                            after={isMissing?index.estLatency:120}/>}
                        {isDupe&&<div style={{textAlign:'center', padding:'24px',
                            background:`${T.aurora}07`, border:`1px solid ${T.aurora}18`, borderRadius:3}}>
                            <div style={{fontSize:44, fontWeight:800, color:T.aurora, fontFamily:"'Syne',sans-serif", lineHeight:1}}>ZERO</div>
                            <div style={{fontSize:9, color:T.textSub, marginTop:6, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>QUERY PERFORMANCE IMPACT</div>
                        </div>}
                        {/* Cost-benefit timeline */}
                        {isMissing&&<div style={{padding:'14px', background:`${T.stellar}06`,
                            border:`1px solid ${T.stellar}15`, borderRadius:3}}>
                            <div style={{fontSize:8.5, color:T.stellar, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.1em', marginBottom:8, fontWeight:700}}>30-DAY COST-BENEFIT PROJECTION</div>
                            <div style={{display:'flex', gap:1.5, alignItems:'flex-end', height:40}}>
                                {Array.from({length:30}, (_,i) => {
                                    const benefit = Math.min(1, i/14) * (index.currentLatency - index.estLatency) * (index.reads/1000);
                                    const costPerDay = i===0 ? index.estSize ? parseFloat(index.estSize)*0.8 : 50 : 0;
                                    const net = benefit - (i<3 ? costPerDay/(i+1) : 0);
                                    const h = Math.max(5, Math.min(40, (net/2000)*40));
                                    return <div key={i} style={{flex:1, height:`${h}%`, minHeight:3,
                                        background:net>0?`${T.aurora}70`:`${T.nova}60`,
                                        borderRadius:'1px 1px 0 0', transition:`height .4s ease ${i*.01}s`}}/>;
                                })}
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:4, fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>
                                <span>Build day</span><span>Break-even ~day 3</span><span>+30 days</span>
                            </div>
                        </div>}
                    </>}

                    {tab==='trend' && <>
                        {(index.scanHistory||index.bloatHistory||index.usageHistory)&&(
                            <div>
                                <div style={{fontSize:8.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                                    letterSpacing:'.1em', marginBottom:8}}>
                                    {isBloat?'BLOAT TREND':'SCAN TREND'} · 30 DAYS
                                </div>
                                <BarChart30
                                    data={index.scanHistory||index.bloatHistory||index.usageHistory}
                                    color={isBloat?T.nova:isMissing?T.plasma:T.textSub}
                                    h={60}/>
                            </div>
                        )}
                        {isMissing&&index.plannerRows&&<div style={{padding:'12px 14px',
                            background:`${T.plasma}06`, border:`1px solid ${T.plasma}15`, borderRadius:3}}>
                            <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                marginBottom:8, letterSpacing:'.1em'}}>ROW ESTIMATE DIVERGENCE</div>
                            <DivergenceBar planner={index.plannerRows} actual={index.actualRows||index.seq_scan}
                                           maxActual={index.actualRows||index.seq_scan}/>
                            <div style={{marginTop:6, fontSize:9, color:T.plasma, fontFamily:"'JetBrains Mono',monospace"}}>
                                {((index.actualRows||index.seq_scan)/index.plannerRows).toFixed(1)}× divergence — planner may choose wrong plan
                            </div>
                        </div>}
                    </>}

                    {tab==='activity' && <>
                        <div style={{fontSize:8.5, color:T.textSub, fontFamily:"'JetBrains Mono',monospace",
                            letterSpacing:'.1em', marginBottom:6}}>WRITE PRESSURE · 24H</div>
                        <div style={{display:'flex', gap:1.5, alignItems:'flex-end', height:52}}>
                            {Array.from({length:24},(_,i)=>{
                                const h=15+Math.sin(i*.5)*20+Math.random()*30;
                                return <div key={i} style={{flex:1, height:`${h}%`, borderRadius:'1px 1px 0 0',
                                    background:h>55?`${T.nova}70`:h>35?`${T.plasma}70`:`${T.cyan}50`, minWidth:2}}/>;
                            })}
                        </div>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                            {[
                                {l:'WRITES/MIN',v:(index.writes||0).toLocaleString(),c:T.plasma},
                                {l:'READS/MIN',v:(index.reads||0).toLocaleString(),c:T.cyan},
                                {l:'LOCK WAIT',v:'0.2ms',c:T.aurora},
                                {l:'DEAD TUPLES',v:'~4.1K',c:T.textSub},
                            ].map((m,i)=>(
                                <div key={i} style={{padding:'10px 12px', background:`${m.c}06`,
                                    border:`1px solid ${m.c}14`, borderRadius:3}}>
                                    <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace", marginBottom:3}}>{m.l}</div>
                                    <div style={{fontSize:18, fontWeight:800, color:m.c, fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                                </div>
                            ))}
                        </div>
                    </>}
                </div>

                {/* Footer */}
                <div style={{padding:'14px 22px', borderTop:`1px solid ${T.border}`,
                    background:T.abyss, display:'flex', gap:10}}>
                    <button onClick={() => onApply(index)}
                            style={{flex:2, padding:'11px', borderRadius:3,
                                background:`linear-gradient(135deg,${T.cyan},${T.cyanDim})`,
                                border:'none', color:T.void, fontWeight:700, cursor:'pointer',
                                fontSize:12, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.06em',
                                boxShadow:`0 4px 20px ${T.cyanGlow}`}}>
                        ▶ APPLY FIX
                    </button>
                    <button className="btn-ghost" style={{flex:1, padding:'11px', borderRadius:3,
                        background:'transparent', border:`1px solid ${T.border}`, color:T.textSub,
                        cursor:'pointer', fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                        letterSpacing:'.06em'}}>
                        ↓ SQL
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INDEX TABLE
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexTable = ({ rows, view, onSelect }) => {
    const [sort, setSort] = useState({field:null, dir:'desc'});
    const [filter, setFilter] = useState('');

    const sorted = useMemo(() => {
        let list = [...rows];
        if (filter) list = list.filter(r=>JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()));
        if (sort.field) list.sort((a,b) => {
            const av=a[sort.field], bv=b[sort.field];
            const cmp = typeof av==='number' ? av-bv : String(av||'').localeCompare(String(bv||''));
            return sort.dir==='asc'?cmp:-cmp;
        });
        return list;
    }, [rows, filter, sort]);

    const TH = ({field, children, right}) => (
        <th onClick={()=>field&&setSort(s=>({field,dir:s.field===field&&s.dir==='asc'?'desc':'asc'}))}
            style={{padding:'9px 14px', textAlign:right?'right':'left', fontSize:8,
                fontWeight:700, color:sort.field===field?T.cyan:T.textDim, cursor:field?'pointer':'default',
                fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em', textTransform:'uppercase',
                borderBottom:`1px solid ${T.border}`, background:T.abyss, whiteSpace:'nowrap',
                userSelect:'none'}}>
      <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
        {children}
          {field&&sort.field===field&&<span style={{fontSize:9}}>{sort.dir==='asc'?'↑':'↓'}</span>}
      </span>
        </th>
    );

    return (
        <>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
                borderBottom:`1px solid ${T.border}`, background:T.abyss}}>
                <span style={{color:T.textDim, fontSize:11}}>⌕</span>
                <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="filter rows…"
                       style={{flex:1, background:'none', border:'none', outline:'none',
                           fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.textSub}}/>
                {filter&&<button onClick={()=>setFilter('')}
                                 style={{background:'none', border:'none', cursor:'pointer', color:T.textDim, fontSize:11}}>✕</button>}
                <span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{sorted.length} rows</span>
            </div>
            <div className="scroll-thin" style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5}}>
                    <thead>
                    <tr>
                        {view==='missing'&&<><TH>Threat</TH><TH field="table">Table</TH><TH>Columns</TH>
                            <TH field="seq_scan" right>Seq Scans</TH><TH field="currentLatency" right>Latency</TH><TH>Gain</TH><TH></TH></>}
                        {view==='bloat'&&<><TH field="indexName">Index</TH><TH field="table">Table</TH>
                            <TH field="bloatPct" right>Bloat</TH><TH>Size</TH><TH>Wasted</TH><TH>Health</TH><TH></TH></>}
                        {view==='duplicates'&&<><TH field="indexName">Redundant Index</TH><TH field="table">Table</TH>
                            <TH>Covered By</TH><TH field="wastedSpace" right>Wasted</TH><TH></TH></>}
                        {view==='unused'&&<><TH field="indexName">Index</TH><TH field="table">Table</TH>
                            <TH>Size</TH><TH field="scans" right>Scans</TH><TH>Last Used</TH><TH></TH></>}
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map((row,idx) => (
                        <tr key={row.id} className="row-hover stagger" onClick={()=>onSelect(row)}
                            style={{borderBottom:`1px solid ${T.border}20`, animationDelay:`${idx*.04}s`, animation:'fadeUp .4s ease both'}}>
                            {view==='missing'&&<>
                                <td style={{padding:'12px 14px'}}><Badge level={row.severity}/></td>
                                <td style={{padding:'12px 14px'}}>
                                    <div style={{fontWeight:700, color:T.textMain, fontFamily:"'Space Grotesk',sans-serif", fontSize:13}}>{row.table}</div>
                                    <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{row.schema}</div>
                                </td>
                                <td style={{padding:'12px 14px', maxWidth:180}}>
                                    <code style={{fontSize:9.5, color:T.aurora, fontFamily:"'JetBrains Mono',monospace",
                                        background:`${T.aurora}08`, padding:'2px 6px', borderRadius:2,
                                        display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                        {row.column}
                                    </code>
                                </td>
                                <td style={{padding:'12px 14px', textAlign:'right', fontFamily:"'Syne',sans-serif",
                                    fontSize:15, fontWeight:800, color:row.seq_scan>100000?T.nova:T.plasma}}>
                                    {row.seq_scan.toLocaleString()}
                                </td>
                                <td style={{padding:'12px 14px', textAlign:'right'}}>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, fontWeight:700, color:T.nova}}>{row.currentLatency}ms</div>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:9.5, color:T.aurora}}>→ {row.estLatency}ms</div>
                                </td>
                                <td style={{padding:'12px 14px', minWidth:80}}>
                                    <div style={{fontSize:9, color:T.aurora, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, marginBottom:3}}>
                                        {Math.round(((row.currentLatency-row.estLatency)/row.currentLatency)*100)}%↑
                                    </div>
                                    <SegBar pct={(row.estLatency/row.currentLatency)*100} color={T.aurora} height={4}/>
                                </td>
                                <td style={{padding:'12px 14px'}}>
                                    <div className="reveal" style={{display:'flex', gap:4, alignItems:'center'}}>
                      <span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                          background:T.void, border:`1px solid ${T.border}`, padding:'2px 6px', borderRadius:2}}>#{row.hash}</span>
                                    </div>
                                </td>
                            </>}

                            {view==='bloat'&&<>
                                <td style={{padding:'12px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:T.textMain}}>{row.indexName}</td>
                                <td style={{padding:'12px 14px'}}>
                                    <div style={{fontWeight:700, color:T.textSub, fontFamily:"'Space Grotesk',sans-serif", fontSize:12}}>{row.table}</div>
                                    <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>{row.schema}</div>
                                </td>
                                <td style={{padding:'12px 14px', textAlign:'right'}}>
                    <span style={{fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18,
                        color:row.bloatPct>50?T.nova:T.plasma}}>{row.bloatPct}%</span>
                                </td>
                                <td style={{padding:'12px 14px', color:T.textSub, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5}}>{row.size}</td>
                                <td style={{padding:'12px 14px', color:T.nova, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, fontWeight:700}}>{row.wastedSpace}</td>
                                <td style={{padding:'12px 14px'}}><FragBar level={row.fragLevel}/></td>
                                <td style={{padding:'12px 14px'}}><div className="reveal"><span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>#{row.hash}</span></div></td>
                            </>}

                            {view==='duplicates'&&<>
                                <td style={{padding:'12px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:T.nova}}>{row.indexName}</td>
                                <td style={{padding:'12px 14px'}}>
                                    <div style={{fontWeight:700, color:T.textSub, fontFamily:"'Space Grotesk',sans-serif", fontSize:12}}>{row.table}</div>
                                    <div style={{fontSize:8.5, color:T.textDim}}>{row.schema}</div>
                                </td>
                                <td style={{padding:'12px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:T.aurora}}>{row.shadowedBy}</td>
                                <td style={{padding:'12px 14px', textAlign:'right', fontFamily:"'Syne',sans-serif", fontSize:15, color:T.plasma}}>{row.wastedSpace}</td>
                                <td style={{padding:'12px 14px'}}><div className="reveal"><span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>#{row.hash}</span></div></td>
                            </>}

                            {view==='unused'&&<>
                                <td style={{padding:'12px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:T.textMain}}>{row.indexName}</td>
                                <td style={{padding:'12px 14px'}}>
                                    <div style={{fontWeight:700, color:T.textSub, fontFamily:"'Space Grotesk',sans-serif", fontSize:12}}>{row.table}</div>
                                    <div style={{fontSize:8.5, color:T.textDim}}>{row.schema}</div>
                                </td>
                                <td style={{padding:'12px 14px', color:T.cyan, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5}}>{row.size}</td>
                                <td style={{padding:'12px 14px', textAlign:'right', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:row.scans===0?T.nova:T.textSub}}>{row.scans}</td>
                                <td style={{padding:'12px 14px', color:T.textSub, fontFamily:"'JetBrains Mono',monospace", fontSize:10.5}}>{row.lastUsed}</td>
                                <td style={{padding:'12px 14px'}}><div className="reveal"><span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace"}}>#{row.hash}</span></div></td>
                            </>}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function IndexIntelligence() {
    const [view, setView]       = useState('missing');
    const [data]                = useState(DATA);
    const [detail, setDetail]   = useState(null);
    const [applyTarget, setApplyTarget] = useState(null);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [live, setLive]       = useState(true);
    const [activePanel, setActivePanel] = useState('ai'); // ai | pgvector | rowdiv | fk | history

    useEffect(() => {
        const h = e => {
            if ((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault(); setCmdOpen(p=>!p);}
            if (e.key==='Escape'){setCmdOpen(false);}
        };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);

    const currentRows = data[view] || [];
    const totalIssues = data.missing.length + data.duplicates.length + data.bloat.length + data.unused.length;

    const VIEWS = [
        {id:'missing',    label:'MISSING',  color:T.plasma, count:data.missing.length,    sub:'Seq scan overload'},
        {id:'bloat',      label:'BLOAT',    color:T.nova,   count:data.bloat.length,       sub:'Fragmented'},
        {id:'duplicates', label:'DUPES',    color:T.stellar,count:data.duplicates.length,  sub:'Redundant'},
        {id:'unused',     label:'UNUSED',   color:T.textSub,count:data.unused.length,      sub:'Dormant'},
    ];

    const SIDE_PANELS = [
        {id:'ai',      label:'AI ANALYSIS', color:T.stellar},
        {id:'pgvector',label:'PGVECTOR',    color:T.nebula},
        {id:'rowdiv',  label:'ROW EST',     color:T.plasma},
        {id:'fk',      label:'FK GAPS',     color:T.nova},
        {id:'history', label:'LOG',         color:T.cyan},
    ];

    return (
        <div style={{background:T.void, minHeight:'100vh', position:'relative',
            overflow:'hidden', fontFamily:"'Space Grotesk',sans-serif"}}>
            <GlobalStyles/>

            {/* Ambient background */}
            <div className="grid-bg" style={{position:'fixed', inset:0, pointerEvents:'none', zIndex:0}}/>
            <div style={{position:'fixed', top:'20%', left:'30%', width:600, height:600,
                borderRadius:'50%', background:`${T.cyan}03`, filter:'blur(120px)',
                pointerEvents:'none', zIndex:0, animation:'breathe 8s ease-in-out infinite'}}/>
            <div style={{position:'fixed', bottom:'10%', right:'20%', width:400, height:400,
                borderRadius:'50%', background:`${T.nebula}04`, filter:'blur(100px)',
                pointerEvents:'none', zIndex:0, animation:'breathe 11s ease-in-out infinite reverse'}}/>

            {/* Top edge line */}
            <div style={{position:'fixed', top:0, left:0, right:0, height:1,
                background:`linear-gradient(90deg,transparent,${T.cyan}70,transparent)`, zIndex:3}}/>

            <div style={{position:'relative', zIndex:2, padding:'0 28px 48px'}}>

                {/* ─── TOP BAR ─── */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'18px 0 20px', borderBottom:`1px solid ${T.border}`, marginBottom:20}}>
                    <div style={{display:'flex', alignItems:'center', gap:20}}>
                        <div>
                            <div style={{fontSize:26, fontWeight:800, color:T.cyan, fontFamily:"'Syne',sans-serif",
                                letterSpacing:'-.01em', lineHeight:1, textShadow:`0 0 30px ${T.cyanGlow}`}}
                                 className="glitch-text">
                                INDEX INTELLIGENCE
                            </div>
                            <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                letterSpacing:'.14em', marginTop:3}}>
                                VIGIL · DEEP ANALYSIS ENGINE · v5.0.0 · PostgreSQL 14+
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:7, padding:'5px 12px',
                            background:data.health.criticalCount>0?`${T.nova}08`:`${T.aurora}06`,
                            border:`1px solid ${data.health.criticalCount>0?T.nova+'25':T.aurora+'18'}`,
                            borderRadius:2}}>
                            <Dot color={data.health.criticalCount>0?T.nova:T.aurora} pulse size={6}/>
                            <span style={{fontSize:9, color:data.health.criticalCount>0?T.nova:T.aurora,
                                fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:'.08em'}}>
                {data.health.criticalCount>0?`${data.health.criticalCount} CRITICAL`:'ALL NOMINAL'}
              </span>
                        </div>
                    </div>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                        <button onClick={()=>setCmdOpen(true)} className="btn-ghost" style={{
                            display:'flex', gap:7, alignItems:'center', padding:'7px 14px',
                            border:`1px solid ${T.border}`, borderRadius:2, background:'transparent',
                            cursor:'pointer', color:T.textSub, fontSize:10, fontFamily:"'JetBrains Mono',monospace"}}>
                            ⌖ SEARCH
                            <span style={{border:`1px solid ${T.border}`, padding:'1px 5px', fontSize:8.5, borderRadius:2}}>⌘K</span>
                        </button>
                        <button onClick={()=>setLive(l=>!l)} style={{
                            display:'flex', gap:6, alignItems:'center', padding:'7px 12px',
                            border:`1px solid ${live?T.aurora+'30':T.border}`,
                            borderRadius:2, background:live?`${T.aurora}07`:'transparent',
                            cursor:'pointer', color:live?T.aurora:T.textSub, fontSize:10,
                            fontFamily:"'JetBrains Mono',monospace", transition:'all .2s'}}>
              <span style={{width:8, height:8, borderRadius:'50%', background:live?T.aurora:T.textDim,
                  animation:live?'pulse 1.5s infinite':'none', display:'inline-block',
                  boxShadow:live?`0 0 8px ${T.aurora}`:'none'}}/>
                            {live?'LIVE':'PAUSED'}
                        </button>
                        <button className="btn-ghost" style={{padding:'7px 12px', border:`1px solid ${T.border}`,
                            borderRadius:2, background:'transparent', cursor:'pointer', color:T.textSub,
                            fontSize:10, fontFamily:"'JetBrains Mono',monospace"}}>
                            ↓ EXPORT
                        </button>
                    </div>
                </div>

                {/* ─── KPI ROW ─── */}
                <div className="stagger" style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20}}>
                    <MetTile label="Index Hit Ratio" value={`${data.health.hitRatio}%`} color={T.aurora}
                             Icon={()=><span style={{fontSize:13}}>◎</span>} spark={data.health.history} trend={0.4}/>
                    <MetTile label="Open Issues" value={totalIssues} color={T.plasma}
                             Icon={()=><span style={{fontSize:13}}>⚠</span>} sub={`${data.health.criticalCount} critical`}/>
                    <MetTile label="Total Indexes" value={data.health.totalIndexes} color={T.cyan}
                             Icon={()=><span style={{fontSize:13}}>⬡</span>} sub="across all schemas"/>
                    <MetTile label="Wasted Space" value={data.health.totalWaste} color={T.nova}
                             Icon={()=><span style={{fontSize:13}}>⬕</span>} sub="recoverable now"/>
                    <MetTile label="Seq Scan Rate" value={`${data.health.seqScanRate}%`} color={T.stellar}
                             Icon={()=><span style={{fontSize:13}}>⚡</span>} spark={data.health.seqHistory} trend={-0.3}/>
                </div>

                {/* ─── MAIN LAYOUT ─── */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 290px', gap:16, alignItems:'flex-start'}}>

                    {/* LEFT — Table + trend */}
                    <div style={{display:'flex', flexDirection:'column', gap:12}}>
                        {/* View tabs */}
                        <div style={{display:'flex', gap:3}}>
                            {VIEWS.map(v => (
                                <button key={v.id} onClick={()=>setView(v.id)} style={{
                                    flex:1, padding:'12px 8px',
                                    background:view===v.id?`${v.color}0c`:T.surface,
                                    border:`1px solid ${view===v.id?v.color+'35':T.border}`,
                                    borderTop:view===v.id?`2px solid ${v.color}`:'2px solid transparent',
                                    borderRadius:'2px 2px 0 0', cursor:'pointer', transition:'all .15s',
                                    boxShadow:view===v.id?`0 0 20px ${v.color}08`:'none'}}>
                                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                                        <Dot color={view===v.id?v.color:T.textDim} size={5}/>
                                        <span style={{fontSize:10.5, fontWeight:700, color:view===v.id?v.color:T.textSub,
                                            fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em'}}>{v.label}</span>
                                        <span style={{fontSize:16, fontWeight:800, color:view===v.id?v.color:T.textDim,
                                            fontFamily:"'Syne',sans-serif"}}>{v.count}</span>
                                    </div>
                                    <div style={{fontSize:8, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                        marginTop:2, textAlign:'center'}}>{v.sub}</div>
                                </button>
                            ))}
                        </div>

                        {/* Table panel */}
                        <div className="panel-bracket scan-anim" style={{background:T.surface,
                            border:`1px solid ${T.border}`, borderRadius:'0 0 3px 3px', borderTop:'none',
                            position:'relative', overflow:'hidden'}}>
                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between',
                                padding:'10px 16px', borderBottom:`1px solid ${T.border}`,
                                background:T.abyss, position:'relative', zIndex:2}}>
                                <div style={{display:'flex', gap:10, alignItems:'center'}}>
                  <span style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                      letterSpacing:'.12em'}}>
                    {VIEWS.find(v=>v.id===view)?.label} INDEXES
                  </span>
                                    <Waves count={5} color={live?T.aurora:T.textDim} height={12}/>
                                </div>
                                <div style={{display:'flex', gap:6, alignItems:'center'}}>
                                    <button className="btn-ghost" style={{display:'flex', gap:5, alignItems:'center',
                                        background:'transparent', border:`1px solid ${T.border}`, borderRadius:2,
                                        padding:'4px 8px', cursor:'pointer', color:T.textSub, fontSize:9,
                                        fontFamily:"'JetBrains Mono',monospace"}}>
                                        ↺ REFRESH
                                    </button>
                                    <button onClick={()=>currentRows[0]&&setApplyTarget(currentRows[0])}
                                            style={{display:'flex', gap:5, alignItems:'center', background:`${T.aurora}10`,
                                                border:`1px solid ${T.aurora}25`, borderRadius:2, padding:'4px 10px',
                                                cursor:'pointer', color:T.aurora, fontSize:9,
                                                fontFamily:"'JetBrains Mono',monospace", fontWeight:700}}>
                                        ▶ APPLY TOP PRIORITY
                                    </button>
                                </div>
                            </div>
                            <div style={{position:'relative', zIndex:2}}>
                                <IndexTable rows={currentRows} view={view} onSelect={setDetail}/>
                            </div>
                        </div>

                        {/* Usage trend (below table) */}
                        <UsageTrendPanel rows={currentRows} view={view}/>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{display:'flex', flexDirection:'column', gap:10}}>

                        {/* Health gauge strip */}
                        <div className="panel-bracket" style={{background:T.surface, border:`1px solid ${T.border}`,
                            borderRadius:3, padding:'14px', position:'relative', overflow:'hidden'}}>
                            <div className="grid-bg" style={{position:'absolute', inset:0}}/>
                            <div style={{position:'relative'}}>
                                <div style={{fontSize:8.5, color:T.textDim, fontFamily:"'JetBrains Mono',monospace",
                                    letterSpacing:'.12em', marginBottom:12}}>HEALTH OVERVIEW</div>
                                <div style={{display:'flex', gap:10, justifyContent:'space-around', marginBottom:12}}>
                                    <ArcGauge value={data.health.hitRatio} color={T.aurora} size={86} label="Hit Rate"/>
                                    <ArcGauge value={100-data.health.avgBloat} color={T.plasma} size={86} label="Bloat Free"/>
                                    <ArcGauge value={Math.round(100-data.health.seqScanRate*5)} color={T.cyan} size={86} label="Efficiency"/>
                                </div>
                                <RadarChart d={data.health} size={160}/>
                            </div>
                        </div>

                        {/* Panel switcher tabs */}
                        <div style={{display:'flex', gap:2, flexWrap:'wrap'}}>
                            {SIDE_PANELS.map(p=>(
                                <button key={p.id} onClick={()=>setActivePanel(p.id)}
                                        style={{flex:'1 1 auto', padding:'6px 4px',
                                            background:activePanel===p.id?`${p.color}0c`:T.surface,
                                            border:`1px solid ${activePanel===p.id?p.color+'30':T.border}`,
                                            borderRadius:2, cursor:'pointer', color:activePanel===p.id?p.color:T.textDim,
                                            fontSize:8, fontWeight:700, fontFamily:"'JetBrains Mono',monospace",
                                            letterSpacing:'.08em', transition:'all .15s', textAlign:'center'}}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Active side panel */}
                        {activePanel==='ai'      && <AIAnalysisPanel view={view} data={data}/>}
                        {activePanel==='pgvector'&& <PgVectorPanel pgvector={data.pgvector}/>}
                        {activePanel==='rowdiv'  && <RowDivergencePanel data={data.rowEstDivergence}/>}
                        {activePanel==='fk'      && <FKIndexPanel data={data.foreignKeyMissing}/>}
                        {activePanel==='history' && <HistoryPanel data={data.creationHistory}/>}
                    </div>
                </div>
            </div>

            {/* OVERLAYS */}
            {cmdOpen && <CmdPalette onClose={()=>setCmdOpen(false)} data={data}
                                    onSelect={r=>{setDetail(r); setView(r.type);}}/>}
            {detail && <DetailPanel index={detail} onClose={()=>setDetail(null)}
                                    onApply={idx=>{setDetail(null); setApplyTarget(idx);}}/>}
            {applyTarget && <ApplyModal index={applyTarget} onClose={()=>setApplyTarget(null)}/>}
        </div>
    );
}