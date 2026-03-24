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

export const CornerBrackets = () => null;

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

export const HexPattern = ({ color = _AT.primary, opacity = 0.03, scale = 1 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${56*scale}' height='${100*scale}'%3E%3Cpath d='M${28*scale} ${66*scale}L0 ${50*scale}V${17*scale}L${28*scale} 0l${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3Cpath d='M${28*scale} ${100*scale}L0 ${84*scale}V${51*scale}l${28*scale}-${17*scale} ${28*scale} ${17*scale}v${33*scale}z' fill='none' stroke='${encodeURIComponent(color)}' stroke-opacity='${opacity}' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: `${56*scale}px ${100*scale}px`
    }} />
);

export const GridPattern = ({ color = _AT.primary, opacity = 0.04, size = 40 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px), linear-gradient(90deg, ${color}${Math.round(opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`
    }} />
);

export const GlowOrb = () => null;

export const NoiseTexture = ({ opacity = 0.025 }) => (
    <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity,
        mixBlendMode: 'overlay'
    }} />
);

export const CircuitLines = ({ color = _AT.primary, opacity = 0.06 }) => (
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
