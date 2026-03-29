/**
 * FleetOverviewTab.jsx
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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
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

const FleetOverviewTab = () => {
    useAdaptiveTheme();

    const { switchConnection, connections, activeConnectionId } = useConnection();
    const { goToTab } = useNavigation();

    const [healthData, setHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const refreshTimer = useRef(null);

    // Fetch health data from all connections
    const fetchHealthData = useCallback(async () => {
        try {
            setError(null);
            const data = await fetchData('/api/connections/health');
            setHealthData(Array.isArray(data) ? data : []);
        } catch (err) {
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
    const handleSwitchConnection = useCallback(async (connId) => {
        try {
            await switchConnection(connId);
            // Navigate to overview tab after switching
            goToTab('overview');
        } catch (err) {
            console.error('[FleetOverviewTab] Failed to switch connection:', err);
        }
    }, [switchConnection, goToTab]);

    // Calculate aggregate stats
    const stats = {
        total: connections.length,
        healthy: healthData.filter(h => h.status === 'ok').length,
        degraded: healthData.filter(h => h.status === 'degraded').length,
        down: healthData.filter(h => h.status === 'error').length,
    };

    // Show empty state if no connections
    if (!loading && connections.length === 0) {
        return (
            <div style={styles.container}>
                <OvStyles />
                <NoConnectionBanner
                    title="No Databases Connected"
                    description="Add your first database connection to view the fleet overview and monitor multiple databases."
                    showAddButton={true}
                />
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <OvStyles />

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Fleet Overview</h2>
                    <p style={styles.subtitle}>Monitor all connected databases</p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    style={{
                        ...styles.refreshButton,
                        opacity: refreshing ? 0.6 : 1,
                    }}
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
            <div style={styles.statsBar}>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Total Databases</span>
                    <span style={{ ...styles.statValue, color: THEME.textMain }}>
                        {stats.total}
                    </span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Healthy</span>
                    <span style={{ ...styles.statValue, color: THEME.success }}>
                        {stats.healthy}
                    </span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Degraded</span>
                    <span style={{ ...styles.statValue, color: THEME.warning }}>
                        {stats.degraded}
                    </span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statLabel}>Down</span>
                    <span style={{ ...styles.statValue, color: THEME.danger }}>
                        {stats.down}
                    </span>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div style={styles.errorBanner}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Database Cards Grid */}
            <div style={styles.cardsGrid}>
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
                <div style={styles.loadingMessage}>
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
const DatabaseCard = ({ connection, health, isActive, onSwitch }) => {
    const [isHovering, setIsHovering] = useState(false);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ok': return <CheckCircle size={16} color={THEME.success} />;
            case 'degraded': return <AlertTriangle size={16} color={THEME.warning} />;
            case 'error': return <AlertCircle size={16} color={THEME.danger} />;
            default: return <Activity size={16} color={THEME.textMuted} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ok': return THEME.success;
            case 'degraded': return THEME.warning;
            case 'error': return THEME.danger;
            default: return THEME.textMuted;
        }
    };

    const getStatusDot = (status) => {
        const colors = {
            ok: THEME.success,
            degraded: THEME.warning,
            error: THEME.danger,
        };
        return colors[status] || THEME.textMuted;
    };

    const getDBTypeIcon = (dbType) => {
        switch (dbType?.toLowerCase()) {
            case 'mysql': return <Database size={20} color="#00D4FF" />;
            case 'mongodb': return <Server size={20} color="#00D4FF" />;
            case 'postgresql':
            default: return <Database size={20} color="#00D4FF" />;
        }
    };

    const getDBTypeBadgeText = (dbType) => {
        const type = (dbType || 'postgresql').toLowerCase();
        if (type.includes('mysql')) return 'MySQL';
        if (type.includes('mongo')) return 'MongoDB';
        return 'PostgreSQL';
    };

    const cardStyle = {
        ...styles.card,
        ...(isActive ? styles.cardActive : {}),
        ...(isHovering ? styles.cardHover : {}),
        border: isActive
            ? `1px solid ${THEME.primary}`
            : `1px solid ${THEME.glassBorder}`,
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => onSwitch(connection.id)}
        >
            {/* Top Row: Icon, Name, Badge */}
            <div style={styles.cardHeader}>
                <div style={styles.cardTitleSection}>
                    <div style={styles.dbIcon}>
                        {getDBTypeIcon(connection.dbType)}
                    </div>
                    <div style={styles.cardTitleText}>
                        <h4 style={styles.cardTitle}>{connection.name}</h4>
                        <p style={styles.cardSubtitle}>
                            {connection.host}:{connection.port}
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        ...styles.dbTypeBadge,
                        color: THEME.primary,
                        border: `1px solid ${THEME.primary}`,
                    }}
                >
                    {getDBTypeBadgeText(connection.dbType)}
                </div>
            </div>

            {/* Status and Latency */}
            <div style={styles.cardMetricsRow}>
                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>Status</div>
                    <div style={styles.metricValueWithIcon}>
                        <div
                            style={{
                                ...styles.statusDot,
                                background: getStatusDot(health?.status),
                            }}
                        />
                        <span style={{ color: getStatusColor(health?.status) }}>
                            {health?.status === 'ok' && 'Healthy'}
                            {health?.status === 'degraded' && 'Degraded'}
                            {health?.status === 'error' && 'Down'}
                            {!health?.status && 'Unknown'}
                        </span>
                    </div>
                </div>
                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>Latency</div>
                    <div style={styles.metricValue}>
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
            <div style={styles.cardMetricsRow}>
                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>Database</div>
                    <div style={styles.metricValue}>
                        <Database size={14} />
                        {connection.database}
                    </div>
                </div>
                <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>User</div>
                    <div style={styles.metricValue}>
                        <Users size={14} />
                        {connection.username}
                    </div>
                </div>
            </div>

            {/* Last Checked */}
            {health?.lastChecked && (
                <div style={styles.cardFooter}>
                    <span style={styles.lastCheckedText}>
                        Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
                    </span>
                </div>
            )}

            {/* Active Indicator */}
            {isActive && (
                <div style={styles.activeIndicator}>
                    <CheckCircle size={14} color={THEME.primary} />
                    Active
                </div>
            )}

            {/* Hover Arrow */}
            {isHovering && (
                <div style={styles.cardArrow}>
                    <ArrowRight size={16} color={THEME.primary} />
                </div>
            )}
        </div>
    );
};

/**
 * Animation styles
 */
const OvStyles = () => (
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
);

/**
 * Inline styles
 */
const styles = {
    container: {
        padding: '24px',
        minHeight: '100vh',
        background: THEME.bg,
        fontFamily: THEME.fontBody,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    title: {
        margin: '0 0 6px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: THEME.textMain,
    },
    subtitle: {
        margin: 0,
        fontSize: '13px',
        color: THEME.textMuted,
    },
    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: '8px',
        border: `1px solid ${THEME.glassBorder}`,
        background: THEME.glass,
        backdropFilter: 'blur(8px)',
        color: THEME.primary,
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: THEME.fontBody,
    },
    statsBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        padding: '20px',
        borderRadius: '12px',
        background: THEME.surface,
        border: `1px solid ${THEME.glassBorder}`,
        backdropFilter: 'blur(8px)',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    statLabel: {
        fontSize: '12px',
        color: THEME.textMuted,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: `rgba(255, 69, 96, 0.1)`,
        border: `1px solid ${THEME.danger}`,
        color: THEME.danger,
        marginBottom: '24px',
        fontSize: '13px',
    },
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px',
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        },
    },
    card: {
        padding: '20px',
        borderRadius: '12px',
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative',
        overflow: 'hidden',
        className: 'fleet-card',
    },
    cardActive: {
        boxShadow: `0 0 24px ${THEME.primary}30, inset 0 0 20px ${THEME.primary}08`,
    },
    cardHover: {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${THEME.primary}20`,
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${THEME.glassBorder}`,
    },
    cardTitleSection: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        flex: 1,
    },
    dbIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: `rgba(0, 212, 255, 0.08)`,
        border: `1px solid ${THEME.primary}`,
        flexShrink: 0,
    },
    cardTitleText: {
        flex: 1,
    },
    cardTitle: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '700',
        color: THEME.textMain,
    },
    cardSubtitle: {
        margin: 0,
        fontSize: '12px',
        color: THEME.textMuted,
        fontFamily: THEME.fontMono,
    },
    dbTypeBadge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    cardMetricsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '12px',
    },
    metricItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    metricLabel: {
        fontSize: '11px',
        color: THEME.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
    },
    metricValue: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: THEME.textMain,
        fontWeight: '500',
    },
    metricValueWithIcon: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '500',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        display: 'inline-block',
    },
    cardFooter: {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: `1px solid ${THEME.glassBorder}`,
    },
    lastCheckedText: {
        fontSize: '11px',
        color: THEME.textDim,
    },
    activeIndicator: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '6px',
        background: `rgba(0, 212, 255, 0.1)`,
        border: `1px solid ${THEME.primary}`,
        fontSize: '11px',
        fontWeight: '600',
        color: THEME.primary,
    },
    cardArrow: {
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
    },
    loadingMessage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '40px',
        fontSize: '14px',
        color: THEME.textMuted,
    },
};

export default FleetOverviewTab;
