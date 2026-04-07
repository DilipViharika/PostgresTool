/**
 * Advanced stat display components.
 * Rich typography, glass effects, colored accents.
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
            fontSize: 11,
            color: THEME.textDim,
            fontWeight: 600,
            marginBottom: 5,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {s.label}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: s.color || THEME.textMain,
            lineHeight: 1,
            fontFamily: THEME.fontMono,
            textShadow: s.color ? `0 0 12px ${s.color}25` : undefined,
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
      padding: '12px 16px',
      borderRadius: 10,
      background: THEME.bgAlt || THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      boxShadow: THEME.shadowSm,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Subtle left accent */}
    {color && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          bottom: '20%',
          width: 2.5,
          borderRadius: 2,
          background: color,
          opacity: 0.6,
        }}
      />
    )}
    <div
      style={{
        fontSize: 10,
        color: THEME.textDim,
        fontWeight: 600,
        marginBottom: 5,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 17,
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