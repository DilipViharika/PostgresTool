/**
 * UserManagementTab — advanced production-ready root component.
 *
 * Architecture:
 * • useReducer-based state machine (replaces scattered useState)
 * • Stale-while-revalidate pattern (shows cached data while refreshing)
 * • Focus trap + Escape key handling for all modals
 * • Keyboard-navigable tab bar (Arrow keys + Home/End)
 * • Portal-based overlays (modals render outside component tree)
 * • Animated tab panel transitions
 * • Breadcrumb context for navigation history
 * • Bulk action bar with confirmation dialogs
 * • Keyboard shortcuts (Ctrl+1-4, Ctrl+N, Ctrl+K, Esc)
 *
 * Usage:
 * import UserManagementTab from './usermanagement/UserManagementTab';
 * <UserManagementTab initialUsers={loaderData} />
 */

import React, {
    useState, useCallback, useEffect, useReducer,
    useRef, useMemo, createContext, useContext, memo,
} from 'react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS — mapped to actual project structure (src/usermanagement/)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Theme (shared across the entire app) ──
import { THEME } from '../utils/theme.jsx';

// ── Wired up your real components here ──
import { UsersTable, PermissionMatrix } from './Toggle/TableAndMatrix.jsx';
import { AuditLog, SecurityPanel } from './PermissionMatrix/AuditAndSecurity.jsx';
import { UserDrawer, UserFormModal, PasswordModal } from './PermissionMatrix/Modals.jsx';

/* ═══════════════════════════════════════════════════════════════════════════
   THEME ALIAS — use T.xxx shorthand throughout this file
   ═══════════════════════════════════════════════════════════════════════════ */
const T = THEME;

/* ═══════════════════════════════════════════════════════════════════════════
   API BASE URL — points to the backend deployment.
   In dev this proxies via Vite. In production it hits the backend directly.
   ═══════════════════════════════════════════════════════════════════════════ */
const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS & CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = Object.freeze([
    { id: 'users',    label: 'Users',       icon: '👥', shortcut: '1' },
    { id: 'matrix',   label: 'Permissions', icon: '🛡️', shortcut: '2' },
    { id: 'audit',    label: 'Audit Log',   icon: '📋', shortcut: '3' },
    { id: 'security', label: 'Security',    icon: '🔒', shortcut: '4' },
]);

const TAB_IDS = TABS.map(t => t.id);

/** SVG icon helper — renders common icons inline without needing lucide-react */
const ICONS = {
    alert:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    refresh: (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    plus:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x:       (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trash:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    pause:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    check:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    users:   (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shield:  (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    activity:(sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    lock:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    edit:    (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    key:     (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    search:  (sz, c) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

/** Lightweight icon component — no external dependency needed */
const Ico = memo(({ name, size = 16, color = 'currentColor', style = {} }) => {
    const render = ICONS[name];
    if (!render) return null;
    return <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}>{render(size, color)}</span>;
});
Ico.displayName = 'Ico';


/** Modal discriminated union — ensures only one modal open at a time */
const MODAL = Object.freeze({
    NONE:     { type: 'NONE' },
    DRAWER:   (user) => ({ type: 'DRAWER', user }),
    EDIT:     (user) => ({ type: 'EDIT', user }),      // user=null → create mode
    PASSWORD: (user) => ({ type: 'PASSWORD', user }),
    CONFIRM:  (payload) => ({ type: 'CONFIRM', ...payload }),
});


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — STATE MACHINE (useReducer)
   Centralises all UI state transitions. Every action is traceable.
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
            return {
                ...state,
                prevTab: state.activeTab,
                activeTab: action.tab,
                tabHistory: history,
                bulkSelection: new Set(),
                searchQuery: '',
            };
        }
        case 'OPEN_MODAL':
            return { ...state, modal: action.modal };
        case 'CLOSE_MODAL':
            return { ...state, modal: MODAL.NONE };
        case 'TOGGLE_BULK_SELECT': {
            const next = new Set(state.bulkSelection);
            if (next.has(action.id)) next.delete(action.id);
            else next.add(action.id);
            return { ...state, bulkSelection: next };
        }
        case 'SELECT_ALL_BULK':
            return { ...state, bulkSelection: new Set(action.ids) };
        case 'CLEAR_BULK':
            return { ...state, bulkSelection: new Set() };
        case 'SET_SEARCH':
            return { ...state, searchQuery: action.query };
        case 'SET_SORT': {
            const direction = state.sortConfig.key === action.key && state.sortConfig.direction === 'asc'
                ? 'desc' : 'asc';
            return { ...state, sortConfig: { key: action.key, direction } };
        }
        case 'GO_BACK': {
            const history = [...state.tabHistory];
            history.pop();
            const prev = history[history.length - 1] || 'users';
            return { ...state, activeTab: prev, prevTab: state.activeTab, tabHistory: history };
        }
        default:
            return state;
    }
}


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3 — CONTEXT (avoids prop drilling 4+ levels deep)
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

/** Toast notification system */
function useToast() {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    return { toasts, toast };
}

/** User data management with optimistic updates */
function useUsers(initialUsers = []) {
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    // Uses the app-wide token key 'vigil_token' set by AuthContext
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('vigil_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    }, []);

    const fetchUsers = useCallback(async () => {
        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users`, {
                headers: getAuthHeaders(),
                signal: controller.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to fetch users');
            }
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const createUser = useCallback(async (formData) => {
        const res = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData),
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const created = await res.json();
        setUsers(prev => [...prev, created.user || created]);
        return created.user || created;
    }, [getAuthHeaders]);

    const updateUser = useCallback(async (id, formData) => {
        const prev = users;
        // Optimistic update
        setUsers(u => u.map(x => x.id === id ? { ...x, ...formData } : x));
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }
            const updated = await res.json();
            setUsers(u => u.map(x => x.id === id ? (updated.user || updated) : x));
        } catch (err) {
            setUsers(prev); // Rollback
            throw err;
        }
    }, [getAuthHeaders, users]);

    const deleteUsers = useCallback(async (ids) => {
        const prev = users;
        // Optimistic removal
        setUsers(u => u.filter(x => !ids.includes(x.id)));
        try {
            await Promise.all(ids.map(id =>
                fetch(`${API_BASE}/api/users/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                }).then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                })
            ));
        } catch (err) {
            setUsers(prev); // Rollback
            throw err;
        }
    }, [getAuthHeaders, users]);

    const resetPassword = useCallback(async (userId, newPassword) => {
        const res = await fetch(`${API_BASE}/api/users/${userId}/reset-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ newPassword }),
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
        }
    }, [getAuthHeaders]);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, []);

    return { users, loading, error, fetchUsers, createUser, updateUser, deleteUsers, resetPassword };
}

/** Keyboard shortcuts — Ctrl+1-4, Ctrl+N, Ctrl+K, Escape */
function useKeyboardShortcuts(dispatch, modalType) {
    useEffect(() => {
        const handler = (e) => {
            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            if (e.key === 'Escape' && modalType !== 'NONE') {
                e.preventDefault();
                dispatch({ type: 'CLOSE_MODAL' });
                return;
            }
            if (isInput) return;

            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                dispatch({ type: 'SET_TAB', tab: TAB_IDS[parseInt(e.key) - 1] });
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(null) });
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('um-search-input')?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [dispatch, modalType]);
}

/** Focus trap for modals */
function useFocusTrap(isActive) {
    const containerRef = useRef(null);
    const previousFocus = useRef(null);

    useEffect(() => {
        if (!isActive) return;
        previousFocus.current = document.activeElement;

        const trap = (e) => {
            if (e.key !== 'Tab' || !containerRef.current) return;
            const focusable = containerRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        };
        document.addEventListener('keydown', trap);
        requestAnimationFrame(() => {
            containerRef.current?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )?.focus();
        });

        return () => {
            document.removeEventListener('keydown', trap);
            previousFocus.current?.focus?.();
        };
    }, [isActive]);

    return containerRef;
}

/** Arrow key navigation for tab bar */
function useTabNavigation(activeTab, dispatch) {
    const tabListRef = useRef(null);
    const handleKeyDown = useCallback((e) => {
        const idx = TAB_IDS.indexOf(activeTab);
        let nextIdx = idx;
        switch (e.key) {
            case 'ArrowRight': case 'ArrowDown':
                e.preventDefault(); nextIdx = (idx + 1) % TAB_IDS.length; break;
            case 'ArrowLeft': case 'ArrowUp':
                e.preventDefault(); nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length; break;
            case 'Home': e.preventDefault(); nextIdx = 0; break;
            case 'End':  e.preventDefault(); nextIdx = TAB_IDS.length - 1; break;
            default: return;
        }
        dispatch({ type: 'SET_TAB', tab: TAB_IDS[nextIdx] });
        requestAnimationFrame(() => {
            tabListRef.current?.querySelectorAll('[role="tab"]')[nextIdx]?.focus();
        });
    }, [activeTab, dispatch]);
    return { tabListRef, handleKeyDown };
}

/** Stale-while-revalidate */
function useStaleWhileRevalidate(users, fetchUsers) {
    const [isRevalidating, setIsRevalidating] = useState(false);
    const hasCached = useRef(false);

    useEffect(() => { if (users.length > 0) hasCached.current = true; }, [users.length]);

    const revalidate = useCallback(async () => {
        if (hasCached.current) {
            setIsRevalidating(true);
            await fetchUsers();
            setIsRevalidating(false);
        } else {
            await fetchUsers();
        }
    }, [fetchUsers]);

    return { isRevalidating, revalidate };
}


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5 — GLOBAL STYLES (injected once)
   ═══════════════════════════════════════════════════════════════════════════ */

const GlobalStylesInjector = memo(() => (
    <style>{`
        /* ── Keyframe Animations ─────────────────────────────────────────── */
        @keyframes umSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes umFade {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes umFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes umFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes umSlideLeft {
            from { transform: translateX(16px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes umSlideRight {
            from { transform: translateX(-16px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes umSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes umShimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes umPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.5; }
        }
        @keyframes umBounceIn {
            0%   { transform: scale(0.9); opacity: 0; }
            60%  { transform: scale(1.02); }
            100% { transform: scale(1); opacity: 1; }
        }

        /* ── Box sizing ──────────────────────────────────────────────────── */
        .um-root *, .um-root *::before, .um-root *::after { box-sizing: border-box; }

        /* ── Shimmer skeleton ────────────────────────────────────────────── */
        .shimmer-skeleton {
            background: linear-gradient(90deg, ${T.surfaceRaised || '#1a1a2e'} 25%, ${T.grid || '#2a2a3e'} 50%, ${T.surfaceRaised || '#1a1a2e'} 75%);
            background-size: 200% 100%;
            animation: umShimmer 1.5s infinite ease-in-out;
            border-radius: 12px;
        }

        /* ── Revalidating progress bar ───────────────────────────────────── */
        .um-revalidating-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, ${T.primary || '#00D4FF'}, transparent);
            background-size: 200% 100%;
            animation: umShimmer 1s infinite linear;
            border-radius: 2px; z-index: 10;
        }

        /* ── Focus ring ──────────────────────────────────────────────────── */
        .um-root *:focus-visible {
            outline: 2px solid ${T.primary || '#00D4FF'};
            outline-offset: 2px;
            border-radius: 4px;
        }

        /* ── Tab indicator ───────────────────────────────────────────────── */
        .um-tab-indicator {
            position: absolute; bottom: -1px; height: 2px;
            background: ${T.primary || '#00D4FF'};
            border-radius: 2px 2px 0 0;
            transition: left 0.25s cubic-bezier(0.16,1,0.3,1), width 0.25s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Bulk action bar ─────────────────────────────────────────────── */
        .um-bulk-bar { animation: umSlideUp 0.2s cubic-bezier(0.16,1,0.3,1); }

        /* ── Buttons ─────────────────────────────────────────────────────── */
        .um-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px; border-radius: 8px; border: none;
            font-size: 13px; font-weight: 600; cursor: pointer;
            transition: all 0.15s ease; font-family: inherit;
            line-height: 1;
        }
        .um-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .um-btn-primary {
            background: ${T.primary || '#00D4FF'}; color: ${T.textInverse || '#07030D'};
        }
        .um-btn-primary:hover:not(:disabled) {
            filter: brightness(1.1); transform: translateY(-1px);
        }
        .um-btn-ghost {
            background: transparent; color: ${T.textDim || '#4A3A5E'};
            border: 1px solid ${T.grid || '#1A0E2B'};
        }
        .um-btn-ghost:hover:not(:disabled) {
            background: ${T.surfaceRaised || '#221535'}; color: ${T.textMain || '#F0ECF8'};
        }
        .um-btn-danger {
            background: ${T.danger || '#FF4560'}; color: #fff;
        }
        .um-btn-danger:hover:not(:disabled) { filter: brightness(1.1); }
        .um-btn-sm { padding: 5px 10px; font-size: 12px; }
        .um-btn-icon {
            padding: 6px; border-radius: 6px;
            display: inline-flex; align-items: center; justify-content: center;
        }

        /* ── Tab buttons ─────────────────────────────────────────────────── */
        .um-tab {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 12px 18px; border: none; background: transparent;
            color: ${T.textMuted || '#9888B4'}; font-size: 13px; font-weight: 500;
            cursor: pointer; transition: color 0.15s; font-family: inherit;
            position: relative;
        }
        .um-tab:hover { color: ${T.textMain || '#F0ECF8'}; }
        .um-tab.active { color: ${T.primary || '#00D4FF'}; font-weight: 700; }

        /* ── Layout grids ────────────────────────────────────────────────── */
        .um-grid-4 {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .um-grid-2 {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
        }
        @media (max-width: 900px) {
            .um-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
            .um-grid-4 { grid-template-columns: 1fr; }
            .um-grid-2 { grid-template-columns: 1fr; }
        }

        /* ── Modal overlay — full-screen backdrop ────────────────────────── */
        .um-overlay {
            position: fixed;
            inset: 0;
            z-index: 5000;
            background: rgba(4, 5, 10, 0.78);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: umFadeIn 0.2s ease;
        }

        /* ── Modal panel ─────────────────────────────────────────────────── */
        .um-modal {
            background: ${T.surface || '#120A1F'};
            border: 1px solid ${T.grid || '#1A0E2B'};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(0,0,0,0.65);
            animation: umSlideUp 0.25s cubic-bezier(0.16,1,0.3,1);
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }

        /* ── Drawer — right-side slide-in panel ──────────────────────────── */
        .um-drawer {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 480px;
            max-width: 95vw;
            background: ${T.surface || '#120A1F'};
            border-left: 1px solid ${T.grid || '#1A0E2B'};
            box-shadow: -16px 0 60px rgba(0,0,0,0.55);
            display: flex;
            flex-direction: column;
            animation: umSlideLeft 0.3s cubic-bezier(0.16,1,0.3,1);
            z-index: 5001;
        }

        /* ── Scrollable content area ──────────────────────────────────────── */
        .um-scroll {
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: ${T.grid || '#1A0E2B'} transparent;
        }
        .um-scroll::-webkit-scrollbar { width: 4px; }
        .um-scroll::-webkit-scrollbar-track { background: transparent; }
        .um-scroll::-webkit-scrollbar-thumb {
            background: ${T.grid || '#1A0E2B'};
            border-radius: 2px;
        }

        /* ── Card ────────────────────────────────────────────────────────── */
        .um-card {
            padding: 16px 18px;
            border-radius: 12px;
            background: ${T.surfaceRaised || '#221535'};
            border: 1px solid ${T.grid || '#1A0E2B'};
        }

        /* ── Form inputs ─────────────────────────────────────────────────── */
        .um-input {
            width: 100%;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid ${T.grid || '#1A0E2B'};
            background: ${T.surfaceRaised || '#221535'};
            color: ${T.textMain || '#F0ECF8'};
            font-size: 13px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            -webkit-appearance: none;
        }
        .um-input:focus {
            border-color: ${T.primary || '#00D4FF'};
            box-shadow: 0 0 0 3px ${T.primary || '#00D4FF'}20;
        }
        .um-input::placeholder { color: ${T.textDim || '#4A3A5E'}; }
        select.um-input { cursor: pointer; }

        /* ── Monospace input variant ──────────────────────────────────────── */
        .um-mono {
            font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
            letter-spacing: 0.02em;
        }

        /* ── Permission chip ──────────────────────────────────────────────── */
        .um-perm-chip {
            display: inline-flex;
            align-items: center;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        /* ── Reduced motion ───────────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `}</style>
));
GlobalStylesInjector.displayName = 'GlobalStylesInjector';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 6 — TOAST COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const ToastContainer = memo(({ toasts }) => {
    if (toasts.length === 0) return null;
    return createPortal(
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 99999,
            display: 'flex', flexDirection: 'column', gap: 8,
        }} aria-live="polite">
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    color: '#fff', maxWidth: 360,
                    background: t.type === 'error' ? (T.danger || '#ef4444') : (T.primary || '#6366f1'),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    animation: 'umSlideUp 0.2s ease-out',
                    display: 'flex', alignItems: 'center', gap: 8,
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

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[UserManagement] Uncaught render error:', error, errorInfo);
        this.setState({ errorInfo });
        if (typeof window !== 'undefined' && window.__ERROR_REPORTER__) {
            window.__ERROR_REPORTER__.captureException(error, {
                componentStack: errorInfo?.componentStack,
                context: 'UserManagementTab',
            });
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div style={{
                padding: 48, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            }} role="alert" aria-live="assertive">
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: `${T.danger || '#ef4444'}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Ico name="alert" size={32} color={T.danger || '#ef4444'} />
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text || '#e2e4eb', marginBottom: 8 }}>
                        Something went wrong
                    </div>
                    <div style={{ fontSize: 13, color: T.textDim || '#8b8fa3', maxWidth: 440, lineHeight: 1.6 }}>
                        {this.state.error?.message || 'An unexpected error occurred in the User Management panel.'}
                    </div>
                </div>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details style={{
                        fontSize: 11, color: T.textMuted || '#6b6f82', textAlign: 'left',
                        maxWidth: 600, width: '100%', padding: '12px 16px',
                        background: T.surfaceHigh || '#1a1a2e', borderRadius: 8,
                        border: `1px solid ${T.border || '#2a2a3e'}`, cursor: 'pointer',
                    }}>
                        <summary style={{ fontWeight: 600, marginBottom: 8 }}>Stack trace (dev only)</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                            {this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="um-btn um-btn-ghost" onClick={() => window.location.reload()}>
                        <Ico name="refresh" size={14} /> Reload page
                    </button>
                    <button className="um-btn um-btn-primary"
                            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
                        Try again
                    </button>
                </div>
            </div>
        );
    }
}


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 8 — PORTAL OVERLAY WRAPPER
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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        }}
             onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
             role="dialog" aria-modal="true" aria-labelledby="confirm-title"
        >
            <div ref={trapRef} style={{
                background: T.surface || '#12121f', border: `1px solid ${T.border || '#2a2a3e'}`,
                borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90vw',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                animation: 'umSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: variant === 'danger' ? `${T.danger || '#ef4444'}18` : `${T.primary || '#6366f1'}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Ico name={variant === 'danger' ? 'alert' : 'check'} size={20}
                             color={variant === 'danger' ? (T.danger || '#ef4444') : (T.primary || '#6366f1')} />
                    </div>
                    <div>
                        <div id="confirm-title" style={{ fontSize: 16, fontWeight: 700, color: T.text || '#e2e4eb' }}>
                            {title}
                        </div>
                        <div style={{ fontSize: 13, color: T.textDim || '#8b8fa3', marginTop: 6, lineHeight: 1.6 }}>
                            {message}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className={`um-btn ${variant === 'danger' ? 'um-btn-danger' : 'um-btn-primary'}`}
                            onClick={onConfirm}>
                        {confirmLabel || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
});
ConfirmDialog.displayName = 'ConfirmDialog';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 10 — TAB PANEL WITH TRANSITION
   ═══════════════════════════════════════════════════════════════════════════ */

const TabPanel = memo(({ activeTab, prevTab, children }) => {
    const direction = prevTab ? (TAB_IDS.indexOf(activeTab) > TAB_IDS.indexOf(prevTab) ? 1 : -1) : 0;
    return (
        <div key={activeTab} role="tabpanel" id={`tabpanel-${activeTab}`}
             aria-labelledby={`tab-${activeTab}`}
             style={{
                 padding: 24,
                 animation: direction !== 0
                     ? `umFade 0.25s ease-out, umSlide${direction > 0 ? 'Left' : 'Right'} 0.25s ease-out`
                     : 'umFade 0.2s ease-out',
             }}>
            {children}
        </div>
    );
});
TabPanel.displayName = 'TabPanel';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 11 — BREADCRUMB BAR
   ═══════════════════════════════════════════════════════════════════════════ */

const Breadcrumb = memo(({ tabHistory, onNavigate }) => {
    if (tabHistory.length <= 1) return null;
    const uniqueTrail = [...new Map(tabHistory.map(id => [id, TABS.find(t => t.id === id)])).values()]
        .filter(Boolean).slice(-3);
    return (
        <nav aria-label="Navigation trail" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: T.textMuted || '#6b6f82', marginBottom: 16,
        }}>
            {uniqueTrail.map((tab, i) => (
                <React.Fragment key={tab.id}>
                    {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                    <button onClick={() => onNavigate(tab.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: i === uniqueTrail.length - 1 ? (T.text || '#e2e4eb') : (T.textMuted || '#6b6f82'),
                        fontWeight: i === uniqueTrail.length - 1 ? 600 : 400,
                        fontSize: 12, padding: '2px 4px', borderRadius: 4, fontFamily: 'inherit',
                    }}>
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
        <div className="um-bulk-bar" style={{
            position: 'sticky', bottom: 24, zIndex: 100,
            margin: '16px 0', padding: '12px 20px',
            background: T.surface || '#12121f', border: `1px solid ${T.border || '#2a2a3e'}`,
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }} role="toolbar" aria-label={`Bulk actions for ${count} selected users`}>
            <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${T.primary || '#6366f1'}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: T.primary || '#6366f1',
            }}>{count}</div>
            <span style={{ fontSize: 13, color: T.textDim || '#8b8fa3', marginRight: 'auto' }}>
                user{count > 1 ? 's' : ''} selected
            </span>
            <button className="um-btn um-btn-ghost um-btn-sm" onClick={onDeactivate}>
                <Ico name="pause" size={13} /> Deactivate
            </button>
            <button className="um-btn um-btn-danger um-btn-sm" onClick={onDelete}>
                <Ico name="trash" size={13} /> Delete
            </button>
            <button className="um-btn um-btn-ghost um-btn-sm" onClick={onClear}
                    aria-label="Clear selection" style={{ padding: '6px 8px' }}>
                <Ico name="x" size={14} />
            </button>
        </div>
    );
});
BulkActionBar.displayName = 'BulkActionBar';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 13 — KEYBOARD SHORTCUT OVERLAY
   ═══════════════════════════════════════════════════════════════════════════ */

const ShortcutHints = memo(() => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                const tag = e.target.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
                    setVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    if (!visible) return null;

    const shortcuts = [
        { keys: ['Ctrl', '1-4'], desc: 'Switch tabs' },
        { keys: ['Ctrl', 'N'],   desc: 'New user' },
        { keys: ['Ctrl', 'K'],   desc: 'Search' },
        { keys: ['Esc'],         desc: 'Close modal' },
        { keys: ['?'],           desc: 'Toggle shortcuts' },
    ];

    return createPortal(
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: T.surface || '#12121f', border: `1px solid ${T.border || '#2a2a3e'}`,
            borderRadius: 14, padding: '16px 20px', minWidth: 240,
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            animation: 'umBounceIn 0.25s ease-out',
        }} role="complementary" aria-label="Keyboard shortcuts">
            <div style={{
                fontSize: 11, fontWeight: 700, color: T.textDim || '#8b8fa3',
                marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
                Keyboard Shortcuts
            </div>
            {shortcuts.map(s => (
                <div key={s.desc} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0',
                }}>
                    <span style={{ fontSize: 12, color: T.textDim || '#8b8fa3' }}>{s.desc}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {s.keys.map(k => (
                            <kbd key={k} style={{
                                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                background: T.surfaceHigh || '#1a1a2e', border: `1px solid ${T.border || '#2a2a3e'}`,
                                color: T.text || '#e2e4eb', fontFamily: 'inherit', fontWeight: 600,
                            }}>{k}</kbd>
                        ))}
                    </div>
                </div>
            ))}
            <div style={{ fontSize: 10, color: T.textMuted || '#6b6f82', marginTop: 10, textAlign: 'center' }}>
                Press <kbd style={{
                fontSize: 10, padding: '1px 4px', borderRadius: 3,
                background: T.surfaceHigh || '#1a1a2e', border: `1px solid ${T.border || '#2a2a3e'}`,
            }}>?</kbd> to dismiss
            </div>
        </div>,
        document.body
    );
});
ShortcutHints.displayName = 'ShortcutHints';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 14 — ANALYTICS HEADER (inline — no external dependency)
   ═══════════════════════════════════════════════════════════════════════════ */

const AnalyticsHeaderInline = memo(({ users }) => {
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.status === 'active').length;
        const admins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
        const recent = users.filter(u => {
            if (!u.created_at) return false;
            const d = new Date(u.created_at);
            const now = new Date();
            return (now - d) < 30 * 24 * 60 * 60 * 1000; // last 30 days
        }).length;
        return [
            { label: 'Total Users',  value: total,  color: T.primary || '#6366f1' },
            { label: 'Active',       value: active,  color: '#22c55e' },
            { label: 'Admins',       value: admins,  color: '#f59e0b' },
            { label: 'New (30d)',    value: recent,  color: '#8b5cf6' },
        ];
    }, [users]);

    return (
        <div className="um-grid-4" style={{ marginBottom: 24 }}>
            {stats.map(s => (
                <div key={s.label} className="um-stat-card" style={{
                    padding: '18px 20px', borderRadius: 14,
                    background: T.surface || '#12121f', border: `1px solid ${T.border || '#2a2a3e'}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                    <div style={{ fontSize: 11, color: T.textMuted || '#6b6f82', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {s.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginTop: 6, letterSpacing: '-0.02em' }}>
                        {s.value}
                    </div>
                </div>
            ))}
        </div>
    );
});
AnalyticsHeaderInline.displayName = 'AnalyticsHeaderInline';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 15 — WIRED UP COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Wired up to your real imported components ──
const UsersTableComponent       = UsersTable;
const PermissionMatrixComponent = PermissionMatrix;
const AuditLogComponent         = AuditLog;
const SecurityPanelComponent    = SecurityPanel;
const UserDrawerComponent       = UserDrawer;
const UserFormModalComponent    = UserFormModal;
const PasswordModalComponent    = PasswordModal;


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 16 — ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const UserManagementTab = ({ initialUsers = [], enableShortcuts = true }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activeTab, prevTab, modal, bulkSelection, tabHistory } = state;

    const { toasts, toast } = useToast();
    const {
        users, loading, error,
        fetchUsers, createUser, updateUser, deleteUsers, resetPassword,
    } = useUsers(initialUsers);

    const { isRevalidating, revalidate } = useStaleWhileRevalidate(users, fetchUsers);
    const { tabListRef, handleKeyDown: tabKeyDown } = useTabNavigation(activeTab, dispatch);

    useKeyboardShortcuts(dispatch, modal.type);

    // Tab indicator positioning
    const tabRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const el = tabRefs.current[activeTab];
        if (el) {
            const parent = el.parentElement;
            setIndicatorStyle({
                left: el.offsetLeft - (parent?.offsetLeft || 0),
                width: el.offsetWidth,
            });
        }
    }, [activeTab]);

    // Fetch on mount
    useEffect(() => {
        if (initialUsers.length === 0) fetchUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Derived data
    const activeCount = useMemo(() => users.filter(u => u.status === 'active').length, [users]);
    const bulkCount = bulkSelection.size;

    // Context
    const contextValue = useMemo(() => ({
        state, dispatch, users, toast,
    }), [state, users, toast]);

    /* ── Handlers ─────────────────────────────────────────────────────── */

    const handleSaveUser = useCallback(async (formData) => {
        try {
            if (formData.id) {
                await updateUser(formData.id, formData);
                toast(`${formData.name} updated successfully`);
            } else {
                const created = await createUser(formData);
                toast(`${created?.name ?? formData.name} created successfully`);
            }
            dispatch({ type: 'CLOSE_MODAL' });
        } catch (err) {
            toast(err.message || 'Save failed', 'error');
        }
    }, [updateUser, createUser, toast]);

    const handleBulkDelete = useCallback(() => {
        dispatch({
            type: 'OPEN_MODAL',
            modal: MODAL.CONFIRM({
                title: `Delete ${bulkCount} user${bulkCount > 1 ? 's' : ''}?`,
                message: 'This action cannot be undone. All associated data, sessions, and permissions will be permanently removed.',
                confirmLabel: `Delete ${bulkCount} user${bulkCount > 1 ? 's' : ''}`,
                variant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteUsers([...bulkSelection]);
                        toast(`${bulkCount} user${bulkCount > 1 ? 's' : ''} deleted`);
                        dispatch({ type: 'CLEAR_BULK' });
                        dispatch({ type: 'CLOSE_MODAL' });
                    } catch (err) {
                        toast(err.message || 'Delete failed', 'error');
                    }
                },
            }),
        });
    }, [bulkCount, bulkSelection, deleteUsers, toast]);

    const handleDeleteUsers = useCallback(async (ids) => {
        const arr = Array.isArray(ids) ? ids : [ids];
        const count = arr.length;
        dispatch({
            type: 'OPEN_MODAL',
            modal: MODAL.CONFIRM({
                title: `Delete ${count} user${count > 1 ? 's' : ''}?`,
                message: 'This action cannot be undone.',
                confirmLabel: 'Delete',
                variant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteUsers(arr);
                        toast(`${count} user${count > 1 ? 's' : ''} removed`);
                        dispatch({ type: 'CLOSE_MODAL' });
                    } catch (err) {
                        toast(err.message || 'Delete failed', 'error');
                    }
                },
            }),
        });
    }, [deleteUsers, toast]);

    const handleResetPassword = useCallback(async (userId, newPassword) => {
        try {
            await resetPassword(userId, newPassword);
            toast('Password updated successfully');
            dispatch({ type: 'CLOSE_MODAL' });
        } catch (err) {
            toast(err.message || 'Password reset failed', 'error');
        }
    }, [resetPassword, toast]);

    /* ── Render ────────────────────────────────────────────────────────── */

    return (
        <UserMgmtContext.Provider value={contextValue}>
            <div className="um-root" style={{ padding: '28px 28px 48px', position: 'relative' }}>
                <GlobalStylesInjector />
                <ToastContainer toasts={toasts} />

                {/* Revalidation progress bar */}
                {isRevalidating && <div className="um-revalidating-bar" />}

                {/* ── Page header ──────────────────────────────────────── */}
                <header style={{
                    marginBottom: 28, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 26, fontWeight: 900, color: T.text || '#e2e4eb',
                            letterSpacing: '-0.03em', margin: 0,
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            User Management
                            {isRevalidating && (
                                <span style={{
                                    fontSize: 10, fontWeight: 600, color: T.primary || '#6366f1',
                                    padding: '3px 8px', background: `${T.primary || '#6366f1'}15`,
                                    borderRadius: 6, animation: 'umPulse 1.5s infinite',
                                }}>Syncing…</span>
                            )}
                        </h1>
                        <div style={{ fontSize: 13, color: T.textDim || '#8b8fa3', marginTop: 4 }}>
                            Manage access, permissions, and security across your organization
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Live stats pill */}
                        <div style={{
                            fontSize: 12, color: T.textDim || '#8b8fa3',
                            fontFamily: '"SF Mono", "Fira Code", monospace',
                            padding: '6px 12px', background: T.surfaceHigh || '#1a1a2e',
                            borderRadius: 8, border: `1px solid ${T.border || '#2a2a3e'}`,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: activeCount > 0 ? '#22c55e' : (T.textMuted || '#6b6f82'),
                                display: 'inline-block',
                            }} />
                            {users.length} users · {activeCount} active
                        </div>

                        {/* Refresh */}
                        <button className="um-btn um-btn-ghost" onClick={revalidate}
                                disabled={loading && !isRevalidating} aria-label="Refresh user list"
                                style={{ opacity: loading && !isRevalidating ? 0.6 : 1 }}>
                            <Ico name="refresh" size={14}
                                 style={loading ? { animation: 'umSpin 1s linear infinite' } : {}} />
                            {loading && !isRevalidating ? 'Loading…' : 'Refresh'}
                        </button>

                        {/* New user */}
                        <button className="um-btn um-btn-primary"
                                onClick={() => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(null) })}>
                            <Ico name="plus" size={15} color="#fff" /> New User
                            <kbd style={{
                                fontSize: 9, padding: '1px 5px', marginLeft: 4, borderRadius: 4,
                                background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
                            }}>⌘N</kbd>
                        </button>
                    </div>
                </header>

                {/* ── Fetch error banner ───────────────────────────────── */}
                {error && (
                    <div role="alert" style={{
                        marginBottom: 20, padding: '14px 18px', borderRadius: 12,
                        background: `${T.danger || '#ef4444'}08`, border: `1px solid ${T.danger || '#ef4444'}30`,
                        display: 'flex', alignItems: 'center', gap: 12, color: T.danger || '#ef4444',
                        animation: 'umSlideUp 0.2s ease-out',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: `${T.danger || '#ef4444'}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ico name="alert" size={16} color={T.danger || '#ef4444'} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Failed to load users</div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{error}</div>
                        </div>
                        <button className="um-btn um-btn-danger um-btn-sm" onClick={revalidate}>
                            <Ico name="refresh" size={12} color="#fff" /> Retry
                        </button>
                    </div>
                )}

                {/* ── Analytics KPI row ────────────────────────────────── */}
                {!loading && users.length > 0 && <AnalyticsHeaderInline users={users} />}

                {/* ── Skeleton while loading ────────────────────────────── */}
                {loading && users.length === 0 && (
                    <div className="um-grid-4" style={{ marginBottom: 24 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="shimmer-skeleton"
                                 style={{ height: 120, animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                )}

                {/* ── Breadcrumb ────────────────────────────────────────── */}
                <Breadcrumb tabHistory={tabHistory}
                            onNavigate={(tab) => dispatch({ type: 'SET_TAB', tab })} />

                {/* ── Main tab card ─────────────────────────────────────── */}
                <div style={{
                    background: T.surface || '#12121f', border: `1px solid ${T.border || '#2a2a3e'}`,
                    borderRadius: 16, overflow: 'visible', position: 'relative',
                }}>
                    {/* Tab bar */}
                    <div ref={tabListRef} role="tablist" aria-label="User management sections"
                         onKeyDown={tabKeyDown}
                         style={{
                             display: 'flex', borderBottom: `1px solid ${T.border || '#2a2a3e'}`,
                             paddingLeft: 8, background: T.surfaceHigh || '#1a1a2e',
                             borderRadius: '16px 16px 0 0', position: 'relative',
                         }}>
                        {TABS.map(t => (
                            <button key={t.id}
                                    ref={el => { tabRefs.current[t.id] = el; }}
                                    id={`tab-${t.id}`} role="tab"
                                    aria-selected={activeTab === t.id}
                                    aria-controls={`tabpanel-${t.id}`}
                                    tabIndex={activeTab === t.id ? 0 : -1}
                                    className={`um-tab${activeTab === t.id ? ' active' : ''}`}
                                    onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
                                    title={`${t.label} (Ctrl+${t.shortcut})`}>
                                <Ico name={t.id === 'users' ? 'users' : t.id === 'matrix' ? 'shield' : t.id === 'audit' ? 'activity' : 'lock'}
                                     size={14} /> {t.label}
                            </button>
                        ))}
                        <div className="um-tab-indicator" style={indicatorStyle} />
                    </div>

                    {/* Tab content */}
                    <TabPanel activeTab={activeTab} prevTab={prevTab}>
                        <ErrorBoundary key={activeTab}>
                            {activeTab === 'users' && (
                                <UsersTableComponent users={users}
                                                     onSelectUser={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.DRAWER(u) })}
                                                     onDeleteUsers={handleDeleteUsers}
                                                     onEditUser={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(u ?? null) })} />
                            )}
                            {activeTab === 'matrix'   && <PermissionMatrixComponent />}
                            {activeTab === 'audit'    && <AuditLogComponent />}
                            {activeTab === 'security' && <SecurityPanelComponent users={users} />}
                        </ErrorBoundary>
                    </TabPanel>
                </div>

                {/* ── Bulk action bar ────────────────────────────────────── */}
                <BulkActionBar count={bulkCount} onDelete={handleBulkDelete}
                               onDeactivate={() => toast('Deactivate not yet implemented', 'error')}
                               onClear={() => dispatch({ type: 'CLEAR_BULK' })} />

                {/* ── Modal layer (portaled) ─────────────────────────────── */}
                <ModalPortal isOpen={modal.type === 'DRAWER'}>
                    {modal.type === 'DRAWER' && (
                        <UserDrawerComponent user={modal.user}
                                             onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                                             onEdit={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(u) })}
                                             onResetPassword={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.PASSWORD(u) })} />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'EDIT'}>
                    {modal.type === 'EDIT' && (
                        <UserFormModalComponent user={modal.user}
                                                onSave={handleSaveUser}
                                                onCancel={() => dispatch({ type: 'CLOSE_MODAL' })} />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'PASSWORD'}>
                    {modal.type === 'PASSWORD' && (
                        <PasswordModalComponent user={modal.user}
                                                onConfirm={handleResetPassword}
                                                onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'CONFIRM'}>
                    {modal.type === 'CONFIRM' && (
                        <ConfirmDialog title={modal.title} message={modal.message}
                                       confirmLabel={modal.confirmLabel} variant={modal.variant}
                                       onConfirm={modal.onConfirm}
                                       onCancel={() => dispatch({ type: 'CLOSE_MODAL' })} />
                    )}
                </ModalPortal>

                {/* ── Keyboard shortcut overlay ───────────────────────── */}
                {enableShortcuts && <ShortcutHints />}
            </div>
        </UserMgmtContext.Provider>
    );
};

export default memo(UserManagementTab);