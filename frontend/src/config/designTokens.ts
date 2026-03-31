// ==========================================================================
//  VIGIL — Design Tokens (single source of truth for the visual system)
// ==========================================================================

/* Accent colors shared by both themes — VIGIL Blue palette */
export const DS_ACCENTS = {
    cyan:         '#00b874',
    cyanDim:      'rgba(0,184,116,0.15)',
    cyanGlow:     'rgba(0,184,116,0.35)',
    violet:       '#00b874',
    violetDim:    'rgba(0,184,116,0.15)',
    emerald:      '#00b874',
    amber:        '#fbbf24',
    rose:         '#fb7185',

    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:   `'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
};

export const DS_DARK = {
    ...DS_ACCENTS,
    bg:           '#0b1a24',
    bgDeep:       '#081218',
    surface:      '#0e2a3e',
    surfaceHover: '#133348',
    border:       'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(0,184,116,0.25)',
    textPrimary:  '#f0f4ff',
    textSub:      '#8b9ab8',
    textMuted:    '#4a5e7a',
    glowCyan:     '0 0 20px rgba(0,184,116,0.18), 0 0 60px rgba(0,184,116,0.06)',
    glowViolet:   '0 0 20px rgba(0,184,116,0.18), 0 0 60px rgba(0,184,116,0.06)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.7)',
    sidebarBg:    '#091620',
    sidebarBorder:'rgba(255,255,255,0.08)',
    sidebarText:  '#6b8094',
    sidebarHover: 'rgba(0,184,116,0.06)',
    headerBg:     'rgba(11,26,36,0.92)',
    logoBg:       'linear-gradient(135deg, #00e5a0 0%, #00b874 100%)',
    logoText:     '#f0f4ff',
    logoSub:      '#4a5e7a',
    _dark: true,
};

export const DS_LIGHT = {
    ...DS_ACCENTS,
    bg:           '#eceef4',
    bgDeep:       '#e4e7ef',
    surface:      '#ffffff',
    surfaceHover: '#f3f4f8',
    border:       'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(0,184,116,0.25)',
    textPrimary:  '#1a1e2e',
    textSub:      '#5a6078',
    textMuted:    '#9198ae',
    glowCyan:     '0 0 20px rgba(0,184,116,0.12), 0 0 40px rgba(0,184,116,0.04)',
    glowViolet:   '0 0 20px rgba(0,184,116,0.12), 0 0 40px rgba(0,184,116,0.04)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.08)',
    sidebarBg:    '#f3f4f8',
    sidebarBorder:'rgba(0,0,0,0.06)',
    sidebarText:  '#5a6078',
    sidebarHover: 'rgba(0,184,116,0.06)',
    headerBg:     'rgba(255,255,255,0.92)',
    logoBg:       'linear-gradient(135deg, #00e5a0 0%, #00b874 100%)',
    logoText:     '#1a1e2e',
    logoSub:      '#5a6078',
    _dark: false,
};

/* ── Z-Index Scale ── consistent layering across the app ──────────────── *
 *  Use these instead of arbitrary values (e.g. 9999, 10000).
 *  Import: import { Z } from '@/config/designTokens';
 *
 *  TODO: Migrate remaining hardcoded accent colors (#38bdf8, #00b874,
 *        #34d399, #fbbf24, #fb7185) in ~11 component files to use
 *        DS.cyan / DS.violet / DS.emerald / DS.amber / DS.rose instead.
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

/* Mutable DS — swapped by ThemeToggle, picked up on re-render */
let DS = (() => {
    try { return localStorage.getItem('vigil_theme') === 'light' ? DS_LIGHT : DS_DARK; }
    catch { return DS_DARK; }
})();

export function setDS(newDS) { DS = newDS; }
export function getDS() { return DS; }
export { DS };
export default DS;
