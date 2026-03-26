// @ts-nocheck
// ==========================================================================
//  VIGIL — Auth Context  (v2.0 — aligned with actual server.js)
// ==========================================================================
//  Server endpoints used:
//    • POST /api/auth/login → { user, token }
//    • GET /api/auth/sso/:provider → Initiates SSO redirect
//    • No /auth/me or /auth/refresh exist — session validated client-side
// ==========================================================================

import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, useMemo, ReactNode
} from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface User {
    id: string;
    username: string;
    name?: string;
    role: string;
    accessLevel: 'read' | 'write';
    allowedScreens: string[];
}

interface SessionInfo {
    remainingMinutes: number;
    expiresAt: Date;
}

interface AuthContextValue {
    currentUser: User | null;
    loading: boolean;
    authLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    sessionInfo: SessionInfo | null;
    login: (username: string, password: string) => Promise<User>;
    loginWithSSO: (provider?: string) => void;
    handleSSOCallback: (token: string, user: User) => void;
    logout: () => void;
    clearError: () => void;
    hasRole: (...roles: string[]) => boolean;
    hasScreen: (screen: string) => boolean;
    canWrite: boolean;
    isAdmin: boolean;
    getToken: () => string | null;
    getWSUrl: () => string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
const STORAGE_KEYS = { TOKEN: 'vigil_token', USER: 'vigil_user' };

// ═══════════════════════════════════════════════════════════════════════════
//  JWT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseJWT(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split('.')[1];
        return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
}

function isTokenExpired(token: string): boolean {
    const payload = parseJWT(token);
    return !payload?.exp || Date.now() >= (payload.exp as number) * 1000;
}

function tokenExpiresIn(token: string): number {
    const payload = parseJWT(token);
    return payload?.exp ? Math.max(0, (payload.exp as number) * 1000 - Date.now()) : 0;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);   // initial session restore
    const [authLoading, setAuthLoading] = useState(false);  // login in progress
    const [error, setError] = useState<string | null>(null);

    // ── Restore session from localStorage on mount (sync — no fetch) ───────
    useEffect(() => {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const stored = localStorage.getItem(STORAGE_KEYS.USER);

            if (token && stored && !isTokenExpired(token)) {
                setCurrentUser(JSON.parse(stored));
            } else {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        } catch {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
        setLoading(false);
    }, []);

    // ── Listen for forced logout (401 from api.js) ─────────────────────────
    useEffect(() => {
        const onLogout = () => {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setCurrentUser(null);
            setError('Session expired. Please sign in again.');
        };
        window.addEventListener('auth:logout', onLogout);
        return () => window.removeEventListener('auth:logout', onLogout);
    }, []);

    // ── Periodic token expiry check ────────────────────────────────────────
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(() => {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token || isTokenExpired(token)) {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                setCurrentUser(null);
                setError('Session expired. Please sign in again.');
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // ── Standard Login ─────────────────────────────────────────────────────
    const login = useCallback(async (username: string, password: string): Promise<User> => {
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
                throw new Error((data as Record<string, unknown>).error || 'Login failed');
            }
            if (!data.user || !data.token) {
                throw new Error('Invalid server response');
            }

            // Clear previous user's cached data before setting new session
            // This prevents stale data from a different user leaking into the new session
            const prevUser = localStorage.getItem(STORAGE_KEYS.USER);
            const prevParsed = prevUser ? JSON.parse(prevUser) : null;
            if (!prevParsed || (prevParsed as User).username !== data.user.username) {
                localStorage.removeItem('pg_monitor_active_tab');
                localStorage.removeItem('vigil_active_connection_id');
                localStorage.removeItem('vigil_custom_dashboards');
                localStorage.removeItem('vigil_active_dashboard');
                localStorage.removeItem('vigil_repos_v10');
                localStorage.removeItem('vigil_recent_tabs');
                localStorage.removeItem('vigil_last_feedback');
            }

            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            setCurrentUser(data.user);
            return data.user;
        } catch (err) {
            const msg = err instanceof TypeError
                ? 'Unable to reach server. Check your connection.'
                : (err as Error).message;
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
    const handleSSOCallback = useCallback((token: string, user: User) => {
        // Clear previous user's cached data before setting new SSO session
        const prevUser = localStorage.getItem(STORAGE_KEYS.USER);
        const prevParsed = prevUser ? (() => { try { return JSON.parse(prevUser); } catch { return null; } })() : null;
        if (!prevParsed || (prevParsed as User).username !== user.username) {
            localStorage.removeItem('pg_monitor_active_tab');
            localStorage.removeItem('vigil_active_connection_id');
            localStorage.removeItem('vigil_custom_dashboards');
            localStorage.removeItem('vigil_active_dashboard');
            localStorage.removeItem('vigil_repos_v10');
            localStorage.removeItem('vigil_recent_tabs');
            localStorage.removeItem('vigil_last_feedback');
        }
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        setCurrentUser(user);
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Clear persisted active tab so the next login always opens Overview
        localStorage.removeItem('pg_monitor_active_tab');
        // Clear active connection so next login starts fresh
        localStorage.removeItem('vigil_active_connection_id');
        setCurrentUser(null);
        setError(null);
    }, []);

    // ── RBAC helpers ───────────────────────────────────────────────────────
    const hasRole = useCallback((...roles: string[]) =>
        currentUser ? roles.includes(currentUser.role) : false, [currentUser]);

    const hasScreen = useCallback((screen: string) =>
        currentUser?.allowedScreens?.includes(screen) ?? false, [currentUser]);

    const canWrite = useMemo(() =>
        currentUser?.accessLevel === 'write', [currentUser]);

    const isAdmin = useMemo(() =>
        currentUser?.role === 'super_admin', [currentUser]);

    // ── Token accessors ────────────────────────────────────────────────────
    const getToken = useCallback(() =>
        localStorage.getItem(STORAGE_KEYS.TOKEN), []);

    // Returns the base WS URL (no token in URL — client sends auth as first message)
    const getWSUrl = useCallback(() => {
        if (!getToken()) return null;
        const wsBase = API_BASE.replace(/^http/, 'ws');
        return `${wsBase}/ws`;
    }, [getToken]);

    // ── Session info ───────────────────────────────────────────────────────
    const sessionInfo = useMemo((): SessionInfo | null => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) return null;
        const remaining = tokenExpiresIn(token);
        return {
            remainingMinutes: Math.floor(remaining / 60000),
            expiresAt: new Date(Date.now() + remaining),
        };
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Context value ──────────────────────────────────────────────────────
    const value = useMemo<AuthContextValue>(() => ({
        currentUser,
        loading,
        authLoading,
        error,
        isAuthenticated: !!currentUser,
        sessionInfo,
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
    }), [
        currentUser, loading, authLoading, error, sessionInfo,
        login, loginWithSSO, handleSSOCallback, logout, hasRole, hasScreen, canWrite, isAdmin,
        getToken, getWSUrl,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;
