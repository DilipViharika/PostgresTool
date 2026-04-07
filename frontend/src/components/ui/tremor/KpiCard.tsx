/**
 * Advanced KPI / Metric Card with rich visual styling.
 * Colored left accent border, glass morphism, glow effects, gradient overlays.
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
      padding: '20px 20px 20px 24px',
      borderRadius: 14,
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderLeft: `3.5px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: THEME.shadowMd,
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    }}
  >
    {/* Gradient overlay — top right glow */}
    <div
      style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />

    {/* Subtle glass shine */}
    <div className="tremor-card-shine" />

    {/* Top row: label + icon */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span
        style={{
          fontSize: 12,
          color: THEME.textMuted,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: `${color}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}20`,
        }}
      >
        <Icon size={16} color={color} strokeWidth={2} />
      </div>
    </div>

    {/* Value */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: sub ? 4 : 0 }}>
      <span
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: THEME.textMain,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontFamily: THEME.fontBody,
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 13, color: THEME.textDim, fontWeight: 500 }}>
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
          gap: 8,
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${THEME.glassBorder}`,
        }}
      >
        {/* Delta badge with glow */}
        {delta && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: THEME.fontMono,
              color: deltaType === 'increase'
                ? (healthy !== false ? THEME.success : THEME.danger)
                : deltaType === 'decrease'
                  ? (healthy !== false ? THEME.danger : THEME.success)
                  : THEME.textDim,
              padding: '3px 10px',
              borderRadius: 8,
              background: deltaType === 'increase'
                ? (healthy !== false ? `${THEME.success}18` : `${THEME.danger}18`)
                : deltaType === 'decrease'
                  ? (healthy !== false ? `${THEME.danger}18` : `${THEME.success}18`)
                  : `${THEME.textDim}15`,
              border: `1px solid ${
                deltaType === 'increase'
                  ? (healthy !== false ? `${THEME.success}25` : `${THEME.danger}25`)
                  : deltaType === 'decrease'
                    ? (healthy !== false ? `${THEME.danger}25` : `${THEME.success}25`)
                    : `${THEME.textDim}20`
              }`,
              boxShadow: deltaType !== 'unchanged'
                ? `0 0 8px ${
                    deltaType === 'increase'
                      ? (healthy !== false ? `${THEME.success}15` : `${THEME.danger}15`)
                      : (healthy !== false ? `${THEME.danger}15` : `${THEME.success}15`)
                  }`
                : 'none',
            }}
          >
            {deltaType === 'increase' && <ArrowUpRight size={13} strokeWidth={2.5} />}
            {deltaType === 'decrease' && <ArrowDownRight size={13} strokeWidth={2.5} />}
            {delta}
          </span>
        )}
        {detail && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
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