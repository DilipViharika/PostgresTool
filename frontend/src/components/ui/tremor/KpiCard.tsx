/**
 * Tremor-inspired KPI / Metric Card.
 * Shows a single key metric with icon, label, value, sub-text, and health indicator.
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
    className="tremor-kpi"
    style={{
      display: 'flex',
      flexDirection: 'row',
      gap: 14,
      padding: '18px 20px',
      borderRadius: 16,
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderLeft: `4px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: THEME.shadowMd,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
        background: `${color}14`,
      }}
    >
      <Icon size={20} color={color} />
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

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: THEME.textMain,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontFamily: THEME.fontMono,
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

      {/* Sparkline slot */}
      {sparkline && <div style={{ marginTop: 6 }}>{sparkline}</div>}

      {/* Detail / health indicator */}
      {detail && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          {healthy !== undefined && (
            healthy ? (
              <CheckCircle size={12} color={THEME.success} />
            ) : (
              <AlertTriangle size={12} color={THEME.warning} />
            )
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: healthy ? THEME.success : THEME.warning,
              fontFamily: THEME.fontMono,
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
