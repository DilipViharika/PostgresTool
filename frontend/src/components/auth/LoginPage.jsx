import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Activity, Zap, HardDrive, Lock,
    Search, RefreshCw, Cloud, Terminal, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

const NODE_DEFS = {
    primary: { label: 'Database',       sub: 'pg_monitor',  color: '#6470FF', icon: 'Database',  r: 14 },
    hub0:    { label: 'Core',           sub: 'Monitoring',  color: '#38BDF8', icon: 'Activity',  r: 9.5 },
    hub1:    { label: 'Query',          sub: '& Indexes',   color: '#F5C842', icon: 'Zap',       r: 9.5 },
    hub2:    { label: 'Infrastructure', sub: 'Resources',   color: '#00D4A0', icon: 'HardDrive', r: 9.5 },
    hub3:    { label: 'Schema',         sub: '& Security',  color: '#FF4F6D', icon: 'Lock',      r: 9.5 },
    hub4:    { label: 'Observability',  sub: 'Logs & Cloud',color: '#FB923C', icon: 'Cloud',     r: 9.5 },
    hub5:    { label: 'Dev Tools',      sub: 'SQL & APIs',  color: '#A78BFA', icon: 'Terminal',  r: 9.5 },
};

const ICON_MAP = { Database, Activity, Zap, HardDrive, Lock, Cloud, Terminal, Search, RefreshCw, Users };

const PALETTE = [
    { h: 232, s: 100, l: 72 },
    { h: 199, s: 100, l: 61 },
    { h:  44, s:  95, l: 62 },
    { h: 165, s: 100, l: 54 },
    { h: 348, s: 100, l: 66 },
    { h:  27, s: 100, l: 65 },
    { h: 264, s:  80, l: 72 },
    { h: 200, s: 100, l: 65 },
    { h: 320, s:  70, l: 68 },
    { h:  20, s:  90, l: 68 },
];
const hsl = (c, a) => `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #05060E; overflow: hidden; }

        @keyframes fadeUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes spinRev    { to{transform:rotate(-360deg)} }
        @keyframes pulseDot   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.78)} }
        @keyframes ringOut    { 0%{transform:scale(.7);opacity:.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes successPop { 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes ripple     { 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(4);opacity:0} }
        @keyframes floatUp    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glowPulse  { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes edgePulse  { 0%,100%{opacity:.25} 50%{opacity:.9} }
        @keyframes labelIn    { from{opacity:0;transform:translate(-50%,6px) scale(.88)} to{opacity:1;transform:translate(-50%,0) scale(1)} }
        @keyframes aurora     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(3%,2%) scale(1.04)} 66%{transform:translate(-2%,1%) scale(.97)} }
        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 1px rgba(100,112,255,.12),0 32px 80px rgba(0,0,0,.7)} 50%{box-shadow:0 0 0 1px rgba(100,112,255,.30),0 32px 80px rgba(0,0,0,.7),0 0 60px rgba(100,112,255,.06)} }
        @keyframes dotBlink   { 0%,100%{opacity:1} 50%{opacity:.25} }

        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
            -webkit-box-shadow:0 0 0 1000px #080d1c inset !important;
            -webkit-text-fill-color:#e2e8f0 !important;
            caret-color:#e2e8f0;
            transition:background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:rgba(255,255,255,.10); opacity:1; }
        .vi-input:focus::placeholder { opacity:0; transition:opacity .25s; }
        .stat-pill { transition:all .25s ease; }
        .stat-pill:hover { background:rgba(100,112,255,.12) !important; border-color:rgba(100,112,255,.28) !important; transform:translateY(-1px); }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  CANVAS HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useNetworkCanvas(canvasRef) {
    const nodesRef   = useRef([]);
    const edgesRef   = useRef([]);
    const mouseRef   = useRef({ x: -999, y: -999 });
    const packetsRef = useRef([]);
    const animRef    = useRef(null);
    const [labelPos, setLabelPos] = useState([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function buildGraph(W, H) {
            const nodes = [], edges = [];
            const NET_H = H * 0.62;

            nodes.push({ x: W * 0.44, y: NET_H * 0.52, vx: 0, vy: 0, r: NODE_DEFS.primary.r, ci: 0, role: 'primary', phase: 0, pulse: 0, key: 'primary' });

            const hubPos = [
                { x: 0.18, y: 0.20, key: 'hub0' },
                { x: 0.64, y: 0.13, key: 'hub1' },
                { x: 0.80, y: 0.50, key: 'hub2' },
                { x: 0.70, y: 0.82, key: 'hub3' },
                { x: 0.22, y: 0.78, key: 'hub4' },
                { x: 0.09, y: 0.48, key: 'hub5' },
            ];
            hubPos.forEach(({ x, y, key }, i) => nodes.push({
                x: W * x + (Math.random() - .5) * 14,
                y: NET_H * y + (Math.random() - .5) * 14,
                vx: (Math.random() - .5) * .09, vy: (Math.random() - .5) * .09,
                r: NODE_DEFS[key].r, ci: i + 1, role: 'hub',
                phase: Math.random() * Math.PI * 2, pulse: 0, key,
                maxY: NET_H,
            }));

            for (let i = 0; i < 22; i++) {
                const ci = 7 + Math.floor(Math.random() * 3);
                nodes.push({
                    x: W * (.05 + Math.random() * .90),
                    y: NET_H * (.04 + Math.random() * .92),
                    vx: (Math.random() - .5) * .13, vy: (Math.random() - .5) * .13,
                    r: 1.0 + Math.random() * 2.2, ci: Math.min(ci, PALETTE.length - 1),
                    role: 'micro', phase: Math.random() * Math.PI * 2, pulse: 0, key: null,
                    maxY: NET_H,
                });
            }

            for (let i = 1; i <= 6; i++) edges.push({ a: 0, b: i, s: 1.0 });
            [[1,2],[2,3],[3,4],[4,5],[5,6],[6,1],[1,4],[2,5],[3,6]].forEach(([a, b]) => edges.push({ a, b, s: 0.45 }));
            for (let i = 7; i < nodes.length; i++) {
                let best = 0, bestD = Infinity;
                for (let j = 0; j <= 6; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < bestD) { bestD = d; best = j; }
                }
                edges.push({ a: best, b: i, s: 0.22 });
            }
            for (let i = 7; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    if (Math.sqrt(dx * dx + dy * dy) < 110 && Math.random() > .6)
                        edges.push({ a: i, b: j, s: 0.12 });
                }
            }

            nodesRef.current   = nodes;
            edgesRef.current   = edges;
            packetsRef.current = [];
        }

        function spawn() {
            const e = edgesRef.current;
            if (!e.length) return;
            const edge = e[Math.floor(Math.random() * e.length)];
            packetsRef.current.push({ edge, t: 0, sp: .004 + Math.random() * .007, rev: Math.random() > .5 });
        }

        function resize() {
            const r = canvas.parentElement.getBoundingClientRect();
            canvas.width = r.width; canvas.height = r.height;
            buildGraph(canvas.width, canvas.height);
        }

        let frame = 0;
        function draw() {
            const W = canvas.width, H = canvas.height;
            const nodes = nodesRef.current, edges = edgesRef.current, pkts = packetsRef.current;
            ctx.clearRect(0, 0, W, H);

            nodes.forEach(n => {
                if (n.role === 'primary') return;
                n.phase += .006;
                n.x += n.vx + Math.sin(n.phase * .55) * .025;
                n.y += n.vy + Math.cos(n.phase * .40) * .025;
                const pad = 28;
                const yMax = n.maxY || H * .62;
                if (n.x < pad) n.vx += .05; if (n.x > W - pad) n.vx -= .05;
                if (n.y < pad) n.vy += .05; if (n.y > yMax) n.vy -= .06;
                n.vx *= .994; n.vy *= .994;
                n.vx = Math.max(-.40, Math.min(.40, n.vx));
                n.vy = Math.max(-.40, Math.min(.40, n.vy));
                const dx = n.x - mouseRef.current.x, dy = n.y - mouseRef.current.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110 && d > 0) { const f = (1 - d / 110) * .20; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
            });

            edges.forEach(e => {
                const a = nodes[e.a], b = nodes[e.b];
                const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
                const alpha = e.s * .16 * Math.max(0, 1 - dist / 480);
                if (alpha < .005) return;
                const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                g.addColorStop(0, hsl(PALETTE[a.ci], alpha));
                g.addColorStop(1, hsl(PALETTE[b.ci], alpha));
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = g; ctx.lineWidth = e.s * .65; ctx.stroke();
            });

            for (let pi = pkts.length - 1; pi >= 0; pi--) {
                const pk = pkts[pi]; pk.t += pk.sp;
                if (pk.t >= 1) { pkts.splice(pi, 1); continue; }
                const a = nodes[pk.edge.a], b = nodes[pk.edge.b];
                const t = pk.rev ? 1 - pk.t : pk.t;
                const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
                const gg = ctx.createRadialGradient(x, y, 0, x, y, 9);
                gg.addColorStop(0, hsl(PALETTE[a.ci], .28)); gg.addColorStop(1, hsl(PALETTE[a.ci], 0));
                ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
                ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fillStyle = hsl(PALETTE[a.ci], .95); ctx.fill();
            }

            nodes.forEach(n => {
                n.phase += .007;
                const rr = n.r * (Math.sin(n.phase) * .12 + 1);
                const pal = PALETTE[n.ci];
                if (n.role !== 'micro') {
                    const gr = rr + (n.role === 'primary' ? 40 : 24);
                    const gg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
                    gg.addColorStop(0, hsl(pal, n.role === 'primary' ? .22 : .13)); gg.addColorStop(1, hsl(pal, 0));
                    ctx.beginPath(); ctx.arc(n.x, n.y, gr, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
                    ctx.beginPath(); ctx.arc(n.x, n.y, rr + 6, 0, Math.PI * 2);
                    ctx.strokeStyle = hsl(pal, .20); ctx.lineWidth = 1; ctx.stroke();
                }
                const fc = ctx.createRadialGradient(n.x - rr * .3, n.y - rr * .3, 0, n.x, n.y, rr);
                fc.addColorStop(0, hsl({ ...pal, l: Math.min(96, pal.l + 24) }, 1));
                fc.addColorStop(1, hsl(pal, .88));
                ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, Math.PI * 2); ctx.fillStyle = fc; ctx.fill();

                if (n.role === 'primary') {
                    n.pulse = (n.pulse + .008) % 1;
                    [n.pulse, (n.pulse + .5) % 1].forEach((p, i) => {
                        ctx.beginPath(); ctx.arc(n.x, n.y, rr + 14 + p * 42, 0, Math.PI * 2);
                        ctx.strokeStyle = hsl(pal, (1 - p) * (i === 0 ? .28 : .13));
                        ctx.lineWidth = i === 0 ? 1.5 : 1; ctx.stroke();
                    });
                }
            });

            frame++;
            if (frame % 2 === 0) {
                setLabelPos(nodes.filter(n => n.role !== 'micro').map(n => ({
                    x: n.x, y: n.y, key: n.key, ci: n.ci, r: n.r, role: n.role,
                })));
            }
            animRef.current = requestAnimationFrame(draw);
        }

        const pktIv = setInterval(() => { if (packetsRef.current.length < 36) spawn(); }, 260);
        resize(); draw();

        const onResize = () => { cancelAnimationFrame(animRef.current); resize(); draw(); };
        const onMouse  = e => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
        window.addEventListener('resize', onResize);
        canvas.parentElement?.addEventListener('mousemove', onMouse);
        return () => {
            cancelAnimationFrame(animRef.current); clearInterval(pktIv);
            window.removeEventListener('resize', onResize);
            canvas.parentElement?.removeEventListener('mousemove', onMouse);
        };
    }, [canvasRef]);

    return labelPos;
}

// ─────────────────────────────────────────────────────────────────────────────
//  NODE LABEL
// ─────────────────────────────────────────────────────────────────────────────
const NodeLabel = React.memo(({ x, y, nodeKey, ci, r, role }) => {
    const def = NODE_DEFS[nodeKey];
    if (!def) return null;
    const IconComp  = ICON_MAP[def.icon];
    const color     = def.color;
    const isPrimary = role === 'primary';
    const offset    = r + (isPrimary ? 30 : 24);

    return (
        <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconComp && <IconComp size={isPrimary ? 13 : 9} color="rgba(255,255,255,.95)" strokeWidth={1.8}/>}
            </div>
            <div style={{ position: 'absolute', top: offset, left: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'labelIn .6s cubic-bezier(.34,1.3,.64,1) both', whiteSpace: 'nowrap' }}>
                <div style={{ width: 1, height: isPrimary ? 16 : 11, background: `linear-gradient(to bottom, transparent, ${color}55)` }}/>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: isPrimary ? 7 : 5,
                    background: 'linear-gradient(135deg, rgba(8,10,24,.92), rgba(12,14,32,.88))',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${color}28`,
                    borderRadius: isPrimary ? 10 : 8,
                    padding: isPrimary ? '6px 11px' : '3px 8px',
                    boxShadow: `0 4px 20px rgba(0,0,0,.5), 0 0 0 1px ${color}10 inset`,
                }}>
                    <div style={{ width: isPrimary ? 7 : 5, height: isPrimary ? 7 : 5, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}CC`, flexShrink: 0 }}/>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isPrimary ? 9 : 7.5, fontWeight: 700, color: 'rgba(235,238,252,.95)', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>
                            {def.label}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: isPrimary ? 7.5 : 6.5, color: `${color}99`, letterSpacing: '.5px', lineHeight: 1 }}>
                            {def.sub}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────────────────────
const BOTTOM_DOTS = [
    { label: 'Core Monitoring', color: '#38BDF8' },
    { label: 'Query & Indexes', color: '#F5C842' },
    { label: 'Infrastructure',  color: '#00D4A0' },
    { label: 'Observability',   color: '#FB923C' },
];

const FEATURE_STATS = [
    { val: '6',    desc: 'Modules'       },
    { val: '<1s',  desc: 'Latency'       },
    { val: '∞',    desc: 'Query History' },
    { val: '100%', desc: 'OpenTelemetry' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = () => {
    const canvasRef = useRef(null);
    const labelPos  = useNetworkCanvas(canvasRef);

    return (
        <div style={{
            flex: '1 1 0', minWidth: 0, height: '100vh', position: 'relative',
            overflow: 'hidden', background: '#05060E',
            borderRight: '1px solid rgba(100,112,255,.08)',
        }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}/>

            {/* Labels */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
                {labelPos.map(n => <NodeLabel key={n.key} x={n.x} y={n.y} nodeKey={n.key} ci={n.ci} r={n.r} role={n.role}/>)}
            </div>

            {/* Aurora layers */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(100,112,255,.09) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'aurora 12s ease-in-out infinite' }}/>
                <div style={{ position: 'absolute', top: '20%', right: '-5%', width: '45%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(56,189,248,.06) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'aurora 16s ease-in-out infinite reverse' }}/>
                <div style={{ position: 'absolute', bottom: '25%', left: '5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,.05) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'aurora 10s ease-in-out infinite 3s' }}/>
            </div>

            {/* Grain */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: .022,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}/>

            {/* Wordmark */}
            <div style={{ position: 'absolute', top: 28, left: 36, zIndex: 8, display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp .8s ease .05s backwards' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 13,
                    background: 'linear-gradient(145deg, #3D47D8, #7B3ACF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.12) inset, 0 8px 28px rgba(74,84,232,.55), 0 0 0 5px rgba(100,112,255,.07)',
                    animation: 'floatUp 5s ease-in-out infinite',
                }}>
                    <Database size={18} color="#fff" strokeWidth={1.8}/>
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(235,238,252,.95)', fontFamily: "'Outfit',sans-serif", letterSpacing: '-.2px', lineHeight: 1 }}>pg_monitor</div>
                    <div style={{ fontSize: 8, color: 'rgba(100,112,255,.6)', fontFamily: "'JetBrains Mono',monospace", marginTop: 3, letterSpacing: '2.5px', textTransform: 'uppercase' }}>PostgreSQL Intelligence</div>
                </div>
            </div>

            {/* Scrim — only covers bottom 36% */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
                pointerEvents: 'none', zIndex: 3,
                background: 'linear-gradient(to top, rgba(5,6,14,1) 0%, rgba(5,6,14,.96) 30%, rgba(5,6,14,.55) 60%, transparent 100%)',
            }}/>

            {/* ── HERO BLOCK ── fixed 36% height, fully centred */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '36%',
                zIndex: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 11,
                padding: '0 52px',
            }}>

                {/* Eyebrow badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '4px 14px 4px 10px',
                    background: 'rgba(100,112,255,.07)',
                    border: '1px solid rgba(100,112,255,.18)',
                    borderRadius: 100,
                    animation: 'fadeUp .8s ease .1s backwards',
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6470FF', boxShadow: '0 0 8px #6470FF', display: 'inline-block', animation: 'dotBlink 2.5s ease-in-out infinite' }}/>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(130,140,255,.80)' }}>
                        Database Observability Platform
                    </span>
                </div>

                {/* Headline with shimmer on italic part */}
                <div style={{ animation: 'fadeUp .85s ease .2s backwards' }}>
                    <span style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 'clamp(20px, 2.2vw, 36px)',
                        fontWeight: 700, color: '#EAECF8', letterSpacing: '-0.5px',
                    }}>
                        Monitor every query,&nbsp;
                    </span>
                    <span style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 'clamp(20px, 2.2vw, 36px)',
                        fontWeight: 400, fontStyle: 'italic',
                        background: 'linear-gradient(90deg, #818AFF, #C4AAFF, #818AFF)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'shimmer 4s linear infinite',
                    }}>
                        beautifully.
                    </span>
                </div>

                {/* Sub-copy */}
                <p style={{
                    fontSize: 11.5, fontWeight: 300, color: 'rgba(130,145,175,.68)',
                    lineHeight: 1.75, margin: 0, maxWidth: 500,
                    fontFamily: "'Outfit',sans-serif",
                    animation: 'fadeUp .85s ease .30s backwards',
                }}>
                    Real-time intelligence across your PostgreSQL fleet — slow queries, replication lag,
                    vacuum cycles, index health, and table bloat. Six unified modules, zero blind spots.
                </p>

                {/* Stats inline row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, animation: 'fadeUp .85s ease .38s backwards' }}>
                    {FEATURE_STATS.map(({ val, desc }, i) => (
                        <React.Fragment key={desc}>
                            <div className="stat-pill" style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '5px 13px',
                                background: 'rgba(100,112,255,.06)',
                                border: '1px solid rgba(100,112,255,.13)',
                                borderRadius: 8,
                                cursor: 'default',
                            }}>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: '#8B94FF', letterSpacing: '-.3px' }}>{val}</span>
                                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, color: 'rgba(130,145,175,.52)' }}>{desc}</span>
                            </div>
                            {i < FEATURE_STATS.length - 1 && (
                                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,.06)', flexShrink: 0 }}/>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Status dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 22, animation: 'fadeUp .85s ease .46s backwards' }}>
                    {BOTTOM_DOTS.map(({ label, color }) => (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5,
                            letterSpacing: '.5px', color: 'rgba(140,155,185,.48)',
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}AA`, flexShrink: 0 }}/>
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
    const S = 90, C = 45, R1 = 38, R2 = 28, R3 = 19;
    const c1 = success ? '#22c55e' : '#6470FF', c2 = success ? '#22c55e' : '#A78BFA';
    return (
        <div style={{ position: 'relative', width: S, height: S, animation: 'floatUp 5s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: success ? 'radial-gradient(circle,rgba(34,197,94,.16) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(100,112,255,.14) 0%,transparent 70%)', animation: 'glowPulse 3.5s ease-in-out infinite', transition: 'background 1s' }}/>
            <svg width={S} height={S} style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={c1} stopOpacity=".75"/>
                        <stop offset="100%" stopColor={c2} stopOpacity=".2"/>
                    </linearGradient>
                </defs>
                <circle cx={C} cy={C} r={R1} fill="none" stroke="url(#rg1)" strokeWidth="1.2" strokeDasharray="5 3.5" style={{ transformOrigin: 'center', animation: 'spin 24s linear infinite' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.6" strokeDasharray={`${Math.PI*R2*.65} ${Math.PI*R2*.35}`} strokeLinecap="round" opacity=".65" style={{ transformOrigin: 'center', animation: 'spinRev 12s linear infinite' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth=".8" strokeDasharray="2 5" opacity=".22" style={{ transformOrigin: 'center', animation: 'spin 8s linear infinite' }}/>
                {[0, 72, 144, 216, 288].map((d, i) => (
                    <circle key={d} cx={C + R1 * Math.cos(d * Math.PI / 180)} cy={C + R1 * Math.sin(d * Math.PI / 180)} r={i === 0 ? 3 : 2} fill={c1} opacity={.30 + i * .12}/>
                ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#3D47D8,#7B3ACF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success
                        ? '0 6px 30px rgba(34,197,94,.55), 0 0 0 1px rgba(255,255,255,.10) inset'
                        : '0 6px 30px rgba(74,84,232,.55), 0 0 0 1px rgba(255,255,255,.10) inset',
                    transition: 'all .9s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success
                        ? <CheckCircle size={23} color="#fff" style={{ animation: 'successPop .5s ease backwards' }}/>
                        : <Database size={23} color="#fff" strokeWidth={1.8}/>
                    }
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }) => {
    const on  = status.status === 'online';
    const off = status.status === 'offline';
    const chk = status.status === 'checking';
    const color = on ? '#22c55e' : off ? '#ef4444' : '#f59e0b';
    const label = on ? 'ONLINE' : off ? 'OFFLINE' : chk ? 'CHECKING' : 'DEGRADED';
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px 5px 10px', borderRadius: 100,
            background: `${color}0D`, border: `1px solid ${color}28`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5,
        }}>
            {chk
                ? <><Loader size={9} color="#334155" style={{ animation: 'spin 1s linear infinite' }}/><span style={{ color: '#334155', letterSpacing: '.05em' }}>CHECKING…</span></>
                : <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: on ? 'pulseDot 2.2s ease-in-out infinite' : 'none' }}/>
                        {on && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}70`, animation: 'ringOut 2.2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '.08em' }}>{label}</span>
                    {status.latency != null && (
                        <span style={{ color: 'rgba(100,116,139,.5)', fontSize: 8.5, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.05)' }}>
                            {status.latency}ms
                        </span>
                    )}
                </>
            }
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
const InputField = React.forwardRef(function InputField(
    { icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{
                display: 'block', marginBottom: 7, fontSize: 9, fontWeight: 600,
                color: focused ? '#818AFF' : 'rgba(100,116,139,.55)',
                textTransform: 'uppercase', letterSpacing: '1.6px',
                fontFamily: "'JetBrains Mono',monospace", transition: 'color .2s',
            }}>{label}</label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: focused ? 'rgba(100,112,255,.06)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${focused ? 'rgba(100,112,255,.50)' : 'rgba(255,255,255,.08)'}`,
                borderRadius: 12, padding: '0 14px',
                transition: 'all .25s',
                boxShadow: focused
                    ? '0 0 0 4px rgba(100,112,255,.09), inset 0 1px 0 rgba(255,255,255,.05)'
                    : 'inset 0 1px 0 rgba(255,255,255,.03)',
            }}>
                <Icon size={14} color={focused ? '#818AFF' : hasVal ? 'rgba(100,116,139,.65)' : 'rgba(100,116,139,.22)'} style={{ flexShrink: 0, transition: 'color .2s' }}/>
                <input
                    ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete} disabled={disabled}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="vi-input"
                    style={{ flex: 1, padding: '13px 0', background: 'none', border: 'none', color: '#E8EAF4', fontSize: 13.5, outline: 'none', fontFamily: "'Outfit',sans-serif", fontWeight: 400, opacity: disabled ? .4 : 1 }}
                />
                {rightEl}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORNER ACCENTS
// ─────────────────────────────────────────────────────────────────────────────
const Corners = ({ color = 'rgba(100,112,255,.18)' }) => (
    <>
        {[
            { top: 0,    left: 0,   borderTop: `1px solid ${color}`,    borderLeft: `1px solid ${color}`,   borderRadius: '4px 0 0 0' },
            { top: 0,    right: 0,  borderTop: `1px solid ${color}`,    borderRight: `1px solid ${color}`,  borderRadius: '0 4px 0 0' },
            { bottom: 0, left: 0,   borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}`,   borderRadius: '0 0 0 4px' },
            { bottom: 0, right: 0,  borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}`,  borderRadius: '0 0 4px 0' },
        ].map(({ borderRadius, ...s }, i) => (
            <div key={i} style={{ position: 'absolute', width: 16, height: 16, pointerEvents: 'none', borderRadius, ...s }}/>
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

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0  = performance.now();
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const d   = await res.json();
                if (!cancelled) setServerStatus({ status: d.status === 'ok' ? 'online' : 'degraded', latency: Math.round(performance.now() - t0) });
            } catch { if (!cancelled) setServerStatus({ status: 'offline' }); }
        };
        check();
        const iv = setInterval(check, 15000);
        return () => { cancelled = true; clearInterval(iv); };
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) { setUsername(saved); setRememberMe(true); pwdRef.current?.focus(); }
        else userRef.current?.focus();
    }, []);

    useEffect(() => {
        if (error) { setShake(true); const t = setTimeout(() => setShake(false), 600); return () => clearTimeout(t); }
    }, [error]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (error && clearError) clearError(); }, [username, password]);

    const handleSubmit = useCallback(async e => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else            localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try { await login(username, password); setLoginSuccess(true); } catch {}
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;
    const btnGrad   = loginSuccess ? '#22c55e'
        : canSubmit  ? 'linear-gradient(135deg, #3D47D8 0%, #5B63F0 50%, #818AFF 100%)'
            : 'rgba(100,112,255,.07)';
    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? btnHover
            ? '0 14px 42px rgba(100,112,255,.62), 0 0 0 1px rgba(130,138,255,.38) inset, 0 1px 0 rgba(255,255,255,.16) inset'
            : '0 8px 28px rgba(100,112,255,.38), 0 0 0 1px rgba(100,112,255,.24) inset'
        : 'none';

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#05060E', fontFamily: "'Outfit',sans-serif", overflow: 'hidden' }}>
            <GlobalStyles/>
            <LeftPanel/>

            {/* ── RIGHT PANEL ── */}
            <div style={{
                width: 500, flexShrink: 0, position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '36px 46px',
                background: 'rgba(4,5,12,.99)',
            }}>
                {/* Ambient glows */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-5%', right: '-25%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(100,112,255,.065) 0%, transparent 65%)', filter: 'blur(52px)', animation: 'aurora 14s ease-in-out infinite' }}/>
                    <div style={{ position: 'absolute', bottom: '-5%', left: '-20%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(167,139,250,.052) 0%, transparent 65%)', filter: 'blur(42px)', animation: 'aurora 10s ease-in-out infinite reverse' }}/>
                    <div style={{ position: 'absolute', inset: 0, opacity: .008, backgroundImage: 'linear-gradient(rgba(100,112,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,112,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }}/>
                </div>

                {/* Top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(100,112,255,.45) 25%, rgba(167,139,250,.90) 50%, rgba(100,112,255,.45) 75%, transparent)', opacity: .85, animation: 'edgePulse 4s ease-in-out infinite' }}/>
                {/* Left border */}
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(100,112,255,.08) 30%, rgba(100,112,255,.13) 50%, rgba(100,112,255,.08) 70%, transparent)' }}/>

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 385, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ marginBottom: 22, animation: 'fadeUp .7s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess}/>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 4, animation: 'fadeUp .7s ease .18s backwards', width: '100%' }}>
                        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#EAECF8', margin: 0, lineHeight: 1.1, letterSpacing: '-.06em', fontFamily: "'Playfair Display',serif" }}>
                            Welcome back
                        </h1>
                        <p style={{ color: 'rgba(100,116,139,.52)', margin: '9px 0 0', fontSize: 13, lineHeight: 1.55, fontFamily: "'Outfit',sans-serif", fontWeight: 300 }}>
                            Sign in to your monitoring dashboard
                        </p>
                    </div>

                    <div style={{ margin: '18px 0 20px', display: 'flex', alignItems: 'center', gap: 12, width: '100%', animation: 'fadeUp .7s ease .24s backwards' }}>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,.06))' }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,.06))' }}/>
                    </div>

                    {/* Card */}
                    <div style={{
                        width: '100%', padding: '28px 26px 24px', borderRadius: 22,
                        background: 'linear-gradient(160deg, rgba(10,12,28,.96) 0%, rgba(6,8,20,.98) 100%)',
                        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                        border: `1px solid ${loginSuccess ? 'rgba(34,197,94,.28)' : error ? 'rgba(239,68,68,.20)' : 'rgba(100,112,255,.11)'}`,
                        boxShadow: loginSuccess
                            ? '0 0 80px rgba(34,197,94,.10), 0 32px 80px rgba(0,0,0,.7)'
                            : '0 32px 80px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04)',
                        transition: 'border-color .6s, box-shadow .6s',
                        animation: shake ? 'shake .5s ease' : 'borderGlow 5s ease-in-out infinite, fadeUp .7s ease .32s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: '6%', right: '6%', height: 1,
                            background: loginSuccess
                                ? 'linear-gradient(90deg, transparent, rgba(34,197,94,.55), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(130,138,255,.42), transparent)',
                            transition: 'background .6s', animation: 'edgePulse 3.5s ease-in-out infinite',
                        }}/>
                        <Corners color={loginSuccess ? 'rgba(34,197,94,.20)' : 'rgba(100,112,255,.16)'}/>

                        {loginSuccess && (
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center,rgba(34,197,94,.09) 0%,transparent 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, borderRadius: 22, animation: 'fadeIn .35s ease' }}>
                                <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(34,197,94,.28)', animation: 'ripple 1.1s ease-out forwards' }}/>
                                <CheckCircle size={44} color="#22c55e" style={{ animation: 'successPop .5s cubic-bezier(.34,1.56,.64,1) backwards', marginBottom: 14 }}/>
                                <div style={{ color: '#22c55e', fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display',serif", animation: 'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color: 'rgba(100,116,139,.58)', fontSize: 10, marginTop: 6, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.06em', animation: 'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 11, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.20)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown .3s ease backwards' }}>
                                <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }}/>
                                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, fontFamily: "'Outfit',sans-serif" }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading || loginSuccess}/>
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading || loginSuccess}
                                        rightEl={
                                            <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(100,116,139,.32)', padding: 4, display: 'flex', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#818AFF'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(100,116,139,.32)'}>
                                                {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                                            </button>
                                        }
                            />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${rememberMe ? '#6470FF' : 'rgba(255,255,255,.12)'}`, background: rememberMe ? '#6470FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s cubic-bezier(.34,1.56,.64,1)', boxShadow: rememberMe ? '0 0 12px rgba(100,112,255,.45)' : 'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize: 12, color: 'rgba(100,116,139,.58)', fontFamily: "'Outfit',sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(100,116,139,.48)', fontFamily: "'Outfit',sans-serif", padding: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#818AFF'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(100,116,139,.48)'}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={!canSubmit} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                                    style={{ position: 'relative', overflow: 'hidden', background: btnGrad, border: canSubmit ? `1px solid ${loginSuccess ? 'rgba(34,197,94,.35)' : 'rgba(100,112,255,.32)'}` : '1px solid rgba(255,255,255,.05)', padding: '14px 20px', borderRadius: 13, color: 'white', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit',sans-serif", letterSpacing: '.01em', cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: btnShadow, transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)' }}>
                                {canSubmit && !authLoading && !loginSuccess && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.07) 50%, transparent 60%)', backgroundSize: '200% auto', animation: btnHover ? 'shimmer 1.2s ease forwards' : 'none', borderRadius: 13 }}/>
                                )}
                                <span style={{ position: 'relative' }}>
                                    {authLoading
                                        ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: 8 }}/>Authenticating…</>
                                        : loginSuccess
                                            ? <><CheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: 8 }}/>Access Granted</>
                                            : <>Sign In&nbsp;<ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', transition: 'transform .25s', transform: btnHover ? 'translateX(4px)' : 'translateX(0)' }}/></>
                                    }
                                </span>
                            </button>
                        </form>

                        {!loginSuccess && (
                            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
                                <span style={{ fontSize: 9, color: 'rgba(100,116,139,.26)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.06em' }}>
                                    Admin access only · Contact your DBA for credentials
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'fadeUp .7s ease .65s backwards' }}>
                        <Shield size={8} color="rgba(100,116,139,.22)"/>
                        <span style={{ fontSize: 8.5, color: 'rgba(100,116,139,.26)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.04em' }}>TLS 1.3 encrypted · pg_monitor v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;