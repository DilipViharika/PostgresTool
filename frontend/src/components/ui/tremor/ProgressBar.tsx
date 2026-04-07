/**
 * Tremor-style ProgressBar — clean and minimal.
 * Rounded, smooth colors, no heavy shadows.
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
  height = 6,
  showLabel = true,
  animate = true,
}) => {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      {showLabel && (label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <span style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500 }}>
              {label}
            </span>
          )}
          {valueLabel && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
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
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: height,
            background: color,
            transformOrigin: 'left',
            transition: animate ? 'width 1s cubic-bezier(0.22, 1, 0.36, 1)' : undefined,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;