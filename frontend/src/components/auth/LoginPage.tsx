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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES — gradient mesh + glassmorphism
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes blob1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(80px, -60px) scale(1.15); }
    50% { transform: translate(-40px, 80px) scale(0.9); }
    75% { transform: translate(60px, 40px) scale(1.05); }
  }
  @keyframes blob2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(-90px, 50px) scale(1.1); }
    50% { transform: translate(60px, -70px) scale(0.95); }
    75% { transform: translate(-30px, -40px) scale(1.08); }
  }
  @keyframes blob3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(50px, 70px) scale(0.92); }
    50% { transform: translate(-80px, -30px) scale(1.12); }
    75% { transform: translate(40px, -60px) scale(1); }
  }
  @keyframes blob4 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-60px, -80px) scale(1.1); }
    66% { transform: translate(70px, 50px) scale(0.95); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .glass-input:focus {
    outline: none;
    border-color: rgba(255,255,255,.4) !important;
    box-shadow: 0 0 0 3px rgba(255,255,255,.08), inset 0 0 0 1px rgba(255,255,255,.1) !important;
  }
  .glass-input::placeholder {
    color: rgba(255,255,255,.35);
  }
  .glass-input:-webkit-autofill,
  .glass-input:-webkit-autofill:hover,
  .glass-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,.06) inset !important;
    -webkit-text-fill-color: rgba(255,255,255,.9) !important;
    caret-color: rgba(255,255,255,.9);
    transition: background-color 5000s ease-in-out 0s;
  }

  .login-btn:not(:disabled):hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,.3), 0 0 60px rgba(139,92,246,.2) !important;
  }
  .login-btn:not(:disabled):active {
    transform: translateY(0) !important;
  }

  .sso-btn:hover {
    background: rgba(255,255,255,.12) !important;
    border-color: rgba(255,255,255,.25) !important;
    transform: translateY(-1px) !important;
  }

  .forgot-btn:hover {
    color: rgba(255,255,255,.9) !important;
  }

  .theme-toggle:hover {
    background: rgba(255,255,255,.15) !important;
    transform: scale(1.1) rotate(15deg) !important;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  GRADIENT MESH BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
const GradientMesh = () => (
    <div
        style={{
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 25%, #1e1145 50%, #0d1b3e 75%, #0a0e27 100%)',
            zIndex: 0,
        }}
    >
        {/* Blob 1 — Purple/Violet */}
        <div
            style={{
                position: 'absolute',
                top: '10%',
                left: '15%',
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,.35) 0%, rgba(139,92,246,.08) 50%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'blob1 20s ease-in-out infinite',
            }}
        />
        {/* Blob 2 — Cyan/Teal */}
        <div
            style={{
                position: 'absolute',
                top: '50%',
                right: '10%',
                width: 450,
                height: 450,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,.3) 0%, rgba(6,182,212,.06) 50%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'blob2 25s ease-in-out infinite',
            }}
        />
        {/* Blob 3 — Pink/Rose */}
        <div
            style={{
                position: 'absolute',
                bottom: '10%',
                left: '30%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(244,63,94,.25) 0%, rgba(244,63,94,.05) 50%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'blob3 22s ease-in-out infinite',
            }}
        />
        {/* Blob 4 — Blue accent */}
        <div
            style={{
                position: 'absolute',
                top: '30%',
                right: '35%',
                width: 350,
                height: 350,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,.2) 0%, rgba(59,130,246,.04) 50%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'blob4 18s ease-in-out infinite',
            }}
        />

        {/* Noise overlay for texture */}
        <div
            style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
        />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS (glassmorphism style)
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }: { status: { status: string; latency?: number } }) => {
    const isOnline = status.status === 'online';
    const color = isOnline ? '#34d399' : status.status === 'offline' ? '#f87171' : '#fbbf24';
    const label = isOnline ? 'ONLINE' : status.status === 'offline' ? 'OFFLINE' : 'CHECKING';

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px',
                borderRadius: 100,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.08)',
                backdropFilter: 'blur(8px)',
                fontSize: 9,
                fontWeight: 600,
                color,
                letterSpacing: '.12em',
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
            }}
        >
            {status.status === 'checking' ? (
                <Loader size={10} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
                <div
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 10px ${color}80`,
                    }}
                />
            )}
            {label}
        </div>
    );
};

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
    const userRef = useRef<HTMLInputElement>(null);
    const pwdRef = useRef<HTMLInputElement>(null);

    // Check server health
    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const t0 = performance.now();
                const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
                const d = await res.json();
                if (!cancelled) {
                    setServerStatus({
                        status: d.status === 'ok' ? 'online' : 'degraded',
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

    // Load remembered user
    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) {
            setUsername(saved);
            setRememberMe(true);
            pwdRef.current?.focus();
        } else {
            userRef.current?.focus();
        }
    }, []);

    // Error shake
    useEffect(() => {
        if (error) {
            setShake(true);
            const t = setTimeout(() => setShake(false), 600);
            return () => clearTimeout(t);
        }
    }, [error]);

    useEffect(() => {
        if (error && clearError) clearError();
    }, [username, password, clearError]);

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!username.trim() || !password.trim()) return;
            if (Date.now() < lockoutUntil) {
                setRateLimitError('Too many attempts. Please wait before trying again.');
                return;
            }
            setRateLimitError('');
            if (username.length > 255 || password.length > 1000) {
                setRateLimitError('Input too long');
                return;
            }
            if (rememberMe) {
                localStorage.setItem('vigil_remembered_user', username.trim());
            } else {
                localStorage.removeItem('vigil_remembered_user');
            }
            try { localStorage.removeItem('pg_monitor_active_tab'); } catch {}
            try {
                await login(username, password);
                setAttempts(0);
                setLockoutUntil(0);
            } catch (err) {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= 5) {
                    setLockoutUntil(Date.now() + 5 * 60 * 1000);
                    setAttempts(0);
                }
                throw err;
            }
        },
        [username, password, rememberMe, login, attempts, lockoutUntil],
    );

    const handleForgotPassword = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();
            if (!resetEmail.trim()) return;
            setResetLoading(true);
            setResetMessage('');
            try {
                const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetEmail }),
                });
                const data = await res.json();
                if (res.ok) {
                    setResetMessage('If an account exists, a reset link has been sent.');
                    setResetEmail('');
                    setTimeout(() => setShowForgotPassword(false), 2000);
                } else {
                    setResetMessage(data.error || 'Failed to process request');
                }
            } catch {
                setResetMessage('Unable to reach server. Please try again.');
            } finally {
                setResetLoading(false);
            }
        },
        [resetEmail],
    );

    const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !authLoading;

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <style>{STYLES}</style>

            {/* Animated gradient mesh background */}
            <GradientMesh />

            {/* Main glass card */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 420,
                    padding: '0 24px',
                    animation: 'fadeIn .8s ease-out',
                }}
            >
                {/* Logo + Branding */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: 32,
                        animation: 'float 6s ease-in-out infinite',
                    }}
                >
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, rgba(139,92,246,.8), rgba(6,182,212,.8))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 8px 32px rgba(139,92,246,.3), 0 0 60px rgba(139,92,246,.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,.15)',
                        }}
                    >
                        <Server size={26} color="#fff" strokeWidth={1.5} />
                    </div>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: '#fff',
                            margin: '0 0 4px',
                            letterSpacing: '0.08em',
                        }}
                    >
                        VIGIL
                    </h1>
                    <p
                        style={{
                            fontSize: 13,
                            color: 'rgba(255,255,255,.45)',
                            margin: 0,
                            letterSpacing: '0.04em',
                            fontWeight: 400,
                        }}
                    >
                        Database Command Center
                    </p>
                </div>

                {/* Server status */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <ServerStatus status={serverStatus} />
                </div>

                {/* Glass card */}
                <div
                    style={{
                        background: 'rgba(255,255,255,.06)',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        borderRadius: 20,
                        border: '1px solid rgba(255,255,255,.1)',
                        padding: '32px 28px',
                        boxShadow: '0 24px 80px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)',
                        animation: shake ? 'shake .5s ease' : 'none',
                    }}
                >
                    {/* Error */}
                    {(error || rateLimitError) && (
                        <div
                            style={{
                                marginBottom: 18,
                                padding: '12px 14px',
                                borderRadius: 12,
                                background: 'rgba(244,63,94,.12)',
                                border: '1px solid rgba(244,63,94,.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <AlertCircle size={14} color="#fb7185" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#fb7185', fontSize: 12, fontWeight: 500 }}>
                                {error || rateLimitError}
                            </span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Username */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label
                                style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: 'rgba(255,255,255,.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User
                                    size={16}
                                    color="rgba(255,255,255,.3)"
                                    strokeWidth={1.5}
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                />
                                <input
                                    ref={userRef}
                                    className="glass-input"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    autoComplete="username"
                                    disabled={authLoading}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 42px',
                                        background: 'rgba(255,255,255,.06)',
                                        border: '1px solid rgba(255,255,255,.1)',
                                        borderRadius: 12,
                                        color: 'rgba(255,255,255,.9)',
                                        fontSize: 14,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        transition: 'all .25s',
                                        opacity: authLoading ? 0.5 : 1,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label
                                style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: 'rgba(255,255,255,.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <KeyRound
                                    size={16}
                                    color="rgba(255,255,255,.3)"
                                    strokeWidth={1.5}
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                />
                                <input
                                    ref={pwdRef}
                                    className="glass-input"
                                    type={showPwd ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    disabled={authLoading}
                                    style={{
                                        width: '100%',
                                        padding: '12px 44px 12px 42px',
                                        background: 'rgba(255,255,255,.06)',
                                        border: '1px solid rgba(255,255,255,.1)',
                                        borderRadius: 12,
                                        color: 'rgba(255,255,255,.9)',
                                        fontSize: 14,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        transition: 'all .25s',
                                        opacity: authLoading ? 0.5 : 1,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    tabIndex={-1}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'rgba(255,255,255,.3)',
                                        padding: 4,
                                        display: 'flex',
                                        transition: 'color .2s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.3)'; }}
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => setRememberMe((r) => !r)}
                            >
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 5,
                                        flexShrink: 0,
                                        border: `1.5px solid ${rememberMe ? 'rgba(139,92,246,.8)' : 'rgba(255,255,255,.15)'}`,
                                        background: rememberMe ? 'rgba(139,92,246,.7)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all .25s',
                                    }}
                                >
                                    {rememberMe && (
                                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{ color: 'rgba(255,255,255,.45)' }}>Remember me</span>
                            </div>
                            <button
                                type="button"
                                className="forgot-btn"
                                onClick={() => setShowForgotPassword(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,.4)',
                                    padding: 0,
                                    fontSize: 12,
                                    transition: 'color .2s',
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign in button */}
                        <button
                            type="submit"
                            className="login-btn"
                            disabled={!canSubmit}
                            style={{
                                marginTop: 4,
                                background: canSubmit
                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                                    : 'rgba(255,255,255,.06)',
                                border: canSubmit ? 'none' : '1px solid rgba(255,255,255,.08)',
                                padding: '13px 20px',
                                borderRadius: 12,
                                color: canSubmit ? '#fff' : 'rgba(255,255,255,.25)',
                                fontWeight: 600,
                                fontSize: 14,
                                fontFamily: 'inherit',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all .3s ease',
                                boxShadow: canSubmit
                                    ? '0 12px 32px rgba(139,92,246,.3), 0 0 40px rgba(139,92,246,.1)'
                                    : 'none',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {authLoading ? (
                                <>
                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} strokeWidth={2} />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '2px 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)' }} />
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 500 }}>
                                or
                            </span>
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)' }} />
                        </div>

                        {/* SSO */}
                        <button
                            type="button"
                            className="sso-btn"
                            onClick={() => loginWithSSO('okta')}
                            style={{
                                padding: '12px 20px',
                                borderRadius: 12,
                                background: 'rgba(255,255,255,.06)',
                                border: '1px solid rgba(255,255,255,.1)',
                                color: 'rgba(255,255,255,.7)',
                                fontWeight: 500,
                                fontSize: 13,
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                cursor: 'pointer',
                                transition: 'all .25s',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Fingerprint size={15} color="rgba(139,92,246,.7)" strokeWidth={1.5} />
                            Continue with SSO
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 10,
                        color: 'rgba(255,255,255,.2)',
                        letterSpacing: '.04em',
                    }}
                >
                    <Lock size={10} />
                    TLS 1.3 encrypted
                </div>

                {/* Feature pills */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: 16,
                    }}
                >
                    {[
                        { label: '3 DB Engines', color: 'rgba(139,92,246,.5)' },
                        { label: '203 Metrics', color: 'rgba(6,182,212,.5)' },
                        { label: 'AI Powered', color: 'rgba(244,63,94,.4)' },
                    ].map(({ label, color }) => (
                        <div
                            key={label}
                            style={{
                                padding: '5px 12px',
                                borderRadius: 100,
                                background: 'rgba(255,255,255,.04)',
                                border: '1px solid rgba(255,255,255,.06)',
                                fontSize: 10,
                                fontWeight: 500,
                                color: 'rgba(255,255,255,.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                            }}
                        >
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,.6)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn .3s ease',
                    }}
                    onClick={() => setShowForgotPassword(false)}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,.08)',
                            backdropFilter: 'blur(24px) saturate(1.4)',
                            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                            borderRadius: 20,
                            padding: '32px',
                            maxWidth: '380px',
                            width: '90%',
                            border: '1px solid rgba(255,255,255,.1)',
                            boxShadow: '0 24px 80px rgba(0,0,0,.4)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                            Reset Password
                        </h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 20 }}>
                            Enter your email and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                className="glass-input"
                                type="email"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                disabled={resetLoading}
                                style={{
                                    padding: '11px 14px',
                                    borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,.1)',
                                    background: 'rgba(255,255,255,.06)',
                                    color: 'rgba(255,255,255,.9)',
                                    fontSize: 13,
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'all .25s',
                                }}
                            />

                            {resetMessage && (
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        background: resetMessage.includes('failed')
                                            ? 'rgba(244,63,94,.12)'
                                            : 'rgba(34,197,94,.12)',
                                        color: resetMessage.includes('failed') ? '#fb7185' : '#34d399',
                                        fontSize: 12,
                                    }}
                                >
                                    {resetMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button
                                    type="submit"
                                    disabled={!resetEmail.trim() || resetLoading}
                                    style={{
                                        flex: 1,
                                        padding: '11px 16px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: resetEmail.trim() && !resetLoading
                                            ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                                            : 'rgba(255,255,255,.06)',
                                        color: resetEmail.trim() && !resetLoading ? '#fff' : 'rgba(255,255,255,.25)',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: resetEmail.trim() && !resetLoading ? 'pointer' : 'not-allowed',
                                        fontFamily: 'inherit',
                                        transition: 'all .25s',
                                    }}
                                >
                                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    style={{
                                        flex: 1,
                                        padding: '11px 16px',
                                        borderRadius: 10,
                                        border: '1px solid rgba(255,255,255,.1)',
                                        background: 'transparent',
                                        color: 'rgba(255,255,255,.45)',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        transition: 'all .25s',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Theme Toggle */}
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                    position: 'fixed',
                    bottom: 24,
                    left: 24,
                    zIndex: 100,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.08)',
                    border: '1px solid rgba(255,255,255,.1)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,.4)',
                    transition: 'all .3s',
                    outline: 'none',
                }}
            >
                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
        </div>
    );
};

export default LoginPage;
