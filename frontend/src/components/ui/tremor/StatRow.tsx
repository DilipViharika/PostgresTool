/**
 * Tremor-style stat display components.
 * Cleaner typography, better spacing.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

/* ── Stat Strip (horizontal row of mini-stats) ──────────────────────── */

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface StatStripProps {
  items: StatItem[];
  dividers?: boolean;
}

export const StatStrip: React.FC<StatStripProps> = ({ items, dividers = false }) => (
  <div
    style={{
      display: 'flex',
      gap: dividers ? 0 : 20,
      marginTop: 16,
      paddingTop: 16,
      borderTop: `1px solid ${THEME.glassBorder}`,
    }}
  >
    {items.map((s, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          minWidth: 0,
          ...(dividers
            ? {
                paddingRight: 16,
                borderRight: i < items.length - 1 ? `1px solid ${THEME.glassBorder}` : 'none',
                paddingLeft: i > 0 ? 16 : 0,
              }
            : {}),
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: THEME.textDim,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {s.label}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: s.color || THEME.textMain,
            lineHeight: 1,
            fontFamily: THEME.fontMono,
          }}
        >
          {s.value}
        </div>
      </div>
    ))}
  </div>
);

/* ── Mini Stat Box ──────────────────────────────────────────────────── */

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({ label, value, color }) => (
  <div
    style={{
      padding: '10px 14px',
      borderRadius: 8,
      background: THEME.bgAlt || THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: THEME.textDim,
        fontWeight: 500,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 16,
        fontWeight: 700,
        color: color || THEME.textMain,
        lineHeight: 1,
        fontFamily: THEME.fontMono,
      }}
    >
      {value}
    </div>
  </div>
);