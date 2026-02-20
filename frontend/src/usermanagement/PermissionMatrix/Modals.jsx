import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { T } from '../constants/theme.js';
import { ROLES, DEPARTMENTS, LOCATIONS, RESOURCE_ROWS, DEFAULT_PERMISSIONS, PERM_COLORS } from '../constants/index.js';
import { validateUserForm, generatePassword, passwordStrength, copyToClipboard } from '../helpers/index.js';
import { Ico, RiskRing, RoleBadge, StatusBadge, MfaBadge, LoginHeatmap, FormField, Toggle } from '../shared/components/ui.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
   STRICT OVERLAY & INPUT STYLES (Defeats global CSS conflicts)
   ───────────────────────────────────────────────────────────────────────────── */
const OverlayWrapper = ({ children, onClose }) => {
    // Lock the body scroll when the modal is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalStyle; };
    }, []);

    // Portal directly to the body with maximum z-index
    return createPortal(
        <div onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(4, 5, 10, 0.85)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            zIndex: 2147483647, // Maximum possible z-index
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'umFadeIn 0.2s ease', margin: 0, padding: 0
        }}>
            {children}
        </div>,
        document.body
    );
};

const strictInputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${T.border || '#2a2a3e'}`,
    backgroundColor: T.surfaceHigh || '#1a1a2e', // Forces dark background
    color: T.text || '#e2e4eb',                 // Forces light text
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    appearance: 'none'
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
        <OverlayWrapper onClose={onClose}>
            <div className="um-drawer" onClick={e => e.stopPropagation()} style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 480, maxWidth: '100vw',
                background: T.surface || '#120A1F', borderLeft: `1px solid ${T.border || '#1A0E2B'}`,
                display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 60px rgba(0,0,0,0.55)'
            }}>
                <div style={{ padding: 24, borderBottom: `1px solid ${T.border}`, background: `linear-gradient(to bottom, ${T.surfaceHigh}, ${T.surface})` }}>
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
                                </div>
                            </div>
                        </div>
                        <button className="um-btn um-btn-ghost um-btn-icon" onClick={onClose}><Ico name="x" size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="um-btn um-btn-ghost" style={{ flex: 1 }} onClick={() => onEdit(user)}><Ico name="edit" size={14} /> Edit</button>
                        <button className="um-btn um-btn-ghost" style={{ flex: 1 }} onClick={() => onResetPassword(user)}><Ico name="key" size={14} /> Password</button>
                    </div>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, paddingLeft: 8 }}>
                    {['overview'].map(t => (
                        <button key={t} className={`um-tab${drawerTab === t ? ' active' : ''}`} onClick={() => setDrawerTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="um-scroll" style={{ flex: 1, padding: 24 }}>
                    {/* Drawer Content - Minified for brevity to match form focus */}
                    <div className="um-grid-2">
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Department</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>{user.department}</div>
                        </div>
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Location</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>{user.location}</div>
                        </div>
                    </div>
                </div>
            </div>
        </OverlayWrapper>
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
        password:   '',
        role:       user?.role       || 'viewer',
        department: user?.department || DEPARTMENTS[0],
        location:   user?.location   || LOCATIONS[0],
        mfa:        user?.mfa        ?? true,
        status:     user?.status     || 'active',
        apiAccess:  user?.apiAccess  || false,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [tab, setTab]       = useState('info');

    const patch = (key, value) => {
        setForm(f => ({ ...f, [key]: value }));
        setErrors(e => ({ ...e, [key]: undefined }));
    };

    const handleSave = async () => {
        const errs = validateUserForm(form, isEdit);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setSaving(true);
        try { await onSave({ ...form, id: user?.id }); }
        finally { setSaving(false); }
    };

    return (
        <OverlayWrapper onClose={onCancel}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: 720, maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                background: T.surface || '#120A1F', border: `1px solid ${T.border || '#1A0E2B'}`,
                borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.65)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{isEdit ? 'Edit User' : 'Create New User'}</div>
                    <button className="um-btn um-btn-ghost um-btn-icon" onClick={onCancel}><Ico name="x" size={16} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, paddingLeft: 8 }}>
                    {['info', 'access', 'security'].map(t => (
                        <button key={t} className={`um-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="um-scroll" style={{ flex: 1, padding: 24 }}>
                    {tab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="um-grid-2">
                                <FormField label="Full Name" required error={errors.name}>
                                    <input placeholder="Jane Doe" value={form.name} onChange={e => patch('name', e.target.value)} style={{...strictInputStyle, borderColor: errors.name ? T.danger : strictInputStyle.border}} />
                                </FormField>
                                <FormField label="Email Address" required error={errors.email}>
                                    <input type="email" placeholder="jane@acme.io" value={form.email} onChange={e => patch('email', e.target.value)} style={{...strictInputStyle, borderColor: errors.email ? T.danger : strictInputStyle.border}} />
                                </FormField>
                            </div>
                            {!isEdit && (
                                <div className="um-grid-2">
                                    <FormField label="Username" required error={errors.username}>
                                        <input placeholder="jane.doe" value={form.username} onChange={e => patch('username', e.target.value)} style={{...strictInputStyle, borderColor: errors.username ? T.danger : strictInputStyle.border}} />
                                    </FormField>
                                    <FormField label="Password" required error={errors.password}>
                                        <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => patch('password', e.target.value)} style={{...strictInputStyle, borderColor: errors.password ? T.danger : strictInputStyle.border}} />
                                    </FormField>
                                </div>
                            )}
                            <div className="um-grid-2">
                                <FormField label="Department">
                                    <select value={form.department} onChange={e => patch('department', e.target.value)} style={{...strictInputStyle, cursor: 'pointer'}}>
                                        {DEPARTMENTS.map(d => <option key={d} value={d} style={{ background: T.surfaceHigh }}>{d}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Location">
                                    <select value={form.location} onChange={e => patch('location', e.target.value)} style={{...strictInputStyle, cursor: 'pointer'}}>
                                        {LOCATIONS.map(l => <option key={l} value={l} style={{ background: T.surfaceHigh }}>{l}</option>)}
                                    </select>
                                </FormField>
                            </div>
                        </div>
                    )}

                    {tab === 'access' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {ROLES.map(role => (
                                <button key={role.id} onClick={() => patch('role', role.id)} className="um-btn" style={{
                                    width: '100%', justifyContent: 'flex-start', padding: 16, borderRadius: 12,
                                    background: form.role === role.id ? `${role.color}12` : T.surfaceHigh,
                                    border: `1px solid ${form.role === role.id ? role.color : T.border}`,
                                    color: form.role === role.id ? role.color : T.textSub,
                                }}>
                                    <div style={{ flex: 1, textAlign: 'left' }}>{role.label}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {tab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="um-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceHigh, border: `1px solid ${T.border}`, padding: '16px 18px', borderRadius: 12 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Multi-Factor Authentication</div>
                                    <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>Require 2FA for this account</div>
                                </div>
                                <Toggle value={form.mfa} onChange={v => patch('mfa', v)} color={T.success} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10 }}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
                    <button className="um-btn um-btn-primary" onClick={handleSave} style={{ flex: 2, background: T.primary, color: '#000' }}>
                        {saving ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </div>
        </OverlayWrapper>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PASSWORD RESET MODAL
   ───────────────────────────────────────────────────────────────────────────── */
export const PasswordModal = ({ user, onClose, onConfirm }) => {
    const [pw, setPw] = useState(() => generatePassword());

    return (
        <OverlayWrapper onClose={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: 460, background: T.surface || '#120A1F',
                border: `1px solid ${T.border || '#1A0E2B'}`, borderRadius: 16, padding: 24,
                boxShadow: '0 24px 80px rgba(0,0,0,0.65)'
            }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>Reset Password</div>
                <FormField label="New Password">
                    <input type="text" value={pw} onChange={e => setPw(e.target.value)} style={{...strictInputStyle, fontFamily: '"Space Mono", monospace'}} />
                </FormField>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button className="um-btn um-btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                    <button className="um-btn um-btn-primary" onClick={() => onConfirm(user.id, pw)} style={{ flex: 1 }}>Save</button>
                </div>
            </div>
        </OverlayWrapper>
    );
};