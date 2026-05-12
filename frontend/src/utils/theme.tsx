import React from 'react';
import { useTheme } from '../context/ThemeContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME SYSTEM — Velvet Protocol  (adaptive dark / light)
//
// USAGE
//   const theme = useAdaptiveTheme();   // inside any component
//   theme.primary, theme.glass, ...     // fully typed, immutable per render
//
// Previously THEME was a single mutable object mutated with Object.assign().
// That pattern causes subtle bugs in React Strict Mode (double-invoke) and
// concurrent rendering (two renders can see different states of the same
// object mid-flight). We now return a frozen snapshot per hook call instead.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Theme shape ──────────────────────────────────────────────────────────────
export interface ThemeTokens {
    // Backgrounds
    bg:            string;
    bgAlt:         string;
    surface:       string;
    surfaceHover:  string;
    surfaceRaised: string;

    // Glass
    glass:            string;
    glassHeavy:       string;
    glassBorder:      string;
    glassBorderHover: string;

    // Typography
    textMain:    string;
    textMuted:   string;
    textDim:     string;
    textInverse: string;

    // Accents — primary (indigo)
    primary:      string;
    primaryDark:  string;
    primaryLight: string;
    primaryFaint: string;

    // Accents — secondary (also indigo; kept separate for semantic flexibility)
    secondary:      string;
    secondaryDark:  string;
    secondaryLight: string;
    secondaryFaint: string;

    // Semantic colours
    success:      string;
    successDark:  string;
    successLight: string;
    danger:       string;
    dangerDark:   string;
    dangerLight:  string;
    warning:      string;
    warningDark:  string;
    warningLight: string;
    info:         string;
    infoDark:     string;
    infoLight:    string;

    // AI / system
    ai:      string;
    aiDark:  string;
    aiLight: string;

    // Extra accents
    cyan:   string;
    purple: string;

    // Structural
    grid:     string;
    gridAlt:  string;
    pearl:    string;
    deepTeal: string;
    inkBlack: string;
    phosphor: string;
    biolume:  string;
    mariana:  string;

    // Shadows — plain strings (no function variants; call shadowNeon() instead)
    shadowSm:    string;
    shadowMd:    string;
    shadowLg:    string;
    shadowXl:    string;
    shadowInner: string;
    shadowGold:  string;
    shadowTeal:  string;
    shadowDeep:  string;

    // Border radii
    radiusXs:   string;
    radiusSm:   string;
    radiusMd:   string;
    radiusLg:   string;
    radiusXl:   string;
    radius2Xl:  string;
    radiusFull: string;

    // Transitions
    transitionFast:   string;
    transitionBase:   string;
    transitionSlow:   string;
    transitionSpring: string;
    transitionBounce: string;

    // Fonts
    fontDisplay:    string;
    fontBody:       string;
    fontMono:       string;
    fontDecorative: string;

    // Spacing helper
    space: (n: number) => string;
}

// ── Shadow helpers (pure functions — no theme dependency needed) ──────────────
export const shadowNeon      = (color: string) => `0 0 4px ${color}30, 0 0 12px ${color}15`;
export const shadowNeonStrong = (color: string) => `0 0 6px ${color}50, 0 0 18px ${color}25`;

// ── Shared base (tokens that never change between modes) ─────────────────────
const BASE = {
    radiusXs:   '4px',
    radiusSm:   '7px',
    radiusMd:   '12px',
    radiusLg:   '18px',
    radiusXl:   '26px',
    radius2Xl:  '36px',
    radiusFull: '9999px',

    transitionFast:   'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionBase:   'all 0.30s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSlow:   'all 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSpring: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transitionBounce: 'all 0.60s cubic-bezier(0.175, 0.885, 0.32, 1.275)',

    fontDisplay:    "'Outfit', 'Inter', -apple-system, sans-serif",
    fontBody:       "'Outfit', 'Inter', sans-serif",
    fontMono:       "'JetBrains Mono', 'Fira Code', monospace",
    fontDecorative: "'Outfit', sans-serif",

    space: (n: number) => `${n * 4}px`,
} as const;

// ── Dark token set ────────────────────────────────────────────────────────────
const DARK: ThemeTokens = {
    ...BASE,

    bg:            '#0f1923',
    bgAlt:         '#131f2e',
    surface:       '#1a2736',
    surfaceHover:  '#1f2f40',
    surfaceRaised: '#243848',

    glass:            'rgba(26, 39, 54, 0.80)',
    glassHeavy:       'rgba(15, 25, 35, 0.95)',
    glassBorder:      'rgba(255, 255, 255, 0.12)',
    glassBorderHover: 'rgba(255, 255, 255, 0.22)',

    textMain:    '#f0f4ff',
    textMuted:   '#8b9ab8',
    textDim:     '#4a5e7a',
    textInverse: '#0b1a24',

    primary:      '#818cf8',
    primaryDark:  '#6366f1',
    primaryLight: '#a5b4fc',
    primaryFaint: 'rgba(99, 102, 241, 0.10)',

    secondary:      '#818cf8',
    secondaryDark:  '#6366f1',
    secondaryLight: '#a5b4fc',
    secondaryFaint: 'rgba(99, 102, 241, 0.10)',

    success:      '#2EE89C',
    successDark:  '#18C47A',
    successLight: '#70FFBD',
    danger:       '#FF4560',
    dangerDark:   '#D92640',
    dangerLight:  '#FF7A90',
    warning:      '#FFB520',
    warningDark:  '#D49210',
    warningLight: '#FFD878',
    info:         '#5BB8F5',
    infoDark:     '#2A90D4',
    infoLight:    '#90D4FF',

    ai:      '#a5b4fc',
    aiDark:  '#818cf8',
    aiLight: '#c7d2fe',

    cyan:   '#818cf8',
    purple: '#a78bfa',

    grid:     '#0e2a3e',
    gridAlt:  '#133348',
    pearl:    '#e0e4f0',
    deepTeal: '#081218',
    inkBlack: '#081218',
    phosphor: '#818cf8',
    biolume:  '#818cf8',
    mariana:  '#091620',

    shadowSm:    '0 1px 2px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.15)',
    shadowMd:    '0 2px 8px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.20)',
    shadowLg:    '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.20)',
    shadowXl:    '0 16px 40px rgba(0,0,0,0.40), 0 4px 12px rgba(0,0,0,0.25)',
    shadowInner: 'inset 0 1px 4px rgba(0,0,0,0.30)',
    shadowGold:  '0 2px 8px rgba(99,102,241,0.20), 0 0 16px rgba(99,102,241,0.10)',
    shadowTeal:  '0 2px 8px rgba(99,102,241,0.25), 0 0 16px rgba(99,102,241,0.12)',
    shadowDeep:  '0 16px 48px rgba(0,0,0,0.50), 0 4px 16px rgba(0,0,0,0.30)',
};

// ── Light token set ───────────────────────────────────────────────────────────
const LIGHT: ThemeTokens = {
    ...BASE,

    bg:            '#f5f5f9',
    bgAlt:         '#eef0f6',
    surface:       '#ffffff',
    surfaceHover:  '#f0f1f7',
    surfaceRaised: '#ffffff',

    glass:            'rgba(255, 255, 255, 0.88)',
    glassHeavy:       'rgba(255, 255, 255, 0.96)',
    glassBorder:      'rgba(0, 0, 0, 0.10)',
    glassBorderHover: 'rgba(0, 0, 0, 0.18)',

    textMain:    '#111827',
    textMuted:   '#4b5563',
    textDim:     '#9ca3af',
    textInverse: '#ffffff',

    primary:      '#6366f1',
    primaryDark:  '#4f46e5',
    primaryLight: '#818cf8',
    primaryFaint: 'rgba(99, 102, 241, 0.07)',

    secondary:      '#6366f1',
    secondaryDark:  '#4f46e5',
    secondaryLight: '#818cf8',
    secondaryFaint: 'rgba(99, 102, 241, 0.07)',

    success:      '#10b981',
    successDark:  '#059669',
    successLight: '#34d399',
    danger:       '#dc2626',
    dangerDark:   '#b91c1c',
    dangerLight:  '#f87171',
    warning:      '#d97706',
    warningDark:  '#b45309',
    warningLight: '#fcd34d',
    info:         '#0284c7',
    infoDark:     '#0369a1',
    infoLight:    '#38bdf8',

    ai:      '#818cf8',
    aiDark:  '#6366f1',
    aiLight: '#a5b4fc',

    cyan:   '#6366f1',
    purple: '#7c3aed',

    grid:     '#e0e2ef',
    gridAlt:  '#d1d5db',
    pearl:    '#111827',
    deepTeal: '#f1f3f6',
    inkBlack: '#f4f5f7',
    phosphor: '#6366f1',
    biolume:  '#6366f1',
    mariana:  '#f5f5f9',

    shadowSm:    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd:    '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
    shadowLg:    '0 10px 28px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06)',
    shadowXl:    '0 20px 44px rgba(0,0,0,0.14), 0 6px 16px rgba(0,0,0,0.08)',
    shadowInner: 'inset 0 2px 6px rgba(0,0,0,0.06)',
    shadowGold:  '0 4px 14px rgba(99,102,241,0.14), 0 0 20px rgba(99,102,241,0.06)',
    shadowTeal:  '0 4px 14px rgba(99,102,241,0.18), 0 0 20px rgba(99,102,241,0.08)',
    shadowDeep:  '0 20px 50px rgba(0,0,0,0.14), 0 8px 20px rgba(0,0,0,0.06)',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns a frozen theme snapshot for the current colour mode.
 * Call this at the top of any component that needs design tokens.
 *
 * const theme = useAdaptiveTheme();
 */
export const useAdaptiveTheme = (): Readonly<ThemeTokens> => {
    const { isDark } = useTheme();
    // Object.freeze prevents accidental mutation; no shared mutable state.
    return React.useMemo(
        () => Object.freeze(isDark ? DARK : LIGHT),
        [isDark],
    );
};

/**
 * Subscribe to the global header refresh button.
 * The callback is stabilised internally so callers don't need useCallback.
 */
export const useGlobalRefresh = (callback: () => void): void => {
    // Ref keeps the latest callback without re-subscribing the event listener.
    const cbRef = React.useRef(callback);
    React.useLayoutEffect(() => { cbRef.current = callback; });

    React.useEffect(() => {
        const handler = () => cbRef.current();
        window.addEventListener('fathom-refresh', handler);
        return () => window.removeEventListener('fathom-refresh', handler);
    }, []); // stable — never re-registers
};

// ── Convenience: default server-side / module-level token snapshot (dark) ────
// Only use this for non-React contexts (e.g. building CSS-in-JS strings at
// module load time). Inside components always call useAdaptiveTheme() instead.
export const THEME: Readonly<ThemeTokens> = Object.freeze(DARK);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG DEFS — Gradients, Filters, Patterns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Drop this once inside your app root (e.g. next to <GlobalStyles />).
 * Passes the current theme so gradient stops update on mode switch.
 */
export const ChartDefs: React.FC<{ theme?: Readonly<ThemeTokens> }> = ({
                                                                           theme = THEME,
                                                                       }) => (
    <svg style={{ height: 0, width: 0, position: 'absolute' }} aria-hidden="true">
        <defs>

            {/* ── Glow filters ──────────────────────────────────────────────────── */}
            {/*
        Previously the feColorMatrix values were hardcoded to generic teal/gold
        hues that didn't match the indigo primary. Now both filters simply
        amplify the source graphic's existing colour with a gaussian bloom —
        accurate for any hue and cheaper to maintain.
      */}
            <filter id="primaryGlow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="secondaryGlow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            {/* Legacy aliases so existing references don't break */}
            <filter id="tealGlow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="goldGlow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            <filter id="neonGlow" height="350%" width="350%" x="-125%" y="-125%">
                <feGaussianBlur stdDeviation="4"  result="b1" />
                <feGaussianBlur stdDeviation="10" result="b2" />
                <feMerge>
                    <feMergeNode in="b2" />
                    <feMergeNode in="b1" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="neonGlowStrong" height="450%" width="450%" x="-175%" y="-175%">
                <feGaussianBlur stdDeviation="8"  result="b1" />
                <feGaussianBlur stdDeviation="18" result="b2" />
                <feGaussianBlur stdDeviation="30" result="b3" />
                <feMerge>
                    <feMergeNode in="b3" />
                    <feMergeNode in="b2" />
                    <feMergeNode in="b1" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="softGlow" height="200%" width="200%" x="-50%" y="-50%">
                <feGaussianBlur stdDeviation="2.5" result="softBlur" />
                <feMerge>
                    <feMergeNode in="softBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <filter id="depthBlur">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feBlend in="SourceGraphic" in2="blur" mode="overlay" />
            </filter>

            <filter id="dropShadowDeep">
                <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.7" />
            </filter>

            {/* ── Area gradients ────────────────────────────────────────────────── */}
            {[
                ['primary',   theme.primary],
                ['secondary', theme.secondary],
                ['success',   theme.success],
                ['danger',    theme.danger],
                ['ai',        theme.ai],
            ].map(([id, color]) => (
                <linearGradient key={id} id={`${id}Gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity={0.55} />
                    <stop offset="45%"  stopColor={color} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            ))}

            {/* ── Bar gradients ─────────────────────────────────────────────────── */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={theme.primary}  stopOpacity={0.95} />
                <stop offset="100%" stopColor={theme.deepTeal}  stopOpacity={0.60} />
            </linearGradient>

            <linearGradient id="barGradientGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={theme.secondary}     stopOpacity={0.95} />
                <stop offset="100%" stopColor={theme.secondaryDark}  stopOpacity={0.50} />
            </linearGradient>

            <linearGradient id="barGradientSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={theme.success}     stopOpacity={0.95} />
                <stop offset="100%" stopColor={theme.successDark}  stopOpacity={0.50} />
            </linearGradient>

            {/* ── Directional / diagonal gradients ──────────────────────────────── */}
            <linearGradient id="horizTealGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.secondary} />
            </linearGradient>

            <linearGradient id="horizDeepTeal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={theme.deepTeal} />
                <stop offset="50%"  stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.biolume} />
            </linearGradient>

            <linearGradient id="diagAbyssal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={theme.primary} />
                <stop offset="40%"  stopColor={theme.ai} />
                <stop offset="100%" stopColor={theme.secondary} />
            </linearGradient>

            <linearGradient id="diagWarm" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%"   stopColor={theme.secondaryDark} />
                <stop offset="50%"  stopColor={theme.secondary} />
                <stop offset="100%" stopColor={theme.success} />
            </linearGradient>

            <linearGradient id="diagCool" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={theme.biolume} />
                <stop offset="50%"  stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.ai} />
            </linearGradient>

            {/* ── Radial gradients ──────────────────────────────────────────────── */}
            <radialGradient id="radialTeal" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={theme.primary}  stopOpacity={0.70} />
                <stop offset="60%"  stopColor={theme.primary}  stopOpacity={0.15} />
                <stop offset="100%" stopColor={theme.primary}  stopOpacity={0} />
            </radialGradient>

            <radialGradient id="radialGold" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={theme.secondary} stopOpacity={0.70} />
                <stop offset="60%"  stopColor={theme.secondary} stopOpacity={0.15} />
                <stop offset="100%" stopColor={theme.secondary} stopOpacity={0} />
            </radialGradient>

            <radialGradient id="radialAbyss" cx="30%" cy="30%" r="70%">
                <stop offset="0%"   stopColor={theme.primary}  stopOpacity={0.25} />
                <stop offset="50%"  stopColor={theme.deepTeal} stopOpacity={0.10} />
                <stop offset="100%" stopColor={theme.mariana}  stopOpacity={0} />
            </radialGradient>

            {/* ── Grid / dot patterns ───────────────────────────────────────────── */}
            <pattern id="gridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke={theme.grid} strokeWidth="0.6" strokeOpacity="0.5" />
            </pattern>

            <pattern id="gridFine" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.gridAlt} strokeWidth="0.3" strokeOpacity="0.35" />
            </pattern>

            <pattern id="dotPattern" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="11" cy="11" r="1.2" fill={theme.primary} fillOpacity="0.2" />
            </pattern>

            <pattern id="dotPatternFine" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="0.7" fill={theme.textDim} fillOpacity="0.4" />
            </pattern>

            <pattern id="hexPattern" width="28" height="32" patternUnits="userSpaceOnUse">
                <polygon
                    points="14,2 24,7.5 24,18.5 14,24 4,18.5 4,7.5"
                    fill="none" stroke={theme.grid} strokeWidth="0.5" strokeOpacity="0.3"
                />
            </pattern>

            <pattern id="wavePattern" width="60" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 C15 0 30 20 45 10 S60 0 60 10"
                      fill="none" stroke={theme.primary} strokeWidth="0.5" strokeOpacity="0.15" />
            </pattern>

            {/* ── Clip paths ────────────────────────────────────────────────────── */}
            <clipPath id="roundedClip">
                <rect rx="14" ry="14" width="100%" height="100%" />
            </clipPath>
            <clipPath id="circleClip">
                <circle cx="50%" cy="50%" r="50%" />
            </clipPath>

        </defs>
    </svg>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { KEYFRAMES_CSS } from '../config/animations';

/**
 * Mount once at the app root. Accepts the current theme so CSS custom
 * properties update on light/dark toggle without a full remount.
 */
export const GlobalStyles: React.FC<{ theme?: Readonly<ThemeTokens> }> = ({
                                                                              theme = THEME,
                                                                          }) => (
    <style>{`
    /* ── Shared keyframes ─────────────────────────────────────────────────── */
    ${KEYFRAMES_CSS}

    /* ── Font import ─────────────────────────────────────────────────────── */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

    /* ── CSS custom properties ───────────────────────────────────────────── */
    :root {
      --primary:      ${theme.primary};
      --secondary:    ${theme.secondary};
      --bg:           ${theme.bg};
      --surface:      ${theme.surface};
      --text:         ${theme.textMain};
      --muted:        ${theme.textMuted};
      --dim:          ${theme.textDim};
      --grid:         ${theme.grid};
      --danger:       ${theme.danger};
      --success:      ${theme.success};
      --warning:      ${theme.warning};
      --ai:           ${theme.ai};
      --radius-sm:    ${theme.radiusSm};
      --radius-md:    ${theme.radiusMd};
      --radius-lg:    ${theme.radiusLg};
      --transition:   ${theme.transitionBase};
    }

    /* ── Base reset ──────────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${theme.fontBody};
      background:  ${theme.bg};
      color:       ${theme.textMain};
      -webkit-font-smoothing:  antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ── Focus-visible (keyboard navigation) ─────────────────────────────── */
    :focus-visible {
      outline: 2px solid ${theme.primary};
      outline-offset: 3px;
    }

    /* ── Reduced-motion: disable all animations & transitions ────────────── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration:   0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration:  0.01ms !important;
        scroll-behavior:      auto   !important;
      }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       KEYFRAME ANIMATIONS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
      33%       { transform: translateY(-6px) rotate(0.8deg) scale(1.01); }
      66%       { transform: translateY(4px) rotate(-0.8deg) scale(0.99); }
    }

    @keyframes pulse-ring {
      0%   { transform: scale(0.85); opacity: 1; }
      100% { transform: scale(2.4);  opacity: 0; }
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1);   opacity: 1; }
      50%       { transform: scale(1.2); opacity: 0.8; }
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 6px  ${theme.primary}60, 0 0 20px ${theme.primary}20; }
      50%       { box-shadow: 0 0 12px ${theme.primary}90, 0 0 40px ${theme.primary}40; }
    }

    @keyframes shimmer {
      0%   { background-position: -300% 0; }
      100% { background-position:  300% 0; }
    }

    @keyframes deepShimmer {
      0%   { background-position: 0%   50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }

    @keyframes fadeInUp    { from { opacity:0; transform:translateY(24px);  } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeInDown  { from { opacity:0; transform:translateY(-24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeInLeft  { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
    @keyframes fadeInRight { from { opacity:0; transform:translateX(30px);  } to { opacity:1; transform:translateX(0); } }
    @keyframes fadeInScale { from { opacity:0; transform:scale(0.9);        } to { opacity:1; transform:scale(1); } }

    @keyframes spin        { from { transform:rotate(0deg);   } to { transform:rotate(360deg); } }
    @keyframes spinReverse { from { transform:rotate(360deg); } to { transform:rotate(0deg); } }

    @keyframes scanlineMove {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(200vh); }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    @keyframes ripple {
      0%   { transform: scale(0); opacity: 0.7; }
      100% { transform: scale(5); opacity: 0; }
    }

    @keyframes morphBlob {
      0%, 100% { border-radius: 62% 38% 34% 66% / 58% 32% 68% 42%; }
      20%       { border-radius: 38% 62% 56% 44% / 46% 64% 36% 54%; }
      40%       { border-radius: 50% 50% 34% 66% / 28% 62% 38% 72%; }
      60%       { border-radius: 42% 58% 62% 38% / 66% 38% 62% 34%; }
      80%       { border-radius: 64% 36% 48% 52% / 44% 58% 42% 56%; }
    }

    @keyframes gradientShift {
      0%   { background-position: 0%   50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }

    @keyframes inkDrop {
      0%   { transform: scale(0) translateY(-20px); opacity: 0; }
      60%  { transform: scale(1.08) translateY(4px); opacity: 1; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    @keyframes waveform {
      0%, 100% { transform: scaleY(0.4); }
      50%       { transform: scaleY(1); }
    }

    @keyframes tideRise {
      0%, 100% { transform: translateX(0); }
      25%       { transform: translateX(-12px); }
      75%       { transform: translateX(12px); }
    }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes orbDrift1 {
      0%, 100% { transform: translate(0,0)     scale(1); }
      25%       { transform: translate(70px,-50px) scale(1.12); }
      50%       { transform: translate(-40px,70px) scale(0.88); }
      75%       { transform: translate(-70px,-25px) scale(1.06); }
    }

    @keyframes orbDrift2 {
      0%, 100% { transform: translate(0,0)      scale(1); }
      25%       { transform: translate(-55px,55px) scale(0.92); }
      50%       { transform: translate(50px,-40px)  scale(1.14); }
      75%       { transform: translate(25px,45px)   scale(0.94); }
    }

    @keyframes orbDrift3 {
      0%, 100% { transform: translate(0,0); }
      33%       { transform: translate(30px,60px)   scale(1.08); }
      66%       { transform: translate(-60px,-30px) scale(0.90); }
    }

    @keyframes particleFloat {
      0%   { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
      20%  { opacity: 1; }
      80%  { opacity: 0.6; }
      100% { transform: translateY(-120px) translateX(30px) scale(1.5); opacity: 0; }
    }

    @keyframes depthPulse {
      0%, 100% { opacity: 0.3; transform: scale(0.96); }
      50%       { opacity: 0.7; transform: scale(1.04); }
    }

    @keyframes glitchShift {
      0%, 95%, 100% { transform: translate(0); clip-path: none; }
      96% { transform: translate(-3px,  1px); clip-path: inset(30% 0 40% 0); }
      97% { transform: translate( 3px, -1px); clip-path: inset(60% 0 10% 0); }
      98% { transform: translate(-2px,  2px); clip-path: inset(10% 0 70% 0); }
      99% { transform: translate( 2px, -2px); clip-path: none; }
    }

    @keyframes borderDance {
      0%   { border-color: ${theme.primary}60; }
      25%  { border-color: ${theme.secondary}60; }
      50%  { border-color: ${theme.ai}60; }
      75%  { border-color: ${theme.success}60; }
      100% { border-color: ${theme.primary}60; }
    }

    @keyframes textReveal {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0% 0 0); }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ANIMATION UTILITY CLASSES
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .anim-float         { animation: float       4.5s ease-in-out infinite; }
    .anim-float-slow    { animation: floatSlow   7s   ease-in-out infinite; }
    .anim-fade-in-up    { animation: fadeInUp    0.55s ease-out forwards; }
    .anim-fade-in-down  { animation: fadeInDown  0.55s ease-out forwards; }
    .anim-fade-in-left  { animation: fadeInLeft  0.50s ease-out forwards; }
    .anim-fade-in-right { animation: fadeInRight 0.50s ease-out forwards; }
    .anim-fade-in-scale { animation: fadeInScale 0.45s ease-out forwards; }
    .anim-ink-drop      { animation: inkDrop     0.60s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .anim-spin          { animation: spin        1s   linear infinite; }
    .anim-spin-slow     { animation: spin        6s   linear infinite; }
    .anim-spin-reverse  { animation: spinReverse 8s   linear infinite; }
    .anim-pulse-dot     { animation: pulse-dot   2.2s ease-in-out infinite; }
    .anim-pulse-glow    { animation: pulse-glow  3s   ease-in-out infinite; }
    .anim-morph         { animation: morphBlob   10s  ease-in-out infinite; }
    .anim-tide          { animation: tideRise    6s   ease-in-out infinite; }
    .anim-count         { animation: countUp     0.70s ease-out forwards; }
    .anim-text-reveal   { animation: textReveal  0.80s cubic-bezier(0.4,0,0.2,1) forwards; }
    .anim-depth-pulse   { animation: depthPulse  4s   ease-in-out infinite; }
    .anim-glitch        { animation: glitchShift 8s   steps(1) infinite; }
    .anim-border-dance  { animation: borderDance 6s   linear infinite; }

    .anim-shimmer {
      background: linear-gradient(90deg, transparent, ${theme.primaryFaint}, transparent);
      background-size: 300% 100%;
      animation: shimmer 3.5s infinite;
    }

    .anim-gradient {
      background-size: 200% 200%;
      animation: gradientShift 5s ease infinite;
    }

    /* Stagger delays — .delay-1 through .delay-10 */
    ${Array.from({ length: 10 }, (_, i) =>
        `.delay-${i + 1} { animation-delay: ${((i + 1) * 0.08).toFixed(2)}s; }`
    ).join('\n    ')}

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       TYPOGRAPHY
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .font-display    { font-family: ${theme.fontDisplay}; }
    .font-body       { font-family: ${theme.fontBody}; }
    .font-mono       { font-family: ${theme.fontMono}; }
    .font-decorative { font-family: ${theme.fontDecorative}; }

    .heading-display {
      font-family: ${theme.fontDisplay};
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .heading-elegant {
      font-family: ${theme.fontDecorative};
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.01em;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       GLASSMORPHISM CARDS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .glass-card {
      background: ${theme.glass};
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      border: 1px solid ${theme.glassBorder};
      border-radius: ${theme.radiusLg};
      transition: ${theme.transitionBase};
      position: relative;
      overflow: hidden;
    }

    .glass-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${theme.primary}40, transparent);
      pointer-events: none;
    }

    .glass-card:hover {
      border-color: ${theme.glassBorderHover};
      box-shadow: ${shadowNeon(theme.primary)};
      transform: translateY(-3px);
    }

    .glass-card-heavy {
      background: ${theme.glassHeavy};
      backdrop-filter: blur(28px) saturate(1.5);
      -webkit-backdrop-filter: blur(28px) saturate(1.5);
      border: 1px solid ${theme.glassBorder};
      border-radius: ${theme.radiusLg};
      position: relative;
      overflow: hidden;
    }

    .glass-card-heavy::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${theme.secondary}50, transparent);
      pointer-events: none;
    }

    /* Gradient-border variant */
    .glass-card-teal {
      background: ${theme.glass};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid transparent;
      border-radius: ${theme.radiusLg};
      background-clip: padding-box;
      position: relative;
      overflow: hidden;
    }

    .glass-card-teal::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, ${theme.primary}50, transparent 40%, transparent 60%, ${theme.secondary}40);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    .glass-card-gold {
      background: ${theme.glass};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid ${theme.secondary}25;
      border-radius: ${theme.radiusLg};
      box-shadow: inset 0 1px 0 ${theme.secondary}20, 0 0 20px ${theme.secondary}08;
      position: relative;
      overflow: hidden;
      transition: ${theme.transitionBase};
    }

    .glass-card-gold:hover {
      border-color: ${theme.secondary}55;
      box-shadow: ${theme.shadowGold};
      transform: translateY(-3px);
    }

    .glass-card-abyss {
      background: linear-gradient(160deg, ${theme.bgAlt} 0%, ${theme.mariana} 100%);
      border: 1px solid ${theme.grid};
      border-radius: ${theme.radiusLg};
      box-shadow: 0 8px 32px rgba(0,0,0,0.70);
      position: relative;
      overflow: hidden;
    }

    /* Subtle noise texture — inline SVG avoids a network request */
    .glass-card-abyss::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SCANLINE / DEPTH OVERLAYS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .scanline-overlay {
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.12) 2px,
        rgba(0,0,0,0.12) 4px
      );
      pointer-events: none;
    }

    .scanline-moving::after {
      content: '';
      position: absolute;
      inset: 0;
      height: 80px;
      background: linear-gradient(to bottom, transparent 0%, ${theme.primaryFaint} 50%, transparent 100%);
      animation: scanlineMove 10s linear infinite;
      pointer-events: none;
    }

    .depth-vignette {
      background: radial-gradient(ellipse at center, transparent 40%, rgba(7,3,13,0.6) 100%);
      pointer-events: none;
    }

    .grain-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
      opacity: 0.5;
      pointer-events: none;
      mix-blend-mode: overlay;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       NEON TEXT & GRADIENT TEXT
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .neon-text-primary  { color: ${theme.primary};   text-shadow: 0 0 8px ${theme.primary}90,   0 0 24px ${theme.primary}45,   0 0 55px ${theme.primary}22; }
    .neon-text-gold     { color: ${theme.secondary}; text-shadow: 0 0 8px ${theme.secondary}90, 0 0 24px ${theme.secondary}45, 0 0 50px ${theme.secondary}20; }
    .neon-text-success  { color: ${theme.success};   text-shadow: 0 0 8px ${theme.success}90,   0 0 22px ${theme.success}40; }
    .neon-text-danger   { color: ${theme.danger};    text-shadow: 0 0 8px ${theme.danger}90,    0 0 22px ${theme.danger}40; }
    .neon-text-ai       { color: ${theme.ai};        text-shadow: 0 0 8px ${theme.ai}90,        0 0 24px ${theme.ai}45,        0 0 50px ${theme.ai}20; }
    .neon-text-phosphor { color: ${theme.phosphor};  text-shadow: 0 0 10px ${theme.phosphor}80, 0 0 30px ${theme.primary}50,  0 0 60px ${theme.primary}25; }

    .gradient-text {
      background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-abyss {
      background: linear-gradient(135deg, ${theme.biolume}, ${theme.primary}, ${theme.ai});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-warm {
      background: linear-gradient(135deg, ${theme.secondaryLight}, ${theme.secondary}, ${theme.success});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-gold {
      background: linear-gradient(135deg, ${theme.secondaryLight} 0%, ${theme.secondary} 50%, ${theme.pearl} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-animate {
      background: linear-gradient(270deg, ${theme.primary}, ${theme.secondary}, ${theme.ai}, ${theme.primary});
      background-size: 400% 400%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: deepShimmer 6s ease infinite;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       NEON BORDERS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .neon-border-teal    { border: 1px solid ${theme.primary}55;   box-shadow: inset 0 0 18px ${theme.primary}0C,   0 0 18px ${theme.primary}12; }
    .neon-border-gold    { border: 1px solid ${theme.secondary}55; box-shadow: inset 0 0 18px ${theme.secondary}0C, 0 0 18px ${theme.secondary}12; }
    .neon-border-ai      { border: 1px solid ${theme.ai}55;        box-shadow: inset 0 0 18px ${theme.ai}0C,        0 0 18px ${theme.ai}12; }
    .neon-border-success { border: 1px solid ${theme.success}55;   box-shadow: inset 0 0 18px ${theme.success}0C,   0 0 18px ${theme.success}12; }
    .neon-border-danger  { border: 1px solid ${theme.danger}55;    box-shadow: inset 0 0 18px ${theme.danger}0C,    0 0 18px ${theme.danger}12; }
    .neon-border-animated { border: 1px solid transparent; animation: borderDance 5s linear infinite; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       BUTTONS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .btn-neon {
      position: relative;
      padding: 11px 26px;
      border: 1px solid ${theme.primary}65;
      border-radius: ${theme.radiusMd};
      background: ${theme.primary}10;
      color: ${theme.primary};
      font-family: ${theme.fontBody};
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      overflow: hidden;
      transition: ${theme.transitionBase};
    }

    .btn-neon:hover {
      background: ${theme.primary}22;
      border-color: ${theme.primary}90;
      box-shadow: ${theme.shadowTeal};
      transform: translateY(-2px);
    }

    .btn-neon:active { transform: translateY(0); }

    .btn-neon::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, ${theme.primary}12, transparent);
      background-size: 300% 100%;
      animation: shimmer 3s infinite;
    }

    .btn-neon-gold {
      position: relative;
      padding: 11px 26px;
      border: 1px solid ${theme.secondary}65;
      border-radius: ${theme.radiusMd};
      background: ${theme.secondary}10;
      color: ${theme.secondary};
      font-family: ${theme.fontBody};
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      overflow: hidden;
      transition: ${theme.transitionBase};
    }

    .btn-neon-gold:hover {
      background: ${theme.secondary}22;
      border-color: ${theme.secondary}90;
      box-shadow: ${theme.shadowGold};
      transform: translateY(-2px);
    }

    .btn-glow {
      position: relative;
      padding: 12px 30px;
      border: none;
      border-radius: ${theme.radiusMd};
      background: linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark});
      color: #fff;
      font-family: ${theme.fontBody};
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      cursor: pointer;
      overflow: hidden;
      transition: ${theme.transitionBase};
      box-shadow: 0 4px 20px ${theme.primary}50;
    }

    .btn-glow:hover {
      box-shadow: 0 6px 30px ${theme.primary}70, 0 0 60px ${theme.primary}20;
      transform: translateY(-2px);
    }

    .btn-glow::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent);
      transition: left 0.6s;
    }

    .btn-glow:hover::before { left: 150%; }

    .btn-glow-gold {
      position: relative;
      padding: 12px 30px;
      border: none;
      border-radius: ${theme.radiusMd};
      background: linear-gradient(135deg, ${theme.secondaryLight}, ${theme.secondary}, ${theme.secondaryDark});
      color: ${theme.inkBlack};
      font-family: ${theme.fontDisplay};
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      cursor: pointer;
      overflow: hidden;
      transition: ${theme.transitionBase};
      box-shadow: 0 4px 20px ${theme.secondary}50;
    }

    .btn-glow-gold:hover {
      box-shadow: 0 6px 30px ${theme.secondary}70;
      transform: translateY(-2px);
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px; height: 40px;
      border: 1px solid ${theme.glassBorder};
      border-radius: ${theme.radiusMd};
      background: ${theme.surface};
      color: ${theme.textMuted};
      cursor: pointer;
      transition: ${theme.transitionFast};
    }

    .btn-icon:hover {
      border-color: ${theme.primary}55;
      color: ${theme.primary};
      box-shadow: 0 0 12px ${theme.primary}25;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       INPUT FIELDS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .input-group { position: relative; }

    .input-group:focus-within .input-label {
      color: ${theme.primary};
      text-shadow: 0 0 8px ${theme.primary}45;
    }

    .input-neon {
      width: 100%;
      padding: 13px 18px;
      background: ${theme.surface};
      border: 1px solid ${theme.grid};
      border-radius: ${theme.radiusMd};
      color: ${theme.textMain};
      font-family: ${theme.fontBody};
      font-size: 14px;
      outline: none;
      transition: ${theme.transitionBase};
      caret-color: ${theme.primary};
    }

    .input-neon:focus {
      border-color: ${theme.primary};
      background: ${theme.surfaceHover};
      box-shadow: 0 0 0 3px ${theme.primary}18, ${theme.shadowTeal};
    }

    .input-neon::placeholder { color: ${theme.textDim}; font-style: italic; }
    .input-neon:hover:not(:focus) { border-color: ${theme.gridAlt}; }

    .input-neon.input-gold:focus {
      border-color: ${theme.secondary};
      box-shadow: 0 0 0 3px ${theme.secondary}18, ${theme.shadowGold};
    }

    .input-label {
      display: block;
      margin-bottom: 6px;
      color: ${theme.textMuted};
      font-family: ${theme.fontBody};
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      transition: ${theme.transitionFast};
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       STATUS INDICATORS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .status-dot {
      position: relative;
      width: 10px; height: 10px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }

    .status-dot::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      animation: pulse-ring 2s ease-out infinite;
    }

    .status-dot.online  { background: ${theme.success}; box-shadow: 0 0 6px ${theme.success}; }
    .status-dot.online::before  { border: 2px solid ${theme.success}; }
    .status-dot.warning { background: ${theme.warning}; box-shadow: 0 0 6px ${theme.warning}; }
    .status-dot.warning::before { border: 2px solid ${theme.warning}; }
    .status-dot.error   { background: ${theme.danger};  box-shadow: 0 0 6px ${theme.danger}; }
    .status-dot.error::before   { border: 2px solid ${theme.danger}; }
    .status-dot.idle    { background: ${theme.textDim}; }
    .status-dot.idle::before    { border: 2px solid ${theme.textDim}; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SKELETON LOADING
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .skeleton {
      background: linear-gradient(90deg, ${theme.surface} 20%, ${theme.surfaceHover} 50%, ${theme.surface} 80%);
      background-size: 300% 100%;
      animation: shimmer 2s infinite;
      border-radius: ${theme.radiusSm};
    }

    .skeleton-teal {
      background: linear-gradient(90deg, ${theme.surface} 20%, ${theme.primaryFaint} 50%, ${theme.surface} 80%);
      background-size: 300% 100%;
      animation: shimmer 2.5s infinite;
      border-radius: ${theme.radiusSm};
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SCROLLBAR
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .custom-scroll::-webkit-scrollbar              { width: 5px; }
    .custom-scroll::-webkit-scrollbar-track        { background: ${theme.bg}; }
    .custom-scroll::-webkit-scrollbar-thumb        { background: linear-gradient(180deg, ${theme.primary}60, ${theme.secondary}40); border-radius: 3px; }
    .custom-scroll::-webkit-scrollbar-thumb:hover  { background: ${theme.primary}; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       TOOLTIPS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .tooltip-neon { position: relative; }

    .tooltip-neon::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%) translateY(6px);
      padding: 7px 14px;
      background: ${theme.glassHeavy};
      border: 1px solid ${theme.primary}30;
      border-radius: ${theme.radiusSm};
      color: ${theme.textMain};
      font-family: ${theme.fontBody};
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.60), 0 0 12px ${theme.primary}20;
      transition: ${theme.transitionFast};
      z-index: 100;
    }

    .tooltip-neon:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PROGRESS BARS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .progress-neon {
      width: 100%;
      height: 6px;
      background: ${theme.grid};
      border-radius: ${theme.radiusFull};
      overflow: hidden;
      position: relative;
    }

    .progress-neon-fill {
      height: 100%;
      border-radius: ${theme.radiusFull};
      background: linear-gradient(90deg, ${theme.primary}, ${theme.biolume});
      box-shadow: 0 0 12px ${theme.primary}70;
      transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .progress-neon-fill::after {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 20px; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
      border-radius: inherit;
    }

    .progress-neon-fill.gold {
      background: linear-gradient(90deg, ${theme.secondary}, ${theme.secondaryLight});
      box-shadow: 0 0 12px ${theme.secondary}70;
    }

    .progress-neon-fill.danger {
      background: linear-gradient(90deg, ${theme.dangerDark}, ${theme.danger});
      box-shadow: 0 0 12px ${theme.danger}70;
    }

    .progress-thick { height: 10px; }
    .progress-thick .progress-neon-fill::after { display: none; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       BACKGROUND ORBS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.12;
      pointer-events: none;
    }

    .bg-orb-teal {
      width: 450px; height: 450px;
      background: radial-gradient(circle, ${theme.primary}, ${theme.deepTeal});
      animation: orbDrift1 22s ease-in-out infinite;
    }

    .bg-orb-gold {
      width: 380px; height: 380px;
      background: radial-gradient(circle, ${theme.secondary}, ${theme.secondaryDark});
      animation: orbDrift2 28s ease-in-out infinite;
      opacity: 0.09;
    }

    .bg-orb-ai {
      width: 320px; height: 320px;
      background: radial-gradient(circle, ${theme.ai}, ${theme.aiDark});
      animation: orbDrift3 24s ease-in-out infinite reverse;
      opacity: 0.10;
    }

    .bg-orb-deep {
      width: 600px; height: 600px;
      background: radial-gradient(circle, ${theme.gridAlt}, transparent);
      animation: depthPulse 12s ease-in-out infinite;
      opacity: 0.08;
      filter: blur(120px);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       DATA TABLE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-family: ${theme.fontBody}; }

    .data-table th {
      padding: 13px 18px;
      text-align: left;
      color: ${theme.textDim};
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.10em;
      border-bottom: 1px solid ${theme.grid};
    }

    .data-table th:first-child,
    .data-table td:first-child { padding-left: 24px; }

    .data-table td {
      padding: 13px 18px;
      color: ${theme.textMain};
      font-size: 13.5px;
      border-bottom: 1px solid ${theme.grid}99;
      transition: ${theme.transitionFast};
    }

    .data-table tbody tr { transition: ${theme.transitionFast}; }
    .data-table tbody tr:hover { background: ${theme.primaryFaint}; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       BADGES
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .badge-neon {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 11px;
      border-radius: ${theme.radiusFull};
      font-family: ${theme.fontBody};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .badge-teal    { background: ${theme.primary}1A;    color: ${theme.primary};    border: 1px solid ${theme.primary}35; }
    .badge-gold    { background: ${theme.secondary}1A;  color: ${theme.secondary};  border: 1px solid ${theme.secondary}35; }
    .badge-success { background: ${theme.success}1A;    color: ${theme.success};    border: 1px solid ${theme.success}35; }
    .badge-danger  { background: ${theme.danger}1A;     color: ${theme.danger};     border: 1px solid ${theme.danger}35; }
    .badge-warning { background: ${theme.warning}1A;    color: ${theme.warning};    border: 1px solid ${theme.warning}35; }
    .badge-ai      { background: ${theme.ai}1A;          color: ${theme.ai};         border: 1px solid ${theme.ai}35; }
    .badge-muted   { background: ${theme.surface};      color: ${theme.textMuted};  border: 1px solid ${theme.grid}; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       DIVIDERS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .divider-glow      { height: 1px; background: linear-gradient(90deg, transparent, ${theme.glassBorder}, transparent); }
    .divider-glow-teal { height: 1px; background: linear-gradient(90deg, transparent, ${theme.primary}40,   transparent); }
    .divider-glow-gold { height: 1px; background: linear-gradient(90deg, transparent, ${theme.secondary}40, transparent); }

    .divider-double {
      border: none;
      height: 3px;
      background: linear-gradient(90deg, transparent, ${theme.primary}30 30%, ${theme.secondary}30 70%, transparent);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       STAT CARD
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .stat-card {
      padding: 22px 24px;
      border-radius: ${theme.radiusLg};
      background: ${theme.glass};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid ${theme.glassBorder};
      transition: ${theme.transitionBase};
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      border-radius: 2px 2px 0 0;
    }

    .stat-card.teal::before   { background: linear-gradient(90deg, transparent, ${theme.primary},   transparent); }
    .stat-card.gold::before   { background: linear-gradient(90deg, transparent, ${theme.secondary}, transparent); }
    .stat-card.danger::before { background: linear-gradient(90deg, transparent, ${theme.danger},    transparent); }
    .stat-card.ai::before     { background: linear-gradient(90deg, transparent, ${theme.ai},        transparent); }

    .stat-card:hover { border-color: ${theme.glassBorderHover}; transform: translateY(-4px); }
    .stat-card.teal:hover { box-shadow: ${theme.shadowTeal}; }
    .stat-card.gold:hover { box-shadow: ${theme.shadowGold}; }

    .stat-card .stat-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${theme.textDim};
      margin-bottom: 8px;
    }

    .stat-card .stat-value {
      font-family: ${theme.fontDisplay};
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .stat-card .stat-change {
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stat-change.up   { color: ${theme.success}; }
    .stat-change.down { color: ${theme.danger}; }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MISC UTILITIES
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .ring-teal { outline: none; box-shadow: 0 0 0 3px ${theme.primary}30; }
    .ring-gold { outline: none; box-shadow: 0 0 0 3px ${theme.secondary}30; }

    .surface-raised {
      background: ${theme.surfaceRaised};
      border: 1px solid ${theme.grid};
      border-radius: ${theme.radiusMd};
    }

    .surface-inset {
      background: ${theme.bg};
      border: 1px solid ${theme.grid};
      border-radius: ${theme.radiusMd};
      box-shadow: ${theme.shadowInner};
    }

    .text-balance { text-wrap: balance; }
    .text-pretty  { text-wrap: pretty; }

    ::selection {
      background: ${theme.primary}35;
      color: ${theme.textMain};
    }
  `}</style>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default THEME;