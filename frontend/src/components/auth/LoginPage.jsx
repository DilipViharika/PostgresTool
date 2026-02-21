// ==========================================================================
//  VIGIL — Login Page  (v5 — Full-bleed canvas left, hero text overlay only)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #07080F; overflow: hidden; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes spinRev   { to{transform:rotate(-360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes ring      { 0%{transform:scale(0.7);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes successPop{ 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes ripple    { 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(4);opacity:0} }
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 28px rgba(100,112,255,.22),0 0 70px rgba(100,112,255,.07)} 50%{box-shadow:0 0 46px rgba(100,112,255,.38),0 0 110px rgba(100,112,255,.12)} }
        @keyframes edgePulse { 0%,100%{opacity:.18} 50%{opacity:.75} }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow:0 0 0 1000px #080e1a inset !important;
            -webkit-text-fill-color:#e2e8f0 !important;
            caret-color:#e2e8f0;
            transition:background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:#1a2a44; opacity:1; }
        .vi-input:focus::placeholder { opacity:0; transition:opacity .2s; }
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
        const mouse  = { x: -999, y: -999 };
        const packets = [];

        const PALETTE = [
            { h: 232, s: 100, l: 72 }, // indigo-blue  (primary)
            { h: 280, s:  80, l: 68 }, // violet/purple
            { h: 165, s: 100, l: 58 }, // emerald
            { h:  44, s:  95, l: 62 }, // amber/gold
            { h: 348, s: 100, l: 68 }, // rose/red
            { h: 200, s: 100, l: 65 }, // sky-blue
        ];
        const hsl = (c, a) => `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

        function buildGraph(W, H) {
            nodes = []; edges = [];

            // Central primary node
            nodes.push({ x: W*0.42, y: H*0.40, vx:0, vy:0, r:11, color:PALETTE[0], role:'primary', phase:0, pulse:0 });

            // Hub nodes — match the screenshot placement (scattered organically)
            const hubs = [
                { x:0.17, y:0.16, c:1 },
                { x:0.60, y:0.11, c:3 },
                { x:0.73, y:0.45, c:2 },
                { x:0.22, y:0.60, c:4 },
                { x:0.53, y:0.68, c:5 },
            ];
            hubs.forEach(({ x, y, c }) => nodes.push({
                x: W*x + (Math.random()-.5)*20,
                y: H*y + (Math.random()-.5)*20,
                vx:(Math.random()-.5)*0.12, vy:(Math.random()-.5)*0.12,
                r: 5.5 + Math.random()*2, color: PALETTE[c],
                role:'hub', phase:Math.random()*Math.PI*2, pulse:0,
            }));

            // Micro nodes
            for (let i=0; i<22; i++) {
                const c = PALETTE[Math.floor(Math.random()*PALETTE.length)];
                nodes.push({
                    x: W*(0.05+Math.random()*0.90),
                    y: H*(0.04+Math.random()*0.92),
                    vx:(Math.random()-.5)*0.18, vy:(Math.random()-.5)*0.18,
                    r: 1.2+Math.random()*2.2, color:c,
                    role:'micro', phase:Math.random()*Math.PI*2, pulse:0,
                });
            }

            // Primary → hubs
            for (let i=1; i<=5; i++) edges.push({ a:0, b:i, strength:1.0 });
            // Hub cross-links
            [[1,2],[2,3],[3,4],[4,5],[1,5],[2,5]].forEach(([a,b]) => edges.push({ a,b,strength:0.55 }));

            // Micro → nearest hub/primary
            for (let i=6; i<nodes.length; i++) {
                let best=0, bestD=Infinity;
                for (let j=0; j<=5; j++) {
                    const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
                    const d=Math.sqrt(dx*dx+dy*dy);
                    if (d<bestD) { bestD=d; best=j; }
                }
                edges.push({ a:best, b:i, strength:0.32 });
            }

            // Short micro-micro links
            for (let i=6; i<nodes.length; i++) {
                for (let j=i+1; j<nodes.length; j++) {
                    const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
                    if (Math.sqrt(dx*dx+dy*dy)<130 && Math.random()>0.62)
                        edges.push({ a:i, b:j, strength:0.18 });
                }
            }
        }

        function spawnPacket() {
            if (!edges.length) return;
            const e = edges[Math.floor(Math.random()*edges.length)];
            packets.push({ edge:e, t:0, speed:0.005+Math.random()*0.009, reverse:Math.random()>.5 });
        }

        function resize() {
            const r = canvas.parentElement.getBoundingClientRect();
            canvas.width=r.width; canvas.height=r.height;
            buildGraph(canvas.width, canvas.height);
        }

        function draw() {
            const W=canvas.width, H=canvas.height;
            ctx.clearRect(0,0,W,H);

            // Physics
            nodes.forEach(n => {
                if (n.role==='primary') return;
                n.phase += 0.007;
                n.x += n.vx + Math.sin(n.phase*0.6)*0.032;
                n.y += n.vy + Math.cos(n.phase*0.45)*0.032;
                const pad=36;
                if (n.x<pad) n.vx+=0.05; if (n.x>W-pad) n.vx-=0.05;
                if (n.y<pad) n.vy+=0.05; if (n.y>H-pad) n.vy-=0.05;
                n.vx*=0.994; n.vy*=0.994;
                n.vx=Math.max(-.45,Math.min(.45,n.vx));
                n.vy=Math.max(-.45,Math.min(.45,n.vy));
                const dx=n.x-mouse.x, dy=n.y-mouse.y;
                const d=Math.sqrt(dx*dx+dy*dy);
                if (d<110&&d>0) { const f=(1-d/110)*0.28; n.vx+=(dx/d)*f; n.vy+=(dy/d)*f; }
            });

            // Edges
            edges.forEach(e => {
                const a=nodes[e.a], b=nodes[e.b];
                const dist=Math.sqrt((b.x-a.x)**2+(b.y-a.y)**2);
                const alpha=e.strength*0.15*Math.max(0,1-dist/480);
                if (alpha<0.007) return;
                const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
                g.addColorStop(0,hsl(a.color,alpha));
                g.addColorStop(1,hsl(b.color,alpha));
                ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
                ctx.strokeStyle=g; ctx.lineWidth=e.strength*0.72; ctx.stroke();
            });

            // Packets
            for (let pi=packets.length-1; pi>=0; pi--) {
                const pk=packets[pi];
                pk.t+=pk.speed;
                if (pk.t>=1) { packets.splice(pi,1); continue; }
                const a=nodes[pk.edge.a], b=nodes[pk.edge.b];
                const t=pk.reverse?1-pk.t:pk.t;
                const x=a.x+(b.x-a.x)*t, y=a.y+(b.y-a.y)*t;
                const g=ctx.createRadialGradient(x,y,0,x,y,9);
                g.addColorStop(0,hsl(a.color,0.30)); g.addColorStop(1,hsl(a.color,0));
                ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
                ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fillStyle=hsl(a.color,.95); ctx.fill();
            }

            // Nodes
            nodes.forEach(n => {
                n.phase+=0.009;
                const br=Math.sin(n.phase)*0.15+1;
                const rr=n.r*br;

                if (n.role!=='micro') {
                    const glowR=rr+(n.role==='primary'?32:20);
                    const gg=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,glowR);
                    gg.addColorStop(0,hsl(n.color,n.role==='primary'?.18:.10));
                    gg.addColorStop(1,hsl(n.color,0));
                    ctx.beginPath(); ctx.arc(n.x,n.y,glowR,0,Math.PI*2); ctx.fillStyle=gg; ctx.fill();
                    ctx.beginPath(); ctx.arc(n.x,n.y,rr+4,0,Math.PI*2);
                    ctx.strokeStyle=hsl(n.color,.16); ctx.lineWidth=1; ctx.stroke();
                }

                const fc=ctx.createRadialGradient(n.x-rr*.25,n.y-rr*.25,0,n.x,n.y,rr);
                fc.addColorStop(0,hsl({...n.color,l:Math.min(98,n.color.l+24)},1));
                fc.addColorStop(1,hsl(n.color,.82));
                ctx.beginPath(); ctx.arc(n.x,n.y,rr,0,Math.PI*2); ctx.fillStyle=fc; ctx.fill();

                if (n.role==='primary') {
                    n.pulse=(n.pulse+0.010)%1;
                    const pr=rr+10+n.pulse*34;
                    ctx.beginPath(); ctx.arc(n.x,n.y,pr,0,Math.PI*2);
                    ctx.strokeStyle=hsl(n.color,(1-n.pulse)*0.28); ctx.lineWidth=1.5; ctx.stroke();
                    const p2=(n.pulse+0.5)%1;
                    const pr2=rr+10+p2*34;
                    ctx.beginPath(); ctx.arc(n.x,n.y,pr2,0,Math.PI*2);
                    ctx.strokeStyle=hsl(n.color,(1-p2)*0.13); ctx.lineWidth=1; ctx.stroke();
                }
            });

            animId=requestAnimationFrame(draw);
        }

        const packetInterval=setInterval(()=>{ if(packets.length<28) spawnPacket(); },300);
        resize(); draw();

        const onResize=()=>{ cancelAnimationFrame(animId); resize(); draw(); };
        const onMouse =e=>{ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; };
        window.addEventListener('resize',onResize);
        canvas.parentElement?.addEventListener('mousemove',onMouse);
        return ()=>{
            cancelAnimationFrame(animId); clearInterval(packetInterval);
            window.removeEventListener('resize',onResize);
            canvas.parentElement?.removeEventListener('mousemove',onMouse);
        };
    }, [canvasRef]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL — canvas fills entire panel, hero text anchored at bottom
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_DOTS = [
    { label:'Real-time monitoring', color:'#00D4A0' },
    { label:'Query intelligence',   color:'#6470FF' },
    { label:'WAL replication',      color:'#9B5FEE' },
    { label:'Anomaly detection',    color:'#F5C842' },
];

const LeftPanel = () => {
    const canvasRef = useRef(null);
    useNetworkCanvas(canvasRef);

    return (
        <div style={{ flex:'1 1 0', minWidth:0, height:'100vh', position:'relative', overflow:'hidden', background:'#07080F', borderRight:'1px solid rgba(255,255,255,.06)' }}>

            {/* Full-bleed canvas */}
            <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}/>

            {/* Atmospheric colour mesh */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`
                radial-gradient(ellipse 65% 55% at 28% 22%, rgba(100,112,255,0.08) 0%, transparent 62%),
                radial-gradient(ellipse 50% 45% at 74% 68%, rgba(155,95,238,0.06) 0%, transparent 58%),
                radial-gradient(ellipse 38% 36% at 62% 10%, rgba(0,212,160,0.05) 0%, transparent 55%)
            `}}/>

            {/* Grain overlay */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.020,
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}/>

            {/* Wordmark — top left */}
            <div style={{ position:'absolute', top:32, left:40, zIndex:2, display:'flex', alignItems:'center', gap:11, animation:'fadeUp .7s ease .05s backwards' }}>
                <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(145deg,#4A54E8,#8A46DB)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 1px rgba(255,255,255,.10) inset, 0 8px 24px rgba(74,84,232,.50)' }}>
                    <Database size={16} color="#fff"/>
                </div>
                <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#E8EAF4', fontFamily:"'DM Sans',sans-serif", letterSpacing:'-0.3px', lineHeight:1 }}>Vigil</div>
                    <div style={{ fontSize:9, color:'rgba(107,119,153,.65)', fontFamily:"'JetBrains Mono',monospace", marginTop:2, letterSpacing:'1.5px', textTransform:'uppercase' }}>PostgreSQL Intelligence</div>
                </div>
            </div>

            {/* Bottom gradient scrim — makes text legible */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'58%', pointerEvents:'none', background:'linear-gradient(to top, rgba(7,8,15,0.92) 0%, rgba(7,8,15,0.60) 42%, transparent 100%)' }}/>

            {/* Hero text — bottom overlay */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 44px 44px', zIndex:2 }}>

                {/* Eyebrow */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, animation:'fadeUp .8s ease .15s backwards' }}>
                    <div style={{ width:22, height:1, background:'rgba(100,112,255,.65)' }}/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'3px', textTransform:'uppercase', color:'#6470FF' }}>
                        Database Observability
                    </span>
                </div>

                {/* Headline */}
                <div style={{ marginBottom:14, animation:'fadeUp .8s ease .25s backwards' }}>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(28px,3vw,48px)', fontWeight:400, lineHeight:1.06, letterSpacing:'-0.5px', color:'#E8EAF4' }}>
                        Monitor every<br/>
                        query, <em style={{ fontStyle:'italic', color:'#818AFF' }}>beautifully.</em>
                    </div>
                </div>

                {/* Sub */}
                <p style={{ fontSize:13, fontWeight:300, color:'rgba(107,119,153,.82)', lineHeight:1.82, margin:'0 0 26px', maxWidth:410, fontFamily:"'DM Sans',sans-serif", animation:'fadeUp .8s ease .35s backwards' }}>
                    Real-time intelligence across your entire PostgreSQL fleet.<br/>
                    From slow queries to replication lag — nothing escapes Vigil.
                </p>

                {/* Status dots */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px 22px', animation:'fadeUp .8s ease .45s backwards' }}>
                    {STATUS_DOTS.map(({ label, color }) => (
                        <div key={label} style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'0.8px', color:'rgba(148,163,184,.68)' }}>
                            <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block', boxShadow:`0 0 7px ${color}` }}/>
                            {label}
                        </div>
                    ))}
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
                <circle cx={C} cy={C} r={R1} fill="none" stroke={c1} strokeWidth="1" strokeDasharray="4 3" opacity=".30" style={{ transformOrigin:'center', animation:'spin 22s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.5" strokeDasharray={`${Math.PI*R2*.6} ${Math.PI*R2*.4}`} strokeLinecap="round" opacity=".62" style={{ transformOrigin:'center', animation:'spinRev 11s linear infinite', transition:'stroke .8s' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth="0.8" strokeDasharray="2 4" opacity=".22" style={{ transformOrigin:'center', animation:'spin 7s linear infinite', transition:'stroke .8s' }}/>
                {[0,72,144,216,288].map((d,i)=>(
                    <circle key={d} cx={C+R1*Math.cos(d*Math.PI/180)} cy={C+R1*Math.sin(d*Math.PI/180)} r="2" fill={c1} opacity={.38+i*.1} style={{ transition:'fill .8s' }}/>
                ))}
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#4A54E8,#8A46DB)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: success ? '0 4px 26px rgba(34,197,94,.5)' : '0 4px 26px rgba(74,84,232,.5)', transition:'all .8s cubic-bezier(.34,1.56,.64,1)' }}>
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
    const on=status.status==='online', off=status.status==='offline', chk=status.status==='checking';
    const color=on?'#22c55e':off?'#ef4444':'#f59e0b';
    const label=on?'ONLINE':off?'OFFLINE':chk?'Checking…':'DEGRADED';
    return (
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px 5px 10px', borderRadius:100, background:`${color}09`, border:`1px solid ${color}22`, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>
            {chk
                ? <><Loader size={9} color="#334155" style={{ animation:'spin 1s linear infinite' }}/><span style={{ color:'#334155' }}>Checking…</span></>
                : <>
                    <div style={{ position:'relative', width:7, height:7 }}>
                        <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, boxShadow:`0 0 7px ${color}90`, animation:on?'pulse 2s ease-in-out infinite':'none' }}/>
                        {on && <div style={{ position:'absolute', inset:-2, borderRadius:'50%', border:`1px solid ${color}60`, animation:'ring 2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight:700, letterSpacing:'.05em' }}>{label}</span>
                    {status.latency!=null && <span style={{ color:'#1a2e4a', fontSize:9, padding:'1px 6px', borderRadius:4, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.04)' }}>{status.latency}ms</span>}
                </>
            }
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
const InputField = React.forwardRef(function InputField(
    { icon:Icon, label, type='text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{ display:'block', marginBottom:7, fontSize:9.5, fontWeight:600, color:focused?'#6470FF':'#2E3A58', textTransform:'uppercase', letterSpacing:'1.4px', fontFamily:"'JetBrains Mono',monospace", transition:'color .2s' }}>{label}</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:focused?'rgba(100,112,255,.05)':'rgba(255,255,255,.025)', border:`1px solid ${focused?'rgba(100,112,255,.45)':'rgba(255,255,255,.07)'}`, borderRadius:13, padding:'0 14px', transition:'all .25s cubic-bezier(.4,0,.2,1)', boxShadow:focused?'0 0 0 3.5px rgba(100,112,255,.08),inset 0 1px 0 rgba(255,255,255,.04)':'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                <Icon size={15} color={focused?'#6470FF':hasVal?'#2E3A58':'#161B2E'} style={{ flexShrink:0, transition:'color .2s' }}/>
                <input ref={ref} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} className="vi-input"
                       style={{ flex:1, padding:'13px 0', background:'none', border:'none', color:'#E8EAF4', fontSize:13.5, outline:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:400, letterSpacing:'.01em', opacity:disabled?.4:1 }}/>
                {rightEl}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORNER ACCENTS
// ─────────────────────────────────────────────────────────────────────────────
const Corners = ({ color='rgba(100,112,255,.20)' }) => (
    <>
        {[
            { top:0,    left:0,  borderTop:`1px solid ${color}`, borderLeft:`1px solid ${color}`,    borderRadius:'3px 0 0 0' },
            { top:0,    right:0, borderTop:`1px solid ${color}`, borderRight:`1px solid ${color}`,   borderRadius:'0 3px 0 0' },
            { bottom:0, left:0,  borderBottom:`1px solid ${color}`, borderLeft:`1px solid ${color}`,  borderRadius:'0 0 0 3px' },
            { bottom:0, right:0, borderBottom:`1px solid ${color}`, borderRight:`1px solid ${color}`, borderRadius:'0 0 3px 0' },
        ].map(({ borderRadius, ...style }, i) => (
            <div key={i} style={{ position:'absolute', width:14, height:14, pointerEvents:'none', borderRadius, ...style }}/>
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
    const [serverStatus, setServerStatus] = useState({ status:'checking' });
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [shake,        setShake]        = useState(false);
    const [btnHover,     setBtnHover]     = useState(false);

    const userRef = useRef(null);
    const pwdRef  = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0   = performance.now();
                const res  = await fetch(`${API_BASE}/health`, { signal:AbortSignal.timeout(5000) });
                const data = await res.json();
                if (!cancelled) setServerStatus({ status:data.status==='ok'?'online':'degraded', latency:Math.round(performance.now()-t0) });
            } catch { if (!cancelled) setServerStatus({ status:'offline' }); }
        };
        check();
        const iv = setInterval(check, 15000);
        return () => { cancelled=true; clearInterval(iv); };
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) { setUsername(saved); setRememberMe(true); pwdRef.current?.focus(); }
        else userRef.current?.focus();
    }, []);

    useEffect(() => {
        if (error) { setShake(true); const t=setTimeout(()=>setShake(false),600); return ()=>clearTimeout(t); }
    }, [error]);

    useEffect(() => { if (error&&clearError) clearError(); }, [username, password]); // eslint-disable-line

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!username.trim()||!password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else            localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try { await login(username, password); setLoginSuccess(true); }
        catch {}
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length>0 && password.trim().length>0 && !authLoading && !loginSuccess;

    const btnBg = authLoading  ? 'rgba(100,112,255,.5)'
        : loginSuccess ? '#22c55e'
            : canSubmit    ? 'linear-gradient(135deg,#4A54E8 0%,#6470FF 55%,#818AFF 100%)'
                :                'rgba(100,112,255,.10)';

    const btnShadow = canSubmit&&!authLoading&&!loginSuccess
        ? (btnHover ? '0 12px 36px rgba(100,112,255,.55),0 0 0 1px rgba(100,112,255,.3) inset'
            : '0 6px 24px rgba(100,112,255,.32),0 0 0 1px rgba(100,112,255,.18) inset')
        : 'none';

    return (
        <div style={{ height:'100vh', width:'100vw', display:'flex', background:'#07080F', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
            <GlobalStyles/>
            <LeftPanel/>

            {/* ── RIGHT — login panel ── */}
            <div style={{ width:490, flexShrink:0, position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 44px', background:'rgba(4,6,12,.98)' }}>

                {/* Ambient orbs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'4%', right:'-20%', width:380, height:380, background:'radial-gradient(circle,rgba(100,112,255,.055) 0%,transparent 65%)', filter:'blur(50px)' }}/>
                    <div style={{ position:'absolute', bottom:'4%', left:'-16%', width:280, height:280, background:'radial-gradient(circle,rgba(129,138,255,.04) 0%,transparent 65%)', filter:'blur(38px)' }}/>
                    <div style={{ position:'absolute', inset:0, opacity:.007, backgroundImage:'linear-gradient(rgba(100,112,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,112,255,1) 1px,transparent 1px)', backgroundSize:'44px 44px' }}/>
                </div>

                {/* Top edge line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(100,112,255,.60) 30%,rgba(129,138,255,.85) 50%,rgba(100,112,255,.60) 70%,transparent)', opacity:.72 }}/>

                <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:370, display:'flex', flexDirection:'column', alignItems:'center' }}>

                    {/* Logo */}
                    <div style={{ marginBottom:22, animation:'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess}/>
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign:'center', marginBottom:4, animation:'fadeUp .6s ease .18s backwards', width:'100%' }}>
                        <h1 style={{ fontSize:30, fontWeight:400, color:'#E8EAF4', margin:0, lineHeight:1.1, letterSpacing:'-.04em', fontFamily:"'DM Serif Display',serif" }}>Welcome back</h1>
                        <p style={{ color:'#2E3A58', margin:'9px 0 0', fontSize:12.5, lineHeight:1.55, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>Sign in to your monitoring dashboard</p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin:'18px 0 20px', display:'flex', alignItems:'center', gap:10, width:'100%', animation:'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.04)' }}/>
                    </div>

                    {/* Card */}
                    <div style={{ width:'100%', padding:'28px 26px 24px', borderRadius:22, background:'rgba(6,10,22,.88)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)', border:`1px solid ${loginSuccess?'rgba(34,197,94,.35)':error?'rgba(239,68,68,.25)':'rgba(255,255,255,.07)'}`, boxShadow:loginSuccess?'0 0 70px rgba(34,197,94,.1),0 28px 60px rgba(0,0,0,.6)':'0 28px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.03)', transition:'border-color .55s,box-shadow .55s', animation:shake?'shake .5s ease':'fadeUp .7s ease .32s backwards', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, left:'8%', right:'8%', height:1, background:loginSuccess?'linear-gradient(90deg,transparent,rgba(34,197,94,.55),transparent)':'linear-gradient(90deg,transparent,rgba(100,112,255,.38),transparent)', transition:'background .55s', animation:'edgePulse 3s ease-in-out infinite' }}/>
                        <Corners color={loginSuccess?'rgba(34,197,94,.22)':'rgba(100,112,255,.18)'}/>

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at center,rgba(34,197,94,.08) 0%,transparent 70%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, borderRadius:22, animation:'fadeIn .3s ease' }}>
                                <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:'2px solid rgba(34,197,94,.3)', animation:'ripple 1s ease-out forwards' }}/>
                                <CheckCircle size={44} color="#22c55e" style={{ animation:'successPop .5s ease backwards', marginBottom:14 }}/>
                                <div style={{ color:'#22c55e', fontSize:16, fontWeight:400, fontFamily:"'DM Serif Display',serif", animation:'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color:'#2E3A58', fontSize:10, marginTop:6, fontFamily:"'JetBrains Mono',monospace", animation:'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ marginBottom:18, padding:'10px 13px', borderRadius:10, background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.20)', display:'flex', alignItems:'center', gap:9, animation:'slideDown .3s ease backwards' }}>
                                <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0 }}/>
                                <span style={{ color:'#ef4444', fontSize:12, fontWeight:500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading||loginSuccess}/>
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd?'text':'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading||loginSuccess}
                                        rightEl={
                                            <button type="button" onClick={()=>setShowPwd(s=>!s)} tabIndex={-1} style={{ background:'none', border:'none', cursor:'pointer', color:'#161B2E', padding:4, display:'flex', transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#6B7799'} onMouseLeave={e=>e.currentTarget.style.color='#161B2E'}>
                                                {showPwd?<EyeOff size={14}/>:<Eye size={14}/>}
                                            </button>
                                        }
                            />

                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:-3 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }} onClick={()=>setRememberMe(r=>!r)}>
                                    <div style={{ width:16, height:16, borderRadius:5, flexShrink:0, border:`1.5px solid ${rememberMe?'#6470FF':'rgba(255,255,255,.10)'}`, background:rememberMe?'#6470FF':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow:rememberMe?'0 0 12px rgba(100,112,255,.4)':'none' }}>
                                        {rememberMe&&<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize:12, color:'#2E3A58', fontFamily:"'DM Sans',sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#2E3A58', fontFamily:"'DM Sans',sans-serif", padding:0, transition:'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#818AFF'} onMouseLeave={e=>e.currentTarget.style.color='#2E3A58'}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={!canSubmit} onMouseEnter={()=>setBtnHover(true)} onMouseLeave={()=>setBtnHover(false)}
                                    style={{ position:'relative', overflow:'hidden', background:btnBg, border:canSubmit?`1px solid ${loginSuccess?'rgba(34,197,94,.3)':'rgba(100,112,255,.28)'}`:'1px solid rgba(255,255,255,.04)', padding:'14px 22px', borderRadius:13, color:'white', fontWeight:500, fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:'.01em', cursor:canSubmit?'pointer':'not-allowed', marginTop:5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .28s cubic-bezier(.4,0,.2,1)', boxShadow:btnShadow, transform:btnHover&&canSubmit?'translateY(-2px)':'translateY(0)' }}>
                                {authLoading  ? <><Loader size={15} style={{ animation:'spin 1s linear infinite' }}/><span>Authenticating…</span></>
                                    : loginSuccess ? <><CheckCircle size={15}/><span>Access Granted</span></>
                                        :               <><span>Sign In</span><ArrowRight size={15} style={{ transition:'transform .25s', transform:btnHover?'translateX(4px)':'translateX(0)' }}/></>
                                }
                            </button>
                        </form>

                        {!loginSuccess && (
                            <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.04)', textAlign:'center' }}>
                                <span style={{ fontSize:9.5, color:'#161B2E', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.04em' }}>Admin access only · Contact your DBA for credentials</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:5, animation:'fadeUp .6s ease .6s backwards' }}>
                        <Shield size={9} color="#161B2E" style={{ opacity:.5 }}/>
                        <span style={{ fontSize:9, color:'#161B2E', fontFamily:"'JetBrains Mono',monospace" }}>Secured by Vigil · PostgreSQL Monitor v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;