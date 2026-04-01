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
    bg:           '#0f1923',
    bgDeep:       '#0a1219',
    surface:      '#1a2736',
    surfaceHover: '#1f2f40',
    border:       'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(0,184,116,0.2)',
    textPrimary:  '#f0f4ff',
    textSub:      '#8b9ab8',
    textMuted:    '#5a6e84',
    glowCyan:     '0 0 12px rgba(0,184,116,0.12), 0 0 30px rgba(0,184,116,0.04)',
    glowViolet:   '0 0 12px rgba(0,184,116,0.12), 0 0 30px rgba(0,184,116,0.04)',
    shadowCard:   '0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
    shadowDeep:   '0 8px 32px rgba(0,0,0,0.4)',
    sidebarBg:    '#131f2e',
    sidebarBorder:'rgba(255,255,255,0.06)',
    sidebarText:  '#6b8094',
    sidebarHover: 'rgba(255,255,255,0.04)',
    headerBg:     'rgba(15,25,35,0.92)',
    logoBg:       'linear-gradient(135deg, #00e5a0 0%, #00b874 100%)',
    logoText:     '#f0f4ff',
    logoSub:      '#5a6e84',
    _dark: true,
};

export const DS_LIGHT = {
    ...DS_ACCENTS,
    bg:           '#f0f2f5',
    bgDeep:       '#e8eaef',
    surface:      '#ffffff',
    surfaceHover: '#f7f8fa',
    border:       'rgba(0,0,0,0.06)',
    borderAccent: 'rgba(0,184,116,0.15)',
    textPrimary:  '#1a1e2e',
    textSub:      '#4a5068',
    textMuted:    '#8590a5',
    glowCyan:     '0 0 8px rgba(0,184,116,0.08)',
    glowViolet:   '0 0 8px rgba(0,184,116,0.08)',
    shadowCard:   '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
    shadowDeep:   '0 8px 32px rgba(0,0,0,0.08)',
    sidebarBg:    '#ffffff',
    sidebarBorder:'rgba(0,0,0,0.06)',
    sidebarText:  '#5a6078',
    sidebarHover: 'rgba(0,0,0,0.025)',
    headerBg:     'rgba(255,255,255,0.95)',
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
