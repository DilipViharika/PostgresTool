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

    // Load connections + current active from backend on mount
    useEffect(() => {
        async function load() {
            try {
                const [conns, active] = await Promise.all([
                    fetchData('/api/connections'),
                    fetchData('/api/connections/active'),
                ]);
                const connList = Array.isArray(conns) ? conns : [];
                setConnections(connList);
                // active.connectionId is null if no switch has been made yet
                // In that case default to the connection marked isDefault (or first)
                const defaultConn = connList.find(c => c.isDefault) || connList[0];
                const resolvedId = active?.connectionId ?? defaultConn?.id ?? null;
                setActiveConnectionIdState(resolvedId);
                persistConnectionId(resolvedId);
            } catch (err) {
                // Backend is unreachable — auto-enable demo mode so live tabs show mock data
                console.warn('[ConnectionContext] Backend unreachable, enabling demo mode:', err?.message ?? err);
                try { localStorage.setItem('vigil_demo_mode', 'true'); } catch {}
                // Use fallback connections so sidebar shows live sections
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

    /** Refresh connections list (called after add/edit/delete) */
    const refreshConnections = useCallback(async () => {
        try {
            const conns = await fetchData('/api/connections');
            setConnections(Array.isArray(conns) ? conns : []);
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
