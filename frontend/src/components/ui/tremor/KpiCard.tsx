/**
 * KPI / Metric Card — Modern visual redesign with gradient backgrounds,
 * glowing accents, decorative elements, and enhanced visual hierarchy.
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
}) => {
  // Helper to convert hex to RGB for gradient/glow effects
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '100, 100, 100';
  };

  const accentRgb = hexToRgb(color);
  const accentLight = `rgba(${accentRgb}, 0.08)`;
  const accentGlow = `rgba(${accentRgb}, 0.24)`;

  return (
    <div
      className="ov-metric-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        // Gradient background from surface to faint accent tint
        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${accentLight} 100%)`,
        border: `1px solid ${THEME.glassBorder}`,
        // Gradient left border (4px)
        borderLeft: `4px solid`,
        borderImage: `linear-gradient(180deg, ${color} 0%, ${color}40 100%) 1`,
        // Backdrop blur effect
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px ${accentGlow}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '160px',
      }}
    >
      {/* Top-right decorative gradient orb */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main content container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: '16px',
        }}
      >
        {/* Icon box — gradient background with glow shadow */}
        <div
          style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Gradient from 40% to 15% opacity
            background: `linear-gradient(135deg, ${color}66 0%, ${color}26 100%)`,
            boxShadow: `0 0 24px ${accentGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          }}
        >
          <Icon size={24} color={color} strokeWidth={2.2} />
        </div>

        {/* Text content */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Label with colored dot */}
          <div
            style={{
              fontSize: '11px',
              color: THEME.textMuted,
              fontWeight: 600,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: color,
                opacity: 0.8,
              }}
            />
            {label}
          </div>

          {/* Value with text-shadow */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              className="ov-mono"
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: THEME.textMain,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                textShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`,
              }}
            >
              {value}
            </span>
            {sub && (
              <span
                style={{
                  fontSize: '12px',
                  color: THEME.textDim,
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                {sub}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sparkline section */}
      {sparkline && (
        <div
          style={{
            marginTop: '4px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {sparkline}
        </div>
      )}

      {/* Detail row with pill-shaped background */}
      {detail && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            padding: '6px 10px',
            borderRadius: '20px',
            background: healthy
              ? `rgba(${hexToRgb(THEME.success)}, 0.1)`
              : `rgba(${hexToRgb(THEME.warning)}, 0.1)`,
            width: 'fit-content',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {healthy ? (
            <CheckCircle size={14} color={THEME.success} strokeWidth={2.5} />
          ) : (
            <AlertTriangle size={14} color={THEME.warning} strokeWidth={2.5} />
          )}
          <span
            className="ov-mono"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: healthy ? THEME.success : THEME.warning,
              letterSpacing: '0.01em',
            }}
          >
            {detail}
          </span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
