import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GitMerge,
  RefreshCw,
  AlertTriangle,
  Clock,
  Database,
  Users,
  Lock,
  HardDrive,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Activity,
  Shield,
  CheckCircle,
  Link2,
  Zap,
} from 'lucide-react';
import { fetchData } from '../../utils/api';
import { THEME } from '../../utils/theme';

// ============================================================================
// STYLES COMPONENT (Keyframes)
// ============================================================================
const Styles = () => (
  <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fade {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes radarPulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.5);
      }
    }
  `}</style>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AlertCorrelationTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // seconds, 0 = off
  const [activeLeftTab, setActiveLeftTab] = useState('groups'); // 'groups' | 'sessions'
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [sessionFilter, setSessionFilter] = useState(''); // filter state
  const [sessionSort, setSessionSort] = useState('age_desc');

  // Token from localStorage
  const token = localStorage.getItem('vigil_token');

  // Fetch correlation data
  const fetchCorrelationData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchData('/api/alerts/correlation', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setData(result);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch correlation data');
      console.error('Alert correlation fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    fetchCorrelationData();
  }, [fetchCorrelationData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshInterval === 0) return;
    const timer = setInterval(fetchCorrelationData, autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchCorrelationData]);

  // ====== COMPUTED VALUES ======
  const summaryStats = useMemo(() => {
    if (!data) return { groups: 0, criticalEvents: 0, waitingSessions: 0, longTxns: 0 };

    const criticalEvents = (data.recentEvents || []).filter(
      (e) => e.severity === 'critical'
    ).length;

    const waitingSessions = (data.sessionStates || [])
      .filter((s) => s.wait_event_type)
      .reduce((sum, s) => sum + (s.cnt || 0), 0);

    const longTxns = (data.longTransactions || []).length;

    return {
      groups: (data.correlationGroups || []).length,
      criticalEvents,
      waitingSessions,
      longTxns,
    };
  }, [data]);

  const healthStatus = useMemo(() => {
    if (!data) return 'ok';

    const hasCriticalGroup = (data.correlationGroups || []).some(
      (g) => g.severity === 'critical'
    );
    const hasLongTxn = (data.longTransactions || []).some(
      (t) => (t.xact_age_sec || 0) > 300
    );

    if (hasCriticalGroup || hasLongTxn) return 'critical';

    const hasBloated = (data.bloatedTables || []).some((t) => (t.dead_pct || 0) > 20);
    const hasLockWait = (data.sessionStates || []).some(
      (s) => s.wait_event_type === 'Lock' && (s.cnt || 0) > 3
    );

    if (hasBloated || hasLockWait) return 'warning';

    return 'ok';
  }, [data]);

  // Format time range
  const formatTimeRange = (startTs, endTs) => {
    if (!startTs || !endTs) return '--:-- → --:--';
    const start = new Date(startTs);
    const end = new Date(endTs);
    const startStr = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endStr = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${startStr} → ${endStr}`;
  };

  // Format time ago
  const formatTimeAgo = (isoTs) => {
    if (!isoTs) return '--:--';
    const d = new Date(isoTs);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Format transaction age
  const formatTxnAge = (seconds) => {
    if (!seconds) return '0s';
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'lock':
        return <Lock size={14} />;
      case 'connection':
        return <Users size={14} />;
      case 'io':
        return <HardDrive size={14} />;
      default:
        return null;
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return THEME.danger;
      case 'warning':
        return THEME.warning;
      default:
        return THEME.info;
    }
  };

  // Filtered and sorted live sessions
  const filteredSessions = useMemo(() => {
    if (!data) return [];
    let sessions = [...(data.liveSessions || [])];

    if (sessionFilter) {
      sessions = sessions.filter((s) =>
        s.state && s.state.toLowerCase().includes(sessionFilter.toLowerCase())
      );
    }

    if (sessionSort === 'age_desc') {
      sessions.sort((a, b) => (b.age_sec || 0) - (a.age_sec || 0));
    }

    return sessions;
  }, [data, sessionFilter, sessionSort]);

  // ====== RENDER SECTIONS ======

  const renderHeader = () => (
    <div
      style={{
        padding: '24px',
        borderBottom: `1px solid ${THEME.glassBorder}`,
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Link2 size={24} color={THEME.primary} />
        <h1 style={{ margin: 0, color: THEME.textMain, fontSize: '20px', fontWeight: '600' }}>
          Alert Correlation Engine
        </h1>
      </div>
      <p
        style={{
          margin: '0 0 16px 0',
          color: THEME.textMuted,
          fontSize: '12px',
          letterSpacing: '0.5px',
        }}
      >
        Correlate anomalies into root-cause groups
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: THEME.textMuted, fontSize: '12px' }}>
            Last refresh: {lastRefresh.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <button
            onClick={fetchCorrelationData}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: THEME.primary,
              color: THEME.bg,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: THEME.textMuted, fontSize: '12px' }}>Auto-refresh:</span>
          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value, 10))}
            style={{
              padding: '4px 8px',
              background: THEME.surface,
              color: THEME.textMain,
              border: `1px solid ${THEME.glassBorder}`,
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <option value="15">15s</option>
            <option value="30">30s</option>
            <option value="60">1m</option>
            <option value="0">Off</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSummaryCards = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '0 24px',
      }}
    >
      {/* Correlation Groups */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
          color: THEME.textMain,
        }}
      >
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '8px' }}>
          Correlation Groups
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: THEME.primary }}>
          {summaryStats.groups}
        </div>
      </div>

      {/* Critical Events */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
          color: THEME.textMain,
        }}
      >
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '8px' }}>
          Critical Events
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: THEME.danger }}>
          {summaryStats.criticalEvents}
        </div>
      </div>

      {/* Active Waiting Sessions */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
          color: THEME.textMain,
        }}
      >
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '8px' }}>
          Waiting Sessions
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: THEME.warning }}>
          {summaryStats.waitingSessions}
        </div>
      </div>

      {/* Long Transactions */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
          color: THEME.textMain,
        }}
      >
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '8px' }}>
          Long Transactions
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color:
              summaryStats.longTxns > 0 &&
              (data?.longTransactions || []).some((t) => (t.xact_age_sec || 0) > 60)
                ? THEME.danger
                : THEME.textMain,
          }}
        >
          {summaryStats.longTxns}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: THEME.textMuted,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          margin: '0 auto 16px',
        }}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <circle cx="30" cy="30" r="25" stroke={THEME.primary} strokeWidth="2" fill="none" />
          <circle cx="30" cy="30" r="15" stroke={THEME.secondary} strokeWidth="1.5" fill="none" />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: `2px solid ${THEME.primary}`,
              opacity: 0,
              animation: 'radarPulse 2s ease-out infinite',
            }}
          />
        </div>
      </div>
      <p style={{ margin: '16px 0 0 0', fontSize: '13px', lineHeight: '1.5' }}>
        No correlated alert events captured yet. The engine polls every 30 seconds — check back
        shortly.
      </p>
    </div>
  );

  const renderCorrelationGroupsTab = () => {
    const groups = data?.correlationGroups || [];

    if (groups.length === 0) {
      return renderEmptyState();
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {groups.map((group) => {
          const isExpanded = expandedGroupId === group.id;
          const eventCount = (group.events || []).length;
          const durationMin = group.startTs && group.endTs
            ? Math.round((new Date(group.endTs) - new Date(group.startTs)) / 1000 / 60)
            : 0;

          return (
            <div
              key={group.id}
              style={{
                padding: '16px',
                background: THEME.glass,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() =>
                setExpandedGroupId(isExpanded ? null : group.id)
              }
            >
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {/* Severity Badge */}
                    <span
                      style={{
                        padding: '4px 8px',
                        background: getSeverityColor(group.severity),
                        color: THEME.bg,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}
                    >
                      {group.severity}
                    </span>

                    {/* Type Badges */}
                    {(group.types || []).map((type) => (
                      <span
                        key={type}
                        style={{
                          padding: '4px 8px',
                          background: THEME.surface,
                          border: `1px solid ${THEME.glassBorder}`,
                          borderRadius: '4px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: THEME.secondary,
                        }}
                      >
                        {getTypeIcon(type)}
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Time Range */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: THEME.textMuted,
                      fontSize: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <Clock size={14} />
                    {formatTimeRange(group.startTs, group.endTs)} ({durationMin}-min window)
                  </div>

                  {/* Root Cause */}
                  <div
                    style={{
                      padding: '12px',
                      background: THEME.surfaceHover,
                      borderRadius: '6px',
                      borderLeft: `3px solid ${THEME.primary}`,
                      marginTop: '8px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Lightbulb size={16} color={THEME.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ color: THEME.textMuted, fontSize: '11px', marginBottom: '2px' }}>
                        ROOT CAUSE
                      </div>
                      <div style={{ color: THEME.textMain, fontSize: '13px', fontWeight: '500' }}>
                        {group.rootCause || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <div
                  style={{
                    padding: '4px',
                    color: THEME.textMuted,
                  }}
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Event List (Expandable) */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${THEME.glassBorder}`,
                  }}
                >
                  <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '12px' }}>
                    {eventCount} events in {durationMin}-min window
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(group.events || []).map((event, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px',
                          background: THEME.bg,
                          borderRadius: '4px',
                          border: `1px solid ${THEME.textDim}`,
                          fontSize: '12px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ color: THEME.textMuted }}>
                          {formatTimeAgo(event.ts)}
                        </div>
                        <div style={{ color: THEME.secondary, display: 'flex', alignItems: 'center' }}>
                          {getTypeIcon(event.type)}
                        </div>
                        <div style={{ flex: 1, color: THEME.textMain }}>
                          {event.message}
                        </div>
                        <div style={{ color: THEME.info, fontWeight: '600' }}>
                          {event.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLiveSessionsTab = () => {
    return (
      <div>
        {/* Filter */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Filter by state..."
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: THEME.surface,
              border: `1px solid ${THEME.glassBorder}`,
              borderRadius: '4px',
              color: THEME.textMain,
              fontSize: '12px',
            }}
          />
        </div>

        {/* Table */}
        <div
          style={{
            overflowX: 'auto',
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: '6px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              color: THEME.textMain,
            }}
          >
            <thead>
              <tr
                style={{
                  background: THEME.surface,
                  borderBottom: `1px solid ${THEME.glassBorder}`,
                }}
              >
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  PID
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  User
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  Database
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  State
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  Waiting For
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  Query
                </th>
                <th
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    color: THEME.textMuted,
                    fontWeight: '600',
                  }}
                >
                  Age
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: THEME.textMuted,
                    }}
                  >
                    No sessions found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isOldSession = (session.age_sec || 0) > 60;
                  return (
                    <tr
                      key={session.pid}
                      style={{
                        borderBottom: `1px solid ${THEME.textDim}`,
                      }}
                    >
                      <td style={{ padding: '8px', color: THEME.info }}>
                        {session.pid}
                      </td>
                      <td style={{ padding: '8px', color: THEME.textMain }}>
                        {session.usename}
                      </td>
                      <td style={{ padding: '8px', color: THEME.textMain }}>
                        {session.datname}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            background:
                              session.state === 'active' ? THEME.success : THEME.surface,
                            color:
                              session.state === 'active' ? THEME.bg : THEME.textMuted,
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          {session.state}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: THEME.textMuted }}>
                        {session.wait_event_type
                          ? `${session.wait_event_type} (${session.wait_event})`
                          : '--'}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          color: THEME.textMain,
                          fontSize: '11px',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={session.query}
                      >
                        {session.query && session.query.substring(0, 60)}
                        {session.query && session.query.length > 60 ? '...' : ''}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          color: isOldSession ? THEME.danger : THEME.textMain,
                          fontWeight: isOldSession ? '600' : '400',
                        }}
                      >
                        {formatTxnAge(session.age_sec)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRightColumn = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Session State Breakdown */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: THEME.textMain, fontSize: '13px', fontWeight: '600' }}>
          Session State Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data?.sessionStates || []).map((state) => {
            const barWidth = Math.max(
              10,
              ((state.cnt || 0) / Math.max(...(data?.sessionStates || []).map((s) => s.cnt || 0))) *
                100
            );
            return (
              <div key={`${state.state}-${state.wait_event_type}`}>
                <div
                  style={{
                    fontSize: '11px',
                    color: THEME.textMuted,
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {state.state} {state.wait_event_type ? `(${state.wait_event_type})` : ''}
                  </span>
                  <span style={{ color: THEME.info }}>{state.cnt}</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: THEME.bg,
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: state.wait_event_type === 'Lock' ? THEME.danger : THEME.primary,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lock Summary */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: THEME.textMain, fontSize: '13px', fontWeight: '600' }}>
          Lock Summary
        </h3>
        {(data?.lockSummary || []).length === 0 ? (
          <div style={{ color: THEME.textMuted, fontSize: '12px' }}>No locks held</div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px',
                color: THEME.textMain,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: '4px',
                      textAlign: 'left',
                      color: THEME.textMuted,
                      fontWeight: '600',
                      borderBottom: `1px solid ${THEME.glassBorder}`,
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: '4px',
                      textAlign: 'left',
                      color: THEME.textMuted,
                      fontWeight: '600',
                      borderBottom: `1px solid ${THEME.glassBorder}`,
                    }}
                  >
                    Mode
                  </th>
                  <th
                    style={{
                      padding: '4px',
                      textAlign: 'left',
                      color: THEME.textMuted,
                      fontWeight: '600',
                      borderBottom: `1px solid ${THEME.glassBorder}`,
                    }}
                  >
                    Granted
                  </th>
                  <th
                    style={{
                      padding: '4px',
                      textAlign: 'left',
                      color: THEME.textMuted,
                      fontWeight: '600',
                      borderBottom: `1px solid ${THEME.glassBorder}`,
                    }}
                  >
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data?.lockSummary || []).map((lock, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '4px', color: THEME.textMain }}>
                      {lock.locktype}
                    </td>
                    <td style={{ padding: '4px', color: THEME.secondary }}>
                      {lock.mode}
                    </td>
                    <td style={{ padding: '4px', color: THEME.textMain }}>
                      {lock.granted ? (
                        <span style={{ color: THEME.success }}>✓</span>
                      ) : (
                        <span style={{ color: THEME.danger }}>✗</span>
                      )}
                    </td>
                    <td style={{ padding: '4px', color: THEME.info }}>
                      {lock.cnt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Long Transactions */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: THEME.textMain, fontSize: '13px', fontWeight: '600' }}>
          Long Transactions
        </h3>
        {(data?.longTransactions || []).length === 0 ? (
          <div style={{ color: THEME.textMuted, fontSize: '12px' }}>None detected</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(data?.longTransactions || []).map((txn) => (
              <div
                key={txn.pid}
                style={{
                  padding: '12px',
                  background: THEME.surfaceHover,
                  borderRadius: '6px',
                  borderLeft: `3px solid ${
                    (txn.xact_age_sec || 0) > 60 ? THEME.danger : THEME.warning
                  }`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: '600', color: THEME.textMain }}>
                    PID {txn.pid} ({txn.usename})
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color:
                        (txn.xact_age_sec || 0) > 60 ? THEME.danger : THEME.warning,
                    }}
                  >
                    {formatTxnAge(txn.xact_age_sec)}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: THEME.textMuted, marginBottom: '6px' }}>
                  DB: {txn.datname}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: THEME.textMain,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={txn.query}
                >
                  {txn.query}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloated Tables */}
      <div
        style={{
          padding: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: THEME.textMain, fontSize: '13px', fontWeight: '600' }}>
          Bloated Tables
        </h3>
        {(data?.bloatedTables || []).length === 0 ? (
          <div style={{ color: THEME.textMuted, fontSize: '12px' }}>None detected</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data?.bloatedTables || []).map((table) => {
              const deadPct = table.dead_pct || 0;
              return (
                <div key={table.table_name}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: THEME.textMuted,
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: '600', color: THEME.textMain }}>
                      {table.table_name}
                    </span>
                    <span style={{ color: deadPct > 20 ? THEME.danger : THEME.warning }}>
                      {deadPct.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: THEME.bg,
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(deadPct, 100)}%`,
                        background: deadPct > 20 ? THEME.danger : THEME.warning,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '4px' }}>
                    {table.n_dead_tup} dead / {table.n_live_tup} live
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderHealthBanner = () => {
    let bannerColor, bannerBg, bannerIcon, bannerText;

    if (healthStatus === 'critical') {
      bannerColor = THEME.danger;
      bannerBg = `rgba(255, 69, 96, 0.1)`;
      bannerIcon = <AlertTriangle size={18} />;
      bannerText = 'CRITICAL: Severe contention or long-running transactions detected. Immediate intervention required.';
    } else if (healthStatus === 'warning') {
      bannerColor = THEME.warning;
      bannerBg = `rgba(255, 181, 32, 0.1)`;
      bannerIcon = <AlertTriangle size={18} />;
      bannerText = 'WARNING: Table bloat or elevated lock contention. Review vacuum schedule and queries.';
    } else {
      bannerColor = THEME.success;
      bannerBg = `rgba(46, 232, 156, 0.1)`;
      bannerIcon = <CheckCircle size={18} />;
      bannerText = 'All systems healthy. No critical alerts detected.';
    }

    return (
      <div
        style={{
          padding: '16px 24px',
          background: bannerBg,
          border: `1px solid ${bannerColor}`,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: bannerColor,
          marginTop: '24px',
        }}
      >
        {bannerIcon}
        <span style={{ fontSize: '13px', fontWeight: '500' }}>
          {bannerText}
        </span>
      </div>
    );
  };

  // ====== MAIN RENDER ======
  return (
    <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.textMain }}>
      <Styles />

      {renderHeader()}

      <div style={{ padding: '0 24px' }}>
        {renderSummaryCards()}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: `rgba(255, 69, 96, 0.1)`,
              border: `1px solid ${THEME.danger}`,
              borderRadius: '6px',
              color: THEME.danger,
              fontSize: '12px',
              marginBottom: '24px',
            }}
          >
            Error: {error}
          </div>
        )}

        {/* Three-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {/* LEFT COLUMN */}
          <div>
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '0',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                marginBottom: '24px',
              }}
            >
              <button
                onClick={() => setActiveLeftTab('groups')}
                style={{
                  padding: '12px 16px',
                  background: activeLeftTab === 'groups' ? THEME.surface : 'transparent',
                  border: 'none',
                  color: activeLeftTab === 'groups' ? THEME.primary : THEME.textMuted,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderBottom:
                    activeLeftTab === 'groups'
                      ? `2px solid ${THEME.primary}`
                      : 'none',
                  marginBottom: '-1px',
                }}
              >
                Correlation Groups
              </button>
              <button
                onClick={() => setActiveLeftTab('sessions')}
                style={{
                  padding: '12px 16px',
                  background: activeLeftTab === 'sessions' ? THEME.surface : 'transparent',
                  border: 'none',
                  color: activeLeftTab === 'sessions' ? THEME.primary : THEME.textMuted,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderBottom:
                    activeLeftTab === 'sessions'
                      ? `2px solid ${THEME.primary}`
                      : 'none',
                  marginBottom: '-1px',
                }}
              >
                Live Sessions
              </button>
            </div>

            {/* Tab Content */}
            {loading && summaryStats.groups === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: THEME.textMuted,
                }}
              >
                <Activity size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                Loading correlation data...
              </div>
            )}

            {!loading && activeLeftTab === 'groups' && renderCorrelationGroupsTab()}
            {!loading && activeLeftTab === 'sessions' && renderLiveSessionsTab()}
          </div>

          {/* RIGHT COLUMN */}
          {!loading && renderRightColumn()}
        </div>

        {/* Health Banner */}
        {!loading && renderHealthBanner()}
      </div>
    </div>
  );
}
