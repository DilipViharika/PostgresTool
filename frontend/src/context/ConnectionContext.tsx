/**
 * ConnectionContext — provides the currently-active database connection
 * to any component in the tree without prop drilling.
 *
 * Usage:
 *   const { activeConnectionId, setActiveConnectionId, connections, activeConnection } = useConnection();
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchData, postData, setActiveConnectionId as persistConnectionId } from '../utils/api';

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children }) {
    const [connections, setConnections]               = useState([]);
    // Hydrate activeConnectionId from localStorage immediately so activeConnection
    // resolves as soon as connections arrive (avoids a null → value flicker)
    const [activeConnectionId, setActiveConnectionIdState] = useState(() => {
        try {
            const saved = localStorage.getItem('vigil_active_connection_id');
            return saved ? parseInt(saved, 10) : null;
        } catch { return null; }
    });
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

                const defaultConn = connList.find(c => c.isDefault) || connList[0];
                const resolvedId = active?.connectionId ?? defaultConn?.id ?? null;
                setActiveConnectionIdState(resolvedId);
                persistConnectionId(resolvedId);
            } catch (err) {
                console.warn('[ConnectionContext] Failed to load connections:', err?.message ?? err);
                setConnections([]);
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
                persistConnectionId(id);
                const conns = await fetchData('/api/connections');
                setConnections(Array.isArray(conns) ? conns : []);
            }
            return data;
        } catch (err) {
            console.error('[ConnectionContext] switchConnection failed:', err?.message ?? err);
            throw err;
        }
    }, []);

    /** Refresh connections list + active connection (called after add/edit/delete) */
    const refreshConnections = useCallback(async () => {
        try {
            const [conns, active] = await Promise.all([
                fetchData('/api/connections'),
                fetchData('/api/connections/active'),
            ]);
            const connList = Array.isArray(conns) ? conns : [];
            setConnections(connList);

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
