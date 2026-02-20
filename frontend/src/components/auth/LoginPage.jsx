// ==========================================================================
//  VIGIL — Login Page  (Premium Redesign v3)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Lock, Activity, Bell, Search,
    TrendingUp, RefreshCw, UserCheck,
} from 'lucide-react';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #05080f; overflow: hidden; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes spinRev   { to{transform:rotate(-360deg)} }
        @keyframes blob1     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-50px) scale(1.1)} 66%{transform:translate(-20px,-20px) scale(0.95)} }
        @keyframes blob2     { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,35px) scale(1.08)} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes ring      { 0%{transform:scale(0.7);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes shimmer   { 0%{left:-100%} 100%{left:200%} }
        @keyframes glitch    { 0%,85%,100%{clip-path:none;transform:none} 87%{clip-path:inset(25% 0 60% 0);transform:translateX(-3px)} 90%{clip-path:inset(65% 0 8% 0);transform:translateX(3px)} 93%{clip-path:inset(10% 0 72% 0);transform:translateX(-2px)} }
        @keyframes successPop{ 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes ripple    { 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(4);opacity:0} }
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 28px rgba(14,165,233,.22),0 0 70px rgba(14,165,233,.07)} 50%{box-shadow:0 0 46px rgba(14,165,233,.38),0 0 110px rgba(14,165,233,.12)} }
        @keyframes edgePulse { 0%,100%{opacity:.18} 50%{opacity:.75} }
        @keyframes scanline  { 0%{top:0%;opacity:0} 5%{opacity:.3} 95%{opacity:.3} 100%{top:100%;opacity:0} }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow:0 0 0 1000px #080e1a inset !important;
            -webkit-text-fill-color:#e2e8f0 !important;
            caret-color:#e2e8f0;
            transition:background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:#0f2040; opacity:1; }
        .vi-input:focus::placeholder { opacity:0; transition:opacity .2s; }
        .vi-btn::after { content:''; position:absolute; top:0; left:-100%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent); animation:shimmer 2.6s ease infinite; pointer-events:none; }
        .fc:hover { border-color:rgba(14,165,233,.22)!important; background:rgba(14,165,233,.05)!important; transform:translateY(-2px)!important; box-shadow:0 8px 24px rgba(0,0,0,.4)!important; }
        .pc:hover { transform:translateY(-3px) scale(1.012)!important; }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  DATABASE PANEL
// ─────────────────────────────────────────────────────────────────────────────
const DatabasePanel = () => (
    <div style={{ width:'100%', height:'100%', background:'linear-gradient(150deg,#020c1c 0%,#030f24 60%,#021020 100%)', borderRadius:12, overflow:'hidden', position:'relative', fontFamily:'JetBrains Mono,monospace' }}>
        {/* dot grid bg */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,.25) 1px,transparent 1px)', backgroundSize:'18px 18px', opacity:.3, pointerEvents:'none' }} />
        {/* top glow */}
        <div style={{ position:'absolute', top:'-15%', left:'50%', width:220, height:220, background:'radial-gradient(circle,rgba(14,165,233,.15) 0%,transparent 70%)', transform:'translateX(-50%)', filter:'blur(30px)', pointerEvents:'none' }} />

        {/* titlebar */}
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderBottom:'1px solid rgba(14,165,233,.1)', position:'relative', zIndex:1 }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c=><span key={c} style={{ width:6, height:6, borderRadius:'50%', background:c, display:'inline-block' }}/>)}
            <span style={{ marginLeft:8, fontSize:6.5, color:'#152a48', letterSpacing:'.08em' }}>pg_monitor · query_analytics</span>
            <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
                {[['LIVE','#0ea5e9'],['v16.2','#22c55e']].map(([t,c])=>(
                    <span key={t} style={{ fontSize:5.5, color:c, fontWeight:700, background:`${c}15`, border:`1px solid ${c}28`, borderRadius:3, padding:'1px 5px' }}>{t}</span>
                ))}
            </div>
        </div>

        <div style={{ display:'flex', height:'calc(100% - 33px)', position:'relative', zIndex:1 }}>
            {/* LEFT — DB visual + KPIs */}
            <div style={{ width:92, borderRight:'1px solid rgba(14,165,233,.07)', padding:'9px 8px', display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                {/* 3D DB cylinder */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(14,165,233,.05)', border:'1px solid rgba(14,165,233,.13)', borderRadius:8, padding:'8px 4px 7px' }}>
                    <svg width="54" height="52" viewBox="0 0 54 52">
                        <defs>
                            <linearGradient id="dbB" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0369a1" stopOpacity=".8"/>
                                <stop offset="45%" stopColor="#0ea5e9" stopOpacity=".55"/>
                                <stop offset="100%" stopColor="#0369a1" stopOpacity=".8"/>
                            </linearGradient>
                            <linearGradient id="dbT" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7dd3fc" stopOpacity=".95"/>
                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity=".8"/>
                            </linearGradient>
                            <linearGradient id="dbS" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0"/>
                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity=".3"/>
                            </linearGradient>
                        </defs>
                        {/* shadow */}
                        <ellipse cx="27" cy="48" rx="14" ry="3" fill="url(#dbS)"/>
                        {/* body */}
                        <rect x="10" y="11" width="34" height="28" fill="url(#dbB)" rx="2"/>
                        {/* disk layers */}
                        <ellipse cx="27" cy="11" rx="17" ry="5.5" fill="url(#dbT)"/>
                        <ellipse cx="27" cy="11" rx="17" ry="5.5" fill="none" stroke="#7dd3fc" strokeWidth=".8" opacity=".7"/>
                        <ellipse cx="27" cy="21" rx="17" ry="5.5" fill="none" stroke="#0ea5e9" strokeWidth=".8" opacity=".35"/>
                        <ellipse cx="27" cy="31" rx="17" ry="5.5" fill="none" stroke="#0ea5e9" strokeWidth=".8" opacity=".25"/>
                        <ellipse cx="27" cy="39" rx="17" ry="5.5" fill="#061424" stroke="#0ea5e9" strokeWidth="1" opacity=".95"/>
                        {/* shine */}
                        <ellipse cx="21" cy="10" rx="6" ry="2" fill="white" opacity=".14"/>
                        {/* IO connectors */}
                        {[14,22,30].map((y,i)=>(
                            <g key={y}>
                                <line x1="2" y1={y} x2="10" y2={y} stroke="#38bdf8" strokeWidth=".8" opacity={.65-i*.15} strokeDasharray="2 1.5"/>
                                <circle cx="2" cy={y} r="1.3" fill="#38bdf8" opacity={.7-i*.15}/>
                            </g>
                        ))}
                    </svg>
                    <span style={{ fontSize:6.5, color:'#38bdf8', fontWeight:700, letterSpacing:'.1em', marginTop:3 }}>PRIMARY</span>
                    <span style={{ fontSize:5, color:'#0d2040', marginTop:1 }}>postgres:16.2</span>
                </div>
                {/* KPI pills */}
                {[
                    { l:'QPS',  v:'12.8k', c:'#0ea5e9' },
                    { l:'P99',  v:'4.2ms', c:'#22c55e' },
                    { l:'HIT%', v:'97.4',  c:'#14b8a6' },
                    { l:'TPS',  v:'2,340', c:'#a78bfa' },
                ].map(({l,v,c})=>(
                    <div key={l} style={{ background:`${c}0d`, border:`1px solid ${c}1e`, borderRadius:6, padding:'4px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:5.5, color:'#152a48' }}>{l}</span>
                        <span style={{ fontSize:8.5, color:c, fontWeight:700 }}>{v}</span>
                    </div>
                ))}
            </div>

            {/* RIGHT — queries + pool + chart */}
            <div style={{ flex:1, padding:'9px 10px', display:'flex', flexDirection:'column', gap:7 }}>
                {/* Active queries */}
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:7, padding:'6px 8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
                        <span style={{ width:4, height:4, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s ease infinite' }}/>
                        <span style={{ fontSize:6, color:'#152a48', letterSpacing:'.07em', fontWeight:600 }}>ACTIVE QUERIES</span>
                        <span style={{ marginLeft:'auto', fontSize:6, color:'#0ea5e9', fontWeight:700, background:'rgba(14,165,233,.1)', borderRadius:8, padding:'0 5px' }}>3 running</span>
                    </div>
                    {[
                        { q:'SELECT id, name, email FROM users WHERE…', t:'1.2ms', c:'#22c55e' },
                        { q:'UPDATE orders SET status = $1 WHERE id…',  t:'8.4ms', c:'#f59e0b' },
                        { q:'EXPLAIN ANALYZE SELECT * FROM events…',    t:'0.3ms', c:'#0ea5e9' },
                    ].map(({q,t,c},i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 0', borderBottom:i<2?'1px solid rgba(255,255,255,.04)':'none' }}>
                            <span style={{ width:3, height:3, borderRadius:'50%', background:c, flexShrink:0, display:'inline-block' }}/>
                            <span style={{ fontSize:6, color:'#0c1e34', flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{q}</span>
                            <span style={{ fontSize:6, color:c, fontWeight:700, flexShrink:0 }}>{t}</span>
                        </div>
                    ))}
                </div>

                {/* Connection pool */}
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:7, padding:'6px 8px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:6, color:'#152a48', letterSpacing:'.07em' }}>CONNECTION POOL</span>
                        <span style={{ fontSize:7, color:'#0ea5e9', fontWeight:700 }}>342 <span style={{ color:'#0c1e34', fontWeight:400 }}>/ 500</span></span>
                    </div>
                    <div style={{ height:6, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                        <div style={{ width:'68%', height:'100%', background:'linear-gradient(90deg,#0369a1,#0ea5e9,#38bdf8)', borderRadius:3 }}/>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                        {[['idle','158','#152a48'],['active','184','#0ea5e9'],['wait','0','#22c55e']].map(([k,v,c])=>(
                            <span key={k} style={{ fontSize:5.5, color:'#091828' }}>{k}: <span style={{ color:c, fontWeight:700 }}>{v}</span></span>
                        ))}
                    </div>
                </div>

                {/* QPS chart */}
                <div style={{ flex:1, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:7, padding:'5px 8px', overflow:'hidden' }}>
                    <span style={{ fontSize:5.5, color:'#152a48', letterSpacing:'.07em', display:'block', marginBottom:4 }}>QPS TREND · LAST 12s</span>
                    <svg width="100%" height="36" viewBox="0 0 220 36" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity=".45"/>
                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        {[58,72,45,88,62,95,50,78,66,91,55,83].map((h,i)=>(
                            <rect key={i} x={i*18+1} y={36-h*.32} width={14} height={h*.32} fill="#0ea5e9" opacity={i===11?.65:.12} rx="1.5"/>
                        ))}
                        <path d="M0,28 C10,24 20,10 35,14 C50,18 60,5 78,8 C96,11 106,3 122,6 C138,9 148,2 164,4 C180,6 190,2 220,1 L220,36 L0,36Z" fill="url(#sg)"/>
                        <path d="M0,28 C10,24 20,10 35,14 C50,18 60,5 78,8 C96,11 106,3 122,6 C138,9 148,2 164,4 C180,6 190,2 220,1" fill="none" stroke="#0ea5e9" strokeWidth="1.5"/>
                        <circle cx="220" cy="1" r="2.8" fill="#38bdf8"/>
                        <circle cx="220" cy="1" r="5" fill="none" stroke="#38bdf8" strokeWidth=".8" opacity=".3"/>
                    </svg>
                </div>
            </div>
        </div>

        {/* bottom label */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:22, background:'linear-gradient(transparent,rgba(2,10,24,.95))', display:'flex', alignItems:'center', padding:'0 12px', gap:5, zIndex:2 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#0ea5e9', display:'inline-block', animation:'pulse 2s ease infinite' }}/>
            <span style={{ fontSize:6.5, color:'#0ea5e9', fontWeight:700, letterSpacing:'.12em' }}>DATABASE MONITOR</span>
            <span style={{ marginLeft:'auto', fontSize:6, color:'#091828' }}>uptime 99.98%</span>
        </div>
        <div style={{ position:'absolute', left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(14,165,233,.22),transparent)', animation:'scanline 7s linear infinite', top:0 }}/>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  INFRASTRUCTURE PANEL
// ─────────────────────────────────────────────────────────────────────────────
const InfraPanel = () => (
    <div style={{ width:'100%', height:'100%', background:'linear-gradient(150deg,#020c08 0%,#031008 60%,#020b06 100%)', borderRadius:12, overflow:'hidden', position:'relative', fontFamily:'JetBrains Mono,monospace' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(20,184,166,.22) 1px,transparent 1px)', backgroundSize:'18px 18px', opacity:.28, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:200, height:200, background:'radial-gradient(circle,rgba(20,184,166,.14) 0%,transparent 70%)', filter:'blur(28px)', pointerEvents:'none' }}/>

        {/* titlebar */}
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderBottom:'1px solid rgba(20,184,166,.1)', position:'relative', zIndex:1 }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c=><span key={c} style={{ width:6, height:6, borderRadius:'50%', background:c, display:'inline-block' }}/>)}
            <span style={{ marginLeft:8, fontSize:6.5, color:'#0d2818', letterSpacing:'.08em' }}>infra · cluster-prod-01</span>
            <span style={{ marginLeft:'auto', fontSize:5.5, color:'#22c55e', fontWeight:700, background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', borderRadius:3, padding:'1px 5px' }}>ALL HEALTHY</span>
        </div>

        <div style={{ display:'flex', height:'calc(100% - 33px)', position:'relative', zIndex:1 }}>
            {/* LEFT — server nodes */}
            <div style={{ width:90, borderRight:'1px solid rgba(20,184,166,.07)', padding:'9px 7px', display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                <span style={{ fontSize:5.5, color:'#0a1e10', letterSpacing:'.07em', marginBottom:2 }}>SERVER RACK</span>
                {[
                    { id:'SRV-01', role:'PRIMARY', color:'#22c55e', cpu:62, mem:55 },
                    { id:'SRV-02', role:'REPLICA',  color:'#22c55e', cpu:41, mem:38 },
                    { id:'SRV-03', role:'REPLICA',  color:'#f59e0b', cpu:78, mem:71 },
                    { id:'SRV-04', role:'STANDBY',  color:'#14b8a6', cpu:18, mem:22 },
                ].map(({id,role,color,cpu,mem})=>(
                    <div key={id} style={{ background:'rgba(255,255,255,.025)', border:`1px solid ${color}25`, borderRadius:6, padding:'5px 6px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:color, display:'inline-block', animation:'pulse 2s ease infinite' }}/>
                            <span style={{ fontSize:6, color:'#0e2218', fontWeight:700 }}>{id}</span>
                            <span style={{ marginLeft:'auto', fontSize:5, color:color }}>{role}</span>
                        </div>
                        {[['CPU',cpu],['MEM',mem]].map(([k,v])=>(
                            <div key={k} style={{ display:'flex', alignItems:'center', gap:3, marginBottom:1.5 }}>
                                <span style={{ fontSize:4.5, color:'#0a1e10', width:13, flexShrink:0 }}>{k}</span>
                                <div style={{ flex:1, height:3, background:'rgba(255,255,255,.04)', borderRadius:2, overflow:'hidden' }}>
                                    <div style={{ width:`${v}%`, height:'100%', background:`linear-gradient(90deg,${color}50,${color})`, borderRadius:2 }}/>
                                </div>
                                <span style={{ fontSize:4.5, color, width:16, textAlign:'right', flexShrink:0 }}>{v}%</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* RIGHT — resource meters + events */}
            <div style={{ flex:1, padding:'9px 10px', display:'flex', flexDirection:'column', gap:6 }}>
                {/* cluster summary */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5 }}>
                    {[['NODES','4/4','#22c55e'],['WAL LAG','0.0s','#14b8a6'],['REPL','SYNC','#0ea5e9']].map(([l,v,c])=>(
                        <div key={l} style={{ background:`${c}0c`, border:`1px solid ${c}1e`, borderRadius:6, padding:'4px 5px', textAlign:'center' }}>
                            <div style={{ fontSize:5, color:'#0a1e10', marginBottom:1 }}>{l}</div>
                            <div style={{ fontSize:9, color:c, fontWeight:700 }}>{v}</div>
                        </div>
                    ))}
                </div>

                {/* resource gauges */}
                {[
                    { l:'MEMORY',  v:81, used:'51.8 GB', total:'64 GB',   c:'#f59e0b' },
                    { l:'STORAGE', v:44, used:'880 GB',  total:'2 TB',    c:'#22c55e' },
                    { l:'NETWORK', v:35, used:'3.5 Gbps',total:'10 Gbps', c:'#0ea5e9' },
                    { l:'IOPS',    v:58, used:'29k',     total:'50k',     c:'#14b8a6' },
                ].map(({l,v,used,total,c})=>(
                    <div key={l}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2.5 }}>
                            <span style={{ fontSize:5.5, color:'#0a1e10', letterSpacing:'.05em' }}>{l}</span>
                            <span style={{ fontSize:5.5, color:c }}><span style={{ fontWeight:700 }}>{used}</span><span style={{ color:'#071510', marginLeft:3 }}>/ {total}</span></span>
                        </div>
                        <div style={{ height:5, background:'rgba(255,255,255,.04)', borderRadius:3, overflow:'hidden', position:'relative' }}>
                            <div style={{ width:`${v}%`, height:'100%', background:`linear-gradient(90deg,${c}55,${c})`, borderRadius:3 }}/>
                            {[25,50,75].map(p=><div key={p} style={{ position:'absolute', top:0, bottom:0, left:`${p}%`, width:1, background:'rgba(255,255,255,.07)' }}/>)}
                        </div>
                    </div>
                ))}

                {/* events */}
                <div style={{ background:'rgba(255,255,255,.018)', border:'1px solid rgba(255,255,255,.05)', borderRadius:7, padding:'5px 7px', marginTop:'auto' }}>
                    <span style={{ fontSize:5.5, color:'#0a1e10', letterSpacing:'.07em', display:'block', marginBottom:4 }}>RECENT EVENTS</span>
                    {[
                        { c:'#f59e0b', m:'SRV-03 · CPU spike > 75%',      t:'2m' },
                        { c:'#22c55e', m:'WAL archival completed OK',       t:'5m' },
                        { c:'#14b8a6', m:'Checkpoint done · 0 errors',     t:'9m' },
                    ].map(({c,m,t},i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:i<2?3:0 }}>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:c, flexShrink:0, display:'inline-block' }}/>
                            <span style={{ fontSize:5.5, color:'#071510', flex:1 }}>{m}</span>
                            <span style={{ fontSize:5, color:'#0a1e10', flexShrink:0 }}>{t} ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:22, background:'linear-gradient(transparent,rgba(2,10,6,.95))', display:'flex', alignItems:'center', padding:'0 12px', gap:5, zIndex:2 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#14b8a6', display:'inline-block', animation:'pulse 2.5s ease infinite' }}/>
            <span style={{ fontSize:6.5, color:'#14b8a6', fontWeight:700, letterSpacing:'.12em' }}>INFRASTRUCTURE</span>
            <span style={{ marginLeft:'auto', fontSize:6, color:'#0a1e10' }}>4 nodes · 0 critical</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURES
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon:Activity,   label:'Real-Time Metrics', desc:'QPS, latency & cache hit ratios — live.',   color:'#0ea5e9' },
    { icon:Bell,       label:'Smart Alerting',     desc:'Slow query & replication log alerts.',      color:'#a78bfa' },
    { icon:Search,     label:'Query Inspector',    desc:'EXPLAIN plans & pg_stat_statements.',       color:'#f59e0b' },
    { icon:RefreshCw,  label:'Replication',        desc:'WAL archiving & standby lag tracking.',     color:'#14b8a6' },
    { icon:TrendingUp, label:'Trend Analysis',     desc:'Anomaly detection across clusters.',        color:'#f43f5e' },
    { icon:UserCheck,  label:'Access Audit',       desc:'RBAC with full compliance trails.',         color:'#22c55e' },
];

const FeatureCard = ({ icon:Icon, label, desc, color }) => (
    <div className="fc" style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:'14px 13px', display:'flex', flexDirection:'column', gap:8, cursor:'default', transition:'all .22s ease' }}>
        <div style={{ width:32, height:32, borderRadius:9, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={14} color={color} />
        </div>
        <div style={{ fontSize:11.5, fontWeight:700, color:'#c8d6e5', fontFamily:"'Syne',sans-serif", letterSpacing:'-.01em', lineHeight:1.2 }}>{label}</div>
        <div style={{ fontSize:9.5, color:'#1e3a5f', lineHeight:1.55, fontFamily:"'DM Sans',sans-serif" }}>{desc}</div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  TOOL SUMMARY PANEL
// ─────────────────────────────────────────────────────────────────────────────
const STAT_ITEMS = [
    { label:'Queries / sec',  value:'12.8k', delta:'+4.2%', color:'#0ea5e9' },
    { label:'P99 Latency',    value:'4.2 ms', delta:'-11%',  color:'#22c55e' },
    { label:'Cache Hit Rate', value:'97.4%',  delta:'+0.3%', color:'#14b8a6' },
    { label:'Replication Lag',value:'0.0 s',  delta:'IN SYNC',color:'#a78bfa' },
    { label:'Active Conns',   value:'342',    delta:'/ 500',  color:'#f59e0b' },
    { label:'Nodes Healthy',  value:'4 / 4',  delta:'ALL OK', color:'#22c55e' },
];

const HOW_IT_WORKS = [
    { step:'01', title:'Connect your cluster', desc:'Point Vigil at any PostgreSQL instance — on‑prem or cloud.', color:'#0ea5e9' },
    { step:'02', title:'Instant observability', desc:'Live metrics stream in: QPS, latency, cache, replication, and storage.', color:'#14b8a6' },
    { step:'03', title:'Alert & investigate', desc:'Smart alerts fire on anomalies; Query Inspector shows EXPLAIN plans side‑by‑side.', color:'#a78bfa' },
];

const ToolSummaryPanel = () => (
    <div style={{ borderRadius:14, border:'1px solid rgba(14,165,233,.14)', background:'linear-gradient(135deg,rgba(8,20,40,.95) 0%,rgba(4,14,30,.98) 100%)', overflow:'hidden', fontFamily:'JetBrains Mono,monospace', position:'relative' }}>
        {/* subtle dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,.18) 1px,transparent 1px)', backgroundSize:'20px 20px', opacity:.22, pointerEvents:'none' }}/>
        {/* top accent line */}
        <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1, background:'linear-gradient(90deg,transparent,rgba(14,165,233,.6),transparent)' }}/>

        <div style={{ position:'relative', zIndex:1, padding:'18px 20px 16px' }}>
            {/* Section heading */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <div style={{ width:3, height:22, borderRadius:2, background:'linear-gradient(180deg,#0ea5e9,#14b8a6)' }}/>
                <span style={{ fontSize:8.5, color:'#38bdf8', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase' }}>Live Cluster Snapshot</span>
                <span style={{ marginLeft:'auto', fontSize:6.5, color:'#22c55e', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>● LIVE</span>
            </div>

            {/* Metric grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:18 }}>
                {STAT_ITEMS.map(({ label, value, delta, color }) => (
                    <div key={label} style={{ background:`${color}09`, border:`1px solid ${color}22`, borderRadius:9, padding:'10px 11px' }}>
                        <div style={{ fontSize:6, color:'#1e3a5f', marginBottom:5, letterSpacing:'.05em' }}>{label}</div>
                        <div style={{ fontSize:15, color, fontWeight:700, lineHeight:1, marginBottom:4 }}>{value}</div>
                        <div style={{ fontSize:6, color:`${color}bb`, fontWeight:600 }}>{delta}</div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div style={{ height:1, background:'rgba(255,255,255,.05)', marginBottom:14 }}/>

            {/* How it works */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:3, height:22, borderRadius:2, background:'linear-gradient(180deg,#a78bfa,#f43f5e)' }}/>
                <span style={{ fontSize:8.5, color:'#c4b5fd', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase' }}>How Vigil Works</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {HOW_IT_WORKS.map(({ step, title, desc, color }) => (
                    <div key={step} style={{ background:'rgba(255,255,255,.025)', border:`1px solid ${color}20`, borderRadius:9, padding:'11px 12px', position:'relative', overflow:'hidden' }}>
                        {/* big step number watermark */}
                        <div style={{ position:'absolute', bottom:-6, right:6, fontSize:38, fontWeight:900, color:`${color}09`, lineHeight:1, userSelect:'none', fontFamily:'Syne,sans-serif' }}>{step}</div>
                        <div style={{ fontSize:8, color, fontWeight:700, marginBottom:5, letterSpacing:'.1em' }}>STEP {step}</div>
                        <div style={{ fontSize:10, color:'#c8d6e5', fontWeight:700, fontFamily:'Syne,sans-serif', marginBottom:5, lineHeight:1.3 }}>{title}</div>
                        <div style={{ fontSize:8.5, color:'#1e3a5f', lineHeight:1.55, fontFamily:'DM Sans,sans-serif' }}>{desc}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = () => (
    <div style={{ flex:'1 1 0', minWidth:0, background:'#05080f', borderRight:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', height:'100vh' }}>
        <div style={{ position:'absolute', inset:0, opacity:.015, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(14,165,233,1) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,1) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 70% 50% at 25% 15%,rgba(14,165,233,.06) 0%,transparent 70%), radial-gradient(ellipse 50% 55% at 80% 85%,rgba(20,184,166,.04) 0%,transparent 70%)' }}/>

        {/* Top bar */}
        <div style={{ position:'relative', zIndex:1, padding:'11px 26px', borderBottom:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, animation:'fadeUp .5s ease backwards' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#0ea5e9,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 18px rgba(14,165,233,.45)' }}>
                    <Database size={14} color="#fff" />
                </div>
                <div>
                    <div style={{ fontSize:10.5, fontWeight:700, color:'#38bdf8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.18em', textTransform:'uppercase', lineHeight:1 }}>PostgreSQL Monitor</div>
                    <div style={{ fontSize:8, color:'#0f2540', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>v2.0.1 · Production</div>
                </div>
            </div>
            <div style={{ display:'flex', gap:7 }}>
                {[['99.9% UPTIME','#22c55e'],['MONITOR','#0ea5e9']].map(([t,c])=>(
                    <div key={t} style={{ display:'flex', alignItems:'center', gap:5, background:`${c}0a`, border:`1px solid ${c}20`, borderRadius:20, padding:'3px 10px' }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:c, display:'inline-block', animation:'pulse 2s ease infinite' }}/>
                        <span style={{ fontSize:7.5, color:c, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:'.07em' }}>{t}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Content */}
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Headline */}
            <div style={{ padding:'16px 26px 12px', flexShrink:0, animation:'fadeUp .6s ease .06s backwards' }}>
                <h2 style={{ fontSize:22, fontWeight:800, color:'#dde8f2', fontFamily:"'Syne',sans-serif", lineHeight:1.25, letterSpacing:'-.03em', marginBottom:6 }}>
                    Total observability for{' '}
                    <span style={{ color:'#0ea5e9', display:'inline-block', animation:'glitch 9s ease-in-out infinite' }}>your Postgres clusters.</span>
                </h2>
                <p style={{ fontSize:10.5, color:'#1a2e4a', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
                    A single pane of glass — connection pools, replication lag, slow-query forensics and storage trends in real time.
                </p>
            </div>

            {/* Tool Summary Visual */}
            <div style={{ padding:'0 26px 12px', flexShrink:0, animation:'fadeUp .6s ease .12s backwards' }}>
                <ToolSummaryPanel />
            </div>

            {/* Feature grid */}
            <div style={{ padding:'0 26px', flex:1, minHeight:0, animation:'fadeUp .6s ease .2s backwards' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {FEATURES.map(f => <FeatureCard key={f.label} {...f} />)}
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding:'10px 26px 14px', borderTop:'1px solid rgba(255,255,255,.03)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Lock size={9} color="#0f2540" />
                    <span style={{ fontSize:8, color:'#0f2540', fontFamily:"'JetBrains Mono',monospace" }}>End-to-end encrypted · SOC 2 Type II</span>
                </div>
                <span style={{ fontSize:8, color:'#0f2540', fontFamily:"'JetBrains Mono',monospace" }}>© 2025 Vigil</span>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO EMBLEM
// ─────────────────────────────────────────────────────────────────────────────
const LogoEmblem = ({ success }) => {
    const S=88, C=44, R1=38, R2=29, R3=20;
    const c1 = success ? '#22c55e' : '#0ea5e9';
    const c2 = success ? '#22c55e' : '#38bdf8';
    return (
        <div style={{ position:'relative', width:S, height:S, animation:'logoPulse 4s ease-in-out infinite' }}>
            <div style={{ position:'absolute', inset:-18, borderRadius:'50%', background: success ? 'radial-gradient(circle,rgba(34,197,94,.18) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(14,165,233,.15) 0%,transparent 70%)', animation:'glow 3s ease-in-out infinite', transition:'background .8s' }}/>
            <svg width={S} height={S} style={{ position:'absolute', top:0, left:0 }}>
                <circle cx={C} cy={C} r={R1} fill="none" stroke={c1} strokeWidth="1" strokeDasharray="4 3" opacity=".35" style={{ transformOrigin:'center', animation:'spin 22s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.5" strokeDasharray={`${Math.PI*R2*.6} ${Math.PI*R2*.4}`} strokeLinecap="round" opacity=".7" style={{ transformOrigin:'center', animation:'spinRev 11s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth="0.8" strokeDasharray="2 4" opacity=".28" style={{ transformOrigin:'center', animation:'spin 7s linear infinite', transition:'stroke .8s' }}/>
                {[0,72,144,216,288].map((d,i)=>(
                    <circle key={d} cx={C+R1*Math.cos(d*Math.PI/180)} cy={C+R1*Math.sin(d*Math.PI/180)} r="2" fill={c1} opacity={.45+i*.1} style={{ transition:'fill .8s' }}/>
                ))}
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#0ea5e9,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: success ? '0 4px 26px rgba(34,197,94,.5)' : '0 4px 26px rgba(14,165,233,.45)', transition:'all .8s cubic-bezier(.34,1.56,.64,1)' }}>
                    {success ? <CheckCircle size={24} color="#fff" style={{ animation:'successPop .5s ease backwards' }}/> : <Database size={24} color="#fff"/>}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }) => {
    const on = status.status==='online', off = status.status==='offline', checking = status.status==='checking';
    const color = on ? '#22c55e' : off ? '#ef4444' : '#f59e0b';
    const label = on ? 'ONLINE' : off ? 'OFFLINE' : checking ? 'Checking…' : 'DEGRADED';
    return (
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px 5px 10px', borderRadius:100, background:`${color}09`, border:`1px solid ${color}22`, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>
            {checking
                ? <><Loader size={9} color="#334155" style={{ animation:'spin 1s linear infinite' }}/><span style={{ color:'#334155' }}>Checking…</span></>
                : <>
                    <div style={{ position:'relative', width:7, height:7 }}>
                        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, boxShadow:`0 0 7px ${color}90`, animation: on?'pulse 2s ease-in-out infinite':'none' }}/>
                        {on && <div style={{ position:'absolute', inset:-2, borderRadius:'50%', border:`1px solid ${color}60`, animation:'ring 2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight:700, letterSpacing:'.05em' }}>{label}</span>
                    {status.latency!=null && <span style={{ color:'#0f2540', fontSize:9, padding:'1px 6px', borderRadius:4, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.04)' }}>{status.latency}ms</span>}
                </>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
const InputField = React.forwardRef(function InputField({ icon:Icon, label, type='text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{ display:'block', marginBottom:7, fontSize:9.5, fontWeight:600, color: focused ? '#0ea5e9' : '#1a3050', textTransform:'uppercase', letterSpacing:'1.4px', fontFamily:"'JetBrains Mono',monospace", transition:'color .2s' }}>{label}</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background: focused ? 'rgba(14,165,233,.05)' : 'rgba(255,255,255,.022)', border:`1px solid ${focused ? 'rgba(14,165,233,.45)' : 'rgba(255,255,255,.07)'}`, borderRadius:13, padding:'0 14px', transition:'all .25s cubic-bezier(.4,0,.2,1)', boxShadow: focused ? '0 0 0 3.5px rgba(14,165,233,.08),inset 0 1px 0 rgba(255,255,255,.04)' : 'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                <Icon size={15} color={focused ? '#0ea5e9' : hasVal ? '#2a4560' : '#101e35'} style={{ flexShrink:0, transition:'color .2s' }}/>
                <input ref={ref} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} className="vi-input"
                       style={{ flex:1, padding:'13px 0', background:'none', border:'none', color:'#e2e8f0', fontSize:13.5, outline:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:400, letterSpacing:'.01em', opacity:disabled?.4:1 }}/>
                {rightEl}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORNER ACCENTS
// ─────────────────────────────────────────────────────────────────────────────
const Corners = ({ color='rgba(14,165,233,.25)' }) => (
    <>
        {[
            { top:0,    left:0,  borderTop:`1px solid ${color}`, borderLeft:`1px solid ${color}`,   borderRadius:'3px 0 0 0' },
            { top:0,    right:0, borderTop:`1px solid ${color}`, borderRight:`1px solid ${color}`,  borderRadius:'0 3px 0 0' },
            { bottom:0, left:0,  borderBottom:`1px solid ${color}`, borderLeft:`1px solid ${color}`, borderRadius:'0 0 0 3px' },
            { bottom:0, right:0, borderBottom:`1px solid ${color}`, borderRight:`1px solid ${color}`,borderRadius:'0 0 3px 0' },
        ].map(({ borderRadius, ...style }, i) => (
            <div key={i} style={{ position:'absolute', width:14, height:14, pointerEvents:'none', borderRadius, ...style }} />
        ))}
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError]             = useState(null);
    const [username, setUsername]       = useState('');
    const [password, setPassword]       = useState('');
    const [showPwd,  setShowPwd]        = useState(false);
    const [remember, setRemember]       = useState(false);
    const [status,   setStatus]         = useState({ status:'online', latency:12 });
    const [success,  setSuccess]        = useState(false);
    const [shake,    setShake]          = useState(false);
    const [btnHover, setBtnHover]       = useState(false);
    const userRef = useRef(null);

    useEffect(() => { userRef.current?.focus(); }, []);
    useEffect(() => { if(error){ setShake(true); const t=setTimeout(()=>setShake(false),600); return ()=>clearTimeout(t); } }, [error]);
    useEffect(() => { if(error) setError(null); }, [username, password]);

    const handleSubmit = useCallback(async e => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        setAuthLoading(true);
        await new Promise(r=>setTimeout(r,1600));
        setAuthLoading(false);
        if (username.toLowerCase()==='wrong') setError('Invalid credentials. Please check and try again.');
        else setSuccess(true);
    }, [username, password]);

    const canSubmit = username.trim() && password.trim() && !authLoading && !success;
    const btnBg = authLoading ? 'rgba(14,165,233,.5)' : success ? '#22c55e' : canSubmit ? 'linear-gradient(135deg,#0284c7 0%,#0ea5e9 50%,#38bdf8 100%)' : 'rgba(14,165,233,.12)';
    const btnShadow = canSubmit && !authLoading && !success ? (btnHover ? '0 10px 34px rgba(14,165,233,.55),0 0 0 1px rgba(14,165,233,.3) inset' : '0 4px 22px rgba(14,165,233,.3),0 0 0 1px rgba(14,165,233,.16) inset') : 'none';

    return (
        <div style={{ height:'100vh', width:'100vw', display:'flex', background:'#05080f', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
            <GlobalStyles />
            <LeftPanel />

            {/* RIGHT */}
            <div style={{ width:490, flexShrink:0, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 44px', background:'rgba(4,7,14,.98)' }}>
                {/* bg blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'5%', right:'-22%', width:420, height:420, background:'radial-gradient(circle,rgba(14,165,233,.055) 0%,transparent 65%)', animation:'blob2 24s ease-in-out infinite', filter:'blur(55px)' }}/>
                    <div style={{ position:'absolute', bottom:'5%', left:'-18%', width:320, height:320, background:'radial-gradient(circle,rgba(20,184,166,.045) 0%,transparent 65%)', animation:'blob1 18s ease-in-out infinite', filter:'blur(40px)' }}/>
                    <div style={{ position:'absolute', inset:0, opacity:.012, backgroundImage:'linear-gradient(rgba(14,165,233,1) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }}/>
                </div>
                {/* top accent */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent 0%,rgba(14,165,233,.55) 30%,rgba(56,189,248,.8) 50%,rgba(14,165,233,.55) 70%,transparent 100%)', opacity:.75 }}/>

                <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:370, display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ marginBottom:22, animation:'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={success} />
                    </div>

                    <div style={{ textAlign:'center', marginBottom:4, animation:'fadeUp .6s ease .18s backwards', width:'100%' }}>
                        <h1 style={{ fontSize:32, fontWeight:800, color:'#f0f6fc', margin:0, lineHeight:1.1, letterSpacing:'-.04em', fontFamily:"'Syne',sans-serif" }}>Welcome back</h1>
                        <p style={{ color:'#1a2e4a', margin:'9px 0 0', fontSize:12, lineHeight:1.55 }}>Sign in to your monitoring dashboard</p>
                    </div>

                    <div style={{ margin:'16px 0 18px', display:'flex', alignItems:'center', gap:10, width:'100%', animation:'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                        <ServerStatus status={status} />
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                    </div>

                    {/* CARD */}
                    <div style={{ width:'100%', padding:'28px 26px 24px', borderRadius:22, background:'rgba(6,14,28,.85)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)', border:`1px solid ${success ? 'rgba(34,197,94,.38)' : error ? 'rgba(239,68,68,.28)' : 'rgba(255,255,255,.07)'}`, boxShadow: success ? '0 0 70px rgba(34,197,94,.1),0 28px 60px rgba(0,0,0,.6)' : '0 28px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.03)', transition:'border-color .55s,box-shadow .55s', animation: shake ? 'shake .5s ease' : 'fadeUp .7s ease .32s backwards', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background: success ? 'linear-gradient(90deg,transparent,rgba(34,197,94,.6),transparent)' : 'linear-gradient(90deg,transparent,rgba(14,165,233,.38),transparent)', transition:'background .55s', animation:'edgePulse 3s ease-in-out infinite' }}/>
                        <Corners color={success ? 'rgba(34,197,94,.28)' : 'rgba(14,165,233,.22)'} />

                        {success && (
                            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at center,rgba(34,197,94,.08) 0%,transparent 70%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, borderRadius:22, animation:'fadeIn .3s ease' }}>
                                <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:'2px solid rgba(34,197,94,.3)', animation:'ripple 1s ease-out forwards' }}/>
                                <CheckCircle size={44} color="#22c55e" style={{ animation:'successPop .5s ease backwards', marginBottom:14 }}/>
                                <div style={{ color:'#22c55e', fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", animation:'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color:'#0f2540', fontSize:10, marginTop:6, fontFamily:"'JetBrains Mono',monospace", animation:'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginBottom:18, padding:'10px 13px', borderRadius:10, background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.22)', display:'flex', alignItems:'center', gap:9, animation:'slideDown .3s ease backwards' }}>
                                <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0 }}/>
                                <span style={{ color:'#ef4444', fontSize:12, fontWeight:500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading||success} />
                            <InputField icon={KeyRound} label="Password" type={showPwd?'text':'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading||success}
                                        rightEl={<button type="button" onClick={()=>setShowPwd(s=>!s)} tabIndex={-1} style={{ background:'none', border:'none', cursor:'pointer', color:'#101e35', padding:4, display:'flex', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#334155'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>{showPwd?<EyeOff size={14}/>:<Eye size={14}/>}</button>}
                            />

                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:-3 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }} onClick={()=>setRemember(r=>!r)}>
                                    <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:`1.5px solid ${remember?'#0ea5e9':'rgba(255,255,255,.1)'}`, background:remember?'#0ea5e9':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow:remember?'0 0 12px rgba(14,165,233,.4)':'none' }}>
                                        {remember&&<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize:11.5, color:'#1a2e4a', fontFamily:"'DM Sans',sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:11.5, color:'#101e35', fontFamily:"'DM Sans',sans-serif", padding:0, transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#38bdf8'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={!canSubmit} onMouseEnter={()=>setBtnHover(true)} onMouseLeave={()=>setBtnHover(false)} className={canSubmit&&!authLoading?'vi-btn':''} style={{ position:'relative', overflow:'hidden', background:btnBg, border:canSubmit?`1px solid ${success?'rgba(34,197,94,.3)':'rgba(14,165,233,.28)'}`:'1px solid rgba(255,255,255,.04)', padding:'14px 22px', borderRadius:13, color:'white', fontWeight:700, fontSize:14, fontFamily:"'Syne',sans-serif", letterSpacing:'.02em', cursor:canSubmit?'pointer':'not-allowed', marginTop:5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .28s cubic-bezier(.4,0,.2,1)', boxShadow:btnShadow, transform:btnHover&&canSubmit?'translateY(-2px)':'translateY(0)' }}>
                                {authLoading ? (<><Loader size={15} style={{ animation:'spin 1s linear infinite' }}/><span>Authenticating…</span></>) :
                                    success     ? (<><CheckCircle size={15}/><span>Access Granted</span></>) :
                                        (<><span>Sign In</span><ArrowRight size={15} style={{ transition:'transform .25s', transform:btnHover?'translateX(4px)':'translateX(0)' }}/></>)}
                            </button>
                        </form>

                        {!success && (
                            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.04)', textAlign:'center' }}>
                                <span style={{ fontSize:9.5, color:'#0a1828', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.04em' }}>Admin access only · Contact your DBA for credentials</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:5, animation:'fadeUp .6s ease .6s backwards' }}>
                        <Shield size={9} color="#0a1828" style={{ opacity:.4 }}/>
                        <span style={{ fontSize:9, color:'#0a1828', fontFamily:"'JetBrains Mono',monospace" }}>Secured by Vigil · PostgreSQL Monitor v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;