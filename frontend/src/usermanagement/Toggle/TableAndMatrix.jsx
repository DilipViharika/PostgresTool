import React, { useState, useMemo, useRef } from 'react';
import { T } from '../constants/theme.js';
import { ROLES, RESOURCE_ROWS, DEFAULT_PERMISSIONS, PERM_LABELS, PERM_COLORS, DEPARTMENTS, LOCATIONS } from '../constants/index.js';
import { useDebounce, useClickOutside } from '../hooks/index.js';
import {
    Ico, StatCard, Sparkline, RiskRing, RoleBadge, StatusBadge,
    TagFilter,
} from './ui.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
   ANALYTICS HEADER — top KPI row
   ───────────────────────────────────────────────────────────────────────────── */
export const AnalyticsHeader = ({ users }) => {
    const active   = users.filter(u => u.status === 'active').length;
    const noMfa    = users.filter(u => !u.mfa).length;
    const highRisk = users.filter(u => u.riskScore > 70).length;
    const weekLogins = users.reduce(
        (s, u) => s + u.loginActivity.slice(-7).reduce((a, b) => a + b, 0),
        0
    );

    return (
        <div className="um-grid-4 um-stagger" style={{ marginBottom: 24 }}>
            <StatCard
                label="Total Users" value={users.length} sub={`${active} active`}
                icon="users" color={T.primary} trend={12}
                sparkData={Array.from({ length: 24 }, (_, i) =>
                    Math.floor(Math.sin(i / 3) * 30 + 40 + Math.random() * 20)
                )}
            />
            <StatCard
                label="No MFA Enabled" value={noMfa} sub="Security risk"
                icon="shield" color={T.warning} trend={-3}
            />
            <StatCard
                label="High Risk Users" value={highRisk} sub="Score > 70"
                icon="alert" color={T.danger} trend={highRisk > 3 ? 5 : -8}
            />
            <StatCard
                label="Weekly Logins" value={weekLogins.toLocaleString()} sub="Across all users"
                icon="activity" color={T.info}
                sparkData={Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000 + 500))}
            />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   USERS TABLE — sortable, filterable, paginated, with bulk selection
   ───────────────────────────────────────────────────────────────────────────── */
const PER_PAGE = 8;

export const UsersTable = ({ users, onSelectUser, onDeleteUsers, onEditUser }) => {
    const [rawSearch, setRawSearch]   = useState('');
    const [selected, setSelected]     = useState([]);
    const [page, setPage]             = useState(1);
    const [sort, setSort]             = useState({ key: 'name', dir: 'asc' });
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    const bulkMenuRef = useRef(null);
    useClickOutside(bulkMenuRef, () => setShowBulkMenu(false));

    const search = useDebounce(rawSearch, 250);

    const toggleSort = (key) =>
        setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        let r = users.filter(u => {
            const matchQ = !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.department.toLowerCase().includes(q);
            const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
            const matchStatus = statusFilter === 'all' || u.status === statusFilter;
            return matchQ && matchRole && matchStatus;
        });
        r.sort((a, b) => {
            let av = a[sort.key], bv = b[sort.key];
            if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            return sort.dir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0)
                : (av > bv ? -1 : av < bv ? 1 : 0);
        });
        return r;
    }, [users, search, sort, roleFilter, statusFilter]);

    const pages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const allSelected = paged.length > 0 && paged.every(u => selected.includes(u.id));

    const SortIcon = ({ k }) =>
        sort.key !== k
            ? <Ico name="sort" size={12} color={T.textDim} />
            : <Ico name={sort.dir === 'asc' ? 'arrowUp' : 'arrowDown'} size={12} color={T.primary} />;

    const cols = '40px 2.2fr 1.2fr 1fr 0.9fr 1fr 80px 44px';

    const handleBulkDelete = () => {
        onDeleteUsers(selected);
        setSelected([]);
        setShowBulkMenu(false);
    };

    return (
        <div>
            {/* ── Toolbar ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
                    <Ico name="search" size={15} color={T.textDim}
                         style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        className="um-input" placeholder="Search name, email, department…"
                        value={rawSearch} aria-label="Search users"
                        onChange={e => { setRawSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: 38 }}
                    />
                </div>

                {/* Role pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['all', ...ROLES.map(r => r.id)].map(r => (
                        <TagFilter
                            key={r} active={roleFilter === r}
                            label={r === 'all' ? 'All Roles' : ROLES.find(x => x.id === r)?.label || r}
                            onClick={() => { setRoleFilter(r); setPage(1); }}
                        />
                    ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                    {selected.length > 0 && (
                        <div style={{ position: 'relative' }} ref={bulkMenuRef}>
                            <button className="um-btn um-btn-danger" onClick={() => setShowBulkMenu(v => !v)}>
                                <Ico name="more" size={14} /> Bulk ({selected.length}) <Ico name="chevDown" size={12} />
                            </button>
                            {showBulkMenu && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                    background: T.surfaceHigh, border: `1px solid ${T.border}`,
                                    borderRadius: 10, padding: 6, zIndex: 100, minWidth: 160,
                                }}>
                                    {[
                                        { label: 'Export Selected', icon: 'download' },
                                        { label: 'Reset Passwords', icon: 'key' },
                                        { label: 'Revoke Sessions', icon: 'logOut' },
                                        { label: 'Delete Users', icon: 'trash', danger: true },
                                    ].map(item => (
                                        <button key={item.label} className="um-btn um-btn-ghost"
                                                onClick={() => { if (item.danger) handleBulkDelete(); }}
                                                style={{
                                                    width: '100%', justifyContent: 'flex-start',
                                                    borderRadius: 7, border: 'none', gap: 10,
                                                    color: item.danger ? T.danger : T.textSub,
                                                    background: 'transparent',
                                                }}>
                                            <Ico name={item.icon} size={13} color={item.danger ? T.danger : T.textDim} />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button className="um-btn um-btn-ghost">
                        <Ico name="download" size={14} /> Export
                    </button>
                    <button className="um-btn um-btn-primary" onClick={() => onEditUser(null)}>
                        <Ico name="plus" size={15} /> Add User
                    </button>
                </div>
            </div>

            {/* ── Status filter row ─────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {['all', 'active', 'inactive', 'suspended'].map(s => (
                    <TagFilter key={s} active={statusFilter === s}
                               label={s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                               onClick={() => { setStatusFilter(s); setPage(1); }} />
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: T.textDim, alignSelf: 'center' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: cols, padding: '10px 20px',
                    background: T.surfaceHigh, borderBottom: `1px solid ${T.border}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" aria-label="Select all on page"
                               style={{ width: 17, height: 17, cursor: 'pointer', accentColor: T.primary }}
                               checked={allSelected}
                               onChange={() => setSelected(allSelected ? [] : paged.map(u => u.id))}
                        />
                    </div>
                    {[['name', 'User'], ['role', 'Role'], ['status', 'Status'], ['department', 'Dept'], ['lastLogin', 'Last Login']].map(([k, label]) => (
                        <button key={k} onClick={() => toggleSort(k)}
                                aria-label={`Sort by ${label}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                                    textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', padding: 0,
                                    color: sort.key === k ? T.primary : T.textDim,
                                }}>
                            {label} <SortIcon k={k} />
                        </button>
                    ))}
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>RISK</div>
                    <div />
                </div>

                {/* Rows */}
                {paged.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: T.textDim }}>
                        <Ico name="search" size={28} color={T.textDim} style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 14 }}>No users match your filters</div>
                    </div>
                ) : paged.map(user => {
                    const roleColor = ROLES.find(r => r.id === user.role)?.color || T.primary;
                    return (
                        <div key={user.id}
                             className={`um-row${selected.includes(user.id) ? ' selected' : ''}`}
                             style={{ gridTemplateColumns: cols }}
                             onClick={() => onSelectUser(user)}
                             role="row" tabIndex={0}
                             onKeyDown={e => e.key === 'Enter' && onSelectUser(user)}
                        >
                            <div onClick={e => e.stopPropagation()}>
                                <input type="checkbox" aria-label={`Select ${user.name}`}
                                       style={{ width: 17, height: 17, cursor: 'pointer', accentColor: T.primary }}
                                       checked={selected.includes(user.id)}
                                       onChange={() => setSelected(s =>
                                           s.includes(user.id) ? s.filter(x => x !== user.id) : [...s, user.id]
                                       )}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                    background: `${roleColor}22`, border: `1px solid ${roleColor}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: roleColor,
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            <div><RoleBadge roleId={user.role} size="sm" /></div>
                            <div><StatusBadge status={user.status} /></div>
                            <div style={{ fontSize: 12, color: T.textSub }}>{user.department}</div>
                            <div style={{ fontSize: 11, color: T.textDim }}>
                                {new Date(user.lastLogin).toLocaleDateString()}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RiskRing score={user.riskScore} size={36} />
                            </div>

                            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button className="um-btn um-btn-ghost um-btn-icon"
                                        aria-label={`Edit ${user.name}`}
                                        onClick={e => { e.stopPropagation(); onEditUser(user); }}>
                                    <Ico name="edit" size={13} color={T.textDim} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0' }}>
                <div style={{ fontSize: 12, color: T.textDim }}>
                    Showing <b style={{ color: T.textSub }}>{paged.length}</b> of <b style={{ color: T.textSub }}>{filtered.length}</b> users
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="um-btn um-btn-ghost um-btn-icon" aria-label="Previous page"
                            disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            style={{ opacity: page === 1 ? 0.4 : 1 }}>
                        <Ico name="chevLeft" size={15} />
                    </button>
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                        const p = i + 1;
                        return (
                            <button key={p} className="um-btn" aria-label={`Page ${p}`}
                                    aria-current={page === p ? 'page' : undefined}
                                    onClick={() => setPage(p)}
                                    style={{
                                        minWidth: 32, padding: '5px 0',
                                        background: page === p ? T.primary : 'transparent',
                                        color: page === p ? '#fff' : T.textSub,
                                        border: `1px solid ${page === p ? T.primary : T.border}`,
                                        borderRadius: 7, fontSize: 13, fontWeight: 600,
                                    }}>
                                {p}
                            </button>
                        );
                    })}
                    <button className="um-btn um-btn-ghost um-btn-icon" aria-label="Next page"
                            disabled={page === pages || pages === 0} onClick={() => setPage(p => p + 1)}
                            style={{ opacity: (page === pages || pages === 0) ? 0.4 : 1 }}>
                        <Ico name="chevRight" size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PERMISSION MATRIX — editable role → resource → action grid
   ───────────────────────────────────────────────────────────────────────────── */
export const PermissionMatrix = () => {
    const [activeRole, setActiveRole] = useState('admin');
    const [perms, setPerms] = useState(
        () => Object.fromEntries(
            Object.entries(DEFAULT_PERMISSIONS).map(([r, v]) => [r, JSON.parse(JSON.stringify(v))])
        )
    );

    const toggle = (resource, action) => {
        setPerms(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const arr = copy[activeRole][resource] || [];
            copy[activeRole][resource] = arr.includes(action)
                ? arr.filter(a => a !== action)
                : [...arr, action];
            return copy;
        });
    };

    const currentPerms = perms[activeRole] || {};

    return (
        <div>
            {/* Role selector */}
            <div style={{
                display: 'flex', gap: 10, marginBottom: 24, padding: 16,
                background: T.surfaceHigh, borderRadius: 12, border: `1px solid ${T.border}`,
            }}>
                {ROLES.map(role => {
                    const active = activeRole === role.id;
                    return (
                        <button key={role.id} onClick={() => setActiveRole(role.id)} className="um-btn"
                                aria-pressed={active}
                                style={{
                                    flex: 1, flexDirection: 'column', gap: 6, padding: '12px 8px',
                                    background: active ? `${role.color}18` : 'transparent',
                                    border: `1px solid ${active ? role.color : T.border}`,
                                    color: active ? role.color : T.textDim,
                                    borderRadius: 10,
                                }}>
                            <div style={{ fontSize: 18 }}>{role.badge}</div>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{role.label}</div>
                            <div style={{ fontSize: 10, color: active ? role.color : T.textDim }}>{role.perms} perms</div>
                        </button>
                    );
                })}
            </div>

            {/* Matrix */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                    <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resource</th>
                        {Object.entries(PERM_LABELS).map(([k, label]) => (
                            <th key={k} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: PERM_COLORS[k], textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
                                {label}
                            </th>
                        ))}
                        <th style={{ textAlign: 'right', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coverage</th>
                    </tr>
                    </thead>
                    <tbody>
                    {RESOURCE_ROWS.map(res => {
                        const hasPerms = currentPerms[res] || [];
                        const coverage = Math.round((hasPerms.length / 4) * 100);
                        return (
                            <tr key={res} style={{ background: T.surface }}>
                                <td style={{ padding: '14px 16px', borderRadius: '9px 0 0 9px', border: `1px solid ${T.border}`, borderRight: 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Ico name="database" size={14} color={T.textDim} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, textTransform: 'capitalize' }}>{res}</span>
                                    </div>
                                </td>
                                {['r', 'w', 'd', 'a'].map(action => {
                                    const checked = hasPerms.includes(action);
                                    return (
                                        <td key={action} style={{ padding: '14px 16px', border: `1px solid ${T.border}`, borderLeft: 'none', borderRight: 'none', textAlign: 'center' }}>
                                            <button
                                                onClick={() => toggle(res, action)}
                                                aria-label={`${PERM_LABELS[action]} permission for ${res}`}
                                                aria-pressed={checked}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 7,
                                                    border: `1px solid ${checked ? PERM_COLORS[action] : T.border}`,
                                                    background: checked ? `${PERM_COLORS[action]}20` : 'transparent',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', margin: '0 auto', transition: 'all 0.15s',
                                                }}>
                                                {checked && <Ico name="check" size={13} color={PERM_COLORS[action]} />}
                                            </button>
                                        </td>
                                    );
                                })}
                                <td style={{ padding: '14px 16px', borderRadius: '0 9px 9px 0', border: `1px solid ${T.border}`, borderLeft: 'none', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                        <div style={{ width: 60, height: 4, borderRadius: 2, background: T.border, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 2, transition: 'width 0.3s',
                                                width: `${coverage}%`,
                                                background: coverage === 100 ? T.success : coverage > 50 ? T.warning : T.danger,
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: T.textDim, fontFamily: 'Space Mono, monospace', minWidth: 28, textAlign: 'right' }}>{coverage}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};