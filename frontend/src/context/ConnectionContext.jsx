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
                setConnections(Array.isArray(conns) ? conns : []);
                // active.connectionId is null if no switch has been made yet
                // In that case default to the connection marked isDefault (or first)
                const defaultConn = conns.find(c => c.isDefault) || conns[0];
                const resolvedId = active.connectionId ?? defaultConn?.id ?? null;
                setActiveConnectionIdState(resolvedId);
                persistConnectionId(resolvedId);
            } catch {
                // silently ignore — dashboard still works with env pool
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    /** Switch the active connection — calls backend and updates local state */
    const switchConnection = useCallback(async (id) => {
        const data = await postData(`/api/connections/${id}/switch`);
        if (data.success) {
            setActiveConnectionIdState(id);
            persistConnectionId(id); // persist so fetchData picks it up immediately
            // Refresh connection list so isDefault flag is updated
            const conns = await fetchData('/api/connections');
            setConnections(Array.isArray(conns) ? conns : []);
        }
        return data;
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
