/**
 * Tremor-style KPI / Metric Card.
 * Clean, minimal design with large metrics — Tremor's signature aesthetic.
 * No colored left borders, no glass effects — just clean data presentation.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  detail?: string;
  icon: LucideIcon;
  color: string;
  healthy?: boolean;
  sparkline?: React.ReactNode;
  delta?: string;
  deltaType?: 'increase' | 'decrease' | 'unchanged';
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sub,
  detail,
  icon: Icon,
  color,
  healthy,
  sparkline,
  delta,
  deltaType = 'unchanged',
}) => (
  <div
    className="tremor-kpi"
    style={{
      padding: '24px',
      borderRadius: 12,
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
  >
    {/* Top row: label + icon */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span
        style={{
          fontSize: 13,
          color: THEME.textMuted,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </span>
      <Icon size={18} color={THEME.textDim} strokeWidth={1.8} />
    </div>

    {/* Value */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: sub ? 4 : 0 }}>
      <span
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: THEME.textMain,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontFamily: THEME.fontBody,
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 13, color: THEME.textDim, fontWeight: 400 }}>
          {sub}
        </span>
      )}
    </div>

    {/* Sparkline slot */}
    {sparkline && <div style={{ marginTop: 12 }}>{sparkline}</div>}

    {/* Detail / delta row */}
    {(detail || delta) && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${THEME.glassBorder}`,
        }}
      >
        {/* Delta badge */}
        {delta && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: THEME.fontMono,
              color: deltaType === 'increase'
                ? (healthy !== false ? THEME.success : THEME.danger)
                : deltaType === 'decrease'
                  ? (healthy !== false ? THEME.danger : THEME.success)
                  : THEME.textDim,
              padding: '2px 8px',
              borderRadius: 6,
              background: deltaType === 'increase'
                ? (healthy !== false ? `${THEME.success}12` : `${THEME.danger}12`)
                : deltaType === 'decrease'
                  ? (healthy !== false ? `${THEME.danger}12` : `${THEME.success}12`)
                  : `${THEME.textDim}12`,
            }}
          >
            {deltaType === 'increase' && <ArrowUpRight size={12} />}
            {deltaType === 'decrease' && <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
        {detail && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: healthy ? THEME.success : healthy === false ? THEME.warning : THEME.textDim,
            }}
          >
            {detail}
          </span>
        )}
      </div>
    )}
  </div>
);

export default KpiCard;