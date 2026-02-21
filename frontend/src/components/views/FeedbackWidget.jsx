import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, X, Send, ThumbsUp, AlertTriangle,
    Lightbulb, Star, ChevronDown, Layers, PlusCircle, Zap
} from 'lucide-react';
import { THEME } from '../../utils/theme.jsx';

/* ─── Inject keyframes once ─────────────────────────────────────────────── */
const STYLE_ID = 'fw-redesign-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fw-rise {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes fw-pulse-ring {
            0%   { box-shadow: 0 0 0 0 rgba(99,179,237,0.45); }
            70%  { box-shadow: 0 0 0 10px rgba(99,179,237,0); }
            100% { box-shadow: 0 0 0 0 rgba(99,179,237,0); }
        }
        @keyframes fw-checkmark {
            from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
            to   { opacity: 1; transform: scale(1)   rotate(0deg); }
        }
        @keyframes fw-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
        .fw-fab:hover { transform: scale(1.08) !important; }
        .fw-fab:active { transform: scale(0.96) !important; }
        .fw-tab-btn:hover { opacity: 1 !important; }
        .fw-star:hover { transform: scale(1.25) !important; }
        .fw-close:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .fw-input:focus { border-color: #63B3ED !important; box-shadow: 0 0 0 3px rgba(99,179,237,0.12) !important; }
        .fw-submit:not(:disabled):hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,179,237,0.35) !important; }
        .fw-submit:not(:disabled):active { transform: translateY(0); }
        .fw-prio:hover { border-color: rgba(255,255,255,0.3) !important; background: rgba(255,255,255,0.05) !important; }
        .fw-section-opt:hover { background: rgba(99,179,237,0.08) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    `;
    document.head.appendChild(s);
}

/* ─── Auth token key ────────────────────────────────────────────────────── */
const AUTH_TOKEN_KEY = 'vigil_token';

/* ─── App sections ──────────────────────────────────────────────────────── */
const APP_SECTIONS = [
    { id: 'all',           label: 'All Sections (General)' },
    { id: 'connections',   label: 'Connections'            },
    { id: 'overview',      label: 'Overview'               },
    { id: 'performance',   label: 'Performance'            },
    { id: 'optimizer',     label: 'Query Optimizer'        },
    { id: 'resources',     label: 'Resources'              },
    { id: 'reliability',   label: 'Reliability'            },
    { id: 'indexes',       label: 'Indexes'                },
    { id: 'alerts',        label: 'Alerts'                 },
    { id: 'sql',           label: 'SQL Console'            },
    { id: 'api',           label: 'API Tracing'            },
    { id: 'repository',    label: 'Repository'             },
    { id: 'admin',         label: 'Admin'                  },
    { id: 'UserManagement',label: 'User Management'        },
    { id: 'pool',          label: 'Connection Pool'        },
    { id: 'schema',        label: 'Schema & Migrations'    },
    { id: 'security',      label: 'Security & Compliance'  },
    { id: 'capacity',      label: 'Capacity Planning'      },
];

/* ─── Feedback types ────────────────────────────────────────────────────── */
const FEEDBACK_TABS = [
    { id: 'feature', label: 'Feature',  icon: Lightbulb,    color: '#63B3ED' },
    { id: 'bug',     label: 'Bug',      icon: AlertTriangle, color: '#FC8181' },
    { id: 'general', label: 'General',  icon: MessageSquare, color: '#68D391' },
];

/* ─── Shared design tokens ──────────────────────────────────────────────── */
const D = {
    bg:        'rgba(10, 14, 22, 0.97)',
    surface:   'rgba(18, 24, 38, 0.98)',
    card:      'rgba(255,255,255,0.03)',
    border:    'rgba(255,255,255,0.07)',
    borderHov: 'rgba(99,179,237,0.4)',
    accent:    '#63B3ED',
    accentDim: 'rgba(99,179,237,0.15)',
    text:      '#E2E8F0',
    muted:     '#718096',
    dim:       '#4A5568',
    success:   '#68D391',
    danger:    '#FC8181',
    warning:   '#F6AD55',
    font:      "'DM Sans', sans-serif",
    mono:      "'DM Mono', monospace",
    radius:    '18px',
    radiusSm:  '10px',
};

const emptySection = () => ({ rating: 0, comment: '', remarks: '' });

/* ══════════════════════════════════════════════════════════════════════════
   STAR RATING
   ══════════════════════════════════════════════════════════════════════════ */
const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    const labels = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
    return (
        <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        className="fw-star"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, transition: 'transform 0.15s',
                        }}
                    >
                        <Star
                            size={22}
                            fill={star <= display ? D.warning : 'transparent'}
                            color={star <= display ? D.warning : D.dim}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
                {display > 0 && (
                    <span style={{ fontSize: 11, color: D.muted, fontFamily: D.mono, marginLeft: 4 }}>
                        {labels[display - 1]}
                    </span>
                )}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   SECTION DROPDOWN
   ══════════════════════════════════════════════════════════════════════════ */
const SectionDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = APP_SECTIONS.find(s => s.id === value) || APP_SECTIONS[0];

    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="fw-input"
                style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: D.radiusSm,
                    border: `1px solid ${open ? D.borderHov : D.border}`,
                    background: D.card,
                    color: D.text, fontSize: 13,
                    cursor: 'pointer', fontFamily: D.font,
                    transition: 'all 0.2s', boxSizing: 'border-box',
                    boxShadow: open ? `0 0 0 3px rgba(99,179,237,0.12)` : 'none',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={D.accent} />
                    <span>{selected.label}</span>
                </span>
                <ChevronDown
                    size={14} color={D.muted}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'rgba(15, 20, 32, 0.98)',
                    border: `1px solid ${D.border}`,
                    borderRadius: D.radiusSm,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    zIndex: 10, maxHeight: 240, overflowY: 'auto',
                    backdropFilter: 'blur(12px)',
                }}>
                    {APP_SECTIONS.map((sec, i) => (
                        <button
                            key={sec.id}
                            type="button"
                            className="fw-section-opt"
                            onClick={() => { onChange(sec.id); setOpen(false); }}
                            style={{
                                width: '100%', textAlign: 'left',
                                padding: '9px 14px',
                                background: sec.id === value ? D.accentDim : 'transparent',
                                color: sec.id === value ? D.accent : D.text,
                                border: 'none',
                                borderBottom: i < APP_SECTIONS.length - 1 ? `1px solid ${D.border}` : 'none',
                                cursor: 'pointer', fontSize: 12,
                                fontWeight: sec.id === value ? 600 : 400,
                                fontFamily: D.font,
                                transition: 'background 0.15s',
                            }}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   FIELD LABEL
   ══════════════════════════════════════════════════════════════════════════ */
const Label = ({ children }) => (
    <div style={{
        fontSize: 10, fontWeight: 600, color: D.muted,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 8, fontFamily: D.mono,
    }}>
        {children}
    </div>
);

const inputBase = {
    width: '100%', background: D.card,
    border: `1px solid ${D.border}`,
    borderRadius: D.radiusSm,
    padding: '10px 14px',
    color: D.text, fontSize: 13,
    outline: 'none', resize: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'all 0.2s',
};

/* ══════════════════════════════════════════════════════════════════════════
   SECTION FORM
   ══════════════════════════════════════════════════════════════════════════ */
const SectionForm = ({ sectionLabel, data, onChange, compact = false }) => (
    <div style={{
        border: `1px solid ${D.border}`,
        borderRadius: D.radiusSm,
        padding: compact ? '14px' : '18px',
        marginBottom: 10,
        background: D.card,
    }}>
        {compact && (
            <div style={{
                fontSize: 11, fontWeight: 600, color: D.accent,
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: D.mono,
            }}>
                <Layers size={11} /> {sectionLabel}
            </div>
        )}

        <div style={{ marginBottom: 14 }}>
            <Label>Rating</Label>
            <StarRating value={data.rating} onChange={v => onChange('rating', v)} />
        </div>

        <div style={{ marginBottom: 10 }}>
            <Label>Feedback</Label>
            <textarea
                value={data.comment}
                onChange={e => onChange('comment', e.target.value)}
                placeholder="What do you love or what could be better?"
                rows={compact ? 2 : 3}
                maxLength={500}
                className="fw-input"
                style={inputBase}
            />
            <div style={{ fontSize: 10, color: D.dim, textAlign: 'right', marginTop: 3, fontFamily: D.mono }}>
                {data.comment.length}/500
            </div>
        </div>

        <div>
            <Label>Suggestions</Label>
            <textarea
                value={data.remarks}
                onChange={e => onChange('remarks', e.target.value)}
                placeholder="Any specific improvements you'd recommend?"
                rows={compact ? 2 : 3}
                maxLength={500}
                className="fw-input"
                style={inputBase}
            />
            <div style={{ fontSize: 10, color: D.dim, textAlign: 'right', marginTop: 3, fontFamily: D.mono }}>
                {data.remarks.length}/500
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   FEATURE REQUEST FORM
   ══════════════════════════════════════════════════════════════════════════ */
const FeatureRequestForm = ({ data, onChange }) => (
    <div>
        <div style={{ marginBottom: 16 }}>
            <Label>Related Section</Label>
            <SectionDropdown value={data.section} onChange={v => onChange('section', v)} />
        </div>

        <div style={{ marginBottom: 14 }}>
            <Label>Feature Title</Label>
            <input
                type="text"
                value={data.title}
                onChange={e => onChange('title', e.target.value)}
                placeholder="Give your feature a short name"
                maxLength={120}
                className="fw-input"
                style={{ ...inputBase, resize: undefined }}
            />
        </div>

        <div style={{ marginBottom: 14 }}>
            <Label>Description / Use Case</Label>
            <textarea
                value={data.description}
                onChange={e => onChange('description', e.target.value)}
                placeholder="Describe the feature and why it would be useful..."
                rows={3}
                maxLength={500}
                className="fw-input"
                style={inputBase}
            />
            <div style={{ fontSize: 10, color: D.dim, textAlign: 'right', marginTop: 3, fontFamily: D.mono }}>
                {data.description.length}/500
            </div>
        </div>

        <div style={{ marginBottom: 14 }}>
            <Label>Additional Remarks</Label>
            <textarea
                value={data.remarks}
                onChange={e => onChange('remarks', e.target.value)}
                placeholder="Any implementation ideas or references?"
                rows={2}
                maxLength={500}
                className="fw-input"
                style={inputBase}
            />
        </div>

        {/* Suggest new tab */}
        <div style={{
            padding: '14px', border: `1px dashed rgba(99,179,237,0.25)`,
            borderRadius: D.radiusSm, background: 'rgba(99,179,237,0.03)',
            marginBottom: 14,
        }}>
            <Label><span style={{ color: D.accent, display: 'flex', alignItems: 'center', gap: 5 }}><PlusCircle size={10} /> Suggest a New Tab <span style={{ color: D.dim, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></span></Label>
            <input
                type="text"
                value={data.suggestedTab || ''}
                onChange={e => onChange('suggestedTab', e.target.value)}
                placeholder="e.g. Query History, Cost Estimator…"
                maxLength={80}
                className="fw-input"
                style={{
                    ...inputBase, resize: undefined,
                    borderColor: data.suggestedTab ? 'rgba(99,179,237,0.4)' : D.border,
                }}
            />
        </div>

        {/* Priority */}
        <div>
            <Label>Priority</Label>
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { label: 'Low',    color: D.success },
                    { label: 'Medium', color: D.warning },
                    { label: 'High',   color: D.danger  },
                ].map(({ label, color }) => {
                    const active = data.priority === label;
                    return (
                        <button
                            key={label}
                            type="button"
                            className="fw-prio"
                            onClick={() => onChange('priority', label)}
                            style={{
                                flex: 1, padding: '8px 0',
                                borderRadius: D.radiusSm,
                                border: `1px solid ${active ? color : D.border}`,
                                background: active ? `${color}18` : 'transparent',
                                color: active ? color : D.muted,
                                fontSize: 11, fontWeight: 600,
                                cursor: 'pointer', fontFamily: D.font,
                                transition: 'all 0.2s',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const FeedbackWidget = () => {
    const [isMinimized, setIsMinimized] = useState(true);
    const [activeTab, setActiveTab]     = useState('feature');
    const [section, setSection]         = useState('all');
    const [sectionForms, setSectionForms] = useState({ all: emptySection() });
    const [featureData, setFeatureData] = useState({
        section: 'all', title: '', description: '', remarks: '', priority: 'Medium', suggestedTab: '',
    });
    const [submitting, setSubmitting]   = useState(false);
    const [sent, setSent]               = useState(false);
    const [error, setError]             = useState('');

    /* Rate-limit: 1 submission per 5 min */
    useEffect(() => {
        if (!isMinimized) {
            const last = parseInt(localStorage.getItem('vigil_last_feedback') || '0', 10);
            if (Date.now() - last < 5 * 60 * 1000) setError('Please wait a few minutes before submitting again.');
            else setError('');
        }
    }, [isMinimized]);

    useEffect(() => {
        if (!sectionForms[section]) {
            setSectionForms(prev => ({ ...prev, [section]: emptySection() }));
        }
    }, [section]);

    const resetAll = () => {
        setActiveTab('feature');
        setSection('all');
        setSectionForms({ all: emptySection() });
        setFeatureData({ section: 'all', title: '', description: '', remarks: '', priority: 'Medium', suggestedTab: '' });
        setError('');
        setSent(false);
    };

    const handleClose = () => {
        setIsMinimized(true);
        setTimeout(resetAll, 350);
    };

    const updateSectionField = (secId, field, value) => {
        setSectionForms(prev => ({
            ...prev,
            [secId]: { ...(prev[secId] || emptySection()), [field]: value },
        }));
    };

    const buildPayload = () => {
        if (activeTab === 'feature') {
            return {
                feedback_type: 'feature',
                rating: null,
                comment: featureData.description.trim(),
                remarks: featureData.remarks.trim(),
                feature_title: featureData.title.trim(),
                feature_priority: featureData.priority,
                section: featureData.section,
                suggested_tab: featureData.suggestedTab.trim() || null,
                user_metadata: {
                    page: window.location.pathname,
                    userAgent: navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        if (section === 'all') {
            const sectionEntries = APP_SECTIONS.filter(s => s.id !== 'all').map(s => ({
                section_id: s.id, section_label: s.label,
                rating:     (sectionForms[s.id] || emptySection()).rating,
                comment:    (sectionForms[s.id] || emptySection()).comment.trim(),
                remarks:    (sectionForms[s.id] || emptySection()).remarks.trim(),
            }));
            return {
                feedback_type: activeTab, rating: null,
                comment: sectionEntries.map(e => `[${e.section_label}] ${e.comment}`).filter(s => s.trim()).join('\n'),
                section_feedback: sectionEntries,
                user_metadata: {
                    page: window.location.pathname, userAgent: navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    timestamp: new Date().toISOString(), mode: 'all-sections',
                },
            };
        }
        const form = sectionForms[section] || emptySection();
        return {
            feedback_type: activeTab, rating: form.rating || null,
            comment: form.comment.trim(), remarks: form.remarks.trim(),
            section,
            user_metadata: {
                page: window.location.pathname, userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString(),
            },
        };
    };

    const canSubmit = () => {
        if (sent || submitting) return false;
        if (activeTab === 'feature')
            return featureData.title.trim().length > 0 && featureData.description.trim().length > 0;
        if (section === 'all')
            return APP_SECTIONS.some(s => s.id !== 'all' && (sectionForms[s.id]?.comment || '').trim().length > 0);
        return (sectionForms[section]?.comment || '').trim().length > 0;
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setSubmitting(true); setError('');
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('You are not logged in. Please refresh and try again.');
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(buildPayload()),
            });
            if (res.status === 401) throw new Error('Session expired. Please log in again.');
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Server error (${res.status})`);
            }
            setSent(true);
            localStorage.setItem('vigil_last_feedback', Date.now().toString());
            setTimeout(handleClose, 2800);
        } catch (e) {
            console.error('Feedback error:', e);
            setError(e.message || 'Failed to send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const allSectionsList = APP_SECTIONS.filter(s => s.id !== 'all');
    const activeTabMeta = FEEDBACK_TABS.find(t => t.id === activeTab);

    /* ── FAB ──────────────────────────────────────────────────────────────── */
    if (isMinimized) {
        return (
            <button
                className="fw-fab"
                onClick={() => setIsMinimized(false)}
                title="Send Feedback"
                style={{
                    position: 'fixed', bottom: 24, right: 24,
                    width: 52, height: 52, borderRadius: '50%',
                    background: `linear-gradient(135deg, #4299E1, #63B3ED)`,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(66,153,225,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, transition: 'transform 0.2s, box-shadow 0.2s',
                    animation: 'fw-pulse-ring 2.5s ease-out infinite',
                }}
                aria-label="Open feedback widget"
            >
                <MessageSquare size={22} strokeWidth={2} />
            </button>
        );
    }

    /* ── Widget ───────────────────────────────────────────────────────────── */
    return (
        <div style={{
            position: 'fixed', bottom: 84, right: 24,
            width: section === 'all' && activeTab !== 'feature' ? 480 : 360,
            maxHeight: '84vh',
            background: D.bg,
            border: `1px solid ${D.border}`,
            borderRadius: D.radius,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fw-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            transition: 'width 0.3s ease',
            fontFamily: D.font,
            backdropFilter: 'blur(20px)',
        }}>

            {/* ── Subtle top glow ─────────────────────────────────────────── */}
            <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: '60%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(99,179,237,0.5), transparent)',
                pointerEvents: 'none',
            }} />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{
                padding: '18px 20px 16px',
                borderBottom: `1px solid ${D.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                flexShrink: 0,
            }}>
                <div>
                    <div style={{
                        fontWeight: 700, fontSize: 16, color: D.text, letterSpacing: '-0.02em',
                        marginBottom: 3,
                    }}>
                        Send Feedback
                    </div>
                    <div style={{
                        fontSize: 10, color: D.muted, fontFamily: D.mono,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                        Vigil · Database Monitor
                    </div>
                </div>
                <button
                    className="fw-close"
                    onClick={handleClose}
                    aria-label="Close"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${D.border}`,
                        color: D.muted, cursor: 'pointer',
                        width: 30, height: 30, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', flexShrink: 0,
                    }}
                >
                    <X size={14} strokeWidth={2} />
                </button>
            </div>

            {/* ── Tab Bar ─────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', gap: 6, padding: '12px 16px 10px',
                borderBottom: `1px solid ${D.border}`,
                flexShrink: 0,
            }}>
                {FEEDBACK_TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            className="fw-tab-btn"
                            onClick={() => { setActiveTab(tab.id); setError(''); }}
                            style={{
                                flex: 1, padding: '8px 6px',
                                background: active ? `${tab.color}15` : 'transparent',
                                border: `1px solid ${active ? `${tab.color}50` : D.border}`,
                                borderRadius: 8,
                                color: active ? tab.color : D.muted,
                                cursor: 'pointer', fontSize: 11, fontWeight: active ? 600 : 400,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                transition: 'all 0.2s', opacity: active ? 1 : 0.7,
                                fontFamily: D.font,
                            }}
                        >
                            <Icon size={13} strokeWidth={active ? 2 : 1.5} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

                {sent ? (
                    /* SUCCESS */
                    <div style={{
                        textAlign: 'center', padding: '36px 20px',
                        animation: 'fw-checkmark 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: `${D.success}15`,
                            border: `1px solid ${D.success}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <ThumbsUp size={26} color={D.success} strokeWidth={1.5} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: D.text, marginBottom: 8 }}>
                            Thanks for the feedback!
                        </div>
                        <div style={{ fontSize: 12, color: D.muted, lineHeight: 1.6 }}>
                            Your input helps us make Vigil better for everyone.
                        </div>
                    </div>
                ) : activeTab === 'feature' ? (
                    <FeatureRequestForm
                        data={featureData}
                        onChange={(field, val) => setFeatureData(prev => ({ ...prev, [field]: val }))}
                    />
                ) : (
                    <>
                        <div style={{ marginBottom: 14 }}>
                            <Label>Section</Label>
                            <SectionDropdown value={section} onChange={setSection} />
                        </div>

                        {section === 'all' ? (
                            <div>
                                <div style={{
                                    fontSize: 11, color: D.muted, marginBottom: 12,
                                    padding: '8px 12px',
                                    background: D.accentDim,
                                    border: `1px solid rgba(99,179,237,0.2)`,
                                    borderRadius: 8, lineHeight: 1.5,
                                }}>
                                    Fill in feedback for each section. You may leave sections blank to skip them.
                                </div>
                                {allSectionsList.map(sec => (
                                    <SectionForm
                                        key={sec.id}
                                        sectionLabel={sec.label}
                                        data={sectionForms[sec.id] || emptySection()}
                                        onChange={(field, val) => updateSectionField(sec.id, field, val)}
                                        compact
                                    />
                                ))}
                            </div>
                        ) : (
                            <SectionForm
                                sectionLabel={APP_SECTIONS.find(s => s.id === section)?.label}
                                data={sectionForms[section] || emptySection()}
                                onChange={(field, val) => updateSectionField(section, field, val)}
                            />
                        )}
                    </>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 8,
                        background: `${D.danger}10`,
                        border: `1px solid ${D.danger}30`,
                        color: D.danger, fontSize: 11, lineHeight: 1.5,
                    }}>
                        ⚠ {error}
                    </div>
                )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            {!sent && (
                <div style={{
                    padding: '12px 16px 16px',
                    borderTop: `1px solid ${D.border}`,
                    flexShrink: 0,
                }}>
                    <button
                        className="fw-submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit()}
                        style={{
                            width: '100%', padding: '12px 0',
                            borderRadius: 10,
                            background: canSubmit()
                                ? 'linear-gradient(135deg, #3182CE, #63B3ED)'
                                : D.card,
                            color: canSubmit() ? '#fff' : D.dim,
                            fontWeight: 600, fontSize: 13,
                            cursor: canSubmit() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            border: canSubmit() ? 'none' : `1px solid ${D.border}`,
                            transition: 'all 0.25s',
                            fontFamily: D.font,
                            letterSpacing: '0.01em',
                        }}
                    >
                        {submitting ? (
                            <>
                                <Zap size={14} /> Sending…
                            </>
                        ) : activeTab === 'feature' ? (
                            <><PlusCircle size={14} /> Submit Feature Request</>
                        ) : (
                            <><Send size={14} /> Send Feedback</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;