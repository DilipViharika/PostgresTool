import React, { useState, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { GlassCard } from '../../ui/SharedComponents.jsx';
import {
    Database,
    Activity,
    HardDrive,
    Gauge,
    Radio,
    Clock,
    Zap,
    Server,
    TrendingUp,
    AlertTriangle,
    Layers,
    Cpu,
    MemoryStick,
    GitMerge,
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

/* ── Styles ──────────────────────────────────────────────────────── */
const DemoStyles = () => (
    <style>{`
        @keyframes dmgFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .dmg-stagger > * { animation: dmgFadeIn 0.45s ease-out both; }
        .dmg-stagger > *:nth-child(1){animation-delay:0s}
        .dmg-stagger > *:nth-child(2){animation-delay:.07s}
        .dmg-stagger > *:nth-child(3){animation-delay:.14s}
        .dmg-stagger > *:nth-child(4){animation-delay:.21s}
        .dmg-stagger > *:nth-child(5){animation-delay:.28s}
        .dmg-stagger > *:nth-child(6){animation-delay:.35s}
        .dmg-card-shine { position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%); pointer-events:none; border-radius:inherit; }
        .dmg-metric:hover { border-color: ${THEME.glassBorderHover} !important; transform: translateY(-2px); }
        .dmg-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
    `}</style>
);

const Panel = ({ title, icon: TIcon, children, noPad, accentColor, style = {} }) => (
    <div
        style={{
            background: THEME.glass,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${accentColor ? `${accentColor}22` : THEME.glassBorder}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: accentColor
                ? `0 0 0 1px ${accentColor}12, 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.08)`
                : `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)`,
            ...style,
        }}
    >
        <div className="dmg-card-shine" />
        {title && (
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${accentColor ? `${accentColor}18` : THEME.glassBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minHeight: 44,
                    background: accentColor ? `${accentColor}06` : 'rgba(255,255,255,0.02)',
                }}
            >
                {TIcon && (
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: accentColor ? `${accentColor}16` : `${THEME.textDim}12`,
                            boxShadow: accentColor ? `0 0 8px ${accentColor}20` : 'none',
                        }}
                    >
                        <TIcon size={13} color={accentColor || THEME.textDim} />
                    </div>
                )}
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: THEME.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: THEME.fontBody,
                    }}
                >
                    {title}
                </span>
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>{children}</div>
    </div>
);

const HeroMetric = ({ icon: Icon, label, value, sub, color }) => (
    <div
        className="dmg-metric"
        style={{
            background: THEME.glass,
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            border: `1px solid ${THEME.glassBorder}`,
            padding: '16px 18px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08)`,
        }}
    >
        <div className="dmg-card-shine" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                    border: `1px solid ${color}30`,
                    boxShadow: `0 0 16px ${color}15`,
                }}
            >
                <Icon size={18} color={color} />
            </div>
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: THEME.fontBody,
                }}
            >
                {label}
            </span>
        </div>
        <div
            style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: THEME.fontMono,
                color: THEME.textMain,
                textShadow: `0 0 20px ${color}20`,
            }}
        >
            {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4 }}>{sub}</div>}
        <div
            style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
            }}
        />
    </div>
);

const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: THEME.glassHeavy,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                backdropFilter: 'blur(12px)',
                boxShadow: THEME.shadowMd,
            }}
        >
            <div
                style={{
                    color: THEME.textDim,
                    marginBottom: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                {label}
            </div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontFamily: THEME.fontMono, fontSize: 12 }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </div>
            ))}
        </div>
    );
};

/* ── Demo data ───────────────────────────────────────────────────── */
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const opsData = hours.map((t) => ({
    time: t,
    queries: 3200 + Math.round(Math.random() * 1500),
    inserts: 800 + Math.round(Math.random() * 400),
    updates: 450 + Math.round(Math.random() * 250),
    deletes: 90 + Math.round(Math.random() * 60),
}));
const connData = hours.map((t) => ({
    time: t,
    current: 120 + Math.round(Math.random() * 60),
    available: 800 - Math.round(Math.random() * 60),
}));
const latencyData = hours.map((t) => ({
    time: t,
    read: +(0.5 + Math.random() * 3).toFixed(1),
    write: +(1 + Math.random() * 5).toFixed(1),
}));
const memoryData = hours.map((t) => ({
    time: t,
    resident: +(4.2 + Math.random() * 0.8).toFixed(1),
    virtual: +(8.1 + Math.random() * 1.2).toFixed(1),
    mapped: +(3.8 + Math.random() * 0.5).toFixed(1),
}));
const replData = hours.map((t) => ({
    time: t,
    lag: +(Math.random() * 1.8).toFixed(2),
    oplogWindow: +(48 - Math.random() * 6).toFixed(1),
}));
const collectionSizes = [
    { name: 'orders', value: 42 },
    { name: 'products', value: 18 },
    { name: 'users', value: 12 },
    { name: 'sessions', value: 15 },
    { name: 'logs', value: 13 },
];
const shardData = [
    { shard: 'shard-0', chunks: 256, docs: '12.4M', storage: '8.2 GB', status: 'PRIMARY' },
    { shard: 'shard-1', chunks: 241, docs: '11.8M', storage: '7.9 GB', status: 'PRIMARY' },
    { shard: 'shard-2', chunks: 248, docs: '12.1M', storage: '8.0 GB', status: 'PRIMARY' },
];
const slowOps = [
    { op: 'find', ns: 'ecommerce.orders', duration: '3.2s', plan: 'COLLSCAN', docs: '2.4M' },
    { op: 'aggregate', ns: 'ecommerce.analytics', duration: '2.8s', plan: 'IXSCAN', docs: '1.1M' },
    { op: 'update', ns: 'ecommerce.inventory', duration: '1.9s', plan: 'IXSCAN', docs: '340K' },
    { op: 'find', ns: 'ecommerce.users', duration: '1.4s', plan: 'COLLSCAN', docs: '890K' },
    { op: 'mapReduce', ns: 'ecommerce.logs', duration: '1.1s', plan: 'COLLSCAN', docs: '5.6M' },
];
const PIE_COLORS = [THEME.primary, THEME.ai, THEME.warning, THEME.secondary, THEME.danger];

/* ── Main ────────────────────────────────────────────────────────── */
export default function DemoMongoDBTab() {
    useAdaptiveTheme();

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            <DemoStyles />

            <div
                className="dmg-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}
            >
                <HeroMetric icon={Clock} label="Uptime" value="89d" sub="Since restart" color={THEME.secondary} />
                <HeroMetric icon={Zap} label="Ops/sec" value="4,820" sub="All operations" color={THEME.primary} />
                <HeroMetric icon={Activity} label="Connections" value="182" sub="of 800 max" color={THEME.warning} />
                <HeroMetric
                    icon={MemoryStick}
                    label="Resident Mem"
                    value="4.6 GB"
                    sub="WiredTiger cache"
                    color={THEME.ai}
                />
                <HeroMetric icon={Radio} label="Repl Lag" value="0.3s" sub="Max secondary" color={THEME.secondary} />
                <HeroMetric icon={AlertTriangle} label="Slow Ops" value="8" sub="Last 24 h" color={THEME.danger} />
            </div>

            <div style={{ marginBottom: 18 }}>
                <Panel title="Operations / sec (24h)" icon={TrendingUp} accentColor={THEME.ai}>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={opsData}>
                            <defs>
                                <linearGradient id="dmgQ" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dmgI" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="queries"
                                stackId="1"
                                stroke={THEME.primary}
                                fill="url(#dmgQ)"
                                strokeWidth={1.5}
                            />
                            <Area
                                type="monotone"
                                dataKey="inserts"
                                stackId="1"
                                stroke={THEME.secondary}
                                fill="url(#dmgI)"
                                strokeWidth={1.5}
                            />
                            <Area
                                type="monotone"
                                dataKey="updates"
                                stackId="1"
                                stroke={THEME.warning}
                                fill={THEME.warning}
                                fillOpacity={0.15}
                                strokeWidth={1.5}
                            />
                            <Area
                                type="monotone"
                                dataKey="deletes"
                                stackId="1"
                                stroke={THEME.danger}
                                fill={THEME.danger}
                                fillOpacity={0.1}
                                strokeWidth={1.5}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <Panel title="Read / Write Latency" icon={Gauge} accentColor={THEME.warning}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={latencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} unit=" ms" />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="read"
                                stroke={THEME.primary}
                                strokeWidth={2}
                                dot={false}
                                name="Read (ms)"
                            />
                            <Line
                                type="monotone"
                                dataKey="write"
                                stroke={THEME.danger}
                                strokeWidth={2}
                                dot={false}
                                name="Write (ms)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Active Connections" icon={Activity} accentColor={THEME.primary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={connData}>
                            <defs>
                                <linearGradient id="dmgConn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke={THEME.primary}
                                fill="url(#dmgConn)"
                                strokeWidth={2}
                                dot={false}
                                name="Current"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <Panel title="Memory Usage (GB)" icon={MemoryStick} accentColor={THEME.ai}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={memoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="resident"
                                stroke={THEME.primary}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line type="monotone" dataKey="virtual" stroke={THEME.ai} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="mapped" stroke={THEME.warning} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Collection Sizes" icon={Database} accentColor={THEME.warning}>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={collectionSizes}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                dataKey="value"
                                stroke="none"
                                label={({ name, value }) => `${name} (${value} GB)`}
                            >
                                {collectionSizes.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ marginBottom: 18 }}>
                <Panel title="Shard Distribution" icon={Server} accentColor={THEME.secondary} noPad>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Shard', 'Chunks', 'Documents', 'Storage', 'Role'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '10px 14px',
                                            textAlign: 'left',
                                            fontSize: 9,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.5px',
                                            color: THEME.textDim,
                                            borderBottom: `1px solid ${THEME.glassBorder}`,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {shardData.map((s, i) => (
                                <tr
                                    key={i}
                                    style={{ borderBottom: `1px solid ${THEME.grid}`, transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = `${THEME.secondaryFaint}`)}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.primary,
                                            fontFamily: THEME.fontMono,
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    >
                                        {s.shard}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {s.chunks}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.warning,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {s.docs}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.textMuted,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {s.storage}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span
                                            style={{
                                                fontSize: 9.5,
                                                fontWeight: 700,
                                                padding: '4px 11px',
                                                borderRadius: 12,
                                                background: `${THEME.success}12`,
                                                color: THEME.success,
                                                border: `1px solid ${THEME.success}28`,
                                                fontFamily: THEME.fontMono,
                                            }}
                                        >
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
            </div>

            <div style={{ marginBottom: 18 }}>
                <Panel title="Replication Lag & Oplog" icon={GitMerge} accentColor={THEME.danger}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={replData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="left" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="lag"
                                stroke={THEME.danger}
                                strokeWidth={2}
                                dot={false}
                                name="Lag (s)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="oplogWindow"
                                stroke={THEME.ai}
                                strokeWidth={2}
                                dot={false}
                                name="Oplog Window (h)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <Panel title="Top Slow Operations" icon={AlertTriangle} accentColor={THEME.danger} noPad>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Operation', 'Namespace', 'Duration', 'Plan', 'Docs Examined'].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: '10px 14px',
                                        textAlign: 'left',
                                        fontSize: 9,
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.5px',
                                        color: THEME.textDim,
                                        borderBottom: `1px solid ${THEME.glassBorder}`,
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slowOps.map((q, i) => (
                            <tr
                                key={i}
                                style={{
                                    borderBottom: `1px solid ${THEME.grid}`,
                                    transition: 'background 0.15s',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = `${THEME.primaryFaint}`)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td
                                    style={{
                                        padding: '10px 14px',
                                        color: THEME.primary,
                                        fontWeight: 700,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 12,
                                    }}
                                >
                                    {q.op}
                                </td>
                                <td
                                    style={{
                                        padding: '10px 14px',
                                        fontFamily: THEME.fontMono,
                                        color: THEME.textMuted,
                                        fontSize: 12,
                                    }}
                                >
                                    {q.ns}
                                </td>
                                <td
                                    style={{
                                        padding: '10px 14px',
                                        color: THEME.danger,
                                        fontWeight: 700,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 12,
                                    }}
                                >
                                    {q.duration}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span
                                        style={{
                                            fontSize: 9.5,
                                            fontWeight: 700,
                                            padding: '4px 11px',
                                            borderRadius: 12,
                                            background:
                                                q.plan === 'COLLSCAN' ? `${THEME.danger}12` : `${THEME.success}12`,
                                            color: q.plan === 'COLLSCAN' ? THEME.danger : THEME.success,
                                            border: `1px solid ${q.plan === 'COLLSCAN' ? THEME.danger : THEME.success}28`,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {q.plan}
                                    </span>
                                </td>
                                <td
                                    style={{
                                        padding: '10px 14px',
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 12,
                                    }}
                                >
                                    {q.docs}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>

            <div style={{ height: 40 }} />
        </div>
    );
}
