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
