/**
 * Tremor-inspired stat rows for summary strips below charts.
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
      gap: dividers ? 0 : 16,
      marginTop: 12,
      paddingTop: 12,
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
                paddingRight: 12,
                borderRight: i < items.length - 1 ? `1px solid ${THEME.glassBorder}` : 'none',
                paddingLeft: i > 0 ? 12 : 0,
              }
            : {}),
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: THEME.textDim,
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 3,
          }}
        >
          {s.label}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
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
      padding: '8px 12px',
      borderRadius: 10,
      background: THEME.surface,
      border: `1px solid ${THEME.grid}40`,
      boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
    }}
  >
    <div
      style={{
        fontSize: 9,
        color: THEME.textDim,
        fontWeight: 600,
        letterSpacing: '0.04em',
        marginBottom: 2,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: color || THEME.textMain,
        lineHeight: 1,
        fontFamily: THEME.fontMono,
      }}
    >
      {value}
    </div>
  </div>
);
