import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { THEME } from '../utils/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        try {
            return localStorage.getItem('vigil_theme') === 'dark';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('vigil_theme', isDark ? 'dark' : 'light');
        } catch {}
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.body.style.backgroundColor = THEME.bg;
        document.body.style.color = THEME.textMain;
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            /* Broadcast for legacy module-level DS consumers */
            window.dispatchEvent(new CustomEvent('vigil-theme-change', { detail: { isDark: next } }));
            return next;
        });
    }, []);

    const value = useMemo(() => ({ isDark, tokens: THEME, toggleTheme }), [isDark, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

export default ThemeContext;