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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${THEME.surface} inset !important;
    -webkit-text-fill-color: ${THEME.textMain} !important;
    caret-color: ${THEME.textMain};
    transition: background-color 5000s ease-in-out 0s;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER STATUS
// ─────────────────────────────────────────────────────────────────────────────
const ServerStatus = ({ status }) => {
    const isOnline = status.status === 'online';
    const color = isOnline ? '#22c55e' : status.status === 'offline' ? '#ef4444' : '#f59e0b';
    const label = isOnline ? 'ONLINE' : status.status === 'offline' ? 'OFFLINE' : 'CHECKING';

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 100,
                background: `${color}0A`,
                border: `1px solid ${color}22`,
                fontFamily: THEME.fontMono,
                fontSize: 9,
                fontWeight: 600,
                color,
                letterSpacing: '.1em',
            }}
        >
            {status.status === 'checking' ? (
                <Loader size={10} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                    }}
                />
            )}
            {label}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
const InputField = React.forwardRef(function InputField(
    { icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, disabled, rightEl },
    ref,
) {
    const [focused, setFocused] = useState(false);
    const hasVal = value.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: focused ? '#0ea5e9' : THEME.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    fontFamily: THEME.fontMono,
                    transition: 'color .25s',
                }}
            >
                {label}
            </label>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: THEME.surface,
                    border: `1px solid ${focused ? '#0ea5e9' : THEME.grid}`,
                    borderRadius: 10,
                    padding: '0 14px',
                    transition: 'all .25s',
                    boxShadow: focused ? `0 0 0 3px rgba(14,165,233,.08)` : 'none',
                }}
            >
                <Icon
                    size={16}
                    color={focused ? '#0ea5e9' : hasVal ? THEME.textMuted : THEME.textDim}
                    style={{ flexShrink: 0, transition: 'color .25s' }}
                    strokeWidth={1.5}
                />
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        flex: 1,
                        padding: '11px 0',
                        background: 'none',
                        border: 'none',
                        color: THEME.textMain,
                        fontSize: 14,
                        outline: 'none',
                        fontFamily: THEME.fontBody,
                        opacity: disabled ? 0.5 : 1,
                    }}
                />
                {rightEl}
            </div>
        </div>
    );
});

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
    const [serverStatus, setServerStatus] = useState({ status: 'checking' });
    const [shake, setShake] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(0);
    const [rateLimitError, setRateLimitError] = useState('');
    const userRef = useRef(null);
    const pwdRef = useRef(null);

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
        return () => {
            cancelled = true;
            clearInterval(iv);
        };
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

    // Error shake animation
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
        async (e) => {
            e?.preventDefault();
            if (!username.trim() || !password.trim()) return;

            // Rate limiting
            if (Date.now() < lockoutUntil) {
                setRateLimitError('Too many attempts. Please wait before trying again.');
                return;
            }
            setRateLimitError('');

            // Input validation
            if (username.length > 255 || password.length > 1000) {
                setRateLimitError('Input too long');
                return;
            }

            if (rememberMe) {
                localStorage.setItem('vigil_remembered_user', username.trim());
            } else {
                localStorage.removeItem('vigil_remembered_user');
            }

            try {
                localStorage.removeItem('pg_monitor_active_tab');
            } catch {}

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
        async (e) => {
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
            } catch (err) {
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
                background: THEME.bg,
                fontFamily: THEME.fontBody,
                overflow: 'hidden',
            }}
        >
            <style>{STYLES}</style>

            {/* LEFT PANEL - Branding */}
            <div
                style={{
                    flex: '1 1 50%',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle background shapes */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        right: '-10%',
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14,165,233,.05) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-15%',
                        left: '-10%',
                        width: 350,
                        height: 350,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16,185,129,.04) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                />

                {/* Logo and branding */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
                    {/* Logo */}
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 24px rgba(14,165,233,.25)',
                        }}
                    >
                        <Server size={24} color="#fff" strokeWidth={1.5} />
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '0 0 8px',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        VIGIL
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#64748b',
                            margin: '0 0 24px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            fontFamily: THEME.fontMono,
                        }}
                    >
                        Database Monitor
                    </p>

                    {/* Tagline */}
                    <p
                        style={{
                            fontSize: 16,
                            color: '#0f172a',
                            lineHeight: 1.6,
                            margin: '0 0 32px',
                            fontWeight: 400,
                        }}
                    >
                        Every database, one command center.
                    </p>

                    {/* Feature pills */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {[
                            { label: '3 DB Engines', color: '#0ea5e9' },
                            { label: '203 Metrics', color: '#10b981' },
                            { label: 'AI Powered', color: '#a78bfa' },
                        ].map(({ label, color }) => (
                            <div
                                key={label}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    background: `${color}10`,
                                    border: `1px solid ${color}25`,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        background: color,
                                    }}
                                />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Login Form */}
            <div
                style={{
                    flex: '1 1 50%',
                    background: THEME.surface,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 40px',
                    position: 'relative',
                    overflow: 'auto',
                }}
            >
                {/* Subtle background glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '-5%',
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14,165,233,.03) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 360,
                    }}
                >
                    {/* Welcome heading */}
                    <div style={{ marginBottom: 24, textAlign: 'center' }}>
                        <h2
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: THEME.textMain,
                                margin: '0 0 8px',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Welcome back
                        </h2>
                        <p
                            style={{
                                fontSize: 13,
                                color: THEME.textMuted,
                                margin: 0,
                                lineHeight: 1.5,
                            }}
                        >
                            Sign in to your database command center
                        </p>
                    </div>

                    {/* Server status */}
                    <div
                        style={{
                            marginBottom: 20,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <ServerStatus status={serverStatus} />
                    </div>

                    {/* Login card */}
                    <div
                        style={{
                            background: THEME.bg,
                            borderRadius: 12,
                            padding: '24px',
                            border: `1px solid ${THEME.grid}`,
                            marginBottom: 16,
                            animation: shake ? 'shake .5s ease' : 'none',
                        }}
                    >
                        {/* Error message */}
                        {(error || rateLimitError) && (
                            <div
                                style={{
                                    marginBottom: 16,
                                    padding: '12px 14px',
                                    borderRadius: 8,
                                    background: 'rgba(239,68,68,.06)',
                                    border: '1px solid rgba(239,68,68,.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                                <span
                                    style={{
                                        color: '#ef4444',
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                >
                                    {error || rateLimitError}
                                </span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <InputField
                                ref={userRef}
                                icon={User}
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                placeholder="Enter username"
                                autoComplete="username"
                                disabled={authLoading}
                            />

                            <InputField
                                ref={pwdRef}
                                icon={KeyRound}
                                label="Password"
                                type={showPwd ? 'text' : 'password'}
                                value={password}
                                onChange={setPassword}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                disabled={authLoading}
                                rightEl={
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((s) => !s)}
                                        tabIndex={-1}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: THEME.textDim,
                                            padding: 4,
                                            display: 'flex',
                                            transition: 'color .2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#0ea5e9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = THEME.textDim;
                                        }}
                                    >
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />

                            {/* Remember + Forgot */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}
                                    onClick={() => setRememberMe((r) => !r)}
                                >
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            flexShrink: 0,
                                            border: `1.5px solid ${rememberMe ? '#0ea5e9' : THEME.grid}`,
                                            background: rememberMe ? '#0ea5e9' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all .25s',
                                        }}
                                    >
                                        {rememberMe && (
                                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                                <path
                                                    d="M2 5L4 7L8 3"
                                                    stroke="#fff"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{ color: THEME.textMuted }}>Remember me</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: THEME.textMuted,
                                        padding: 0,
                                        transition: 'color .2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#0ea5e9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = THEME.textMuted;
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign in button */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                style={{
                                    background: canSubmit
                                        ? 'linear-gradient(135deg, #0ea5e9, #10b981)'
                                        : THEME.surfaceHover,
                                    border: canSubmit ? 'none' : `1px solid ${THEME.grid}`,
                                    padding: '12px 20px',
                                    borderRadius: 10,
                                    color: canSubmit ? '#fff' : THEME.textMuted,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    fontFamily: THEME.fontBody,
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    transition: 'all .25s',
                                    boxShadow: canSubmit
                                        ? '0 8px 20px rgba(14,165,233,.25)'
                                        : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (canSubmit) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(14,165,233,.35)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (canSubmit) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(14,165,233,.25)';
                                    }
                                }}
                            >
                                {authLoading ? (
                                    <>
                                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>Sign In</>
                                )}
                            </button>

                            {/* Divider */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    margin: '6px 0',
                                }}
                            >
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: THEME.textMuted,
                                        fontFamily: THEME.fontMono,
                                        textTransform: 'uppercase',
                                        letterSpacing: '.8px',
                                    }}
                                >
                                    or
                                </span>
                                <div style={{ flex: 1, height: 1, background: THEME.grid }} />
                            </div>

                            {/* SSO button */}
                            <button
                                type="button"
                                onClick={() => loginWithSSO('okta')}
                                style={{
                                    padding: '11px 20px',
                                    borderRadius: 10,
                                    background: THEME.surface,
                                    border: `1px solid ${THEME.grid}`,
                                    color: THEME.textMain,
                                    fontWeight: 500,
                                    fontSize: 13,
                                    fontFamily: THEME.fontBody,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    cursor: 'pointer',
                                    transition: 'all .25s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = THEME.surfaceHover;
                                    e.currentTarget.style.borderColor = '#0ea5e9';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = THEME.surface;
                                    e.currentTarget.style.borderColor = THEME.grid;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Fingerprint size={14} color="#0ea5e9" />
                                Continue with SSO
                            </button>
                        </form>
                    </div>

                    {/* Footer text */}
                    <div
                        style={{
                            textAlign: 'center',
                            fontSize: 11,
                            color: THEME.textMuted,
                            fontFamily: THEME.fontMono,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                        }}
                    >
                        <Lock size={10} />
                        TLS 1.3 encrypted
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,.5)',
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
                            background: THEME.bg,
                            borderRadius: 12,
                            padding: '32px',
                            maxWidth: '380px',
                            width: '90%',
                            border: `1px solid ${THEME.grid}`,
                            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: THEME.textMain,
                                marginBottom: 8,
                            }}
                        >
                            Reset Password
                        </h3>
                        <p
                            style={{
                                fontSize: 13,
                                color: THEME.textMuted,
                                marginBottom: 20,
                            }}
                        >
                            Enter your email and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                disabled={resetLoading}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: `1px solid ${THEME.grid}`,
                                    background: THEME.surface,
                                    color: THEME.textMain,
                                    fontSize: 13,
                                    fontFamily: THEME.fontBody,
                                    outline: 'none',
                                }}
                            />

                            {resetMessage && (
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        background: resetMessage.includes('failed')
                                            ? 'rgba(239,68,68,.1)'
                                            : 'rgba(34,197,94,.1)',
                                        color: resetMessage.includes('failed') ? '#ef4444' : '#22c55e',
                                        fontSize: 12,
                                        fontFamily: THEME.fontBody,
                                    }}
                                >
                                    {resetMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button
                                    type="submit"
                                    disabled={!resetEmail.trim() || resetLoading}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background:
                                            resetEmail.trim() && !resetLoading ? '#0ea5e9' : THEME.surfaceHover,
                                        color:
                                            resetEmail.trim() && !resetLoading ? '#fff' : THEME.textMuted,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: resetEmail.trim() && !resetLoading ? 'pointer' : 'not-allowed',
                                        fontFamily: THEME.fontBody,
                                    }}
                                >
                                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        border: `1px solid ${THEME.grid}`,
                                        background: 'transparent',
                                        color: THEME.textMuted,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: THEME.fontBody,
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
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: THEME.textMuted,
                    transition: 'all .25s',
                    outline: 'none',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.surfaceHover;
                    e.currentTarget.style.color = '#0ea5e9';
                    e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = THEME.surface;
                    e.currentTarget.style.color = THEME.textMuted;
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
            >
                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
        </div>
    );
};

export default LoginPage;
