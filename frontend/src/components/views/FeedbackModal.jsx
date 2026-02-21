/* ─────────────────────────────────────────────────────────────────────────
   FeedbackModal.jsx  ·  Drop-in replacement for the FeedbackModal in App.jsx
   ─────────────────────────────────────────────────────────────────────────
   USAGE (in App.jsx — no other changes needed):
     1. Delete the old FeedbackModal function from App.jsx
     2. Add this import at the top of App.jsx:
          import FeedbackModal from './components/FeedbackModal.jsx';
     3. The call-site is already correct:
          {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

   PAYLOAD sent to POST /api/feedback — matches every column in user_feedback:
     feedback_type    → 'feature' | 'bug' | 'general'
     rating           → 1-5 | null
     comment          → main text body
     remarks          → suggestions / extra notes
     section          → tab id (single-section mode) | null (all-sections mode)
     feature_title    → feature request title
     feature_priority → 'Low' | 'Medium' | 'High'
     section_feedback → JSONB array (all-sections mode only)
     user_metadata    → { page, userAgent, screenSize, timestamp, mode? }
   ───────────────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Send, CheckCircle, Star, Lightbulb, AlertTriangle,
    MessageSquare, ChevronDown, Layers, PlusCircle, Zap,
    ThumbsUp, ArrowLeft,
} from 'lucide-react';
import { postData } from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

/* ── Design tokens — mirrors DS in App.jsx ──────────────────────────────── */
const DS = {
    bg:           '#04060f',
    bgDeep:       '#020409',
    surface:      '#0a0f1e',
    surfaceElev:  '#0d1424',
    border:       'rgba(255,255,255,0.06)',
    borderFocus:  'rgba(56,189,248,0.45)',
    borderAccent: 'rgba(56,189,248,0.22)',
    cyan:         '#38bdf8',
    cyanDim:      'rgba(56,189,248,0.12)',
    cyanGlow:     'rgba(56,189,248,0.28)',
    violet:       '#818cf8',
    violetDim:    'rgba(129,140,248,0.12)',
    emerald:      '#34d399',
    amber:        '#fbbf24',
    rose:         '#fb7185',
    textPrimary:  '#f0f4ff',
    textSub:      '#94a3b8',
    textMuted:    '#475569',
    fontMono:     `'JetBrains Mono', 'Fira Code', monospace`,
    fontUI:       `'DM Sans', system-ui, sans-serif`,
    glowCyan:     '0 0 24px rgba(56,189,248,0.18)',
    shadowDeep:   '0 24px 64px rgba(0,0,0,0.75)',
};

/* ── All tab sections pulled from App.jsx TAB_CONFIG ────────────────────── */
const SECTION_GROUPS = [
    {
        group: 'Core Monitoring', accent: DS.cyan,
        tabs: [
            { id: 'overview',     label: 'Overview'         },
            { id: 'connections',  label: 'Connections'      },
            { id: 'performance',  label: 'Performance'      },
            { id: 'resources',    label: 'Resources'        },
            { id: 'reliability',  label: 'Reliability'      },
            { id: 'alerts',       label: 'Alerts'           },
        ],
    },
    {
        group: 'Query & Indexes', accent: DS.violet,
        tabs: [
            { id: 'optimizer',   label: 'Query Optimizer'   },
            { id: 'indexes',     label: 'Indexes'           },
            { id: 'regression',  label: 'Plan Regression'   },
            { id: 'bloat',       label: 'Bloat Analysis'    },
        ],
    },
    {
        group: 'Infrastructure', accent: DS.emerald,
        tabs: [
            { id: 'pool',        label: 'Connection Pool'   },
            { id: 'replication', label: 'Replication & WAL' },
            { id: 'checkpoint',  label: 'Checkpoint Monitor'},
            { id: 'maintenance', label: 'Vacuum & Maintenance'},
            { id: 'capacity',    label: 'Capacity Planning' },
            { id: 'backup',      label: 'Backup & Recovery' },
        ],
    },
    {
        group: 'Schema & Security', accent: DS.rose,
        tabs: [
            { id: 'schema',      label: 'Schema & Migrations'  },
            { id: 'security',    label: 'Security & Compliance' },
        ],
    },
    {
        group: 'Observability', accent: DS.amber,
        tabs: [
            { id: 'cloudwatch',        label: 'CloudWatch'          },
            { id: 'log-patterns',      label: 'Log Pattern Analysis' },
            { id: 'alert-correlation', label: 'Alert Correlation'    },
        ],
    },
    {
        group: 'Developer Tools', accent: DS.violet,
        tabs: [
            { id: 'sql',        label: 'SQL Console' },
            { id: 'api',        label: 'API Tracing' },
            { id: 'repository', label: 'Repository'  },
        ],
    },
    {
        group: 'Admin', accent: DS.rose,
        tabs: [
            { id: 'tasks',          label: 'DBA Task Scheduler' },
            { id: 'UserManagement', label: 'User Management'    },
            { id: 'admin',          label: 'Admin'              },
        ],
    },
];

const ALL_TABS = SECTION_GROUPS.flatMap(g => g.tabs);

/* ── Feedback mode tabs ─────────────────────────────────────────────────── */
const MODES = [
    { id: 'feature', label: 'Feature Request', icon: Lightbulb,     color: DS.cyan   },
    { id: 'bug',     label: 'Bug Report',       icon: AlertTriangle,  color: DS.rose   },
    { id: 'general', label: 'General',          icon: MessageSquare, color: DS.violet },
];

const PRIORITY_OPTIONS = [
    { val: 'Low',    color: DS.emerald },
    { val: 'Medium', color: DS.amber   },
    { val: 'High',   color: DS.rose    },
];

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

/* ── Helpers ────────────────────────────────────────────────────────────── */
const emptyRow = () => ({ rating: 0, comment: '', remarks: '' });

const AUTH_TOKEN_KEY = 'vigil_token';

/* ══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

/* Shared label */
const FieldLabel = ({ children, accent }) => (
    <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase',
        color: accent || DS.textMuted, marginBottom: 8, fontFamily: DS.fontMono,
        display: 'flex', alignItems: 'center', gap: 6,
    }}>
        {children}
    </div>
);

/* Shared input styles */
const inputStyle = (focused = false) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.025)',
    border: `1px solid ${focused ? DS.borderFocus : DS.border}`,
    borderRadius: 9, padding: '10px 13px',
    color: DS.textPrimary, fontSize: 13,
    outline: 'none', resize: 'none',
    fontFamily: DS.fontUI, lineHeight: 1.6,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? `0 0 0 3px ${DS.cyanDim}` : 'none',
});

/* Star rating row */
const StarRow = ({ value, onChange, size = 24 }) => {
    const [hov, setHov] = useState(0);
    const display = hov || value;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHov(s)}
                        onMouseLeave={() => setHov(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.12s' }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.9)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.15)'; setTimeout(() => { if (e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 150); }}
                >
                    <Star size={size}
                          fill={s <= display ? DS.amber : 'transparent'}
                          color={s <= display ? DS.amber : DS.textMuted}
                          strokeWidth={1.5}
                          style={{ transition: 'fill 0.12s, color 0.12s', display: 'block' }}
                    />
                </button>
            ))}
            {display > 0 && (
                <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.fontMono, marginLeft: 4, userSelect: 'none' }}>
                    {STAR_LABELS[display - 1]}
                </span>
            )}
        </div>
    );
};

/* Controlled textarea with focus state */
const FocusTextarea = ({ value, onChange, placeholder, rows = 3, maxLength = 500, showCount = true }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                style={inputStyle(focused)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {showCount && (
                <div style={{ fontSize: 10, color: DS.textMuted, textAlign: 'right', marginTop: 3, fontFamily: DS.fontMono }}>
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
};

/* Controlled input with focus state */
const FocusInput = ({ value, onChange, placeholder, maxLength }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            style={{ ...inputStyle(focused), resize: undefined }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
};

/* Section dropdown (for feature "Related Section") */
const SectionPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = ALL_TABS.find(t => t.id === value) || { label: 'All Sections (General)' };

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)} style={{
                ...inputStyle(open), display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', cursor: 'pointer', padding: '10px 13px',
                textAlign: 'left', resize: undefined,
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={DS.cyan} />
                    {selected.label}
                </span>
                <ChevronDown size={13} color={DS.textMuted}
                             style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                    background: DS.surface,
                    border: `1px solid ${DS.borderAccent}`,
                    borderRadius: 10, boxShadow: DS.shadowDeep,
                    zIndex: 30, maxHeight: 260, overflowY: 'auto',
                }}>
                    {/* "Any section" option */}
                    {[{ id: 'all', label: 'All Sections (General)', _group: true }].concat(ALL_TABS).map((opt, i) => (
                        <button
                            key={opt.id} type="button"
                            onClick={() => { onChange(opt.id === 'all' ? null : opt.id); setOpen(false); }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '9px 14px',
                                background: (value === opt.id || (!value && opt.id === 'all'))
                                    ? DS.cyanDim : 'transparent',
                                color: (value === opt.id || (!value && opt.id === 'all'))
                                    ? DS.cyan : DS.textSub,
                                border: 'none',
                                borderBottom: `1px solid ${DS.border}`,
                                cursor: 'pointer', fontSize: 12,
                                fontWeight: (value === opt.id || (!value && opt.id === 'all')) ? 600 : 400,
                                fontFamily: DS.fontUI,
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (e.currentTarget.style.background === 'transparent') e.currentTarget.style.background = 'rgba(56,189,248,0.05)'; }}
                            onMouseLeave={e => { if (!e.currentTarget.style.color.includes(DS.cyan)) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {opt.id === 'all' ? <strong>{opt.label}</strong> : opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   FORM PANELS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Feature Request form ───────────────────────────────────────────────── */
const FeatureForm = ({ data, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
            <FieldLabel accent={DS.cyan}>Related Section</FieldLabel>
            <SectionPicker value={data.section} onChange={v => onChange('section', v)} />
        </div>

        <div>
            <FieldLabel>Feature Title <span style={{ color: DS.rose }}>*</span></FieldLabel>
            <FocusInput
                value={data.title}
                onChange={v => onChange('title', v)}
                placeholder="Give your feature a short, descriptive name"
                maxLength={120}
            />
        </div>

        <div>
            <FieldLabel>Description / Use Case <span style={{ color: DS.rose }}>*</span></FieldLabel>
            <FocusTextarea
                value={data.description}
                onChange={v => onChange('description', v)}
                placeholder="Describe the feature and why it would be valuable…"
                rows={3}
            />
        </div>

        <div>
            <FieldLabel>Additional Remarks</FieldLabel>
            <FocusTextarea
                value={data.remarks}
                onChange={v => onChange('remarks', v)}
                placeholder="Implementation ideas, references, or any further context…"
                rows={2}
                showCount={false}
            />
        </div>

        {/* Suggest new tab */}
        <div style={{
            padding: '14px 16px',
            border: `1px dashed rgba(56,189,248,0.22)`,
            borderRadius: 10,
            background: 'rgba(56,189,248,0.03)',
        }}>
            <FieldLabel accent={DS.cyan}>
                <PlusCircle size={10} />
                Suggest a New Tab
                <span style={{ color: DS.textMuted, textTransform: 'none', fontWeight: 400, letterSpacing: 0, marginLeft: 2 }}>(optional)</span>
            </FieldLabel>
            <FocusInput
                value={data.suggestedTab}
                onChange={v => onChange('suggestedTab', v)}
                placeholder="e.g. Query History, Cost Estimator, Live Replication…"
                maxLength={80}
            />
        </div>

        {/* Priority */}
        <div>
            <FieldLabel>Priority</FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
                {PRIORITY_OPTIONS.map(({ val, color }) => {
                    const active = data.priority === val;
                    return (
                        <button key={val} type="button"
                                onClick={() => onChange('priority', val)}
                                style={{
                                    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                    border: `1px solid ${active ? color : DS.border}`,
                                    background: active ? `${color}15` : 'transparent',
                                    color: active ? color : DS.textMuted,
                                    cursor: 'pointer', fontFamily: DS.fontUI,
                                    transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.textMuted; } }}
                        >
                            {val}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

/* ── Single-section feedback card (used in Bug / General tab) ───────────── */
const SectionCard = ({ label, data, onChange, compact = false, accent = DS.cyan }) => (
    <div style={{
        border: `1px solid ${DS.border}`, borderRadius: 10,
        padding: compact ? '12px 14px' : '18px',
        background: 'rgba(255,255,255,0.015)',
        marginBottom: compact ? 8 : 0,
    }}>
        {compact && (
            <div style={{
                fontSize: 11, fontWeight: 600, color: accent,
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: DS.fontMono,
            }}>
                <Layers size={11} /> {label}
            </div>
        )}

        <div style={{ marginBottom: 14 }}>
            <FieldLabel>Rating</FieldLabel>
            <StarRow value={data.rating} onChange={v => onChange('rating', v)} size={compact ? 19 : 22} />
        </div>

        <div style={{ marginBottom: compact ? 8 : 12 }}>
            <FieldLabel>Feedback</FieldLabel>
            <FocusTextarea
                value={data.comment}
                onChange={v => onChange('comment', v)}
                placeholder="What do you love, or what could be better?"
                rows={compact ? 2 : 3}
            />
        </div>

        <div>
            <FieldLabel>Suggestions</FieldLabel>
            <FocusTextarea
                value={data.remarks}
                onChange={v => onChange('remarks', v)}
                placeholder="Any specific improvements you'd recommend?"
                rows={compact ? 2 : 2}
                showCount={false}
            />
        </div>
    </div>
);

/* ── Bug / General form — section picker + single or all-section forms ──── */
const BugGeneralForm = ({ section, onSectionChange, forms, onFieldChange }) => {
    const currentData = forms[section] || emptyRow();
    const showAll = section === 'all';
    const sectionAccent = id => {
        const g = SECTION_GROUPS.find(g => g.tabs.some(t => t.id === id));
        return g?.accent || DS.cyan;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Section picker */}
            <div>
                <FieldLabel>Section</FieldLabel>
                <div style={{ position: 'relative' }}>
                    <SectionPickerFull value={section} onChange={onSectionChange} />
                </div>
            </div>

            {showAll ? (
                <>
                    <div style={{
                        fontSize: 12, color: DS.textSub, padding: '8px 12px',
                        background: DS.cyanDim, border: `1px solid ${DS.borderAccent}`,
                        borderRadius: 8, lineHeight: 1.5,
                    }}>
                        Leave sections blank to skip them — only filled sections will be submitted.
                    </div>
                    {SECTION_GROUPS.map(g => (
                        <div key={g.group}>
                            <div style={{
                                fontSize: 10, fontWeight: 700, color: g.accent,
                                fontFamily: DS.fontMono, letterSpacing: '0.1em',
                                textTransform: 'uppercase', marginBottom: 6, marginTop: 4,
                                paddingLeft: 2,
                            }}>
                                {g.group}
                            </div>
                            {g.tabs.map(tab => (
                                <SectionCard
                                    key={tab.id}
                                    label={tab.label}
                                    data={forms[tab.id] || emptyRow()}
                                    onChange={(field, val) => onFieldChange(tab.id, field, val)}
                                    compact
                                    accent={g.accent}
                                />
                            ))}
                        </div>
                    ))}
                </>
            ) : (
                <SectionCard
                    label={ALL_TABS.find(t => t.id === section)?.label || section}
                    data={currentData}
                    onChange={(field, val) => onFieldChange(section, field, val)}
                    accent={sectionAccent(section)}
                />
            )}
        </div>
    );
};

/* Full section picker (includes "All Sections" option) */
const SectionPickerFull = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const label = value === 'all'
        ? 'All Sections'
        : ALL_TABS.find(t => t.id === value)?.label || value;

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)} style={{
                ...inputStyle(open), display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', cursor: 'pointer', padding: '10px 13px',
                width: '100%', boxSizing: 'border-box',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={DS.cyan} /> {label}
                </span>
                <ChevronDown size={13} color={DS.textMuted}
                             style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                    background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                    borderRadius: 10, boxShadow: DS.shadowDeep, zIndex: 30,
                    maxHeight: 280, overflowY: 'auto',
                }}>
                    {/* All sections */}
                    <button type="button" onClick={() => { onChange('all'); setOpen(false); }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '9px 14px',
                                background: value === 'all' ? DS.cyanDim : 'transparent',
                                color: value === 'all' ? DS.cyan : DS.textSub,
                                border: 'none', borderBottom: `1px solid ${DS.border}`,
                                cursor: 'pointer', fontSize: 12, fontWeight: value === 'all' ? 700 : 400,
                                fontFamily: DS.fontUI,
                            }}>
                        <strong>All Sections</strong>
                    </button>
                    {SECTION_GROUPS.map(g => (
                        <React.Fragment key={g.group}>
                            <div style={{
                                padding: '6px 14px 4px',
                                fontSize: 9, fontWeight: 700, color: g.accent,
                                fontFamily: DS.fontMono, letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                background: `${g.accent}08`,
                                borderBottom: `1px solid ${DS.border}`,
                            }}>
                                {g.group}
                            </div>
                            {g.tabs.map(tab => (
                                <button key={tab.id} type="button"
                                        onClick={() => { onChange(tab.id); setOpen(false); }}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '8px 14px 8px 22px',
                                            background: value === tab.id ? DS.cyanDim : 'transparent',
                                            color: value === tab.id ? DS.cyan : DS.textSub,
                                            border: 'none', borderBottom: `1px solid ${DS.border}`,
                                            cursor: 'pointer', fontSize: 12,
                                            fontWeight: value === tab.id ? 600 : 400,
                                            fontFamily: DS.fontUI, transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => { if (value !== tab.id) e.currentTarget.style.background = 'rgba(56,189,248,0.05)'; }}
                                        onMouseLeave={e => { if (value !== tab.id) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN FEEDBACK MODAL
   ══════════════════════════════════════════════════════════════════════════ */
const FeedbackModal = ({ onClose }) => {
    const { currentUser } = useAuth();

    /* Mode tab state */
    const [mode, setMode]       = useState('feature'); // 'feature' | 'bug' | 'general'

    /* Feature request state */
    const [feature, setFeature] = useState({
        section: null, title: '', description: '',
        remarks: '', priority: 'Medium', suggestedTab: '',
    });

    /* Bug / General per-section state */
    const [section, setSection]     = useState('all');
    const [forms, setForms]         = useState({});       // { [tabId]: emptyRow() }

    /* Submission state */
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent]             = useState(false);
    const [error, setError]           = useState('');

    /* Ensure a form row exists for newly selected section */
    useEffect(() => {
        if (section !== 'all' && !forms[section]) {
            setForms(p => ({ ...p, [section]: emptyRow() }));
        }
    }, [section]);

    /* Rate-limit guard */
    useEffect(() => {
        const last = parseInt(localStorage.getItem('vigil_last_feedback') || '0', 10);
        if (Date.now() - last < 5 * 60 * 1000)
            setError('Please wait a few minutes before submitting again.');
    }, []);

    /* Field updaters */
    const updateFeature  = (k, v) => setFeature(p => ({ ...p, [k]: v }));
    const updateFormField = (tabId, field, val) =>
        setForms(p => ({ ...p, [tabId]: { ...(p[tabId] || emptyRow()), [field]: val } }));

    /* Can submit? */
    const canSubmit = useCallback(() => {
        if (sent || submitting || error.startsWith('Please wait')) return false;
        if (mode === 'feature') return feature.title.trim().length > 0 && feature.description.trim().length > 0;
        if (section === 'all')
            return ALL_TABS.some(t => (forms[t.id]?.comment || '').trim().length > 0);
        return (forms[section]?.comment || '').trim().length > 0;
    }, [sent, submitting, error, mode, feature, section, forms]);

    /* Build payload — maps directly to user_feedback columns */
    const buildPayload = useCallback(() => {
        const meta = {
            page:       window.location.pathname,
            userAgent:  navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            timestamp:  new Date().toISOString(),
        };

        if (mode === 'feature') {
            return {
                feedback_type:    'feature',
                rating:           null,
                comment:          feature.description.trim(),
                remarks:          feature.remarks.trim() || null,
                section:          feature.section || null,
                feature_title:    feature.title.trim(),
                feature_priority: feature.priority,
                section_feedback: null,
                user_metadata:    { ...meta, suggested_tab: feature.suggestedTab.trim() || null },
            };
        }

        if (section === 'all') {
            /* Build section_feedback JSONB array for every non-empty section */
            const sectionFeedback = ALL_TABS
                .map(tab => {
                    const row = forms[tab.id] || emptyRow();
                    return {
                        section_id:    tab.id,
                        section_label: tab.label,
                        rating:        row.rating || null,
                        comment:       row.comment.trim(),
                        remarks:       row.remarks.trim() || null,
                    };
                })
                .filter(r => r.comment || r.rating);   // skip blanks

            const combined = sectionFeedback
                .map(r => `[${r.section_label}] ${r.comment}`)
                .filter(Boolean)
                .join('\n');

            return {
                feedback_type:    mode,
                rating:           null,
                comment:          combined,
                remarks:          null,
                section:          null,
                feature_title:    null,
                feature_priority: null,
                section_feedback: sectionFeedback,
                user_metadata:    { ...meta, mode: 'all-sections' },
            };
        }

        /* Single section */
        const row = forms[section] || emptyRow();
        return {
            feedback_type:    mode,
            rating:           row.rating || null,
            comment:          row.comment.trim(),
            remarks:          row.remarks.trim() || null,
            section:          section,
            feature_title:    null,
            feature_priority: null,
            section_feedback: null,
            user_metadata:    meta,
        };
    }, [mode, feature, section, forms]);

    /* Submit */
    const handleSubmit = async () => {
        if (!canSubmit()) return;
        setSubmitting(true); setError('');
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('Session expired — please log in again.');

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(buildPayload()),
            });
            if (res.status === 401) throw new Error('Session expired — please log in again.');
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Server error (${res.status})`);
            }

            localStorage.setItem('vigil_last_feedback', Date.now().toString());
            setSent(true);
            setTimeout(onClose, 2800);
        } catch (e) {
            console.error('[FeedbackModal] submit error:', e);
            setError(e.message || 'Failed to send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const activeMode = MODES.find(m => m.id === mode);

    /* ── Keyboard: Esc to close ────────────────────────────────────────── */
    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    /* ══════════════════════════════════════════════════════════════════════
       SUCCESS STATE
       ══════════════════════════════════════════════════════════════════════ */
    if (sent) return (
        <div className="feedback-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="feedback-modal" style={{
                background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20, padding: '52px 40px', textAlign: 'center',
                boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`, maxWidth: 360, width: '90%',
            }}>
                <div style={{
                    width: 68, height: 68, margin: '0 auto 22px',
                    borderRadius: '50%', background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 32px rgba(52,211,153,0.15)',
                    animation: 'glowPulse 2s ease infinite',
                }}>
                    <ThumbsUp size={30} color={DS.emerald} strokeWidth={1.5} />
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: DS.textPrimary, letterSpacing: '-0.02em' }}>
                    Thank you!
                </h3>
                <p style={{ color: DS.textSub, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                    Your feedback helps us make Vigil better for everyone. We really appreciate it.
                </p>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════════════════════════════════
       MAIN MODAL
       ══════════════════════════════════════════════════════════════════════ */
    return (
        <div
            className="feedback-overlay"
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{ alignItems: 'center', justifyContent: 'center' }}
        >
            <div className="feedback-modal" style={{
                background: DS.surface,
                border: `1px solid ${DS.borderAccent}`,
                borderRadius: 20,
                width: mode !== 'feature' && section === 'all' ? 560 : 480,
                maxWidth: '94vw',
                maxHeight: '90vh',
                boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                transition: 'width 0.3s ease',
                position: 'relative',
            }}>
                {/* ── Rainbow top bar ─────────────────────────────────────── */}
                <div style={{
                    height: 3, flexShrink: 0,
                    background: `linear-gradient(90deg, ${DS.cyan}, ${DS.violet}, ${DS.emerald})`,
                    backgroundSize: '200% 100%',
                    animation: 'waveFlow 3s ease infinite',
                }} />

                {/* ── Header ──────────────────────────────────────────────── */}
                <div style={{
                    padding: '20px 24px 18px',
                    borderBottom: `1px solid ${DS.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexShrink: 0,
                }}>
                    <div>
                        <h3 style={{
                            margin: 0, fontSize: 17, fontWeight: 700,
                            color: DS.textPrimary, letterSpacing: '-0.02em',
                        }}>
                            Send Feedback
                        </h3>
                        <div style={{
                            fontSize: 10, color: DS.textMuted, marginTop: 4,
                            fontFamily: DS.fontMono, letterSpacing: '0.1em',
                        }}>
                            VIGIL · DATABASE MONITOR
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close feedback"
                        style={{
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${DS.border}`,
                            color: DS.textSub, cursor: 'pointer', width: 32, height: 32,
                            borderRadius: 8, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', transition: 'all 0.15s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)'; e.currentTarget.style.color = DS.rose; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = DS.textSub; e.currentTarget.style.borderColor = DS.border; }}
                    >
                        <X size={15} strokeWidth={2} />
                    </button>
                </div>

                {/* ── Mode tabs ───────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', gap: 6, padding: '14px 24px 12px',
                    borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
                    background: 'rgba(255,255,255,0.01)',
                }}>
                    {MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                            <button key={m.id} type="button"
                                    onClick={() => { setMode(m.id); setError(''); }}
                                    style={{
                                        flex: 1, padding: '9px 8px', borderRadius: 9,
                                        border: `1px solid ${active ? `${m.color}50` : DS.border}`,
                                        background: active ? `${m.color}12` : 'transparent',
                                        color: active ? m.color : DS.textMuted,
                                        cursor: 'pointer', fontSize: 11, fontWeight: active ? 600 : 400,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', gap: 5,
                                        transition: 'all 0.18s', fontFamily: DS.fontUI,
                                        opacity: active ? 1 : 0.7,
                                    }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = `${m.color}30`; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.borderColor = DS.border; } }}
                            >
                                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                                {m.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Scrollable body ─────────────────────────────────────── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {mode === 'feature' ? (
                        <FeatureForm data={feature} onChange={updateFeature} />
                    ) : (
                        <BugGeneralForm
                            section={section}
                            onSectionChange={s => { setSection(s); setError(''); }}
                            forms={forms}
                            onFieldChange={updateFormField}
                        />
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: 16, padding: '10px 14px', borderRadius: 9,
                            background: 'rgba(251,113,133,0.08)',
                            border: '1px solid rgba(251,113,133,0.25)',
                            color: DS.rose, fontSize: 12, lineHeight: 1.5,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                            {error}
                        </div>
                    )}
                </div>

                {/* ── Footer / Submit ──────────────────────────────────────── */}
                <div style={{
                    padding: '14px 24px 20px',
                    borderTop: `1px solid ${DS.border}`,
                    flexShrink: 0,
                }}>
                    {/* Helper text */}
                    <div style={{
                        fontSize: 10, color: DS.textMuted, marginBottom: 10,
                        fontFamily: DS.fontMono, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <span style={{ color: DS.rose }}>*</span> Required fields
                        {mode === 'feature' && (
                            <span style={{ marginLeft: 8 }}>· title &amp; description</span>
                        )}
                        {mode !== 'feature' && (
                            <span style={{ marginLeft: 8 }}>· at least one section comment</span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit()}
                        style={{
                            width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
                            background: canSubmit()
                                ? `linear-gradient(135deg, ${DS.cyan}, ${DS.violet})`
                                : 'rgba(255,255,255,0.05)',
                            color: canSubmit() ? '#fff' : DS.textMuted,
                            fontSize: 13, fontWeight: 700,
                            cursor: canSubmit() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            letterSpacing: '0.03em', fontFamily: DS.fontUI,
                            transition: 'opacity 0.2s, filter 0.2s, transform 0.15s',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: canSubmit() ? '0 4px 20px rgba(56,189,248,0.25)' : 'none',
                        }}
                        onMouseEnter={e => { if (canSubmit()) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {submitting ? (
                            <><Zap size={14} /> Sending…</>
                        ) : mode === 'feature' ? (
                            <><PlusCircle size={14} /> Submit Feature Request</>
                        ) : (
                            <><Send size={14} /> Send Feedback</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;