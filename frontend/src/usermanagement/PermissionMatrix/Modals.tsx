// @ts-nocheck
/**
 * Modals.tsx
 * User management modals: UserFormModal, UserDrawer, PasswordModal
 * Path: src/usermanagement/PermissionMatrix/Modals.tsx
 */

import React, {
    useState, useCallback, useEffect, useMemo, useRef, memo, FC, FormEvent, CSSProperties, ReactNode
} from 'react';
import { createPortal } from 'react-dom';

import { T } from '../constants/theme.js';
import { THEME } from '../../utils/theme.jsx';
import { ROLES, DEPARTMENTS, LOCATIONS } from '../constants/index.js';
import { generatePassword, validateUserForm } from '../helpers/index.js';
import { Ico, RoleBadge, StatusBadge, FormField, Toggle } from '../shared/components/ui.jsx';

interface User {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    department?: string;
    location?: string;
    mfaEnabled?: boolean;
    apiAccess?: boolean;
    allowedScreens?: string[];
    dataAccess?: string;
    status?: string;
}

interface FormData extends User {
    id: string | null;
}

interface Screen {
    id: string;
    label: string;
    icon: string;
}

interface ScreenCategory {
    label: string;
    color: string;
    screens: Screen[];
}

const SCREEN_CATEGORIES: ScreenCategory[] = [
  {
    label: 'Core Monitoring',
    color: '#00D4FF',
    screens: [
      { id: 'connections',  label: 'Connections',     icon: '🔌' },
      { id: 'overview',     label: 'Overview',        icon: '📊' },
      { id: 'performance',  label: 'Performance',     icon: '⚡' },
      { id: 'resources',    label: 'Resources',       icon: '💾' },
      { id: 'reliability',  label: 'Reliability',     icon: '✅' },
      { id: 'alerts',       label: 'Alerts',          icon: '🔔' },
    ],
  },
  {
    label: 'Query & Analysis',
    color: '#2AFFD4',
    screens: [
      { id: 'sql',          label: 'SQL Console',     icon: '🖥️' },
      { id: 'optimizer',    label: 'Query Optimizer', icon: '🔍' },
      { id: 'indexes',      label: 'Indexes',         icon: '📑' },
      { id: 'api',          label: 'API Tracing',     icon: '🌐' },
      { id: 'regression',   label: 'Plan Regression', icon: '📉' },
    ],
  },
];

const ROLE_SCREEN_PRESETS: Record<string, string[]> = {
  super_admin: SCREEN_CATEGORIES.flatMap(c => c.screens.map(s => s.id)),
  admin:       SCREEN_CATEGORIES.flatMap(c => c.screens.map(s => s.id)).filter(id => id !== 'UserManagement'),
  developer:   ['connections','overview','performance','sql','optimizer','indexes','api','schema','regression','bloat','replication','checkpoint','pool','repository'],
  analyst:     ['connections','overview','performance','resources','reliability','sql','optimizer','indexes','capacity','bloat','alerts'],
  viewer:      ['connections','overview','performance','resources','reliability'],
};

const DATA_ACCESS_LEVELS = [
  { id: 'public', label: 'Public', color: '#2EE89C' },
  { id: 'internal', label: 'Internal', color: '#00D4FF' },
  { id: 'confidential', label: 'Confidential', color: '#FFB520' },
  { id: 'restricted', label: 'Restricted', color: '#FF4560' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   OVERLAY WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
const OverlayWrapper = memo<{ children: ReactNode; onClose: () => void }>(({ children, onClose }) => (
  createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>,
    document.body
  )
));
OverlayWrapper.displayName = 'OverlayWrapper';

/* ═══════════════════════════════════════════════════════════════════════════
   USER FORM MODAL — Main user editing form with 4 tabs
═══════════════════════════════════════════════════════════════════════════ */
interface UserFormModalProps {
  user?: User | null;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}

export const UserFormModal: FC<UserFormModalProps> = memo(({ user, onSave, onCancel }) => {
  const [form, setForm] = useState<FormData>(() => ({
    id: user?.id || null,
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    password: user?.password || '',
    role: user?.role || 'viewer',
    department: user?.department || '',
    location: user?.location || '',
    mfaEnabled: user?.mfaEnabled ?? false,
    apiAccess: user?.apiAccess ?? false,
    allowedScreens: user?.allowedScreens ?? [],
    dataAccess: user?.dataAccess ?? 'internal',
  }));

  const [activeTab, setActiveTab] = useState<'info' | 'access' | 'screens' | 'security'>('info');
  const [showRoleDefaults, setShowRoleDefaults] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const prevRoleRef = useRef(form.role);

  const tabs = ['info', 'access', 'screens', 'security'];

  useEffect(() => {
    if (prevRoleRef.current !== form.role && activeTab === 'access') {
      setShowRoleDefaults(true);
    }
    prevRoleRef.current = form.role;
  }, [form.role, activeTab]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleScreenToggle = useCallback((screenId: string) => {
    setForm(prev => ({
      ...prev,
      allowedScreens: prev.allowedScreens?.includes(screenId)
        ? prev.allowedScreens.filter(id => id !== screenId)
        : [...(prev.allowedScreens || []), screenId],
    }));
  }, []);

  const handleApplyRoleDefaults = useCallback(() => {
    setForm(prev => ({
      ...prev,
      allowedScreens: ROLE_SCREEN_PRESETS[form.role || 'viewer'] || [],
    }));
    setShowRoleDefaults(false);
  }, [form.role]);

  const handleCategoryToggleAll = useCallback((categoryIndex: number, shouldAdd: boolean) => {
    const category = SCREEN_CATEGORIES[categoryIndex];
    const screenIds = category.screens.map(s => s.id);
    setForm(prev => {
      const current = new Set(prev.allowedScreens || []);
      if (shouldAdd) {
        screenIds.forEach(id => current.add(id));
      } else {
        screenIds.forEach(id => current.delete(id));
      }
      return { ...prev, allowedScreens: Array.from(current) };
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!form.name?.trim()) newErrors.name = 'Name is required';
    if (!form.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.username?.trim()) newErrors.username = 'Username is required';
    if (!user?.id && !form.password?.trim()) newErrors.password = 'Password required for new user';
    if (!form.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, user]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(form);
    }
  }, [form, validateForm, onSave]);

  const strictInputStyle: CSSProperties = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${T.border}`,
    background: T.surfaceHigh,
    color: T.text,
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  return (
    <OverlayWrapper onClose={onCancel}>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: '16px',
          maxWidth: '640px',
          width: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: T.text }}>
            {user?.id ? `Edit ${form.name || 'User'}` : 'New User'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: T.textDim,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${T.border}`,
          background: T.surfaceHigh,
          gap: '2px',
          padding: '8px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                background: activeTab === tab ? T.surface : 'transparent',
                color: activeTab === tab ? T.primary : T.textDim,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            {/* INFO TAB */}
            {activeTab === 'info' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <FormField label="Full Name" error={errors.name} required>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.name ? T.danger : T.border,
                    }}
                  />
                </FormField>

                <FormField label="Email" error={errors.email} required>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.email ? T.danger : T.border,
                    }}
                  />
                </FormField>

                <FormField label="Username" error={errors.username} required>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                      borderColor: errors.username ? T.danger : T.border,
                    }}
                  />
                </FormField>

                {!user?.id && (
                  <FormField label="Password" error={errors.password} required>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      style={{
                        ...strictInputStyle,
                        width: '100%',
                        borderColor: errors.password ? T.danger : T.border,
                      }}
                    />
                  </FormField>
                )}
              </div>
            )}

            {/* ACCESS TAB */}
            {activeTab === 'access' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <FormField label="Role" required>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                    }}
                  >
                    {ROLES?.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Department">
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    style={{
                      ...strictInputStyle,
                      width: '100%',
                    }}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS?.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            {/* SCREENS TAB */}
            {activeTab === 'screens' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: T.text, marginBottom: '12px' }}>
                    Allowed Screens
                  </h3>
                  {SCREEN_CATEGORIES.map((cat, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: cat.color, fontWeight: '600', marginBottom: '8px' }}>
                        {cat.label}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {cat.screens.map(screen => (
                          <label key={screen.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={(form.allowedScreens || []).includes(screen.id)}
                              onChange={() => handleScreenToggle(screen.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '12px' }}>{screen.icon} {screen.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>MFA Enabled</span>
                  <Toggle value={form.mfaEnabled || false} onChange={(val) => setForm(prev => ({ ...prev, mfaEnabled: val }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>API Access</span>
                  <Toggle value={form.apiAccess || false} onChange={(val) => setForm(prev => ({ ...prev, apiAccess: val }))} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${T.border}`,
                background: 'transparent',
                color: T.textDim,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: T.primary,
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Save User
            </button>
          </div>
        </form>
      </div>
    </OverlayWrapper>
  );
});
UserFormModal.displayName = 'UserFormModal';

/* ═══════════════════════════════════════════════════════════════════════════
   USER DRAWER
═══════════════════════════════════════════════════════════════════════════ */
interface UserDrawerProps {
  user?: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserDrawer: FC<UserDrawerProps> = memo(({ user, onClose, onEdit, onResetPassword }) => {
  if (!user) return null;
  return (
    <OverlayWrapper onClose={onClose}>
      <div style={{
        background: T.surface,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90vw',
        border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{user.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> <RoleBadge roleId={user.role} /></div>
          <div><strong>Status:</strong> <StatusBadge status={user.status || 'active'} /></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onEdit(user)} style={{ flex: 1, padding: '10px', background: T.primary, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
          <button onClick={() => onResetPassword(user)} style={{ flex: 1, padding: '10px', background: T.warning, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reset Password</button>
        </div>
      </div>
    </OverlayWrapper>
  );
});
UserDrawer.displayName = 'UserDrawer';

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD MODAL
═══════════════════════════════════════════════════════════════════════════ */
interface PasswordModalProps {
  user?: User | null;
  onConfirm: (userId: string, newPassword: string) => void;
  onClose: () => void;
}

export const PasswordModal: FC<PasswordModalProps> = memo(({ user, onConfirm, onClose }) => {
  const [newPassword, setNewPassword] = useState('');

  if (!user?.id) return null;

  return (
    <OverlayWrapper onClose={onClose}>
      <div style={{
        background: T.surface,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90vw',
        border: `1px solid ${T.border}`,
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Reset Password for {user.name}</h3>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${T.border}`,
            background: T.surfaceHigh,
            color: T.text,
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '6px', cursor: 'pointer', color: T.textDim }}>Cancel</button>
          <button onClick={() => { onConfirm(user.id!, newPassword); onClose(); }} style={{ flex: 1, padding: '10px', background: T.primary, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>
    </OverlayWrapper>
  );
});
PasswordModal.displayName = 'PasswordModal';

export default {
  UserFormModal,
  UserDrawer,
  PasswordModal,
};
