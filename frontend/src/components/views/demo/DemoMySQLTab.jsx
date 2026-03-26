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
        @keyframes dmyFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .dmy-stagger > * { animation: dmyFadeIn 0.45s ease-out both; }
        .dmy-stagger > *:nth-child(1){animation-delay:0s}
        .dmy-stagger > *:nth-child(2){animation-delay:.07s}
        .dmy-stagger > *:nth-child(3){animation-delay:.14s}
        .dmy-stagger > *:nth-child(4){animation-delay:.21s}
        .dmy-stagger > *:nth-child(5){animation-delay:.28s}
        .dmy-stagger > *:nth-child(6){animation-delay:.35s}
        .dmy-card-shine { position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%); pointer-events:none; border-radius:inherit; }
        .dmy-metric:hover { border-color: ${THEME.glassBorderHover} !important; transform: translateY(-2px); }
        .dmy-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
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
        <div className="dmy-card-shine" />
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
        className="dmy-metric"
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
        <div className="dmy-card-shine" />
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
const qpsData = hours.map((t) => ({
    time: t,
    selects: 1200 + Math.round(Math.random() * 800),
    inserts: 300 + Math.round(Math.random() * 200),
    updates: 180 + Math.round(Math.random() * 120),
    deletes: 40 + Math.round(Math.random() * 30),
}));
const connData = hours.map((t) => ({
    time: t,
    active: 45 + Math.round(Math.random() * 30),
    idle: 20 + Math.round(Math.random() * 15),
    max: 151,
}));
const bufferData = hours.map((t) => ({ time: t, hitRate: +(99 + Math.random() * 0.9).toFixed(2) }));
const replData = hours.map((t) => ({ time: t, lag: +(Math.random() * 2.5).toFixed(2) }));
const innodbData = hours.map((t) => ({
    time: t,
    reads: 4500 + Math.round(Math.random() * 2000),
    writes: 1200 + Math.round(Math.random() * 800),
}));
const enginePie = [
    { name: 'InnoDB', value: 87 },
    { name: 'MyISAM', value: 8 },
    { name: 'MEMORY', value: 5 },
];
const slowQueries = [
    {
        query: 'SELECT * FROM orders WHERE created_at > ? ORDER BY total DESC',
        time: '4.82s',
        rows: '1.2M',
        fullScan: true,
    },
    {
        query: 'UPDATE inventory SET qty = qty - ? WHERE sku IN (SELECT ...)',
        time: '3.15s',
        rows: '89K',
        fullScan: false,
    },
    {
        query: 'SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN orders o ...',
        time: '2.67s',
        rows: '450K',
        fullScan: true,
    },
    {
        query: 'DELETE FROM sessions WHERE last_active < NOW() - INTERVAL 30 DAY',
        time: '1.94s',
        rows: '2.1M',
        fullScan: false,
    },
    {
        query: 'INSERT INTO analytics_daily SELECT DATE(ts), COUNT(*) ...',
        time: '1.53s',
        rows: '680K',
        fullScan: false,
    },
];
const PIE_COLORS = [THEME.primary, THEME.ai, THEME.warning];

/* ── Main ────────────────────────────────────────────────────────── */
export default function DemoMySQLTab() {
    useAdaptiveTheme();

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            <DemoStyles />

            <div
                className="dmy-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}
            >
                <HeroMetric icon={Clock} label="Uptime" value="142d" sub="Since restart" color={THEME.secondary} />
                <HeroMetric icon={Zap} label="QPS" value="2,340" sub="Queries / sec" color={THEME.primary} />
                <HeroMetric icon={Activity} label="Threads" value="48" sub="of 151 max" color={THEME.warning} />
                <HeroMetric icon={Gauge} label="Buffer Hit" value="99.7%" sub="InnoDB cache" color={THEME.success} />
                <HeroMetric icon={AlertTriangle} label="Slow Queries" value="12" sub="Last 24 h" color={THEME.danger} />
                <HeroMetric icon={Radio} label="Repl Lag" value="0.4s" sub="Replica avg" color={THEME.ai} />
            </div>

            <div style={{ marginBottom: 18 }}>
                <Panel title="QPS Breakdown (24h)" icon={TrendingUp} accentColor={THEME.ai}>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={qpsData}>
                            <defs>
                                <linearGradient id="dmySel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dmyIns" x1="0" y1="0" x2="0" y2="1">
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
                                dataKey="selects"
                                stackId="1"
                                stroke={THEME.primary}
                                fill="url(#dmySel)"
                                strokeWidth={1.5}
                            />
                            <Area
                                type="monotone"
                                dataKey="inserts"
                                stackId="1"
                                stroke={THEME.secondary}
                                fill="url(#dmyIns)"
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
                <Panel title="Connections" icon={Activity} accentColor={THEME.primary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={connData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line type="monotone" dataKey="active" stroke={THEME.primary} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="idle" stroke={THEME.warning} strokeWidth={2} dot={false} />
                            <Line
                                type="monotone"
                                dataKey="max"
                                stroke={THEME.danger}
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Buffer Pool Hit Rate" icon={Gauge} accentColor={THEME.success}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={bufferData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis domain={[99, 100]} stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Line
                                type="monotone"
                                dataKey="hitRate"
                                stroke={THEME.success}
                                strokeWidth={2}
                                dot={false}
                                name="Hit Rate %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 18 }}>
                <Panel title="InnoDB Read / Write" icon={HardDrive} accentColor={THEME.primary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={innodbData}>
                            <defs>
                                <linearGradient id="dmyR" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dmyW" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.ai} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.ai} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="reads"
                                stroke={THEME.primary}
                                fill="url(#dmyR)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="writes"
                                stroke={THEME.ai}
                                fill="url(#dmyW)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Storage Engines" icon={Layers} accentColor={THEME.warning}>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={enginePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={80}
                                dataKey="value"
                                stroke="none"
                                label={({ name, value }) => `${name} ${value}%`}
                            >
                                {enginePie.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <Panel title="Replication Lag" icon={Radio} accentColor={THEME.danger}>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={replData}>
                            <defs>
                                <linearGradient id="dmyLag" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Area
                                type="monotone"
                                dataKey="lag"
                                stroke={THEME.danger}
                                fill="url(#dmyLag)"
                                strokeWidth={2}
                                dot={false}
                                name="Lag (s)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <Panel title="Top Slow Queries" icon={AlertTriangle} accentColor={THEME.danger} noPad>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Query', 'Time', 'Rows Examined', 'Full Scan'].map((h) => (
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
                        {slowQueries.map((q, i) => (
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
                                        fontFamily: THEME.fontMono,
                                        color: THEME.textMuted,
                                        fontSize: 12,
                                        maxWidth: 420,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {q.query}
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
                                    {q.time}
                                </td>
                                <td
                                    style={{
                                        padding: '10px 14px',
                                        color: THEME.warning,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 12,
                                    }}
                                >
                                    {q.rows}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            fontSize: 9.5,
                                            fontWeight: 700,
                                            padding: '4px 11px',
                                            borderRadius: 12,
                                            background: q.fullScan ? `${THEME.danger}12` : `${THEME.success}12`,
                                            color: q.fullScan ? THEME.danger : THEME.success,
                                            border: `1px solid ${q.fullScan ? THEME.danger : THEME.success}28`,
                                            fontFamily: THEME.fontMono,
                                        }}
                                    >
                                        {q.fullScan ? 'YES' : 'NO'}
                                    </span>
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
