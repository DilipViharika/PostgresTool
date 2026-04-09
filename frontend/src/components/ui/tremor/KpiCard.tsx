/**
 * KPI / Metric Card — Clean, minimal, premium.
 * Rich feel through typography, spacing, and subtle color accents.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';
import { CheckCircle, AlertTriangle } from 'lucide-react';
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
}) => (
  <div
    className="vigil-card ov-metric-card"
    style={{
      display: 'flex',
      flexDirection: 'row',
      gap: 16,
      padding: '20px',
      borderRadius: 16,
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderTop: `2px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: THEME.shadowSm,
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}10`,
      }}
    >
      <Icon size={20} color={color} strokeWidth={2} />
    </div>

    {/* Content */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          color: THEME.textMuted,
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          className="ov-mono"
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: THEME.textMain,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 500 }}>
            {sub}
          </span>
        )}
      </div>

      {sparkline && <div style={{ marginTop: 8 }}>{sparkline}</div>}

      {detail && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 8,
            padding: '3px 8px',
            borderRadius: 6,
            background: healthy ? `${THEME.success}10` : `${THEME.warning}10`,
          }}
        >
          {healthy ? (
            <CheckCircle size={12} color={THEME.success} />
          ) : (
            <AlertTriangle size={12} color={THEME.warning} />
          )}
          <span
            className="ov-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: healthy ? THEME.success : THEME.warning,
            }}
          >
            {detail}
          </span>
        </div>
      )}
    </div>
  </div>
);

export default KpiCard;