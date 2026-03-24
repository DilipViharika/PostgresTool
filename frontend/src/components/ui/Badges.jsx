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

export const ChipBadge = ({ label, color = _AT.primary, micro = false, animated = false, dot = false }) => (
    <span style={{
        fontSize: micro ? 8 : 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: micro ? '0.5px' : '1.2px',
        padding: micro ? '1px 6px' : '2px 9px', borderRadius: 2,
        background: `${color}12`, color, border: `1px solid ${color}28`,
        fontFamily: _AT.fontDisplay, whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        animation: animated ? 'plasmaGlow 2s ease-in-out infinite' : 'none',
        boxShadow: animated ? `0 0 8px ${color}30` : 'none',
    }}>
    {dot && <span style={{ width: micro ? 4 : 5, height: micro ? 4 : 5, borderRadius: '50%', background: color, display: 'inline-block' }} />}
        {label}
  </span>
);

export const TrendChip = ({ value, label, size = 'default' }) => {
    const color = value > 0 ? _AT.success : value < 0 ? _AT.danger : _AT.textMuted;
    const sm = size === 'small';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: sm ? 9 : 10, fontWeight: 700, color, fontFamily: _AT.fontMono,
            background: `${color}10`, padding: sm ? '1px 5px' : '2px 7px', borderRadius: 2,
            border: `1px solid ${color}20`
        }}>
      {value > 0 ? <ArrowUpRight size={sm ? 9 : 11} /> : value < 0 ? <ArrowDownRight size={sm ? 9 : 11} /> : null}
            {value !== 0 && `${value > 0 ? '+' : ''}${value}%`}
            {label && <span style={{ color: _AT.textDim, fontWeight: 400 }}> {label}</span>}
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
    useAdaptiveTheme();
    injectKeyframes();
    const numValue = Number(value) || 0;
    const resolvedColor = thresholds
        ? numValue >= (thresholds.critical || 90) ? _AT.danger
            : numValue >= (thresholds.warning || 70) ? _AT.warning : color
        : color;

    const data = [{ value: numValue, fill: resolvedColor }];

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', height: size, width: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="60%" outerRadius="88%" barSize={10} data={data} startAngle={210} endAngle={-30}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background={{ fill: _AT.grid }} clockWise dataKey="value" cornerRadius={5}>
                            {data.map((_, i) => <Cell key={i} fill={resolvedColor} />)}
                        </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>

                <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{
                        fontSize: numValue >= 100 ? 18 : 24, fontWeight: 800, color: resolvedColor,
                        fontFamily: _AT.fontMono, lineHeight: 1,
                        animation: 'countUp 0.8s ease backwards'
                    }}>{numValue}<span style={{ fontSize: 12 }}>%</span></div>
                    <div style={{ fontSize: 9, color: _AT.textMuted, textTransform: 'uppercase', marginTop: 3, fontFamily: _AT.fontDisplay, letterSpacing: '1px' }}>{label}</div>
                    {subtitle && <div style={{ fontSize: 8, color: _AT.textDim, marginTop: 2, fontFamily: _AT.fontMono }}>{subtitle}</div>}
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
                                    value, max, color = _AT.primary, label, showPercent = false, height = 6,
                                    thresholds, animate = true, showMilestones = false, milestones = []
                                }) => {
    const percent = Math.min((value / (max || 1)) * 100, 100);
    const resolvedColor = thresholds
        ? percent >= (thresholds.critical || 90) ? _AT.danger
            : percent >= (thresholds.warning || 70) ? _AT.warning : color
        : color;

    return (
        <div>
            {(label || showPercent) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>
                    {label && <span style={{ letterSpacing: '0.5px' }}>{label}</span>}
                    {showPercent && <span style={{ color: resolvedColor, fontWeight: 700 }}>{percent.toFixed(1)}%</span>}
                </div>
            )}
            <div style={{
                width: '100%', height, background: _AT.grid,
                borderRadius: 3, overflow: 'hidden', position: 'relative',
                border: `1px solid ${_AT.grid}`
            }}>
                <div style={{
                    width: `${percent}%`, height: '100%',
                    background: resolvedColor,
                    borderRadius: 3,
                    transition: animate ? 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                }} />
                {/* Milestones */}
                {showMilestones && milestones.map((m, i) => (
                    <div key={i} style={{
                        position: 'absolute', left: `${m}%`, top: -4, bottom: -4, width: 1,
                        background: _AT.textDim, opacity: 0.4
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
    const color = connected ? _AT.success : _AT.danger;
    const qualityColors = { excellent: _AT.success, good: _AT.primary, fair: _AT.warning, poor: _AT.danger };
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
            <span style={{ color: qColor, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', fontFamily: _AT.fontDisplay }}>
        {label || (connected ? 'LIVE' : 'OFFLINE')}
      </span>
            {count !== undefined && (
                <span style={{ fontSize: 10, background: `${qColor}14`, color: qColor, padding: '1px 7px', borderRadius: 2, fontFamily: _AT.fontMono, fontWeight: 700, border: `1px solid ${qColor}20` }}>
          {count}
        </span>
            )}
            {showLatency && latency !== undefined && (
                <span style={{ fontSize: 9, color: latency > 100 ? _AT.warning : _AT.textMuted, fontFamily: _AT.fontMono }}>
          {latency}ms
        </span>
            )}
            {uptime && <span style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono }}>{uptime}</span>}
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
            backgroundColor: 'rgba(1, 5, 16, 0.98)', border: `1px solid ${_AT.glassBorderHot}`,
            borderRadius: 4, padding: '12px 16px',
            boxShadow: `0 4px 24px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(24px)', maxWidth: 260, position: 'relative', overflow: 'hidden'
        }}>
            {label && <p style={{ color: _AT.textMuted, fontSize: 9, marginBottom: 10, fontFamily: _AT.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: entry.color }} />
                    <span style={{ fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>{entry.name}:</span>
                    <span style={{ fontSize: 13, color: _AT.textMain, fontWeight: 800, fontFamily: _AT.fontMono, marginLeft: 'auto' }}>
            {formatter ? formatter(entry.value, entry.name) : (typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value)}
                        {unit && <span style={{ fontSize: 10, color: _AT.textMuted }}> {unit}</span>}
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
    critical: { color: _AT.danger,   icon: XCircle,       bg: 'rgba(255,45,120,0.07)',   label: 'CRITICAL' },
    warning:  { color: _AT.warning,  icon: AlertTriangle,  bg: 'rgba(255,170,0,0.07)',    label: 'WARNING'  },
    info:     { color: _AT.info,     icon: Info,           bg: 'rgba(77,159,255,0.07)',   label: 'INFO'     },
    success:  { color: _AT.success,   icon: CheckCircle,    bg: 'rgba(0,255,136,0.07)',    label: 'SUCCESS'  },
};

export const SeverityBadge = ({ severity }) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
    return (
        <span style={{
            fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '2px 9px', borderRadius: 2,
            background: `${config.color}15`, color: config.color,
            border: `1px solid ${config.color}30`, fontFamily: _AT.fontDisplay
        }}>{severity}</span>
    );
};

