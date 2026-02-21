// ==========================================================================
//  VIGIL — Login Page  (Ultra-Premium v4)
//  Original auth logic 100% preserved.
//  Added: Canvas particles · 3D card tilt · Animated gradient bar ·
//         Live scrolling ticker · Focus-underline animation · Shimmer btn ·
//         Grain + scanlines · Ambient glows · Premium typography
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Lock, Activity, Bell, Search,
    TrendingUp, RefreshCw, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES  — original keyframes kept, new ones added
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #04080f; overflow: hidden; }

        /* ── original ── */
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
        @keyframes successPop{ 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes ripple    { 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(4);opacity:0} }
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 28px rgba(14,165,233,.22),0 0 70px rgba(14,165,233,.07)} 50%{box-shadow:0 0 46px rgba(14,165,233,.38),0 0 110px rgba(14,165,233,.12)} }
        @keyframes edgePulse { 0%,100%{opacity:.18} 50%{opacity:.75} }
        @keyframes scanline  { 0%{top:0%;opacity:0} 5%{opacity:.3} 95%{opacity:.3} 100%{top:100%;opacity:0} }
        @keyframes barGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        /* ── new premium ── */
        @keyframes sonar        { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)} 70%{box-shadow:0 0 0 9px rgba(34,197,94,0)} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} }
        @keyframes barSlide     { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes floatA       { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,55px)} }
        @keyframes floatB       { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-35px,-40px)} }

        /* ── autofill ── */
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

        /* shimmer sweep on Sign In button */
        .vi-btn::after {
            content:''; position:absolute; top:0; left:-100%; width:55%; height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,.11),transparent);
            animation:shimmer 2.6s ease infinite; pointer-events:none;
        }

        .fc:hover {
            border-color:rgba(14,165,233,.22)!important;
            background:rgba(14,165,233,.05)!important;
            transform:translateY(-2px)!important;
            box-shadow:0 8px 24px rgba(0,0,0,.4)!important;
        }
        .pc:hover { transform:translateY(-3px) scale(1.012)!important; }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  CANVAS PARTICLE FIELD
// ─────────────────────────────────────────────────────────────────────────────
const ParticleCanvas = () => {
    const canvasRef = useRef(null);
    const rafRef    = useRef(null);
    const ptsRef    = useRef([]);
    const mouseRef  = useRef({ x: -999, y: -999 });

    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');

        const resize = () => {
            cvs.width  = cvs.offsetWidth;
            cvs.height = cvs.offsetHeight;
            buildPts();
        };

        const buildPts = () => {
            const n = Math.min(Math.floor((cvs.width * cvs.height) / 15000), 80);
            ptsRef.current = Array.from({ length: n }, () => ({
                x:  Math.random() * cvs.width,
                y:  Math.random() * cvs.height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                r:  Math.random() * 1.1 + 0.3,
                ph: Math.random() * Math.PI * 2,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            const pts = ptsRef.current;
            const { x: mx, y: my } = mouseRef.current;

            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                p.x += p.vx; p.y += p.vy; p.ph += 0.01;
                if (p.x < 0) p.x = cvs.width;  if (p.x > cvs.width)  p.x = 0;
                if (p.y < 0) p.y = cvs.height; if (p.y > cvs.height) p.y = 0;

                const mdx = p.x - mx, mdy = p.y - my;
                const md  = Math.hypot(mdx, mdy);
                if (md < 110 && md > 0) {
                    const f = (1 - md / 110) * 0.28;
                    p.vx += (mdx / md) * f; p.vy += (mdy / md) * f;
                }
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 0.75) { p.vx /= spd * 1.3; p.vy /= spd * 1.3; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(14,165,233,${0.12 + Math.sin(p.ph) * 0.09})`;
                ctx.fill();

                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j];
                    const d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 105) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(14,165,233,${(1 - d / 105) * 0.055})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            rafRef.current = requestAnimationFrame(draw);
        };

        const onMouse = e => {
            const r = cvs.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouse);
        draw();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouse);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        />
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_DATA = [
    { lbl: 'postgres-primary', key: 'QPS',    val: '12.8k', c: '#0ea5e9' },
    { lbl: 'postgres-primary', key: 'P99',    val: '4.2ms', c: '#0ea5e9' },
    { lbl: 'replica-1',        key: 'Lag',    val: '0.0s',  c: '#22c55e' },
    { lbl: 'replica-2',        key: 'Lag',    val: '1.2s',  c: '#f59e0b' },
    { lbl: 'cache hit',        key: 'Ratio',  val: '97.4%', c: '#22c55e' },
    { lbl: 'alert engine',     key: 'Status', val: 'OK',    c: '#22c55e' },
    { lbl: 'connections',      key: 'Used',   val: '342/500', c: '#0ea5e9' },
    { lbl: 'deadlocks',        key: '24h',    val: '0',     c: '#22c55e' },
    { lbl: 'long txns',        key: 'Active', val: '1',     c: '#f59e0b' },
    { lbl: 'checkpoints',      key: 'Errs',   val: '0',     c: '#22c55e' },
];

const TickerBar = () => {
    const doubled = [...TICKER_DATA, ...TICKER_DATA];
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(4,8,15,0.92)', overflow: 'hidden', zIndex: 6, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', animation: 'tickerScroll 34s linear infinite', whiteSpace: 'nowrap' }}>
                {doubled.map((item, i) => (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 22px', borderRight: '1px solid rgba(255,255,255,0.04)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        <span style={{ color: '#1e3050' }}>{item.lbl}</span>
                        <span style={{ color: '#0d1e30' }}>·</span>
                        <span style={{ color: '#1e3050' }}>{item.key}</span>
                        <span style={{ color: item.c, fontWeight: 600 }}>{item.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  3-D DASHBOARD PREVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────
const SPARK = [18,28,22,42,28,52,32,44,60,36,50,65,40,58,70,48,66,78,52,70,82,56,74,100];
const METRIC_POOL = {
    v1:['12.8k','13.1k','12.6k','13.4k','12.9k'], d1:['+2%','+5%','-1%','+8%','+3%'],
    v2:['4.2ms','3.9ms','4.5ms','4.1ms','3.8ms'], d2:['stable','-7%','+4%','-2%','-9%'],
    v3:['97.4%','97.6%','97.3%','97.5%','97.8%'], d3:['+0.1%','+0.3%','-0.1%','+0.2%','+0.5%'],
    v4:['342','338','351','344','340'],             d4:['68% cap','67% cap','70% cap','68% cap','67% cap'],
};

const DashCard3D = () => {
    const sceneRef = useRef(null);
    const cardRef  = useRef(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const iv = setInterval(() => setTick(t => (t + 1) % 5), 2800);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const move = e => {
            const r  = scene.getBoundingClientRect();
            const rx = ((e.clientY - r.top  - r.height / 2) / r.height) * -9;
            const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  *  9;
            if (cardRef.current) cardRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        };
        const leave = () => { if (cardRef.current) cardRef.current.style.transform = 'rotateX(0) rotateY(0)'; };
        scene.addEventListener('mousemove', move);
        scene.addEventListener('mouseleave', leave);
        return () => { scene.removeEventListener('mousemove', move); scene.removeEventListener('mouseleave', leave); };
    }, []);

    const mv = k => METRIC_POOL[k][tick];

    return (
        <div ref={sceneRef} style={{ perspective: '1200px', marginBottom: 22 }}>
            <div ref={cardRef} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.12s ease-out', borderRadius: 14, willChange: 'transform' }}>
                <div style={{ background: '#090f1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.65)' }}>
                    {/* animated gradient top bar */}
                    <div style={{ height: 2, background: 'linear-gradient(90deg,#0ea5e9 0%,#22c55e 50%,#0ea5e9 100%)', backgroundSize: '300% 100%', animation: 'barSlide 3s linear infinite' }} />
                    <div style={{ padding: '16px 18px 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: 'rgba(56,189,248,.55)', letterSpacing: '.1em', fontWeight: 600 }}>
                                <Database size={11} color="#38bdf8" opacity={0.7} /> POSTGRES · PRIMARY
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#22c55e', padding: '3px 9px', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, background: 'rgba(34,197,94,0.06)', letterSpacing: '1px' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'sonar 2s infinite' }} />
                                HEALTHY
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 13 }}>
                            {[
                                { lbl:'QPS',   vk:'v1', dk:'d1', color:'#0ea5e9' },
                                { lbl:'P99',   vk:'v2', dk:'d2', color:'#0ea5e9' },
                                { lbl:'CACHE', vk:'v3', dk:'d3', color:'#22c55e' },
                                { lbl:'CONN',  vk:'v4', dk:'d4', color:'#f59e0b' },
                            ].map(({ lbl, vk, dk, color }) => (
                                <div key={lbl} style={{ background: `${color}0a`, border: `1px solid ${color}1a`, borderRadius: 8, padding: '8px 10px' }}>
                                    <div style={{ fontSize: 8.5, color: 'rgba(148,180,210,.4)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.06em', marginBottom: 5 }}>{lbl}</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{mv(vk)}</div>
                                    <div style={{ fontSize: 8, color: `${color}80`, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{mv(dk)}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 30, marginBottom: 5 }}>
                            {SPARK.map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0', background: i === SPARK.length-1 ? 'rgba(14,165,233,.72)' : i >= SPARK.length-5 ? 'rgba(14,165,233,.28)' : 'rgba(14,165,233,.12)', transition: 'height .3s' }} />
                            ))}
                        </div>
                        <div style={{ fontSize: 8, color: 'rgba(148,180,210,.25)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 12, letterSpacing: '.05em' }}>QPS · last 24 ticks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.04)' }}>
                            {[
                                { name: 'replica-1', lag: '0.0s', color: '#22c55e', status: 'SYNC' },
                                { name: 'replica-2', lag: '1.2s', color: '#f59e0b', status: 'LAG'  },
                            ].map(({ name, lag, color, status }) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block', flexShrink: 0 }} />
                                    <span style={{ fontSize: 9.5, color: 'rgba(148,180,210,.5)', fontFamily: "'JetBrains Mono',monospace", flex: 1 }}>{name}</span>
                                    <span style={{ fontSize: 9, color: 'rgba(148,180,210,.3)', fontFamily: "'JetBrains Mono',monospace" }}>lag {lag}</span>
                                    <span style={{ fontSize: 8, color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 4, padding: '1px 6px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURES LIST (same data as original)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES_SIMPLE = [
    { icon: Activity,   label: 'Real-time metrics',   desc: 'QPS, latency & cache hit — live'   },
    { icon: Bell,       label: 'Smart alerting',      desc: 'Fires before customers notice'     },
    { icon: Search,     label: 'Query inspector',     desc: 'EXPLAIN plans in one click'        },
    { icon: RefreshCw,  label: 'Replication monitor', desc: 'WAL lag & standby health'          },
    { icon: TrendingUp, label: 'Trend analysis',      desc: 'Anomaly detection across clusters' },
    { icon: UserCheck,  label: 'Access audit',        desc: 'RBAC & compliance trails'          },
];

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL — upgraded with canvas, 3D card, ticker, premium typography
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = () => (
    <div style={{ flex:'1 1 0', minWidth:0, height:'100vh', background:'#04080f', borderRight:'1px solid rgba(255,255,255,.05)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>

        {/* Layer 0 – particle canvas */}
        <ParticleCanvas />

        {/* Layer 1 – ambient glow blobs */}
        <div style={{ position:'absolute', top:'-12%', left:'-8%', width:'65%', height:'60%', background:'radial-gradient(circle,rgba(14,165,233,.08) 0%,transparent 70%)', filter:'blur(70px)', animation:'floatA 20s ease-in-out infinite', pointerEvents:'none', zIndex:1 }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'0%', width:'55%', height:'55%', background:'radial-gradient(circle,rgba(20,184,166,.06) 0%,transparent 70%)', filter:'blur(60px)', animation:'floatB 24s ease-in-out infinite', pointerEvents:'none', zIndex:1 }}/>

        {/* Layer 2 – faint dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,.1) 1px,transparent 1px)', backgroundSize:'32px 32px', opacity:.3, pointerEvents:'none', zIndex:2 }}/>

        {/* Layer 3 – noise grain */}
        <div style={{ position:'absolute', inset:0, zIndex:3, pointerEvents:'none', opacity:.022, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>

        {/* Layer 4 – scanlines */}
        <div style={{ position:'absolute', inset:0, zIndex:4, pointerEvents:'none', background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.022) 2px,rgba(0,0,0,.022) 4px)' }}/>

        {/* Layer 5 – glowing right-edge accent */}
        <div style={{ position:'absolute', top:'14%', bottom:'14%', right:0, width:1, background:'linear-gradient(to bottom,transparent,rgba(14,165,233,.45),rgba(14,165,233,.45),transparent)', filter:'blur(.5px)', zIndex:5 }}/>

        {/* Content */}
        <div style={{ position:'relative', zIndex:6, flex:1, display:'flex', flexDirection:'column', padding:'0 44px', paddingBottom:56 }}>

            {/* Logo bar */}
            <div style={{ padding:'22px 0 10px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#0ea5e9,#38bdf8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(14,165,233,.4)' }}>
                    <Database size={16} color="#fff"/>
                </div>
                <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#38bdf8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.18em', textTransform:'uppercase', lineHeight:1 }}>Vigil</div>
                    <div style={{ fontSize:9, color:'rgba(56,189,248,.35)', fontFamily:"'JetBrains Mono',monospace", marginTop:2, letterSpacing:'.06em' }}>PostgreSQL Monitor</div>
                </div>
            </div>

            {/* Headline */}
            <div style={{ marginBottom:20, animation:'fadeUp .7s ease .1s backwards' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(14,165,233,.08)', border:'1px solid rgba(14,165,233,.18)', borderRadius:20, padding:'4px 12px', marginBottom:16 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', boxShadow:'0 0 6px #22c55e', animation:'sonar 2.4s ease-out infinite' }}/>
                    <span style={{ fontSize:9.5, fontWeight:700, color:'#38bdf8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em' }}>LIVE MONITORING</span>
                </div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,2.8vw,44px)', fontWeight:300, color:'#eef4ff', lineHeight:1.1, letterSpacing:'-0.3px', margin:'0 0 12px' }}>
                    Complete visibility<br/>
                    for your <em style={{ fontStyle:'italic', color:'#38bdf8' }}>PostgreSQL</em><br/>
                    clusters.
                </h2>
                <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:12, fontWeight:300, color:'rgba(148,180,210,.5)', lineHeight:1.7, margin:0, maxWidth:360 }}>
                    One dashboard for query performance, replication health,<br/>connection pools and anomaly alerts.
                </p>
            </div>

            {/* 3D Dashboard Card */}
            <div style={{ animation:'fadeUp .7s ease .15s backwards' }}>
                <DashCard3D />
            </div>

            {/* Feature list */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'9px 20px', animation:'fadeUp .7s ease .2s backwards', marginBottom:20 }}>
                {FEATURES_SIMPLE.map(({ icon: Icon, label, desc }) => (
                    <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                        <div style={{ width:26, height:26, borderRadius:7, background:'rgba(14,165,233,.07)', border:'1px solid rgba(14,165,233,.13)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                            <Icon size={12} color="#38bdf8"/>
                        </div>
                        <div>
                            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:600, color:'#b8d4e8', lineHeight:1.3 }}>{label}</div>
                            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:9.5, fontWeight:300, color:'rgba(148,180,210,.35)', marginTop:1.5, lineHeight:1.4 }}>{desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(14,165,233,.12),transparent)', margin:'0 0 18px', animation:'fadeUp .7s ease .3s backwards' }}/>

            {/* Trust stats */}
            <div style={{ display:'flex', alignItems:'center', gap:28, animation:'fadeUp .7s ease .35s backwards' }}>
                {[['99.9%','Uptime SLA'],['< 1s','Alert latency'],['SOC 2','Type II']].map(([val, lbl]) => (
                    <div key={lbl}>
                        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:'#38bdf8', lineHeight:1 }}>{val}</div>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8.5, color:'rgba(148,180,210,.35)', marginTop:3, letterSpacing:'.04em' }}>{lbl}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom footer */}
        <div style={{ position:'absolute', bottom:28, left:44, right:44, zIndex:6, display:'flex', alignItems:'center', gap:6 }}>
            <Lock size={9} color="rgba(56,189,248,.2)"/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(56,189,248,.2)', letterSpacing:'.04em' }}>End-to-end encrypted · © 2025 Vigil</span>
        </div>

        {/* Ticker */}
        <TickerBar />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  ORIGINAL HELPER COMPONENTS — zero changes
// ─────────────────────────────────────────────────────────────────────────────
const Cyl = ({ color='#0ea5e9', w=38, label, dot }) => {
    const h=w*1.15, rx=w*0.48, ry=rx*0.27, cx=w/2;
    const bodyTop=ry+1, bodyH=h-ry*2.4;
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                <defs>
                    <linearGradient id={`cb${color.slice(1)}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor={color} stopOpacity=".5"/>
                        <stop offset="50%"  stopColor={color} stopOpacity=".25"/>
                        <stop offset="100%" stopColor={color} stopOpacity=".5"/>
                    </linearGradient>
                    <linearGradient id={`ct${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={color} stopOpacity=".9"/>
                        <stop offset="100%" stopColor={color} stopOpacity=".55"/>
                    </linearGradient>
                </defs>
                <ellipse cx={cx} cy={h-2} rx={rx*.65} ry={ry*.4} fill={color} opacity=".1"/>
                <rect x={cx-rx} y={bodyTop} width={rx*2} height={bodyH} fill={`url(#cb${color.slice(1)})`}/>
                <ellipse cx={cx} cy={bodyTop+bodyH} rx={rx} ry={ry} fill={color} opacity=".4"/>
                {[.35,.7].map((f,i)=><ellipse key={i} cx={cx} cy={bodyTop+bodyH*f} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth=".5" opacity=".2"/>)}
                <ellipse cx={cx} cy={bodyTop} rx={rx} ry={ry} fill={`url(#ct${color.slice(1)})`}/>
                <ellipse cx={cx} cy={bodyTop} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth=".8" opacity=".55"/>
                <ellipse cx={cx-rx*.2} cy={bodyTop-ry*.1} rx={rx*.28} ry={ry*.5} fill="white" opacity=".1"/>
                {dot && <circle cx={cx+rx*.6} cy={bodyTop+3} r="2.5" fill={dot} style={{ filter:`drop-shadow(0 0 3px ${dot})` }}/>}
            </svg>
            {label && <span style={{ fontSize:6.5, color, fontWeight:700, fontFamily:'JetBrains Mono,monospace', letterSpacing:'.08em' }}>{label}</span>}
        </div>
    );
};

const LiveBar = ({ pct, color, label, value }) => (
    <div style={{ marginBottom:5 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2.5 }}>
            <span style={{ fontSize:7, color:'#1e3a5f', letterSpacing:'.05em' }}>{label}</span>
            <span style={{ fontSize:7.5, color, fontWeight:700 }}>{value}</span>
        </div>
        <div style={{ height:5, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${color}55,${color})`, borderRadius:3 }}/>
        </div>
    </div>
);

const CapCard = ({ icon, title, desc, color }) => (
    <div style={{ background:`${color}08`, border:`1px solid ${color}20`, borderRadius:9, padding:'10px 11px', display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{icon}</div>
            <span style={{ fontSize:9.5, fontWeight:700, color:'#c8d6e5', lineHeight:1.2 }}>{title}</span>
        </div>
        <span style={{ fontSize:8.5, color:'#1e3a5f', lineHeight:1.5 }}>{desc}</span>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO EMBLEM — original, zero changes
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
//  SERVER STATUS — original, zero changes
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }) => {
    const on=status.status==='online', off=status.status==='offline', checking=status.status==='checking';
    const color = on ? '#22c55e' : off ? '#ef4444' : '#f59e0b';
    const label = on ? 'ONLINE' : off ? 'OFFLINE' : checking ? 'Checking…' : 'DEGRADED';
    return (
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px 5px 10px', borderRadius:100, background:`${color}09`, border:`1px solid ${color}22`, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>
            {checking
                ? <><Loader size={9} color="#334155" style={{ animation:'spin 1s linear infinite' }}/><span style={{ color:'#334155' }}>Checking…</span></>
                : <>
                    <div style={{ position:'relative', width:7, height:7 }}>
                        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, boxShadow:`0 0 7px ${color}90`, animation:on?'pulse 2s ease-in-out infinite':'none' }}/>
                        {on && <div style={{ position:'absolute', inset:-2, borderRadius:'50%', border:`1px solid ${color}60`, animation:'ring 2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight:700, letterSpacing:'.05em' }}>{label}</span>
                    {status.latency!=null && <span style={{ color:'#0f2540', fontSize:9, padding:'1px 6px', borderRadius:4, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.04)' }}>{status.latency}ms</span>}
                </>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT FIELD — original + animated focus-underline bar added
// ─────────────────────────────────────────────────────────────────────────────
const InputField = React.forwardRef(function InputField(
    { icon:Icon, label, type='text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{ display:'block', marginBottom:7, fontSize:9.5, fontWeight:600, color:focused?'#0ea5e9':'#1a3050', textTransform:'uppercase', letterSpacing:'1.4px', fontFamily:"'JetBrains Mono',monospace", transition:'color .2s' }}>{label}</label>
            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10, background:focused?'rgba(14,165,233,.05)':'rgba(255,255,255,.022)', border:`1px solid ${focused?'rgba(14,165,233,.45)':'rgba(255,255,255,.07)'}`, borderRadius:13, padding:'0 14px', transition:'all .25s cubic-bezier(.4,0,.2,1)', boxShadow:focused?'0 0 0 3.5px rgba(14,165,233,.08),inset 0 1px 0 rgba(255,255,255,.04)':'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                <Icon size={15} color={focused?'#0ea5e9':hasVal?'#2a4560':'#101e35'} style={{ flexShrink:0, transition:'color .2s' }}/>
                <input
                    ref={ref} type={type} value={value}
                    onChange={e=>onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete}
                    disabled={disabled}
                    onFocus={()=>setFocused(true)}
                    onBlur={()=>setFocused(false)}
                    className="vi-input"
                    style={{ flex:1, padding:'13px 0', background:'none', border:'none', color:'#e2e8f0', fontSize:13.5, outline:'none', fontFamily:"'Manrope',sans-serif", fontWeight:400, letterSpacing:'.01em', opacity:disabled?.4:1 }}
                />
                {rightEl}
                {/* animated focus underline bar */}
                <div style={{ position:'absolute', bottom:0, left:focused?14:'50%', right:focused?14:'50%', height:2, background:'#0ea5e9', borderRadius:'0 0 13px 13px', transition:'left .3s cubic-bezier(.16,1,.3,1),right .3s cubic-bezier(.16,1,.3,1)', opacity:focused?1:0 }}/>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORNER ACCENTS — original, zero changes
// ─────────────────────────────────────────────────────────────────────────────
const Corners = ({ color='rgba(14,165,233,.25)' }) => (
    <>
        {[
            { top:0,    left:0,  borderTop:`1px solid ${color}`, borderLeft:`1px solid ${color}`,   borderRadius:'3px 0 0 0' },
            { top:0,    right:0, borderTop:`1px solid ${color}`, borderRight:`1px solid ${color}`,  borderRadius:'0 3px 0 0' },
            { bottom:0, left:0,  borderBottom:`1px solid ${color}`, borderLeft:`1px solid ${color}`, borderRadius:'0 0 0 3px' },
            { bottom:0, right:0, borderBottom:`1px solid ${color}`, borderRight:`1px solid ${color}`,borderRadius:'0 0 3px 0' },
        ].map(({ borderRadius, ...style }, i) => (
            <div key={i} style={{ position:'absolute', width:14, height:14, pointerEvents:'none', borderRadius, ...style }}/>
        ))}
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE — original logic 100% intact, cosmetic font upgrades only
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
    const { login, authLoading, error, clearError } = useAuth();

    const [username,     setUsername]     = useState('');
    const [password,     setPassword]     = useState('');
    const [showPwd,      setShowPwd]      = useState(false);
    const [rememberMe,   setRememberMe]   = useState(false);
    const [serverStatus, setServerStatus] = useState({ status: 'checking' });
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [shake,        setShake]        = useState(false);
    const [btnHover,     setBtnHover]     = useState(false);

    const userRef = useRef(null);
    const pwdRef  = useRef(null);

    // Health check
    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0   = performance.now();
                const res  = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const data = await res.json();
                if (!cancelled) setServerStatus({ status: data.status==='ok'?'online':'degraded', latency: Math.round(performance.now()-t0), dbLatency: data.dbLatencyMs, pool: data.pool });
            } catch {
                if (!cancelled) setServerStatus({ status: 'offline' });
            }
        };
        check();
        const iv = setInterval(check, 15000);
        return () => { cancelled = true; clearInterval(iv); };
    }, []);

    // Restore remembered user
    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) { setUsername(saved); setRememberMe(true); pwdRef.current?.focus(); }
        else userRef.current?.focus();
    }, []);

    // Shake on error
    useEffect(() => {
        if (error) { setShake(true); const t=setTimeout(()=>setShake(false),600); return ()=>clearTimeout(t); }
    }, [error]);

    // Clear error on typing
    useEffect(() => {
        if (error && clearError) clearError();
    }, [username, password]); // eslint-disable-line react-hooks/exhaustive-deps

    // Submit
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else            localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try { await login(username, password); setLoginSuccess(true); }
        catch { /* handled by AuthContext */ }
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length>0 && password.trim().length>0 && !authLoading && !loginSuccess;
    const btnBg     = authLoading  ? 'rgba(14,165,233,.5)'
        : loginSuccess ? '#22c55e'
            : canSubmit    ? 'linear-gradient(135deg,#0284c7 0%,#0ea5e9 50%,#38bdf8 100%)'
                :                'rgba(14,165,233,.12)';
    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? (btnHover ? '0 10px 34px rgba(14,165,233,.55),0 0 0 1px rgba(14,165,233,.3) inset'
            : '0 4px 22px rgba(14,165,233,.3),0 0 0 1px rgba(14,165,233,.16) inset')
        : 'none';

    return (
        <div style={{ height:'100vh', width:'100vw', display:'flex', background:'#04080f', fontFamily:"'Manrope',sans-serif", overflow:'hidden' }}>
            <GlobalStyles />
            <LeftPanel />

            {/* RIGHT — login form */}
            <div style={{ width:490, flexShrink:0, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 44px', background:'rgba(4,7,14,.98)' }}>

                {/* bg blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'5%', right:'-22%', width:420, height:420, background:'radial-gradient(circle,rgba(14,165,233,.055) 0%,transparent 65%)', animation:'blob2 24s ease-in-out infinite', filter:'blur(55px)' }}/>
                    <div style={{ position:'absolute', bottom:'5%', left:'-18%', width:320, height:320, background:'radial-gradient(circle,rgba(20,184,166,.045) 0%,transparent 65%)', animation:'blob1 18s ease-in-out infinite', filter:'blur(40px)' }}/>
                    <div style={{ position:'absolute', inset:0, opacity:.012, backgroundImage:'linear-gradient(rgba(14,165,233,1) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }}/>
                </div>

                {/* top edge accent */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent 0%,rgba(14,165,233,.55) 30%,rgba(56,189,248,.8) 50%,rgba(14,165,233,.55) 70%,transparent 100%)', opacity:.75 }}/>

                {/* glowing left-edge accent */}
                <div style={{ position:'absolute', top:'14%', bottom:'14%', left:0, width:1, background:'linear-gradient(to bottom,transparent,rgba(14,165,233,.4),rgba(14,165,233,.4),transparent)', filter:'blur(.5px)' }}/>

                <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:370, display:'flex', flexDirection:'column', alignItems:'center' }}>

                    {/* Logo */}
                    <div style={{ marginBottom:22, animation:'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess}/>
                    </div>

                    {/* Heading — upgraded to Cormorant Garamond */}
                    <div style={{ textAlign:'center', marginBottom:4, animation:'fadeUp .6s ease .18s backwards', width:'100%' }}>
                        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#f0f6fc', margin:0, lineHeight:1.05, letterSpacing:'-.02em' }}>
                            Welcome <em style={{ fontStyle:'italic', color:'#38bdf8' }}>back</em>
                        </h1>
                        <p style={{ fontFamily:"'Manrope',sans-serif", color:'#1a2e4a', margin:'9px 0 0', fontSize:12, lineHeight:1.55, fontWeight:300 }}>Sign in to your monitoring dashboard</p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin:'16px 0 18px', display:'flex', alignItems:'center', gap:10, width:'100%', animation:'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                    </div>

                    {/* Card */}
                    <div style={{ width:'100%', padding:'28px 26px 24px', borderRadius:22, background:'rgba(6,14,28,.85)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)', border:`1px solid ${loginSuccess?'rgba(34,197,94,.38)':error?'rgba(239,68,68,.28)':'rgba(255,255,255,.07)'}`, boxShadow:loginSuccess?'0 0 70px rgba(34,197,94,.1),0 28px 60px rgba(0,0,0,.6)':'0 28px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.03)', transition:'border-color .55s,box-shadow .55s', animation:shake?'shake .5s ease':'fadeUp .7s ease .32s backwards', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:loginSuccess?'linear-gradient(90deg,transparent,rgba(34,197,94,.6),transparent)':'linear-gradient(90deg,transparent,rgba(14,165,233,.38),transparent)', transition:'background .55s', animation:'edgePulse 3s ease-in-out infinite' }}/>
                        <Corners color={loginSuccess?'rgba(34,197,94,.28)':'rgba(14,165,233,.22)'}/>

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at center,rgba(34,197,94,.08) 0%,transparent 70%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, borderRadius:22, animation:'fadeIn .3s ease' }}>
                                <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:'2px solid rgba(34,197,94,.3)', animation:'ripple 1s ease-out forwards' }}/>
                                <CheckCircle size={44} color="#22c55e" style={{ animation:'successPop .5s ease backwards', marginBottom:14 }}/>
                                <div style={{ fontFamily:"'Cormorant Garamond',serif", color:'#22c55e', fontSize:20, fontWeight:300, animation:'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ fontFamily:"'JetBrains Mono',monospace", color:'#0f2540', fontSize:10, marginTop:6, animation:'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {/* Error banner */}
                        {error && (
                            <div style={{ marginBottom:18, padding:'10px 13px', borderRadius:10, background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.22)', display:'flex', alignItems:'center', gap:9, animation:'slideDown .3s ease backwards' }}>
                                <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0 }}/>
                                <span style={{ color:'#ef4444', fontSize:12, fontWeight:500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading||loginSuccess}/>
                            <InputField
                                ref={pwdRef} icon={KeyRound} label="Password"
                                type={showPwd?'text':'password'}
                                value={password} onChange={setPassword}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={authLoading||loginSuccess}
                                rightEl={
                                    <button type="button" onClick={()=>setShowPwd(s=>!s)} tabIndex={-1} style={{ background:'none', border:'none', cursor:'pointer', color:'#101e35', padding:4, display:'flex', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#334155'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>
                                        {showPwd?<EyeOff size={14}/>:<Eye size={14}/>}
                                    </button>
                                }
                            />

                            {/* Remember me + Forgot */}
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:-3 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }} onClick={()=>setRememberMe(r=>!r)}>
                                    <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:`1.5px solid ${rememberMe?'#0ea5e9':'rgba(255,255,255,.1)'}`, background:rememberMe?'#0ea5e9':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow:rememberMe?'0 0 12px rgba(14,165,233,.4)':'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:11.5, color:'#1a2e4a', fontWeight:400 }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'Manrope',sans-serif", fontSize:11.5, color:'#101e35', padding:0, transition:'color .2s', fontWeight:400 }} onMouseEnter={e=>e.currentTarget.style.color='#38bdf8'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In — vi-btn adds shimmer sweep */}
                            <button
                                type="submit"
                                className="vi-btn"
                                disabled={!canSubmit}
                                onMouseEnter={()=>setBtnHover(true)}
                                onMouseLeave={()=>setBtnHover(false)}
                                style={{ position:'relative', overflow:'hidden', background:btnBg, border:canSubmit?`1px solid ${loginSuccess?'rgba(34,197,94,.3)':'rgba(14,165,233,.28)'}`:'1px solid rgba(255,255,255,.04)', padding:'14px 22px', borderRadius:13, color:'white', fontWeight:700, fontSize:14, fontFamily:"'Manrope',sans-serif", letterSpacing:'.04em', cursor:canSubmit?'pointer':'not-allowed', marginTop:5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .28s cubic-bezier(.4,0,.2,1)', boxShadow:btnShadow, transform:btnHover&&canSubmit?'translateY(-2px)':'translateY(0)' }}
                            >
                                {authLoading  ? (<><Loader size={15} style={{ animation:'spin 1s linear infinite' }}/><span>Authenticating…</span></>) :
                                    loginSuccess  ? (<><CheckCircle size={15}/><span>Access Granted</span></>) :
                                        (<><span>Sign In</span><ArrowRight size={15} style={{ transition:'transform .25s', transform:btnHover?'translateX(4px)':'translateX(0)' }}/></>)}
                            </button>
                        </form>

                        {!loginSuccess && (
                            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.04)', textAlign:'center' }}>
                                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9.5, color:'#0a1828', letterSpacing:'.04em' }}>Admin access only · Contact your DBA for credentials</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:5, animation:'fadeUp .6s ease .6s backwards' }}>
                        <Shield size={9} color="#0a1828" style={{ opacity:.4 }}/>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#0a1828' }}>Secured by Vigil · PostgreSQL Monitor v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;