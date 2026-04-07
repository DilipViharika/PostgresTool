/**
 * Tremor-inspired CSS animations injected via <style> tag.
 * Import this component once at the top of any page using Tremor components.
 */
import React from 'react';
import { THEME } from '../../../utils/theme';

const TremorStyles: React.FC = () => (
  <style>{`
    /* ── Animations ────────────────────────────────────────────────── */
    @keyframes tremorFadeIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tremorPulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
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
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes tremorSlideIn {
      from { opacity: 0; transform: translateX(12px); }
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
      50%      { box-shadow: 0 2px 8px rgba(139,92,246,0.08); }
    }

    /* ── Stagger children ─────────────────────────────────────────── */
    .tremor-stagger > * { animation: tremorFadeIn 0.45s ease-out both; }
    .tremor-stagger > *:nth-child(1) { animation-delay: 0.00s; }
    .tremor-stagger > *:nth-child(2) { animation-delay: 0.07s; }
    .tremor-stagger > *:nth-child(3) { animation-delay: 0.14s; }
    .tremor-stagger > *:nth-child(4) { animation-delay: 0.21s; }
    .tremor-stagger > *:nth-child(5) { animation-delay: 0.28s; }
    .tremor-stagger > *:nth-child(6) { animation-delay: 0.35s; }
    .tremor-stagger > *:nth-child(7) { animation-delay: 0.42s; }
    .tremor-stagger > *:nth-child(8) { animation-delay: 0.49s; }

    /* ── Animated progress bar ────────────────────────────────────── */
    .tremor-bar-animate {
      transform-origin: left;
      animation: tremorBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    /* ── KPI card hover ───────────────────────────────────────────── */
    .tremor-kpi:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
      transform: translateY(-1px);
    }
    .tremor-kpi {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
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

    /* ── Mono font shortcut ───────────────────────────────────────── */
    .tremor-mono { font-family: ${THEME.fontMono} !important; }
    .tremor-display { font-family: ${THEME.fontBody} !important; }

    /* ── Card shine overlay ───────────────────────────────────────── */
    .tremor-card-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%);
      pointer-events: none;
      border-radius: inherit;
    }
  `}</style>
);

export default TremorStyles;
