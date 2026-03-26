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
        @keyframes dpgFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .dpg-stagger > * { animation: dpgFadeIn 0.45s ease-out both; }
        .dpg-stagger > *:nth-child(1){animation-delay:0s}
        .dpg-stagger > *:nth-child(2){animation-delay:.07s}
        .dpg-stagger > *:nth-child(3){animation-delay:.14s}
        .dpg-stagger > *:nth-child(4){animation-delay:.21s}
        .dpg-stagger > *:nth-child(5){animation-delay:.28s}
        .dpg-stagger > *:nth-child(6){animation-delay:.35s}
        .dpg-card-shine { position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%); pointer-events:none; border-radius:inherit; }
        .dpg-metric:hover { border-color: ${THEME.glassBorderHover} !important; transform: translateY(-2px); }
        .dpg-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
    `}</style>
);

/* ── Panel (matches OverviewTab) ─────────────────────────────────── */
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
        <div className="dpg-card-shine" />
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

/* ── Hero Metric Card ────────────────────────────────────────────── */
const HeroMetric = ({ icon: Icon, label, value, sub, color }) => (
    <div
        className="dpg-metric"
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
        <div className="dpg-card-shine" />
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
        {sub && (
            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4, fontFamily: THEME.fontBody }}>{sub}</div>
        )}
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

/* ── Chart Tooltip ───────────────────────────────────────────────── */
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
const connData = hours.map((t) => ({
    time: t,
    active: 35 + Math.round(Math.random() * 25),
    idle: 15 + Math.round(Math.random() * 10),
}));
const tpsData = hours.map((t) => ({
    time: t,
    commits: 420 + Math.round(Math.random() * 180),
    rollbacks: 5 + Math.round(Math.random() * 8),
}));
const latencyData = hours.map((t) => ({
    time: t,
    p50: +(1 + Math.random() * 3).toFixed(1),
    p95: +(5 + Math.random() * 12).toFixed(1),
    p99: +(15 + Math.random() * 30).toFixed(1),
}));
const cpuMem = hours.map((t) => ({
    time: t,
    cpu: 20 + Math.round(Math.random() * 35),
    mem: 55 + Math.round(Math.random() * 20),
}));
const walData = hours.map((t) => ({
    time: t,
    walMB: 40 + Math.round(Math.random() * 60),
    replLag: +(Math.random() * 1.5).toFixed(2),
}));
const storagePie = [
    { name: 'Tables', value: 62 },
    { name: 'Indexes', value: 24 },
    { name: 'TOAST', value: 8 },
    { name: 'WAL', value: 6 },
];
const slowQueries = [
    { query: 'SELECT o.*, u.name FROM orders o JOIN users u ON ...', ms: 842, calls: '12K', rows: '1.2M' },
    { query: 'UPDATE inventory SET stock = stock - $1 WHERE ...', ms: 534, calls: '8.4K', rows: '340K' },
    { query: 'SELECT COUNT(*) FROM analytics WHERE ts > ...', ms: 421, calls: '2.1K', rows: '4.8M' },
    { query: 'INSERT INTO audit_log SELECT * FROM staging ...', ms: 318, calls: '960', rows: '890K' },
    { query: 'DELETE FROM sessions WHERE expires_at < NOW()', ms: 289, calls: '480', rows: '2.1M' },
];
const PIE_COLORS = [THEME.primary, THEME.ai, THEME.warning, THEME.secondary];

/* ── Main ────────────────────────────────────────────────────────── */
function DemoPostgresTab() {
    useAdaptiveTheme();

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            <DemoStyles />

            {/* Hero row */}
            <div
                className="dpg-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}
            >
                <HeroMetric icon={Clock} label="Uptime" value="63d" sub="Since restart" color={THEME.secondary} />
                <HeroMetric icon={Zap} label="TPS" value="612" sub="Commits / sec" color={THEME.primary} />
                <HeroMetric
                    icon={Activity}
                    label="Connections"
                    value="52/100"
                    sub="Active / max"
                    color={THEME.warning}
                />
                <HeroMetric icon={Gauge} label="Cache Hit" value="99.4%" sub="Buffer cache" color={THEME.success} />
                <HeroMetric icon={Database} label="DB Size" value="148 GB" sub="All databases" color={THEME.ai} />
                <HeroMetric icon={Radio} label="Repl Lag" value="0.2s" sub="Standby avg" color={THEME.primary} />
            </div>

            {/* Connections & TPS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <Panel title="Active / Idle Connections" icon={Activity} accentColor={THEME.primary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={connData}>
                            <defs>
                                <linearGradient id="dpgConnA" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dpgConnI" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.warning} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={THEME.warning} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="active"
                                stroke={THEME.primary}
                                fill="url(#dpgConnA)"
                                strokeWidth={1.5}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="idle"
                                stroke={THEME.warning}
                                fill="url(#dpgConnI)"
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Transactions / sec" icon={Zap} accentColor={THEME.secondary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={tpsData}>
                            <defs>
                                <linearGradient id="dpgTps" x1="0" y1="0" x2="0" y2="1">
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
                                dataKey="commits"
                                stroke={THEME.secondary}
                                fill="url(#dpgTps)"
                                strokeWidth={1.5}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="rollbacks"
                                stroke={THEME.danger}
                                fill={THEME.danger}
                                fillOpacity={0.12}
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            {/* Latency */}
            <div style={{ marginBottom: 18 }}>
                <Panel title="Query Latency Percentiles" icon={TrendingUp} accentColor={THEME.warning}>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={latencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} unit=" ms" />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="p50"
                                stroke={THEME.secondary}
                                strokeWidth={2}
                                dot={false}
                                name="p50 (ms)"
                            />
                            <Line
                                type="monotone"
                                dataKey="p95"
                                stroke={THEME.warning}
                                strokeWidth={2}
                                dot={false}
                                name="p95 (ms)"
                            />
                            <Line
                                type="monotone"
                                dataKey="p99"
                                stroke={THEME.danger}
                                strokeWidth={2}
                                dot={false}
                                name="p99 (ms)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            {/* Resources */}
            <div style={{ marginBottom: 18 }}>
                <Panel title="System Resources" icon={Cpu} accentColor={THEME.ai}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={cpuMem}>
                            <defs>
                                <linearGradient id="dpgCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dpgMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.ai} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={THEME.ai} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis stroke={THEME.textDim} fontSize={10} domain={[0, 100]} unit="%" />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="cpu"
                                stroke={THEME.primary}
                                fill="url(#dpgCpu)"
                                strokeWidth={2}
                                dot={false}
                                name="CPU %"
                            />
                            <Area
                                type="monotone"
                                dataKey="mem"
                                stroke={THEME.ai}
                                fill="url(#dpgMem)"
                                strokeWidth={2}
                                dot={false}
                                name="Memory %"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            {/* Slow Queries */}
            <div style={{ marginBottom: 18 }}>
                <Panel title="Top Slow Queries" icon={AlertTriangle} accentColor={THEME.danger} noPad>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Query', 'Avg (ms)', 'Calls', 'Rows'].map((h) => (
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
                                            maxWidth: 400,
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
                                            color:
                                                q.ms > 500 ? THEME.danger : q.ms > 100 ? THEME.warning : THEME.success,
                                            fontWeight: 700,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {q.ms}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {q.calls}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: THEME.textDim,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 12,
                                        }}
                                    >
                                        {q.rows}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
            </div>

            {/* Storage & Replication */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Panel title="Storage Breakdown" icon={HardDrive} accentColor={THEME.ai}>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={storagePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                dataKey="value"
                                stroke="none"
                                label={({ name, value }) => `${name} ${value}%`}
                            >
                                {storagePie.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Panel>
                <Panel title="Replication & WAL" icon={Radio} accentColor={THEME.secondary}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={walData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="left" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="walMB"
                                stroke={THEME.ai}
                                strokeWidth={2}
                                dot={false}
                                name="WAL (MB/s)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="replLag"
                                stroke={THEME.danger}
                                strokeWidth={2}
                                dot={false}
                                name="Repl Lag (s)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            <div style={{ height: 40 }} />
        </div>
    );
}

export default DemoPostgresTab;
