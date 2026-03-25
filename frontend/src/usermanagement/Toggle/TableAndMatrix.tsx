// @ts-nocheck
/**
 * TableAndMatrix.tsx - FULL REPLACEMENT
 * Path: src/usermanagement/Toggle/TableAndMatrix.tsx
 */

import React, { useState, useMemo, useCallback, memo, FC, CSSProperties } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';

const T = {
    get surface()     { return THEME.surface; },
    get surfaceHigh() { return THEME.surfaceRaised; },
    get surfaceMid()  { return THEME.surfaceHover; },
    get border()      { return THEME.grid; },
    get primary()     { return THEME.primary; },
    get primaryGlow() { return THEME.primaryFaint; },
    get green()       { return THEME.success; },
    get yellow()      { return THEME.warning; },
    get red()         { return THEME.danger; },
    get text()        { return THEME.textMain; },
    get textDim()     { return THEME.textMuted; },
    get textMuted()   { return THEME.textDim; },
};

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    superadmin: { label: 'Super Admin', color: '#f59e0b', bg: '#f59e0b18', icon: 'SA' },
    admin:      { label: 'Admin',       color: '#6c63ff', bg: '#6c63ff1a', icon: 'AD' },
    editor:     { label: 'Editor',      color: '#00d4ff', bg: '#00d4ff14', icon: 'ED' },
    viewer:     { label: 'Viewer',      color: '#10b981', bg: '#10b98114', icon: 'VW' },
    guest:      { label: 'Guest',       color: '#9395a5', bg: '#9395a518', icon: 'GS' },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    active:    { label: 'Active',    color: '#10b981', bg: '#10b98116', dot: '#10b981' },
    inactive:  { label: 'Inactive',  color: '#9395a5', bg: '#9395a516', dot: '#9395a5' },
    suspended: { label: 'Suspended', color: '#ef4444', bg: '#ef444416', dot: '#ef4444' },
};

const RISK_CFG: Record<string, { label: string; color: string; pct: number }> = {
    low:      { label: 'Low',  color: '#10b981', pct: 25 },
    medium:   { label: 'Med',  color: '#f59e0b', pct: 55 },
    high:     { label: 'High', color: '#ef4444', pct: 82 },
    critical: { label: 'Crit', color: '#ff2d6b', pct: 100 },
};

const getInitials = (n: string): string => {
    if (!n) return '?';
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (n: string): string => {
    const p = ['#6c63ff','#00d4ff','#10b981','#f59e0b','#8b5cf6','#ec4899','#ff6b35'];
    let h = 0;
    const str = n || '';
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return p[Math.abs(h) % p.length];
};

const formatDate = (raw: string | null): string => {
    if (!raw) return '--';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '--';
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return m + 'm ago';
    const h = Math.floor(diff / 3600000);
    if (h < 24) return h + 'h ago';
    const dy = Math.floor(diff / 86400000);
    if (dy < 7) return dy + 'd ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

const STYLE_ID = 'ut2-styles-v3';
function ensureStyles() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(STYLE_ID);
    if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        document.head.appendChild(el);
    }
    el.textContent = [
        '.ut2{font-family:' + THEME.fontBody + ';color:' + T.text + '}',
        '.ut2 *,.ut2 *::before,.ut2 *::after{box-sizing:border-box}',

        '.ut2-search{position:relative;display:inline-flex;align-items:center}',
        '.ut2-search input{width:270px;padding:8px 12px 8px 36px;background:' + T.surfaceHigh + ';border:1px solid ' + T.border + ';border-radius:9px;color:' + T.text + ';font-size:13px;font-family:inherit;outline:none;transition:border-color .18s,box-shadow .18s}',
        '.ut2-search input::placeholder{color:' + T.textMuted + '}',
        '.ut2-search input:focus{border-color:' + T.primary + ';box-shadow:0 0 0 3px ' + T.primaryGlow + '}',
        '.ut2-sico{position:absolute;left:10px;pointer-events:none}',

        '.ut2-pill{padding:5px 13px;border-radius:20px;border:1px solid ' + T.border + ';background:transparent;color:' + T.textDim + ';font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s}',
        '.ut2-pill:hover{border-color:#2e2e48;color:' + T.text + '}',
        '.ut2-pill.on{font-weight:700}',

        '.ut2-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap}',
        '.ut2-btn-g{background:transparent;color:' + T.textDim + ';border:1px solid ' + T.border + '}',
        '.ut2-btn-g:hover{background:' + T.surfaceHigh + ';color:' + T.text + '}',
        '.ut2-btn-p{background:' + T.primary + ';color:#fff}',
        '.ut2-btn-p:hover{filter:brightness(1.12);transform:translateY(-1px)}',

        '.ut2-tbl{width:100%;border-collapse:collapse;table-layout:fixed}',
        '.ut2-tbl thead tr{background:' + T.surfaceMid + ';border-bottom:1px solid ' + T.border + '}',
        '.ut2-tbl th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:' + T.textMuted + ';letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;user-select:none}',
        '.ut2-tbl th.s{cursor:pointer}',
        '.ut2-tbl th.s:hover{color:' + T.textDim + '}',
        '.ut2-tbl tbody tr{border-bottom:1px solid ' + T.border + '33;transition:background .1s;cursor:pointer}',
        '.ut2-tbl tbody tr:last-child{border-bottom:none}',
        '.ut2-tbl tbody tr:hover{background:' + T.surfaceHigh + '66}',
        '.ut2-tbl tbody tr.sel{background:' + T.primaryGlow + '}',
        '.ut2-tbl td{padding:13px 14px;vertical-align:middle}',

        '.ut2-cb{width:15px;height:15px;border-radius:4px;border:1.5px solid ' + T.border + ';background:transparent;-webkit-appearance:none;appearance:none;cursor:pointer;position:relative;transition:all .15s;display:block}',
        '.ut2-cb:checked{background:' + T.primary + ';border-color:' + T.primary + '}',
        '.ut2-cb:checked::after{content:"";position:absolute;left:2px;top:0px;width:8px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg)}',

        '.ut2-av{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;letter-spacing:.04em}',

        '.ut2-ib{width:28px;height:28px;border-radius:7px;border:1px solid ' + T.border + ';background:transparent;color:' + T.textDim + ';cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}',
        '.ut2-ib:hover{border-color:' + T.primary + ';color:' + T.primary + ';background:' + T.primaryGlow + '}',
        '.ut2-ib.d:hover{border-color:' + T.red + ';color:' + T.red + ';background:' + T.red + '15}',

        '.ut2-rbar{height:3px;border-radius:2px;background:' + T.border + ';width:56px;margin-top:3px}',
        '.ut2-rfil{height:100%;border-radius:2px}',

        '.ut2-pg{width:28px;height:28px;border-radius:7px;border:1px solid ' + T.border + ';background:transparent;color:' + T.textDim + ';font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all .15s}',
        '.ut2-pg:hover:not(:disabled){border-color:' + T.primary + ';color:' + T.primary + '}',
        '.ut2-pg.on{background:' + T.primary + ';border-color:' + T.primary + ';color:#fff}',
        '.ut2-pg:disabled{opacity:.3;cursor:not-allowed}',

        '@keyframes ut2-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
        '.ut2-in{animation:ut2-in .18s ease-out both}',
    ].join('\n');
}

const EditSVG = () => React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
);

const TrashSVG = () => React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('polyline', { points: '3 6 5 6 21 6' }),
    React.createElement('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
);

const RoleBadge = memo<{ role: string }>(function(props) {
    const role = props.role || '';
    const key = role.toLowerCase().replace(/\s+/g, '');
    const c = ROLE_CFG[key] || ROLE_CFG.guest;
    return React.createElement('span', {
            style: {
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
                borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700,
                whiteSpace: 'nowrap'
            }
        },
        React.createElement('span', { style: { fontSize: 9, fontWeight: 900, opacity: 0.7 } }, c.icon),
        c.label
    );
});

const StatusBadge = memo<{ status: string }>(function(props) {
    const status = props.status || '';
    const c = STATUS_CFG[status.toLowerCase()] || STATUS_CFG.inactive;
    return React.createElement('span', {
            style: {
                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap'
            }
        },
        React.createElement('span', {
            style: { width: 5, height: 5, borderRadius: '50%', background: c.dot,
                boxShadow: '0 0 5px ' + c.dot, flexShrink: 0 }
        }),
        c.label
    );
});

const RiskCell = memo<{ risk: string }>(function(props) {
    useAdaptiveTheme();
    const risk = props.risk || '';
    if (!risk) return React.createElement('span', { style: { color: T.textMuted, fontSize: 12 } }, '--');
    const c = RISK_CFG[risk.toLowerCase()] || { label: risk, color: T.textDim, pct: 30 };
    return React.createElement('div', null,
        React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: c.color } }, c.label),
        React.createElement('div', { className: 'ut2-rbar' },
            React.createElement('div', { className: 'ut2-rfil', style: { width: c.pct + '%', background: c.color } })
        )
    );
});

const Pill: FC<{ label: string; active: boolean; onClick: () => void; color?: string; bg?: string }> = function(props) {
    const extraStyle = (props.active && props.color)
        ? { borderColor: props.color, color: props.color, background: props.bg || 'transparent' }
        : {};
    return React.createElement('button', {
        className: 'ut2-pill' + (props.active ? ' on' : ''),
        onClick: props.onClick,
        style: extraStyle
    }, props.label);
};

const PAGE_SIZE = 10;

const COLS = [
    { k: 'name',       label: 'User',       w: '28%' },
    { k: 'role',       label: 'Role',       w: '14%' },
    { k: 'status',     label: 'Status',     w: '12%' },
    { k: 'department', label: 'Dept',       w: '14%' },
    { k: 'last_login', label: 'Last Login', w: '13%' },
    { k: 'risk',       label: 'Risk',       w: '10%', ns: true },
    { k: '_a',         label: '',           w: '9%',  ns: true },
];

interface User {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    department?: string;
    last_login?: string;
    risk?: string;
}

interface UsersTableProps {
    users: User[];
    onSelectUser?: (user: User) => void;
    onEditUser?: (user: User | null) => void;
    onDeleteUsers?: (ids: string | string[]) => void;
}

export const UsersTable = memo<UsersTableProps>(function UsersTable(props) {
    useAdaptiveTheme();
    const users        = props.users || [];
    const onSelectUser = props.onSelectUser;
    const onEditUser   = props.onEditUser;
    const onDeleteUsers = props.onDeleteUsers;

    ensureStyles();

    const [search, setSearch]  = useState('');
    const [roleFil, setRoleFil] = useState('all');
    const [statFil, setStatFil] = useState('all');
    const [sortK, setSortK]   = useState('name');
    const [sortD, setSortD]   = useState<'asc' | 'desc'>('asc');
    const [sel, setSel]     = useState<Set<string>>(new Set());
    const [page, setPage]    = useState(1);

    const filtered = useMemo(() => {
        let list = users.slice();
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                (u.name || '').toLowerCase().indexOf(q) >= 0 ||
                (u.email || '').toLowerCase().indexOf(q) >= 0 ||
                (u.department || '').toLowerCase().indexOf(q) >= 0
            );
        }
        if (roleFil !== 'all') {
            list = list.filter(u => (u.role || '').toLowerCase().replace(/\s+/g, '') === roleFil);
        }
        if (statFil !== 'all') {
            list = list.filter(u => (u.status || '').toLowerCase() === statFil);
        }
        list.sort((a, b) => {
            const av = String(a[sortK as keyof User] || '').toLowerCase();
            const bv = String(b[sortK as keyof User] || '').toLowerCase();
            return sortD === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
    }, [users, search, roleFil, statFil, sortK, sortD]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const doSort = useCallback((k: string) => {
        if (k === sortK) setSortD(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortK(k); setSortD('asc'); }
    }, [sortK]);

    const toggleRow = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSel(prev => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id); else s.add(id);
            return s;
        });
    }, []);

    const toggleAll = () => {
        setSel(prev => prev.size === rows.length ? new Set() : new Set(rows.map(u => u.id)));
    };

    const go = (fn: () => void) => { fn(); setPage(1); };

    const roleOpts = useMemo(() => {
        const seen = new Set(users.map(u => (u.role || '').toLowerCase().replace(/\s+/g, '')));
        return ['superadmin', 'admin', 'editor', 'viewer', 'guest'].filter(r => seen.has(r) || !users.length);
    }, [users]);

    const allChecked = rows.length > 0 && sel.size === rows.length;

    return React.createElement('div', { className: 'ut2' },

        /* Toolbar */
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 } },

            /* Search */
            React.createElement('div', { className: 'ut2-search' },
                React.createElement('span', { className: 'ut2-sico' },
                    React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: T.textMuted, strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
                        React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
                        React.createElement('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
                    )
                ),
                React.createElement('input', {
                    id: 'um-search-input', type: 'text',
                    placeholder: 'Search name, email, dept...',
                    value: search,
                    onChange: (e) => go(() => setSearch(e.target.value)),
                    'aria-label': 'Search users'
                })
            ),

            /* Role pills */
            React.createElement(Pill, { label: 'All Roles', active: roleFil === 'all', onClick: () => go(() => setRoleFil('all')) }),
            roleOpts.map(r => {
                const c = ROLE_CFG[r];
                return React.createElement(Pill, { key: r, label: c.label, active: roleFil === r, color: c.color, bg: c.bg, onClick: () => go(() => setRoleFil(r)) });
            }),

            React.createElement('div', { style: { flex: 1 } }),

            /* Status pills */
            React.createElement(Pill, { label: 'All Status', active: statFil === 'all', onClick: () => go(() => setStatFil('all')) }),
            ['active', 'inactive', 'suspended'].map(s => {
                const c = STATUS_CFG[s];
                return React.createElement(Pill, { key: s, label: c.label, active: statFil === s, color: c.color, bg: c.bg, onClick: () => go(() => setStatFil(s)) });
            }),

            /* Export */
            React.createElement('button', { className: 'ut2-btn ut2-btn-g' }, 'Export'),

            /* Add User */
            React.createElement('button', {
                className: 'ut2-btn ut2-btn-p',
                onClick: () => onEditUser?.(null)
            }, '+ Add User')
        ),

        /* Meta row */
        React.createElement('div', {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10, fontSize: 12, color: T.textMuted }
            },
            React.createElement('span', null, filtered.length + ' result' + (filtered.length !== 1 ? 's' : '')),
            sel.size > 0 && React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                React.createElement('span', { style: { color: T.primary, fontWeight: 600 } }, sel.size + ' selected'),
                React.createElement('button', {
                    onClick: () => onDeleteUsers?.([...sel]),
                    style: { fontSize: 11, fontWeight: 600, color: T.red, background: T.red + '15',
                        border: '1px solid ' + T.red + '40', borderRadius: 6, padding: '2px 8px',
                        cursor: 'pointer', fontFamily: 'inherit' }
                }, 'Delete selected')
            )
        ),

        /* Table */
        React.createElement('div', {
                style: { border: '1px solid ' + T.border, borderRadius: 12, overflow: 'hidden', background: T.surface }
            },
            React.createElement('table', { className: 'ut2-tbl' },
                React.createElement('colgroup', null,
                    React.createElement('col', { style: { width: 44 } }),
                    COLS.map(c => React.createElement('col', { key: c.k, style: { width: c.w } }))
                ),
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null,
                            React.createElement('input', {
                                type: 'checkbox', className: 'ut2-cb',
                                checked: allChecked, onChange: toggleAll,
                                'aria-label': 'Select all'
                            })
                        ),
                        COLS.map(col =>
                            React.createElement('th', {
                                    key: col.k,
                                    className: col.ns ? '' : 's',
                                    onClick: col.ns ? undefined : () => doSort(col.k)
                                },
                                col.label,
                                !col.ns && React.createElement('span', {
                                    style: { marginLeft: 3, fontSize: 10,
                                        opacity: sortK === col.k ? 1 : 0.25,
                                        color: sortK === col.k ? T.primary : 'inherit' }
                                }, sortK === col.k ? (sortD === 'asc' ? ' ^' : ' v') : ' ^v')
                            )
                        )
                    )
                ),
                React.createElement('tbody', null,
                    rows.length === 0
                        ? React.createElement('tr', null,
                            React.createElement('td', { colSpan: 8, style: { textAlign: 'center', padding: '56px 20px' } },
                                React.createElement('div', { style: { color: T.textMuted, fontSize: 13 } },
                                    'No users found' + (search ? ' for "' + search + '"' : '')
                                )
                            )
                        )
                        : rows.map((u, i) => {
                            const isS = sel.has(u.id);
                            const ac  = getAvatarColor(u.name || '');
                            return React.createElement('tr', {
                                    key: u.id || ('u' + i),
                                    className: 'ut2-in' + (isS ? ' sel' : ''),
                                    style: { animationDelay: (i * 25) + 'ms' } as CSSProperties,
                                    onClick: () => onSelectUser?.(u)
                                },
                                React.createElement('td', { onClick: (e) => toggleRow(u.id, e) },
                                    React.createElement('input', {
                                        type: 'checkbox', className: 'ut2-cb',
                                        checked: isS,
                                        onChange: (e) => toggleRow(u.id, e as any),
                                        'aria-label': 'Select ' + u.name
                                    })
                                ),
                                React.createElement('td', null,
                                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' } },
                                        React.createElement('div', { className: 'ut2-av', style: { background: ac + '22', color: ac } },
                                            getInitials(u.name || '')
                                        ),
                                        React.createElement('div', { style: { overflow: 'hidden', minWidth: 0 } },
                                            React.createElement('div', {
                                                style: { fontSize: 13, fontWeight: 600, color: T.text,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                                            }, u.name || '--'),
                                            React.createElement('div', {
                                                style: { fontSize: 11, color: T.textMuted, marginTop: 1,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                                            }, u.email || '')
                                        )
                                    )
                                ),
                                React.createElement('td', null, React.createElement(RoleBadge, { role: u.role || '' })),
                                React.createElement('td', null, React.createElement(StatusBadge, { status: u.status || '' })),
                                React.createElement('td', {
                                    style: { fontSize: 12, color: T.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                                }, u.department || '--'),
                                React.createElement('td', {
                                    style: { fontSize: 12, color: T.textDim, fontFamily: THEME.fontMono, whiteSpace: 'nowrap' }
                                }, formatDate(u.last_login || null)),
                                React.createElement('td', null, React.createElement(RiskCell, { risk: u.risk || '' })),
                                React.createElement('td', { onClick: (e) => e.stopPropagation() },
                                    React.createElement('div', { style: { display: 'flex', gap: 5 } },
                                        React.createElement('button', {
                                            className: 'ut2-ib', title: 'Edit',
                                            onClick: (e) => { e.stopPropagation(); onEditUser?.(u); }
                                        }, React.createElement(EditSVG)),
                                        React.createElement('button', {
                                            className: 'ut2-ib d', title: 'Delete',
                                            onClick: (e) => { e.stopPropagation(); onDeleteUsers?.(u.id); }
                                        }, React.createElement(TrashSVG))
                                    )
                                )
                            );
                        })
                )
            )
        ),

        /* Pagination */
        React.createElement('div', {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 12, fontSize: 12, color: T.textMuted }
            },
            React.createElement('span', null,
                'Showing ' + (filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1) +
                '-' + Math.min(page * PAGE_SIZE, filtered.length) +
                ' of ' + filtered.length + ' users'
            ),
            totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: 5, alignItems: 'center' } },
                React.createElement('button', {
                    className: 'ut2-pg', disabled: page === 1,
                    onClick: () => setPage(p => p - 1)
                }, '<'),
                Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return React.createElement('button', {
                        key: p, className: 'ut2-pg' + (page === p ? ' on' : ''),
                        onClick: () => setPage(p)
                    }, p);
                }),
                totalPages > 7 && React.createElement('span', null, '...'),
                React.createElement('button', {
                    className: 'ut2-pg', disabled: page === totalPages,
                    onClick: () => setPage(p => p + 1)
                }, '>')
            )
        )
    );
});
UsersTable.displayName = 'UsersTable';

export const PermissionMatrix = memo(function PermissionMatrix() {
    useAdaptiveTheme();
    const roles   = ['superadmin', 'admin', 'editor', 'viewer', 'guest'];
    const actions = ['View', 'Create', 'Edit', 'Delete', 'Export', 'Admin'];
    const perms: Record<string, number[]> = {
        superadmin: [1, 1, 1, 1, 1, 1],
        admin:      [1, 1, 1, 1, 1, 0],
        editor:     [1, 1, 1, 0, 0, 0],
        viewer:     [1, 0, 0, 0, 1, 0],
        guest:      [1, 0, 0, 0, 0, 0],
    };

    return React.createElement('div', { style: { fontFamily: 'inherit' } },
        React.createElement('div', { style: { marginBottom: 20 } },
            React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: T.text } }, 'Permission Matrix'),
            React.createElement('div', { style: { fontSize: 12, color: T.textDim, marginTop: 3 } }, 'Role-based access control')
        ),
        React.createElement('div', {
                style: { overflowX: 'auto', border: '1px solid ' + T.border, borderRadius: 12, background: T.surface }
            },
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: 500 } },
                React.createElement('thead', null,
                    React.createElement('tr', { style: { background: T.surfaceMid, borderBottom: '1px solid ' + T.border } },
                        React.createElement('th', { style: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '.07em' } }, 'Role'),
                        actions.map(a =>
                            React.createElement('th', { key: a, style: { padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '.07em' } }, a)
                        )
                    )
                ),
                React.createElement('tbody', null,
                    roles.map((role, ri) =>
                        React.createElement('tr', {
                                key: role,
                                style: { borderBottom: ri < roles.length - 1 ? '1px solid ' + T.border + '33' : 'none' }
                            },
                            React.createElement('td', { style: { padding: '13px 16px' } }, React.createElement(RoleBadge, { role })),
                            perms[role].map((on, ai) =>
                                React.createElement('td', { key: ai, style: { padding: '13px 14px', textAlign: 'center' } },
                                    on
                                        ? React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: T.green + '1a', color: T.green, fontSize: 12, fontWeight: 700 } }, 'Y')
                                        : React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: T.border + '55', color: T.textMuted, fontSize: 11 } }, '-')
                                )
                            )
                        )
                    )
                )
            )
        )
    );
});
PermissionMatrix.displayName = 'PermissionMatrix';
