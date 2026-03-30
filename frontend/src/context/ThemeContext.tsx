import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);

/* ── Accent palette (shared) ── */
const DS_ACCENTS = {
    cyan: '#06b6d4',
    cyanDim: 'rgba(6,182,212,0.15)',
    cyanGlow: 'rgba(6,182,212,0.35)',
    violet: '#818cf8',
    violetDim: 'rgba(129,140,248,0.15)',
    emerald: '#34d399',
    amber: '#fbbf24',
    rose: '#fb7185',
    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI: `'DM Sans', system-ui, sans-serif`,
};

export const DARK_TOKENS = {
    ...DS_ACCENTS,
    bg: '#0a0d1e',
    bgDeep: '#060818',
    surface: '#131836',
    surfaceHover: '#1a1f45',
    border: 'rgba(255,255,255,0.06)',
    borderAccent: 'rgba(139,92,246,0.25)',
    textPrimary: '#f0f0ff',
    textSub: '#8b8fa8',
    textMuted: '#4a4e6a',
    headerBg: 'rgba(10,13,30,0.88)',
    sidebarBg: '#080a18',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    sidebarText: '#6b7094',
    sidebarHover: 'rgba(255,255,255,0.04)',
    cardBg: 'rgba(19,24,54,0.7)',
    inputBg: 'rgba(255,255,255,0.04)',
    scrollTrack: '#0a0d1e',
    scrollThumb: '#252b50',
    glowCyan: '0 0 20px rgba(139,92,246,0.18), 0 0 60px rgba(139,92,246,0.06)',
    glowViolet: '0 0 20px rgba(6,182,212,0.18), 0 0 60px rgba(6,182,212,0.06)',
    shadowCard: '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep: '0 20px 60px rgba(0,0,0,0.7)',
    logoBg: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    logoText: '#f0f0ff',
    logoSub: '#4a4e6a',
    _dark: true,
};

export const LIGHT_TOKENS = {
    ...DS_ACCENTS,
    bg: '#f8fafc',
    bgDeep: '#f1f5f9',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    border: 'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(139,92,246,0.25)',
    textPrimary: '#1e293b',
    textSub: '#475569',
    textMuted: '#94a3b8',
    headerBg: 'rgba(255,255,255,0.92)',
    sidebarBg: '#f8fafc',
    sidebarBorder: 'rgba(0,0,0,0.06)',
    sidebarText: '#64748b',
    sidebarHover: 'rgba(0,0,0,0.04)',
    cardBg: 'rgba(255,255,255,0.95)',
    inputBg: '#f8fafc',
    scrollTrack: '#f1f5f9',
    scrollThumb: '#cbd5e1',
    glowCyan: '0 0 20px rgba(139,92,246,0.12), 0 0 40px rgba(139,92,246,0.04)',
    glowViolet: '0 0 20px rgba(6,182,212,0.12), 0 0 40px rgba(6,182,212,0.04)',
    shadowCard: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
    shadowDeep: '0 20px 60px rgba(0,0,0,0.08)',
    logoBg: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    logoText: '#1e293b',
    logoSub: '#64748b',
    _dark: false,
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        try {
            return localStorage.getItem('vigil_theme') === 'dark';
        } catch {
            return false;
        }
    });

    const tokens = isDark ? DARK_TOKENS : LIGHT_TOKENS;

    useEffect(() => {
        try {
            localStorage.setItem('vigil_theme', isDark ? 'dark' : 'light');
        } catch {}
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.style.backgroundColor = tokens.bg;
        document.body.style.color = tokens.textPrimary;
    }, [isDark, tokens]);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            /* Broadcast for legacy module-level DS consumers */
            window.dispatchEvent(new CustomEvent('vigil-theme-change', { detail: { isDark: next } }));
            return next;
        });
    }, []);

    const value = useMemo(() => ({ isDark, tokens, toggleTheme }), [isDark, tokens, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

export default ThemeContext;
