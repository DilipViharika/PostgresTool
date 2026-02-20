import React, {
    useState, useCallback, useEffect, useReducer,
    useRef, useMemo, createContext, useContext, memo,
} from 'react';
import { createPortal } from 'react-dom';

import { THEME } from '../utils/theme.jsx';
import { UsersTable, PermissionMatrix } from './Toggle/TableAndMatrix.jsx';
import { AuditLog, SecurityPanel } from './PermissionMatrix/AuditAndSecurity.jsx';
import { UserDrawer, PasswordModal } from './PermissionMatrix/Modals.jsx';

const T = THEME;
const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const TABS = Object.freeze([
    { id: 'users',    label: 'Users',       icon: '👥', shortcut: '1' },
    { id: 'matrix',   label: 'Permissions', icon: '🛡️', shortcut: '2' },
    { id: 'audit',    label: 'Audit Log',   icon: '📋', shortcut: '3' },
    { id: 'security', label: 'Security',    icon: '🔒', shortcut: '4' },
]);
const TAB_IDS = TABS.map(t => t.id);

const ICONS = {
    alert:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    refresh:  (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    plus:     (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x:        (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trash:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    pause:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    check:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    users:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shield:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    activity: (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    lock:     (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    edit:     (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    key:      (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    search:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const Ico = memo(({ name, size = 16, color = 'currentColor', style = {} }) => {
    const render = ICONS[name];
    if (!render) return null;
    return <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}>{render(size, color)}</span>;
});
Ico.displayName = 'Ico';

const MODAL = Object.freeze({
    NONE:     { type: 'NONE' },
    DRAWER:   (user)    => ({ type: 'DRAWER', user }),
    EDIT:     (user)    => ({ type: 'EDIT', user }),
    PASSWORD: (user)    => ({ type: 'PASSWORD', user }),
    CONFIRM:  (payload) => ({ type: 'CONFIRM', ...payload }),
});

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — STATE MACHINE
═══════════════════════════════════════════════════════════════════════════ */
const initialState = {
    activeTab:     'users',
    modal:         MODAL.NONE,
    prevTab:       null,
    tabHistory:    ['users'],
    bulkSelection: new Set(),
    searchQuery:   '',
    sortConfig:    { key: 'name', direction: 'asc' },
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_TAB': {
            if (state.activeTab === action.tab) return state;
            const history = [...state.tabHistory, action.tab].slice(-10);
            return { ...state, prevTab: state.activeTab, activeTab: action.tab, tabHistory: history, bulkSelection: new Set(), searchQuery: '' };
        }
        case 'OPEN_MODAL':         return { ...state, modal: action.modal };
        case 'CLOSE_MODAL':        return { ...state, modal: MODAL.NONE };
        case 'TOGGLE_BULK_SELECT': {
            const next = new Set(state.bulkSelection);
            if (next.has(action.id)) next.delete(action.id); else next.add(action.id);
            return { ...state, bulkSelection: next };
        }
        case 'SELECT_ALL_BULK':    return { ...state, bulkSelection: new Set(action.ids) };
        case 'CLEAR_BULK':         return { ...state, bulkSelection: new Set() };
        case 'SET_SEARCH':         return { ...state, searchQuery: action.query };
        case 'SET_SORT': {
            const direction = state.sortConfig.key === action.key && state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
            return { ...state, sortConfig: { key: action.key, direction } };
        }
        case 'GO_BACK': {
            const history = [...state.tabHistory];
            history.pop();
            const prev = history[history.length - 1] || 'users';
            return { ...state, activeTab: prev, prevTab: state.activeTab, tabHistory: history };
        }
        default: return state;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3 — CONTEXT
═══════════════════════════════════════════════════════════════════════════ */
const UserMgmtContext = createContext(null);
export const useUserMgmt = () => {
    const ctx = useContext(UserMgmtContext);
    if (!ctx) throw new Error('useUserMgmt must be used within <UserManagementTab>');
    return ctx;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4 — CUSTOM HOOKS
═══════════════════════════════════════════════════════════════════════════ */
function useToast() {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    return { toasts, toast };
}

function useUsers(initialUsers = []) {
    const [users, setUsers]     = useState(initialUsers);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const abortRef              = useRef(null);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('vigil_token');
        return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    }, []);

    const fetchUsers = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users`, { headers: getAuthHeaders(), signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message || 'Failed to fetch users');
        } finally { setLoading(false); }
    }, [getAuthHeaders]);

    const createUser = useCallback(async (formData) => {
        const res = await fetch(`${API_BASE}/api/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(formData) });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
        const created = await res.json();
        setUsers(prev => [...prev, created.user || created]);
        return created.user || created;
    }, [getAuthHeaders]);

    const updateUser = useCallback(async (id, formData) => {
        const prev = users;
        setUsers(u => u.map(x => x.id === id ? { ...x, ...formData } : x));
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(formData) });
            if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
            const updated = await res.json();
            setUsers(u => u.map(x => x.id === id ? (updated.user || updated) : x));
        } catch (err) { setUsers(prev); throw err; }
    }, [getAuthHeaders, users]);

    const deleteUsers = useCallback(async (ids) => {
        const prev = users;
        setUsers(u => u.filter(x => !ids.includes(x.id)));
        try {
            await Promise.all(ids.map(id =>
                fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
                    .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); })
            ));
        } catch (err) { setUsers(prev); throw err; }
    }, [getAuthHeaders, users]);

    const resetPassword = useCallback(async (userId, newPassword) => {
        const res = await fetch(`${API_BASE}/api/users/${userId}/reset-password`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ newPassword }) });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
    }, [getAuthHeaders]);

    useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);
    return { users, loading, error, fetchUsers, createUser, updateUser, deleteUsers, resetPassword };
}

function useKeyboardShortcuts(dispatch, modalType) {
    useEffect(() => {
        const handler = (e) => {
            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            if (e.key === 'Escape' && modalType !== 'NONE') { e.preventDefault(); dispatch({ type: 'CLOSE_MODAL' }); return; }
            if (isInput) return;
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') { e.preventDefault(); dispatch({ type: 'SET_TAB', tab: TAB_IDS[parseInt(e.key) - 1] }); return; }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(null) }); return; }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('um-search-input')?.focus(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [dispatch, modalType]);
}

function useFocusTrap(isActive) {
    const containerRef  = useRef(null);
    const previousFocus = useRef(null);
    useEffect(() => {
        if (!isActive) return;
        previousFocus.current = document.activeElement;
        const trap = (e) => {
            if (e.key !== 'Tab' || !containerRef.current) return;
            const focusable = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', trap);
        requestAnimationFrame(() =>
            containerRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()
        );
        return () => { document.removeEventListener('keydown', trap); previousFocus.current?.focus?.(); };
    }, [isActive]);
    return containerRef;
}

function useTabNavigation(activeTab, dispatch) {
    const tabListRef = useRef(null);
    const handleKeyDown = useCallback((e) => {
        const idx = TAB_IDS.indexOf(activeTab);
        let nextIdx = idx;
        switch (e.key) {
            case 'ArrowRight': case 'ArrowDown': e.preventDefault(); nextIdx = (idx + 1) % TAB_IDS.length; break;
            case 'ArrowLeft':  case 'ArrowUp':   e.preventDefault(); nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length; break;
            case 'Home': e.preventDefault(); nextIdx = 0; break;
            case 'End':  e.preventDefault(); nextIdx = TAB_IDS.length - 1; break;
            default: return;
        }
        dispatch({ type: 'SET_TAB', tab: TAB_IDS[nextIdx] });
        requestAnimationFrame(() => tabListRef.current?.querySelectorAll('[role="tab"]')[nextIdx]?.focus());
    }, [activeTab, dispatch]);
    return { tabListRef, handleKeyDown };
}

function useStaleWhileRevalidate(users, fetchUsers) {
    const [isRevalidating, setIsRevalidating] = useState(false);
    const hasCached = useRef(false);
    useEffect(() => { if (users.length > 0) hasCached.current = true; }, [users.length]);
    const revalidate = useCallback(async () => {
        if (hasCached.current) { setIsRevalidating(true); await fetchUsers(); setIsRevalidating(false); }
        else { await fetchUsers(); }
    }, [fetchUsers]);
    return { isRevalidating, revalidate };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ISOLATED PORTAL HOOK
   The ONLY reliable fix for "modal at the bottom":
   - Creates a <div> and appends it to <html> (documentElement), NOT body
   - This escapes any CSS transform / filter / will-change on body or app wrapper
   - The div itself is position:fixed with full viewport coverage
   - React renders modal content into this div via createPortal
═══════════════════════════════════════════════════════════════════════════ */
function useIsolatedPortal(onBackdropClick) {
    const elRef = useRef(null);

    // Create synchronously so it's available on first render
    if (!elRef.current && typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.setAttribute('data-um-modal', 'true');
        // Inline styles — cannot be overridden by any stylesheet
        div.style.cssText = [
            'position:fixed',
            'top:0', 'right:0', 'bottom:0', 'left:0',
            'z-index:2147483647',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'isolation:isolate',
            'background:rgba(4,5,10,0.85)',
            'backdrop-filter:blur(12px)',
            '-webkit-backdrop-filter:blur(12px)',
        ].join(';');
        elRef.current = div;
    }

    // Mount / unmount on documentElement to escape body transforms
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        document.documentElement.appendChild(el);
        return () => { if (el.parentNode) el.parentNode.removeChild(el); };
    }, []);

    // Click-outside to close
    useEffect(() => {
        const el = elRef.current;
        if (!el || !onBackdropClick) return;
        const handler = (e) => { if (e.target === el) onBackdropClick(); };
        el.addEventListener('click', handler);
        return () => el.removeEventListener('click', handler);
    }, [onBackdropClick]);

    return elRef.current;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5 — GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */
const GlobalStylesInjector = memo(() => (
    <style>{`
    @keyframes umSlideUp    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
    @keyframes umFade       { from { opacity:0 } to { opacity:1 } }
    @keyframes umFadeIn     { from { opacity:0 } to { opacity:1 } }
    @keyframes umSlideLeft  { from { transform:translateX(16px); opacity:0 } to { transform:translateX(0); opacity:1 } }
    @keyframes umSlideRight { from { transform:translateX(-16px); opacity:0 } to { transform:translateX(0); opacity:1 } }
    @keyframes umSpin       { to { transform:rotate(360deg) } }
    @keyframes umShimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes umPulse      { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes umBounceIn   { 0%{transform:scale(0.9);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }

    .um-root *, .um-root *::before, .um-root *::after { box-sizing: border-box; }

    .shimmer-skeleton {
      background: linear-gradient(90deg, ${T.surfaceRaised || '#1a1a2e'} 25%, ${T.grid || '#2a2a3e'} 50%, ${T.surfaceRaised || '#1a1a2e'} 75%);
      background-size: 200% 100%; animation: umShimmer 1.5s infinite ease-in-out; border-radius: 12px;
    }
    .um-revalidating-bar {
      position:absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, ${T.primary || '#00D4FF'}, transparent);
      background-size:200% 100%; animation:umShimmer 1s infinite linear; border-radius:2px; z-index:10;
    }
    .um-root :focus-visible { outline:2px solid ${T.primary || '#00D4FF'}; outline-offset:2px; border-radius:4px; }
    .um-tab-indicator {
      position:absolute; bottom:-1px; height:2px; background:${T.primary || '#00D4FF'};
      border-radius:2px 2px 0 0; transition:left .25s cubic-bezier(.16,1,.3,1), width .25s cubic-bezier(.16,1,.3,1);
    }
    .um-bulk-bar { animation: umSlideUp 0.2s cubic-bezier(.16,1,.3,1); }

    .um-btn {
      display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
      border-radius:8px; border:none; font-size:13px; font-weight:600; cursor:pointer;
      transition:all .15s ease; font-family:inherit; line-height:1;
    }
    .um-btn:disabled { opacity:.5; cursor:not-allowed; }
    .um-btn-primary  { background:${T.primary || '#00D4FF'}; color:${T.textInverse || '#07030D'}; }
    .um-btn-primary:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
    .um-btn-ghost    { background:transparent; color:${T.textDim || '#4A3A5E'}; border:1px solid ${T.grid || '#1A0E2B'}; }
    .um-btn-ghost:hover:not(:disabled) { background:${T.surfaceRaised || '#221535'}; color:${T.textMain || '#F0ECF8'}; }
    .um-btn-danger   { background:${T.danger || '#FF4560'}; color:#fff; }
    .um-btn-danger:hover:not(:disabled) { filter:brightness(1.1); }
    .um-btn-sm   { padding:5px 10px; font-size:12px; }
    .um-btn-icon { padding:6px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; }

    .um-tab {
      display:inline-flex; align-items:center; gap:6px; padding:12px 18px;
      border:none; background:transparent; color:${T.textMuted || '#9888B4'};
      font-size:13px; font-weight:500; cursor:pointer; transition:color .15s;
      font-family:inherit; position:relative;
    }
    .um-tab:hover  { color:${T.textMain || '#F0ECF8'}; }
    .um-tab.active { color:${T.primary || '#00D4FF'}; font-weight:700; }

    .um-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .um-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
    @media(max-width:900px){ .um-grid-4{ grid-template-columns:repeat(2,1fr); } }
    @media(max-width:600px){ .um-grid-4,.um-grid-2{ grid-template-columns:1fr; } }

    .um-scroll { overflow-y:auto; scrollbar-width:thin; scrollbar-color:${T.grid || '#1A0E2B'} transparent; }
    .um-scroll::-webkit-scrollbar       { width:4px; }
    .um-scroll::-webkit-scrollbar-track  { background:transparent; }
    .um-scroll::-webkit-scrollbar-thumb  { background:${T.grid || '#1A0E2B'}; border-radius:2px; }

    /* ─── INPUTS: bulletproof dark theme ─── */
    .um-input {
      display:block; width:100%; padding:10px 13px; border-radius:8px;
      border:1.5px solid ${T.grid || '#2A1A3E'} !important;
      background:${T.surfaceRaised || '#1E1133'} !important;
      background-color:${T.surfaceRaised || '#1E1133'} !important;
      color:${T.textMain || '#F0ECF8'} !important;
      -webkit-text-fill-color:${T.textMain || '#F0ECF8'} !important;
      font-size:13px; font-family:inherit; outline:none;
      transition:border-color .15s, box-shadow .15s;
      -webkit-appearance:none; appearance:none;
      color-scheme:dark; forced-color-adjust:none;
    }
    .um-input:hover  { border-color:${T.textDim || '#6B4E8A'} !important; }
    .um-input:focus  { border-color:${T.primary || '#00D4FF'} !important; box-shadow:0 0 0 3px ${T.primary || '#00D4FF'}28 !important; }
    .um-input-error  { border-color:#ef4444 !important; box-shadow:0 0 0 3px rgba(239,68,68,.18) !important; }
    .um-input::placeholder { color:${T.textDim || '#5A4070'} !important; opacity:1 !important; }
    select.um-input {
      cursor:pointer;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239888B4' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
      background-repeat:no-repeat !important; background-position:right 11px center !important; padding-right:34px !important;
    }
    select.um-input option { background:${T.surface || '#120A1F'} !important; color:${T.textMain || '#F0ECF8'} !important; }

    /* Autofill override */
    .um-root input:-webkit-autofill,
    .um-root input:-webkit-autofill:hover,
    .um-root input:-webkit-autofill:focus,
    .um-root input:-webkit-autofill:active {
      -webkit-box-shadow:0 0 0 1000px ${T.surfaceRaised || '#1E1133'} inset !important;
      -webkit-text-fill-color:${T.textMain || '#F0ECF8'} !important;
      caret-color:${T.textMain || '#F0ECF8'};
      transition:background-color 5000s ease-in-out 0s;
    }
    /* Also style inputs inside the portal (outside .um-root) */
    [data-um-modal] input, [data-um-modal] select, [data-um-modal] textarea {
      background:${T.surfaceRaised || '#1E1133'} !important;
      background-color:${T.surfaceRaised || '#1E1133'} !important;
      color:${T.textMain || '#F0ECF8'} !important;
      -webkit-text-fill-color:${T.textMain || '#F0ECF8'} !important;
      color-scheme:dark;
    }
    [data-um-modal] input:-webkit-autofill,
    [data-um-modal] input:-webkit-autofill:hover,
    [data-um-modal] input:-webkit-autofill:focus {
      -webkit-box-shadow:0 0 0 1000px ${T.surfaceRaised || '#1E1133'} inset !important;
      -webkit-text-fill-color:${T.textMain || '#F0ECF8'} !important;
      transition:background-color 5000s ease-in-out 0s;
    }

    .um-mono { font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace; letter-spacing:.02em; }
    .um-perm-chip {
      display:inline-flex; align-items:center; padding:2px 7px; border-radius:4px;
      font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
    }
    @media(prefers-reduced-motion:reduce){ *, *::before, *::after{ animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; } }
  `}</style>
));
GlobalStylesInjector.displayName = 'GlobalStylesInjector';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 6 — TOAST
═══════════════════════════════════════════════════════════════════════════ */
const ToastContainer = memo(({ toasts }) => {
    if (!toasts.length) return null;
    return createPortal(
        <div style={{ position:'fixed', top:20, right:20, zIndex:99999, display:'flex', flexDirection:'column', gap:8 }} aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding:'10px 16px', borderRadius:10, fontSize:13, fontWeight:500, color:'#fff', maxWidth:360,
                    background: t.type === 'error' ? (T.danger || '#ef4444') : (T.primary || '#6366f1'),
                    boxShadow:'0 8px 24px rgba(0,0,0,.3)', animation:'umSlideUp .2s ease-out',
                    display:'flex', alignItems:'center', gap:8,
                }}>
                    <Ico name={t.type === 'error' ? 'alert' : 'check'} size={14} color="#fff" />
                    {t.message}
                </div>
            ))}
        </div>,
        document.body
    );
});
ToastContainer.displayName = 'ToastContainer';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 7 — ERROR BOUNDARY
═══════════════════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null, errorInfo: null };
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) {
        console.error('[UserManagement] Error:', error, errorInfo);
        this.setState({ errorInfo });
    }
    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div style={{ padding:48, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }} role="alert">
                <div style={{ width:64, height:64, borderRadius:16, background:`${T.danger || '#ef4444'}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Ico name="alert" size={32} color={T.danger || '#ef4444'} />
                </div>
                <div style={{ fontSize:18, fontWeight:700, color:T.text || '#e2e4eb' }}>Something went wrong</div>
                <div style={{ fontSize:13, color:T.textDim || '#8b8fa3', maxWidth:440, lineHeight:1.6 }}>
                    {this.state.error?.message || 'An unexpected error occurred.'}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                    <button className="um-btn um-btn-ghost" onClick={() => window.location.reload()}><Ico name="refresh" size={14} /> Reload</button>
                    <button className="um-btn um-btn-primary" onClick={() => this.setState({ hasError:false, error:null, errorInfo:null })}>Try again</button>
                </div>
            </div>
        );
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 8 — MODAL PORTAL (Drawer / Password / Confirm)
═══════════════════════════════════════════════════════════════════════════ */
const ModalPortal = memo(({ children, isOpen }) => {
    if (!isOpen) return null;
    return createPortal(children, document.body);
});
ModalPortal.displayName = 'ModalPortal';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 9 — CONFIRMATION DIALOG
═══════════════════════════════════════════════════════════════════════════ */
const ConfirmDialog = memo(({ title, message, confirmLabel, variant = 'danger', onConfirm, onCancel }) => {
    const trapRef = useFocusTrap(true);
    return (
        <div
            onClick={e => e.target === e.currentTarget && onCancel()}
            style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)' }}
            role="dialog" aria-modal="true" aria-labelledby="confirm-title"
        >
            <div ref={trapRef} style={{ background:T.surface || '#12121f', border:`1px solid ${T.border || '#2a2a3e'}`, borderRadius:16, padding:'28px 32px', maxWidth:420, width:'90vw', boxShadow:'0 24px 80px rgba(0,0,0,.5)', animation:'umSlideUp .2s cubic-bezier(.16,1,.3,1)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:20 }}>
                    <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:variant === 'danger' ? `${T.danger || '#ef4444'}18` : `${T.primary || '#6366f1'}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Ico name={variant === 'danger' ? 'alert' : 'check'} size={20} color={variant === 'danger' ? (T.danger || '#ef4444') : (T.primary || '#6366f1')} />
                    </div>
                    <div>
                        <div id="confirm-title" style={{ fontSize:16, fontWeight:700, color:T.text || '#e2e4eb' }}>{title}</div>
                        <div style={{ fontSize:13, color:T.textDim || '#8b8fa3', marginTop:6, lineHeight:1.6 }}>{message}</div>
                    </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className={`um-btn ${variant === 'danger' ? 'um-btn-danger' : 'um-btn-primary'}`} onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
                </div>
            </div>
        </div>
    );
});
ConfirmDialog.displayName = 'ConfirmDialog';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 10 — TAB PANEL
═══════════════════════════════════════════════════════════════════════════ */
const TabPanel = memo(({ activeTab, prevTab, children }) => {
    const direction = prevTab ? (TAB_IDS.indexOf(activeTab) > TAB_IDS.indexOf(prevTab) ? 1 : -1) : 0;
    return (
        <div key={activeTab} role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}
             style={{ padding:24, animation: direction !== 0 ? `umFade 0.25s ease-out, umSlide${direction > 0 ? 'Left' : 'Right'} 0.25s ease-out` : 'umFade 0.2s ease-out' }}>
            {children}
        </div>
    );
});
TabPanel.displayName = 'TabPanel';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 11 — BREADCRUMB
═══════════════════════════════════════════════════════════════════════════ */
const Breadcrumb = memo(({ tabHistory, onNavigate }) => {
    if (tabHistory.length <= 1) return null;
    const uniqueTrail = [...new Map(tabHistory.map(id => [id, TABS.find(t => t.id === id)])).values()].filter(Boolean).slice(-3);
    return (
        <nav aria-label="Navigation trail" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.textMuted || '#6b6f82', marginBottom:16 }}>
            {uniqueTrail.map((tab, i) => (
                <React.Fragment key={tab.id}>
                    {i > 0 && <span style={{ opacity:.4 }}>›</span>}
                    <button onClick={() => onNavigate(tab.id)} style={{ background:'none', border:'none', cursor:'pointer', color: i === uniqueTrail.length - 1 ? (T.text || '#e2e4eb') : (T.textMuted || '#6b6f82'), fontWeight: i === uniqueTrail.length - 1 ? 600 : 400, fontSize:12, padding:'2px 4px', borderRadius:4, fontFamily:'inherit' }}>
                        {tab.label}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
});
Breadcrumb.displayName = 'Breadcrumb';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 12 — BULK ACTION BAR
═══════════════════════════════════════════════════════════════════════════ */
const BulkActionBar = memo(({ count, onDelete, onDeactivate, onClear }) => {
    if (count === 0) return null;
    return (
        <div className="um-bulk-bar" style={{ position:'sticky', bottom:24, zIndex:100, margin:'16px 0', padding:'12px 20px', background:T.surface || '#12121f', border:`1px solid ${T.border || '#2a2a3e'}`, borderRadius:14, display:'flex', alignItems:'center', gap:12, boxShadow:'0 8px 32px rgba(0,0,0,.3)' }} role="toolbar" aria-label={`Bulk actions for ${count} selected users`}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${T.primary || '#6366f1'}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:T.primary || '#6366f1' }}>{count}</div>
            <span style={{ fontSize:13, color:T.textDim || '#8b8fa3', marginRight:'auto' }}>user{count > 1 ? 's' : ''} selected</span>
            <button className="um-btn um-btn-ghost um-btn-sm" onClick={onDeactivate}><Ico name="pause" size={13} /> Deactivate</button>
            <button className="um-btn um-btn-danger um-btn-sm" onClick={onDelete}><Ico name="trash" size={13} /> Delete</button>
            <button className="um-btn um-btn-ghost um-btn-sm" onClick={onClear} aria-label="Clear selection" style={{ padding:'6px 8px' }}><Ico name="x" size={14} /></button>
        </div>
    );
});
BulkActionBar.displayName = 'BulkActionBar';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 13 — KEYBOARD SHORTCUTS OVERLAY
═══════════════════════════════════════════════════════════════════════════ */
const ShortcutHints = memo(() => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                const tag = e.target.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') setVisible(v => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
    if (!visible) return null;
    const shortcuts = [
        { keys:['Ctrl','1-4'], desc:'Switch tabs' },
        { keys:['Ctrl','N'],   desc:'New user' },
        { keys:['Ctrl','K'],   desc:'Search' },
        { keys:['Esc'],        desc:'Close modal' },
        { keys:['?'],          desc:'Toggle shortcuts' },
    ];
    return createPortal(
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:T.surface || '#12121f', border:`1px solid ${T.border || '#2a2a3e'}`, borderRadius:14, padding:'16px 20px', minWidth:240, boxShadow:'0 16px 48px rgba(0,0,0,.35)', animation:'umBounceIn .25s ease-out' }} role="complementary" aria-label="Keyboard shortcuts">
            <div style={{ fontSize:11, fontWeight:700, color:T.textDim || '#8b8fa3', marginBottom:12, textTransform:'uppercase', letterSpacing:'.05em' }}>Keyboard Shortcuts</div>
            {shortcuts.map(s => (
                <div key={s.desc} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0' }}>
                    <span style={{ fontSize:12, color:T.textDim || '#8b8fa3' }}>{s.desc}</span>
                    <div style={{ display:'flex', gap:4 }}>
                        {s.keys.map(k => <kbd key={k} style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:T.surfaceHigh || '#1a1a2e', border:`1px solid ${T.border || '#2a2a3e'}`, color:T.text || '#e2e4eb', fontFamily:'inherit', fontWeight:600 }}>{k}</kbd>)}
                    </div>
                </div>
            ))}
            <div style={{ fontSize:10, color:T.textMuted || '#6b6f82', marginTop:10, textAlign:'center' }}>
                Press <kbd style={{ fontSize:10, padding:'1px 4px', borderRadius:3, background:T.surfaceHigh || '#1a1a2e', border:`1px solid ${T.border || '#2a2a3e'}` }}>?</kbd> to dismiss
            </div>
        </div>,
        document.body
    );
});
ShortcutHints.displayName = 'ShortcutHints';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 14 — ANALYTICS HEADER
═══════════════════════════════════════════════════════════════════════════ */
const AnalyticsHeaderInline = memo(({ users }) => {
    const stats = useMemo(() => {
        const total  = users.length;
        const active = users.filter(u => u.status === 'active').length;
        const admins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
        const recent = users.filter(u => {
            if (!u.created_at) return false;
            return (new Date() - new Date(u.created_at)) < 30 * 24 * 60 * 60 * 1000;
        }).length;
        return [
            { label:'Total Users', value:total,  color:T.primary || '#6366f1' },
            { label:'Active',      value:active, color:'#22c55e' },
            { label:'Admins',      value:admins, color:'#f59e0b' },
            { label:'New (30d)',   value:recent, color:'#8b5cf6' },
        ];
    }, [users]);
    return (
        <div className="um-grid-4" style={{ marginBottom:24 }}>
            {stats.map(s => (
                <div key={s.label} style={{ padding:'18px 20px', borderRadius:14, background:T.surface || '#12121f', border:`1px solid ${T.border || '#2a2a3e'}` }}>
                    <div style={{ fontSize:11, color:T.textMuted || '#6b6f82', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:s.color, marginTop:6, letterSpacing:'-.02em' }}>{s.value}</div>
                </div>
            ))}
        </div>
    );
});
AnalyticsHeaderInline.displayName = 'AnalyticsHeaderInline';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 15 — USER FORM MODAL
   Uses useIsolatedPortal() which appends a <div> directly to <html>,
   completely bypassing any CSS transform/filter/will-change on body
   that would break position:fixed inside a regular createPortal.
═══════════════════════════════════════════════════════════════════════════ */
const UserFormModal = memo(({ user, onSave, onCancel }) => {
    const isEdit  = Boolean(user?.id);
    const trapRef = useFocusTrap(true);

    // This is the KEY fix — isolated portal on <html>, not body
    const portalEl = useIsolatedPortal(onCancel);

    const [activeSection, setActiveSection] = useState('info');
    const [saving, setSaving]               = useState(false);
    const [errors, setErrors]               = useState({});
    const [form, setForm] = useState({
        name:        user?.name        || '',
        email:       user?.email       || '',
        username:    user?.username    || '',
        password:    '',
        department:  user?.department  || 'Engineering',
        location:    user?.location    || 'San Francisco, US',
        status:      user?.status      || 'active',
        role:        user?.role        || 'viewer',
        permissions: user?.permissions || [],
    });

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => ({ ...e, [k]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim())     e.name     = 'Full name is required';
        if (!form.email.trim())    e.email    = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
        if (!form.username.trim()) e.username = 'Username is required';
        if (!isEdit && form.password.length < 8) e.password = 'Min 8 characters';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try { await onSave({ ...form, ...(isEdit ? { id: user.id } : {}) }); }
        finally { setSaving(false); }
    };

    const inputClass = (field) => ['um-input', errors[field] ? 'um-input-error' : ''].filter(Boolean).join(' ');

    const labelSx  = { display:'block', fontSize:11, fontWeight:700, color:T.textMuted || '#9888B4', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 };
    const fieldSx  = { marginBottom:18 };
    const errorSx  = { fontSize:11, color:'#ef4444', marginTop:5, display:'flex', alignItems:'center', gap:4 };
    const SECTIONS = ['Info', 'Access', 'Security'];

    const STATUS_CONFIG = [
        { key:'active',    color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
        { key:'inactive',  color:T.textMuted || '#9888B4', bg:'rgba(152,136,180,0.12)' },
        { key:'suspended', color:'#ef4444', bg:'rgba(239,68,68,0.12)' },
    ];

    if (!portalEl) return null;

    return createPortal(
        <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ufm-title"
            style={{
                background: T.surface || '#120A1F',
                border: `1px solid ${T.grid || '#1A0E2B'}`,
                borderRadius: 16,
                width: 540,
                maxWidth: '95vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 32px 96px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)',
                animation: 'umSlideUp .28s cubic-bezier(.16,1,.3,1)',
                overflow: 'hidden',
            }}
        >
            {/* ── Header ── */}
            <div style={{ padding:'22px 26px 0', borderBottom:`1px solid ${T.grid || '#1A0E2B'}`, flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Ico name="users" size={20} color={T.primary || '#00D4FF'} />
                        </div>
                        <div>
                            <h2 id="ufm-title" style={{ margin:0, fontSize:17, fontWeight:800, color:T.textMain || '#F0ECF8', letterSpacing:'-.02em' }}>
                                {isEdit ? 'Edit User' : 'Create New User'}
                            </h2>
                            <p style={{ margin:0, fontSize:12, color:T.textMuted || '#9888B4', marginTop:3 }}>
                                {isEdit ? `Editing ${user.name}` : 'Add a new user to the system'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} aria-label="Close" style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${T.grid || '#2a1a3e'}`, borderRadius:8, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.textMuted || '#9888B4', transition:'all .15s', flexShrink:0 }}>
                        <Ico name="x" size={16} color="currentColor" />
                    </button>
                </div>

                {/* Section tabs */}
                <div style={{ display:'flex', gap:2 }}>
                    {SECTIONS.map(s => {
                        const active = activeSection === s.toLowerCase();
                        return (
                            <button key={s} onClick={() => setActiveSection(s.toLowerCase())} style={{ background:'none', border:'none', borderBottom: active ? `2px solid ${T.primary || '#00D4FF'}` : '2px solid transparent', color: active ? (T.primary || '#00D4FF') : (T.textMuted || '#9888B4'), fontWeight: active ? 700 : 500, fontSize:13, padding:'9px 16px', cursor:'pointer', fontFamily:'inherit', transition:'all .15s', marginBottom:-1 }}>
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="um-scroll" style={{ flex:1, overflowY:'auto', padding:'24px 26px' }}>

                {/* INFO */}
                {activeSection === 'info' && (
                    <>
                        <div style={fieldSx}>
                            <label style={labelSx}>Full Name <span style={{ color:'#ef4444' }}>*</span></label>
                            <input className={inputClass('name')} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" autoFocus autoComplete="off" />
                            {errors.name && <span style={errorSx}><Ico name="alert" size={11} color="#ef4444" />{errors.name}</span>}
                        </div>

                        <div style={fieldSx}>
                            <label style={labelSx}>Email Address <span style={{ color:'#ef4444' }}>*</span></label>
                            <input type="email" className={inputClass('email')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.io" autoComplete="off" />
                            {errors.email && <span style={errorSx}><Ico name="alert" size={11} color="#ef4444" />{errors.email}</span>}
                        </div>

                        <div style={fieldSx}>
                            <label style={labelSx}>Username <span style={{ color:'#ef4444' }}>*</span></label>
                            <input className={`${inputClass('username')} um-mono`} value={form.username} onChange={e => set('username', e.target.value)} placeholder="jane.doe" autoComplete="off" />
                            {errors.username && <span style={errorSx}><Ico name="alert" size={11} color="#ef4444" />{errors.username}</span>}
                        </div>

                        {!isEdit && (
                            <div style={fieldSx}>
                                <label style={labelSx}>Password <span style={{ color:'#ef4444' }}>*</span></label>
                                <input type="password" className={inputClass('password')} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
                                {errors.password && <span style={errorSx}><Ico name="alert" size={11} color="#ef4444" />{errors.password}</span>}
                            </div>
                        )}

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
                            <div>
                                <label style={labelSx}>Department</label>
                                <select className="um-input" value={form.department} onChange={e => set('department', e.target.value)}>
                                    {['Engineering','Product','Design','Marketing','Sales','Operations','Finance','HR'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelSx}>Location</label>
                                <select className="um-input" value={form.location} onChange={e => set('location', e.target.value)}>
                                    {['San Francisco, US','New York, US','London, UK','Berlin, DE','Singapore, SG','Remote'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={fieldSx}>
                            <label style={labelSx}>Status</label>
                            <div style={{ display:'flex', gap:8 }}>
                                {STATUS_CONFIG.map(({ key, color, bg }) => (
                                    <button key={key} type="button" onClick={() => set('status', key)} style={{ flex:1, padding:'10px 0', borderRadius:9, border: form.status === key ? `1.5px solid ${color}` : `1.5px solid ${T.grid || '#1A0E2B'}`, background: form.status === key ? bg : (T.surfaceRaised || '#221535'), color: form.status === key ? color : (T.textDim || '#6b6f82'), fontSize:12, fontWeight: form.status === key ? 700 : 500, cursor:'pointer', textTransform:'capitalize', transition:'all .15s', fontFamily:'inherit', boxShadow: form.status === key ? `0 0 0 3px ${color}18` : 'none' }}>
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ACCESS */}
                {activeSection === 'access' && (
                    <>
                        <div style={fieldSx}>
                            <label style={labelSx}>Role</label>
                            <select className="um-input" value={form.role} onChange={e => set('role', e.target.value)}>
                                {['viewer','editor','admin','superadmin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                            </select>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                            {[
                                { role:'viewer',     desc:'Read-only access',           color:'#6b7280' },
                                { role:'editor',     desc:'Create and edit content',     color:'#3b82f6' },
                                { role:'admin',      desc:'Full access except billing',  color:'#f59e0b' },
                                { role:'superadmin', desc:'Unrestricted system access',  color:'#ef4444' },
                            ].map(r => (
                                <div key={r.role} onClick={() => set('role', r.role)} style={{ padding:'12px 14px', borderRadius:10, cursor:'pointer', border: form.role === r.role ? `1.5px solid ${r.color}` : `1.5px solid ${T.grid || '#1A0E2B'}`, background: form.role === r.role ? `${r.color}12` : (T.surfaceRaised || '#1E1133'), transition:'all .15s' }}>
                                    <div style={{ fontSize:12, fontWeight:700, color: form.role === r.role ? r.color : (T.textMain || '#F0ECF8'), textTransform:'capitalize', marginBottom:3 }}>{r.role}</div>
                                    <div style={{ fontSize:11, color:T.textMuted || '#9888B4', lineHeight:1.4 }}>{r.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize:12, color:T.textMuted || '#9888B4', background:T.surfaceRaised || '#1E1133', borderRadius:10, padding:'13px 15px', border:`1px solid ${T.grid || '#1A0E2B'}`, lineHeight:1.6 }}>
                            💡 Fine-grained permissions available in the <strong style={{ color:T.textMain || '#F0ECF8' }}>Permissions Matrix</strong> tab.
                        </div>
                    </>
                )}

                {/* SECURITY */}
                {activeSection === 'security' && (
                    <>
                        {isEdit && (
                            <div style={fieldSx}>
                                <label style={labelSx}>Reset Password</label>
                                <input type="password" className="um-input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Leave blank to keep current" autoComplete="new-password" />
                            </div>
                        )}
                        <div style={{ fontSize:12, color:T.textMuted || '#9888B4', background:T.surfaceRaised || '#1E1133', borderRadius:10, padding:'13px 15px', border:`1px solid ${T.grid || '#1A0E2B'}`, lineHeight:1.6 }}>
                            🔒 Two-factor authentication and session management available in the <strong style={{ color:T.textMain || '#F0ECF8' }}>Security</strong> tab.
                        </div>
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div style={{ padding:'16px 26px', borderTop:`1px solid ${T.grid || '#1A0E2B'}`, display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0, background:T.surface || '#120A1F' }}>
                <button className="um-btn um-btn-ghost" onClick={onCancel} disabled={saving}><Ico name="x" size={14} /> Cancel</button>
                <button className="um-btn um-btn-primary" onClick={handleSubmit} disabled={saving}>
                    {saving
                        ? <><Ico name="refresh" size={14} style={{ animation:'umSpin 1s linear infinite' }} /> Saving…</>
                        : <><Ico name={isEdit ? 'edit' : 'plus'} size={14} color={T.textInverse || '#07030D'} /> {isEdit ? 'Save Changes' : 'Create User'}</>
                    }
                </button>
            </div>
        </div>,
        portalEl
    );
});
UserFormModal.displayName = 'UserFormModal';

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 16 — WIRED COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
const UsersTableComponent       = UsersTable;
const PermissionMatrixComponent = PermissionMatrix;
const AuditLogComponent         = AuditLog;
const SecurityPanelComponent    = SecurityPanel;
const UserDrawerComponent       = UserDrawer;
const UserFormModalComponent    = UserFormModal;
const PasswordModalComponent    = PasswordModal;

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 17 — ROOT COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const UserManagementTab = ({ initialUsers = [], enableShortcuts = true }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activeTab, prevTab, modal, bulkSelection, tabHistory } = state;
    const { toasts, toast }    = useToast();
    const { users, loading, error, fetchUsers, createUser, updateUser, deleteUsers, resetPassword } = useUsers(initialUsers);
    const { isRevalidating, revalidate } = useStaleWhileRevalidate(users, fetchUsers);
    const { tabListRef, handleKeyDown: tabKeyDown } = useTabNavigation(activeTab, dispatch);
    useKeyboardShortcuts(dispatch, modal.type);

    const tabRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left:0, width:0 });
    useEffect(() => {
        const el = tabRefs.current[activeTab];
        if (el) {
            const parent = el.parentElement;
            setIndicatorStyle({ left: el.offsetLeft - (parent?.offsetLeft || 0), width: el.offsetWidth });
        }
    }, [activeTab]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (initialUsers.length === 0) fetchUsers(); }, []);

    const activeCount  = useMemo(() => users.filter(u => u.status === 'active').length, [users]);
    const bulkCount    = bulkSelection.size;
    const contextValue = useMemo(() => ({ state, dispatch, users, toast }), [state, users, toast]);

    const handleSaveUser = useCallback(async (formData) => {
        try {
            if (formData.id) { await updateUser(formData.id, formData); toast(`${formData.name} updated successfully`); }
            else { const created = await createUser(formData); toast(`${created?.name ?? formData.name} created successfully`); }
            dispatch({ type: 'CLOSE_MODAL' });
        } catch (err) { toast(err.message || 'Save failed', 'error'); }
    }, [updateUser, createUser, toast]);

    const handleBulkDelete = useCallback(() => {
        dispatch({ type:'OPEN_MODAL', modal: MODAL.CONFIRM({
                title: `Delete ${bulkCount} user${bulkCount > 1 ? 's' : ''} ?`,
                message: 'This action cannot be undone. All associated data, sessions, and permissions will be permanently removed.',
                confirmLabel: `Delete ${bulkCount} user${bulkCount > 1 ? 's' : ''}`,
                variant: 'danger',
                onConfirm: async () => {
                    try { await deleteUsers([...bulkSelection]); toast(`${bulkCount} user${bulkCount > 1 ? 's' : ''} deleted`); dispatch({ type:'CLEAR_BULK' }); dispatch({ type:'CLOSE_MODAL' }); }
                    catch (err) { toast(err.message || 'Delete failed', 'error'); }
                },
            }) });
    }, [bulkCount, bulkSelection, deleteUsers, toast]);

    const handleDeleteUsers = useCallback(async (ids) => {
        const arr = Array.isArray(ids) ? ids : [ids];
        const count = arr.length;
        dispatch({ type:'OPEN_MODAL', modal: MODAL.CONFIRM({
                title: `Delete ${count} user${count > 1 ? 's' : ''} ?`,
                message: 'This action cannot be undone.',
                confirmLabel: 'Delete',
                variant: 'danger',
                onConfirm: async () => {
                    try { await deleteUsers(arr); toast(`${count} user${count > 1 ? 's' : ''} removed`); dispatch({ type:'CLOSE_MODAL' }); }
                    catch (err) { toast(err.message || 'Delete failed', 'error'); }
                },
            }) });
    }, [deleteUsers, toast]);

    const handleResetPassword = useCallback(async (userId, newPassword) => {
        try { await resetPassword(userId, newPassword); toast('Password updated successfully'); dispatch({ type:'CLOSE_MODAL' }); }
        catch (err) { toast(err.message || 'Password reset failed', 'error'); }
    }, [resetPassword, toast]);

    return (
        <UserMgmtContext.Provider value={contextValue}>
            <div className="um-root" style={{ padding:'28px 28px 48px', position:'relative' }}>
                <GlobalStylesInjector />
                <ToastContainer toasts={toasts} />

                {isRevalidating && <div className="um-revalidating-bar" />}

                {/* Page header */}
                <header style={{ marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
                    <div>
                        <h1 style={{ fontSize:26, fontWeight:900, color:T.text || '#e2e4eb', letterSpacing:'-.03em', margin:0, display:'flex', alignItems:'center', gap:10 }}>
                            User Management
                            {isRevalidating && <span style={{ fontSize:10, fontWeight:600, color:T.primary || '#00D4FF', padding:'3px 8px', background:`${T.primary || '#00D4FF'}15`, borderRadius:6, animation:'umPulse 1.5s infinite' }}>Syncing</span>}
                        </h1>
                        <div style={{ fontSize:13, color:T.textDim || '#8b8fa3', marginTop:4 }}>Manage access, permissions, and security across your organization</div>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                        <div style={{ fontSize:12, color:T.textDim || '#8b8fa3', fontFamily:'SF Mono, Fira Code, monospace', padding:'6px 12px', background:T.surfaceHigh || '#1a1a2e', borderRadius:8, border:`1px solid ${T.border || '#2a2a3e'}`, display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background: activeCount > 0 ? '#22c55e' : (T.textMuted || '#6b6f82'), display:'inline-block' }} />
                            {users.length} users · {activeCount} active
                        </div>
                        <button className="um-btn um-btn-ghost" onClick={revalidate} disabled={loading || isRevalidating} aria-label="Refresh">
                            <Ico name="refresh" size={14} style={loading ? { animation:'umSpin 1s linear infinite' } : {}} />
                            {loading || isRevalidating ? 'Loading' : 'Refresh'}
                        </button>
                        <button className="um-btn um-btn-primary" onClick={() => dispatch({ type:'OPEN_MODAL', modal:MODAL.EDIT(null) })}>
                            <Ico name="plus" size={15} color="#fff" /> New User
                            <kbd style={{ fontSize:9, padding:'1px 5px', marginLeft:4, borderRadius:4, background:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.7)' }}>N</kbd>
                        </button>
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <div role="alert" style={{ marginBottom:20, padding:'14px 18px', borderRadius:12, background:`${T.danger || '#ef4444'}08`, border:`1px solid ${T.danger || '#ef4444'}30`, display:'flex', alignItems:'center', gap:12, color:T.danger || '#ef4444', animation:'umSlideUp .2s ease-out' }}>
                        <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:`${T.danger || '#ef4444'}15`, display:'flex', alignItems:'center', justifyContent:'center' }}><Ico name="alert" size={16} color={T.danger || '#ef4444'} /></div>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600 }}>Failed to load users</div>
                            <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>{error}</div>
                        </div>
                        <button className="um-btn um-btn-danger um-btn-sm" onClick={revalidate}><Ico name="refresh" size={12} color="#fff" /> Retry</button>
                    </div>
                )}

                {!loading && users.length > 0 && <AnalyticsHeaderInline users={users} />}

                {loading && users.length === 0 && (
                    <div className="um-grid-4" style={{ marginBottom:24 }}>
                        {[...Array(4)].map((_, i) => <div key={i} className="shimmer-skeleton" style={{ height:120, animationDelay:`${i * .1}s` }} />)}
                    </div>
                )}

                <Breadcrumb tabHistory={tabHistory} onNavigate={tab => dispatch({ type:'SET_TAB', tab })} />

                {/* Main tab card */}
                <div style={{ background:T.surface || '#12121f', border:`1px solid ${T.border || '#2a2a3e'}`, borderRadius:16, overflow:'visible', position:'relative' }}>
                    <div ref={tabListRef} role="tablist" aria-label="User management sections" onKeyDown={tabKeyDown}
                         style={{ display:'flex', borderBottom:`1px solid ${T.border || '#2a2a3e'}`, paddingLeft:8, background:T.surfaceHigh || '#1a1a2e', borderRadius:'16px 16px 0 0', position:'relative' }}>
                        {TABS.map(t => (
                            <button key={t.id} ref={el => { tabRefs.current[t.id] = el; }} id={`tab-${t.id}`} role="tab"
                                    aria-selected={activeTab === t.id} aria-controls={`tabpanel-${t.id}`}
                                    tabIndex={activeTab === t.id ? 0 : -1}
                                    className={`um-tab${activeTab === t.id ? ' active' : ''}`}
                                    onClick={() => dispatch({ type:'SET_TAB', tab:t.id })}
                                    title={`${t.label} (Ctrl+${t.shortcut})`}>
                                <Ico name={t.id === 'users' ? 'users' : t.id === 'matrix' ? 'shield' : t.id === 'audit' ? 'activity' : 'lock'} size={14} />
                                {t.label}
                            </button>
                        ))}
                        <div className="um-tab-indicator" style={indicatorStyle} />
                    </div>

                    <TabPanel activeTab={activeTab} prevTab={prevTab}>
                        <ErrorBoundary key={activeTab}>
                            {activeTab === 'users'    && <UsersTableComponent users={users} onSelectUser={u => dispatch({ type:'OPEN_MODAL', modal:MODAL.DRAWER(u) })} onDeleteUsers={handleDeleteUsers} onEditUser={u => dispatch({ type:'OPEN_MODAL', modal:MODAL.EDIT(u ?? null) })} />}
                            {activeTab === 'matrix'   && <PermissionMatrixComponent />}
                            {activeTab === 'audit'    && <AuditLogComponent />}
                            {activeTab === 'security' && <SecurityPanelComponent users={users} />}
                        </ErrorBoundary>
                    </TabPanel>
                </div>

                <BulkActionBar count={bulkCount} onDelete={handleBulkDelete} onDeactivate={() => toast('Deactivate not yet implemented', 'error')} onClear={() => dispatch({ type:'CLEAR_BULK' })} />

                {/* UserFormModal — uses its own isolated portal on <html>, no wrapper needed */}
                {modal.type === 'EDIT' && (
                    <UserFormModalComponent user={modal.user} onSave={handleSaveUser} onCancel={() => dispatch({ type:'CLOSE_MODAL' })} />
                )}

                <ModalPortal isOpen={modal.type === 'DRAWER'}>
                    <UserDrawerComponent user={modal.user} onClose={() => dispatch({ type:'CLOSE_MODAL' })} onEdit={u => dispatch({ type:'OPEN_MODAL', modal:MODAL.EDIT(u) })} onResetPassword={u => dispatch({ type:'OPEN_MODAL', modal:MODAL.PASSWORD(u) })} />
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'PASSWORD'}>
                    <PasswordModalComponent user={modal.user} onConfirm={handleResetPassword} onClose={() => dispatch({ type:'CLOSE_MODAL' })} />
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'CONFIRM'}>
                    <ConfirmDialog title={modal.title} message={modal.message} confirmLabel={modal.confirmLabel} variant={modal.variant} onConfirm={modal.onConfirm} onCancel={() => dispatch({ type:'CLOSE_MODAL' })} />
                </ModalPortal>

                {enableShortcuts && <ShortcutHints />}
            </div>
        </UserMgmtContext.Provider>
    );
};

export default memo(UserManagementTab);