import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeTokens {
    // Accents
    cyan: string;
    cyanDim: string;
    cyanGlow: string;
    violet: string;
    violetDim: string;
    emerald: string;
    amber: string;
    rose: string;
    fontMono: string;
    fontUI: string;
    // Background & Surface
    bg: string;
    bgDeep: string;
    surface: string;
    surfaceHover: string;
    // Borders
    border: string;
    borderAccent: string;
    // Text
    textPrimary: string;
    textSub: string;
    textMuted: string;
    // UI Elements
    headerBg: string;
    sidebarBg: string;
    sidebarBorder: string;
    sidebarText: string;
    sidebarHover: string;
    cardBg: string;
    inputBg: string;
    // Scrollbar
    scrollTrack: string;
    scrollThumb: string;
    // Glows & Shadows
    glowCyan: string;
    glowViolet: string;
    shadowCard: string;
    shadowDeep: string;
    // Logo
    logoBg: string;
    logoText: string;
    logoSub: string;
    // Meta
    _dark: boolean;
}

interface ThemeContextValue {
    isDark: boolean;
    tokens: ThemeTokens;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ACCENT PALETTE (SHARED)
// ═══════════════════════════════════════════════════════════════════════════

const DS_ACCENTS = {
    cyan:         '#38bdf8',
    cyanDim:      'rgba(56,189,248,0.15)',
    cyanGlow:     'rgba(56,189,248,0.35)',
    violet:       '#818cf8',
    violetDim:    'rgba(129,140,248,0.15)',
    emerald:      '#34d399',
    amber:        '#fbbf24',
    rose:         '#fb7185',
    fontMono:     `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI:       `'DM Sans', system-ui, sans-serif`,
};

// ═══════════════════════════════════════════════════════════════════════════
//  THEME TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const DARK_TOKENS: ThemeTokens = {
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
    headerBg:     'rgba(4,6,15,0.85)',
    sidebarBg:    '#050810',
    sidebarBorder:'rgba(255,255,255,0.07)',
    sidebarText:  '#64748b',
    sidebarHover: 'rgba(255,255,255,0.03)',
    cardBg:       'rgba(10,15,30,0.7)',
    inputBg:      'rgba(255,255,255,0.03)',
    scrollTrack:  '#04060f',
    scrollThumb:  '#1e293b',
    glowCyan:     '0 0 20px rgba(56,189,248,0.18), 0 0 60px rgba(56,189,248,0.06)',
    glowViolet:   '0 0 20px rgba(129,140,248,0.18), 0 0 60px rgba(129,140,248,0.06)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.7)',
    logoBg:       'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    logoText:     '#f0f4ff',
    logoSub:      '#475569',
    _dark:        true,
};

export const LIGHT_TOKENS: ThemeTokens = {
    ...DS_ACCENTS,
    bg:           '#f0f4f8',
    bgDeep:       '#e2e8f0',
    surface:      '#ffffff',
    surfaceHover: '#f1f5f9',
    border:       'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(14,165,233,0.35)',
    textPrimary:  '#0f172a',
    textSub:      '#334155',
    textMuted:    '#64748b',
    headerBg:     'rgba(240,244,248,0.92)',
    sidebarBg:    '#f8fafc',
    sidebarBorder:'rgba(0,0,0,0.08)',
    sidebarText:  '#475569',
    sidebarHover: 'rgba(0,0,0,0.04)',
    cardBg:       'rgba(255,255,255,0.9)',
    inputBg:      'rgba(0,0,0,0.03)',
    scrollTrack:  '#e2e8f0',
    scrollThumb:  '#94a3b8',
    glowCyan:     '0 0 20px rgba(14,165,233,0.12), 0 0 40px rgba(14,165,233,0.04)',
    glowViolet:   '0 0 20px rgba(99,102,241,0.12), 0 0 40px rgba(99,102,241,0.04)',
    shadowCard:   '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    shadowDeep:   '0 20px 60px rgba(0,0,0,0.12)',
    logoBg:       'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    logoText:     '#0f172a',
    logoSub:      '#64748b',
    _dark:        false,
};

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        try { return localStorage.getItem('vigil_theme') !== 'light'; }
        catch { return true; }
    });

    const tokens = isDark ? DARK_TOKENS : LIGHT_TOKENS;

    useEffect(() => {
        try { localStorage.setItem('vigil_theme', isDark ? 'dark' : 'light'); } catch {}
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.style.backgroundColor = tokens.bg;
        document.body.style.color = tokens.textPrimary;
    }, [isDark, tokens]);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => {
            const next = !prev;
            /* Broadcast for legacy module-level DS consumers */
            window.dispatchEvent(new CustomEvent('vigil-theme-change', { detail: { isDark: next } }));
            return next;
        });
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({ isDark, tokens, toggleTheme }), [isDark, tokens, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

export default ThemeContext;
