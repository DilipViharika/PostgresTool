import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Eye,
    EyeOff,
    Loader,
    AlertCircle,
    User,
    KeyRound,
    Lock,
    Sun,
    Moon,
    Server,
    Fingerprint,
    ArrowRight,
    Shield,
    CheckCircle,
    Database,
    Activity,
    Zap,
    Search,
    Bell,
    BarChart3,
    RefreshCw,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES — generated at render time so THEME tokens reflect current mode
// ─────────────────────────────────────────────────────────────────────────────
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  @keyframes containerIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes textIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(2px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-8px) rotate(1deg); }
    66%      { transform: translateY(4px) rotate(-1deg); }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
    25%      { transform: translate(30px, -20px) scale(1.05); opacity: 0.8; }
    50%      { transform: translate(-15px, 25px) scale(0.97); opacity: 0.5; }
    75%      { transform: translate(20px, 15px) scale(1.03); opacity: 0.7; }
  }
  @keyframes ringRotate { to { transform: rotate(360deg); } }
  @keyframes pulseDot {
    0%, 100% { opacity: .6; }
    50%      { opacity: 1; }
  }
  @keyframes successPop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }
  @keyframes drawCheck {
    to { stroke-dashoffset: 0; }
  }
  @keyframes progressFill {
    to { width: 100%; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.05); }
    50%      { box-shadow: 0 0 30px rgba(99,102,241,0.25), 0 0 60px rgba(99,102,241,0.10); }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(99,102,241,0.15); }
    50%      { border-color: rgba(99,102,241,0.30); }
  }

  .vdb-input:focus {
    outline: none;
    border-color: ${THEME.primary} !important;
    box-shadow: 0 0 0 4px ${THEME.primary}12, 0 4px 12px rgba(0,0,0,0.08) !important;
    background: ${THEME.surface} !important;
  }
  .vdb-input::placeholder { color: ${THEME.textDim}; font-weight: 400; }
  .vdb-input { color: ${THEME.textMain}; background: ${THEME.surfaceHover}; }
  .vdb-input:-webkit-autofill,
  .vdb-input:-webkit-autofill:hover,
  .vdb-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${THEME.surface} inset !important;
    -webkit-text-fill-color: ${THEME.textMain} !important;
    caret-color: ${THEME.textMain};
    transition: background-color 5000s ease-in-out 0s;
  }

  .vdb-submit:not(:disabled):hover {
    transform: translateY(-3px) scale(1.01) !important;
    box-shadow: 0 12px 36px ${THEME.primary}50, 0 4px 16px ${THEME.primary}30 !important;
  }
  .vdb-submit:not(:disabled):active {
    transform: translateY(-1px) scale(0.99) !important;
  }
  .vdb-forgot:hover { color: ${THEME.primary} !important; }
  .vdb-toggle:hover {
    background: ${THEME.surfaceHover} !important;
    transform: scale(1.1) rotate(15deg) !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
  }

  .vdb-feature-item {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 14px;
    padding: 10px 14px;
    margin: -10px -14px;
  }
  .vdb-feature-item:hover {
    background: rgba(99,102,241,0.06);
    transform: translateX(4px);
  }

  .vdb-form-card {
    animation: glowPulse 4s ease-in-out infinite;
  }

  @media (max-width: 960px) {
    .vdb-container { flex-direction: column !important; }
    .vdb-brand { display: none !important; }
    .vdb-form { padding: 48px 36px !important; }
  }
  @media (max-width: 480px) {
    .vdb-form { padding: 32px 20px !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }: { status: { status: string; latency?: number } }) => {
    const isOnline = status.status === 'online';
    const color = isOnline ? '#2EE89C' : status.status === 'offline' ? THEME.danger : THEME.warning;
    const label = isOnline ? 'ONLINE' : status.status === 'offline' ? 'OFFLINE' : 'CHECKING';

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 18px', borderRadius: 100,
            background: `${color}10`, border: `1px solid ${color}25`,
            fontSize: 10, fontWeight: 700, color, letterSpacing: '.1em',
            fontFamily: "'JetBrains Mono', monospace",
            backdropFilter: 'blur(8px)',
        }}>
            {status.status === 'checking' ? (
                <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
                <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: color,
                    boxShadow: `0 0 12px ${color}80, 0 0 4px ${color}`,
                    animation: isOnline ? 'pulseDot 2s ease-in-out infinite' : 'none',
                }} />
            )}
            {label}
            {status.latency && <span style={{ opacity: 0.5, fontWeight: 500 }}>{status.latency}ms</span>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  FLOATING ORBS (background)
// ─────────────────────────────────────────────────────────────────────────────
const FloatingOrbs = () => (
    <>
        {[
            { w: 500, top: '-10%', left: '-5%', bg: 'rgba(99,102,241,0.12)', dur: '16s', delay: '0s' },
            { w: 400, bottom: '-10%', right: '-8%', bg: 'rgba(59,130,246,0.10)', dur: '20s', delay: '-5s' },
            { w: 300, top: '35%', right: '15%', bg: 'rgba(139,92,246,0.08)', dur: '18s', delay: '-10s' },
            { w: 200, bottom: '20%', left: '30%', bg: 'rgba(99,102,241,0.06)', dur: '14s', delay: '-3s' },
        ].map((s, i) => (
            <div key={i} style={{
                position: 'absolute', width: s.w, height: s.w, borderRadius: '50%',
                filter: 'blur(80px)', background: s.bg, pointerEvents: 'none',
                animation: `orbFloat ${s.dur} ease-in-out infinite`,
                animationDelay: s.delay,
                ...(s as any),
            }} />
        ))}
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
    useAdaptiveTheme();
    const { isDark, toggleTheme } = useTheme();
    const { login, loginWithSSO, authLoading, error, clearError } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [serverStatus, setServerStatus] = useState<{ status: string; latency?: number }>({ status: 'checking' });
    const [shake, setShake] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(0);
    const [rateLimitError, setRateLimitError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    const userRef = useRef<HTMLInputElement>(null);
    const pwdRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
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
        else { userRef.current?.focus(); }
    }, []);

    useEffect(() => {
        if (error) { setShake(true); const t = setTimeout(() => setShake(false), 600); return () => clearTimeout(t); }
    }, [error]);

    useEffect(() => { if (error && clearError) clearError(); }, [username, password, clearError]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!username.trim() || !password.trim()) return;
        if (Date.now() < lockoutUntil) { setRateLimitError('Too many attempts. Please wait before trying again.'); return; }
        setRateLimitError('');
        if (username.length > 255 || password.length > 1000) { setRateLimitError('Input too long'); return; }
        if (rememberMe) localStorage.setItem('vigil_remembered_user', username.trim());
        else localStorage.removeItem('vigil_remembered_user');
        try { localStorage.removeItem('pg_monitor_active_tab'); } catch {}
        try {
            await login(username, password);
            setAttempts(0); setLockoutUntil(0); setLoginSuccess(true);
        } catch (err) {
            const n = attempts + 1; setAttempts(n);
            if (n >= 5) { setLockoutUntil(Date.now() + 5 * 60 * 1000); setAttempts(0); }
            throw err;
        }
    }, [username, password, rememberMe, login, attempts, lockoutUntil]);

    const handleForgotPassword = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!resetEmail.trim()) return;
        setResetLoading(true); setResetMessage('');
        try {
            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (res.ok) { setResetMessage('If an account exists, a reset link has been sent.'); setResetEmail(''); setTimeout(() => setShowForgotPassword(false), 2000); }
            else { setResetMessage(data.error || 'Failed to process request'); }
        } catch { setResetMessage('Unable to reach server. Please try again.'); }
        finally { setResetLoading(false); }
    }, [resetEmail]);

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading;
    const accent = THEME.primary;
    const accentHover = THEME.primaryDark;
    const fontDisplay = THEME.fontDisplay;
    const fontMono = THEME.fontMono;

    const features = [
        { icon: Zap, title: 'Real-time Monitoring', desc: 'Live metrics, active sessions, and query performance', color: '#818cf8' },
        { icon: Search, title: 'Query Analysis', desc: 'Slow queries, execution plans, and optimization', color: '#60a5fa' },
        { icon: Bell, title: 'Health & Alerts', desc: 'Health checks, deadlock detection, threshold alerts', color: '#2EE89C' },
        { icon: BarChart3, title: 'Resource Insights', desc: 'Bloat, index usage, disk I/O, and vacuum stats', color: '#f59e0b' },
        { icon: RefreshCw, title: 'Checkpoint Tracking', desc: 'WAL activity, buffer writes, and archive status', color: '#f472b6' },
        { icon: TrendingUp, title: 'Performance Trends', desc: 'Query trends, cache ratios, and throughput', color: '#34d399' },
    ];

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', fontFamily: fontDisplay }}>
            <style>{getStyles()}</style>

            {/* Background is handled by the two panels filling 100% */}

            {/* ═══ MAIN LAYOUT ═══ */}
            <div style={{
                position: 'relative', zIndex: 1, display: 'flex', height: '100%',
                alignItems: 'stretch', justifyContent: 'stretch',
            }}>
                <div className="vdb-container" style={{
                    display: 'flex', width: '100%', height: '100%',
                    overflow: 'hidden',
                    animation: 'containerIn 0.9s cubic-bezier(0.16,1,0.3,1) both',
                }}>

                    {/* ═══ LEFT — BRAND PANEL ═══ */}
                    <div className="vdb-brand" style={{
                        flex: '0 0 50%', position: 'relative',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        padding: '40px 36px', overflow: 'hidden', color: THEME.textMain,
                        background: isDark
                            ? `linear-gradient(160deg, ${THEME.bg} 0%, #0c1628 40%, #111d33 100%)`
                            : `linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)`,
                    }}>
                        {/* Gradient overlays */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: `
                                radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,102,241,0.25), transparent 60%),
                                radial-gradient(ellipse 50% 40% at 80% 80%, rgba(59,130,246,0.18), transparent 60%)`,
                        }} />
                        {/* Noise texture */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                        }} />

                        {/* Top content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {/* Logo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: 'linear-gradient(135deg, rgba(129,140,248,0.9), rgba(99,102,241,0.9))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                                    position: 'relative',
                                }}>
                                    <Database size={22} color="#fff" strokeWidth={1.8} style={{ position: 'relative', zIndex: 1 }} />
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: 14,
                                        background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2))',
                                    }} />
                                </div>
                                <span style={{
                                    fontWeight: 800, fontSize: '1.4rem', letterSpacing: 4, color: '#fff',
                                }}>VIGIL</span>
                            </div>

                            {/* Headline */}
                            <h1 style={{
                                fontSize: '2rem', fontWeight: 800, lineHeight: 1.15,
                                letterSpacing: -0.5, marginBottom: 14, color: '#fff',
                                animation: 'textIn 0.8s ease-out 0.3s both',
                            }}>
                                Your databases,{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #a5b4fc, #60a5fa)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>under control.</span>
                            </h1>

                            <p style={{
                                fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)',
                                lineHeight: 1.7, maxWidth: 380,
                                animation: 'textIn 0.8s ease-out 0.45s both',
                            }}>
                                Monitor performance, track queries, and manage your entire PostgreSQL infrastructure from a single command center.
                            </p>

                            {/* Feature list */}
                            <div style={{
                                marginTop: 32, display: 'flex', flexDirection: 'column', gap: 6,
                                animation: 'textIn 0.8s ease-out 0.55s both',
                            }}>
                                {features.map((f, i) => (
                                    <div key={i} className="vdb-feature-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                            background: `${f.color}18`,
                                            border: `1px solid ${f.color}25`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <f.icon size={16} color={f.color} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: 1 }}>{f.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom stats */}
                        <div style={{
                            position: 'relative', zIndex: 1, display: 'flex', gap: 36,
                            animation: 'textIn 0.8s ease-out 0.6s both',
                            paddingTop: 20,
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            {[
                                { value: '99.99%', label: 'Uptime SLA', color: '#2EE89C' },
                                { value: '4.2ms', label: 'Avg Latency', color: '#818cf8' },
                                { value: '12K+', label: 'Databases', color: '#60a5fa' },
                            ].map(s => (
                                <div key={s.label}>
                                    <div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ RIGHT — FORM PANEL ═══ */}
                    <div className="vdb-form" style={{
                        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        padding: '40px 52px', position: 'relative',
                        background: isDark ? THEME.surface : '#fff',
                        overflowY: 'auto',
                    }}>
                        {/* Subtle gradient overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: isDark
                                ? `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.04), transparent)`
                                : `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.03), transparent)`,
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%', margin: '0 auto' }}>
                            {/* Title */}
                            <h2 style={{
                                fontSize: '1.65rem', fontWeight: 800, color: THEME.textMain,
                                marginBottom: 6, letterSpacing: -0.5, textAlign: 'center',
                                animation: 'textIn 0.6s ease-out 0.2s both',
                            }}>Welcome back</h2>
                            <p style={{
                                color: THEME.textMuted, fontSize: '0.88rem', marginBottom: 24, textAlign: 'center',
                                animation: 'textIn 0.6s ease-out 0.3s both',
                            }}>
                                Sign in to your command center
                            </p>

                            {/* Server status */}
                            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center', animation: 'textIn 0.6s ease-out 0.32s both' }}>
                                <ServerStatus status={serverStatus} />
                            </div>

                            {/* Error */}
                            {(error || rateLimitError) && (
                                <div style={{
                                    marginBottom: 20, padding: '12px 16px', borderRadius: 14,
                                    background: `${THEME.danger}0c`, border: `1px solid ${THEME.danger}20`,
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    animation: shake ? 'shake .5s ease' : 'none',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    <AlertCircle size={15} color={THEME.danger} style={{ flexShrink: 0 }} />
                                    <span style={{ color: THEME.danger, fontSize: 13, fontWeight: 600 }}>{error || rateLimitError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {/* Username */}
                                <div style={{ marginBottom: 18, animation: 'textIn 0.6s ease-out 0.42s both' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: THEME.textMuted, letterSpacing: 0.3, marginBottom: 8 }}>Username</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <User size={18} color={THEME.textDim} strokeWidth={1.8} style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'color 0.3s' }} />
                                        <input ref={userRef} className="vdb-input" type="text" value={username}
                                            onChange={e => setUsername(e.target.value)} placeholder="Enter username"
                                            autoComplete="username" disabled={authLoading}
                                            style={{
                                                width: '100%', padding: '14px 18px 14px 48px',
                                                background: isDark ? THEME.surfaceHover : '#f8f9fc',
                                                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                borderRadius: 14, color: THEME.textMain, fontFamily: fontDisplay,
                                                fontSize: '0.92rem', outline: 'none',
                                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                                boxShadow: isDark ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.04)',
                                                opacity: authLoading ? 0.5 : 1,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: 18, animation: 'textIn 0.6s ease-out 0.48s both' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: THEME.textMuted, letterSpacing: 0.3 }}>Password</label>
                                        <button type="button" className="vdb-forgot" onClick={() => setShowForgotPassword(true)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 0, fontSize: '0.75rem', fontFamily: fontMono, transition: 'color 0.3s', fontWeight: 500 }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <KeyRound size={18} color={THEME.textDim} strokeWidth={1.8} style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'color 0.3s' }} />
                                        <input ref={pwdRef} className="vdb-input" type={showPwd ? 'text' : 'password'} value={password}
                                            onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                                            autoComplete="current-password" disabled={authLoading}
                                            style={{
                                                width: '100%', padding: '14px 48px 14px 48px',
                                                background: isDark ? THEME.surfaceHover : '#f8f9fc',
                                                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                borderRadius: 14, color: THEME.textMain, fontFamily: fontDisplay,
                                                fontSize: '0.92rem', outline: 'none',
                                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                                boxShadow: isDark ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.04)',
                                                opacity: authLoading ? 0.5 : 1,
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1}
                                            style={{
                                                position: 'absolute', right: 14, background: 'none', border: 'none',
                                                cursor: 'pointer', color: THEME.textDim, padding: 4, display: 'flex',
                                                transition: 'color 0.3s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = accent; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = THEME.textDim; }}>
                                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    marginBottom: 24, animation: 'textIn 0.6s ease-out 0.52s both',
                                }}>
                                    <div onClick={() => setRememberMe(r => !r)} style={{
                                        width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
                                        border: `1.5px solid ${rememberMe ? accent : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                                        background: rememberMe ? `linear-gradient(135deg, ${accent}, ${accentHover})` : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                        boxShadow: rememberMe ? `0 4px 12px ${accent}35` : 'none',
                                    }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
                                            style={{ opacity: rememberMe ? 1 : 0, transform: rememberMe ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.2s ease' }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <span onClick={() => setRememberMe(r => !r)} style={{ fontSize: '0.84rem', color: THEME.textMuted, cursor: 'pointer', fontWeight: 500 }}>
                                        Remember this device for 30 days
                                    </span>
                                </div>

                                {/* Submit */}
                                <button type="submit" className="vdb-submit" disabled={!canSubmit} style={{
                                    width: '100%', padding: '15px 20px', border: 'none', borderRadius: 14,
                                    background: canSubmit
                                        ? `linear-gradient(135deg, ${accent}, ${accentHover})`
                                        : isDark ? THEME.surfaceHover : '#e5e7eb',
                                    color: canSubmit ? '#fff' : THEME.textDim,
                                    fontFamily: fontDisplay, fontWeight: 700, fontSize: '0.95rem',
                                    letterSpacing: 0.3, cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', overflow: 'hidden',
                                    boxShadow: canSubmit ? `0 8px 28px ${accent}40, 0 2px 8px ${accent}20` : 'none',
                                    animation: 'textIn 0.6s ease-out 0.56s both',
                                }}>
                                    {/* Shimmer effect */}
                                    {canSubmit && (
                                        <div style={{
                                            position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 14,
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                                                animation: 'shimmerSlide 3s ease-in-out infinite',
                                            }} />
                                        </div>
                                    )}
                                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                        {authLoading ? (
                                            <><Loader size={17} style={{ animation: 'spin 0.6s linear infinite' }} /> Authenticating...</>
                                        ) : (
                                            <>Sign in to VIGIL <ArrowRight size={17} strokeWidth={2.5} /></>
                                        )}
                                    </span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 20px',
                                animation: 'textIn 0.6s ease-out 0.6s both',
                            }}>
                                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                                <span style={{ fontSize: '0.72rem', color: THEME.textDim, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>or</span>
                                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                            </div>

                            {/* SSO Button */}
                            <button onClick={() => loginWithSSO?.('saml')} style={{
                                width: '100%', padding: '13px 20px', borderRadius: 14,
                                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                background: 'transparent',
                                color: THEME.textMuted, fontFamily: fontDisplay, fontWeight: 600, fontSize: '0.88rem',
                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                animation: 'textIn 0.6s ease-out 0.62s both',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = `${accent}40`;
                                    e.currentTarget.style.background = `${accent}06`;
                                    e.currentTarget.style.color = THEME.textMain;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = THEME.textMuted;
                                }}>
                                <Fingerprint size={18} strokeWidth={1.8} />
                                Continue with SSO
                            </button>

                            {/* Footer */}
                            <div style={{
                                textAlign: 'center', marginTop: 24, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontSize: '0.73rem', color: THEME.textDim, fontFamily: fontMono,
                                animation: 'textIn 0.6s ease-out 0.68s both', fontWeight: 500,
                            }}>
                                <Shield size={13} color={accent} strokeWidth={2} />
                                Protected by 256-bit TLS encryption
                            </div>
                        </div>

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: isDark ? `${THEME.surface}f8` : 'rgba(255,255,255,0.97)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', zIndex: 10,
                                backdropFilter: 'blur(12px)',
                            }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                                    border: `2px solid ${accent}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 24, animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
                                    boxShadow: `0 8px 32px ${accent}25`,
                                }}>
                                    <CheckCircle size={36} color={accent} strokeWidth={2} />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: THEME.textMain, marginBottom: 8, animation: 'textIn 0.5s ease 0.5s both' }}>Welcome back!</div>
                                <div style={{ color: THEME.textMuted, fontSize: '0.9rem', animation: 'textIn 0.5s ease 0.6s both' }}>Redirecting to your dashboard...</div>
                                <div style={{ width: 200, height: 4, background: isDark ? THEME.surfaceHover : '#e5e7eb', borderRadius: 99, marginTop: 24, overflow: 'hidden', animation: 'textIn 0.5s ease 0.7s both' }}>
                                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${accent}, ${accentHover})`, borderRadius: 99, width: '0%', animation: 'progressFill 2s ease 0.8s forwards' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ FORGOT PASSWORD MODAL ═══ */}
            {showForgotPassword && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'textIn .3s ease',
                }} onClick={() => setShowForgotPassword(false)}>
                    <div style={{
                        background: isDark ? THEME.surface : '#fff',
                        borderRadius: 20, padding: 36, maxWidth: 420, width: '90%',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                        boxShadow: isDark
                            ? '0 24px 64px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)'
                            : '0 24px 64px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.05)',
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: THEME.textMain, marginBottom: 8 }}>Reset Password</h3>
                        <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 24, lineHeight: 1.5 }}>Enter your email and we'll send you a reset link.</p>
                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input className="vdb-input" type="email" placeholder="Enter your email" value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)} disabled={resetLoading}
                                style={{
                                    padding: '14px 16px', borderRadius: 14,
                                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    background: isDark ? THEME.surfaceHover : '#f8f9fc',
                                    color: THEME.textMain, fontSize: 14, fontFamily: fontDisplay, outline: 'none',
                                    transition: 'all 0.3s',
                                }}
                            />
                            {resetMessage && (
                                <div style={{
                                    padding: '12px 14px', borderRadius: 12,
                                    background: resetMessage.includes('failed') || resetMessage.includes('Unable') ? `${THEME.danger}0c` : `${accent}0c`,
                                    color: resetMessage.includes('failed') || resetMessage.includes('Unable') ? THEME.danger : accent,
                                    fontSize: 13, fontWeight: 600,
                                }}>
                                    {resetMessage}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button type="submit" disabled={!resetEmail.trim() || resetLoading} style={{
                                    flex: 1, padding: '13px 18px', borderRadius: 14, border: 'none',
                                    background: resetEmail.trim() && !resetLoading ? `linear-gradient(135deg, ${accent}, ${accentHover})` : isDark ? THEME.surfaceHover : '#e5e7eb',
                                    color: resetEmail.trim() && !resetLoading ? '#fff' : THEME.textDim,
                                    fontSize: 14, fontWeight: 700, cursor: resetEmail.trim() && !resetLoading ? 'pointer' : 'not-allowed',
                                    fontFamily: fontDisplay, transition: 'all 0.3s',
                                    boxShadow: resetEmail.trim() && !resetLoading ? `0 4px 14px ${accent}30` : 'none',
                                }}>
                                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button type="button" onClick={() => setShowForgotPassword(false)} style={{
                                    flex: 1, padding: '13px 18px', borderRadius: 14,
                                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    background: 'transparent',
                                    color: THEME.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                    fontFamily: fontDisplay, transition: 'all 0.3s',
                                }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Theme Toggle */}
            <button className="vdb-toggle" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                    position: 'fixed', bottom: 24, left: 24, zIndex: 100,
                    width: 44, height: 44, borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    cursor: 'pointer', color: THEME.textDim, transition: 'all .3s', outline: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.06)',
                }}>
                {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            </button>
        </div>
    );
};

export default LoginPage;