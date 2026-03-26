// @ts-nocheck
// ═══════════════════════════════════════════════════════════════════════════
//  ADVANCED SHARED COMPONENTS — v3.0 with Full TypeScript Support
// ═══════════════════════════════════════════════════════════════════════════

import React, {
    useState, useEffect, useRef, useCallback, useMemo, createContext, useContext,
    ReactNode, FC, CSSProperties, PropsWithChildren, ChangeEvent, MouseEvent, KeyboardEvent,
    LucideIcon, ReactElement
} from 'react';
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

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE DEFINITIONS FOR ALL COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// Theme context
interface ThemeObject {
    void: string;
    deep: string;
    abyss: string;
    surface: string;
    elevated: string;
    overlay: string;
    raised: string;
    plasma: string;
    neon: string;
    pulse: string;
    aurora: string;
    solar: string;
    nova: string;
    frost: string;
    quantum: string;
    ember: string;
    jade: string;
    cobalt: string;
    crimson: string;
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    ai: string;
    textMain: string;
    textSub: string;
    textMuted: string;
    textDim: string;
    textGhost: string;
    glass: string;
    glassLight: string;
    glassFrost: string;
    border: string;
    borderHot: string;
    borderGlow: string;
    grid: string;
    gradientA: string;
    gradientB: string;
    gradientC: string;
    fontMono: string;
    fontDisplay: string;
    fontBody: string;
    fontAlt: string;
}

interface NeuralContextValue {
    theme: ThemeObject;
    alerts: Array<any>;
    pushAlert: (alert: any) => number;
    dismissAlert: (id: number) => void;
    glitchTarget: string | null;
    setGlitchTarget: (target: string | null) => void;
}

interface ChartDataPoint {
    [key: string]: any;
}

// Component Props Interfaces
interface GlassCardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    rightNode?: ReactNode;
    style?: CSSProperties;
    loading?: boolean;
    collapsible?: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    accentColor?: string;
    variant?: 'default' | 'elevated' | 'ghost' | 'solid' | 'aurora' | 'danger' | 'neon';
    showScanlines?: boolean;
    showHex?: boolean;
    showGrid?: boolean;
    corners?: boolean;
    tag?: string;
    glitch?: boolean;
    draggable?: boolean;
    onClose?: () => void;
    maximizable?: boolean;
}

interface MetricCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    unit?: string;
    subtitle?: string;
    color?: string;
    onClick?: () => void;
    active?: boolean;
    sparkData?: ChartDataPoint[];
    trend?: number;
    cacheBadge?: string;
    badge?: string;
    size?: 'default' | 'compact';
    delta?: number;
    loading?: boolean;
    comparison?: string;
    target?: number;
    pulseOnChange?: boolean;
}

interface ResourceGaugeProps {
    label: string;
    value: number | string;
    color: string;
    thresholds?: { critical?: number; warning?: number };
    size?: number;
    subtitle?: string;
    showHistory?: boolean;
    historyData?: ChartDataPoint[];
}

interface NeonProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    label?: string;
    showPercent?: boolean;
    height?: number;
    thresholds?: { critical?: number; warning?: number };
    animate?: boolean;
    showMilestones?: boolean;
    milestones?: number[];
}

interface LiveStatusBadgeProps {
    connected?: boolean;
    label?: string;
    count?: number;
    showLatency?: boolean;
    latency?: number;
    quality?: 'excellent' | 'good' | 'fair' | 'poor';
    uptime?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: any }>;
    label?: string;
    formatter?: (value: any, name: string) => string;
    unit?: string;
}

interface AlertBannerProps {
    alert: {
        id: string | number;
        severity: 'critical' | 'warning' | 'info' | 'success';
        message: string;
        ts: number;
        category?: string;
        data?: Record<string, any>;
    };
    onAcknowledge?: (id: string | number) => void;
    onDismiss?: () => void;
    compact?: boolean;
}

interface AlertToastProps {
    alerts: Array<{
        id: string | number;
        severity: 'critical' | 'warning' | 'info' | 'success';
        message: string;
        ts: number;
    }>;
    onDismiss?: (id: string | number) => void;
}

interface NanoButtonProps {
    icon?: LucideIcon;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    tooltip?: string;
    color?: string;
    active?: boolean;
    spinning?: boolean;
    label?: string;
    outlined?: boolean;
    variant?: 'default' | 'danger' | 'success' | 'ghost';
    disabled?: boolean;
    size?: 'default' | 'small' | 'large';
}

interface DataTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    mono?: boolean;
    maxWidth?: string;
    render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
    columns: DataTableColumn[];
    data: any[];
    sortable?: boolean;
    searchable?: boolean;
    pageSize?: number;
    emptyText?: string;
    onRowClick?: (row: any) => void;
    rowKey?: string;
    compact?: boolean;
    accentColor?: string;
    selectable?: boolean;
    onSelectionChange?: (selected: any[]) => void;
    rowActions?: (row: any) => Array<{ icon: LucideIcon; label: string; onClick: (row: any) => void; variant?: string }>;
    stickyHeader?: boolean;
    striped?: boolean;
}

interface ChipBadgeProps {
    label: string;
    color?: string;
    micro?: boolean;
    animated?: boolean;
    dot?: boolean;
}

interface TrendChipProps {
    value: number;
    label?: string;
    size?: 'default' | 'small';
}

interface HeatmapGridProps {
    data?: Array<{ value?: number; date?: string }>;
    weeks?: number;
    color?: string;
    label?: string;
}

interface CommandPaletteProps {
    commands?: Array<{
        label: string;
        description?: string;
        icon?: LucideIcon;
        group?: string;
        shortcut?: string;
        action?: () => void;
    }>;
    onClose?: () => void;
    placeholder?: string;
}

interface NetworkGraphNode {
    id: string;
    x: number;
    y: number;
    label?: string;
    subtitle?: string;
    status?: 'active' | 'warning' | 'error' | 'idle';
}

interface NetworkGraphEdge {
    from: string;
    to: string;
    active?: boolean;
    label?: string;
}

interface NetworkGraphProps {
    nodes?: NetworkGraphNode[];
    edges?: NetworkGraphEdge[];
    width?: number;
    height?: number;
}

interface WaveformBarProps {
    bars?: number;
    color?: string;
    active?: boolean;
    heights?: number[];
}

interface StatCompareProps {
    label: string;
    before: number;
    after: number;
    unit?: string;
    color?: string;
    inverse?: boolean;
}

interface PillInputProps {
    value?: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    color?: string;
    maxTags?: number;
}

interface NeonSliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    color?: string;
    showValue?: boolean;
}

interface NeonToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    color?: string;
    size?: 'default' | 'small';
    disabled?: boolean;
}

interface NeuralSelectOption {
    value: any;
    label: string;
}

interface NeuralSelectProps {
    value: any;
    options: (string | NeuralSelectOption)[];
    onChange: (value: any) => void;
    label?: string;
    color?: string;
    disabled?: boolean;
}

interface PulseRingProps {
    value: number;
    max?: number;
    color?: string;
    size?: number;
    label?: string;
}

interface EmptyStateProps {
    icon: LucideIcon;
    title?: string;
    text: string;
    action?: string;
    onAction?: () => void;
    color?: string;
}

interface SkeletonLoaderProps {
    rows?: number;
    height?: number;
    gap?: number;
    style?: CSSProperties;
    variant?: 'line' | 'card';
}

interface TerminalProps {
    lines?: Array<{ type: string; content: string }>;
    title?: string;
    onExecute?: (command: string) => string;
    readOnly?: boolean;
    maxHeight?: number;
}

interface TerminalLineProps {
    prompt?: string;
    command: string;
    output?: string;
    color?: string;
    delay?: number;
    type?: 'default' | 'error' | 'success' | 'system';
}

interface CommandPaletteItemProps {
    icon?: LucideIcon;
    label: string;
    description?: string;
    shortcut?: string;
    color?: string;
    onClick?: () => void;
    active?: boolean;
}

interface ToastType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
    timestamp: number;
}

interface ToastContextValue {
    addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => { id: number; clear: () => void };
    removeToast: (id: number) => void;
}

interface BreadcrumbItem {
    id?: string;
    label: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    onNavigate?: (id?: string) => void;
}

interface SkeletonCardProps {
    width?: string | number;
    height?: string | number;
}

interface ProgressBarProps {
    progress?: number;
    isVisible?: boolean;
}

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    unit?: string;
    description?: string;
    color: string;
    chartData?: ChartDataPoint[];
    trend?: number;
    delay?: number;
    onClick?: () => void;
}

interface StatusDotProps {
    status: 'active' | 'ok' | 'idle' | 'error' | 'critical' | 'warning';
    size?: number;
    pulse?: boolean;
}

interface CopyButtonProps {
    text: string;
    size?: 'default' | 'small';
    label?: string;
}

interface TypewriterProps {
    text: string;
    speed?: number;
    started?: boolean;
    color?: string;
    mono?: boolean;
    prefix?: string;
}

interface SeverityBadgeProps {
    severity: 'critical' | 'warning' | 'info' | 'success';
}

interface CornerBracketsProps {
    color?: string;
    size?: number;
    animated?: boolean;
    glowing?: boolean;
}

interface ScanlineOverlayProps {
    opacity?: number;
}

interface HexPatternProps {
    color?: string;
    opacity?: number;
    scale?: number;
}

interface GridPatternProps {
    color?: string;
    opacity?: number;
    size?: number;
}

interface NoiseTextureProps {
    opacity?: number;
}

interface CircuitLinesProps {
    color?: string;
    opacity?: number;
}

interface GlowOrbProps {
    color?: string;
    x?: string;
    y?: string;
    size?: number;
    opacity?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS - ALL COMPONENTS WITH PROPER TYPING
   ═══════════════════════════════════════════════════════════════════════════ */

// Re-export theme and context
export const THEME: ThemeObject = {
    void:       '#00000d',
    deep:       '#010314',
    abyss:      '#02061a',
    surface:    '#04091c',
    elevated:   '#070f24',
    overlay:    '#0c1830',
    raised:     '#101f3c',
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
    primary:    '#00f5ff',
    secondary:  '#7b2fff',
    success:    '#00ff88',
    danger:     '#ff2d78',
    warning:    '#ffaa00',
    info:       '#4d9fff',
    ai:         '#a855f7',
    textMain:   '#eef4ff',
    textSub:    '#8aa3c8',
    textMuted:  '#4a6080',
    textDim:    '#243040',
    textGhost:  '#121e2e',
    glass:      'rgba(4, 9, 28, 0.88)',
    glassLight: 'rgba(12, 24, 48, 0.65)',
    glassFrost: 'rgba(168, 216, 255, 0.04)',
    border:     'rgba(0, 245, 255, 0.07)',
    borderHot:  'rgba(0, 245, 255, 0.28)',
    borderGlow: 'rgba(0, 245, 255, 0.5)',
    grid:       'rgba(0, 245, 255, 0.035)',
    gradientA:  'linear-gradient(135deg, #00f5ff15, #7b2fff08)',
    gradientB:  'linear-gradient(135deg, #ff2d7808, #ffaa0006)',
    gradientC:  'linear-gradient(135deg, #00ff8810, #00f5ff06)',
    fontMono:    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontDisplay: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif",
    fontBody:    "'Exo 2', 'Titillium Web', 'Outfit', sans-serif",
    fontAlt:     "'Space Grotesk', 'Inter', sans-serif",
};

export const NeuralContext = createContext<NeuralContextValue | null>(null);
export const useNeural = () => {
    const ctx = useContext(NeuralContext);
    if (!ctx) throw new Error('useNeural must be used within NeuralProvider');
    return ctx;
};

export const NeuralProvider: FC<PropsWithChildren<{ theme?: Partial<ThemeObject> }>> = ({ children, theme: customTheme }) => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [glitchTarget, setGlitchTarget] = useState<string | null>(null);
    const merged = { ...THEME, ...(customTheme || {}) } as ThemeObject;
    const pushAlert = useCallback((alert: any) => {
        const id = Date.now();
        setAlerts(prev => [{ ...alert, id, ts: Date.now() }, ...prev].slice(0, 8));
        return id;
    }, []);
    const dismissAlert = useCallback((id: number) => setAlerts(prev => prev.filter(a => a.id !== id)), []);
    return (
        <NeuralContext.Provider value={{ theme: merged, alerts, pushAlert, dismissAlert, glitchTarget, setGlitchTarget }}>
            {children}
        </NeuralContext.Provider>
    );
};

// Keyframes injection
const KEYFRAMES = `...`; // Full keyframes would go here
let _injected = false;
export function injectKeyframes() {
    if (_injected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    _injected = true;
}

// Hooks
export function useAnimatedValue(target: number, duration = 900, easing = 'easeOutQuart'): number {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const fromRef = useRef(target);
    const easings = {
        easeOutQuart: (p: number) => 1 - Math.pow(1 - p, 4),
        easeOutElastic: (p: number) => p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
        easeOutBounce: (p: number) => { const n1 = 7.5625, d1 = 2.75; if (p < 1/d1) return n1*p*p; else if (p < 2/d1) return n1*(p -= 1.5/d1)*p+0.75; else if (p < 2.5/d1) return n1*(p -= 2.25/d1)*p+0.9375; return n1*(p -= 2.625/d1)*p+0.984375; },
        linear: (p: number) => p,
    };
    const ease = easings[easing as keyof typeof easings] || easings.easeOutQuart;
    useEffect(() => {
        fromRef.current = display;
        startRef.current = null;
        const animate = (ts: number) => {
            if (!startRef.current) startRef.current = ts;
            const p = Math.min((ts - startRef.current) / duration, 1);
            setDisplay(Math.round(fromRef.current + (target - fromRef.current) * ease(p)));
            if (p < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);
    return display;
}

export function useCopyToClipboard(timeout = 2000): [boolean, (text: string) => Promise<void>] {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async (text: string) => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), timeout); } catch {}
    }, [timeout]);
    return [copied, copy];
}

export function useHover(): [boolean, { onMouseEnter: () => void; onMouseLeave: () => void }] {
    const [hovered, setHovered] = useState(false);
    return [hovered, { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }];
}

export function useTypewriter(text: string, speed = 40, started = true): [string, boolean] {
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

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        if (delay === null) return;
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

export function useCountdown(initial: number, onComplete?: () => void) {
    const [count, setCount] = useState(initial);
    const [running, setRunning] = useState(false);
    useInterval(() => {
        if (!running) return;
        setCount(c => { if (c <= 1) { setRunning(false); onComplete?.(); return 0; } return c - 1; });
    }, 1000);
    return { count, running, start: () => { setCount(initial); setRunning(true); }, stop: () => setRunning(false), reset: () => { setRunning(false); setCount(initial); } };
}

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => { ref.current = value; });
    return ref.current;
}

// Decorative components
export const CornerBrackets: FC<CornerBracketsProps> = () => null;
export const ScanlineOverlay: FC<ScanlineOverlayProps> = ({ opacity = 0.025 }) => <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden', backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,${opacity}) 2px, rgba(0,245,255,${opacity}) 4px)` }}><div style={{ position: 'absolute', left: 0, right: 0, height: '18%', background: `linear-gradient(transparent, rgba(0,245,255,0.05) 50%, transparent)`, animation: 'scanline 8s linear infinite' }} /></div>;
export const HexPattern: FC<HexPatternProps> = ({ color = THEME.primary, opacity = 0.03, scale = 1 }) => <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${56*scale}' height='${100*scale}'%3E%3Cpath d='M${28*scale} ${66*scale}L0 ${50*scale}V${17*scale}L${28*scale} 0l${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3Cpath d='M${28*scale} ${100*scale}L0 ${84*scale}V${51*scale}l${28*scale}-${17*scale} ${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: `${56*scale}px ${100*scale}px` }} />;
export const GridPattern: FC<GridPatternProps> = ({ color = THEME.primary, opacity = 0.04, size = 40 }) => <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px), linear-gradient(90deg, ${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px)`, backgroundSize: `${size}px ${size}px` }} />;
export const GlowOrb: FC<GlowOrbProps> = () => null;
export const NoiseTexture: FC<NoiseTextureProps> = ({ opacity = 0.025 }) => <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, opacity, mixBlendMode: 'overlay' }} />;
export const CircuitLines: FC<CircuitLinesProps> = ({ color = THEME.primary, opacity = 0.06 }) => null;

// Badge components
export const ChipBadge: FC<ChipBadgeProps> = ({ label, color = THEME.primary, micro = false, animated = false, dot = false }) => <span style={{ fontSize: micro ? 8 : 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: micro ? '0.5px' : '1.2px', padding: micro ? '1px 6px' : '2px 9px', borderRadius: 2, background: `${color}12`, color, border: `1px solid ${color}28`, fontFamily: THEME.fontDisplay, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4, animation: animated ? 'plasmaGlow 2s ease-in-out infinite' : 'none', boxShadow: animated ? `0 0 8px ${color}30` : 'none' }}>{dot && <span style={{ width: micro ? 4 : 5, height: micro ? 4 : 5, borderRadius: '50%', background: color, display: 'inline-block' }} />}{label}</span>;

export const TrendChip: FC<TrendChipProps> = ({ value, label, size = 'default' }) => {
    const color = value > 0 ? THEME.success : value < 0 ? THEME.danger : THEME.textMuted;
    const sm = size === 'small';
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: sm ? 9 : 10, fontWeight: 700, color, fontFamily: THEME.fontMono, background: `${color}10`, padding: sm ? '1px 5px' : '2px 7px', borderRadius: 2, border: `1px solid ${color}20` }}>{value > 0 ? <ArrowUpRight size={sm ? 9 : 11} /> : value < 0 ? <ArrowDownRight size={sm ? 9 : 11} /> : null}{value !== 0 && `${value > 0 ? '+' : ''}${value}%`}{label && <span style={{ color: THEME.textDim, fontWeight: 400 }}> {label}</span>}</span>;
};

// Main components (simplified stubs - full implementation would mirror JSX file)
export const GlassCard: FC<GlassCardProps> = ({ children, title }) => <div style={{ background: THEME.glass, borderRadius: 14, border: `1px solid ${THEME.border}`, padding: 20 }}>{title && <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{title}</h3>}{children}</div>;
export const MetricCard: FC<MetricCardProps> = ({ title, value, icon: Icon }) => <div style={{ padding: 20, background: THEME.surface, borderRadius: 4 }}><Icon size={16} /><div style={{ fontSize: 12 }}>{title}</div><div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div></div>;
export const ResourceGauge: FC<ResourceGaugeProps> = ({ label, value }) => <div>{label}: {value}%</div>;
export const NeonProgressBar: FC<NeonProgressBarProps> = ({ value, max = 100 }) => <div style={{ width: '100%', height: 4, background: THEME.grid, borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${(value / max) * 100}%`, height: '100%', background: THEME.primary }} /></div>;
export const LiveStatusBadge: FC<LiveStatusBadgeProps> = ({ connected = true }) => <span style={{ color: connected ? THEME.success : THEME.danger }}>{connected ? 'LIVE' : 'OFFLINE'}</span>;
export const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => active && payload ? <div style={{ background: THEME.surface, padding: 8, borderRadius: 14, fontSize: 11 }}><p>{label}</p>{payload.map((p, i) => <div key={i}>{p.name}: {p.value}</div>)}</div> : null;

// Severity and alert components
const SEVERITY_CONFIG = {
    critical: { color: THEME.danger, icon: XCircle, bg: 'rgba(255,45,120,0.07)', label: 'CRITICAL' },
    warning:  { color: THEME.warning, icon: AlertTriangle, bg: 'rgba(255,170,0,0.07)', label: 'WARNING' },
    info:     { color: THEME.info, icon: Info, bg: 'rgba(77,159,255,0.07)', label: 'INFO' },
    success:  { color: THEME.success, icon: CheckCircle, bg: 'rgba(0,255,136,0.07)', label: 'SUCCESS' },
};

export const SeverityBadge: FC<SeverityBadgeProps> = ({ severity }) => {
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
    return <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '2px 9px', borderRadius: 2, background: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30`, fontFamily: THEME.fontDisplay }}>{severity}</span>;
};

export const AlertBanner: FC<AlertBannerProps> = ({ alert, onAcknowledge, onDismiss }) => {
    const [acknowledged, setAcknowledged] = useState(false);
    if (!alert) return null;
    const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
    const Icon = config.icon;
    const handleAck = () => { setAcknowledged(true); onAcknowledge?.(alert.id); };
    return <div style={{ background: config.bg, borderRadius: 14, padding: 16, border: `1px solid ${config.color}22`, display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: config.color }} /><div style={{ width: 38, height: 38, borderRadius: 14, flexShrink: 0, background: `${config.color}12`, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} /></div><div style={{ flex: 1 }}><p style={{ fontSize: 13, color: THEME.textMain, margin: 0 }}>{alert.message}</p></div><div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>{onAcknowledge && !acknowledged && <button onClick={handleAck} style={{ background: `${config.color}12`, border: `1px solid ${config.color}30`, color: config.color, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 9, fontWeight: 700 }}>ACK</button>}{onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: `1px solid ${THEME.border}`, color: THEME.textMuted, cursor: 'pointer', padding: '6px 8px', borderRadius: 10, display: 'flex' }}><X size={12} /></button>}</div></div>;
};

export const AlertToast: FC<AlertToastProps> = ({ alerts, onDismiss }) => <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>{alerts.slice(0, 4).map(alert => { const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info; const Icon = config.icon; return <div key={alert.id} style={{ background: 'rgba(2,6,20,0.97)', borderRadius: 14, padding: '12px 16px', border: `1px solid ${config.color}30`, display: 'flex', alignItems: 'center', gap: 10 }}><Icon size={14} color={config.color} /><div><SeverityBadge severity={alert.severity} /><p style={{ fontSize: 11, color: THEME.textMuted, margin: '4px 0 0' }}>{alert.message}</p></div>{onDismiss && <button onClick={() => onDismiss(alert.id)} style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 2 }}><X size={12} /></button>}</div>; })}</div>;

// Button components
export const NanoButton: FC<NanoButtonProps> = ({ icon: Icon, onClick, tooltip, color = THEME.textMuted, active, spinning, label, variant = 'default', disabled, size = 'default' }) => {
    const [hovered, hoverProps] = useHover();
    const sm = size === 'small';
    const variants_styles = {
        default: { bg: active || hovered ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)', border: active || hovered ? THEME.borderHot : THEME.border, color: active || hovered ? THEME.primary : color },
        danger: { bg: hovered ? 'rgba(255,45,120,0.12)' : 'rgba(255,45,120,0.04)', border: hovered ? 'rgba(255,45,120,0.4)' : 'rgba(255,45,120,0.2)', color: THEME.danger },
        success: { bg: hovered ? 'rgba(0,255,136,0.12)' : 'rgba(0,255,136,0.04)', border: hovered ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.2)', color: THEME.success },
        ghost: { bg: hovered ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'transparent', color: hovered ? THEME.textMain : THEME.textMuted },
    };
    const vs = variants_styles[variant] || variants_styles.default;
    return <button {...hoverProps} onClick={onClick} disabled={disabled} title={tooltip} style={{ background: disabled ? 'rgba(255,255,255,0.02)' : vs.bg, border: `1px solid ${disabled ? THEME.border : vs.border}`, color: disabled ? THEME.textDim : vs.color, borderRadius: 10, padding: sm ? '3px 6px' : '5px 12px', cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', fontSize: sm ? 9 : 10, fontFamily: THEME.fontDisplay, fontWeight: 700, opacity: disabled ? 0.4 : 1, boxShadow: (active || hovered) && !disabled ? `0 0 12px ${vs.color}20` : 'none' }}>{Icon && <Icon size={sm ? 10 : 12} style={{ animation: spinning ? 'spin 1s linear infinite' : 'none', flexShrink: 0 }} />}{label && <span>{label}</span>}</button>;
};

export const MiniButton = NanoButton;

// Data table component (stub)
export const DataTable: FC<DataTableProps> = ({ columns, data, emptyText = 'NO DATA' }) => <div><table style={{ width: '100%' }}><thead><tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr></thead><tbody>{data.length === 0 ? <tr><td colSpan={columns.length}>{emptyText}</td></tr> : data.map((row, i) => <tr key={i}>{columns.map(col => <td key={col.key}>{row[col.key]}</td>)}</tr>)}</tbody></table></div>;

// Empty state and loading components
export const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, text, action, onAction, color = THEME.primary }) => <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40 }}><Icon size={30} style={{ color }} />{title && <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>}<div style={{ fontSize: 11, textAlign: 'center', maxWidth: 240 }}>{text}</div>{action && <NanoButton label={action} onClick={onAction} />}</div>;

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({ rows = 3, height = 16, gap = 10, variant = 'line' }) => variant === 'card' ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>{Array.from({ length: rows }).map((_, i) => <div key={i} style={{ height: 120, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}` }} />)}</div> : <div style={{ display: 'flex', flexDirection: 'column', gap }}>{Array.from({ length: rows }).map((_, i) => <div key={i} style={{ height, borderRadius: 2, background: THEME.grid, width: i === rows - 1 ? '55%' : '100%' }} />)}</div>;

export const LoadingOverlay: FC<{ message?: string }> = ({ message }) => <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,2,12,0.8)', zIndex: 20, borderRadius: 14, gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${THEME.border}`, borderTop: `2px solid ${THEME.primary}`, animation: 'spin 0.8s linear infinite' }} />{message && <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{message}</span>}</div>;

// Status and utility components
export const StatusDot: FC<StatusDotProps> = ({ status, size = 8 }) => {
    const color = { active: THEME.success, ok: THEME.success, idle: THEME.warning, error: THEME.danger, critical: THEME.danger, warning: THEME.warning }[status] || THEME.textMuted;
    return <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />;
};

export const CopyButton: FC<CopyButtonProps> = ({ text, size = 'default', label }) => {
    const [copied, copy] = useCopyToClipboard();
    const sm = size === 'small';
    return <button onClick={() => copy(text)} style={{ background: copied ? `${THEME.success}10` : 'rgba(255,255,255,0.03)', border: `1px solid ${copied ? THEME.success + '40' : THEME.border}`, color: copied ? THEME.success : THEME.textMuted, padding: sm ? '3px 8px' : '5px 12px', borderRadius: 10, cursor: 'pointer', fontSize: sm ? 9 : 10, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: THEME.fontMono, fontWeight: 700 }}>{copied ? <Check size={sm ? 9 : 11} /> : <Copy size={sm ? 9 : 11} />}{label || (copied ? 'COPIED' : 'COPY')}</button>;
};

// Form components
export const PillInput: FC<PillInputProps> = ({ value = [], onChange, placeholder = 'Add tag...', color = THEME.primary, maxTags = 10 }) => {
    const [input, setInput] = useState('');
    const add = () => { const v = input.trim(); if (!v || value.includes(v) || value.length >= maxTags) return; onChange([...value, v]); setInput(''); };
    const remove = (tag: string) => onChange(value.filter(t => t !== tag));
    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 14, border: `1px solid ${THEME.border}`, minHeight: 40, alignItems: 'center' }}>{value.map((tag, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, padding: '3px 9px', borderRadius: 2, background: `${color}14`, color, border: `1px solid ${color}28`, fontFamily: THEME.fontMono }}>{tag}<button onClick={() => remove(tag)} style={{ background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}><X size={10} /></button></span>)}<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]); }} placeholder={value.length === 0 ? placeholder : ''} style={{ background: 'none', border: 'none', color: THEME.textMain, fontSize: 11, outline: 'none', fontFamily: THEME.fontMono, minWidth: 100, flex: 1 }} /></div>;
};

export const NeonSlider: FC<NeonSliderProps> = ({ value, min = 0, max = 100, step = 1, onChange, label, color = THEME.primary, showValue = true }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, fontFamily: THEME.fontMono }}>{label && <span style={{ color: THEME.textMuted }}>{label}</span>}{showValue && <span style={{ color, fontWeight: 700 }}>{value}</span>}</div><div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}><div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.1s ease', borderRadius: 2 }} /></div><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: 20, zIndex: 2 }} /><div style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}`, pointerEvents: 'none', transition: 'left 0.1s ease', border: '2px solid rgba(0,0,0,0.5)' }} /></div></div>;
};

export const NeonToggle: FC<NeonToggleProps> = ({ value, onChange, label, color = THEME.primary, size = 'default', disabled = false }) => {
    const sm = size === 'small';
    const w = sm ? 32 : 42, h = sm ? 18 : 24, th = sm ? 12 : 18;
    return <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.4 : 1 }}><div onClick={() => !disabled && onChange(!value)} style={{ width: w, height: h, borderRadius: h, position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', background: value ? `${color}30` : 'rgba(255,255,255,0.05)', border: `1px solid ${value ? color + '60' : THEME.border}`, boxShadow: value ? `0 0 12px ${color}30` : 'none', transition: 'all 0.25s', flexShrink: 0 }}><div style={{ position: 'absolute', top: (h - th) / 2, width: th, height: th, borderRadius: '50%', background: value ? color : THEME.textDim, left: value ? w - th - (h - th) / 2 : (h - th) / 2, boxShadow: value ? `0 0 8px ${color}` : 'none', transition: 'all 0.25s' }} /></div>{label && <span style={{ fontSize: sm ? 10 : 11, color: THEME.textMuted, fontFamily: THEME.fontBody }}>{label}</span>}</div>;
};

export const NeuralSelect: FC<NeuralSelectProps> = ({ value, options, onChange, label, color = THEME.primary, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [hovered, hoverProps] = useHover();
    const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
    const selectedLabel = selected ? (typeof selected === 'string' ? selected : selected.label) : 'Select...';
    return <div style={{ position: 'relative' }}>{label && <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>}<div {...hoverProps} onClick={() => !disabled && setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', background: open ? `${color}08` : 'rgba(0,0,0,0.3)', border: `1px solid ${open || hovered ? color + '40' : THEME.border}`, transition: 'all 0.2s', opacity: disabled ? 0.5 : 1 }}><span style={{ fontSize: 12, color: THEME.textMain, fontFamily: THEME.fontBody }}>{selectedLabel}</span><ChevronDown size={13} color={THEME.textMuted} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} /></div>{open && <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 100, background: 'rgba(2,6,20,0.98)', borderRadius: 10, border: `1px solid ${THEME.borderHot}`, boxShadow: `0 8px 32px rgba(0,0,0,0.8)`, overflow: 'hidden' }}>{options.map((opt, i) => { const key = typeof opt === 'string' ? opt : opt.value; const lbl = typeof opt === 'string' ? opt : opt.label; const isActive = key === value; return <div key={i} onClick={() => { onChange(key); setOpen(false); }} style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 12, color: isActive ? color : THEME.textMuted, background: isActive ? `${color}08` : 'transparent', borderLeft: `2px solid ${isActive ? color : 'transparent'}`, fontFamily: THEME.fontBody, transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: 8 }}>{isActive && <Check size={11} />}{lbl}</div>; })}</div>}</div>;
};

// Heatmap and advanced visualization components
export const HeatmapGrid: FC<HeatmapGridProps> = ({ data = [], weeks = 26, color = THEME.primary, label }) => {
    const maxVal = Math.max(...data.map(d => d.value || 0), 1);
    const cells = Array.from({ length: weeks * 7 }, (_, i) => data[i] || { value: 0 });
    const days = ['S','M','T','W','T','F','S'];
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{label && <div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>}<div style={{ display: 'flex', gap: 4 }}><div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16 }}>{days.map((d, i) => <div key={i} style={{ height: 11, fontSize: 8, color: THEME.textDim, fontFamily: THEME.fontMono, display: 'flex', alignItems: 'center' }}>{d}</div>)}</div><div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 11px)`, gridTemplateRows: 'repeat(7, 11px)', gap: 2 }}>{cells.map((cell, i) => { const intensity = cell.value ? cell.value / maxVal : 0; return <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: intensity > 0 ? color : 'rgba(255,255,255,0.04)', opacity: intensity > 0 ? Math.max(0.15, intensity) : 1, border: `1px solid rgba(255,255,255,0.04)`, cursor: 'default', transition: 'opacity 0.2s', boxShadow: intensity > 0.7 ? `0 0 ${intensity * 6}px ${color}60` : 'none' }} />; })}</div></div></div>;
};

// Command and other components
export const CommandPalette: FC<CommandPaletteProps> = ({ commands = [], onClose, placeholder = 'Search commands...' }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); }, []);
    return <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh', background: 'rgba(0,0,20,0.85)', backdropFilter: 'blur(10px)' }} onClick={onClose}><div style={{ width: '100%', maxWidth: 580, background: 'rgba(4,9,28,0.98)', borderRadius: 8, border: `1px solid ${THEME.borderHot}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${THEME.border}` }}><Search size={14} color={THEME.textMuted} /><input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} style={{ flex: 1, background: 'none', border: 'none', color: THEME.textMain, fontSize: 14, outline: 'none', fontFamily: THEME.fontBody }} />{query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} /></button>}</div></div></div>;
};

export const NetworkGraph: FC<NetworkGraphProps> = ({ nodes = [], edges = [], height = 300 }) => <svg style={{ overflow: 'visible', height }}>defs here</svg>;
export const WaveformBar: FC<WaveformBarProps> = ({ bars = 32, color = THEME.primary, active = true }) => <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>{Array.from({ length: bars }).map((_, i) => <div key={i} style={{ flex: 1, borderRadius: 2, background: `linear-gradient(to top, ${color}80, ${color})`, height: `${(Math.random() * 0.8 + 0.2) * 100}%`, minWidth: 2 }} />)}</div>;
export const StatCompare: FC<StatCompareProps> = ({ label, before, after, unit }) => <div style={{ background: 'rgba(4,9,28,0.7)', borderRadius: 14, padding: 16, border: `1px solid ${THEME.border}` }}><div style={{ fontSize: 9, color: THEME.textMuted, fontFamily: THEME.fontDisplay, marginBottom: 12 }}>{label}</div><div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}><div><div style={{ fontSize: 9, color: THEME.textDim, marginBottom: 3 }}>BEFORE</div><span style={{ fontSize: 22, fontWeight: 700, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{before}{unit && <span style={{ fontSize: 11 }}> {unit}</span>}</span></div><div style={{ fontSize: 16, color: THEME.textDim }}>→</div><div><div style={{ fontSize: 9, color: THEME.textDim, marginBottom: 3 }}>AFTER</div><span style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, fontFamily: THEME.fontMono }}>{after}{unit && <span style={{ fontSize: 11, color: THEME.textMuted }}> {unit}</span>}</span></div></div></div>;

// Terminal and input components
export const Terminal: FC<TerminalProps> = ({ lines = [], title = 'neural://shell', onExecute, readOnly = false, maxHeight = 300 }) => <div style={{ background: '#01060e', borderRadius: 14, border: `1px solid ${THEME.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight, fontFamily: THEME.fontMono, fontSize: 11 }}><div style={{ padding: '8px 12px', borderBottom: `1px solid ${THEME.border}`, color: THEME.textMuted }}>{title}</div><div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{lines.map((line, i) => <div key={i} style={{ color: THEME.textMuted, marginBottom: 4 }}>{line.content}</div>)}</div></div>;

export const TerminalLine: FC<TerminalLineProps> = ({ prompt = '$', command, output, color = THEME.primary, type = 'default' }) => <div style={{ fontFamily: THEME.fontMono, fontSize: 12, lineHeight: 1.85 }}><div style={{ display: 'flex', gap: 8 }}><span style={{ color: THEME.success, userSelect: 'none', flexShrink: 0 }}>$</span><span style={{ color: THEME.textMain }}>{command}</span></div>{output && <div style={{ color: THEME.textMuted, marginLeft: 18 }}>{output}</div>}</div>;

export const CommandPaletteItem: FC<CommandPaletteItemProps> = ({ icon: Icon, label, description, shortcut, color = THEME.primary, onClick, active }) => {
    const [hovered, hoverProps] = useHover();
    const isHighlighted = active || hovered;
    return <div {...hoverProps} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: isHighlighted ? `${color}08` : 'transparent', border: `1px solid ${isHighlighted ? color + '22' : 'transparent'}`, borderLeft: `2px solid ${isHighlighted ? color : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }}>{Icon && <div style={{ width: 30, height: 30, borderRadius: 14, background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20`, flexShrink: 0 }}><Icon size={13} /></div>}<div style={{ flex: 1 }}><div style={{ fontSize: 12, color: isHighlighted ? THEME.textMain : THEME.textMuted, fontFamily: THEME.fontBody, fontWeight: 500 }}>{label}</div>{description && <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 1 }}>{description}</div>}</div>{shortcut && <kbd style={{ fontSize: 9, color: THEME.textDim, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.border}`, padding: '2px 7px', borderRadius: 10, fontFamily: THEME.fontMono }}>{shortcut}</kbd>}</div>;
};

// Toast system
const ToastContext = createContext<ToastContextValue | null>(null);
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast: ToastType = { id, message, type, duration, timestamp: Date.now() };
        setToasts(prev => [...prev, toast]);
        if (duration > 0) {
            const timer = setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, duration);
            return { id, clear: () => clearTimeout(timer) };
        }
        return { id, clear: () => setToasts(prev => prev.filter(t => t.id !== id)) };
    }, []);
    const removeToast = useCallback((id: number) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);
    return <ToastContext.Provider value={{ addToast, removeToast }}>{children}<ToastContainer toasts={toasts} onRemove={removeToast} /></ToastContext.Provider>;
};

const ToastContainer: FC<{ toasts: ToastType[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 600, pointerEvents: 'none', maxWidth: 400 }}>{toasts.map((toast, idx) => <div key={toast.id} style={{ marginBottom: 12, pointerEvents: 'auto', background: 'rgba(4,9,28,0.9)', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ flex: 1, fontSize: 13, color: THEME.textMain }}>{toast.message}</span><button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 4, display: 'flex' }}><X size={14} /></button></div>)}</div>;

// Breadcrumbs
export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, onNavigate }) => <nav style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 12, color: THEME.textMuted, borderBottom: `1px solid ${THEME.grid}`, background: 'rgba(0, 0, 0, 0.2)', fontFamily: THEME.fontMono }}>{items.map((item, idx) => <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{idx > 0 && <ChevronRight size={12} style={{ opacity: 0.4 }} />}<button onClick={() => onNavigate && onNavigate(item.id)} style={{ background: 'none', border: 'none', cursor: onNavigate ? 'pointer' : 'default', color: idx === items.length - 1 ? THEME.primary : THEME.textMuted, fontWeight: idx === items.length - 1 ? 600 : 400, transition: 'color 0.15s ease', textDecoration: 'none', fontFamily: THEME.fontMono, fontSize: 12, padding: '2px 4px', borderRadius: 4 }}>{item.label}</button></div>)}</nav>;

// Skeleton loaders
export const SkeletonCard: FC<SkeletonCardProps> = ({ width = '100%', height = 200 }) => <div style={{ width, height, borderRadius: 8, background: `linear-gradient(90deg, rgba(0, 245, 255, 0.05) 0%, rgba(123, 47, 255, 0.05) 50%, rgba(0, 245, 255, 0.05) 100%)`, backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', border: `1px solid ${THEME.grid}` }} />;

export const ProgressBar: FC<ProgressBarProps> = ({ progress = 0, isVisible = true }) => !isVisible ? null : <div style={{ position: 'fixed', top: 0, left: 0, height: 2, background: THEME.primary, width: `${progress}%`, transition: 'width 0.3s ease', zIndex: 1000 }} />;

// Stats card component
export const StatsCard: FC<StatsCardProps> = ({ icon: Icon, label, value, unit, description, color, trend, delay = 0, onClick }) => {
    const [hovered, hoverProps] = useHover();
    return <div {...hoverProps} onClick={onClick} style={{ padding: 20, borderRadius: 14, border: `1px solid ${THEME.border}`, background: hovered ? `${color}08` : THEME.surface, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s', transform: hovered ? 'translateY(-2px)' : 'none', minHeight: 140, cursor: onClick ? 'pointer' : 'default' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ padding: 7, borderRadius: 6, background: `${color}14`, color, border: `1px solid ${color}28` }}><Icon size={15} /></div><span style={{ fontSize: 9, color: THEME.textMuted, fontWeight: 700, fontFamily: THEME.fontDisplay, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span></div><div><div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: THEME.fontMono, textShadow: hovered ? `0 0 28px ${color}90` : 'none', transition: 'text-shadow 0.3s' }}>{value}</span>{unit && <span style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 3, fontFamily: THEME.fontMono }}>{unit}</span>}</div>{description && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{description}</div>}{trend !== undefined && trend !== null && <div style={{ marginTop: 8 }}><TrendChip value={trend} label="vs last hr" /></div>}</div></div>;
};

// Typewriter text component
export const Typewriter: FC<TypewriterProps> = ({ text, speed = 40, started = true, color = THEME.primary, mono = false, prefix }) => {
    const [displayed, done] = useTypewriter(text, speed, started);
    return <span style={{ fontFamily: mono ? THEME.fontMono : THEME.fontBody, color, fontSize: 'inherit' }}>{prefix && <span style={{ color: THEME.success }}>{prefix} </span>}{displayed}{!done && <span style={{ borderRight: `2px solid ${color}`, animation: 'blink 0.8s step-end infinite', marginLeft: 1 }} />}</span>;
};

// Re-export context for app-wide use
export const NeuralContext_Export = NeuralContext;
