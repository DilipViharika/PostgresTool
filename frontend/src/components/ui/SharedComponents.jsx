import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar,
    PolarAngleAxis, AreaChart, Area, BarChart, Bar, Cell, Tooltip,
    PieChart, Pie, CartesianGrid, XAxis, YAxis
} from 'recharts';
import {
    TrendingUp, TrendingDown, Terminal, Zap, Bell, BellOff, Wifi, WifiOff,
    Shield, ShieldCheck, ShieldAlert, Eye, EyeOff, Clock, Star, StarOff,
    Tag, Hash, Database, HardDrive, Lock, Unlock, AlertTriangle, AlertCircle,
    CheckCircle, XCircle, Info, ChevronRight, ChevronDown, Copy, Check,
    RefreshCw, Loader, Search, Filter, X, MoreVertical, ExternalLink,
    Activity, Server, Cpu, ArrowUpRight, ArrowDownRight, Layers, GitBranch,
    Radio, Hexagon, Triangle, Sparkles, Binary, Braces, Orbit
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
//  ADVANCED THEME SYSTEM — Neural Interface OS
// ═══════════════════════════════════════════════════════════════════════════
export const THEME = {
    // Void palette
    void:       '#00000a',
    deep:       '#020510',
    abyss:      '#030818',
    surface:    '#060d1f',
    elevated:   '#0a1428',
    overlay:    '#0f1e3a',

    // Plasma accents
    plasma:     '#00f5ff',
    neon:       '#7b2fff',
    pulse:      '#ff2d78',
    aurora:     '#00ff88',
    solar:      '#ffaa00',
    nova:       '#ff6b35',

    // Semantic
    primary:    '#00f5ff',
    secondary:  '#7b2fff',
    success:    '#00ff88',
    danger:     '#ff2d78',
    warning:    '#ffaa00',
    info:       '#4d9fff',
    ai:         '#a855f7',

    // Text
    textMain:   '#e8f4ff',
    textSub:    '#8aa3c8',
    textMuted:  '#4a6080',
    textDim:    '#243040',

    // Glass & borders
    glass:      'rgba(6, 13, 31, 0.85)',
    glassLight: 'rgba(15, 30, 58, 0.6)',
    border:     'rgba(0, 245, 255, 0.08)',
    borderHot:  'rgba(0, 245, 255, 0.25)',
    grid:       'rgba(0, 245, 255, 0.04)',

    // Fonts
    fontMono:   "'JetBrains Mono', 'Fira Code', monospace",
    fontDisplay: "'Orbitron', 'Rajdhani', sans-serif",
    fontBody:   "'Exo 2', 'Titillium Web', sans-serif",
};

// ═══════════════════════════════════════════════════════════════════════════
//  KEYFRAMES — Advanced animation suite
// ═══════════════════════════════════════════════════════════════════════════
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --plasma: #00f5ff;
  --neon: #7b2fff;
  --pulse: #ff2d78;
  --aurora: #00ff88;
  --solar: #ffaa00;
}

@keyframes fadeUp        { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn        { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn       { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
@keyframes slideRight    { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
@keyframes alertSlide    { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
@keyframes ping          { 75%, 100% { transform:scale(2.2); opacity:0; } }
@keyframes pulse         { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
@keyframes breathe       { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.05); } }
@keyframes spin          { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes spin-slow     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes countUp       { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer       { 0% { background-position:-400% 0; } 100% { background-position:400% 0; } }
@keyframes scanline      { 0% { top:-10%; } 100% { top:110%; } }
@keyframes flicker       { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.8} 94%{opacity:1} 96%{opacity:0.9} 97%{opacity:1} }
@keyframes dataFlow      { 0% { stroke-dashoffset:1000; } 100% { stroke-dashoffset:0; } }
@keyframes plasmaGlow    { 0%,100% { box-shadow:0 0 8px #00f5ff40,0 0 16px #00f5ff20,inset 0 0 8px #00f5ff10; }
                           50% { box-shadow:0 0 20px #00f5ff70,0 0 40px #00f5ff30,inset 0 0 20px #00f5ff20; } }
@keyframes neonGlow      { 0%,100% { box-shadow:0 0 8px #7b2fff40,0 0 16px #7b2fff20; }
                           50% { box-shadow:0 0 20px #7b2fff70,0 0 40px #7b2fff30; } }
@keyframes borderTrace   { 0% { clip-path:polygon(0 0,0 0,0 100%,0 100%); }
                           25% { clip-path:polygon(0 0,100% 0,100% 0,0 100%); }
                           50% { clip-path:polygon(0 0,100% 0,100% 100%,100% 100%); }
                           75% { clip-path:polygon(0 0,100% 0,100% 100%,0 100%); }
                           100% { clip-path:polygon(0 0,100% 0,100% 100%,0 100%); } }
@keyframes typewriter    { from { width:0; } to { width:100%; } }
@keyframes blink-caret  { 0%,100% { border-color:transparent; } 50% { border-color:#00f5ff; } }
@keyframes hexRotate     { 0% { transform:rotate(0deg) scale(1); } 50% { transform:rotate(180deg) scale(1.1); } 100% { transform:rotate(360deg) scale(1); } }
@keyframes matrixRain    { 0% { opacity:0; transform:translateY(-100%); } 10% { opacity:1; } 90% { opacity:1; } 100% { opacity:0; transform:translateY(1000%); } }
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
//  HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useAnimatedValue(target, duration = 800) {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const fromRef = useRef(target);
    useEffect(() => {
        fromRef.current = display;
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const p = Math.min((ts - startRef.current) / duration, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setDisplay(Math.round(fromRef.current + (target - fromRef.current) * e));
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

// ═══════════════════════════════════════════════════════════════════════════
//  DECORATIVE PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

/** Animated corner brackets (UI chrome) */
export const CornerBrackets = ({ color = THEME.plasma, size = 12, thickness = 1.5, animated = false }) => {
    const s = { position: 'absolute', width: size, height: size, pointerEvents: 'none' };
    const line = { background: color, boxShadow: `0 0 6px ${color}` };
    const anim = animated ? { animation: 'plasmaGlow 2s ease-in-out infinite' } : {};
    return (
        <>
            {/* TL */}
            <div style={{ ...s, top: 0, left: 0, ...anim }}>
                <div style={{ ...line, position:'absolute', top:0, left:0, width: size, height: thickness }} />
                <div style={{ ...line, position:'absolute', top:0, left:0, width: thickness, height: size }} />
            </div>
            {/* TR */}
            <div style={{ ...s, top: 0, right: 0, ...anim }}>
                <div style={{ ...line, position:'absolute', top:0, right:0, width: size, height: thickness }} />
                <div style={{ ...line, position:'absolute', top:0, right:0, width: thickness, height: size }} />
            </div>
            {/* BL */}
            <div style={{ ...s, bottom: 0, left: 0, ...anim }}>
                <div style={{ ...line, position:'absolute', bottom:0, left:0, width: size, height: thickness }} />
                <div style={{ ...line, position:'absolute', bottom:0, left:0, width: thickness, height: size }} />
            </div>
            {/* BR */}
            <div style={{ ...s, bottom: 0, right: 0, ...anim }}>
                <div style={{ ...line, position:'absolute', bottom:0, right:0, width: size, height: thickness }} />
                <div style={{ ...line, position:'absolute', bottom:0, right:0, width: thickness, height: size }} />
            </div>
        </>
    );
};

/** Scanline overlay effect */
export const ScanlineOverlay = ({ opacity = 0.03 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden',
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,${opacity}) 2px, rgba(0,245,255,${opacity}) 4px)`,
    }}>
        <div style={{
            position: 'absolute', left: 0, right: 0, height: '20%',
            background: `linear-gradient(transparent, rgba(0,245,255,0.04) 50%, transparent)`,
            animation: 'scanline 6s linear infinite'
        }} />
    </div>
);

/** Hexagon background pattern */
export const HexPattern = ({ color = THEME.plasma, opacity = 0.03 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 0l28 17v33z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3Cpath d='M28 100L0 84V51l28-17 28 17v33z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '56px 100px'
    }} />
);

/** Ambient glow orb */
export const GlowOrb = ({ color, x = '80%', y = '-20%', size = 300, opacity = 0.06 }) => (
    <div style={{
        position: 'absolute', left: x, top: y, width: size, height: size,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity, filter: 'blur(40px)', transform: 'translate(-50%, -50%)'
    }} />
);

// ═══════════════════════════════════════════════════════════════════════════
//  1. GLASS CARD — Advanced neural panel
// ═══════════════════════════════════════════════════════════════════════════
export const GlassCard = ({
                              children, title, subtitle, rightNode, style, loading, collapsible, onRefresh,
                              refreshing, accentColor, variant = 'default', showScanlines = false,
                              showHex = false, corners = true, tag
                          }) => {
    injectKeyframes();
    const [collapsed, setCollapsed] = useState(false);
    const [hovered, hoverProps] = useHover();
    const accent = accentColor || THEME.plasma;

    const variants = {
        default:  { bg: THEME.glass, border: THEME.border },
        elevated: { bg: 'rgba(10, 20, 40, 0.9)', border: THEME.borderHot },
        ghost:    { bg: 'rgba(6, 13, 31, 0.4)', border: 'rgba(0,245,255,0.05)' },
        solid:    { bg: THEME.elevated, border: THEME.border },
    };
    const v = variants[variant] || variants.default;

    return (
        <div {...hoverProps} style={{
            background: v.bg,
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 4,
            border: `1px solid ${hovered ? THEME.borderHot : v.border}`,
            boxShadow: hovered
                ? `0 0 0 1px ${accent}15, 0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${accent}08`
                : `0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(0,245,255,0.06) inset`,
            padding: 0,
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            ...style
        }}>
            {showScanlines && <ScanlineOverlay />}
            {showHex && <HexPattern color={accent} opacity={0.04} />}
            {corners && <CornerBrackets color={accent} animated={hovered} />}
            <GlowOrb color={accent} />

            {/* Top accent bar */}
            <div style={{
                height: 2, width: '100%',
                background: `linear-gradient(90deg, transparent 0%, ${accent} 40%, ${THEME.secondary} 70%, transparent 100%)`,
                opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s'
            }} />

            {/* Header */}
            {(title || rightNode) && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', borderBottom: `1px solid ${THEME.border}`,
                    position: 'relative', zIndex: 2
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {collapsible && (
                            <button onClick={() => setCollapsed(!collapsed)} style={{
                                background: 'none', border: 'none', color: THEME.textMuted,
                                cursor: 'pointer', padding: 0, display: 'flex',
                                transition: 'transform 0.25s, color 0.2s',
                                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                            }}>
                                <ChevronDown size={14} />
                            </button>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{
                                    fontSize: 11, fontWeight: 700, color: THEME.textSub,
                                    fontFamily: THEME.fontDisplay,
                                    textTransform: 'uppercase', letterSpacing: '2px', margin: 0
                                }}>{title}</h3>
                                {tag && (
                                    <span style={{
                                        fontSize: 9, padding: '2px 8px', borderRadius: 2,
                                        background: `${accent}15`, color: accent,
                                        border: `1px solid ${accent}30`, fontFamily: THEME.fontMono,
                                        letterSpacing: '1px', fontWeight: 700
                                    }}>{tag}</span>
                                )}
                            </div>
                            {subtitle && (
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2, fontFamily: THEME.fontMono }}>{subtitle}</div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {onRefresh && (
                            <NanoButton onClick={onRefresh} icon={RefreshCw}
                                        spinning={refreshing} color={THEME.textMuted} />
                        )}
                        {rightNode}
                    </div>
                </div>
            )}

            {/* Body */}
            {!collapsed && (
                <div style={{
                    flex: 1, minHeight: 0, position: 'relative', zIndex: 1,
                    padding: 20,
                    opacity: loading ? 0.4 : 1, transition: 'opacity 0.3s'
                }}>
                    {loading && <LoadingOverlay />}
                    {children}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. METRIC CARD — Plasma edition with live sparklines
// ═══════════════════════════════════════════════════════════════════════════
export const MetricCard = ({
                               icon: Icon, title, value, unit, subtitle, color = THEME.plasma,
                               onClick, active, sparkData, trend, cacheBadge, badge, size = 'default',
                               delta, loading
                           }) => {
    injectKeyframes();
    const [hovered, hoverProps] = useHover();
    const isCompact = size === 'compact';

    return (
        <div {...hoverProps} onClick={onClick} style={{
            background: active
                ? `linear-gradient(145deg, ${color}18 0%, ${color}06 100%)`
                : `linear-gradient(145deg, rgba(10,20,40,0.7) 0%, rgba(3,8,24,0.9) 100%)`,
            borderRadius: 4,
            border: `1px solid ${active || hovered ? color + '50' : THEME.border}`,
            padding: isCompact ? 14 : 20,
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            gap: isCompact ? 8 : 14,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered && onClick ? 'translateY(-3px)' : active ? 'translateY(-2px)' : 'none',
            boxShadow: active
                ? `0 12px 30px -6px ${color}25, 0 0 0 1px ${color}20`
                : hovered && onClick ? `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${color}15` : 'none',
            animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards'
        }}>
            {/* Corner decoration */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: 60, height: 60,
                background: `radial-gradient(circle at top right, ${color}12 0%, transparent 70%)`
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: active ? `linear-gradient(90deg, transparent, ${color}50, transparent)` : 'none'
            }} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: isCompact ? 34 : 42, height: isCompact ? 34 : 42,
                    borderRadius: 6, background: `${color}10`,
                    color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}25`,
                    boxShadow: active || hovered ? `0 0 16px ${color}30, inset 0 0 8px ${color}10` : 'none',
                    transition: 'box-shadow 0.3s'
                }}>
                    <Icon size={isCompact ? 16 : 20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {cacheBadge && (
                        <ChipBadge label={cacheBadge}
                                   color={cacheBadge === 'HIT' ? THEME.aurora : THEME.solar} micro />
                    )}
                    {badge && <ChipBadge label={badge} color={color} micro />}
                    {active && <ChipBadge label="SELECTED" color={color} />}
                </div>
            </div>

            {/* Sparkline */}
            {sparkData && sparkData.length > 0 && (
                <div style={{ width: '100%', height: 36, marginTop: -4, marginBottom: -4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                            <defs>
                                <linearGradient id={`spark-${title?.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value"
                                  stroke={color} strokeWidth={1.5}
                                  fill={`url(#spark-${title?.replace(/\s/g,'')})`}
                                  dot={false} isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Value block */}
            <div>
                <div style={{
                    fontSize: 10, color: THEME.textMuted, fontWeight: 600, fontFamily: THEME.fontDisplay,
                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4
                }}>{title}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    {loading ? (
                        <div style={{ width: 80, height: 28, borderRadius: 3, background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite', backgroundSize: '400%' }} />
                    ) : (
                        <>
                            <span style={{
                                fontSize: isCompact ? 24 : 30, fontWeight: 700,
                                color: THEME.textMain, fontFamily: THEME.fontMono,
                                letterSpacing: '-1px', lineHeight: 1,
                                animation: 'countUp 0.6s ease backwards',
                                textShadow: active ? `0 0 20px ${color}60` : 'none'
                            }}>{value}</span>
                            {unit && <span style={{ fontSize: 12, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{unit}</span>}
                        </>
                    )}
                    {trend !== undefined && trend !== null && (
                        <TrendChip value={trend} />
                    )}
                </div>

                {subtitle && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{subtitle}</div>}
                {delta && (
                    <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 3, fontFamily: THEME.fontMono }}>
                        {delta}
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. BENTO METRIC — Feature card with aurora accent
// ═══════════════════════════════════════════════════════════════════════════
export const BentoMetric = ({ label, value, unit, icon: Icon, color, trend, delay = 0, chartData, description }) => {
    injectKeyframes();
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            background: 'linear-gradient(145deg, rgba(10,20,40,0.8) 0%, rgba(3,8,24,0.95) 100%)',
            borderRadius: 4, padding: 22,
            border: `1px solid ${hovered ? color + '40' : THEME.border}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`,
            position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s, transform 0.3s',
            transform: hovered ? 'translateY(-2px)' : 'none',
            minHeight: 130
        }}>
            <GlowOrb color={color} x="100%" y="0%" size={200} opacity={hovered ? 0.1 : 0.04} />

            {/* Watermark icon */}
            <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: hovered ? 0.12 : 0.05, transition: 'opacity 0.3s' }}>
                <Icon size={80} color={color} />
            </div>

            {chartData && chartData.length > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, opacity: 0.12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <Area type="monotone" dataKey="value" stroke={color} fill={color} strokeWidth={1} dot={false} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: 7, borderRadius: 6, background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    <Icon size={15} />
                </div>
                <span style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 700, fontFamily: THEME.fontDisplay, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {label}
                </span>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{
                        fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1,
                        fontFamily: THEME.fontMono,
                        textShadow: hovered ? `0 0 24px ${color}80` : 'none',
                        transition: 'text-shadow 0.3s'
                    }}>{value}</span>
                    {unit && <span style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 3, fontFamily: THEME.fontMono }}>{unit}</span>}
                </div>
                {description && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{description}</div>}
                {trend !== undefined && trend !== null && (
                    <div style={{ marginTop: 8 }}><TrendChip value={trend} label="vs last hr" /></div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  4. RESOURCE GAUGE — Arc reactor style
// ═══════════════════════════════════════════════════════════════════════════
export const ResourceGauge = ({ label, value, color, thresholds, size = 160, subtitle }) => {
    injectKeyframes();
    const numValue = Number(value) || 0;
    const resolvedColor = thresholds
        ? numValue >= (thresholds.critical || 90) ? THEME.danger
            : numValue >= (thresholds.warning || 70) ? THEME.warning : color
        : color;

    const data = [{ name: 'L', value: numValue, fill: resolvedColor }];
    const isEmpty = [{ name: 'L', value: 100 - numValue, fill: 'rgba(255,255,255,0.04)' }];

    return (
        <div style={{ position: 'relative', height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer ring glow */}
            <div style={{
                position: 'absolute', inset: 8, borderRadius: '50%',
                boxShadow: `0 0 20px ${resolvedColor}20, inset 0 0 20px ${resolvedColor}05`,
                animation: 'breathe 3s ease-in-out infinite'
            }} />
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="62%" outerRadius="100%" barSize={8} data={data} startAngle={220} endAngle={-40}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} clockWise dataKey="value" cornerRadius={4} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{
                    fontSize: numValue >= 100 ? 20 : 26, fontWeight: 700, color: resolvedColor,
                    fontFamily: THEME.fontMono, lineHeight: 1,
                    textShadow: `0 0 16px ${resolvedColor}80`,
                    animation: 'countUp 0.8s ease backwards'
                }}>{numValue}%</div>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', marginTop: 3, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>{label}</div>
                {subtitle && <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono }}>{subtitle}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  5. NEON PROGRESS BAR — Plasma strand
// ═══════════════════════════════════════════════════════════════════════════
export const NeonProgressBar = ({
                                    value, max, color = THEME.plasma, label, showPercent = false, height = 6,
                                    thresholds, animate = true, showNodes = false
                                }) => {
    const percent = Math.min((value / (max || 1)) * 100, 100);
    const resolvedColor = thresholds
        ? percent >= (thresholds.critical || 90) ? THEME.danger
            : percent >= (thresholds.warning || 70) ? THEME.warning : color
        : color;

    return (
        <div>
            {(label || showPercent) && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                    fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono
                }}>
                    {label && <span style={{ letterSpacing: '0.5px' }}>{label}</span>}
                    {showPercent && <span style={{ color: resolvedColor, fontWeight: 700 }}>{percent.toFixed(1)}%</span>}
                </div>
            )}
            <div style={{
                width: '100%', height, background: 'rgba(255,255,255,0.04)',
                borderRadius: 2, overflow: 'visible', position: 'relative',
                border: '1px solid rgba(255,255,255,0.04)'
            }}>
                <div style={{
                    width: `${percent}%`, height: '100%',
                    background: `linear-gradient(90deg, ${resolvedColor}60, ${resolvedColor} 80%, #fff 100%)`,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${resolvedColor}80, 0 0 2px ${resolvedColor}`,
                    transition: animate ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    position: 'relative'
                }}>
                    {/* Leading edge glow dot */}
                    <div style={{
                        position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)',
                        width: height * 2, height: height * 2, borderRadius: '50%',
                        background: resolvedColor,
                        boxShadow: `0 0 10px ${resolvedColor}, 0 0 20px ${resolvedColor}80`
                    }} />
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  6. TOOLTIP — Holographic HUD style
// ═══════════════════════════════════════════════════════════════════════════
export const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            backgroundColor: 'rgba(2, 8, 20, 0.98)',
            border: `1px solid ${THEME.borderHot}`,
            borderRadius: 4,
            padding: '12px 16px',
            boxShadow: `0 4px 30px rgba(0,0,0,0.8), 0 0 20px ${THEME.plasma}15`,
            backdropFilter: 'blur(20px)',
            maxWidth: 240, position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${THEME.plasma}, transparent)` }} />
            {label && (
                <p style={{ color: THEME.textMuted, fontSize: 10, marginBottom: 10, fontFamily: THEME.fontMono, letterSpacing: '1px' }}>
                    {label}
                </p>
            )}
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
                    <span style={{ fontSize: 11, color: THEME.textSub, fontFamily: THEME.fontMono }}>{entry.name}:</span>
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, fontFamily: THEME.fontMono, marginLeft: 'auto' }}>
                        {formatter ? formatter(entry.value, entry.name) : (typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  7. LIVE STATUS BADGE — Neural link indicator
// ═══════════════════════════════════════════════════════════════════════════
export const LiveStatusBadge = ({ connected = true, label, count, showLatency, latency }) => {
    injectKeyframes();
    const color = connected ? THEME.aurora : THEME.danger;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${color}08`, padding: '5px 12px', borderRadius: 2,
            border: `1px solid ${color}25`,
            boxShadow: connected ? `0 0 12px ${color}15, inset 0 0 8px ${color}05` : 'none'
        }}>
            <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                {connected && (
                    <div style={{
                        position: 'absolute', inset: -3, borderRadius: '50%',
                        background: color, opacity: 0.35,
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }} />
                )}
            </div>
            <span style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', fontFamily: THEME.fontDisplay }}>
                {label || (connected ? 'LIVE' : 'OFFLINE')}
            </span>
            {count !== undefined && (
                <span style={{ fontSize: 10, background: `${color}15`, color, padding: '1px 7px', borderRadius: 2, fontFamily: THEME.fontMono, fontWeight: 700, border: `1px solid ${color}20` }}>
                    {count}
                </span>
            )}
            {showLatency && latency !== undefined && (
                <span style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    {latency}ms
                </span>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  8. EMPTY STATE — Signal lost aesthetic
// ═══════════════════════════════════════════════════════════════════════════
export const EmptyState = ({ icon: Icon, text, action, onAction, color = THEME.plasma }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16, padding: 40,
        position: 'relative'
    }}>
        <div style={{ position: 'relative' }}>
            <div style={{
                width: 72, height: 72, borderRadius: 4,
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${THEME.border}`, color: THEME.textDim,
                position: 'relative', overflow: 'hidden'
            }}>
                <CornerBrackets color={THEME.textDim} size={8} />
                <Icon size={28} />
            </div>
        </div>
        <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 220, color: THEME.textMuted, fontFamily: THEME.fontMono, lineHeight: 1.7 }}>
            {text}
        </div>
        {action && (
            <NanoButton label={action} onClick={onAction} color={color} outlined />
        )}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  9. AI AGENT VIEW — Neural cortex analyzer
// ═══════════════════════════════════════════════════════════════════════════
export const AIAgentView = ({ type, data }) => {
    const [copied, copy] = useCopyToClipboard();
    const [activeTab, setActiveTab] = useState('analysis');

    if (!data) return <EmptyState icon={Terminal} text="Select an item to initiate neural analysis." />;

    const getSqlContent = () => {
        if (type === 'api') return data.queries?.map(q => q.sql).join('\n\n') || '';
        if (type === 'missing') return `CREATE INDEX CONCURRENTLY idx_${data.table}_${data.column}\nON ${data.table} (${data.column});`;
        if (type === 'unused') return `DROP INDEX CONCURRENTLY ${data.indexName};`;
        if (type === 'duplicate') return `-- Duplicate of: ${data.duplicateOf}\nDROP INDEX CONCURRENTLY ${data.indexName};`;
        return data.problem_query || '';
    };

    const severityColor = type === 'missing' ? THEME.danger : type === 'unused' ? THEME.warning : type === 'duplicate' ? THEME.solar : THEME.plasma;
    const tabs = ['analysis', 'context', 'actions'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
            {/* AI Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(123,47,255,0.05) 100%)',
                border: `1px solid ${THEME.ai}25`, borderRadius: 4, padding: 16, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${THEME.ai}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                        width: 28, height: 28, background: `linear-gradient(135deg, ${THEME.ai}, #5b21b6)`,
                        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 16px ${THEME.ai}50`
                    }}>
                        <Sparkles size={14} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.ai, letterSpacing: '1.5px', fontFamily: THEME.fontDisplay }}>NEURAL ANALYSIS ENGINE</div>
                        <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 1 }}>v2.4.1 · confidence: 97.3%</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <SeverityBadge severity={type === 'unused' ? 'warning' : type === 'missing' ? 'critical' : type === 'duplicate' ? 'warning' : 'info'} />
                    </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: THEME.textSub, margin: 0, fontFamily: THEME.fontBody }}>
                    {type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete. No critical issues detected.')}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.02)', padding: 3, borderRadius: 4, border: `1px solid ${THEME.border}` }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, background: activeTab === tab ? THEME.plasma + '15' : 'none',
                        border: activeTab === tab ? `1px solid ${THEME.plasma}30` : '1px solid transparent',
                        color: activeTab === tab ? THEME.plasma : THEME.textMuted,
                        padding: '5px 0', borderRadius: 3, cursor: 'pointer',
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                        fontFamily: THEME.fontDisplay, transition: 'all 0.2s'
                    }}>{tab}</button>
                ))}
            </div>

            {/* Terminal */}
            <div style={{
                flex: 1, background: '#010408', borderRadius: 4,
                border: `1px solid ${THEME.border}`, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
                <ScanlineOverlay opacity={0.015} />
                {/* Terminal header */}
                <div style={{
                    background: '#020812', padding: '8px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: `1px solid ${THEME.border}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef444480' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b80' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e80' }} />
                        <div style={{ width: 1, height: 12, background: THEME.border, margin: '0 6px' }} />
                        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                            {`neural://context.sql`}
                        </span>
                    </div>
                    <CopyButton text={getSqlContent()} size="small" />
                </div>
                {/* Code area */}
                <div style={{
                    padding: 16, fontFamily: THEME.fontMono, fontSize: 12,
                    color: '#7dd3fc', lineHeight: 1.8, flex: 1, overflowY: 'auto',
                    position: 'relative'
                }}>
                    <span style={{ color: THEME.textDim, userSelect: 'none' }}>{'> '}</span>
                    {type === 'missing' && <>
                        <span style={{ color: THEME.textMuted }}>{`-- ✦ Recommended Action\n`}</span>
                        <span style={{ color: THEME.aurora }}>{`CREATE INDEX CONCURRENTLY idx_${data.table}_${data.column}\n`}</span>
                        <span style={{ color: THEME.aurora }}>{`ON ${data.table} (${data.column});\n\n`}</span>
                        <span style={{ color: THEME.textMuted }}>{`-- ✦ Performance Projection\n`}</span>
                        <span style={{ color: THEME.plasma }}>{`Seq scans eliminated: ${data.improvement || 'significant'}\n`}</span>
                        <span style={{ color: THEME.plasma }}>{`Table: ${data.tableSize || 'N/A'}\n`}</span>
                    </>}
                    {type === 'unused' && <>
                        <span style={{ color: THEME.textMuted }}>{`-- ✦ Safe to remove\n`}</span>
                        <span style={{ color: THEME.danger }}>{`DROP INDEX CONCURRENTLY ${data.indexName};\n\n`}</span>
                        <span style={{ color: THEME.textMuted }}>{`-- ✦ Resources Reclaimed\n`}</span>
                        <span style={{ color: THEME.solar }}>{`Size: ${data.size} | Scans: ${data.scans ?? 0}\n`}</span>
                    </>}
                    {type === 'api' && data.queries?.map((q, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ color: THEME.textMuted, fontSize: 10 }}>{`-- [${i+1}] ${q.calls} executions · ${q.duration}ms avg`}</div>
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
//  10. ALERT BANNER — Critical incident HUD
// ═══════════════════════════════════════════════════════════════════════════
const SEVERITY_CONFIG = {
    critical: { color: THEME.danger,   icon: XCircle,      bg: 'rgba(255,45,120,0.07)',  label: 'CRITICAL' },
    warning:  { color: THEME.warning,  icon: AlertTriangle, bg: 'rgba(255,170,0,0.07)',   label: 'WARNING' },
    info:     { color: THEME.info,     icon: Info,          bg: 'rgba(77,159,255,0.07)',  label: 'INFO' },
};

export const AlertBanner = ({ alert, onAcknowledge, onDismiss, compact = false }) => {
    injectKeyframes();
    if (!alert) return null;
    const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const Icon = config.icon;

    if (compact) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: config.bg, borderRadius: 3,
                border: `1px solid ${config.color}25`,
                animation: 'alertSlide 0.3s ease backwards'
            }}>
                <Icon size={13} color={config.color} />
                <span style={{ color: THEME.textSub, flex: 1, fontSize: 12, fontFamily: THEME.fontBody }}>{alert.message}</span>
                <span style={{ color: THEME.textMuted, fontSize: 9, fontFamily: THEME.fontMono }}>
                    {new Date(alert.ts).toLocaleTimeString()}
                </span>
                {onAcknowledge && !alert.acknowledged && (
                    <button onClick={() => onAcknowledge(alert.id)} style={{
                        background: `${config.color}12`, border: `1px solid ${config.color}30`,
                        color: config.color, padding: '2px 10px', borderRadius: 3,
                        cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: THEME.fontDisplay,
                        letterSpacing: '1px'
                    }}>ACK</button>
                )}
            </div>
        );
    }

    return (
        <div style={{
            background: config.bg, borderRadius: 4, padding: 16,
            border: `1px solid ${config.color}20`,
            animation: 'alertSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
            display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: config.color, boxShadow: `0 0 8px ${config.color}` }} />
            <div style={{
                width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                background: `${config.color}12`, color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${config.color}25`
            }}>
                <Icon size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <SeverityBadge severity={alert.severity} />
                    {alert.category && (
                        <span style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontMono, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {alert.category}
                        </span>
                    )}
                    <span style={{ fontSize: 9, color: THEME.textDim, marginLeft: 'auto', fontFamily: THEME.fontMono }}>
                        {new Date(alert.ts).toLocaleTimeString()}
                    </span>
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
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {onAcknowledge && !alert.acknowledged && (
                    <button onClick={() => onAcknowledge(alert.id)} style={{
                        background: `${config.color}12`, border: `1px solid ${config.color}30`,
                        color: config.color, padding: '6px 14px', borderRadius: 3,
                        cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: THEME.fontDisplay, letterSpacing: '1px'
                    }}>ACKNOWLEDGE</button>
                )}
                {onDismiss && (
                    <button onClick={onDismiss} style={{ background: 'none', border: `1px solid ${THEME.border}`, color: THEME.textMuted, cursor: 'pointer', padding: '6px 8px', borderRadius: 3 }}>
                        <X size={13} />
                    </button>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  11. SEVERITY BADGE
// ═══════════════════════════════════════════════════════════════════════════
export const SeverityBadge = ({ severity }) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
    return (
        <span style={{
            fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '2px 8px', borderRadius: 2,
            background: `${config.color}15`, color: config.color,
            border: `1px solid ${config.color}30`, fontFamily: THEME.fontDisplay
        }}>{severity}</span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  12. WEBSOCKET STATUS
// ═══════════════════════════════════════════════════════════════════════════
export const WebSocketStatus = ({ connected, clientCount, lastMessage, uptime }) => {
    injectKeyframes();
    const color = connected ? THEME.aurora : THEME.danger;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: `${color}06`, padding: '6px 14px', borderRadius: 2,
            border: `1px solid ${color}20`,
            boxShadow: connected ? `0 0 20px ${color}10` : 'none'
        }}>
            {connected ? <Wifi size={12} color={color} /> : <WifiOff size={12} color={color} />}
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: connected ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: THEME.fontDisplay, letterSpacing: '1px' }}>
                {connected ? 'WS·CONNECTED' : 'WS·OFFLINE'}
            </span>
            {clientCount !== undefined && (
                <span style={{ fontSize: 9, fontFamily: THEME.fontMono, color: THEME.textMuted, background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 2 }}>
                    {clientCount}c
                </span>
            )}
            {uptime && <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{uptime}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  13. ROLE BADGE
// ═══════════════════════════════════════════════════════════════════════════
const ROLE_CONFIG = {
    super_admin: { color: THEME.solar,    icon: ShieldCheck, label: 'SUPER ADMIN' },
    dba:         { color: THEME.plasma,   icon: Shield,      label: 'DBA' },
    viewer:      { color: THEME.textMuted, icon: Eye,        label: 'VIEWER' },
};

export const RoleBadge = ({ role, showIcon = true, size = 'default' }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
    const Icon = config.icon;
    const sm = size === 'small';
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6,
            background: `${config.color}10`, padding: sm ? '2px 8px' : '5px 12px',
            borderRadius: 3, border: `1px solid ${config.color}20`
        }}>
            {showIcon && <Icon size={sm ? 10 : 13} color={config.color} />}
            <span style={{
                fontSize: sm ? 9 : 10, fontWeight: 800, color: config.color,
                textTransform: 'uppercase', letterSpacing: '1px', fontFamily: THEME.fontDisplay
            }}>{config.label}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  14. QUERY HISTORY ITEM — Chronostream entry
// ═══════════════════════════════════════════════════════════════════════════
export const QueryHistoryItem = ({ entry, onFavourite, onTag, onReplay, onCopy }) => {
    const [expanded, setExpanded] = useState(false);
    const [hovered, hoverProps] = useHover();

    return (
        <div {...hoverProps} style={{
            background: hovered ? 'rgba(10,20,40,0.8)' : 'rgba(6,13,31,0.6)',
            borderRadius: 3, border: `1px solid ${hovered ? THEME.borderHot : THEME.border}`,
            overflow: 'hidden', transition: 'all 0.2s',
            animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) backwards',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: entry.success ? THEME.aurora : THEME.danger,
                opacity: 0.7
            }} />
            <div onClick={() => setExpanded(!expanded)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 16px', cursor: 'pointer'
            }}>
                <span style={{
                    flex: 1, fontSize: 11, color: THEME.textSub, fontFamily: THEME.fontMono,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{entry.sql}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {entry.tag && <ChipBadge label={entry.tag} color={THEME.plasma} micro />}
                    <span style={{
                        fontSize: 10, color: entry.durationMs > 1000 ? THEME.warning : THEME.textMuted,
                        fontFamily: THEME.fontMono, fontWeight: 700
                    }}>{entry.durationMs}ms</span>
                    <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: THEME.fontMono }}>{entry.rowCount}r</span>
                    <button onClick={(e) => { e.stopPropagation(); onFavourite?.(entry.id); }} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                        color: entry.favourite ? THEME.solar : THEME.textDim, transition: 'color 0.2s'
                    }}>
                        {entry.favourite ? <Star size={12} fill={THEME.solar} /> : <Star size={12} />}
                    </button>
                    <ChevronDown size={11} color={THEME.textDim} style={{
                        transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                </div>
            </div>
            {expanded && (
                <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${THEME.border}`, paddingLeft: 16 }}>
                    <pre style={{
                        fontSize: 11, color: '#93c5fd', fontFamily: THEME.fontMono,
                        background: '#010408', padding: 12, borderRadius: 3, margin: '10px 0',
                        overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                        border: `1px solid ${THEME.border}`
                    }}>{entry.sql}</pre>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {entry.user && <span>user: <span style={{ color: THEME.textSub }}>{entry.user}</span></span>}
                            <span>{new Date(entry.ts).toLocaleString()}</span>
                            {entry.error && <span style={{ color: THEME.danger }}>✕ {entry.error}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {onCopy && <NanoButton icon={Copy} onClick={() => onCopy(entry.sql)} tooltip="Copy" />}
                            {onReplay && <NanoButton icon={RefreshCw} onClick={() => onReplay(entry.sql)} tooltip="Replay" />}
                            {onTag && <NanoButton icon={Tag} onClick={() => onTag(entry.id)} tooltip="Tag" />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  15. CONNECTION POOL BAR — Segmented plasma bar
// ═══════════════════════════════════════════════════════════════════════════
export const ConnectionPoolBar = ({ total, idle, active, waiting, max }) => {
    const segments = [
        { label: 'Active', value: active || (total - idle), color: THEME.plasma },
        { label: 'Idle', value: idle, color: THEME.aurora },
        { label: 'Waiting', value: waiting, color: THEME.warning },
    ];
    const barMax = max || total || 1;

    return (
        <div>
            <div style={{
                display: 'flex', height: 18, borderRadius: 2, overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`,
                gap: 1
            }}>
                {segments.map((seg, i) => seg.value > 0 && (
                    <div key={i} style={{
                        width: `${(seg.value / barMax) * 100}%`,
                        background: `linear-gradient(180deg, ${seg.color}70, ${seg.color}40)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: THEME.fontMono,
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: `inset 0 1px 0 ${seg.color}30`,
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.3,
                            background: `repeating-linear-gradient(90deg, transparent, transparent 4px, ${seg.color}20 4px, ${seg.color}20 5px)`
                        }} />
                        <span style={{ position: 'relative', zIndex: 1 }}>{seg.value > 2 ? seg.value : ''}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 1, background: seg.color, boxShadow: `0 0 6px ${seg.color}60` }} />
                        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                            {seg.label}: <span style={{ color: '#fff', fontWeight: 700 }}>{seg.value}</span>
                        </span>
                    </div>
                ))}
                {max && <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 'auto', fontFamily: THEME.fontMono }}>cap: {max}</span>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  16. BLOAT STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════
export const BloatStatusBadge = ({ status, bloatPct }) => {
    const config = {
        critical: { color: THEME.danger,  icon: XCircle },
        warning:  { color: THEME.warning, icon: AlertTriangle },
        ok:       { color: THEME.aurora,  icon: CheckCircle }
    }[status] || { color: THEME.textMuted, icon: Info };
    const Icon = config.icon;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${config.color}10`, padding: '3px 10px',
            borderRadius: 3, border: `1px solid ${config.color}25`
        }}>
            <Icon size={11} color={config.color} />
            <span style={{ fontSize: 9, fontWeight: 800, color: config.color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: THEME.fontDisplay }}>{status}</span>
            {bloatPct !== undefined && <span style={{ fontSize: 10, fontFamily: THEME.fontMono, color: config.color }}>{bloatPct}%</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  17. SETTING ROW
// ═══════════════════════════════════════════════════════════════════════════
export const SettingRow = ({ name, value, unit, description, category, context }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderBottom: `1px solid ${THEME.border}`,
            background: hovered ? 'rgba(0,245,255,0.02)' : 'transparent',
            transition: 'background 0.15s',
            animation: 'fadeUp 0.3s ease backwards'
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.plasma, fontWeight: 600 }}>{name}</span>
                    {context && (
                        <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 2, color: THEME.textDim, fontFamily: THEME.fontMono, letterSpacing: '0.5px' }}>{context}</span>
                    )}
                </div>
                {description && <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2, fontFamily: THEME.fontBody }}>{description}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontFamily: THEME.fontMono, color: '#fff', fontWeight: 700 }}>{value}</span>
                {unit && <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 5, fontFamily: THEME.fontMono }}>{unit}</span>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  18. SKELETON LOADER — Neural loading state
// ═══════════════════════════════════════════════════════════════════════════
export const SkeletonLoader = ({ rows = 3, height = 16, gap = 10, style: customStyle }) => {
    injectKeyframes();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap, ...customStyle }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={{
                    height, borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(0,245,255,0.02) 25%, rgba(0,245,255,0.07) 50%, rgba(0,245,255,0.02) 75%)',
                    backgroundSize: '400% 100%',
                    animation: 'shimmer 2s ease infinite',
                    width: i === rows - 1 ? '55%' : '100%',
                    boxShadow: 'inset 0 1px 0 rgba(0,245,255,0.05)'
                }} />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  19. LOADING OVERLAY — Plasma spinner
// ═══════════════════════════════════════════════════════════════════════════
const LoadingOverlay = () => {
    injectKeyframes();
    return (
        <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(1,4,8,0.7)', zIndex: 20, borderRadius: 4,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: `2px solid ${THEME.border}`,
                    borderTop: `2px solid ${THEME.plasma}`,
                    animation: 'spin 0.8s linear infinite',
                    boxShadow: `0 0 12px ${THEME.plasma}40`
                }} />
                <div style={{
                    position: 'absolute', inset: 6, borderRadius: '50%',
                    border: `1px solid ${THEME.border}`,
                    borderBottom: `1px solid ${THEME.secondary}`,
                    animation: 'spin 1.2s linear infinite reverse'
                }} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  20. NANO BUTTON — Micro control element
// ═══════════════════════════════════════════════════════════════════════════
export const NanoButton = ({ icon: Icon, onClick, tooltip, color = THEME.textMuted, active, spinning, label, outlined }) => {
    const [hovered, hoverProps] = useHover();
    injectKeyframes();
    return (
        <button {...hoverProps} onClick={onClick} title={tooltip} style={{
            background: active || hovered ? `rgba(0,245,255,0.08)` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active || hovered ? THEME.borderHot : THEME.border}`,
            color: active || hovered ? THEME.plasma : color,
            borderRadius: 3, padding: label ? '5px 12px' : '5px 7px',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 0.15s', fontSize: 10, fontFamily: THEME.fontDisplay,
            fontWeight: 700, letterSpacing: '0.5px'
        }}>
            {Icon && <Icon size={12} style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }} />}
            {label && <span>{label}</span>}
        </button>
    );
};

// Alias for backward compat
export const MiniButton = NanoButton;

// ═══════════════════════════════════════════════════════════════════════════
//  21. DATA TABLE — Cyberpunk grid
// ═══════════════════════════════════════════════════════════════════════════
export const DataTable = ({
                              columns, data, sortable = true, searchable = false, pageSize = 20,
                              emptyText = 'NO DATA', onRowClick, rowKey = 'id', compact = false,
                              accentColor = THEME.plasma
                          }) => {
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(null);

    const filtered = useMemo(() => {
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(row => columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q)));
    }, [data, search, columns]);

    const sorted = useMemo(() => {
        if (!sort.key) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sort.key], vb = b[sort.key];
            const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
            return sort.dir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sort]);

    const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(sorted.length / pageSize);

    return (
        <div>
            {searchable && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    background: 'rgba(0,245,255,0.03)', borderRadius: 3,
                    padding: '7px 12px', border: `1px solid ${THEME.border}`
                }}>
                    <Search size={12} color={THEME.textMuted} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                           placeholder="Search..." style={{
                        background: 'none', border: 'none', color: '#fff', fontSize: 11,
                        outline: 'none', flex: 1, fontFamily: THEME.fontMono
                    }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: THEME.textMuted, cursor: 'pointer', padding: 0 }}><X size={11} /></button>}
                </div>
            )}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: `1px solid ${accentColor}20` }}>
                        {columns.map(col => (
                            <th key={col.key} onClick={() => { if (sortable) setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' })); }} style={{
                                textAlign: col.align || 'left', padding: compact ? '7px 10px' : '10px 14px',
                                fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
                                color: sort.key === col.key ? accentColor : THEME.textMuted,
                                borderBottom: `1px solid ${THEME.border}`,
                                cursor: sortable ? 'pointer' : 'default',
                                whiteSpace: 'nowrap', userSelect: 'none', fontFamily: THEME.fontDisplay,
                                background: sort.key === col.key ? `${accentColor}04` : 'none'
                            }}>
                                {col.label}
                                {sort.key === col.key && (
                                    <span style={{ marginLeft: 5, color: accentColor }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paged.length === 0 ? (
                        <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 30, color: THEME.textDim, fontSize: 11, fontFamily: THEME.fontMono }}>{emptyText}</td></tr>
                    ) : paged.map((row, ri) => (
                        <tr key={row[rowKey] ?? ri}
                            onClick={() => onRowClick?.(row)}
                            onMouseEnter={() => setHoveredRow(ri)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{
                                cursor: onRowClick ? 'pointer' : 'default',
                                background: hoveredRow === ri ? `rgba(0,245,255,0.025)` : 'transparent',
                                transition: 'background 0.1s',
                                borderLeft: hoveredRow === ri ? `2px solid ${accentColor}40` : '2px solid transparent'
                            }}
                        >
                            {columns.map(col => (
                                <td key={col.key} style={{
                                    padding: compact ? '7px 10px' : '10px 14px',
                                    fontSize: compact ? 11 : 12, color: THEME.textSub,
                                    borderBottom: `1px solid rgba(0,245,255,0.03)`,
                                    textAlign: col.align || 'left',
                                    fontFamily: col.mono ? THEME.fontMono : THEME.fontBody,
                                    maxWidth: col.maxWidth || 'none',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    <span>{sorted.length} rows · pg {page + 1}/{totalPages}</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i)} style={{
                                background: page === i ? `${accentColor}20` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${page === i ? accentColor + '50' : THEME.border}`,
                                color: page === i ? accentColor : THEME.textDim,
                                width: 26, height: 26, borderRadius: 3, cursor: 'pointer', fontSize: 10, fontFamily: THEME.fontMono
                            }}>{i + 1}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  22. FILTER PILLS
// ═══════════════════════════════════════════════════════════════════════════
export const FilterPills = ({ options, active, onChange, multi = false }) => (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(opt => {
            const key = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const isActive = multi ? active?.includes(key) : active === key;
            return (
                <button key={key} onClick={() => onChange(key)} style={{
                    background: isActive ? `${THEME.plasma}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? THEME.plasma + '40' : THEME.border}`,
                    color: isActive ? THEME.plasma : THEME.textMuted,
                    padding: '4px 12px', borderRadius: 2, cursor: 'pointer',
                    fontSize: 9, fontWeight: 700, transition: 'all 0.2s',
                    fontFamily: THEME.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase',
                    boxShadow: isActive ? `0 0 10px ${THEME.plasma}15` : 'none'
                }}>{label}</button>
            );
        })}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  23. CACHE STATS RING
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.plasma, fontFamily: THEME.fontMono, textShadow: `0 0 10px ${THEME.plasma}80` }}>{usagePct.toFixed(0)}%</span>
                </div>
            </div>
            <div>
                <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 6, fontFamily: THEME.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase' }}>App Cache</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: THEME.fontMono, lineHeight: 1 }}>
                    {cacheSize}<span style={{ fontSize: 12, color: THEME.textMuted }}>/{maxSize}</span>
                </div>
                {hitRate !== undefined && (
                    <div style={{ fontSize: 11, color: THEME.aurora, marginTop: 6, fontFamily: THEME.fontMono }}>
                        ↑ {hitRate}% hit rate
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  24. EXTENSION CARD
// ═══════════════════════════════════════════════════════════════════════════
export const ExtensionCard = ({ name, version, schema, description }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            background: hovered ? 'rgba(10,20,40,0.8)' : 'rgba(6,13,31,0.6)',
            borderRadius: 3, border: `1px solid ${hovered ? THEME.borderHot : THEME.border}`,
            padding: 14, display: 'flex', alignItems: 'center', gap: 12,
            transition: 'all 0.2s', cursor: 'default'
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 4,
                background: `${THEME.plasma}08`, color: THEME.plasma,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${THEME.plasma}20`
            }}>
                <Database size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: THEME.fontBody }}>{name}</span>
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 2, color: THEME.textMuted, fontFamily: THEME.fontMono }}>v{version}</span>
                </div>
                {description && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>}
            </div>
            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono, flexShrink: 0 }}>{schema}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  25. SEQUENCE USAGE BAR
// ═══════════════════════════════════════════════════════════════════════════
export const SequenceUsageBar = ({ name, usagePct, lastValue, maxValue, cycle }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontFamily: THEME.fontMono, color: THEME.textSub }}>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {cycle && <ChipBadge label="CYCLE" color={THEME.aurora} micro />}
                <span style={{
                    fontSize: 11, fontFamily: THEME.fontMono, fontWeight: 700,
                    color: usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.textMuted
                }}>{usagePct}%</span>
            </div>
        </div>
        <NeonProgressBar value={usagePct} max={100}
                         color={usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.aurora}
                         height={4} />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  26. STATUS DOT
// ═══════════════════════════════════════════════════════════════════════════
export const StatusDot = ({ status, size = 8, pulse = false }) => {
    injectKeyframes();
    const color = status === 'active' || status === 'ok' ? THEME.aurora
        : status === 'idle' ? THEME.warning
            : status === 'error' || status === 'critical' ? THEME.danger
                : THEME.textMuted;
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color,
            boxShadow: `0 0 8px ${color}80`,
            animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none'
        }} />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  27. COPY BUTTON
// ═══════════════════════════════════════════════════════════════════════════
export const CopyButton = ({ text, size = 'default' }) => {
    const [copied, copy] = useCopyToClipboard();
    const sm = size === 'small';
    return (
        <button onClick={() => copy(text)} style={{
            background: copied ? `${THEME.aurora}10` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? THEME.aurora + '40' : THEME.border}`,
            color: copied ? THEME.aurora : THEME.textMuted,
            padding: sm ? '3px 8px' : '5px 12px', borderRadius: 3,
            cursor: 'pointer', fontSize: sm ? 9 : 10,
            display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
            fontFamily: THEME.fontMono
        }}>
            {copied ? <Check size={sm ? 9 : 11} /> : <Copy size={sm ? 9 : 11} />}
            {copied ? 'COPIED' : 'COPY'}
        </button>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: CHIP BADGE — universal label chip
// ═══════════════════════════════════════════════════════════════════════════
export const ChipBadge = ({ label, color = THEME.plasma, micro = false }) => (
    <span style={{
        fontSize: micro ? 8 : 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: micro ? '0.5px' : '1px',
        padding: micro ? '1px 5px' : '2px 8px', borderRadius: 2,
        background: `${color}15`, color, border: `1px solid ${color}25`,
        fontFamily: THEME.fontDisplay, whiteSpace: 'nowrap'
    }}>{label}</span>
);

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: TREND CHIP — animated delta indicator
// ═══════════════════════════════════════════════════════════════════════════
export const TrendChip = ({ value, label }) => {
    const color = value > 0 ? THEME.aurora : value < 0 ? THEME.danger : THEME.textMuted;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: 10, fontWeight: 700, color, fontFamily: THEME.fontMono
        }}>
            {value > 0 ? <ArrowUpRight size={11} /> : value < 0 ? <ArrowDownRight size={11} /> : null}
            {value !== 0 && `${Math.abs(value)}%`}
            {label && <span style={{ color: THEME.textDim, fontWeight: 400 }}> {label}</span>}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: TERMINAL LINE — animated command output
// ═══════════════════════════════════════════════════════════════════════════
export const TerminalLine = ({ prompt = '$', command, output, color = THEME.plasma, delay = 0 }) => {
    injectKeyframes();
    return (
        <div style={{ fontFamily: THEME.fontMono, fontSize: 12, lineHeight: 1.8, animation: `fadeUp 0.4s ease ${delay}s backwards` }}>
            <div>
                <span style={{ color: THEME.aurora, marginRight: 6 }}>{prompt}</span>
                <span style={{ color: THEME.textMain }}>{command}</span>
            </div>
            {output && <div style={{ color: THEME.textMuted, marginLeft: 14 }}>{output}</div>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: PULSE RING — radial data indicator
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
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={color} strokeWidth={4} strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${color})` }}
                />
            </svg>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: size < 60 ? 11 : 14, fontWeight: 700, color, fontFamily: THEME.fontMono, lineHeight: 1 }}>{value}</div>
                {label && <div style={{ fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono, marginTop: 1 }}>{label}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: COMMAND PALETTE ITEM — action command entry
// ═══════════════════════════════════════════════════════════════════════════
export const CommandPaletteItem = ({ icon: Icon, label, description, shortcut, color = THEME.plasma, onClick }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderRadius: 3, background: hovered ? `${color}08` : 'transparent',
            border: `1px solid ${hovered ? color + '20' : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.15s'
        }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20` }}>
                <Icon size={14} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: THEME.textMain, fontFamily: THEME.fontBody, fontWeight: 500 }}>{label}</div>
                {description && <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 1 }}>{description}</div>}
            </div>
            {shortcut && (
                <kbd style={{
                    fontSize: 9, color: THEME.textDim, background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${THEME.border}`, padding: '2px 6px', borderRadius: 3,
                    fontFamily: THEME.fontMono
                }}>{shortcut}</kbd>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: NODE GRAPH ROW — dependency / relation visualizer
// ═══════════════════════════════════════════════════════════════════════════
export const NodeLink = ({ from, to, type = 'depends', latency, status = 'active' }) => {
    const color = status === 'active' ? THEME.aurora : status === 'degraded' ? THEME.warning : THEME.danger;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: THEME.fontMono, fontSize: 11 }}>
            <span style={{ color: THEME.textSub, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '3px 0 0 3px', border: `1px solid ${THEME.border}` }}>{from}</span>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', background: `${color}08`, border: `1px solid ${color}20`, borderLeft: 'none', borderRight: 'none', height: 29 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${color}, ${color}50)`, boxShadow: `0 0 4px ${color}` }} />
                {latency && <span style={{ fontSize: 8, color, marginLeft: 2 }}>{latency}ms</span>}
                <div style={{ width: 20, height: 1, background: `linear-gradient(90deg, ${color}50, ${color})`, boxShadow: `0 0 4px ${color}` }} />
                <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${color}` }} />
            </div>
            <span style={{ color: THEME.textSub, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '0 3px 3px 0', border: `1px solid ${THEME.border}`, borderLeft: 'none' }}>{to}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEW: HEAT CELL — for heatmap grids
// ═══════════════════════════════════════════════════════════════════════════
export const HeatCell = ({ value, max, color = THEME.plasma, size = 24, label }) => {
    const intensity = Math.min(value / (max || 1), 1);
    return (
        <div title={label || String(value)} style={{
            width: size, height: size, borderRadius: 2,
            background: intensity > 0 ? `rgba(${color === THEME.plasma ? '0,245,255' : color === THEME.danger ? '255,45,120' : '0,255,136'}, ${intensity * 0.8})` : 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,${intensity * 0.08 + 0.02})`,
            cursor: 'default', transition: 'all 0.3s',
            boxShadow: intensity > 0.7 ? `0 0 ${intensity * 12}px ${color}60` : 'none'
        }} />
    );
};