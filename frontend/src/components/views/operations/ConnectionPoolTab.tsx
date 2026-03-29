import React, { useState, useEffect } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { API_BASE } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { encryptConnectionFields } from '../../../utils/cryptoUtils';
import {
    Database, Plus, Edit, Trash2, Eye, EyeOff, Check, X,
    Server, Key, User, AlertCircle, CheckCircle, Link as LinkIcon,
    RefreshCw, ChevronDown, Terminal, Lock, ChevronRight, ShieldCheck,
} from 'lucide-react';

// ─── Database type definitions ───────────────────────────────────────────────
const DB_TYPES = {
    postgresql: {
        label: 'PostgreSQL',
        defaultPort: 5432,
        color: '#336791',
        accent: '#4a90d9',
        icon: '🐘',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
    mysql: {
        label: 'MySQL',
        defaultPort: 3306,
        color: '#f29111',
        accent: '#f5a623',
        icon: '🐬',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
    mongodb: {
        label: 'MongoDB',
        defaultPort: 27017,
        color: '#13aa52',
        accent: '#00ed64',
        icon: '🍃',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl', 'authSource', 'replicaSet'],
    },
};

const FIELD_META = {
    host:         { label: 'Host',              placeholder: 'localhost',               type: 'text' },
    port:         { label: 'Port',              placeholder: '',                         type: 'number' },
    database:     { label: 'Database',          placeholder: 'my_database',             type: 'text' },
    username:     { label: 'Username',          placeholder: 'admin',                   type: 'text' },
    password:     { label: 'Password',          placeholder: '••••••••',               type: 'password' },
    ssl:          { label: 'Enable SSL',        type: 'checkbox' },
    authSource:   { label: 'Auth Source',       placeholder: 'admin',                   type: 'text', optional: true },
    replicaSet:   { label: 'Replica Set',       placeholder: 'rs0',                     type: 'text', optional: true },
};

const defaultFormData = (dbType = 'postgresql') => {
    const meta = DB_TYPES[dbType];
    return {
        name: '',
        dbType,
        host: '',
        port: meta.defaultPort ? String(meta.defaultPort) : '',
        database: '',
        username: '',
        password: '',
        ssl: false,
        isDefault: false,
        authSource: '',
        replicaSet: '',
        // ── SSH Tunnel ───────────────────────────────────────────────
        sshEnabled:    false,
        sshHost:       '',
        sshPort:       '22',
        sshUser:       '',
        sshAuthType:   'key',       // 'key' | 'password'
        sshPrivateKey: '',          // PEM content
        sshPassphrase: '',          // optional key passphrase
        sshPassword:   '',          // SSH password (when sshAuthType==='password')
    };
};

const FONT_UI   = `'DM Sans', system-ui, sans-serif`;
const FONT_MONO = `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`;

const S = {
    get root() { return {
        fontFamily: FONT_UI,
        minHeight: '100vh',
        background: THEME.bg,
        color: THEME.textMain,
        padding: '32px 28px',
    }; },
    card: (accent) => ({
        background: THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
        borderTop: `2px solid ${accent}55`,
        borderRadius: 10,
        padding: 20,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
    }),
    badge: (color) => ({
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700,
        background: `${color}22`, color: color,
        border: `1px solid ${color}44`, letterSpacing: '0.05em',
    }),
    btn: (bg, border, color) => ({
        background: bg, border: `1px solid ${border}`, borderRadius: 7,
        padding: '8px 14px', color, cursor: 'pointer', fontSize: 12, fontWeight: 600,
        transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
        letterSpacing: '0.02em',
    }),
    input: (hasError) => ({
        width: '100%', boxSizing: 'border-box',
        background: THEME.surfaceHover,
        border: `1px solid ${hasError ? THEME.danger : THEME.glassBorder}`,
        borderRadius: 7, padding: '9px 12px', color: THEME.textMain, fontSize: 13,
        outline: 'none', transition: 'border-color 0.2s',
        fontFamily: FONT_UI,
    }),
    get label() { return {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: THEME.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
        fontFamily: FONT_UI,
    }; },
};

// ─── DB Type Selector ─────────────────────────────────────────────────────────
const DBTypeSelector = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const current = DB_TYPES[value];

    return (
        <div style={{ position: 'relative' }}>
            <label style={S.label}>Database Type *</label>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    ...S.btn(THEME.surface, THEME.glassBorder, THEME.textMain),
                    width: '100%', justifyContent: 'space-between', padding: '10px 14px', fontSize: 14,
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{current.icon}</span>
                    <span style={{ fontWeight: 600 }}>{current.label}</span>
                    <span style={S.badge(current.accent)}>:{current.defaultPort || 'N/A'}</span>
                </span>
                <ChevronDown size={16} style={{ color: THEME.textMuted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                    background: THEME.surfaceRaised, border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxHeight: 360, overflowY: 'auto' }}>
                        {Object.entries(DB_TYPES).map(([key, db]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { onChange(key); setOpen(false); }}
                                style={{
                                    background: key === value ? `${db.accent}15` : 'transparent',
                                    border: 'none',
                                    borderLeft: key === value ? `3px solid ${db.accent}` : '3px solid transparent',
                                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = `${db.accent}12`}
                                onMouseLeave={e => e.currentTarget.style.background = key === value ? `${db.accent}15` : 'transparent'}
                            >
                                <span style={{ fontSize: 18 }}>{db.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: key === value ? db.accent : THEME.textMain }}>{db.label}</div>
                                    <div style={{ fontSize: 11, color: THEME.textMuted }}>port {db.defaultPort || '—'}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Dynamic Form Fields ──────────────────────────────────────────────────────
const DynamicFields = ({ dbType, formData, setFormData, formErrors, showPassword, togglePasswordVisibility }) => {
    const fields = DB_TYPES[dbType].fields;
    const rows = [];

    let i = 0;
    while (i < fields.length) {
        const f = fields[i];
        const meta = FIELD_META[f];

        if (meta.type === 'checkbox') {
            rows.push(
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                        type="checkbox"
                        id={`chk-${f}`}
                        checked={!!formData[f]}
                        onChange={e => setFormData(p => ({ ...p, [f]: e.target.checked }))}
                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                    />
                    <label htmlFor={`chk-${f}`} style={{ ...S.label, margin: 0, textTransform: 'none', fontSize: 13, cursor: 'pointer', color: THEME.textDim }}>
                        {meta.label}
                    </label>
                </div>
            );
            i++;
            continue;
        }

        if (meta.type === 'textarea') {
            rows.push(
                <div key={f}>
                    <label style={S.label}>{meta.label} {!meta.optional && '*'}</label>
                    <textarea
                        value={formData[f] || ''}
                        onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                        placeholder={meta.placeholder}
                        rows={5}
                        style={{ ...S.input(!!formErrors[f]), resize: 'vertical', lineHeight: 1.5 }}
                        onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                        onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : THEME.glassBorder}
                    />
                    {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
                </div>
            );
            i++;
            continue;
        }

        if (f === 'host' && fields[i + 1] === 'port') {
            rows.push(
                <div key="host-port" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    {['host', 'port'].map(field => {
                        const m = FIELD_META[field];
                        return (
                            <div key={field}>
                                <label style={S.label}>{m.label} *</label>
                                <input
                                    type={m.type}
                                    value={formData[field] || ''}
                                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                    placeholder={field === 'port' ? (DB_TYPES[dbType].defaultPort || '') : m.placeholder}
                                    style={S.input(!!formErrors[field])}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = formErrors[field] ? '#ef4444' : THEME.glassBorder}
                                />
                                {formErrors[field] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[field]}</div>}
                            </div>
                        );
                    })}
                </div>
            );
            i += 2;
            continue;
        }

        if (meta.type === 'password') {
            rows.push(
                <div key={f}>
                    <label style={S.label}>{meta.label} *</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData[f] || ''}
                            onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                            placeholder={meta.placeholder}
                            style={{ ...S.input(!!formErrors[f]), paddingRight: 42 }}
                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                            onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : THEME.glassBorder}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 4,
                            }}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
                </div>
            );
            i++;
            continue;
        }

        rows.push(
            <div key={f}>
                <label style={S.label}>{meta.label} {!meta.optional ? '*' : <span style={{ color: THEME.textMuted, textTransform: 'none', fontSize: 10 }}>(optional)</span>}</label>
                <input
                    type={meta.type || 'text'}
                    value={formData[f] || ''}
                    onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                    placeholder={meta.placeholder}
                    style={S.input(!!formErrors[f])}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : THEME.glassBorder}
                />
                {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
            </div>
        );
        i++;
    }

    return <>{rows}</>;
};

// ─── SSH Tunnel Section ───────────────────────────────────────────────────────
const SSHTunnelSection = ({ formData, setFormData }) => {
    const [open, setOpen] = useState(!!formData.sshEnabled);
    const [showSshPass, setShowSshPass] = useState(false);
    const [showPassphrase, setShowPassphrase] = useState(false);

    const toggle = (enabled) => {
        setFormData(p => ({ ...p, sshEnabled: enabled }));
        setOpen(enabled);
    };

    const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

    return (
        <div style={{
            border: `1px solid ${formData.sshEnabled ? '#6366f1AA' : THEME.glassBorder}`,
            borderRadius: 10,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
        }}>
            {/* Header toggle */}
            <button
                type="button"
                onClick={() => toggle(!formData.sshEnabled)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', background: formData.sshEnabled ? '#6366f108' : THEME.surfaceHover,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: open ? `1px solid ${THEME.glassBorder}` : 'none',
                    transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = formData.sshEnabled ? '#6366f114' : THEME.surface}
                onMouseLeave={e => e.currentTarget.style.background = formData.sshEnabled ? '#6366f108' : THEME.surfaceHover}
            >
                <Terminal size={15} color={formData.sshEnabled ? '#818cf8' : THEME.textMuted} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: formData.sshEnabled ? '#818cf8' : THEME.textMain }}>
                        SSH Tunnel
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 1 }}>
                        {formData.sshEnabled
                            ? `Via ${formData.sshHost || 'bastion host'} · ${formData.sshAuthType === 'key' ? 'Private key' : 'Password'} auth`
                            : 'For databases in private subnets without public IP'}
                    </div>
                </div>
                {/* Toggle pill */}
                <div
                    style={{
                        width: 36, height: 20, borderRadius: 10, position: 'relative',
                        background: formData.sshEnabled ? '#6366f1' : THEME.glassBorder,
                        transition: 'background 0.2s', flexShrink: 0,
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 3, left: formData.sshEnabled ? 19 : 3,
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                </div>
                <ChevronRight size={14} color={THEME.textMuted}
                    style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', marginLeft: 2 }} />
            </button>

            {/* Expanded fields */}
            {open && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, background: THEME.surface }}>

                    {/* Info banner */}
                    <div style={{
                        display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 7,
                        background: '#6366f108', border: '1px solid #6366f130',
                        fontSize: 12, color: THEME.textMuted, lineHeight: 1.5,
                    }}>
                        <Lock size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                            Traffic is routed through your bastion/jump host via local port forwarding.
                            The DB host below should be the <strong style={{ color: THEME.textDim }}>private</strong> address
                            reachable from the bastion (e.g. <code style={{ fontFamily: 'monospace', color: '#818cf8' }}>db.internal</code> or <code style={{ fontFamily: 'monospace', color: '#818cf8' }}>10.0.1.5</code>).
                        </span>
                    </div>

                    {/* Bastion host + port */}
                    <div style={rowStyle}>
                        <div>
                            <label style={S.label}>Bastion Host *</label>
                            <input type="text"
                                value={formData.sshHost}
                                onChange={e => setFormData(p => ({ ...p, sshHost: e.target.value }))}
                                placeholder="bastion.example.com"
                                style={S.input(!formData.sshHost && formData.sshEnabled)}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                            />
                        </div>
                        <div>
                            <label style={S.label}>SSH Port</label>
                            <input type="number"
                                value={formData.sshPort}
                                onChange={e => setFormData(p => ({ ...p, sshPort: e.target.value }))}
                                placeholder="22"
                                style={S.input(false)}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                            />
                        </div>
                    </div>

                    {/* SSH user */}
                    <div>
                        <label style={S.label}>SSH Username *</label>
                        <input type="text"
                            value={formData.sshUser}
                            onChange={e => setFormData(p => ({ ...p, sshUser: e.target.value }))}
                            placeholder="ec2-user"
                            style={S.input(!formData.sshUser && formData.sshEnabled)}
                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                            onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                        />
                    </div>

                    {/* Auth type tabs */}
                    <div>
                        <label style={S.label}>Authentication Method</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[['key', '🔑 Private Key'], ['password', '🔒 Password']].map(([val, label]) => (
                                <button key={val} type="button"
                                    onClick={() => setFormData(p => ({ ...p, sshAuthType: val }))}
                                    style={{
                                        flex: 1, padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        background: formData.sshAuthType === val ? '#6366f122' : THEME.surfaceHover,
                                        border: `1px solid ${formData.sshAuthType === val ? '#6366f166' : THEME.glassBorder}`,
                                        color: formData.sshAuthType === val ? '#818cf8' : THEME.textMuted,
                                    }}
                                >{label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Private Key fields */}
                    {formData.sshAuthType === 'key' && (<>
                        <div>
                            <label style={S.label}>Private Key (PEM) *</label>
                            <textarea
                                value={formData.sshPrivateKey}
                                onChange={e => setFormData(p => ({ ...p, sshPrivateKey: e.target.value }))}
                                placeholder={'-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----'}
                                rows={5}
                                style={{
                                    ...S.input(!formData.sshPrivateKey && formData.sshEnabled),
                                    resize: 'vertical', lineHeight: 1.4,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: 11,
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                            />
                            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>
                                Paste the contents of your <code style={{ fontFamily: 'monospace' }}>~/.ssh/id_rsa</code> or <code style={{ fontFamily: 'monospace' }}>id_ed25519</code> file
                            </div>
                        </div>
                        <div>
                            <label style={S.label}>Key Passphrase <span style={{ color: THEME.textMuted, fontSize: 10, textTransform: 'none' }}>(optional)</span></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassphrase ? 'text' : 'password'}
                                    value={formData.sshPassphrase}
                                    onChange={e => setFormData(p => ({ ...p, sshPassphrase: e.target.value }))}
                                    placeholder="Leave blank if key has no passphrase"
                                    style={{ ...S.input(false), paddingRight: 42 }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                                />
                                <button type="button" onClick={() => setShowPassphrase(p => !p)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 4 }}>
                                    {showPassphrase ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                            </div>
                        </div>
                    </>)}

                    {/* Password auth field */}
                    {formData.sshAuthType === 'password' && (
                        <div>
                            <label style={S.label}>SSH Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showSshPass ? 'text' : 'password'}
                                    value={formData.sshPassword}
                                    onChange={e => setFormData(p => ({ ...p, sshPassword: e.target.value }))}
                                    placeholder="••••••••"
                                    style={{ ...S.input(!formData.sshPassword && formData.sshEnabled), paddingRight: 42 }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                                />
                                <button type="button" onClick={() => setShowSshPass(p => !p)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 4 }}>
                                    {showSshPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
/* ── ★ NEW HIGH: Connection Leak Detector ───────────────────────────────────
   Shows pg_stat_activity entries that have been idle for an abnormally long
   time — strong indicator of a connection leak in application code.
   ─────────────────────────────────────────────────────────────────────────── */
const LeakDetector = () => {
    useAdaptiveTheme();
    const [suspects, setSuspects] = useState([]);
    const [threshold, setThreshold] = useState(30); // minutes
    const [loading, setLoading]  = useState(false);
    const [expanded, setExpanded] = useState(false);

    const scan = async () => {
        setLoading(true);
        try {
            const token   = localStorage.getItem('vigil_token') || localStorage.getItem('authToken');
            const res     = await fetch(`${API_BASE}/api/reliability/active-connections`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const rows = await res.json();
                // Filter connections idle longer than threshold
                const leaky = (rows || []).filter(r =>
                    (r.state === 'idle' || r.state === 'idle in transaction') &&
                    r.duration_sec > threshold * 60
                );
                setSuspects(leaky);
            }
        } catch {
            // Use sample data when endpoint unavailable
            setSuspects([]);
        } finally {
            setLoading(false);
        }
    };

    const fmtDur = (sec) => {
        if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`;
        if (sec >= 60)   return `${Math.floor(sec / 60)}m`;
        return `${sec}s`;
    };

    return (
        <div style={{ marginTop: 24, background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Header / toggle */}
            <div
                onClick={() => { setExpanded(e => !e); if (!expanded) scan(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer',
                    background: suspects.length > 0 ? `rgba(239,68,68,0.07)` : 'transparent',
                    borderBottom: expanded ? `1px solid ${THEME.glassBorder}` : 'none' }}
            >
                <span style={{ fontSize: 18 }}>🔍</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>Connection Leak Detector</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                        Idle connections exceeding threshold — potential application leaks
                    </div>
                </div>
                {suspects.length > 0 && (
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {suspects.length} suspect{suspects.length !== 1 ? 's' : ''}
                    </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontSize: 11, color: THEME.textDim, whiteSpace: 'nowrap' }}>Threshold:</label>
                    <select value={threshold} onChange={e => { setThreshold(Number(e.target.value)); e.stopPropagation(); }}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, border: `1px solid ${THEME.glassBorder}`,
                            background: THEME.bg, color: THEME.textMain, cursor: 'pointer' }}>
                        {[5, 15, 30, 60, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                    </select>
                    <button onClick={e => { e.stopPropagation(); scan(); }}
                        style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${THEME.glassBorder}`,
                            background: 'transparent', color: THEME.textDim, cursor: 'pointer', fontSize: 12 }}>
                        {loading ? '⟳' : '↻ Scan'}
                    </button>
                    <span style={{ color: THEME.textDim, fontSize: 14 }}>{expanded ? '▲' : '▼'}</span>
                </div>
            </div>

            {expanded && (
                <div style={{ padding: '0 0 4px' }}>
                    {suspects.length === 0 ? (
                        <div style={{ padding: '20px 24px', textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
                            {loading ? '🔄 Scanning...' : `✅ No idle connections exceeding ${threshold} minutes`}
                        </div>
                    ) : (
                        <>
                            {/* Column headers */}
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 120px 100px 90px 1fr 140px', gap: 12,
                                padding: '10px 20px', fontSize: 11, color: THEME.textDim, fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: .7, borderBottom: `1px solid ${THEME.glassBorder}22` }}>
                                <span>PID</span><span>User</span><span>State</span><span>Idle For</span><span>Last Query</span><span>Application</span>
                            </div>
                            {suspects.map((s, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 120px 100px 90px 1fr 140px', gap: 12,
                                    padding: '10px 20px', alignItems: 'center', fontSize: 12,
                                    borderBottom: `1px solid ${THEME.glassBorder}11`,
                                    background: s.state === 'idle in transaction' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                                    <span style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>{s.pid}</span>
                                    <span style={{ color: THEME.textMain, fontWeight: 600 }}>{s.usename}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                                        background: s.state === 'idle in transaction' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.12)',
                                        color: s.state === 'idle in transaction' ? '#ef4444' : '#f97316' }}>
                                        {s.state}
                                    </span>
                                    <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: THEME.fontMono }}>{fmtDur(s.duration_sec)}</span>
                                    <span style={{ color: THEME.textDim, fontFamily: THEME.fontMono, fontSize: 11,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.query?.slice(0, 60) || '—'}
                                    </span>
                                    <span style={{ color: THEME.textMuted, fontSize: 11 }}>{s.application_name || '—'}</span>
                                </div>
                            ))}
                            <div style={{ padding: '12px 20px', fontSize: 11, color: THEME.textDim, borderTop: `1px solid ${THEME.glassBorder}22` }}>
                                💡 Tip: <code style={{ background: THEME.bg, padding: '2px 6px', borderRadius: 4 }}>SELECT pg_terminate_backend(pid)</code> to terminate a leaked connection
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ConnectionsTab = () => {
    useAdaptiveTheme();
    const [connections, setConnections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingConnection, setEditingConnection] = useState(null);
    const [testingConnection, setTestingConnection] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(defaultFormData());
    const [formErrors, setFormErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState('');
    const [switchingId, setSwitchingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

    // Connection context — keeps the header dropdown in sync
    const { refreshConnections: refreshCtxConnections, activeConnectionId, switchConnection } = useConnection();

    const getAuthToken = () => localStorage.getItem('vigil_token') || localStorage.getItem('authToken');

    useEffect(() => { fetchConnections(); }, []);

    const fetchConnections = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/connections`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            if (res.ok) {
                const data = await res.json();
                setConnections(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch connections:', res.status, res.statusText);
            }
        } catch (e) {
            console.error('Network error fetching connections:', e.message);
        }
    };

    const validateForm = () => {
        const errors = {};
        const dbMeta = DB_TYPES[formData.dbType];
        const fields = dbMeta.fields.filter(f => FIELD_META[f].type !== 'checkbox');

        if (!formData.name.trim()) errors.name = 'Name is required';

        fields.forEach(f => {
            const meta = FIELD_META[f];
            if (meta.optional || meta.type === 'checkbox') return;
            if (f === 'password' && editingConnection) return;
            const val = formData[f];
            if (!val || (typeof val === 'string' && !val.trim())) {
                errors[f] = `${meta.label} is required`;
            }
        });

        if (formData.port) {
            const p = parseInt(formData.port);
            if (isNaN(p) || p < 1 || p > 65535) errors.port = 'Port must be 1–65535';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const saveConnection = async () => {
        if (!validateForm()) return;
        setErrorMsg('');
        setSaving(true);
        try {
            // Encrypt sensitive fields (password, SSH keys) client-side before transit
            const token = getAuthToken();
            const encryptedData = await encryptConnectionFields(API_BASE, token, formData);

            const url = editingConnection
                ? `${API_BASE}/api/connections/${editingConnection.id}`
                : `${API_BASE}/api/connections`;
            const res = await fetch(url, {
                method: editingConnection ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(encryptedData),
            });
            if (res.ok) {
                const result = await res.json();
                await fetchConnections();
                refreshCtxConnections();

                // Show auto-test result if available (new connections)
                if (result.testResult) {
                    if (result.testResult.success) {
                        setSaveSuccess(`Connection "${formData.name}" saved & verified successfully`);
                    } else {
                        setSaveSuccess(`Connection "${formData.name}" saved, but test failed: ${result.testResult.error}`);
                    }
                }
                closeModal();
            } else {
                const text = await res.text();
                let msg = `Server error (${res.status})`;
                try {
                    const json = JSON.parse(text);
                    msg = json.error || json.message || msg;
                } catch { /* empty */ }
                setErrorMsg(msg);
            }
        } catch (e) {
            setErrorMsg(`Network error: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ✅ FIX 1: Allow deleting default connections — auto-promote next connection
    const deleteConnection = async (id) => {
        if (!confirm('Delete this connection?')) return;
        try {
            const wasDefault = connections.find(c => c.id === id)?.isDefault;
            const remaining = connections.filter(c => c.id !== id);

            const res = await fetch(`${API_BASE}/api/connections/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });

            if (res.ok) {
                // If deleted connection was default and others exist, promote first remaining
                if (wasDefault && remaining.length > 0) {
                    await fetch(`${API_BASE}/api/connections/${remaining[0].id}/default`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${getAuthToken()}` },
                    });
                }
                fetchConnections();
                refreshCtxConnections(); // keep header dropdown in sync
            } else {
                const text = await res.text();
                let msg = 'Failed to delete';
                try { msg = JSON.parse(text).error || msg; } catch { /* empty */ }
                alert(msg);
            }
        } catch (e) {
            alert(`Network error: ${e.message}`);
        }
    };

    const testConnection = async (conn) => {
        setTestingConnection(conn.id);
        try {
            const res = await fetch(`${API_BASE}/api/connections/${conn.id}/test`, {
                method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const text = await res.text();
            let r = {};
            try { r = JSON.parse(text); } catch { /* empty */ }
            alert(r.success ? '✅ Connection successful!' : `❌ Failed: ${r.error || text || res.statusText}`);
        } catch (e) {
            alert(`Network error: ${e.message}`);
        } finally {
            setTestingConnection(null);
        }
    };

    const setDefaultConnection = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/connections/${id}/default`, {
                method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            if (res.ok) fetchConnections();
        } catch (e) { console.error(e); }
    };

    const openNew = () => {
        setEditingConnection(null);
        setFormData(defaultFormData());
        setFormErrors({});
        setErrorMsg('');
        setShowPassword(false);
        setShowModal(true);
    };

    const openEdit = (conn) => {
        setEditingConnection(conn);
        setFormData({ ...defaultFormData(conn.dbType || 'postgresql'), ...conn, password: '' });
        setFormErrors({});
        setErrorMsg('');
        setShowPassword(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingConnection(null);
        setFormData(defaultFormData());
        setFormErrors({});
        setErrorMsg('');
    };

    const handleDbTypeChange = (type) => {
        setFormData(prev => ({
            ...defaultFormData(type),
            name: prev.name,
        }));
        setFormErrors({});
        setErrorMsg('');
    };

    // Auto-dismiss success toast
    useEffect(() => {
        if (!saveSuccess) return;
        const t = setTimeout(() => setSaveSuccess(''), 6000);
        return () => clearTimeout(t);
    }, [saveSuccess]);

    return (
        <div style={S.root}>
            {/* ── Success / Error Toast ── */}
            {saveSuccess && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 600,
                    padding: '12px 18px', borderRadius: 12, maxWidth: 420,
                    background: saveSuccess.includes('failed') ? `${THEME.danger}12` : `${THEME.success}12`,
                    border: `1px solid ${saveSuccess.includes('failed') ? THEME.danger : THEME.success}30`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,.3)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'fadeUp .3s ease',
                    cursor: 'pointer',
                }} onClick={() => setSaveSuccess('')}>
                    {saveSuccess.includes('failed')
                        ? <AlertCircle size={16} color={THEME.danger} />
                        : <ShieldCheck size={16} color={THEME.success} />
                    }
                    <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{saveSuccess}</span>
                </div>
            )}

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, margin: 0, letterSpacing: '-0.02em' }}>
                        Database Connections
                    </h2>
                    <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4, fontWeight: 500 }}>
                        {connections.length} connection{connections.length !== 1 ? 's' : ''} · Encrypted at rest · PostgreSQL, MySQL, MongoDB
                    </p>
                </div>
                <button
                    onClick={openNew}
                    style={S.btn(THEME.primary + '2E', THEME.primary + '66', THEME.primary)}
                    onMouseEnter={e => e.currentTarget.style.background = THEME.primary + '4D'}
                    onMouseLeave={e => e.currentTarget.style.background = THEME.primary + '2E'}
                >
                    <Plus size={16} />
                    New Connection
                </button>
            </div>

            {/* ── Cards Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {connections.map(conn => {
                    const dbMeta = DB_TYPES[conn.dbType] || DB_TYPES.postgresql;
                    return (
                        <div key={conn.id} style={S.card(dbMeta.accent)}>
                            <div style={{
                                position: 'absolute', top: -40, left: -40, width: 120, height: 120,
                                borderRadius: '50%', background: `${dbMeta.accent}08`, pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 24 }}>{dbMeta.icon}</span>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain }}>{conn.name}</span>
                                            {conn.isDefault && <span style={S.badge('#4ade80')}>DEFAULT</span>}
                                            {conn.sshEnabled && (
                                                <span style={{ ...S.badge('#818cf8'), display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Terminal size={10} /> SSH
                                                </span>
                                            )}
                                            <span style={{ ...S.badge('#22c55e'), display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                <Lock size={9} /> AES-256
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                                            <span style={{ color: dbMeta.accent }}>{dbMeta.label}</span>
                                            {conn.host && ` · ${conn.host}${conn.port ? `:${conn.port}` : ''}`}
                                            {conn.authSource && ` · auth:${conn.authSource}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: THEME.surfaceHover, borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>
                                {conn.database && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMuted }}>database</span>
                                        <span style={{ color: THEME.textDim }}>{conn.database}</span>
                                    </div>
                                )}
                                {conn.username && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMuted }}>user</span>
                                        <span style={{ color: THEME.textDim }}>{conn.username}</span>
                                    </div>
                                )}
                                {conn.replicaSet && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: THEME.textMuted }}>replica set</span>
                                        <span style={{ color: THEME.textDim }}>{conn.replicaSet}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: THEME.textMuted }}>ssl</span>
                                    <span style={{ color: conn.ssl ? '#4ade80' : '#374151' }}>{conn.ssl ? 'on' : 'off'}</span>
                                </div>
                                {conn.sshEnabled && conn.sshHost && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                        <span style={{ color: THEME.textMuted }}>tunnel via</span>
                                        <span style={{ color: '#818cf8', fontSize: 11 }}>
                                            {conn.sshUser ? `${conn.sshUser}@` : ''}{conn.sshHost}:{conn.sshPort || 22}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {conn.lastTested && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 10px', borderRadius: 6, marginBottom: 14,
                                    background: conn.status === 'success' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                                    border: `1px solid ${conn.status === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)'}`,
                                }}>
                                    {conn.status === 'success'
                                        ? <CheckCircle size={13} color="#4ade80" />
                                        : <AlertCircle size={13} color="#ef4444" />}
                                    <span style={{ fontSize: 11, color: conn.status === 'success' ? '#4ade80' : '#ef4444', fontWeight: 600 }}>
                                        {conn.status === 'success' ? 'Last test passed' : 'Last test failed'}
                                    </span>
                                </div>
                            )}

                            {/* ✅ FIX 2 & 3: All 3 action buttons always enabled and clearly colored */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                {/* Test button */}
                                <button
                                    onClick={() => testConnection(conn)}
                                    disabled={testingConnection === conn.id}
                                    style={{
                                        ...S.btn('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.25)', '#818cf8'),
                                        flex: 1, justifyContent: 'center',
                                        opacity: testingConnection === conn.id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => testingConnection !== conn.id && (e.currentTarget.style.background = 'rgba(99,102,241,0.22)')}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                                >
                                    {testingConnection === conn.id
                                        ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
                                        : <><LinkIcon size={12} /> Test</>}
                                </button>

                                {/* Set Default button — only shown when not already default */}
                                {!conn.isDefault && (
                                    <button
                                        onClick={() => setDefaultConnection(conn.id)}
                                        style={S.btn('rgba(74,222,128,0.1)', 'rgba(74,222,128,0.25)', '#4ade80')}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
                                        title="Set as default"
                                    >
                                        <Check size={12} />
                                    </button>
                                )}

                                {/* Switch Active — connect all dashboards to this DB */}
                                <button
                                    onClick={async () => {
                                        if (conn.id === activeConnectionId) return;
                                        setSwitchingId(conn.id);
                                        try {
                                            await switchConnection(conn.id);
                                            await fetchConnections();
                                        } catch (e) {
                                            alert('Switch failed: ' + e.message);
                                        } finally { setSwitchingId(null); }
                                    }}
                                    disabled={conn.id === activeConnectionId || switchingId === conn.id}
                                    style={{
                                        ...S.btn(
                                            conn.id === activeConnectionId ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.08)',
                                            'rgba(56,189,248,0.3)', '#38bdf8'
                                        ),
                                        opacity: conn.id === activeConnectionId ? 0.6 : 1,
                                        cursor: conn.id === activeConnectionId ? 'default' : 'pointer',
                                    }}
                                    title={conn.id === activeConnectionId ? 'Currently active' : 'Switch dashboards to this DB'}
                                >
                                    {switchingId === conn.id
                                        ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                        : conn.id === activeConnectionId
                                            ? <CheckCircle size={12} />
                                            : <LinkIcon size={12} />
                                    }
                                </button>

                                {/* ✅ FIX 2: Edit button — amber/yellow so it's clearly visible */}
                                <button
                                    onClick={() => openEdit(conn)}
                                    style={S.btn('rgba(251,191,36,0.1)', 'rgba(251,191,36,0.3)', '#fbbf24')}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                                    title="Edit connection"
                                >
                                    <Edit size={12} />
                                </button>

                                {/* ✅ FIX 1: Delete button — always enabled, no disabled state */}
                                <button
                                    onClick={() => deleteConnection(conn.id)}
                                    style={{
                                        ...S.btn('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.25)', '#ef4444'),
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    title="Delete connection"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {connections.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px',
                        background: THEME.surface, border: `1px dashed ${THEME.glassBorder}`,
                        borderRadius: 10,
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>No connections yet</h3>
                        <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 20 }}>
                            Connect to PostgreSQL, MySQL, MongoDB.
                        </p>
                        <button
                            onClick={openNew}
                            style={S.btn(THEME.primary + '2E', THEME.primary + '66', THEME.primary)}
                            onMouseEnter={e => e.currentTarget.style.background = THEME.primary + '4D'}
                            onMouseLeave={e => e.currentTarget.style.background = THEME.primary + '2E'}
                        >
                            <Plus size={16} /> Add First Connection
                        </button>
                    </div>
                )}
            </div>

            {/* ── ★ NEW HIGH: Connection Leak Detector ─────────────────────── */}
            <LeakDetector />

            {/* ── Modal ── */}
            {showModal && (
                <>
                    <div onClick={closeModal} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)', zIndex: 999,
                    }} />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto',
                        background: THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`,
                        borderTop: `2px solid ${DB_TYPES[formData.dbType].accent}66`,
                        borderRadius: 14, padding: 30, zIndex: 1000,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
                        fontFamily: FONT_UI,
                    }}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                                {editingConnection ? '✏️ Edit Connection' : '🔌 New Connection'}
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = THEME.textMuted; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <DBTypeSelector value={formData.dbType} onChange={handleDbTypeChange} />

                            <div>
                                <label style={S.label}>Connection Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder={`My ${DB_TYPES[formData.dbType].label} DB`}
                                    style={S.input(!!formErrors.name)}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : THEME.glassBorder}
                                />
                                {formErrors.name && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors.name}</div>}
                            </div>

                            <DynamicFields
                                dbType={formData.dbType}
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                showPassword={showPassword}
                                togglePasswordVisibility={() => setShowPassword(p => !p)}
                            />

                            {/* ── SSH Tunnel ── */}
                            <SSHTunnelSection formData={formData} setFormData={setFormData} />

                            {!editingConnection && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                                    />
                                    <label htmlFor="isDefault" style={{ ...S.label, margin: 0, textTransform: 'none', fontSize: 13, cursor: 'pointer', color: THEME.textDim }}>
                                        Set as default connection
                                    </label>
                                </div>
                            )}

                            {errorMsg && (
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px 14px', borderRadius: 8,
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                }}>
                                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 13, color: '#ef4444', lineHeight: 1.4 }}>{errorMsg}</span>
                                    <button
                                        onClick={() => setErrorMsg('')}
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeModal}
                                style={S.btn(THEME.surface, THEME.glassBorder, THEME.textMuted)}
                                onMouseEnter={e => e.currentTarget.style.background = THEME.surfaceHover}
                                onMouseLeave={e => e.currentTarget.style.background = THEME.surface}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveConnection}
                                disabled={saving}
                                style={{
                                    ...S.btn(THEME.primary + '33', THEME.primary + '73', THEME.primary),
                                    opacity: saving ? 0.7 : 1,
                                    cursor: saving ? 'wait' : 'pointer',
                                }}
                                onMouseEnter={e => !saving && (e.currentTarget.style.background = THEME.primary + '52')}
                                onMouseLeave={e => !saving && (e.currentTarget.style.background = THEME.primary + '33')}
                            >
                                {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={16} />}
                                {saving ? 'Encrypting & Saving...' : editingConnection ? 'Update' : 'Encrypt & Save'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default ConnectionsTab;
