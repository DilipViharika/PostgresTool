/**
 * Tremor-style Card and Panel components.
 * Clean, minimal design — subtle borders, generous padding, no accent strips.
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
    className={`tremor-card ${className}`}
    style={{
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      padding: noPadding ? 0 : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Panel Card (with optional header) ───────────────────────────────── */

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
}) => (
  <div
    className={`tremor-panel ${className}`}
    style={{
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      ...style,
    }}
  >
    {/* Header — clean, no accent strip */}
    {title && (
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${THEME.glassBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          minHeight: 52,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {TIcon && (
            <TIcon
              size={16}
              color={accentColor || THEME.textMuted}
              strokeWidth={1.8}
            />
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
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
    <div style={{ flex: 1, minHeight: 0, padding: noPadding ? 0 : '20px' }}>
      {children}
    </div>
  </div>
);