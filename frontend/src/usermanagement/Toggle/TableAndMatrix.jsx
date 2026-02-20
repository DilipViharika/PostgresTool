/**
 * TableAndMatrix.jsx
 * Redesigned UsersTable + PermissionMatrix
 * — clean horizontal table rows, refined dark aesthetic
 */

import React, { useState, useMemo, useCallback, memo } from 'react';

/* ═══════════════════════════════════════════════════════
   THEME TOKENS  (fallback values mirror the app theme)
   ═══════════════════════════════════════════════════════ */
const T = {
    bg:          '#0d0d1a',
    surface:     '#12121f',
    surfaceHigh: '#1a1a2e',
    surfaceMid:  '#16162a',
    border:      '#252538',
    borderLight: '#2e2e48',
    primary:     '#6c63ff',
    primaryGlow: '#6c63ff22',
    cyan:        '#00d4ff',
    green:       '#10b981',
    yellow:      '#f59e0b',
    red:         '#ef4444',
    purple:      '#8b5cf6',
    text:        '#e8eaf0',
    textDim:     '#9395a5',
    textMuted:   '#565870',
};

/* ═══════════════════════════════════════════════════════
   ROLE CONFIG
   ═══════════════════════════════════════════════════════ */
const ROLE_CONFIG = {
    superadmin: { label: 'Super Admin', color: '#f59e0b', bg: '#f59e0b15', icon: '👑' },
    admin:      { label: 'Admin',       color: '#6c63ff', bg: '#6c63ff18', icon: '🛡️' },
    editor:     { label: 'Editor',      color: '#00d4ff', bg: '#00d4ff12', icon: '✏️' },
    viewer:     { label: 'Viewer',      color: '#10b981', bg: '#10b98112', icon: '👁' },
    guest:      { label: 'Guest',       color: '#9395a5', bg: '#9395a515', icon: '🔗' },
};

const STATUS_CONFIG = {
    active:    { label: 'Active',    color: '#10b981', bg: '#10b98115', dot: '#10b981' },
    inactive:  { label: 'Inactive',  color: '#9395a5', bg: '#9395a515', dot: '#9395a5' },
    suspended: { label: 'Suspended', color: '#ef4444', bg: '#ef444415', dot: '#ef4444' },
};

const RISK_CONFIG = {
    low:      { label: 'Low',    color: '#10b981', bar: 25 },
    medium:   { label: 'Med',   color: '#f59e0b', bar: 55 },
    high:     { label: 'High',   color: '#ef4444', bar: 85 },
    critical: { label: 'Crit',  color: '#ff2d6b', bar: 100 },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function getInitials(name = '') {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name = '') {
    const colors = ['#6c63ff', '#00d4ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ff6b35'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return '—';
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '—';
    }
}

/* ═══════════════════════════════════════════════════════
   INLINE STYLES INJECTOR
   ═══════════════════════════════════════════════════════ */
const TableStyles = memo(() => (
    <style>{`
        .ut-root { font-family: 'Geist', 'DM Sans', system-ui, sans-serif; }

        .ut-search-wrap input {
            background: ${T.surfaceHigh};
            border: 1px solid ${T.border};
            color: ${T.text};
            border-radius: 10px;
            padding: 9px 14px 9px 38px;
            font-size: 13px;
            width: 280px;
            transition: border-color 0.2s, box-shadow 0.2s;
            font-family: inherit;
            outline: none;
        }
        .ut-search-wrap input::placeholder { color: ${T.textMuted}; }
        .ut-search-wrap input:focus {
            border-color: ${T.primary};
            box-shadow: 0 0 0 3px ${T.primaryGlow};
        }

        .ut-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 3px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 600; cursor: pointer;
            border: none; font-family: inherit; transition: all 0.15s;
            white-space: nowrap;
        }
        .ut-pill:hover { filter: brightness(1.15); }

        .ut-filter-btn {
            background: transparent; border: 1px solid ${T.border};
            color: ${T.textDim}; padding: 6px 14px; border-radius: 8px;
            font-size: 12px; font-weight: 500; cursor: pointer;
            font-family: inherit; transition: all 0.15s; white-space: nowrap;
        }
        .ut-filter-btn:hover { border-color: ${T.primary}; color: ${T.text}; }
        .ut-filter-btn.active {
            background: ${T.primaryGlow}; border-color: ${T.primary};
            color: ${T.primary}; font-weight: 600;
        }

        /* Table */
        .ut-table { width: 100%; border-collapse: collapse; }
        .ut-table thead tr {
            border-bottom: 1px solid ${T.border};
        }
        .ut-table th {
            padding: 11px 16px; text-align: left;
            font-size: 11px; font-weight: 700;
            color: ${T.textMuted}; letter-spacing: 0.06em; text-transform: uppercase;
            white-space: nowrap; user-select: none;
        }
        .ut-table th.sortable { cursor: pointer; }
        .ut-table th.sortable:hover { color: ${T.textDim}; }

        .ut-table tbody tr {
            border-bottom: 1px solid ${T.border}22;
            transition: background 0.12s;
            cursor: pointer;
        }
        .ut-table tbody tr:last-child { border-bottom: none; }
        .ut-table tbody tr:hover { background: ${T.surfaceHigh}88; }
        .ut-table tbody tr.selected { background: ${T.primaryGlow}; }

        .ut-table td { padding: 14px 16px; vertical-align: middle; }

        /* Checkbox */
        .ut-checkbox {
            width: 16px; height: 16px; border-radius: 4px;
            border: 1.5px solid ${T.border}; background: transparent;
            appearance: none; cursor: pointer; position: relative;
            transition: all 0.15s; flex-shrink: 0;
        }
        .ut-checkbox:checked {
            background: ${T.primary}; border-color: ${T.primary};
        }
        .ut-checkbox:checked::after {
            content: ''; position: absolute;
            left: 3px; top: 1px; width: 8px; height: 5px;
            border-left: 2px solid #fff; border-bottom: 2px solid #fff;
            transform: rotate(-45deg);
        }
        .ut-checkbox:focus-visible { outline: 2px solid ${T.primary}; outline-offset: 2px; }

        /* Avatar */
        .ut-avatar {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; flex-shrink: 0;
            letter-spacing: 0.02em;
        }

        /* Risk bar */
        .ut-risk-bar {
            height: 3px; border-radius: 2px;
            background: ${T.border}; overflow: hidden;
            width: 60px; margin-top: 4px;
        }
        .ut-risk-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }

        /* Action buttons */
        .ut-action-btn {
            width: 30px; height: 30px; border-radius: 8px;
            border: 1px solid ${T.border}; background: transparent;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            color: ${T.textDim}; transition: all 0.15s; font-size: 14px;
        }
        .ut-action-btn:hover { border-color: ${T.primary}; color: ${T.primary}; background: ${T.primaryGlow}; }
        .ut-action-btn.danger:hover { border-color: ${T.red}; color: ${T.red}; background: ${T.red}15; }

        /* Export / Add buttons */
        .ut-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px; border-radius: 9px; border: none;
            font-size: 12px; font-weight: 600; cursor: pointer;
            font-family: inherit; transition: all 0.15s; white-space: nowrap;
        }
        .ut-btn-ghost {
            background: transparent; color: ${T.textDim};
            border: 1px solid ${T.border};
        }
        .ut-btn-ghost:hover { background: ${T.surfaceHigh}; color: ${T.text}; border-color: ${T.borderLight}; }
        .ut-btn-primary {
            background: ${T.primary}; color: #fff;
        }
        .ut-btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 16px ${T.primary}44; }

        /* Empty state */
        @keyframes ut-fade-up {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .ut-row-animate { animation: ut-fade-up 0.2s ease-out both; }

        /* Pagination */
        .ut-page-btn {
            width: 30px; height: 30px; border-radius: 7px;
            border: 1px solid ${T.border}; background: transparent;
            color: ${T.textDim}; cursor: pointer; font-size: 12px; font-weight: 600;
            display: flex; align-items: center; justify-content: center;
            font-family: inherit; transition: all 0.15s;
        }
        .ut-page-btn:hover:not(:disabled) { border-color: ${T.primary}; color: ${T.primary}; }
        .ut-page-btn.active { background: ${T.primary}; border-color: ${T.primary}; color: #fff; }
        .ut-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    `}</style>
));

/* ═══════════════════════════════════════════════════════
   ROLE BADGE
   ═══════════════════════════════════════════════════════ */
const RoleBadge = memo(({ role }) => {
    const cfg = ROLE_CONFIG[role?.toLowerCase()] || ROLE_CONFIG.guest;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 20,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
            <span style={{ fontSize: 10 }}>{cfg.icon}</span>
            {cfg.label}
        </span>
    );
});

/* ═══════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════ */
const StatusBadge = memo(({ status }) => {
    const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.inactive;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 20,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 600,
        }}>
            <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: cfg.dot,
                boxShadow: `0 0 4px ${cfg.dot}`,
            }} />
            {cfg.label}
        </span>
    );
});

/* ═══════════════════════════════════════════════════════
   RISK CELL
   ═══════════════════════════════════════════════════════ */
const RiskCell = memo(({ risk }) => {
    if (!risk) return <span style={{ color: T.textMuted, fontSize: 12 }}>—</span>;
    const cfg = RISK_CONFIG[risk?.toLowerCase()] || { label: risk, color: T.textDim, bar: 30 };
    return (
        <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
            <div className="ut-risk-bar">
                <div className="ut-risk-fill" style={{ width: `${cfg.bar}%`, background: cfg.color }} />
            </div>
        </div>
    );
});

/* ═══════════════════════════════════════════════════════
   SORT ICON
   ═══════════════════════════════════════════════════════ */
const SortIcon = ({ active, direction }) => (
    <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, color: active ? T.primary : 'inherit', fontSize: 10 }}>
        {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
    </span>
);

/* ═══════════════════════════════════════════════════════
   USERS TABLE
   ═══════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const COLUMNS = [
    { key: 'name',       label: 'User',       sortable: true,  width: '30%' },
    { key: 'role',       label: 'Role',       sortable: true,  width: '14%' },
    { key: 'status',     label: 'Status',     sortable: true,  width: '11%' },
    { key: 'department', label: 'Dept',       sortable: true,  width: '13%' },
    { key: 'last_login', label: 'Last Login', sortable: true,  width: '13%' },
    { key: 'risk',       label: 'Risk',       sortable: false, width: '10%' },
    { key: '_actions',   label: '',           sortable: false, width: '9%'  },
];

export const UsersTable = memo(({ users = [], onSelectUser, onEditUser, onDeleteUsers }) => {
    const [search, setSearch]           = useState('');
    const [roleFilter, setRoleFilter]   = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortKey, setSortKey]         = useState('name');
    const [sortDir, setSortDir]         = useState('asc');
    const [selected, setSelected]       = useState(new Set());
    const [page, setPage]               = useState(1);

    /* ── Filtering + sorting ── */
    const filtered = useMemo(() => {
        let list = [...users];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.department || '').toLowerCase().includes(q)
            );
        }
        if (roleFilter !== 'all') list = list.filter(u => u.role?.toLowerCase() === roleFilter);
        if (statusFilter !== 'all') list = list.filter(u => u.status?.toLowerCase() === statusFilter);

        list.sort((a, b) => {
            const av = (a[sortKey] || '').toString().toLowerCase();
            const bv = (b[sortKey] || '').toString().toLowerCase();
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
    }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSort = useCallback((key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    }, [sortKey]);

    const toggleSelect = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        if (selected.size === paginated.length) setSelected(new Set());
        else setSelected(new Set(paginated.map(u => u.id)));
    }, [selected.size, paginated]);

    const allSelected = paginated.length > 0 && selected.size === paginated.length;

    /* ── Action handlers ── */
    const handleEdit   = (e, u) => { e.stopPropagation(); onEditUser?.(u); };
    const handleDelete = (e, u) => { e.stopPropagation(); onDeleteUsers?.(u.id); };

    /* ── Roles for filter pills ── */
    const availableRoles = useMemo(() => {
        const roles = [...new Set(users.map(u => u.role?.toLowerCase()).filter(Boolean))];
        return roles;
    }, [users]);

    return (
        <div className="ut-root">
            <TableStyles />

            {/* ── Toolbar ─────────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                flexWrap: 'wrap', marginBottom: 16,
            }}>
                {/* Search */}
                <div className="ut-search-wrap" style={{ position: 'relative' }}>
                    <svg style={{
                        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                        color: T.textMuted, pointerEvents: 'none',
                    }} width={14} height={14} viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        id="um-search-input"
                        type="text"
                        placeholder="Search name, email, dept…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        aria-label="Search users"
                    />
                </div>

                {/* Role filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                        className={`ut-filter-btn${roleFilter === 'all' ? ' active' : ''}`}
                        onClick={() => { setRoleFilter('all'); setPage(1); }}>
                        All Roles
                    </button>
                    {['superadmin', 'admin', 'editor', 'viewer', 'guest']
                        .filter(r => availableRoles.includes(r) || availableRoles.length === 0)
                        .map(r => {
                            const cfg = ROLE_CONFIG[r];
                            return (
                                <button
                                    key={r}
                                    className={`ut-filter-btn${roleFilter === r ? ' active' : ''}`}
                                    onClick={() => { setRoleFilter(r); setPage(1); }}
                                    style={roleFilter === r ? {
                                        borderColor: cfg.color,
                                        color: cfg.color,
                                        background: cfg.bg,
                                    } : {}}>
                                    {cfg.label}
                                </button>
                            );
                        })}
                </div>

                {/* Status filters */}
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
                    {['all', 'active', 'inactive', 'suspended'].map(s => (
                        <button
                            key={s}
                            className={`ut-filter-btn${statusFilter === s ? ' active' : ''}`}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            style={statusFilter === s && s !== 'all' ? {
                                borderColor: STATUS_CONFIG[s]?.color,
                                color: STATUS_CONFIG[s]?.color,
                                background: STATUS_CONFIG[s]?.bg,
                            } : {}}>
                            {s === 'all' ? 'All Status' : STATUS_CONFIG[s]?.label}
                        </button>
                    ))}
                </div>

                {/* Export + Add */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="ut-btn ut-btn-ghost">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export
                    </button>
                    <button className="ut-btn ut-btn-primary" onClick={() => onEditUser?.(null)}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

            {/* ── Results count ───────────────────────────────────── */}
            <div style={{
                fontSize: 12, color: T.textMuted, marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                {selected.size > 0 && (
                    <span style={{ color: T.primary, fontWeight: 600 }}>
                        {selected.size} selected
                        <button
                            onClick={() => onDeleteUsers?.([...selected])}
                            style={{
                                marginLeft: 12, fontSize: 11, fontWeight: 600,
                                color: T.red, background: `${T.red}15`,
                                border: `1px solid ${T.red}40`, borderRadius: 6,
                                padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                            Delete selected
                        </button>
                    </span>
                )}
            </div>

            {/* ── Table ───────────────────────────────────────────── */}
            <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 12, overflow: 'hidden',
            }}>
                <table className="ut-table">
                    <colgroup>
                        <col style={{ width: 44 }} />
                        {COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}
                    </colgroup>
                    <thead>
                    <tr style={{ background: T.surfaceMid }}>
                        <th style={{ padding: '11px 16px', width: 44 }}>
                            <input
                                type="checkbox"
                                className="ut-checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                aria-label="Select all"
                            />
                        </th>
                        {COLUMNS.map(col => (
                            <th
                                key={col.key}
                                className={col.sortable ? 'sortable' : ''}
                                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                aria-sort={col.sortable && sortKey === col.key
                                    ? (sortDir === 'asc' ? 'ascending' : 'descending')
                                    : undefined}
                            >
                                {col.label}
                                {col.sortable && (
                                    <SortIcon active={sortKey === col.key} direction={sortDir} />
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={COLUMNS.length + 1} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <div style={{ color: T.textMuted, fontSize: 13 }}>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                                    No users found{search ? ` matching "${search}"` : ''}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginated.map((user, i) => {
                            const isSelected = selected.has(user.id);
                            const avatarColor = getAvatarColor(user.name);
                            return (
                                <tr
                                    key={user.id ?? i}
                                    className={`ut-row-animate${isSelected ? ' selected' : ''}`}
                                    style={{ animationDelay: `${i * 30}ms` }}
                                    onClick={() => onSelectUser?.(user)}
                                >
                                    {/* Checkbox */}
                                    <td style={{ padding: '14px 16px' }}
                                        onClick={e => { e.stopPropagation(); toggleSelect(user.id); }}>
                                        <input
                                            type="checkbox"
                                            className="ut-checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(user.id)}
                                            aria-label={`Select ${user.name}`}
                                        />
                                    </td>

                                    {/* User */}
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div
                                                className="ut-avatar"
                                                style={{ background: `${avatarColor}25`, color: avatarColor }}
                                            >
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 600, color: T.text,
                                                    letterSpacing: '-0.01em',
                                                }}>
                                                    {user.name || '—'}
                                                </div>
                                                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                                                    {user.email || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td><RoleBadge role={user.role} /></td>

                                    {/* Status */}
                                    <td><StatusBadge status={user.status} /></td>

                                    {/* Department */}
                                    <td style={{ fontSize: 12, color: T.textDim }}>
                                        {user.department || '—'}
                                    </td>

                                    {/* Last Login */}
                                    <td style={{
                                        fontSize: 12, color: T.textDim,
                                        fontFamily: '"SF Mono", "Fira Code", monospace',
                                    }}>
                                        {formatDate(user.last_login)}
                                    </td>

                                    {/* Risk */}
                                    <td><RiskCell risk={user.risk} /></td>

                                    {/* Actions */}
                                    <td onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                className="ut-action-btn"
                                                onClick={(e) => handleEdit(e, user)}
                                                title="Edit user"
                                                aria-label={`Edit ${user.name}`}
                                            >
                                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="ut-action-btn danger"
                                                onClick={(e) => handleDelete(e, user)}
                                                title="Delete user"
                                                aria-label={`Delete ${user.name}`}
                                            >
                                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 14, padding: '0 2px',
                }}>
                    <span style={{ fontSize: 12, color: T.textMuted }}>
                        Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="ut-page-btn" onClick={() => setPage(p => p - 1)}
                                disabled={page === 1} aria-label="Previous page">‹</button>
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                            const p = i + 1;
                            return (
                                <button key={p} className={`ut-page-btn${page === p ? ' active' : ''}`}
                                        onClick={() => setPage(p)}>{p}</button>
                            );
                        })}
                        {totalPages > 5 && <span style={{ color: T.textMuted, fontSize: 12 }}>…</span>}
                        <button className="ut-page-btn" onClick={() => setPage(p => p + 1)}
                                disabled={page === totalPages} aria-label="Next page">›</button>
                    </div>
                </div>
            )}

            {/* Single page pagination line */}
            {totalPages === 1 && filtered.length > 0 && (
                <div style={{ marginTop: 14, fontSize: 12, color: T.textMuted }}>
                    Showing {filtered.length} of {filtered.length} users
                </div>
            )}
        </div>
    );
});
UsersTable.displayName = 'UsersTable';


/* ═══════════════════════════════════════════════════════
   PERMISSION MATRIX  (placeholder — unchanged)
   ═══════════════════════════════════════════════════════ */
export const PermissionMatrix = memo(() => {
    const roles   = ['Super Admin', 'Admin', 'Editor', 'Viewer', 'Guest'];
    const actions = ['View', 'Create', 'Edit', 'Delete', 'Export', 'Admin'];

    const matrix = {
        'Super Admin': [true,  true,  true,  true,  true,  true ],
        'Admin':       [true,  true,  true,  true,  true,  false],
        'Editor':      [true,  true,  true,  false, false, false],
        'Viewer':      [true,  false, false, false, true,  false],
        'Guest':       [true,  false, false, false, false, false],
    };

    return (
        <div style={{ fontFamily: 'inherit' }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Permission Matrix</div>
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>
                    Role-based access control across all system actions
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                    <thead>
                    <tr>
                        <th style={{
                            padding: '10px 16px', textAlign: 'left',
                            fontSize: 11, fontWeight: 700, color: T.textMuted,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            borderBottom: `1px solid ${T.border}`,
                        }}>Role</th>
                        {actions.map(a => (
                            <th key={a} style={{
                                padding: '10px 16px', textAlign: 'center',
                                fontSize: 11, fontWeight: 700, color: T.textMuted,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                borderBottom: `1px solid ${T.border}`,
                            }}>{a}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map((role, ri) => (
                        <tr key={role} style={{
                            borderBottom: ri < roles.length - 1 ? `1px solid ${T.border}22` : 'none',
                        }}>
                            <td style={{ padding: '14px 16px' }}>
                                <RoleBadge role={role.toLowerCase().replace(' ', '')} />
                            </td>
                            {matrix[role].map((allowed, ai) => (
                                <td key={ai} style={{ padding: '14px 16px', textAlign: 'center' }}>
                                    {allowed ? (
                                        <span style={{
                                            width: 22, height: 22, borderRadius: 6,
                                            background: `${T.green}20`, color: T.green,
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700,
                                        }}>✓</span>
                                    ) : (
                                        <span style={{
                                            width: 22, height: 22, borderRadius: 6,
                                            background: T.border + '40', color: T.textMuted,
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11,
                                        }}>—</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
PermissionMatrix.displayName = 'PermissionMatrix';