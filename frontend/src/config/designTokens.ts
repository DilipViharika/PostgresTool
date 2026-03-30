// ==========================================================================
//  VIGIL — Design Tokens (single source of truth for the visual system)
// ==========================================================================

/* Accent colors shared by both themes */
export const DS_ACCENTS = {
    cyan:         '#06b6d4',
    cyanDim:      'rgba(6,182,212,0.15)',
    cyanGlow:     'rgba(6,182,212,0.35)',
    violet:       '#8b5cf6',
    violetDim:    'rgba(139,92,246,0.15)',
    emerald:      '#34d399',
    amber:        '#fbbf24',
    rose:         '#fb7185',

    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:   `'DM Sans', 'Sora', system-ui, sans-serif`,
};

export const DS_DARK = {
    ...DS_ACCENTS,
    bg:           '#0a0d1e',
    bgDeep:       '#060818',
    surface:      '#131836',
    surfaceHover: '#1a1f45',
    border:       'rgba(255,255,255,0.06)',
    borderAccent: 'rgba(139,92,246,0.25)',
    textPrimary:  '#f0f0ff',
    textSub:      '#8b8fa8',
    textMuted:    '#4a4e6a',
    glowCyan:     '0 0 20px rgba(6,182,212,0.18), 0 0 60px rgba(6,182,212,0.06)',
    glowViolet:   '0 0 20px rgba(139,92,246,0.18), 0 0 60px rgba(139,92,246,0.06)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.7)',
    sidebarBg:    '#080a18',
    sidebarBorder:'rgba(255,255,255,0.06)',
    sidebarText:  '#6b7094',
    sidebarHover: 'rgba(255,255,255,0.04)',
    headerBg:     'rgba(10,13,30,0.88)',
    logoBg:       'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    logoText:     '#f0f0ff',
    logoSub:      '#4a4e6a',
    _dark: true,
};

export const DS_LIGHT = {
    ...DS_ACCENTS,
    bg:           '#f8fafc',
    bgDeep:       '#f1f5f9',
    surface:      '#ffffff',
    surfaceHover: '#f8fafc',
    border:       'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(139,92,246,0.25)',
    textPrimary:  '#1e293b',
    textSub:      '#475569',
    textMuted:    '#94a3b8',
    glowCyan:     '0 0 20px rgba(6,182,212,0.12), 0 0 40px rgba(6,182,212,0.04)',
    glowViolet:   '0 0 20px rgba(139,92,246,0.12), 0 0 40px rgba(139,92,246,0.04)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.08)',
    sidebarBg:    '#f8fafc',
    sidebarBorder:'rgba(0,0,0,0.06)',
    sidebarText:  '#64748b',
    sidebarHover: 'rgba(0,0,0,0.04)',
    headerBg:     'rgba(255,255,255,0.92)',
    logoBg:       'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    logoText:     '#1e293b',
    logoSub:      '#64748b',
    _dark: false,
};

/* ── Z-Index Scale ── consistent layering across the app ──────────────── *
 *  Use these instead of arbitrary values (e.g. 9999, 10000).
 *  Import: import { Z } from '@/config/designTokens';
 *
 *  TODO: Migrate remaining hardcoded accent colors (#38bdf8, #818cf8,
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
