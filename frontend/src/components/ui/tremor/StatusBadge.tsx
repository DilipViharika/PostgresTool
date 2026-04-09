/**
 * StatusBadge, LiveDot, LegendItem, Divider — matches original OverviewTab styling.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

/* ── Status Badge — 9.5px mono, pill, no border ───────────────────────── */

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
      fontSize: 9.5,
      fontWeight: 700,
      padding: '4px 11px',
      borderRadius: 12,
      background: `${color}12`,
      color,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
      fontFamily: THEME.fontMono,
      letterSpacing: '0.02em',
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
      }}
    />
    {label}
  </span>
);

/* ── Live Dot — double pulse ring ──────────────────────────────────── */

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
        animation: 'ovPulseRing 2s ease-out infinite',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: -5,
        borderRadius: '50%',
        border: `1px solid ${color}35`,
        animation: 'ovPulseRing 2s ease-out infinite 0.5s',
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
      background: `linear-gradient(90deg, transparent, ${THEME.glassBorder}, transparent)`,
      ...style,
    }}
  />
);