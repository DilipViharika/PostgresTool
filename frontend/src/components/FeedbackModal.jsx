import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Lightbulb, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import { THEME } from '../utils/theme.jsx';

// ─── All sections in your app ────────────────────────────────────────────────
const ALL_SECTIONS = [
    { id: 'overview',      label: 'Overview' },
    { id: 'performance',   label: 'Performance' },
    { id: 'resources',     label: 'Resources' },
    { id: 'reliability',   label: 'Reliability' },
    { id: 'indexes',       label: 'Indexes' },
    { id: 'alerts',        label: 'Alerts' },
    { id: 'sql',           label: 'SQL Editor' },
    { id: 'optimizer',     label: 'Query Optimizer' },
    { id: 'repository',    label: 'Repository' },
    { id: 'connections',   label: 'Connections' },
    { id: 'schema',        label: 'Schema' },
    { id: 'security',      label: 'Security' },
    { id: 'capacity',      label: 'Capacity' },
    { id: 'pool',          label: 'Pool' },
    { id: 'admin',         label: 'Admin' },
    { id: 'UserManagement', label: 'User Management' },
];

const ACTION_TYPES = [
    {
        id: 'feature',
        label: 'Request a Feature',
        icon: Sparkles,
        color: THEME.primary,
        placeholder: 'What feature or widget would you like added to this section? Describe what it should do and why it would help.',
    },
    {
        id: 'improvement',
        label: 'Suggest Improvement',
        icon: Lightbulb,
        color: '#F59E0B',
        placeholder: "What exists here that could work better? Describe the current behaviour and how you'd like it changed.",
    },
];

// Infer section from current URL path
function detectSection() {
    const path = window.location.pathname.toLowerCase().replace(/^\//, '');
    const match = ALL_SECTIONS.find(s => path.includes(s.id.toLowerCase()));
    return match?.id || 'overview';
}

// AUTH_TOKEN_KEY — match whatever key you use after login
const AUTH_TOKEN_KEY = 'token';

// ─── Main Modal ───────────────────────────────────────────────────────────────
const FeedbackModal = ({ isOpen, onClose, initialSection }) => {
    const [section, setSection]         = useState(initialSection || detectSection());
    const [actionType, setActionType]   = useState('feature');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [sent, setSent]               = useState(false);
    const [error, setError]             = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Re-sync section when modal opens
    useEffect(() => {
        if (isOpen) {
            setSection(initialSection || detectSection());
            setSent(false);
            setError('');
            setDescription('');
            setActionType('feature');
        }
    }, [isOpen, initialSection]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSubmit = async () => {
        if (!description.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('Not logged in. Please refresh and try again.');

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type:    actionType,          // maps to feedback_type column
                    rating:  5,                   // default 5; no star rating in this flow
                    comment: description.trim(),  // maps to comment column
                    user_metadata: {
                        section,
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
            setTimeout(() => { onClose(); }, 2500);

        } catch (e) {
            console.error('Feedback error:', e);
            setError(e.message || 'Failed to send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedSection = ALL_SECTIONS.find(s => s.id === section);
    const selectedAction  = ACTION_TYPES.find(a => a.id === actionType);
    const canSubmit       = description.trim().length > 0 && !submitting;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 480, maxWidth: 'calc(100vw - 32px)',
                background: THEME.surface,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 20,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                zIndex: 10001,
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>

                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: `1px solid ${THEME.grid}`,
                    background: `linear-gradient(135deg, ${THEME.primary}10, transparent)`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textMain, marginBottom: 3 }}>
                            Share Feedback
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textMuted }}>
                            Help us improve a specific section of Vigil
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: 'none', border: 'none',
                            color: THEME.textDim, cursor: 'pointer',
                            padding: 4, borderRadius: 6,
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = THEME.textMain}
                        onMouseLeave={e => e.currentTarget.style.color = THEME.textDim}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {sent ? (
                        // ── Success ──
                        <div style={{ textAlign: 'center', padding: '24px 0', color: THEME.success }}>
                            <CheckCircle2 size={48} style={{ marginBottom: 12 }} />
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Feedback submitted!</div>
                            <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6 }}>
                                Thanks for helping us improve the <strong style={{ color: THEME.textMain }}>{selectedSection?.label}</strong> section.
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Section Selector */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                                    Section
                                </label>
                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setDropdownOpen(o => !o)}
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            borderRadius: 10,
                                            background: `${THEME.bg}80`,
                                            border: `1px solid ${dropdownOpen ? THEME.primary : THEME.grid}`,
                                            color: THEME.textMain, fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer', textAlign: 'left',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'border-color 0.2s',
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: THEME.primary, display: 'inline-block',
                                            }} />
                                            {selectedSection?.label}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: THEME.textDim }}
                                        />
                                    </button>

                                    {dropdownOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                            background: THEME.surface,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            borderRadius: 10, zIndex: 100,
                                            maxHeight: 200, overflowY: 'auto',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                        }}>
                                            {ALL_SECTIONS.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => { setSection(s.id); setDropdownOpen(false); }}
                                                    style={{
                                                        width: '100%', padding: '9px 14px',
                                                        background: section === s.id ? `${THEME.primary}15` : 'transparent',
                                                        border: 'none', textAlign: 'left',
                                                        color: section === s.id ? THEME.primary : THEME.textMain,
                                                        fontSize: 13, cursor: 'pointer', fontWeight: section === s.id ? 700 : 400,
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => { if (section !== s.id) e.currentTarget.style.background = `${THEME.grid}40`; }}
                                                    onMouseLeave={e => { if (section !== s.id) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {section === s.id && <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.primary, flexShrink: 0 }} />}
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Type */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                                    Type of feedback
                                </label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {ACTION_TYPES.map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => setActionType(a.id)}
                                            style={{
                                                flex: 1, padding: '12px 10px', borderRadius: 10,
                                                border: `1.5px solid ${actionType === a.id ? a.color : THEME.grid}`,
                                                background: actionType === a.id ? `${a.color}12` : 'transparent',
                                                color: actionType === a.id ? a.color : THEME.textDim,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                            }}
                                        >
                                            <a.icon size={18} />
                                            <span style={{ fontSize: 11, fontWeight: 700 }}>{a.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={selectedAction?.placeholder}
                                    style={{
                                        width: '100%', height: 110, borderRadius: 10,
                                        background: `${THEME.bg}80`,
                                        border: `1px solid ${description.trim() ? THEME.primary + '60' : THEME.grid}`,
                                        color: THEME.textMain, padding: '12px 14px', fontSize: 13,
                                        resize: 'none', outline: 'none',
                                        boxSizing: 'border-box', fontFamily: 'inherit',
                                        lineHeight: 1.6, transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = THEME.primary}
                                    onBlur={e => e.target.style.borderColor = description.trim() ? THEME.primary + '60' : THEME.grid}
                                    autoFocus
                                />
                                <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4, textAlign: 'right' }}>
                                    {description.length} chars
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                                    background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}40`,
                                    color: THEME.danger, fontSize: 12,
                                }}>
                                    ⚠ {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
                                    background: canSubmit
                                        ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`
                                        : THEME.grid,
                                    color: '#fff', fontWeight: 700, fontSize: 13,
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    opacity: canSubmit ? 1 : 0.5,
                                    transition: 'opacity 0.2s, transform 0.1s',
                                    boxShadow: canSubmit ? `0 4px 16px ${THEME.primary}40` : 'none',
                                }}
                                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                            >
                                {submitting ? 'Submitting…' : <><Send size={14} /> Submit Feedback</>}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
            `}</style>
        </>
    );
};

export default FeedbackModal;