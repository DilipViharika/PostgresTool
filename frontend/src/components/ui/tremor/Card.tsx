/**
 * Card & Panel — matches original OverviewTab Panel styling exactly.
 * Solid accent top strip, clean header, shadowMd.
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
    className={className}
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
}) => (
  <div
    className={className}
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
    {/* Accent top strip — solid color, 0.7 opacity */}
    {title && (
      <div style={{ height: 3, background: accentColor || THEME.primary, opacity: 0.7 }} />
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
                background: accentColor ? `${accentColor}14` : `${THEME.primary}14`,
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