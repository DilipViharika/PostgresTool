import React, { useState } from 'react';
import { T } from '../constants/theme.js';
import { ROLES, DEPARTMENTS, LOCATIONS, RESOURCE_ROWS, DEFAULT_PERMISSIONS, PERM_COLORS } from '../constants/index.js';
import { validateUserForm, generatePassword, passwordStrength, copyToClipboard } from '../helpers/index.js';
import { Ico, StatCard, Sparkline, RiskRing, RoleBadge, StatusBadge, TagFilter, MfaBadge, LoginHeatmap, FormField, Toggle } from '../shared/components/ui.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED STYLES (Guarantees dark theme regardless of global CSS conflicts)
   ───────────────────────────────────────────────────────────────────────────── */
const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 5000,
    background: 'rgba(4, 5, 10, 0.78)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'umFadeIn 0.2s ease'
};

const baseInputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${T.border || '#2a2a3e'}`,
    background: T.surfaceHigh || '#1a1a2e',
    color: T.text || '#e2e4eb',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s'
};


/* ─────────────────────────────────────────────────────────────────────────────
   USER DETAIL DRAWER
   ───────────────────────────────────────────────────────────────────────────── */
export const UserDrawer = ({ user, onClose, onEdit, onResetPassword }) => {
    const [drawerTab, setDrawerTab] = useState('overview');

    if (!user) return null;

    const role      = ROLES.find(r => r.id === user.role) || ROLES[4];
    const riskColor = user.riskScore > 70 ? T.danger : user.riskScore > 40 ? T.warning : T.success;

    return (
        <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label={`User details: ${user.name}`}>
            <div className="um-drawer" onClick={e => e.stopPropagation()} style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 480, maxWidth: '100vw',
                background: T.surface || '#120A1F', borderLeft: `1px solid ${T.border || '#1A0E2B'}`,
                display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 60px rgba(0,0,0,0.55)'
            }}>
                {/* ── Header ──────────────────────────────────────────────── */}
                <div style={{
                    padding: 24, borderBottom: `1px solid ${T.border}`,
                    background: `linear-gradient(to bottom, ${T.surfaceHigh}, ${T.surface})`,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: 18, flexShrink: 0,
                                background: `${role.color}20`, border: `2px solid ${role.color}50`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24, fontWeight: 800, color: role.color,
                            }}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>{user.name}</div>
                                <div style={{ fontSize: 13, color: T.textSub, marginTop: 3 }}>{user.email}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                    <RoleBadge roleId={user.role} />
                                    <StatusBadge status={user.status} />
                                    <MfaBadge enabled={user.mfa} />
                                </div>
                            </div>
                        </div>
                        <button className="um-btn um-btn-ghost um-btn-icon" onClick={onClose} aria-label="Close drawer">
                            <Ico name="x" size={16} />
                        </button>
                    </div>

                    {/* Action bar */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="um-btn um-btn-ghost" style={{ flex: 1 }} onClick={() => onEdit(user)}>
                            <Ico name="edit" size={14} /> Edit
                        </button>
                        <button className="um-btn um-btn-ghost" style={{ flex: 1 }} onClick={() => onResetPassword(user)}>
                            <Ico name="key" size={14} /> Reset Pass
                        </button>
                        <button className="um-btn um-btn-ghost" style={{ flex: 1 }}>
                            <Ico name="mail" size={14} /> Email
                        </button>
                        <button className="um-btn um-btn-danger um-btn-icon" aria-label="Revoke sessions">
                            <Ico name="logOut" size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Sub-tabs ─────────────────────────────────────────────── */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, paddingLeft: 8 }}>
                    {['overview', 'sessions', 'activity'].map(t => (
                        <button key={t} className={`um-tab${drawerTab === t ? ' active' : ''}`}
                                onClick={() => setDrawerTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Content ──────────────────────────────────────────────── */}
                <div className="um-scroll" style={{ flex: 1, padding: 24 }}>
                    {drawerTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Risk score banner */}
                            <div style={{
                                padding: 16, borderRadius: 12,
                                background: `${riskColor}0d`, border: `1px solid ${riskColor}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <RiskRing score={user.riskScore} size={56} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: riskColor }}>Security Risk Score</div>
                                        <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>
                                            {user.failedLogins} failed logins · {user.sessions} active sessions
                                        </div>
                                        {!user.mfa && <div style={{ fontSize: 11, color: T.danger, marginTop: 4 }}>⚠ MFA not enabled</div>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, color: T.textDim }}>Data Access Level</div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                        marginTop: 6,
                                        background: user.dataAccess === 'restricted' ? T.dangerDim : user.dataAccess === 'confidential' ? T.warningDim : T.successDim,
                                        color: user.dataAccess === 'restricted' ? T.danger : user.dataAccess === 'confidential' ? T.warning : T.success,
                                    }}>
                                        {user.dataAccess}
                                    </span>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="um-grid-2">
                                {[
                                    { label: 'Department',    value: user.department, icon: 'grid' },
                                    { label: 'Location',      value: user.location,   icon: 'globe' },
                                    { label: 'Created',       value: new Date(user.createdAt).toLocaleDateString(), icon: 'clock' },
                                    { label: 'Last Login',    value: new Date(user.lastLogin).toLocaleDateString(), icon: 'activity' },
                                    { label: 'API Access',    value: user.apiAccess ? 'Enabled' : 'Disabled', icon: 'key' },
                                    { label: 'Active Sessions', value: user.sessions, icon: 'phone' },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} style={{
                                        padding: '12px 14px', borderRadius: 10,
                                        background: T.surfaceHigh, border: `1px solid ${T.border}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <Ico name={icon} size={13} color={T.textDim} />
                                            <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Login heatmap */}
                            <div style={{ padding: 16, borderRadius: 12, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    28-Day Login Activity
                                </div>
                                <LoginHeatmap data={(user.loginActivity ?? []).slice(0, 28)} />
                                <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: T.textDim }}>Less</span>
                                    {[T.border, `${T.primary}44`, `${T.primary}88`, T.primary].map((c, i) => (
                                        <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                                    ))}
                                    <span style={{ fontSize: 11, color: T.textDim }}>More</span>
                                </div>
                            </div>

                            {/* Resource permissions */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Resource Permissions
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {Object.entries(DEFAULT_PERMISSIONS[user.role] || {}).map(([res, actions]) => (
                                        <div key={res} style={{
                                            padding: '5px 10px', borderRadius: 7,
                                            background: T.surfaceHigh, border: `1px solid ${T.border}`,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            <span style={{ fontSize: 12, color: T.textSub, textTransform: 'capitalize' }}>{res}</span>
                                            <div style={{ display: 'flex', gap: 3 }}>
                                                {actions.map(a => (
                                                    <span key={a} className="um-perm-chip" style={{ background: `${PERM_COLORS[a]}18`, color: PERM_COLORS[a] }}>{a}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {drawerTab === 'sessions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: 13, color: T.textDim, marginBottom: 4 }}>
                                {user.sessions} active session{user.sessions !== 1 ? 's' : ''}
                            </div>
                            {Array.from({ length: user.sessions }, (_, i) => (
                                <div key={i} style={{
                                    padding: '14px 16px', borderRadius: 10,
                                    background: T.surfaceHigh, border: `1px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 9, background: T.primaryDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Ico name="phone" size={16} color={T.primary} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Chrome on macOS</div>
                                            <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'Space Mono, monospace' }}>
                                                192.168.{i + 1}.1 · {user.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {i === 0 && (
                                            <span style={{ fontSize: 11, color: T.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, animation: 'umPulse 2s infinite', display: 'inline-block' }} />
                                                CURRENT
                                            </span>
                                        )}
                                        <button className="um-btn um-btn-danger um-btn-sm">Revoke</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {drawerTab === 'activity' && (
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>Login Timeline</div>
                            <div style={{ position: 'relative', paddingLeft: 24 }}>
                                <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 1, background: T.border }} />
                                {/* TODO: replace with real audit events for this user */}
                                {[
                                    { action: 'LOGIN_SUCCESS',   ts: '2025-02-17T14:00:00Z', detail: 'Chrome · macOS', level: 'info' },
                                    { action: 'PERM_CHANGED',    ts: '2025-02-16T09:22:00Z', detail: 'Added write:sql', level: 'warn' },
                                    { action: 'PASSWORD_RESET',  ts: '2025-02-10T18:05:00Z', detail: 'Admin initiated', level: 'warn' },
                                    { action: 'LOGIN_SUCCESS',   ts: '2025-02-05T07:44:00Z', detail: 'Firefox · Windows', level: 'info' },
                                    { action: 'LOGIN_FAILED',    ts: '2025-02-03T22:11:00Z', detail: 'Invalid credentials', level: 'critical' },
                                ].map((e, i) => (
                                    <div key={i} style={{ position: 'relative', marginBottom: 16, animation: `umFadeUp 0.3s ease ${i * 0.06}s both` }}>
                                        <div style={{
                                            position: 'absolute', left: -20, top: 4,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: e.level === 'critical' || e.level === 'warn' ? T.danger : T.success,
                                            border: `2px solid ${T.surface}`,
                                        }} />
                                        <div style={{ padding: '12px 14px', borderRadius: 10, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'Space Mono, monospace' }}>{e.action}</span>
                                                <span style={{ fontSize: 11, color: T.textDim }}>{new Date(e.ts).toLocaleString()}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: T.textDim }}>{e.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   USER FORM MODAL — create / edit
   ───────────────────────────────────────────────────────────────────────────── */
export const UserFormModal = ({ user, onSave, onCancel }) => {
    const isEdit = !!user;
    const [form, setForm] = useState({
        name:       user?.name       || '',
        email:      user?.email      || '',
        username:   user?.username   || '',
        password:   '',                          // only sent when creating (not editing)
        role:       user?.role       || 'viewer',
        department: user?.department || DEPARTMENTS[0],
        location:   user?.location   || LOCATIONS[0],
        mfa:        user?.mfa        ?? true,
        status:     user?.status     || 'active',
        apiAccess:  user?.apiAccess  || false,
    });
    const [errors, setErrors]   = useState({});
    const [saving, setSaving]   = useState(false);
    const [tab, setTab]         = useState('info');

    const patch = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSave = async () => {
        const errs = validateUserForm(form, isEdit);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setSaving(true);
        try {
            await onSave({ ...form, id: user?.id });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={overlayStyle} onClick={onCancel} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit user' : 'Create user'}>
            <div onClick={e => e.stopPropagation()}
                 style={{
                     width: '90%', maxWidth: 720, maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                     background: T.surface || '#120A1F', border: `1px solid ${T.border || '#1A0E2B'}`,
                     borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.65)', overflow: 'hidden'
                 }}>

                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: `linear-gradient(135deg, ${T.primary}08, transparent)`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: T.primaryDim, border: `1px solid ${T.primary}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ico name={isEdit ? 'edit' : 'plus'} size={18} color={T.primary} />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
                                {isEdit ? 'Edit User' : 'Create New User'}
                            </div>
                            <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>
                                {isEdit ? `Editing ${user.name}` : 'Add a new user to the system'}
                            </div>
                        </div>
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-icon" onClick={onCancel} aria-label="Close">
                        <Ico name="x" size={16} />
                    </button>
                </div>

                {/* Modal tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, paddingLeft: 8 }}>
                    {['info', 'access', 'security'].map(t => (
                        <button key={t} className={`um-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Form body */}
                <div className="um-scroll" style={{ flex: 1, padding: 24 }}>
                    {tab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="um-grid-2">
                                <FormField label="Full Name" required error={errors.name}>
                                    <input placeholder="Jane Doe"
                                           value={form.name} onChange={e => patch('name', e.target.value)}
                                           style={{ ...baseInputStyle, borderColor: errors.name ? T.danger : baseInputStyle.border }}
                                           aria-required="true" aria-invalid={!!errors.name}
                                    />
                                </FormField>
                                <FormField label="Email Address" required error={errors.email}>
                                    <input type="email" placeholder="jane@acme.io"
                                           value={form.email} onChange={e => patch('email', e.target.value)}
                                           style={{ ...baseInputStyle, borderColor: errors.email ? T.danger : baseInputStyle.border }}
                                           aria-required="true" aria-invalid={!!errors.email}
                                    />
                                </FormField>
                            </div>
                            {/* Username + Password — required for new users only */}
                            {!isEdit && (
                                <div className="um-grid-2">
                                    <FormField label="Username" required error={errors.username}>
                                        <input placeholder="jane.doe"
                                               value={form.username} onChange={e => patch('username', e.target.value)}
                                               style={{ ...baseInputStyle, fontFamily: '"Space Mono", monospace', borderColor: errors.username ? T.danger : baseInputStyle.border }}
                                               aria-required="true" aria-invalid={!!errors.username}
                                               autoComplete="username"
                                        />
                                    </FormField>
                                    <FormField label="Password" required error={errors.password}>
                                        <div style={{ position: 'relative' }}>
                                            <input type="password" placeholder="Min. 8 characters"
                                                   value={form.password} onChange={e => patch('password', e.target.value)}
                                                   style={{ ...baseInputStyle, paddingRight: 38, borderColor: errors.password ? T.danger : baseInputStyle.border }}
                                                   aria-required="true" aria-invalid={!!errors.password}
                                                   autoComplete="new-password"
                                            />
                                            <button type="button" className="um-btn um-btn-ghost um-btn-icon"
                                                    onClick={() => patch('password', generatePassword())}
                                                    style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, padding: 0 }}
                                                    aria-label="Generate password">
                                                <Ico name="refresh" size={13} />
                                            </button>
                                        </div>
                                    </FormField>
                                </div>
                            )}
                            <div className="um-grid-2">
                                <FormField label="Department">
                                    <select value={form.department} onChange={e => patch('department', e.target.value)} style={{...baseInputStyle, cursor: 'pointer'}}>
                                        {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: T.surfaceHigh }}>{d}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Location">
                                    <select value={form.location} onChange={e => patch('location', e.target.value)} style={{...baseInputStyle, cursor: 'pointer'}}>
                                        {LOCATIONS.map(l => <option key={l} value={l} style={{ background: T.surfaceHigh }}>{l}</option>)}
                                    </select>
                                </FormField>
                            </div>
                            <FormField label="Status">
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['active', 'inactive', 'suspended'].map(s => {
                                        const colors = { active: T.success, inactive: T.textDim, suspended: T.danger };
                                        const dimColors = { active: T.successDim, inactive: `${T.textDim}18`, suspended: T.dangerDim };
                                        return (
                                            <button key={s} onClick={() => patch('status', s)} className="um-btn"
                                                    aria-pressed={form.status === s}
                                                    style={{
                                                        flex: 1,
                                                        background: form.status === s ? dimColors[s] : T.surfaceHigh,
                                                        border: `1px solid ${form.status === s ? colors[s] : T.border}`,
                                                        color: form.status === s ? colors[s] : T.textDim,
                                                    }}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </FormField>
                        </div>
                    )}

                    {tab === 'access' && (
                        <div>
                            <div style={{ marginBottom: 20, fontSize: 13, color: T.textDim }}>
                                Select a role to assign default permissions. You can customize them individually on the Permissions Matrix tab.
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {ROLES.map(role => {
                                    const active = form.role === role.id;
                                    return (
                                        <button key={role.id} onClick={() => patch('role', role.id)} className="um-btn"
                                                aria-pressed={active}
                                                style={{
                                                    width: '100%', justifyContent: 'flex-start', gap: 16,
                                                    padding: 16, borderRadius: 12,
                                                    background: active ? `${role.color}12` : T.surfaceHigh,
                                                    border: `1px solid ${active ? role.color : T.border}`,
                                                    color: active ? role.color : T.textSub,
                                                }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10,
                                                background: `${role.color}20`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 20, flexShrink: 0,
                                            }}>
                                                {role.badge}
                                            </div>
                                            <div style={{ textAlign: 'left', flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700 }}>{role.label}</div>
                                                <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                                                    {role.perms} permissions · {RESOURCE_ROWS.filter(r => (DEFAULT_PERMISSIONS[role.id]?.[r] || []).length > 0).length} resources
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 160 }}>
                                                {Object.entries(DEFAULT_PERMISSIONS[role.id] || {}).slice(0, 4).map(([res, acts]) =>
                                                        acts.length > 0 && (
                                                            <span key={res} style={{
                                                                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                                                                background: `${role.color}18`, color: role.color,
                                                                fontWeight: 700, textTransform: 'uppercase',
                                                            }}>{res}</span>
                                                        )
                                                )}
                                            </div>
                                            {active && <Ico name="check" size={18} color={role.color} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="um-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceHigh, border: `1px solid ${T.border}`, padding: '16px 18px', borderRadius: 12 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Multi-Factor Authentication</div>
                                    <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>Require 2FA for this user's account</div>
                                </div>
                                <Toggle value={form.mfa} onChange={v => patch('mfa', v)} color={T.success} />
                            </div>
                            <div className="um-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceHigh, border: `1px solid ${T.border}`, padding: '16px 18px', borderRadius: 12 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>API Access</div>
                                    <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>Allow user to generate API keys</div>
                                </div>
                                <Toggle value={form.apiAccess} onChange={v => patch('apiAccess', v)} color={T.primary} />
                            </div>
                            <div className="um-card" style={{ background: T.dangerDim, border: `1px solid ${T.danger}30`, padding: '16px 18px', borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 8 }}>Danger Zone</div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="um-btn um-btn-danger um-btn-sm">Force Password Reset</button>
                                    <button className="um-btn um-btn-danger um-btn-sm">Revoke All Sessions</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, background: T.surface }}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel} style={{ flex: 1 }} disabled={saving}>
                        <Ico name="x" size={14} /> Cancel
                    </button>
                    <button className="um-btn um-btn-primary" onClick={handleSave} style={{ flex: 2, background: T.primary, color: '#000' }} disabled={saving}>
                        {saving
                            ? <><Ico name="refresh" size={14} style={{ animation: 'umSpin 1s linear infinite' }} /> Saving…</>
                            : <><Ico name="save" size={14} /> {isEdit ? 'Update User' : 'Create User'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PASSWORD RESET MODAL
   ───────────────────────────────────────────────────────────────────────────── */
export const PasswordModal = ({ user, onClose, onConfirm }) => {
    const [pw, setPw]         = useState(() => generatePassword());
    const [show, setShow]     = useState(false);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const strength = passwordStrength(pw, { success: T.success, warning: T.warning, danger: T.danger });

    const handleCopy = async () => {
        await copyToClipboard(pw);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            await onConfirm(user.id, pw);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label="Reset password">
            <div onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: 460, background: T.surface || '#120A1F',
                border: `1px solid ${T.border || '#1A0E2B'}`, borderRadius: 16,
                boxShadow: '0 24px 80px rgba(0,0,0,0.65)', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '20px 24px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: `linear-gradient(135deg, ${T.warningDim}, transparent)`,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: T.warningDim, border: `1px solid ${T.warning}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Ico name="key" size={18} color={T.warning} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Reset Password</div>
                        <div style={{ fontSize: 12, color: T.textDim }}>{user.name}</div>
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-icon" onClick={onClose} style={{ marginLeft: 'auto' }} aria-label="Close">
                        <Ico name="x" size={16} />
                    </button>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormField label="New Password">
                        <div style={{ position: 'relative' }}>
                            <input type={show ? 'text' : 'password'} value={pw}
                                   onChange={e => setPw(e.target.value)}
                                   style={{ ...baseInputStyle, paddingRight: 80, fontSize: 14, letterSpacing: show ? '0.04em' : '0.2em', fontFamily: '"Space Mono", monospace' }}
                                   aria-label="New password"
                            />
                            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                                <button className="um-btn um-btn-ghost um-btn-icon" onClick={() => setShow(v => !v)}
                                        style={{ width: 28, height: 28, padding: 0 }} aria-label={show ? 'Hide password' : 'Show password'}>
                                    <Ico name={show ? 'eyeOff' : 'eye'} size={13} />
                                </button>
                                <button className="um-btn um-btn-ghost um-btn-icon" onClick={handleCopy}
                                        style={{
                                            width: 28, height: 28, padding: 0,
                                            background: copied ? T.successDim : undefined,
                                            borderColor: copied ? `${T.success}40` : undefined,
                                        }}
                                        aria-label="Copy password">
                                    <Ico name={copied ? 'check' : 'copy'} size={13} color={copied ? T.success : undefined} />
                                </button>
                            </div>
                        </div>

                        {/* Strength bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: T.border, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 2, transition: 'all 0.3s',
                                    width: strength.label === 'Strong' ? '100%' : strength.label === 'Medium' ? '60%' : '30%',
                                    background: strength.color,
                                }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                        </div>
                    </FormField>

                    <button className="um-btn um-btn-ghost" onClick={() => setPw(generatePassword())}>
                        <Ico name="refresh" size={13} /> Generate New Password
                    </button>
                </div>

                <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, background: T.surface }}>
                    <button className="um-btn um-btn-ghost" onClick={onClose} style={{ flex: 1 }} disabled={saving}>
                        <Ico name="x" size={14} /> Cancel
                    </button>
                    <button className="um-btn" onClick={handleConfirm} disabled={saving}
                            style={{ flex: 2, background: `linear-gradient(135deg, ${T.warning}, #e08800)`, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
                        {saving
                            ? <><Ico name="refresh" size={14} style={{ animation: 'umSpin 1s linear infinite' }} /> Setting…</>
                            : <><Ico name="key" size={14} /> Set New Password</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};