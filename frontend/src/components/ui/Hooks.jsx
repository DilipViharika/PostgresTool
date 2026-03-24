import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { THEME as _AT, useAdaptiveTheme } from '../../utils/theme.jsx';
import {
    ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar,
    PolarAngleAxis, AreaChart, Area, BarChart, Bar, Cell, Tooltip,
    PieChart, Pie, CartesianGrid, XAxis, YAxis, ReferenceLine, ComposedChart,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
    TrendingUp, TrendingDown, Terminal as TerminalIcon, Zap, Bell, BellOff, Wifi, WifiOff,
    Shield, ShieldCheck, ShieldAlert, Eye, EyeOff, Clock, Star, StarOff,
    Tag, Hash, Database, HardDrive, Lock, Unlock, AlertTriangle, AlertCircle,
    CheckCircle, XCircle, Info, ChevronRight, ChevronDown, Copy, Check,
    RefreshCw, Loader, Search, Filter, X, MoreVertical, ExternalLink,
    Activity, Server, Cpu, ArrowUpRight, ArrowDownRight, Layers as LayersIcon, GitBranch,
    Radio, Hexagon, Triangle, Sparkles, Binary, Braces, Orbit, Play, Pause,
    SkipForward, Volume2, Maximize2, Minimize2, Settings, User, Globe,
    BarChart2, ChevronLeft, ChevronUp, Download,
    Upload, Link, Unlink, Box, Sliders, Code, FileText, Folder, Moon,
    Sun, Crosshair, Map, Compass, Navigation,
    Power, Share2, GitMerge, Flag, Bookmark, Archive
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
//  ADVANCED THEME SYSTEM — Neural Interface OS v3.0
// ═══════════════════════════════════════════════════════════════════════════
export const THEME = {
    // Void palette — deeper, richer blacks
    void:       '#00000d',
    deep:       '#010314',
    abyss:      '#02061a',
    surface:    '#04091c',
    elevated:   '#070f24',
    overlay:    '#0c1830',
    raised:     '#101f3c',

    // Plasma accents — more vibrant
    plasma:     '#00f5ff',
    neon:       '#7b2fff',
    pulse:      '#ff2d78',
    aurora:     '#00ff88',
    solar:      '#ffaa00',
    nova:       '#ff6b35',
    frost:      '#a8d8ff',
    quantum:    '#b44bff',
    ember:      '#ff4d00',
    jade:       '#00ffa3',
    cobalt:     '#0080ff',
    crimson:    '#ff1a4b',

    // Semantic
    primary:    '#00f5ff',
    secondary:  '#7b2fff',
    success:    '#00ff88',
    danger:     '#ff2d78',
    warning:    '#ffaa00',
    info:       '#4d9fff',
    ai:         '#a855f7',

    // Text hierarchy
    textMain:   '#eef4ff',
    textSub:    '#8aa3c8',
    textMuted:  '#4a6080',
    textDim:    '#243040',
    textGhost:  '#121e2e',

    // Glass & borders
    glass:      'rgba(4, 9, 28, 0.88)',
    glassLight: 'rgba(12, 24, 48, 0.65)',
    glassFrost: 'rgba(168, 216, 255, 0.04)',
    border:     'rgba(0, 245, 255, 0.07)',
    borderHot:  'rgba(0, 245, 255, 0.28)',
    borderGlow: 'rgba(0, 245, 255, 0.5)',
    grid:       'rgba(0, 245, 255, 0.035)',

    // Gradients
    gradientA:  'linear-gradient(135deg, #00f5ff15, #7b2fff08)',
    gradientB:  'linear-gradient(135deg, #ff2d7808, #ffaa0006)',
    gradientC:  'linear-gradient(135deg, #00ff8810, #00f5ff06)',

    // Fonts
    fontMono:    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontDisplay: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif",
    fontBody:    "'Exo 2', 'Titillium Web', 'Outfit', sans-serif",
    fontAlt:     "'Space Grotesk', 'Inter', sans-serif",
};

// ═══════════════════════════════════════════════════════════════════════════
//  GLOBAL CONTEXT — Theme + Alerts + State
// ═══════════════════════════════════════════════════════════════════════════
const NeuralContext = createContext({});
export const useNeural = () => useContext(NeuralContext);

export const NeuralProvider = ({ children, theme: customTheme }) => {
    const [alerts, setAlerts] = useState([]);
    const [glitchTarget, setGlitchTarget] = useState(null);
    const merged = { ...THEME, ...(customTheme || {}) };
    const pushAlert = useCallback((alert) => {
        const id = Date.now();
        setAlerts(prev => [{ ...alert, id, ts: Date.now() }, ...prev].slice(0, 8));
        return id;
    }, []);
    const dismissAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);
    return (
        <NeuralContext.Provider value={{ theme: merged, alerts, pushAlert, dismissAlert, glitchTarget, setGlitchTarget }}>
            {children}
        </NeuralContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  KEYFRAMES v3 — Extended animation suite
// ═══════════════════════════════════════════════════════════════════════════
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
  --plasma:#00f5ff; --neon:#7b2fff; --pulse:#ff2d78;
  --aurora:#00ff88; --solar:#ffaa00; --nova:#ff6b35;
  --void:#00000d; --surface:#04091c;
  --font-mono:'JetBrains Mono',monospace;
  --font-display:'Orbitron',sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

@keyframes fadeUp       { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeDown     { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn       { from{opacity:0} to{opacity:1} }
@keyframes scaleIn      { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
@keyframes scaleUp      { from{opacity:0;transform:scale(1.12)} to{opacity:1;transform:scale(1)} }
@keyframes slideRight   { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideLeft    { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
@keyframes alertSlide   { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
@keyframes ping         { 75%,100%{transform:scale(2.4);opacity:0} }
@keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.38} }
@keyframes breathe      { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
@keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes spinReverse  { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
@keyframes countUp      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer      { 0%{background-position:-600% 0} 100%{background-position:600% 0} }
@keyframes scanline     { 0%{top:-12%} 100%{top:112%} }
@keyframes flicker      { 0%,100%{opacity:1} 91%{opacity:1} 92%{opacity:0.75} 93%{opacity:1} 95%{opacity:0.85} 96%{opacity:1} }
@keyframes plasmaGlow   { 0%,100%{box-shadow:0 0 8px #00f5ff40,0 0 18px #00f5ff18,inset 0 0 10px #00f5ff0c}
                          50%{box-shadow:0 0 24px #00f5ff70,0 0 48px #00f5ff28,inset 0 0 24px #00f5ff1a} }
@keyframes neonGlow     { 0%,100%{box-shadow:0 0 8px #7b2fff40,0 0 18px #7b2fff18}
                          50%{box-shadow:0 0 24px #7b2fff80,0 0 48px #7b2fff35} }
@keyframes auroraPulse  { 0%,100%{box-shadow:0 0 10px #00ff8840,0 0 20px #00ff8820}
                          50%{box-shadow:0 0 28px #00ff8880,0 0 50px #00ff8840} }
@keyframes typewriter   { from{width:0} to{width:100%} }
@keyframes blink        { 0%,100%{border-color:transparent} 50%{border-color:#00f5ff} }
@keyframes glitch       {
  0%,100%{clip-path:inset(0 0 100% 0);transform:translateX(0)}
  10%{clip-path:inset(20% 0 60% 0);transform:translateX(-4px)}
  20%{clip-path:inset(50% 0 30% 0);transform:translateX(4px)}
  30%{clip-path:inset(10% 0 80% 0);transform:translateX(-2px)}
  40%{clip-path:inset(80% 0 5% 0);transform:translateX(3px)}
  50%{clip-path:inset(40% 0 40% 0);transform:translateX(-3px)}
}
@keyframes glitchShift  {
  0%,100%{transform:translateX(0);filter:none}
  10%{transform:translateX(-3px);filter:hue-rotate(90deg)}
  20%{transform:translateX(3px);filter:hue-rotate(-90deg)}
  30%{transform:translateX(-1px);filter:none}
}
@keyframes matrixRain   { 0%{opacity:0;transform:translateY(-100%)} 10%{opacity:1} 90%{opacity:0.8} 100%{opacity:0;transform:translateY(800%)} }
@keyframes waveform     { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
@keyframes orbit        { from{transform:rotate(0deg) translateX(24px) rotate(0deg)} to{transform:rotate(360deg) translateX(24px) rotate(-360deg)} }
@keyframes expand       { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
@keyframes jitter       { 0%,100%{transform:translate(0,0)} 25%{transform:translate(1px,-1px)} 50%{transform:translate(-1px,0)} 75%{transform:translate(0,1px)} }
@keyframes hologram     { 0%,100%{opacity:1;transform:skewX(0deg)} 96%{opacity:1} 97%{opacity:0.6;transform:skewX(-1.5deg)} 98%{opacity:1;transform:skewX(0deg)} 99%{opacity:0.8} }
@keyframes rgbShift     { 0%{text-shadow:2px 0 #ff2d78,-2px 0 #00f5ff,0 0 #00ff88} 33%{text-shadow:-2px 0 #ff2d78,2px 0 #00f5ff,0 0 #00ff88} 66%{text-shadow:2px 0 #00f5ff,-2px 0 #00ff88,0 0 #ff2d78} 100%{text-shadow:2px 0 #ff2d78,-2px 0 #00f5ff,0 0 #00ff88} }
@keyframes floatUp      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes borderFlow   { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes radarSweep   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes dashDraw     { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
@keyframes bounce       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes numberFlip   { 0%{transform:rotateX(-90deg);opacity:0} 100%{transform:rotateX(0deg);opacity:1} }

/* Scrollbar styling */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.4); }

/* Selection */
::selection { background: rgba(0,245,255,0.2); color: #fff; }

/* Focus ring override */
:focus-visible { outline: 1px solid rgba(0,245,255,0.5); outline-offset: 2px; }
`;

let _injected = false;
export function injectKeyframes() {
    if (_injected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    _injected = true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOOKS — Advanced state management
// ═══════════════════════════════════════════════════════════════════════════

export function useAnimatedValue(target, duration = 900, easing = 'easeOutQuart') {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const fromRef = useRef(target);
    const easings = {
        easeOutQuart: p => 1 - Math.pow(1 - p, 4),
        easeOutElastic: p => p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
        easeOutBounce: p => { const n1 = 7.5625, d1 = 2.75; if (p < 1/d1) return n1*p*p; else if (p < 2/d1) return n1*(p -= 1.5/d1)*p+0.75; else if (p < 2.5/d1) return n1*(p -= 2.25/d1)*p+0.9375; return n1*(p -= 2.625/d1)*p+0.984375; },
        linear: p => p,
    };
    const ease = easings[easing] || easings.easeOutQuart;
    useEffect(() => {
        fromRef.current = display;
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const p = Math.min((ts - startRef.current) / duration, 1);
            setDisplay(Math.round(fromRef.current + (target - fromRef.current) * ease(p)));
            if (p < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);
    return display;
}

export function useCopyToClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async (text) => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), timeout); } catch {}
    }, [timeout]);
    return [copied, copy];
}

export function useHover() {
    const [hovered, setHovered] = useState(false);
    return [hovered, { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }];
}

export function useTypewriter(text, speed = 40, started = true) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!started) return;
        setDisplayed('');
        setDone(false);
        let i = 0;
        const id = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(id); setDone(true); }
        }, speed);
        return () => clearInterval(id);
    }, [text, speed, started]);
    return [displayed, done];
}

export function useInterval(callback, delay) {
    const savedCallback = useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        if (delay === null) return;
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

export function useCountdown(initial, onComplete) {
    const [count, setCount] = useState(initial);
    const [running, setRunning] = useState(false);
    useInterval(() => {
        if (!running) return;
        setCount(c => { if (c <= 1) { setRunning(false); onComplete?.(); return 0; } return c - 1; });
    }, 1000);
    return { count, running, start: () => { setCount(initial); setRunning(true); }, stop: () => setRunning(false), reset: () => { setRunning(false); setCount(initial); } };
}

export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => { ref.current = value; });
    return ref.current;
}
