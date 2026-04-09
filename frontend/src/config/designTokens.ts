// ==========================================================================
//  VIGIL — Design Tokens (single source of truth for the visual system)
// ==========================================================================

/* Accent colors shared by both themes — VIGIL Indigo palette */
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

export const DS_DARK = {
    ...DS_ACCENTS,
    bg:           '#0f1923',
    bgDeep:       '#0a1219',
    surface:      '#1a2736',
    surfaceHover: '#1f2f40',
    border:       'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(99,102,241,0.2)',
    textPrimary:  '#f0f4ff',
    textSub:      '#8b9ab8',
    textMuted:    '#5a6e84',
    glowCyan:     '0 0 12px rgba(99,102,241,0.12), 0 0 30px rgba(99,102,241,0.04)',
    glowViolet:   '0 0 12px rgba(99,102,241,0.12), 0 0 30px rgba(99,102,241,0.04)',
    shadowCard:   '0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
    shadowDeep:   '0 8px 32px rgba(0,0,0,0.4)',
    sidebarBg:    '#131f2e',
    sidebarBorder:'rgba(255,255,255,0.06)',
    sidebarText:  '#6b8094',
    sidebarHover: 'rgba(255,255,255,0.04)',
    headerBg:     'rgba(15,25,35,0.92)',
    logoBg:       'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)',
    logoText:     '#f0f4ff',
    logoSub:      '#5a6e84',
    _dark: true,
};

export const DS_LIGHT = {
    ...DS_ACCENTS,
    bg:           '#f5f5f9',
    bgDeep:       '#eef0f6',
    surface:      '#ffffff',
    surfaceHover: '#f0f1f7',
    border:       'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(99,102,241,0.25)',
    textPrimary:  '#111827',
    textSub:      '#4b5563',
    textMuted:    '#9ca3af',
    glowCyan:     '0 0 12px rgba(99,102,241,0.10)',
    glowViolet:   '0 0 12px rgba(99,102,241,0.10)',
    shadowCard:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    shadowDeep:   '0 12px 36px rgba(0,0,0,0.08)',
    sidebarBg:    '#1e1b4b',
    sidebarBorder:'rgba(255,255,255,0.08)',
    sidebarText:  'rgba(255,255,255,0.6)',
    sidebarHover: 'rgba(255,255,255,0.08)',
    headerBg:     'rgba(255,255,255,0.88)',
    logoBg:       'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    logoText:     '#ffffff',
    logoSub:      'rgba(255,255,255,0.5)',
    _dark: false,
};

/* ── Z-Index Scale ── consistent layering across the app ──────────────── */
export const Z = {
    base:       1,
    dropdown:   100,
    sticky:     200,
    sidebar:    300,
    overlay:    400,
    modal:      500,
    toast:      600,
    popover:    700,
    max:        999,
};

/* Mutable DS — swapped by ThemeToggle, picked up on re-render */
let DS = (() => {
    try { return localStorage.getItem('vigil_theme') === 'dark' ? DS_DARK : DS_LIGHT; }
    catch { return DS_LIGHT; }
})();

export function setDS(newDS) { DS = newDS; }
export function getDS() { return DS; }
export { DS };
export default DS;