/**
 * Tremor-inspired Card component for dashboard panels.
 * Integrates with the VIGIL THEME system while providing
 * clean, consistent card layouts.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';
import type { LucideIcon } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────── */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Removes default padding from body */
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, noPadding }) => (
  <div
    className={`tremor-card ${className}`}
    style={{
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: THEME.shadowMd,
      padding: noPadding ? 0 : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ──────────────────────────────────────────────────────────────────────── */

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
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: THEME.shadowMd,
      ...style,
    }}
  >
    {/* Accent top strip */}
    {title && (
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${accentColor || THEME.primary}, ${accentColor || THEME.primary}80)`,
          opacity: 0.8,
        }}
      />
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
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${accentColor || THEME.primary}14`,
              }}
            >
              <TIcon size={14} color={accentColor || THEME.primary} />
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
    <div style={{ flex: 1, minHeight: 0, padding: noPadding ? 0 : '18px 20px' }}>
      {children}
    </div>
  </div>
);
