import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, ThumbsUp, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import { THEME } from '../utils/theme.jsx'; // Ensure this path is correct
import { postData } from '../utils/api';    // Ensure this path is correct

const FEEDBACK_TYPES = [
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: THEME.primary },
    { id: 'bug', label: 'Report Bug', icon: AlertTriangle, color: THEME.danger },
    { id: 'general', label: 'General', icon: MessageSquare, color: THEME.success },
];

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [rating, setRating] = useState(0);
    const [type, setType] = useState('feature');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    // Smart Auto-Open Logic
    useEffect(() => {
        const lastFeedback = localStorage.getItem('vigil_last_feedback');
        const sessionShown = sessionStorage.getItem('vigil_feedback_prompt_shown');

        // Show automatically if:
        // 1. Not shown in this specific browser tab session yet
        // 2. AND (Never given feedback OR it has been > 7 days since last feedback)
        const cooldownPassed = !lastFeedback || (Date.now() - Number(lastFeedback)) > 7 * 24 * 60 * 60 * 1000;

        if (!sessionShown && cooldownPassed) {
            const timer = setTimeout(() => {
                setIsMinimized(false);
                setIsOpen(true);
                sessionStorage.setItem('vigil_feedback_prompt_shown', 'true');
            }, 3000); // 3-second delay after login
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubmit = async () => {
        if (!comment.trim() || rating === 0) return;
        setSubmitting(true);
        try {
            await postData('/api/feedback', { type, rating, comment });
            setSent(true);
            localStorage.setItem('vigil_last_feedback', Date.now().toString());

            // Auto-close after success message
            setTimeout(() => {
                setIsOpen(false);
                setSent(false);
                setComment('');
                setRating(0);
                setIsMinimized(true);
            }, 2500);
        } catch (e) {
            console.error('Feedback failed:', e);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Minimized Floating Button
    if (isMinimized) {
        return (
            <button
                onClick={() => { setIsMinimized(false); setIsOpen(true); }}
                style={{
                    position: 'fixed', bottom: 20, right: 20,
                    width: 48, height: 48, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Send Feedback"
            >
                <MessageSquare size={22} />
            </button>
        );
    }

    if (!isOpen) return null;

    // Expanded Widget Form
    return (
        <div style={{
            position: 'fixed', bottom: 80, right: 20, width: 340,
            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            zIndex: 9999, overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px', background: `linear-gradient(135deg, ${THEME.primary}15, transparent)`,
                borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textMain }}>Help us improve</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Share your thoughts</div>
                </div>
                <button onClick={() => setIsMinimized(true)} style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ padding: 20 }}>
                {sent ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: THEME.success }}>
                        <ThumbsUp size={40} style={{ marginBottom: 10, animation: 'pulse 1s' }} />
                        <div style={{ fontWeight: 700 }}>Thank you!</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Your feedback has been recorded.</div>
                    </div>
                ) : (
                    <>
                        {/* Rating Stars */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <Star size={24} fill={star <= rating ? THEME.warning : 'transparent'} color={star <= rating ? THEME.warning : THEME.grid} style={{ transition: 'all 0.2s', transform: star <= rating ? 'scale(1.1)' : 'scale(1)' }} />
                                </button>
                            ))}
                        </div>

                        {/* Type Selection */}
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
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <t.icon size={14} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Tell us what you think..."
                            style={{
                                width: '100%', height: 80, borderRadius: 8,
                                background: `${THEME.bg}80`, border: `1px solid ${THEME.grid}`,
                                color: THEME.textMain, padding: 12, fontSize: 12,
                                resize: 'none', outline: 'none', marginBottom: 16,
                                boxSizing: 'border-box'
                            }}
                        />

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !comment.trim() || rating === 0}
                            style={{
                                width: '100%', padding: 10, borderRadius: 8, border: 'none',
                                background: submitting ? THEME.grid : THEME.primary,
                                color: '#fff', fontWeight: 700, fontSize: 12,
                                cursor: (submitting || !comment.trim()) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                opacity: (submitting || !comment.trim() || rating === 0) ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Sending...' : <><Send size={12} /> Send Feedback</>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackWidget;