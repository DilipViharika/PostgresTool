// ==========================================================================
//  VIGIL — Auth Context  (v2.0 — aligned with actual server.js)
// ==========================================================================
//  Server endpoints used:
//    • POST /api/auth/login → { user, token }
//    • No /auth/me or /auth/refresh exist — session validated client-side
// ==========================================================================

import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, useMemo
} from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE = import.meta?.env?.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
const STORAGE_KEYS = { TOKEN: 'vigil_token', USER: 'vigil_user' };

// ═══════════════════════════════════════════════════════════════════════════
//  JWT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseJWT(token) {
    try {
        const base64 = token.split('.')[1];
        return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
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
    const [loading, setLoading]         = useState(true);   // initial session restore
    const [authLoading, setAuthLoading] = useState(false);  // login in progress
    const [error, setError]             = useState(null);

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

    // ── Login ──────────────────────────────────────────────────────────────
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

            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            setCurrentUser(data.user);
            return data.user;
        } catch (err) {
            const msg = err instanceof TypeError
                ? 'Unable to reach server. Check your connection.'
                : err.message;
            setError(msg);
            throw err;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setCurrentUser(null);
        setError(null);
    }, []);

    // ── RBAC helpers ───────────────────────────────────────────────────────
    const hasRole = useCallback((...roles) =>
        currentUser ? roles.includes(currentUser.role) : false, [currentUser]);

    const hasScreen = useCallback((screen) =>
        currentUser?.allowedScreens?.includes(screen) ?? false, [currentUser]);

    const canWrite = useMemo(() =>
        currentUser?.accessLevel === 'write', [currentUser]);

    const isAdmin = useMemo(() =>
        currentUser?.role === 'super_admin', [currentUser]);

    // ── Token accessors ────────────────────────────────────────────────────
    const getToken = useCallback(() =>
        localStorage.getItem(STORAGE_KEYS.TOKEN), []);

    const getWSUrl = useCallback(() => {
        const token = getToken();
        if (!token) return null;
        const wsBase = API_BASE.replace(/^http/, 'ws');
        return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
    }, [getToken]);

    // ── Session info ───────────────────────────────────────────────────────
    const sessionInfo = useMemo(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) return null;
        const remaining = tokenExpiresIn(token);
        return {
            remainingMinutes: Math.floor(remaining / 60000),
            expiresAt: new Date(Date.now() + remaining),
        };
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Context value ──────────────────────────────────────────────────────
    const value = useMemo(() => ({
        currentUser,
        loading,
        authLoading,
        error,
        isAuthenticated: !!currentUser,
        sessionInfo,
        login,
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
        login, logout, hasRole, hasScreen, canWrite, isAdmin,
        getToken, getWSUrl,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;
