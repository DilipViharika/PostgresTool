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
        input:   _AT.textMain,
        output:  '#7dd3fc',
        error:   _AT.danger,
        success: _AT.success,
        info:    _AT.textMuted,
        system:  _AT.warning,
    };

    return (
        <div style={{ background: '#01060e', borderRadius: 4, border: `1px solid ${_AT.glassBorder}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <ScanlineOverlay opacity={0.015} />
            {/* Header */}
            <div style={{ background: '#010509', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${_AT.glassBorder}`, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef444490' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b90' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e90' }} />
                    <span style={{ marginLeft: 8, fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>{title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <CopyButton text={history.map(l => l.content).join('\n')} size="small" />
                </div>
            </div>
            {/* Output */}
            <div style={{ padding: '12px 16px', fontFamily: _AT.fontMono, fontSize: 12, lineHeight: 1.85, overflowY: 'auto', maxHeight, position: 'relative', zIndex: 1 }}>
                {history.map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, animation: `fadeUp 0.2s ease ${i < 3 ? i * 0.05 : 0}s backwards` }}>
                        {line.type === 'input' && <span style={{ color: _AT.success, flexShrink: 0, userSelect: 'none' }}>{'▶'}</span>}
                        {line.type === 'error' && <span style={{ color: _AT.danger, flexShrink: 0, userSelect: 'none' }}>{'✕'}</span>}
                        {line.type === 'success' && <span style={{ color: _AT.success, flexShrink: 0, userSelect: 'none' }}>{'✓'}</span>}
                        {line.type === 'system' && <span style={{ color: _AT.warning, flexShrink: 0, userSelect: 'none' }}>{'⬡'}</span>}
                        {!['input','error','success','system'].includes(line.type) && <span style={{ color: _AT.textDim, flexShrink: 0, userSelect: 'none' }}>{'·'}</span>}
                        <span style={{ color: typeColors[line.type] || _AT.textMuted, wordBreak: 'break-all' }}>{line.content}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            {/* Input */}
            {!readOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: `1px solid ${_AT.glassBorder}`, background: '#000812', position: 'relative', zIndex: 2 }}>
                    <span style={{ color: _AT.success, fontFamily: _AT.fontMono, fontSize: 13, userSelect: 'none' }}>$</span>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Enter command..."
                        style={{ flex: 1, background: 'none', border: 'none', color: _AT.textMain, fontFamily: _AT.fontMono, fontSize: 12, outline: 'none' }}
                    />
                    <NanoButton icon={Play} onClick={execute} color={_AT.success} size="small" tooltip="Execute (Enter)" />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  15. FILTER PILLS — v2
// ═══════════════════════════════════════════════════════════════════════════
export const FilterPills = ({ options, active, onChange, multi = false, color = _AT.primary }) => (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(opt => {
            const key = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const icon = typeof opt === 'object' ? opt.icon : null;
            const isActive = multi ? active?.includes(key) : active === key;
            return (
                <button key={key} onClick={() => onChange(key)} style={{
                    background: isActive ? `${color}14` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? color + '45' : _AT.glassBorder}`,
                    color: isActive ? color : _AT.textMuted,
                    padding: '4px 12px', borderRadius: 2, cursor: 'pointer',
                    fontSize: 9, fontWeight: 700, transition: 'all 0.2s',
                    fontFamily: _AT.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase',
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
                                <span style={{ fontSize: 12, fontWeight: 600, color: _AT.textMain, fontFamily: _AT.fontBody }}>{event.title}</span>
                                <SeverityBadge severity={event.type} />
                                <span style={{ fontSize: 9, color: _AT.textDim, marginLeft: 'auto', fontFamily: _AT.fontMono }}>
                  {new Date(event.ts).toLocaleTimeString()}
                </span>
                            </div>
                            {event.description && <p style={{ fontSize: 11, color: _AT.textMuted, margin: 0, lineHeight: 1.6, fontFamily: _AT.fontBody }}>{event.description}</p>}
                            {event.meta && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                                    {Object.entries(event.meta).map(([k, v]) => (
                                        <span key={k} style={{ fontSize: 9, fontFamily: _AT.fontMono, color: _AT.textDim }}>
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
export const RadarMetric = ({ data = [], size = 200, color = _AT.primary, label }) => {
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
                              style={{ fontSize: 8, fill: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {d.label}
                        </text>
                    );
                })}
            </svg>
            {label && <div style={{ fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</div>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  18. TYPEWRITER TEXT — Animated command output
// ═══════════════════════════════════════════════════════════════════════════
export const TypewriterText = ({ text, speed = 30, color = _AT.primary, mono = true, onDone, prefix = '' }) => {
    injectKeyframes();
    const [displayed, done] = useTypewriter(text, speed, true);
    useEffect(() => { if (done) onDone?.(); }, [done]);
    return (
        <span style={{ fontFamily: mono ? _AT.fontMono : _AT.fontBody, color, fontSize: 'inherit' }}>
      {prefix && <span style={{ color: _AT.success }}>{prefix} </span>}
            {displayed}
            {!done && <span style={{ borderRight: `2px solid ${color}`, animation: 'blink 0.8s step-end infinite', marginLeft: 1 }} />}
    </span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  19. HEATMAP CALENDAR — Activity grid
// ═══════════════════════════════════════════════════════════════════════════
export const HeatmapGrid = ({ data = [], weeks = 26, color = _AT.primary, label }) => {
    injectKeyframes();
    const maxVal = Math.max(...data.map(d => d.value || 0), 1);
    const cells = Array.from({ length: weeks * 7 }, (_, i) => data[i] || { value: 0 });
    const days = ['S','M','T','W','T','F','S'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <div style={{ fontSize: 9, color: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>}
            <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16 }}>
                    {days.map((d, i) => (
                        <div key={i} style={{ height: 11, fontSize: 8, color: _AT.textDim, fontFamily: _AT.fontMono, display: 'flex', alignItems: 'center' }}>{d}</div>
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
                <span style={{ fontSize: 8, color: _AT.textDim, fontFamily: _AT.fontMono }}>Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: v > 0 ? color : 'rgba(255,255,255,0.04)', opacity: v > 0 ? Math.max(0.15, v) : 1 }} />
                ))}
                <span style={{ fontSize: 8, color: _AT.textDim, fontFamily: _AT.fontMono }}>More</span>
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
                borderRadius: 8, border: `1px solid ${_AT.glassBorderHot}`,
                boxShadow: `0 0 0 1px ${_AT.primary}20, 0 32px 80px rgba(0,0,0,0.9)`,
                overflow: 'hidden', animation: 'scaleUp 0.2s cubic-bezier(0.16,1,0.3,1)'
            }} onClick={e => e.stopPropagation()}>
                <CornerBrackets color={_AT.primary} size={12} glowing />
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${_AT.glassBorder}` }}>
                    <Search size={14} color={_AT.textMuted} />
                    <input
                        ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        onKeyDown={handleKey} placeholder={placeholder}
                        style={{ flex: 1, background: 'none', border: 'none', color: _AT.textMain, fontSize: 14, outline: 'none', fontFamily: _AT.fontBody }}
                    />
                    {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: _AT.textDim, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} /></button>}
                    <kbd style={{ fontSize: 9, color: _AT.textDim, background: 'rgba(255,255,255,0.04)', border: `1px solid ${_AT.glassBorder}`, padding: '2px 7px', borderRadius: 3, fontFamily: _AT.fontMono }}>ESC</kbd>
                </div>
                {/* Results */}
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group}>
                            <div style={{ padding: '8px 18px 4px', fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{group}</div>
                            {items.map((cmd, ci) => {
                                const gi = flat.indexOf(cmd);
                                const isSelected = gi === selected;
                                const Icon = cmd.icon;
                                return (
                                    <div key={ci} onClick={() => { cmd.action?.(); onClose?.(); }}
                                         style={{
                                             display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
                                             background: isSelected ? `${_AT.primary}08` : 'transparent',
                                             borderLeft: `2px solid ${isSelected ? _AT.primary : 'transparent'}`,
                                             cursor: 'pointer', transition: 'all 0.1s'
                                         }}>
                                        {Icon && (
                                            <div style={{ width: 30, height: 30, borderRadius: 4, background: `${_AT.primary}10`, color: _AT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${_AT.primary}20`, flexShrink: 0 }}>
                                                <Icon size={13} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, color: isSelected ? _AT.textMain : _AT.textMuted, fontFamily: _AT.fontBody, fontWeight: 500 }}>{cmd.label}</div>
                                            {cmd.description && <div style={{ fontSize: 10, color: _AT.textDim, marginTop: 1 }}>{cmd.description}</div>}
                                        </div>
                                        {cmd.shortcut && (
                                            <kbd style={{ fontSize: 9, color: _AT.textDim, background: 'rgba(255,255,255,0.04)', border: `1px solid ${_AT.glassBorder}`, padding: '2px 7px', borderRadius: 3, fontFamily: _AT.fontMono }}>{cmd.shortcut}</kbd>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {flat.length === 0 && (
                        <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: _AT.textDim, fontFamily: _AT.fontMono }}>No commands found</div>
                    )}
                </div>
                <div style={{ padding: '8px 18px', borderTop: `1px solid ${_AT.glassBorder}`, display: 'flex', gap: 16, fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono }}>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${_AT.glassBorder}` }}>↑↓</kbd> navigate</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${_AT.glassBorder}` }}>↵</kbd> select</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 2, border: `1px solid ${_AT.glassBorder}` }}>esc</kbd> close</span>
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

    const statusColors = { active: _AT.success, warning: _AT.warning, error: _AT.danger, idle: _AT.textMuted };

    return (
        <svg ref={svgRef} width="100%" height={height} style={{ overflow: 'visible' }}>
            <defs>
                <filter id="node-glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={_AT.textDim} />
                </marker>
            </defs>
            {/* Edges */}
            {edges.map((edge, i) => {
                const from = nodes.find(n => n.id === edge.from);
                const to = nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                const color = edge.active ? _AT.primary : _AT.textDim;
                return (
                    <g key={i}>
                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                              stroke={color} strokeOpacity={0.3} strokeWidth={1}
                              markerEnd="url(#arrow)"
                              style={{ animation: edge.active ? 'pulse 2s ease-in-out infinite' : 'none' }}
                        />
                        {edge.label && (
                            <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                                  textAnchor="middle" style={{ fontSize: 8, fill: _AT.textDim, fontFamily: _AT.fontMono }}>
                                {edge.label}
                            </text>
                        )}
                    </g>
                );
            })}
            {/* Nodes */}
            {nodes.map((node) => {
                const color = statusColors[node.status] || _AT.primary;
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
                              style={{ fontSize: 9, fill: color, fontFamily: _AT.fontDisplay, fontWeight: 700, letterSpacing: '0.5px' }}>
                            {node.label || node.id}
                        </text>
                        <text y={26} textAnchor="middle"
                              style={{ fontSize: 8, fill: _AT.textDim, fontFamily: _AT.fontMono }}>
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
export const WaveformBar = ({ bars = 32, color = _AT.primary, active = true, heights }) => {
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
export const StatCompare = ({ label, before, after, unit, color = _AT.primary, inverse = false }) => {
    injectKeyframes();
    const delta = after - before;
    const pct = before !== 0 ? ((delta / before) * 100).toFixed(1) : 0;
    const improved = inverse ? delta < 0 : delta > 0;
    const trendColor = improved ? _AT.success : delta === 0 ? _AT.textMuted : _AT.danger;

    return (
        <div style={{
            background: 'rgba(4,9,28,0.7)', borderRadius: 4, padding: 16,
            border: `1px solid ${_AT.glassBorder}`, position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ fontSize: 9, color: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div>
                    <div style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono, marginBottom: 3 }}>BEFORE</div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: _AT.textMuted, fontFamily: _AT.fontMono }}>{before.toLocaleString()}{unit && <span style={{ fontSize: 11 }}> {unit}</span>}</span>
                </div>
                <div style={{ fontSize: 16, color: _AT.textDim, marginBottom: 6 }}>→</div>
                <div>
                    <div style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono, marginBottom: 3 }}>AFTER</div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: _AT.textMain, fontFamily: _AT.fontMono, textShadow: `0 0 20px ${color}60` }}>{after.toLocaleString()}{unit && <span style={{ fontSize: 11, color: _AT.textMuted }}> {unit}</span>}</span>
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
export const PillInput = ({ value = [], onChange, placeholder = 'Add tag...', color = _AT.primary, maxTags = 10 }) => {
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
            border: `1px solid ${focused ? _AT.glassBorderHot : _AT.glassBorder}`,
            minHeight: 40, alignItems: 'center', cursor: 'text',
            transition: 'border-color 0.2s'
        }} onClick={() => document.getElementById('pill-input')?.focus()}>
            {value.map((tag, i) => (
                <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10, padding: '3px 9px', borderRadius: 2,
                    background: `${color}14`, color, border: `1px solid ${color}28`,
                    fontFamily: _AT.fontMono, animation: 'scaleIn 0.2s ease backwards'
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
                style={{ background: 'none', border: 'none', color: _AT.textMain, fontSize: 11, outline: 'none', fontFamily: _AT.fontMono, minWidth: 100, flex: 1 }}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  25. SLIDER — Neon range input
// ═══════════════════════════════════════════════════════════════════════════
export const NeonSlider = ({ value, min = 0, max = 100, step = 1, onChange, label, color = _AT.primary, showValue = true }) => {
    injectKeyframes();
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div>
            {(label || showValue) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, fontFamily: _AT.fontMono }}>
                    {label && <span style={{ color: _AT.textMuted }}>{label}</span>}
                    {showValue && <span style={{ color, fontWeight: 700 }}>{value}</span>}
                </div>
            )}
            <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                {/* Track */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.1s ease', borderRadius: 2 }} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, color: _AT.textDim, fontFamily: _AT.fontMono }}>
                <span>{min}</span><span>{max}</span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  26. TOGGLE SWITCH — Neon style
// ═══════════════════════════════════════════════════════════════════════════
export const NeonToggle = ({ value, onChange, label, color = _AT.primary, size = 'default', disabled = false }) => {
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
                    border: `1px solid ${value ? color + '60' : _AT.glassBorder}`,
                    boxShadow: value ? `0 0 12px ${color}30, inset 0 0 8px ${color}10` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0
                }}>
                <div style={{
                    position: 'absolute', top: (h - th) / 2, width: th, height: th, borderRadius: '50%',
                    background: value ? color : _AT.textDim,
                    left: value ? w - th - (h - th) / 2 : (h - th) / 2,
                    boxShadow: value ? `0 0 8px ${color}, 0 0 16px ${color}60` : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)'
                }} />
            </div>
            {label && <span style={{ fontSize: sm ? 10 : 11, color: _AT.textMuted, fontFamily: _AT.fontBody }}>{label}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  27. SELECT DROPDOWN — Neural styled
// ═══════════════════════════════════════════════════════════════════════════
export const NeuralSelect = ({ value, options, onChange, label, color = _AT.primary, disabled = false }) => {
    const [open, setOpen] = useState(false);
    const [hovered, hoverProps] = useHover();
    const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
    const selectedLabel = selected ? (typeof selected === 'string' ? selected : selected.label) : 'Select...';

    return (
        <div style={{ position: 'relative' }}>
            {label && <div style={{ fontSize: 9, color: _AT.textMuted, fontFamily: _AT.fontDisplay, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>}
            <div
                {...hoverProps}
                onClick={() => !disabled && setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 3, cursor: disabled ? 'not-allowed' : 'pointer',
                    background: open ? `${color}08` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${open || hovered ? color + '40' : _AT.glassBorder}`,
                    transition: 'all 0.2s', opacity: disabled ? 0.5 : 1
                }}>
                <span style={{ fontSize: 12, color: _AT.textMain, fontFamily: _AT.fontBody }}>{selectedLabel}</span>
                <ChevronDown size={13} color={_AT.textMuted} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </div>
            {open && (
                <div style={{
                    position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 100,
                    background: 'rgba(2,6,20,0.98)', borderRadius: 3,
                    border: `1px solid ${_AT.glassBorderHot}`,
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
                                color: isActive ? color : _AT.textMuted,
                                background: isActive ? `${color}08` : 'transparent',
                                borderLeft: `2px solid ${isActive ? color : 'transparent'}`,
                                fontFamily: _AT.fontBody, transition: 'all 0.1s',
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
export const PulseRing = ({ value, max, color = _AT.primary, size = 80, label }) => {
    injectKeyframes();
    const pct = Math.min((value / (max || 1)) * 100, 100);
    const r = (size / 2) - 8;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={_AT.grid} strokeWidth={5} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${color})` }}
                />
            </svg>
            <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: size < 60 ? 11 : 14, fontWeight: 800, color, fontFamily: _AT.fontMono, lineHeight: 1 }}>{value}</div>
                {label && <div style={{ fontSize: 7, color: _AT.textDim, fontFamily: _AT.fontMono, marginTop: 1, letterSpacing: '0.5px' }}>{label}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  29. HEAT CELL + CONNECTION POOL BAR + SETTING ROW (carried over + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const HeatCell = ({ value, max, color = _AT.primary, size = 24, label }) => {
    const intensity = Math.min(value / (max || 1), 1);
    const [hovered, hoverProps] = useHover();
    const rgbMap = { [_AT.primary]: '0,245,255', [_AT.danger]: '255,45,120', [_AT.success]: '0,255,136', [_AT.warning]: '255,170,0' };
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
        { label: 'Active', value: active || (total - idle), color: _AT.primary },
        { label: 'Idle', value: idle, color: _AT.success },
        { label: 'Waiting', value: waiting || 0, color: _AT.warning },
    ];
    const barMax = max || total || 1;
    return (
        <div>
            <div style={{ display: 'flex', height: 18, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: `1px solid ${_AT.glassBorder}`, gap: 1 }}>
                {segments.map((seg, i) => seg.value > 0 && (
                    <div key={i} style={{
                        width: `${(seg.value / barMax) * 100}%`,
                        background: `linear-gradient(180deg, ${seg.color}80, ${seg.color}50)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: _AT.fontMono,
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
                        <span style={{ fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>
              {seg.label}: <span style={{ color: _AT.textMain, fontWeight: 700 }}>{seg.value}</span>
            </span>
                    </div>
                ))}
                {max && <span style={{ fontSize: 10, color: _AT.textDim, marginLeft: 'auto', fontFamily: _AT.fontMono }}>max: {max}</span>}
            </div>
        </div>
    );
};

export const SettingRow = ({ name, value, unit, description, category, context, onChange, type = 'text' }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderBottom: `1px solid ${_AT.glassBorder}`,
            background: hovered ? 'rgba(0,245,255,0.015)' : 'transparent',
            transition: 'background 0.15s', animation: 'fadeUp 0.3s ease backwards'
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontFamily: _AT.fontMono, color: _AT.primary, fontWeight: 600 }}>{name}</span>
                    {context && <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 2, color: _AT.textDim, fontFamily: _AT.fontMono }}>{context}</span>}
                </div>
                {description && <div style={{ fontSize: 10, color: _AT.textMuted, marginTop: 2, fontFamily: _AT.fontBody }}>{description}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {type === 'toggle' ? (
                    <NeonToggle value={!!value} onChange={onChange} size="small" />
                ) : (
                    <>
                        <span style={{ fontSize: 14, fontFamily: _AT.fontMono, color: _AT.textMain, fontWeight: 700 }}>{value}</span>
                        {unit && <span style={{ fontSize: 10, color: _AT.textDim, marginLeft: 5, fontFamily: _AT.fontMono }}>{unit}</span>}
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
    super_admin: { color: _AT.warning,     icon: ShieldCheck,  label: 'SUPER ADMIN' },
    dba:         { color: _AT.primary,    icon: Shield,       label: 'DBA' },
    developer:   { color: _AT.ai,      icon: Code,         label: 'DEVELOPER' },
    analyst:     { color: _AT.success,    icon: BarChart2,    label: 'ANALYST' },
    viewer:      { color: _AT.textMuted, icon: Eye,          label: 'VIEWER' },
};

export const RoleBadge = ({ role, showIcon = true, size = 'default' }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
    const Icon = config.icon;
    const sm = size === 'small';
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6, background: `${config.color}10`, padding: sm ? '2px 8px' : '5px 12px', borderRadius: 3, border: `1px solid ${config.color}22` }}>
            {showIcon && <Icon size={sm ? 10 : 13} color={config.color} />}
            <span style={{ fontSize: sm ? 9 : 10, fontWeight: 800, color: config.color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: _AT.fontDisplay }}>{config.label}</span>
        </div>
    );
};

export const WebSocketStatus = ({ connected, clientCount, lastMessage, uptime, quality }) => {
    injectKeyframes();
    const color = connected ? _AT.success : _AT.danger;
    const qualColors = { high: _AT.success, medium: _AT.warning, low: _AT.danger };
    const qColor = quality ? qualColors[quality] || color : color;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${qColor}05`, padding: '6px 14px', borderRadius: 2, border: `1px solid ${qColor}20` }}>
            {connected ? <Wifi size={12} color={qColor} /> : <WifiOff size={12} color={qColor} />}
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: qColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: qColor, fontFamily: _AT.fontDisplay, letterSpacing: '1px' }}>{connected ? 'WS·CONNECTED' : 'WS·OFFLINE'}</span>
            {clientCount !== undefined && <span style={{ fontSize: 9, fontFamily: _AT.fontMono, color: _AT.textMuted, background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 2 }}>{clientCount}c</span>}
            {uptime && <span style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono }}>{uptime}</span>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  31. NODE LINK (enhanced) + SEQUENCE USAGE + EXTENSION CARD
// ═══════════════════════════════════════════════════════════════════════════
export const NodeLink = ({ from, to, type = 'depends', latency, status = 'active', bidirectional = false }) => {
    const color = { active: _AT.success, degraded: _AT.warning, error: _AT.danger, idle: _AT.textMuted }[status] || _AT.success;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: _AT.fontMono, fontSize: 11 }}>
            <span style={{ color: _AT.textMuted, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '3px 0 0 3px', border: `1px solid ${_AT.glassBorder}` }}>{from}</span>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', background: `${color}08`, border: `1px solid ${color}20`, borderLeft: 'none', borderRight: 'none', height: 29, gap: 2 }}>
                {bidirectional && <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `6px solid ${color}60` }} />}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${color}, ${color}50)` }} />
                {latency && <span style={{ fontSize: 8, color, padding: '0 2px' }}>{latency}ms</span>}
                <div style={{ width: 18, height: 1, background: `linear-gradient(90deg, ${color}50, ${color})` }} />
                <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${color}` }} />
            </div>
            <span style={{ color: _AT.textMuted, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '0 3px 3px 0', border: `1px solid ${_AT.glassBorder}`, borderLeft: 'none' }}>{to}</span>
        </div>
    );
};

export const SequenceUsageBar = ({ name, usagePct, lastValue, maxValue, cycle }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontFamily: _AT.fontMono, color: _AT.textMuted }}>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {cycle && <ChipBadge label="CYCLE" color={_AT.success} micro />}
                <span style={{ fontSize: 11, fontFamily: _AT.fontMono, fontWeight: 700, color: usagePct > 80 ? _AT.danger : usagePct > 50 ? _AT.warning : _AT.textMuted }}>{usagePct}%</span>
            </div>
        </div>
        <NeonProgressBar value={usagePct} max={100} color={usagePct > 80 ? _AT.danger : usagePct > 50 ? _AT.warning : _AT.success} height={4} />
    </div>
);

export const ExtensionCard = ({ name, version, schema, description, enabled }) => {
    const [hovered, hoverProps] = useHover();
    return (
        <div {...hoverProps} style={{ background: hovered ? 'rgba(10,20,40,0.8)' : 'rgba(4,9,28,0.6)', borderRadius: 3, border: `1px solid ${hovered ? _AT.glassBorderHot : _AT.glassBorder}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: 4, background: `${_AT.primary}08`, color: _AT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${_AT.primary}20` }}>
                <Database size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: _AT.textMain, fontFamily: _AT.fontBody }}>{name}</span>
                    <span style={{ fontSize: 9, background: _AT.grid, padding: '2px 7px', borderRadius: 2, color: _AT.textMuted, fontFamily: _AT.fontMono }}>v{version}</span>
                    {enabled !== undefined && <ChipBadge label={enabled ? 'ACTIVE' : 'DISABLED'} color={enabled ? _AT.success : _AT.textMuted} micro dot={enabled} />}
                </div>
                {description && <div style={{ fontSize: 11, color: _AT.textMuted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>}
            </div>
            <span style={{ fontSize: 10, color: _AT.textDim, fontFamily: _AT.fontMono, flexShrink: 0 }}>{schema}</span>
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

    const severityColor = { missing: _AT.danger, unused: _AT.warning, duplicate: _AT.warning }[type] || _AT.primary;
    const tabs = ['analysis', 'context', 'actions', 'metrics'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            {/* AI Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(123,47,255,0.05) 100%)',
                border: `1px solid ${_AT.ai}28`, borderRadius: 4, padding: 16, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${_AT.ai}, #5b21b6)`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={14} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: _AT.ai, letterSpacing: '1.5px', fontFamily: _AT.fontDisplay }}>NEURAL ANALYSIS ENGINE v3.0</div>
                        <div style={{ fontSize: 8, color: _AT.textMuted, fontFamily: _AT.fontMono, marginTop: 1 }}>
                            {streaming ? <TypewriterText text="Processing..." color={_AT.warning} speed={60} /> : 'confidence: 97.3% · latency: 142ms'}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                        {streaming && <div style={{ width: 6, height: 6, borderRadius: '50%', background: _AT.success, animation: 'ping 1s ease-out infinite' }} />}
                        <SeverityBadge severity={type === 'unused' ? 'warning' : type === 'missing' ? 'critical' : type === 'duplicate' ? 'warning' : 'info'} />
                    </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: _AT.textMuted, margin: 0, fontFamily: _AT.fontBody }}>
                    {streaming ? typedText : (type === 'api' ? data.ai_insight : data.recommendation || 'No critical issues detected.')}
                    {streaming && !done && <span style={{ borderRight: `2px solid ${_AT.ai}`, animation: 'blink 0.8s step-end infinite', marginLeft: 1 }} />}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.02)', padding: 3, borderRadius: 4, border: `1px solid ${_AT.glassBorder}` }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, background: activeTab === tab ? `${_AT.primary}14` : 'none',
                        border: activeTab === tab ? `1px solid ${_AT.primary}30` : '1px solid transparent',
                        color: activeTab === tab ? _AT.primary : _AT.textMuted,
                        padding: '5px 0', borderRadius: 3, cursor: 'pointer', fontSize: 8,
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                        fontFamily: _AT.fontDisplay, transition: 'all 0.2s'
                    }}>{tab}</button>
                ))}
            </div>

            {/* Terminal */}
            <div style={{ flex: 1, background: '#01060e', borderRadius: 4, border: `1px solid ${_AT.glassBorder}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 160 }}>
                <ScanlineOverlay opacity={0.012} />
                <div style={{ background: '#010509', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${_AT.glassBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {['#ef4444','#f59e0b','#22c55e'].map((c, i) => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}80` }} />
                        ))}
                        <span style={{ fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono, marginLeft: 6 }}>neural://analysis.context</span>
                    </div>
                    <CopyButton size="small" text={data.problem_query || data.recommendation || ''} />
                </div>
                <div style={{ padding: 14, fontFamily: _AT.fontMono, fontSize: 11, color: '#7dd3fc', lineHeight: 1.9, flex: 1, overflowY: 'auto' }}>
                    {type === 'missing' && <>
                        <div style={{ color: _AT.textDim }}>{`-- ✦ RECOMMENDED ACTION`}</div>
                        <div style={{ color: _AT.success, marginTop: 2 }}>{`CREATE INDEX CONCURRENTLY idx_${data.table}_${data.column}`}</div>
                        <div style={{ color: _AT.success }}>{`ON ${data.table} (${data.column});`}</div>
                        <div style={{ color: _AT.textDim, marginTop: 8 }}>{`-- ✦ PROJECTED IMPACT`}</div>
                        <div style={{ color: _AT.primary }}>{`Est. speedup: ${data.improvement || '~10x'}`}</div>
                    </>}
                    {type === 'unused' && <>
                        <div style={{ color: _AT.textDim }}>{`-- ✦ SAFE TO REMOVE`}</div>
                        <div style={{ color: _AT.danger, marginTop: 2 }}>{`DROP INDEX CONCURRENTLY ${data.indexName};`}</div>
                        <div style={{ color: _AT.textDim, marginTop: 8 }}>{`-- ✦ RESOURCES FREED`}</div>
                        <div style={{ color: _AT.warning }}>{`Disk: ${data.size} · Last scan: never`}</div>
                    </>}
                    {type === 'api' && data.queries?.map((q, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ color: _AT.textDim, fontSize: 10 }}>{`-- [${i+1}] ${q.calls} calls · ${q.duration}ms avg`}</div>
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
            borderRadius: 3, border: `1px solid ${hovered ? _AT.glassBorderHot : _AT.glassBorder}`,
            overflow: 'hidden', transition: 'all 0.2s', animation: 'fadeUp 0.3s ease backwards', position: 'relative'
        }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: entry.success ? _AT.success : _AT.danger, opacity: 0.6 }} />
            <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 10px 16px', cursor: 'pointer' }}>
                <span style={{ flex: 1, fontSize: 11, color: _AT.textMuted, fontFamily: _AT.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.sql}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {entry.tag && <ChipBadge label={entry.tag} color={_AT.primary} micro />}
                    <span style={{ fontSize: 10, color: entry.durationMs > 1000 ? _AT.warning : _AT.textMuted, fontFamily: _AT.fontMono, fontWeight: 700 }}>{entry.durationMs}ms</span>
                    <span style={{ fontSize: 9, color: _AT.textDim, fontFamily: _AT.fontMono }}>{entry.rowCount}r</span>
                    <button onClick={(e) => { e.stopPropagation(); onFavourite?.(entry.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: entry.favourite ? _AT.warning : _AT.textDim, transition: 'color 0.2s', display: 'flex' }}>
                        {entry.favourite ? <Star size={12} fill={_AT.warning} /> : <Star size={12} />}
                    </button>
                    <ChevronDown size={11} color={_AT.textDim} style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
                </div>
            </div>
            {expanded && (
                <div style={{ padding: '0 16px 14px 16px', borderTop: `1px solid ${_AT.glassBorder}` }}>
                    <pre style={{ fontSize: 11, color: '#93c5fd', fontFamily: _AT.fontMono, background: '#01060e', padding: 12, borderRadius: 3, margin: '10px 0', overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre-wrap', border: `1px solid ${_AT.glassBorder}` }}>{entry.sql}</pre>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: _AT.textMuted, fontFamily: _AT.fontMono }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {entry.user && <span>user: <span style={{ color: _AT.textMuted }}>{entry.user}</span></span>}
                            <span>{new Date(entry.ts).toLocaleString()}</span>
                            {entry.error && <span style={{ color: _AT.danger }}>✕ {entry.error}</span>}
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
        { name: 'Used', value: cacheSize, fill: _AT.primary },
        { name: 'Free', value: maxSize - cacheSize, fill: _AT.grid },
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: _AT.primary, fontFamily: _AT.fontMono, textShadow: `0 0 10px ${_AT.primary}80` }}>{usagePct.toFixed(0)}%</span>
                </div>
            </div>
            <div>
                <div style={{ fontSize: 9, color: _AT.textMuted, marginBottom: 6, fontFamily: _AT.fontDisplay, letterSpacing: '1px', textTransform: 'uppercase' }}>App Cache</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: _AT.textMain, fontFamily: _AT.fontMono, lineHeight: 1 }}>
                    {cacheSize}<span style={{ fontSize: 12, color: _AT.textMuted }}>/{maxSize}</span>
                </div>
                {hitRate !== undefined && (
                    <div style={{ fontSize: 11, color: _AT.success, marginTop: 6, fontFamily: _AT.fontMono }}>↑ {hitRate}% hit rate</div>
                )}
            </div>
        </div>
    );
};

export const BloatStatusBadge = ({ status, bloatPct }) => {
    const config = { critical: { color: _AT.danger, icon: XCircle }, warning: { color: _AT.warning, icon: AlertTriangle }, ok: { color: _AT.success, icon: CheckCircle } }[status] || { color: _AT.textMuted, icon: Info };
    const Icon = config.icon;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${config.color}10`, padding: '3px 10px', borderRadius: 3, border: `1px solid ${config.color}25` }}>
            <Icon size={11} color={config.color} />
            <span style={{ fontSize: 9, fontWeight: 800, color: config.color, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: _AT.fontDisplay }}>{status}</span>
            {bloatPct !== undefined && <span style={{ fontSize: 10, fontFamily: _AT.fontMono, color: config.color }}>{bloatPct}%</span>}
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
            border: `1px solid ${hovered ? color + '45' : _AT.glassBorder}`,
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
                <span style={{ fontSize: 9, color: _AT.textMuted, fontWeight: 700, fontFamily: _AT.fontDisplay, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: _AT.fontMono, textShadow: hovered ? `0 0 28px ${color}90` : 'none', transition: 'text-shadow 0.3s' }}>{value}</span>
                    {unit && <span style={{ fontSize: 13, color: _AT.textMuted, marginBottom: 3, fontFamily: _AT.fontMono }}>{unit}</span>}
                </div>
                {description && <div style={{ fontSize: 11, color: _AT.textMuted, marginTop: 4 }}>{description}</div>}
                {trend !== undefined && trend !== null && <div style={{ marginTop: 8 }}><TrendChip value={trend} label="vs last hr" /></div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TERMINAL LINE (kept from v1 + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const TerminalLine = ({ prompt = '$', command, output, color = _AT.primary, delay = 0, type = 'default' }) => {
    injectKeyframes();
    const prompts = { default: { sym: '$', color: _AT.success }, error: { sym: '✕', color: _AT.danger }, success: { sym: '✓', color: _AT.success }, system: { sym: '⬡', color: _AT.warning } };
    const p = prompts[type] || prompts.default;
    return (
        <div style={{ fontFamily: _AT.fontMono, fontSize: 12, lineHeight: 1.85, animation: `fadeUp 0.4s ease ${delay}s backwards` }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: p.color, userSelect: 'none', flexShrink: 0 }}>{p.sym}</span>
                <span style={{ color: _AT.textMain }}>{command}</span>
            </div>
            {output && <div style={{ color: _AT.textMuted, marginLeft: 18 }}>{output}</div>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMMAND PALETTE ITEM (kept + enhanced)
// ═══════════════════════════════════════════════════════════════════════════
export const CommandPaletteItem = ({ icon: Icon, label, description, shortcut, color = _AT.primary, onClick, active }) => {
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
                <div style={{ fontSize: 12, color: isHighlighted ? _AT.textMain : _AT.textMuted, fontFamily: _AT.fontBody, fontWeight: 500 }}>{label}</div>
                {description && <div style={{ fontSize: 10, color: _AT.textDim, marginTop: 1 }}>{description}</div>}
            </div>
            {shortcut && (
                <kbd style={{ fontSize: 9, color: _AT.textDim, background: 'rgba(255,255,255,0.05)', border: `1px solid ${_AT.glassBorder}`, padding: '2px 7px', borderRadius: 3, fontFamily: _AT.fontMono }}>{shortcut}</kbd>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
