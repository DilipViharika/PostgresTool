// ==========================================================================
//  VIGIL — Auth Context  (v2.0 — aligned with actual server.js)
// ==========================================================================
//  Server endpoints used:
//    • POST /api/auth/login → { user, token }
//    • GET /api/auth/sso/:provider → Initiates SSO redirect
//    • No /auth/me or /auth/refresh exist — session validated client-side
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || (() => { console.warn('VITE_API_URL not set, using relative URLs'); return ''; })();
const STORAGE_KEYS = { TOKEN: 'vigil_token', USER: 'vigil_user' };

// ─── Storage utility functions ─────────────────────────────────────────────
// SECURITY: Use sessionStorage for tokens instead of localStorage.
// sessionStorage is cleared when the browser tab is closed, preventing tokens
// from persisting on shared or compromised devices. This is more secure than
// localStorage which persists indefinitely.
const secureStorage = {
    getToken: () => sessionStorage.getItem(STORAGE_KEYS.TOKEN),
    setToken: (token) => sessionStorage.setItem(STORAGE_KEYS.TOKEN, token),
    removeToken: () => sessionStorage.removeItem(STORAGE_KEYS.TOKEN),
    getUser: () => sessionStorage.getItem(STORAGE_KEYS.USER),
    setUser: (user) => sessionStorage.setItem(STORAGE_KEYS.USER, user),
    removeUser: () => sessionStorage.removeItem(STORAGE_KEYS.USER),
};

// ═══════════════════════════════════════════════════════════════════════════
//  JWT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseJWT(token) {
    try {
        const base64 = token.split('.')[1];
        return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const payload = parseJWT(token);
    return !payload?.exp || Date.now() >= payload.exp * 1000;
}

function tokenExpiresIn(token) {
    const payload = parseJWT(token);
    return payload?.exp ? Math.max(0, payload.exp * 1000 - Date.now()) : 0;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // initial session restore
    const [authLoading, setAuthLoading] = useState(false); // login in progress
    const [error, setError] = useState(null);
    const [mustChangePassword, setMustChangePassword] = useState(
        () => localStorage.getItem('vigil_must_change_password') === 'true'
    );

    // ── Restore session from sessionStorage on mount (sync — no fetch) ───────
    // SECURITY: Using sessionStorage instead of localStorage for tokens to prevent
    // token persistence on shared devices. Session is cleared on tab close.
    useEffect(() => {
        try {
            const token = secureStorage.getToken();
            const stored = secureStorage.getUser();

            if (token && stored && !isTokenExpired(token)) {
                setCurrentUser(JSON.parse(stored));
            } else {
                secureStorage.removeToken();
                secureStorage.removeUser();
            }
        } catch {
            secureStorage.removeToken();
            secureStorage.removeUser();
        }
        setLoading(false);
    }, []);

    // ── Listen for forced logout (401 from api.js) and broadcast to other tabs ─────────────────
    useEffect(() => {
        const logoutChannel = new BroadcastChannel('vigil-auth');

        const onLogout = () => {
            secureStorage.removeToken();
            secureStorage.removeUser();
            setCurrentUser(null);
            setError('Session expired. Please sign in again.');
            // Broadcast logout to all other tabs
            logoutChannel.postMessage({ type: 'logout' });
        };

        // Listen for logout from other tabs
        logoutChannel.onmessage = (event) => {
            if (event.data?.type === 'logout') {
                secureStorage.removeToken();
                secureStorage.removeUser();
                setCurrentUser(null);
                setError('Session expired in another tab. Please sign in again.');
            }
        };

        window.addEventListener('auth:logout', onLogout);
        return () => {
            window.removeEventListener('auth:logout', onLogout);
            logoutChannel.close();
        };
    }, []);

    // ── Periodic token expiry check ────────────────────────────────────────
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(() => {
            const token = secureStorage.getToken();
            if (!token || isTokenExpired(token)) {
                secureStorage.removeToken();
                secureStorage.removeUser();
                setCurrentUser(null);
                setError('Session expired. Please sign in again.');
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // ── Standard Login ─────────────────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        setAuthLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }
            if (!data.user || !data.token) {
                throw new Error('Invalid server response');
            }

            // Clear previous user's cached data before setting new session
            // This prevents stale data from a different user leaking into the new session
            const prevUser = secureStorage.getUser();
            const prevParsed = prevUser ? JSON.parse(prevUser) : null;
            if (!prevParsed || prevParsed.username !== data.user.username) {
                localStorage.removeItem('pg_monitor_active_tab');
                localStorage.removeItem('vigil_active_connection_id');
                localStorage.removeItem('vigil_custom_dashboards');
                localStorage.removeItem('vigil_active_dashboard');
                localStorage.removeItem('vigil_repos_v10');
                localStorage.removeItem('vigil_recent_tabs');
                localStorage.removeItem('vigil_last_feedback');
            }

            secureStorage.setToken(data.token);
            secureStorage.setUser(JSON.stringify(data.user));
            if (data.mustChangePassword) {
                localStorage.setItem('vigil_must_change_password', 'true');
                setMustChangePassword(true);
            } else {
                localStorage.removeItem('vigil_must_change_password');
                setMustChangePassword(false);
            }
            setCurrentUser(data.user);
            return { ...data.user, mustChangePassword: data.mustChangePassword };
        } catch (err) {
            const msg = err instanceof TypeError ? 'Unable to reach server. Check your connection.' : err.message;
            setError(msg);
            throw err;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // ── SSO Login Initiation ───────────────────────────────────────────────
    const loginWithSSO = useCallback((provider = 'okta') => {
        // Redirects the browser to the backend endpoint that initiates the OAuth/SAML flow
        window.location.href = `${API_BASE}/api/auth/sso/${provider}`;
    }, []);

    // ── SSO Callback Handler ───────────────────────────────────────────────
    const handleSSOCallback = useCallback((token, user) => {
        // Clear previous user's cached data before setting new SSO session
        const prevUser = secureStorage.getUser();
        const prevParsed = prevUser
            ? (() => {
                  try {
                      return JSON.parse(prevUser);
                  } catch {
                      return null;
                  }
              })()
            : null;
        if (!prevParsed || prevParsed.username !== user.username) {
            localStorage.removeItem('pg_monitor_active_tab');
            localStorage.removeItem('vigil_active_connection_id');
            localStorage.removeItem('vigil_custom_dashboards');
            localStorage.removeItem('vigil_active_dashboard');
            localStorage.removeItem('vigil_repos_v10');
            localStorage.removeItem('vigil_recent_tabs');
            localStorage.removeItem('vigil_last_feedback');
        }
        secureStorage.setToken(token);
        secureStorage.setUser(JSON.stringify(user));
        setCurrentUser(user);
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        secureStorage.removeToken();
        secureStorage.removeUser();
        // Clear persisted active tab so the next login always opens Overview
        localStorage.removeItem('pg_monitor_active_tab');
        // Clear active connection so next login starts fresh
        localStorage.removeItem('vigil_active_connection_id');
        // Clear password-change flag so it's re-evaluated on next login
        localStorage.removeItem('vigil_must_change_password');
        setMustChangePassword(false);
        setCurrentUser(null);
        setError(null);
    }, []);

    // ── RBAC helpers ───────────────────────────────────────────────────────
    const hasRole = useCallback((...roles) => (currentUser ? roles.includes(currentUser.role) : false), [currentUser]);

    const hasScreen = useCallback((screen) => currentUser?.allowedScreens?.includes(screen) ?? false, [currentUser]);

    const canWrite = useMemo(() => currentUser?.accessLevel === 'write', [currentUser]);

    const isAdmin = useMemo(() => currentUser?.role === 'super_admin', [currentUser]);

    // ── Token accessors ────────────────────────────────────────────────────
    const getToken = useCallback(() => secureStorage.getToken(), []);

    // Returns the base WS URL (no token in URL — client sends auth as first message)
    const getWSUrl = useCallback(() => {
        if (!getToken()) return null;
        const wsBase = API_BASE.replace(/^http/, 'ws');
        return `${wsBase}/ws`;
    }, [getToken]);

    // ── Session info ───────────────────────────────────────────────────────
    const sessionInfo = useMemo(() => {
        const token = secureStorage.getToken();
        if (!token) return null;
        const remaining = tokenExpiresIn(token);
        return {
            remainingMinutes: Math.floor(remaining / 60000),
            expiresAt: new Date(Date.now() + remaining),
        };
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: recalculate when user changes, even though we don't directly use it

    // ── Context value ──────────────────────────────────────────────────────
    // Allow external code (e.g. ForcePasswordChangeModal) to clear the flag
    const clearMustChangePassword = useCallback(() => {
        localStorage.removeItem('vigil_must_change_password');
        setMustChangePassword(false);
    }, []);

    const value = useMemo(
        () => ({
            currentUser,
            loading,
            authLoading,
            error,
            isAuthenticated: !!currentUser,
            sessionInfo,
            mustChangePassword,
            clearMustChangePassword,
            login,
            loginWithSSO,
            handleSSOCallback,
            logout,
            clearError: () => setError(null),
            hasRole,
            hasScreen,
            canWrite,
            isAdmin,
            getToken,
            getWSUrl,
        }),
        [
            currentUser,
            loading,
            authLoading,
            error,
            sessionInfo,
            mustChangePassword,
            clearMustChangePassword,
            login,
            loginWithSSO,
            handleSSOCallback,
            logout,
            hasRole,
            hasScreen,
            canWrite,
            isAdmin,
            getToken,
            getWSUrl,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;