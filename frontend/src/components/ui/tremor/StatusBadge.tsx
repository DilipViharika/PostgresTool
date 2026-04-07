/**
 * Tremor-style status badges, live dots, legend items, and dividers.
 * Cleaner, more minimal design.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

/* ── Status Badge ──────────────────────────────────────────────────────── */

interface StatusBadgeProps {
  label: string;
  color: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, pulse }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 10px',
      borderRadius: 6,
      background: `${color}14`,
      color,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        animation: pulse ? 'tremorPulse 1.5s ease-in-out infinite' : 'none',
      }}
    />
    {label}
  </span>
);

/* ── Live Dot ──────────────────────────────────────────────────────────── */

interface LiveDotProps {
  color?: string;
  size?: number;
}

export const LiveDot: React.FC<LiveDotProps> = ({ color = THEME.success, size = 7 }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: color,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: -3,
        borderRadius: '50%',
        border: `1px solid ${color}60`,
        animation: 'tremorPulseRing 2s ease-out infinite',
      }}
    />
  </div>
);

/* ── Legend Item ─────────────────────────────────────────────────────── */

interface LegendItemProps {
  label: string;
  color: string;
  dashed?: boolean;
}

export const LegendItem: React.FC<LegendItemProps> = ({ label, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: THEME.textMuted }}>
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        flexShrink: 0,
      }}
    />
    {label}
  </span>
);

/* ── Divider ────────────────────────────────────────────────────────── */

export const Divider: React.FC<{ style?: React.CSSProperties }> = ({ style = {} }) => (
  <div
    style={{
      height: 1,
      background: THEME.glassBorder,
      margin: '4px 0',
      ...style,
    }}
  />
);