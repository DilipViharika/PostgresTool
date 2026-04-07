/**
 * Premium CSS animations & effects — neon hover glow, shimmer sweep,
 * animated gradient borders, deep elevation transitions.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

const TremorStyles: React.FC = () => (
  <style>{`
    /* ── Core Animations ──────────────────────────────────────────── */
    @keyframes tremorFadeIn {
      from { opacity: 0; transform: translateY(14px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes tremorPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.35; transform: scale(0.8); }
    }
    @keyframes tremorPulseRing {
      0%   { transform: scale(0.8); opacity: 0.7; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes tremorBarGrow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes tremorDropIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes tremorSlideIn {
      from { opacity: 0; transform: translateX(14px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tremorShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes tremorCountUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tremorBell {
      0%, 100% { transform: rotate(0deg); }
      20%      { transform: rotate(-15deg); }
      40%      { transform: rotate(12deg); }
      60%      { transform: rotate(-8deg); }
      80%      { transform: rotate(5deg); }
    }
    @keyframes tremorVacuumPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.04); }
    }
    @keyframes tremorGlowPulse {
      0%, 100% { box-shadow: 0 0 0px rgba(139,92,246,0); }
      50%      { box-shadow: 0 2px 14px rgba(139,92,246,0.14); }
    }
    @keyframes tremorBorderGlow {
      0%, 100% { border-color: rgba(255,255,255,0.08); }
      50%      { border-color: rgba(255,255,255,0.16); }
    }
    @keyframes tremorNeonPulse {
      0%, 100% { filter: brightness(1); }
      50%      { filter: brightness(1.15); }
    }

    /* ── Stagger children ─────────────────────────────────────────── */
    .tremor-stagger > * { animation: tremorFadeIn 0.5s ease-out both; }
    .tremor-stagger > *:nth-child(1) { animation-delay: 0.00s; }
    .tremor-stagger > *:nth-child(2) { animation-delay: 0.06s; }
    .tremor-stagger > *:nth-child(3) { animation-delay: 0.12s; }
    .tremor-stagger > *:nth-child(4) { animation-delay: 0.18s; }
    .tremor-stagger > *:nth-child(5) { animation-delay: 0.24s; }
    .tremor-stagger > *:nth-child(6) { animation-delay: 0.30s; }
    .tremor-stagger > *:nth-child(7) { animation-delay: 0.36s; }
    .tremor-stagger > *:nth-child(8) { animation-delay: 0.42s; }

    /* ── Animated progress bar ────────────────────────────────────── */
    .tremor-bar-animate {
      transform-origin: left;
      animation: tremorBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    /* ── KPI card — neon elevation on hover ──────────────────────── */
    .tremor-kpi {
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.3s ease,
                  border-color 0.3s ease;
    }
    .tremor-kpi:hover {
      transform: translateY(-4px) !important;
      box-shadow: ${THEME.shadowLg}, 0 4px 20px rgba(99,102,241,0.08) !important;
      border-color: ${THEME.glassBorderHover} !important;
    }

    /* ── Panel card — glow uplift ─────────────────────────────────── */
    .tremor-panel {
      transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .tremor-panel:hover {
      box-shadow: ${THEME.shadowLg}, 0 2px 16px rgba(99,102,241,0.06) !important;
      border-color: ${THEME.glassBorderHover} !important;
      transform: translateY(-1px);
    }

    /* ── Generic card hover ───────────────────────────────────────── */
    .tremor-card {
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .tremor-card:hover {
      box-shadow: ${THEME.shadowLg} !important;
      border-color: ${THEME.glassBorderHover} !important;
    }

    /* ── Notification slide ───────────────────────────────────────── */
    .tremor-notif-item {
      animation: tremorSlideIn 0.28s ease-out both;
    }
    .tremor-notif-item:nth-child(1) { animation-delay: 0.03s; }
    .tremor-notif-item:nth-child(2) { animation-delay: 0.09s; }
    .tremor-notif-item:nth-child(3) { animation-delay: 0.15s; }
    .tremor-notif-item:nth-child(4) { animation-delay: 0.21s; }

    /* ── Vacuum urgent pulse ──────────────────────────────────────── */
    .tremor-vacuum-urgent { animation: tremorVacuumPulse 2s ease-in-out infinite; }

    /* ── Font shortcuts ───────────────────────────────────────────── */
    .tremor-mono { font-family: ${THEME.fontMono} !important; }
    .tremor-display { font-family: ${THEME.fontBody} !important; }

    /* ── Glass shine overlay — multi-layer frost ──────────────────── */
    .tremor-card-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.05) 0%,
        rgba(255,255,255,0.015) 25%,
        transparent 50%,
        rgba(255,255,255,0.01) 75%,
        transparent 100%
      );
      pointer-events: none;
      border-radius: inherit;
      z-index: 0;
    }

    /* ── Shimmer sweep overlay (used by KpiCard) ──────────────────── */
    .tremor-shimmer-sweep {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 40%,
        rgba(255,255,255,0.03) 48%,
        rgba(255,255,255,0.05) 50%,
        rgba(255,255,255,0.03) 52%,
        transparent 60%
      );
      background-size: 250% 100%;
      animation: tremorShimmer 6s ease-in-out infinite;
      pointer-events: none;
      border-radius: inherit;
      z-index: 0;
    }

    /* ── Scrollbar styling ────────────────────────────────────────── */
    .tremor-panel ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    .tremor-panel ::-webkit-scrollbar-track {
      background: transparent;
    }
    .tremor-panel ::-webkit-scrollbar-thumb {
      background: ${THEME.glassBorder};
      border-radius: 4px;
    }
    .tremor-panel ::-webkit-scrollbar-thumb:hover {
      background: ${THEME.glassBorderHover};
    }
  `}</style>
);

export default TremorStyles;