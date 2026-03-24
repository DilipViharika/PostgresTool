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

export const EmptyState = ({ icon: Icon, title, text, action, onAction, color = _AT.primary }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
            <div style={{ width: 76, height: 76, borderRadius: 4, background: _AT.surfaceHover, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${_AT.glassBorder}`, color: _AT.textDim, position: 'relative', overflow: 'hidden' }}>
                <CornerBrackets color={_AT.textDim} size={8} />
                <Icon size={30} style={{ animation: 'floatUp 3s ease-in-out infinite' }} />
            </div>
        </div>
        {title && <div style={{ fontSize: 12, fontWeight: 700, color: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '2px', textTransform: 'uppercase' }}>{title}</div>}
        <div style={{ fontSize: 11, textAlign: 'center', maxWidth: 240, color: _AT.textDim, fontFamily: _AT.fontMono, lineHeight: 1.8 }}>{text}</div>
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
                    <div key={i} style={{ height: 120, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${_AT.glassBorder}`, overflow: 'hidden', position: 'relative' }}>
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
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${_AT.glassBorder}`, borderTop: `2px solid ${_AT.primary}`, animation: 'spin 0.8s linear infinite', boxShadow: `0 0 14px ${_AT.primary}40` }} />
                <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: `1px solid ${_AT.glassBorder}`, borderBottom: `1px solid ${_AT.secondary}`, animation: 'spinReverse 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: _AT.primary, animation: 'pulse 1s infinite', boxShadow: `0 0 8px ${_AT.primary}` }} />
                </div>
            </div>
            {message && <span style={{ fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono, letterSpacing: '1px' }}>{message}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  13. STATUS DOT & COPY BUTTON
// ═══════════════════════════════════════════════════════════════════════════
export const StatusDot = ({ status, size = 8, pulse: doPulse = false }) => {
    injectKeyframes();
    const color = { active: _AT.success, ok: _AT.success, idle: _AT.warning, error: _AT.danger, critical: _AT.danger, warning: _AT.warning }[status] || _AT.textMuted;
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />
    );
};

export const CopyButton = ({ text, size = 'default', label }) => {
    const [copied, copy] = useCopyToClipboard();
    const sm = size === 'small';
    return (
        <button onClick={() => copy(text)} style={{
            background: copied ? `${_AT.success}10` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${copied ? _AT.success + '40' : _AT.glassBorder}`,
            color: copied ? _AT.success : _AT.textMuted,
            padding: sm ? '3px 8px' : '5px 12px', borderRadius: 3, cursor: 'pointer',
            fontSize: sm ? 9 : 10, display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s', fontFamily: _AT.fontMono, fontWeight: 700
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
