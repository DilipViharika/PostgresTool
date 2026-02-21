// ==========================================================================
//  VIGIL — Login Page  (Premium Redesign v4 — with Network Canvas)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Lock, Activity, Bell, Search,
    TrendingUp, RefreshCw, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

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
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes ring      { 0%{transform:scale(0.7);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes shimmer   { 0%{left:-100%} 100%{left:200%} }
        @keyframes successPop{ 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes ripple    { 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(4);opacity:0} }
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 28px rgba(14,165,233,.22),0 0 70px rgba(14,165,233,.07)} 50%{box-shadow:0 0 46px rgba(14,165,233,.38),0 0 110px rgba(14,165,233,.12)} }
        @keyframes edgePulse { 0%,100%{opacity:.18} 50%{opacity:.75} }

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
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  NETWORK CANVAS HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useNetworkCanvas(canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let nodes = [], edges = [];
        const mouse = { x: -999, y: -999 };
        const packets = [];

        const PALETTE = [
            { h: 232, s: 100, l: 70 }, // indigo
            { h: 275, s: 85,  l: 65 }, // violet
            { h: 165, s: 100, l: 55 }, // emerald
            { h: 46,  s: 90,  l: 60 }, // amber
            { h: 348, s: 100, l: 65 }, // rose
        ];
        const hsl = (c, a) => `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

        function buildGraph(W, H) {
            nodes = [];
            edges = [];

            // Central primary node
            nodes.push({
                x: W * 0.42, y: H * 0.44,
                vx: 0, vy: 0,
                r: 9, color: PALETTE[0],
                role: 'primary', phase: 0, pulse: 0,
            });

            // Replica ring
            const replicaPos = [
                { x: 0.22, y: 0.28 }, { x: 0.62, y: 0.22 },
                { x: 0.70, y: 0.56 }, { x: 0.24, y: 0.62 },
                { x: 0.48, y: 0.72 },
            ];
            replicaPos.forEach((p, i) => {
                const c = PALETTE[i % PALETTE.length];
                nodes.push({
                    x: W * p.x + (Math.random() - .5) * 30,
                    y: H * p.y + (Math.random() - .5) * 30,
                    vx: (Math.random() - .5) * 0.15,
                    vy: (Math.random() - .5) * 0.15,
                    r: i === 0 ? 6.5 : 5.5,
                    color: c, role: 'replica',
                    phase: Math.random() * Math.PI * 2, pulse: 0,
                });
            });

            // Micro-nodes
            for (let i = 0; i < 18; i++) {
                const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                nodes.push({
                    x: W * (0.08 + Math.random() * 0.84),
                    y: H * (0.06 + Math.random() * 0.88),
                    vx: (Math.random() - .5) * 0.22,
                    vy: (Math.random() - .5) * 0.22,
                    r: 1.5 + Math.random() * 2,
                    color: c, role: 'micro',
                    phase: Math.random() * Math.PI * 2, pulse: 0,
                });
            }

            // Edges: primary → replicas
            for (let i = 1; i <= 5; i++) edges.push({ a: 0, b: i, strength: 1 });
            // Replicas → micros
            for (let i = 6; i < nodes.length; i++) {
                edges.push({ a: Math.floor(Math.random() * 5) + 1, b: i, strength: 0.5 });
            }
            // Micro → micro short links
            for (let i = 6; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    if (Math.sqrt(dx * dx + dy * dy) < 160 && Math.random() > 0.55) {
                        edges.push({ a: i, b: j, strength: 0.25 });
                    }
                }
            }
        }

        function spawnPacket() {
            if (edges.length === 0) return;
            const e = edges[Math.floor(Math.random() * edges.length)];
            packets.push({ edge: e, t: 0, speed: 0.008 + Math.random() * 0.012, reverse: Math.random() > 0.5 });
        }

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width  = rect.width;
            canvas.height = rect.height;
            buildGraph(canvas.width, canvas.height);
        }

        function draw() {
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            // Update physics
            nodes.forEach(n => {
                if (n.role === 'primary') return;
                n.phase += 0.008;
                n.x += n.vx + Math.sin(n.phase * 0.7) * 0.04;
                n.y += n.vy + Math.cos(n.phase * 0.5) * 0.04;
                const pad = 40;
                if (n.x < pad) n.vx += 0.04;
                if (n.x > W - pad) n.vx -= 0.04;
                if (n.y < pad) n.vy += 0.04;
                if (n.y > H - pad) n.vy -= 0.04;
                n.vx *= 0.995; n.vy *= 0.995;
                n.vx = Math.max(-0.5, Math.min(0.5, n.vx));
                n.vy = Math.max(-0.5, Math.min(0.5, n.vy));
                const dx = n.x - mouse.x, dy = n.y - mouse.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) { const f = (1 - d / 120) * 0.3; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
            });

            // Edges
            edges.forEach(e => {
                const a = nodes[e.a], b = nodes[e.b];
                const dx = b.x - a.x, dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const alpha = e.strength * 0.18 * Math.max(0, 1 - dist / 450);
                if (alpha < 0.01) return;
                const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                grad.addColorStop(0, hsl(a.color, alpha));
                grad.addColorStop(1, hsl(b.color, alpha));
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = grad;
                ctx.lineWidth = e.strength * 0.8;
                ctx.stroke();
            });

            // Packets
            for (let pi = packets.length - 1; pi >= 0; pi--) {
                const pk = packets[pi];
                pk.t += pk.speed;
                if (pk.t >= 1) { packets.splice(pi, 1); continue; }
                const a = nodes[pk.edge.a], b = nodes[pk.edge.b];
                const t = pk.reverse ? 1 - pk.t : pk.t;
                const x = a.x + (b.x - a.x) * t;
                const y = a.y + (b.y - a.y) * t;
                ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = hsl(a.color, 0.9); ctx.fill();
                const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
                g.addColorStop(0, hsl(a.color, 0.25)); g.addColorStop(1, hsl(a.color, 0));
                ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
            }

            // Nodes
            nodes.forEach(n => {
                n.phase += 0.01;
                const breathe = Math.sin(n.phase) * 0.18 + 1;
                const rr = n.r * breathe;

                if (n.role !== 'micro') {
                    const glowR = rr + (n.role === 'primary' ? 22 : 14);
                    const glow  = ctx.createRadialGradient(n.x, n.y, rr, n.x, n.y, glowR);
                    glow.addColorStop(0, hsl(n.color, n.role === 'primary' ? 0.22 : 0.12));
                    glow.addColorStop(1, hsl(n.color, 0));
                    ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
                    ctx.fillStyle = glow; ctx.fill();

                    ctx.beginPath(); ctx.arc(n.x, n.y, rr + 3.5, 0, Math.PI * 2);
                    ctx.strokeStyle = hsl(n.color, 0.25); ctx.lineWidth = 1; ctx.stroke();
                }

                const fill = ctx.createRadialGradient(n.x - rr * 0.3, n.y - rr * 0.3, 0, n.x, n.y, rr);
                fill.addColorStop(0, hsl({ ...n.color, l: Math.min(95, n.color.l + 20) }, 1));
                fill.addColorStop(1, hsl(n.color, 0.85));
                ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, Math.PI * 2);
                ctx.fillStyle = fill; ctx.fill();

                if (n.role === 'primary') {
                    n.pulse = (n.pulse + 0.012) % 1;
                    const pr = rr + 8 + n.pulse * 28;
                    ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
                    ctx.strokeStyle = hsl(n.color, (1 - n.pulse) * 0.35);
                    ctx.lineWidth = 1.5; ctx.stroke();
                }
            });

            animId = requestAnimationFrame(draw);
        }

        const packetInterval = setInterval(() => { if (packets.length < 24) spawnPacket(); }, 350);

        resize();
        draw();

        const onResize = () => { cancelAnimationFrame(animId); resize(); draw(); };
        const onMouseMove = e => {
            const r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        };

        window.addEventListener('resize', onResize);
        canvas.parentElement.addEventListener('mousemove', onMouseMove);

        return () => {
            cancelAnimationFrame(animId);
            clearInterval(packetInterval);
            window.removeEventListener('resize', onResize);
            canvas.parentElement?.removeEventListener('mousemove', onMouseMove);
        };
    }, [canvasRef]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL — Network canvas + brand overlay
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES_SIMPLE = [
    { icon: Activity,   label: 'Real-time metrics',   desc: 'QPS, latency & cache hit — live'   },
    { icon: Bell,       label: 'Smart alerting',      desc: 'Fires before customers notice'     },
    { icon: Search,     label: 'Query inspector',     desc: 'EXPLAIN plans in one click'        },
    { icon: RefreshCw,  label: 'Replication monitor', desc: 'WAL lag & standby health'          },
    { icon: TrendingUp, label: 'Trend analysis',      desc: 'Anomaly detection across clusters' },
    { icon: UserCheck,  label: 'Access audit',        desc: 'RBAC & compliance trails'          },
];

const LeftPanel = () => {
    const canvasRef = useRef(null);
    useNetworkCanvas(canvasRef);

    return (
        <div style={{
            flex: '1 1 0', minWidth: 0, height: '100vh',
            background: '#05080f',
            borderRight: '1px solid rgba(255,255,255,.06)',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* ── Animated network canvas (full bleed background) ── */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    zIndex: 0, display: 'block',
                }}
            />

            {/* ── Atmospheric mesh overlays (sit above canvas) ── */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 70% 60% at 30% 25%, rgba(100,112,255,0.10) 0%, transparent 65%),
                    radial-gradient(ellipse 55% 50% at 75% 70%, rgba(155,95,238,0.07) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 45% at 65% 15%, rgba(0,212,160,0.04) 0%, transparent 55%)
                ` }} />

            {/* Subtle radial glow — top-left */}
            <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'60%', height:'55%', background:'radial-gradient(circle,rgba(14,165,233,.05) 0%,transparent 70%)', pointerEvents:'none', zIndex:1 }}/>
            {/* Subtle radial glow — bottom-right */}
            <div style={{ position:'absolute', bottom:'-10%', right:'0%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(20,184,166,.04) 0%,transparent 70%)', pointerEvents:'none', zIndex:1 }}/>

            {/* Faint dot grid */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(100,112,255,.12) 1px,transparent 1px)', backgroundSize:'40px 40px', opacity:.28, pointerEvents:'none', zIndex:1,
                maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 80%)',
            }}/>

            {/* Fine grain */}
            <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', opacity:0.025,
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}/>

            {/* ── All content sits above canvas ── */}
            <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', height:'100%' }}>

                {/* Top logo bar */}
                <div style={{ padding:'22px 36px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#4A54E8,#8A46DB)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 24px rgba(74,84,232,0.45), 0 0 60px rgba(74,84,232,0.15)' }}>
                        <Database size={16} color="#fff"/>
                    </div>
                    <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#818AFF', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.16em', textTransform:'uppercase', lineHeight:1 }}>Vigil</div>
                        <div style={{ fontSize:9, color:'rgba(129,138,255,.4)', fontFamily:"'JetBrains Mono',monospace", marginTop:2, letterSpacing:'.06em' }}>PostgreSQL Intelligence</div>
                    </div>
                </div>

                {/* Main centred content */}
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 44px 32px' }}>

                    {/* Headline */}
                    <div style={{ marginBottom:24, animation:'fadeUp .6s ease .1s backwards' }}>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(100,112,255,.08)', border:'1px solid rgba(100,112,255,.2)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', boxShadow:'0 0 6px #22c55e', animation:'pulse 2s ease infinite' }}/>
                            <span style={{ fontSize:9.5, fontWeight:700, color:'#818AFF', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em' }}>LIVE MONITORING</span>
                        </div>
                        <h2 style={{ fontSize:24, fontWeight:800, color:'#e8f4fc', fontFamily:"'Syne',sans-serif", lineHeight:1.25, letterSpacing:'-.02em', margin:'0 0 10px' }}>
                            Complete visibility for your{' '}
                            <span style={{ color:'#818AFF' }}>PostgreSQL</span> clusters.
                        </h2>
                        <p style={{ fontSize:11.5, color:'rgba(148,180,210,.45)', lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif", fontWeight:400, maxWidth:360 }}>
                            One dashboard for query performance, replication health, connection pools and anomaly alerts.
                        </p>
                    </div>

                    {/* Mini metrics card — frosted glass over the canvas */}
                    <div style={{ background:'rgba(7,8,15,0.72)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', border:'1px solid rgba(100,112,255,.14)', borderRadius:14, padding:'16px 18px', marginBottom:24, animation:'fadeUp .6s ease .15s backwards', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:'linear-gradient(90deg,transparent,rgba(100,112,255,.45),transparent)' }}/>

                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <Database size={12} color="#818AFF" opacity={0.7}/>
                                <span style={{ fontSize:9.5, color:'rgba(129,138,255,.6)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', fontWeight:600 }}>POSTGRES · PRIMARY</span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s ease infinite' }}/>
                                <span style={{ fontSize:9, color:'#22c55e', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>HEALTHY</span>
                            </div>
                        </div>

                        {/* 4 KPI tiles */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
                            {[
                                { label:'QPS',   value:'12.8k', color:'#6470FF', trend:'+2%'   },
                                { label:'P99',   value:'4.2ms', color:'#22c55e', trend:'–'     },
                                { label:'CACHE', value:'97.4%', color:'#14b8a6', trend:'+0.1%' },
                                { label:'CONN',  value:'342',   color:'#f59e0b', trend:'68%'   },
                            ].map(({ label, value, color, trend }) => (
                                <div key={label} style={{ background:`${color}0a`, border:`1px solid ${color}1a`, borderRadius:8, padding:'8px 10px' }}>
                                    <div style={{ fontSize:8.5, color:'rgba(148,180,210,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', marginBottom:5 }}>{label}</div>
                                    <div style={{ fontSize:14, fontWeight:700, color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{value}</div>
                                    <div style={{ fontSize:8, color:`${color}80`, marginTop:4, fontFamily:"'JetBrains Mono',monospace" }}>{trend}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mini sparkline bars */}
                        <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:28 }}>
                            {[40,58,45,72,55,80,62,91,70,85,68,88].map((h, i) => (
                                <div key={i} style={{ flex:1, height:`${h}%`, background: i === 11 ? 'rgba(100,112,255,.75)' : 'rgba(100,112,255,.15)', borderRadius:2 }}/>
                            ))}
                        </div>
                        <div style={{ fontSize:8, color:'rgba(148,180,210,.25)', fontFamily:"'JetBrains Mono',monospace", marginTop:5, letterSpacing:'.05em' }}>QPS · last 12s</div>

                        {/* Replica status rows */}
                        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6, paddingTop:12, borderTop:'1px solid rgba(255,255,255,.04)' }}>
                            {[
                                { name:'replica-1', lag:'0.0s', color:'#22c55e', status:'SYNC' },
                                { name:'replica-2', lag:'1.2s', color:'#f59e0b', status:'LAG'  },
                            ].map(({ name, lag, color, status }) => (
                                <div key={name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <span style={{ width:5, height:5, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }}/>
                                    <span style={{ fontSize:9.5, color:'rgba(148,180,210,.5)', fontFamily:"'JetBrains Mono',monospace", flex:1 }}>{name}</span>
                                    <span style={{ fontSize:9, color:'rgba(148,180,210,.3)', fontFamily:"'JetBrains Mono',monospace" }}>lag {lag}</span>
                                    <span style={{ fontSize:8, color, background:`${color}12`, border:`1px solid ${color}25`, borderRadius:4, padding:'1px 6px', fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature list — two columns */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'9px 20px', animation:'fadeUp .6s ease .2s backwards' }}>
                        {FEATURES_SIMPLE.map(({ icon: Icon, label, desc }) => (
                            <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                                <div style={{ width:26, height:26, borderRadius:7, background:'rgba(100,112,255,.07)', border:'1px solid rgba(100,112,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                                    <Icon size={12} color="#818AFF"/>
                                </div>
                                <div>
                                    <div style={{ fontSize:11, fontWeight:600, color:'#b8d4e8', fontFamily:"'DM Sans',sans-serif", lineHeight:1.3 }}>{label}</div>
                                    <div style={{ fontSize:9.5, color:'rgba(148,180,210,.35)', fontFamily:"'DM Sans',sans-serif", marginTop:1.5, lineHeight:1.4 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(100,112,255,.14),transparent)', margin:'22px 0', animation:'fadeUp .6s ease .3s backwards' }}/>

                    {/* Trust stats */}
                    <div style={{ display:'flex', alignItems:'center', gap:28, animation:'fadeUp .6s ease .35s backwards' }}>
                        {[['99.9%','Uptime SLA'],['< 1s','Alert latency'],['SOC 2','Type II']].map(([val, lbl]) => (
                            <div key={lbl}>
                                <div style={{ fontSize:14, fontWeight:800, color:'#818AFF', fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{val}</div>
                                <div style={{ fontSize:8.5, color:'rgba(148,180,210,.35)', marginTop:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.04em' }}>{lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom footer */}
                <div style={{ padding:'16px 36px', borderTop:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    <Lock size={9} color="rgba(129,138,255,.2)"/>
                    <span style={{ fontSize:9, color:'rgba(129,138,255,.2)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.04em' }}>End-to-end encrypted · © 2025 Vigil</span>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO EMBLEM
// ─────────────────────────────────────────────────────────────────────────────
const LogoEmblem = ({ success }) => {
    const S=88, C=44, R1=38, R2=29, R3=20;
    const c1 = success ? '#22c55e' : '#6470FF';
    const c2 = success ? '#22c55e' : '#818AFF';
    return (
        <div style={{ position:'relative', width:S, height:S, animation:'logoPulse 4s ease-in-out infinite' }}>
            <div style={{ position:'absolute', inset:-18, borderRadius:'50%', background: success ? 'radial-gradient(circle,rgba(34,197,94,.18) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(100,112,255,.15) 0%,transparent 70%)', animation:'glow 3s ease-in-out infinite', transition:'background .8s' }}/>
            <svg width={S} height={S} style={{ position:'absolute', top:0, left:0 }}>
                <circle cx={C} cy={C} r={R1} fill="none" stroke={c1} strokeWidth="1" strokeDasharray="4 3" opacity=".35" style={{ transformOrigin:'center', animation:'spin 22s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.5" strokeDasharray={`${Math.PI*R2*.6} ${Math.PI*R2*.4}`} strokeLinecap="round" opacity=".7" style={{ transformOrigin:'center', animation:'spinRev 11s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth="0.8" strokeDasharray="2 4" opacity=".28" style={{ transformOrigin:'center', animation:'spin 7s linear infinite', transition:'stroke .8s' }}/>
                {[0,72,144,216,288].map((d,i)=>(
                    <circle key={d} cx={C+R1*Math.cos(d*Math.PI/180)} cy={C+R1*Math.sin(d*Math.PI/180)} r="2" fill={c1} opacity={.45+i*.1} style={{ transition:'fill .8s' }}/>
                ))}
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#4A54E8,#8A46DB)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: success ? '0 4px 26px rgba(34,197,94,.5)' : '0 4px 26px rgba(74,84,232,.45)', transition:'all .8s cubic-bezier(.34,1.56,.64,1)' }}>
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
const InputField = React.forwardRef(function InputField(
    { icon: Icon, label, type='text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{ display:'block', marginBottom:7, fontSize:9.5, fontWeight:600, color: focused ? '#6470FF' : '#1a3050', textTransform:'uppercase', letterSpacing:'1.4px', fontFamily:"'JetBrains Mono',monospace", transition:'color .2s' }}>{label}</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background: focused ? 'rgba(100,112,255,.05)' : 'rgba(255,255,255,.022)', border:`1px solid ${focused ? 'rgba(100,112,255,.45)' : 'rgba(255,255,255,.07)'}`, borderRadius:13, padding:'0 14px', transition:'all .25s cubic-bezier(.4,0,.2,1)', boxShadow: focused ? '0 0 0 3.5px rgba(100,112,255,.08),inset 0 1px 0 rgba(255,255,255,.04)' : 'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                <Icon size={15} color={focused ? '#6470FF' : hasVal ? '#2a4560' : '#101e35'} style={{ flexShrink:0, transition:'color .2s' }}/>
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
const Corners = ({ color='rgba(100,112,255,.25)' }) => (
    <>
        {[
            { top:0,    left:0,  borderTop:`1px solid ${color}`, borderLeft:`1px solid ${color}`,    borderRadius:'3px 0 0 0' },
            { top:0,    right:0, borderTop:`1px solid ${color}`, borderRight:`1px solid ${color}`,   borderRadius:'0 3px 0 0' },
            { bottom:0, left:0,  borderBottom:`1px solid ${color}`, borderLeft:`1px solid ${color}`,  borderRadius:'0 0 0 3px' },
            { bottom:0, right:0, borderBottom:`1px solid ${color}`, borderRight:`1px solid ${color}`, borderRadius:'0 0 3px 0' },
        ].map(({ borderRadius, ...style }, i) => (
            <div key={i} style={{ position:'absolute', width:14, height:14, pointerEvents:'none', borderRadius, ...style }} />
        ))}
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE
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
                const t0  = performance.now();
                const res  = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const data = await res.json();
                if (!cancelled) setServerStatus({
                    status:    data.status === 'ok' ? 'online' : 'degraded',
                    latency:   Math.round(performance.now() - t0),
                    dbLatency: data.dbLatencyMs,
                    pool:      data.pool,
                });
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
        if (error) { setShake(true); const t = setTimeout(() => setShake(false), 600); return () => clearTimeout(t); }
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
        catch { /* error handled by AuthContext */ }
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;

    const btnBg = authLoading  ? 'rgba(100,112,255,.5)'
        : loginSuccess ? '#22c55e'
            : canSubmit    ? 'linear-gradient(135deg,#4A54E8 0%,#6470FF 50%,#818AFF 100%)'
                :                'rgba(100,112,255,.12)';

    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? (btnHover ? '0 10px 34px rgba(100,112,255,.55),0 0 0 1px rgba(100,112,255,.3) inset'
            : '0 4px 22px rgba(100,112,255,.3),0 0 0 1px rgba(100,112,255,.16) inset')
        : 'none';

    return (
        <div style={{ height:'100vh', width:'100vw', display:'flex', background:'#05080f', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
            <GlobalStyles />
            <LeftPanel />

            {/* ── RIGHT — login form ── */}
            <div style={{ width:490, flexShrink:0, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 44px', background:'rgba(4,7,14,.98)' }}>

                {/* bg blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'5%', right:'-22%', width:420, height:420, background:'radial-gradient(circle,rgba(100,112,255,.055) 0%,transparent 65%)', filter:'blur(55px)' }}/>
                    <div style={{ position:'absolute', bottom:'5%', left:'-18%', width:320, height:320, background:'radial-gradient(circle,rgba(129,138,255,.04) 0%,transparent 65%)', filter:'blur(40px)' }}/>
                    <div style={{ position:'absolute', inset:0, opacity:.012, backgroundImage:'linear-gradient(rgba(100,112,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,112,255,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }}/>
                </div>

                {/* top edge line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent 0%,rgba(100,112,255,.55) 30%,rgba(129,138,255,.8) 50%,rgba(100,112,255,.55) 70%,transparent 100%)', opacity:.75 }}/>

                <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:370, display:'flex', flexDirection:'column', alignItems:'center' }}>

                    {/* Logo */}
                    <div style={{ marginBottom:22, animation:'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess} />
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign:'center', marginBottom:4, animation:'fadeUp .6s ease .18s backwards', width:'100%' }}>
                        <h1 style={{ fontSize:32, fontWeight:800, color:'#f0f6fc', margin:0, lineHeight:1.1, letterSpacing:'-.04em', fontFamily:"'Syne',sans-serif" }}>Welcome back</h1>
                        <p style={{ color:'#1a2e4a', margin:'9px 0 0', fontSize:12, lineHeight:1.55 }}>Sign in to your monitoring dashboard</p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin:'16px 0 18px', display:'flex', alignItems:'center', gap:10, width:'100%', animation:'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                        <ServerStatus status={serverStatus} />
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                    </div>

                    {/* Card */}
                    <div style={{
                        width:'100%', padding:'28px 26px 24px', borderRadius:22,
                        background:'rgba(6,14,28,.85)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)',
                        border:`1px solid ${loginSuccess ? 'rgba(34,197,94,.38)' : error ? 'rgba(239,68,68,.28)' : 'rgba(255,255,255,.07)'}`,
                        boxShadow: loginSuccess ? '0 0 70px rgba(34,197,94,.1),0 28px 60px rgba(0,0,0,.6)' : '0 28px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.03)',
                        transition:'border-color .55s,box-shadow .55s',
                        animation: shake ? 'shake .5s ease' : 'fadeUp .7s ease .32s backwards',
                        position:'relative', overflow:'hidden',
                    }}>
                        <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background: loginSuccess ? 'linear-gradient(90deg,transparent,rgba(34,197,94,.6),transparent)' : 'linear-gradient(90deg,transparent,rgba(100,112,255,.4),transparent)', transition:'background .55s', animation:'edgePulse 3s ease-in-out infinite' }}/>
                        <Corners color={loginSuccess ? 'rgba(34,197,94,.28)' : 'rgba(100,112,255,.22)'} />

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at center,rgba(34,197,94,.08) 0%,transparent 70%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, borderRadius:22, animation:'fadeIn .3s ease' }}>
                                <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:'2px solid rgba(34,197,94,.3)', animation:'ripple 1s ease-out forwards' }}/>
                                <CheckCircle size={44} color="#22c55e" style={{ animation:'successPop .5s ease backwards', marginBottom:14 }}/>
                                <div style={{ color:'#22c55e', fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", animation:'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color:'#0f2540', fontSize:10, marginTop:6, fontFamily:"'JetBrains Mono',monospace", animation:'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
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
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading || loginSuccess} />
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading || loginSuccess}
                                        rightEl={
                                            <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1} style={{ background:'none', border:'none', cursor:'pointer', color:'#101e35', padding:4, display:'flex', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#334155'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>
                                                {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                                            </button>
                                        }
                            />

                            {/* Remember me + Forgot password */}
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:-3 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:`1.5px solid ${rememberMe ? '#6470FF' : 'rgba(255,255,255,.1)'}`, background:rememberMe ? '#6470FF' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow:rememberMe ? '0 0 12px rgba(100,112,255,.4)' : 'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize:11.5, color:'#1a2e4a', fontFamily:"'DM Sans',sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:11.5, color:'#101e35', fontFamily:"'DM Sans',sans-serif", padding:0, transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#818AFF'} onMouseLeave={e=>e.currentTarget.style.color='#101e35'}>
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In button */}
                            <button type="submit" disabled={!canSubmit}
                                    onMouseEnter={() => setBtnHover(true)}
                                    onMouseLeave={() => setBtnHover(false)}
                                    style={{ position:'relative', overflow:'hidden', background:btnBg, border:canSubmit ? `1px solid ${loginSuccess ? 'rgba(34,197,94,.3)' : 'rgba(100,112,255,.28)'}` : '1px solid rgba(255,255,255,.04)', padding:'14px 22px', borderRadius:13, color:'white', fontWeight:700, fontSize:14, fontFamily:"'Syne',sans-serif", letterSpacing:'.02em', cursor:canSubmit ? 'pointer' : 'not-allowed', marginTop:5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .28s cubic-bezier(.4,0,.2,1)', boxShadow:btnShadow, transform:btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)' }}>
                                {authLoading  ? (<><Loader size={15} style={{ animation:'spin 1s linear infinite' }}/><span>Authenticating…</span></>) :
                                    loginSuccess ? (<><CheckCircle size={15}/><span>Access Granted</span></>) :
                                        (<><span>Sign In</span><ArrowRight size={15} style={{ transition:'transform .25s', transform:btnHover ? 'translateX(4px)' : 'translateX(0)' }}/></>)}
                            </button>
                        </form>

                        {!loginSuccess && (
                            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.04)', textAlign:'center' }}>
                                <span style={{ fontSize:9.5, color:'#0a1828', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.04em' }}>Admin access only · Contact your DBA for credentials</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
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