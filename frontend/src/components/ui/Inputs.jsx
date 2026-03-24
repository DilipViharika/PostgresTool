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

export const NanoButton = ({
                               icon: Icon, onClick, tooltip, color = _AT.textMuted, active, spinning,
                               label, outlined, variant = 'default', disabled, size = 'default'
                           }) => {
    const [hovered, hoverProps] = useHover();
    injectKeyframes();
    const sm = size === 'small';
    const lg = size === 'large';

    const variants_styles = {
        default: {
            bg: active || hovered ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: active || hovered ? _AT.glassBorderHot : _AT.glassBorder,
            color: active || hovered ? _AT.primary : color,
        },
        danger: {
            bg: hovered ? 'rgba(255,45,120,0.12)' : 'rgba(255,45,120,0.04)',
            border: hovered ? 'rgba(255,45,120,0.4)' : 'rgba(255,45,120,0.2)',
            color: _AT.danger,
        },
        success: {
            bg: hovered ? 'rgba(0,255,136,0.12)' : 'rgba(0,255,136,0.04)',
            border: hovered ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.2)',
            color: _AT.success,
        },
        ghost: {
            bg: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'transparent',
            color: hovered ? _AT.textMain : _AT.textMuted,
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
                border: `1px solid ${disabled ? _AT.glassBorder : vs.border}`,
                color: disabled ? _AT.textDim : vs.color,
                borderRadius: 3,
                padding: sm ? '3px 6px' : lg ? '8px 16px' : (label ? '5px 12px' : '5px 8px'),
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 5,
                transition: 'all 0.15s',
                fontSize: sm ? 9 : lg ? 12 : 10,
                fontFamily: _AT.fontDisplay, fontWeight: 700, letterSpacing: '0.5px',
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
                              accentColor = _AT.primary, selectable = false, onSelectionChange,
                              rowActions, stickyHeader = false, striped = false
                          }) => {
    useAdaptiveTheme();
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: _AT.surfaceHover, borderRadius: 3, padding: '7px 12px', border: `1px solid ${_AT.glassBorder}` }}>
                    <Search size={11} color={_AT.textMuted} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                           placeholder="Search records..." style={{ background: 'none', border: 'none', color: _AT.textMain, fontSize: 11, outline: 'none', flex: 1, fontFamily: _AT.fontMono }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: _AT.textMuted, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>}
                    <span style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono }}>{sorted.length} results</span>
                </div>
            )}

            {selectable && selected.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '6px 12px', background: `${accentColor}08`, borderRadius: 3, border: `1px solid ${accentColor}20` }}>
                    <span style={{ fontSize: 10, color: accentColor, fontFamily: _AT.fontMono }}>{selected.size} selected</span>
                    <button onClick={() => setSelected(new Set())} style={{ fontSize: 9, color: _AT.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: _AT.fontMono }}>Clear</button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 2, background: stickyHeader ? _AT.surface : 'none' }}>
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
                                    color: sort.key === col.key ? accentColor : _AT.textMuted,
                                    borderBottom: `1px solid ${_AT.glassBorder}`,
                                    cursor: sortable && col.sortable !== false ? 'pointer' : 'default',
                                    whiteSpace: 'nowrap', userSelect: 'none', fontFamily: _AT.fontDisplay,
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
                        <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: 32, color: _AT.textDim, fontSize: 11, fontFamily: _AT.fontMono }}>{emptyText}</td></tr>
                    ) : paged.map((row, ri) => (
                        <tr key={row[rowKey] ?? ri}
                            onClick={() => onRowClick?.(row)}
                            onMouseEnter={() => setHoveredRow(ri)}
                            onMouseLeave={() => { setHoveredRow(null); setShowActions(null); }}
                            style={{
                                cursor: onRowClick ? 'pointer' : 'default',
                                background: selected.has(row[rowKey]) ? `${accentColor}08` : hoveredRow === ri ? `${_AT.primary}08` : striped && ri % 2 === 0 ? _AT.surfaceHover : 'transparent',
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
                                    fontSize: compact ? 11 : 12, color: _AT.textMuted,
                                    borderBottom: `1px solid ${_AT.grid}`,
                                    textAlign: col.align || 'left',
                                    fontFamily: col.mono ? _AT.fontMono : _AT.fontBody,
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>
                    <span>{sorted.length} rows · page {page + 1}/{totalPages}</span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: 'none', border: `1px solid ${_AT.glassBorder}`, color: _AT.textDim, width: 26, height: 26, borderRadius: 3, cursor: page === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 0 ? 0.4 : 1 }}>
                            <ChevronLeft size={11} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i)} style={{ background: page === i ? `${accentColor}20` : _AT.surfaceHover, border: `1px solid ${page === i ? accentColor + '50' : _AT.glassBorder}`, color: page === i ? accentColor : _AT.textDim, width: 26, height: 26, borderRadius: 3, cursor: 'pointer', fontSize: 10, fontFamily: _AT.fontMono }}>{i + 1}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ background: 'none', border: `1px solid ${_AT.glassBorder}`, color: _AT.textDim, width: 26, height: 26, borderRadius: 3, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages - 1 ? 0.4 : 1 }}>
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
