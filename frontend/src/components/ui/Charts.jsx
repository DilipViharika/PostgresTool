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
                <span style={{ color: _AT.textMuted, flex: 1, fontSize: 12, fontFamily: _AT.fontBody }}>{alert.message}</span>
                <span style={{ fontSize: 9, color: _AT.textMuted, fontFamily: _AT.fontMono }}>{new Date(alert.ts).toLocaleTimeString()}</span>
                {onAcknowledge && !acknowledged && (
                    <button onClick={handleAck} style={{ background: `${config.color}12`, border: `1px solid ${config.color}30`, color: config.color, padding: '2px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: _AT.fontDisplay, letterSpacing: '1px' }}>ACK</button>
                )}
                {acknowledged && <CheckCircle size={12} color={_AT.success} />}
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
                    {alert.category && <span style={{ fontSize: 9, color: _AT.textMuted, fontFamily: _AT.fontMono, textTransform: 'uppercase', letterSpacing: '1px' }}>{alert.category}</span>}
                    <span style={{ fontSize: 9, color: _AT.textDim, marginLeft: 'auto', fontFamily: _AT.fontMono }}>{new Date(alert.ts).toLocaleTimeString()}</span>
                </div>
                <p style={{ fontSize: 13, color: _AT.textMain, margin: 0, lineHeight: 1.6, fontFamily: _AT.fontBody }}>{alert.message}</p>
                {alert.data && Object.keys(alert.data).length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {Object.entries(alert.data).map(([k, v]) => (
                            <span key={k}>{k}: <span style={{ color: config.color, fontWeight: 700 }}>{String(v)}</span></span>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {onAcknowledge && !acknowledged && (
                    <button onClick={handleAck} style={{ background: `${config.color}12`, border: `1px solid ${config.color}30`, color: config.color, padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: _AT.fontDisplay, letterSpacing: '1px' }}>ACK</button>
                )}
                {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: `1px solid ${_AT.glassBorder}`, color: _AT.textMuted, cursor: 'pointer', padding: '6px 8px', borderRadius: 3, display: 'flex', alignItems: 'center' }}><X size={12} /></button>}
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
                            <p style={{ fontSize: 11, color: _AT.textMuted, margin: '4px 0 0', fontFamily: _AT.fontBody, lineHeight: 1.5 }}>{alert.message}</p>
                        </div>
                        {onDismiss && (
                            <button onClick={() => onDismiss(alert.id)} style={{ background: 'none', border: 'none', color: _AT.textDim, cursor: 'pointer', padding: 2 }}>
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
