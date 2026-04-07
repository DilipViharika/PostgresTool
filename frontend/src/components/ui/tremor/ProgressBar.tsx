/**
 * Tremor-inspired ProgressBar with animated fill and optional label.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

interface ProgressBarProps {
  value: number;        // 0–100
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
  height = 5,
  showLabel = true,
  animate = true,
}) => {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      {showLabel && (label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && (
            <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>
              {label}
            </span>
          )}
          {valueLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color,
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
          borderRadius: 10,
          background: `${THEME.grid}55`,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 10,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            transformOrigin: 'left',
            animation: animate ? 'tremorBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both' : undefined,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
