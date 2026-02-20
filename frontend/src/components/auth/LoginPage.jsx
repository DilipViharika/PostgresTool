// ==========================================================================
//  VIGIL — Login Page  (Screenshot Match Edition)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Lock,
    Activity, Bell, Search, TrendingUp, RefreshCw, UserCheck,
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
        @keyframes logoPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.045)} }
        @keyframes logoGlow    { 0%,100%{box-shadow:0 0 25px rgba(14,165,233,0.25),0 0 70px rgba(14,165,233,0.08)} 50%{box-shadow:0 0 40px rgba(14,165,233,0.4),0 0 100px rgba(14,165,233,0.12)} }
        @keyframes successPop  { 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.2) rotate(0deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes successRipple{ 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(3.5);opacity:0} }
        @keyframes borderPulse { 0%,100%{opacity:.25} 50%{opacity:.9} }
        @keyframes shimmer     { 0%{left:-100%} 100%{left:200%} }
        @keyframes glitchH     {
            0%,88%,100%  { clip-path:none; transform:none; }
            90%  { clip-path:inset(30% 0 55% 0); transform:translateX(-3px); }
            92%  { clip-path:inset(70% 0 5% 0);  transform:translateX(3px);  }
            94%  { clip-path:inset(15% 0 75% 0); transform:translateX(-2px); }
        }
        @keyframes subtleFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
        @keyframes scanH       { 0%{top:0%;opacity:0} 5%{opacity:.4} 95%{opacity:.4} 100%{top:100%;opacity:0} }

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
        .v-btn-shine::after {
            content: '';
            position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
            animation: shimmer 2.8s ease infinite;
            pointer-events: none;
        }
        .feature-card:hover {
            border-color: rgba(14,165,233,0.18) !important;
            background: rgba(14,165,233,0.06) !important;
        }
        .screenshot-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        }
    `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK SCREENSHOT PANELS (SVG-based dashboard previews)
// ═══════════════════════════════════════════════════════════════════════════

const DashboardScreenshot = () => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)',
        borderRadius: 8, overflow: 'hidden', position: 'relative',
    }}>
        {/* Header bar */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: 6, fontSize: 7, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Dashboard UI</span>
            <div style={{ marginLeft: 'auto', background: 'rgba(14,165,233,0.15)', borderRadius: 3, padding: '1px 5px' }}>
                <span style={{ fontSize: 6, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>57.1%</span>
            </div>
        </div>
        {/* Content area */}
        <div style={{ padding: '8px 10px' }}>
            {/* Mini chart line */}
            <svg width="100%" height="40" viewBox="0 0 200 40">
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d="M0,30 C20,25 40,10 60,15 C80,20 100,8 120,12 C140,16 160,5 180,8 L200,6 L200,40 L0,40 Z" fill="url(#chartGrad)" />
                <path d="M0,30 C20,25 40,10 60,15 C80,20 100,8 120,12 C140,16 160,5 180,8 L200,6" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
            </svg>
            {/* Bar chart mini */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginTop: 4, height: 28 }}>
                {[60, 80, 45, 90, 55, 75, 40, 85, 65, 95, 50, 70].map((h, i) => (
                    <div key={i} style={{
                        flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0',
                        background: i === 11 ? '#0ea5e9' : `rgba(14,165,233,${0.2 + i * 0.02})`,
                    }} />
                ))}
            </div>
        </div>
        {/* Bottom label */}
        <div style={{ position: 'absolute', bottom: 6, left: 10 }}>
            <span style={{ fontSize: 7, color: '#0ea5e9', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>LIVE DASHBOARD</span>
        </div>
        {/* Scan line */}
        <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)',
            animation: 'scanH 4s linear infinite',
        }} />
    </div>
);

const ChartsScreenshot = () => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #0a1628 0%, #120a1e 100%)',
        borderRadius: 8, overflow: 'hidden', position: 'relative',
    }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(168,139,250,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: 6, fontSize: 7, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Data Visualization</span>
        </div>
        <div style={{ padding: '8px 10px' }}>
            {/* Candlestick-like chart */}
            <svg width="100%" height="55" viewBox="0 0 200 55">
                {/* Gradient area */}
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d="M0,45 C30,40 50,20 80,25 C110,30 130,10 160,15 C180,18 190,10 200,8 L200,55 L0,55 Z" fill="url(#areaGrad)" />
                <path d="M0,45 C30,40 50,20 80,25 C110,30 130,10 160,15 C180,18 190,10 200,8" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
                {/* Red candles */}
                {[20,60,100,140,180].map((x,i) => (
                    <g key={i}>
                        <rect x={x-3} y={15+i*3} width={6} height={10+i*2} fill={i%2===0?"#ef4444":"#22c55e"} opacity="0.7" rx="1" />
                        <line x1={x} y1={12+i*3} x2={x} y2={28+i*4} stroke={i%2===0?"#ef4444":"#22c55e"} strokeWidth="0.8" opacity="0.5" />
                    </g>
                ))}
            </svg>
        </div>
        <div style={{ position: 'absolute', bottom: 6, left: 10 }}>
            <span style={{ fontSize: 7, color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>CHARTS & TRENDS</span>
        </div>
    </div>
);

const NetworkScreenshot = () => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #040c0c 0%, #0a1a1a 100%)',
        borderRadius: 8, overflow: 'hidden', position: 'relative',
    }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: 6, fontSize: 7, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>Network Topology</span>
        </div>
        <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 32px)' }}>
            <svg width="160" height="70" viewBox="0 0 160 70">
                {/* Network nodes */}
                <circle cx="80" cy="20" r="8" fill="none" stroke="#14b8a6" strokeWidth="1.2" opacity="0.8" />
                <circle cx="80" cy="20" r="4" fill="#14b8a6" opacity="0.9" />
                <circle cx="40" cy="55" r="6" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.7" />
                <circle cx="40" cy="55" r="3" fill="#22c55e" opacity="0.9" />
                <circle cx="120" cy="55" r="6" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.7" />
                <circle cx="120" cy="55" r="3" fill="#22c55e" opacity="0.9" />
                <circle cx="15" cy="35" r="5" fill="#f59e0b" opacity="0.8" />
                <circle cx="145" cy="35" r="5" fill="#f59e0b" opacity="0.8" />
                {/* Lines */}
                <line x1="80" y1="28" x2="40" y2="49" stroke="rgba(14,165,233,0.3)" strokeWidth="0.8" strokeDasharray="3 2" />
                <line x1="80" y1="28" x2="120" y2="49" stroke="rgba(14,165,233,0.3)" strokeWidth="0.8" strokeDasharray="3 2" />
                <line x1="15" y1="35" x2="75" y2="22" stroke="rgba(14,165,233,0.2)" strokeWidth="0.8" strokeDasharray="3 2" />
                <line x1="145" y1="35" x2="85" y2="22" stroke="rgba(14,165,233,0.2)" strokeWidth="0.8" strokeDasharray="3 2" />
            </svg>
        </div>
        <div style={{ position: 'absolute', bottom: 6, left: 10 }}>
            <span style={{ fontSize: 7, color: '#14b8a6', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>CLUSTER REPLICATION & NETWORK</span>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  FEATURE CARDS
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
    { icon: Activity,    label: 'Real-Time Metrics',   desc: 'QPS, latency & cache hit ratios — live.',         color: '#0ea5e9' },
    { icon: Bell,        label: 'Smart Alerting',       desc: 'Slow query & replication log alerts.',             color: '#a78bfa' },
    { icon: Search,      label: 'Query Inspector',      desc: 'EXPLAIN plans & pg_stat_statements.',              color: '#f59e0b' },
    { icon: RefreshCw,   label: 'Replication Health',   desc: 'WAL archiving & standby lag tracking.',            color: '#14b8a6' },
    { icon: TrendingUp,  label: 'Trend Analysis',       desc: 'Anomaly detection across clusters.',               color: '#f43f5e' },
    { icon: UserCheck,   label: 'Access Audit',         desc: 'RBAC with full compliance trails.',                color: '#22c55e' },
];

const FeatureCard = ({ icon: Icon, label, desc, color }) => (
    <div
        className="feature-card"
        style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '14px 14px',
            display: 'flex', flexDirection: 'column', gap: 6,
            cursor: 'default', transition: 'all .2s ease',
        }}
    >
        <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={13} color={color} />
        </div>
        <div style={{
            fontSize: 11.5, fontWeight: 700, color: '#c8d6e5',
            fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em',
        }}>{label}</div>
        <div style={{
            fontSize: 9.5, color: '#334155', lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
        }}>{desc}</div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LEFT PANEL
// ═══════════════════════════════════════════════════════════════════════════

const LeftPanel = () => (
    <div style={{
        flex: '1 1 0', minWidth: 0,
        background: '#04080f',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative', height: '100vh',
    }}>
        {/* Background grid */}
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.016, pointerEvents: 'none',
            backgroundImage: `
                linear-gradient(rgba(14,165,233,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
        }} />
        {/* Gradient overlay */}
        <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
                radial-gradient(ellipse 70% 50% at 30% 20%, rgba(14,165,233,0.06) 0%, transparent 70%),
                radial-gradient(ellipse 50% 60% at 80% 80%, rgba(20,184,166,0.04) 0%, transparent 70%)`,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ── Header ── */}
            <div style={{ padding: '20px 26px 0', flexShrink: 0, animation: 'fadeUp .6s ease .05s backwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 18px rgba(14,165,233,0.45)',
                        }}>
                            <Database size={14} color="#fff" />
                        </div>
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: '#38bdf8',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.18em', textTransform: 'uppercase',
                        }}>PostgreSQL Monitor</span>
                    </div>
                    {/* Online pill */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
                        borderRadius: 20, padding: '3px 10px',
                    }}>
                        <div style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: '#0ea5e9', boxShadow: '0 0 5px rgba(14,165,233,0.7)',
                        }} />
                        <span style={{
                            color: '#0ea5e9', fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 7.5, letterSpacing: '0.08em',
                        }}>MONITOR</span>
                    </div>
                </div>

                {/* Tagline */}
                <h2 style={{
                    fontSize: 20, fontWeight: 800, color: '#e2e8f0',
                    fontFamily: "'Syne', sans-serif", lineHeight: 1.3,
                    letterSpacing: '-0.03em', marginBottom: 6,
                }}>
                    Total observability for{' '}
                    <span style={{ color: '#0ea5e9', display: 'inline-block', animation: 'glitchH 8s ease-in-out infinite' }}>
                        your Postgres clusters.
                    </span>
                </h2>
                <p style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                    A single pane of glass — connection pools, replication lag, slow-query forensics and storage trends.
                </p>
            </div>

            {/* ── Screenshot Grid ── */}
            <div style={{ padding: '0 26px', flexShrink: 0, animation: 'fadeUp .6s ease .15s backwards' }}>
                {/* Top row: 2 screenshots side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div
                        className="screenshot-card"
                        style={{
                            height: 110, borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.07)',
                            overflow: 'hidden', transition: 'all .3s ease',
                        }}
                    >
                        <DashboardScreenshot />
                    </div>
                    <div
                        className="screenshot-card"
                        style={{
                            height: 110, borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.07)',
                            overflow: 'hidden', transition: 'all .3s ease',
                        }}
                    >
                        <ChartsScreenshot />
                    </div>
                </div>
                {/* Bottom row: full-width screenshot */}
                <div
                    className="screenshot-card"
                    style={{
                        height: 100, borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.07)',
                        overflow: 'hidden', transition: 'all .3s ease',
                        marginBottom: 0,
                    }}
                >
                    <NetworkScreenshot />
                </div>
            </div>

            {/* ── Feature Cards Grid ── */}
            <div style={{ padding: '12px 26px', flex: 1, minHeight: 0, animation: 'fadeUp .6s ease .25s backwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                    {FEATURES.map(f => (
                        <FeatureCard key={f.label} {...f} />
                    ))}
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding: '8px 26px 16px', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 5,
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

// ═══════════════════════════════════════════════════════════════════════════
//  RIGHT BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

const RightBackground = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 85% 85% at 55% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)',
        }} />
        <div style={{
            position: 'absolute', top: '10%', right: '-15%', width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)',
            animation: 'orb2 22s ease-in-out infinite', filter: 'blur(40px)',
        }} />
        <div style={{
            position: 'absolute', bottom: '5%', left: '-10%', width: 260, height: 260,
            background: 'radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 65%)',
            animation: 'orb1 18s ease-in-out infinite', filter: 'blur(28px)',
        }} />
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.013,
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
    const size = 82, c = 41, r1 = 35, r2 = 27, r3 = 19;
    const strokeMain = success ? THEME.success : THEME.primary;
    const strokeSub  = success ? THEME.success : THEME.secondary;
    const centerBg   = success
        ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal})`
        : `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`;
    const centerShadow = success
        ? '0 4px 22px rgba(34,197,94,0.45)'
        : '0 4px 22px rgba(14,165,233,0.35)';

    return (
        <div style={{ position: 'relative', width: size, height: size, animation: 'logoPulse 4.5s ease-in-out infinite' }}>
            <div style={{
                position: 'absolute', inset: -14, borderRadius: '50%',
                background: success
                    ? 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 70%)',
                animation: 'logoGlow 3s ease-in-out infinite', transition: 'background .8s',
            }} />
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx={c} cy={c} r={r1} fill="none"
                        stroke={strokeMain} strokeWidth="1" strokeDasharray="4 3" opacity=".4"
                        style={{ transformOrigin: 'center', animation: 'spin 20s linear infinite', transition: 'stroke .8s' }} />
                <circle cx={c} cy={c} r={r2} fill="none"
                        stroke={strokeMain} strokeWidth="1.5"
                        strokeDasharray={`${Math.PI * r2 * 0.65} ${Math.PI * r2 * 0.35}`}
                        strokeLinecap="round" opacity=".65"
                        style={{ transformOrigin: 'center', animation: 'spinRev 11s linear infinite', transition: 'stroke .8s' }} />
                <circle cx={c} cy={c} r={r3} fill="none"
                        stroke={strokeSub} strokeWidth="0.8"
                        strokeDasharray="2 4" opacity=".3"
                        style={{ transformOrigin: 'center', animation: 'spin 7s linear infinite', transition: 'stroke .8s' }} />
                {[0, 72, 144, 216, 288].map((deg, i) => (
                    <circle key={deg}
                            cx={c + r1 * Math.cos((deg * Math.PI) / 180)}
                            cy={c + r1 * Math.sin((deg * Math.PI) / 180)}
                            r="1.8" fill={strokeMain}
                            opacity={0.5 + i * 0.09}
                            style={{ transition: 'fill .8s' }} />
                ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: centerBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: centerShadow,
                    transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success
                        ? <CheckCircle size={22} color="#fff" style={{ animation: 'successPop .5s ease backwards' }} />
                        : <Database size={22} color="#fff" />
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
            background: color + '08', border: `1px solid ${color}22`,
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        }}>
            {checking ? (
                <>
                    <Loader size={9} color={THEME.textMuted} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: THEME.textMuted }}>Checking…</span>
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
                background: focused ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${focused ? THEME.primary + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 13, padding: '0 14px',
                transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                boxShadow: focused
                    ? `0 0 0 3px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.03)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.02)',
            }}>
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
                        flex: 1, padding: '13px 0', background: 'none', border: 'none',
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
                        position: 'absolute', width: 14, height: 14, pointerEvents: 'none',
                        borderRadius,
                        borderTop:    borderTop    ? `1px solid rgba(14,165,233,0.28)` : 'none',
                        borderBottom: borderBottom ? `1px solid rgba(14,165,233,0.28)` : 'none',
                        borderLeft:   borderLeft   ? `1px solid rgba(14,165,233,0.28)` : 'none',
                        borderRight:  borderRight  ? `1px solid rgba(14,165,233,0.28)` : 'none',
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
                : 'rgba(14,165,233,0.15)';

    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? btnHover
            ? '0 8px 28px rgba(14,165,233,0.5), 0 0 0 1px rgba(14,165,233,0.28) inset'
            : '0 4px 18px rgba(14,165,233,0.3), 0 0 0 1px rgba(14,165,233,0.15) inset'
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
                width: 500, flexShrink: 0, position: 'relative',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 48px',
                background: 'rgba(4,8,15,0.97)',
            }}>
                <RightBackground />

                <div style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: 380,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 22, animation: 'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess} />
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 6, animation: 'fadeUp .6s ease .18s backwards', width: '100%' }}>
                        <h1 style={{
                            fontSize: 28, fontWeight: 800, color: THEME.textMain,
                            margin: 0, lineHeight: 1.15, letterSpacing: '-0.03em',
                            fontFamily: "'Syne', sans-serif",
                        }}>
                            Welcome back
                        </h1>
                        <p style={{
                            color: '#334155', margin: '8px 0 0', fontSize: 12.5,
                            fontWeight: 400, lineHeight: 1.55,
                        }}>
                            Sign in to your monitoring dashboard
                        </p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin: '14px 0 20px', animation: 'fadeUp .6s ease .26s backwards' }}>
                        <ServerStatus status={serverStatus} />
                    </div>

                    {/* ── Card ── */}
                    <div style={{
                        width: '100%',
                        padding: '30px 28px 26px',
                        borderRadius: 22,
                        background: 'rgba(10,18,35,0.75)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        border: `1px solid ${
                            loginSuccess ? THEME.success + '45'
                                : error      ? THEME.danger  + '35'
                                    : 'rgba(255,255,255,0.07)'
                        }`,
                        boxShadow: loginSuccess
                            ? '0 0 60px rgba(34,197,94,0.1), 0 24px 48px rgba(0,0,0,0.5)'
                            : '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
                        transition: 'border-color .55s, box-shadow .55s',
                        animation: formShake ? 'shake .5s ease' : 'fadeUp .7s ease .34s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top edge glow */}
                        <div style={{
                            position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
                            background: loginSuccess
                                ? `linear-gradient(90deg, transparent, ${THEME.success}65, transparent)`
                                : `linear-gradient(90deg, transparent, ${THEME.primary}35, transparent)`,
                            transition: 'background .55s',
                            animation: 'borderPulse 3s ease-in-out infinite',
                        }} />

                        <CornerAccents />

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(circle at center, rgba(34,197,94,0.07) 0%, transparent 70%)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                zIndex: 20, borderRadius: 22,
                                animation: 'fadeIn .3s ease',
                            }}>
                                <div style={{
                                    position: 'absolute', width: 80, height: 80,
                                    borderRadius: '50%',
                                    border: `2px solid ${THEME.success}30`,
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
                                border: `1px solid ${THEME.danger}25`,
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
                                placeholder="Enter your username" autoComplete="username"
                                disabled={authLoading || loginSuccess}
                            />
                            <InputField
                                ref={passwordRef}
                                icon={KeyRound} label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password} onChange={setPassword}
                                placeholder="Enter your password" autoComplete="current-password"
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
                                    boxShadow: rememberMe ? '0 0 10px rgba(14,165,233,0.35)' : 'none',
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
                                    Remember me
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
                                        ? `1px solid ${loginSuccess ? THEME.success : THEME.primary}35`
                                        : '1px solid rgba(255,255,255,0.04)',
                                    padding: '14px 22px', borderRadius: 13,
                                    color: 'white', fontWeight: 700, fontSize: 14,
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
                                        <span>Sign In</span>
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
                            <Shield size={9} style={{ opacity: .4 }} />
                            <span>Secured by Vigil · PostgreSQL Monitor v2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;