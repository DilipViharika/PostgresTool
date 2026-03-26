import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { API_BASE } from '../../../utils/api.js';
import { useConnection } from '../../../context/ConnectionContext.jsx';
import { encryptConnectionFields } from '../../../utils/cryptoUtils.js';
import {
    Database, Plus, Edit, Trash2, Eye, EyeOff, Check, X,
    Server, Key, User, AlertCircle, CheckCircle, Link as LinkIcon,
    RefreshCw, ChevronDown, Terminal, Lock, ChevronRight, ShieldCheck,
    type LucideIcon
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface DBTypeConfig {
    label: string;
    defaultPort: number;
    color: string;
    accent: string;
    icon: string;
    fields: string[];
}

interface DBConnection {
    id: string;
    name: string;
    dbType: string;
    host: string;
    port: string;
    database: string;
    username: string;
    password?: string;
    ssl?: boolean;
    isDefault?: boolean;
    status?: string;
    lastTested?: string;
    sshEnabled?: boolean;
    sshHost?: string;
    sshPort?: string;
    sshUser?: string;
    sshAuthType?: string;
    authSource?: string;
    replicaSet?: string;
}

interface FormData extends Omit<DBConnection, 'id'> {
    sshPrivateKey?: string;
    sshPassphrase?: string;
    sshPassword?: string;
}

interface FieldMeta {
    label: string;
    placeholder?: string;
    type: string;
    optional?: boolean;
}

interface TestResult {
    success: boolean;
    error?: string;
}

interface SaveResult {
    testResult?: TestResult;
}

/* ─── Database Types ───────────────────────────────────────────────────── */
const DB_TYPES: Record<string, DBTypeConfig> = {
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

const FIELD_META: Record<string, FieldMeta> = {
    host: { label: 'Host', placeholder: 'localhost', type: 'text' },
    port: { label: 'Port', placeholder: '', type: 'number' },
    database: { label: 'Database', placeholder: 'my_database', type: 'text' },
    username: { label: 'Username', placeholder: 'admin', type: 'text' },
    password: { label: 'Password', placeholder: '••••••••', type: 'password' },
    ssl: { label: 'Enable SSL', type: 'checkbox' },
    authSource: { label: 'Auth Source', placeholder: 'admin', type: 'text', optional: true },
    replicaSet: { label: 'Replica Set', placeholder: 'rs0', type: 'text', optional: true },
};

const defaultFormData = (dbType: string = 'postgresql'): FormData => {
    const meta = DB_TYPES[dbType];
    return {
        name: '',
        dbType,
        host: '',
        port: String(meta.defaultPort),
        database: '',
        username: '',
        password: '',
        ssl: false,
        isDefault: false,
        authSource: '',
        replicaSet: '',
        sshEnabled: false,
        sshHost: '',
        sshPort: '22',
        sshUser: '',
        sshAuthType: 'key',
        sshPrivateKey: '',
        sshPassphrase: '',
        sshPassword: '',
    };
};

const FONT_UI = `'DM Sans', system-ui, sans-serif`;
const FONT_MONO = `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`;

/* ─── Styles ────────────────────────────────────────────────────────────── */
const S = {
    root: (bg: string, color: string) => ({
        fontFamily: FONT_UI,
        minHeight: '100vh',
        background: bg,
        color: color,
        padding: '32px 28px',
    }),
    card: (accent: string) => ({
        background: THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
        borderTop: `2px solid ${accent}55`,
        borderRadius: 10,
        padding: 20,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
    } as React.CSSProperties),
    badge: (color: string) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
        letterSpacing: '0.05em',
    } as React.CSSProperties),
    btn: (bg: string, border: string, color: string) => ({
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 7,
        padding: '8px 14px',
        color,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        letterSpacing: '0.02em',
    } as React.CSSProperties),
    input: (hasError: boolean) => ({
        width: '100%',
        boxSizing: 'border-box' as const,
        background: THEME.surfaceHover,
        border: `1px solid ${hasError ? THEME.danger : THEME.glassBorder}`,
        borderRadius: 7,
        padding: '9px 12px',
        color: THEME.textMain,
        fontSize: 13,
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: FONT_UI,
    } as React.CSSProperties),
    label: {
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        fontFamily: FONT_UI,
    } as React.CSSProperties,
};

/* ─── Components ────────────────────────────────────────────────────────── */
interface DBTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const DBTypeSelector: React.FC<DBTypeSelectorProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const current = DB_TYPES[value];

    return (
        <div style={{ position: 'relative' }}>
            <label style={S.label}>Database Type *</label>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded border font-semibold text-sm"
                style={{
                    ...S.btn(THEME.surface, THEME.glassBorder, THEME.textMain),
                    width: '100%',
                    justifyContent: 'space-between',
                    fontSize: 14,
                }}
            >
                <span className="flex items-center gap-2.5">
                    <span style={{ fontSize: 20 }}>{current.icon}</span>
                    <span style={{ fontWeight: 600 }}>{current.label}</span>
                    <span style={S.badge(current.accent)}>:{current.defaultPort || 'N/A'}</span>
                </span>
                <ChevronDown size={16}
                    style={{
                        color: THEME.textMuted,
                        transform: open ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                    }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 200,
                    background: THEME.surfaceRaised,
                    border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        maxHeight: 360,
                        overflowY: 'auto'
                    }}>
                        {Object.entries(DB_TYPES).map(([key, db]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { onChange(key); setOpen(false); }}
                                className="text-left px-3.5 py-2.5 hover:bg-opacity-20 transition-all"
                                style={{
                                    background: key === value ? `${db.accent}15` : 'transparent',
                                    border: 'none',
                                    borderLeft: key === value ? `3px solid ${db.accent}` : '3px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = `${db.accent}12`}
                                onMouseLeave={e => e.currentTarget.style.background = key === value ? `${db.accent}15` : 'transparent'}
                            >
                                <span style={{ fontSize: 18 }}>{db.icon}</span>
                                <div>
                                    <div className="font-semibold text-xs"
                                        style={{ color: key === value ? db.accent : THEME.textMain }}>
                                        {db.label}
                                    </div>
                                    <div className="text-xs" style={{ color: THEME.textMuted }}>
                                        port {db.defaultPort || '—'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface DynamicFieldsProps {
    dbType: string;
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    formErrors: Record<string, string>;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
}

const DynamicFields: React.FC<DynamicFieldsProps> = ({
    dbType,
    formData,
    setFormData,
    formErrors,
    showPassword,
    togglePasswordVisibility
}) => {
    const fields = DB_TYPES[dbType].fields;
    const rows: ReactNode[] = [];

    let i = 0;
    while (i < fields.length) {
        const f = fields[i];
        const meta = FIELD_META[f];

        if (meta.type === 'checkbox') {
            rows.push(
                <div key={f} className="flex items-center gap-2.5">
                    <input
                        type="checkbox"
                        id={`chk-${f}`}
                        checked={!!(formData as any)[f]}
                        onChange={e => setFormData(p => ({ ...p, [f]: e.target.checked }))}
                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                    />
                    <label htmlFor={`chk-${f}`} className="text-xs cursor-pointer"
                        style={{
                            ...S.label,
                            margin: 0,
                            textTransform: 'none',
                            fontSize: 13,
                            color: THEME.textDim
                        }}>
                        {meta.label}
                    </label>
                </div>
            );
            i++;
            continue;
        }

        if (f === 'host' && fields[i + 1] === 'port') {
            rows.push(
                <div key="host-port" className="grid grid-cols-2 gap-3">
                    {(['host', 'port'] as const).map(field => {
                        const m = FIELD_META[field];
                        return (
                            <div key={field}>
                                <label style={S.label}>{m.label} *</label>
                                <input
                                    type={m.type}
                                    value={(formData as any)[field] || ''}
                                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                    placeholder={field === 'port' ? String(DB_TYPES[dbType].defaultPort || '') : m.placeholder}
                                    style={S.input(!!(formErrors as any)[field])}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = (formErrors as any)[field] ? '#ef4444' : THEME.glassBorder}
                                />
                                {(formErrors as any)[field] && (
                                    <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                                        {(formErrors as any)[field]}
                                    </div>
                                )}
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
                            value={(formData as any)[f] || ''}
                            onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                            placeholder={meta.placeholder}
                            style={{ ...S.input(!!(formErrors as any)[f]), paddingRight: 42 }}
                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                            onBlur={e => e.currentTarget.style.borderColor = (formErrors as any)[f] ? '#ef4444' : THEME.glassBorder}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: THEME.textMuted,
                                cursor: 'pointer',
                                padding: 4,
                            }}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {(formErrors as any)[f] && (
                        <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                            {(formErrors as any)[f]}
                        </div>
                    )}
                </div>
            );
            i++;
            continue;
        }

        rows.push(
            <div key={f}>
                <label style={S.label}>
                    {meta.label} {!meta.optional ? '*' : (
                        <span style={{ color: THEME.textMuted, textTransform: 'none', fontSize: 10 }}>
                            (optional)
                        </span>
                    )}
                </label>
                <input
                    type={meta.type || 'text'}
                    value={(formData as any)[f] || ''}
                    onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                    placeholder={meta.placeholder}
                    style={S.input(!!(formErrors as any)[f])}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = (formErrors as any)[f] ? '#ef4444' : THEME.glassBorder}
                />
                {(formErrors as any)[f] && (
                    <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                        {(formErrors as any)[f]}
                    </div>
                )}
            </div>
        );
        i++;
    }

    return <>{rows}</>;
};

interface SSHTunnelSectionProps {
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const SSHTunnelSection: React.FC<SSHTunnelSectionProps> = ({ formData, setFormData }) => {
    const [open, setOpen] = useState(!!formData.sshEnabled);
    const [showSshPass, setShowSshPass] = useState(false);
    const [showPassphrase, setShowPassphrase] = useState(false);

    const toggle = (enabled: boolean) => {
        setFormData(p => ({ ...p, sshEnabled: enabled }));
        setOpen(enabled);
    };

    const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

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
                className="w-full text-left px-4 py-3 border-b hover:bg-opacity-50 transition-all"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: formData.sshEnabled ? '#6366f108' : THEME.surfaceHover,
                    border: 'none',
                    borderBottom: open ? `1px solid ${THEME.glassBorder}` : 'none',
                    cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = formData.sshEnabled ? '#6366f114' : THEME.surface}
                onMouseLeave={e => e.currentTarget.style.background = formData.sshEnabled ? '#6366f108' : THEME.surfaceHover}
            >
                <Terminal size={15} color={formData.sshEnabled ? '#818cf8' : THEME.textMuted} />
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: formData.sshEnabled ? '#818cf8' : THEME.textMain
                    }}>
                        SSH Tunnel
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 1 }}>
                        {formData.sshEnabled
                            ? `Via ${formData.sshHost || 'bastion host'} · ${formData.sshAuthType === 'key' ? 'Private key' : 'Password'} auth`
                            : 'For databases in private subnets without public IP'
                        }
                    </div>
                </div>
                {/* Toggle pill */}
                <div style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    position: 'relative',
                    background: formData.sshEnabled ? '#6366f1' : THEME.glassBorder,
                    transition: 'background 0.2s',
                    flexShrink: 0,
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 3,
                        left: formData.sshEnabled ? 19 : 3,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
                        display: 'flex',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 7,
                        background: '#6366f108',
                        border: '1px solid #6366f130',
                        fontSize: 12,
                        color: THEME.textMuted,
                        lineHeight: 1.5,
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
                                value={formData.sshHost || ''}
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
                                value={formData.sshPort || '22'}
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
                            value={formData.sshUser || ''}
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
                                    className="flex-1 px-3 py-2 rounded border font-semibold text-xs cursor-pointer transition-all"
                                    style={{
                                        background: formData.sshAuthType === val ? '#6366f122' : THEME.surfaceHover,
                                        border: `1px solid ${formData.sshAuthType === val ? '#6366f166' : THEME.glassBorder}`,
                                        color: formData.sshAuthType === val ? '#818cf8' : THEME.textMuted,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Private Key fields */}
                    {formData.sshAuthType === 'key' && (
                        <>
                            <div>
                                <label style={S.label}>Private Key (PEM) *</label>
                                <textarea
                                    value={formData.sshPrivateKey || ''}
                                    onChange={e => setFormData(p => ({ ...p, sshPrivateKey: e.target.value }))}
                                    placeholder={'-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----'}
                                    rows={5}
                                    style={{
                                        ...S.input(!formData.sshPrivateKey && formData.sshEnabled),
                                        resize: 'vertical',
                                        lineHeight: 1.4,
                                        fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                        fontSize: 11,
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                                />
                                <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>
                                    Paste the contents of your <code style={{ fontFamily: 'monospace' }}>~/.ssh/id_rsa</code> or <code style={{ fontFamily: 'monospace' }}>id_ed25519</code> file
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>
                                    Key Passphrase <span style={{ color: THEME.textMuted, fontSize: 10, textTransform: 'none' }}>
                                        (optional)
                                    </span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassphrase ? 'text' : 'password'}
                                        value={formData.sshPassphrase || ''}
                                        onChange={e => setFormData(p => ({ ...p, sshPassphrase: e.target.value }))}
                                        placeholder="Leave blank if key has no passphrase"
                                        style={{ ...S.input(false), paddingRight: 42 }}
                                        onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                        onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                                    />
                                    <button type="button" onClick={() => setShowPassphrase(p => !p)}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: THEME.textMuted,
                                            cursor: 'pointer',
                                            padding: 4
                                        }}>
                                        {showPassphrase ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Password auth field */}
                    {formData.sshAuthType === 'password' && (
                        <div>
                            <label style={S.label}>SSH Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showSshPass ? 'text' : 'password'}
                                    value={formData.sshPassword || ''}
                                    onChange={e => setFormData(p => ({ ...p, sshPassword: e.target.value }))}
                                    placeholder="••••••••"
                                    style={{ ...S.input(!formData.sshPassword && formData.sshEnabled), paddingRight: 42 }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = THEME.glassBorder}
                                />
                                <button type="button" onClick={() => setShowSshPass(p => !p)}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: THEME.textMuted,
                                        cursor: 'pointer',
                                        padding: 4
                                    }}>
                                    {showSshPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONNECTION POOL / MANAGEMENT TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const ConnectionPoolTab: React.FC = () => {
    useAdaptiveTheme();
    const [connections, setConnections] = useState<DBConnection[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingConnection, setEditingConnection] = useState<DBConnection | null>(null);
    const [testingConnection, setTestingConnection] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>(defaultFormData());
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [errorMsg, setErrorMsg] = useState('');
    const [switchingId, setSwitchingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

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
            }
        } catch (e: any) {
            console.error('Network error fetching connections:', e.message);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const dbMeta = DB_TYPES[formData.dbType];
        const fields = dbMeta.fields.filter(f => FIELD_META[f].type !== 'checkbox');

        if (!formData.name.trim()) errors.name = 'Name is required';

        fields.forEach(f => {
            const meta = FIELD_META[f];
            if (meta.optional || meta.type === 'checkbox') return;
            if (f === 'password' && editingConnection) return;
            const val = (formData as any)[f];
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
            const token = getAuthToken();
            const encryptedData = await encryptConnectionFields(API_BASE, token!, formData);

            const url = editingConnection
                ? `${API_BASE}/api/connections/${editingConnection.id}`
                : `${API_BASE}/api/connections`;
            const res = await fetch(url, {
                method: editingConnection ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(encryptedData),
            });
            if (res.ok) {
                const result = await res.json() as SaveResult;
                await fetchConnections();
                refreshCtxConnections();

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
                } catch { }
                setErrorMsg(msg);
            }
        } catch (e: any) {
            setErrorMsg(`Network error: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const deleteConnection = async (id: string) => {
        if (!confirm('Delete this connection?')) return;
        try {
            const wasDefault = connections.find(c => c.id === id)?.isDefault;
            const remaining = connections.filter(c => c.id !== id);

            const res = await fetch(`${API_BASE}/api/connections/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });

            if (res.ok) {
                if (wasDefault && remaining.length > 0) {
                    await fetch(`${API_BASE}/api/connections/${remaining[0].id}/default`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${getAuthToken()}` },
                    });
                }
                fetchConnections();
                refreshCtxConnections();
            } else {
                const text = await res.text();
                let msg = 'Failed to delete';
                try { msg = JSON.parse(text).error || msg; } catch { }
                alert(msg);
            }
        } catch (e: any) {
            alert(`Network error: ${e.message}`);
        }
    };

    const testConnection = async (conn: DBConnection) => {
        setTestingConnection(conn.id);
        try {
            const res = await fetch(`${API_BASE}/api/connections/${conn.id}/test`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const text = await res.text();
            let r = {} as TestResult;
            try { r = JSON.parse(text); } catch { }
            alert(r.success ? '✅ Connection successful!' : `❌ Failed: ${r.error || text || res.statusText}`);
        } catch (e: any) {
            alert(`Network error: ${e.message}`);
        } finally {
            setTestingConnection(null);
        }
    };

    const setDefaultConnection = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/connections/${id}/default`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
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

    const openEdit = (conn: DBConnection) => {
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

    const handleDbTypeChange = (type: string) => {
        setFormData(prev => ({
            ...defaultFormData(type),
            name: prev.name,
        }));
        setFormErrors({});
        setErrorMsg('');
    };

    useEffect(() => {
        if (!saveSuccess) return;
        const t = setTimeout(() => setSaveSuccess(''), 6000);
        return () => clearTimeout(t);
    }, [saveSuccess]);

    return (
        <div style={S.root(THEME.bg, THEME.textMain)}>
            {/* ── Success / Error Toast ── */}
            {saveSuccess && (
                <div className="fixed top-5 right-5 z-600 px-4.5 py-3 rounded-3xl max-w-md"
                    style={{
                        background: saveSuccess.includes('failed') ? `${THEME.danger}12` : `${THEME.success}12`,
                        border: `1px solid ${saveSuccess.includes('failed') ? THEME.danger : THEME.success}30`,
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 28px rgba(0,0,0,.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        animation: 'fadeUp .3s ease',
                        cursor: 'pointer',
                    }}
                    onClick={() => setSaveSuccess('')}>
                    {saveSuccess.includes('failed')
                        ? <AlertCircle size={16} color={THEME.danger} />
                        : <ShieldCheck size={16} color={THEME.success} />
                    }
                    <span className="text-xs font-semibold" style={{ color: THEME.textMain }}>
                        {saveSuccess}
                    </span>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-7">
                <div>
                    <h2 className="text-2xl font-black m-0 tracking-tight"
                        style={{ color: THEME.textMain }}>
                        Database Connections
                    </h2>
                    <p className="text-xs font-medium mt-1" style={{ color: THEME.textMuted }}>
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
            <div className="grid grid-cols-fill-320 gap-3.5">
                {connections.map(conn => {
                    const dbMeta = DB_TYPES[conn.dbType] || DB_TYPES.postgresql;
                    return (
                        <div key={conn.id} style={S.card(dbMeta.accent)}>
                            <div style={{
                                position: 'absolute',
                                top: -40,
                                left: -40,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: `${dbMeta.accent}08`,
                                pointerEvents: 'none',
                            }} />

                            <div className="flex justify-between items-start mb-3.5">
                                <div className="flex items-center gap-2.5">
                                    <span style={{ fontSize: 24 }}>{dbMeta.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base font-bold" style={{ color: THEME.textMain }}>
                                                {conn.name}
                                            </span>
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
                                        <div className="text-xs mt-0.5" style={{ color: THEME.textMuted }}>
                                            <span style={{ color: dbMeta.accent }}>{dbMeta.label}</span>
                                            {conn.host && ` · ${conn.host}${conn.port ? `:${conn.port}` : ''}`}
                                            {conn.authSource && ` · auth:${conn.authSource}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded bg-opacity-50 mb-3.5 text-xs"
                                style={{ background: THEME.surfaceHover }}>
                                {conn.database && (
                                    <div className="flex justify-between mb-1">
                                        <span style={{ color: THEME.textMuted }}>database</span>
                                        <span style={{ color: THEME.textDim }}>{conn.database}</span>
                                    </div>
                                )}
                                {conn.username && (
                                    <div className="flex justify-between mb-1">
                                        <span style={{ color: THEME.textMuted }}>user</span>
                                        <span style={{ color: THEME.textDim }}>{conn.username}</span>
                                    </div>
                                )}
                                {conn.replicaSet && (
                                    <div className="flex justify-between mb-1">
                                        <span style={{ color: THEME.textMuted }}>replica set</span>
                                        <span style={{ color: THEME.textDim }}>{conn.replicaSet}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span style={{ color: THEME.textMuted }}>ssl</span>
                                    <span style={{ color: conn.ssl ? '#4ade80' : '#374151' }}>
                                        {conn.ssl ? 'on' : 'off'}
                                    </span>
                                </div>
                                {conn.sshEnabled && conn.sshHost && (
                                    <div className="flex justify-between mt-1">
                                        <span style={{ color: THEME.textMuted }}>tunnel via</span>
                                        <span style={{ color: '#818cf8', fontSize: 10 }}>
                                            {conn.sshUser ? `${conn.sshUser}@` : ''}{conn.sshHost}:{conn.sshPort || 22}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {conn.lastTested && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3.5 border text-xs font-semibold"
                                    style={{
                                        background: conn.status === 'success' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                                        border: `1px solid ${conn.status === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)'}`,
                                    }}>
                                    {conn.status === 'success'
                                        ? <CheckCircle size={13} color="#4ade80" />
                                        : <AlertCircle size={13} color="#ef4444" />
                                    }
                                    <span style={{
                                        color: conn.status === 'success' ? '#4ade80' : '#ef4444'
                                    }}>
                                        {conn.status === 'success' ? 'Last test passed' : 'Last test failed'}
                                    </span>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => testConnection(conn)}
                                    disabled={testingConnection === conn.id}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border font-bold text-xs transition-all"
                                    style={{
                                        ...S.btn('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.25)', '#818cf8'),
                                        opacity: testingConnection === conn.id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => testingConnection !== conn.id && (e.currentTarget.style.background = 'rgba(99,102,241,0.22)')}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                                >
                                    {testingConnection === conn.id
                                        ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
                                        : <><LinkIcon size={12} /> Test</>
                                    }
                                </button>

                                {!conn.isDefault && (
                                    <button
                                        onClick={() => setDefaultConnection(conn.id)}
                                        className="px-3 py-1.5 rounded border font-bold text-xs transition-all"
                                        style={S.btn('rgba(74,222,128,0.1)', 'rgba(74,222,128,0.25)', '#4ade80')}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
                                        title="Set as default"
                                    >
                                        <Check size={12} />
                                    </button>
                                )}

                                <button
                                    onClick={async () => {
                                        if (conn.id === activeConnectionId) return;
                                        setSwitchingId(conn.id);
                                        try {
                                            await switchConnection(conn.id);
                                            await fetchConnections();
                                        } catch (e: any) {
                                            alert('Switch failed: ' + e.message);
                                        } finally {
                                            setSwitchingId(null);
                                        }
                                    }}
                                    disabled={conn.id === activeConnectionId || switchingId === conn.id}
                                    className="px-3 py-1.5 rounded border font-bold text-xs transition-all"
                                    style={{
                                        ...S.btn(
                                            conn.id === activeConnectionId ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.08)',
                                            'rgba(56,189,248,0.3)',
                                            '#38bdf8'
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

                                <button
                                    onClick={() => openEdit(conn)}
                                    className="px-3 py-1.5 rounded border font-bold text-xs transition-all"
                                    style={S.btn('rgba(251,191,36,0.1)', 'rgba(251,191,36,0.3)', '#fbbf24')}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                                    title="Edit connection"
                                >
                                    <Edit size={12} />
                                </button>

                                <button
                                    onClick={() => deleteConnection(conn.id)}
                                    className="px-3 py-1.5 rounded border font-bold text-xs transition-all"
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
                    <div className="col-span-full text-center py-15 rounded border border-dashed"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.glassBorder,
                        }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: THEME.textMain }}>
                            No connections yet
                        </h3>
                        <p className="text-xs mb-5" style={{ color: THEME.textMuted }}>
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

            {/* ── Modal ── */}
            {showModal && (
                <>
                    <div onClick={closeModal} style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 999,
                    }} />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 580,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: THEME.surface,
                        border: `1px solid ${THEME.glassBorder}`,
                        borderTop: `2px solid ${DB_TYPES[formData.dbType].accent}66`,
                        borderRadius: 14,
                        padding: 30,
                        zIndex: 1000,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
                        fontFamily: FONT_UI,
                    }}>
                        {/* Modal header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black m-0" style={{ color: THEME.textMain }}>
                                {editingConnection ? '✏️ Edit Connection' : '🔌 New Connection'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 rounded-lg hover:bg-opacity-20 transition-colors"
                                style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = THEME.textMuted; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4.5">
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
                                {formErrors.name && (
                                    <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                                        {formErrors.name}
                                    </div>
                                )}
                            </div>

                            <DynamicFields
                                dbType={formData.dbType}
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                showPassword={showPassword}
                                togglePasswordVisibility={() => setShowPassword(p => !p)}
                            />

                            <SSHTunnelSection formData={formData} setFormData={setFormData} />

                            {!editingConnection && (
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault || false}
                                        onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                                    />
                                    <label htmlFor="isDefault" className="text-xs cursor-pointer"
                                        style={{
                                            ...S.label,
                                            margin: 0,
                                            textTransform: 'none',
                                            fontSize: 13,
                                            color: THEME.textDim
                                        }}>
                                        Set as default connection
                                    </label>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-lg border"
                                    style={{
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                    }}>
                                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span className="text-xs leading-relaxed" style={{ color: '#ef4444' }}>
                                        {errorMsg}
                                    </span>
                                    <button
                                        onClick={() => setErrorMsg('')}
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: 0,
                                            flexShrink: 0
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-2.5 mt-7 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-3.5 py-2.5 rounded border font-semibold text-xs"
                                style={S.btn(THEME.surface, THEME.glassBorder, THEME.textMuted)}
                                onMouseEnter={e => e.currentTarget.style.background = THEME.surfaceHover}
                                onMouseLeave={e => e.currentTarget.style.background = THEME.surface}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveConnection}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded border font-semibold text-xs"
                                style={{
                                    ...S.btn(THEME.primary + '33', THEME.primary + '73', THEME.primary),
                                    opacity: saving ? 0.7 : 1,
                                    cursor: saving ? 'wait' : 'pointer',
                                }}
                                onMouseEnter={e => !saving && (e.currentTarget.style.background = THEME.primary + '52')}
                                onMouseLeave={e => !saving && (e.currentTarget.style.background = THEME.primary + '33')}
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        Encrypting & Saving...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        {editingConnection ? 'Update' : 'Encrypt & Save'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default ConnectionPoolTab;
