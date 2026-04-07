import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);

/* ── Accent palette (shared) — VaultDB palette ── */
const DS_ACCENTS = {
    cyan: '#00b874',
    cyanDim: 'rgba(0,184,116,0.15)',
    cyanGlow: 'rgba(0,184,116,0.35)',
    violet: '#00b874',
    violetDim: 'rgba(0,184,116,0.15)',
    emerald: '#00b874',
    amber: '#fbbf24',
    rose: '#fb7185',
    fontMono: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`,
    fontUI: `'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
};

export const DARK_TOKENS = {
    ...DS_ACCENTS,
    bg: '#0b1a24',
    bgDeep: '#081218',
    surface: '#0e2a3e',
    surfaceHover: '#133348',
    border: 'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(0,184,116,0.25)',
    textPrimary: '#f0f4ff',
    textSub: '#8b9ab8',
    textMuted: '#4a5e7a',
    headerBg: 'rgba(11,26,36,0.92)',
    sidebarBg: '#091620',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    sidebarText: '#6b8094',
    sidebarHover: 'rgba(0,184,116,0.06)',
    cardBg: 'rgba(14,42,62,0.7)',
    inputBg: 'rgba(255,255,255,0.06)',
    scrollTrack: '#0b1a24',
    scrollThumb: '#1a3a50',
    glowCyan: '0 0 20px rgba(0,184,116,0.18), 0 0 60px rgba(0,184,116,0.06)',
    glowViolet: '0 0 20px rgba(0,184,116,0.18), 0 0 60px rgba(0,184,116,0.06)',
    shadowCard: '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep: '0 20px 60px rgba(0,0,0,0.7)',
    logoBg: 'linear-gradient(135deg, #00e5a0 0%, #00b874 100%)',
    logoText: '#f0f4ff',
    logoSub: '#4a5e7a',
    _dark: true,
};

export const LIGHT_TOKENS = {
    ...DS_ACCENTS,
    bg: '#f8f9fb',
    bgDeep: '#f1f3f6',
    surface: '#ffffff',
    surfaceHover: '#f4f5f7',
    border: 'rgba(0,0,0,0.07)',
    borderAccent: 'rgba(0,184,116,0.20)',
    textPrimary: '#111827',
    textSub: '#4b5563',
    textMuted: '#9ca3af',
    headerBg: 'rgba(255,255,255,0.85)',
    sidebarBg: '#ffffff',
    sidebarBorder: 'rgba(0,0,0,0.05)',
    sidebarText: '#6b7280',
    sidebarHover: 'rgba(0,184,116,0.05)',
    cardBg: '#ffffff',
    inputBg: '#f4f5f7',
    scrollTrack: '#f1f3f6',
    scrollThumb: '#d1d5db',
    glowCyan: '0 0 12px rgba(0,184,116,0.08)',
    glowViolet: '0 0 12px rgba(0,184,116,0.08)',
    shadowCard: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    shadowDeep: '0 10px 30px rgba(0,0,0,0.06)',
    logoBg: 'linear-gradient(135deg, #00e5a0 0%, #00b874 100%)',
    logoText: '#111827',
    logoSub: '#6b7280',
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
