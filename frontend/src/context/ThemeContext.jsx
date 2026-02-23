import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext(null);

export const DARK_TOKENS = {
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
  cardBg:       'rgba(10,15,30,0.7)',
  inputBg:      'rgba(255,255,255,0.03)',
  scrollTrack:  '#04060f',
  scrollThumb:  '#1e293b',
};

export const LIGHT_TOKENS = {
  bg:           '#f1f5f9',
  bgDeep:       '#e2e8f0',
  surface:      '#ffffff',
  surfaceHover: '#f8fafc',
  border:       'rgba(0,0,0,0.08)',
  borderAccent: 'rgba(14,165,233,0.35)',
  textPrimary:  '#0f172a',
  textSub:      '#334155',
  textMuted:    '#64748b',
  headerBg:     'rgba(241,245,249,0.92)',
  sidebarBg:    '#f8fafc',
  cardBg:       'rgba(255,255,255,0.9)',
  inputBg:      'rgba(0,0,0,0.03)',
  scrollTrack:  '#e2e8f0',
  scrollThumb:  '#94a3b8',
};

export const ThemeProvider = ({ children }) => {
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

  const toggleTheme = () => setIsDark(p => !p);

  const value = useMemo(() => ({ isDark, tokens, toggleTheme }), [isDark, tokens]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
