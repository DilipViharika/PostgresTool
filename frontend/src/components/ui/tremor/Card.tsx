/**
 * Premium Card & Panel — frosted glass, animated gradient accent strip,
 * layered shadows, header gradient, neon icon badges.
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
      background: `linear-gradient(145deg, ${THEME.surface}, ${THEME.bgAlt || THEME.surface})`,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: THEME.shadowMd,
      backdropFilter: 'blur(8px)',
      padding: noPadding ? 0 : undefined,
      ...style,
    }}
  >
    <div className="tremor-card-shine" />
    {children}
  </div>
);

/* ── Panel Card (with header + animated accent strip) ─────────────── */

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
      background: `linear-gradient(145deg, ${THEME.surface}, ${THEME.bgAlt || THEME.surface})`,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `${THEME.shadowMd}, 0 0 24px ${accentColor || THEME.primary}06`,
      backdropFilter: 'blur(8px)',
      ...style,
    }}
  >
    {/* ── Animated gradient accent strip ── */}
    {accentColor && (
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}60 20%, ${accentColor} 50%, ${accentColor}60 80%, transparent 100%)`,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer pass over the accent strip */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'tremorShimmer 3s ease-in-out infinite',
          }}
        />
      </div>
    )}

    <div className="tremor-card-shine" />

    {/* ── Header ── */}
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
          background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {TIcon && (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${accentColor || THEME.primary}18, ${accentColor || THEME.primary}08)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${accentColor || THEME.primary}25`,
                boxShadow: `0 0 10px ${accentColor || THEME.primary}10, inset 0 1px 0 rgba(255,255,255,0.04)`,
              }}
            >
              <TIcon size={14} color={accentColor || THEME.primary} strokeWidth={2.2} />
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

    {/* ── Body ── */}
    <div style={{ flex: 1, minHeight: 0, padding: noPadding ? 0 : '20px' }}>
      {children}
    </div>
  </div>
);