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

export const GlassCard = ({
                              children, title, subtitle, rightNode, style, loading, collapsible, onRefresh,
                              refreshing, accentColor, variant = 'default', showScanlines = false,
                              showHex = false, showGrid = false, corners = true, tag, glitch = false,
                              draggable = false, onClose, maximizable = false
                          }) => {
    useAdaptiveTheme();
    injectKeyframes();
    const [collapsed, setCollapsed] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [hovered, hoverProps] = useHover();
    const [isDragging, setIsDragging] = useState(false);
    const [glitching, setGlitching] = useState(false);
    const accent = accentColor || _AT.primary;

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
        default:  { bg: _AT.glass,         border: _AT.glassBorder },
        elevated: { bg: _AT.surfaceRaised,  border: _AT.glassBorderHover },
        ghost:    { bg: _AT.glass,          border: _AT.glassBorder },
        solid:    { bg: _AT.surface,        border: _AT.glassBorder },
        aurora:   { bg: 'rgba(0, 255, 136, 0.04)', border: 'rgba(0,255,136,0.12)' },
        danger:   { bg: 'rgba(255, 45, 120, 0.05)', border: 'rgba(255,45,120,0.15)' },
        neon:     { bg: 'rgba(123, 47, 255, 0.06)', border: 'rgba(123,47,255,0.18)' },
    };
    const v = variants[variant] || variants.default;

    return (
        <div {...hoverProps} style={{
            background: v.bg, backdropFilter: 'blur(24px) saturate(200%)',
            borderRadius: 4, border: `1px solid ${hovered ? _AT.glassBorderHover : v.border}`,
            boxShadow: _AT.shadowMd,
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


            {/* Header */}
            {(title || rightNode || onClose || maximizable) && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '13px 18px', borderBottom: `1px solid ${_AT.glassBorder}`,
                    position: 'relative', zIndex: 2,
                    cursor: draggable ? 'grab' : 'default',
                    background: _AT.surfaceHover
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {collapsible && (
                            <button onClick={() => setCollapsed(!collapsed)} style={{
                                background: 'none', border: 'none', color: _AT.textMuted, cursor: 'pointer', padding: 0,
                                display: 'flex', transition: 'transform 0.25s, color 0.2s',
                                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                            }}><ChevronDown size={13} /></button>
                        )}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{
                                    fontSize: 10, fontWeight: 700, color: hovered ? _AT.textMain : _AT.textMuted,
                                    fontFamily: _AT.fontDisplay, textTransform: 'uppercase',
                                    letterSpacing: '2.5px', margin: 0, transition: 'color 0.3s'
                                }}>{title}</h3>
                                {tag && <ChipBadge label={tag} color={accent} micro />}
                            </div>
                            {subtitle && <div style={{ fontSize: 10, color: _AT.textDim, marginTop: 2, fontFamily: _AT.fontMono }}>{subtitle}</div>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {onRefresh && <NanoButton onClick={onRefresh} icon={RefreshCw} spinning={refreshing} color={_AT.textMuted} tooltip="Refresh" />}
                        {maximizable && <NanoButton onClick={() => setMaximized(!maximized)} icon={maximized ? Minimize2 : Maximize2} color={_AT.textMuted} tooltip={maximized ? 'Minimize' : 'Maximize'} />}
                        {onClose && <NanoButton onClick={onClose} icon={X} color={_AT.textMuted} tooltip="Close" />}
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
                               icon: Icon, title, value, unit, subtitle, color = _AT.primary,
                               onClick, active, sparkData, trend, cacheBadge, badge, size = 'default',
                               delta, loading, comparison, target, pulseOnChange = true
                           }) => {
    useAdaptiveTheme();
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
                : _AT.surface,
            borderRadius: 4, border: `1px solid ${active || hovered ? color + '40' : _AT.glassBorder}`,
            padding: isCompact ? 14 : 20, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: isCompact ? 8 : 12,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'border-color 0.2s, transform 0.2s',
            transform: hovered && onClick ? 'translateY(-2px)' : 'none',
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: isCompact ? 36 : 44, height: isCompact ? 36 : 44,
                    borderRadius: 8, background: `${color}10`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}25`,
                    flexShrink: 0
                }}>
                    <Icon size={isCompact ? 17 : 21} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {cacheBadge && <ChipBadge label={cacheBadge} color={cacheBadge === 'HIT' ? _AT.success : _AT.warning} micro dot />}
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
                    fontSize: 9, color: _AT.textMuted, fontWeight: 700, fontFamily: _AT.fontDisplay,
                    textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5
                }}>{title}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    {loading ? (
                        <div style={{ width: 80, height: 28, borderRadius: 3, background: _AT.grid, animation: 'shimmer 1.5s infinite', backgroundSize: '400%' }} />
                    ) : (
                        <>
              <span style={{
                  fontSize: isCompact ? 24 : 30, fontWeight: 800,
                  color: _AT.textMain, fontFamily: _AT.fontMono,
                  letterSpacing: '-1.5px', lineHeight: 1,
                  animation: 'countUp 0.6s ease backwards',
                  textShadow: 'none'
              }}>{value}</span>
                            {unit && <span style={{ fontSize: 12, color: _AT.textMuted, fontFamily: _AT.fontMono }}>{unit}</span>}
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
                    <div style={{ fontSize: 10, color: _AT.textDim, marginTop: 5, fontFamily: _AT.fontMono }}>
                        {comparison}
                    </div>
                )}
                {subtitle && <div style={{ fontSize: 11, color: _AT.textMuted, marginTop: 4 }}>{subtitle}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. RESOURCE GAUGE — Arc reactor v2
// ═══════════════════════════════════════════════════════════════════════════
export const ResourceGauge = ({ label, value, color, thresholds, size = 160, subtitle, showHistory = false, historyData }) => {
