import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
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

// ═══════════════════════════════════════════════════════════════════════════
//  DECORATIVE PRIMITIVES — Enhanced
// ═══════════════════════════════════════════════════════════════════════════

export const CornerBrackets = ({ color = THEME.plasma, size = 14, thickness = 1.5, animated = false, glowing = false }) => {
    const s = { position: 'absolute', width: size, height: size, pointerEvents: 'none' };
    const line = { background: color, boxShadow: glowing ? `0 0 8px ${color}, 0 0 16px ${color}60` : `0 0 4px ${color}80` };
    const anim = animated ? { animation: 'plasmaGlow 2s ease-in-out infinite' } : {};
    const corners = [
        { top: 0, left: 0, h: { top:0,left:0,width:size,height:thickness }, v: { top:0,left:0,width:thickness,height:size } },
        { top: 0, right: 0, h: { top:0,right:0,width:size,height:thickness }, v: { top:0,right:0,width:thickness,height:size } },
        { bottom: 0, left: 0, h: { bottom:0,left:0,width:size,height:thickness }, v: { bottom:0,left:0,width:thickness,height:size } },
        { bottom: 0, right: 0, h: { bottom:0,right:0,width:size,height:thickness }, v: { bottom:0,right:0,width:thickness,height:size } },
    ];
    return (
        <>
            {corners.map((c, i) => (
                <div key={i} style={{ ...s, top: c.top, left: c.left, right: c.right, bottom: c.bottom, ...anim }}>
                    <div style={{ ...line, position:'absolute', ...c.h }} />
                    <div style={{ ...line, position:'absolute', ...c.v }} />
                </div>
            ))}
        </>
    );
};

export const ScanlineOverlay = ({ opacity = 0.025 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden',
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,${opacity}) 2px, rgba(0,245,255,${opacity}) 4px)`,
    }}>
        <div style={{
            position: 'absolute', left: 0, right: 0, height: '18%',
            background: `linear-gradient(transparent, rgba(0,245,255,0.05) 50%, transparent)`,
            animation: 'scanline 8s linear infinite'
        }} />
    </div>
);

export const HexPattern = ({ color = THEME.plasma, opacity = 0.03, scale = 1 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${56*scale}' height='${100*scale}'%3E%3Cpath d='M${28*scale} ${66*scale}L0 ${50*scale}V${17*scale}L${28*scale} 0l${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3Cpath d='M${28*scale} ${100*scale}L0 ${84*scale}V${51*scale}l${28*scale}-${17*scale} ${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: `${56*scale}px ${100*scale}px`
    }} />
);

export const GridPattern = ({ color = THEME.plasma, opacity = 0.04, size = 40 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px), linear-gradient(90deg, ${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`
    }} />
);

export const GlowOrb = ({ color, x = '80%', y = '-20%', size = 300, opacity = 0.06 }) => (
    <div style={{
        position: 'absolute', left: x, top: y, width: size, height: size,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity, filter: 'blur(40px)', transform: 'translate(-50%, -50%)',
        animation: 'breathe 4s ease-in-out infinite'
    }} />
);

export const NoiseTexture = ({ opacity = 0.025 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity,
        mixBlendMode: 'overlay'
    }} />
);

export const CircuitLines = ({ color = THEME.plasma, opacity = 0.06 }) => (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="circuit-glow">
                <feGaussianBlur stdDeviation="1" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        {[
            "M 0 30 L 60 30 L 80 50 L 200 50", "M 100 0 L 100 40 L 120 60 L 120 100",
            "M 60 100% L 60 80 L 90 50", "M 80% 0 L 80% 60 L 70% 60 L 70% 100%",
        ].map((d, i) => (
            <path key={i} d={d} stroke={color} strokeOpacity={opacity} strokeWidth="1" fill="none"
                  filter="url(#circuit-glow)"
                  style={{ animation: `dashDraw 3s ease ${i*0.5}s both`, strokeDasharray: 300, strokeDashoffset: 300 }}
            />
        ))}
        {[[60,30],[80,50],[100,60],[80*0.01*100,60]].map((p, i) => (
            <circle key={i} cx={`${p[0]}%`} cy={p[1]} r="2" fill={color} opacity={opacity * 2}
                    style={{ animation: `ping 2s ${i*0.6}s ease-out infinite` }} />
        ))}
    </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
//  CHIP BADGE & TREND CHIP
// ═══════════════════════════════════════════════════════════════════════════
export const ChipBadge = ({ label, color = THEME.plasma, micro = false, animated = false, dot = false }) => (
    <span style={{
        fontSize: micro ? 8 : 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: micro ? '0.5px' : '1.2px',
        padding: micro ? '1px 6px' : '2px 9px', borderRadius: 2,
        background: `${color}12`, color, border: `1px solid ${color}28`,
        fontFamily: THEME.fontDisplay, whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        animation: animated ? 'plasmaGlow 2s ease-in-out infinite' : 'none',
        boxShadow: animated ? `0 0 8px ${color}30` : 'none',
    }}>
    {dot && <span style={{ width: micro ? 4 : 5, height: micro ? 4 : 5, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}`, animation: 'pulse 2s infinite', display: 'inline-block' }} />}
        {label}
  </span>
);

export const TrendChip = ({ value, label, size = 'default' }) => {
    const color = value > 0 ? THEME.aurora : value < 0 ? THEME.danger : THEME.textMuted;
    const sm = size === 'small';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: sm ? 9 : 10, fontWeight: 700, color, fontFamily: THEME.fontMono,
            background: `${color}10`, padding: sm ? '1px 5px' : '2px 7px', borderRadius: 2,
            border: `1px solid ${color}20`
        }}>
      {value > 0 ? <ArrowUpRight size={sm ? 9 : 11} /> : value < 0 ? <ArrowDownRight size={sm ? 9 : 11} /> : null}
            {value !== 0 && `${value > 0 ? '+' : ''}${value}%`}
            {label && <span style={{ color: THEME.textDim, fontWeight: 400 }}> {label}</span>}
    </span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  1. GLASS CARD — v3 Neural Panel
// ═══════════════════════════════════════════════════════════════════════════
export const GlassCard = ({
                              children, title, subtitle, rightNode, style, loading, collapsible, onRefresh,
                              refreshing, accentColor, variant = 'default', showScanlines = false,
                              showHex = false, showGrid = false, corners = true, tag, glitch = false,
                              draggable = false, onClose, maximizable = false
                          }) => {
    injectKeyframes();
    const [collapsed, setCollapsed] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [hovered, hoverProps] = useHover();
    const [isDragging, setIsDragging] = useState(false);
    const [glitching, setGlitching] = useState(false);
    const accent = accentColor || THEME.plasma;

    useEffect(() => {
        if (!glitch) return;
        const id = setInterval(() => {
            if (Math.random() < 0.05) {
                setGlitching(true);
                setTimeout(() => setGlitching(false), 200);
            }
        }, 3000);
        return () => clearInterval(id);
    }, [glitch]);

    const variants = {
        default:  { bg: THEME.glass, border: THEME.border },
        elevated: { bg: 'rgba(8, 18, 44, 0.94)', border: THEME.borderHot },
        ghost:    { bg: 'rgba(4, 9, 28, 0.35)', border: 'rgba(0,245,255,0.04)' },
        solid:    { bg: THEME.elevated, border: THEME.border },
        aurora:   { bg: 'rgba(0, 255, 136, 0.04)', border: 'rgba(0,255,136,0.12)' },
        danger:   { bg: 'rgba(255, 45, 120, 0.05)', border: 'rgba(255,45,120,0.15)' },
        neon:     { bg: 'rgba(123, 47, 255, 0.06)', border: 'rgba(123,47,255,0.18)' },
    };
    const v = variants[variant] || variants.default;

    return (
        <div {...hoverProps} style={{
            background: v.bg, backdropFilter: 'blur(24px) saturate(200%)',
            borderRadius: 4, border: `1px solid ${hovered ? THEME.borderHot : v.border}`,
            boxShadow: hovered
                ? `0 0 0 1px ${accent}18, 0 24px 64px rgba(0,0,0,0.7), 0 0 40px ${accent}10`
                : `0 8px 48px rgba(0,0,0,0.55), 0 1px 0 rgba(0,245,255,0.07) inset`,
            display: 'flex', flexDirection: 'column',
            position: maximized ? 'fixed' : 'relative',
            inset: maximized ? 0 : undefined,
            zIndex: maximized ? 1000 : undefined,
            overflow: 'hidden',
            animation: glitching ? 'glitchShift 0.2s ease' : 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            ...style
        }}>
            {showScanlines && <ScanlineOverlay />}
            {showHex && <HexPattern color={accent} opacity={0.04} />}
            {showGrid && <GridPattern color={accent} opacity={0.03} />}
            {corners && <CornerBrackets color={accent} animated={hovered} glowing={variant === 'elevated'} />}
            <GlowOrb color={accent} opacity={0.05} />
            <NoiseTexture opacity={0.015} />

            {/* Animated top accent bar */}
            <div style={{
                height: 2, width: '100%',
                background: `linear-gradient(90deg, transparent 0%, ${accent} 35%, ${THEME.secondary} 65%, ${THEME.pulse} 85%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: hovered ? 'borderFlow 2s linear infinite' : 'none',
                opacity: hovered ? 1 : 0.45, transition: 'opacity 0.3s'
            }} />

            {/* Header */}
            {(title || rightNode || onClose || maximizable) && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '13px 18px', borderBottom: `1px solid ${THEME.border}`,
                    position: 'relative', zIndex: 2,
                    cursor: draggable ? 'grab' : 'default',
                    background: 'rgba(0,0,0,0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {collapsible && (
                            <button onClick={() => setCollapsed(!collapsed)} style={{
                                background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 0,
                                display: 'flex', transition: 'transform 0.25s, color 0.2s',
                                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                            }}><ChevronDown size={13} /></button>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{
                                    fontSize: 10, fontWeight: 700, color: hovered ? THEME.textSub : THEME.textMuted,
                                    fontFamily: THEME.fontDisplay, textTransform: 'uppercase',
                                    letterSpacing: '2.5px', margin: 0, transition: 'color 0.3s'
                                }}>{title}</h3>
                                {tag && <ChipBadge label={tag} color={accent} micro />}
                            </div>
                            {subtitle && <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono }}>{subtitle}</div>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {onRefresh && <NanoButton onClick={onRefresh} icon={RefreshCw} spinning={refreshing} color={THEME.textMuted} tooltip="Refresh" />}
                        {maximizable && <NanoButton onClick={() => setMaximized(!maximized)} icon={maximized ? Minimize2 : Maximize2} color={THEME.textMuted} tooltip={maximized ? 'Minimize' : 'Maximize'} />}
                        {onClose && <NanoButton onClick={onClose} icon={X} color={THEME.textMuted} tooltip="Close" />}
                        {rightNode}
                    </div>
                </div>
            )}

            {!collapsed && (
                <div style={{
                    flex: 1, minHeight: 0, position: 'relative', zIndex: 1,
                    padding: 20, opacity: loading ? 0.35 : 1, transition: 'opacity 0.3s'
                }}>
                    {loading && <LoadingOverlay />}
                    {children}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. METRIC CARD v3 — with particle effect
// ═══════════════════════════════════════════════════════════════════════════
export const MetricCard = ({
                               icon: Icon, title, value, unit, subtitle, color = THEME.plasma,
                               onClick, active, sparkData, trend, cacheBadge, badge, size = 'default',
                               delta, loading, comparison, target, pulseOnChange = true
                           }) => {
    injectKeyframes();
    const [hovered, hoverProps] = useHover();
    const [pulsing, setPulsing] = useState(false);
    const prevValue = usePrevious(value);
    const isCompact = size === 'compact';

    useEffect(() => {
        if (pulseOnChange && prevValue !== undefined && prevValue !== value) {
            setPulsing(true);
            setTimeout(() => setPulsing(false), 600);
        }
    }, [value, prevValue, pulseOnChange]);

    const progressToTarget = target ? Math.min((parseFloat(value) / target) * 100, 100) : null;

    return (
        <div {...hoverProps} onClick={onClick} style={{
            background: active
                ? `linear-gradient(145deg, ${color}20 0%, ${color}08 100%)`
                : `linear-gradient(145deg, rgba(7,15,36,0.75) 0%, rgba(2,6,20,0.95) 100%)`,
            borderRadius: 4, border: `1px solid ${active || hovered ? color + '55' : THEME.border}`,
            padding: isCompact ? 14 : 20, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: isCompact ? 8 : 12,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered && onClick ? 'translateY(-3px)' : active ? 'translateY(-2px)' : 'none',
            boxShadow: active
                ? `0 14px 34px -8px ${color}28, 0 0 0 1px ${color}22`
                : hovered && onClick ? `0 10px 28px rgba(0,0,0,0.5), 0 0 0 1px ${color}18` : 'none',
            animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards`,
        }}>
            {/* Animated corner accent */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                background: `radial-gradient(circle at top right, ${color}15 0%, transparent 60%)`,
                transition: 'opacity 0.3s', opacity: hovered ? 1 : 0.5
            }} />
            {/* Bottom glow line */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: active || hovered ? `linear-gradient(90deg, transparent, ${color}60, transparent)` : 'none',
                transition: 'all 0.3s'
            }} />

            {/* Pulse ring on value change */}
            {pulsing && (
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 4,
                    border: `2px solid ${color}`,
                    animation: 'ping 0.6s cubic-bezier(0, 0, 0.2, 1) forwards',
                    pointerEvents: 'none'
                }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: isCompact ? 36 : 44, height: isCompact ? 36 : 44,
                    borderRadius: 8, background: `${color}10`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}25`,
                    boxShadow: active || hovered ? `0 0 20px ${color}35, inset 0 0 10px ${color}12` : 'none',
                    transition: 'box-shadow 0.3s', flexShrink: 0
                }}>
                    <Icon size={isCompact ? 17 : 21} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {cacheBadge && <ChipBadge label={cacheBadge} color={cacheBadge === 'HIT' ? THEME.aurora : THEME.solar} micro dot />}
                    {badge && <ChipBadge label={badge} color={color} micro />}
                    {active && <ChipBadge label="ACTIVE" color={color} animated />}
                </div>
            </div>

            {sparkData && sparkData.length > 0 && (
                <div style={{ width: '100%', height: 40, marginBottom: -4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                            <defs>
                                <linearGradient id={`spark-${title?.replace(/\s/g,'_')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
                                  fill={`url(#spark-${title?.replace(/\s/g,'_')})`}
                                  dot={false} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div>
                <div style={{
                    fontSize: 9, color: THEME.textMuted, fontWeight: 700, fontFamily: THEME.fontDisplay,
                    textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5
                }}>{title}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    {loading ? (
                        <div style={{ width: 80, height: 28, borderRadius: 3, background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.5s infinite', backgroundSize: '400%' }} />
                    ) : (
                        <>
              <span style={{
                  fontSize: isCompact ? 24 : 30, fontWeight: 800,
                  color: THEME.textMain, fontFamily: THEME.fontMono,
                  letterSpacing: '-1.5px', lineHeight: 1,
                  animation: 'countUp 0.6s ease backwards',
                  textShadow: active ? `0 0 24px ${color}70` : 'none',
                  transition: 'text-shadow 0.3s'
              }}>{value}</span>
                            {unit && <span style={{ fontSize: 12, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{unit}</span>}
                        </>
                    )}
                    {trend !== undefined && trend !== null && (
                        <TrendChip value={trend} size={isCompact ? 'small' : 'default'} />
                    )}
                </div>

                {progressToTarget && (
                    <div style={{ marginTop: 8 }}>
                        <NeonProgressBar value={progressToTarget} max={100} color={color} height={3} showPercent />
                    </div>
                )}

                {comparison && (
                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 5, fontFamily: THEME.fontMono }}>
                        {comparison}
                    </div>
                )}
                {subtitle && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{subtitle}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. RESOURCE GAUGE — Arc reactor v2
// ═══════════════════════════════════════════════════════════════════════════
export const ResourceGauge = ({ label, value, color, thresholds, size = 160, subtitle, showHistory = false, historyData }) => {
    injectKeyframes();
    const numValue = Number(value) || 0;
    const resolvedColor = thresholds
        ? numValue >= (thresholds.critical || 90) ? THEME.danger
            : numValue >= (thresholds.warning || 70) ? THEME.warning : color
        : color;

    const data = [{ value: numValue, fill: resolvedColor }];

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', height: size, width: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Multiple rings */}
                <div style={{
                    position: 'absolute', inset: 12, borderRadius: '50%',
                    border: `1px solid ${resolvedColor}10`,
                    animation: 'breathe 3s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', inset: 20, borderRadius: '50%',
                    border: `1px dashed ${resolvedColor}08`,
                    animation: 'spin 20s linear infinite'
                }} />

                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="60%" outerRadius="88%" barSize={10} data={data} startAngle={210} endAngle={-30}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} clockWise dataKey="value" cornerRadius={5}>
                            {data.map((_, i) => <Cell key={i} fill={resolvedColor} />)}
                        </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>

                <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{
                        fontSize: numValue >= 100 ? 18 : 24, fontWeight: 800, color: resolvedColor,
                        fontFamily: THEME.fontMono, lineHeight: 1,
                        textShadow: `0 0 20px ${resolvedColor}90`,
                        animation: 'countUp 0.8s ease backwards'
                    }}>{numValue}<span style={{ fontSize: 12 }}>%</span></div>
                    <div style={{ fontSize: 9, color: THEME.textMuted, textTransform: 'uppercase', marginTop: 3, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>{label}</div>
                    {subtitle && <div style={{ fontSize: 8, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono }}>{subtitle}</div>}
                </div>
            </div>

            {showHistory && historyData && historyData.length > 0 && (
                <div style={{ width: '100%', height: 30 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData}>
                            <Line type="monotone" dataKey="value" stroke={resolvedColor} strokeWidth={1} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  4. NEON PROGRESS BAR — v2
// ═══════════════════════════════════════════════════════════════════════════
export const NeonProgressBar = ({
                                    value, max, color = THEME.plasma, label, showPercent = false, height = 6,
                                    thresholds, animate = true, showMilestones = false, milestones = []
                                }) => {
    const percent = Math.min((value / (max || 1)) * 100, 100);
    const resolvedColor = thresholds
        ? percent >= (thresholds.critical || 90) ? THEME.danger
            : percent >= (thresholds.warning || 70) ? THEME.warning : color
        : color;

    return (
        <div>
            {(label || showPercent) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    {label && <span style={{ letterSpacing: '0.5px' }}>{label}</span>}
                    {showPercent && <span style={{ color: resolvedColor, fontWeight: 700 }}>{percent.toFixed(1)}%</span>}
                </div>
            )}
            <div style={{
                width: '100%', height, background: 'rgba(255,255,255,0.04)',
                borderRadius: 3, overflow: 'visible', position: 'relative',
                border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3)'
            }}>
                {/* Track glow */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 3,
                    boxShadow: `inset 0 0 ${height*2}px rgba(0,245,255,0.04)`
                }} />
                <div style={{
                    width: `${percent}%`, height: '100%',
                    background: `linear-gradient(90deg, ${resolvedColor}50, ${resolvedColor} 70%, rgba(255,255,255,0.9) 100%)`,
                    borderRadius: 3, boxShadow: `0 0 10px ${resolvedColor}90, 0 0 3px ${resolvedColor}`,
                    transition: animate ? 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    position: 'relative', overflow: 'hidden', animation: 'expand 1.2s cubic-bezier(0.4,0,0.2,1) backwards',
                }}>
                    {/* Animated shimmer on bar */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                        backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite'
                    }} />
                    {/* Leading edge */}
                    <div style={{
                        position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)',
                        width: height * 2.5, height: height * 2.5, borderRadius: '50%',
                        background: 'white', boxShadow: `0 0 14px ${resolvedColor}, 0 0 28px ${resolvedColor}80`
                    }} />
                </div>
                {/* Milestones */}
                {showMilestones && milestones.map((m, i) => (
                    <div key={i} style={{
                        position: 'absolute', left: `${m}%`, top: -4, bottom: -4, width: 1,
                        background: THEME.textDim, opacity: 0.4
                    }} />
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  5. LIVE STATUS BADGE — Enhanced neural link
// ═══════════════════════════════════════════════════════════════════════════
export const LiveStatusBadge = ({ connected = true, label, count, showLatency, latency, quality, uptime }) => {
    injectKeyframes();
    const color = connected ? THEME.aurora : THEME.danger;
    const qualityColors = { excellent: THEME.aurora, good: THEME.plasma, fair: THEME.solar, poor: THEME.danger };
    const qColor = quality ? qualityColors[quality] || color : color;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${qColor}07`, padding: '5px 12px', borderRadius: 2,
            border: `1px solid ${qColor}22`,
            boxShadow: connected ? `0 0 14px ${qColor}14, inset 0 0 8px ${qColor}05` : 'none'
        }}>
            <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: qColor, boxShadow: `0 0 6px ${qColor}` }} />
                {connected && (
                    <div style={{
                        position: 'absolute', inset: -4, borderRadius: '50%',
                        background: qColor, opacity: 0.3,
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }} />
                )}
            </div>
            <span style={{ color: qColor, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', fontFamily: THEME.fontDisplay }}>
        {label || (connected ? 'LIVE' : 'OFFLINE')}
      </span>
            {count !== undefined && (
                <span style={{ fontSize: 10, background: `${qColor}14`, color: qColor, padding: '1px 7px', borderRadius: 2, fontFamily: THEME.fontMono, fontWeight: 700, border: `1px solid ${qColor}20` }}>
          {count}
        </span>
            )}
            {showLatency && latency !== undefined && (
                <span style={{ fontSize: 9, color: latency > 100 ? THEME.warning : THEME.textMuted, fontFamily: THEME.fontMono }}>
          {latency}ms
        </span>
            )}
            {uptime && <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{uptime}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  6. TOOLTIP — v2 Holographic
// ═══════════════════════════════════════════════════════════════════════════
export const CustomTooltip = ({ active, payload, label, formatter, unit }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            backgroundColor: 'rgba(1, 5, 16, 0.98)', border: `1px solid ${THEME.borderHot}`,
            borderRadius: 4, padding: '12px 16px',
            boxShadow: `0 4px 32px rgba(0,0,0,0.9), 0 0 24px ${THEME.plasma}12`,
            backdropFilter: 'blur(24px)', maxWidth: 260, position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${THEME.plasma}, transparent)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${THEME.neon}50, transparent)` }} />
            {label && <p style={{ color: THEME.textMuted, fontSize: 9, marginBottom: 10, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
                    <span style={{ fontSize: 10, color: THEME.textSub, fontFamily: THEME.fontMono }}>{entry.name}:</span>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 800, fontFamily: THEME.fontMono, marginLeft: 'auto' }}>
            {formatter ? formatter(entry.value, entry.name) : (typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value)}
                        {unit && <span style={{ fontSize: 10, color: THEME.textMuted }}> {unit}</span>}
          </span>
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  7. ALERT SYSTEM — v2 with toast queue
// ═══════════════════════════════════════════════════════════════════════════
const SEVERITY_CONFIG = {
    critical: { color: THEME.danger,   icon: XCircle,       bg: 'rgba(255,45,120,0.07)',   label: 'CRITICAL' },
    warning:  { color: THEME.warning,  icon: AlertTriangle,  bg: 'rgba(255,170,0,0.07)',    label: 'WARNING'  },
    info:     { color: THEME.info,     icon: Info,           bg: 'rgba(77,159,255,0.07)',   label: 'INFO'     },
    success:  { color: THEME.aurora,   icon: CheckCircle,    bg: 'rgba(0,255,136,0.07)',    label: 'SUCCESS'  },
};

export const SeverityBadge = ({ severity }) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
    return (
        <span style={{
            fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '2px 9px', borderRadius: 2,
            background: `${config.color}15`, color: config.color,
            border: `1px solid ${config.color}30`, fontFamily: THEME.fontDisplay
        }}>{severity}</span>
    );
};

export const AlertBanner = ({ alert, onAcknowledge, onDismiss, compact = false }) => {
    injectKeyframes();
    const [acknowledged, setAcknowledged] = useState(false);
    if (!alert) return null;
    const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const Icon = config.icon;
    const handleAck = () => {
        setAcknowledged(true);
        onAcknowledge?.(alert.id);
    };

    if (compact) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: config.bg, borderRadius: 3, border: `1px solid ${config.color}25`,
                animation: 'alertSlide 0.3s ease backwards'
            }}>
                <Icon size={13} color={config.color} />
                <span style={{ color: THEME.textSub, flex: 1, fontSize: 12, fontFamily: THEME.fontBody }}>{alert.message}</span>
                <span style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{new Date(alert.ts).toLocaleTimeString()}</span>
                {onAcknowledge && !acknowledged && (
                    <button onClick={handleAck} style={{ background: `${config.color}12`, border: `1px solid ${config.color}30`, color: config.color, padding: '2px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>ACK</button>
                )}
                {acknowledged && <CheckCircle size={12} color={THEME.aurora} />}
            </div>
        );
    }

    return (
        <div style={{
            background: config.bg, borderRadius: 4, padding: 16, border: `1px solid ${config.color}22`,
            animation: 'alertSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
            display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', overflow: 'hidden',
            opacity: acknowledged ? 0.6 : 1, transition: 'opacity 0.4s'
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: config.color, boxShadow: `0 0 10px ${config.color}80` }} />
            <div style={{ width: 38, height: 38, borderRadius: 4, flexShrink: 0, background: `${config.color}12`, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${config.color}25` }}>
                <Icon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <SeverityBadge severity={alert.severity} />
                    {alert.category && <span style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontMono, textTransform: 'uppercase', letterSpacing: '1px' }}>{alert.category}</span>}
                    <span style={{ fontSize: 9, color: THEME.textDim, marginLeft: 'auto', fontFamily: THEME.fontMono }}>{new Date(alert.ts).toLocaleTimeString()}</span>
                </div>
                <p style={{ fontSize: 13, color: THEME.textMain, margin: 0, lineHeight: 1.6, fontFamily: THEME.fontBody }}>{alert.message}</p>
                {alert.data && Object.keys(alert.data).length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {Object.entries(alert.data).map(([k, v]) => (
                            <span key={k}>{k}: <span style={{ color: config.color, fontWeight: 700 }}>{String(v)}</span></span>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {onAcknowledge && !acknowledged && (
                    <button onClick={handleAck} style={{ background: `${config.color}12`, border: `1px solid ${config.color}30`, color: config.color, padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>ACK</button>
                )}
                {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: `1px solid ${THEME.border}`, color: THEME.textMuted, cursor: 'pointer', padding: '6px 8px', borderRadius: 3, display: 'flex', alignItems: 'center' }}><X size={12} /></button>}
            </div>
        </div>
    );
};

// Toast notification stack
export const AlertToast = ({ alerts, onDismiss }) => {
    injectKeyframes();
    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380
        }}>
            {alerts.slice(0, 4).map((alert, i) => {
                const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                const Icon = config.icon;
                return (
                    <div key={alert.id || i} style={{
                        background: 'rgba(2,6,20,0.97)', borderRadius: 4, padding: '12px 16px',
                        border: `1px solid ${config.color}30`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 20px ${config.color}14`,
                        animation: 'alertSlide 0.4s cubic-bezier(0.16,1,0.3,1) backwards',
                        backdropFilter: 'blur(20px)',
                        display: 'flex', alignItems: 'center', gap: 10
                    }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, borderRadius: '4px 0 0 4px', background: config.color, boxShadow: `0 0 8px ${config.color}` }} />
                        <div style={{ marginLeft: 6 }}><Icon size={14} color={config.color} /></div>
                        <div style={{ flex: 1 }}>
                            <SeverityBadge severity={alert.severity} />
                            <p style={{ fontSize: 11, color: THEME.textSub, margin: '4px 0 0', fontFamily: THEME.fontBody, lineHeight: 1.5 }}>{alert.message}</p>
                        </div>
                        {onDismiss && (
                            <button onClick={() => onDismiss(alert.id)} style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 2 }}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  8. NANO BUTTON — v2 with variants
// ═══════════════════════════════════════════════════════════════════════════
export const NanoButton = ({
                               icon: Icon, onClick, tooltip, color = THEME.textMuted, active, spinning,
                               label, outlined, variant = 'default', disabled, size = 'default'
                           }) => {
    const [hovered, hoverProps] = useHover();
    injectKeyframes();
    const sm = size === 'small';
    const lg = size === 'large';

    const variants_styles = {
        default: {
            bg: active || hovered ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: active || hovered ? THEME.borderHot : THEME.border,
            color: active || hovered ? THEME.plasma : color,
        },
        danger: {
            bg: hovered ? 'rgba(255,45,120,0.12)' : 'rgba(255,45,120,0.04)',
            border: hovered ? 'rgba(255,45,120,0.4)' : 'rgba(255,45,120,0.2)',
            color: THEME.danger,
        },
        success: {
            bg: hovered ? 'rgba(0,255,136,0.12)' : 'rgba(0,255,136,0.04)',
            border: hovered ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.2)',
            color: THEME.aurora,
        },
        ghost: {
            bg: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'transparent',
            color: hovered ? THEME.textMain : THEME.textMuted,
        },
    };
    const vs = variants_styles[variant] || variants_styles.default;

    return (
        <button
            {...hoverProps}
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            style={{
                background: disabled ? 'rgba(255,255,255,0.02)' : vs.bg,
                border: `1px solid ${disabled ? THEME.border : vs.border}`,
                color: disabled ? THEME.textDim : vs.color,
                borderRadius: 3,
                padding: sm ? '3px 6px' : lg ? '8px 16px' : (label ? '5px 12px' : '5px 8px'),
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 5,
                transition: 'all 0.15s',
                fontSize: sm ? 9 : lg ? 12 : 10,
                fontFamily: THEME.fontDisplay, fontWeight: 700, letterSpacing: '0.5px',
                opacity: disabled ? 0.4 : 1,
                boxShadow: (active || hovered) && !disabled ? `0 0 12px ${vs.color}20` : 'none',
            }}
        >
            {Icon && <Icon size={sm ? 10 : lg ? 15 : 12} style={{ animation: spinning ? 'spin 1s linear infinite' : 'none', flexShrink: 0 }} />}
            {label && <span>{label}</span>}
        </button>
    );
};
export const MiniButton = NanoButton;

// ═══════════════════════════════════════════════════════════════════════════
//  9. DATA TABLE — v2 Cyberpunk grid with multi-select
// ═══════════════════════════════════════════════════════════════════════════
export const DataTable = ({
                              columns, data, sortable = true, searchable = false, pageSize = 20,
                              emptyText = 'NO DATA', onRowClick, rowKey = 'id', compact = false,
                              accentColor = THEME.plasma, selectable = false, onSelectionChange,
                              rowActions, stickyHeader = false, striped = false
                          }) => {
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [showActions, setShowActions] = useState(null);

    const filtered = useMemo(() => {
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(row => columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q)));
    }, [data, search, columns]);

    const sorted = useMemo(() => {
        if (!sort.key) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sort.key], vb = b[sort.key];
            const cmp = typeof va === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''));
            return sort.dir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sort]);

    const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(sorted.length / pageSize);

    const toggleSelect = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            onSelectionChange?.(Array.from(next));
            return next;
        });
    };
    const toggleAll = () => {
        const keys = paged.map(r => r[rowKey]);
        const allSelected = keys.every(k => selected.has(k));
        setSelected(prev => {
            const next = new Set(prev);
            if (allSelected) keys.forEach(k => next.delete(k)); else keys.forEach(k => next.add(k));
            onSelectionChange?.(Array.from(next));
            return next;
        });
    };

    return (
        <div>
            {searchable && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'rgba(0,245,255,0.02)', borderRadius: 3, padding: '7px 12px', border: `1px solid ${THEME.border}` }}>
                    <Search size={11} color={THEME.textMuted} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                           placeholder="Search records..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: 11, outline: 'none', flex: 1, fontFamily: THEME.fontMono }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>}
                    <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{sorted.length} results</span>
                </div>
            )}

            {selectable && selected.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '6px 12px', background: `${accentColor}08`, borderRadius: 3, border: `1px solid ${accentColor}20` }}>
                    <span style={{ fontSize: 10, color: accentColor, fontFamily: THEME.fontMono }}>{selected.size} selected</span>
                    <button onClick={() => setSelected(new Set())} style={{ fontSize: 9, color: THEME.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: THEME.fontMono }}>Clear</button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 2, background: stickyHeader ? THEME.abyss : 'none' }}>
                    <tr style={{ borderBottom: `1px solid ${accentColor}18` }}>
                        {selectable && (
                            <th style={{ width: 36, padding: compact ? '7px 8px' : '10px 12px', textAlign: 'center' }}>
                                <input type="checkbox" checked={paged.every(r => selected.has(r[rowKey]))} onChange={toggleAll}
                                       style={{ accentColor, cursor: 'pointer' }} />
                            </th>
                        )}
                        {columns.map(col => (
                            <th key={col.key}
                                onClick={() => { if (sortable && col.sortable !== false) setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' })); }}
                                style={{
                                    textAlign: col.align || 'left', padding: compact ? '7px 10px' : '10px 14px',
                                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
                                    color: sort.key === col.key ? accentColor : THEME.textMuted,
                                    borderBottom: `1px solid ${THEME.border}`,
                                    cursor: sortable && col.sortable !== false ? 'pointer' : 'default',
                                    whiteSpace: 'nowrap', userSelect: 'none', fontFamily: THEME.fontDisplay,
                                    background: sort.key === col.key ? `${accentColor}05` : 'none',
                                    transition: 'color 0.2s'
                                }}>
                                {col.label}
                                {sort.key === col.key && (
                                    <span style={{ marginLeft: 5, color: accentColor }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </th>
                        ))}
                        {rowActions && <th style={{ width: 40 }} />}
                    </tr>
                    </thead>
                    <tbody>
                    {paged.length === 0 ? (
                        <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: 32, color: THEME.textDim, fontSize: 11, fontFamily: THEME.fontMono }}>{emptyText}</td></tr>
                    ) : paged.map((row, ri) => (
                        <tr key={row[rowKey] ?? ri}
                            onClick={() => onRowClick?.(row)}
                            onMouseEnter={() => setHoveredRow(ri)}
                            onMouseLeave={() => { setHoveredRow(null); setShowActions(null); }}
                            style={{
                                cursor: onRowClick ? 'pointer' : 'default',
                                background: selected.has(row[rowKey]) ? `${accentColor}08` : hoveredRow === ri ? 'rgba(0,245,255,0.02)' : striped && ri % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                                transition: 'background 0.1s',
                                borderLeft: selected.has(row[rowKey]) ? `2px solid ${accentColor}60` : hoveredRow === ri ? `2px solid ${accentColor}30` : '2px solid transparent'
                            }}
                        >
                            {selectable && (
                                <td style={{ padding: compact ? '7px 8px' : '10px 12px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={selected.has(row[rowKey])} onChange={(e) => { e.stopPropagation(); toggleSelect(row[rowKey]); }}
                                           style={{ accentColor, cursor: 'pointer' }} />
                                </td>
                            )}
                            {columns.map(col => (
                                <td key={col.key} style={{
                                    padding: compact ? '7px 10px' : '10px 14px',
                                    fontSize: compact ? 11 : 12, color: THEME.textSub,
                                    borderBottom: `1px solid rgba(0,245,255,0.025)`,
                                    textAlign: col.align || 'left',
                                    fontFamily: col.mono ? THEME.fontMono : THEME.fontBody,
                                    maxWidth: col.maxWidth || 'none',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                </td>
                            ))}
                            {rowActions && hoveredRow === ri && (
                                <td style={{ padding: '0 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                                        {rowActions(row).map((action, ai) => (
                                            <NanoButton key={ai} icon={action.icon} onClick={(e) => { e.stopPropagation(); action.onClick(row); }} tooltip={action.label} size="small" variant={action.variant} />
                                        ))}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    <span>{sorted.length} rows · page {page + 1}/{totalPages}</span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: 'none', border: `1px solid ${THEME.border}`, color: THEME.textDim, width: 26, height: 26, borderRadius: 3, cursor: page === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 0 ? 0.4 : 1 }}>
                            <ChevronLeft size={11} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i)} style={{ background: page === i ? `${accentColor}20` : 'rgba(255,255,255,0.02)', border: `1px solid ${page === i ? accentColor + '50' : THEME.border}`, color: page === i ? accentColor : THEME.textDim, width: 26, height: 26, borderRadius: 3, cursor: 'pointer', fontSize: 10, fontFamily: THEME.fontMono }}>{i + 1}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ background: 'none', border: `1px solid ${THEME.border}`, color: THEME.textDim, width: 26, height: 26, borderRadius: 3, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages - 1 ? 0.4 : 1 }}>
                            <ChevronRight size={11} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  10. EMPTY STATE — Signal lost v2
// ═══════════════════════════════════════════════════════════════════════════
export const EmptyState = ({ icon: Icon, title, text, action, onAction, color = THEME.plasma }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
            <div style={{ width: 76, height: 76, borderRadius: 4, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.border}`, color: THEME.textDim, position: 'relative', overflow: 'hidden' }}>
                <CornerBrackets color={THEME.textDim} size={8} />
                <Icon size={30} style={{ animation: 'floatUp 3s ease-in-out infinite' }} />
            </div>
        </div>
        {title && <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '2px', textTransform: 'uppercase' }}>{title}</div>}
        <div style={{ fontSize: 11, textAlign: 'center', maxWidth: 240, color: THEME.textDim, fontFamily: THEME.fontMono, lineHeight: 1.8 }}>{text}</div>
        {action && <NanoButton label={action} onClick={onAction} color={color} outlined size="large" />}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  11. SKELETON LOADER — Neural loading state v2
// ═══════════════════════════════════════════════════════════════════════════
export const SkeletonLoader = ({ rows = 3, height = 16, gap = 10, style: customStyle, variant = 'line' }) => {
    injectKeyframes();
    if (variant === 'card') {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, ...customStyle }}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} style={{ height: 120, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.06) 50%, transparent 100%)', backgroundSize: '400% 100%', animation: 'shimmer 1.8s ease infinite', animationDelay: `${i*0.1}s` }} />
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap, ...customStyle }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={{
                    height, borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(0,245,255,0.02) 25%, rgba(0,245,255,0.07) 50%, rgba(0,245,255,0.02) 75%)',
                    backgroundSize: '400% 100%', animation: `shimmer 2s ease ${i*0.05}s infinite`,
                    width: i === rows - 1 ? '55%' : '100%',
                    boxShadow: 'inset 0 1px 0 rgba(0,245,255,0.04)'
                }} />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  12. LOADING OVERLAY — Enhanced plasma spinner
// ═══════════════════════════════════════════════════════════════════════════
export const LoadingOverlay = ({ message }) => {
    injectKeyframes();
    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,2,12,0.8)', zIndex: 20, borderRadius: 4, backdropFilter: 'blur(6px)', gap: 12 }}>
            <div style={{ position: 'relative', width: 40, height: 40 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${THEME.border}`, borderTop: `2px solid ${THEME.plasma}`, animation: 'spin 0.8s linear infinite', boxShadow: `0 0 14px ${THEME.plasma}40` }} />
                <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.secondary}`, animation: 'spinReverse 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.plasma, animation: 'pulse 1s infinite', boxShadow: `0 0 8px ${THEME.plasma}` }} />
                </div>
            </div>
            {message && <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, letterSpacing: '1px' }}>{message}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  13. STATUS DOT & COPY BUTTON
// ═══════════════════════════════════════════════════════════════════════════
export const StatusDot = ({ status, size = 8, pulse: doPulse = false }) => {
    injectKeyframes();
    const color = { active: THEME.aurora, ok: THEME.aurora, idle: THEME.solar, error: THEME.danger, critical: THEME.danger, warning: THEME.warning }[status] || THEME.textMuted;
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80`, animation: doPulse ? 'pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }} />
    );
};

export const CopyButton = ({ text, size = 'default', label }) => {
    const [copied, copy] = useCopyToClipboard();
    const sm = size === 'small';
    return (
        <button onClick={() => copy(text)} style={{
            background: copied ? `${THEME.aurora}10` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? THEME.aurora + '40' : THEME.border}`,
            color: copied ? THEME.aurora : THEME.textMuted,
            padding: sm ? '3px 8px' : '5px 12px', borderRadius: 3, cursor: 'pointer',
            fontSize: sm ? 9 : 10, display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s', fontFamily: THEME.fontMono, fontWeight: 700
        }}>
            {copied ? <Check size={sm ? 9 : 11} /> : <Copy size={sm ? 9 : 11} />}
            {label || (copied ? 'COPIED' : 'COPY')}
        </button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  14. TERMINAL — v2 with full typewriter + multi-line + history
// ═══════════════════════════════════════════════════════════════════════════
export const Terminal = ({ lines = [], title = 'neural://shell', onExecute, readOnly = false, maxHeight = 300 }) => {
    injectKeyframes();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState(lines);
    const [histIdx, setHistIdx] = useState(-1);
    const [cmdHistory, setCmdHistory] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const execute = () => {
        if (!input.trim()) return;
        const newHistory = [...history, { type: 'input', content: input }];
        const result = onExecute?.(input);
        if (result) newHistory.push({ type: 'output', content: result });
        setHistory(newHistory);
        setCmdHistory(prev => [input, ...prev]);
        setInput('');
        setHistIdx(-1);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') execute();
        if (e.key === 'ArrowUp') {
            const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
            setHistIdx(idx);
            setInput(cmdHistory[idx] || '');
        }
        if (e.key === 'ArrowDown') {
            const idx = Math.max(histIdx - 1, -1);
            setHistIdx(idx);
            setInput(idx === -1 ? '' : cmdHistory[idx] || '');
        }
    };

    const typeColors = {
        input:   THEME.textMain,
        output:  '#7dd3fc',
        error:   THEME.danger,
        success: THEME.aurora,
        info:    THEME.textMuted,
        system:  THEME.solar,
    };

    return (
        <div style={{ background: '#000d1a', borderRadius: 4, border: `1px solid ${THEME.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <ScanlineOverlay opacity={0.015} />
            {/* Header */}
            <div style={{ background: '#000509', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.border}`, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef444490' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b90' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e90' }} />
                    <span style={{ marginLeft: 8, fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <CopyButton text={history.map(l => l.content).join('\n')} size="small" />
                </div>
            </div>
            {/* Output */}
            <div style={{ padding: '12px 16px', fontFamily: THEME.fontMono, fontSize: 12, lineHeight: 1.85, overflowY: 'auto', maxHeight, position: 'relative', zIndex: 1 }}>
                {history.map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, animation: `fadeUp 0.2s ease ${i < 3 ? i * 0.05 : 0}s backwards` }}>
                        {line.type === 'input' && <span style={{ color: THEME.aurora, flexShrink: 0, userSelect: 'none' }}>{'▶'}</span>}
                        {line.type === 'error' && <span style={{ color: THEME.danger, flexShrink: 0, userSelect: 'none' }}>{'✕'}</span>}
                        {line.type === 'success' && <span style={{ color: THEME.aurora, flexShrink: 0, userSelect: 'none' }}>{'✓'}</span>}
                        {line.type === 'system' && <span style={{ color: THEME.solar, flexShrink: 0, userSelect: 'none' }}>{'⬡'}</span>}
                        {!['input','error','success','system'].includes(line.type) && <span style={{ color: THEME.textDim, flexShrink: 0, userSelect: 'none' }}>{'·'}</span>}
                        <span style={{ color: typeColors[line.type] || THEME.textSub, wordBreak: 'break-all' }}>{line.content}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            {/* Input */}
            {!readOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: `1px solid ${THEME.border}`, background: '#000812', position: 'relative', zIndex: 2 }}>
                    <span style={{ color: THEME.aurora, fontFamily: THEME.fontMono, fontSize: 13, userSelect: 'none' }}>$</span>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Enter command..."
                        style={{ flex: 1, background: 'none', border: 'none', color: THEME.textMain, fontFamily: THEME.fontMono, fontSize: 12, outline: 'none' }}
                    />
                    <NanoButton icon={Play} onClick={execute} color={THEME.aurora} size="small" tooltip="Execute (Enter)" />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  15. FILTER PILLS — v2
// ═══════════════════════════════════════════════════════════════════════════
export const FilterPills = ({ options, active, onChange, multi = false, color = THEME.plasma }) => (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(opt => {
            const key = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const icon = typeof opt === 'object' ? opt.icon : null;
            const isActive = multi ? active?.includes(key) : active === key;
            return (
                <button key={key} onClick={() => onChange(key)} style={{
                    background: isActive ? `${color}14` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? color + '45' : THEME.border}`,
                    color: isActive ? color : THEME.textMuted,
                    padding: '4px 12px', borderRadius: 2, cursor: 'pointer',
                    fontSize: 9, fontWeight: 700, transition: 'all 0.2s',
                    fontFamily: THEME.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase',
                    boxShadow: isActive ? `0 0 12px ${color}18` : 'none',
                    display: 'flex', alignItems: 'center', gap: 5
                }}>
                    {icon && React.createElement(icon, { size: 10 })}
                    {label}
                </button>
            );
        })}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  16. TIMELINE — Event stream visualizer
// ═══════════════════════════════════════════════════════════════════════════
export const Timeline = ({ events = [], maxHeight = 400 }) => {
    injectKeyframes();
    return (
        <div style={{ overflowY: 'auto', maxHeight, paddingRight: 4 }}>
            {events.map((event, i) => {
                const config = SEVERITY_CONFIG[event.type] || SEVERITY_CONFIG.info;
                const Icon = config.icon;
                return (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 0, animation: `fadeUp 0.3s ease ${i * 0.04}s backwards` }}>
                        {/* Line + dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 4, background: `${config.color}12`, border: `1px solid ${config.color}28`, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                                <Icon size={12} />
                            </div>
                            {i < events.length - 1 && (
                                <div style={{ width: 1, flex: 1, minHeight: 20, background: `linear-gradient(${config.color}30, transparent)`, margin: '4px 0' }} />
                            )}
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, paddingBottom: 16, paddingTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain, fontFamily: THEME.fontBody }}>{event.title}</span>
                                <SeverityBadge severity={event.type} />
                                <span style={{ fontSize: 9, color: THEME.textDim, marginLeft: 'auto', fontFamily: THEME.fontMono }}>
                  {new Date(event.ts).toLocaleTimeString()}
                </span>
                            </div>
                            {event.description && <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0, lineHeight: 1.6, fontFamily: THEME.fontBody }}>{event.description}</p>}
                            {event.meta && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                                    {Object.entries(event.meta).map(([k, v]) => (
                                        <span key={k} style={{ fontSize: 9, fontFamily: THEME.fontMono, color: THEME.textDim }}>
                      {k}: <span style={{ color: config.color }}>{String(v)}</span>
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  17. RADAR CHART — Multi-axis performance viz
// ═══════════════════════════════════════════════════════════════════════════
export const RadarMetric = ({ data = [], size = 200, color = THEME.plasma, label }) => {
    injectKeyframes();
    const n = data.length;
    if (n < 3) return null;
    const cx = size / 2, cy = size / 2;
    const r = (size / 2) * 0.72;
    const angleStep = (2 * Math.PI) / n;
    const toXY = (i, val, radius) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
            x: cx + radius * (val / 100) * Math.cos(angle),
            y: cy + radius * (val / 100) * Math.sin(angle)
        };
    };
    const gridLevels = [25, 50, 75, 100];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg width={size} height={size}>
                <defs>
                    <radialGradient id="radar-fill">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.08} />
                    </radialGradient>
                </defs>
                {/* Grid rings */}
                {gridLevels.map(level => {
                    const pts = data.map((_, i) => { const p = toXY(i, level, r); return `${p.x},${p.y}`; });
                    return (
                        <polygon key={level} points={pts.join(' ')} fill="none" stroke={`${color}12`} strokeWidth={1} />
                    );
                })}
                {/* Spoke lines */}
                {data.map((_, i) => {
                    const end = toXY(i, 100, r);
                    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={`${color}15`} strokeWidth={1} />;
                })}
                {/* Data polygon */}
                <polygon
                    points={data.map((d, i) => { const p = toXY(i, d.value, r); return `${p.x},${p.y}`; }).join(' ')}
                    fill="url(#radar-fill)" stroke={color} strokeWidth={1.5}
                    style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
                {/* Data points */}
                {data.map((d, i) => {
                    const p = toXY(i, d.value, r);
                    return (
                        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={1}
                                style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                    );
                })}
                {/* Labels */}
                {data.map((d, i) => {
                    const p = toXY(i, 120, r);
                    return (
                        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                              style={{ fontSize: 8, fill: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {d.label}
                        </text>
                    );
                })}
            </svg>
            {label && <div style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</div>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  18. TYPEWRITER TEXT — Animated command output
// ═══════════════════════════════════════════════════════════════════════════
export const TypewriterText = ({ text, speed = 30, color = THEME.plasma, mono = true, onDone, prefix = '' }) => {
    injectKeyframes();
    const [displayed, done] = useTypewriter(text, speed, true);
    useEffect(() => { if (done) onDone?.(); }, [done]);
    return (
        <span style={{ fontFamily: mono ? THEME.fontMono : THEME.fontBody, color, fontSize: 'inherit' }}>
      {prefix && <span style={{ color: THEME.aurora }}>{prefix} </span>}
            {displayed}
            {!done && <span style={{ borderRight: `2px solid ${color}`, animation: 'blink 0.8s step-end infinite', marginLeft: 1 }} />}
    </span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  19. HEATMAP CALENDAR — Activity grid
// ═══════════════════════════════════════════════════════════════════════════
export const HeatmapGrid = ({ data = [], weeks = 26, color = THEME.plasma, label }) => {
    injectKeyframes();
    const maxVal = Math.max(...data.map(d => d.value || 0), 1);
    const cells = Array.from({ length: weeks * 7 }, (_, i) => data[i] || { value: 0 });
    const days = ['S','M','T','W','T','F','S'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>}
            <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16 }}>
                    {days.map((d, i) => (
                        <div key={i} style={{ height: 11, fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono, display: 'flex', alignItems: 'center' }}>{d}</div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 11px)`, gridTemplateRows: 'repeat(7, 11px)', gap: 2 }}>
                    {cells.map((cell, i) => {
                        const intensity = cell.value / maxVal;
                        return (
                            <div key={i} title={`${cell.date || ''}: ${cell.value}`} style={{
                                width: 11, height: 11, borderRadius: 2,
                                background: intensity > 0 ? color : 'rgba(255,255,255,0.04)',
                                opacity: intensity > 0 ? Math.max(0.15, intensity) : 1,
                                border: `1px solid rgba(255,255,255,0.04)`,
                                cursor: 'default', transition: 'opacity 0.2s',
                                boxShadow: intensity > 0.7 ? `0 0 ${intensity * 6}px ${color}60` : 'none'
                            }} />
                        );
                    })}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono }}>Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: v > 0 ? color : 'rgba(255,255,255,0.04)', opacity: v > 0 ? Math.max(0.15, v) : 1 }} />
                ))}
                <span style={{ fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono }}>More</span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  20. COMMAND PALETTE — Full-featured
// ═══════════════════════════════════════════════════════════════════════════
export const CommandPalette = ({ commands = [], onClose, placeholder = 'Search commands...' }) => {
    injectKeyframes();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const groups = useMemo(() => {
        const filtered = commands.filter(c =>
            !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase())
        );
        const grouped = {};
        filtered.forEach(c => {
            const g = c.group || 'General';
            if (!grouped[g]) grouped[g] = [];
            grouped[g].push(c);
        });
        return grouped;
    }, [commands, query]);

    const flat = Object.values(groups).flat();

    const handleKey = (e) => {
        if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, flat.length - 1));
        if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
        if (e.key === 'Enter' && flat[selected]) { flat[selected].action?.(); onClose?.(); }
        if (e.key === 'Escape') onClose?.();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '12vh', background: 'rgba(0,0,20,0.85)', backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.15s ease'
        }} onClick={onClose}>
            <div style={{
                width: '100%', maxWidth: 580, background: 'rgba(4,9,28,0.98)',
                borderRadius: 8, border: `1px solid ${THEME.borderHot}`,
                boxShadow: `0 0 0 1px ${THEME.plasma}20, 0 32px 80px rgba(0,0,0,0.9)`,
                overflow: 'hidden', animation: 'scaleUp 0.2s cubic-bezier(0.16,1,0.3,1)'
            }} onClick={e => e.stopPropagation()}>
                <CornerBrackets color={THEME.plasma} size={12} glowing />
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${THEME.border}` }}>
                    <Search size={14} color={THEME.textMuted} />
                    <input
                        ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        onKeyDown={handleKey} placeholder={placeholder}
                        style={{ flex: 1, background: 'none', border: 'none', color: THEME.textMain, fontSize: 14, outline: 'none', fontFamily: THEME.fontBody }}
                    />
                    {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} /></button>}
                    <kbd style={{ fontSize: 9, color: THEME.textDim, background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.border}`, padding: '2px 7px', borderRadius: 3, fontFamily: THEME.fontMono }}>ESC</kbd>
                </div>
                {/* Results */}
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group}>
                            <div style={{ padding: '8px 18px 4px', fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{group}</div>
                            {items.map((cmd, ci) => {
                                const gi = flat.indexOf(cmd);
                                const isSelected = gi === selected;
                                const Icon = cmd.icon;
                                return (
                                    <div key={ci} onClick={() => { cmd.action?.(); onClose?.(); }}
                                         style={{
                                             display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
                                             background: isSelected ? `${THEME.plasma}08` : 'transparent',
                                             borderLeft: `2px solid ${isSelected ? THEME.plasma : 'transparent'}`,
                                             cursor: 'pointer', transition: 'all 0.1s'
                                         }}>
                                        {Icon && (
                                            <div style={{ width: 30, height: 30, borderRadius: 4, background: `${THEME.plasma}10`, color: THEME.plasma, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.plasma}20`, flexShrink: 0 }}>
                                                <Icon size={13} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, color: isSelected ? THEME.textMain : THEME.textSub, fontFamily: THEME.fontBody, fontWeight: 500 }}>{cmd.label}</div>
                                            {cmd.description && <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{cmd.description}</div>}
                                        </div>
                                        {cmd.shortcut && (
                                            <kbd style={{ fontSize: 9, color: THEME.textDim, background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.border}`, padding: '2px 7px', borderRadius: 3, fontFamily: THEME.fontMono }}>{cmd.shortcut}</kbd>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {flat.length === 0 && (
                        <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: THEME.textDim, fontFamily: THEME.fontMono }}>No commands found</div>
                    )}
                </div>
                <div style={{ padding: '8px 18px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 16, fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${THEME.border}` }}>↑↓</kbd> navigate</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${THEME.border}` }}>↵</kbd> select</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${THEME.border}` }}>esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  21. NETWORK GRAPH — Node relation visualizer
// ═══════════════════════════════════════════════════════════════════════════
export const NetworkGraph = ({ nodes = [], edges = [], width = 400, height = 300 }) => {
    injectKeyframes();
    const svgRef = useRef(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    const statusColors = { active: THEME.aurora, warning: THEME.solar, error: THEME.danger, idle: THEME.textMuted };

    return (
        <svg ref={svgRef} width="100%" height={height} style={{ overflow: 'visible' }}>
            <defs>
                <filter id="node-glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={THEME.textDim} />
                </marker>
            </defs>
            {/* Edges */}
            {edges.map((edge, i) => {
                const from = nodes.find(n => n.id === edge.from);
                const to = nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                const color = edge.active ? THEME.plasma : THEME.textDim;
                return (
                    <g key={i}>
                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                              stroke={color} strokeOpacity={0.3} strokeWidth={1}
                              markerEnd="url(#arrow)"
                              style={{ animation: edge.active ? 'pulse 2s ease-in-out infinite' : 'none' }}
                        />
                        {edge.label && (
                            <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                                  textAnchor="middle" style={{ fontSize: 8, fill: THEME.textDim, fontFamily: THEME.fontMono }}>
                                {edge.label}
                            </text>
                        )}
                    </g>
                );
            })}
            {/* Nodes */}
            {nodes.map((node) => {
                const color = statusColors[node.status] || THEME.plasma;
                const isHovered = hoveredNode === node.id;
                return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                       onMouseEnter={() => setHoveredNode(node.id)}
                       onMouseLeave={() => setHoveredNode(null)}
                       style={{ cursor: 'pointer' }}>
                        {isHovered && <circle r={24} fill={color} opacity={0.08} />}
                        <circle r={16} fill="rgba(4,9,28,0.95)" stroke={color} strokeWidth={isHovered ? 2 : 1}
                                filter="url(#node-glow)"
                                style={{ transition: 'all 0.2s' }}
                        />
                        {isHovered && (
                            <circle r={22} fill="none" stroke={color} strokeWidth={1} opacity={0.3}
                                    style={{ animation: 'ping 1.5s ease-out infinite' }} />
                        )}
                        <text textAnchor="middle" dominantBaseline="middle"
                              style={{ fontSize: 9, fill: color, fontFamily: THEME.fontDisplay, fontWeight: 700, letterSpacing: '0.5px' }}>
                            {node.label || node.id}
                        </text>
                        <text y={26} textAnchor="middle"
                              style={{ fontSize: 8, fill: THEME.textDim, fontFamily: THEME.fontMono }}>
                            {node.subtitle || ''}
                        </text>
                        {/* Status dot */}
                        <circle cx={12} cy={-12} r={4} fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
                    </g>
                );
            })}
        </svg>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  22. WAVEFORM DISPLAY — Audio/signal visualizer
// ═══════════════════════════════════════════════════════════════════════════
export const WaveformBar = ({ bars = 32, color = THEME.plasma, active = true, heights }) => {
    injectKeyframes();
    const [animatedHeights, setAnimatedHeights] = useState(heights || Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2));

    useInterval(() => {
        if (active && !heights) {
            setAnimatedHeights(Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2));
        }
    }, 120);

    const h = heights || animatedHeights;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
            {Array.from({ length: bars }).map((_, i) => (
                <div key={i} style={{
                    flex: 1, borderRadius: 2,
                    background: `linear-gradient(to top, ${color}80, ${color})`,
                    boxShadow: active ? `0 0 4px ${color}60` : 'none',
                    height: `${(h[i] || 0.3) * 100}%`,
                    transition: 'height 0.1s ease',
                    minWidth: 2
                }} />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  23. STAT COMPARISON CARD — Before/After delta
// ═══════════════════════════════════════════════════════════════════════════
export const StatCompare = ({ label, before, after, unit, color = THEME.plasma, inverse = false }) => {
    injectKeyframes();
    const delta = after - before;
    const pct = before !== 0 ? ((delta / before) * 100).toFixed(1) : 0;
    const improved = inverse ? delta < 0 : delta > 0;
    const trendColor = improved ? THEME.aurora : delta === 0 ? THEME.textMuted : THEME.danger;

    return (
        <div style={{
            background: 'rgba(4,9,28,0.7)', borderRadius: 4, padding: 16,
            border: `1px solid ${THEME.border}`, position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div>
                    <div style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono, marginBottom: 3 }}>BEFORE</div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{before.toLocaleString()}{unit && <span style={{ fontSize: 11 }}> {unit}</span>}</span>
                </div>
                <div style={{ fontSize: 16, color: THEME.textDim, marginBottom: 6 }}>→</div>
                <div>
                    <div style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono, marginBottom: 3 }}>AFTER</div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, fontFamily: THEME.fontMono, textShadow: `0 0 20px ${color}60` }}>{after.toLocaleString()}{unit && <span style={{ fontSize: 11, color: THEME.textMuted }}> {unit}</span>}</span>
                </div>
                <div style={{ marginBottom: 4, marginLeft: 'auto' }}>
                    <TrendChip value={parseFloat(pct)} />
                </div>
            </div>
            <div style={{ marginTop: 10 }}>
                <NeonProgressBar value={Math.min(after, Math.max(before, after))} max={Math.max(before, after) * 1.1} color={trendColor} height={3} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  24. PILL INPUT — Tag/token input
// ═══════════════════════════════════════════════════════════════════════════
export const PillInput = ({ value = [], onChange, placeholder = 'Add tag...', color = THEME.plasma, maxTags = 10 }) => {
    const [input, setInput] = useState('');
    const [focused, setFocused] = useState(false);

    const add = () => {
        const v = input.trim();
        if (!v || value.includes(v) || value.length >= maxTags) return;
        onChange([...value, v]);
        setInput('');
    };

    const remove = (tag) => onChange(value.filter(t => t !== tag));

    return (
        <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px',
            background: 'rgba(0,0,0,0.2)', borderRadius: 4,
            border: `1px solid ${focused ? THEME.borderHot : THEME.border}`,
            minHeight: 40, alignItems: 'center', cursor: 'text',
            transition: 'border-color 0.2s'
        }} onClick={() => document.getElementById('pill-input')?.focus()}>
            {value.map((tag, i) => (
                <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10, padding: '3px 9px', borderRadius: 2,
                    background: `${color}14`, color, border: `1px solid ${color}28`,
                    fontFamily: THEME.fontMono, animation: 'scaleIn 0.2s ease backwards'
                }}>
          {tag}
                    <button onClick={() => remove(tag)} style={{ background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}>
            <X size={10} />
          </button>
        </span>
            ))}
            <input
                id="pill-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]); }}
                placeholder={value.length === 0 ? placeholder : ''}
                style={{ background: 'none', border: 'none', color: THEME.textMain, fontSize: 11, outline: 'none', fontFamily: THEME.fontMono, minWidth: 100, flex: 1 }}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  25. SLIDER — Neon range input
// ═══════════════════════════════════════════════════════════════════════════
export const NeonSlider = ({ value, min = 0, max = 100, step = 1, onChange, label, color = THEME.plasma, showValue = true }) => {
    injectKeyframes();
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div>
            {(label || showValue) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, fontFamily: THEME.fontMono }}>
                    {label && <span style={{ color: THEME.textMuted }}>{label}</span>}
                    {showValue && <span style={{ color, fontWeight: 700 }}>{value}</span>}
                </div>
            )}
            <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                {/* Track */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}80`, transition: 'width 0.1s ease', borderRadius: 2 }} />
                </div>
                <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    style={{
                        position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: 20, zIndex: 2
                    }}
                />
                {/* Thumb */}
                <div style={{
                    position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
                    width: 14, height: 14, borderRadius: '50%', background: color,
                    boxShadow: `0 0 10px ${color}, 0 0 20px ${color}60`,
                    pointerEvents: 'none', transition: 'left 0.1s ease',
                    border: '2px solid rgba(0,0,0,0.5)'
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                <span>{min}</span><span>{max}</span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  26. TOGGLE SWITCH — Neon style
// ═══════════════════════════════════════════════════════════════════════════
export const NeonToggle = ({ value, onChange, label, color = THEME.plasma, size = 'default', disabled = false }) => {
    injectKeyframes();
    const sm = size === 'small';
    const w = sm ? 32 : 42, h = sm ? 18 : 24, th = sm ? 12 : 18;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.4 : 1 }}>
            <div
                onClick={() => !disabled && onChange(!value)}
                style={{
                    width: w, height: h, borderRadius: h, position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
                    background: value ? `${color}30` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${value ? color + '60' : THEME.border}`,
                    boxShadow: value ? `0 0 12px ${color}30, inset 0 0 8px ${color}10` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0
                }}>
                <div style={{
                    position: 'absolute', top: (h - th) / 2, width: th, height: th, borderRadius: '50%',
                    background: value ? color : THEME.textDim,
                    left: value ? w - th - (h - th) / 2 : (h - th) / 2,
                    boxShadow: value ? `0 0 8px ${color}, 0 0 16px ${color}60` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)'
                }} />
            </div>
            {label && <span style={{ fontSize: sm ? 10 : 11, color: THEME.textSub, fontFamily: THEME.fontBody }}>{label}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  27. SELECT DROPDOWN — Neural styled
// ═══════════════════════════════════════════════════════════════════════════
export const NeuralSelect = ({ value, options, onChange, label, color = THEME.plasma, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [hovered, hoverProps] = useHover();
    const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
    const selectedLabel = selected ? (typeof selected === 'string' ? selected : selected.label) : 'Select...';

    return (
        <div style={{ position: 'relative' }}>
            {label && <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>}
            <div
                {...hoverProps}
                onClick={() => !disabled && setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
                    background: open ? `${color}08` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${open || hovered ? color + '40' : THEME.border}`,
                    transition: 'all 0.2s', opacity: disabled ? 0.5 : 1
                }}>
                <span style={{ fontSize: 12, color: THEME.textMain, fontFamily: THEME.fontBody }}>{selectedLabel}</span>
                <ChevronDown size={13} color={THEME.textMuted} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </div>
            {open && (
                <div style={{
                    position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 100,
                    background: 'rgba(2,6,20,0.98)', borderRadius: 3,
                    border: `1px solid ${THEME.borderHot}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 20px ${color}10`,
                    backdropFilter: 'blur(20px)', overflow: 'hidden',
                    animation: 'fadeDown 0.15s ease backwards'
                }}>
                    {options.map((opt, i) => {
                        const key = typeof opt === 'string' ? opt : opt.value;
                        const lbl = typeof opt === 'string' ? opt : opt.label;
                        const isActive = key === value;
                        return (
                            <div key={i} onClick={() => { onChange(key); setOpen(false); }} style={{
                                padding: '9px 14px', cursor: 'pointer', fontSize: 12,
                                color: isActive ? color : THEME.textSub,
                                background: isActive ? `${color}08` : 'transparent',
                                borderLeft: `2px solid ${isActive ? color : 'transparent'}`,
                                fontFamily: THEME.fontBody, transition: 'all 0.1s',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}>
                                {isActive && <Check size={11} />}
                                {lbl}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  28. PULSE RING — Radial indicator
// ═══════════════════════════════════════════════════════════════════════════
export const PulseRing = ({ value, max, color = THEME.plasma, size = 80, label }) => {
    injectKeyframes();
    const pct = Math.min((value / (max || 1)) * 100, 100);
    const r = (size / 2) - 8;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${color})` }}
                />
            </svg>
            <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: size < 60 ? 11 : 14, fontWeight: 800, color, fontFamily: THEME.fontMono, lineHeight: 1 }}>{value}</div>
                {label && <div style={{ fontSize: 7, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 1, letterSpacing: '0.5px' }}>{label}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  29. HEAT CELL + CONNECTION POOL BAR + SETTING ROW (carried over + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const HeatCell = ({ value, max, color = THEME.plasma, size = 24, label }) => {
    const intensity = Math.min(value / (max || 1), 1);
    const [hovered, hoverProps] = useHover();
    const rgbMap = { [THEME.plasma]: '0,245,255', [THEME.danger]: '255,45,120', [THEME.aurora]: '0,255,136', [THEME.solar]: '255,170,0' };
    const rgb = rgbMap[color] || '0,245,255';
    return (
        <div {...hoverProps} title={label || String(value)} style={{
            width: size, height: size, borderRadius: 2,
            background: intensity > 0 ? `rgba(${rgb}, ${intensity * 0.85})` : 'rgba(255,255,255,0.025)',
            border: `1px solid rgba(255,255,255,${intensity * 0.1 + 0.02})`,
            cursor: 'default', transition: 'all 0.25s',
            transform: hovered ? 'scale(1.3)' : 'none',
            boxShadow: intensity > 0.5 ? `0 0 ${intensity * 14}px rgba(${rgb},0.7)` : 'none',
            zIndex: hovered ? 10 : 1, position: 'relative'
        }} />
    );
};

export const ConnectionPoolBar = ({ total, idle, active, waiting, max }) => {
    const segments = [
        { label: 'Active', value: active || (total - idle), color: THEME.plasma },
        { label: 'Idle', value: idle, color: THEME.aurora },
        { label: 'Waiting', value: waiting || 0, color: THEME.warning },
    ];
    const barMax = max || total || 1;
    return (
        <div>
            <div style={{ display: 'flex', height: 18, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, gap: 1 }}>
                {segments.map((seg, i) => seg.value > 0 && (
                    <div key={i} style={{
                        width: `${(seg.value / barMax) * 100}%`,
                        background: `linear-gradient(180deg, ${seg.color}80, ${seg.color}50)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: THEME.fontMono,
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                        position: 'relative', overflow: 'hidden', minWidth: 2
                    }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: `repeating-linear-gradient(90deg, transparent, transparent 5px, ${seg.color}20 5px, ${seg.color}20 6px)` }} />
                        <span style={{ position: 'relative', zIndex: 1 }}>{seg.value > 3 ? seg.value : ''}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 1, background: seg.color, boxShadow: `0 0 6px ${seg.color}70` }} />
                        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
              {seg.label}: <span style={{ color: '#fff', fontWeight: 700 }}>{seg.value}</span>
            </span>
                    </div>
                ))}
                {max && <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 'auto', fontFamily: THEME.fontMono }}>max: {max}</span>}
            </div>
        </div>
    );
};

export const SettingRow = ({ name, value, unit, description, category, context, onChange, type = 'text' }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderBottom: `1px solid ${THEME.border}`,
            background: hovered ? 'rgba(0,245,255,0.015)' : 'transparent',
            transition: 'background 0.15s', animation: 'fadeUp 0.3s ease backwards'
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.plasma, fontWeight: 600 }}>{name}</span>
                    {context && <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 2, color: THEME.textDim, fontFamily: THEME.fontMono }}>{context}</span>}
                </div>
                {description && <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2, fontFamily: THEME.fontBody }}>{description}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {type === 'toggle' ? (
                    <NeonToggle value={!!value} onChange={onChange} size="small" />
                ) : (
                    <>
                        <span style={{ fontSize: 14, fontFamily: THEME.fontMono, color: '#fff', fontWeight: 700 }}>{value}</span>
                        {unit && <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 5, fontFamily: THEME.fontMono }}>{unit}</span>}
                    </>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  30. ROLE & WEBSOCKET STATUS (carried over + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
const ROLE_CONFIG = {
    super_admin: { color: THEME.solar,     icon: ShieldCheck,  label: 'SUPER ADMIN' },
    dba:         { color: THEME.plasma,    icon: Shield,       label: 'DBA' },
    developer:   { color: THEME.neon,      icon: Code,         label: 'DEVELOPER' },
    analyst:     { color: THEME.aurora,    icon: BarChart2,    label: 'ANALYST' },
    viewer:      { color: THEME.textMuted, icon: Eye,          label: 'VIEWER' },
};

export const RoleBadge = ({ role, showIcon = true, size = 'default' }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
    const Icon = config.icon;
    const sm = size === 'small';
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6, background: `${config.color}10`, padding: sm ? '2px 8px' : '5px 12px', borderRadius: 3, border: `1px solid ${config.color}22` }}>
            {showIcon && <Icon size={sm ? 10 : 13} color={config.color} />}
            <span style={{ fontSize: sm ? 9 : 10, fontWeight: 800, color: config.color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: THEME.fontDisplay }}>{config.label}</span>
        </div>
    );
};

export const WebSocketStatus = ({ connected, clientCount, lastMessage, uptime, quality }) => {
    injectKeyframes();
    const color = connected ? THEME.aurora : THEME.danger;
    const qualColors = { high: THEME.aurora, medium: THEME.solar, low: THEME.danger };
    const qColor = quality ? qualColors[quality] || color : color;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${qColor}05`, padding: '6px 14px', borderRadius: 2, border: `1px solid ${qColor}20`, boxShadow: connected ? `0 0 20px ${qColor}08` : 'none' }}>
            {connected ? <Wifi size={12} color={qColor} /> : <WifiOff size={12} color={qColor} />}
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: qColor, boxShadow: `0 0 8px ${qColor}`, animation: connected ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: qColor, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>{connected ? 'WS·CONNECTED' : 'WS·OFFLINE'}</span>
            {clientCount !== undefined && <span style={{ fontSize: 9, fontFamily: THEME.fontMono, color: THEME.textMuted, background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 2 }}>{clientCount}c</span>}
            {uptime && <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{uptime}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  31. NODE LINK (enhanced) + SEQUENCE USAGE + EXTENSION CARD
// ═══════════════════════════════════════════════════════════════════════════
export const NodeLink = ({ from, to, type = 'depends', latency, status = 'active', bidirectional = false }) => {
    const color = { active: THEME.aurora, degraded: THEME.warning, error: THEME.danger, idle: THEME.textMuted }[status] || THEME.aurora;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: THEME.fontMono, fontSize: 11 }}>
            <span style={{ color: THEME.textSub, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '3px 0 0 3px', border: `1px solid ${THEME.border}` }}>{from}</span>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', background: `${color}08`, border: `1px solid ${color}20`, borderLeft: 'none', borderRight: 'none', height: 29, gap: 2 }}>
                {bidirectional && <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `6px solid ${color}60` }} />}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: status === 'active' ? 'pulse 2s infinite' : 'none' }} />
                <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${color}, ${color}50)` }} />
                {latency && <span style={{ fontSize: 8, color, padding: '0 2px' }}>{latency}ms</span>}
                <div style={{ width: 18, height: 1, background: `linear-gradient(90deg, ${color}50, ${color})` }} />
                <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${color}` }} />
            </div>
            <span style={{ color: THEME.textSub, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '0 3px 3px 0', border: `1px solid ${THEME.border}`, borderLeft: 'none' }}>{to}</span>
        </div>
    );
};

export const SequenceUsageBar = ({ name, usagePct, lastValue, maxValue, cycle }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.textSub }}>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {cycle && <ChipBadge label="CYCLE" color={THEME.aurora} micro />}
                <span style={{ fontSize: 11, fontFamily: THEME.fontMono, fontWeight: 700, color: usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.textMuted }}>{usagePct}%</span>
            </div>
        </div>
        <NeonProgressBar value={usagePct} max={100} color={usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.aurora} height={4} />
    </div>
);

export const ExtensionCard = ({ name, version, schema, description, enabled }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{ background: hovered ? 'rgba(10,20,40,0.8)' : 'rgba(4,9,28,0.6)', borderRadius: 3, border: `1px solid ${hovered ? THEME.borderHot : THEME.border}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: 4, background: `${THEME.plasma}08`, color: THEME.plasma, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.plasma}20` }}>
                <Database size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: THEME.fontBody }}>{name}</span>
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 2, color: THEME.textMuted, fontFamily: THEME.fontMono }}>v{version}</span>
                    {enabled !== undefined && <ChipBadge label={enabled ? 'ACTIVE' : 'DISABLED'} color={enabled ? THEME.aurora : THEME.textMuted} micro dot={enabled} />}
                </div>
                {description && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>}
            </div>
            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, flexShrink: 0 }}>{schema}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  32. AI AGENT VIEW — v2 Neural cortex
// ═══════════════════════════════════════════════════════════════════════════
export const AIAgentView = ({ type, data, streaming = false }) => {
    const [copied, copy] = useCopyToClipboard();
    const [activeTab, setActiveTab] = useState('analysis');
    const [typedText, done] = useTypewriter(
        type === 'api' ? (data?.ai_insight || '') : (data?.recommendation || 'Analysis complete.'),
        18, streaming
    );

    if (!data) return <EmptyState icon={TerminalIcon} title="AWAITING INPUT" text="Select an entity to initiate neural analysis sequence." />;

    const severityColor = { missing: THEME.danger, unused: THEME.warning, duplicate: THEME.solar }[type] || THEME.plasma;
    const tabs = ['analysis', 'context', 'actions', 'metrics'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            {/* AI Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(123,47,255,0.05) 100%)',
                border: `1px solid ${THEME.ai}28`, borderRadius: 4, padding: 16, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${THEME.ai}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${THEME.ai}, #5b21b6)`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${THEME.ai}55`, animation: streaming ? 'plasmaGlow 2s ease-in-out infinite' : 'none' }}>
                        <Sparkles size={14} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: THEME.ai, letterSpacing: '1.5px', fontFamily: THEME.fontDisplay }}>NEURAL ANALYSIS ENGINE v3.0</div>
                        <div style={{ fontSize: 8, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 1 }}>
                            {streaming ? <TypewriterText text="Processing..." color={THEME.solar} speed={60} /> : 'confidence: 97.3% · latency: 142ms'}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                        {streaming && <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.aurora, animation: 'ping 1s ease-out infinite' }} />}
                        <SeverityBadge severity={type === 'unused' ? 'warning' : type === 'missing' ? 'critical' : type === 'duplicate' ? 'warning' : 'info'} />
                    </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: THEME.textSub, margin: 0, fontFamily: THEME.fontBody }}>
                    {streaming ? typedText : (type === 'api' ? data.ai_insight : data.recommendation || 'No critical issues detected.')}
                    {streaming && !done && <span style={{ borderRight: `2px solid ${THEME.ai}`, animation: 'blink 0.8s step-end infinite', marginLeft: 1 }} />}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.02)', padding: 3, borderRadius: 4, border: `1px solid ${THEME.border}` }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, background: activeTab === tab ? `${THEME.plasma}14` : 'none',
                        border: activeTab === tab ? `1px solid ${THEME.plasma}30` : '1px solid transparent',
                        color: activeTab === tab ? THEME.plasma : THEME.textMuted,
                        padding: '5px 0', borderRadius: 3, cursor: 'pointer', fontSize: 8,
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                        fontFamily: THEME.fontDisplay, transition: 'all 0.2s'
                    }}>{tab}</button>
                ))}
            </div>

            {/* Terminal */}
            <div style={{ flex: 1, background: '#01060e', borderRadius: 4, border: `1px solid ${THEME.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 160 }}>
                <ScanlineOverlay opacity={0.012} />
                <div style={{ background: '#010509', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {['#ef4444','#f59e0b','#22c55e'].map((c, i) => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}80` }} />
                        ))}
                        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono, marginLeft: 6 }}>neural://analysis.context</span>
                    </div>
                    <CopyButton size="small" text={data.problem_query || data.recommendation || ''} />
                </div>
                <div style={{ padding: 14, fontFamily: THEME.fontMono, fontSize: 11, color: '#7dd3fc', lineHeight: 1.9, flex: 1, overflowY: 'auto' }}>
                    {type === 'missing' && <>
                        <div style={{ color: THEME.textDim }}>{`-- ✦ RECOMMENDED ACTION`}</div>
                        <div style={{ color: THEME.aurora, marginTop: 2 }}>{`CREATE INDEX CONCURRENTLY idx_${data.table}_${data.column}`}</div>
                        <div style={{ color: THEME.aurora }}>{`ON ${data.table} (${data.column});`}</div>
                        <div style={{ color: THEME.textDim, marginTop: 8 }}>{`-- ✦ PROJECTED IMPACT`}</div>
                        <div style={{ color: THEME.plasma }}>{`Est. speedup: ${data.improvement || '~10x'}`}</div>
                    </>}
                    {type === 'unused' && <>
                        <div style={{ color: THEME.textDim }}>{`-- ✦ SAFE TO REMOVE`}</div>
                        <div style={{ color: THEME.danger, marginTop: 2 }}>{`DROP INDEX CONCURRENTLY ${data.indexName};`}</div>
                        <div style={{ color: THEME.textDim, marginTop: 8 }}>{`-- ✦ RESOURCES FREED`}</div>
                        <div style={{ color: THEME.solar }}>{`Disk: ${data.size} · Last scan: never`}</div>
                    </>}
                    {type === 'api' && data.queries?.map((q, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ color: THEME.textDim, fontSize: 10 }}>{`-- [${i+1}] ${q.calls} calls · ${q.duration}ms avg`}</div>
                            <div style={{ color: '#a5b4fc', marginTop: 4 }}>{q.sql}</div>
                        </div>
                    ))}
                    {!['missing','unused','api'].includes(type) && (
                        <span style={{ color: '#a5b4fc' }}>{data.problem_query || '-- No context available'}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  33. QUERY HISTORY ITEM — v2 Chronostream
// ═══════════════════════════════════════════════════════════════════════════
export const QueryHistoryItem = ({ entry, onFavourite, onTag, onReplay, onCopy }) => {
    const [expanded, setExpanded] = useState(false);
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            background: hovered ? 'rgba(7,15,36,0.9)' : 'rgba(4,9,28,0.7)',
            borderRadius: 3, border: `1px solid ${hovered ? THEME.borderHot : THEME.border}`,
            overflow: 'hidden', transition: 'all 0.2s', animation: 'fadeUp 0.3s ease backwards', position: 'relative'
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: entry.success ? THEME.aurora : THEME.danger, opacity: 0.6 }} />
            <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 16px', cursor: 'pointer' }}>
                <span style={{ flex: 1, fontSize: 11, color: THEME.textSub, fontFamily: THEME.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.sql}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {entry.tag && <ChipBadge label={entry.tag} color={THEME.plasma} micro />}
                    <span style={{ fontSize: 10, color: entry.durationMs > 1000 ? THEME.warning : THEME.textMuted, fontFamily: THEME.fontMono, fontWeight: 700 }}>{entry.durationMs}ms</span>
                    <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{entry.rowCount}r</span>
                    <button onClick={(e) => { e.stopPropagation(); onFavourite?.(entry.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: entry.favourite ? THEME.solar : THEME.textDim, transition: 'color 0.2s', display: 'flex' }}>
                        {entry.favourite ? <Star size={12} fill={THEME.solar} /> : <Star size={12} />}
                    </button>
                    <ChevronDown size={11} color={THEME.textDim} style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
                </div>
            </div>
            {expanded && (
                <div style={{ padding: '0 16px 14px 16px', borderTop: `1px solid ${THEME.border}` }}>
                    <pre style={{ fontSize: 11, color: '#93c5fd', fontFamily: THEME.fontMono, background: '#01060e', padding: 12, borderRadius: 3, margin: '10px 0', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap', border: `1px solid ${THEME.border}` }}>{entry.sql}</pre>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {entry.user && <span>user: <span style={{ color: THEME.textSub }}>{entry.user}</span></span>}
                            <span>{new Date(entry.ts).toLocaleString()}</span>
                            {entry.error && <span style={{ color: THEME.danger }}>✕ {entry.error}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                            {onCopy && <NanoButton icon={Copy} onClick={() => onCopy(entry.sql)} tooltip="Copy SQL" size="small" />}
                            {onReplay && <NanoButton icon={RefreshCw} onClick={() => onReplay(entry.sql)} tooltip="Replay" size="small" />}
                            {onTag && <NanoButton icon={Tag} onClick={() => onTag(entry.id)} tooltip="Tag" size="small" />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  34. CACHE STATS RING + BLOAT BADGE (enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const CacheStatsRing = ({ size: cacheSize, maxSize, hitRate }) => {
    const usagePct = maxSize ? (cacheSize / maxSize) * 100 : 0;
    const data = [
        { name: 'Used', value: cacheSize, fill: THEME.plasma },
        { name: 'Free', value: maxSize - cacheSize, fill: 'rgba(255,255,255,0.04)' },
    ];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 100, height: 100, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value" stroke="none">
                            {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.plasma, fontFamily: THEME.fontMono, textShadow: `0 0 10px ${THEME.plasma}80` }}>{usagePct.toFixed(0)}%</span>
                </div>
            </div>
            <div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginBottom: 6, fontFamily: THEME.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase' }}>App Cache</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: THEME.fontMono, lineHeight: 1 }}>
                    {cacheSize}<span style={{ fontSize: 12, color: THEME.textMuted }}>/{maxSize}</span>
                </div>
                {hitRate !== undefined && (
                    <div style={{ fontSize: 11, color: THEME.aurora, marginTop: 6, fontFamily: THEME.fontMono }}>↑ {hitRate}% hit rate</div>
                )}
            </div>
        </div>
    );
};

export const BloatStatusBadge = ({ status, bloatPct }) => {
    const config = { critical: { color: THEME.danger, icon: XCircle }, warning: { color: THEME.warning, icon: AlertTriangle }, ok: { color: THEME.aurora, icon: CheckCircle } }[status] || { color: THEME.textMuted, icon: Info };
    const Icon = config.icon;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${config.color}10`, padding: '3px 10px', borderRadius: 3, border: `1px solid ${config.color}25` }}>
            <Icon size={11} color={config.color} />
            <span style={{ fontSize: 9, fontWeight: 800, color: config.color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: THEME.fontDisplay }}>{status}</span>
            {bloatPct !== undefined && <span style={{ fontSize: 10, fontFamily: THEME.fontMono, color: config.color }}>{bloatPct}%</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  35. BENTO METRIC — v2
// ═══════════════════════════════════════════════════════════════════════════
export const BentoMetric = ({ label, value, unit, icon: Icon, color, trend, delay = 0, chartData, description, onClick }) => {
    injectKeyframes();
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} onClick={onClick} style={{
            background: 'linear-gradient(145deg, rgba(7,15,36,0.82) 0%, rgba(2,6,20,0.97) 100%)',
            borderRadius: 4, padding: 22,
            border: `1px solid ${hovered ? color + '45' : THEME.border}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`,
            position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s, transform 0.3s',
            transform: hovered ? 'translateY(-2px)' : 'none',
            minHeight: 140, cursor: onClick ? 'pointer' : 'default'
        }}>
            <GlowOrb color={color} x="100%" y="0%" size={180} opacity={hovered ? 0.12 : 0.05} />
            <div style={{ position: 'absolute', bottom: -12, right: -12, opacity: hovered ? 0.14 : 0.05, transition: 'opacity 0.3s' }}>
                <Icon size={90} color={color} />
            </div>
            {chartData && chartData.length > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 55, opacity: 0.1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}><Area type="monotone" dataKey="value" stroke={color} fill={color} strokeWidth={1} dot={false} isAnimationActive={false} /></AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: 7, borderRadius: 6, background: `${color}14`, color, border: `1px solid ${color}28` }}>
                    <Icon size={15} />
                </div>
                <span style={{ fontSize: 9, color: THEME.textMuted, fontWeight: 700, fontFamily: THEME.fontDisplay, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: THEME.fontMono, textShadow: hovered ? `0 0 28px ${color}90` : 'none', transition: 'text-shadow 0.3s' }}>{value}</span>
                    {unit && <span style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 3, fontFamily: THEME.fontMono }}>{unit}</span>}
                </div>
                {description && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{description}</div>}
                {trend !== undefined && trend !== null && <div style={{ marginTop: 8 }}><TrendChip value={trend} label="vs last hr" /></div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TERMINAL LINE (kept from v1 + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const TerminalLine = ({ prompt = '$', command, output, color = THEME.plasma, delay = 0, type = 'default' }) => {
    injectKeyframes();
    const prompts = { default: { sym: '$', color: THEME.aurora }, error: { sym: '✕', color: THEME.danger }, success: { sym: '✓', color: THEME.aurora }, system: { sym: '⬡', color: THEME.solar } };
    const p = prompts[type] || prompts.default;
    return (
        <div style={{ fontFamily: THEME.fontMono, fontSize: 12, lineHeight: 1.85, animation: `fadeUp 0.4s ease ${delay}s backwards` }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: p.color, userSelect: 'none', flexShrink: 0 }}>{p.sym}</span>
                <span style={{ color: THEME.textMain }}>{command}</span>
            </div>
            {output && <div style={{ color: THEME.textMuted, marginLeft: 18 }}>{output}</div>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMMAND PALETTE ITEM (kept + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const CommandPaletteItem = ({ icon: Icon, label, description, shortcut, color = THEME.plasma, onClick, active }) => {
    const [hovered, hoverProps] = useHover();
    const isHighlighted = active || hovered;
    return (
        <div {...hoverProps} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderRadius: 3, background: isHighlighted ? `${color}08` : 'transparent',
            border: `1px solid ${isHighlighted ? color + '22' : 'transparent'}`,
            borderLeft: `2px solid ${isHighlighted ? color : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.15s'
        }}>
            {Icon && (
                <div style={{ width: 30, height: 30, borderRadius: 4, background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20`, flexShrink: 0 }}>
                    <Icon size={13} />
                </div>
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: isHighlighted ? THEME.textMain : THEME.textSub, fontFamily: THEME.fontBody, fontWeight: 500 }}>{label}</div>
                {description && <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{description}</div>}
            </div>
            {shortcut && (
                <kbd style={{ fontSize: 9, color: THEME.textDim, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.border}`, padding: '2px 7px', borderRadius: 3, fontFamily: THEME.fontMono }}>{shortcut}</kbd>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  EXPORT MANIFEST
// ═══════════════════════════════════════════════════════════════════════════
export default {
    // Core
    THEME, injectKeyframes, NeuralProvider, useNeural,
    // Hooks
    useAnimatedValue, useCopyToClipboard, useHover, useTypewriter, useInterval, useCountdown, usePrevious,
    // Primitives
    CornerBrackets, ScanlineOverlay, HexPattern, GridPattern, GlowOrb, NoiseTexture, CircuitLines,
    // Badges & chips
    ChipBadge, TrendChip, SeverityBadge, RoleBadge, LiveStatusBadge, StatusDot, WebSocketStatus, BloatStatusBadge,
    // Cards
    GlassCard, MetricCard, BentoMetric, StatCompare, ExtensionCard,
    // Charts & viz
    ResourceGauge, NeonProgressBar, CacheStatsRing, PulseRing, HeatCell, ConnectionPoolBar, RadarMetric, NetworkGraph, WaveformBar, HeatmapGrid,
    // Alerts
    AlertBanner, AlertToast,
    // Table & data
    DataTable, FilterPills, Timeline,
    // Inputs
    NanoButton, MiniButton, CopyButton, NeonSlider, NeonToggle, NeuralSelect, PillInput,
    // Terminal
    Terminal, TerminalLine, TypewriterText,
    // Overlay
    LoadingOverlay, SkeletonLoader, EmptyState,
    // Advanced
    AIAgentView, QueryHistoryItem, CommandPalette, CommandPaletteItem, NodeLink, SequenceUsageBar, SettingRow,
};