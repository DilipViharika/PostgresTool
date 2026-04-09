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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES — VaultDB Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  @keyframes containerIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes textIn {
    from { opacity: 0; transform: translateY(12px); }
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
  @keyframes shapeDrift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25%      { transform: translate(20px, -15px) scale(1.04); }
    50%      { transform: translate(-10px, 20px) scale(0.98); }
    75%      { transform: translate(15px, 10px) scale(1.02); }
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

  .vdb-input:focus {
    outline: none;
    border-color: ${THEME.primary} !important;
    box-shadow: 0 0 0 4px ${THEME.primary}0a, 0 1px 3px rgba(0,0,0,0.04) !important;
    background: ${THEME.surfaceRaised} !important;
  }
  .vdb-input::placeholder { color: ${THEME.textDim}; font-weight: 400; }
  .vdb-input { color: ${THEME.textMain}; background: ${THEME.surfaceHover}; }
  .vdb-input:-webkit-autofill,
  .vdb-input:-webkit-autofill:hover,
  .vdb-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${THEME.surfaceRaised} inset !important;
    -webkit-text-fill-color: ${THEME.textMain} !important;
    caret-color: ${THEME.textMain};
    transition: background-color 5000s ease-in-out 0s;
  }

  .vdb-submit:not(:disabled):hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 28px ${THEME.primary}40, 0 4px 16px ${THEME.primary}26 !important;
  }
  .vdb-submit:not(:disabled):active { transform: translateY(0) !important; }
  .vdb-forgot:hover { color: ${THEME.primary} !important; }
  .vdb-toggle:hover {
    background: ${THEME.surfaceHover} !important;
    transform: scale(1.1) rotate(15deg) !important;
  }

  @media (max-width: 860px) {
    .vdb-container { flex-direction: column !important; }
    .vdb-brand { display: none !important; }
    .vdb-form { padding: 32px 28px !important; }
  }
  @media (max-width: 480px) {
    .vdb-form { padding: 28px 20px !important; }
    .vdb-sso-row { grid-template-columns: 1fr !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }: { status: { status: string; latency?: number } }) => {
    const isOnline = status.status === 'online';
    const color = isOnline ? THEME.primary : status.status === 'offline' ? THEME.danger : THEME.warning;
    const label = isOnline ? 'ONLINE' : status.status === 'offline' ? 'OFFLINE' : 'CHECKING';

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 100,
            background: `${color}0a`, border: `1px solid ${color}20`,
            fontSize: 9, fontWeight: 600, color, letterSpacing: '.12em',
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            {status.status === 'checking' ? (
                <Loader size={10} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
                <div style={{
                    width: 5, height: 5, borderRadius: '50%', background: color,
                    boxShadow: `0 0 10px ${color}80`,
                    animation: isOnline ? 'pulseDot 2s ease-in-out infinite' : 'none',
                }} />
            )}
            {label}
            {status.latency && <span style={{ opacity: 0.5 }}>{status.latency}ms</span>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  DECORATIVE RINGS (brand panel bottom-right)
// ─────────────────────────────────────────────────────────────────────────────
const DecoRings = () => (
    <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, zIndex: 0 }}>
        {[
            { inset: 0, dur: '30s', dir: 'normal', borderColor: `${THEME.primaryLight}14`, dotColor: THEME.primaryLight, dotPos: { top: 0, left: '50%', transform: 'translate(-50%,-50%)' } },
            { inset: 30, dur: '24s', dir: 'reverse', borderColor: `${THEME.info}12`, dotColor: THEME.info, dotPos: { bottom: 10, right: 10 } },
            { inset: 60, dur: '18s', dir: 'normal', borderColor: `${THEME.primaryLight}10`, dotColor: THEME.primaryLight, dotPos: { top: '50%', left: 0, transform: 'translate(-50%,-50%)' } },
        ].map((r, i) => (
            <div key={i} style={{
                position: 'absolute', inset: r.inset, border: `1px solid ${r.borderColor}`,
                borderRadius: '50%', animation: `ringRotate ${r.dur} linear infinite`,
                animationDirection: r.dir as any,
            }}>
                <div style={{
                    position: 'absolute', width: 6, height: 6, background: r.dotColor,
                    borderRadius: '50%', boxShadow: `0 0 12px ${r.dotColor}80`, ...r.dotPos as any,
                }} />
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

    // ─── Shared values (from THEME tokens) ─────────────
    const accent = THEME.primary;
    const accentHover = THEME.primaryDark;
    const fontDisplay = THEME.fontDisplay;
    const fontMono = THEME.fontMono;

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', fontFamily: fontDisplay }}>
            <style>{STYLES}</style>

            {/* ═══ BACKGROUND LAYER ═══ */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
                background: `
                    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.06), transparent 50%),
                    radial-gradient(ellipse 70% 50% at 80% 90%, rgba(59,139,219,0.05), transparent 50%),
                    radial-gradient(ellipse 60% 40% at 60% 30%, rgba(124,92,196,0.035), transparent 50%),
                    #eceef4`,
            }}>
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.045) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }} />
                {/* Floating shapes */}
                {[
                    { w: 400, top: -100, left: -50, bg: 'rgba(99,102,241,0.1)', dur: '14s', delay: '0s' },
                    { w: 350, bottom: -80, right: -60, bg: 'rgba(59,139,219,0.08)', dur: '18s', delay: '-4s' },
                    { w: 250, top: '40%', right: '20%', bg: 'rgba(124,92,196,0.06)', dur: '16s', delay: '-8s' },
                ].map((s, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: s.w, height: s.w, borderRadius: '50%',
                        filter: 'blur(80px)', opacity: 0.5, background: s.bg,
                        animation: `shapeDrift ${s.dur} ease-in-out infinite`,
                        animationDelay: s.delay,
                        ...(s.top !== undefined ? { top: s.top } : {}),
                        ...(s.bottom !== undefined ? { bottom: s.bottom } : {}),
                        ...(s.left !== undefined ? { left: s.left } : {}),
                        ...(s.right !== undefined ? { right: s.right } : {}),
                    } as any} />
                ))}
            </div>

            {/* ═══ PAGE ═══ */}
            <div className="vdb-page" style={{
                position: 'relative', zIndex: 1, display: 'flex', height: '100%',
                alignItems: 'stretch', justifyContent: 'stretch', padding: 0,
            }}>
                <div className="vdb-container" style={{
                    display: 'flex', width: '100%', height: '100%',
                    background: THEME.surfaceRaised,
                    overflow: 'hidden',
                    animation: 'containerIn 0.8s cubic-bezier(0.16,1,0.3,1) both',
                }}>

                    {/* ═══ LEFT — BRAND PANEL ═══ */}
                    <div className="vdb-brand" style={{
                        flex: 1, position: 'relative',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        padding: '36px 36px', overflow: 'hidden', color: THEME.textMain,
                        background: `linear-gradient(145deg, ${THEME.bg} 0%, ${THEME.surface} 40%, ${THEME.bgAlt} 100%)`,
                    }}>
                        {/* Glow overlays */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: `
                                radial-gradient(ellipse 60% 50% at 20% 20%, ${THEME.primary}20, transparent 60%),
                                radial-gradient(ellipse 50% 40% at 80% 80%, ${THEME.info}14, transparent 60%)`,
                        }} />

                        {/* Top content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {/* Logo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: THEME.radiusMd,
                                    background: `linear-gradient(135deg, ${THEME.primaryLight}, ${THEME.primary})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 8px 32px ${THEME.primary}4d`, position: 'relative',
                                }}>
                                    <Server size={20} color={THEME.textMain} strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }} />
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: THEME.radiusMd,
                                        background: `linear-gradient(135deg, transparent 40%, ${THEME.textMain}38)`,
                                    }} />
                                </div>
                                <span style={{
                                    fontWeight: 800, fontSize: '1.3rem', letterSpacing: 3,
                                    background: `linear-gradient(135deg, ${THEME.primaryLight}, ${THEME.info})`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>VIGIL</span>
                            </div>

                            {/* Headline */}
                            <h1 style={{
                                fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2,
                                letterSpacing: -0.5, marginBottom: 12, color: THEME.textMain,
                                whiteSpace: 'nowrap',
                                animation: 'textIn 0.8s ease-out 0.3s both',
                            }}>
                                Your databases, <span style={{
                                    background: `linear-gradient(135deg, ${THEME.primaryLight}, ${THEME.primary}99)`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>under control.</span>
                            </h1>

                            <p style={{
                                fontSize: '0.82rem', color: THEME.textMuted,
                                lineHeight: 1.6, maxWidth: 420,
                                animation: 'textIn 0.8s ease-out 0.45s both',
                            }}>
                                Monitor performance, track queries, and manage your entire PostgreSQL infrastructure from a single command center.
                            </p>

                            {/* Feature list */}
                            <div style={{
                                marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14,
                                animation: 'textIn 0.8s ease-out 0.55s both',
                            }}>
                                {[
                                    { icon: '⚡', title: 'Real-time Monitoring', desc: 'Live metrics, active sessions, and query performance at a glance' },
                                    { icon: '🔍', title: 'Query Analysis', desc: 'Identify slow queries, execution plans, and optimization opportunities' },
                                    { icon: '🛡️', title: 'Health & Alerts', desc: 'Automated health checks, deadlock detection, and threshold alerts' },
                                    { icon: '📊', title: 'Resource Insights', desc: 'Table bloat, index usage, disk I/O, and vacuum monitoring' },
                                    { icon: '🔄', title: 'Checkpoint Tracking', desc: 'WAL activity, checkpoint frequency, buffer writes, and archive status' },
                                    { icon: '📈', title: 'Performance Trends', desc: 'Historical query trends, cache hit ratios, and transaction throughput' },
                                ].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: THEME.radiusSm, flexShrink: 0,
                                            background: `${THEME.primary}14`, border: `1px solid ${THEME.primary}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.85rem',
                                        }}>{f.icon}</div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: THEME.textMain, marginBottom: 2 }}>{f.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: THEME.textMuted, lineHeight: 1.4 }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative rings */}
                        <DecoRings />

                        {/* Bottom stats */}
                        <div style={{
                            position: 'relative', zIndex: 1, display: 'flex', gap: 30,
                            animation: 'textIn 0.8s ease-out 0.6s both',
                        }}>
                            {[
                                { value: '99.99%', label: 'Uptime SLA' },
                                { value: '4.2ms', label: 'Avg Latency' },
                                { value: '12K+', label: 'Databases' },
                            ].map(s => (
                                <div key={s.label}>
                                    <div style={{ fontFamily: fontMono, fontWeight: 700, fontSize: '1.15rem', color: THEME.primary }}>{s.value}</div>
                                    <div style={{ fontSize: '0.68rem', color: THEME.textMuted, marginTop: 1 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ RIGHT — FORM PANEL ═══ */}
                    <div className="vdb-form" style={{
                        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        padding: '32px 44px', position: 'relative', background: THEME.surfaceRaised, overflowY: 'auto',
                    }}>
                        {/* Title */}
                        <h2 style={{
                            fontSize: '1.45rem', fontWeight: 800, color: THEME.textMain,
                            marginBottom: 4, letterSpacing: -0.3, textAlign: 'center',
                            animation: 'textIn 0.6s ease-out 0.2s both',
                        }}>Welcome back</h2>
                        <p style={{
                            color: THEME.textMuted, fontSize: '0.85rem', marginBottom: 20, textAlign: 'center',
                            animation: 'textIn 0.6s ease-out 0.3s both',
                        }}>
                            Sign in to your command center
                        </p>

                        {/* Server status */}
                        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', animation: 'textIn 0.6s ease-out 0.32s both' }}>
                            <ServerStatus status={serverStatus} />
                        </div>

                        {/* Error */}
                        {(error || rateLimitError) && (
                            <div style={{
                                marginBottom: 16, padding: '11px 14px', borderRadius: THEME.radiusMd,
                                background: `${THEME.danger}0f`, border: `1px solid ${THEME.danger}20`,
                                display: 'flex', alignItems: 'center', gap: 10,
                                animation: shake ? 'shake .5s ease' : 'none',
                            }}>
                                <AlertCircle size={14} color={THEME.danger} style={{ flexShrink: 0 }} />
                                <span style={{ color: THEME.danger, fontSize: 12, fontWeight: 500 }}>{error || rateLimitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {/* Username */}
                            <div style={{ marginBottom: 14, animation: 'textIn 0.6s ease-out 0.42s both' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted, letterSpacing: 0.2 }}>Username</label>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <User size={18} color={THEME.textDim} strokeWidth={1.5} style={{ position: 'absolute', left: 15, pointerEvents: 'none', transition: 'color 0.3s' }} />
                                    <input ref={userRef} className="vdb-input" type="text" value={username}
                                        onChange={e => setUsername(e.target.value)} placeholder="Enter username"
                                        autoComplete="username" disabled={authLoading}
                                        style={{
                                            width: '100%', padding: '11px 16px 11px 44px',
                                            background: THEME.surfaceHover, border: `1.5px solid ${THEME.glassBorder}`,
                                            borderRadius: THEME.radiusMd, color: THEME.textMain, fontFamily: fontDisplay,
                                            fontSize: '0.88rem', outline: 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                            boxShadow: THEME.shadowSm,
                                            opacity: authLoading ? 0.5 : 1,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 14, animation: 'textIn 0.6s ease-out 0.48s both' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted, letterSpacing: 0.2 }}>Password</label>
                                    <button type="button" className="vdb-forgot" onClick={() => setShowForgotPassword(true)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 0, fontSize: '0.72rem', fontFamily: fontMono, transition: 'color 0.3s' }}>
                                        Forgot password?
                                    </button>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <KeyRound size={18} color={THEME.textDim} strokeWidth={1.5} style={{ position: 'absolute', left: 15, pointerEvents: 'none', transition: 'color 0.3s' }} />
                                    <input ref={pwdRef} className="vdb-input" type={showPwd ? 'text' : 'password'} value={password}
                                        onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                                        autoComplete="current-password" disabled={authLoading}
                                        style={{
                                            width: '100%', padding: '11px 44px 11px 44px',
                                            background: THEME.surfaceHover, border: `1.5px solid ${THEME.glassBorder}`,
                                            borderRadius: THEME.radiusMd, color: THEME.textMain, fontFamily: fontDisplay,
                                            fontSize: '0.88rem', outline: 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                            boxShadow: THEME.shadowSm,
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
                                marginBottom: 18, animation: 'textIn 0.6s ease-out 0.52s both',
                            }}>
                                <div onClick={() => setRememberMe(r => !r)} style={{
                                    width: 20, height: 20, borderRadius: THEME.radiusSm, flexShrink: 0, cursor: 'pointer',
                                    border: `1.5px solid ${rememberMe ? accent : THEME.glassBorder}`,
                                    background: rememberMe ? accent : THEME.surfaceHover,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    boxShadow: rememberMe ? `0 2px 8px ${accent}26` : THEME.shadowSm,
                                }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.textMain} strokeWidth="3"
                                        style={{ opacity: rememberMe ? 1 : 0, transform: rememberMe ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.2s ease' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span onClick={() => setRememberMe(r => !r)} style={{ fontSize: '0.84rem', color: THEME.textMuted, cursor: 'pointer' }}>
                                    Remember this device for 30 days
                                </span>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="vdb-submit" disabled={!canSubmit} style={{
                                width: '100%', padding: 12, border: 'none', borderRadius: THEME.radiusMd,
                                background: canSubmit ? `linear-gradient(135deg, ${accent}, ${accentHover})` : THEME.surfaceHover,
                                color: canSubmit ? THEME.textMain : THEME.textDim,
                                fontFamily: fontDisplay, fontWeight: 700, fontSize: '0.95rem',
                                letterSpacing: 0.3, cursor: canSubmit ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden',
                                boxShadow: canSubmit ? `0 4px 16px ${accent}26, 0 1px 3px rgba(0,0,0,0.04)` : 'none',
                                animation: 'textIn 0.6s ease-out 0.56s both',
                            }}>
                                {authLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <Loader size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Authenticating...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        Sign in to VIGIL <ArrowRight size={16} strokeWidth={2} />
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div style={{
                            textAlign: 'center', marginTop: 18, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: 6,
                            fontSize: '0.72rem', color: THEME.textDim, fontFamily: fontMono,
                            animation: 'textIn 0.6s ease-out 0.65s both',
                        }}>
                            <Shield size={13} color={accent} />
                            Protected by 256-bit TLS encryption
                        </div>

                        {/* Success overlay */}
                        {loginSuccess && (
                            <div style={{
                                position: 'absolute', inset: 0, background: `${THEME.surfaceRaised}f5`,
                                alignItems: 'center', justifyContent: 'center', zIndex: 10,
                                borderRadius: '0 22px 22px 0',
                            }}>
                                <div style={{
                                    width: 76, height: 76, borderRadius: '50%',
                                    background: `${accent}14`, border: `2px solid ${accent}26`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 20, animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
                                }}>
                                    <CheckCircle size={34} color={accent} strokeWidth={2} />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.35rem', color: THEME.textMain, marginBottom: 6, animation: 'textIn 0.5s ease 0.5s both' }}>Welcome back!</div>
                                <div style={{ color: THEME.textMuted, fontSize: '0.88rem', animation: 'textIn 0.5s ease 0.6s both' }}>Redirecting to your dashboard...</div>
                                <div style={{ width: 180, height: 3, background: THEME.surfaceHover, borderRadius: THEME.radiusSm, marginTop: 20, overflow: 'hidden', animation: 'textIn 0.5s ease 0.7s both' }}>
                                    <div style={{ height: '100%', background: accent, borderRadius: THEME.radiusSm, width: '0%', animation: 'progressFill 2s ease 0.8s forwards' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ FORGOT PASSWORD MODAL ═══ */}
            {showForgotPassword && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    zIndex: 1000, animation: 'textIn .3s ease',
                }} onClick={() => setShowForgotPassword(false)}>
                    <div style={{
                        background: THEME.surfaceRaised, borderRadius: THEME.radiusLg, padding: 32, maxWidth: 400, width: '90%',
                        border: `1px solid ${THEME.glassBorder}`,
                        boxShadow: THEME.shadowLg,
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: THEME.textMain, marginBottom: 8 }}>Reset Password</h3>
                        <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 20 }}>Enter your email and we'll send you a reset link.</p>
                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="vdb-input" type="email" placeholder="Enter your email" value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)} disabled={resetLoading}
                                style={{
                                    padding: '12px 14px', borderRadius: THEME.radiusMd,
                                    border: `1.5px solid ${THEME.glassBorder}`, background: THEME.surfaceHover,
                                    color: THEME.textMain, fontSize: 13, fontFamily: fontDisplay, outline: 'none',
                                    transition: 'all 0.3s',
                                }}
                            />
                            {resetMessage && (
                                <div style={{
                                    padding: '10px 12px', borderRadius: THEME.radiusMd,
                                    background: resetMessage.includes('failed') || resetMessage.includes('Unable') ? `${THEME.danger}0f` : `${accent}0f`,
                                    color: resetMessage.includes('failed') || resetMessage.includes('Unable') ? THEME.danger : accent, fontSize: 12,
                                }}>
                                    {resetMessage}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button type="submit" disabled={!resetEmail.trim() || resetLoading} style={{
                                    flex: 1, padding: '12px 16px', borderRadius: THEME.radiusMd, border: 'none',
                                    background: resetEmail.trim() && !resetLoading ? `linear-gradient(135deg, ${accent}, ${accentHover})` : THEME.surfaceHover,
                                    color: resetEmail.trim() && !resetLoading ? THEME.textMain : THEME.textDim,
                                    fontSize: 13, fontWeight: 600, cursor: resetEmail.trim() && !resetLoading ? 'pointer' : 'not-allowed',
                                    fontFamily: fontDisplay, transition: 'all 0.3s',
                                }}>
                                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button type="button" onClick={() => setShowForgotPassword(false)} style={{
                                    flex: 1, padding: '12px 16px', borderRadius: THEME.radiusMd,
                                    border: `1.5px solid ${THEME.glassBorder}`, background: 'transparent',
                                    color: THEME.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
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
                    width: 40, height: 40, borderRadius: '50%',
                    background: THEME.surfaceHover, border: `1px solid ${THEME.glassBorder}`,
                    cursor: 'pointer', color: THEME.textDim, transition: 'all .3s', outline: 'none',
                }}>
                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
        </div>
    );
};

export default LoginPage;