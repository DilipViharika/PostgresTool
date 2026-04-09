// ==========================================================================
//  VIGIL — Design Tokens (Z-index scale & accent colors reference)
//  Theme tokens now consolidated in utils/theme.tsx
// ==========================================================================

/* Accent colors shared by both themes — VIGIL Indigo palette (reference only) */
export const DS_ACCENTS = {
    cyan:         '#6366f1',
    cyanDim:      'rgba(99,102,241,0.15)',
    cyanGlow:     'rgba(99,102,241,0.35)',
    violet:       '#8b5cf6',
    violetDim:    'rgba(139,92,246,0.15)',
    emerald:      '#10b981',
    amber:        '#fbbf24',
    rose:         '#fb7185',

    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:   `'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
};

/* ── Z-Index Scale ── consistent layering across the app ──────────────── *
 *  Use these instead of arbitrary values (e.g. 9999, 10000).
 *  Import: import { Z } from '@/config/designTokens';
 * ──────────────────────────────────────────────────────────────────────── */
export const Z = {
    base:       1,      // default stacking (sticky headers, relative layers)
    dropdown:   100,    // dropdowns, popovers, tooltips
    sticky:     200,    // sticky elements, floating action buttons
    sidebar:    300,    // sidebar, panels
    overlay:    400,    // overlays, backdrops
    modal:      500,    // modal dialogs
    toast:      600,    // toast notifications, snackbars
    popover:    700,    // popovers that sit above modals
    max:        999,    // absolute top (debug tools, critical alerts)
};

// Legacy exports for backward compatibility - theme tokens are now in utils/theme.tsx
// Use THEME from utils/theme.tsx instead of these
import { THEME as THEME_TOKENS } from '../utils/theme';

// Merge THEME tokens with DS_ACCENTS for backward compatibility
const getMergedDS = () => ({ ...DS_ACCENTS, ...THEME_TOKENS });

export const DS_DARK = getMergedDS();
export const DS_LIGHT = getMergedDS();
export const getDS = getMergedDS;
export const setDS = () => {}; // no-op for backward compat
export const DS = getMergedDS();
export default getMergedDS();