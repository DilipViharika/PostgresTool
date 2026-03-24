import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Activity, Zap, HardDrive, Lock,
    Search, RefreshCw, Cloud, Terminal, Users, Sun, Moon,
    Server, Cpu, Brain, Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const API_BASE = import.meta?.env?.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

// ─────────────────────────────────────────────────────────────────────────────
//  DATABASE TYPE DEFINITIONS — The five engines orbiting the core
// ─────────────────────────────────────────────────────────────────────────────
const DB_TYPES = [
    { key: 'postgresql', label: 'PostgreSQL',  color: '#336791', icon: '🐘', shortLabel: 'PG' },
    { key: 'mysql',      label: 'MySQL',       color: '#00758F', icon: '🐬', shortLabel: 'MY' },
    { key: 'mssql',      label: 'SQL Server',  color: '#CC2927', icon: '🔷', shortLabel: 'MS' },
    { key: 'oracle',     label: 'Oracle',       color: '#F80000', icon: '🔴', shortLabel: 'OR' },
    { key: 'mongodb',    label: 'MongoDB',      color: '#47A248', icon: '🍃', shortLabel: 'MG' },
];

const NODE_DEFS = {
    primary: { label: 'Monitor',          sub: 'Core',          color: '#00D4FF', icon: 'Activity',  r: 16 },
    hub0:    { label: 'PostgreSQL',      sub: 'RDBMS',        color: '#6495ED', icon: 'Database',  r: 10 },
    hub1:    { label: 'MySQL',           sub: 'RDBMS',        color: '#00B4D8', icon: 'Server',    r: 10 },
    hub2:    { label: 'SQL Server',      sub: 'Enterprise',   color: '#F97316', icon: 'HardDrive', r: 10 },
    hub3:    { label: 'Oracle',          sub: 'Enterprise',   color: '#FF4560', icon: 'Cpu',       r: 10 },
    hub4:    { label: 'MongoDB',         sub: 'NoSQL',        color: '#2EE89C', icon: 'Cloud',     r: 10 },
    hub5:    { label: 'AI Engine',       sub: 'Intelligence', color: '#A78BFA', icon: 'Brain',     r: 9.5 },
};

const ICON_MAP = { Database, Activity, Zap, HardDrive, Lock, Cloud, Terminal, Search, RefreshCw, Users, Server, Cpu, Brain, Globe };

const PALETTE = [
    { h: 190, s: 100, l: 55 },   // cyan — primary
    { h: 220, s: 80,  l: 66 },   // blue — PostgreSQL
    { h: 192, s: 100, l: 46 },   // teal — MySQL
    { h:  27, s: 100, l: 55 },   // orange — MSSQL
    { h: 348, s: 100, l: 60 },   // red — Oracle
    { h: 157, s: 100, l: 58 },   // green — MongoDB
    { h: 264, s: 80,  l: 72 },   // violet — AI
    { h: 200, s: 100, l: 65 },
    { h: 320, s: 70,  l: 68 },
    { h:  20, s: 90,  l: 68 },
];
const hsl = (c, a) => `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }

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
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 1px rgba(0,212,255,.12),0 32px 80px rgba(0,0,0,.7)} 50%{box-shadow:0 0 0 1px rgba(0,212,255,.30),0 32px 80px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06)} }
        @keyframes dotBlink   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes orbitPulse { 0%,100%{opacity:.4;transform:scale(.95)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes dbSlide    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
            -webkit-box-shadow:0 0 0 1000px ${THEME.surface} inset !important;
            -webkit-text-fill-color:${THEME.textMain} !important;
            caret-color:${THEME.textMain};
            transition:background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:${THEME.textDim}; opacity:1; }
        .vi-input:focus::placeholder { opacity:0; transition:opacity .25s; }
        .stat-pill { transition:all .25s ease; }
        .stat-pill:hover { background:rgba(0,212,255,.12) !important; border-color:rgba(0,212,255,.28) !important; transform:translateY(-1px); }
        .db-chip { transition:all .25s ease; }
        .db-chip:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.4) !important; }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  CANVAS HOOK — Network graph visualization
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

            // Primary node — VIGIL core
            nodes.push({ x: W * 0.44, y: NET_H * 0.50, vx: 0, vy: 0, r: NODE_DEFS.primary.r, ci: 0, role: 'primary', phase: 0, pulse: 0, key: 'primary' });

            // Hub nodes — 5 databases + AI
            const hubPos = [
                { x: 0.18, y: 0.18, key: 'hub0' },
                { x: 0.68, y: 0.12, key: 'hub1' },
                { x: 0.82, y: 0.48, key: 'hub2' },
                { x: 0.65, y: 0.84, key: 'hub3' },
                { x: 0.20, y: 0.80, key: 'hub4' },
                { x: 0.08, y: 0.48, key: 'hub5' },
            ];
            hubPos.forEach(({ x, y, key }, i) => nodes.push({
                x: W * x + (Math.random() - .5) * 14,
                y: NET_H * y + (Math.random() - .5) * 14,
                vx: (Math.random() - .5) * .09, vy: (Math.random() - .5) * .09,
                r: NODE_DEFS[key].r, ci: i + 1, role: 'hub',
                phase: Math.random() * Math.PI * 2, pulse: 0, key,
                maxY: NET_H,
            }));

            // Micro nodes — metric particles
            for (let i = 0; i < 24; i++) {
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

            // Edges: primary → hubs
            for (let i = 1; i <= 6; i++) edges.push({ a: 0, b: i, s: 1.0 });
            // Hub cross-connections
            [[1,2],[2,3],[3,4],[4,5],[5,6],[6,1],[1,4],[2,5],[3,6]].forEach(([a, b]) => edges.push({ a, b, s: 0.45 }));
            // Micro → nearest hub
            for (let i = 7; i < nodes.length; i++) {
                let best = 0, bestD = Infinity;
                for (let j = 0; j <= 6; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < bestD) { bestD = d; best = j; }
                }
                edges.push({ a: best, b: i, s: 0.22 });
            }
            // Nearby micro connections
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

            // Physics step
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

            // Draw edges
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

            // Draw packets
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

            // Draw nodes
            nodes.forEach(n => {
                n.phase += .007;
                const rr = n.r * (Math.sin(n.phase) * .12 + 1);
                const pal = PALETTE[n.ci];
                if (n.role !== 'micro') {
                    const gr = rr + (n.role === 'primary' ? 42 : 26);
                    const gg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
                    gg.addColorStop(0, hsl(pal, n.role === 'primary' ? .24 : .14)); gg.addColorStop(1, hsl(pal, 0));
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
    const offset    = r + (isPrimary ? 32 : 24);

    return (
        <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconComp && <IconComp size={isPrimary ? 14 : 9} color={THEME.textMain} strokeWidth={1.8}/>}
            </div>
            <div style={{ position: 'absolute', top: offset, left: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'labelIn .6s cubic-bezier(.34,1.3,.64,1) both', whiteSpace: 'nowrap' }}>
                <div style={{ width: 1, height: isPrimary ? 16 : 11, background: `linear-gradient(to bottom, transparent, ${color}55)` }}/>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: isPrimary ? 7 : 5,
                    background: THEME.glass,
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${color}28`,
                    borderRadius: isPrimary ? 10 : 8,
                    padding: isPrimary ? '6px 12px' : '3px 8px',
                    boxShadow: `0 4px 20px rgba(0,0,0,.3), 0 0 0 1px ${color}10 inset`,
                }}>
                    <div style={{ width: isPrimary ? 7 : 5, height: isPrimary ? 7 : 5, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}CC`, flexShrink: 0 }}/>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <span style={{ fontFamily: THEME.fontMono, fontSize: isPrimary ? 9.5 : 7.5, fontWeight: 700, color: THEME.textMain, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>
                            {def.label}
                        </span>
                        <span style={{ fontFamily: THEME.fontMono, fontSize: isPrimary ? 7.5 : 6.5, color: `${color}99`, letterSpacing: '.5px', lineHeight: 1 }}>
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
    { label: 'PostgreSQL',   color: '#6495ED' },
    { label: 'MySQL',        color: '#00B4D8' },
    { label: 'SQL Server',   color: '#F97316' },
    { label: 'Oracle',       color: '#FF4560' },
    { label: 'MongoDB',      color: '#2EE89C' },
];

const FEATURE_STATS = [
    { val: '5',    desc: 'DB Engines'   },
    { val: '183',  desc: 'Metrics'      },
    { val: '42',   desc: 'Dashboards'   },
    { val: 'AI',   desc: 'Powered'      },
];

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = () => {
    useAdaptiveTheme();
    const canvasRef = useRef(null);
    const labelPos  = useNetworkCanvas(canvasRef);

    return (
        <div style={{
            flex: '1 1 0', minWidth: 0, height: '100vh', position: 'relative',
            overflow: 'hidden', background: THEME.bg,
            borderRight: `1px solid ${THEME.glassBorder}`,
        }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}/>

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
                {labelPos.map(n => <NodeLabel key={n.key} x={n.x} y={n.y} nodeKey={n.key} ci={n.ci} r={n.r} role={n.role}/>)}
            </div>

            {/* Aurora glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,212,255,.09) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'aurora 12s ease-in-out infinite' }}/>
                <div style={{ position: 'absolute', top: '20%', right: '-5%', width: '45%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,232,156,.06) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'aurora 16s ease-in-out infinite reverse' }}/>
                <div style={{ position: 'absolute', bottom: '25%', left: '5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,.05) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'aurora 10s ease-in-out infinite 3s' }}/>
            </div>

            {/* Noise texture */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: .022,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}/>

            {/* Brand mark */}
            <div style={{ position: 'absolute', top: 28, left: 36, zIndex: 8, display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp .8s ease .05s backwards' }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: 'linear-gradient(145deg, #0099CC, #00D4FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.12) inset, 0 8px 28px rgba(0,212,255,.45), 0 0 0 5px rgba(0,212,255,.07)',
                    animation: 'floatUp 5s ease-in-out infinite',
                }}>
                    <Shield size={20} color="#fff" strokeWidth={1.8}/>
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textMain, fontFamily: THEME.fontBody, letterSpacing: '-.2px', lineHeight: 1 }}>Database Monitor</div>
                    <div style={{ fontSize: 8, color: 'rgba(0,212,255,.6)', fontFamily: THEME.fontMono, marginTop: 3, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Multi-Engine Intelligence</div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
                pointerEvents: 'none', zIndex: 3,
                background: `linear-gradient(to top, ${THEME.bg} 0%, ${THEME.bg}F5 30%, ${THEME.bg}8C 60%, transparent 100%)`,
            }}/>

            {/* Bottom content */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '36%', zIndex: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', gap: 11, padding: '0 52px',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '4px 14px 4px 10px',
                    background: 'rgba(0,212,255,.07)',
                    border: '1px solid rgba(0,212,255,.18)',
                    borderRadius: 100,
                    animation: 'fadeUp .8s ease .1s backwards',
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 8px #00D4FF', display: 'inline-block', animation: 'dotBlink 2.5s ease-in-out infinite' }}/>
                    <span style={{ fontFamily: THEME.fontMono, fontSize: 8.5, letterSpacing: '2.5px', textTransform: 'uppercase', color: THEME.primary }}>
                        Universal Database Observatory
                    </span>
                </div>

                <div style={{ animation: 'fadeUp .85s ease .2s backwards' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px, 2.2vw, 36px)', fontWeight: 700, color: THEME.textMain, letterSpacing: '-0.5px' }}>
                        Every database,&nbsp;
                    </span>
                    <span style={{
                        fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px, 2.2vw, 36px)',
                        fontWeight: 400, fontStyle: 'italic',
                        background: 'linear-gradient(90deg, #00D4FF, #2EE89C, #00D4FF)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        animation: 'shimmer 4s linear infinite',
                    }}>
                        one command center.
                    </span>
                </div>

                <p style={{ fontSize: 11.5, fontWeight: 300, color: THEME.textMuted, lineHeight: 1.75, margin: 0, maxWidth: 520, fontFamily: THEME.fontBody, animation: 'fadeUp .85s ease .30s backwards' }}>
                    Real-time intelligence across PostgreSQL, MySQL, SQL Server, Oracle, and MongoDB.
                    183 metrics, AI anomaly detection, and end-to-end operations from a single pane.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, animation: 'fadeUp .85s ease .38s backwards' }}>
                    {FEATURE_STATS.map(({ val, desc }, i) => (
                        <React.Fragment key={desc}>
                            <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 13px', background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.13)', borderRadius: 8, cursor: 'default' }}>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: '#00D4FF', letterSpacing: '-.3px' }}>{val}</span>
                                <span style={{ fontFamily: THEME.fontBody, fontSize: 10, color: THEME.textDim }}>{desc}</span>
                            </div>
                            {i < FEATURE_STATS.length - 1 && <div style={{ width: 1, height: 14, background: THEME.grid, flexShrink: 0 }}/>}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18, animation: 'fadeUp .85s ease .46s backwards' }}>
                    {BOTTOM_DOTS.map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: THEME.fontMono, fontSize: 8.5, letterSpacing: '.5px', color: THEME.textDim }}>
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
    const S = 64, C = 32, R1 = 27, R2 = 20, R3 = 13;
    const c1 = success ? '#22c55e' : '#00D4FF', c2 = success ? '#22c55e' : '#2EE89C';
    return (
        <div style={{ position: 'relative', width: S, height: S, animation: 'floatUp 5s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: success ? 'radial-gradient(circle,rgba(34,197,94,.16) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(0,212,255,.14) 0%,transparent 70%)', animation: 'glowPulse 3.5s ease-in-out infinite', transition: 'background 1s' }}/>
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
                {/* Orbital dots for each DB type */}
                {DB_TYPES.map(({ color }, i) => {
                    const angle = (i / DB_TYPES.length) * Math.PI * 2 - Math.PI / 2;
                    return <circle key={i} cx={C + R1 * Math.cos(angle)} cy={C + R1 * Math.sin(angle)} r={2.5} fill={color} opacity={.7} style={{ animation: `orbitPulse ${2 + i * .3}s ease-in-out infinite ${i * .2}s` }}/>;
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#0099CC,#00D4FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success ? '0 6px 24px rgba(34,197,94,.55), 0 0 0 1px rgba(255,255,255,.10) inset' : '0 6px 24px rgba(0,212,255,.45), 0 0 0 1px rgba(255,255,255,.10) inset',
                    transition: 'all .9s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success ? <CheckCircle size={17} color="#fff" style={{ animation: 'successPop .5s ease backwards' }}/> : <Shield size={17} color="#fff" strokeWidth={1.8}/>}
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px 5px 10px', borderRadius: 100, background: `${color}0D`, border: `1px solid ${color}28`, fontFamily: THEME.fontMono, fontSize: 9.5 }}>
            {chk
                ? <><Loader size={9} color="#334155" style={{ animation: 'spin 1s linear infinite' }}/><span style={{ color: '#334155', letterSpacing: '.05em' }}>CHECKING...</span></>
                : <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: on ? 'pulseDot 2.2s ease-in-out infinite' : 'none' }}/>
                        {on && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}70`, animation: 'ringOut 2.2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '.08em' }}>{label}</span>
                    {status.latency != null && <span style={{ color: THEME.textMuted, fontSize: 8.5, padding: '1px 6px', borderRadius: 4, background: THEME.surfaceHover, border: `1px solid ${THEME.grid}` }}>{status.latency}ms</span>}
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
            <label style={{ display: 'block', marginBottom: 5, fontSize: 9, fontWeight: 600, color: focused ? '#00D4FF' : THEME.textMuted, textTransform: 'uppercase', letterSpacing: '1.6px', fontFamily: THEME.fontMono, transition: 'color .2s' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: focused ? 'rgba(0,212,255,.06)' : THEME.surface, border: `1px solid ${focused ? 'rgba(0,212,255,.50)' : THEME.grid}`, borderRadius: 10, padding: '0 12px', transition: 'all .25s', boxShadow: focused ? '0 0 0 4px rgba(0,212,255,.09)' : 'none' }}>
                <Icon size={14} color={focused ? '#00D4FF' : hasVal ? THEME.textMuted : THEME.textDim} style={{ flexShrink: 0, transition: 'color .2s' }}/>
                <input ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="vi-input" style={{ flex: 1, padding: '9px 0', background: 'none', border: 'none', color: THEME.textMain, fontSize: 13, outline: 'none', fontFamily: THEME.fontBody, fontWeight: 400, opacity: disabled ? .4 : 1 }}/>
                {rightEl}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  CORNER ACCENTS
// ─────────────────────────────────────────────────────────────────────────────
const Corners = ({ color = 'rgba(0,212,255,.18)' }) => (
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
//  DATABASE TYPE CHIPS — visual connector strip
// ─────────────────────────────────────────────────────────────────────────────
const DbTypeChips = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        {DB_TYPES.map(({ key, shortLabel, label, color, icon }, i) => (
            <div key={key} className="db-chip" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 8,
                background: `${color}0D`,
                border: `1px solid ${color}25`,
                cursor: 'default',
                animation: `dbSlide .5s ease ${.1 + i * .06}s backwards`,
            }}>
                <span style={{ fontSize: 11 }}>{icon}</span>
                <span style={{ fontFamily: THEME.fontMono, fontSize: 8.5, fontWeight: 600, color, letterSpacing: '.5px', textTransform: 'uppercase' }}>{shortLabel}</span>
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
    useAdaptiveTheme();
    const { isDark, toggleTheme } = useTheme();
    const { login, loginWithSSO, authLoading, error, clearError } = useAuth();
    const [username,     setUsername]     = useState('');
    const [password,     setPassword]     = useState('');
    const [showPwd,      setShowPwd]      = useState(false);
    const [rememberMe,   setRememberMe]   = useState(false);
    const [serverStatus, setServerStatus] = useState({ status: 'checking' });
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
        try { localStorage.removeItem('pg_monitor_active_tab'); } catch {}
        await login(username, password);
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading;

    const btnGrad      = canSubmit ? 'linear-gradient(135deg, #0099CC 0%, #00B4D8 50%, #00D4FF 100%)' : THEME.surfaceHover;
    const btnTextColor = canSubmit ? 'white' : THEME.textMuted;

    const btnShadow = canSubmit && !authLoading
        ? btnHover ? '0 14px 42px rgba(0,212,255,.55), 0 0 0 1px rgba(0,212,255,.38) inset, 0 1px 0 rgba(255,255,255,.16) inset' : '0 8px 28px rgba(0,212,255,.32), 0 0 0 1px rgba(0,212,255,.24) inset'
        : 'none';

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: THEME.bg, fontFamily: THEME.fontBody, overflow: 'hidden' }}>
            <GlobalStyles/>
            <LeftPanel/>

            <div style={{ width: 480, flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '16px 40px', background: THEME.surfaceHover }}>
                {/* Background effects */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-5%', right: '-25%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(0,212,255,.065) 0%, transparent 65%)', filter: 'blur(52px)', animation: 'aurora 14s ease-in-out infinite' }}/>
                    <div style={{ position: 'absolute', bottom: '-5%', left: '-20%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(46,232,156,.052) 0%, transparent 65%)', filter: 'blur(42px)', animation: 'aurora 10s ease-in-out infinite reverse' }}/>
                    <div style={{ position: 'absolute', inset: 0, opacity: .008, backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }}/>
                </div>

                {/* Top edge glow */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,.45) 25%, rgba(46,232,156,.80) 50%, rgba(0,212,255,.45) 75%, transparent)', opacity: .85, animation: 'edgePulse 4s ease-in-out infinite' }}/>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,.08) 30%, rgba(0,212,255,.13) 50%, rgba(0,212,255,.08) 70%, transparent)' }}/>

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 385, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: 6, animation: 'fadeUp .7s ease .1s backwards' }}>
                        <LogoEmblem success={false}/>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 2, animation: 'fadeUp .7s ease .18s backwards', width: '100%' }}>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: THEME.textMain, margin: 0, lineHeight: 1.1, letterSpacing: '-.06em', fontFamily: "'Playfair Display',serif" }}>Welcome back</h1>
                        <p style={{ color: THEME.textMuted, margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.55, fontFamily: THEME.fontBody, fontWeight: 300 }}>Sign in to your database command center</p>
                    </div>

                    {/* Database chips */}
                    <div style={{ margin: '7px 0 5px', animation: 'fadeUp .7s ease .22s backwards' }}>
                        <DbTypeChips/>
                    </div>

                    <div style={{ margin: '2px 0 8px', display: 'flex', alignItems: 'center', gap: 12, width: '100%', animation: 'fadeUp .7s ease .24s backwards' }}>
                        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${THEME.grid})` }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${THEME.grid})` }}/>
                    </div>

                    {/* Login card */}
                    <div style={{ width: '100%', padding: '16px 22px 12px', borderRadius: 18, background: THEME.surface, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: `1px solid ${error ? 'rgba(239,68,68,.20)' : THEME.glassBorder}`, boxShadow: THEME.shadowMd, transition: 'border-color .3s', animation: shake ? 'shake .5s ease' : 'borderGlow 5s ease-in-out infinite, fadeUp .7s ease .32s backwards', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: '6%', right: '6%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,.42), transparent)', animation: 'edgePulse 3.5s ease-in-out infinite' }}/>
                        <Corners color='rgba(0,212,255,.16)'/>

                        {error && (
                            <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 11, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.20)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown .3s ease backwards' }}>
                                <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }}/>
                                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, fontFamily: THEME.fontBody }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading}/>
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading}
                                        rightEl={
                                            <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 4, display: 'flex', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00D4FF'} onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}>
                                                {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                                            </button>
                                        }
                            />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${rememberMe ? '#00D4FF' : THEME.grid}`, background: rememberMe ? '#00D4FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s cubic-bezier(.34,1.56,.64,1)', boxShadow: rememberMe ? '0 0 12px rgba(0,212,255,.45)' : 'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize: 12, color: THEME.textMuted, fontFamily: THEME.fontBody }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: THEME.textMuted, fontFamily: THEME.fontBody, padding: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00D4FF'} onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={!canSubmit} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                                    style={{ position: 'relative', overflow: 'hidden', background: btnGrad, border: canSubmit ? '1px solid rgba(0,212,255,.32)' : `1px solid ${THEME.grid}`, padding: '12px 20px', borderRadius: 12, color: btnTextColor, fontWeight: 600, fontSize: 14, fontFamily: THEME.fontBody, letterSpacing: '.01em', cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'all .3s cubic-bezier(.4,0,.2,1)', boxShadow: btnShadow, transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)' }}>
                                {canSubmit && !authLoading && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.07) 50%, transparent 60%)', backgroundSize: '200% auto', animation: btnHover ? 'shimmer 1.2s ease forwards' : 'none', borderRadius: 13 }}/>
                                )}
                                <span style={{ position: 'relative' }}>
                                    {authLoading
                                        ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: 8 }}/>Authenticating...</>
                                        : <>Sign In&nbsp;<ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', transition: 'transform .25s', transform: btnHover ? 'translateX(4px)' : 'translateX(0)' }}/></>
                                    }
                                </span>
                            </button>

                            {/* SSO */}
                            <div style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}>
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                                <span style={{ padding: '0 10px', fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, textTransform: 'uppercase' }}>or</span>
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                            </div>

                            <button type="button"
                                    onClick={() => loginWithSSO('okta')}
                                    style={{
                                        width: '100%', padding: '10px 20px', borderRadius: 12,
                                        background: THEME.surface, border: `1px solid ${THEME.grid}`,
                                        color: THEME.textMain, fontWeight: 600, fontSize: 13, fontFamily: THEME.fontBody,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        cursor: 'pointer', transition: 'all .2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = THEME.surfaceHover; e.currentTarget.style.borderColor = 'rgba(0,212,255,.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = THEME.surface; e.currentTarget.style.borderColor = THEME.grid; }}
                            >
                                <Shield size={16} color="#00D4FF"/> Continue with SSO
                            </button>
                        </form>

                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${THEME.grid}`, textAlign: 'center' }}>
                            <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '.04em', lineHeight: 1.5, display: 'block' }}>
                                Enterprise SSO enabled &middot; Contact IT for access provisioning
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'fadeUp .7s ease .65s backwards' }}>
                        <Lock size={9} color={THEME.textMuted}/>
                        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '.04em' }}>TLS 1.3 encrypted &middot; v3.0</span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    style={{
                        position: 'absolute',
                        bottom: 24,
                        left: 24,
                        zIndex: 10,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: THEME.textMuted,
                        transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                        boxShadow: THEME.shadowSm,
                        outline: 'none',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = THEME.surfaceHover;
                        e.currentTarget.style.borderColor = THEME.primary + '55';
                        e.currentTarget.style.color = THEME.primary;
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = `${THEME.shadowSm}, 0 0 0 3px ${THEME.primary}18`;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = THEME.surface;
                        e.currentTarget.style.borderColor = THEME.glassBorder;
                        e.currentTarget.style.color = THEME.textMuted;
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = THEME.shadowSm;
                    }}
                >
                    {isDark
                        ? <Sun size={15} strokeWidth={1.8}/>
                        : <Moon size={15} strokeWidth={1.8}/>
                    }
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
