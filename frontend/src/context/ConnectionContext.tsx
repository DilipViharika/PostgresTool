// @ts-nocheck
/**
 * ConnectionContext — provides the currently-active database connection
 * to any component in the tree without prop drilling.
 *
 * Usage:
 *   const { activeConnectionId, setActiveConnectionId, connections, activeConnection } = useConnection();
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchData, postData, setActiveConnectionId as persistConnectionId } from '../utils/api';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Connection {
    id: string;
    [key: string]: unknown;
    isDefault?: boolean;
}

interface ConnectionContextValue {
    connections: Connection[];
    activeConnectionId: string | null;
    activeConnection: Connection | null;
    loading: boolean;
    switchConnection: (id: string) => Promise<Record<string, unknown>>;
    refreshConnections: () => Promise<void>;
    setActiveConnectionId: (id: string | null) => void;
}

interface ConnectionProviderProps {
    children: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: ConnectionProviderProps): React.ReactElement {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activeConnectionId, setActiveConnectionIdState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                const defaultConn = (Array.isArray(conns) ? conns : []).find(
                    (c: Connection) => c.isDefault
                ) || (Array.isArray(conns) ? conns[0] : undefined);
                const resolvedId = (active as Record<string, unknown>).connectionId ?? defaultConn?.id ?? null;
                setActiveConnectionIdState(resolvedId as string | null);
                persistConnectionId(resolvedId as string | null);
            } catch (err) {
                // Non-fatal — dashboard still works with the env-pool fallback.
                // Log so developers can spot auth/network issues during debug.
                console.warn('[ConnectionContext] Failed to load connections:', (err as Error)?.message ?? err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    /** Switch the active connection — calls backend and updates local state */
    const switchConnection = useCallback(async (id: string): Promise<Record<string, unknown>> => {
        try {
            const data = await postData(`/api/connections/${id}/switch`);
            if ((data as Record<string, unknown>).success) {
                setActiveConnectionIdState(id);
                persistConnectionId(id); // persist so fetchData picks it up immediately
                // Refresh connection list so isDefault flag is updated
                const conns = await fetchData('/api/connections');
                setConnections(Array.isArray(conns) ? conns : []);
            }
            return data;
        } catch (err) {
            console.error('[ConnectionContext] switchConnection failed:', (err as Error)?.message ?? err);
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

    const activeConnection = connections.find((c: Connection) => c.id === activeConnectionId) ?? null;

    const value: ConnectionContextValue = {
        connections,
        activeConnectionId,
        activeConnection,
        loading,
        switchConnection,
        refreshConnections,
        setActiveConnectionId: setActiveConnectionIdState,
    };

    return (
        <ConnectionContext.Provider value={value}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useConnection(): ConnectionContextValue {
    const ctx = useContext(ConnectionContext);
    if (!ctx) throw new Error('useConnection must be used inside <ConnectionProvider>');
    return ctx;
}
