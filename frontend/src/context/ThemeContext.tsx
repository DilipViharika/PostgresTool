import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);

/* ── Accent palette (shared) — Indigo palette ── */
const DS_ACCENTS = {
    cyan: '#6366f1',
    cyanDim: 'rgba(99,102,241,0.15)',
    cyanGlow: 'rgba(99,102,241,0.35)',
    violet: '#8b5cf6',
    violetDim: 'rgba(139,92,246,0.15)',
    emerald: '#10b981',
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
    borderAccent: 'rgba(99,102,241,0.25)',
    textPrimary: '#f0f4ff',
    textSub: '#8b9ab8',
    textMuted: '#4a5e7a',
    headerBg: 'rgba(11,26,36,0.92)',
    sidebarBg: '#091620',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    sidebarText: '#6b8094',
    sidebarHover: 'rgba(99,102,241,0.06)',
    cardBg: 'rgba(14,42,62,0.7)',
    inputBg: 'rgba(255,255,255,0.06)',
    scrollTrack: '#0b1a24',
    scrollThumb: '#1a3a50',
    glowCyan: '0 0 20px rgba(99,102,241,0.18), 0 0 60px rgba(99,102,241,0.06)',
    glowViolet: '0 0 20px rgba(99,102,241,0.18), 0 0 60px rgba(99,102,241,0.06)',
    shadowCard: '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.8)',
    shadowDeep: '0 20px 60px rgba(0,0,0,0.7)',
    logoBg: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)',
    logoText: '#f0f4ff',
    logoSub: '#4a5e7a',
    _dark: true,
};

export const LIGHT_TOKENS = {
    ...DS_ACCENTS,
    bg: '#f5f5f9',
    bgDeep: '#eef0f6',
    surface: '#ffffff',
    surfaceHover: '#f0f1f7',
    border: 'rgba(0,0,0,0.08)',
    borderAccent: 'rgba(99,102,241,0.25)',
    textPrimary: '#111827',
    textSub: '#4b5563',
    textMuted: '#9ca3af',
    headerBg: 'rgba(255,255,255,0.85)',
    sidebarBg: '#1e1b4b',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    sidebarText: 'rgba(255,255,255,0.6)',
    sidebarHover: 'rgba(255,255,255,0.08)',
    cardBg: '#ffffff',
    inputBg: '#f4f5f7',
    scrollTrack: '#f1f3f6',
    scrollThumb: '#d1d5db',
    glowCyan: '0 0 12px rgba(99,102,241,0.10)',
    glowViolet: '0 0 12px rgba(99,102,241,0.10)',
    shadowCard: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    shadowDeep: '0 12px 36px rgba(0,0,0,0.08)',
    logoBg: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    logoText: '#ffffff',
    logoSub: 'rgba(255,255,255,0.5)',
    _dark: false,
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        try {
            return localStorage.getItem('fathom_theme') === 'dark';
        } catch {
            return false;
        }
    });

    const tokens = isDark ? DARK_TOKENS : LIGHT_TOKENS;

    useEffect(() => {
        try {
            localStorage.setItem('fathom_theme', isDark ? 'dark' : 'light');
        } catch {}
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.style.backgroundColor = tokens.bg;
        document.body.style.color = tokens.textPrimary;
    }, [isDark, tokens]);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            /* Broadcast for legacy module-level DS consumers */
            window.dispatchEvent(new CustomEvent('fathom-theme-change', { detail: { isDark: next } }));
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