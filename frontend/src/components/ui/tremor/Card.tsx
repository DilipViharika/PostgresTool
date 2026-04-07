/**
 * Advanced Card and Panel components.
 * Rich glass morphism, accent top strips, deep shadows, gradient overlays.
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
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: THEME.shadowMd,
      padding: noPadding ? 0 : undefined,
      ...style,
    }}
  >
    {/* Glass shine overlay */}
    <div className="tremor-card-shine" />
    {children}
  </div>
);

/* ── Panel Card (with optional header + accent strip) ─────────────── */

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
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: THEME.shadowMd,
      ...style,
    }}
  >
    {/* Accent top strip — colored gradient bar */}
    {accentColor && (
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88 60%, transparent)`,
          flexShrink: 0,
        }}
      />
    )}

    {/* Glass shine overlay */}
    <div className="tremor-card-shine" />

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
          minHeight: 52,
          background: `linear-gradient(180deg, ${THEME.surfaceHover || THEME.surface}40, transparent)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {TIcon && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: `${accentColor || THEME.primary}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${accentColor || THEME.primary}20`,
              }}
            >
              <TIcon
                size={14}
                color={accentColor || THEME.primary}
                strokeWidth={2}
              />
            </div>
          )}
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 700,
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