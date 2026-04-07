/**
 * Premium ProgressBar — animated shimmer sweep, neon glow, inset track.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

interface ProgressBarProps {
  value: number;
  color?: string;
  label?: string;
  valueLabel?: string;
  height?: number;
  showLabel?: boolean;
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = THEME.primary,
  label,
  valueLabel,
  height = 7,
  showLabel = true,
  animate = true,
}) => {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      {showLabel && (label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
              {label}
            </span>
          )}
          {valueLabel && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: THEME.textMain,
                fontFamily: THEME.fontMono,
              }}
            >
              {valueLabel}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height,
          borderRadius: height,
          background: `${THEME.glassBorder}`,
          overflow: 'hidden',
          boxShadow: THEME.shadowInner,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: height,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            transformOrigin: 'left',
            transition: animate ? 'width 1s cubic-bezier(0.22, 1, 0.36, 1)' : undefined,
            boxShadow: pct > 0 ? `0 0 10px ${color}45, 0 0 4px ${color}35` : undefined,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer sweep */}
          {pct > 5 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'tremorShimmer 2.5s ease-in-out infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;