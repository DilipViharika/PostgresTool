/**
 * Advanced status badges, live dots, legend items, and dividers.
 * Rich visual styling with glow, borders, and depth.
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
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 12px',
      borderRadius: 8,
      background: `${color}18`,
      border: `1px solid ${color}28`,
      color,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      boxShadow: `0 0 6px ${color}10`,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}60`,
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
        boxShadow: `0 0 6px ${color}80, 0 0 12px ${color}40`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: -3,
        borderRadius: '50%',
        border: `1.5px solid ${color}60`,
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
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: THEME.textMuted, fontWeight: 500 }}>
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        flexShrink: 0,
        boxShadow: `0 0 4px ${color}30`,
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
      background: `linear-gradient(90deg, transparent, ${THEME.glassBorder}, transparent)`,
      margin: '4px 0',
      ...style,
    }}
  />
);