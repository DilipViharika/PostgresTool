// ==========================================================================
//  VIGIL — Login Page  (Enhanced Edition)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Lock,
    Activity, Bell, Search, TrendingUp, RefreshCw, UserCheck,
} from 'lucide-react';

// ── Theme ──────────────────────────────────────────────────────────────────
const THEME = {
    bg:        '#020609',
    bgPanel:   '#03070e',
    primary:   '#0ea5e9',
    secondary: '#38bdf8',
    success:   '#22c55e',
    danger:    '#ef4444',
    warning:   '#f59e0b',
    teal:      '#14b8a6',
    textMain:  '#F1F5F9',
    textMuted: '#64748b',
    textDim:   '#1e3a5f',
};

const API_BASE = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) || 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020609; }

        @keyframes fadeUp      { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
        @keyframes slideDown   { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake       { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(2px)} 75%{transform:translateX(-1px)} }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes spinRev     { to { transform: rotate(-360deg); } }
        @keyframes pulseRing   { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.6);opacity:0} }
        @keyframes pulseDot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.85)} }
        @keyframes orb1        { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.1)} }
        @keyframes orb2        { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,30px) scale(1.08)} }
        @keyframes logoPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes logoGlow    { 0%,100%{box-shadow:0 0 30px rgba(14,165,233,0.2),0 0 80px rgba(14,165,233,0.06)} 50%{box-shadow:0 0 50px rgba(14,165,233,0.35),0 0 120px rgba(14,165,233,0.1)} }
        @keyframes successPop  { 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.2);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes successRipple{ 0%{transform:scale(.5);opacity:.6} 100%{transform:scale(3.5);opacity:0} }
        @keyframes borderPulse { 0%,100%{opacity:.2} 50%{opacity:.8} }
        @keyframes shimmer     { 0%{left:-100%} 100%{left:200%} }
        @keyframes glitchH     {
            0%,88%,100% { clip-path:none; transform:none; }
            90% { clip-path:inset(30% 0 55% 0); transform:translateX(-3px); }
            92% { clip-path:inset(70% 0 5% 0);  transform:translateX(3px);  }
            94% { clip-path:inset(15% 0 75% 0); transform:translateX(-2px); }
        }
        @keyframes scanH { 0%{top:0%;opacity:0} 5%{opacity:.35} 95%{opacity:.35} 100%{top:100%;opacity:0} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes tickerMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #03070e inset !important;
            -webkit-text-fill-color: #F1F5F9 !important;
            caret-color: #F1F5F9;
            transition: background-color 5000s ease-in-out 0s;
        }
        .v-input::placeholder { color: #1e3a5f; opacity: 1; }
        .v-input:focus::placeholder { opacity: 0; transition: opacity .2s; }

        .v-btn-primary::after {
            content: '';
            position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2.8s ease infinite;
            pointer-events: none;
        }
        .feature-card:hover {
            border-color: rgba(14,165,233,0.2) !important;
            background: rgba(14,165,233,0.06) !important;
            transform: translateY(-1px);
        }
        .screenshot-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(14,165,233,0.1);
        }
        .stat-pill:hover {
            background: rgba(14,165,233,0.12) !important;
            border-color: rgba(14,165,233,0.3) !important;
        }
    `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
//  DASHBOARD SCREENSHOTS
// ═══════════════════════════════════════════════════════════════════════════

const DBPanel = () => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg, #020d1f 0%, #040f25 50%, #030b18 100%)',
        borderRadius: 10, overflow: 'hidden', position: 'relative',
        fontFamily: 'JetBrains Mono, monospace',
    }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'linear-gradient(rgba(14,165,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px' }} />

        {/* Glow orb */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', width: 120, height: 120,
            background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
            transform: 'translateX(-50%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

        {/* Title bar */}
        <div style={{ padding: '7px 10px', borderBottom: '1px solid rgba(14,165,233,0.1)',
            display: 'flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: 6, fontSize: 6, color: '#1e3a5f', letterSpacing: '.08em' }}>pg_monitor · query_analytics</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                <div style={{ background: 'rgba(14,165,233,0.14)', border: '1px solid rgba(14,165,233,0.28)', borderRadius: 3, padding: '1px 5px' }}>
                    <span style={{ fontSize: 5.5, color: '#38bdf8', fontWeight: 700 }}>LIVE</span>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 3, padding: '1px 5px' }}>
                    <span style={{ fontSize: 5.5, color: '#22c55e', fontWeight: 700 }}>v16.2</span>
                </div>
            </div>
        </div>

        <div style={{ padding: '8px 10px', position: 'relative', zIndex: 1, display: 'flex', gap: 8 }}>
            {/* Left: DB Stack + stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 72, flexShrink: 0 }}>
                {/* 3D cylinder DB */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.14)', borderRadius: 7, padding: '6px 4px 5px' }}>
                    <svg width="46" height="44" viewBox="0 0 46 44">
                        <defs>
                            <linearGradient id="dbBody" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.6"/>
                                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6"/>
                            </linearGradient>
                            <linearGradient id="dbTop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9"/>
                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7"/>
                            </linearGradient>
                        </defs>
                        {/* Body */}
                        <rect x="8" y="10" width="30" height="22" fill="url(#dbBody)" rx="2"/>
                        {/* Disk layers */}
                        <ellipse cx="23" cy="10" rx="15" ry="4" fill="url(#dbTop)" opacity="0.9"/>
                        <ellipse cx="23" cy="18" rx="15" ry="4" fill="none" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.4"/>
                        <ellipse cx="23" cy="26" rx="15" ry="4" fill="none" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.3"/>
                        <ellipse cx="23" cy="32" rx="15" ry="4" fill="#0c2a45" stroke="#0ea5e9" strokeWidth="1" opacity="0.8"/>
                        {/* Shine */}
                        <ellipse cx="19" cy="9" rx="5" ry="1.5" fill="white" opacity="0.15"/>
                        {/* Connector dots */}
                        <circle cx="8" cy="18" r="1.2" fill="#38bdf8" opacity="0.7"/>
                        <circle cx="8" cy="24" r="1.2" fill="#38bdf8" opacity="0.5"/>
                        <line x1="4" y1="18" x2="8" y2="18" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5"/>
                        <line x1="4" y1="24" x2="8" y2="24" stroke="#38bdf8" strokeWidth="0.8" opacity="0.35"/>
                    </svg>
                    <span style={{ fontSize: 5.5, color: '#38bdf8', fontWeight: 700, letterSpacing: '.08em', marginTop: 1 }}>PRIMARY</span>
                    <span style={{ fontSize: 4.5, color: '#1e3a5f', marginTop: 1 }}>postgres:16</span>
                </div>
                {/* Mini stat pills */}
                {[
                    { l: 'QPS',  v: '12.8k', c: '#0ea5e9' },
                    { l: 'P99',  v: '4.2ms', c: '#22c55e' },
                    { l: 'HIT',  v: '97.4%', c: '#14b8a6' },
                ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: `${c}0c`, border: `1px solid ${c}1a`, borderRadius: 5, padding: '3px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 5.5, color: '#1e3a5f' }}>{l}</span>
                        <span style={{ fontSize: 7.5, color: c, fontWeight: 700 }}>{v}</span>
                    </div>
                ))}
            </div>

            {/* Right: query list + sparkline */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {/* Active queries */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '5px 7px' }}>
                    <div style={{ fontSize: 5.5, color: '#1e3a5f', marginBottom: 4, letterSpacing: '.06em' }}>● ACTIVE QUERIES (3)</div>
                    {[
                        { q: 'SELECT * FROM orders WHERE status=', t: '1.2ms', s: '#22c55e' },
                        { q: 'UPDATE users SET last_seen = NOW()', t: '8.4ms', s: '#f59e0b' },
                        { q: 'EXPLAIN ANALYZE SELECT id, name FR', t: '0.3ms', s: '#0ea5e9' },
                    ].map(({ q, t, s }, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: i < 2 ? 3 : 0, paddingBottom: i < 2 ? 3 : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                            <div style={{ width: 3, height: 3, borderRadius: '50%', background: s, flexShrink: 0 }} />
                            <span style={{ fontSize: 5.5, color: '#162840', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{q}</span>
                            <span style={{ fontSize: 5.5, color: s, fontWeight: 700, flexShrink: 0 }}>{t}</span>
                        </div>
                    ))}
                </div>

                {/* Connection pool bar */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '5px 7px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 5.5, color: '#1e3a5f' }}>CONNECTION POOL</span>
                        <span style={{ fontSize: 5.5, color: '#0ea5e9', fontWeight: 700 }}>342 / 500</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8)', borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ fontSize: 4.5, color: '#0d1e30' }}>idle: 158</span>
                        <span style={{ fontSize: 4.5, color: '#0d1e30' }}>active: 184</span>
                        <span style={{ fontSize: 4.5, color: '#f59e0b' }}>wait: 0</span>
                    </div>
                </div>

                {/* Tiny sparkline */}
                <svg width="100%" height="16" viewBox="0 0 120 16" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35"/>
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,12 C10,10 20,4 30,6 C40,8 50,2 60,4 C70,6 80,1 90,3 C100,5 110,2 120,1 L120,16 L0,16 Z" fill="url(#spk)"/>
                    <path d="M0,12 C10,10 20,4 30,6 C40,8 50,2 60,4 C70,6 80,1 90,3 C100,5 110,2 120,1" fill="none" stroke="#0ea5e9" strokeWidth="1.2"/>
                    <circle cx="120" cy="1" r="2" fill="#38bdf8"/>
                </svg>
            </div>
        </div>

        {/* Footer label */}
        <div style={{ position: 'absolute', bottom: 5, left: 10, right: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#0ea5e9', animation: 'pulseDot 2s ease infinite' }} />
                <span style={{ fontSize: 6, color: '#0ea5e9', letterSpacing: '.1em', fontWeight: 700 }}>DATABASE MONITOR</span>
            </div>
            <span style={{ fontSize: 5.5, color: '#0d1e30' }}>uptime 99.98%</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.18), transparent)', animation: 'scanH 6s linear infinite', top: 0 }} />
    </div>
);

const InfraPanel = () => (
    <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg, #020e08 0%, #041208 50%, #030d07 100%)',
        borderRadius: 10, overflow: 'hidden', position: 'relative',
        fontFamily: 'JetBrains Mono, monospace',
    }}>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035,
            backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)',
            filter: 'blur(18px)', pointerEvents: 'none' }} />

        {/* Title bar */}
        <div style={{ padding: '7px 10px', borderBottom: '1px solid rgba(20,184,166,0.1)',
            display: 'flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: 6, fontSize: 6, color: '#0d2818', letterSpacing: '.08em' }}>infra · cluster-prod-01</span>
            <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 3, padding: '1px 5px' }}>
                <span style={{ fontSize: 5.5, color: '#22c55e', fontWeight: 700 }}>ALL HEALTHY</span>
            </div>
        </div>

        <div style={{ padding: '8px 10px', position: 'relative', zIndex: 1, display: 'flex', gap: 7 }}>
            {/* Server rack illustration */}
            <div style={{ width: 44, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 5, color: '#0d2818', letterSpacing: '.06em', marginBottom: 1 }}>RACK · SLOT</span>
                {[
                    { id: 'SRV-01', role: 'PRIMARY',  color: '#22c55e', cpu: 62, load: '●●●○○' },
                    { id: 'SRV-02', role: 'REPLICA',  color: '#22c55e', cpu: 41, load: '●●○○○' },
                    { id: 'SRV-03', role: 'REPLICA',  color: '#f59e0b', cpu: 78, load: '●●●●○' },
                    { id: 'SRV-04', role: 'STANDBY',  color: '#14b8a6', cpu: 18, load: '●○○○○' },
                ].map(({ id, role, color, cpu, load }) => (
                    <div key={id} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${color}20`, borderRadius: 4, padding: '3px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                            <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, animation: 'pulseDot 2s ease infinite' }} />
                            <span style={{ fontSize: 5, color: '#0d2818', fontWeight: 700 }}>{id}</span>
                            <span style={{ fontSize: 4.5, color: color, marginLeft: 'auto' }}>{role}</span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${cpu}%`, height: '100%', background: `linear-gradient(90deg, ${color}70, ${color})`, borderRadius: 2 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 1.5 }}>
                            <span style={{ fontSize: 4, color: '#0d2818' }}>CPU {cpu}%</span>
                            <span style={{ fontSize: 4, color: color, letterSpacing: 1 }}>{load}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right: metrics */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Resource gauges */}
                {[
                    { label: 'MEMORY',   used: 81, total: '64 GB',  color: '#f59e0b', used_label: '51.8 GB' },
                    { label: 'STORAGE',  used: 44, total: '2 TB',   color: '#22c55e', used_label: '880 GB'  },
                    { label: 'NETWORK',  used: 35, total: '10 Gbps',color: '#0ea5e9', used_label: '3.5 Gbps'},
                    { label: 'IOPS',     used: 58, total: '50k',    color: '#14b8a6', used_label: '29k'     },
                ].map(({ label, used, total, color, used_label }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 5, padding: '4px 6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontSize: 5.5, color: '#0d2818', letterSpacing: '.04em' }}>{label}</span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <span style={{ fontSize: 5.5, color, fontWeight: 700 }}>{used_label}</span>
                                <span style={{ fontSize: 4.5, color: '#0d2018' }}>/ {total}</span>
                            </div>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${used}%`, height: '100%', background: `linear-gradient(90deg, ${color}60, ${color})`, borderRadius: 2 }} />
                            {/* Tick marks */}
                            {[25,50,75].map(p => (
                                <div key={p} style={{ position: 'absolute', top: 0, bottom: 0, left: `${p}%`, width: 1, background: 'rgba(255,255,255,0.08)' }} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Alert log snippet */}
                <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 5, padding: '4px 6px', marginTop: 1 }}>
                    <div style={{ fontSize: 5.5, color: '#1e3a5f', marginBottom: 2 }}>RECENT ALERTS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ fontSize: 5, color: '#162020' }}>SRV-03 · CPU spike &gt; 75% · 2m ago</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 5, color: '#162020' }}>WAL archival complete · 5m ago</span>
                    </div>
                </div>
            </div>
        </div>

        <div style={{ position: 'absolute', bottom: 5, left: 10, right: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14b8a6', animation: 'pulseDot 2.5s ease infinite' }} />
                <span style={{ fontSize: 6, color: '#14b8a6', letterSpacing: '.1em', fontWeight: 700 }}>INFRASTRUCTURE</span>
            </div>
            <span style={{ fontSize: 5.5, color: '#0d2818' }}>4 nodes · 0 alerts</span>
        </div>
    </div>
);


const FEATURES = [
    { icon: Activity,   label: 'Real-Time Metrics', desc: 'QPS, latency & cache hit ratios — live.',    color: '#0ea5e9' },
    { icon: Bell,       label: 'Smart Alerting',    desc: 'Slow query & replication log alerts.',        color: '#a78bfa' },
    { icon: Search,     label: 'Query Inspector',   desc: 'EXPLAIN plans & pg_stat_statements.',         color: '#f59e0b' },
    { icon: RefreshCw,  label: 'Replication',       desc: 'WAL archiving & standby lag tracking.',       color: '#14b8a6' },
    { icon: TrendingUp, label: 'Trend Analysis',    desc: 'Anomaly detection across clusters.',          color: '#f43f5e' },
    { icon: UserCheck,  label: 'Access Audit',      desc: 'RBAC with full compliance trails.',           color: '#22c55e' },
];

const FeatureCard = ({ icon: Icon, label, desc, color }) => (
    <div
        className="feature-card"
        style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 12, padding: '13px',
            display: 'flex', flexDirection: 'column', gap: 7,
            cursor: 'default', transition: 'all .22s ease',
        }}
    >
        <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${color}15`,
            border: `1px solid ${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={13} color={color} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c8d6e5', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 9.5, color: '#334155', lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{desc}</div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LEFT PANEL
// ═══════════════════════════════════════════════════════════════════════════

const LeftPanel = () => (
    <div style={{
        flex: '1 1 0', minWidth: 0,
        background: THEME.bgPanel,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative', height: '100vh',
    }}>
        {/* Grid bg */}
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.018, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(14,165,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
        }} />
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 65% 55% at 25% 15%, rgba(14,165,233,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 55% at 75% 85%, rgba(20,184,166,0.04) 0%, transparent 70%)` }} />

        {/* ── Top status bar ── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}>
                    <Database size={13} color="#fff" />
                </div>
                <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', display: 'block', lineHeight: 1 }}>PostgreSQL Monitor</span>
                    <span style={{ fontSize: 8, color: '#1e3a5f', fontFamily: "'JetBrains Mono', monospace" }}>v2.0.1 · Production</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Uptime badge */}
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulseDot 2s ease infinite' }} />
                    <span style={{ color: '#22c55e', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '.08em' }}>99.9% UPTIME</span>
                </div>
                <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0ea5e9', animation: 'pulseDot 2s ease infinite .3s' }} />
                    <span style={{ color: '#0ea5e9', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '.08em' }}>MONITOR</span>
                </div>
            </div>
        </div>

        {/* ── Content ── */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Heading */}
            <div style={{ padding: '18px 24px 14px', flexShrink: 0, animation: 'fadeUp .6s ease .05s backwards' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', fontFamily: "'Syne', sans-serif", lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 6 }}>
                    Total observability for{' '}
                    <span style={{ color: '#0ea5e9', display: 'inline-block', animation: 'glitchH 8s ease-in-out infinite' }}>
                        your Postgres clusters.
                    </span>
                </h2>
                <p style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                    A single pane of glass — connection pools, replication lag, slow-query forensics and storage trends.
                </p>
            </div>

            {/* Preview Panels */}
            <div style={{ padding: '0 24px', flexShrink: 0, animation: 'fadeUp .6s ease .15s backwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="screenshot-card" style={{ height: 155, borderRadius: 11, border: '1px solid rgba(14,165,233,0.1)', overflow: 'hidden', transition: 'all .3s ease', cursor: 'pointer', boxShadow: '0 4px 24px rgba(14,165,233,0.06)' }}>
                        <DBPanel />
                    </div>
                    <div className="screenshot-card" style={{ height: 155, borderRadius: 11, border: '1px solid rgba(20,184,166,0.1)', overflow: 'hidden', transition: 'all .3s ease', cursor: 'pointer', boxShadow: '0 4px 24px rgba(20,184,166,0.06)' }}>
                        <InfraPanel />
                    </div>
                </div>
            </div>

            {/* Feature grid */}
            <div style={{ padding: '0 24px', flex: 1, minHeight: 0, animation: 'fadeUp .6s ease .25s backwards' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                    {FEATURES.map(f => <FeatureCard key={f.label} {...f} />)}
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 24px 14px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Lock size={8} color="#1e3a5f" />
                    <span style={{ fontSize: 8, color: '#1e3a5f', fontFamily: "'JetBrains Mono', monospace" }}>End-to-end encrypted · SOC 2 Type II</span>
                </div>
                <span style={{ fontSize: 8, color: '#1e3a5f', fontFamily: "'JetBrains Mono', monospace" }}>© 2025 Vigil</span>
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  RIGHT BG
// ═══════════════════════════════════════════════════════════════════════════

const RightBackground = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '5%', right: '-20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(14,165,233,0.055) 0%, transparent 65%)', animation: 'orb2 24s ease-in-out infinite', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(20,184,166,0.045) 0%, transparent 65%)', animation: 'orb1 18s ease-in-out infinite', filter: 'blur(35px)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.012, backgroundImage: `linear-gradient(rgba(14,165,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)`, backgroundSize: '44px 44px' }} />
        {/* Vertical accent line */}
        <div style={{ position: 'absolute', top: '15%', bottom: '15%', left: '50%', width: 1, background: 'linear-gradient(180deg, transparent, rgba(14,165,233,0.06) 40%, rgba(14,165,233,0.06) 60%, transparent)', transform: 'translateX(-50%)' }} />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LOGO EMBLEM
// ═══════════════════════════════════════════════════════════════════════════

const LogoEmblem = ({ success }) => {
    const size = 86, c = 43, r1 = 37, r2 = 28, r3 = 20;
    const col1 = success ? THEME.success : THEME.primary;
    const col2 = success ? THEME.success : THEME.secondary;
    return (
        <div style={{ position: 'relative', width: size, height: size, animation: 'logoPulse 4.5s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: success ? 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)', animation: 'logoGlow 3s ease-in-out infinite', transition: 'background .8s' }} />
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx={c} cy={c} r={r1} fill="none" stroke={col1} strokeWidth="1" strokeDasharray="4 3" opacity=".35" style={{ transformOrigin: 'center', animation: 'spin 22s linear infinite', transition: 'stroke .8s' }} />
                <circle cx={c} cy={c} r={r2} fill="none" stroke={col1} strokeWidth="1.5" strokeDasharray={`${Math.PI * r2 * .65} ${Math.PI * r2 * .35}`} strokeLinecap="round" opacity=".7" style={{ transformOrigin: 'center', animation: 'spinRev 11s linear infinite', transition: 'stroke .8s' }} />
                <circle cx={c} cy={c} r={r3} fill="none" stroke={col2} strokeWidth="0.8" strokeDasharray="2 4" opacity=".3" style={{ transformOrigin: 'center', animation: 'spin 7s linear infinite', transition: 'stroke .8s' }} />
                {[0,72,144,216,288].map((deg, i) => (
                    <circle key={deg} cx={c + r1 * Math.cos(deg * Math.PI / 180)} cy={c + r1 * Math.sin(deg * Math.PI / 180)} r="2" fill={col1} opacity={0.5 + i * 0.09} style={{ transition: 'fill .8s' }} />
                ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: success ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal})` : `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success ? '0 4px 24px rgba(34,197,94,0.5)' : '0 4px 24px rgba(14,165,233,0.45)',
                    transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
                }}>
                    {success ? <CheckCircle size={23} color="#fff" style={{ animation: 'successPop .5s ease backwards' }} /> : <Database size={23} color="#fff" />}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERVER STATUS
// ═══════════════════════════════════════════════════════════════════════════

const ServerStatus = ({ status }) => {
    const isOnline = status.status === 'online';
    const isOffline = status.status === 'offline';
    const checking = status.status === 'checking';
    const color = isOnline ? THEME.success : isOffline ? THEME.danger : THEME.warning;
    const label = isOnline ? 'ONLINE' : isOffline ? 'OFFLINE' : checking ? 'Checking…' : 'DEGRADED';

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px 5px 10px', borderRadius: 100, background: `${color}08`, border: `1px solid ${color}22`, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
            {checking ? (
                <><Loader size={9} color={THEME.textMuted} style={{ animation: 'spin 1s linear infinite' }} /><span style={{ color: THEME.textMuted }}>Checking…</span></>
            ) : (
                <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}90`, animation: isOnline ? 'pulseDot 2s ease-in-out infinite' : 'none' }} />
                        {isOnline && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}60`, animation: 'pulseRing 2s ease-out infinite' }} />}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '.05em' }}>{label}</span>
                    {status.latency != null && (
                        <span style={{ color: '#1e3a5f', fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
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

const InputField = React.forwardRef(function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, disabled, rightElement }, ref) {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label style={{ display: 'block', marginBottom: 7, fontSize: 9.5, fontWeight: 600, color: focused ? THEME.primary : '#2a4060', textTransform: 'uppercase', letterSpacing: '1.4px', fontFamily: "'JetBrains Mono', monospace", transition: 'color .2s' }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: focused ? 'rgba(14,165,233,0.055)' : 'rgba(255,255,255,0.022)',
                border: `1px solid ${focused ? THEME.primary + '50' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 13, padding: '0 14px',
                transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                boxShadow: focused ? `0 0 0 3.5px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.04)` : 'inset 0 1px 0 rgba(255,255,255,0.025)',
            }}>
                <Icon size={15} color={focused ? THEME.primary : hasValue ? '#3a5575' : '#1a3050'} style={{ flexShrink: 0, transition: 'color .2s' }} />
                <input
                    ref={ref} type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="v-input"
                    style={{ flex: 1, padding: '13px 0', background: 'none', border: 'none', color: THEME.textMain, fontSize: 13.5, outline: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: '0.01em', opacity: disabled ? 0.4 : 1 }}
                />
                {rightElement}
            </div>
        </div>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
//  CORNER ACCENTS
// ═══════════════════════════════════════════════════════════════════════════

const CornerAccents = ({ color = 'rgba(14,165,233,0.25)' }) => {
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
                        position: 'absolute', width: 14, height: 14, pointerEvents: 'none', borderRadius,
                        borderTop:    borderTop    ? `1px solid ${color}` : 'none',
                        borderBottom: borderBottom ? `1px solid ${color}` : 'none',
                        borderLeft:   borderLeft   ? `1px solid ${color}` : 'none',
                        borderRight:  borderRight  ? `1px solid ${color}` : 'none',
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
    // Mocked auth for demo
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState(null);

    const [username,     setUsername]     = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe,   setRememberMe]   = useState(false);
    const [serverStatus, setServerStatus] = useState({ status: 'online', latency: 12 });
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [formShake,    setFormShake]    = useState(false);
    const [btnHover,     setBtnHover]     = useState(false);

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    const clearError = useCallback(() => setError(null), []);

    useEffect(() => {
        if (error) {
            setFormShake(true);
            const t = setTimeout(() => setFormShake(false), 600);
            return () => clearTimeout(t);
        }
    }, [error]);

    useEffect(() => {
        if (error) clearError();
    }, [username, password]);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        setAuthLoading(true);
        // Simulate login
        await new Promise(r => setTimeout(r, 1600));
        setAuthLoading(false);
        if (username === 'wrong') {
            setError('Invalid username or password. Please try again.');
        } else {
            setLoginSuccess(true);
        }
    }, [username, password]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;

    const btnBg = authLoading
        ? 'rgba(14,165,233,0.5)'
        : loginSuccess
            ? THEME.success
            : canSubmit
                ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #38bdf8 100%)'
                : 'rgba(14,165,233,0.12)';

    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? btnHover
            ? '0 10px 32px rgba(14,165,233,0.55), 0 0 0 1px rgba(14,165,233,0.3) inset'
            : '0 4px 20px rgba(14,165,233,0.32), 0 0 0 1px rgba(14,165,233,0.18) inset'
        : 'none';

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: THEME.bg, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
            <GlobalStyles />

            {/* LEFT */}
            <LeftPanel />

            {/* RIGHT */}
            <div style={{
                width: 490, flexShrink: 0, position: 'relative',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '36px 44px',
                background: 'rgba(2,6,9,0.98)',
                borderLeft: '1px solid rgba(14,165,233,0.06)',
            }}>
                <RightBackground />

                {/* Decorative top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.6) 30%, rgba(56,189,248,0.8) 50%, rgba(14,165,233,0.6) 70%, transparent 100%)', opacity: 0.7 }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 370, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Logo */}
                    <div style={{ marginBottom: 20, animation: 'fadeUp .6s ease .1s backwards' }}>
                        <LogoEmblem success={loginSuccess} />
                    </div>

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: 4, animation: 'fadeUp .6s ease .18s backwards', width: '100%' }}>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: THEME.textMain, margin: 0, lineHeight: 1.1, letterSpacing: '-0.04em', fontFamily: "'Syne', sans-serif" }}>
                            Welcome back
                        </h1>
                        <p style={{ color: '#2a4060', margin: '9px 0 0', fontSize: 12, fontWeight: 400, lineHeight: 1.55 }}>
                            Sign in to your monitoring dashboard
                        </p>
                    </div>

                    {/* Divider with server status */}
                    <div style={{ margin: '16px 0 18px', display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                        <ServerStatus status={serverStatus} />
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
                    </div>

                    {/* Card */}
                    <div style={{
                        width: '100%',
                        padding: '28px 26px 24px',
                        borderRadius: 22,
                        background: 'rgba(8,16,32,0.8)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        border: `1px solid ${loginSuccess ? THEME.success + '40' : error ? THEME.danger + '30' : 'rgba(255,255,255,0.065)'}`,
                        boxShadow: loginSuccess
                            ? '0 0 70px rgba(34,197,94,0.1), 0 28px 60px rgba(0,0,0,0.6)'
                            : '0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.025) inset',
                        transition: 'border-color .55s, box-shadow .55s',
                        animation: formShake ? 'shake .5s ease' : 'fadeUp .7s ease .32s backwards',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Top glow */}
                        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: loginSuccess ? `linear-gradient(90deg, transparent, ${THEME.success}60, transparent)` : `linear-gradient(90deg, transparent, ${THEME.primary}40, transparent)`, transition: 'background .55s', animation: 'borderPulse 3s ease-in-out infinite' }} />

                        <CornerAccents color={loginSuccess ? 'rgba(34,197,94,0.3)' : 'rgba(14,165,233,0.22)'} />

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, transparent 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, borderRadius: 22, animation: 'fadeIn .3s ease' }}>
                                <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: `2px solid ${THEME.success}30`, animation: 'successRipple 1s ease-out forwards' }} />
                                <CheckCircle size={44} color={THEME.success} style={{ animation: 'successPop .5s ease backwards', marginBottom: 14 }} />
                                <div style={{ color: THEME.success, fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", animation: 'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color: '#1e3a5f', fontSize: 10, marginTop: 6, fontFamily: "'JetBrains Mono', monospace", animation: 'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ marginBottom: 18, padding: '10px 13px', borderRadius: 10, background: `${THEME.danger}08`, border: `1px solid ${THEME.danger}22`, display: 'flex', alignItems: 'center', gap: 9, animation: 'slideDown .3s ease backwards' }}>
                                <AlertCircle size={14} color={THEME.danger} style={{ flexShrink: 0 }} />
                                <span style={{ color: THEME.danger, fontSize: 12, fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <InputField ref={usernameRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading || loginSuccess} />
                            <InputField ref={passwordRef} icon={KeyRound} label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading || loginSuccess}
                                        rightElement={
                                            <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', padding: 4, display: 'flex', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color='#475569'} onMouseLeave={e => e.currentTarget.style.color='#1e3a5f'}>
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        }
                            />

                            {/* Remember me + Forgot */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -3 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${rememberMe ? THEME.primary : 'rgba(255,255,255,0.1)'}`, background: rememberMe ? THEME.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow: rememberMe ? '0 0 12px rgba(14,165,233,0.4)' : 'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </div>
                                    <span style={{ fontSize: 11.5, color: '#334155', fontFamily: "'DM Sans', sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: '#1e3a5f', fontFamily: "'DM Sans', sans-serif", transition: 'color .2s', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color='#38bdf8'} onMouseLeave={e => e.currentTarget.style.color='#1e3a5f'}>
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                className={canSubmit && !authLoading ? 'v-btn-primary' : ''}
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    background: btnBg,
                                    border: canSubmit ? `1px solid ${loginSuccess ? THEME.success : THEME.primary}30` : '1px solid rgba(255,255,255,0.04)',
                                    padding: '14px 22px', borderRadius: 13,
                                    color: 'white', fontWeight: 700, fontSize: 14,
                                    fontFamily: "'Syne', sans-serif", letterSpacing: '0.02em',
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    marginTop: 5,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all .28s cubic-bezier(.4,0,.2,1)',
                                    boxShadow: btnShadow,
                                    transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                            >
                                {authLoading ? (
                                    <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Authenticating…</span></>
                                ) : loginSuccess ? (
                                    <><CheckCircle size={15} /><span>Access Granted</span></>
                                ) : (
                                    <><span>Sign In</span><ArrowRight size={15} style={{ transition: 'transform .25s', transform: btnHover ? 'translateX(4px)' : 'translateX(0)' }} /></>
                                )}
                            </button>
                        </form>

                        {/* Bottom hint */}
                        {!loginSuccess && (
                            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1e3a5f' }} />
                                <span style={{ fontSize: 10, color: '#1e3a5f', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.04em' }}>Admin access only · Contact your DBA for credentials</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 18, textAlign: 'center', animation: 'fadeUp .6s ease .6s backwards' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 9, color: '#1a2e45', fontFamily: "'JetBrains Mono', monospace" }}>
                            <Shield size={8} style={{ opacity: .35 }} />
                            <span>Secured by Vigil · PostgreSQL Monitor v2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;