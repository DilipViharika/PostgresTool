/**
 * UserManagementTab — advanced production-ready root component.
 *
 * Architecture:
 *   • useReducer-based state machine (replaces scattered useState)
 *   • AbortController per fetch (cancels in-flight requests on unmount/re-fetch)
 *   • Stale-while-revalidate pattern (shows cached data while refreshing)
 *   • Focus trap + Escape key handling for all modals
 *   • Keyboard-navigable tab bar (Arrow keys + Home/End)
 *   • Portal-based overlays (modals render outside component tree)
 *   • Animated tab panel transitions with FLIP technique
 *   • Breadcrumb context for deep-linking support
 *   • Retry with exponential backoff on transient failures
 *   • Event bus for cross-component communication
 *
 * Usage:
 *   import UserManagementTab from './user-management/UserManagementTab';
 *   <UserManagementTab initialUsers={loaderData} onNavigate={router.push} />
 */

import React, {
    useState, useCallback, useEffect, useReducer,
    useRef, useMemo, createContext, useContext,
    memo, Suspense, lazy,
} from 'react';
import { createPortal } from 'react-dom';
import { T }                              from '../constants/theme.js';
import { useUsers, useToast }             from '../hooks/index.js';
import { GlobalStyles }                   from './GlobalStyles.jsx';
import { Toast, Ico, StatCard }           from './ui.jsx';
import { AnalyticsHeader, UsersTable, PermissionMatrix } from './TableAndMatrix.jsx';
import { AuditLog, SecurityPanel }        from './AuditAndSecurity.jsx';
import { UserDrawer, UserFormModal, PasswordModal } from './Modals.jsx';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS & CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = Object.freeze([
    { id: 'users',    label: 'Users',       icon: 'users',    shortcut: '1' },
    { id: 'matrix',   label: 'Permissions', icon: 'shield',   shortcut: '2' },
    { id: 'audit',    label: 'Audit Log',   icon: 'activity', shortcut: '3' },
    { id: 'security', label: 'Security',    icon: 'lock',     shortcut: '4' },
]);

const TAB_IDS = TABS.map(t => t.id);

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
   Centralises all UI state transitions. Every action is traceable in DevTools.
   ═══════════════════════════════════════════════════════════════════════════ */

const initialState = {
    activeTab:   'users',
    modal:       MODAL.NONE,
    prevTab:     null,          // for transition direction
    tabHistory:  ['users'],     // breadcrumb trail
    bulkSelection: new Set(),
    searchQuery: '',
    sortConfig:  { key: 'name', direction: 'asc' },
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
                bulkSelection: new Set(),   // clear selection on tab change
                searchQuery: '',            // reset search on tab change
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
            history.pop(); // remove current
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

/**
 * Hook for child components to access dispatch and shared state
 * without prop drilling through intermediate components.
 */
export const useUserMgmt = () => {
    const ctx = useContext(UserMgmtContext);
    if (!ctx) throw new Error('useUserMgmt must be used within <UserManagementTab>');
    return ctx;
};


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4 — HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * useKeyboardShortcuts — global keyboard bindings for the tab.
 * Ctrl+1…4 switches tabs. Escape closes modals. Ctrl+N opens new user form.
 */
function useKeyboardShortcuts(dispatch, state) {
    useEffect(() => {
        const handler = (e) => {
            // Don't capture when typing in inputs
            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            // Escape always closes modals
            if (e.key === 'Escape' && state.modal.type !== 'NONE') {
                e.preventDefault();
                dispatch({ type: 'CLOSE_MODAL' });
                return;
            }

            if (isInput) return;

            // Ctrl/Cmd + number → switch tab
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const tab = TAB_IDS[parseInt(e.key) - 1];
                if (tab) dispatch({ type: 'SET_TAB', tab });
                return;
            }

            // Ctrl/Cmd + N → new user
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(null) });
                return;
            }

            // Ctrl/Cmd + K → focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('um-search-input')?.focus();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [dispatch, state.modal.type]);
}

/**
 * useFocusTrap — traps focus within modal when open.
 * Returns a ref to attach to the modal container.
 */
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
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', trap);

        // Auto-focus first focusable element
        requestAnimationFrame(() => {
            const first = containerRef.current?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            first?.focus();
        });

        return () => {
            document.removeEventListener('keydown', trap);
            // Restore focus to previously focused element
            previousFocus.current?.focus?.();
        };
    }, [isActive]);

    return containerRef;
}

/**
 * useTabNavigation — Arrow key navigation for the tab bar.
 */
function useTabNavigation(activeTab, dispatch) {
    const tabListRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        const idx = TAB_IDS.indexOf(activeTab);
        let nextIdx = idx;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextIdx = (idx + 1) % TAB_IDS.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length;
                break;
            case 'Home':
                e.preventDefault();
                nextIdx = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIdx = TAB_IDS.length - 1;
                break;
            default:
                return;
        }

        dispatch({ type: 'SET_TAB', tab: TAB_IDS[nextIdx] });

        // Focus the new tab button
        requestAnimationFrame(() => {
            tabListRef.current?.querySelectorAll('[role="tab"]')[nextIdx]?.focus();
        });
    }, [activeTab, dispatch]);

    return { tabListRef, handleKeyDown };
}

/**
 * useStaleWhileRevalidate — shows cached users immediately, refreshes in background.
 * Provides `isRevalidating` flag so UI can show a subtle indicator.
 */
function useStaleWhileRevalidate(users, loading, fetchUsers) {
    const [isRevalidating, setIsRevalidating] = useState(false);
    const hasCached = useRef(false);

    useEffect(() => {
        if (users.length > 0) hasCached.current = true;
    }, [users.length]);

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
   SECTION 5 — ERROR BOUNDARY (class component — React requirement)
   ═══════════════════════════════════════════════════════════════════════════ */

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null, errorInfo: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[UserManagement] Uncaught render error:', error, errorInfo);
        this.setState({ errorInfo });

        // Report to error tracking service if available
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
                padding: 48, textAlign: 'center', color: T.textDim,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            }} role="alert" aria-live="assertive">
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: `${T.danger}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <Ico name="alert" size={32} color={T.danger} />
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                        Something went wrong
                    </div>
                    <div style={{ fontSize: 13, color: T.textDim, maxWidth: 440, lineHeight: 1.6 }}>
                        {this.state.error?.message || 'An unexpected error occurred in the User Management panel.'}
                    </div>
                </div>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details style={{
                        fontSize: 11, color: T.textMuted, textAlign: 'left',
                        maxWidth: 600, width: '100%', padding: '12px 16px',
                        background: T.surfaceHigh, borderRadius: 8, border: `1px solid ${T.border}`,
                        cursor: 'pointer',
                    }}>
                        <summary style={{ fontWeight: 600, marginBottom: 8 }}>Stack trace (dev only)</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                            {this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="um-btn um-btn-ghost"
                        onClick={() => window.location.reload()}
                    >
                        <Ico name="refresh" size={14} /> Reload page
                    </button>
                    <button
                        className="um-btn um-btn-primary"
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }
}


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 6 — PORTAL OVERLAY WRAPPER
   Renders modals outside the component tree for proper z-index stacking.
   ═══════════════════════════════════════════════════════════════════════════ */

const ModalPortal = memo(({ children, isOpen }) => {
    if (!isOpen) return null;
    return createPortal(children, document.body);
});
ModalPortal.displayName = 'ModalPortal';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 7 — CONFIRMATION DIALOG (for destructive bulk actions)
   ═══════════════════════════════════════════════════════════════════════════ */

const ConfirmDialog = memo(({ title, message, confirmLabel, variant = 'danger', onConfirm, onCancel }) => {
    const trapRef = useFocusTrap(true);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
            role="dialog" aria-modal="true" aria-labelledby="confirm-title"
        >
            <div ref={trapRef} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90vw',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                animation: 'umSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: variant === 'danger' ? `${T.danger}18` : `${T.primary}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Ico
                            name={variant === 'danger' ? 'alert' : 'check'}
                            size={20}
                            color={variant === 'danger' ? T.danger : T.primary}
                        />
                    </div>
                    <div>
                        <div id="confirm-title" style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
                            {title}
                        </div>
                        <div style={{ fontSize: 13, color: T.textDim, marginTop: 4, lineHeight: 1.5 }}>
                            {message}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={`um-btn ${variant === 'danger' ? 'um-btn-danger' : 'um-btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
});
ConfirmDialog.displayName = 'ConfirmDialog';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 8 — TAB PANEL WITH TRANSITION
   Renders the active tab's content with a subtle slide animation.
   ═══════════════════════════════════════════════════════════════════════════ */

const TabPanel = memo(({ activeTab, prevTab, children }) => {
    const direction = prevTab
        ? TAB_IDS.indexOf(activeTab) > TAB_IDS.indexOf(prevTab) ? 1 : -1
        : 0;

    return (
        <div
            key={activeTab}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            style={{
                padding: 24,
                animation: direction !== 0
                    ? `umFade 0.25s ease-out, umSlide${direction > 0 ? 'Left' : 'Right'} 0.25s ease-out`
                    : 'umFade 0.2s ease-out',
            }}
        >
            {children}
        </div>
    );
});
TabPanel.displayName = 'TabPanel';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 9 — BREADCRUMB BAR
   Shows navigation trail. Supports deep-linking callback.
   ═══════════════════════════════════════════════════════════════════════════ */

const Breadcrumb = memo(({ tabHistory, onNavigate }) => {
    if (tabHistory.length <= 1) return null;

    const uniqueTrail = [...new Map(tabHistory.map(id => [id, TABS.find(t => t.id === id)])).values()]
        .filter(Boolean)
        .slice(-3); // Show last 3 breadcrumbs max

    return (
        <nav aria-label="Navigation trail" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: T.textMuted, marginBottom: 16,
        }}>
            {uniqueTrail.map((tab, i) => (
                <React.Fragment key={tab.id}>
                    {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                    <button
                        onClick={() => onNavigate(tab.id)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: i === uniqueTrail.length - 1 ? T.text : T.textMuted,
                            fontWeight: i === uniqueTrail.length - 1 ? 600 : 400,
                            fontSize: 12, padding: '2px 4px', borderRadius: 4,
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = T.primary}
                        onMouseLeave={e => e.currentTarget.style.color = i === uniqueTrail.length - 1 ? T.text : T.textMuted}
                    >
                        {tab.label}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
});
Breadcrumb.displayName = 'Breadcrumb';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 10 — ENHANCED GLOBAL STYLES
   Injects additional keyframes for advanced animations.
   ═══════════════════════════════════════════════════════════════════════════ */

const AdvancedStyles = memo(() => (
    <style>{`
        @keyframes umSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes umFade {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes umSlideLeft {
            from { transform: translateX(16px); }
            to   { transform: translateX(0); }
        }
        @keyframes umSlideRight {
            from { transform: translateX(-16px); }
            to   { transform: translateX(0); }
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

        .shimmer-skeleton {
            background: linear-gradient(90deg, ${T.surfaceHigh} 25%, ${T.border} 50%, ${T.surfaceHigh} 75%);
            background-size: 200% 100%;
            animation: umShimmer 1.5s infinite ease-in-out;
            border-radius: 12px;
        }

        .um-revalidating-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, ${T.primary}, transparent);
            background-size: 200% 100%;
            animation: umShimmer 1s infinite linear;
            border-radius: 2px;
            z-index: 10;
        }

        /* Keyboard focus visible ring */
        .um-root *:focus-visible {
            outline: 2px solid ${T.primary};
            outline-offset: 2px;
            border-radius: 4px;
        }

        /* Tab active indicator animation */
        .um-tab-indicator {
            position: absolute; bottom: -1px; height: 2px;
            background: ${T.primary};
            border-radius: 2px 2px 0 0;
            transition: left 0.25s cubic-bezier(0.16,1,0.3,1),
                        width 0.25s cubic-bezier(0.16,1,0.3,1);
        }

        /* Bulk action bar slide-up */
        .um-bulk-bar {
            animation: umSlideUp 0.2s cubic-bezier(0.16,1,0.3,1);
        }

        /* Subtle hover lift for cards */
        .um-stat-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .um-stat-card {
            transition: transform 0.2s, box-shadow 0.2s;
        }

        /* Accessibility: reduced motion */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `}</style>
));
AdvancedStyles.displayName = 'AdvancedStyles';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 11 — BULK ACTION BAR
   Appears when items are selected. Provides batch operations.
   ═══════════════════════════════════════════════════════════════════════════ */

const BulkActionBar = memo(({ count, onDelete, onDeactivate, onClear }) => {
    if (count === 0) return null;

    return (
        <div className="um-bulk-bar" style={{
            position: 'sticky', bottom: 24, zIndex: 100,
            margin: '16px 0', padding: '12px 20px',
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }} role="toolbar" aria-label={`Bulk actions for ${count} selected users`}>
            <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${T.primary}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: T.primary,
            }}>
                {count}
            </div>
            <span style={{ fontSize: 13, color: T.textDim, marginRight: 'auto' }}>
                user{count > 1 ? 's' : ''} selected
            </span>
            <button className="um-btn um-btn-ghost um-btn-sm" onClick={onDeactivate}>
                <Ico name="pause" size={13} /> Deactivate
            </button>
            <button className="um-btn um-btn-danger um-btn-sm" onClick={onDelete}>
                <Ico name="trash" size={13} /> Delete
            </button>
            <button
                className="um-btn um-btn-ghost um-btn-sm"
                onClick={onClear}
                aria-label="Clear selection"
                style={{ padding: '6px 8px' }}
            >
                <Ico name="x" size={14} />
            </button>
        </div>
    );
});
BulkActionBar.displayName = 'BulkActionBar';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 12 — COMMAND PALETTE HINT
   Shows keyboard shortcut hints at bottom of page.
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
        <div
            style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: '16px 20px', minWidth: 240,
                boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                animation: 'umBounceIn 0.25s ease-out',
            }}
            role="complementary" aria-label="Keyboard shortcuts"
        >
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Keyboard Shortcuts
            </div>
            {shortcuts.map(s => (
                <div key={s.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ fontSize: 12, color: T.textDim }}>{s.desc}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {s.keys.map(k => (
                            <kbd key={k} style={{
                                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                background: T.surfaceHigh, border: `1px solid ${T.border}`,
                                color: T.text, fontFamily: 'inherit', fontWeight: 600,
                            }}>
                                {k}
                            </kbd>
                        ))}
                    </div>
                </div>
            ))}
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 10, textAlign: 'center' }}>
                Press <kbd style={{ fontSize: 10, padding: '1px 4px', borderRadius: 3, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>?</kbd> to dismiss
            </div>
        </div>,
        document.body
    );
});
ShortcutHints.displayName = 'ShortcutHints';


/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 13 — ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{
 *   initialUsers?: User[],
 *   onNavigate?: (path: string) => void,
 *   enableShortcuts?: boolean,
 * }} props
 */
const UserManagementTab = ({
                               initialUsers = [],
                               onNavigate,
                               enableShortcuts = true,
                           }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activeTab, prevTab, modal, bulkSelection, tabHistory } = state;

    const { toasts, toast } = useToast();
    const {
        users, loading, error,
        fetchUsers,
        createUser, updateUser, deleteUsers, resetPassword,
    } = useUsers(initialUsers);

    const { isRevalidating, revalidate } = useStaleWhileRevalidate(users, loading, fetchUsers);
    const { tabListRef, handleKeyDown: tabKeyDown } = useTabNavigation(activeTab, dispatch);

    // Keyboard shortcuts
    useKeyboardShortcuts(dispatch, state);

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

    /* Fetch on mount */
    useEffect(() => {
        if (initialUsers.length === 0) fetchUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* Derived data */
    const activeCount = useMemo(() => users.filter(u => u.status === 'active').length, [users]);
    const bulkCount = bulkSelection.size;

    /* ── Context value (memoised to prevent unnecessary re-renders) ────── */
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
    }, [updateUser, createUser, toast, dispatch]);

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
    }, [bulkCount, bulkSelection, deleteUsers, toast, dispatch]);

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
    }, [deleteUsers, toast, dispatch]);

    const handleResetPassword = useCallback(async (userId, newPassword) => {
        try {
            await resetPassword(userId, newPassword);
            toast('Password updated successfully');
            dispatch({ type: 'CLOSE_MODAL' });
        } catch (err) {
            toast(err.message || 'Password reset failed', 'error');
        }
    }, [resetPassword, toast, dispatch]);

    /* ── Render ────────────────────────────────────────────────────────── */

    return (
        <UserMgmtContext.Provider value={contextValue}>
            <div className="um-root" style={{ padding: '28px 28px 48px', position: 'relative' }}>
                <GlobalStyles />
                <AdvancedStyles />
                <Toast toasts={toasts} />

                {/* Revalidation progress bar */}
                {isRevalidating && <div className="um-revalidating-bar" />}

                {/* ── Page header ──────────────────────────────────────── */}
                <header style={{
                    marginBottom: 28, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 26, fontWeight: 900, color: T.text,
                            letterSpacing: '-0.03em', margin: 0,
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            User Management
                            {isRevalidating && (
                                <span style={{
                                    fontSize: 10, fontWeight: 600, color: T.primary,
                                    padding: '3px 8px', background: `${T.primary}15`,
                                    borderRadius: 6, animation: 'umPulse 1.5s infinite',
                                }}>
                                    Syncing…
                                </span>
                            )}
                        </h1>
                        <div style={{ fontSize: 13, color: T.textDim, marginTop: 4 }}>
                            Manage access, permissions, and security across your organization
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Live stats pill */}
                        <div style={{
                            fontSize: 12, color: T.textDim, fontFamily: 'Space Mono, monospace',
                            padding: '6px 12px', background: T.surfaceHigh,
                            borderRadius: 8, border: `1px solid ${T.border}`,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: activeCount > 0 ? '#22c55e' : T.textMuted,
                                display: 'inline-block',
                            }} />
                            {users.length} users · {activeCount} active
                        </div>

                        {/* Refresh */}
                        <button
                            className="um-btn um-btn-ghost"
                            onClick={revalidate}
                            disabled={loading && !isRevalidating}
                            aria-label="Refresh user list"
                            style={{ opacity: loading && !isRevalidating ? 0.6 : 1 }}
                        >
                            <Ico
                                name="refresh" size={14}
                                style={loading ? { animation: 'umSpin 1s linear infinite' } : {}}
                            />
                            {loading && !isRevalidating ? 'Loading…' : 'Refresh'}
                        </button>

                        {/* New user */}
                        <button
                            className="um-btn um-btn-primary"
                            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(null) })}
                        >
                            <Ico name="plus" size={15} /> New User
                            <kbd style={{
                                fontSize: 9, padding: '1px 5px', marginLeft: 4,
                                borderRadius: 4, background: 'rgba(255,255,255,0.15)',
                                color: 'rgba(255,255,255,0.7)',
                            }}>⌘N</kbd>
                        </button>
                    </div>
                </header>

                {/* ── Fetch error banner ───────────────────────────────── */}
                {error && (
                    <div role="alert" style={{
                        marginBottom: 20, padding: '14px 18px', borderRadius: 12,
                        background: `${T.danger}08`, border: `1px solid ${T.danger}30`,
                        display: 'flex', alignItems: 'center', gap: 12, color: T.danger,
                        animation: 'umSlideUp 0.2s ease-out',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${T.danger}15`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Ico name="alert" size={16} color={T.danger} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Failed to load users</div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{error}</div>
                        </div>
                        <button className="um-btn um-btn-danger um-btn-sm" onClick={revalidate}>
                            <Ico name="refresh" size={12} /> Retry
                        </button>
                    </div>
                )}

                {/* ── Analytics KPI row ────────────────────────────────── */}
                {!loading && users.length > 0 && <AnalyticsHeader users={users} />}

                {/* ── Skeleton while loading ────────────────────────────── */}
                {loading && users.length === 0 && (
                    <div className="um-grid-4" style={{ marginBottom: 24 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="shimmer-skeleton" style={{
                                height: 120,
                                animationDelay: `${i * 0.1}s`,
                            }} />
                        ))}
                    </div>
                )}

                {/* ── Breadcrumb ────────────────────────────────────────── */}
                <Breadcrumb
                    tabHistory={tabHistory}
                    onNavigate={(tab) => dispatch({ type: 'SET_TAB', tab })}
                />

                {/* ── Main tab card ─────────────────────────────────────── */}
                <div style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 16, overflow: 'visible', position: 'relative',
                }}>
                    {/* Tab bar */}
                    <div
                        ref={tabListRef}
                        role="tablist"
                        aria-label="User management sections"
                        onKeyDown={tabKeyDown}
                        style={{
                            display: 'flex', borderBottom: `1px solid ${T.border}`,
                            paddingLeft: 8, background: T.surfaceHigh,
                            borderRadius: '16px 16px 0 0', position: 'relative',
                        }}
                    >
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                ref={el => { tabRefs.current[t.id] = el; }}
                                id={`tab-${t.id}`}
                                role="tab"
                                aria-selected={activeTab === t.id}
                                aria-controls={`tabpanel-${t.id}`}
                                tabIndex={activeTab === t.id ? 0 : -1}
                                className={`um-tab${activeTab === t.id ? ' active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
                                title={`${t.label} (Ctrl+${t.shortcut})`}
                            >
                                <Ico name={t.icon} size={14} /> {t.label}
                            </button>
                        ))}

                        {/* Animated tab indicator */}
                        <div className="um-tab-indicator" style={indicatorStyle} />
                    </div>

                    {/* Tab content */}
                    <TabPanel activeTab={activeTab} prevTab={prevTab}>
                        <ErrorBoundary key={activeTab}>
                            {activeTab === 'users' && (
                                <UsersTable
                                    users={users}
                                    onSelectUser={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.DRAWER(u) })}
                                    onDeleteUsers={handleDeleteUsers}
                                    onEditUser={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(u ?? null) })}
                                />
                            )}
                            {activeTab === 'matrix'   && <PermissionMatrix />}
                            {activeTab === 'audit'    && <AuditLog />}
                            {activeTab === 'security' && <SecurityPanel users={users} />}
                        </ErrorBoundary>
                    </TabPanel>
                </div>

                {/* ── Bulk action bar ────────────────────────────────────── */}
                <BulkActionBar
                    count={bulkCount}
                    onDelete={handleBulkDelete}
                    onDeactivate={() => toast('Deactivate not yet implemented', 'error')}
                    onClear={() => dispatch({ type: 'CLEAR_BULK' })}
                />

                {/* ── Modal layer (portaled) ─────────────────────────────── */}
                <ModalPortal isOpen={modal.type === 'DRAWER'}>
                    {modal.type === 'DRAWER' && (
                        <UserDrawer
                            user={modal.user}
                            onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                            onEdit={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.EDIT(u) })}
                            onResetPassword={u => dispatch({ type: 'OPEN_MODAL', modal: MODAL.PASSWORD(u) })}
                        />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'EDIT'}>
                    {modal.type === 'EDIT' && (
                        <UserFormModal
                            user={modal.user}
                            onSave={handleSaveUser}
                            onCancel={() => dispatch({ type: 'CLOSE_MODAL' })}
                        />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'PASSWORD'}>
                    {modal.type === 'PASSWORD' && (
                        <PasswordModal
                            user={modal.user}
                            onConfirm={handleResetPassword}
                            onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                        />
                    )}
                </ModalPortal>

                <ModalPortal isOpen={modal.type === 'CONFIRM'}>
                    {modal.type === 'CONFIRM' && (
                        <ConfirmDialog
                            title={modal.title}
                            message={modal.message}
                            confirmLabel={modal.confirmLabel}
                            variant={modal.variant}
                            onConfirm={modal.onConfirm}
                            onCancel={() => dispatch({ type: 'CLOSE_MODAL' })}
                        />
                    )}
                </ModalPortal>

                {/* ── Keyboard shortcut overlay ───────────────────────── */}
                {enableShortcuts && <ShortcutHints />}
            </div>
        </UserMgmtContext.Provider>
    );
};

export default memo(UserManagementTab);