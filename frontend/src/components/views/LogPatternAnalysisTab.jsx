'use client';

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
import { theme } from '../../utils/theme.jsx';
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
const SummaryCard = ({ label, value, subtext, color = theme.primary, isLoading }) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: theme.glass,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: '12px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>
          {label}
        </div>
        <div
          style={{
            height: '32px',
            background: theme.textDim,
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
        background: theme.glass,
        border: `1px solid ${theme.glassBorder}`,
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
        e.currentTarget.style.background = theme.glass;
        e.currentTarget.style.borderColor = theme.glassBorder;
      }}
    >
      <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '28px', fontWeight: '600', color, fontFamily: theme.fontDisplay }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: theme.textMuted }}>
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
          background: theme.glass,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: '12px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: theme.textMuted,
        }}
      >
        No active lock waits detected
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.glass,
        border: `1px solid ${theme.glassBorder}`,
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
            fontFamily: theme.fontMono,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.grid}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocked PID
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocked User
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Query
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocking PID
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Blocking User
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                Wait (s)
              </th>
            </tr>
          </thead>
          <tbody>
            {lockWaits.map((wait, idx) => {
              const waitColor = wait.wait_sec > 30 ? theme.danger : theme.warning;
              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${theme.grid}`,
                    ':hover': { background: theme.surfaceHover },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 16px', color: theme.textMain, fontSize: '13px' }}>
                    {wait.blocked_pid}
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.textMain, fontSize: '13px' }}>
                    {wait.blocked_user}
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.textMuted, fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wait.blocked_query}
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.textMain, fontSize: '13px' }}>
                    {wait.blocking_pid}
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.textMain, fontSize: '13px' }}>
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
    theme.danger,
    theme.warning,
    theme.primary,
    theme.secondary,
    theme.success,
    theme.ai,
    theme.info,
  ];

  const total = waitEvents.reduce((sum, e) => sum + e.count, 0);

  return (
    <div
      style={{
        background: theme.glass,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        marginTop: '16px',
      }}
    >
      <div style={{ marginBottom: '16px', color: theme.textMain, fontWeight: '500' }}>
        Wait Event Breakdown
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {waitEvents.map((event, idx) => {
          const percentage = (event.count / total) * 100;
          const color = colors[idx % colors.length];
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ color: theme.textMain, fontSize: '13px' }}>
                  {event.wait_event_type} - {event.wait_event}
                </div>
                <div style={{ color, fontSize: '13px', fontWeight: '500' }}>
                  {event.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
              <div
                style={{
                  height: '8px',
                  background: theme.grid,
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
    if (mean < 100) return theme.success;
    if (mean < 500) return theme.warning;
    return theme.danger;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          background: theme.glass,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: '8px',
          padding: '8px 12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Search size={16} style={{ color: theme.textMuted, marginRight: '8px' }} />
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: theme.textMain,
            fontSize: '13px',
            outline: 'none',
            '::placeholder': { color: theme.textMuted },
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: theme.glass,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: '12px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            color: theme.textMuted,
          }}
        >
          No slow queries found
        </div>
      ) : (
        <div
          style={{
            background: theme.glass,
            border: `1px solid ${theme.glassBorder}`,
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
                fontFamily: theme.fontMono,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.grid}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Query
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Calls
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Mean (ms)
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    Max (ms)
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
                    StdDev
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textMuted, fontWeight: '500', fontSize: '12px' }}>
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
                        borderBottom: `1px solid ${theme.grid}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: theme.textMain, fontSize: '13px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.query_preview}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMain, fontSize: '13px' }}>
                        {q.calls.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: meanColor, fontSize: '13px', fontWeight: '500' }}>
                        {q.mean_ms.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMain, fontSize: '13px' }}>
                        {q.max_ms.toFixed(0)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: theme.textMain, fontSize: '13px' }}>
                        {q.stddev_ms.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: theme.grid,
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(q.pct_total, 100)}%`,
                                background: q.pct_total > 20 ? theme.danger : theme.secondary,
                              }}
                            />
                          </div>
                          <div style={{ color: theme.textMain, fontSize: '12px', minWidth: '40px', textAlign: 'right' }}>
                            {q.pct_total.toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '4px' }}>
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
          background: theme.glass,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: '12px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: theme.textMuted,
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
              ? theme.success
              : db.cache_hit_pct > 90
              ? theme.warning
              : theme.danger;

          return (
            <div
              key={idx}
              className="slide-up"
              style={{
                background: theme.glass,
                border: `1px solid ${theme.glassBorder}`,
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ color: theme.textMain, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} style={{ color: theme.primary }} />
                  {db.datname}
                </div>
                {db.deadlocks > 0 && (
                  <div
                    style={{
                      background: theme.danger,
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
                  <span style={{ color: theme.textMuted }}>Connections:</span>
                  <span style={{ color: theme.textMain, fontWeight: '500' }}>
                    {db.numbackends}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Cache Hit:</span>
                  <span style={{ color: cacheColor, fontWeight: '500' }}>
                    {db.cache_hit_pct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Rollback Rate:</span>
                  <span
                    style={{
                      color: db.rollback_pct > 5 ? theme.warning : theme.success,
                      fontWeight: '500',
                    }}
                  >
                    {db.rollback_pct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Commits:</span>
                  <span style={{ color: theme.textMain, fontWeight: '500' }}>
                    {db.xact_commit.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.textMuted }}>Temp Files:</span>
                  <span style={{ color: db.temp_files > 0 ? theme.warning : theme.success, fontWeight: '500' }}>
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
          background: theme.glass,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: '12px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ marginBottom: '16px', color: theme.textMain, fontWeight: '500' }}>
          Cache Hit Ratio by Database
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke={theme.textMuted} />
            <YAxis stroke={theme.textMuted} />
            <Tooltip
              contentStyle={{
                background: theme.surface,
                border: `1px solid ${theme.glassBorder}`,
                borderRadius: '8px',
                color: theme.textMain,
              }}
            />
            <Bar dataKey="cache_hit_pct" fill={theme.secondary} radius={[8, 8, 0, 0]} />
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
        background: theme.glass,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        marginTop: '24px',
      }}
    >
      <div style={{ color: theme.textMain, fontWeight: '500', marginBottom: '16px' }}>
        Health Insights
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, idx) => {
          const IconComponent = insight.icon;
          const color = insight.type === 'warning' ? theme.warning : theme.success;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: theme.surface,
                borderRadius: '8px',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <IconComponent size={18} style={{ color, marginTop: '2px', flexShrink: 0 }} />
              <div style={{ color: theme.textMain, fontSize: '13px' }}>
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
    if (value > 95) return theme.success;
    if (value > 90) return theme.warning;
    return theme.danger;
  };

  return (
    <div style={{ padding: '24px', fontFamily: theme.fontBody }}>
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
          <FileSearch size={28} style={{ color: theme.primary }} />
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: theme.textMain,
              margin: 0,
              fontFamily: theme.fontDisplay,
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
              color: theme.textMuted,
              fontSize: '12px',
            }}
          >
            <Clock size={14} />
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={loadData}
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
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
              background: theme.surface,
              border: `1px solid ${theme.glassBorder}`,
              color: theme.textMain,
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
          color={lockWaitsCount > 0 ? theme.danger : theme.success}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Wait Event Types"
          value={waitEventTypesCount}
          color={theme.primary}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Slow Query Patterns"
          value={slowQueriesCount}
          color={theme.warning}
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
            border: `1px solid ${theme.danger}`,
            borderRadius: '12px',
            padding: '16px',
            color: theme.danger,
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
          borderBottom: `1px solid ${theme.grid}`,
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
                color: isActive ? theme.primary : theme.textMuted,
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                borderBottom: isActive ? `2px solid ${theme.primary}` : 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = theme.textMain;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = theme.textMuted;
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
            <h2 style={{ color: theme.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
              Lock Waits
            </h2>
            <LockWaitsTable lockWaits={data?.lockWaits} />
            <WaitEventBreakdown waitEvents={data?.waitEvents} />
          </div>
        )}

        {activeTab === 'slow-queries' && (
          <div>
            <h2 style={{ color: theme.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
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
            <h2 style={{ color: theme.textMain, fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>
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
