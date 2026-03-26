// @ts-nocheck
/**
 * FleetOverviewTab.tsx
 * Multi-database health dashboard showing all connected databases in a card grid.
 *
 * Features:
 * - Fetches from /api/connections and /api/connections/health
 * - Grid of database cards (3 columns on desktop, 2 on smaller)
 * - Status indicators, latency, metrics
 * - Aggregate stats bar at top
 * - Auto-refresh every 30 seconds
 * - Empty state with NoConnectionBanner
 * - Glass-effect cards with hover glow animation
 */

import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData, postData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { useNavigation } from '../../../context/NavigationContext';
import NoConnectionBanner from '../../shared/NoConnectionBanner';

import {
    Database, Server, Activity, Wifi, WifiOff, Clock, ArrowRight,
    RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Zap,
    HardDrive, Users, Eye, EyeOff, Loader2, MoreVertical,
    Gauge, TrendingUp, TrendingDown, Cpu, BarChart3
} from 'lucide-react';

// Types
interface Connection {
    id: string;
    name: string;
    host: string;
    port: number;
    database: string;
    username: string;
    dbType?: string;
}

interface HealthData {
    id: string;
    status: 'ok' | 'degraded' | 'error';
    latencyMs?: number;
    lastChecked?: string;
}

interface Stats {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
}

interface DatabaseCardProps {
    connection: Connection;
    health?: HealthData;
    isActive: boolean;
    onSwitch: (connId: string) => void;
}

const FleetOverviewTab: FC = () => {
    useAdaptiveTheme();

    const { switchConnection, connections, activeConnectionId } = useConnection();
    const { goToTab } = useNavigation();

    const [healthData, setHealthData] = useState<HealthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const refreshTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch health data from all connections
    const fetchHealthData = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchData('/api/connections/health');
            setHealthData(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[FleetOverviewTab] Failed to fetch health:', err);
            setError(err?.message || 'Failed to fetch connection health data');
        }
    }, []);

    // Initial load and auto-refresh
    useEffect(() => {
        fetchHealthData();
        setLoading(false);

        // Auto-refresh every 30 seconds
        refreshTimer.current = setInterval(() => {
            setRefreshing(true);
            fetchHealthData().finally(() => setRefreshing(false));
        }, 30000);

        return () => {
            if (refreshTimer.current) clearInterval(refreshTimer.current);
        };
    }, [fetchHealthData]);

    // Handle manual refresh
    const handleManualRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchHealthData();
        setRefreshing(false);
    }, [fetchHealthData]);

    // Handle connection switch
    const handleSwitchConnection = useCallback(async (connId: string) => {
        try {
            await switchConnection(connId);
            // Navigate to overview tab after switching
            goToTab('overview');
        } catch (err) {
            console.error('[FleetOverviewTab] Failed to switch connection:', err);
        }
    }, [switchConnection, goToTab]);

    // Calculate aggregate stats
    const stats: Stats = {
        total: connections.length,
        healthy: healthData.filter(h => h.status === 'ok').length,
        degraded: healthData.filter(h => h.status === 'degraded').length,
        down: healthData.filter(h => h.status === 'error').length,
    };

    // Show empty state if no connections
    if (!loading && connections.length === 0) {
        return (
            <div className="p-6 min-h-screen bg-vigil-bg">
                <style>{`
                    @keyframes rotation {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes cardGlow {
                        0%, 100% { box-shadow: 0 0 0 rgba(0, 212, 255, 0); }
                        50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .fleet-card { animation: fadeIn 0.4s ease-out both; }
                `}</style>
                <NoConnectionBanner
                    title="No Databases Connected"
                    description="Add your first database connection to view the fleet overview and monitor multiple databases."
                    showAddButton={true}
                />
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-vigil-bg">
            <style>{`
                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes cardGlow {
                    0%, 100% { box-shadow: 0 0 0 rgba(0, 212, 255, 0); }
                    50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fleet-card { animation: fadeIn 0.4s ease-out both; }
                .fleet-card:nth-child(1) { animation-delay: 0.0s; }
                .fleet-card:nth-child(2) { animation-delay: 0.07s; }
                .fleet-card:nth-child(3) { animation-delay: 0.14s; }
                .fleet-card:nth-child(4) { animation-delay: 0.21s; }
                .fleet-card:nth-child(5) { animation-delay: 0.28s; }
                .fleet-card:nth-child(6) { animation-delay: 0.35s; }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-vigil-text mb-1.5">Fleet Overview</h2>
                    <p className="text-sm text-vigil-muted">Monitor all connected databases</p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-vigil-accent/20 bg-vigil-glass hover:border-vigil-accent/40 text-vigil-accent text-sm font-semibold cursor-pointer transition-all duration-200"
                    title="Refresh connection health"
                >
                    <RefreshCw
                        size={16}
                        style={{
                            animation: refreshing ? 'rotation 1s linear infinite' : 'none',
                        }}
                    />
                    Refresh
                </button>
            </div>

            {/* Aggregate Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-8 p-5 rounded-xl bg-vigil-surface border border-vigil-accent/10 backdrop-blur-lg">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Total Databases</span>
                    <span className="text-2xl font-bold text-vigil-text">
                        {stats.total}
                    </span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Healthy</span>
                    <span className="text-2xl font-bold text-vigil-emerald">
                        {stats.healthy}
                    </span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Degraded</span>
                    <span className="text-2xl font-bold text-vigil-amber">
                        {stats.degraded}
                    </span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Down</span>
                    <span className="text-2xl font-bold text-vigil-rose">
                        {stats.down}
                    </span>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-vigil-rose/10 border border-vigil-rose/30 text-vigil-rose text-sm mb-6">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Database Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {connections.map((conn) => {
                    const health = healthData.find(h => h.id === conn.id);
                    const isActive = conn.id === activeConnectionId;

                    return (
                        <DatabaseCard
                            key={conn.id}
                            connection={conn}
                            health={health}
                            isActive={isActive}
                            onSwitch={handleSwitchConnection}
                        />
                    );
                })}
            </div>

            {/* Loading skeleton if initial load */}
            {loading && (
                <div className="flex items-center justify-center gap-3 p-10 text-vigil-muted">
                    <Loader2 size={20} style={{ animation: 'rotation 1s linear infinite' }} />
                    Loading fleet health data...
                </div>
            )}
        </div>
    );
};

/**
 * DatabaseCard — Individual database card with status and metrics
 */
const DatabaseCard: FC<DatabaseCardProps> = ({ connection, health, isActive, onSwitch }) => {
    const [isHovering, setIsHovering] = useState(false);

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'ok': return <CheckCircle size={16} className="text-vigil-emerald" />;
            case 'degraded': return <AlertTriangle size={16} className="text-vigil-amber" />;
            case 'error': return <AlertCircle size={16} className="text-vigil-rose" />;
            default: return <Activity size={16} className="text-vigil-muted" />;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'ok': return 'text-vigil-emerald';
            case 'degraded': return 'text-vigil-amber';
            case 'error': return 'text-vigil-rose';
            default: return 'text-vigil-muted';
        }
    };

    const getStatusDot = (status?: string) => {
        const colors = {
            ok: 'bg-vigil-emerald',
            degraded: 'bg-vigil-amber',
            error: 'bg-vigil-rose',
        };
        return colors[status as keyof typeof colors] || 'bg-vigil-muted';
    };

    const getDBTypeIcon = (dbType?: string) => {
        switch (dbType?.toLowerCase()) {
            case 'mysql': return <Database size={20} className="text-vigil-cyan" />;
            case 'mongodb': return <Server size={20} className="text-vigil-cyan" />;
            case 'postgresql':
            default: return <Database size={20} className="text-vigil-cyan" />;
        }
    };

    const getDBTypeBadgeText = (dbType?: string) => {
        const type = (dbType || 'postgresql').toLowerCase();
        if (type.includes('mysql')) return 'MySQL';
        if (type.includes('mongo')) return 'MongoDB';
        return 'PostgreSQL';
    };

    const cardClass = `fleet-card p-5 rounded-xl bg-vigil-glass border backdrop-blur-xl cursor-pointer transition-all duration-300 relative overflow-hidden
        ${isActive ? 'border-vigil-cyan shadow-lg shadow-vigil-cyan/20' : 'border-vigil-accent/10 hover:border-vigil-accent/30 hover:-translate-y-1 hover:shadow-lg'}
    `;

    return (
        <div
            className={cardClass}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => onSwitch(connection.id)}
        >
            {/* Top Row: Icon, Name, Badge */}
            <div className="flex justify-between items-start gap-3 mb-4 pb-3 border-b border-vigil-accent/10">
                <div className="flex gap-3 items-start flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-vigil-cyan/10 border border-vigil-cyan/30 flex-shrink-0">
                        {getDBTypeIcon(connection.dbType)}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-vigil-text m-0 mb-1">{connection.name}</h4>
                        <p className="text-xs text-vigil-muted m-0 font-mono">
                            {connection.host}:{connection.port}
                        </p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-md border border-vigil-cyan/30 text-vigil-cyan text-xs font-semibold whitespace-nowrap`}>
                    {getDBTypeBadgeText(connection.dbType)}
                </div>
            </div>

            {/* Status and Latency */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Status</div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(health?.status)}`} />
                        <span className={`text-sm font-medium ${getStatusColor(health?.status)}`}>
                            {health?.status === 'ok' && 'Healthy'}
                            {health?.status === 'degraded' && 'Degraded'}
                            {health?.status === 'error' && 'Down'}
                            {!health?.status && 'Unknown'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Latency</div>
                    <div className="flex items-center gap-1.5 text-sm text-vigil-text font-medium">
                        {health?.latencyMs !== undefined ? (
                            <>
                                <Clock size={14} />
                                {health.latencyMs}ms
                            </>
                        ) : (
                            'N/A'
                        )}
                    </div>
                </div>
            </div>

            {/* Optional Key Metrics Placeholders */}
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">Database</div>
                    <div className="flex items-center gap-1.5 text-sm text-vigil-text font-medium">
                        <Database size={14} />
                        {connection.database}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider">User</div>
                    <div className="flex items-center gap-1.5 text-sm text-vigil-text font-medium">
                        <Users size={14} />
                        {connection.username}
                    </div>
                </div>
            </div>

            {/* Last Checked */}
            {health?.lastChecked && (
                <div className="mt-3 pt-3 border-t border-vigil-accent/10">
                    <span className="text-xs text-vigil-muted/60">
                        Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
                    </span>
                </div>
            )}

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-vigil-cyan/10 border border-vigil-cyan/30 text-vigil-cyan text-xs font-semibold">
                    <CheckCircle size={14} />
                    Active
                </div>
            )}

            {/* Hover Arrow */}
            {isHovering && (
                <div className="absolute bottom-4 right-4 flex items-center justify-center opacity-60">
                    <ArrowRight size={16} className="text-vigil-cyan" />
                </div>
            )}
        </div>
    );
};

export default FleetOverviewTab;
