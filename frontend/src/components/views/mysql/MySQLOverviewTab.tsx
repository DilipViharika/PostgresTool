import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchData } from '../../../utils/api';
import { Database, AlertCircle, Server, Cpu, Zap, Clock, HardDrive } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* THEME & CONSTANTS */
/* ─────────────────────────────────────────────────────────────────────────── */
const DARK_THEME = {
    bg: '#0d1117',
    card: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    accent: '#58a6ff',
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
};

const Styles = () => (
    <style>{`
        @keyframes mysql-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mysql-pulse { 0%{opacity:1} 50%{opacity:0.6} 100%{opacity:1} }

        .mysql-card {
            background: ${DARK_THEME.card};
            border: 1px solid ${DARK_THEME.border};
            border-radius: 12px;
            padding: 20px;
            animation: mysql-fade 0.3s ease;
        }

        .mysql-metric-box {
            background: ${DARK_THEME.card};
            border: 1px solid ${DARK_THEME.border};
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }

        .mysql-metric-label {
            font-size: 11px;
            color: ${DARK_THEME.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .mysql-metric-value {
            font-size: 24px;
            font-weight: 700;
            color: ${DARK_THEME.accent};
        }

        .mysql-section {
            margin-bottom: 24px;
        }

        .mysql-section-title {
            font-size: 13px;
            font-weight: 700;
            color: ${DARK_THEME.text};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .mysql-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .mysql-table thead {
            background: ${DARK_THEME.bg};
            border-bottom: 2px solid ${DARK_THEME.border};
        }

        .mysql-table th {
            color: ${DARK_THEME.textMuted};
            font-weight: 600;
            padding: 12px;
            text-align: left;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }

        .mysql-table td {
            color: ${DARK_THEME.text};
            padding: 12px;
            border-bottom: 1px solid ${DARK_THEME.border};
        }

        .mysql-table tbody tr:hover {
            background: ${DARK_THEME.bg}80;
        }

        .mysql-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 40px 20px;
            color: ${DARK_THEME.textMuted};
            font-size: 14px;
        }

        .mysql-spinner {
            animation: mysql-pulse 1.5s ease-in-out infinite;
        }

        .mysql-error {
            background: ${DARK_THEME.danger}15;
            border: 1px solid ${DARK_THEME.danger};
            border-radius: 8px;
            padding: 16px;
            color: ${DARK_THEME.danger};
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .mysql-empty {
            background: ${DARK_THEME.card};
            border: 1px solid ${DARK_THEME.border};
            border-radius: 8px;
            padding: 32px 20px;
            text-align: center;
            color: ${DARK_THEME.textMuted};
        }

        .mysql-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
    `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* HELPER FUNCTIONS */
/* ─────────────────────────────────────────────────────────────────────────── */
const fmt = (n) => {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatBytes = (bytes) => {
    if (!bytes) return '—';
    const b = Number(bytes);
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return fmt(b / Math.pow(k, i)) + ' ' + sizes[i];
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* MYSQL OVERVIEW TAB COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function MySQLOverviewTab() {
    const [overview, setOverview] = useState(null);
    const [databases, setDatabases] = useState([]);
    const [activeQueries, setActiveQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pollIntervalRef = useRef(null);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [ovData, dbData, queries] = await Promise.all([
                fetchData('/api/mysql/overview').catch(() => null),
                fetchData('/api/mysql/databases').catch(() => null),
                fetchData('/api/mysql/active-queries').catch(() => null),
            ]);

            setOverview(
                ovData || {
                    version: '',
                    uptime: 0,
                    connections: 0,
                    maxConnections: 0,
                    questionsPerSec: 0,
                    slowQueries: 0,
                    bufferPoolHitRatio: 0,
                },
            );

            setDatabases(dbData || []);

            setActiveQueries(queries || []);
        } catch (err) {
            setError(err.message || 'Failed to load MySQL overview');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        pollIntervalRef.current = setInterval(loadData, 30000);
        return () => clearInterval(pollIntervalRef.current);
    }, [loadData]);

    if (loading) {
        return (
            <>
                <Styles />
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <div className="mysql-loading">
                        <Database className="mysql-spinner" size={20} />
                        Loading MySQL overview...
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Styles />
            <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
                {/* Error Banner */}
                {error && (
                    <div className="mysql-error">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Overview Metrics */}
                <div className="mysql-section">
                    <h3 className="mysql-section-title">
                        <Server size={16} /> MySQL Instance
                    </h3>
                    <div className="mysql-grid">
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Version</div>
                            <div className="mysql-metric-value" style={{ fontSize: 16 }}>
                                {overview?.version || '—'}
                            </div>
                        </div>
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Uptime (Days)</div>
                            <div className="mysql-metric-value">
                                {overview?.uptime ? fmt(overview.uptime / 86400) : '—'}
                            </div>
                        </div>
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Active Connections</div>
                            <div className="mysql-metric-value">
                                {fmt(overview?.connections)}/{fmt(overview?.maxConnections)}
                            </div>
                        </div>
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Queries/Sec</div>
                            <div className="mysql-metric-value">{fmt(overview?.questionsPerSec)}</div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="mysql-section">
                    <h3 className="mysql-section-title">
                        <Zap size={16} /> Performance
                    </h3>
                    <div className="mysql-grid">
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Slow Queries</div>
                            <div className="mysql-metric-value">{fmt(overview?.slowQueries)}</div>
                        </div>
                        <div className="mysql-metric-box">
                            <div className="mysql-metric-label">Buffer Pool Hit Ratio</div>
                            <div className="mysql-metric-value">{fmt(overview?.bufferPoolHitRatio)}%</div>
                        </div>
                    </div>
                </div>

                {/* Databases */}
                <div className="mysql-section">
                    <h3 className="mysql-section-title">
                        <Database size={16} /> Databases
                    </h3>
                    {databases && databases.length > 0 ? (
                        <div className="mysql-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="mysql-table">
                                <thead>
                                    <tr>
                                        <th>Database Name</th>
                                        <th>Size</th>
                                        <th>Tables</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {databases.map((db, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{db.name}</td>
                                            <td>{formatBytes(db.size)}</td>
                                            <td>{db.tables}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mysql-empty">No databases found. Check your MySQL instance configuration.</div>
                    )}
                </div>

                {/* Active Queries */}
                <div className="mysql-section">
                    <h3 className="mysql-section-title">
                        <Clock size={16} /> Active Queries
                    </h3>
                    {activeQueries && activeQueries.length > 0 ? (
                        <div className="mysql-card" style={{ padding: 0, overflow: 'auto' }}>
                            <table className="mysql-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Host</th>
                                        <th>Database</th>
                                        <th>Command</th>
                                        <th>Time (s)</th>
                                        <th>State</th>
                                        <th>Query</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeQueries.map((query, idx) => (
                                        <tr key={idx}>
                                            <td>{query.id}</td>
                                            <td>{query.user}</td>
                                            <td style={{ fontSize: 12, color: DARK_THEME.textMuted }}>{query.host}</td>
                                            <td>{query.db || '—'}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        background: DARK_THEME.bg,
                                                        color: DARK_THEME.accent,
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {query.command}
                                                </span>
                                            </td>
                                            <td>{query.time}</td>
                                            <td style={{ fontSize: 12, color: DARK_THEME.textMuted }}>
                                                {query.state || '—'}
                                            </td>
                                            <td
                                                style={{
                                                    fontSize: 12,
                                                    color: DARK_THEME.textMuted,
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {query.info || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mysql-empty">No active queries. System is idle.</div>
                    )}
                </div>
            </div>
        </>
    );
}
