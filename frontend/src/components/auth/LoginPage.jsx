// ==========================================================================
//  VIGIL — Login Page  (v3.0 — Cinematic Redesign)
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    Database, Eye, EyeOff,
    Loader, AlertCircle, CheckCircle, ArrowRight,
    User, KeyRound, Activity, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════════════════
//  KEYFRAMES — all animations for the page
// ═══════════════════════════════════════════════════════════════════════════

const LoginStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Entrance orchestration ── */
        @keyframes vLoginFadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vLoginFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes vLoginScaleIn {
            from { opacity: 0; transform: scale(0.85); }
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

        /* ── Background animations ── */
        @keyframes vGridScroll {
            from { transform: translate(0, 0); }
            to   { transform: translate(80px, 80px); }
        }
        @keyframes vOrbFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
            33% { transform: translate(40px, -60px) scale(1.15); opacity: 0.7; }
            66% { transform: translate(-20px, -30px) scale(0.95); opacity: 0.4; }
        }
        @keyframes vOrbFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
            50% { transform: translate(-50px, 40px) scale(1.1); opacity: 0.6; }
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

        /* ── Logo animation ── */
        @keyframes vLogoGlow {
            0%, 100% { box-shadow: 0 0 20px ${THEME.primary}25, 0 0 60px ${THEME.primary}08; }
            50%      { box-shadow: 0 0 30px ${THEME.primary}40, 0 0 80px ${THEME.primary}15; }
        }
        @keyframes vLogoPulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.04); }
        }

        /* ── Ring SVG animation ── */
        @keyframes vRingRotate {
            to { transform: rotate(360deg); }
        }
        @keyframes vRingRotateReverse {
            to { transform: rotate(-360deg); }
        }
        @keyframes vDashSpin {
            to { stroke-dashoffset: 0; }
        }

        /* ── Card border glow ── */
        @keyframes vBorderGlow {
            0%, 100% { opacity: 0.3; }
            50%      { opacity: 0.7; }
        }

        /* ── Success ── */
        @keyframes vSuccessPop {
            0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
            50%  { transform: scale(1.15) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes vSuccessRipple {
            0%   { transform: scale(0.5); opacity: 0.5; }
            100% { transform: scale(3); opacity: 0; }
        }

        /* ── Autofill fix ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #0a1628 inset !important;
            -webkit-text-fill-color: #F8FAFC !important;
            caret-color: #F8FAFC;
            transition: background-color 5000s ease-in-out 0s;
        }

        /* ── Input placeholder ── */
        .vigil-input::placeholder {
            color: ${THEME.textDim};
            opacity: 1;
        }
        .vigil-input:focus::placeholder {
            color: transparent;
        }
    `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedBackground = () => (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Base gradient */}
        <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 50% 40%, #0a1628 0%, ${THEME.bg} 100%)`,
        }} />

        {/* Grid */}
        <div style={{
            position: 'absolute', inset: -80, opacity: 0.4,
            backgroundImage: `
                linear-gradient(${THEME.primary}06 1px, transparent 1px),
                linear-gradient(90deg, ${THEME.primary}06 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'vGridScroll 25s linear infinite',
        }} />

        {/* Diagonal accent lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
            <line x1="0" y1="100%" x2="100%" y2="0" stroke={THEME.primary} strokeWidth="1" />
            <line x1="20%" y1="100%" x2="100%" y2="20%" stroke={THEME.primary} strokeWidth="0.5" />
            <line x1="0" y1="80%" x2="80%" y2="0" stroke={THEME.secondary} strokeWidth="0.5" />
        </svg>

        {/* Orbs */}
        <div style={{
            position: 'absolute', top: '10%', left: '15%', width: 600, height: 600,
            background: `radial-gradient(circle, ${THEME.primary}0a 0%, transparent 65%)`,
            animation: 'vOrbFloat1 20s ease-in-out infinite',
            filter: 'blur(40px)',
        }} />
        <div style={{
            position: 'absolute', bottom: '5%', right: '10%', width: 500, height: 500,
            background: `radial-gradient(circle, ${THEME.secondary}08 0%, transparent 65%)`,
            animation: 'vOrbFloat2 16s ease-in-out infinite',
            filter: 'blur(50px)',
        }} />
        <div style={{
            position: 'absolute', top: '50%', left: '60%', width: 300, height: 300,
            background: `radial-gradient(circle, ${THEME.cyan}06 0%, transparent 65%)`,
            animation: 'vOrbFloat1 14s ease-in-out 3s infinite reverse',
            filter: 'blur(30px)',
        }} />

        {/* Top edge glow */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent 10%, ${THEME.primary}40 50%, transparent 90%)`,
        }} />

        {/* Noise grain overlay */}
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.015,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
        }} />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  LOGO EMBLEM — animated rings + database icon
// ═══════════════════════════════════════════════════════════════════════════

const LogoEmblem = ({ success }) => {
    const size = 88;
    const c = size / 2;
    const r1 = 38, r2 = 32;

    return (
        <div style={{
            position: 'relative', width: size, height: size,
            animation: 'vLogoPulse 4s ease-in-out infinite',
        }}>
            {/* Outer glow */}
            <div style={{
                position: 'absolute', inset: -12,
                borderRadius: '50%',
                background: success
                    ? `radial-gradient(circle, ${THEME.success}20 0%, transparent 70%)`
                    : `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`,
                animation: 'vLogoGlow 3s ease-in-out infinite',
                transition: 'background 0.8s',
            }} />

            {/* SVG rings */}
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Outer ring — dashed, rotating */}
                <circle cx={c} cy={c} r={r1}
                        fill="none"
                        stroke={success ? THEME.success : THEME.primary}
                        strokeWidth="1"
                        strokeDasharray="6 4"
                        opacity="0.5"
                        style={{ transformOrigin: 'center', animation: 'vRingRotate 20s linear infinite', transition: 'stroke 0.8s' }}
                />
                {/* Inner ring — solid arc */}
                <circle cx={c} cy={c} r={r2}
                        fill="none"
                        stroke={success ? THEME.success : THEME.primary}
                        strokeWidth="1.5"
                        strokeDasharray={`${Math.PI * r2 * 0.6} ${Math.PI * r2 * 0.4}`}
                        strokeLinecap="round"
                        opacity="0.7"
                        style={{ transformOrigin: 'center', animation: 'vRingRotateReverse 12s linear infinite', transition: 'stroke 0.8s' }}
                />
                {/* Tiny accent dots on the outer ring */}
                {[0, 90, 180, 270].map(deg => (
                    <circle key={deg} cx={c + r1 * Math.cos(deg * Math.PI / 180)} cy={c + r1 * Math.sin(deg * Math.PI / 180)}
                            r="1.5" fill={success ? THEME.success : THEME.primary} opacity="0.6"
                            style={{ transition: 'fill 0.8s' }}
                    />
                ))}
            </svg>

            {/* Center icon */}
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: success
                        ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal})`
                        : `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: success
                        ? `0 4px 24px ${THEME.success}40`
                        : `0 4px 24px ${THEME.primary}30`,
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                    {success
                        ? <CheckCircle size={24} color="#fff" style={{ animation: 'vSuccessPop 0.5s ease backwards' }} />
                        : <Database size={24} color="#fff" />
                    }
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERVER STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

const ServerStatus = ({ status }) => {
    const isOnline  = status.status === 'online';
    const isOffline = status.status === 'offline';
    const checking  = status.status === 'checking';
    const color = isOnline ? THEME.success : isOffline ? THEME.danger : THEME.warning;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px 6px 10px', borderRadius: 100,
            background: `${color}08`, border: `1px solid ${color}18`,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            animation: 'vLoginFadeUp 0.6s ease 0.8s backwards',
        }}>
            {checking ? (
                <>
                    <Loader size={10} color={THEME.textDim} style={{ animation: 'vSpin 1s linear infinite' }} />
                    <span style={{ color: THEME.textDim }}>Checking…</span>
                </>
            ) : (
                <>
                    {/* Pulsing dot */}
                    <div style={{ position: 'relative', width: 8, height: 8 }}>
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: color, boxShadow: `0 0 6px ${color}80`,
                            animation: isOnline ? 'vPulseDot 2s ease-in-out infinite' : 'none',
                        }} />
                        {isOnline && <div style={{
                            position: 'absolute', inset: -2, borderRadius: '50%',
                            border: `1px solid ${color}60`,
                            animation: 'vPulseRing 2s ease-out infinite',
                        }} />}
                    </div>
                    <span style={{ color, fontWeight: 600, letterSpacing: '0.02em' }}>
                        {isOnline ? 'ONLINE' : isOffline ? 'OFFLINE' : 'DEGRADED'}
                    </span>
                    {status.latency != null && (
                        <span style={{
                            color: THEME.textDim, fontSize: 10,
                            padding: '1px 6px', borderRadius: 4,
                            background: 'rgba(255,255,255,0.04)',
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

const InputField = React.forwardRef(({
                                         icon: Icon, label, type = 'text', value, onChange,
                                         placeholder, autoComplete, disabled, rightElement
                                     }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label style={{
                display: 'block', marginBottom: 7, fontSize: 10.5, fontWeight: 700,
                color: focused ? THEME.primary : THEME.textDim,
                textTransform: 'uppercase', letterSpacing: '1.2px',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'color 0.2s',
            }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: focused ? 'rgba(14,165,233,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${focused ? THEME.primary + '50' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12, padding: '0 14px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: focused ? `0 0 0 3px ${THEME.primary}0c, 0 0 20px ${THEME.primary}08` : 'none',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Focus scanline */}
                {focused && <div style={{
                    position: 'absolute', left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${THEME.primary}40, transparent)`,
                    animation: 'vScanline 2s linear infinite',
                    pointerEvents: 'none',
                }} />}

                <Icon size={16} color={focused ? THEME.primary : hasValue ? THEME.textMuted : THEME.textDim}
                      style={{ flexShrink: 0, transition: 'color 0.2s' }} />

                <input
                    ref={ref} type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoComplete={autoComplete} disabled={disabled}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="vigil-input"
                    style={{
                        flex: 1, padding: '14px 0', background: 'none', border: 'none',
                        color: THEME.textMain, fontSize: 14, outline: 'none',
                        fontFamily: "'Outfit', sans-serif", fontWeight: 400,
                        letterSpacing: '0.01em',
                        opacity: disabled ? 0.4 : 1,
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

    // ── Health check ───────────────────────────────────────────────────
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

    // ── Restore remembered user ────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem('vigil_remembered_user');
        if (saved) { setUsername(saved); setRememberMe(true); passwordRef.current?.focus(); }
        else usernameRef.current?.focus();
    }, []);

    // ── Shake on error ─────────────────────────────────────────────────
    useEffect(() => {
        if (error) { setFormShake(true); const t = setTimeout(() => setFormShake(false), 600); return () => clearTimeout(t); }
    }, [error]);

    // ── Clear error on typing ──────────────────────────────────────────
    useEffect(() => {
        if (error && clearError) clearError();
    }, [username, password]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Submit ─────────────────────────────────────────────────────────
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

    // ═════════════════════════════════════════════════════════════════════
    //  RENDER
    // ═════════════════════════════════════════════════════════════════════

    return (
        <div style={{
            height: '100vh', width: '100vw',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: THEME.bg, position: 'relative', overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif",
        }}>
            <LoginStyles />
            <AnimatedBackground />

            {/* ── Main column ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 0, zIndex: 10, width: '100%', maxWidth: 440, padding: '0 24px',
            }}>

                {/* ── Logo emblem ── */}
                <div style={{ marginBottom: 28, animation: 'vLoginFadeUp 0.7s ease 0.1s backwards' }}>
                    <LogoEmblem success={loginSuccess} />
                </div>

                {/* ── Brand text ── */}
                <div style={{ textAlign: 'center', marginBottom: 6, animation: 'vLoginFadeUp 0.7s ease 0.2s backwards' }}>
                    <div style={{
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.35em',
                        textTransform: 'uppercase', color: THEME.primary,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: 8,
                    }}>

                    </div>
                    <h1 style={{
                        fontSize: 30, fontWeight: 800, color: THEME.textMain,
                        margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em',
                    }}>
                        Welcome back
                    </h1>
                    <p style={{
                        color: THEME.textMuted, margin: '10px 0 0', fontSize: 14,
                        fontWeight: 400, lineHeight: 1.5,
                    }}>
                        Sign in to your monitoring dashboard
                    </p>
                </div>

                {/* ── Server status ── */}
                <div style={{ margin: '16px 0 24px' }}>
                    <ServerStatus status={serverStatus} />
                </div>

                {/* ── Card ── */}
                <div style={{
                    width: '100%',
                    padding: '36px 32px 32px',
                    borderRadius: 20,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    border: `1px solid ${
                        loginSuccess ? THEME.success + '40'
                            : error ? THEME.danger + '35'
                                : 'rgba(255,255,255,0.06)'
                    }`,
                    boxShadow: loginSuccess
                        ? `0 0 60px ${THEME.success}10, 0 24px 48px rgba(0,0,0,0.5)`
                        : '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
                    transition: 'border-color 0.5s, box-shadow 0.5s',
                    animation: formShake ? 'vLoginShake 0.5s ease' : 'vLoginFadeUp 0.7s ease 0.35s backwards',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Top edge glow */}
                    <div style={{
                        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                        background: loginSuccess
                            ? `linear-gradient(90deg, transparent, ${THEME.success}60, transparent)`
                            : `linear-gradient(90deg, transparent, ${THEME.primary}30, transparent)`,
                        transition: 'background 0.5s',
                    }} />

                    {/* ── Success overlay ── */}
                    {loginSuccess && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `radial-gradient(circle at center, ${THEME.success}08 0%, transparent 70%)`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            zIndex: 20, borderRadius: 20,
                            animation: 'vLoginFadeIn 0.3s ease',
                        }}>
                            {/* Ripple */}
                            <div style={{
                                position: 'absolute', width: 80, height: 80, borderRadius: '50%',
                                border: `2px solid ${THEME.success}30`,
                                animation: 'vSuccessRipple 1s ease-out forwards',
                            }} />
                            <CheckCircle size={44} color={THEME.success}
                                         style={{ animation: 'vSuccessPop 0.5s ease backwards', marginBottom: 16 }} />
                            <div style={{
                                color: THEME.success, fontSize: 16, fontWeight: 700,
                                animation: 'vLoginFadeUp 0.4s ease 0.2s backwards',
                            }}>
                                Authenticated
                            </div>
                            <div style={{
                                color: THEME.textDim, fontSize: 12, marginTop: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                                animation: 'vLoginFadeUp 0.4s ease 0.35s backwards',
                            }}>
                                Redirecting to dashboard…
                            </div>
                        </div>
                    )}

                    {/* ── Error banner ── */}
                    {error && (
                        <div style={{
                            marginBottom: 20, padding: '11px 14px', borderRadius: 10,
                            background: `${THEME.danger}0a`,
                            border: `1px solid ${THEME.danger}25`,
                            display: 'flex', alignItems: 'center', gap: 10,
                            animation: 'vLoginSlideDown 0.3s ease backwards',
                        }}>
                            <AlertCircle size={15} color={THEME.danger} style={{ flexShrink: 0 }} />
                            <span style={{ color: THEME.danger, fontSize: 13, fontWeight: 500 }}>{error}</span>
                        </div>
                    )}

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: THEME.textDim, padding: 4, display: 'flex',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = THEME.textMuted}
                                        onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}
                                        tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />

                        {/* Remember me */}
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            cursor: 'pointer', fontSize: 12, color: THEME.textMuted,
                            userSelect: 'none', marginTop: -2,
                        }}>
                            <div
                                onClick={() => setRememberMe(!rememberMe)}
                                style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                    border: `1.5px solid ${rememberMe ? THEME.primary : 'rgba(255,255,255,0.12)'}`,
                                    background: rememberMe ? THEME.primary : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    cursor: 'pointer',
                                }}
                            >
                                {rememberMe && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontWeight: 400 }}>Remember me</span>
                        </label>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            style={{
                                position: 'relative', overflow: 'hidden',
                                background: authLoading
                                    ? `${THEME.primary}60`
                                    : loginSuccess
                                        ? THEME.success
                                        : canSubmit
                                            ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`
                                            : `linear-gradient(135deg, ${THEME.primary}40, ${THEME.secondary}40)`,
                                border: 'none', padding: '14px 24px', borderRadius: 12,
                                color: 'white', fontWeight: 700, fontSize: 14,
                                fontFamily: "'Outfit', sans-serif",
                                letterSpacing: '0.02em',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                marginTop: 6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: canSubmit
                                    ? `0 4px 20px ${THEME.primary}35, 0 0 0 1px ${THEME.primary}20 inset`
                                    : 'none',
                                transform: canSubmit ? 'translateY(0)' : 'translateY(0)',
                            }}
                            onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 28px ${THEME.primary}45, 0 0 0 1px ${THEME.primary}30 inset`; }}}
                            onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${THEME.primary}35, 0 0 0 1px ${THEME.primary}20 inset`; }}}
                        >
                            {/* Shimmer sweep */}
                            {canSubmit && !authLoading && (
                                <div style={{
                                    position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    animation: 'vScanline 3s linear infinite',
                                    pointerEvents: 'none',
                                }} />
                            )}

                            {authLoading ? (
                                <>
                                    <Loader size={16} style={{ animation: 'vSpin 1s linear infinite' }} />
                                    <span>Authenticating…</span>
                                </>
                            ) : loginSuccess ? (
                                <>
                                    <CheckCircle size={16} />
                                    <span>Success</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Footer ── */}
                <div style={{
                    marginTop: 24, textAlign: 'center',
                    animation: 'vLoginFadeUp 0.7s ease 0.6s backwards',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, color: THEME.textDim,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        <Shield size={11} style={{ opacity: 0.5 }} />
                        <span>Secured by Vigil • PostgreSQL Monitor v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
