
import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  RefreshCw,
  AlertTriangle,
  Clock,
  Database,
  Activity,
  Search,
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { THEME } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api.js';

const Styles = () => (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    .slide-up {
      animation: slideUp 0.4s ease-out;
    }
  `}</style>
);

// Summary Card Component
const SummaryCard = ({ label, value, subtext, color = THEME.primary, isLoading }) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '12px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
          {label}
        </div>
        <div
          style={{
            height: '32px',
            background: THEME.textDim,
            borderRadius: '6px',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="slide-up"
      style={{
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `rgba(0, 212, 255, 0.08)`;
        e.currentTarget.style.borderColor = `rgba(0, 212, 255, 0.25)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = THEME.glass;
        e.currentTarget.style.borderColor = THEME.glassBorder;
      }}
    >
      <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '28px', fontWeight: '600', color, fontFamily: THEME.fontDisplay }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: THEME.textMuted }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

// Lock Waits Table
const LockWaitsTable = ({ lockWaits }) => {
  if (!lockWaits || lockWaits.length === 0) {
    return (
      <div
        style={{
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '12px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: THEME.textMuted,
        }}
      >
        No active lock waits detected
      </div>
    );
  }

  return (
    <div
      style={{
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: THEME.fontMono,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocked PID
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocked User
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Query
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocking PID
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocking User
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Wait (s)
              </th>
            </tr>
          </thead>
          <tbody>
            {lockWaits.map((wait, idx) => {
              const waitColor = wait.wait_sec > 30 ? THEME.danger : THEME.warning;
              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${THEME.grid}`,
                    ':hover': { background: THEME.surfaceHover },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 16px', color: THEME.textMain, fontSize: '13px' }}>
                    {wait.blocked_pid}
                  </td>
                  <td style={{ padding: '12px 16px', color: THEME.textMain, fontSize: '13px' }}>
                    {wait.blocked_user}
                  </td>
                  <td style={{ padding: '12px 16px', color: THEME.textMuted, fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wait.blocked_query}
                  </td>
                  <td style={{ padding: '12px 16px', color: THEME.textMain, fontSize: '13px' }}>
                    {wait.blocking_pid}
                  </td>
                  <td style={{ padding: '12px 16px', color: THEME.textMain, fontSize: '13px' }}>
                    {wait.blocking_user}
                  </td>
                  <td style={{ padding: '12px 16px', color: waitColor, fontSize: '13px', fontWeight: '500' }}>
                    {wait.wait_sec.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Wait Event Breakdown
const WaitEventBreakdown = ({ waitEvents }) => {
  if (!waitEvents || waitEvents.length === 0) {
    return null;
  }

  const colors = [
    THEME.danger,
    THEME.warning,
    THEME.primary,
    THEME.secondary,
    THEME.success,
    THEME.ai,
    THEME.info,
  ];

  const total = waitEvents.reduce((sum, e) => sum + e.count, 0);

  return (
    <div
      style={{
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        marginTop: '16px',
      }}
    >
      <div style={{ marginBottom: '16px', color: THEME.textMain, fontWeight: '500' }}>
        Wait Event Breakdown
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {waitEvents.map((event, idx) => {
          const percentage = (event.count / total) * 100;
          const color = colors[idx % colors.length];
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ color: THEME.textMain, fontSize: '13px' }}>
                  {event.wait_event_type} - {event.wait_event}
                </div>
                <div style={{ color, fontSize: '13px', fontWeight: '500' }}>
                  {event.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
              <div
                style={{
                  height: '8px',
                  background: THEME.grid,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: color,
                    transition: 'width 0.3s ease',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Slow Queries Table
const SlowQueriesTable = ({ slowQueries, searchTerm, onSearchChange }) => {
  const filtered = (slowQueries || []).filter((q) =>
    q.query_preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMeanColor = (mean) => {
    if (mean < 100) return THEME.success;
    if (mean < 500) return THEME.warning;
    return THEME.danger;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '8px',
          padding: '8px 12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Search size={16} style={{ color: THEME.textMuted, marginRight: '8px' }} />
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: THEME.textMain,
            fontSize: '13px',
            outline: 'none',
            '::placeholder': { color: THEME.textMuted },
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: THEME.glass,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: '12px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            color: THEME.textMuted,
          }}
        >
          No slow queries found
        </div>
      ) : (
        <div
          style={{
            background: THEME.glass,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: THEME.fontMono,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Query
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Calls
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Mean (ms)
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Max (ms)
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    StdDev
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: THEME.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const meanColor = getMeanColor(q.mean_ms);
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: `1px solid ${THEME.grid}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = THEME.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: THEME.textMain, fontSize: '13px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.query_preview}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMain, fontSize: '13px' }}>
                        {q.calls.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: meanColor, fontSize: '13px', fontWeight: '500' }}>
                        {q.mean_ms.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMain, fontSize: '13px' }}>
                        {q.max_ms.toFixed(0)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: THEME.textMain, fontSize: '13px' }}>
                        {q.stddev_ms.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: THEME.grid,
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(q.pct_total, 100)}%`,
                                background: q.pct_total > 20 ? THEME.danger : THEME.secondary,
                              }}
                            />
                          </div>
                          <div style={{ color: THEME.textMain, fontSize: '12px', minWidth: '40px', textAlign: 'right' }}>
                            {q.pct_total.toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ color: THEME.textMuted, fontSize: '11px', marginTop: '4px' }}>
                          This query accounts for {q.pct_total.toFixed(1)}% of total query time
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// DB Activity Section
const DBActivitySection = ({ dbActivity }) => {
  if (!dbActivity || dbActivity.length === 0) {
    return (
      <div
        style={{
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '12px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: THEME.textMuted,
        }}
      >
        No database activity data available
      </div>
    );
  }

  const chartData = dbActivity.map((db) => ({
    name: db.datname,
    cache_hit_pct: parseFloat(db.cache_hit_pct),
  }));

  return (
    <div>
      {/* Database Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {dbActivity.map((db, idx) => {
          const cacheColor =
            db.cache_hit_pct > 95
              ? THEME.success
              : db.cache_hit_pct > 90
              ? THEME.warning
              : THEME.danger;

          return (
            <div
              key={idx}
              className="slide-up"
              style={{
                background: THEME.glass,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ color: THEME.textMain, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} style={{ color: THEME.primary }} />
                  {db.datname}
                </div>
                {db.deadlocks > 0 && (
                  <div
                    style={{
                      background: THEME.danger,
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {db.deadlocks} deadlock(s)
                  </div>
                )}
              </div>

              <div style={{ fontSize: '12px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Connections:</span>
                  <span style={{ color: THEME.textMain, fontWeight: '500' }}>
                    {db.numbackends}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Cache Hit:</span>
                  <span style={{ color: cacheColor, fontWeight: '500' }}>
                    {db.cache_hit_pct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Rollback Rate:</span>
                  <span
                    style={{
                      color: db.rollback_pct > 5 ? THEME.warning : THEME.success,
                      fontWeight: '500',
                    }}
                  >
                    {db.rollback_pct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Commits:</span>
                  <span style={{ color: THEME.textMain, fontWeight: '500' }}>
                    {db.xact_commit.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Temp Files:</span>
                  <span style={{ color: db.temp_files > 0 ? THEME.warning : THEME.success, fontWeight: '500' }}>
                    {db.temp_files}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cache Hit Ratio Chart */}
      <div
        style={{
          background: THEME.glass,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: '12px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ marginBottom: '16px', color: THEME.textMain, fontWeight: '500' }}>
          Cache Hit Ratio by Database
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke={THEME.textMuted} />
            <YAxis stroke={THEME.textMuted} />
            <Tooltip
              contentStyle={{
                background: THEME.surface,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '8px',
                color: THEME.textMain,
              }}
            />
            <Bar dataKey="cache_hit_pct" fill={THEME.secondary} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Health Insights Panel
const HealthInsights = ({ data }) => {
  const insights = [];

  if (data.lockWaits && data.lockWaits.length > 0) {
    insights.push({
      type: 'warning',
      message: `Active lock contention detected — ${data.lockWaits.length} blocked session(s)`,
      icon: AlertTriangle,
    });
  }

  if (
    data.slowQueries &&
    data.slowQueries.some((q) => q.pct_total > 20)
  ) {
    const maxQuery = data.slowQueries.reduce((max, q) =>
      q.pct_total > max.pct_total ? q : max
    );
    insights.push({
      type: 'warning',
      message: `One query consuming ${maxQuery.pct_total.toFixed(1)}% of total query time`,
      icon: TrendingUp,
    });
  }

  if (data.dbActivity && data.dbActivity.length > 0) {
    const db = data.dbActivity[0];
    if (db.cache_hit_pct < 95) {
      insights.push({
        type: 'warning',
        message: `Low cache hit ratio ${db.cache_hit_pct.toFixed(1)}% — consider increasing shared_buffers`,
        icon: Zap,
      });
    }
    if (db.deadlocks > 0) {
      insights.push({
        type: 'warning',
        message: `Deadlocks detected in ${db.datname}`,
        icon: Shield,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      message: 'No critical issues detected',
      icon: CheckCircle,
    });
  }

  return (
    <div
      style={{
        background: THEME.glass,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        marginTop: '24px',
      }}
    >
      <div style={{ color: THEME.textMain, fontWeight: '500', marginBottom: '16px' }}>
        Health Insights
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, idx) => {
          const IconComponent = insight.icon;
          const color = insight.type === 'warning' ? THEME.warning : THEME.success;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: THEME.surface,
                borderRadius: '8px',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <IconComponent size={18} style={{ color, marginTop: '2px', flexShrink: 0 }} />
              <div style={{ color: THEME.textMain, fontSize: '13px' }}>
                {insight.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
export default function LogPatternAnalysisTab() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('wait-events');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState('off');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('vigil_token');
      const result = await fetchData('/api/log-patterns/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(result);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (autoRefresh === 'off') return;

    const interval = setInterval(
      loadData,
      autoRefresh === '30s' ? 30000 : 60000
    );
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const lockWaitsCount = data?.lockWaits?.length || 0;
  const waitEventTypesCount = new Set(
    (data?.waitEvents || []).map((e) => e.wait_event_type)
  ).size;
  const slowQueriesCount = data?.slowQueries?.length || 0;
  const cacheHitRatio =
    data?.dbActivity?.[0]?.cache_hit_pct || 0;

  const getCacheHitColor = (value) => {
    if (value > 95) return THEME.success;
    if (value > 90) return THEME.warning;
    return THEME.danger;
  };

  return (
    <div style={{ padding: '24px', fontFamily: THEME.fontBody }}>
      <Styles />

      {/* Header */}
      <div
        className="fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileSearch size={28} style={{ color: THEME.primary }} />
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: THEME.textMain,
              margin: 0,
              fontFamily: THEME.fontDisplay,
            }}
          >
            Log Pattern Analysis
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: THEME.textMuted,
              fontSize: '12px',
            }}
          >
            <Clock size={14} />
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={loadData}
            style={{
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
              border: 'none',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <select
            value={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.value)}
            style={{
              background: THEME.surface,
              border: `1px solid ${THEME.glassBorder}`,
              color: THEME.textMain,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <option value="off">Auto-Refresh: Off</option>
            <option value="30s">Auto-Refresh: 30s</option>
            <option value="1m">Auto-Refresh: 1m</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <SummaryCard
          label="Active Lock Waits"
          value={lockWaitsCount}
          color={lockWaitsCount > 0 ? THEME.danger : THEME.success}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Wait Event Types"
          value={waitEventTypesCount}
          color={THEME.primary}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Slow Query Patterns"
          value={slowQueriesCount}
          color={THEME.warning}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Cache Hit Ratio"
          value={`${cacheHitRatio.toFixed(1)}%`}
          color={getCacheHitColor(cacheHitRatio)}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div
          style={{
            background: `rgba(255, 69, 96, 0.1)`,
            border: `1px solid ${THEME.danger}`,
            borderRadius: '12px',
            padding: '16px',
            color: THEME.danger,
            marginBottom: '24px',
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: `1px solid ${THEME.grid}`,
        }}
      >
        {['wait-events', 'slow-queries', 'db-activity'].map((tab) => {
          const labels = {
            'wait-events': 'Wait Events',
            'slow-queries': 'Slow Queries',
            'db-activity': 'DB Activity',
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? THEME.primary : THEME.textMuted,
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                borderBottom: isActive ? `2px solid ${THEME.primary}` : 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = THEME.textMain;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = THEME.textMuted;
                }
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === 'wait-events' && (
          <div>
            <h2 style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
              Lock Waits
            </h2>
            <LockWaitsTable lockWaits={data?.lockWaits} />
            <WaitEventBreakdown waitEvents={data?.waitEvents} />
          </div>
        )}

        {activeTab === 'slow-queries' && (
          <div>
            <h2 style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
              Slow Queries
            </h2>
            <SlowQueriesTable
              slowQueries={data?.slowQueries}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        )}

        {activeTab === 'db-activity' && (
          <div>
            <h2 style={{ color: THEME.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
              Database Activity
            </h2>
            <DBActivitySection dbActivity={data?.dbActivity} />
          </div>
        )}
      </div>

      {/* Health Insights */}
      {data && (
        <HealthInsights data={data} />
      )}
    </div>
  );
}
