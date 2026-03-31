import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Lock, Loader, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   FORCE PASSWORD CHANGE MODAL
   ─────────────────────────────────────────────────────────────────────────
   Shown immediately after login when `mustChangePassword` is true.
   Requires the user to set a new password before accessing the dashboard.
   Uses the same glass-morphism style as LoginPage's forgot-password modal.
   ═══════════════════════════════════════════════════════════════════════════ */

interface ForcePasswordChangeModalProps {
    onSuccess: () => void;
    onLogout: () => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ onSuccess, onLogout }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength checks
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch && currentPassword.length > 0;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('vigil_token');
            const res = await fetch(`${API_BASE}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to change password');
                setLoading(false);
                return;
            }

            // Clear the must-change flag
            localStorage.removeItem('vigil_must_change_password');
            setSuccess(true);

            // Brief success message then proceed to dashboard
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Network error. Please try again.');
            setLoading(false);
        }
    }, [isValid, currentPassword, newPassword, onSuccess]);

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '11px 40px 11px 14px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(255,255,255,.04)',
        color: 'rgba(255,255,255,.9)',
        fontSize: 13,
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'all .25s',
        boxSizing: 'border-box' as const,
    };

    const eyeStyle: React.CSSProperties = {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,.3)',
        padding: 0,
        display: 'flex',
    };

    const checkStyle = (pass: boolean): React.CSSProperties => ({
        fontSize: 11,
        color: pass ? '#34d399' : 'rgba(255,255,255,.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color .3s',
    });

    if (success) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,.7)',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000,
            }}>
                <div style={{
                    background: 'rgba(255,255,255,.06)',
                    backdropFilter: 'blur(24px) saturate(1.3)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                    borderRadius: 20, padding: 32,
                    maxWidth: 400, width: '90%',
                    border: '1px solid rgba(255,255,255,.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,.4)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(34,197,94,.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <ShieldCheck size={28} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                        Password Updated
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.7)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
        }}>
            <div style={{
                background: 'rgba(255,255,255,.06)',
                backdropFilter: 'blur(24px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                borderRadius: 20, padding: 32,
                maxWidth: 420, width: '90%',
                border: '1px solid rgba(255,255,255,.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,.4)',
                animation: 'fadeIn .3s ease',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(139,92,246,.2), rgba(6,182,212,.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <KeyRound size={20} color="#8b5cf6" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                            Change Your Password
                        </h3>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', margin: '4px 0 0' }}>
                            A password change is required to continue
                        </p>
                    </div>
                </div>

                {/* Security notice */}
                <div style={{
                    margin: '16px 0',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(139,92,246,.06)',
                    border: '1px solid rgba(139,92,246,.1)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <Lock size={14} color="#8b5cf6" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.4 }}>
                        Your account requires a password update for security. Please set a new password below.
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(244,63,94,.1)',
                        border: '1px solid rgba(244,63,94,.15)',
                        color: '#fb7185', fontSize: 12,
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 12,
                    }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Current Password */}
                    <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                            Current Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                style={inputStyle}
                                autoFocus
                                disabled={loading}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={eyeStyle}>
                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={inputStyle}
                                disabled={loading}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} style={eyeStyle}>
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                            Confirm New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                style={inputStyle}
                                disabled={loading}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Password requirements */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '4px 16px', padding: '4px 0',
                    }}>
                        <span style={checkStyle(hasMinLength)}>
                            {hasMinLength ? '✓' : '○'} Min 8 characters
                        </span>
                        <span style={checkStyle(hasUppercase)}>
                            {hasUppercase ? '✓' : '○'} Uppercase letter
                        </span>
                        <span style={checkStyle(hasLowercase)}>
                            {hasLowercase ? '✓' : '○'} Lowercase letter
                        </span>
                        <span style={checkStyle(hasNumber)}>
                            {hasNumber ? '✓' : '○'} Number
                        </span>
                        <span style={checkStyle(passwordsMatch)}>
                            {passwordsMatch ? '✓' : '○'} Passwords match
                        </span>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                            type="submit"
                            disabled={!isValid || loading}
                            style={{
                                flex: 2, padding: '12px 16px', borderRadius: 10, border: 'none',
                                background: isValid && !loading
                                    ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                                    : 'rgba(255,255,255,.04)',
                                color: isValid && !loading ? '#fff' : 'rgba(255,255,255,.2)',
                                fontSize: 13, fontWeight: 600,
                                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                                fontFamily: 'inherit', transition: 'all .25s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: isValid && !loading ? '0 8px 24px rgba(139,92,246,.2)' : 'none',
                            }}
                        >
                            {loading ? (
                                <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</>
                            ) : (
                                <><ShieldCheck size={14} /> Update Password</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onLogout}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,.08)',
                                background: 'transparent',
                                color: 'rgba(255,255,255,.35)',
                                fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all .25s',
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;
