/**
 * Card & Panel — Modern striking design with gradients, blur effects, and animations.
 * Preserves original API while introducing contemporary visual elements.
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
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: noPadding ? 0 : undefined,
      ...style,
    }}
  >
    {/* Background with subtle gradient overlay */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: THEME.surface,
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 100%)`,
        zIndex: 0,
      }}
    />

    {/* Left accent border with gradient */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        background: `linear-gradient(180deg, ${THEME.primary} 0%, ${interpolateColor(THEME.primary, THEME.accent || '#8B5CF6', 0.6)} 100%)`,
        zIndex: 1,
      }}
    />

    {/* Top inset highlight border */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
        zIndex: 2,
      }}
    />

    {/* Outer border */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 20,
        zIndex: 3,
        pointerEvents: 'none',
      }}
    />

    {/* Hover shimmer effect */}
    <div
      className="card-shimmer"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 20,
        opacity: 0,
        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 4,
      }}
    />

    {/* Content container */}
    <div
      style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      {children}
    </div>

    {/* Animation styles */}
    <style>{`
      @keyframes shimmer {
        0% { opacity: 0; transform: translateX(-100%); }
        50% { opacity: 0.3; }
        100% { opacity: 0; transform: translateX(100%); }
      }

      .card-shimmer {
        transition: opacity 0.3s ease;
      }
    `}</style>
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
  const effectiveAccentColor = accentColor || THEME.primary;
  const complementaryColor = interpolateColor(effectiveAccentColor, THEME.accent || '#8B5CF6', 0.6);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Background with subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: THEME.surface,
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 100%)`,
          zIndex: 0,
        }}
      />

      {/* Left accent border with gradient */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${effectiveAccentColor} 0%, ${complementaryColor} 100%)`,
          zIndex: 1,
        }}
      />

      {/* Top inset highlight border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          zIndex: 2,
        }}
      />

      {/* Outer border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: 20,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Hover shimmer effect */}
      <div
        className="panel-card-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          opacity: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Gradient accent strip */}
      {title && (
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${effectiveAccentColor} 0%, ${complementaryColor} 100%)`,
            position: 'relative',
            zIndex: 5,
          }}
        />
      )}

      {/* Header with gradient background */}
      {title && (
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '14px 20px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: 48,
            background: `linear-gradient(135deg, ${effectiveAccentColor}08 0%, transparent 100%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {TIcon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${effectiveAccentColor}25 0%, ${complementaryColor}15 100%)`,
                  border: `1px solid ${effectiveAccentColor}40`,
                }}
              >
                <TIcon size={16} color={effectiveAccentColor} />
              </div>
            )}
            <span
              style={{
                fontSize: 14.5,
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

      {/* Content container */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: noPadding ? 0 : '18px 20px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {children}
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.3; }
          100% { opacity: 0; transform: translateX(100%); }
        }

        .panel-card-shimmer {
          transition: opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
};

/* ── Utility: Interpolate between two colors ──────────────────────── */

function interpolateColor(color1: string, color2: string, amount: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * amount);
  const g = Math.round(c1.g + (c2.g - c1.g) * amount);
  const b = Math.round(c1.b + (c2.b - c1.b) * amount);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
