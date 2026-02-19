import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, ThumbsUp, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import { THEME } from '../utils/theme.jsx';
import FeedbackButton from '../components/FeedbackButton.jsx';

const FEEDBACK_TYPES = [
    { id: 'feature', label: 'Feature Request', icon: Lightbulb,      color: THEME.primary },
    { id: 'bug',     label: 'Report Bug',      icon: AlertTriangle,  color: THEME.danger  },
    { id: 'general', label: 'General',          icon: MessageSquare,  color: THEME.success },
];

// ─── Adjust this key to match how your app stores the JWT after login ────────
// Check your login flow: localStorage.setItem('???', data.token)
const AUTH_TOKEN_KEY = 'token';

const FeedbackWidget = () => {
    const [isMinimized, setIsMinimized] = useState(true);
    const [rating, setRating]           = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [type, setType]               = useState('feature');
    const [comment, setComment]         = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [sent, setSent]               = useState(false);
    const [error, setError]             = useState('');

    // Auto-open once per session if 7-day cooldown has passed
    useEffect(() => {
        const lastFeedback   = localStorage.getItem('vigil_last_feedback');
        const sessionShown   = sessionStorage.getItem('vigil_feedback_prompt_shown');
        const cooldownPassed =
            !lastFeedback ||
            Date.now() - Number(lastFeedback) > 7 * 24 * 60 * 60 * 1000;

        if (!sessionShown && cooldownPassed) {
            const timer = setTimeout(() => {
                setIsMinimized(false);
                sessionStorage.setItem('vigil_feedback_prompt_shown', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const resetForm = () => {
        setComment('');
        setRating(0);
        setHoveredStar(0);
        setType('feature');
        setError('');
        setSent(false);
    };

    const handleClose = () => {
        setIsMinimized(true);
        setTimeout(resetForm, 300);
    };

    const handleSubmit = async () => {
        if (!comment.trim() || rating === 0) return;

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('You are not logged in. Please refresh and try again.');

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,   // ← required by your authenticate middleware
                },
                body: JSON.stringify({
                    type,
                    rating,
                    comment: comment.trim(),
                    // Fills your user_metadata JSONB column — great context for bug reports
                    user_metadata: {
                        page:       window.location.pathname,
                        userAgent:  navigator.userAgent,
                        screenSize: `${window.screen.width}x${window.screen.height}`,
                        timestamp:  new Date().toISOString(),
                    },
                }),
            });

            if (res.status === 401) throw new Error('Session expired. Please log in again.');

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Server error (${res.status})`);
            }

            setSent(true);
            localStorage.setItem('vigil_last_feedback', Date.now().toString());
            setTimeout(handleClose, 2500);

        } catch (e) {
            console.error('Feedback error:', e);
            setError(e.message || 'Failed to send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit     = comment.trim().length > 0 && rating > 0 && !submitting;
    const displayRating = hoveredStar || rating;

    // ── Minimized floating button ─────────────────────────────────────────────
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                title="Send Feedback"
                style={{
                    position: 'fixed', bottom: 20, right: 20,
                    width: 48, height: 48, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageSquare size={22} />
            </button>
        );
    }

    // ── Expanded widget ───────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed', bottom: 80, right: 20, width: 340,
            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            zIndex: 9999, overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: `linear-gradient(135deg, ${THEME.primary}15, transparent)`,
                borderBottom: `1px solid ${THEME.grid}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textMain }}>Help us improve</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Share your thoughts</div>
                </div>
                <button
                    onClick={handleClose}
                    aria-label="Close feedback"
                    style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 4 }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: 20 }}>
                {sent ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: THEME.success }}>
                        <ThumbsUp size={40} style={{ marginBottom: 10 }} />
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Thank you!</div>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Your feedback has been recorded.</div>
                    </div>
                ) : (
                    <>
                        {/* Star Rating */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                                >
                                    <Star
                                        size={26}
                                        fill={star <= displayRating ? THEME.warning : 'transparent'}
                                        color={star <= displayRating ? THEME.warning : THEME.grid}
                                        style={{
                                            transition: 'all 0.15s',
                                            transform: star <= displayRating ? 'scale(1.15)' : 'scale(1)',
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Type Selector */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {FEEDBACK_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    style={{
                                        flex: 1, padding: '8px 4px', borderRadius: 8,
                                        border: `1px solid ${type === t.id ? t.color : THEME.grid}`,
                                        background: type === t.id ? `${t.color}15` : 'transparent',
                                        color: type === t.id ? t.color : THEME.textDim,
                                        cursor: 'pointer', fontSize: 10, fontWeight: 700,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <t.icon size={14} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Tell us what you think..."
                            style={{
                                width: '100%', height: 80, borderRadius: 8,
                                background: `${THEME.bg}80`, border: `1px solid ${THEME.grid}`,
                                color: THEME.textMain, padding: 12, fontSize: 12,
                                resize: 'none', outline: 'none', marginBottom: 12,
                                boxSizing: 'border-box', fontFamily: 'inherit',
                            }}
                        />

                        {/* Inline error */}
                        {error && (
                            <div style={{
                                marginBottom: 10, padding: '8px 12px', borderRadius: 8,
                                background: `${THEME.danger}15`, border: `1px solid ${THEME.danger}40`,
                                color: THEME.danger, fontSize: 11,
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                                width: '100%', padding: 10, borderRadius: 8, border: 'none',
                                background: canSubmit ? THEME.primary : THEME.grid,
                                color: '#fff', fontWeight: 700, fontSize: 12,
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                opacity: canSubmit ? 1 : 0.6,
                                transition: 'opacity 0.2s, background 0.2s',
                            }}
                        >
                            {submitting ? 'Sending…' : <><Send size={12} /> Send Feedback</>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackWidget;