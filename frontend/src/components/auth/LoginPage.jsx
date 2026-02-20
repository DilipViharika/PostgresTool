// ==========================================================================
//  VIGIL — Login Page  (v4.0 — Split-Panel Cinematic)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    Database, Eye, EyeOff,
    Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Activity, Shield, Server, Cpu, Zap, GitBranch, Lock,
    BarChart2, Bell, RefreshCw, Search, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════

const LoginStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        @keyframes vLoginFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vLoginFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes vLoginScaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes vLoginSlideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vLoginShake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-8px) rotate(-0.5deg); }
            30% { transform: translateX(6px) rotate(0.3deg); }
            45% { transform: translateX(-4px); }
            60% { transform: translateX(3px); }
            75% { transform: translateX(-1px); }
        }
        @keyframes vGridScroll {
            from { transform: translate(0, 0); }
            to   { transform: translate(80px, 80px); }
        }
        @keyframes vOrbFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.8; }
            66% { transform: translate(-20px, -20px) scale(0.95); opacity: 0.5; }
        }
        @keyframes vOrbFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            50% { transform: translate(-40px, 30px) scale(1.1); opacity: 0.7; }
        }
        @keyframes vScanline {
            0% { top: -2px; opacity: 0; }
            5% { opacity: 0.6; }
            95% { opacity: 0.6; }
            100% { top: 100%; opacity: 0; }
        }
        @keyframes vPulseRing {
            0% { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes vPulseDot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        @keyframes vSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes vLogoGlow {
            0%, 100% { box-shadow: 0 0 20px ${THEME.primary}25, 0 0 60px ${THEME.primary}08; }
            50%      { box-shadow: 0 0 30px ${THEME.primary}40, 0 0 80px ${THEME.primary}15; }
        }
        @keyframes vLogoPulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.04); }
        }
        @keyframes vRingRotate {
            to { transform: rotate(360deg); }
        }
        @keyframes vRingRotateReverse {
            to { transform: rotate(-360deg); }
        }
        @keyframes vBorderGlow {
            0%, 100% { opacity: 0.3; }
            50%      { opacity: 0.8; }
        }
        @keyframes vSuccessPop {
            0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
            50%  { transform: scale(1.15) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes vSuccessRipple {
            0%   { transform: scale(0.5); opacity: 0.5; }
            100% { transform: scale(3); opacity: 0; }
        }
        @keyframes vBarFill {
            from { width: 0%; }
            to   { width: var(--bar-w); }
        }
        @keyframes vMetricTick {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        @keyframes vNodePulse {
            0%, 100% { r: 4; opacity: 0.8; }
            50% { r: 6; opacity: 1; }
        }
        @keyframes vLineFlash {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.6; }
        }
        @keyframes vConsoleScroll {
            from { transform: translateY(0); }
            to   { transform: translateY(-50%); }
        }
        @keyframes vGlowPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
        }
        @keyframes vFloatUp {
            0% { transform: translateY(0px); opacity: 0.7; }
            100% { transform: translateY(-20px); opacity: 0; }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #080f1e inset !important;
            -webkit-text-fill-color: #F8FAFC !important;
            caret-color: #F8FAFC;
            transition: background-color 5000s ease-in-out 0s;
        }
        .vigil-input::placeholder {
            color: ${THEME.textDim};
            opacity: 1;
        }
        .vigil-input:focus::placeholder {
            color: transparent;
        }

        /* Scrollbar hide for console */
        .vigil-console::-webkit-scrollbar { display: none; }
        .vigil-console { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LEFT PANEL — Tool Summary + Real Imagery
// ═══════════════════════════════════════════════════════════════════════════

// ─── Unsplash image map (all 4 visual categories) ───────────────────────────
// Each ID is a well-known, free-to-use Unsplash photo.
const IMG = {
    // 1. SERVER / INFRASTRUCTURE  — Taylor Vick's iconic blue data-center aisle
    serverRoom:   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=85&fit=crop&crop=center',

    // 2. DASHBOARD / UI MOCKUP  — dark analytics UI on a monitor
    dashMockup:   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85&fit=crop&crop=top',

    // 3. DATA VISUALIZATION / CHARTS  — glowing chart lines on screen
    dataViz:      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=85&fit=crop',

    // 4. ABSTRACT TECH / NETWORK  — glowing fiber / network nodes
    abstractTech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=85&fit=crop',
};

// ─── Feature list for the summary section ────────────────────────────────────
const FEATURES = [
    { icon: Activity,   color: '#0ea5e9', label: 'Real-Time Metrics',   desc: 'QPS, latency & cache hit ratios — live.' },
    { icon: Bell,       color: '#22c55e', label: 'Smart Alerting',      desc: 'Slow query & replication lag alerts.' },
    { icon: Search,     color: '#a78bfa', label: 'Query Inspector',      desc: 'EXPLAIN plans & pg_stat_statements.' },
    { icon: RefreshCw,  color: '#f59e0b', label: 'Replication Health',   desc: 'WAL archiving & standby lag tracking.' },
    { icon: TrendingUp, color: '#f43f5e', label: 'Trend Analysis',       desc: 'Anomaly detection across clusters.' },
    { icon: Shield,     color: '#14b8a6', label: 'Access Audit',         desc: 'RBAC with full compliance trails.' },
];

// ─── Small helper: image tile with an overlay label + colour tint ─────────────
const ImgTile = ({ src, alt, label, tint, h = 120, delay = 0 }) => (
    <div style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        height: h, flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.07)',
        animation: `vLoginFadeUp 0.6s ease ${delay}s backwards`,
        cursor: 'default',
    }}>
        <img src={src} alt={alt}
             style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', opacity: 0.62 }}
             onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Colour tint overlay */}
        <div style={{ position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply' }} />
        {/* Bottom gradient + label */}
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(6,13,26,0.92) 0%, transparent 100%)',
            padding: '22px 12px 10px',
        }}>
            <span style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b',
            }}>{label}</span>
        </div>
        {/* Top-left category badge */}
        <div style={{
            position: 'absolute', top: 9, left: 10,
            background: 'rgba(6,13,26,0.65)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '2px 7px',
            fontSize: 8, color: '#94a3b8',
            fontFamily: "'JetBrains Mono', monospace",
        }}>{alt}</div>
    </div>
);

// ─── Main left panel ──────────────────────────────────────────────────────────
const LeftPanel = () => (
    <div style={{
        flex: '1 1 0', minWidth: 0,
        background: '#060d1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100vh',
    }}>

        {/* ══ HERO — Server / Infrastructure photo ════════════════════════════ */}
        <div style={{ position: 'relative', height: '26%', flexShrink: 0, overflow: 'hidden' }}>
            <img src={IMG.serverRoom} alt="Data center" style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: 'center 40%', opacity: 0.52, display: 'block',
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(6,13,26,0.1) 0%, rgba(6,13,26,0.0) 30%, rgba(6,13,26,1) 100%)',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,165,233,0.07)', mixBlendMode: 'screen' }} />

            {/* Brand lockup */}
            <div style={{ position: 'absolute', top: 22, left: 26, animation: 'vLoginFadeUp 0.6s ease 0.05s backwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(14,165,233,0.5)',
                    }}>
                        <Database size={14} color="#fff" />
                    </div>
                    <div>
                        <div style={{
                            fontSize: 21, fontWeight: 900, color: '#fff',
                            letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif",
                            lineHeight: 1, textShadow: '0 2px 14px rgba(0,0,0,0.7)',
                        }}>VIGIL</div>
                        <div style={{
                            fontSize: 8, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2,
                        }}>PostgreSQL Monitor</div>
                    </div>
                </div>
            </div>

            {/* v2.0 badge */}
            <div style={{
                position: 'absolute', top: 26, right: 22,
                background: 'rgba(14,165,233,0.18)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(14,165,233,0.35)',
                borderRadius: 20, padding: '3px 10px',
                fontSize: 9, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace",
            }}></div>
        </div>

        {/* ══ FIXED CONTENT — no scroll, fills remaining height ═══════════════ */}
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: '0 24px 20px', overflow: 'hidden',
            gap: 0,
        }}>

            {/* ── Tagline ── */}
            <div style={{
                padding: '14px 0 14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                flexShrink: 0,
                animation: 'vLoginFadeUp 0.6s ease 0.15s backwards',
            }}>
                <h2 style={{
                    fontSize: 17, fontWeight: 800, color: '#f1f5f9',
                    margin: '0 0 6px', lineHeight: 1.28,
                    letterSpacing: '-0.025em', fontFamily: "'Outfit', sans-serif",
                }}>
                    Total observability for{' '}
                    <span style={{ color: '#0ea5e9' }}>your Postgres clusters.</span>
                </h2>
                <p style={{
                    color: '#475569', fontSize: 11.5, lineHeight: 1.6, margin: 0,
                    fontFamily: "'Outfit', sans-serif", fontWeight: 400,
                }}>
                    A single pane of glass — connection pools, replication lag, slow-query forensics and storage trends.
                </p>
            </div>

            {/* ══ Dashboard UI + Data Viz side-by-side ════════════════════════ */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                paddingTop: 12, flexShrink: 0,
                animation: 'vLoginFadeUp 0.6s ease 0.25s backwards',
            }}>
                <ImgTile src={IMG.dashMockup}   alt="Dashboard UI"        label="Live Dashboard"  tint="rgba(14,165,233,0.35)"  h={100} delay={0.25} />
                <ImgTile src={IMG.dataViz}       alt="Data Visualization"  label="Charts & Trends" tint="rgba(168,139,250,0.35)" h={100} delay={0.32} />
            </div>

            {/* ══ Abstract Tech full-width ════════════════════════════════════ */}
            <div style={{ paddingTop: 8, flexShrink: 0, animation: 'vLoginFadeUp 0.6s ease 0.4s backwards' }}>
                <ImgTile src={IMG.abstractTech} alt="Network Topology" label="Cluster Replication & Network" tint="rgba(20,184,166,0.28)" h={80} delay={0.4} />
            </div>

            {/* ── Feature grid — 3 cols × 2 rows to stay compact ─────────── */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7,
                paddingTop: 12, flex: 1,
                animation: 'vLoginFadeUp 0.6s ease 0.5s backwards',
            }}>
                {FEATURES.map((f, i) => (
                    <div key={i}
                         style={{
                             background: 'rgba(255,255,255,0.025)',
                             border: `1px solid ${f.color}16`,
                             borderRadius: 10, padding: '10px 11px',
                             transition: 'background 0.2s, border-color 0.2s',
                             cursor: 'default', display: 'flex', flexDirection: 'column', gap: 5,
                         }}
                         onMouseEnter={e => { e.currentTarget.style.background = `${f.color}0b`; e.currentTarget.style.borderColor = `${f.color}38`; }}
                         onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = `${f.color}16`; }}
                    >
                        <div style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: `${f.color}14`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <f.icon size={11} color={f.color} />
                        </div>
                        <div style={{
                            fontSize: 10.5, fontWeight: 700, color: '#cbd5e1',
                            fontFamily: "'Outfit', sans-serif", lineHeight: 1.2,
                        }}>{f.label}</div>
                        <div style={{
                            fontSize: 9.5, color: '#334155', lineHeight: 1.45,
                            fontFamily: "'Outfit', sans-serif",
                        }}>{f.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── Security footer ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                paddingTop: 12, flexShrink: 0,
                animation: 'vLoginFadeUp 0.6s ease 0.65s backwards',
            }}>
                <Lock size={9} color="#1e293b" />
                <span style={{ fontSize: 9, color: '#1e293b', fontFamily: "'JetBrains Mono', monospace" }}>
                    End-to-end encrypted ·
                </span>
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATED BACKGROUND (right side)
// ═══════════════════════════════════════════════════════════════════════════

const RightBackground = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 80% 80% at 60% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)`,
        }} />
        <div style={{
            position: 'absolute', top: '20%', right: '-10%', width: 300, height: 300,
            background: `radial-gradient(circle, ${THEME.primary}06 0%, transparent 65%)`,
            animation: 'vOrbFloat2 20s ease-in-out infinite',
            filter: 'blur(30px)',
        }} />
        <div style={{
            position: 'absolute', bottom: '10%', left: '-5%', width: 200, height: 200,
            background: `radial-gradient(circle, ${THEME.secondary || '#38bdf8'}06 0%, transparent 65%)`,
            animation: 'vOrbFloat1 16s ease-in-out infinite',
            filter: 'blur(20px)',
        }} />
        {/* Noise */}
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.012,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
        }} />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LOGO EMBLEM
// ═══════════════════════════════════════════════════════════════════════════

const LogoEmblem = ({ success }) => {
    const size = 72;
    const c = size / 2;
    const r1 = 30, r2 = 24;

    return (
        <div style={{ position: 'relative', width: size, height: size, animation: 'vLogoPulse 4s ease-in-out infinite' }}>
            <div style={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                background: success
                    ? `radial-gradient(circle, ${THEME.success}20 0%, transparent 70%)`
                    : `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`,
                animation: 'vLogoGlow 3s ease-in-out infinite', transition: 'background 0.8s',
            }} />
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx={c} cy={c} r={r1} fill="none"
                        stroke={success ? THEME.success : THEME.primary}
                        strokeWidth="1" strokeDasharray="5 3" opacity="0.5"
                        style={{ transformOrigin: 'center', animation: 'vRingRotate 18s linear infinite', transition: 'stroke 0.8s' }} />
                <circle cx={c} cy={c} r={r2} fill="none"
                        stroke={success ? THEME.success : THEME.primary}
                        strokeWidth="1.5"
                        strokeDasharray={`${Math.PI * r2 * 0.6} ${Math.PI * r2 * 0.4}`}
                        strokeLinecap="round" opacity="0.7"
                        style={{ transformOrigin: 'center', animation: 'vRingRotateReverse 10s linear infinite', transition: 'stroke 0.8s' }} />
                {[0, 90, 180, 270].map(deg => (
                    <circle key={deg}
                            cx={c + r1 * Math.cos(deg * Math.PI / 180)}
                            cy={c + r1 * Math.sin(deg * Math.PI / 180)}
                            r="1.5" fill={success ? THEME.success : THEME.primary} opacity="0.6"
                            style={{ transition: 'fill 0.8s' }} />
                ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: success
                        ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal || '#14b8a6'})`
                        : `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || '#38bdf8'})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success ? `0 4px 20px ${THEME.success}40` : `0 4px 20px ${THEME.primary}30`,
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    {success
                        ? <CheckCircle size={20} color="#fff" style={{ animation: 'vSuccessPop 0.5s ease backwards' }} />
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
    const color = isOnline ? THEME.success : isOffline ? (THEME.danger || '#ef4444') : (THEME.warning || '#f59e0b');

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 12px 5px 9px', borderRadius: 100,
            background: `${color}08`, border: `1px solid ${color}18`,
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        }}>
            {checking ? (
                <>
                    <Loader size={9} color={THEME.textDim} style={{ animation: 'vSpin 1s linear infinite' }} />
                    <span style={{ color: THEME.textDim }}>Checking…</span>
                </>
            ) : (
                <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}80`, animation: isOnline ? 'vPulseDot 2s ease-in-out infinite' : 'none' }} />
                        {isOnline && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}60`, animation: 'vPulseRing 2s ease-out infinite' }} />}
                    </div>
                    <span style={{ color, fontWeight: 600, letterSpacing: '0.02em' }}>
                        {isOnline ? 'ONLINE' : isOffline ? 'OFFLINE' : 'DEGRADED'}
                    </span>
                    {status.latency != null && (
                        <span style={{ color: THEME.textDim, fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
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

const InputField = React.forwardRef(({
                                         icon: Icon, label, type = 'text', value, onChange,
                                         placeholder, autoComplete, disabled, rightElement
                                     }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label style={{
                display: 'block', marginBottom: 7, fontSize: 10, fontWeight: 700,
                color: focused ? THEME.primary : THEME.textDim,
                textTransform: 'uppercase', letterSpacing: '1.2px',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'color 0.2s',
            }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: focused ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${focused ? THEME.primary + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, padding: '0 14px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focused ? `0 0 0 3px ${THEME.primary}0d, 0 0 16px ${THEME.primary}08` : 'none',
                position: 'relative', overflow: 'hidden',
            }}>
                {focused && (
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: 1,
                        background: `linear-gradient(90deg, transparent, ${THEME.primary}40, transparent)`,
                        animation: 'vScanline 2s linear infinite',
                        pointerEvents: 'none',
                    }} />
                )}
                <Icon size={15} color={focused ? THEME.primary : hasValue ? THEME.textMuted : THEME.textDim}
                      style={{ flexShrink: 0, transition: 'color 0.2s' }} />
                <input
                    ref={ref} type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete} disabled={disabled}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="vigil-input"
                    style={{
                        flex: 1, padding: '13px 0', background: 'none', border: 'none',
                        color: THEME.textMain, fontSize: 13.5, outline: 'none',
                        fontFamily: "'Outfit', sans-serif", fontWeight: 400,
                        letterSpacing: '0.01em', opacity: disabled ? 0.4 : 1,
                    }}
                />
                {rightElement}
            </div>
        </div>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

const LoginPage = () => {
    const { login, authLoading, error, clearError } = useAuth();

    const [username, setUsername]         = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe]     = useState(false);
    const [serverStatus, setServerStatus] = useState({ status: 'checking' });
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [formShake, setFormShake]       = useState(false);

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    // ── Health check ─────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0 = performance.now();
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const data = await res.json();
                if (!cancelled) {
                    setServerStatus({
                        status: data.status === 'ok' ? 'online' : 'degraded',
                        latency: Math.round(performance.now() - t0),
                        dbLatency: data.dbLatencyMs,
                        pool: data.pool,
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

    // ── Restore remembered user ──────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) { setUsername(saved); setRememberMe(true); passwordRef.current?.focus(); }
        else usernameRef.current?.focus();
    }, []);

    // ── Shake on error ───────────────────────────────────────────────────
    useEffect(() => {
        if (error) { setFormShake(true); const t = setTimeout(() => setFormShake(false), 600); return () => clearTimeout(t); }
    }, [error]);

    // ── Clear error on typing ────────────────────────────────────────────
    useEffect(() => {
        if (error && clearError) clearError();
    }, [username, password]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username);
        else localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try {
            await login(username, password);
            setLoginSuccess(true);
        } catch { /* error set by context */ }
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;

    // ════════════════════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════════════════════

    return (
        <div style={{
            height: '100vh', width: '100vw',
            display: 'flex',
            background: THEME.bg || '#060d1a',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden',
        }}>
            <LoginStyles />

            {/* ═══ LEFT PANEL ═══ */}
            <LeftPanel />

            {/* ═══ RIGHT PANEL — Login Form ═══ */}
            <div style={{
                width: 480, flexShrink: 0,
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 48px',
                background: 'rgba(6, 13, 26, 0.95)',
            }}>
                <RightBackground />

                <div style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: 360,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    {/* Logo */}
                    <div style={{ marginBottom: 22, animation: 'vLoginFadeUp 0.6s ease 0.1s backwards' }}>
                        <LogoEmblem success={loginSuccess} />
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 6, animation: 'vLoginFadeUp 0.6s ease 0.2s backwards', width: '100%' }}>
                        <h1 style={{
                            fontSize: 26, fontWeight: 800, color: THEME.textMain,
                            margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em',
                        }}>Welcome back</h1>
                        <p style={{ color: THEME.textMuted, margin: '8px 0 0', fontSize: 13, fontWeight: 400, lineHeight: 1.5 }}>
                            Sign in to your monitoring dashboard
                        </p>
                    </div>

                    {/* Server status */}
                    <div style={{ margin: '14px 0 20px', animation: 'vLoginFadeUp 0.6s ease 0.3s backwards' }}>
                        <ServerStatus status={serverStatus} />
                    </div>

                    {/* Card */}
                    <div style={{
                        width: '100%',
                        padding: '30px 28px 26px',
                        borderRadius: 20,
                        background: 'rgba(14, 22, 42, 0.7)',
                        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                        border: `1px solid ${
                            loginSuccess ? (THEME.success || '#22c55e') + '40'
                                : error ? (THEME.danger || '#ef4444') + '35'
                                    : 'rgba(255,255,255,0.07)'
                        }`,
                        boxShadow: loginSuccess
                            ? `0 0 50px ${THEME.success || '#22c55e'}10, 0 20px 40px rgba(0,0,0,0.5)`
                            : '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
                        transition: 'border-color 0.5s, box-shadow 0.5s',
                        animation: formShake ? 'vLoginShake 0.5s ease' : 'vLoginFadeUp 0.7s ease 0.35s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top edge glow */}
                        <div style={{
                            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                            background: loginSuccess
                                ? `linear-gradient(90deg, transparent, ${THEME.success}60, transparent)`
                                : `linear-gradient(90deg, transparent, ${THEME.primary}35, transparent)`,
                            transition: 'background 0.5s',
                        }} />

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: `radial-gradient(circle at center, ${THEME.success}08 0%, transparent 70%)`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                zIndex: 20, borderRadius: 20,
                                animation: 'vLoginFadeIn 0.3s ease',
                            }}>
                                <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', border: `2px solid ${THEME.success}30`, animation: 'vSuccessRipple 1s ease-out forwards' }} />
                                <CheckCircle size={40} color={THEME.success || '#22c55e'} style={{ animation: 'vSuccessPop 0.5s ease backwards', marginBottom: 14 }} />
                                <div style={{ color: THEME.success, fontSize: 15, fontWeight: 700, animation: 'vLoginFadeUp 0.4s ease 0.2s backwards' }}>
                                    Authenticated
                                </div>
                                <div style={{ color: THEME.textDim, fontSize: 11, marginTop: 5, fontFamily: "'JetBrains Mono', monospace", animation: 'vLoginFadeUp 0.4s ease 0.35s backwards' }}>
                                    Redirecting to dashboard…
                                </div>
                            </div>
                        )}

                        {/* Error banner */}
                        {error && (
                            <div style={{
                                marginBottom: 18, padding: '10px 13px', borderRadius: 10,
                                background: `${THEME.danger || '#ef4444'}0a`,
                                border: `1px solid ${THEME.danger || '#ef4444'}25`,
                                display: 'flex', alignItems: 'center', gap: 9,
                                animation: 'vLoginSlideDown 0.3s ease backwards',
                            }}>
                                <AlertCircle size={14} color={THEME.danger || '#ef4444'} style={{ flexShrink: 0 }} />
                                <span style={{ color: THEME.danger || '#ef4444', fontSize: 12.5, fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <InputField
                                ref={usernameRef} icon={User} label="Username"
                                value={username} onChange={setUsername}
                                placeholder="Enter your username" autoComplete="username"
                                disabled={authLoading || loginSuccess}
                            />

                            <InputField
                                ref={passwordRef} icon={KeyRound} label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password} onChange={setPassword}
                                placeholder="Enter your password" autoComplete="current-password"
                                disabled={authLoading || loginSuccess}
                                rightElement={
                                    <button type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 4, display: 'flex', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = THEME.textMuted}
                                            onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}
                                            tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                }
                            />

                            {/* Remember me */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: THEME.textMuted, userSelect: 'none', marginTop: -4 }}>
                                <div
                                    onClick={() => setRememberMe(!rememberMe)}
                                    style={{
                                        width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                                        border: `1.5px solid ${rememberMe ? THEME.primary : 'rgba(255,255,255,0.12)'}`,
                                        background: rememberMe ? THEME.primary : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {rememberMe && (
                                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{ fontWeight: 400 }}>Remember me</span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    background: authLoading
                                        ? `${THEME.primary}60`
                                        : loginSuccess
                                            ? THEME.success || '#22c55e'
                                            : canSubmit
                                                ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || '#38bdf8'})`
                                                : `linear-gradient(135deg, ${THEME.primary}40, ${THEME.secondary || '#38bdf8'}40)`,
                                    border: 'none', padding: '13px 22px', borderRadius: 12,
                                    color: 'white', fontWeight: 700, fontSize: 13.5,
                                    fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em',
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    marginTop: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: canSubmit ? `0 4px 18px ${THEME.primary}35, 0 0 0 1px ${THEME.primary}20 inset` : 'none',
                                }}
                                onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${THEME.primary}45`; }}}
                                onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 18px ${THEME.primary}35`; }}}
                            >
                                {canSubmit && !authLoading && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        animation: 'vScanline 3s linear infinite', pointerEvents: 'none',
                                    }} />
                                )}
                                {authLoading ? (
                                    <><Loader size={15} style={{ animation: 'vSpin 1s linear infinite' }} /><span>Authenticating…</span></>
                                ) : loginSuccess ? (
                                    <><CheckCircle size={15} /><span>Success</span></>
                                ) : (
                                    <><span>Sign In</span><ArrowRight size={15} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 20, textAlign: 'center', animation: 'vLoginFadeUp 0.6s ease 0.6s backwards' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                            <Shield size={10} style={{ opacity: 0.5 }} />
                            <span>Secured by Vigil • PostgreSQL Monitor v2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;