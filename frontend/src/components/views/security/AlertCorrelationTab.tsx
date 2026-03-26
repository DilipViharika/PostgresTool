import React, { useState, useEffect, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import {
  Filter, Search, RefreshCw, ChevronDown, Clock, AlertTriangle,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Zap, Activity,
  Database, Server, BarChart2, PieChart, LineChart
} from 'lucide-react';

// TYPE DEFINITIONS
interface CorrelationData {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedServices: string[];
  affectedUsers: number;
  timestamp: number;
  relatedAlerts: string[];
  rootCause?: string;
  temporalDistance?: number;
  correlationScore: number;
}

interface CorrelationPattern {
  patternId: string;
  name: string;
  alerts: CorrelationData[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  firstSeen: number;
  frequency: number;
  affectedCount: number;
}

const AlertCorrelationTab: React.FC = () => {
  useAdaptiveTheme();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationPattern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const mockPatterns: CorrelationPattern[] = [
    {
      patternId: 'corr-001',
      name: 'Database Performance Degradation Cascade',
      severity: 'critical',
      alerts: [],
      frequency: 12,
      affectedCount: 8400,
      firstSeen: Date.now() - 3600000,
    },
    {
      patternId: 'corr-002',
      name: 'Authentication Service Failures',
      severity: 'high',
      alerts: [],
      frequency: 8,
      affectedCount: 24000,
      firstSeen: Date.now() - 7200000,
    },
    {
      patternId: 'corr-003',
      name: 'Memory Leak Detection',
      severity: 'medium',
      alerts: [],
      frequency: 5,
      affectedCount: 3200,
      firstSeen: Date.now() - 86400000,
    },
  ];

  useEffect(() => {
    setCorrelationData(mockPatterns);
    setLoading(false);
  }, []);

  const filteredPatterns = useMemo(() => {
    return correlationData.filter(pattern => {
      if (filterSeverity !== 'all' && pattern.severity !== filterSeverity) return false;
      if (searchTerm && !pattern.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [correlationData, filterSeverity, searchTerm]);

  const severityColors: Record<string, string> = {
    critical: '#ff465a',
    high: '#ff8c42',
    medium: '#f5c518',
    low: '#63d7ff',
  };

  return (
    <div style={{ padding: '20px', fontFamily: THEME.fontBody, color: THEME.textMain }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Alert Correlation</h1>
        <p style={{ color: THEME.textMuted }}>
          Analyze patterns and relationships between related security alerts
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: THEME.textMuted }} />
          <input
            type="text"
            placeholder="Search correlations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              background: THEME.surface,
              border: `1px solid ${THEME.grid}`,
              borderRadius: '6px',
              color: THEME.textMain,
              fontSize: '13px',
            }}
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{
            padding: '10px 12px',
            background: THEME.surface,
            border: `1px solid ${THEME.grid}`,
            borderRadius: '6px',
            color: THEME.textMain,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          style={{
            padding: '10px 16px',
            background: THEME.primary,
            border: 'none',
            borderRadius: '6px',
            color: THEME.bg,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} /> Analyze
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Patterns', value: correlationData.length.toString(), color: THEME.primary },
          { label: 'Critical', value: correlationData.filter(p => p.severity === 'critical').length.toString(), color: '#ff465a' },
          { label: 'Users Affected', value: '35.6k', color: '#f5c518' },
          { label: 'Avg Frequency', value: '8.3×', color: '#4ade80' },
        ].map(stat => (
          <div key={stat.label} style={{ background: THEME.surface, padding: '14px', borderRadius: '8px', border: `1px solid ${THEME.grid}` }}>
            <div style={{ fontSize: '11px', color: THEME.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Alert Patterns</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPatterns.map(pattern => (
            <div
              key={pattern.patternId}
              style={{
                background: THEME.surface,
                border: `1px solid ${THEME.grid}`,
                borderRadius: '8px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => setExpandedPattern(expandedPattern === pattern.patternId ? null : pattern.patternId)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: severityColors[pattern.severity],
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{pattern.name}</div>
                    <div style={{ fontSize: '11px', color: THEME.textMuted, marginTop: '4px' }}>
                      {pattern.frequency}× in last 24h · {pattern.affectedCount.toLocaleString()} users affected
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: THEME.textMuted,
                    transform: expandedPattern === pattern.patternId ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>

              {expandedPattern === pattern.patternId && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${THEME.grid}`, color: THEME.textMuted, fontSize: '12px' }}>
                  <p>Correlation analysis details for this pattern...</p>
                </div>
              )}
            </div>
          ))}

          {filteredPatterns.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textDim }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No correlation patterns match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCorrelationTab;
