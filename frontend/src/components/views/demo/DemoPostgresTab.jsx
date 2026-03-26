import React, { useState, useMemo } from 'react';
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
import { getDS } from '../../../config/designTokens.js';

/* ── Inject keyframes once ───────────────────────────────────────── */
const STYLE_ID = '__demo_pg_styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes demoPgFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .demo-pg-stagger > * { animation: demoPgFadeUp 0.5s ease-out both; }
      .demo-pg-stagger > *:nth-child(1){animation-delay:0s}
      .demo-pg-stagger > *:nth-child(2){animation-delay:.07s}
      .demo-pg-stagger > *:nth-child(3){animation-delay:.14s}
      .demo-pg-stagger > *:nth-child(4){animation-delay:.21s}
      .demo-pg-stagger > *:nth-child(5){animation-delay:.28s}
      .demo-pg-stagger > *:nth-child(6){animation-delay:.35s}
    `;
    document.head.appendChild(s);
}

/* ── GlassCard ───────────────────────────────────────────────────── */
const GlassCard = ({ children, accent, style, noPad }) => {
    const [hov, setHov] = useState(false);
    const DS = getDS();
    const c = accent || DS.cyan;
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: hov ? `linear-gradient(145deg, ${c}0c 0%, rgba(10,15,30,0.85) 100%)` : 'rgba(10,15,30,0.7)',
                backdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: 16,
                border: `1px solid ${hov ? c + '40' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: hov
                    ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${c}25, 0 0 30px ${c}10`
                    : '0 4px 24px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateY(-2px)' : 'translateY(0)',
                padding: noPad ? 0 : 20,
                ...style,
            }}
        >
            {/* accent bar */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${c}, ${c}80, transparent)`,
                    opacity: hov ? 1 : 0.5,
                    transition: 'opacity 0.3s',
                }}
            />
            {children}
        </div>
    );
};

/* ── BentoMetric ─────────────────────────────────────────────────── */
const BentoMetric = ({ label, value, sub, color, icon }) => {
    const [hov, setHov] = useState(false);
    const DS = getDS();
    const c = color || DS.cyan;
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: hov
                    ? `linear-gradient(145deg, rgba(7,15,36,0.9) 0%, ${c}08 50%, rgba(2,6,20,0.97) 100%)`
                    : 'linear-gradient(145deg, rgba(7,15,36,0.82) 0%, rgba(2,6,20,0.97) 100%)',
                borderRadius: 16,
                padding: 22,
                minHeight: 120,
                border: `1px solid ${hov ? c + '50' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(20px) saturate(160%)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateY(-4px) scale(1.01)' : 'none',
                boxShadow: hov
                    ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${c}20, 0 0 40px ${c}12`
                    : '0 4px 16px rgba(0,0,0,0.3)',
            }}
        >
            {/* corner glow */}
            <div
                style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${c}${hov ? '18' : '08'} 0%, transparent 70%)`,
                    transition: 'background 0.35s',
                }}
            />
            <div
                style={{
                    color: DS.textMuted || '#475569',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: 10,
                }}
            >
                {label}
            </div>
            <span
                style={{
                    fontSize: 34,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: hov ? `linear-gradient(135deg, #fff, ${c})` : 'none',
                    WebkitBackgroundClip: hov ? 'text' : 'unset',
                    WebkitTextFillColor: hov ? 'transparent' : '#fff',
                    textShadow: hov ? `0 0 32px ${c}80` : `0 0 12px ${c}20`,
                    transition: 'text-shadow 0.35s',
                }}
            >
                {value}
            </span>
            {sub && <div style={{ color: DS.textSub || '#94a3b8', fontSize: 12, marginTop: 6 }}>{sub}</div>}
        </div>
    );
};

/* ── SectionHeader ───────────────────────────────────────────────── */
const SectionHeader = ({ children, color }) => {
    const DS = getDS();
    const c = color || DS.cyan;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '32px 0 14px' }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: c, boxShadow: `0 0 8px ${c}40` }} />
            <h3
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c,
                    textTransform: 'uppercase',
                    letterSpacing: '1.8px',
                    fontFamily: "'DM Sans', system-ui",
                }}
            >
                {children}
            </h3>
        </div>
    );
};

/* ── ChartTooltip ────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
    const DS = getDS();
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: 'rgba(10,15,30,0.95)',
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
        >
            <div style={{ color: '#94a3b8', marginBottom: 6, fontSize: 11 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
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
const PIE_COLORS = ['#38bdf8', '#818cf8', '#fbbf24', '#34d399'];

/* ── Main Component ──────────────────────────────────────────────── */
function DemoPostgresTab() {
    const DS = useMemo(() => getDS(), []);

    return (
        <div
            style={{
                padding: 28,
                color: DS.textPrimary || '#f0f4ff',
                minHeight: '100vh',
                fontFamily: "'DM Sans', system-ui",
            }}
        >
            {/* Hero Metrics */}
            <div
                className="demo-pg-stagger"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 8 }}
            >
                <BentoMetric label="Uptime" value="63d" sub="Since restart" color={DS.emerald} />
                <BentoMetric label="TPS" value="612" sub="Commits / sec" color={DS.cyan} />
                <BentoMetric label="Connections" value="52" sub="of 100 max" color={DS.amber} />
                <BentoMetric label="Cache Hit" value="99.4%" sub="Buffer cache" color={DS.emerald} />
                <BentoMetric label="DB Size" value="148 GB" sub="All databases" color={DS.violet} />
                <BentoMetric label="Repl Lag" value="0.2s" sub="Standby avg" color={DS.cyan} />
            </div>

            {/* Connections & TPS */}
            <SectionHeader color={DS.violet}>Connections & TPS</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <GlassCard accent={DS.cyan}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: DS.textMuted || '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                        }}
                    >
                        Active / Idle Connections
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={connData}>
                            <defs>
                                <linearGradient id="pgConnActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="pgConnIdle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.amber} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={DS.amber} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="active"
                                stroke={DS.cyan}
                                fill="url(#pgConnActive)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="idle"
                                stroke={DS.amber}
                                fill="url(#pgConnIdle)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.emerald}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: DS.textMuted || '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            marginBottom: 12,
                        }}
                    >
                        Transactions / sec
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={tpsData}>
                            <defs>
                                <linearGradient id="pgTpsCommit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={DS.emerald} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={DS.emerald} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="commits"
                                stroke={DS.emerald}
                                fill="url(#pgTpsCommit)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="rollbacks"
                                stroke={DS.rose}
                                fill={DS.rose}
                                fillOpacity={0.15}
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Latency */}
            <SectionHeader color={DS.amber}>Query Latency Percentiles</SectionHeader>
            <GlassCard accent={DS.amber}>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} unit=" ms" />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="p50"
                            stroke={DS.emerald}
                            strokeWidth={2}
                            dot={false}
                            name="p50 (ms)"
                        />
                        <Line
                            type="monotone"
                            dataKey="p95"
                            stroke={DS.amber}
                            strokeWidth={2}
                            dot={false}
                            name="p95 (ms)"
                        />
                        <Line
                            type="monotone"
                            dataKey="p99"
                            stroke={DS.rose}
                            strokeWidth={2}
                            dot={false}
                            name="p99 (ms)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* System Resources */}
            <SectionHeader color={DS.emerald}>System Resources</SectionHeader>
            <GlassCard accent={DS.violet}>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={cpuMem}>
                        <defs>
                            <linearGradient id="pgCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={DS.cyan} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={DS.cyan} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="pgMem" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={DS.violet} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={DS.violet} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} unit="%" />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke={DS.cyan}
                            fill="url(#pgCpu)"
                            strokeWidth={2}
                            dot={false}
                            name="CPU %"
                        />
                        <Area
                            type="monotone"
                            dataKey="mem"
                            stroke={DS.violet}
                            fill="url(#pgMem)"
                            strokeWidth={2}
                            dot={false}
                            name="Memory %"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </GlassCard>

            {/* Slow Queries */}
            <SectionHeader color={DS.rose}>Top Slow Queries</SectionHeader>
            <GlassCard accent={DS.rose} noPad>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                {['Query', 'Avg (ms)', 'Calls', 'Rows'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '12px 14px',
                                            textAlign: 'left',
                                            fontSize: 9,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.5px',
                                            color: '#475569',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56,189,248,0.04)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            color: '#94a3b8',
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
                                            color: q.ms > 500 ? DS.rose : q.ms > 100 ? DS.amber : DS.emerald,
                                            fontWeight: 700,
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.ms}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: '#475569',
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.calls}
                                    </td>
                                    <td
                                        style={{
                                            padding: '10px 14px',
                                            color: '#475569',
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                    >
                                        {q.rows}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Storage */}
            <SectionHeader color={DS.violet}>Storage Breakdown</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <GlassCard accent={DS.violet}>
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
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard accent={DS.cyan}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 20,
                            height: '100%',
                        }}
                    >
                        <BentoMetric label="Total Size" value="148 GB" color={DS.cyan} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        color: '#475569',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    Table Bloat
                                </div>
                                <div
                                    style={{
                                        color: DS.amber,
                                        fontSize: 22,
                                        fontWeight: 800,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    3.2%
                                </div>
                                <div style={{ color: '#64748b', fontSize: 11 }}>2.1 GB reclaimable</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        color: '#475569',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    Index Bloat
                                </div>
                                <div
                                    style={{
                                        color: DS.emerald,
                                        fontSize: 22,
                                        fontWeight: 800,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    1.8%
                                </div>
                                <div style={{ color: '#64748b', fontSize: 11 }}>640 MB reclaimable</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Replication & WAL */}
            <SectionHeader color={DS.emerald}>Replication & WAL</SectionHeader>
            <GlassCard accent={DS.emerald}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={walData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="left" stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="walMB"
                            stroke={DS.violet}
                            strokeWidth={2}
                            dot={false}
                            name="WAL (MB/s)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="replLag"
                            stroke={DS.rose}
                            strokeWidth={2}
                            dot={false}
                            name="Repl Lag (s)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>

            <div style={{ height: 40 }} />
        </div>
    );
}

export default DemoPostgresTab;
