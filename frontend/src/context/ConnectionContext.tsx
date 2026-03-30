/**
 * ConnectionContext — provides the currently-active database connection
 * to any component in the tree without prop drilling.
 *
 * Usage:
 *   const { activeConnectionId, setActiveConnectionId, connections, activeConnection } = useConnection();
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchData, postData, setActiveConnectionId as persistConnectionId } from '../utils/api';
import { isDemoMode } from '../utils/demoData';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

/** Bypass the demo interceptor and hit the real backend directly.
 *  Uses the original fetch stored before the global interceptor was installed,
 *  OR falls back to normal fetch (which now skips /api/connections in demo mode). */
async function realFetch(path: string) {
    const origFetch = (window as any).__origFetch || window.fetch;
    const token = localStorage.getItem('vigil_token');
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await origFetch(`${API_BASE}${path}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const ConnectionContext = createContext(null);

/** Fallback connections shown when backend is unreachable so live tabs still render */
const FALLBACK_CONNECTIONS = [
    { id: 'demo-conn-1', name: 'Production DB', host: 'prod-pg.example.com', port: 5432, database: 'vigil_prod', dbType: 'postgresql', isDefault: true, status: 'connected', created_at: new Date(Date.now() - 43200000).toISOString() },
    { id: 'demo-conn-2', name: 'Staging DB', host: 'staging-pg.example.com', port: 5432, database: 'vigil_staging', dbType: 'postgresql', isDefault: false, status: 'disconnected', created_at: new Date(Date.now() - 21600000).toISOString() },
];

export function ConnectionProvider({ children }) {
    const [connections, setConnections]               = useState([]);
    const [activeConnectionId, setActiveConnectionIdState] = useState(null);
    const [loading, setLoading]                       = useState(true);

    // Load connections + current active from backend on mount.
    // ALWAYS try the real backend first (bypass demo interceptor) so we can
    // auto-clear demo mode when the backend is back online.
    useEffect(() => {
        async function load() {
            try {
                // Use realFetch to bypass the demo-mode interceptor in api.ts
                const [conns, active] = await Promise.all([
                    realFetch('/api/connections'),
                    realFetch('/api/connections/active'),
                ]);
                const connList = Array.isArray(conns) ? conns : [];
                setConnections(connList);

                // Backend is reachable — if demo mode was on, turn it off
                if (isDemoMode()) {
                    console.info('[ConnectionContext] Backend reachable, exiting demo mode');
                    try { localStorage.removeItem('vigil_demo_mode'); } catch {}
                }

                const defaultConn = connList.find(c => c.isDefault) || connList[0];
                const resolvedId = active?.connectionId ?? defaultConn?.id ?? null;
                setActiveConnectionIdState(resolvedId);
                persistConnectionId(resolvedId);
            } catch (err) {
                // Backend is unreachable — enable demo mode so live tabs show mock data
                console.warn('[ConnectionContext] Backend unreachable, enabling demo mode:', err?.message ?? err);
                try { localStorage.setItem('vigil_demo_mode', 'true'); } catch {}
                setConnections(FALLBACK_CONNECTIONS);
                const defaultId = FALLBACK_CONNECTIONS[0].id;
                setActiveConnectionIdState(defaultId);
                persistConnectionId(defaultId);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    /** Switch the active connection — calls backend and updates local state */
    const switchConnection = useCallback(async (id) => {
        try {
            const data = await postData(`/api/connections/${id}/switch`);
            if (data.success) {
                setActiveConnectionIdState(id);
                persistConnectionId(id); // persist so fetchData picks it up immediately
                // Refresh connection list so isDefault flag is updated
                const conns = await fetchData('/api/connections');
                setConnections(Array.isArray(conns) ? conns : []);
            }
            return data;
        } catch (err) {
            console.error('[ConnectionContext] switchConnection failed:', err?.message ?? err);
            throw err; // re-throw so the caller can surface an error toast if needed
        }
    }, []);

    /** Refresh connections list + active connection (called after add/edit/delete) */
    const refreshConnections = useCallback(async () => {
        try {
            const [conns, active] = await Promise.all([
                realFetch('/api/connections'),
                realFetch('/api/connections/active'),
            ]);
            const connList = Array.isArray(conns) ? conns : [];
            setConnections(connList);

            // Backend responded — clear demo mode if it was on
            if (isDemoMode()) {
                console.info('[ConnectionContext] Backend reachable on refresh, exiting demo mode');
                try { localStorage.removeItem('vigil_demo_mode'); } catch {}
            }

            if (active?.connectionId) {
                setActiveConnectionIdState(active.connectionId);
                persistConnectionId(active.connectionId);
            }
        } catch {}
    }, []);

    const activeConnection = connections.find(c => c.id === activeConnectionId) ?? null;

    return (
        <ConnectionContext.Provider value={{
            connections,
            activeConnectionId,
            activeConnection,
            loading,
            switchConnection,
            refreshConnections,
            setActiveConnectionId: setActiveConnectionIdState,
        }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useConnection() {
    const ctx = useContext(ConnectionContext);
    if (!ctx) throw new Error('useConnection must be used inside <ConnectionProvider>');
    return ctx;
}
