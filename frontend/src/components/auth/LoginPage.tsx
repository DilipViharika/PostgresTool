// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Activity, Zap, HardDrive, Lock,
    Search, RefreshCw, Cloud, Terminal, Users, Sun, Moon,
    Server, Cpu, Brain, Globe, Fingerprint, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface DBType {
    key: 'postgresql' | 'mysql' | 'mongodb';
    label: string;
    color: string;
    icon: string;
    shortLabel: string;
}

interface NodeDef {
    label: string;
    sub: string;
    color: string;
    icon: string;
    r: number;
}

interface FeatureStat {
    val: string;
    desc: string;
    color: string;
}

interface ServerStatus {
    status: 'online' | 'offline' | 'checking' | 'degraded';
    latency?: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

const DB_TYPES: DBType[] = [
    { key: 'postgresql', label: 'PostgreSQL', color: '#6495ED', icon: '🐘', shortLabel: 'PG' },
    { key: 'mysql',      label: 'MySQL',      color: '#00B4D8', icon: '🐬', shortLabel: 'MY' },
    { key: 'mongodb',    label: 'MongoDB',     color: '#2EE89C', icon: '🍃', shortLabel: 'MG' },
];

const NODE_DEFS: Record<string, NodeDef> = {
    primary: { label: 'VIGIL',        sub: 'Core Engine',    color: '#00D4FF', icon: 'Activity',  r: 18 },
    hub0:    { label: 'PostgreSQL',   sub: 'RDBMS',          color: '#6495ED', icon: 'Database',  r: 11 },
    hub1:    { label: 'MySQL',        sub: 'RDBMS',          color: '#00B4D8', icon: 'Server',    r: 11 },
    hub2:    { label: 'MongoDB',      sub: 'NoSQL',          color: '#2EE89C', icon: 'Cloud',     r: 11 },
    hub3:    { label: 'AI Engine',    sub: 'Intelligence',   color: '#A78BFA', icon: 'Brain',     r: 10 },
};

const ICON_MAP: Record<string, React.ComponentType> = {
    Database, Activity, Zap, HardDrive, Lock, Cloud, Terminal, Search, RefreshCw, Users, Server, Cpu, Brain, Globe
};

const PALETTE = [
    { h: 190, s: 100, l: 55 },
    { h: 220, s: 80,  l: 66 },
    { h: 192, s: 100, l: 46 },
    { h: 157, s: 100, l: 58 },
    { h: 264, s: 80,  l: 72 },
    { h: 200, s: 100, l: 65 },
    { h: 320, s: 70,  l: 68 },
    { h:  20, s: 90,  l: 68 },
];

const hsl = (c: { h: number; s: number; l: number }, a: number): string =>
    `hsla(${c.h},${c.s}%,${c.l}%,${a})`;

const FEATURE_STATS: FeatureStat[] = [
    { val: '3',    desc: 'DB Engines',   color: '#00D4FF' },
    { val: '203',  desc: 'Metrics',      color: '#2EE89C' },
    { val: '42',   desc: 'Dashboards',   color: '#A78BFA' },
    { val: 'AI',   desc: 'Powered',      color: '#fbbf24' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles: React.FC = () => (
    <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }

        @keyframes fadeUp       { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
        @keyframes slideDown    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake        { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(2px)} }
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes spinRev      { to{transform:rotate(-360deg)} }
        @keyframes pulseDot     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.75)} }
        @keyframes ringOut      { 0%{transform:scale(.7);opacity:.8} 100%{transform:scale(3);opacity:0} }
        @keyframes successPop   { 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes floatUp      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glowPulse    { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes edgePulse    { 0%,100%{opacity:.2} 50%{opacity:.85} }
        @keyframes labelIn      { from{opacity:0;transform:translate(-50%,8px) scale(.85)} to{opacity:1;transform:translate(-50%,0) scale(1)} }
        @keyframes aurora       { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(3%,2%) scale(1.04)} 66%{transform:translate(-2%,1%) scale(.97)} }
        @keyframes shimmer      { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes borderRotate { 0%{--angle:0deg} 100%{--angle:360deg} }
        @keyframes dotBlink     { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes orbitPulse   { 0%,100%{opacity:.35;transform:scale(.92)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes dbSlide      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardGlow     { 0%,100%{box-shadow:0 0 0 1px rgba(0,212,255,.10),0 28px 72px rgba(0,0,0,.6)} 50%{box-shadow:0 0 0 1px rgba(0,212,255,.25),0 28px 72px rgba(0,0,0,.6),0 0 48px rgba(0,212,255,.05)} }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes meshFloat    { 0%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(20px,-15px) rotate(120deg)} 66%{transform:translate(-10px,20px) rotate(240deg)} 100%{transform:translate(0,0) rotate(360deg)} }
        @keyframes pulseRing    { 0%{transform:scale(1);opacity:.4} 50%{transform:scale(1.08);opacity:.8} 100%{transform:scale(1);opacity:.4} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }

        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
            -webkit-box-shadow:0 0 0 1000px ${THEME.surface} inset !important;
            -webkit-text-fill-color:${THEME.textMain} !important;
            caret-color:${THEME.textMain};
            transition:background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:${THEME.textDim}; opacity:1; }
        .vi-input:focus::placeholder { opacity:.4; transition:opacity .3s; }
        .stat-pill { transition:all .3s cubic-bezier(.4,0,.2,1); }
        .stat-pill:hover { background:rgba(0,212,255,.14) !important; border-color:rgba(0,212,255,.32) !important; transform:translateY(-2px); }
        .db-chip { transition:all .3s cubic-bezier(.4,0,.2,1); }
        .db-chip:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 12px 28px rgba(0,0,0,.45) !important; }
        .sso-btn { transition:all .3s cubic-bezier(.4,0,.2,1) !important; }
        .sso-btn:hover { background:${THEME.surfaceHover} !important; border-color:rgba(0,212,255,.35) !important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,.3) !important; }
        .vi-input-wrap { transition:all .3s cubic-bezier(.4,0,.2,1); }
        .vi-input-wrap:focus-within { border-color:rgba(56,189,248,.55) !important; box-shadow:0 0 0 3px rgba(56,189,248,0.12), 0 0 16px rgba(56,189,248,0.06) !important; background:rgba(56,189,248,.06) !important; }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS HOOK — Network graph visualization
// ─────────────────────────────────────────────────────────────────────────────
interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    ci: number;
    role: string;
    phase: number;
    pulse: number;
    key?: string | null;
    maxY?: number;
}

interface Edge {
    a: number;
    b: number;
    s: number;
}

interface Packet {
    edge: Edge;
    t: number;
    sp: number;
    rev: boolean;
}

interface LabelPos {
    x: number;
    y: number;
    key?: string | null;
    ci: number;
    r: number;
    role: string;
}

function useNetworkCanvas(canvasRef: React.RefObject<HTMLCanvasElement>): LabelPos[] {
    const nodesRef = useRef<Node[]>([]);
    const edgesRef = useRef<Edge[]>([]);
    const mouseRef = useRef({ x: -999, y: -999 });
    const packetsRef = useRef<Packet[]>([]);
    const animRef = useRef<number | null>(null);
    const [labelPos, setLabelPos] = useState<LabelPos[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function buildGraph(W: number, H: number): void {
            const nodes: Node[] = [], edges: Edge[] = [];
            const NET_H = H * 0.62;

            nodes.push({ x: W * 0.44, y: NET_H * 0.50, vx: 0, vy: 0, r: NODE_DEFS.primary.r, ci: 0, role: 'primary', phase: 0, pulse: 0, key: 'primary' });

            const hubPos = [
                { x: 0.18, y: 0.18, key: 'hub0' },
                { x: 0.68, y: 0.12, key: 'hub1' },
                { x: 0.82, y: 0.48, key: 'hub2' },
                { x: 0.20, y: 0.80, key: 'hub3' },
            ];
            hubPos.forEach(({ x, y, key }, i) => {
                const nodeDef = NODE_DEFS[key];
                nodes.push({
                    x: W * x + (Math.random() - .5) * 14,
                    y: NET_H * y + (Math.random() - .5) * 14,
                    vx: (Math.random() - .5) * .09, vy: (Math.random() - .5) * .09,
                    r: nodeDef.r, ci: i + 1, role: 'hub',
                    phase: Math.random() * Math.PI * 2, pulse: 0, key,
                    maxY: NET_H,
                });
            });

            for (let i = 0; i < 28; i++) {
                const ci = 5 + Math.floor(Math.random() * 3);
                nodes.push({
                    x: W * (.05 + Math.random() * .90),
                    y: NET_H * (.04 + Math.random() * .92),
                    vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
                    r: 1.2 + Math.random() * 2.4, ci: Math.min(ci, PALETTE.length - 1),
                    role: 'micro', phase: Math.random() * Math.PI * 2, pulse: 0, key: null,
                    maxY: NET_H,
                });
            }

            for (let i = 1; i <= 4; i++) edges.push({ a: 0, b: i, s: 1.0 });
            [[1,2],[2,3],[3,4],[4,1],[1,3],[2,4]].forEach(([a, b]) => edges.push({ a, b, s: 0.4 }));
            for (let i = 5; i < nodes.length; i++) {
                let best = 0, bestD = Infinity;
                for (let j = 0; j <= 4; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < bestD) { bestD = d; best = j; }
                }
                edges.push({ a: best, b: i, s: 0.20 });
            }
            for (let i = 5; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    if (Math.sqrt(dx * dx + dy * dy) < 120 && Math.random() > .55)
                        edges.push({ a: i, b: j, s: 0.10 });
                }
            }

            nodesRef.current = nodes;
            edgesRef.current = edges;
            packetsRef.current = [];
        }

        function spawn(): void {
            const e = edgesRef.current;
            if (!e.length) return;
            const edge = e[Math.floor(Math.random() * e.length)];
            packetsRef.current.push({ edge, t: 0, sp: .003 + Math.random() * .006, rev: Math.random() > .5 });
        }

        function resize(): void {
            const r = canvas.parentElement?.getBoundingClientRect();
            if (r) { canvas.width = r.width; canvas.height = r.height; buildGraph(canvas.width, canvas.height); }
        }

        let frame = 0;
        function draw(): void {
            const W = canvas.width, H = canvas.height;
            const nodes = nodesRef.current, edges = edgesRef.current, pkts = packetsRef.current;
            ctx.clearRect(0, 0, W, H);

            nodes.forEach(n => {
                if (n.role === 'primary') return;
                n.phase += .005;
                n.x += n.vx + Math.sin(n.phase * .55) * .02;
                n.y += n.vy + Math.cos(n.phase * .40) * .02;
                const pad = 28;
                const yMax = n.maxY || H * .62;
                if (n.x < pad) n.vx += .05; if (n.x > W - pad) n.vx -= .05;
                if (n.y < pad) n.vy += .05; if (n.y > yMax) n.vy -= .06;
                n.vx *= .993; n.vy *= .993;
                n.vx = Math.max(-.38, Math.min(.38, n.vx));
                n.vy = Math.max(-.38, Math.min(.38, n.vy));
                const dx = n.x - mouseRef.current.x, dy = n.y - mouseRef.current.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120 && d > 0) { const f = (1 - d / 120) * .22; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
            });

            edges.forEach(e => {
                const a = nodes[e.a], b = nodes[e.b];
                const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
                const alpha = e.s * .14 * Math.max(0, 1 - dist / 500);
                if (alpha < .004) return;
                const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                g.addColorStop(0, hsl(PALETTE[a.ci], alpha));
                g.addColorStop(1, hsl(PALETTE[b.ci], alpha));
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = g; ctx.lineWidth = e.s * .6; ctx.stroke();
            });

            for (let pi = pkts.length - 1; pi >= 0; pi--) {
                const pk = pkts[pi]; pk.t += pk.sp;
                if (pk.t >= 1) { pkts.splice(pi, 1); continue; }
                const a = nodes[pk.edge.a], b = nodes[pk.edge.b];
                const t = pk.rev ? 1 - pk.t : pk.t;
                const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
                const gg = ctx.createRadialGradient(x, y, 0, x, y, 10);
                gg.addColorStop(0, hsl(PALETTE[a.ci], .30)); gg.addColorStop(1, hsl(PALETTE[a.ci], 0));
                ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
                ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = hsl(PALETTE[a.ci], .95); ctx.fill();
            }

            nodes.forEach(n => {
                n.phase += .006;
                const rr = n.r * (Math.sin(n.phase) * .10 + 1);
                const pal = PALETTE[n.ci];
                if (n.role !== 'micro') {
                    const gr = rr + (n.role === 'primary' ? 48 : 30);
                    const gg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
                    gg.addColorStop(0, hsl(pal, n.role === 'primary' ? .22 : .12)); gg.addColorStop(1, hsl(pal, 0));
                    ctx.beginPath(); ctx.arc(n.x, n.y, gr, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
                    ctx.beginPath(); ctx.arc(n.x, n.y, rr + 7, 0, Math.PI * 2);
                    ctx.strokeStyle = hsl(pal, .18); ctx.lineWidth = .8; ctx.stroke();
                }
                const fc = ctx.createRadialGradient(n.x - rr * .3, n.y - rr * .3, 0, n.x, n.y, rr);
                fc.addColorStop(0, hsl({ ...pal, l: Math.min(96, pal.l + 26) }, 1));
                fc.addColorStop(1, hsl(pal, .85));
                ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, Math.PI * 2); ctx.fillStyle = fc; ctx.fill();

                if (n.role === 'primary') {
                    n.pulse = (n.pulse + .007) % 1;
                    [n.pulse, (n.pulse + .5) % 1].forEach((p, i) => {
                        ctx.beginPath(); ctx.arc(n.x, n.y, rr + 16 + p * 48, 0, Math.PI * 2);
                        ctx.strokeStyle = hsl(pal, (1 - p) * (i === 0 ? .25 : .10));
                        ctx.lineWidth = i === 0 ? 1.2 : .8; ctx.stroke();
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

        const pktIv = setInterval(() => { if (packetsRef.current.length < 40) spawn(); }, 220);
        resize(); draw();

        const onResize = () => { if (animRef.current) cancelAnimationFrame(animRef.current); resize(); draw(); };
        const onMouse = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
        window.addEventListener('resize', onResize);
        canvas.parentElement?.addEventListener('mousemove', onMouse);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current); clearInterval(pktIv);
            window.removeEventListener('resize', onResize);
            canvas.parentElement?.removeEventListener('mousemove', onMouse);
        };
    }, [canvasRef]);

    return labelPos;
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE LABEL
// ─────────────────────────────────────────────────────────────────────────────
interface NodeLabelProps {
    x: number;
    y: number;
    nodeKey?: string | null;
    ci: number;
    r: number;
    role: string;
}

const NodeLabel = React.memo<NodeLabelProps>(({ x, y, nodeKey, ci, r, role }) => {
    const def = NODE_DEFS[nodeKey || 'primary'];
    if (!def) return null;
    const IconComp = ICON_MAP[def.icon];
    const color = def.color;
    const isPrimary = role === 'primary';
    const offset = r + (isPrimary ? 36 : 26);

    return (
        <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconComp && <IconComp size={isPrimary ? 15 : 10} color="#fff" strokeWidth={1.6}/>}
            </div>
            <div style={{ position: 'absolute', top: offset, left: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'labelIn .7s cubic-bezier(.34,1.3,.64,1) both', whiteSpace: 'nowrap' }}>
                <div style={{ width: 1, height: isPrimary ? 18 : 12, background: `linear-gradient(to bottom, transparent, ${color}60)` }}/>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: isPrimary ? 8 : 5,
                    background: 'rgba(4,6,15,.75)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}22`,
                    borderRadius: isPrimary ? 12 : 8,
                    padding: isPrimary ? '7px 14px' : '4px 9px',
                    boxShadow: `0 4px 24px rgba(0,0,0,.35), 0 0 0 1px ${color}08 inset`,
                }}>
                    <div style={{ width: isPrimary ? 8 : 5, height: isPrimary ? 8 : 5, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}BB`, flexShrink: 0 }}/>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontFamily: THEME.fontMono, fontSize: isPrimary ? 10 : 8, fontWeight: 700, color: '#f0f4ff', letterSpacing: '1.2px', textTransform: 'uppercase', lineHeight: 1 }}>
                            {def.label}
                        </span>
                        <span style={{ fontFamily: THEME.fontMono, fontSize: isPrimary ? 8 : 6.5, color: `${color}90`, letterSpacing: '.5px', lineHeight: 1 }}>
                            {def.sub}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel: React.FC = () => {
    useAdaptiveTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const labelPos = useNetworkCanvas(canvasRef);

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
                <div style={{ position: 'absolute', top: '-12%', left: '8%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,212,255,.08) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'aurora 14s ease-in-out infinite' }}/>
                <div style={{ position: 'absolute', top: '18%', right: '-8%', width: '48%', height: '52%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,232,156,.055) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'aurora 18s ease-in-out infinite reverse' }}/>
                <div style={{ position: 'absolute', bottom: '28%', left: '3%', width: '42%', height: '42%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,.045) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'aurora 12s ease-in-out infinite 3s' }}/>
            </div>

            {/* Subtle noise */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: .018,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}/>

            {/* Brand mark */}
            <div style={{ position: 'absolute', top: 28, left: 36, zIndex: 8, display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeUp .8s ease .05s backwards' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(145deg, #0088BB, #00D4FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.14) inset, 0 10px 32px rgba(0,212,255,.40), 0 0 0 6px rgba(0,212,255,.06)',
                    animation: 'floatUp 6s ease-in-out infinite',
                }}>
                    <Shield size={21} color="#fff" strokeWidth={1.6}/>
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, fontFamily: THEME.fontBody, letterSpacing: '-.3px', lineHeight: 1.1 }}>VIGIL</div>
                    <div style={{ fontSize: 8.5, color: 'rgba(0,212,255,.55)', fontFamily: THEME.fontMono, marginTop: 4, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Database Monitor</div>
                </div>
            </div>

            {/* Bottom gradient */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                pointerEvents: 'none', zIndex: 3,
                background: `linear-gradient(to top, ${THEME.bg} 0%, ${THEME.bg}F0 25%, ${THEME.bg}80 55%, transparent 100%)`,
            }}/>

            {/* Bottom content */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '38%', zIndex: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', gap: 14, padding: '0 56px',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    padding: '5px 16px 5px 11px',
                    background: 'rgba(0,212,255,.06)',
                    border: '1px solid rgba(0,212,255,.15)',
                    borderRadius: 100,
                    animation: 'fadeUp .8s ease .1s backwards',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 10px #00D4FF', display: 'inline-block', animation: 'dotBlink 2.5s ease-in-out infinite' }}/>
                    <span style={{ fontFamily: THEME.fontMono, fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: THEME.primary }}>
                        Universal Database Observatory
                    </span>
                </div>

                <div style={{ animation: 'fadeUp .85s ease .2s backwards' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px, 2.4vw, 38px)', fontWeight: 700, color: THEME.textMain, letterSpacing: '-0.5px' }}>
                        Every database,{'\u00A0'}
                    </span>
                    <span style={{
                        fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px, 2.4vw, 38px)',
                        fontWeight: 400, fontStyle: 'italic',
                        background: 'linear-gradient(90deg, #00D4FF, #2EE89C, #A78BFA, #00D4FF)',
                        backgroundSize: '300% auto',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        animation: 'gradientMove 6s linear infinite',
                    }}>
                        one command center.
                    </span>
                </div>

                <p style={{ fontSize: 12, fontWeight: 300, color: THEME.textMuted, lineHeight: 1.8, margin: 0, maxWidth: 540, fontFamily: THEME.fontBody, animation: 'fadeUp .85s ease .30s backwards' }}>
                    Real-time intelligence across PostgreSQL, MySQL, and MongoDB.
                    203 production metrics, AI anomaly detection, and end-to-end operations.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeUp .85s ease .38s backwards', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {FEATURE_STATS.map(({ val, desc, color }, i) => (
                        <React.Fragment key={desc}>
                            <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: `${color}09`, border: `1px solid ${color}18`, borderRadius: 10, cursor: 'default' }}>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 13, fontWeight: 700, color, letterSpacing: '-.3px' }}>{val}</span>
                                <span style={{ fontFamily: THEME.fontBody, fontSize: 10.5, color: THEME.textDim }}>{desc}</span>
                            </div>
                            {i < FEATURE_STATS.length - 1 && <div style={{ width: 1, height: 16, background: `${THEME.grid}60`, flexShrink: 0 }}/>}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, animation: 'fadeUp .85s ease .46s backwards' }}>
                    {DB_TYPES.map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: THEME.fontMono, fontSize: 9, letterSpacing: '.5px', color: THEME.textDim }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}AA`, flexShrink: 0 }}/>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGO EMBLEM
// ─────────────────────────────────────────────────────────────────────────────
interface LogoEmblemProps {
    success?: boolean;
}

const LogoEmblem: React.FC<LogoEmblemProps> = ({ success }) => {
    const S = 72, C = 36, R1 = 30, R2 = 22, R3 = 14;
    const c1 = success ? '#22c55e' : '#00D4FF', c2 = success ? '#22c55e' : '#2EE89C';
    return (
        <div style={{ position: 'relative', width: S, height: S, animation: 'floatUp 6s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: success ? 'radial-gradient(circle,rgba(34,197,94,.14) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(0,212,255,.12) 0%,transparent 70%)', animation: 'glowPulse 4s ease-in-out infinite', transition: 'background 1.2s' }}/>
            <svg width={S} height={S} style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={c1} stopOpacity=".70"/>
                        <stop offset="100%" stopColor={c2} stopOpacity=".15"/>
                    </linearGradient>
                </defs>
                <circle cx={C} cy={C} r={R1} fill="none" stroke="url(#rg1)" strokeWidth="1" strokeDasharray="4 3" style={{ transformOrigin: 'center', animation: 'spin 28s linear infinite' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.4" strokeDasharray={`${Math.PI*R2*.6} ${Math.PI*R2*.4}`} strokeLinecap="round" opacity=".55" style={{ transformOrigin: 'center', animation: 'spinRev 14s linear infinite' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth=".6" strokeDasharray="2 5" opacity=".18" style={{ transformOrigin: 'center', animation: 'spin 9s linear infinite' }}/>
                {DB_TYPES.map(({ color }, i) => {
                    const angle = (i / DB_TYPES.length) * Math.PI * 2 - Math.PI / 2;
                    return <circle key={i} cx={C + R1 * Math.cos(angle)} cy={C + R1 * Math.sin(angle)} r={3} fill={color} opacity={.65} style={{ animation: `orbitPulse ${2.2 + i * .4}s ease-in-out infinite ${i * .25}s` }}/>;
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: success ? 'linear-gradient(135deg,#22c55e,#14b8a6)' : 'linear-gradient(135deg,#0088BB,#00D4FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success ? '0 8px 28px rgba(34,197,94,.50), 0 0 0 1px rgba(255,255,255,.12) inset' : '0 8px 28px rgba(0,212,255,.40), 0 0 0 1px rgba(255,255,255,.12) inset',
                    transition: 'all 1s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success ? <CheckCircle size={18} color="#fff" style={{ animation: 'successPop .5s ease backwards'}}/> : <Shield size={18} color="#fff" strokeWidth={1.6}/>}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
interface ServerStatusProps {
    status: ServerStatus;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ status }) => {
    const on = status.status === 'online';
    const off = status.status === 'offline';
    const chk = status.status === 'checking';
    const color = on ? '#22c55e' : off ? '#ef4444' : '#f59e0b';
    const label = on ? 'ONLINE' : off ? 'OFFLINE' : chk ? 'CHECKING' : 'DEGRADED';
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 11px', borderRadius: 100, background: `${color}0A`, border: `1px solid ${color}22`, fontFamily: THEME.fontMono, fontSize: 10, transition: 'all .3s cubic-bezier(.4,0,.2,1)', ...(on && { boxShadow: `0 0 16px ${color}40` }) }}>
            {chk
                ? <><Loader size={10} color={THEME.textDim} style={{ animation: 'spin 1s linear infinite' }}/><span style={{ color: THEME.textDim, letterSpacing: '.05em' }}>CHECKING...</span></>
                : <>
                    <div style={{ position: 'relative', width: 8, height: 8 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}`, animation: on ? 'pulseRing 2.2s ease-in-out infinite' : 'pulseDot 2.2s ease-in-out infinite' }}/>
                        {on && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1.5px solid ${color}70`, animation: 'pulseRing 2.2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '.08em' }}>{label}</span>
                    {status.latency != null && <span style={{ color: THEME.textMuted, fontSize: 9, padding: '2px 7px', borderRadius: 6, background: THEME.surfaceHover, border: `1px solid ${THEME.grid}50` }}>{status.latency}ms</span>}
                </>
            }
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
interface InputFieldProps {
    icon: React.ComponentType<any>;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    rightEl?: ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
    { icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    const accentColor = '#00D4FF';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
                fontSize: 10, fontWeight: 600,
                color: focused ? accentColor : THEME.textMuted,
                textTransform: 'uppercase', letterSpacing: '1.8px',
                fontFamily: THEME.fontMono,
                transition: 'color .25s',
            }}>{label}</label>
            <div className="vi-input-wrap" style={{
                display: 'flex', alignItems: 'center', gap: 11,
                background: THEME.surface,
                border: `1px solid ${THEME.grid}`,
                borderRadius: 12, padding: '0 14px',
                boxShadow: 'none',
            }}>
                <Icon size={15} color={focused ? accentColor : hasVal ? THEME.textMuted : THEME.textDim} style={{ flexShrink: 0, transition: 'color .25s' }}/>
                <input ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="vi-input" style={{
                    flex: 1, padding: '11px 0', background: 'none', border: 'none',
                    color: THEME.textMain, fontSize: 13.5, outline: 'none',
                    fontFamily: THEME.fontBody, fontWeight: 400, opacity: disabled ? .4 : 1,
                }}/>
                {rightEl}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// DB TYPE CHIPS
// ─────────────────────────────────────────────────────────────────────────────
const DbTypeChips: React.FC = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {DB_TYPES.map(({ key, shortLabel, color, icon }, i) => (
            <div key={key} className="db-chip" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 10,
                background: `${color}0B`,
                border: `1px solid ${color}20`,
                cursor: 'default',
                animation: `dbSlide .5s ease ${.12 + i * .07}s backwards`,
            }}>
                <span style={{ fontSize: 12 }}>{icon}</span>
                <span style={{ fontFamily: THEME.fontMono, fontSize: 9, fontWeight: 700, color, letterSpacing: '.8px', textTransform: 'uppercase' }}>{shortLabel}</span>
            </div>
        ))}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
const LoginPage: React.FC = () => {
    useAdaptiveTheme();
    const { isDark, toggleTheme } = useTheme();
    const { login, loginWithSSO, authLoading, error, clearError } = useAuth();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPwd, setShowPwd] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking' });
    const [shake, setShake] = useState<boolean>(false);
    const [btnHover, setBtnHover] = useState<boolean>(false);
    const userRef = useRef<HTMLInputElement>(null);
    const pwdRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        const check = async (): Promise<void> => {
            try {
                const t0 = performance.now();
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const d = await res.json();
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

    useEffect(() => { if (error && clearError) clearError(); }, [username, password]);

    const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else localStorage.removeItem('vigil_remembered_user');
        try { localStorage.removeItem('pg_monitor_active_tab'); } catch {}
        await login(username, password);
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading;

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: THEME.bg, fontFamily: THEME.fontBody, overflow: 'hidden' }}>
            <GlobalStyles/>
            <LeftPanel/>

            {/* RIGHT PANEL */}
            <div style={{ width: 500, flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '24px 48px', background: THEME.surfaceHover }}>
                {/* Background mesh with enhanced animated gradient */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-12%', right: '-25%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(56,189,248,.08) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'meshFloat 24s ease-in-out infinite' }}/>
                    <div style={{ position: 'absolute', bottom: '-10%', left: '-18%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(34,211,238,.06) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'meshFloat 20s ease-in-out infinite reverse' }}/>
                    <div style={{ position: 'absolute', top: '45%', right: '8%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(167,139,250,.05) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'meshFloat 26s ease-in-out infinite 2s' }}/>
                    <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(56,189,248,.04) 0%, transparent 65%)', filter: 'blur(65px)', animation: 'meshFloat 22s ease-in-out infinite 4s' }}/>
                    <div style={{ position: 'absolute', inset: 0, opacity: .012, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(56,189,248,.8) .5px, transparent 0)', backgroundSize: '40px 40px' }}/>
                </div>

                {/* Top edge glow - enhanced */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 2%, rgba(56,189,248,.6) 25%, rgba(34,211,238,.8) 50%, rgba(56,189,248,.6) 75%, transparent 98%)', opacity: .85, animation: 'edgePulse 5s ease-in-out infinite' }}/>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, rgba(56,189,248,.08) 30%, rgba(56,189,248,.12) 50%, rgba(56,189,248,.08) 70%, transparent)', opacity: 0.9 }}/>

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 390, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 8, animation: 'fadeUp .7s ease .1s backwards' }}>
                        <LogoEmblem success={false}/>
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 4, animation: 'fadeUp .7s ease .18s backwards', width: '100%' }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #38bdf8, #22d3ee, #06b6d4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.15, letterSpacing: '-.05em', fontFamily: "'Playfair Display',serif" }}>Welcome back</h1>
                        <p style={{ color: THEME.textMuted, margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, fontFamily: THEME.fontBody, fontWeight: 300 }}>Sign in to your database command center</p>
                    </div>

                    {/* Database chips */}
                    <div style={{ margin: '10px 0 6px', animation: 'fadeUp .7s ease .22s backwards' }}>
                        <DbTypeChips/>
                    </div>

                    {/* Server status divider */}
                    <div style={{ margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 14, width: '100%', animation: 'fadeUp .7s ease .24s backwards' }}>
                        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${THEME.grid})` }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${THEME.grid})` }}/>
                    </div>

                    {/* LOGIN CARD */}
                    <div style={{
                        width: '100%', padding: '20px 24px 16px',
                        borderRadius: 20,
                        background: THEME.surface,
                        backdropFilter: 'blur(24px) saturate(1.3)', WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                        border: `1px solid ${error ? 'rgba(239,68,68,.22)' : THEME.glassBorder}`,
                        boxShadow: '0 0 0 1px rgba(56,189,248,0.1), 0 28px 72px rgba(0,0,0,0.6), 0 0 48px rgba(56,189,248,0.04)',
                        transition: 'border-color .3s',
                        animation: shake ? 'shake .5s ease' : 'cardGlow 6s ease-in-out infinite, fadeUp .7s ease .32s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top accent bar */}
                        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,.38), rgba(46,232,156,.38), transparent)', animation: 'edgePulse 4s ease-in-out infinite' }}/>

                        {/* Corner accents */}
                        {[
                            { top: 0, left: 0, borderTop: '1px solid rgba(0,212,255,.16)', borderLeft: '1px solid rgba(0,212,255,.16)', borderRadius: '4px 0 0 0' },
                            { top: 0, right: 0, borderTop: '1px solid rgba(0,212,255,.16)', borderRight: '1px solid rgba(0,212,255,.16)', borderRadius: '0 4px 0 0' },
                            { bottom: 0, left: 0, borderBottom: '1px solid rgba(0,212,255,.16)', borderLeft: '1px solid rgba(0,212,255,.16)', borderRadius: '0 0 0 4px' },
                            { bottom: 0, right: 0, borderBottom: '1px solid rgba(0,212,255,.16)', borderRight: '1px solid rgba(0,212,255,.16)', borderRadius: '0 0 4px 0' },
                        ].map(({ borderRadius: br, ...s }, i) => (
                            <div key={i} style={{ position: 'absolute', width: 18, height: 18, pointerEvents: 'none', borderRadius: br, ...s as any }}/>
                        ))}

                        {/* Error banner */}
                        {error && (
                            <div style={{ marginBottom: 16, padding: '11px 15px', borderRadius: 12, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown .3s ease backwards' }}>
                                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }}/>
                                <span style={{ color: '#ef4444', fontSize: 12.5, fontWeight: 500, fontFamily: THEME.fontBody }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading}/>
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading}
                                        rightEl={
                                            <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 5, display: 'flex', borderRadius: 6, transition: 'all .2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00D4FF'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,.08)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = THEME.textDim; (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                                                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                                            </button>
                                        }
                            />

                            {/* Remember + Forgot */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 2px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{
                                        width: 17, height: 17, borderRadius: 6, flexShrink: 0,
                                        border: `1.5px solid ${rememberMe ? '#00D4FF' : THEME.grid}`,
                                        background: rememberMe ? '#00D4FF' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all .3s cubic-bezier(.34,1.56,.64,1)',
                                        boxShadow: rememberMe ? '0 0 14px rgba(0,212,255,.40)' : 'none',
                                    }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize: 12.5, color: THEME.textMuted, fontFamily: THEME.fontBody }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: THEME.textMuted, fontFamily: THEME.fontBody, padding: 0, transition: 'color .25s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#00D4FF'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = THEME.textMuted}>
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign in button */}
                            <button type="submit" disabled={!canSubmit} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                                    style={{
                                        position: 'relative', overflow: 'hidden',
                                        background: canSubmit ? 'linear-gradient(135deg, #38bdf8, #22d3ee)' : THEME.surfaceHover,
                                        border: canSubmit ? '1px solid rgba(0,212,255,.28)' : `1px solid ${THEME.grid}`,
                                        padding: '13px 20px', borderRadius: 14,
                                        color: canSubmit ? '#fff' : THEME.textMuted,
                                        fontWeight: 700, fontSize: 14, fontFamily: THEME.fontBody, letterSpacing: '0.03em',
                                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        transition: 'all .35s cubic-bezier(.4,0,.2,1)',
                                        boxShadow: canSubmit && !authLoading
                                            ? btnHover
                                                ? '0 16px 48px rgba(0,180,216,.60), 0 0 0 1px rgba(0,212,255,.40) inset, 0 2px 8px rgba(255,255,255,.20) inset'
                                                : '0 10px 32px rgba(0,180,216,.40), 0 0 0 1px rgba(0,212,255,.25) inset'
                                            : 'none',
                                        transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)',
                                    }}>
                                {canSubmit && !authLoading && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,.10) 50%, transparent 62%)', backgroundSize: '200% auto', animation: btnHover ? 'shimmer 1s ease forwards' : 'none', borderRadius: 14 }}/>
                                )}
                                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {authLoading
                                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }}/>Authenticating...</>
                                        : <>Sign In <ArrowRight size={15} style={{ transition: 'transform .3s', transform: btnHover ? 'translateX(4px)' : 'translateX(0)' }}/></>
                                    }
                                </span>
                            </button>

                            {/* SSO divider */}
                            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                                <span style={{ padding: '0 12px', fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                            </div>

                            {/* SSO button */}
                            <button type="button" className="sso-btn"
                                    onClick={() => loginWithSSO('okta')}
                                    style={{
                                        width: '100%', padding: '11px 20px', borderRadius: 14,
                                        background: THEME.surface, border: `1px solid ${THEME.grid}`,
                                        color: THEME.textMain, fontWeight: 600, fontSize: 13.5, fontFamily: THEME.fontBody,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                                    }}
                            >
                                <Fingerprint size={16} color="#00D4FF"/> Continue with SSO
                            </button>
                        </form>

                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${THEME.grid}40`, textAlign: 'center' }}>
                            <span style={{ fontSize: 10.5, color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '.04em', lineHeight: 1.6, display: 'block' }}>
                                Enterprise SSO enabled &middot; Contact IT for access
                            </span>
                        </div>
                    </div>

                    {/* Security badge */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, animation: 'fadeUp .7s ease .65s backwards' }}>
                        <Lock size={10} color={THEME.textMuted}/>
                        <span style={{ fontSize: 10.5, color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '.04em' }}>TLS 1.3 encrypted &middot; v3.0</span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    style={{
                        position: 'absolute', bottom: 24, left: 24, zIndex: 10,
                        width: 38, height: 38, borderRadius: '50%',
                        background: THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: THEME.textMuted,
                        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
                        outline: 'none',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = THEME.surfaceHover;
                        (e.currentTarget as HTMLElement).style.borderColor = THEME.primary + '55';
                        (e.currentTarget as HTMLElement).style.color = THEME.primary;
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1) rotate(12deg)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px rgba(0,0,0,.3), 0 0 0 3px ${THEME.primary}15`;
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = THEME.surface;
                        (e.currentTarget as HTMLElement).style.borderColor = THEME.glassBorder;
                        (e.currentTarget as HTMLElement).style.color = THEME.textMuted;
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.25)';
                    }}
                >
                    {isDark ? <Sun size={16} strokeWidth={1.6}/> : <Moon size={16} strokeWidth={1.6}/>}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
