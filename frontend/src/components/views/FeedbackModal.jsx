/* ─────────────────────────────────────────────────────────────────────────
   FeedbackModal.jsx  ·  Full feedback modal for Vigil Database Monitor
   ─────────────────────────────────────────────────────────────────────────

   USAGE in App.jsx — two options:

   Option A — inline (already in App.jsx, no import needed):
     The modal is defined directly inside App.jsx. Just ensure it receives
     the activeTab prop so it pre-selects the current screen:
       {showFeedback && (
         <FeedbackModal
           onClose={() => setShowFeedback(false)}
           initialSection={activeTab}
         />
       )}

   Option B — standalone file (this file):
     1. Delete FeedbackModal from App.jsx
     2. import FeedbackModal from './components/FeedbackModal.jsx';
     3. Same call-site as above.

   PAYLOAD → POST /api/feedback  (maps to every user_feedback column)
   ─────────────────────────────────────────────────────────────────────────
   feedback_type     'feature' | 'bug' | 'general'
   rating            1-5 | null
   comment           string  (NOT NULL — always at least '')
   remarks           string | null
   section           tab id | null
   feature_title     string | null
   feature_priority  'Low' | 'Medium' | 'High' | null
   suggested_tab     string | null  ← dedicated column, NOT buried in JSONB
   section_feedback  JSONB array | null  (all-sections mode)
   user_metadata     { page, userAgent, screenSize, timestamp, mode? }

   username + user_id are resolved server-side from the Bearer token.
   ───────────────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Send, Star, Lightbulb, AlertTriangle,
    MessageSquare, ChevronDown, Layers, PlusCircle, Zap,
    ThumbsUp,
} from 'lucide-react';
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

/* ── Keyframe styles injected once ─────────────────────────────────────── */
const MODAL_STYLES = `
    @keyframes fb-fadeIn    { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fb-slideUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fb-waveFlow  { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes fb-glowPulse { 0%,100% { box-shadow: 0 0 8px rgba(52,211,153,0.2); } 50% { box-shadow: 0 0 28px rgba(52,211,153,0.55); } }
    @keyframes fb-starPop   { 0% { transform: scale(1); } 40% { transform: scale(0.85); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }

    .fb-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.78);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
        animation: fb-fadeIn 0.2s ease-out;
    }
    .fb-modal  { animation: fb-slideUp 0.3s cubic-bezier(0.34,1.4,0.64,1) both; }
    .fb-input  {
        width: 100%; box-sizing: border-box;
        background: rgba(255,255,255,0.03);
        border-radius: 9px; padding: 10px 13px;
        color: #f0f4ff; font-size: 13px; outline: none;
        font-family: 'DM Sans', system-ui, sans-serif;
        line-height: 1.6; resize: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .fb-input:focus {
        border-color: rgba(56,189,248,0.5) !important;
        box-shadow: 0 0 0 3px rgba(56,189,248,0.1) !important;
    }
    .fb-input::placeholder { color: #475569; }
    .fb-star:hover  { animation: fb-starPop 0.2s ease; }
    .fb-opt:hover   { background: rgba(56,189,248,0.06) !important; }
    .fb-submit:not(:disabled):hover  { filter: brightness(1.12); transform: translateY(-1px); }
    .fb-submit:not(:disabled):active { transform: translateY(0); }
    .fb-scroll::-webkit-scrollbar       { width: 4px; }
    .fb-scroll::-webkit-scrollbar-track { background: transparent; }
    .fb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
`;

/* ── Section / tab data — mirrors TAB_CONFIG in App.jsx ─────────────────── */
const SECTION_GROUPS = [
    {
        group: 'Core Monitoring', accent: DS.cyan,
        tabs: [
            { id: 'overview',     label: 'Overview'          },
            { id: 'connections',  label: 'Connections'       },
            { id: 'performance',  label: 'Performance'       },
            { id: 'resources',    label: 'Resources'         },
            { id: 'reliability',  label: 'Reliability'       },
            { id: 'alerts',       label: 'Alerts'            },
        ],
    },
    {
        group: 'Query & Indexes', accent: DS.violet,
        tabs: [
            { id: 'optimizer',   label: 'Query Optimizer'    },
            { id: 'indexes',     label: 'Indexes'            },
            { id: 'regression',  label: 'Plan Regression'    },
            { id: 'bloat',       label: 'Bloat Analysis'     },
        ],
    },
    {
        group: 'Infrastructure', accent: DS.emerald,
        tabs: [
            { id: 'pool',        label: 'Connection Pool'    },
            { id: 'replication', label: 'Replication & WAL'  },
            { id: 'checkpoint',  label: 'Checkpoint Monitor' },
            { id: 'maintenance', label: 'Vacuum & Maintenance'},
            { id: 'capacity',    label: 'Capacity Planning'  },
            { id: 'backup',      label: 'Backup & Recovery'  },
        ],
    },
    {
        group: 'Schema & Security', accent: DS.rose,
        tabs: [
            { id: 'schema',   label: 'Schema & Migrations'   },
            { id: 'security', label: 'Security & Compliance' },
        ],
    },
    {
        group: 'Observability', accent: DS.amber,
        tabs: [
            { id: 'cloudwatch',        label: 'CloudWatch'           },
            { id: 'log-patterns',      label: 'Log Pattern Analysis'  },
            { id: 'alert-correlation', label: 'Alert Correlation'     },
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

/* ── Constants ──────────────────────────────────────────────────────────── */
const MODES = [
    { id: 'feature', label: 'Feature Request', icon: Lightbulb,     color: DS.cyan   },
    { id: 'bug',     label: 'Bug Report',       icon: AlertTriangle, color: DS.rose   },
    { id: 'general', label: 'General',          icon: MessageSquare, color: DS.violet },
];

const PRIORITY_OPTIONS = [
    { val: 'Low',    color: DS.emerald },
    { val: 'Medium', color: DS.amber   },
    { val: 'High',   color: DS.rose    },
];

const STAR_LABELS        = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
const AUTH_TOKEN_KEY     = 'vigil_token';
const RATE_LIMIT_MS      = 5 * 60 * 1000;  // 5 minutes
const emptyRow           = () => ({ rating: 0, comment: '', remarks: '' });

/* ── Shared style helper ────────────────────────────────────────────────── */
const inputBorderStyle = (focused) => ({
    border: `1px solid ${focused ? DS.borderFocus : DS.border}`,
});

/* ══════════════════════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

const FieldLabel = ({ children, accent }) => (
    <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: accent || DS.textMuted,
        marginBottom: 8, fontFamily: DS.fontMono,
        display: 'flex', alignItems: 'center', gap: 5,
    }}>
        {children}
    </div>
);

const FocusInput = ({ value, onChange, placeholder, maxLength }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="fb-input"
            style={inputBorderStyle(focused)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
};

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
                className="fb-input"
                style={inputBorderStyle(focused)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {showCount && (
                <div style={{
                    fontSize: 10, color: DS.textMuted, textAlign: 'right',
                    marginTop: 3, fontFamily: DS.fontMono,
                }}>
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
};

/* Star rating — click toggles off if same star clicked again */
const StarRow = ({ value, onChange, size = 22 }) => {
    const [hov, setHov] = useState(0);
    const display = hov || value;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s} type="button" className="fb-star"
                    onClick={() => onChange(value === s ? 0 : s)}   // click same star = clear
                    onMouseEnter={() => setHov(s)}
                    onMouseLeave={() => setHov(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                    <Star
                        size={size}
                        fill={s <= display ? DS.amber : 'transparent'}
                        color={s <= display ? DS.amber : DS.textMuted}
                        strokeWidth={1.5}
                        style={{ display: 'block', transition: 'fill 0.12s' }}
                    />
                </button>
            ))}
            {display > 0 && (
                <span style={{
                    fontSize: 10, color: DS.textMuted,
                    fontFamily: DS.fontMono, marginLeft: 4, userSelect: 'none',
                }}>
                    {STAR_LABELS[display - 1]}
                </span>
            )}
        </div>
    );
};

/* ── Section dropdown — feature form (no "All Sections" option) ─────────── */
const SectionPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = ALL_TABS.find(t => t.id === value);

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="fb-input"
                style={{
                    ...inputBorderStyle(open),
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={DS.cyan} />
                    {selected?.label || 'General (no specific section)'}
                </span>
                <ChevronDown
                    size={13} color={DS.textMuted}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}
                />
            </button>
            {open && (
                <DropdownList
                    groups={SECTION_GROUPS}
                    value={value}
                    onSelect={id => { onChange(id); setOpen(false); }}
                    includeAll={false}
                />
            )}
        </div>
    );
};

/* ── Section dropdown — bug/general form (includes "All Sections") ───────── */
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
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="fb-input"
                style={{
                    ...inputBorderStyle(open),
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer',
                    width: '100%', boxSizing: 'border-box',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={13} color={DS.cyan} /> {label}
                </span>
                <ChevronDown
                    size={13} color={DS.textMuted}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                />
            </button>
            {open && (
                <DropdownList
                    groups={SECTION_GROUPS}
                    value={value}
                    onSelect={id => { onChange(id); setOpen(false); }}
                    includeAll
                />
            )}
        </div>
    );
};

/* ── Shared dropdown list — used by both pickers ────────────────────────── */
const DropdownList = ({ groups, value, onSelect, includeAll }) => (
    <div style={{
        position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
        background: DS.surface, border: `1px solid ${DS.borderAccent}`,
        borderRadius: 10, boxShadow: DS.shadowDeep, zIndex: 9999,
        maxHeight: 270, overflowY: 'auto',
    }}>
        {includeAll && (
            <button
                type="button" className="fb-opt"
                onClick={() => onSelect('all')}
                style={{
                    width: '100%', textAlign: 'left', padding: '9px 14px',
                    background: value === 'all' ? DS.cyanDim : 'transparent',
                    color: value === 'all' ? DS.cyan : DS.textSub,
                    border: 'none', borderBottom: `1px solid ${DS.border}`,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: DS.fontUI, transition: 'background 0.15s',
                }}
            >
                All Sections
            </button>
        )}
        {groups.map(g => (
            <React.Fragment key={g.group}>
                <div style={{
                    padding: '5px 14px 4px',
                    fontSize: 9, fontWeight: 700, color: g.accent,
                    fontFamily: DS.fontMono, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: `${g.accent}09`,
                    borderBottom: `1px solid ${DS.border}`,
                }}>
                    {g.group}
                </div>
                {g.tabs.map(tab => (
                    <button
                        key={tab.id} type="button" className="fb-opt"
                        onClick={() => onSelect(tab.id)}
                        style={{
                            width: '100%', textAlign: 'left',
                            padding: '8px 14px 8px 22px',
                            background: value === tab.id ? DS.cyanDim : 'transparent',
                            color: value === tab.id ? DS.cyan : DS.textSub,
                            border: 'none', borderBottom: `1px solid ${DS.border}`,
                            cursor: 'pointer', fontSize: 12,
                            fontWeight: value === tab.id ? 600 : 400,
                            fontFamily: DS.fontUI, transition: 'background 0.15s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </React.Fragment>
        ))}
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   FORM PANELS
   ══════════════════════════════════════════════════════════════════════════ */

const FeatureForm = ({ data, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
            <FieldLabel accent={DS.cyan}>Related Section</FieldLabel>
            <SectionPicker value={data.section} onChange={v => onChange('section', v)} />
        </div>

        <div>
            <FieldLabel>
                Feature Title&nbsp;
                <span style={{ color: DS.rose }}>*</span>
            </FieldLabel>
            <FocusInput
                value={data.title}
                onChange={v => onChange('title', v)}
                placeholder="Give your feature a short, descriptive name"
                maxLength={120}
            />
        </div>

        <div>
            <FieldLabel>
                Description / Use Case&nbsp;
                <span style={{ color: DS.rose }}>*</span>
            </FieldLabel>
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

        {/* Suggest a new tab — maps to dedicated suggested_tab column */}
        <div style={{
            padding: '13px 15px',
            border: `1px dashed ${DS.borderAccent}`,
            borderRadius: 10,
            background: DS.cyanDim,
        }}>
            <FieldLabel accent={DS.cyan}>
                <PlusCircle size={10} />
                Suggest a New Tab
                <span style={{
                    color: DS.textMuted, textTransform: 'none',
                    fontWeight: 400, letterSpacing: 0, marginLeft: 2,
                }}>
                    (optional)
                </span>
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
                        <button
                            key={val} type="button"
                            onClick={() => onChange('priority', val)}
                            style={{
                                flex: 1, padding: '9px 0', borderRadius: 8,
                                fontSize: 12, fontWeight: 600,
                                border: `1px solid ${active ? color : DS.border}`,
                                background: active ? `${color}15` : 'transparent',
                                color: active ? color : DS.textMuted,
                                cursor: 'pointer', fontFamily: DS.fontUI,
                                transition: 'all 0.18s',
                                opacity: active ? 1 : 0.72,
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.borderColor = `${color}55`;
                                    e.currentTarget.style.color = color;
                                    e.currentTarget.style.opacity = '1';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.borderColor = DS.border;
                                    e.currentTarget.style.color = DS.textMuted;
                                    e.currentTarget.style.opacity = '0.72';
                                }
                            }}
                        >
                            {val}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

/* Single section feedback card */
const SectionCard = ({ label, data, onChange, compact = false, accent = DS.cyan }) => (
    <div style={{
        border: `1px solid ${DS.border}`, borderRadius: 10,
        padding: compact ? '12px 14px' : '18px',
        background: 'rgba(255,255,255,0.015)',
        marginBottom: compact ? 8 : 0,
    }}>
        {compact && (
            <div style={{
                fontSize: 10, fontWeight: 700, color: accent,
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: DS.fontMono, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
                <Layers size={10} /> {label}
            </div>
        )}

        <div style={{ marginBottom: 12 }}>
            <FieldLabel>Rating</FieldLabel>
            <StarRow value={data.rating} onChange={v => onChange('rating', v)} size={compact ? 18 : 22} />
        </div>

        <div style={{ marginBottom: 10 }}>
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
                rows={2}
                showCount={false}
            />
        </div>
    </div>
);

/* Bug / General form */
const BugGeneralForm = ({ section, onSectionChange, forms, onFieldChange }) => {
    const showAll     = section === 'all';
    const accentFor   = id => SECTION_GROUPS.find(g => g.tabs.some(t => t.id === id))?.accent || DS.cyan;
    const currentData = forms[section] || emptyRow();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <FieldLabel>Screen / Section</FieldLabel>
                <SectionPickerFull value={section} onChange={onSectionChange} />
            </div>

            {showAll ? (
                <>
                    <div style={{
                        fontSize: 12, color: DS.textSub, padding: '9px 13px',
                        background: DS.cyanDim, border: `1px solid ${DS.borderAccent}`,
                        borderRadius: 8, lineHeight: 1.55,
                    }}>
                        Rate any screens you've used. Leave sections blank to skip — only filled ones will be submitted.
                    </div>
                    {SECTION_GROUPS.map(g => (
                        <div key={g.group}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, color: g.accent,
                                fontFamily: DS.fontMono, letterSpacing: '0.1em',
                                textTransform: 'uppercase', marginBottom: 6, marginTop: 4, paddingLeft: 2,
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
                    accent={accentFor(section)}
                />
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN MODAL
   ══════════════════════════════════════════════════════════════════════════ */
const FeedbackModal = ({ onClose, initialSection }) => {
    const { currentUser } = useAuth();

    const [mode, setMode] = useState('feature');

    const [feature, setFeature] = useState({
        section:      initialSection && initialSection !== 'all' ? initialSection : null,
        title:        '',
        description:  '',
        remarks:      '',
        priority:     'Medium',
        suggestedTab: '',
    });

    /* Bug / General: default to initialSection if it's a real tab, else 'all' */
    const [section, setSection] = useState(
        initialSection && initialSection !== 'all' && ALL_TABS.some(t => t.id === initialSection)
            ? initialSection
            : 'all'
    );
    const [forms, setForms] = useState({});

    const [submitting, setSubmitting] = useState(false);
    const [sent,       setSent]       = useState(false);
    const [error,      setError]      = useState('');

    /* Rate-limit: non-blocking amber notice, does NOT prevent submission */
    const [rateLimited, setRateLimited] = useState(false);
    useEffect(() => {
        try {
            const last = parseInt(localStorage.getItem('vigil_last_feedback') || '0', 10);
            if (last > 0 && Date.now() - last < RATE_LIMIT_MS) setRateLimited(true);
        } catch {}
    }, []);

    /* Ensure form row exists for selected section */
    useEffect(() => {
        if (section !== 'all' && !forms[section]) {
            setForms(p => ({ ...p, [section]: emptyRow() }));
        }
    }, [section]);

    /* Esc → close */
    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const updateFeature   = useCallback((k, v) => setFeature(p => ({ ...p, [k]: v })), []);
    const updateFormField = useCallback((tabId, field, val) =>
            setForms(p => ({ ...p, [tabId]: { ...(p[tabId] || emptyRow()), [field]: val } })),
        []);

    /* canSubmit — does NOT depend on error state; error never blocks button */
    const canSubmit = useCallback(() => {
        if (sent || submitting) return false;
        if (mode === 'feature')
            return feature.title.trim().length > 0 && feature.description.trim().length > 0;
        if (section === 'all')
            return ALL_TABS.some(t => (forms[t.id]?.comment || '').trim().length > 0);
        return (forms[section]?.comment || '').trim().length > 0;
    }, [sent, submitting, mode, feature, section, forms]);

    /* Build payload — every key maps to a user_feedback column */
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
                comment:          feature.description.trim() || '',   // NOT NULL
                remarks:          feature.remarks.trim()     || null,
                section:          feature.section            || null,
                feature_title:    feature.title.trim(),
                feature_priority: feature.priority,
                suggested_tab:    feature.suggestedTab.trim() || null, // dedicated column
                section_feedback: null,
                user_metadata:    { ...meta },
            };
        }

        if (section === 'all') {
            const sectionFeedback = ALL_TABS
                .map(tab => {
                    const row = forms[tab.id] || emptyRow();
                    return {
                        section_id:    tab.id,
                        section_label: tab.label,
                        rating:        row.rating  || null,
                        comment:       row.comment.trim(),
                        remarks:       row.remarks.trim() || null,
                    };
                })
                .filter(r => r.comment || r.rating);

            return {
                feedback_type:    mode,
                rating:           null,
                comment:          sectionFeedback
                    .map(r => `[${r.section_label}] ${r.comment}`)
                    .filter(Boolean)
                    .join('\n') || '', // NOT NULL
                remarks:          null,
                section:          null,
                feature_title:    null,
                feature_priority: null,
                suggested_tab:    null,
                section_feedback: sectionFeedback,
                user_metadata:    { ...meta, mode: 'all-sections' },
            };
        }

        const row = forms[section] || emptyRow();
        return {
            feedback_type:    mode,
            rating:           row.rating  || null,
            comment:          row.comment.trim() || '', // NOT NULL
            remarks:          row.remarks.trim() || null,
            section:          section,
            feature_title:    null,
            feature_priority: null,
            suggested_tab:    null,
            section_feedback: null,
            user_metadata:    meta,
        };
    }, [mode, feature, section, forms]);

    /* Submit — single clean fetch with granular HTTP error messages */
    const handleSubmit = useCallback(async () => {
        if (!canSubmit()) return;
        setSubmitting(true);
        setError('');

        const payload = buildPayload();
        console.debug('[FeedbackModal] payload →', payload);

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) throw new Error('Not authenticated — please refresh and log in again.');

            // 🛠️ FIX APPLIED: Force routing directly to backend OR use environment variable
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

            const res = await fetch(`${baseUrl}/api/feedback`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            let resBody = {};
            try { resBody = await res.json(); } catch {}
            const msg = resBody?.error || resBody?.message || resBody?.detail || '';

            if (!res.ok) {
                if      (res.status === 400) throw new Error(`Validation error: ${msg || 'check required fields.'}`);
                else if (res.status === 401) throw new Error('Session expired — please refresh and log in again.');
                else if (res.status === 403) throw new Error('Permission denied (403).');
                else if (res.status === 404) throw new Error('Feedback endpoint not found (404) — check server routing.');
                else if (res.status === 405) throw new Error('Method not allowed (405) — server must accept POST /api/feedback.');
                else if (res.status === 422) throw new Error(`Invalid payload (422): ${msg || 'check field types.'}`);
                else if (res.status >= 500)  throw new Error(`Server error (${res.status})${msg ? ': ' + msg : ' — check server logs.'}`);
                else                         throw new Error(`Request failed (${res.status})${msg ? ': ' + msg : '.'}`);
            }

            try { localStorage.setItem('vigil_last_feedback', Date.now().toString()); } catch {}
            setSent(true);
            setTimeout(onClose, 2800);

        } catch (e) {
            console.error('[FeedbackModal] submit error:', e);
            setError(e.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [canSubmit, buildPayload, onClose]);

    /* Stable value for rendering — avoids calling canSubmit() 6× per render */
    const ready = canSubmit();
    const wide  = mode !== 'feature' && section === 'all';

    /* ── Success screen ─────────────────────────────────────────────────── */
    if (sent) return (
        <>
            <style>{MODAL_STYLES}</style>
            <div className="fb-overlay">
                <div className="fb-modal" style={{
                    background: DS.surface, border: `1px solid ${DS.borderAccent}`,
                    borderRadius: 20, padding: '52px 44px', textAlign: 'center',
                    boxShadow: `${DS.shadowDeep}, ${DS.glowCyan}`, maxWidth: 360, width: '90%',
                }}>
                    <div style={{
                        width: 68, height: 68, margin: '0 auto 22px', borderRadius: '50%',
                        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fb-glowPulse 2s ease infinite',
                    }}>
                        <ThumbsUp size={30} color={DS.emerald} strokeWidth={1.5} />
                    </div>
                    <h3 style={{
                        margin: '0 0 10px', fontSize: 22, fontWeight: 700,
                        color: DS.textPrimary, letterSpacing: '-0.02em',
                    }}>
                        Thank you!
                    </h3>
                    <p style={{ color: DS.textSub, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                        Your feedback helps us make Vigil better for everyone.
                    </p>
                </div>
            </div>
        </>
    );

    /* ── Main modal ─────────────────────────────────────────────────────── */
    return (
        <>
            <style>{MODAL_STYLES}</style>
            <div
                className="fb-overlay"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <div
                    className="fb-modal"
                    style={{
                        background:   DS.surface,
                        border:       `1px solid ${DS.borderAccent}`,
                        borderRadius: 20,
                        width:        wide ? 580 : 490,
                        maxWidth:     '94vw',
                        maxHeight:    '90vh',
                        boxShadow:    `${DS.shadowDeep}, ${DS.glowCyan}`,
                        display:      'flex',
                        flexDirection:'column',
                        overflow:     'hidden',
                        transition:   'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    {/* Animated rainbow top bar */}
                    <div style={{
                        height: 3, flexShrink: 0,
                        background: `linear-gradient(90deg, ${DS.cyan}, ${DS.violet}, ${DS.emerald})`,
                        backgroundSize: '200% 100%',
                        animation: 'fb-waveFlow 3s ease infinite',
                    }} />

                    {/* Header */}
                    <div style={{
                        padding: '20px 26px 18px',
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
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${DS.border}`,
                                color: DS.textSub, cursor: 'pointer',
                                width: 32, height: 32, borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s', flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background    = 'rgba(251,113,133,0.12)';
                                e.currentTarget.style.color         = DS.rose;
                                e.currentTarget.style.borderColor   = 'rgba(251,113,133,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background    = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color         = DS.textSub;
                                e.currentTarget.style.borderColor   = DS.border;
                            }}
                        >
                            <X size={15} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Mode tabs */}
                    <div style={{
                        display: 'flex', gap: 6, padding: '14px 26px 12px',
                        borderBottom: `1px solid ${DS.border}`, flexShrink: 0,
                        background: 'rgba(255,255,255,0.01)',
                    }}>
                        {MODES.map(m => {
                            const Icon   = m.icon;
                            const active = mode === m.id;
                            return (
                                <button
                                    key={m.id} type="button"
                                    onClick={() => { setMode(m.id); setError(''); }}
                                    style={{
                                        flex: 1, padding: '9px 6px', borderRadius: 9,
                                        border:     `1px solid ${active ? `${m.color}50` : DS.border}`,
                                        background: active ? `${m.color}12` : 'transparent',
                                        color:      active ? m.color : DS.textMuted,
                                        cursor: 'pointer', fontSize: 11,
                                        fontWeight: active ? 600 : 400,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', gap: 5,
                                        transition: 'all 0.18s', fontFamily: DS.fontUI,
                                        opacity: active ? 1 : 0.65,
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) {
                                            e.currentTarget.style.opacity     = '1';
                                            e.currentTarget.style.borderColor = `${m.color}35`;
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) {
                                            e.currentTarget.style.opacity     = '0.65';
                                            e.currentTarget.style.borderColor = DS.border;
                                        }
                                    }}
                                >
                                    <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Scrollable form body */}
                    <div className="fb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 26px' }}>
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

                        {/* Rate-limit soft notice — amber, non-blocking */}
                        {rateLimited && !error && (
                            <div style={{
                                marginTop: 16, padding: '9px 13px', borderRadius: 9,
                                background: 'rgba(251,191,36,0.08)',
                                border: '1px solid rgba(251,191,36,0.22)',
                                color: DS.amber, fontSize: 11, lineHeight: 1.5,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', gap: 8,
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                                    You submitted feedback recently — you can still submit again if needed.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setRateLimited(false)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: DS.amber, opacity: 0.6, padding: 0, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Hard error — dismissible */}
                        {error && (
                            <div style={{
                                marginTop: 16, padding: '10px 14px', borderRadius: 9,
                                background: 'rgba(251,113,133,0.08)',
                                border: '1px solid rgba(251,113,133,0.25)',
                                color: DS.rose, fontSize: 12, lineHeight: 1.5,
                                display: 'flex', alignItems: 'flex-start',
                                justifyContent: 'space-between', gap: 8,
                            }}>
                                <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    {error}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setError('')}
                                    aria-label="Dismiss error"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: DS.rose, opacity: 0.6, padding: 0, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '12px 26px 20px',
                        borderTop: `1px solid ${DS.border}`,
                        flexShrink: 0,
                    }}>
                        <div style={{
                            fontSize: 10, color: DS.textMuted, marginBottom: 10,
                            fontFamily: DS.fontMono, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <span style={{ color: DS.rose }}>*</span>
                            {mode === 'feature'
                                ? 'Title and description are required'
                                : 'At least one section comment is required'}
                        </div>

                        <button
                            type="button"
                            className="fb-submit"
                            onClick={handleSubmit}
                            disabled={!ready}
                            style={{
                                width: '100%', padding: '13px 0',
                                borderRadius: 10, border: 'none',
                                background: ready
                                    ? `linear-gradient(135deg, ${DS.cyan}, ${DS.violet})`
                                    : 'rgba(255,255,255,0.05)',
                                color:      ready ? '#fff' : DS.textMuted,
                                fontSize: 13, fontWeight: 700,
                                cursor: ready ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                                letterSpacing: '0.03em', fontFamily: DS.fontUI,
                                transition: 'filter 0.2s, transform 0.15s, box-shadow 0.2s',
                                opacity:    submitting ? 0.7 : 1,
                                boxShadow:  ready ? '0 4px 20px rgba(56,189,248,0.22)' : 'none',
                            }}
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
        </>
    );
};

export default FeedbackModal;