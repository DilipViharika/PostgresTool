// ==========================================================================
//  VIGIL — Login Page  (v5.0 — Cinematic Overdrive)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Activity, Shield, Lock,
    Bell, RefreshCw, Search, TrendingUp,
    Zap, Server, Cpu, GitBranch, Radio, Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Theme ──────────────────────────────────────────────────────────────────
const THEME = {
    bg:        '#04080f',
    primary:   '#0ea5e9',
    secondary: '#38bdf8',
    success:   '#22c55e',
    danger:    '#ef4444',
    warning:   '#f59e0b',
    teal:      '#14b8a6',
    textMain:  '#F1F5F9',
    textMuted: '#64748b',
    textDim:   '#334155',
};

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp      { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
        @keyframes slideDown   { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake       { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-9px) rotate(-.5deg)} 30%{transform:translateX(7px) rotate(.3deg)} 45%{transform:translateX(-5px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-1px)} }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes spinRev     { to { transform: rotate(-360deg); } }
        @keyframes pulseRing   { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
        @keyframes pulseDot    { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes orb1        { 0%,100%{transform:translate(0,0) scale(1);opacity:.6} 33%{transform:translate(40px,-60px) scale(1.12);opacity:.85} 66%{transform:translate(-25px,-25px) scale(.93);opacity:.5} }
        @keyframes orb2        { 0%,100%{transform:translate(0,0) scale(1);opacity:.45} 50%{transform:translate(-50px,40px) scale(1.15);opacity:.7} }
        @keyframes orb3        { 0%,100%{transform:translate(0,0);opacity:.3} 40%{transform:translate(20px,-30px);opacity:.5} 80%{transform:translate(-10px,15px);opacity:.25} }
        @keyframes logoPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.045)} }
        @keyframes logoGlow    { 0%,100%{box-shadow:0 0 25px rgba(14,165,233,0.25),0 0 70px rgba(14,165,233,0.08)} 50%{box-shadow:0 0 40px rgba(14,165,233,0.4),0 0 100px rgba(14,165,233,0.12)} }
        @keyframes successPop  { 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.2) rotate(0deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes successRipple{ 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(3.5);opacity:0} }
        @keyframes scanline    { 0%{top:-2px;opacity:0} 5%{opacity:.8} 95%{opacity:.8} 100%{top:100%;opacity:0} }
        @keyframes borderPulse { 0%,100%{opacity:.25} 50%{opacity:.9} }
        @keyframes gridDrift   { from{transform:translate(0,0)} to{transform:translate(60px,60px)} }
        @keyframes nodePulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes metricTick  { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes consoleScroll { from{transform:translateY(0)} to{transform:translateY(-50%)} }
        @keyframes shimmer     { 0%{left:-100%} 100%{left:200%} }
        @keyframes termBlink   { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
        @keyframes glitchH     {
            0%,88%,100%  { clip-path:none; transform:none; }
            90%  { clip-path:inset(30% 0 55% 0); transform:translateX(-3px); }
            92%  { clip-path:inset(70% 0 5% 0);  transform:translateX(3px);  }
            94%  { clip-path:inset(15% 0 75% 0); transform:translateX(-2px); }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #04080f inset !important;
            -webkit-text-fill-color: #F1F5F9 !important;
            caret-color: #F1F5F9;
            transition: background-color 5000s ease-in-out 0s;
        }
        .v-input::placeholder { color: #334155; opacity: 1; }
        .v-input:focus::placeholder { color: transparent; }
        .v-no-scroll::-webkit-scrollbar { display: none; }
        .v-no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .v-btn-shine::after {
            content: '';
            position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
            animation: shimmer 2.8s ease infinite;
            pointer-events: none;
        }
    `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
//  PARTICLE CANVAS
// ═══════════════════════════════════════════════════════════════════════════

const ParticleCanvas = ({ width, height }) => {
    const canvasRef = useRef(null);
    const animRef   = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width  = width;
        canvas.height = height;

        const particles = Array.from({ length: 55 }, () => ({
            x:     Math.random() * width,
            y:     Math.random() * height,
            vx:    (Math.random() - 0.5) * 0.35,
            vy:    (Math.random() - 0.5) * 0.35,
            r:     Math.random() * 1.6 + 0.3,
            alpha: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
                if (p.x < 0) p.x = width;  if (p.x > width)  p.x = 0;
                if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
                const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse));
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(14,165,233,${a})`;
                ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x;
                    const dy   = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(14,165,233,${0.12 * (1 - dist / 100)})`;
                        ctx.lineWidth   = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, [width, height]);

    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />;
};

// ═══════════════════════════════════════════════════════════════════════════
//  LIVE METRICS HOOK
// ═══════════════════════════════════════════════════════════════════════════

const useLiveMetrics = () => {
    const [metrics, setMetrics] = useState({
        qps: 2847, latency: 1.2, cacheHit: 98.4, connections: 142,
        replication: 0.012, txps: 1923, bufferHit: 99.1,
    });
    useEffect(() => {
        const iv = setInterval(() => {
            setMetrics(m => ({
                qps:         Math.max(1000, m.qps + Math.round((Math.random() - 0.5) * 180)),
                latency:     Math.max(0.5, parseFloat((m.latency + (Math.random() - 0.5) * 0.15).toFixed(2))),
                cacheHit:    Math.min(99.9, Math.max(95, parseFloat((m.cacheHit + (Math.random() - 0.5) * 0.3).toFixed(1)))),
                connections: Math.max(80, m.connections + Math.round((Math.random() - 0.5) * 12)),
                replication: parseFloat((Math.random() * 0.04).toFixed(3)),
                txps:        Math.max(800, m.txps + Math.round((Math.random() - 0.5) * 120)),
                bufferHit:   Math.min(99.9, Math.max(97, parseFloat((m.bufferHit + (Math.random() - 0.5) * 0.15).toFixed(1)))),
            }));
        }, 1800);
        return () => clearInterval(iv);
    }, []);
    return metrics;
};

// ═══════════════════════════════════════════════════════════════════════════
//  SPARKLINE
// ═══════════════════════════════════════════════════════════════════════════

const Sparkline = ({ values, color, w = 48, h = 18 }) => {
    if (!values || values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pts = values
        .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`)
        .join(' ');
    const last = values[values.length - 1];
    const lx   = w;
    const ly   = h - ((last - min) / range) * (h - 2) - 1;
    return (
        <svg width={w} height={h} style={{ overflow: 'visible', flexShrink: 0 }}>
            <polyline fill="none" stroke={color} strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      points={pts} opacity="0.8" />
            <circle cx={lx} cy={ly} r="2" fill={color} />
        </svg>
    );
};

const useSparkHistory = (value, len = 18) => {
    const hist = useRef([value]);
    useEffect(() => {
        hist.current = [...hist.current.slice(-(len - 1)), value];
    }, [value, len]);
    return hist.current;
};

// ═══════════════════════════════════════════════════════════════════════════
//  CONSOLE LOG STREAM
// ═══════════════════════════════════════════════════════════════════════════

const LOG_LINES = [
    ['info', 'pg_stat_statements: query plan cache flushed'],
    ['ok',   'autovacuum: processed 847 dead tuples in users_table'],
    ['warn', 'checkpoint distance ratio: 0.87 (threshold: 0.9)'],
    ['info', 'replication slot "replica_1": lag 12ms'],
    ['ok',   'connection pool: 142/200 active, 3 idle'],
    ['info', 'WAL archiving: segment 000000010000000000000002 archived'],
    ['ok',   'index scan: idx_orders_created (hits: 99.1%)'],
    ['warn', 'lock wait: pid 18421 waited 320ms on relation orders'],
    ['info', 'pg_hba.conf: SCRAM-SHA-256 auth for vigil_monitor'],
    ['ok',   'buffers: hit=99.1% miss=0.9% evict=0'],
    ['info', 'shared_buffers: 512MB / 4GB utilisation 12.8%'],
    ['ok',   'VACUUM ANALYZE users: 0 removed, 0 frozen'],
    ['info', 'pg_stat_bgwriter: checkpoints_req=0 checkpoints_timed=142'],
    ['warn', 'slow query: 340ms — SELECT * FROM events WHERE ts > NOW()-1d'],
    ['ok',   'logical replication: slot lag 0ms, confirmed_flush_lsn advanced'],
    ['info', 'pg_stat_activity: 3 idle-in-transaction (threshold: 10)'],
];

const LOG_COLORS = { info: '#38bdf8', ok: '#22c55e', warn: '#f59e0b', err: '#ef4444' };

const ConsoleStream = () => {
    const doubled = [...LOG_LINES, ...LOG_LINES];
    return (
        <div className="v-no-scroll" style={{
            overflow: 'hidden', height: '100%', position: 'relative',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}>
            <div style={{ animation: 'consoleScroll 28s linear infinite' }}>
                {doubled.map(([lvl, msg], i) => (
                    <div key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        padding: '2.5px 0',
                    }}>
                        <span style={{
                            color: LOG_COLORS[lvl] || '#64748b',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9, fontWeight: 700, minWidth: 32,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>{lvl}</span>
                        <span style={{
                            color: '#1e3a5f', fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9, lineHeight: 1.5, wordBreak: 'break-word',
                        }}>{msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TOPOLOGY SVG
// ═══════════════════════════════════════════════════════════════════════════

const TOPO_NODES = [
    { id: 'primary', x: 50, y: 50, label: 'PRIMARY',   color: '#0ea5e9' },
    { id: 'r1',      x: 20, y: 82, label: 'REPLICA 1', color: '#22c55e' },
    { id: 'r2',      x: 80, y: 82, label: 'REPLICA 2', color: '#22c55e' },
    { id: 'pool',    x: 50, y: 18, label: 'PGBOUNCER', color: '#a78bfa' },
    { id: 'app1',    x: 14, y:  8, label: 'APP 1',     color: '#f59e0b' },
    { id: 'app2',    x: 86, y:  8, label: 'APP 2',     color: '#f59e0b' },
];
const TOPO_EDGES = [
    ['primary','r1'], ['primary','r2'],
    ['pool','primary'], ['app1','pool'], ['app2','pool'],
];

const TopologyMap = () => {
    const W = 200, H = 120;
    const px = (v, dim) => (v / 100) * dim;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
                <marker id="topoArr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
                    <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(14,165,233,0.4)" />
                </marker>
            </defs>
            {TOPO_EDGES.map(([aId, bId], i) => {
                const a = TOPO_NODES.find(n => n.id === aId);
                const b = TOPO_NODES.find(n => n.id === bId);
                if (!a || !b) return null;
                return (
                    <line key={i}
                          x1={px(a.x, W)} y1={px(a.y, H)}
                          x2={px(b.x, W)} y2={px(b.y, H)}
                          stroke="rgba(14,165,233,0.18)" strokeWidth="0.8"
                          strokeDasharray="3 2"
                          markerEnd="url(#topoArr)" />
                );
            })}
            {TOPO_NODES.map(n => (
                <g key={n.id} transform={`translate(${px(n.x, W)},${px(n.y, H)})`}>
                    <circle r="6" fill={n.color} opacity="0.12"
                            style={{ animation: 'nodePulse 2s ease-in-out infinite' }} />
                    <circle r="3" fill={n.color} opacity="0.9" />
                    <text x="0" y="11" textAnchor="middle" style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 5, fill: '#475569', letterSpacing: '0.04em',
                    }}>
                        {n.label}
                    </text>
                </g>
            ))}
        </svg>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

const MetricCard = ({ icon: Icon, label, value, unit, color, spark }) => (
    <div
        style={{
            background: 'rgba(255,255,255,0.022)', border: `1px solid ${color}16`,
            borderRadius: 10, padding: '9px 11px', display: 'flex',
            flexDirection: 'column', gap: 5, position: 'relative', overflow: 'hidden',
            transition: 'border-color .2s, background .2s', cursor: 'default',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = color + '36';
            e.currentTarget.style.background  = color + '08';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = color + '16';
            e.currentTarget.style.background  = 'rgba(255,255,255,0.022)';
        }}
    >
        <div style={{ position: 'absolute', bottom: -8, right: -4, opacity: 0.04, pointerEvents: 'none' }}>
            <Icon size={42} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={9} color={color} />
                </div>
                <span style={{
                    fontSize: 8.5, color: '#334155',
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                    {label}
                </span>
            </div>
            {spark && <Sparkline values={spark} color={color} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{
                fontSize: 17, fontWeight: 700, color: '#e2e8f0',
                fontFamily: "'Syne', sans-serif", lineHeight: 1,
                animation: 'metricTick 2.5s ease-in-out infinite',
            }}>{value}</span>
            {unit && (
                <span style={{
                    fontSize: 9, color: '#475569',
                    fontFamily: "'JetBrains Mono', monospace",
                }}>{unit}</span>
            )}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LEFT PANEL
// ═══════════════════════════════════════════════════════════════════════════

const LeftPanel = () => {
    const metrics = useLiveMetrics();
    const [panelW, setPanelW] = useState(0);
    const [panelH, setPanelH] = useState(0);
    const panelRef = useRef(null);

    const qpsSpark  = useSparkHistory(metrics.qps,         18);
    const latSpark   = useSparkHistory(metrics.latency,     18);
    const cacheSpark = useSparkHistory(metrics.cacheHit,    18);
    const connSpark  = useSparkHistory(metrics.connections, 18);

    useEffect(() => {
        if (!panelRef.current) return;
        const ro = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            setPanelW(rect.width);
            setPanelH(rect.height);
        });
        ro.observe(panelRef.current);
        return () => ro.disconnect();
    }, []);

    const secondaryMetrics = [
        { label: 'TXN/s',    value: metrics.txps.toLocaleString(), color: '#14b8a6' },
        { label: 'Repl Lag', value: metrics.replication + 's',     color: '#f43f5e' },
        { label: 'Buf Hit',  value: metrics.bufferHit + '%',        color: '#0ea5e9' },
    ];

    return (
        <div ref={panelRef} style={{
            flex: '1 1 0', minWidth: 0,
            background: '#04080f',
            borderRight: '1px solid rgba(255,255,255,0.055)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative', height: '100vh',
        }}>
            {/* Particle background */}
            {panelW > 0 && <ParticleCanvas width={panelW} height={panelH} />}

            {/* Grid */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.018, pointerEvents: 'none',
                backgroundImage: `
                    linear-gradient(rgba(14,165,233,1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                animation: 'gridDrift 20s linear infinite',
            }} />

            {/* Gradient sweeps */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse 70% 50% at 30% 20%, rgba(14,165,233,0.07) 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 80% 80%, rgba(20,184,166,0.05) 0%, transparent 70%)`,
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* ── Header ───────────────────────────────────────────── */}
                <div style={{ padding: '22px 26px 0', flexShrink: 0, animation: 'fadeUp .6s ease .05s backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 24px rgba(14,165,233,0.55)',
                                animation: 'logoGlow 3s ease-in-out infinite',
                            }}>
                                <Database size={16} color="#fff" />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: 22, fontWeight: 800, color: '#f8fafc',
                                    fontFamily: "'Syne', sans-serif", letterSpacing: '-0.04em', lineHeight: 1,
                                }}>VIGIL</div>
                                <div style={{
                                    fontSize: 7.5, color: '#38bdf8', marginTop: 2,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: '0.22em', textTransform: 'uppercase',
                                }}>PostgreSQL Monitor</div>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                            borderRadius: 20, padding: '4px 10px',
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)',
                                animation: 'pulseDot 2s ease-in-out infinite',
                            }} />
                            <span style={{
                                color: '#22c55e', fontWeight: 700,
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 8, letterSpacing: '0.06em',
                            }}>LIVE</span>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div style={{
                        marginTop: 20, marginBottom: 16,
                        paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.045)',
                    }}>
                        <h2 style={{
                            fontSize: 15, fontWeight: 700, color: '#e2e8f0',
                            fontFamily: "'Syne', sans-serif", lineHeight: 1.35,
                            letterSpacing: '-0.02em', marginBottom: 5,
                        }}>
                            Total observability for{' '}
                            <span style={{ color: '#0ea5e9', display: 'inline-block', animation: 'glitchH 8s ease-in-out infinite' }}>
                                Postgres clusters.
                            </span>
                        </h2>
                        <p style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                            Connection pools · Replication lag · Query forensics · Storage trends
                        </p>
                    </div>
                </div>

                {/* ── Live Metrics ─────────────────────────────────────── */}
                <div style={{ padding: '0 26px', flexShrink: 0, animation: 'fadeUp .6s ease .15s backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                        <Radio size={9} color={THEME.primary} style={{ animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                        <span style={{
                            fontSize: 8.5, color: '#1e3a5f',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>Live System Metrics</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <MetricCard icon={Zap}      label="QPS"       value={metrics.qps.toLocaleString()} color="#0ea5e9" spark={qpsSpark} />
                        <MetricCard icon={Activity} label="Latency"   value={metrics.latency} unit="ms"    color="#a78bfa" spark={latSpark} />
                        <MetricCard icon={Server}   label="Cache Hit" value={metrics.cacheHit} unit="%"    color="#22c55e" spark={cacheSpark} />
                        <MetricCard icon={Cpu}      label="Conns"     value={metrics.connections}            color="#f59e0b" spark={connSpark} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginTop: 5 }}>
                        {secondaryMetrics.map(({ label, value, color }) => (
                            <div key={label} style={{
                                background: 'rgba(255,255,255,0.016)',
                                border: `1px solid ${color}12`,
                                borderRadius: 8, padding: '6px 9px',
                            }}>
                                <div style={{
                                    fontSize: 7.5, color: '#1e3a5f',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3,
                                }}>{label}</div>
                                <div style={{
                                    fontSize: 13, fontWeight: 700, color,
                                    fontFamily: "'Syne', sans-serif",
                                }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Topology ─────────────────────────────────────────── */}
                <div style={{ padding: '14px 26px 0', flexShrink: 0, animation: 'fadeUp .6s ease .25s backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <GitBranch size={9} color={THEME.teal} />
                        <span style={{
                            fontSize: 8.5, color: '#1e3a5f',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>Cluster Topology</span>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.018)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 12, padding: '10px 14px', height: 130,
                    }}>
                        <TopologyMap />
                    </div>
                </div>

                {/* ── Console Stream ───────────────────────────────────── */}
                <div style={{ padding: '12px 26px 0', flex: 1, minHeight: 0, animation: 'fadeUp .6s ease .35s backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <Terminal size={9} color="#64748b" />
                        <span style={{
                            fontSize: 8.5, color: '#1e3a5f',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>Log Stream</span>
                        <div style={{
                            marginLeft: 'auto', width: 5, height: 9,
                            background: '#0ea5e9', animation: 'termBlink 1s step-start infinite',
                        }} />
                    </div>
                    <div style={{
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 10, padding: '10px 12px',
                        height: 120, overflow: 'hidden',
                    }}>
                        <ConsoleStream />
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────────────────── */}
                <div style={{
                    padding: '10px 26px 18px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 5,
                    animation: 'fadeUp .6s ease .45s backwards',
                }}>
                    <Lock size={8} color="#1e293b" />
                    <span style={{
                        fontSize: 8.5, color: '#1e293b',
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        End-to-end encrypted · SOC 2 Type II · v2.0
                    </span>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  RIGHT BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

const RightBackground = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 85% 85% at 55% 50%, rgba(14,165,233,0.045) 0%, transparent 70%)',
        }} />
        <div style={{
            position: 'absolute', top: '10%', right: '-15%', width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%)',
            animation: 'orb2 22s ease-in-out infinite', filter: 'blur(40px)',
        }} />
        <div style={{
            position: 'absolute', bottom: '5%', left: '-10%', width: 260, height: 260,
            background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 65%)',
            animation: 'orb1 18s ease-in-out infinite', filter: 'blur(28px)',
        }} />
        <div style={{
            position: 'absolute', top: '55%', left: '20%', width: 180, height: 180,
            background: 'radial-gradient(circle, rgba(168,139,250,0.05) 0%, transparent 65%)',
            animation: 'orb3 14s ease-in-out infinite', filter: 'blur(20px)',
        }} />
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.015,
            backgroundImage: `
                linear-gradient(rgba(14,165,233,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
        }} />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LOGO EMBLEM
// ═══════════════════════════════════════════════════════════════════════════

const LogoEmblem = ({ success }) => {
    const size = 78, c = 39, r1 = 33, r2 = 26, r3 = 19;
    const strokeMain    = success ? THEME.success : THEME.primary;
    const strokeSub     = success ? THEME.success : THEME.secondary;
    const glowBg        = success
        ? 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)';
    const centerBg      = success
        ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal})`
        : `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`;
    const centerShadow  = success
        ? '0 4px 22px rgba(34,197,94,0.45)'
        : '0 4px 22px rgba(14,165,233,0.35)';

    return (
        <div style={{ position: 'relative', width: size, height: size, animation: 'logoPulse 4.5s ease-in-out infinite' }}>
            <div style={{
                position: 'absolute', inset: -14, borderRadius: '50%',
                background: glowBg,
                animation: 'logoGlow 3s ease-in-out infinite', transition: 'background .8s',
            }} />
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Outer dashed ring */}
                <circle cx={c} cy={c} r={r1} fill="none"
                        stroke={strokeMain} strokeWidth="1" strokeDasharray="4 3" opacity=".45"
                        style={{ transformOrigin: 'center', animation: 'spin 20s linear infinite', transition: 'stroke .8s' }} />
                {/* Mid ring */}
                <circle cx={c} cy={c} r={r2} fill="none"
                        stroke={strokeMain} strokeWidth="1.5"
                        strokeDasharray={`${Math.PI * r2 * 0.65} ${Math.PI * r2 * 0.35}`}
                        strokeLinecap="round" opacity=".7"
                        style={{ transformOrigin: 'center', animation: 'spinRev 11s linear infinite', transition: 'stroke .8s' }} />
                {/* Inner ring */}
                <circle cx={c} cy={c} r={r3} fill="none"
                        stroke={strokeSub} strokeWidth="0.8"
                        strokeDasharray="2 4" opacity=".35"
                        style={{ transformOrigin: 'center', animation: 'spin 7s linear infinite', transition: 'stroke .8s' }} />
                {/* Orbit dots */}
                {[0, 72, 144, 216, 288].map((deg, i) => (
                    <circle key={deg}
                            cx={c + r1 * Math.cos((deg * Math.PI) / 180)}
                            cy={c + r1 * Math.sin((deg * Math.PI) / 180)}
                            r="1.8" fill={strokeMain}
                            opacity={0.5 + i * 0.1}
                            style={{ transition: 'fill .8s' }} />
                ))}
                {/* Crosshairs */}
                <line x1={c - r2 - 3} y1={c} x2={c + r2 + 3} y2={c}
                      stroke={THEME.primary} strokeWidth=".4" opacity=".15" />
                <line x1={c} y1={c - r2 - 3} x2={c} y2={c + r2 + 3}
                      stroke={THEME.primary} strokeWidth=".4" opacity=".15" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: centerBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: centerShadow,
                    transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success
                        ? <CheckCircle size={20} color="#fff" style={{ animation: 'successPop .5s ease backwards' }} />
                        : <Database size={20} color="#fff" />
                    }
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERVER STATUS
// ═══════════════════════════════════════════════════════════════════════════

const ServerStatus = ({ status }) => {
    const isOnline  = status.status === 'online';
    const isOffline = status.status === 'offline';
    const checking  = status.status === 'checking';
    const color = isOnline ? THEME.success : isOffline ? THEME.danger : THEME.warning;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px 5px 10px', borderRadius: 100,
            background: color + '08', border: `1px solid ${color}20`,
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        }}>
            {checking ? (
                <>
                    <Loader size={9} color={THEME.textMuted}
                            style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: THEME.textMuted }}>Probing…</span>
                </>
            ) : (
                <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: color, boxShadow: `0 0 6px ${color}90`,
                            animation: isOnline ? 'pulseDot 2s ease-in-out infinite' : 'none',
                        }} />
                        {isOnline && (
                            <div style={{
                                position: 'absolute', inset: -2, borderRadius: '50%',
                                border: `1px solid ${color}70`,
                                animation: 'pulseRing 2s ease-out infinite',
                            }} />
                        )}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '0.05em' }}>
                        {isOnline ? 'ONLINE' : isOffline ? 'OFFLINE' : 'DEGRADED'}
                    </span>
                    {status.latency != null && (
                        <span style={{
                            color: '#1e3a5f', fontSize: 9,
                            padding: '1px 6px', borderRadius: 4,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            {status.latency}ms
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  INPUT FIELD
// ═══════════════════════════════════════════════════════════════════════════

const InputField = React.forwardRef(function InputField({
                                                            icon: Icon, label, type = 'text', value, onChange,
                                                            placeholder, autoComplete, disabled, rightElement,
                                                        }, ref) {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label style={{
                display: 'block', marginBottom: 7, fontSize: 9.5, fontWeight: 600,
                color: focused ? THEME.primary : '#334155',
                textTransform: 'uppercase', letterSpacing: '1.3px',
                fontFamily: "'JetBrains Mono', monospace", transition: 'color .2s',
            }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: focused ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.028)',
                border: `1px solid ${focused ? THEME.primary + '60' : 'rgba(255,255,255,0.075)'}`,
                borderRadius: 13, padding: '0 14px',
                transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                boxShadow: focused
                    ? `0 0 0 3px rgba(14,165,233,0.09), 0 0 20px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.04)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                position: 'relative', overflow: 'hidden',
            }}>
                {focused && (
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: 1,
                        background: `linear-gradient(90deg, transparent, ${THEME.primary}50, transparent)`,
                        animation: 'scanline 2.2s linear infinite',
                        pointerEvents: 'none',
                    }} />
                )}
                <Icon size={15}
                      color={focused ? THEME.primary : hasValue ? '#475569' : '#1e3a5f'}
                      style={{ flexShrink: 0, transition: 'color .2s' }} />
                <input
                    ref={ref} type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={()  => setFocused(false)}
                    className="v-input"
                    style={{
                        flex: 1, padding: '14px 0', background: 'none', border: 'none',
                        color: THEME.textMain, fontSize: 13.5, outline: 'none',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                        letterSpacing: '0.01em', opacity: disabled ? 0.4 : 1,
                    }}
                />
                {rightElement}
            </div>
        </div>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
//  CORNER ACCENTS
// ═══════════════════════════════════════════════════════════════════════════

const CornerAccents = () => {
    const corners = [
        { top: 0,    left: 0,    borderTop: true,    borderLeft: true,  borderRadius: '3px 0 0 0' },
        { top: 0,    right: 0,   borderTop: true,    borderRight: true, borderRadius: '0 3px 0 0' },
        { bottom: 0, left: 0,    borderBottom: true, borderLeft: true,  borderRadius: '0 0 0 3px' },
        { bottom: 0, right: 0,   borderBottom: true, borderRight: true, borderRadius: '0 0 3px 0' },
    ];
    return (
        <>
            {corners.map((corner, i) => {
                const { borderTop, borderRight, borderBottom, borderLeft, borderRadius, ...pos } = corner;
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        width: 14, height: 14,
                        pointerEvents: 'none',
                        borderRadius,
                        borderTop:    borderTop    ? `1px solid rgba(14,165,233,0.3)` : 'none',
                        borderBottom: borderBottom ? `1px solid rgba(14,165,233,0.3)` : 'none',
                        borderLeft:   borderLeft   ? `1px solid rgba(14,165,233,0.3)` : 'none',
                        borderRight:  borderRight  ? `1px solid rgba(14,165,233,0.3)` : 'none',
                        ...pos,
                    }} />
                );
            })}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

const LoginPage = () => {
    const { login, authLoading, error, clearError } = useAuth();

    const [username,     setUsername]     = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe,   setRememberMe]   = useState(false);
    const [serverStatus, setServerStatus] = useState({ status: 'checking' });
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [formShake,    setFormShake]    = useState(false);
    const [btnHover,     setBtnHover]     = useState(false);

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    // Health check
    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0  = performance.now();
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const data = await res.json();
                if (!cancelled) {
                    setServerStatus({
                        status:  data.status === 'ok' ? 'online' : 'degraded',
                        latency: Math.round(performance.now() - t0),
                    });
                }
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
        if (saved) {
            setUsername(saved);
            setRememberMe(true);
            passwordRef.current?.focus();
        } else {
            usernameRef.current?.focus();
        }
    }, []);

    // Shake on error
    useEffect(() => {
        if (error) {
            setFormShake(true);
            const t = setTimeout(() => setFormShake(false), 600);
            return () => clearTimeout(t);
        }
    }, [error]);

    // Clear error on typing
    useEffect(() => {
        if (error && clearError) clearError();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username, password]);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username);
        else            localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try {
            await login(username, password);
            setLoginSuccess(true);
        } catch {
            /* error handled by AuthContext */
        }
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;

    const btnBackground = authLoading
        ? 'rgba(14,165,233,0.55)'
        : loginSuccess
            ? THEME.success
            : canSubmit
                ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #38bdf8 100%)'
                : 'rgba(14,165,233,0.18)';

    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? btnHover
            ? '0 8px 28px rgba(14,165,233,0.55), 0 0 0 1px rgba(14,165,233,0.3) inset'
            : '0 4px 18px rgba(14,165,233,0.35), 0 0 0 1px rgba(14,165,233,0.18) inset'
        : 'none';

    return (
        <div style={{
            height: '100vh', width: '100vw', display: 'flex',
            background: THEME.bg, fontFamily: "'DM Sans', sans-serif",
            overflow: 'hidden',
        }}>
            <GlobalStyles />

            {/* ═══ LEFT PANEL ═══ */}
            <LeftPanel />

            {/* ═══ RIGHT PANEL ═══ */}
            <div style={{
                width: 490, flexShrink: 0, position: 'relative',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 48px',
                background: 'rgba(4,8,15,0.97)',
            }}>
                <RightBackground />

                <div style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: 370,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 22, animation: 'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess} />
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 6, animation: 'fadeUp .6s ease .18s backwards', width: '100%' }}>
                        <h1 style={{
                            fontSize: 27, fontWeight: 800, color: THEME.textMain,
                            margin: 0, lineHeight: 1.15, letterSpacing: '-0.03em',
                            fontFamily: "'Syne', sans-serif",
                        }}>
                            Welcome back
                        </h1>
                        <p style={{
                            color: '#334155', margin: '9px 0 0', fontSize: 12.5,
                            fontWeight: 400, lineHeight: 1.55,
                        }}>
                            Authenticate to access your monitoring dashboard
                        </p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin: '14px 0 20px', animation: 'fadeUp .6s ease .26s backwards' }}>
                        <ServerStatus status={serverStatus} />
                    </div>

                    {/* ── Card ─────────────────────────────────────────── */}
                    <div style={{
                        width: '100%',
                        padding: '30px 28px 26px',
                        borderRadius: 22,
                        background: 'rgba(12,22,42,0.72)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        border: `1px solid ${
                            loginSuccess ? THEME.success + '45'
                                : error      ? THEME.danger  + '38'
                                    : 'rgba(255,255,255,0.07)'
                        }`,
                        boxShadow: loginSuccess
                            ? '0 0 60px rgba(34,197,94,0.12), 0 24px 48px rgba(0,0,0,0.55)'
                            : '0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.025) inset',
                        transition: 'border-color .55s, box-shadow .55s',
                        animation: formShake ? 'shake .5s ease' : 'fadeUp .7s ease .34s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top edge glow */}
                        <div style={{
                            position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
                            background: loginSuccess
                                ? `linear-gradient(90deg, transparent, ${THEME.success}70, transparent)`
                                : `linear-gradient(90deg, transparent, ${THEME.primary}40, transparent)`,
                            transition: 'background .55s',
                            animation: 'borderPulse 3s ease-in-out infinite',
                        }} />

                        {/* Corner accents */}
                        <CornerAccents />

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, transparent 70%)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                zIndex: 20, borderRadius: 22,
                                animation: 'fadeIn .3s ease',
                            }}>
                                <div style={{
                                    position: 'absolute', width: 80, height: 80,
                                    borderRadius: '50%',
                                    border: `2px solid ${THEME.success}35`,
                                    animation: 'successRipple 1s ease-out forwards',
                                }} />
                                <CheckCircle
                                    size={42} color={THEME.success}
                                    style={{ animation: 'successPop .5s ease backwards', marginBottom: 14 }}
                                />
                                <div style={{
                                    color: THEME.success, fontSize: 15.5, fontWeight: 800,
                                    fontFamily: "'Syne', sans-serif",
                                    animation: 'fadeUp .4s ease .2s backwards',
                                }}>
                                    Authenticated
                                </div>
                                <div style={{
                                    color: '#1e3a5f', fontSize: 10.5, marginTop: 5,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    animation: 'fadeUp .4s ease .35s backwards',
                                }}>
                                    Redirecting to dashboard…
                                </div>
                            </div>
                        )}

                        {/* Error banner */}
                        {error && (
                            <div style={{
                                marginBottom: 18, padding: '10px 13px', borderRadius: 10,
                                background: THEME.danger + '09',
                                border: `1px solid ${THEME.danger}28`,
                                display: 'flex', alignItems: 'center', gap: 9,
                                animation: 'slideDown .3s ease backwards',
                            }}>
                                <AlertCircle size={14} color={THEME.danger} style={{ flexShrink: 0 }} />
                                <span style={{ color: THEME.danger, fontSize: 12.5, fontWeight: 500 }}>
                                    {error}
                                </span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <InputField
                                ref={usernameRef}
                                icon={User} label="Username"
                                value={username} onChange={setUsername}
                                placeholder="your_username" autoComplete="username"
                                disabled={authLoading || loginSuccess}
                            />
                            <InputField
                                ref={passwordRef}
                                icon={KeyRound} label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password} onChange={setPassword}
                                placeholder="••••••••••••" autoComplete="current-password"
                                disabled={authLoading || loginSuccess}
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        tabIndex={-1}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#1e3a5f', padding: 4, display: 'flex',
                                            transition: 'color .2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#475569'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#1e3a5f'; }}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                }
                            />

                            {/* Remember me */}
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 9,
                                    cursor: 'pointer', userSelect: 'none', marginTop: -4,
                                }}
                                onClick={() => setRememberMe(r => !r)}
                            >
                                <div style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    border: `1.5px solid ${rememberMe ? THEME.primary : 'rgba(255,255,255,0.1)'}`,
                                    background: rememberMe ? THEME.primary : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all .22s cubic-bezier(.34,1.56,.64,1)',
                                    boxShadow: rememberMe ? '0 0 10px rgba(14,165,233,0.4)' : 'none',
                                }}>
                                    {rememberMe && (
                                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8"
                                                  strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: 12, color: '#334155',
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                                }}>
                                    Remember this device
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                className={canSubmit && !authLoading ? 'v-btn-shine' : ''}
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    background: btnBackground,
                                    border: canSubmit
                                        ? `1px solid ${loginSuccess ? THEME.success : THEME.primary}40`
                                        : '1px solid rgba(255,255,255,0.05)',
                                    padding: '13.5px 22px', borderRadius: 13,
                                    color: 'white', fontWeight: 700, fontSize: 13.5,
                                    fontFamily: "'Syne', sans-serif", letterSpacing: '0.02em',
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    marginTop: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                                    boxShadow: btnShadow,
                                    transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                            >
                                {authLoading ? (
                                    <>
                                        <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span>Authenticating…</span>
                                    </>
                                ) : loginSuccess ? (
                                    <>
                                        <CheckCircle size={15} />
                                        <span>Access Granted</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <ArrowRight size={15} style={{
                                            transition: 'transform .25s',
                                            transform: btnHover ? 'translateX(3px)' : 'translateX(0)',
                                        }} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 20, textAlign: 'center', animation: 'fadeUp .6s ease .6s backwards' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            fontSize: 9.5, color: '#1e293b',
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            <Shield size={9} style={{ opacity: .45 }} />
                            <span>Vigil PostgreSQL Monitor · Secured Session</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;