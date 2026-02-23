import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Database, Eye, EyeOff, Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Shield, Zap, Cpu, Server, Bell, Activity, Lock, Check
} from 'lucide-react';

// Mocking useAuth for this standalone snippet:
const useAuth = () => ({ login: async () => new Promise(res => setTimeout(res, 1000)), authLoading: false, error: null, clearError: () => {} });

const API_BASE = 'http://localhost:5000'; // Mock API

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #07080F; overflow: hidden; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes spinRev   { to{transform:rotate(-360deg)} }
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.78)} }
        @keyframes ringOut   { 0%{transform:scale(.7);opacity:.8} 100%{transform:scale(2.8);opacity:0} }
        @keyframes successPop{ 0%{transform:scale(0) rotate(-45deg);opacity:0} 55%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes logoPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 28px rgba(129,140,248,.22)} 50%{box-shadow:0 0 46px rgba(129,140,248,.42)} }

        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #080e1a inset !important;
            -webkit-text-fill-color: #e2e8f0 !important;
            caret-color: #e2e8f0;
            transition: background-color 5000s ease-in-out 0s;
        }
        .vi-input::placeholder { color:#1a2a44; opacity:1; }
        .vi-input:focus::placeholder { opacity:0; transition:opacity .2s; }
        
        /* Custom scrollbar for smaller screens */
        .left-panel-scroll::-webkit-scrollbar { width: 6px; }
        .left-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .left-panel-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  SCANNABLE FEATURES GRID
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_FEATURES = [
    { label: 'Query Profiling', desc: 'Isolate slow transaction bottlenecks.', tags: ['EXPLAIN ANALYZE', 'Slow Logs'], color: '#FDE047', icon: Zap },
    { label: 'Resource Metrics', desc: 'Track node-level hardware utilization.', tags: ['CPU & Memory', 'Disk IOPS'], color: '#34D399', icon: Cpu },
    { label: 'Fleet Topology', desc: 'Monitor multi-node health and routing.', tags: ['Replication Lag', 'Failovers'], color: '#7DD3FC', icon: Server },
    { label: 'Security Audits', desc: 'Identify vulnerability gaps and roles.', tags: ['Access Logs', 'RBAC Scans'], color: '#FB7185', icon: Shield },
];

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK UI DASHBOARD SNIPPET (Acts as our visual/image)
// ─────────────────────────────────────────────────────────────────────────────
const DashboardSnippet = () => (
    <div style={{ marginTop: 40, padding: 20, borderRadius: 16, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', animation: 'fadeUp 1s ease .4s backwards' }}>
        {/* Glow effect inside card */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={14} color="#818CF8" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#A5B4FC', letterSpacing: '1px', textTransform: 'uppercase' }}>Global QPS Pulse</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', padding: '4px 8px', borderRadius: 20, border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: '#34D399', fontWeight: 600 }}>14.2k req/s</span>
            </div>
        </div>

        {/* Abstract Sparkline Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 45, opacity: 0.8 }}>
            {[20, 35, 25, 60, 45, 80, 55, 90, 70, 40, 65, 30, 85, 50, 75, 95, 60, 45].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 80 ? '#FDE047' : '#818CF8', borderRadius: '2px 2px 0 0', opacity: h > 80 ? 0.9 : 0.4, transition: 'height 0.5s ease' }} />
            ))}
        </div>
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginTop: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)', fontFamily: "'JetBrains Mono',monospace" }}>-1h</span>
            <span style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)', fontFamily: "'JetBrains Mono',monospace" }}>Now</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LEFT PANEL (Clean, Static, Informative)
// ─────────────────────────────────────────────────────────────────────────────
const LeftPanel = () => {
    return (
        <div className="left-panel-scroll" style={{ flex: '1 1 0', minWidth: 0, height: '100vh', position: 'relative', overflowY: 'auto', overflowX: 'hidden', background: '#07080F', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', padding: '6% 10%' }}>

            {/* Extremely subtle background glows */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(circle at 10% 20%, rgba(129,140,248,.06) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(52,211,153,.04) 0%, transparent 40%)`}}/>
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: .018, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>

            {/* Top Logo Array */}
            <div style={{ position: 'relative', zIndex: 8, display: 'flex', alignItems: 'center', gap: 11, marginBottom: '8vh', animation: 'fadeIn .7s ease' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(145deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px rgba(255,255,255,.10) inset, 0 8px 24px rgba(99,102,241,.3)' }}>
                    <Database size={17} color="#fff"/>
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#E8EAF4', fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.3px', lineHeight: 1 }}></div>
                    <div style={{ fontSize: 8.5, color: 'rgba(107,119,153,.60)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2.5, letterSpacing: '2px', textTransform: 'uppercase' }}>PostgreSQL Intelligence</div>
                </div>
            </div>

            {/* Main Content Container */}
            <div style={{ position: 'relative', zIndex: 8, maxWidth: 640, margin: 'auto 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, animation: 'fadeUp .8s ease backwards' }}>
                    <div style={{ width: 24, height: 1, background: 'rgba(129,140,248,.70)' }}/>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#818CF8' }}>Database Observability</span>
                </div>

                <div style={{ marginBottom: 16, animation: 'fadeUp .8s ease .1s backwards' }}>
                    <h1 style={{ margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.4px', color: '#E8EAF4' }}>
                        Monitor every query,<br/>
                        <em style={{ fontStyle: 'italic', color: '#818CF8' }}>beautifully.</em>
                    </h1>
                </div>

                <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(148,163,184,.9)', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 480, fontFamily: "'DM Sans',sans-serif", animation: 'fadeUp .8s ease .2s backwards' }}>
                    Enterprise-grade visibility across your PostgreSQL ecosystem.
                    From dead-tuple accumulation to connection pooling health—nothing escapes.
                </p>

                {/* Grid Block */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', animation: 'fadeUp .8s ease .3s backwards' }}>
                    {PLATFORM_FEATURES.map((feat, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'all .2s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.borderColor = `${feat.color}40`; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.015)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'; }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 26, height: 26, borderRadius: 6, background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${feat.color}30` }}>
                                    <feat.icon size={13} color={feat.color} />
                                </div>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: '#E8EAF4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {feat.label}
                                </span>
                            </div>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(148,163,184,.80)', margin: 0, lineHeight: 1.4 }}>
                                {feat.desc}
                            </p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                {feat.tags.map(tag => (
                                    <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: feat.color, background: `${feat.color}10`, padding: '3px 6px', borderRadius: 4, border: `1px solid ${feat.color}20` }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* The "Visual" Element */}
                <DashboardSnippet />

                {/* Trust & Compliance Footer */}
                <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 24, animation: 'fadeIn 1s ease .6s backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={12} color="#64748b" />
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOC2 Type II</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Shield size={12} color="#64748b" />
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>GDPR Compliant</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={12} color="#34D399" />
                        <span style={{ fontSize: 10, color: '#34D399', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>99.99% SLA</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  RIGHT PANEL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const LogoEmblem = ({ success }) => {
    const S = 84, C = 42, R1 = 36, R2 = 27, R3 = 18;
    const c1 = success ? '#34D399' : '#818CF8', c2 = success ? '#34D399' : '#C084FC';
    return (
        <div style={{ position: 'relative', width: S, height: S, animation: 'logoPulse 4s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: success ? 'radial-gradient(circle,rgba(52,211,153,.18) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(129,140,248,.15) 0%,transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite', transition: 'background .8s' }}/>
            <svg width={S} height={S} style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx={C} cy={C} r={R1} fill="none" stroke={c1} strokeWidth="1" strokeDasharray="4 3" opacity=".28" style={{ transformOrigin: 'center', animation: 'spin 22s linear infinite' }}/>
                <circle cx={C} cy={C} r={R2} fill="none" stroke={c1} strokeWidth="1.4" strokeDasharray={`${Math.PI*R2*.6} ${Math.PI*R2*.4}`} strokeLinecap="round" opacity=".60" style={{ transformOrigin: 'center', animation: 'spinRev 11s linear infinite' }}/>
                <circle cx={C} cy={C} r={R3} fill="none" stroke={c2} strokeWidth="0.8" strokeDasharray="2 4" opacity=".20" style={{ transformOrigin: 'center', animation: 'spin 7s linear infinite' }}/>
                {[0, 72, 144, 216, 288].map((d, i) => <circle key={d} cx={C + R1 * Math.cos(d * Math.PI / 180)} cy={C + R1 * Math.sin(d * Math.PI / 180)} r="2" fill={c1} opacity={.35 + i * .1}/>)}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: success ? 'linear-gradient(135deg,#34D399,#10B981)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: success ? '0 4px 24px rgba(52,211,153,.5)' : '0 4px 24px rgba(99,102,241,.5)', transition: 'all .8s cubic-bezier(.34,1.56,.64,1)' }}>
                    {success ? <CheckCircle size={22} color="#fff" style={{ animation: 'successPop .5s ease backwards' }}/> : <Database size={22} color="#fff"/>}
                </div>
            </div>
        </div>
    );
};

const ServerStatus = ({ status }) => {
    const on = status.status === 'online', off = status.status === 'offline', chk = status.status === 'checking';
    const color = on ? '#34D399' : off ? '#FB7185' : '#FDE047';
    const label = on ? 'ONLINE' : off ? 'OFFLINE' : chk ? 'Checking…' : 'DEGRADED';
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px 5px 10px', borderRadius: 100, background: `${color}09`, border: `1px solid ${color}22`, fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
            {chk ? <><Loader size={9} color="#64748b" style={{ animation: 'spin 1s linear infinite' }}/><span style={{ color: '#64748b' }}>Checking…</span></>
                : <>
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}90`, animation: on ? 'pulseDot 2s ease-in-out infinite' : 'none' }}/>
                        {on && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}60`, animation: 'ringOut 2s ease-out infinite' }}/>}
                    </div>
                    <span style={{ color, fontWeight: 700, letterSpacing: '.05em' }}>{label}</span>
                </>}
        </div>
    );
};

const InputField = React.forwardRef(function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, disabled, rightEl }, ref) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;
    return (
        <div>
            <label style={{ display: 'block', marginBottom: 7, fontSize: 9.5, fontWeight: 600, color: focused ? '#818CF8' : '#334155', textTransform: 'uppercase', letterSpacing: '1.4px', fontFamily: "'JetBrains Mono',monospace", transition: 'color .2s' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: focused ? 'rgba(129,140,248,.05)' : 'rgba(255,255,255,.025)', border: `1px solid ${focused ? 'rgba(129,140,248,.45)' : 'rgba(255,255,255,.07)'}`, borderRadius: 13, padding: '0 14px', transition: 'all .25s', boxShadow: focused ? '0 0 0 3.5px rgba(129,140,248,.08),inset 0 1px 0 rgba(255,255,255,.04)' : 'inset 0 1px 0 rgba(255,255,255,.025)' }}>
                <Icon size={15} color={focused ? '#818CF8' : hasVal ? '#64748b' : '#334155'} style={{ flexShrink: 0, transition: 'color .2s' }}/>
                <input ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="vi-input"
                       style={{ flex: 1, padding: '13px 0', background: 'none', border: 'none', color: '#E8EAF4', fontSize: 13.5, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 400, opacity: disabled ? .4 : 1 }}/>
                {rightEl}
            </div>
        </div>
    );
});

const Corners = ({ color = 'rgba(129,140,248,.18)' }) => (
    <>
        {[
            { top: 0, left: 0,    borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}`,    borderRadius: '3px 0 0 0' },
            { top: 0, right: 0,   borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}`,   borderRadius: '0 3px 0 0' },
            { bottom: 0, left: 0,  borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}`,  borderRadius: '0 0 0 3px' },
            { bottom: 0, right: 0, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}`, borderRadius: '0 0 3px 0' },
        ].map(({ borderRadius, ...s }, i) => <div key={i} style={{ position: 'absolute', width: 14, height: 14, pointerEvents: 'none', borderRadius, ...s }}/>)}
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

    useEffect(() => { if (error) { setShake(true); const t = setTimeout(() => setShake(false), 600); return () => clearTimeout(t); } }, [error]);
    useEffect(() => { if (error && clearError) clearError(); }, [username, password]); // eslint-disable-line

    const handleSubmit = useCallback(async e => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else            localStorage.removeItem('vigil_remembered_user');
        setLoginSuccess(false);
        try { await login(username, password); setLoginSuccess(true); } catch {}
    }, [username, password, rememberMe, login]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading && !loginSuccess;
    const btnBg     = authLoading ? 'rgba(129,140,248,.5)' : loginSuccess ? '#34D399' : canSubmit ? 'linear-gradient(135deg,#6366F1 0%,#818CF8 55%,#A5B4FC 100%)' : 'rgba(129,140,248,.10)';
    const btnShadow = canSubmit && !authLoading && !loginSuccess
        ? (btnHover ? '0 12px 36px rgba(129,140,248,.45),0 0 0 1px rgba(129,140,248,.3) inset' : '0 6px 24px rgba(129,140,248,.25),0 0 0 1px rgba(129,140,248,.18) inset')
        : 'none';

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#07080F', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden' }}>
            <GlobalStyles/>
            <LeftPanel/>

            <div style={{ width: 485, flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 42px', background: 'rgba(4,6,12,.98)' }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '4%', right: '-20%', width: 360, height: 360, background: 'radial-gradient(circle,rgba(129,140,248,.05) 0%,transparent 65%)', filter: 'blur(48px)' }}/>
                    <div style={{ position: 'absolute', bottom: '4%', left: '-16%', width: 260, height: 260, background: 'radial-gradient(circle,rgba(165,180,252,.04) 0%,transparent 65%)', filter: 'blur(36px)' }}/>
                    <div style={{ position: 'absolute', inset: 0, opacity: .006, backgroundImage: 'linear-gradient(rgba(129,140,248,1) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,1) 1px,transparent 1px)', backgroundSize: '44px 44px' }}/>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(129,140,248,.60) 30%,rgba(165,180,252,.85) 50%,rgba(129,140,248,.60) 70%,transparent)', opacity: .70 }}/>

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 365, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ width: '100%', marginBottom: 24, padding: '10px 14px', borderRadius: 10, background: 'rgba(125,211,252,.05)', border: '1px solid rgba(125,211,252,.15)', display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'slideDown .5s ease backwards' }}>
                        <Bell size={14} color="#7DD3FC" style={{ marginTop: 2, flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#7DD3FC', fontFamily: "'DM Sans',sans-serif" }}>Platform Update (v2.1)</span>
                            <span style={{ fontSize: 10.5, color: 'rgba(232,234,244,.7)', lineHeight: 1.4, fontFamily: "'DM Sans',sans-serif" }}>Query profiling now supports real-time execution plans. Read the release notes in the dashboard.</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20, animation: 'fadeUp .6s ease .1s backwards' }}><LogoEmblem success={loginSuccess}/></div>

                    <div style={{ textAlign: 'center', marginBottom: 4, animation: 'fadeUp .6s ease .18s backwards', width: '100%' }}>
                        <h1 style={{ fontSize: 29, fontWeight: 400, color: '#E8EAF4', margin: 0, lineHeight: 1.1, letterSpacing: '-.04em', fontFamily: "'DM Serif Display',serif" }}>Welcome back</h1>
                        <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>Sign in to your monitoring dashboard</p>
                    </div>

                    <div style={{ margin: '16px 0 18px', display: 'flex', alignItems: 'center', gap: 10, width: '100%', animation: 'fadeUp .6s ease .24s backwards' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.04)' }}/>
                        <ServerStatus status={serverStatus}/>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.04)' }}/>
                    </div>

                    <div style={{ width: '100%', padding: '26px 24px 22px', borderRadius: 20, background: 'rgba(6,10,22,.88)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: `1px solid ${loginSuccess ? 'rgba(52,211,153,.35)' : error ? 'rgba(251,113,133,.25)' : 'rgba(255,255,255,.07)'}`, boxShadow: loginSuccess ? '0 0 70px rgba(52,211,153,.1),0 28px 60px rgba(0,0,0,.6)' : '0 28px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.03)', transition: 'border-color .55s,box-shadow .55s', animation: shake ? 'shake .5s ease' : 'fadeUp .7s ease .32s backwards', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: loginSuccess ? 'linear-gradient(90deg,transparent,rgba(52,211,153,.55),transparent)' : 'linear-gradient(90deg,transparent,rgba(129,140,248,.38),transparent)', transition: 'background .55s', animation: 'edgePulse 3s ease-in-out infinite' }}/>
                        <Corners color={loginSuccess ? 'rgba(52,211,153,.20)' : 'rgba(129,140,248,.17)'}/>

                        {loginSuccess && (
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center,rgba(52,211,153,.08) 0%,transparent 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, borderRadius: 20, animation: 'fadeIn .3s ease' }}>
                                <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(52,211,153,.3)', animation: 'ripple 1s ease-out forwards' }}/>
                                <CheckCircle size={42} color="#34D399" style={{ animation: 'successPop .5s ease backwards', marginBottom: 13 }}/>
                                <div style={{ color: '#34D399', fontSize: 15, fontWeight: 400, fontFamily: "'DM Serif Display',serif", animation: 'fadeUp .4s ease .2s backwards' }}>Authenticated</div>
                                <div style={{ color: '#64748b', fontSize: 10, marginTop: 5, fontFamily: "'JetBrains Mono',monospace", animation: 'fadeUp .4s ease .35s backwards' }}>Redirecting to dashboard…</div>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginBottom: 16, padding: '10px 13px', borderRadius: 10, background: 'rgba(251,113,133,.07)', border: '1px solid rgba(251,113,133,.20)', display: 'flex', alignItems: 'center', gap: 9, animation: 'slideDown .3s ease backwards' }}>
                                <AlertCircle size={13} color="#FB7185" style={{ flexShrink: 0 }}/>
                                <span style={{ color: '#FB7185', fontSize: 12, fontWeight: 500 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <InputField ref={userRef} icon={User} label="Username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" disabled={authLoading || loginSuccess}/>
                            <InputField ref={pwdRef} icon={KeyRound} label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" disabled={authLoading || loginSuccess}
                                        rightEl={<button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 4, display: 'flex', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#334155'}>{showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}</button>}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }} onClick={() => setRememberMe(r => !r)}>
                                    <div style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${rememberMe ? '#818CF8' : 'rgba(255,255,255,.10)'}`, background: rememberMe ? '#818CF8' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .22s cubic-bezier(.34,1.56,.64,1)', boxShadow: rememberMe ? '0 0 10px rgba(129,140,248,.4)' : 'none' }}>
                                        {rememberMe && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'DM Sans',sans-serif" }}>Remember me</span>
                                </div>
                                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b', fontFamily: "'DM Sans',sans-serif", padding: 0, transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = '#A5B4FC'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={!canSubmit} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                                    style={{ position: 'relative', overflow: 'hidden', background: btnBg, border: canSubmit ? `1px solid ${loginSuccess ? 'rgba(52,211,153,.3)' : 'rgba(129,140,248,.28)'}` : '1px solid rgba(255,255,255,.04)', padding: '13px 20px', borderRadius: 12, color: 'white', fontWeight: 500, fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .28s cubic-bezier(.4,0,.2,1)', boxShadow: btnShadow, transform: btnHover && canSubmit ? 'translateY(-2px)' : 'translateY(0)' }}>
                                {authLoading  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }}/><span>Authenticating…</span></>
                                    : loginSuccess ? <><CheckCircle size={15}/><span>Access Granted</span></>
                                        :               <><span>Sign In</span><ArrowRight size={15} style={{ transition: 'transform .25s', transform: btnHover ? 'translateX(4px)' : 'translateX(0)' }}/></>}
                            </button>
                        </form>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, animation: 'fadeUp .6s ease .6s backwards' }}>
                        <Shield size={8} color="#475569" style={{ opacity: .5 }}/>
                        <span style={{ fontSize: 8.5, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>Secured by · PostgreSQL Monitor v2.1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;