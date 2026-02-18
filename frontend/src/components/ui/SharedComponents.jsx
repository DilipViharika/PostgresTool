import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { THEME, ChartDefs } from '../../utils/theme.jsx';
import {
    ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar,
    PolarAngleAxis, AreaChart, Area, BarChart, Bar, Cell, Tooltip,
    PieChart, Pie
} from 'recharts';
import {
    TrendingUp, TrendingDown, Terminal, Zap, Bell, BellOff, Wifi, WifiOff,
    Shield, ShieldCheck, ShieldAlert, Eye, EyeOff, Clock, Star, StarOff,
    Tag, Hash, Database, HardDrive, Lock, Unlock, AlertTriangle, AlertCircle,
    CheckCircle, XCircle, Info, ChevronRight, ChevronDown, Copy, Check,
    RefreshCw, Loader, Search, Filter, X, MoreVertical, ExternalLink,
    Activity, Server, Cpu, HardDrive as MemoryStick, Activity as Gauge, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
//  ANIMATION KEYFRAMES (inject once)
// ═══════════════════════════════════════════════════════════════════════════
const KEYFRAMES = `
@keyframes fadeIn      { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); }    to { opacity: 1; transform: scale(1); } }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes ping        { 75%, 100% { transform: scale(2.5); opacity: 0; } }
@keyframes pulse       { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer     { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes spin        { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes glow        { 0%, 100% { box-shadow: 0 0 5px var(--glow-color, rgba(99,102,241,0.4)); }
                         50% { box-shadow: 0 0 20px var(--glow-color, rgba(99,102,241,0.6)); } }
@keyframes countUp     { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes alertSlide  { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
`;

let _injected = false;
function injectKeyframes() {
    if (_injected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    _injected = true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/** Animated number counter */
function useAnimatedValue(target, duration = 600) {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const fromRef = useRef(target);

    useEffect(() => {
        fromRef.current = display;
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(Math.round(fromRef.current + (target - fromRef.current) * eased));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return display;
}

/** Clipboard copy with feedback */
function useCopyToClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
        } catch { /* fallback */ }
    }, [timeout]);
    return [copied, copy];
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. GLASS CARD — enhanced with loading state, collapsible, refresh
// ═══════════════════════════════════════════════════════════════════════════
export const GlassCard = ({
                              children, title, rightNode, style, loading, collapsible, onRefresh,
                              refreshing, headerColor, noPad, accentColor
                          }) => {
    injectKeyframes();
    const [collapsed, setCollapsed] = useState(false);
    const accent = accentColor || THEME.primary;

    return (
        <div style={{
            background: THEME.glass,
            backdropFilter: 'blur(14px)',
            borderRadius: 16,
            border: `1px solid ${THEME.glassBorder}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            padding: noPad ? 0 : 24,
            display: 'flex', flexDirection: 'column',
            height: collapsed ? 'auto' : '100%',
            position: 'relative', overflow: 'hidden',
            animation: 'fadeInScale 0.4s ease backwards',
            ...style
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: collapsed ? 0 : 20, zIndex: 2,
                padding: noPad ? '16px 20px' : 0,
                borderBottom: collapsed ? 'none' : noPad ? `1px solid ${THEME.glassBorder}` : 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {collapsible && (
                        <button onClick={() => setCollapsed(!collapsed)} style={{
                            background: 'none', border: 'none', color: THEME.textMuted,
                            cursor: 'pointer', padding: 0, display: 'flex',
                            transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)'
                        }}>
                            <ChevronDown size={16} />
                        </button>
                    )}
                    {headerColor && (
                        <div style={{ width: 3, height: 18, borderRadius: 2, background: headerColor }} />
                    )}
                    <h3 style={{
                        fontSize: 13, fontWeight: 700, color: THEME.textMain,
                        textTransform: 'uppercase', letterSpacing: '1.2px', margin: 0
                    }}>{title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {onRefresh && (
                        <button onClick={onRefresh} style={{
                            background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.glassBorder}`,
                            borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: THEME.textMuted,
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                            transition: 'all 0.2s'
                        }}>
                            <RefreshCw size={12} style={{
                                animation: refreshing ? 'spin 1s linear infinite' : 'none'
                            }} />
                        </button>
                    )}
                    {rightNode}
                </div>
            </div>

            {/* Body */}
            {!collapsed && (
                <div style={{
                    flex: 1, minHeight: 0, position: 'relative', zIndex: 1,
                    padding: noPad ? '0 20px 20px' : 0,
                    opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s'
                }}>
                    {loading && <LoadingOverlay />}
                    {children}
                </div>
            )}

            {/* Background accent glow */}
            <div style={{
                position: 'absolute', top: -60, right: -60, width: 160, height: 160,
                background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. METRIC CARD — enhanced with animated values, trend arrows, cache badge
// ═══════════════════════════════════════════════════════════════════════════
export const MetricCard = ({
                               icon: Icon, title, value, unit, subtitle, color = THEME.primary,
                               onClick, active, sparkData, trend, cacheBadge, animate = true,
                               size = 'default'
                           }) => {
    injectKeyframes();
    const isCompact = size === 'compact';

    return (
        <div onClick={onClick} style={{
            background: active
                ? `linear-gradient(180deg, ${color}20 0%, ${color}08 100%)`
                : 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderRadius: isCompact ? 10 : 14,
            border: active ? `1px solid ${color}` : `1px solid ${THEME.glassBorder}`,
            padding: isCompact ? 14 : 20,
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', gap: isCompact ? 8 : 12,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: active ? 'translateY(-2px)' : 'none',
            boxShadow: active ? `0 10px 25px -5px ${color}30` : 'none',
            animation: animate ? 'fadeIn 0.4s ease backwards' : 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: isCompact ? 32 : 40, height: isCompact ? 32 : 40,
                    borderRadius: 10, background: `${color}15`,
                    color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}30`, boxShadow: `0 0 15px ${color}15`
                }}>
                    <Icon size={isCompact ? 16 : 20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {cacheBadge && (
                        <div style={{
                            fontSize: 9, background: cacheBadge === 'HIT' ? THEME.success + '20' : THEME.warning + '20',
                            color: cacheBadge === 'HIT' ? THEME.success : THEME.warning,
                            padding: '2px 6px', borderRadius: 6, fontWeight: 700, fontFamily: 'monospace'
                        }}>{cacheBadge}</div>
                    )}
                    {active && (
                        <div style={{
                            fontSize: 10, background: color, color: '#fff',
                            padding: '2px 8px', borderRadius: 10, fontWeight: 700
                        }}>SELECTED</div>
                    )}
                </div>
            </div>

            {/* Spark line */}
            {sparkData && !active && (
                <div style={{ width: '100%', height: 32, marginTop: -4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData}>
                            <defs>
                                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
                                  fill={`url(#spark-${title})`} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div>
                <div style={{
                    fontSize: 11, color: THEME.textMuted, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{
                        fontSize: isCompact ? 22 : 28, fontWeight: 700,
                        color: THEME.textMain, fontFamily: 'monospace', letterSpacing: '-0.5px',
                        animation: animate ? 'countUp 0.6s ease backwards' : 'none'
                    }}>{value}</span>
                    {unit && <span style={{ fontSize: 12, color: THEME.textMuted }}>{unit}</span>}
                    {trend !== undefined && trend !== null && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 2,
                            fontSize: 11, fontWeight: 600, marginLeft: 4,
                            color: trend > 0 ? THEME.success : trend < 0 ? THEME.danger : THEME.textMuted
                        }}>
                            {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : null}
                            {trend !== 0 && `${Math.abs(trend)}%`}
                        </span>
                    )}
                </div>
                {subtitle && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{subtitle}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  3. BENTO METRIC — enhanced with micro-chart area
// ═══════════════════════════════════════════════════════════════════════════
export const BentoMetric = ({ label, value, unit, icon: Icon, color, trend, delay = 0, chartData }) => {
    injectKeyframes();
    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            animation: `fadeIn 0.5s ease ${delay}s backwards`,
            position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.08 }}>
                <Icon size={48} color={color} />
            </div>

            {/* Mini chart background */}
            {chartData && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, opacity: 0.15 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <Area type="monotone" dataKey="value" stroke={color} fill={color} strokeWidth={1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: 6, borderRadius: 8, background: `${color}20`, color }}>
                    <Icon size={16} />
                </div>
                <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
                    {label}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 4 }}>{unit}</span>
            </div>
            {trend !== undefined && trend !== null && (
                <div style={{
                    marginTop: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                    color: trend > 0 ? THEME.success : trend < 0 ? THEME.danger : THEME.textMuted
                }}>
                    {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : null}
                    {trend !== 0 && <span>{Math.abs(trend)}% vs last hr</span>}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  4. RESOURCE GAUGE — enhanced with threshold colors & animation
// ═══════════════════════════════════════════════════════════════════════════
export const ResourceGauge = ({ label, value, color, thresholds, size = 160, subtitle }) => {
    injectKeyframes();
    const numValue = Number(value) || 0;
    const resolvedColor = thresholds
        ? numValue >= (thresholds.critical || 90) ? THEME.danger
            : numValue >= (thresholds.warning || 70) ? THEME.warning
                : color
        : color;

    const data = [{ name: 'L', value: numValue, fill: resolvedColor }];

    return (
        <div style={{
            position: 'relative', height: size, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="70%" outerRadius="100%" barSize={10}
                    data={data} startAngle={180} endAngle={0}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{
                position: 'absolute', top: '60%', transform: 'translateY(-50%)', textAlign: 'center'
            }}>
                <div style={{
                    fontSize: 24, fontWeight: 700, color: resolvedColor,
                    fontFamily: 'monospace', animation: 'countUp 0.6s ease backwards'
                }}>{numValue}%</div>
                <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase' }}>{label}</div>
                {subtitle && <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2 }}>{subtitle}</div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  5. NEON PROGRESS BAR — enhanced with label, animated fill, threshold
// ═══════════════════════════════════════════════════════════════════════════
export const NeonProgressBar = ({
                                    value, max, color = THEME.primary, label, showPercent = false, height = 6,
                                    thresholds, animate = true
                                }) => {
    const percent = Math.min((value / (max || 1)) * 100, 100);
    const resolvedColor = thresholds
        ? percent >= (thresholds.critical || 90) ? THEME.danger
            : percent >= (thresholds.warning || 70) ? THEME.warning
                : color
        : color;

    return (
        <div>
            {(label || showPercent) && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                    fontSize: 11, color: THEME.textMuted
                }}>
                    {label && <span>{label}</span>}
                    {showPercent && <span style={{ fontFamily: 'monospace', color: resolvedColor }}>
                        {percent.toFixed(1)}%
                    </span>}
                </div>
            )}
            <div style={{
                width: '100%', height, background: 'rgba(255,255,255,0.05)',
                borderRadius: height / 2, overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percent}%`, height: '100%',
                    background: `linear-gradient(90deg, ${resolvedColor}80, ${resolvedColor})`,
                    borderRadius: height / 2,
                    boxShadow: `0 0 10px ${resolvedColor}60`,
                    transition: animate ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                }} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  6. CUSTOM CHART TOOLTIP — enhanced styling
// ═══════════════════════════════════════════════════════════════════════════
export const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            backgroundColor: 'rgba(2, 6, 23, 0.95)', border: `1px solid ${THEME.glassBorder}`,
            borderRadius: 10, padding: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)', maxWidth: 260
        }}>
            {label && (
                <p style={{
                    color: THEME.textMuted, fontSize: 11, marginBottom: 8,
                    fontFamily: 'monospace', borderBottom: `1px solid ${THEME.glassBorder}`,
                    paddingBottom: 6
                }}>{label}</p>
            )}
            {payload.map((entry, i) => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}`
                    }} />
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>{entry.name}:</span>
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
                        {formatter ? formatter(entry.value, entry.name) :
                            (typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  7. LIVE STATUS BADGE — enhanced with connection count
// ═══════════════════════════════════════════════════════════════════════════
export const LiveStatusBadge = ({ connected = true, label, count }) => {
    injectKeyframes();
    const color = connected ? THEME.success : THEME.danger;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: `${color}10`, padding: '5px 12px', borderRadius: 20,
            border: `1px solid ${color}30`
        }}>
            <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
                {connected && (
                    <div style={{
                        position: 'absolute', inset: -4, borderRadius: '50%',
                        background: color, opacity: 0.4,
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }} />
                )}
            </div>
            <span style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                {label || (connected ? 'LIVE' : 'DISCONNECTED')}
            </span>
            {count !== undefined && (
                <span style={{
                    fontSize: 10, background: `${color}20`, color,
                    padding: '1px 6px', borderRadius: 8, fontFamily: 'monospace', fontWeight: 700
                }}>{count}</span>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  8. EMPTY STATE — enhanced with action button
// ═══════════════════════════════════════════════════════════════════════════
export const EmptyState = ({ icon: Icon, text, action, onAction }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', color: THEME.textMuted,
        gap: 16, opacity: 0.7, padding: 30
    }}>
        <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.06)'
        }}>
            <Icon size={32} />
        </div>
        <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 240 }}>{text}</div>
        {action && (
            <button onClick={onAction} style={{
                background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}40`,
                color: THEME.primary, padding: '8px 20px', borderRadius: 8,
                cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 4
            }}>{action}</button>
        )}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  9. AI AGENT VIEW — enhanced with copy, collapsible sections
// ═══════════════════════════════════════════════════════════════════════════
export const AIAgentView = ({ type, data }) => {
    const [copied, copy] = useCopyToClipboard();

    if (!data) return <EmptyState icon={Terminal} text="Select an item to analyze." />;

    const getSqlContent = () => {
        if (type === 'api') return data.queries?.map(q => q.sql).join('\n\n') || '';
        if (type === 'missing') return `CREATE INDEX CONCURRENTLY idx_${data.table}_${data.column}\nON ${data.table} (${data.column});`;
        if (type === 'unused') return `DROP INDEX CONCURRENTLY ${data.indexName};`;
        if (type === 'duplicate') return `-- Duplicate of: ${data.duplicateOf}\nDROP INDEX CONCURRENTLY ${data.indexName};`;
        return data.problem_query || '';
    };

    const renderSqlContext = () => {
        if (type === 'api') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.queries?.map((q, i) => (
                        <div key={i} style={{ borderBottom: `1px solid ${THEME.grid}`, paddingBottom: 12 }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                color: THEME.textMuted, fontSize: 11, marginBottom: 6
                            }}>
                                <span style={{ color: THEME.primary }}>{q.calls} Executions</span>
                                <span>{q.duration}ms avg</span>
                            </div>
                            <div style={{ color: '#a5b4fc' }}>{q.sql}</div>
                        </div>
                    ))}
                </div>
            );
        }
        if (type === 'missing') {
            return (
                <>
                    <div style={{ color: THEME.textMuted }}>-- Suggested Fix: Create Index</div>
                    <div style={{ color: THEME.success, marginTop: 4 }}>
                        CREATE INDEX CONCURRENTLY idx_{data.table}_{data.column}<br />
                        ON {data.table} ({data.column});
                    </div>
                    <div style={{ color: THEME.textMuted, marginTop: 16 }}>-- Impact Analysis</div>
                    <div style={{ marginTop: 4 }}>Seq scans reduced: {data.improvement || 'significant'}</div>
                    <div>Table size: {data.tableSize || 'N/A'}</div>
                </>
            );
        }
        if (type === 'unused') {
            return (
                <>
                    <div style={{ color: THEME.textMuted }}>-- Suggested Fix: Drop Unused Index</div>
                    <div style={{ color: THEME.danger, marginTop: 4 }}>
                        DROP INDEX CONCURRENTLY {data.indexName};
                    </div>
                    <div style={{ color: THEME.textMuted, marginTop: 16 }}>-- Storage Reclaimed</div>
                    <div style={{ marginTop: 4 }}>Size: {data.size}</div>
                    <div>Scans: {data.scans ?? 0}</div>
                </>
            );
        }
        if (type === 'duplicate') {
            return (
                <>
                    <div style={{ color: THEME.textMuted }}>-- Duplicate Index Detected</div>
                    <div style={{ color: THEME.warning, marginTop: 4 }}>
                        -- Columns: {data.columns}
                    </div>
                    <div style={{ color: THEME.danger, marginTop: 8 }}>
                        DROP INDEX CONCURRENTLY {data.indexName};
                    </div>
                    <div style={{ color: THEME.textMuted, marginTop: 16 }}>-- Keeps: {data.duplicateOf}</div>
                    <div style={{ marginTop: 4 }}>Size saved: {data.size}</div>
                </>
            );
        }
        return <>{data.problem_query || "Query optimization suggested..."}</>;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
            {/* AI insight panel */}
            <div style={{
                background: 'rgba(168, 85, 247, 0.08)', border: `1px solid ${THEME.ai}30`,
                borderRadius: 12, padding: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                        width: 24, height: 24, background: `linear-gradient(135deg, ${THEME.ai}, #7c3aed)`,
                        borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 12px ${THEME.ai}50`
                    }}>
                        <Zap size={13} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.ai, letterSpacing: '0.5px' }}>
                        AI ANALYSIS
                    </span>
                    <SeverityBadge severity={
                        type === 'unused' ? 'warning' : type === 'missing' ? 'critical' :
                            type === 'duplicate' ? 'info' : 'info'
                    } />
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: THEME.textMain, margin: 0 }}>
                    {type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete.')}
                </p>
            </div>

            {/* SQL context terminal */}
            <div style={{
                flex: 1, background: '#0a0e1a', borderRadius: 12,
                border: `1px solid ${THEME.grid}`, overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{
                    background: '#141b2d', padding: '8px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: `1px solid ${THEME.grid}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                        </div>
                        <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace' }}>
                            CONTEXT.sql
                        </span>
                    </div>
                    <button onClick={() => copy(getSqlContent())} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: copied ? THEME.success : THEME.textMuted,
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10
                    }}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <div style={{
                    padding: 16, fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13, color: '#a5b4fc', lineHeight: 1.7, flex: 1, overflowY: 'auto'
                }}>
                    {renderSqlContext()}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  10. ALERT BANNER — for the v2 alert engine
// ═══════════════════════════════════════════════════════════════════════════
const SEVERITY_CONFIG = {
    critical: { color: THEME.danger, icon: XCircle, bg: 'rgba(239,68,68,0.08)' },
    warning:  { color: THEME.warning, icon: AlertTriangle, bg: 'rgba(245,158,11,0.08)' },
    info:     { color: THEME.info || '#3b82f6', icon: Info, bg: 'rgba(59,130,246,0.08)' },
};

export const AlertBanner = ({ alert, onAcknowledge, onDismiss, compact = false }) => {
    injectKeyframes();
    if (!alert) return null;
    const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
    const Icon = config.icon;

    if (compact) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: config.bg, borderRadius: 8, border: `1px solid ${config.color}30`,
                fontSize: 12, animation: 'alertSlide 0.3s ease backwards'
            }}>
                <Icon size={14} color={config.color} />
                <span style={{ color: THEME.textMain, flex: 1 }}>{alert.message}</span>
                <span style={{ color: THEME.textMuted, fontSize: 10, fontFamily: 'monospace' }}>
                    {new Date(alert.ts).toLocaleTimeString()}
                </span>
                {onAcknowledge && !alert.acknowledged && (
                    <button onClick={() => onAcknowledge(alert.id)} style={{
                        background: 'none', border: `1px solid ${config.color}40`,
                        color: config.color, padding: '2px 8px', borderRadius: 6,
                        cursor: 'pointer', fontSize: 10, fontWeight: 600
                    }}>ACK</button>
                )}
            </div>
        );
    }

    return (
        <div style={{
            background: config.bg, borderRadius: 12, padding: 16,
            border: `1px solid ${config.color}25`,
            animation: 'alertSlide 0.4s ease backwards',
            display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${config.color}15`, color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <Icon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <SeverityBadge severity={alert.severity} />
                    <span style={{
                        fontSize: 10, color: THEME.textMuted, fontFamily: 'monospace',
                        textTransform: 'uppercase'
                    }}>{alert.category}</span>
                    <span style={{ fontSize: 10, color: THEME.textMuted, marginLeft: 'auto' }}>
                        {new Date(alert.ts).toLocaleTimeString()}
                    </span>
                </div>
                <p style={{ fontSize: 13, color: THEME.textMain, margin: 0, lineHeight: 1.5 }}>
                    {alert.message}
                </p>
                {alert.data && Object.keys(alert.data).length > 0 && (
                    <div style={{
                        marginTop: 8, fontSize: 11, color: THEME.textMuted,
                        fontFamily: 'monospace', display: 'flex', gap: 12, flexWrap: 'wrap'
                    }}>
                        {Object.entries(alert.data).map(([k, v]) => (
                            <span key={k}>{k}: <span style={{ color: config.color }}>{String(v)}</span></span>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {onAcknowledge && !alert.acknowledged && (
                    <button onClick={() => onAcknowledge(alert.id)} style={{
                        background: `${config.color}15`, border: `1px solid ${config.color}30`,
                        color: config.color, padding: '6px 12px', borderRadius: 8,
                        cursor: 'pointer', fontSize: 11, fontWeight: 600
                    }}>Acknowledge</button>
                )}
                {onDismiss && (
                    <button onClick={onDismiss} style={{
                        background: 'none', border: 'none', color: THEME.textMuted,
                        cursor: 'pointer', padding: 4
                    }}><X size={14} /></button>
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
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
            padding: '2px 8px', borderRadius: 6,
            background: `${config.color}20`, color: config.color,
            border: `1px solid ${config.color}30`
        }}>{severity}</span>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  12. WEBSOCKET STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════
export const WebSocketStatus = ({ connected, clientCount, lastMessage }) => {
    injectKeyframes();
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: connected ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            padding: '6px 14px', borderRadius: 20,
            border: `1px solid ${connected ? THEME.success : THEME.danger}25`
        }}>
            {connected ? <Wifi size={13} color={THEME.success} /> : <WifiOff size={13} color={THEME.danger} />}
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? THEME.success : THEME.danger }}>
                {connected && (
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%', background: THEME.success,
                        animation: 'ping 2s ease-in-out infinite'
                    }} />
                )}
            </div>
            <span style={{
                fontSize: 11, fontWeight: 600,
                color: connected ? THEME.success : THEME.danger
            }}>
                {connected ? 'WS Connected' : 'WS Disconnected'}
            </span>
            {clientCount !== undefined && (
                <span style={{
                    fontSize: 10, fontFamily: 'monospace', color: THEME.textMuted,
                    background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 6
                }}>{clientCount} clients</span>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  13. RBAC ROLE BADGE
// ═══════════════════════════════════════════════════════════════════════════
const ROLE_CONFIG = {
    super_admin: { color: '#f59e0b', icon: ShieldCheck, label: 'Super Admin' },
    dba:         { color: THEME.primary, icon: Shield, label: 'DBA' },
    viewer:      { color: THEME.textMuted, icon: Eye, label: 'Viewer' },
};

export const RoleBadge = ({ role, showIcon = true, size = 'default' }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
    const Icon = config.icon;
    const isSmall = size === 'small';
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: isSmall ? 4 : 6,
            background: `${config.color}12`, padding: isSmall ? '2px 8px' : '4px 12px',
            borderRadius: isSmall ? 6 : 8, border: `1px solid ${config.color}25`
        }}>
            {showIcon && <Icon size={isSmall ? 10 : 13} color={config.color} />}
            <span style={{
                fontSize: isSmall ? 10 : 11, fontWeight: 700, color: config.color,
                textTransform: 'uppercase', letterSpacing: 0.5
            }}>{config.label}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  14. QUERY HISTORY ITEM — for the v2 query history feature
// ═══════════════════════════════════════════════════════════════════════════
export const QueryHistoryItem = ({ entry, onFavourite, onTag, onReplay, onCopy }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.5)', borderRadius: 10,
            border: `1px solid ${THEME.glassBorder}`,
            overflow: 'hidden', transition: 'all 0.2s',
            animation: 'fadeIn 0.3s ease backwards'
        }}>
            {/* Header row */}
            <div onClick={() => setExpanded(!expanded)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                cursor: 'pointer', transition: 'background 0.2s'
            }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: entry.success ? THEME.success : THEME.danger, flexShrink: 0
                }} />
                <span style={{
                    flex: 1, fontSize: 12, color: THEME.textMain, fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{entry.sql}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {entry.tag && (
                        <span style={{
                            fontSize: 9, background: `${THEME.primary}20`, color: THEME.primary,
                            padding: '1px 6px', borderRadius: 6, fontWeight: 600
                        }}>{entry.tag}</span>
                    )}
                    <span style={{
                        fontSize: 10, color: entry.durationMs > 1000 ? THEME.warning : THEME.textMuted,
                        fontFamily: 'monospace'
                    }}>{entry.durationMs}ms</span>
                    <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: 'monospace' }}>
                        {entry.rowCount}r
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onFavourite?.(entry.id); }} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                        color: entry.favourite ? '#f59e0b' : THEME.textMuted
                    }}>
                        {entry.favourite ? <Star size={12} fill="#f59e0b" /> : <StarOff size={12} />}
                    </button>
                    <ChevronDown size={12} color={THEME.textMuted} style={{
                        transition: 'transform 0.2s',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div style={{
                    padding: '0 14px 12px', borderTop: `1px solid ${THEME.glassBorder}`
                }}>
                    <pre style={{
                        fontSize: 12, color: '#a5b4fc', fontFamily: "'JetBrains Mono', monospace",
                        background: '#0a0e1a', padding: 12, borderRadius: 8, margin: '10px 0',
                        overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                    }}>{entry.sql}</pre>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: 11, color: THEME.textMuted
                    }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <span>User: {entry.user}</span>
                            <span>{new Date(entry.ts).toLocaleString()}</span>
                            {entry.error && <span style={{ color: THEME.danger }}>Error: {entry.error}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {onCopy && <MiniButton icon={Copy} onClick={() => onCopy(entry.sql)} tooltip="Copy" />}
                            {onReplay && <MiniButton icon={RefreshCw} onClick={() => onReplay(entry.sql)} tooltip="Replay" />}
                            {onTag && <MiniButton icon={Tag} onClick={() => onTag(entry.id)} tooltip="Tag" />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  15. CONNECTION POOL BAR — visualizes pool.total / idle / waiting
// ═══════════════════════════════════════════════════════════════════════════
export const ConnectionPoolBar = ({ total, idle, active, waiting, max }) => {
    const segments = [
        { label: 'Active', value: active || (total - idle), color: THEME.primary },
        { label: 'Idle', value: idle, color: THEME.success },
        { label: 'Waiting', value: waiting, color: THEME.warning },
    ];
    const barMax = max || total || 1;

    return (
        <div>
            <div style={{
                display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.glassBorder}`
            }}>
                {segments.map((seg, i) => (
                    seg.value > 0 && (
                        <div key={i} style={{
                            width: `${(seg.value / barMax) * 100}%`,
                            background: `linear-gradient(180deg, ${seg.color}80, ${seg.color}50)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: 'monospace',
                            transition: 'width 0.6s ease',
                            borderRight: i < segments.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none'
                        }}>{seg.value > 0 ? seg.value : ''}</div>
                    )
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: 2, background: seg.color
                        }} />
                        <span style={{ fontSize: 10, color: THEME.textMuted }}>
                            {seg.label}: <span style={{ color: '#fff', fontWeight: 600 }}>{seg.value}</span>
                        </span>
                    </div>
                ))}
                {max && (
                    <span style={{ fontSize: 10, color: THEME.textMuted, marginLeft: 'auto' }}>
                        Max: {max}
                    </span>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  16. BLOAT STATUS BADGE — for bloat endpoint
// ═══════════════════════════════════════════════════════════════════════════
export const BloatStatusBadge = ({ status, bloatPct }) => {
    const config = {
        critical: { color: THEME.danger, icon: XCircle },
        warning:  { color: THEME.warning, icon: AlertTriangle },
        ok:       { color: THEME.success, icon: CheckCircle }
    }[status] || { color: THEME.textMuted, icon: Info };
    const Icon = config.icon;

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${config.color}12`, padding: '3px 10px',
            borderRadius: 6, border: `1px solid ${config.color}25`
        }}>
            <Icon size={11} color={config.color} />
            <span style={{ fontSize: 10, fontWeight: 700, color: config.color, textTransform: 'uppercase' }}>
                {status}
            </span>
            {bloatPct !== undefined && (
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: config.color }}>
                    {bloatPct}%
                </span>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  17. SETTINGS ROW — for PG settings viewer
// ═══════════════════════════════════════════════════════════════════════════
export const SettingRow = ({ name, value, unit, description, category, context }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
        borderBottom: `1px solid ${THEME.glassBorder}`,
        animation: 'fadeIn 0.3s ease backwards'
    }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: THEME.primary, fontWeight: 600 }}>
                    {name}
                </span>
                <span style={{
                    fontSize: 9, background: 'rgba(255,255,255,0.05)',
                    padding: '1px 6px', borderRadius: 4, color: THEME.textMuted
                }}>{context}</span>
            </div>
            {description && (
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>{description}</div>
            )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#fff', fontWeight: 700 }}>
                {value}
            </span>
            {unit && <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: 4 }}>{unit}</span>}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  18. SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════
export const SkeletonLoader = ({ rows = 3, height = 16, gap = 10, style: customStyle }) => {
    injectKeyframes();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap, ...customStyle }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={{
                    height, borderRadius: 6,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease infinite',
                    width: i === rows - 1 ? '60%' : '100%'
                }} />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  19. LOADING OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
const LoadingOverlay = () => {
    injectKeyframes();
    return (
        <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.5)', zIndex: 10, borderRadius: 12
        }}>
            <Loader size={24} color={THEME.primary} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  20. MINI BUTTON (utility)
// ═══════════════════════════════════════════════════════════════════════════
export const MiniButton = ({ icon: Icon, onClick, tooltip, color = THEME.textMuted, active }) => (
    <button onClick={onClick} title={tooltip} style={{
        background: active ? `${THEME.primary}20` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? THEME.primary + '40' : THEME.glassBorder}`,
        color: active ? THEME.primary : color, borderRadius: 6, padding: 5,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transition: 'all 0.2s'
    }}>
        <Icon size={12} />
    </button>
);

// ═══════════════════════════════════════════════════════════════════════════
//  21. DATA TABLE — sortable, searchable
// ═══════════════════════════════════════════════════════════════════════════
export const DataTable = ({
                              columns, data, sortable = true, searchable = false, pageSize = 20,
                              emptyText = 'No data', onRowClick, rowKey = 'id', compact = false
                          }) => {
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(row =>
            columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
        );
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

    const toggleSort = (key) => {
        if (!sortable) return;
        setSort(prev => ({
            key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div>
            {searchable && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    padding: '6px 12px', border: `1px solid ${THEME.glassBorder}`
                }}>
                    <Search size={13} color={THEME.textMuted} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                           placeholder="Search..." style={{
                        background: 'none', border: 'none', color: '#fff',
                        fontSize: 12, outline: 'none', flex: 1
                    }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{
                            background: 'none', border: 'none', color: THEME.textMuted,
                            cursor: 'pointer', padding: 0
                        }}><X size={12} /></button>
                    )}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                                textAlign: col.align || 'left', padding: compact ? '6px 8px' : '8px 12px',
                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.5px', color: THEME.textMuted,
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                                cursor: sortable ? 'pointer' : 'default',
                                whiteSpace: 'nowrap', userSelect: 'none'
                            }}>
                                {col.label}
                                {sort.key === col.key && (
                                    <span style={{ marginLeft: 4 }}>
                                            {sort.dir === 'asc' ? '↑' : '↓'}
                                        </span>
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paged.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} style={{
                                textAlign: 'center', padding: 30,
                                color: THEME.textMuted, fontSize: 12
                            }}>{emptyText}</td>
                        </tr>
                    ) : paged.map((row, ri) => (
                        <tr key={row[rowKey] ?? ri}
                            onClick={() => onRowClick?.(row)}
                            style={{
                                cursor: onRowClick ? 'pointer' : 'default',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {columns.map(col => (
                                <td key={col.key} style={{
                                    padding: compact ? '6px 8px' : '10px 12px',
                                    fontSize: compact ? 11 : 12,
                                    color: THEME.textMain,
                                    borderBottom: `1px solid rgba(255,255,255,0.03)`,
                                    textAlign: col.align || 'left',
                                    fontFamily: col.mono ? 'monospace' : 'inherit',
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
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 12, fontSize: 11, color: THEME.textMuted
                }}>
                    <span>{sorted.length} rows</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                            <button key={i} onClick={() => setPage(i)} style={{
                                background: page === i ? THEME.primary : 'rgba(255,255,255,0.05)',
                                border: 'none', color: page === i ? '#fff' : THEME.textMuted,
                                width: 24, height: 24, borderRadius: 6,
                                cursor: 'pointer', fontSize: 11
                            }}>{i + 1}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  22. FILTER PILLS — for alert/query filtering
// ═══════════════════════════════════════════════════════════════════════════
export const FilterPills = ({ options, active, onChange, multi = false }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(opt => {
            const key = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const isActive = multi ? active?.includes(key) : active === key;

            return (
                <button key={key} onClick={() => onChange(key)} style={{
                    background: isActive ? `${THEME.primary}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? THEME.primary + '50' : THEME.glassBorder}`,
                    color: isActive ? THEME.primary : THEME.textMuted,
                    padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, transition: 'all 0.2s'
                }}>{label}</button>
            );
        })}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  23. CACHE STATS RING — for admin/cache/stats
// ═══════════════════════════════════════════════════════════════════════════
export const CacheStatsRing = ({ size: cacheSize, maxSize, hitRate }) => {
    const usagePct = maxSize ? (cacheSize / maxSize) * 100 : 0;
    const data = [
        { name: 'Used', value: cacheSize, fill: THEME.primary },
        { name: 'Free', value: maxSize - cacheSize, fill: 'rgba(255,255,255,0.05)' },
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 100, height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} innerRadius={30} outerRadius={45} paddingAngle={2}
                             dataKey="value" stroke="none">
                            {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4 }}>App Cache</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                    {cacheSize}<span style={{ fontSize: 12, color: THEME.textMuted }}>/{maxSize}</span>
                </div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                    Usage: {usagePct.toFixed(0)}%
                </div>
                {hitRate !== undefined && (
                    <div style={{ fontSize: 11, color: THEME.success, marginTop: 2 }}>
                        Hit rate: {hitRate}%
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  24. EXTENSION CARD — for admin/extensions
// ═══════════════════════════════════════════════════════════════════════════
export const ExtensionCard = ({ name, version, schema, description }) => (
    <div style={{
        background: 'rgba(15, 23, 42, 0.4)', borderRadius: 10,
        border: `1px solid ${THEME.glassBorder}`, padding: 14,
        display: 'flex', alignItems: 'center', gap: 12
    }}>
        <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${THEME.primary}12`, color: THEME.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${THEME.primary}20`
        }}>
            <Database size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</span>
                <span style={{
                    fontSize: 10, background: 'rgba(255,255,255,0.06)',
                    padding: '1px 6px', borderRadius: 4, color: THEME.textMuted, fontFamily: 'monospace'
                }}>v{version}</span>
            </div>
            {description && (
                <div style={{
                    fontSize: 11, color: THEME.textMuted, marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{description}</div>
            )}
        </div>
        <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: 'monospace' }}>{schema}</span>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  25. SEQUENCE USAGE BAR — for admin/sequences
// ═══════════════════════════════════════════════════════════════════════════
export const SequenceUsageBar = ({ name, usagePct, lastValue, maxValue, cycle }) => (
    <div style={{ marginBottom: 12 }}>
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4
        }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: THEME.textMain }}>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {cycle && (
                    <span style={{
                        fontSize: 9, background: `${THEME.success}15`, color: THEME.success,
                        padding: '1px 6px', borderRadius: 4
                    }}>CYCLE</span>
                )}
                <span style={{
                    fontSize: 11, fontFamily: 'monospace',
                    color: usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.textMuted
                }}>{usagePct}%</span>
            </div>
        </div>
        <NeonProgressBar value={usagePct} max={100}
                         color={usagePct > 80 ? THEME.danger : usagePct > 50 ? THEME.warning : THEME.success}
                         height={4}
        />
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  26. STATUS DOT — reusable tiny status indicator
// ═══════════════════════════════════════════════════════════════════════════
export const StatusDot = ({ status, size = 8, pulse = false }) => {
    injectKeyframes();
    const color = status === 'active' || status === 'ok' ? THEME.success
        : status === 'idle' ? THEME.warning
            : status === 'error' || status === 'critical' ? THEME.danger
                : THEME.textMuted;

    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color,
            boxShadow: `0 0 6px ${color}60`,
            animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none'
        }} />
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  27. COPY BUTTON (standalone)
// ═══════════════════════════════════════════════════════════════════════════
export const CopyButton = ({ text, size = 'default' }) => {
    const [copied, copy] = useCopyToClipboard();
    const isSmall = size === 'small';
    return (
        <button onClick={() => copy(text)} style={{
            background: copied ? `${THEME.success}15` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? THEME.success + '40' : THEME.glassBorder}`,
            color: copied ? THEME.success : THEME.textMuted,
            padding: isSmall ? '3px 8px' : '5px 12px', borderRadius: 6,
            cursor: 'pointer', fontSize: isSmall ? 10 : 11,
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
        }}>
            {copied ? <Check size={isSmall ? 10 : 12} /> : <Copy size={isSmall ? 10 : 12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
};
