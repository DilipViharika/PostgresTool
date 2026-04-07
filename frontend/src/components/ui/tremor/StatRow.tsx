/**
 * Premium stat display — neon text glow, glass panels, gradient accents.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

/* ── Stat Strip ──────────────────────────────────────────────────────── */

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
            fontSize: 10.5,
            color: THEME.textDim,
            fontWeight: 600,
            marginBottom: 5,
            letterSpacing: '0.04em',
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
            textShadow: s.color ? `0 0 14px ${s.color}30, 0 0 4px ${s.color}18` : undefined,
          }}
        >
          {s.value}
        </div>
      </div>
    ))}
  </div>
);

/* ── Mini Stat Box (glass panel with neon accent) ────────────────────── */

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({ label, value, color }) => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: 12,
      background: `linear-gradient(135deg, ${THEME.bgAlt || THEME.surface}, ${THEME.surface})`,
      border: `1px solid ${THEME.glassBorder}`,
      boxShadow: `${THEME.shadowSm}, 0 0 12px ${color || THEME.primary}06`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Left neon accent bar */}
    {color && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '15%',
          bottom: '15%',
          width: 3,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${color}, ${color}80)`,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    )}
    {/* Mini orb glow */}
    {color && (
      <div
        style={{
          position: 'absolute',
          top: -15,
          right: -15,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}0a, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
    )}
    <div
      style={{
        fontSize: 10,
        color: THEME.textDim,
        fontWeight: 600,
        marginBottom: 5,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 1,
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
        textShadow: color ? `0 0 10px ${color}25` : undefined,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {value}
    </div>
  </div>
);