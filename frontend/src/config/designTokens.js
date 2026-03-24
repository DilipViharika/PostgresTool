// ==========================================================================
//  VIGIL — Design Tokens (single source of truth for the visual system)
// ==========================================================================

/* Accent colors shared by both themes */
export const DS_ACCENTS = {
    cyan:         '#38bdf8',
    cyanDim:      'rgba(56,189,248,0.15)',
    cyanGlow:     'rgba(56,189,248,0.35)',
    violet:       '#818cf8',
    violetDim:    'rgba(129,140,248,0.15)',
    emerald:      '#34d399',
    amber:        '#fbbf24',
    rose:         '#fb7185',

    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:   `'DM Sans', 'Sora', system-ui, sans-serif`,
};

export const DS_DARK = {
    ...DS_ACCENTS,
    bg:           '#04060f',
    bgDeep:       '#020409',
    surface:      '#0a0f1e',
    surfaceHover: '#0e1528',
    border:       'rgba(255,255,255,0.06)',
    borderAccent: 'rgba(56,189,248,0.25)',
    textPrimary:  '#f0f4ff',
    textSub:      '#94a3b8',
    textMuted:    '#475569',
    glowCyan:     '0 0 20px rgba(56,189,248,0.18), 0 0 60px rgba(56,189,248,0.06)',
    glowViolet:   '0 0 20px rgba(129,140,248,0.18), 0 0 60px rgba(129,140,248,0.06)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.7)',
    sidebarBg:    '#050810',
    sidebarBorder:'rgba(255,255,255,0.07)',
    sidebarText:  '#64748b',
    sidebarHover: 'rgba(255,255,255,0.03)',
    headerBg:     'rgba(4,6,15,0.85)',
    logoBg:       'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    logoText:     '#f0f4ff',
    logoSub:      '#475569',
    _dark: true,
};

export const DS_LIGHT = {
    ...DS_ACCENTS,
    bg:           '#f0f4f8',
    bgDeep:       '#e2e8f0',
    surface:      '#ffffff',
    surfaceHover: '#f1f5f9',
    border:       'rgba(0,0,0,0.09)',
    borderAccent: 'rgba(14,165,233,0.35)',
    textPrimary:  '#0f172a',
    textSub:      '#334155',
    textMuted:    '#64748b',
    glowCyan:     '0 0 20px rgba(14,165,233,0.12), 0 0 40px rgba(14,165,233,0.04)',
    glowViolet:   '0 0 20px rgba(99,102,241,0.12), 0 0 40px rgba(99,102,241,0.04)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.12)',
    sidebarBg:    '#f8fafc',
    sidebarBorder:'rgba(0,0,0,0.08)',
    sidebarText:  '#475569',
    sidebarHover: 'rgba(0,0,0,0.04)',
    headerBg:     'rgba(240,244,248,0.92)',
    logoBg:       'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    logoText:     '#0f172a',
    logoSub:      '#64748b',
    _dark: false,
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
