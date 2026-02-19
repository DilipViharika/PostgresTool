import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, X, Send, ThumbsUp, AlertTriangle,
    Lightbulb, Star, ChevronDown, Layers, PlusCircle
} from 'lucide-react';
import { THEME } from '../utils/theme.jsx';

/* ─── Auth token key — must match your login flow ───────────────────────── */
const AUTH_TOKEN_KEY = 'token';

/* ─── All app sections pulled from TAB_CONFIG in App.jsx ────────────────── */
const APP_SECTIONS = [
    { id: 'all',         label: 'All Sections (General)' },
    { id: 'connections', label: 'Connections'             },
    { id: 'overview',    label: 'Overview'                },
    { id: 'performance', label: 'Performance'             },
    { id: 'optimizer',   label: 'Query Optimizer'         },
    { id: 'resources',   label: 'Resources'               },
    { id: 'reliability', label: 'Reliability'             },
    { id: 'indexes',     label: 'Indexes'                 },
    { id: 'alerts',      label: 'Alerts'                  },
    { id: 'sql',         label: 'SQL Console'             },
    { id: 'api',         label: 'API Tracing'             },
    { id: 'repository',  label: 'Repository'              },
    { id: 'admin',       label: 'Admin'                   },
    { id: 'UserManagement', label: 'User Management'      },
    { id: 'pool',        label: 'Connection Pool'         },
    { id: 'schema',      label: 'Schema & Migrations'     },
    { id: 'security',    label: 'Security & Compliance'   },
    { id: 'capacity',    label: 'Capacity Planning'       },
];

/* ─── Feedback type tabs ─────────────────────────────────────────────────── */
const FEEDBACK_TABS = [
    { id: 'bug',     label: 'Bug Report',      icon: AlertTriangle },
    { id: 'general', label: 'General',          icon: MessageSquare },
    { id: 'feature', label: 'Feature Request',  icon: Lightbulb    },
];

/* ─── Per-section form state factory ────────────────────────────────────── */
const emptySection = () => ({
    rating:  0,
    comment: '',
    remarks: '',
});

/* ══════════════════════════════════════════════════════════════════════════
   STAR RATING COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    return (
        <div role="group" aria-label="Rate your experience"
             style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                    <Star
                        size={24}
                        fill={star <= display ? THEME.warning : 'transparent'}
                        color={star <= display ? THEME.warning : THEME.grid}
                        style={{
                            transition: 'all 0.15s',
                            transform: star <= display ? 'scale(1.2)' : 'scale(1)',
                        }}
                    />
                </button>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   SECTION FORM — one set of fields for a single section
   ══════════════════════════════════════════════════════════════════════════ */
const SectionForm = ({ sectionLabel, data, onChange, compact = false }) => {
    const inputStyle = {
        width: '100%',
        background: `${THEME.bg}80`,
        border: `1px solid ${THEME.grid}`,
        borderRadius: 8,
        padding: '10px 12px',
        color: THEME.textMain,
        fontSize: 12,
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };
    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    };

    return (
        <div style={{
            border: `1px solid ${THEME.grid}`,
            borderRadius: 10,
            padding: compact ? '12px 14px' : '16px',
            marginBottom: 12,
            background: `${THEME.bg}40`,
        }}>
            {/* Section header label (shown in "All Sections" inline mode) */}
            {compact && (
                <div style={{
                    fontSize: 12, fontWeight: 700, color: THEME.primary,
                    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <Layers size={13} /> {sectionLabel}
                </div>
            )}

            {/* Star Rating */}
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Rating</label>
                <StarRating value={data.rating} onChange={v => onChange('rating', v)} />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Feedback / Comments</label>
                <textarea
                    value={data.comment}
                    onChange={e => onChange('comment', e.target.value)}
                    placeholder="What do you love or what could be better?"
                    rows={compact ? 2 : 3}
                    maxLength={500}
                    style={inputStyle}
                />
                <div style={{ fontSize: 10, color: THEME.textMuted, textAlign: 'right', marginTop: 2 }}>
                    {data.comment.length}/500
                </div>
            </div>

            {/* Remarks / Suggested Improvements */}
            <div>
                <label style={labelStyle}>Remarks / Suggested Improvements</label>
                <textarea
                    value={data.remarks}
                    onChange={e => onChange('remarks', e.target.value)}
                    placeholder="Any specific suggestions or improvements you'd recommend?"
                    rows={compact ? 2 : 3}
                    maxLength={500}
                    style={inputStyle}
                />
                <div style={{ fontSize: 10, color: THEME.textMuted, textAlign: 'right', marginTop: 2 }}>
                    {data.remarks.length}/500
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   DROPDOWN — custom styled select
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
        <div ref={ref} style={{ position: 'relative', marginBottom: 16 }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px', borderRadius: 8,
                    border: `1px solid ${open ? THEME.primary : THEME.grid}`,
                    background: `${THEME.bg}80`, color: THEME.textMain,
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={THEME.primary} />
                    {selected.label}
                </span>
                <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 10, maxHeight: 220, overflowY: 'auto',
                }}>
                    {APP_SECTIONS.map(sec => (
                        <button
                            key={sec.id}
                            type="button"
                            onClick={() => { onChange(sec.id); setOpen(false); }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '9px 14px',
                                background: sec.id === value ? `${THEME.primary}15` : 'transparent',
                                color: sec.id === value ? THEME.primary : THEME.textMain,
                                border: 'none', cursor: 'pointer', fontSize: 12,
                                fontWeight: sec.id === value ? 700 : 400,
                                borderBottom: `1px solid ${THEME.grid}30`,
                                transition: 'background 0.15s',
                                fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => { if (sec.id !== value) e.currentTarget.style.background = `${THEME.primary}08`; }}
                            onMouseLeave={e => { if (sec.id !== value) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {sec.id === 'all' ? <strong>{sec.label}</strong> : sec.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   FEATURE REQUEST FORM
   ══════════════════════════════════════════════════════════════════════════ */
const FeatureRequestForm = ({ data, onChange }) => {
    const inputStyle = {
        width: '100%',
        background: `${THEME.bg}80`,
        border: `1px solid ${THEME.grid}`,
        borderRadius: 8,
        padding: '10px 12px',
        color: THEME.textMain,
        fontSize: 12,
        outline: 'none',
        resize: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };
    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: THEME.textMuted, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: 0.5,
    };

    return (
        <div>
            {/* Section this feature relates to */}
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Related Section</label>
                <SectionDropdown value={data.section} onChange={v => onChange('section', v)} />
            </div>

            {/* Feature title */}
            <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Feature Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={e => onChange('title', e.target.value)}
                    placeholder="Give your feature a short name"
                    maxLength={120}
                    style={{ ...inputStyle, resize: undefined }}
                />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Description / Use Case</label>
                <textarea
                    value={data.description}
                    onChange={e => onChange('description', e.target.value)}
                    placeholder="Describe the feature and why it would be useful..."
                    rows={3}
                    maxLength={500}
                    style={inputStyle}
                />
                <div style={{ fontSize: 10, color: THEME.textMuted, textAlign: 'right', marginTop: 2 }}>
                    {data.description.length}/500
                </div>
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: 4 }}>
                <label style={labelStyle}>Additional Remarks / Suggested Approach</label>
                <textarea
                    value={data.remarks}
                    onChange={e => onChange('remarks', e.target.value)}
                    placeholder="Any implementation ideas or references?"
                    rows={2}
                    maxLength={500}
                    style={inputStyle}
                />
            </div>

            {/* Priority */}
            <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['Low', 'Medium', 'High'].map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onChange('priority', p)}
                            style={{
                                flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                border: `1px solid ${data.priority === p
                                    ? p === 'High' ? THEME.danger : p === 'Medium' ? THEME.warning : THEME.success
                                    : THEME.grid}`,
                                background: data.priority === p
                                    ? `${p === 'High' ? THEME.danger : p === 'Medium' ? THEME.warning : THEME.success}15`
                                    : 'transparent',
                                color: data.priority === p
                                    ? p === 'High' ? THEME.danger : p === 'Medium' ? THEME.warning : THEME.success
                                    : THEME.textDim,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN FEEDBACK WIDGET
   ══════════════════════════════════════════════════════════════════════════ */
const FeedbackWidget = () => {
    const [isMinimized, setIsMinimized]     = useState(true);
    const [activeTab, setActiveTab]         = useState('bug');       // bug | general | feature
    const [section, setSection]             = useState('all');       // selected section id
    const [sectionForms, setSectionForms]   = useState({ all: emptySection() }); // keyed by section id
    const [featureData, setFeatureData]     = useState({
        section: 'all', title: '', description: '', remarks: '', priority: 'Medium',
    });
    const [submitting, setSubmitting]       = useState(false);
    const [sent, setSent]                   = useState(false);
    const [error, setError]                 = useState('');

    /* ── inject keyframe animation once ────────────────────────────────── */
    useEffect(() => {
        if (!document.getElementById('fw-keyframes')) {
            const s = document.createElement('style');
            s.id = 'fw-keyframes';
            s.textContent = `
                @keyframes fw-slideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `;
            document.head.appendChild(s);
        }
    }, []);

    /* ── auto-open once per session after 7-day cooldown ───────────────── */
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

    /* ── ensure form state exists when section changes ──────────────────── */
    useEffect(() => {
        if (!sectionForms[section]) {
            setSectionForms(prev => ({ ...prev, [section]: emptySection() }));
        }
    }, [section]);

    /* ── helpers ─────────────────────────────────────────────────────────── */
    const resetAll = () => {
        setActiveTab('bug');
        setSection('all');
        setSectionForms({ all: emptySection() });
        setFeatureData({ section: 'all', title: '', description: '', remarks: '', priority: 'Medium' });
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

    /* ── submit logic ────────────────────────────────────────────────────── */
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
                user_metadata: {
                    page:       window.location.pathname,
                    userAgent:  navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    timestamp:  new Date().toISOString(),
                },
            };
        }

        // For bug / general — if section === 'all', send all section forms as array
        if (section === 'all') {
            const sectionEntries = APP_SECTIONS.filter(s => s.id !== 'all').map(s => ({
                section_id:    s.id,
                section_label: s.label,
                rating:        (sectionForms[s.id] || emptySection()).rating,
                comment:       (sectionForms[s.id] || emptySection()).comment.trim(),
                remarks:       (sectionForms[s.id] || emptySection()).remarks.trim(),
            }));
            return {
                feedback_type: activeTab,
                rating: null,
                comment: sectionEntries.map(e => `[${e.section_label}] ${e.comment}`).filter(s => s.trim()).join('\n'),
                section_feedback: sectionEntries,
                user_metadata: {
                    page:       window.location.pathname,
                    userAgent:  navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    timestamp:  new Date().toISOString(),
                    mode:       'all-sections',
                },
            };
        }

        const form = sectionForms[section] || emptySection();
        return {
            feedback_type: activeTab,
            rating:        form.rating || null,
            comment:       form.comment.trim(),
            remarks:       form.remarks.trim(),
            section:       section,
            user_metadata: {
                page:       window.location.pathname,
                userAgent:  navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                timestamp:  new Date().toISOString(),
            },
        };
    };

    const canSubmit = () => {
        if (sent || submitting) return false;
        if (activeTab === 'feature') {
            return featureData.title.trim().length > 0 && featureData.description.trim().length > 0;
        }
        if (section === 'all') {
            // At least one section must have a non-empty comment
            return APP_SECTIONS.some(s => s.id !== 'all' && (sectionForms[s.id]?.comment || '').trim().length > 0);
        }
        return (sectionForms[section]?.comment || '').trim().length > 0;
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('You are not logged in. Please refresh and try again.');

            const res = await fetch('/api/feedback', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(buildPayload()),
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

    /* ── "All Sections" inline renders — only show sections that exist in form state ── */
    const allSectionsList = APP_SECTIONS.filter(s => s.id !== 'all');

    /* ══════════════════════════════════════════════════════════════════════
       RENDER — Minimized FAB
       ══════════════════════════════════════════════════════════════════════ */
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
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Open feedback widget"
            >
                <MessageSquare size={22} />
            </button>
        );
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER — Expanded Widget
       ══════════════════════════════════════════════════════════════════════ */
    return (
        <div style={{
            position: 'fixed', bottom: 76, right: 20,
            width: section === 'all' && activeTab !== 'feature' ? 500 : 360,
            maxHeight: '82vh',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 16,
            boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fw-slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transition: 'width 0.3s ease',
        }}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{
                padding: '14px 18px',
                background: `linear-gradient(135deg, ${THEME.primary}18, transparent)`,
                borderBottom: `1px solid ${THEME.grid}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
            }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textMain }}>Help us improve Vigil</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Your feedback matters</div>
                </div>
                <button
                    onClick={handleClose}
                    aria-label="Close feedback"
                    style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 4 }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* ── Tab Bar ────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', borderBottom: `1px solid ${THEME.grid}`,
                flexShrink: 0, background: `${THEME.bg}60`,
            }}>
                {FEEDBACK_TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setError(''); }}
                            style={{
                                flex: 1, padding: '10px 6px',
                                background: active ? `${THEME.primary}12` : 'transparent',
                                border: 'none',
                                borderBottom: `2px solid ${active ? THEME.primary : 'transparent'}`,
                                color: active ? THEME.primary : THEME.textDim,
                                cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 500,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                transition: 'all 0.2s',
                            }}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Scrollable Body ────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

                {/* SUCCESS STATE */}
                {sent ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: THEME.success }}>
                        <ThumbsUp size={44} style={{ marginBottom: 12 }} />
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Thank you!</div>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                            Your feedback has been recorded.
                        </div>
                    </div>
                ) : activeTab === 'feature' ? (
                    /* ── FEATURE REQUEST TAB ─────────────────────────────── */
                    <FeatureRequestForm
                        data={featureData}
                        onChange={(field, val) => setFeatureData(prev => ({ ...prev, [field]: val }))}
                    />
                ) : (
                    /* ── BUG / GENERAL TAB ───────────────────────────────── */
                    <>
                        {/* Section Dropdown */}
                        <div style={{ marginBottom: 4 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 700, color: THEME.textMuted,
                                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
                            }}>
                                Section
                            </div>
                            <SectionDropdown value={section} onChange={setSection} />
                        </div>

                        {/* "All Sections" → inline forms for each section */}
                        {section === 'all' ? (
                            <div>
                                <div style={{
                                    fontSize: 11, color: THEME.textMuted, marginBottom: 12,
                                    padding: '8px 10px', background: `${THEME.primary}08`,
                                    border: `1px solid ${THEME.primary}20`, borderRadius: 6,
                                }}>
                                    Fill in feedback for each section below. You may leave sections blank to skip them.
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
                            /* Single section form */
                            <SectionForm
                                sectionLabel={APP_SECTIONS.find(s => s.id === section)?.label}
                                data={sectionForms[section] || emptySection()}
                                onChange={(field, val) => updateSectionField(section, field, val)}
                            />
                        )}
                    </>
                )}

                {/* Inline error */}
                {error && (
                    <div style={{
                        marginTop: 10, padding: '8px 12px', borderRadius: 8,
                        background: `${THEME.danger}15`,
                        border: `1px solid ${THEME.danger}40`,
                        color: THEME.danger, fontSize: 11,
                    }}>
                        ⚠ {error}
                    </div>
                )}
            </div>

            {/* ── Footer / Submit ─────────────────────────────────────────── */}
            {!sent && (
                <div style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${THEME.grid}`,
                    flexShrink: 0,
                    background: `${THEME.bg}60`,
                }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit()}
                        style={{
                            width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                            background: canSubmit()
                                ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`
                                : THEME.grid,
                            color: '#fff', fontWeight: 700, fontSize: 13,
                            cursor: canSubmit() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            opacity: canSubmit() ? 1 : 0.55,
                            transition: 'opacity 0.2s, background 0.2s',
                        }}
                    >
                        {submitting
                            ? 'Sending…'
                            : activeTab === 'feature'
                                ? <><PlusCircle size={14} /> Submit Feature Request</>
                                : <><Send size={14} /> Send Feedback</>
                        }
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;