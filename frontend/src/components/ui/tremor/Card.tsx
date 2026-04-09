/**
 * Card & Panel — Clean, minimal, premium design.
 * No decorative clutter. Rich feel through shadows, spacing, and typography.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';
import type { LucideIcon } from 'lucide-react';

/* ── Basic Card ──────────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, noPadding }) => (
  <div
    className={`vigil-card ${className}`}
    style={{
      background: THEME.surface,
      borderRadius: 16,
      border: `1px solid ${THEME.glassBorder}`,
      boxShadow: THEME.shadowSm,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      padding: noPadding ? 0 : undefined,
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Panel Card (with header + accent strip) ──────────────────────── */

interface PanelCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: LucideIcon;
  accentColor?: string;
  rightNode?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PanelCard: React.FC<PanelCardProps> = ({
  children,
  title,
  icon: TIcon,
  accentColor,
  rightNode,
  noPadding,
  className = '',
  style,
}) => {
  const accent = accentColor || THEME.primary;

  return (
    <div
      className={`vigil-card ${className}`}
      style={{
        background: THEME.surface,
        borderRadius: 16,
        border: `1px solid ${THEME.glassBorder}`,
        boxShadow: THEME.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
    >
      {/* Thin accent top line */}
      {title && (
        <div style={{ height: 2, background: accent, opacity: 0.5, flexShrink: 0 }} />
      )}

      {/* Header */}
      {title && (
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: 48,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {TIcon && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${accent}12`,
                }}
              >
                <TIcon size={15} color={accent} strokeWidth={2} />
              </div>
            )}
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 650,
                color: THEME.textMain,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </span>
          </div>
          {rightNode}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, padding: noPadding ? 0 : '16px 20px' }}>
        {children}
      </div>
    </div>
  );
};
