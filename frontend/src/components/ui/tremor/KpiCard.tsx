/**
 * Premium KPI / Metric Card — neon accent glow, gradient overlays,
 * frosted glass, animated shimmer, deep layered shadows.
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
      padding: '22px 22px 22px 26px',
      borderRadius: 16,
      background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.bgAlt || THEME.surface} 100%)`,
      border: `1px solid ${THEME.glassBorder}`,
      borderLeft: `4px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `${THEME.shadowMd}, 0 0 20px ${color}08`,
      backdropFilter: 'blur(8px)',
    }}
  >
    {/* ── Large radial glow — colored orb top-right ── */}
    <div
      style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 130,
        height: 130,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, ${color}06 40%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />

    {/* ── Bottom-left subtle secondary orb ── */}
    <div
      style={{
        position: 'absolute',
        bottom: -50,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}06 0%, transparent 60%)`,
        pointerEvents: 'none',
      }}
    />

    {/* ── Shimmer sweep overlay ── */}
    <div className="tremor-shimmer-sweep" />

    {/* ── Glass shine ── */}
    <div className="tremor-card-shine" />

    {/* ── Top row: label + icon ── */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
      <span
        style={{
          fontSize: 11.5,
          color: THEME.textMuted,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}25`,
          boxShadow: `0 0 12px ${color}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <Icon size={16} color={color} strokeWidth={2.2} />
      </div>
    </div>

    {/* ── Value ── */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: sub ? 4 : 0, position: 'relative', zIndex: 1 }}>
      <span
        className="tremor-mono"
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: THEME.textMain,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          textShadow: `0 0 30px ${color}15`,
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

    {/* ── Sparkline ── */}
    {sparkline && <div style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>{sparkline}</div>}

    {/* ── Detail / delta footer ── */}
    {(detail || delta) && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${THEME.glassBorder}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {delta && (() => {
          const isUp = deltaType === 'increase';
          const isDown = deltaType === 'decrease';
          const pill = isUp
            ? (healthy !== false ? THEME.success : THEME.danger)
            : isDown
              ? (healthy !== false ? THEME.danger : THEME.success)
              : THEME.textDim;
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: THEME.fontMono,
                color: pill,
                padding: '3px 10px',
                borderRadius: 8,
                background: `${pill}15`,
                border: `1px solid ${pill}25`,
                boxShadow: `0 0 10px ${pill}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}
            >
              {isUp && <ArrowUpRight size={13} strokeWidth={2.5} />}
              {isDown && <ArrowDownRight size={13} strokeWidth={2.5} />}
              {delta}
            </span>
          );
        })()}
        {detail && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: healthy ? THEME.success : healthy === false ? THEME.warning : THEME.textDim,
              textShadow: healthy ? `0 0 8px ${THEME.success}20` : undefined,
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