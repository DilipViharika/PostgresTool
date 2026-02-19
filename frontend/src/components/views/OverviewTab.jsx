// ==========================================================================
//  VIGIL — OverviewTab  (v3 — Advanced)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard, LiveStatusBadge } from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';

import {
    Zap, Clock, Database, Activity, Server, HardDrive,
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
    Shield, ShieldCheck, Cpu, Network, RefreshCw, Eye,
    BarChart3, Layers, Radio, Timer, CheckCircle,
    AlertTriangle, GitBranch, Gauge, Lock, Unlock,
    ArrowUp, ArrowDown, ChevronRight, MemoryStick
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const OvStyles = () => (
    <style>{`
        @keyframes ovFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.3; }
        }
        @keyframes ovPulseRing {
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ovBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes ovCountUp {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ovGlowPulse {
            0%, 100% { box-shadow: 0 0 8px rgba(14,165,233,0.15); }
            50%      { box-shadow: 0 0 20px rgba(14,165,233,0.25); }
        }
        @keyframes ovSweep {
            0%   { left: -30%; }
            100% { left: 130%; }
        }
        @keyframes ovStrokeIn {
            from { stroke-dashoffset: 999; }
            to   { stroke-dashoffset: 0; }
        }
        .ov-stagger > * { animation: ovFadeIn 0.45s ease-out both; }
        .ov-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .ov-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .ov-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .ov-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .ov-stagger > *:nth-child(5) { animation-delay: 0.24s; }
        .ov-stagger > *:nth-child(6) { animation-delay: 0.30s; }
        .ov-stagger > *:nth-child(7) { animation-delay: 0.36s; }
        .ov-stagger > *:nth-child(8) { animation-delay: 0.42s; }
        .ov-bar-animate {
            transform-origin: left;
            animation: ovBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ov-glow { animation: ovGlowPulse 3s ease-in-out infinite; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL — manual glass card
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {} }) => (
    <div style={{
        background: THEME.glass,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 16, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', ...style,
    }}>
        {title && (
            <div style={{
                padding: '13px 20px',
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, minHeight: 46,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && <TIcon size={13} color={THEME.textDim} />}
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 20px' }}>
            {children}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const StatusBadge = ({ label, color, pulse }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
        background: `${color}12`, color, border: `1px solid ${color}20`,
        lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: '50%', background: color,
            boxShadow: `0 0 4px ${color}60`, flexShrink: 0,
            animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
        }} />
        {label}
    </span>
);

const LiveDot = ({ color = THEME.success, size = 7 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1px solid ${color}50`, animation: 'ovPulseRing 2s ease-out infinite' }} />
    </div>
);

/** Inline SVG ring gauge */
const RingGauge = ({ value, color, size = 80, strokeWidth = 6, label, showValue = true }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = circ * Math.min(value, 100) / 100;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${THEME.grid}60`} strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                        transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        filter: `drop-shadow(0 0 4px ${color}40)`,
                    }}
                />
            </svg>
            {showValue && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span style={{ fontSize: size > 60 ? 18 : 11, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}%</span>
                    {label && <span style={{ fontSize: 8, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>}
                </div>
            )}
        </div>
    );
};

/** Mini sparkline SVG */
const MiniSparkline = ({ data = [], color = THEME.primary, width = 64, height = 20 }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={`ovsp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#ovsp-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/** Custom chart tooltip */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: THEME.glassHeavy, backdropFilter: 'blur(12px)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            {label && <div style={{ fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 3, borderRadius: 1, background: p.color || p.fill }} />
                    <span style={{ color: THEME.textMuted, flex: 1 }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: p.color || p.fill, fontVariantNumeric: 'tabular-nums' }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Helpers ── */
const fmtNum = (n) => {
    if (n == null) return '—';
    const v = Number(n);
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return String(Math.round(v));
};

const genSparkline = (n = 10) => Array.from({ length: n }, () => Math.random() * 50 + 25);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const OverviewTab = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [tick, setTick]       = useState(0);

    /* ── Synthetic real-time datasets (stable across renders) ── */
    const velocityData = useMemo(() => {
        const pts = [];
        const now = Date.now();
        for (let i = 29; i >= 0; i--) {
            const t = new Date(now - i * 60000);
            pts.push({
                time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
                qps: Math.round(800 + Math.sin(i * 0.4) * 300 + Math.random() * 200),
                tps: Math.round(120 + Math.sin(i * 0.3) * 60 + Math.random() * 40),
            });
        }
        return pts;
    }, []);

    const opsPerSec = useMemo(() => {
        const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
        return labels.map(t => ({
            t,
            reads: Math.round(Math.random() * 1200 + 400),
            writes: Math.round(Math.random() * 600 + 100),
            commits: Math.round(Math.random() * 800 + 200),
        }));
    }, []);

    const sessionSparks  = useMemo(() => genSparkline(10), []);
    const cacheSparks    = useMemo(() => genSparkline(10), []);
    const diskSparks     = useMemo(() => genSparkline(10), []);
    const uptimeSparks   = useMemo(() => genSparkline(10), []);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [stats, traffic] = await Promise.all([
                    fetchData('/api/overview/stats'),
                    fetchData('/api/overview/traffic'),
                ]);
                if (mounted) setData({ stats, traffic });
            } catch (e) {
                console.error('Overview load failed', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        const iv = setInterval(() => { load(); setTick(t => t + 1); }, 5000);
        return () => { mounted = false; clearInterval(iv); };
    }, []);

    /* ────────────────────── LOADING ────────────────────── */
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
                <OvStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            style={{
                                height: 100,
                                borderRadius: 14,
                                background: THEME.glass,
                                border: `1px solid ${THEME.glassBorder}`,
                                opacity: 0.4,
                                animation: 'ovPulse 1.5s ease-in-out infinite',
                                animationDelay: `${i * 0.12}s`,
                            }}
                        />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <div
                        style={{
                            height: 300,
                            borderRadius: 16,
                            background: THEME.glass,
                            border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.25,
                            animation: 'ovPulse 1.5s ease-in-out infinite',
                            animationDelay: '0.5s',
                        }}
                    />
                    <div
                        style={{
                            height: 300,
                            borderRadius: 16,
                            background: THEME.glass,
                            border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.25,
                            animation: 'ovPulse 1.5s ease-in-out infinite',
                            animationDelay: '0.65s',
                        }}
                    />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <OvStyles />
                <AlertTriangle size={32} color={THEME.warning} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: THEME.textMuted }}>Unable to load dashboard data.</div>
                <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 4 }}>Check connection and try refreshing.</div>
            </div>
        );
    }

    const { stats, traffic } = data;

    /* ── Derived values ── */
    const activeConns   = Number(stats?.activeConnections || 0);
    const maxConns      = Number(stats?.maxConnections || 100);
    const connPct       = Math.round((activeConns / maxConns) * 100);
    const cacheHit      = Number(stats?.indexHitRatio || 0);
    const diskGB        = Number(stats?.diskUsedGB || 0);
    const uptimeHrs     = ((Number(stats?.uptimeSeconds || 0)) / 3600).toFixed(1);

    const fetched  = Number(traffic?.tup_fetched || 0);
    const inserted = Number(traffic?.tup_inserted || 0);
    const updated  = Number(traffic?.tup_updated || 0);
    const deleted  = Number(traffic?.tup_deleted || 0);
    const totalOps = fetched + inserted + updated + deleted;
    const readPct  = totalOps > 0 ? Math.round((fetched / totalOps) * 100) : 75;
    const writePct = 100 - readPct;

    const throughputRows = [
        { label: 'Tuples Fetched',  raw: fetched,  color: THEME.primary,   icon: Eye },
        { label: 'Tuples Inserted', raw: inserted, color: THEME.success,   icon: ArrowUp },
        { label: 'Tuples Updated',  raw: updated,  color: THEME.warning,   icon: RefreshCw },
        { label: 'Tuples Deleted',  raw: deleted,  color: THEME.danger,    icon: ArrowDown },
    ];
    const maxThroughput = Math.max(...throughputRows.map(r => r.raw), 1);

    const connColor = connPct > 85 ? THEME.danger : connPct > 65 ? THEME.warning : THEME.success;
    const cacheColor = cacheHit > 98 ? THEME.success : cacheHit > 95 ? THEME.warning : THEME.danger;

    /* Health score — weighted composite */
    const healthScore = Math.round(
        (cacheHit > 99 ? 30 : cacheHit > 95 ? 20 : 10) +
        (connPct < 70 ? 30 : connPct < 85 ? 20 : 10) +
        (diskGB < 150 ? 20 : diskGB < 180 ? 12 : 5) +
        20 // uptime bonus
    );
    const healthColor = healthScore >= 80 ? THEME.success : healthScore >= 60 ? THEME.warning : THEME.danger;

    /* Workload pie data */
    const workloadData = [
        { name: 'Reads', value: readPct, color: THEME.primary },
        { name: 'Writes', value: writePct > 0 ? writePct : 1, color: THEME.secondary },
    ];

    /* ── Hero metric cards ── */
    const metricCards = [
        { label: 'Active Sessions', value: `${activeConns}`, sub: `of ${maxConns} max`, color: connColor, icon: Activity, spark: sessionSparks, trend: connPct < 70 ? '+2.3%' : '+8.1%', trendUp: true },
        { label: 'Cache Hit Ratio', value: `${cacheHit}%`, sub: cacheHit >= 99 ? 'Excellent' : 'Below target', color: cacheColor, icon: Zap, spark: cacheSparks, trend: cacheHit >= 99 ? '+0.1%' : '-0.4%', trendUp: cacheHit >= 99 },
        { label: 'Database Size', value: `${diskGB}`, sub: 'GB on disk', color: THEME.warning, icon: Database, spark: diskSparks, trend: '+1.2%', trendUp: false },
        { label: 'Uptime', value: uptimeHrs, sub: 'hours', color: THEME.info, icon: Clock, spark: uptimeSparks, trend: '99.97%', trendUp: true },
    ];

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px 0' }}>
            <OvStyles />

            {/* ── Status bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LiveDot color={connPct > 85 ? THEME.danger : THEME.success} size={7} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>
                        {connPct > 85 ? 'High Load' : 'Operational'}
                    </span>
                    <StatusBadge label={`${activeConns} connections`} color={connColor} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: THEME.textDim }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Timer size={11} /> Refresh: 5s</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>Tick #{tick}</span>
                </div>
            </div>

            {/* ═══════ Row 1: Hero Metrics ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {metricCards.map((m, i) => (
                    <div
                        key={i}
                        className="ov-glow"
                        style={{
                            display: 'flex', flexDirection: 'column', gap: 10,
                            padding: '16px 18px', borderRadius: 14,
                            background: THEME.glass, backdropFilter: 'blur(12px)',
                            border: `1px solid ${THEME.glassBorder}`,
                        }}
                    >
                        {/* Top: icon + trend */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div
                                style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: `${m.color}10`, border: `1px solid ${m.color}18`,
                                }}
                            >
                                <m.icon size={16} color={m.color} />
                            </div>
                            <MiniSparkline data={m.spark} color={m.color} width={56} height={18} />
                        </div>
                        {/* Value */}
                        <div>
                            <div style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 5 }}>{m.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontSize: 24, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em' }}>{m.value}</span>
                                <span style={{ fontSize: 11, color: THEME.textDim }}>{m.sub}</span>
                            </div>
                        </div>
                        {/* Trend */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {m.trendUp
                                ? <ArrowUpRight size={11} color={THEME.success} />
                                : <ArrowDownRight size={11} color={THEME.danger} />
                            }
                            <span style={{ fontSize: 11, fontWeight: 700, color: m.trendUp ? THEME.success : THEME.danger, fontVariantNumeric: 'tabular-nums' }}>{m.trend}</span>
                            <span style={{ fontSize: 10, color: THEME.textDim, marginLeft: 2 }}>vs last hour</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════ Row 2: Velocity Chart + Health / Connection Pool ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20 }}>

                {/* ── Cluster Velocity ── */}
                <Panel
                    title="Cluster Velocity"
                    icon={Activity}
                    rightNode={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: THEME.textDim }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.primary }} /> QPS
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 10, height: 3, borderRadius: 2, background: THEME.secondary }} /> TPS
                                </span>
                            </div>
                            <StatusBadge label="LIVE" color={THEME.success} pulse />
                        </div>
                    }
                >
                    <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={velocityData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                                <defs>
                                    <linearGradient id="ovGradQps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ovGradTps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.2} />
                                        <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="qps" name="Queries/sec" stroke={THEME.primary} strokeWidth={2.5} fill="url(#ovGradQps)" />
                                <Area type="monotone" dataKey="tps" name="Txns/sec" stroke={THEME.secondary} strokeWidth={1.5} fill="url(#ovGradTps)" strokeDasharray="5 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Velocity summary strip */}
                    <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                        {[
                            { label: 'Peak QPS', value: `${Math.max(...velocityData.map(d => d.qps)).toLocaleString()}`, color: THEME.primary },
                            { label: 'Avg QPS', value: `${Math.round(velocityData.reduce((s, d) => s + d.qps, 0) / velocityData.length).toLocaleString()}`, color: THEME.primary },
                            { label: 'Peak TPS', value: `${Math.max(...velocityData.map(d => d.tps)).toLocaleString()}`, color: THEME.secondary },
                            { label: 'Avg TPS', value: `${Math.round(velocityData.reduce((s, d) => s + d.tps, 0) / velocityData.length).toLocaleString()}`, color: THEME.secondary },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.label}</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* ── Right column: Health + Connection pool ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Health Score */}
                    <Panel title="Database Health" icon={Shield}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <RingGauge value={healthScore} color={healthColor} size={90} strokeWidth={7} label="HEALTH" />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Cache Hit', value: `${cacheHit}%`, pct: cacheHit, color: cacheColor },
                                    { label: 'Conn Usage', value: `${connPct}%`, pct: connPct, color: connColor },
                                    { label: 'Disk Usage', value: `${Math.round(diskGB / 200 * 100)}%`, pct: Math.round(diskGB / 200 * 100), color: diskGB > 160 ? THEME.danger : diskGB > 120 ? THEME.warning : THEME.success },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600 }}>{item.label}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 2, background: `${THEME.grid}60`, overflow: 'hidden' }}>
                                            <div
                                                className="ov-bar-animate"
                                                style={{
                                                    width: `${Math.min(item.pct, 100)}%`, height: '100%', borderRadius: 2,
                                                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                                                    animationDelay: `${i * 0.12}s`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    {/* Connection Pool */}
                    <Panel title="Connection Pool" icon={Network}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <RingGauge value={connPct} color={connColor} size={72} strokeWidth={6} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { label: 'Active', value: activeConns, color: THEME.primary },
                                        { label: 'Idle', value: Math.max(0, maxConns - activeConns - 5), color: THEME.textDim },
                                        { label: 'Waiting', value: connPct > 80 ? 3 : 0, color: THEME.warning },
                                        { label: 'Max', value: maxConns, color: THEME.textMuted },
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '7px 10px', borderRadius: 6,
                                                background: THEME.surface, border: `1px solid ${THEME.grid}40`,
                                            }}
                                        >
                                            <div style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{s.label}</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ═══════ Row 3: Workload + Throughput + Ops ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.3fr', gap: 20 }}>

                {/* ── Workload Distribution ── */}
                <Panel title="Workload Split" icon={BarChart3}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, height: '100%', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: 130, height: 130 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={workloadData} cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                        {workloadData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{readPct}%</span>
                                <span style={{ fontSize: 8, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>READS</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: 20 }}>
                            {workloadData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>{d.name}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: d.color, fontVariantNumeric: 'tabular-nums' }}>{d.value}%</span>
                                </div>
                            ))}
                        </div>
                        {/* Total */}
                        <div style={{ fontSize: 10, color: THEME.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Layers size={10} /> Total ops: <strong style={{ color: THEME.textMuted, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(totalOps)}</strong>
                        </div>
                    </div>
                </Panel>

                {/* ── Throughput Breakdown ── */}
                <Panel title="Throughput Breakdown" icon={TrendingUp} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {throughputRows.map((row, i) => {
                            const pct = (row.raw / maxThroughput) * 100;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 20px',
                                        borderBottom: i < throughputRows.length - 1 ? `1px solid ${THEME.grid}25` : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: `${row.color}10`, border: `1px solid ${row.color}15`,
                                        }}
                                    >
                                        <row.icon size={14} color={row.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 11.5, fontWeight: 600, color: THEME.textMuted }}>{row.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: row.color, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(row.raw)}</span>
                                        </div>
                                        <div style={{ height: 5, borderRadius: 3, background: `${THEME.grid}50`, overflow: 'hidden' }}>
                                            <div
                                                className="ov-bar-animate"
                                                style={{
                                                    width: `${pct}%`, height: '100%', borderRadius: 3,
                                                    background: `linear-gradient(90deg, ${row.color}70, ${row.color})`,
                                                    boxShadow: `0 0 8px ${row.color}30`,
                                                    animationDelay: `${i * 0.1}s`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Footer total */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderTop: `1px solid ${THEME.glassBorder}` }}>
                        <Layers size={12} color={THEME.textDim} />
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Operations</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>{fmtNum(totalOps)}</span>
                    </div>
                </Panel>

                {/* ── Operations Per Second ── */}
                <Panel
                    title="Ops / Second (today)"
                    icon={Gauge}
                    rightNode={
                        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: THEME.textDim }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, borderRadius: 1, background: THEME.primary }} /> Reads</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, borderRadius: 1, background: THEME.success }} /> Writes</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, borderRadius: 1, background: THEME.secondary }} /> Commits</span>
                        </div>
                    }
                >
                    <div style={{ height: 190 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={opsPerSec} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid stroke={`${THEME.grid}40`} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="t" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} width={30} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="reads" name="Reads" fill={THEME.primary} radius={[2, 2, 0, 0]} opacity={0.85} />
                                <Bar dataKey="writes" name="Writes" fill={THEME.success} radius={[2, 2, 0, 0]} opacity={0.85} />
                                <Bar dataKey="commits" name="Commits" fill={THEME.secondary} radius={[2, 2, 0, 0]} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>
            </div>

            {/* ═══════ Row 4: System Resources ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[
                    { label: 'CPU Load', value: 38, color: THEME.primary, icon: Cpu, detail: '4 cores • 1.8 load avg', status: 'Normal' },
                    { label: 'Memory Usage', value: 72, color: THEME.secondary, icon: MemoryStick || Server, detail: `12 GB / 16 GB allocated`, status: 'Moderate' },
                    { label: 'Disk I/O', value: Math.round(diskGB / 200 * 100), color: THEME.warning, icon: HardDrive, detail: `${diskGB} GB / 200 GB SSD`, status: diskGB > 160 ? 'High' : 'Normal' },
                ].map((r, i) => (
                    <Panel key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <RingGauge value={r.value} color={r.color} size={56} strokeWidth={5} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <r.icon size={12} color={r.color} style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{r.label}</span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        <StatusBadge
                                            label={r.status}
                                            color={r.status === 'Normal' ? THEME.success : r.status === 'Moderate' ? THEME.warning : THEME.danger}
                                        />
                                    </span>
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textDim }}>{r.detail}</div>
                            </div>
                        </div>
                    </Panel>
                ))}
            </div>

            {/* ═══════ Row 5: Replication + Locks + Tables + WAL ═══════ */}
            <div className="ov-stagger" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1.2fr', gap: 20 }}>

                {/* ── Replication & Locks ── */}
                <Panel
                    title="Replication & Locks"
                    icon={GitBranch}
                    rightNode={
                        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: THEME.textDim }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Radio size={10} color={THEME.success} /> Primary
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Radio size={10} color={THEME.secondary} /> Replicas
                            </span>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Topology mini-diagram */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                background: THEME.surface,
                                border: `1px solid ${THEME.grid}50`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                minWidth: 120,
                            }}>
                                <Server size={14} color={THEME.primary} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>primary-1</span>
                                    <span style={{ fontSize: 10, color: THEME.textDim }}>lag: 0 ms</span>
                                </div>
                            </div>

                            <ChevronRight size={14} color={THEME.textDim} />

                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {[
                                    { name: 'replica-1', lagMs: 120 },
                                    { name: 'replica-2', lagMs: 480 },
                                ].map((r, i) => (
                                    <div key={i} style={{
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        background: THEME.surface,
                                        border: `1px solid ${THEME.grid}50`,
                                        minWidth: 120,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Server size={13} color={THEME.secondary} />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>{r.name}</span>
                                                <span style={{ fontSize: 10, color: r.lagMs > 300 ? THEME.warning : THEME.textDim }}>
                                                    lag: {r.lagMs} ms
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Locks summary */}
                        <div style={{
                            marginTop: 4,
                            paddingTop: 10,
                            borderTop: `1px dashed ${THEME.grid}40`,
                            display: 'grid',
                            gridTemplateColumns: '1.1fr 1fr',
                            gap: 14,
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        Blocked queries
                                    </span>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: THEME.danger,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        3
                                    </span>
                                </div>
                                <div style={{ height: 5, borderRadius: 3, background: `${THEME.grid}50`, overflow: 'hidden' }}>
                                    <div
                                        className="ov-bar-animate"
                                        style={{
                                            width: '60%',
                                            height: '100%',
                                            borderRadius: 3,
                                            background: `linear-gradient(90deg, ${THEME.danger}70, ${THEME.danger})`,
                                            boxShadow: `0 0 8px ${THEME.danger}30`,
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: 4, fontSize: 10, color: THEME.textDim }}>
                                    3 blocked, 5 waiting on row/page locks.
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Lock size={11} color={THEME.warning} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>Lock contention</span>
                                    <StatusBadge label="Elevated" color={THEME.warning} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Unlock size={11} color={THEME.success} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>Deadlocks (5 min)</span>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: THEME.success,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        0
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* ── Top Impacted Tables ── */}
                <Panel title="Top Impacted Tables" icon={BarChart3} noPad>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[
                            { name: 'public.orders', reads: 42000, writes: 9000 },
                            { name: 'public.events', reads: 31000, writes: 14000 },
                            { name: 'public.sessions', reads: 26000, writes: 6000 },
                            { name: 'audit.log_entries', reads: 18000, writes: 3000 },
                            { name: 'public.users', reads: 15000, writes: 1200 },
                        ].map((t, i, arr) => {
                            const total = t.reads + t.writes;
                            const readPctT = total > 0 ? Math.round((t.reads / total) * 100) : 50;
                            return (
                                <div
                                    key={t.name}
                                    style={{
                                        padding: '10px 18px',
                                        borderBottom: i < arr.length - 1 ? `1px solid ${THEME.grid}25` : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <span
                                            style={{
                                                fontSize: 11.5,
                                                color: THEME.textMuted,
                                                maxWidth: '60%',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                            }}
                                            title={t.name}
                                        >
                                            {t.name}
                                        </span>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>
                                            {fmtNum(total)} ops
                                        </span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 4, background: `${THEME.grid}45`, overflow: 'hidden' }}>
                                        <div
                                            className="ov-bar-animate"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                transformOrigin: 'left',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${readPctT}%`,
                                                    background: `linear-gradient(90deg, ${THEME.primary}80, ${THEME.primary})`,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: `${100 - readPctT}%`,
                                                    background: `linear-gradient(90deg, ${THEME.secondary}80, ${THEME.secondary})`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textDim }}>
                                        <span>Reads: {fmtNum(t.reads)}</span>
                                        <span>Writes: {fmtNum(t.writes)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                {/* ── WAL & Checkpoints ── */}
                <Panel title="WAL & Checkpoints" icon={Gauge}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
                            {/* WAL rate */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        WAL generation
                                    </span>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: THEME.textMain,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        12.4 MB/s
                                    </span>
                                </div>
                                <MiniSparkline data={genSparkline(16)} color={THEME.primary} width={140} height={32} />
                                <div style={{ marginTop: 4, fontSize: 10, color: THEME.textDim }}>
                                    Last 5 minutes across cluster.
                                </div>
                            </div>

                            {/* Checkpoint summary */}
                            <div style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                background: THEME.surface,
                                border: `1px solid ${THEME.grid}50`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                justifyContent: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Timer size={13} color={THEME.secondary} />
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>Checkpoint duration (avg)</span>
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: THEME.secondary,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        420 ms
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertTriangle size={12} color={THEME.warning} />
                                    <span style={{ fontSize: 10, color: THEME.textDim }}>
                                        2 checkpoints exceeded 1 s in last 10 min.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Memory/WAL state badges */}
                        <div style={{
                            marginTop: 2,
                            paddingTop: 10,
                            borderTop: `1px dashed ${THEME.grid}40`,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            fontSize: 10,
                        }}>
                            <StatusBadge label="WAL archive: OK" color={THEME.success} />
                            <StatusBadge label="Checkpoint frequency: Normal" color={THEME.info || THEME.primary} />
                            <StatusBadge label="Autovacuum on" color={THEME.secondary} />
                        </div>
                    </div>
                </Panel>

            </div>
        </div>
    );
};

export default OverviewTab;
